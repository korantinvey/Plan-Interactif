-- Oublier un rappel que le programme a démenti
--
-- Un visiteur retient une conférence dix jours avant le salon et pose son
-- rappel. Ce qui part alors est figé : l'instant d'envoi, le titre, et le corps
-- déjà écrit — « Dans 15 min · 14h30 · Salle B ». Rien ne les relit ensuite.
-- Seule la réouverture de la page repose la liste entière, et le visiteur qui
-- s'est abonné de chez lui ne rouvre parfois rien avant le jour même.
--
-- Entre-temps le programme bouge : une table ronde décalée d'une heure, une
-- conférence annulée, une source resynchronisée. Le rappel, lui, part à
-- l'ancienne heure et annonce un horaire qui n'existe plus.
--
-- C'est pire qu'un rappel manquant, et c'est tout l'objet de cette migration.
-- Un rappel qui ne part pas laisse le visiteur avec le tiroir, qui dit juste ;
-- un rappel qui ment l'envoie à la mauvaise heure devant une salle vide, avec
-- la certitude d'être à l'heure. C'est le raisonnement que la table tient déjà
-- pour la durée de vie du message — un rappel en retard est pire que pas de
-- rappel — appliqué cette fois à ce que le message affirme.
--
-- **Oublier, et non corriger.** Le serveur ne sait pas lire le programme et ne
-- traduit pas : le texte est composé par la page, dans la langue que le visiteur
-- lisait, et c'est ce qui permet au serveur de poster sans rien relire. Avancer
-- l'heure d'envoi laisserait « 14h30 » dans le corps, donc un rappel juste qui
-- annonce une heure fausse. On efface le rang ; la page en reposera un exact à
-- la prochaine ouverture, comme elle le fait déjà de tout le reste.
--
-- **Ce qui vaut démenti.** L'heure, telle que la source la donne, relevée sur le
-- rang au moment où le rappel est posé et comparée à celle que l'instantané
-- porte maintenant. Pas la salle : la notification ouvre la fiche de la
-- conférence, où la salle du jour s'affiche, et une salle changée coûte deux
-- minutes quand une heure changée coûte la conférence. Pas le titre non plus,
-- pour la même raison — et parce qu'il est traduit, ce que le serveur ne saurait
-- pas refaire.
--
-- **Deux gardes, parce que l'effacement ne se rattrape pas.** Un événement dont
-- aucun instantané ne porte de conférence n'est pas jugé : une source qui a
-- répondu à vide et quatre cents conférences annulées se ressemblent trop d'ici,
-- et vider les rappels de tout un salon sur une mauvaise lecture serait un
-- dégât plus grand que celui qu'on répare. Et un rang posé sans heure relevée
-- n'est pas jugé non plus : faute de savoir ce qu'il promettait, on le laisse
-- partir. Cela vaut pour les rangs posés avant cette migration, et pour le
-- rappel d'essai que l'exploitant s'envoie depuis les réglages — il ne porte
-- aucune conférence du programme, et serait effacé avant d'arriver.

-- ------------------------------------------------------- ce qu'on a promis
/*
 * L'heure d'une conférence telle que la source l'écrit, ramenée à la minute.
 *
 * Les deux champs, et non celui que la page a retenu : `debutLocal` est l'heure
 * murale du salon, `debut` l'instant absolu, et la page prend le premier des
 * deux qui se lit. Reproduire ce choix ici demanderait de savoir analyser une
 * date comme elle, pour un gain nul — ce qu'on cherche n'est pas l'instant,
 * c'est de savoir si la source a changé d'avis. Les deux champs ensemble le
 * disent sans rien interpréter.
 *
 * À la minute, parce que c'est la granularité de tout le mécanisme : la tâche
 * tourne à la minute et le corps du message affiche « 14h30 ». Les secondes et
 * les millièmes, eux, varient d'un export à l'autre sans que l'heure bouge, et
 * les garder ferait passer un reformatage pour un déplacement.
 */
create or replace function empreinte_debut(p_conf jsonb)
returns text
language sql
immutable
set search_path = public
as $$
  select left(replace(coalesce(p_conf->>'debutLocal', ''), ' ', 'T'), 16) || '|' ||
         left(replace(coalesce(p_conf->>'debut', ''), ' ', 'T'), 16)
$$;

comment on function empreinte_debut is
  'L''heure d''une conférence telle que la source l''écrit, à la minute. Sert à reconnaître un programme qui a bougé sous un rappel déjà posé.';

alter table rappel_de_conference
  add column if not exists debut_vu text;

comment on column rappel_de_conference.debut_vu is
  'L''empreinte de l''heure que la page a lue en posant ce rappel. Nulle pour un rang posé avant que le démenti ne soit su : il n''est alors pas jugé.';

-- ------------------------------------------------------------ poser, encore
/**
 * Inchangée, sauf le relevé de l'heure promise, que la page envoie désormais
 * avec chaque rang. Un rang sans relevé s'inscrit quand même, et ce n'est pas
 * une tolérance : une page servie du cache de la veille continue de poser des
 * rappels, et le rappel d'essai n'a pas d'heure au programme puisqu'il n'est
 * pas au programme. Refuser les leurs casserait le rappel pour réparer sa
 * fraîcheur — ils ne seront simplement jamais démentis.
 */
create or replace function enregistre_rappels(
  p_slug       text,
  p_abonnement text,
  p_p256dh     text,
  p_auth       text,
  p_rappels    jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  RANGS_MAX constant int := 60;   -- un parcours raisonnable, et une borne ferme
  v_evt uuid;
begin
  select e.id into v_evt
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- Ce qui vaut pour cet appareil et ce salon repart de zéro. On ne touche pas
  -- à ce qu'il a posé sur un autre salon : un même téléphone en ouvre plusieurs.
  delete from rappel_de_conference
   where abonnement = p_abonnement and evenement = v_evt;

  -- Le tri et la borne se prennent à part : ce qui dépasse est ce qui vient le
  -- plus tard, et non ce qui se trouvait en fin de liste.
  with entrants as (
    select r as e
      from jsonb_array_elements(coalesce(p_rappels, '[]'::jsonb)) r
     where r->>'conf' is not null
       and r->>'titre' is not null
       -- un instant déjà passé ne se rappelle plus : la page a pu être ouverte
       -- après le début de la conférence, ou rester ouverte jusque-là
       and (r->>'envoi_a')::timestamptz > now()
     order by (r->>'envoi_a')::timestamptz
     limit RANGS_MAX)
  insert into rappel_de_conference
         (evenement, abonnement, p256dh, auth, conference, envoi_a, titre, corps, adresse, vie,
          debut_vu)
  select v_evt, p_abonnement, p_p256dh, p_auth,
         left(e->>'conf', 200),
         (e->>'envoi_a')::timestamptz,
         left(e->>'titre', 200),
         left(coalesce(e->>'corps', ''), 400),
         left(coalesce(e->>'adresse', ''), 500),
         greatest(60, least(86400, coalesce((e->>'vie')::int, 900))),
         nullif(left(coalesce(e->>'debut_vu', ''), 80), '')
    from entrants
  on conflict (abonnement, evenement, conference) do nothing;

  return true;
end;
$$;

revoke all on function enregistre_rappels(text, text, text, text, jsonb) from public;

-- ------------------------------------------------------- ce que le programme dément
/**
 * Effacer les rappels en attente que le programme du salon ne confirme plus.
 *
 * Appelée en fin de synchronisation, quand l'instantané vient d'être réécrit et
 * dit ce que la page servira. Deux cas s'y effacent : la conférence a disparu du
 * programme, ou son heure n'est plus celle qui a été promise.
 *
 * Ce qui a déjà été envoyé ne se juge pas : le message est parti, et rien ici ne
 * le rattrapera. Ce qui a été posé sans relevé d'heure non plus — voir l'entête.
 */
create or replace function oublie_rappels_perimes(p_evenement uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare n integer;
begin
  /* La garde annoncée : sans programme, pas de démenti. Un événement qui n'en a
     jamais eu passe ici à chaque synchronisation, et ne doit rien effacer. */
  if not exists (
    select 1
      from instantane i
      join plan p on p.id = i.plan_id
     where p.evenement_id = p_evenement
       and jsonb_typeof(i.charge->'conferences') = 'array'
       and jsonb_array_length(i.charge->'conferences') > 0)
  then
    return 0;
  end if;

  with programme as (
    select c->>'id' as conf, empreinte_debut(c) as heure
      from instantane i
      join plan p on p.id = i.plan_id
      cross join lateral
        jsonb_array_elements(coalesce(i.charge->'conferences', '[]'::jsonb)) c
     where p.evenement_id = p_evenement)
  delete from rappel_de_conference r
   where r.evenement = p_evenement
     and r.envoye_a is null
     and r.debut_vu is not null
     and not exists (select 1 from programme g
                      where g.conf = r.conference and g.heure = r.debut_vu);
  get diagnostics n = row_count;
  return n;
end;
$$;

comment on function oublie_rappels_perimes is
  'Efface les rappels en attente dont la conférence a disparu du programme ou changé d''heure depuis qu''ils ont été posés. Appelée en fin de synchronisation.';

revoke all on function oublie_rappels_perimes(uuid) from public;
