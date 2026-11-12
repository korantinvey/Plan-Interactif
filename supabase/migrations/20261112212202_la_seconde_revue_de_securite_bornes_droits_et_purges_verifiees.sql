-- La seconde revue de sécurité : bornes, droits et purges vérifiées
--
-- Pourquoi : la seconde revue de CodeRabbit (pull request #537, lot des
-- fonctions et des migrations) a relevé cinq points, vérifiés un à un contre
-- les migrations en place. Celles-ci sont appliquées : rien n'y est réécrit,
-- tout se corrige ici.
--
-- 1. `enregistre_rappels` n'avait qu'une borne, 60 rappels par appel. Rien ne
--    bornait leur date, ni leur nombre en attente : des abonnements fabriqués
--    à la chaîne pouvaient poser des rappels pour dans dix ans, qui restaient
--    en base jusque-là. La date est bornée comme celle des plans de visite
--    (`pose_plan_de_visite` `HORIZON_JOURS`), et les rappels en attente le
--    sont tous ensemble.
-- 2. `erreur_publique` comptait les erreurs du jour avant d'en ajouter une :
--    deux appels simultanés lisaient le même compte, et la borne de 200 par
--    salon et par jour se dépassait. Le compte et l'ajout se prennent sous un
--    verrou par salon et par jour, comme `remplace_acces`.
-- 3. `revoke … from public` ne retire pas à `anon` et `authenticated` ce que
--    Supabase leur accorde directement : `rappels_dus`, `pose_plan_de_visite`
--    et `enregistre_rappels` leur restaient ouvertes. Seules les fonctions,
--    sous la clé de service, s'en servent. Le risque était latent — la RLS ne
--    leur montre aucune ligne —, il n'attend plus qu'une politique future.
-- 4. et 5. Les purges nocturnes des jetons de visiteur et des rappels étaient
--    programmées dans un bloc qui changeait un échec en simple avertissement :
--    la migration passait sans tâche, et les jetons dépassaient la durée
--    annoncée. Elles sont reprogrammées ici, et la migration échoue si l'une
--    manque — comme la tâche d'envoi des rappels
--    (`20260915131103_programmer_vraiment_la_tache_des_rappels`).

-- ------------------------------------------------------------ 1. les rappels
/**
 * Inchangée, sauf deux bornes. La date d'envoi ne passe pas l'année qui vient :
 * un salon se prépare des mois à l'avance, pas des années. Et les rappels en
 * attente, tous salons confondus, ont un plafond : une borne par appareil ne
 * suffirait pas, un appelant en fabrique autant qu'il veut. Le plafond refuse
 * sans rien effacer ; il est haut — des centaines de salons pleins — et ne se
 * touche qu'en cas d'abus.
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
  RANGS_MAX     constant int := 60;      -- un parcours raisonnable, et une borne ferme
  HORIZON_JOURS constant int := 366;     -- comme les plans de visite
  ATTENTE_MAX   constant int := 200000;  -- tous salons confondus
  v_evt uuid;
begin
  select e.id into v_evt
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- compté sur l'index des rappels en attente, et borné : le compte ne coûte
  -- jamais plus que le plafond
  if (select count(*) from (select 1 from rappel_de_conference
                             where envoye_a is null limit ATTENTE_MAX) s) >= ATTENTE_MAX then
    return false;
  end if;

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
       and (r->>'envoi_a')::timestamptz <= now() + make_interval(days => HORIZON_JOURS)
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

-- ------------------------------------------------- 2. les erreurs des pages
/**
 * Inchangée, sauf le verrou : le compte des erreurs du jour et l'ajout de la
 * suivante ne se croisent plus entre deux appels du même salon.
 */
create or replace function erreur_publique(
  p_slug    text,
  p_page    text,
  p_version text,
  p_erreurs jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  PAR_APPEL constant integer := 5;
  PAR_JOUR  constant integer := 200;
  v_evt     uuid;
  v_page    text := case when p_page = 'admin' then 'admin' else 'plan' end;
  v_version text := left(regexp_replace(coalesce(p_version, ''), '[^a-f0-9]', '', 'g'), 16);
  v_e       record;
begin
  select e.id into v_evt from evenement e
   where e.slug = left(coalesce(p_slug, ''), 80) and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- un salon, un jour : deux appels simultanés comptaient le même total
  perform pg_advisory_xact_lock(hashtextextended('erreurs:' || v_evt::text || '/' || current_date::text, 0));

  for v_e in
    select m, l from (
      -- les caractères de contrôle partent : ce texte s'affichera dans la console
      select left(regexp_replace(coalesce(x->>'message', ''), '[[:cntrl:]]', ' ', 'g'), 300) as m,
             left(regexp_replace(coalesce(x->>'lieu', ''), '[^A-Za-z0-9_./:-]', '', 'g'), 160) as l
        from jsonb_array_elements(
               case when jsonb_typeof(p_erreurs) = 'array' then p_erreurs else '[]'::jsonb end
             ) with ordinality as t(x, rang)
       where rang <= PAR_APPEL and jsonb_typeof(x) = 'object'
    ) s
    where m <> ''
  loop
    insert into erreur_page as ep (evenement_id, page, empreinte, message, lieu, version)
    select v_evt, v_page, md5(v_page || ' ' || v_e.m || ' ' || v_e.l), v_e.m, v_e.l, v_version
     where exists (select 1 from erreur_page
                    where evenement_id = v_evt and jour = current_date
                      and empreinte = md5(v_page || ' ' || v_e.m || ' ' || v_e.l))
        or (select count(*) from erreur_page
             where evenement_id = v_evt and jour = current_date) < PAR_JOUR
    on conflict (evenement_id, jour, empreinte) do update
       set nombre = least(ep.nombre + 1, 1000000),
           derniere = now(),
           version = excluded.version;
  end loop;
  return true;
end;
$$;

revoke all on function erreur_publique(text, text, text, jsonb) from public;
grant execute on function erreur_publique(text, text, text, jsonb) to anon, service_role;

-- ------------------------------------------------------------- 3. les droits
-- Réservées aux fonctions, sous la clé de service.
revoke all on function rappels_dus(int) from public, anon, authenticated;
grant execute on function rappels_dus(int) to service_role;
revoke all on function pose_plan_de_visite(text, text, jsonb) from public, anon, authenticated;
grant execute on function pose_plan_de_visite(text, text, jsonb) to service_role;
revoke all on function enregistre_rappels(text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function enregistre_rappels(text, text, text, text, jsonb) to service_role;

-- ------------------------------------------------------ 4. et 5. les purges
-- Sans `pg_cron` (essais locaux), rien à programmer : la purge des jetons tourne
-- aussi à chaque synchronisation. Avec, la tâche doit exister — un échec n'est
-- plus avalé.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    return;
  end if;
  -- un même nom remplace la tâche : rejouer ne la double pas
  perform cron.schedule('purge-des-jetons-de-visiteur', '43 1 * * *',
                        'select public.purge_presences()');
  perform cron.schedule('purge-des-rappels', '11 2 * * *',
                        'select public.purge_rappels()');
  if not exists (select 1 from cron.job
                  where jobname = 'purge-des-jetons-de-visiteur' and active) then
    raise exception 'La tâche « purge-des-jetons-de-visiteur » n''a pas été programmée.';
  end if;
  if not exists (select 1 from cron.job
                  where jobname = 'purge-des-rappels' and active) then
    raise exception 'La tâche « purge-des-rappels » n''a pas été programmée.';
  end if;
end $$;
