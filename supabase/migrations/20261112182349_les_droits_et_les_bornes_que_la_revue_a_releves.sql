-- Les droits et les bornes que la revue a relevés
--
-- Pourquoi : la revue complète du dépôt par CodeRabbit (pull requests #529 et
-- #530, novembre 2026) a relevé quatre défauts que la base porte, vérifiés un à
-- un dans le code. Les migrations qui les ont introduits sont appliquées : on
-- ne les réécrit pas, on les corrige ici. Chaque fonction redéfinie reprend sa
-- dernière version à l'identique, hors ce que dit son commentaire.

-- --------------------------------------------- la source d'un salon, réservée
/*
 * Un organisateur modifie toutes les colonnes de ses salons (« modification
 * des salons accessibles », `…_comptes.sql`) — `instance`, `event_id` et `cles`
 * comprises. Or la synchronisation, qui ne vérifie que l'accès au salon, prend
 * la clé Klipso de l'instance inscrite (`cle_klipso`), ou la clé Eventmaker du
 * projet pour l'identifiant rangé dans `cles` : un organisateur qui connaissait
 * la base d'un autre client pouvait la faire lire avec la clé de ce client et
 * en importer les données dans son propre salon.
 *
 * Choisir la base d'un salon revient déjà à l'administrateur à la création
 * (`base_klipso` ne se lit que par lui) ; le changer aussi. `current_user` vaut
 * `authenticated` pour un compte qui passe par l'API : la synchronisation, sous
 * la clé de service, et les migrations n'y sont pas soumises.
 */
create or replace function source_du_salon_reservee() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated' and not est_admin() and (
       new.instance is distinct from old.instance
    or new.event_id is distinct from old.event_id
    or new.cles     is distinct from old.cles) then
    raise exception 'Seul un administrateur change la base Klipso ou les identifiants d''un salon.'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists source_du_salon_reservee on evenement;
create trigger source_du_salon_reservee
  before update on evenement
  for each row execute function source_du_salon_reservee();

-- ------------------------------------------------ le bilan de performance
/*
 * `pertesContexte` est accepté jusqu'à un milliard par relevé, et la route qui
 * les reçoit est publique : trois relevés d'un même groupe faisaient déborder
 * `sum(...)::int`. Le bilan échouait alors, et `purge_perf`, qui l'appelle
 * avant d'effacer quoi que ce soit, avec lui — pour tous les salons.
 */
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
             least(sum(r.pertes_contexte), 2147483647)::int as pertes
        from releve_perf r
       where r.jour = p_jour
       group by r.evenement_id, r.page, coalesce(r.mobile, false)
    ) g;
end;
$$;

revoke all on function bilan_perf(date) from public, anon, authenticated;

-- --------------------------------------------------- les rappels périmés
/*
 * Après une panne, `rappels_dus` rendait aussi les rappels dont l'échéance
 * était passée depuis plus que leur durée de vie, et avec cette durée entière :
 * le visiteur recevait l'annonce d'une conférence déjà finie.
 */
create or replace function rappels_dus(p_max int default 200)
returns table (
  id         uuid,
  abonnement text,
  p256dh     text,
  auth       text,
  titre      text,
  corps      text,
  adresse    text,
  vie        integer
)
language sql
security invoker
set search_path = public
as $$
  update rappel_de_conference r
     set envoye_a = now()
   where r.id in (
         select d.id from rappel_de_conference d
          where d.envoye_a is null and d.envoi_a <= now()
            -- passé sa durée de vie, un rappel annoncerait une conférence finie
            and d.envoi_a + make_interval(secs => d.vie) > now()
          order by d.envoi_a
          limit greatest(1, least(500, p_max))
            for update skip locked)
  returning r.id, r.abonnement, r.p256dh, r.auth, r.titre, r.corps, r.adresse,
         -- ce qui lui reste à vivre, et non sa durée entière : le service de
         -- poussée la compte depuis qu'il le reçoit, pas depuis l'échéance
         greatest(1, ceil(extract(epoch from
           r.envoi_a + make_interval(secs => r.vie) - now())))::integer;
$$;

revoke all on function rappels_dus(int) from public;

-- ------------------------------------------------ les plans de visite
create or replace function pose_plan_de_visite(
  p_slug   text,
  p_plan   text,
  p_etapes jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  /* Deux cents : une journée organisée en porte une vingtaine, un séjour de
     quatre jours quatre-vingts. Au-delà, ce n'est plus une visite. */
  ETAPES_MAX constant integer := 200;
  HORIZON_JOURS constant integer := 366;
  v_evt uuid;
begin
  select e.id into v_evt
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  /* Deux remplacements du même plan qui se croisent effaçaient chacun zéro
     ligne puis posaient chacun la sienne : le salon comptait l'union des deux.
     Le verrou les met en file, le second remplace bien le premier. */
  perform pg_advisory_xact_lock(hashtextextended(v_evt::text || '/' || p_plan, 0));

  delete from plan_de_visite where evenement_id = v_evt and plan = p_plan;

  /* Les deux étages sont « materialized » à dessein : sans cela le planificateur
     est libre de tenter la conversion en date avant d'avoir appliqué le filtre
     qui la rend sûre, et une étape mal formée ferait échouer le paquet entier
     au lieu d'être écartée seule. */
  with brut as materialized (
    select x->>'jour' as j, x->>'tranche' as t, coalesce(x->>'cible', '') as c
      from jsonb_array_elements(p_etapes) x
     limit ETAPES_MAX
  ), bon as materialized (
    select j, t, c from brut
     where j ~ '^\d{4}-\d{2}-\d{2}$' and t ~ '^\d{1,2}$' and c <> ''
  )
  insert into plan_de_visite (evenement_id, plan, jour, tranche, cible)
  select distinct v_evt, p_plan, j::date, t::smallint, c
    from bon
   where t::integer < 48
     /* Un plan pour un jour passé ne contraindrait plus rien : on ne le pose
        pas, plutôt que de compter sur la purge pour l'oublier. */
     and j::date >= current_date
     /* Ni un jour trop lointain : la route est publique, et une étape posée
        pour 2099 serait restée jusqu'à son jour. Un an couvre toute visite
        qu'on prépare. */
     and j::date <= current_date + HORIZON_JOURS
     and exists (select 1 from cible k
                  where k.evenement_id = v_evt
                    and k.genre = 'fiche_stand'
                    and k.id = c)
      on conflict do nothing;

  /* Le ménage du salon, tant qu'on y est : ce qui datait d'hier ne dit plus
     rien de ce qui se prépare, et l'index par jour y mène droit. La purge de
     nuit n'a plus qu'à ramasser les salons où plus personne n'organise. */
  delete from plan_de_visite where evenement_id = v_evt and jour < current_date;

  return true;
end;
$$;

revoke all on function pose_plan_de_visite(text, text, jsonb) from public;
grant execute on function pose_plan_de_visite(text, text, jsonb) to service_role;
