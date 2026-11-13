-- La seconde revue, suite : droits du service, bilans et remise à zéro
--
-- Pourquoi : la seconde revue de CodeRabbit (pull request #537) a relevé, hors
-- sécurité, des défauts dans des fonctions déjà appliquées. Rien n'y est
-- réécrit : elles sont redéfinies ici, chacune à l'identique sauf ce qui est
-- dit.
--
-- 1. `oublie_abonnement` et `oublie_rappels_perimes` perdaient `public` sans
--    que `service_role`, qui seul les appelle, reçoive le droit en propre : il
--    ne le tenait que du réglage par défaut du projet, que le dépôt ne fixe
--    pas. `sync-evenement` ignore l'échec de la seconde — les rappels
--    périmés seraient restés sans trace.
-- 2. `enregistre_mesures` et `reinitialise_compteurs` se croisaient : la remise
--    à zéro efface les compteurs puis les visiteurs du jour, chaque effacement
--    sur son propre instantané, et un paquet validé entre les deux gardait
--    ses compteurs. Un verrou par salon les met en file.
-- 3. `bilan_perf` bornait la somme des pertes de contexte par le haut, pas par
--    le bas : des relevés négatifs, que la porte publique accepte, faisaient
--    encore échouer le bilan — et la purge avec lui, pour tous les salons.
-- 4. `sonde_detail` ne regroupait pas comme `bilan_perf` les relevés qui ne
--    disent pas s'ils sont mobiles : le détail d'une ligne décrivait un autre
--    ensemble que ses centiles.

-- ------------------------------------------------- 1. les droits du service
grant execute on function oublie_abonnement(text) to service_role;
grant execute on function oublie_rappels_perimes(uuid) to service_role;

-- ---------------------------------------------- 2. mesures et remise à zéro
create or replace function enregistre_mesures(
  p_slug     text,
  p_visiteur text,
  p_gestes   jsonb,
  p_support  text    default '',
  -- faux quand le navigateur a refusé de retenir le jeton du visiteur
  p_retenu   boolean default true,
  -- secondes écoulées entre les gestes et leur arrivée ici
  p_recul    integer default 0
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  /* Un mois : au-delà, le rapport du salon est rendu depuis longtemps et ces
     gestes fausseraient des chiffres arrêtés. La page ne garde de toute façon
     pas si longtemps ce qui attend — mais la borne est ici, où l'on ne peut
     pas la contourner. */
  RECUL_MAX constant integer := 30 * 86400;
  GENRES constant text[] := array[
    'visite', 'recherche', 'itineraire', 'journee', 'parcours', 'partage',
    'fiche_stand', 'fiche_conf'];
  -- les gestes qui peuvent désigner quelque chose, et ce qu'ils désignent
  VISANTS constant text[] := array[
    'fiche_stand', 'fiche_conf', 'itineraire', 'parcours'];
  OBJETS constant text[] := array['fiche_stand', 'fiche_conf'];
  CANAUX constant text[] := array[
    'recherche', 'liste', 'plan', 'image', 'conference', 'salle', 'exposant',
    'parcours', 'lien', 'suggestion', 'partage'];
  /* Les quatre portes. Closes comme le reste : une valeur inventée rejoint
     « non précisé » plutôt que d'ouvrir une cinquième colonne dans le rapport
     au premier venu qui poste ce qu'il veut. */
  SUPPORTS constant text[] := array['web', 'integre', 'pwa', 'appli'];
  v_evt     uuid;
  v_tz      text;
  v_quand   timestamptz;
  v_jour    date;
  v_support text;
  v_gestes  jsonb;
begin
  select e.id, e.fuseau into v_evt, v_tz
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- en file avec la remise à zéro du même salon (`reinitialise_compteurs`)
  perform pg_advisory_xact_lock(hashtextextended('mesure:' || v_evt::text, 0));

  -- L'instant du geste : maintenant, moins ce que le paquet a attendu.
  v_quand := now() - least(greatest(coalesce(p_recul, 0), 0), RECUL_MAX)
                     * interval '1 second';

  -- Le jour se date dans le fuseau du salon : sinon les deux premières heures
  -- d'une soirée parisienne tomberaient la veille. La colonne ne porte qu'un
  -- fuseau lisible ou rien — le déclencheur `fuseau_iana` y veille — et un
  -- salon sans fuseau se compte en UTC.
  v_jour := (v_quand at time zone coalesce(v_tz, 'UTC'))::date;

  v_support := case when p_support = any(SUPPORTS) then p_support else '' end;

  /* On nettoie une fois, on compte quatre fois.

     Un genre hors liste emporte son geste : on ne sait pas ce qu'on compterait.
     Un canal hors liste, non — le geste a bien eu lieu, seule sa provenance
     est illisible, et la perdre fausserait le total d'une fiche ouverte pour
     de bon. Il rejoint les sans-canal, que le rapport nomme « autre ».

     Un objet illisible vide la cible plutôt que le geste, pour la même raison :
     un itinéraire dont on ne sait plus vers quoi reste un itinéraire. */
  select coalesce(jsonb_agg(jsonb_build_object(
           'genre', genre,
           'canal', case when canal = any(CANAUX) then canal else '' end,
           'objet', objet,
           'cible', case when objet = '' then '' else cible end)), '[]'::jsonb)
    into v_gestes
    from (
      select b.genre, b.canal, b.cible,
             case
               -- une fiche ouverte désigne l'objet qui porte son nom
               when b.genre = any(OBJETS) then b.genre
               when b.dit   = any(OBJETS) then b.dit
               else ''
             end as objet
        from (
          select x->>'genre'               as genre,
                 coalesce(x->>'canal', '') as canal,
                 coalesce(x->>'cible', '') as cible,
                 -- « dit » et non « objet » : ce que la page annonce, avant
                 -- qu'on l'ait retenu ou écarté
                 coalesce(x->>'objet', '') as dit
            from jsonb_array_elements(p_gestes) x
        ) b
       where b.genre = any(GENRES)
    ) t;

  -- un paquet vidé par les filtres n'est pas une erreur, et ne fait pas de son
  -- porteur un visiteur de plus
  if jsonb_array_length(v_gestes) = 0 then return true; end if;

  insert into compteur (evenement_id, heure, genre, canal, support, n)
  select v_evt, date_trunc('hour', v_quand), x->>'genre', x->>'canal', v_support, count(*)
    from jsonb_array_elements(v_gestes) x
   group by 1, 2, 3, 4, 5
      on conflict (evenement_id, heure, genre, canal, support)
      do update set n = compteur.n + excluded.n;

  -- Une cible inconnue est écartée plutôt que de faire échouer le paquet
  -- entier : la clé étrangère ne sert plus que de garde-fou.
  insert into compteur_cible (evenement_id, genre, objet, cible, jour, canal, n)
  select v_evt, x->>'genre', x->>'objet', x->>'cible', v_jour, x->>'canal', count(*)
    from jsonb_array_elements(v_gestes) x
   where x->>'genre' = any(VISANTS)
     and x->>'cible' <> ''
     and exists (select 1 from cible c
                  where c.evenement_id = v_evt
                    and c.genre = x->>'objet'
                    and c.id = x->>'cible')
   group by 1, 2, 3, 4, 5, 6
      on conflict (evenement_id, genre, objet, cible, jour, canal)
      do update set n = compteur_cible.n + excluded.n;

  -- La présence : le même filtre, mais sans compter. Ce que cette ligne rend
  -- possible et que la précédente ne pourra jamais rendre, c'est « combien de
  -- personnes », par opposition à « combien de fois ».
  insert into visiteur_cible (evenement_id, objet, cible, genre, canal, jour, visiteur)
  select distinct v_evt, x->>'objet', x->>'cible', x->>'genre', x->>'canal',
         v_jour, p_visiteur
    from jsonb_array_elements(v_gestes) x
   where x->>'genre' = any(VISANTS)
     and x->>'cible' <> ''
     and exists (select 1 from cible c
                  where c.evenement_id = v_evt
                    and c.genre = x->>'objet'
                    and c.id = x->>'cible')
      on conflict do nothing;

  /* Le doute sur le stockage l'emporte sur la confiance : un « et » plutôt
     qu'un « ou ». Un jeton dont un seul envoi a dit qu'il n'était pas retenu
     ne vaut pas un visiteur, et le compter comme tel serait l'inflation qu'on
     cherche justement à rendre visible. */
  insert into visiteur_jour (evenement_id, jour, visiteur, support, parcours, retenu)
  values (v_evt, v_jour, p_visiteur, v_support,
          exists (select 1 from jsonb_array_elements(v_gestes) x
                   where x->>'genre' = 'parcours'),
          coalesce(p_retenu, true))
      on conflict (evenement_id, jour, visiteur, support)
      do update set parcours = visiteur_jour.parcours or excluded.parcours,
                    retenu   = visiteur_jour.retenu and excluded.retenu;

  return true;
end;
$$;

revoke all on function enregistre_mesures(text, text, jsonb, text, boolean, integer) from public;
grant execute on function enregistre_mesures(text, text, jsonb, text, boolean, integer) to service_role;

create or replace function reinitialise_compteurs(p_evenement uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  n_compteur bigint; n_cible bigint; n_visiteur bigint; n_presence bigint;
  n_plan bigint;
begin
  if not acces_salon(p_evenement) then
    raise exception 'Ce salon ne vous est pas accessible.' using errcode = '42501';
  end if;

  -- en file avec les paquets du même salon (`enregistre_mesures`)
  perform pg_advisory_xact_lock(hashtextextended('mesure:' || p_evenement::text, 0));
  delete from compteur where evenement_id = p_evenement;
  get diagnostics n_compteur = row_count;
  delete from compteur_cible where evenement_id = p_evenement;
  get diagnostics n_cible = row_count;
  delete from visiteur_cible where evenement_id = p_evenement;
  get diagnostics n_presence = row_count;
  delete from visiteur_jour where evenement_id = p_evenement;
  get diagnostics n_visiteur = row_count;
  /* Les plans annoncés partent avec le reste : remettre les compteurs à zéro
     en les laissant laisserait la journée organisée contrainte par une charge
     dont plus rien au rapport ne rendrait compte. */
  delete from plan_de_visite where evenement_id = p_evenement;
  get diagnostics n_plan = row_count;

  return jsonb_build_object(
    'compteurs', n_compteur,
    'cibles',    n_cible,
    'presences', n_presence,
    'visiteurs', n_visiteur,
    'plans',     n_plan);
end;
$$;

comment on function reinitialise_compteurs is
  'Efface toute la mesure d''un salon — fréquentation, audience par stand, présences, jetons de visiteurs. Irréversible. Ne touche pas à « cible », qui porte les libellés.';

revoke all on function reinitialise_compteurs(uuid) from public;
grant execute on function reinitialise_compteurs(uuid) to authenticated;

-- --------------------------------------------- 3. le bilan de performance
create or replace function bilan_perf(p_jour date) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- un jour dont les relevés sont déjà purgés garde son bilan : le recalculer l'effacerait
  if not exists (select 1 from releve_perf where jour = p_jour) then return; end if;
  delete from perf_bilan where jour = p_jour;
  insert into perf_bilan (evenement_id, jour, page, mobile, visites, affiche_p50, affiche_p90,
                          donnees_p50, donnees_p90, transfert_p50, part_plus33_p50, gels_moy,
                          pertes_contexte, detail)
  select g.evenement_id, p_jour, g.page, g.mobile, g.visites, g.affiche_p50, g.affiche_p90,
         g.donnees_p50, g.donnees_p90, g.transfert_p50, g.part_p50, g.gels_moy, g.pertes,
         sonde_detail(g.evenement_id, p_jour, p_jour, g.page, g.mobile)
    from (
      select r.evenement_id, r.page, coalesce(r.mobile, false) as mobile, count(*)::int as visites,
             percentile_cont(0.5) within group (order by r.affiche_ms) as affiche_p50,
             percentile_cont(0.9) within group (order by r.affiche_ms) as affiche_p90,
             percentile_cont(0.5) within group (order by r.donnees_ms) as donnees_p50,
             percentile_cont(0.9) within group (order by r.donnees_ms) as donnees_p90,
             percentile_cont(0.5) within group (order by r.transfert_ko) as transfert_p50,
             -- la part de saccades de la vue qu'on a réellement utilisée
             percentile_cont(0.5) within group (order by
               coalesce(case when r.immersif then r.part_plus33_immersif end, r.part_plus33_classique)) as part_p50,
             avg(r.gels) as gels_moy,
             -- la somme d'un groupe se borne : chaque relevé en accepte jusqu'à un
             -- milliard, et trois suffisaient à faire déborder un entier
             -- (« least » ignore un NULL : un groupe sans mesure le reste ainsi)
             -- et par le bas : un relevé public peut porter un nombre négatif, et
             -- trois à moins un milliard faisaient déborder l'entier de même
             case when sum(r.pertes_contexte) is null then null
                  else least(sum(greatest(r.pertes_contexte, 0)), 2147483647) end::int as pertes
        from releve_perf r
       where r.jour = p_jour
       group by r.evenement_id, r.page, coalesce(r.mobile, false)
    ) g;
end;
$$;

revoke all on function bilan_perf(date) from public, anon, authenticated;

-- ---------------------------------------------------- 4. le détail du bilan
create or replace function sonde_detail(
  p_evt    uuid,
  p_de     date,
  p_a      date,
  p_page   text,
  p_mobile boolean
) returns jsonb
language sql
stable
set search_path = public
as $$
  with r as (
    select r.*,
           coalesce(case when r.immersif then r.part_plus33_immersif end, r.part_plus33_classique) as part,
           nullif(trim(concat_ws(' ', r.resume #>> '{appareil,carte,fabricant}', r.resume #>> '{appareil,carte,puce}')), '') as carte,
           r.resume #>> '{appareil,systeme}' as famille,
           sonde_nombre(r.resume #> '{chargement,jalons,reponse}') as reponse
      from releve_perf r
     where r.evenement_id = p_evt and r.jour between p_de and p_a
       and (p_page is null or r.page = p_page)
       -- le même regroupement que le bilan (`bilan_perf`) : un relevé qui ne
       -- dit pas s'il est mobile compte avec le bureau, ici comme là
       and (p_mobile is null or coalesce(r.mobile, false) = p_mobile)
  ),
  appareils as (
    select carte, coalesce(max(famille), '') as famille, count(*)::int as visites,
           percentile_cont(0.5) within group (order by part) as part_plus33_p50,
           percentile_cont(0.5) within group (order by affiche_ms) as affiche_p50
      from r where carte is not null
     group by carte
     order by affiche_p50 desc nulls last, carte
     limit 10
  ),
  lourds as (
    select l ->> 'fichier' as fichier, count(distinct r.visite)::int as visites,
           percentile_cont(0.5) within group (order by sonde_nombre(l -> 'transfertKo')) as ko_p50
      from r
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(r.resume #> '{chargement,lourds}') = 'array'
             then r.resume #> '{chargement,lourds}' else '[]'::jsonb end) l
     where jsonb_typeof(l -> 'fichier') = 'string'
     group by l ->> 'fichier'
     order by visites desc, fichier
     limit 10
  )
  select jsonb_build_object(
    'vues', jsonb_build_object(
      'classique', (select jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by part_plus33_classique),
          'p90', percentile_cont(0.9) within group (order by part_plus33_classique)) from r),
      'immersif', (select jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by part_plus33_immersif),
          'p90', percentile_cont(0.9) within group (order by part_plus33_immersif)) from r)),
    'appareils', coalesce((select jsonb_agg(jsonb_build_object(
          'carte', carte, 'famille', famille, 'visites', visites,
          'part_plus33_p50', part_plus33_p50, 'affiche_p50', affiche_p50)
          order by affiche_p50 desc nulls last, carte) from appareils), '[]'::jsonb),
    'lourds', coalesce((select jsonb_agg(jsonb_build_object(
          'fichier', fichier, 'visites', visites, 'ko_p50', ko_p50)
          order by visites desc, fichier) from lourds), '[]'::jsonb),
    'etapes', (select jsonb_build_object(
        'reponse', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by reponse),
          'p90', percentile_cont(0.9) within group (order by reponse)),
        'donnees', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by donnees_ms),
          'p90', percentile_cont(0.9) within group (order by donnees_ms)),
        'preparation', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by affiche_ms - donnees_ms),
          'p90', percentile_cont(0.9) within group (order by affiche_ms - donnees_ms)),
        'affichage', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by affiche_ms),
          'p90', percentile_cont(0.9) within group (order by affiche_ms))) from r));
$$;

-- invoker et soumis à la RLS : `performances_du_salon` (invoker aussi) l'appelle avec les
-- droits du compte, il doit donc rester exécutable par authenticated, jamais par anon
revoke all on function sonde_detail(uuid, date, date, text, boolean) from public, anon;
grant execute on function sonde_detail(uuid, date, date, text, boolean) to authenticated;
