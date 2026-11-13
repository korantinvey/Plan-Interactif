-- Les mesures d'avant une remise à zéro ne reviennent pas
--
-- Pourquoi : la page garde les gestes qu'elle n'a pas pu envoyer — hors ligne,
-- dans les allées d'un hall sans réseau — et les renvoie plus tard, en disant
-- combien de temps ils ont attendu (`p_recul`). Un paquet resté sur un
-- téléphone pendant que l'exploitant remettait les compteurs à zéro arrivait
-- après, et recomptait des gestes que la remise venait d'effacer : le rapport
-- d'un salon remis à neuf pour son ouverture portait les essais de la veille.
--
-- La remise retient son instant (`evenement.compteurs_remis_le`), et
-- `enregistre_mesures` écarte les gestes plus anciens. Le verrou par salon les
-- met déjà en file : un paquet ne se compte pas à moitié avant la remise.
--
-- Les deux fonctions sont redéfinies à l'identique pour le reste (migration
-- `20261112214003_la_seconde_revue_suite_droits_du_service_bilans_et_remise_a_zero`).

alter table evenement add column if not exists compteurs_remis_le timestamptz;

comment on column evenement.compteurs_remis_le is
  'Dernière remise à zéro des compteurs : les gestes plus anciens, arrivés après elle, ne comptent pas (enregistre_mesures).';

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
  v_remis   timestamptz;
begin
  select e.id, e.fuseau, e.compteurs_remis_le into v_evt, v_tz, v_remis
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

  /* Des gestes d'avant la dernière remise à zéro — un paquet resté hors ligne
     sur un téléphone, qui arrive après — ne recomptent pas : l'exploitant a
     effacé ces chiffres-là. Le paquet est reçu, pour que la page ne le
     renvoie pas, mais il ne compte rien. */
  if v_remis is not null and v_quand < v_remis then return true; end if;

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
  /* L'instant de la remise, que `enregistre_mesures` compare à l'heure des
     gestes : un paquet d'avant, arrivé après, ne revient pas gonfler les
     compteurs qu'on vient d'effacer. */
  update evenement set compteurs_remis_le = now() where id = p_evenement;

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
