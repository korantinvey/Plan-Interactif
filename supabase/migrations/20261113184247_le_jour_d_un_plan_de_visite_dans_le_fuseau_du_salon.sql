-- Le jour d'un plan de visite dans le fuseau du salon
--
-- Pourquoi : `pose_plan_de_visite` comparait les jours de la visite au jour
-- UTC (`current_date`). Le soir, pour un salon en Amérique, le jour UTC est
-- déjà le lendemain : un plan pour le jour même était refusé, et le ménage
-- effaçait ceux que les autres visiteurs avaient posés pour lui. Les mesures,
-- elles, datent déjà leur jour dans le fuseau du salon
-- (`enregistre_mesures`) ; le plan de visite fait de même, et un salon sans
-- fuseau reste en UTC.
--
-- Redéfinie à l'identique pour le reste (migration
-- `20261112182349_les_droits_et_les_bornes_que_la_revue_a_releves`) ; ses
-- droits (`20261112212202`) tiennent à travers `create or replace`.

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
  v_tz  text;
  -- aujourd'hui, là où se tient le salon
  v_auj date;
begin
  select e.id, e.fuseau into v_evt, v_tz
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;
  v_auj := (now() at time zone coalesce(v_tz, 'UTC'))::date;

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
     and j::date >= v_auj
     /* Ni un jour trop lointain : la route est publique, et une étape posée
        pour 2099 serait restée jusqu'à son jour. Un an couvre toute visite
        qu'on prépare. */
     and j::date <= v_auj + HORIZON_JOURS
     and exists (select 1 from cible k
                  where k.evenement_id = v_evt
                    and k.genre = 'fiche_stand'
                    and k.id = c)
      on conflict do nothing;

  /* Le ménage du salon, tant qu'on y est : ce qui datait d'hier ne dit plus
     rien de ce qui se prépare, et l'index par jour y mène droit. La purge de
     nuit n'a plus qu'à ramasser les salons où plus personne n'organise. */
  delete from plan_de_visite where evenement_id = v_evt and jour < v_auj;

  return true;
end;
$$;
