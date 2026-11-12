-- La charge prévue des stands — ce que les journées organisées annoncent
--
-- Pourquoi. La journée organisée range les stands au plus court depuis la porte
-- d'entrée : tout le monde part du même point, à la même heure, et reçoit le
-- même ordre. Les premières travées se remplissent à l'ouverture pendant que le
-- fond reste vide — et ce qui empêche alors une visite n'est pas la densité de
-- l'allée, c'est que toute l'équipe du stand est déjà en conversation. Le
-- visiteur suivant n'est reçu par personne, qu'il soit venu de l'entrée ou du
-- fond.
--
-- Pour l'éviter il faut savoir d'avance combien de visiteurs ont prévu d'être
-- là. Les compteurs ne le disent pas et ne le diront jamais : `compteur_cible`
-- est daté au jour, délibérément — croiser l'objet et l'heure reconstruirait le
-- volume qu'on fuyait — et il compte des consultations de fiche, qui ne sont
-- pas des présences. Une journée organisée, elle, est exactement cela : la
-- liste de là où quelqu'un compte être, avec l'heure. Et elle existe avant
-- l'ouverture, puisqu'on prépare sa visite à l'avance.
--
-- Trois choses la séparent de tout ce qui précède, et lui valent une table.
--
--   · Ce n'est pas un compteur, c'est un état. Le plan d'un visiteur remplace
--     le précédent au lieu de s'y ajouter : `refaitSejour` repasse à chaque
--     retouche, et sans cela les dix essais d'une même personne feraient dix
--     visiteurs — un embouteillage qu'elle aurait fabriqué toute seule. D'où
--     l'identifiant de parcours, tiré par la page et gardé avec la liste.
--   · Elle ne se mélange pas à l'audience. Rattacher un plan aux stands qu'il
--     traverse ferait passer pour autant de demandes ce qui n'est qu'un clic
--     sur « organiser » — et ces chiffres-là partent chez l'exposant.
--   · Elle meurt vite. Un plan ne vaut rien passé le jour qu'il annonce : la
--     purge est au jour, non à quatre cents comme celle des jetons.
--
-- Ce qu'elle ne porte pas, et ne portera pas : le jeton de visiteur. Le plan et
-- les gestes arrivent par deux chemins séparés — `plan-de-visite` d'un côté,
-- `mesure` de l'autre — parce que « ce que cette personne compte faire » joint
-- à « ce qu'elle a consulté » ferait une trajectoire, ce que ce système ne
-- garde pas.
--
-- Sur le compte d'une cellule, enfin, et sur une protection envisagée puis
-- écartée en connaissance de cause : aucun plancher ne masque les petits
-- nombres. Il aurait cassé le mécanisme — un stand à trois sur quatre ne se
-- verrait plus saturer — pour ne protéger rien : ce qui sort d'ici est un
-- entier par (stand, demi-heure), sans jeton, sans identifiant, joignable à
-- rien. `compteur_cible` sert déjà des comptes de un.

-- ------------------------------------------------------ le genre « journee »
/* Une journée organisée se comptait parmi les itinéraires, et le commentaire
   qui le faisait disait pourquoi : « faute d'un genre à soi en base ». Le
   voici. Le vocabulaire s'ouvre d'un mot, tenu par la table autant que par la
   fonction — la contrainte est ce qui garantit qu'aucun mot inventé n'entre en
   base, même par une autre porte.

   `compteur_cible` et `visiteur_cible` gardent la leur telle quelle : organiser
   sa journée ne vise aucun stand en particulier, et n'écrit dans ni l'une ni
   l'autre. */
alter table compteur drop constraint if exists compteur_genre_check;
alter table compteur add constraint compteur_genre_check
  check (genre in ('visite', 'recherche', 'itineraire', 'journee', 'parcours',
                   'partage', 'fiche_stand', 'fiche_conf'));

-- --------------- enregistre_mesures : la même, le vocabulaire ouvert d'un mot
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


-- ------------------------------------------------- les plans de visite posés
/*
 * Une ligne par (plan, jour, demi-heure, stand).
 *
 * Pas de colonne `n` : ce n'est pas un compteur. La charge d'une cellule est le
 * nombre de plans qui la contiennent, et c'est `charge_prevue` qui le compte à
 * la lecture. Maintenir un compteur obligerait à décrémenter quand un plan
 * change — sur un point d'entrée que personne n'authentifie — quand un simple
 * « effacer puis reposer » dit la même chose sans jamais pouvoir dériver.
 *
 * `plan` porte l'identifiant du parcours, tiré au hasard par la page et rangé
 * à côté de la liste (`_parcours.html`). Il ne désigne personne, ne suit rien
 * d'autre, et ne voyage jamais avec le jeton de mesure.
 *
 * La demi-heure plutôt que l'heure : une visite de stand dure vingt minutes par
 * défaut (`minutesVisite`), et l'heure pleine serait deux fois trop large pour
 * dire qu'une équipe est prise. La minute serait du bruit — une journée
 * organisée est une estimation, pas un horaire de train.
 *
 * Aucune clé étrangère vers `cible`, et c'est le seul endroit du dossier où
 * l'on s'en passe : sa clé est (événement, genre, identifiant), et la suivre
 * demanderait de porter ici une colonne `genre` qui ne vaudrait jamais que
 * « fiche_stand ». `pose_plan_de_visite` filtre sur l'existence à la place —
 * le vocabulaire reste aussi clos, à une colonne près sur chaque ligne.
 */
create table if not exists plan_de_visite (
  evenement_id uuid not null references evenement (id) on delete cascade,
  plan         text not null,
  jour         date not null,                         -- dans le fuseau du salon
  -- le rang de la demi-heure dans la journée : 20 pour dix heures
  tranche      smallint not null check (tranche >= 0 and tranche < 48),
  cible        text not null,
  primary key (evenement_id, plan, jour, tranche, cible)
);

comment on table plan_de_visite is
  'Ce que les journées organisées annoncent : quel stand, quel jour, quelle demi-heure. Remplacé en bloc par identifiant de parcours, effacé au passage du jour. Ne porte aucun jeton de visiteur.';
comment on column plan_de_visite.plan is
  'Identifiant du parcours qui a produit ce plan. Tiré au hasard par le navigateur, gardé avec la liste, jamais joint au jeton de mesure.';

/* La lecture va toujours par (salon, jour) et agrège par stand : cet index-là
   la sert, quand la clé primaire commence par le plan, qui ne l'intéresse pas. */
create index if not exists plan_de_visite_charge
  on plan_de_visite (evenement_id, jour, cible, tranche);
/* Et la purge, qui cherche par jour seul — `jour` n'est préfixe d'aucune des
   deux autres, et un balayage de la table chaque nuit serait payé pour rien. */
create index if not exists plan_de_visite_jour on plan_de_visite (jour);

alter table plan_de_visite enable row level security;

/* Aucune politique d'écriture : elle passe par `pose_plan_de_visite`, sous la
   clé de service. La lecture est ouverte à qui a accès au salon — ce qui s'y
   prépare est une donnée d'exploitation, au même titre que la fréquentation. */
create policy "lecture authentifiée des plans de visite" on plan_de_visite
  for select to authenticated using (acces_salon(evenement_id));

-- --------------------------------------------------------- poser un plan
/*
 * Le plan d'un parcours, tel qu'il est maintenant.
 *
 * Effacer puis poser, dans la même transaction : c'est toute la raison d'être
 * de l'identifiant. Un plan à moitié remplacé compterait deux fois, et c'est
 * précisément ce qu'on est venu empêcher.
 *
 * Rien ne se vérifie ici de ce que la base sait déjà refuser, et tout se borne
 * de ce qui vient du navigateur : le nombre d'étapes, la forme d'une date, le
 * rang d'une demi-heure, et l'existence du stand dans ce salon-là.
 */
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
  v_evt uuid;
begin
  select e.id into v_evt
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

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

comment on function pose_plan_de_visite is
  'Remplace en bloc le plan de visite d''un parcours. Rend faux si l''événement n''est pas publié. Écarte les étapes mal formées et les stands que le salon ne porte pas.';

revoke all on function pose_plan_de_visite(text, text, jsonb) from public;
grant execute on function pose_plan_de_visite(text, text, jsonb) to service_role;

-- ------------------------------------------------------ lire la charge
/*
 * Combien de plans annoncent chaque stand, demi-heure par demi-heure.
 *
 * Ce que la page en fait : refuser de poser un stand sur une demi-heure déjà
 * pleine, et chercher le meilleur arrangement sous cette contrainte — qui n'est
 * pas forcément la demi-heure d'après, tout l'ordre pouvant se rejouer autour.
 *
 * `p_min` borne ce qui part. La page passe la plus petite capacité de ses
 * stands : une cellule au-dessous ne saturera jamais rien chez elle, et
 * l'emporter serait payer du réseau pour du silence. Sans cette borne, un salon
 * de six cents stands sur quatre jours pèserait le mégaoctet — dans un hall où
 * le réseau est justement ce qui manque.
 *
 * Et une borne dure par-dessus, parce qu'un chiffre qui vient du navigateur ne
 * borne rien : les cellules les plus chargées d'abord, les autres coupées. Ce
 * qu'on perd ainsi est ce qui contraignait le moins.
 */
create or replace function charge_prevue(
  p_slug text,
  p_min  integer default 1
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with e as (
    select id from evenement where slug = p_slug and etat = 'publie'
  ), cellules as (
    select p.jour, p.cible, p.tranche, count(*) as n
      from plan_de_visite p, e
     where p.evenement_id = e.id
       and p.jour >= current_date
     group by 1, 2, 3
    having count(*) >= greatest(coalesce(p_min, 1), 1)
     order by count(*) desc
     limit 20000
  ), par_stand as (
    select jour, cible, jsonb_object_agg(tranche::text, n) as tranches
      from cellules group by 1, 2
  ), par_jour as (
    select to_char(jour, 'YYYYMMDD') as j,
           jsonb_object_agg(cible, tranches) as stands
      from par_stand group by 1
  )
  select jsonb_build_object(
    'jours', coalesce((select jsonb_object_agg(j, stands) from par_jour),
                      '{}'::jsonb));
$$;

comment on function charge_prevue is
  'La charge annoncée par les journées organisées : par jour, par stand, le nombre de plans qui visent chaque demi-heure. Ne rend que les cellules atteignant p_min, les plus chargées d''abord.';

revoke all on function charge_prevue(text, integer) from public;
grant execute on function charge_prevue(text, integer) to service_role;

-- ------------------------- la purge de nuit ramasse aussi les plans passés
create or replace function purge_presences(p_jours integer default 400)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_limite constant date := current_date - greatest(coalesce(p_jours, 400), 31);
  n_presence bigint; n_visiteur bigint; n_plan bigint;
begin
  delete from visiteur_cible where jour < v_limite;
  get diagnostics n_presence = row_count;
  delete from visiteur_jour where jour < v_limite;
  get diagnostics n_visiteur = row_count;
  /* Les plans annoncés ne suivent pas la même horloge, et c'est voulu : un
     plan ne dit ce qu'il a à dire que le jour qu'il annonce. Passé minuit il
     ne contraint plus rien, et le garder quatre cents jours serait garder
     pour garder. `pose_plan_de_visite` fait déjà ce ménage pour le salon qu'il
     touche ; celui-ci ramasse les salons où plus personne n'organise. */
  delete from plan_de_visite where jour < current_date;
  get diagnostics n_plan = row_count;
  return n_presence + n_visiteur + n_plan;
end;
$$;

comment on function purge_presences is
  'Efface les jetons de visiteur de plus de N jours (400 par défaut, jamais moins de 31) : présences par stand et visiteurs par jour. Efface au passage les plans de visite dont le jour est passé — eux ne valent que le jour qu''ils annoncent. Lancée chaque nuit par pg_cron, et à chaque synchronisation.';

revoke all on function purge_presences(integer) from public;
grant execute on function purge_presences(integer) to service_role;

-- ------------------ la remise à zéro d'un salon emporte ses plans annoncés
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

-- ------------------------ le rapport compte les journées pour elles-mêmes
create or replace function rapport_utilisation(
  p_evenement uuid,
  -- les N derniers jours, comptés dans le fuseau du salon ; nul pour tout
  p_jours     integer default null
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with p as (select * from periode_salon(p_evenement, p_jours)),
  c as (
    select genre, canal, support, heure, n
      from compteur
     where evenement_id = p_evenement
       -- l'instant, et non le jour reconstruit : la colonne reste comparable
       -- telle quelle, et une période qui ne commence pas à minuit n'existe
       -- plus depuis que la borne vient d'ici
       and ((select debut from p) is null or heure >= (select debut from p))
  ),
  v as (
    select jour, visiteur, parcours, support, retenu
      from visiteur_jour
     where evenement_id = p_evenement
       and ((select depuis from p) is null or jour >= (select depuis from p))
  ),
  fiches as (
    select genre, case when canal = '' then 'autre' else canal end as canal, sum(n) as n
      from c where genre in ('fiche_stand', 'fiche_conf')
     group by 1, 2
  ),
  /* Les deux moitiés d'une porte : ce qu'elle a compté, et combien de jetons
     distincts l'ont franchie. La jointure est pleine parce que les deux côtés
     peuvent manquer — un paquet vidé par les filtres n'écrit aucun compteur, et
     l'historique d'avant cette migration n'a de jetons que sous « non précisé ». */
  sup_gestes as (
    select support as s,
           coalesce(sum(n) filter (where genre = 'visite'), 0)     as visites,
           coalesce(sum(n) filter (where genre = 'recherche'), 0)  as recherches,
           coalesce(sum(n) filter (where genre = 'itineraire'), 0) as itineraires,
           coalesce(sum(n) filter (
             where genre in ('fiche_stand', 'fiche_conf')), 0)     as fiches
      from c group by 1
  ),
  sup_jetons as (
    select support as s, count(distinct visiteur) as visiteurs,
           count(distinct visiteur) filter (where not retenu) as volatils
      from v group by 1
  ),
  supports as (
    select coalesce(g.s, j.s)          as s,
           coalesce(g.visites, 0)      as visites,
           coalesce(j.visiteurs, 0)    as visiteurs,
           coalesce(j.volatils, 0)     as volatils,
           coalesce(g.recherches, 0)   as recherches,
           coalesce(g.itineraires, 0)  as itineraires,
           coalesce(g.fiches, 0)       as fiches
      from sup_gestes g
      full join sup_jetons j on j.s = g.s
  ),
  jours as (
    select j, coalesce(sum(visites), 0) as visites,
              coalesce(sum(visiteurs), 0) as visiteurs
      from (
        select (heure at time zone (select tz from p))::date as j,
               sum(n) filter (where genre = 'visite') as visites,
               null::bigint                           as visiteurs
          from c group by 1
        union all
        -- en jetons distincts : une ligne par porte franchie depuis que le
        -- support entre dans la clé, et le même visiteur en occupe deux
        select jour, null, count(distinct visiteur) from v group by 1
      ) t
     group by j order by j
  )
  select jsonb_build_object(
    'visites',     (select coalesce(sum(n), 0) from c where genre = 'visite'),
    'visiteurs',   (select count(distinct visiteur) from v),
    'visiteurs_volatils', (select count(distinct visiteur) from v where not retenu),
    'recherches',  (select coalesce(sum(n), 0) from c where genre = 'recherche'),
    'itineraires', (select coalesce(sum(n), 0) from c where genre = 'itineraire'),
    /* Les journées organisées se comptaient jusqu'ici parmi les itinéraires,
       faute d'un genre à elles — « organiser », c'est calculer des dizaines de
       trajets, et le pis-aller se lisait dans `_journee.html`. Les séparer fait
       baisser le chiffre du dessus d'autant : c'est la correction d'une
       confusion, non une perte. */
    'journees',    (select coalesce(sum(n), 0) from c where genre = 'journee'),
    'parcours',    (select count(distinct visiteur) from v where parcours),
    'parcours_gestes', (select coalesce(sum(n), 0) from c where genre = 'parcours'),
    /* Le partage, des deux côtés. À gauche le geste d'envoyer — genre à lui,
       parce qu'envoyer sa liste n'est ni l'allonger ni la raccourcir, et le
       compter parmi les ajouts fausserait la ligne d'au-dessus. À droite ce que
       les destinataires en ont repris, qui sont bien des ajouts et restent donc
       comptés avec eux : c'est le canal qui les distingue.

       Les deux ensemble répondent à la seule question qui décide de garder la
       fonction : on partage, mais est-ce que cela arrive à quelqu'un ? */
    'partages', (select coalesce(sum(n), 0) from c where genre = 'partage'),
    'partages_repris', (select coalesce(sum(n), 0) from c
                         where genre = 'parcours' and canal = 'partage'),
    'stands', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_stand'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_stand')),
    'conferences', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_conf'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_conf')),
    'supports', (select coalesce(jsonb_agg(jsonb_build_object(
                   'support',     s,
                   'visites',     visites,
                   'visiteurs',   visiteurs,
                   'volatils',    volatils,
                   'recherches',  recherches,
                   'itineraires', itineraires,
                   'fiches',      fiches)
                   order by visites desc, visiteurs desc, s), '[]'::jsonb)
                   from supports),
    'fuseau', (select tz from p),
    'jours',  (select coalesce(jsonb_agg(jsonb_build_object(
                'j', j, 'visites', visites, 'visiteurs', visiteurs)), '[]'::jsonb)
                from jours),
    'depuis', (select min(heure) from compteur where evenement_id = p_evenement)
  );
$$;

comment on function rapport_utilisation is
  'Le rapport d''utilisation d''un salon sur la période : visites, visiteurs, recherches, itinéraires, journées organisées, parcours, partages, et le détail par jour.';
