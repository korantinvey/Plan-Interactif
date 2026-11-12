-- Une seule définition de « les N derniers jours »
--
-- Le rapport et la carte de chaleur découpaient la même période de deux façons.
-- Le premier recevait un instant, calculé par la page à minuit **chez le
-- lecteur** ; la seconde comptait N jours **dans le fuseau du salon**. Un
-- organisateur qui lit son salon de Paris depuis Montréal voyait donc « 110
-- ouvertures » en haut de page et une autre somme dans la colonne du classeur,
-- sans que rien n'explique l'écart. Le même salon, la même question, deux
-- réponses.
--
-- Trois choses en sortent :
--
--   · la période ne se dit plus qu'en nombre de jours. C'est la seule forme que
--     l'écran propose — sept, trente, quatre-vingt-dix, tout — et personne n'a
--     jamais saisi deux dates. Les bornes en `timestamptz` disparaissent avec
--     la tentation de les calculer côté page ;
--   · elle se compte dans le fuseau du salon, jamais dans celui du lecteur.
--     C'est le fuseau où le salon a ouvert ses portes, et le seul qui fasse
--     tomber un « jour » au bon endroit ;
--   · la règle vit dans `periode_salon`, et nulle part ailleurs. Recopiée dans
--     deux fonctions, elle aurait redivergé au premier ajustement — c'est
--     exactement ce qui vient d'arriver.

-- ------------------------------------------------------------- la période
/*
 * Le fuseau du salon, et ce que « les N derniers jours » y désigne.
 *
 * Rend les trois formes dont les appelants ont besoin, parce qu'elles ne se
 * déduisent pas l'une de l'autre sans reprendre le fuseau :
 *
 *   tz      le fuseau retenu, pour dater les heures au jour
 *   depuis  le premier jour compté — ce que comparent les tables datées au jour
 *   debut   le même, en instant : minuit local de ce jour-là, ce que comparent
 *           les tables datées à l'heure. La comparaison reste alors sur la
 *           colonne nue, donc indexable, là où « heure at time zone tz » aurait
 *           forcé à tout relire.
 *
 * Nul partout si `p_jours` est nul : c'est « depuis le début », et un appelant
 * n'a qu'à ne rien filtrer.
 */
create or replace function periode_salon(
  p_evenement uuid,
  p_jours     integer default null
) returns table (tz text, depuis date, debut timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  -- Un fuseau inconnu ferait échouer la conversion : on retombe sur UTC, comme
  -- partout ici.
  with z as (
    select coalesce(
      (select e.fuseau from evenement e
        where e.id = p_evenement
          and e.fuseau in (select name from pg_timezone_names)),
      'UTC') as tz
  ),
  d as (
    select z.tz,
           case
             when p_jours is null then null
             else (now() at time zone z.tz)::date - (greatest(p_jours, 1) - 1)
           end as depuis
      from z
  )
  select d.tz, d.depuis, (d.depuis::timestamp at time zone d.tz) from d;
$$;

comment on function periode_salon is
  'Le fuseau du salon et les bornes des N derniers jours : le jour de départ, et l''instant qui lui correspond. Seule définition de la période.';

revoke all on function periode_salon(uuid, integer) from public;
grant execute on function periode_salon(uuid, integer) to authenticated;

-- --------------------------------------------------------------- rapport
/*
 * Le rapport, sur la période du salon.
 *
 * La forme rendue ne change pas d'une clé — la page n'a rien à savoir de ce
 * remplacement. Seules les bornes bougent, et avec elles les chiffres d'un
 * lecteur qui n'habite pas le fuseau de son salon.
 *
 * L'ancienne signature est retirée plutôt que laissée à côté : deux façons de
 * nommer la même période, c'est la situation dont on sort.
 */
drop function if exists rapport_utilisation(uuid, timestamptz, timestamptz);

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
    select genre, canal, heure, n
      from compteur
     where evenement_id = p_evenement
       -- l'instant, et non le jour reconstruit : la colonne reste comparable
       -- telle quelle, et une période qui ne commence pas à minuit n'existe
       -- plus depuis que la borne vient d'ici
       and ((select debut from p) is null or heure >= (select debut from p))
  ),
  v as (
    select jour, visiteur, parcours
      from visiteur_jour
     where evenement_id = p_evenement
       and ((select depuis from p) is null or jour >= (select depuis from p))
  ),
  fiches as (
    select genre, case when canal = '' then 'autre' else canal end as canal, sum(n) as n
      from c where genre in ('fiche_stand', 'fiche_conf')
     group by 1, 2
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
        select jour, null, count(*) from v group by 1
      ) t
     group by j order by j
  )
  select jsonb_build_object(
    'visites',     (select coalesce(sum(n), 0) from c where genre = 'visite'),
    'visiteurs',   (select count(distinct visiteur) from v),
    'recherches',  (select coalesce(sum(n), 0) from c where genre = 'recherche'),
    'itineraires', (select coalesce(sum(n), 0) from c where genre = 'itineraire'),
    'parcours',    (select count(distinct visiteur) from v where parcours),
    'parcours_gestes', (select coalesce(sum(n), 0) from c where genre = 'parcours'),
    'stands', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_stand'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_stand')),
    'conferences', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_conf'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_conf')),
    'fuseau', (select tz from p),
    'jours',  (select coalesce(jsonb_agg(jsonb_build_object(
                'j', j, 'visites', visites, 'visiteurs', visiteurs)), '[]'::jsonb)
                from jours),
    'depuis', (select min(heure) from compteur where evenement_id = p_evenement)
  );
$$;

comment on function rapport_utilisation is
  'Les chiffres d''usage d''un salon sur les N derniers jours, comptés dans son fuseau. Rend tout en un objet.';

revoke all on function rapport_utilisation(uuid, integer) from public;
grant execute on function rapport_utilisation(uuid, integer) to authenticated;

-- ------------------------------------------------------------- l'audience
/*
 * `audience_cibles` portait sa propre copie du calcul de période. Elle passe
 * par la fonction commune : c'est le seul moyen que « trente jours » veuille
 * dire la même chose dans le rapport, sur la carte de chaleur et dans le
 * classeur — non par surveillance, mais par construction.
 *
 * Rien d'autre ne bouge : mêmes paramètres, même objet rendu.
 */
create or replace function audience_cibles(
  p_evenement uuid,
  p_jours     integer default null,
  p_genre     text    default 'fiche_stand',
  -- toutes les cibles et tout leur détail : ce que le tableur demande
  p_complet   boolean default false
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with p as (select * from periode_salon(p_evenement, p_jours)),
  /* Un seul balayage de la période, tous gestes confondus. Le filtre porte sur
     `objet` et non sur `genre` : c'est lui qui dit de quoi on parle depuis que
     les deux sont séparés, et pour une fiche ouverte les deux se valent. */
  lues as (
    select cc.genre, cc.cible, cc.canal, cc.n
      from compteur_cible cc
     where cc.evenement_id = p_evenement
       -- le vocabulaire reste clos : un genre inventé ne rend rien plutôt que
       -- de faire croire à un salon sans audience
       and p_genre in ('fiche_stand', 'fiche_conf')
       and cc.objet = p_genre
       and ((select depuis from p) is null or cc.jour >= (select depuis from p))
  ),
  somme as (
    select cible, sum(n)::bigint as n from lues where genre = p_genre group by 1
  ),
  canaux as (
    select cible, jsonb_object_agg(canal, n) as par
      from (select cible, case when canal = '' then 'autre' else canal end as canal,
                   sum(n)::bigint as n
              from lues where genre = p_genre group by 1, 2) t
     group by cible
  ),
  itis  as (select cible, sum(n)::bigint as n from lues where genre = 'itineraire' group by 1),
  parcs as (select cible, sum(n)::bigint as n from lues where genre = 'parcours'   group by 1),
  /*
   * Les deux côtés comptent, d'où la jointure pleine.
   *
   * À gauche, une cible retirée du salon depuis garde ses consultations : les
   * taire fausserait le total qu'on affiche. À droite, un stand que personne
   * n'a ouvert n'a aucune ligne de compteur — et c'est précisément celui que
   * le tableur doit montrer.
   */
  base as (
    select coalesce(s.cible, c.id) as id, c.code, c.nom, coalesce(s.n, 0) as n
      from somme s
      full join (select id, code, nom from cible
                  where evenement_id = p_evenement and genre = p_genre) c
        on c.id = s.cible
     where p_complet or s.cible is not null
  )
  select jsonb_build_object(
    'genre',   p_genre,
    'jours',   p_jours,
    'complet', p_complet,
    'fuseau',  (select tz from p),
    'debut',   (select depuis from p),
    'total',   (select coalesce(sum(n), 0) from somme),
    /* De quand date le comptage par objet, toutes périodes confondues. Sans
       lui, une page ne sait pas distinguer « personne n'a ouvert de fiche » de
       « on ne comptait pas encore les fiches » — et le journal qui a précédé
       les compteurs ne retenait pas leur objet, si bien que ce jour-là est
       postérieur au premier visiteur mesuré. */
    'depuis', (select min(jour) from compteur_cible
                where evenement_id = p_evenement and genre = p_genre),
    'cibles', (select coalesce(jsonb_agg(
                 case when p_complet then jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n,
                        'canaux',      coalesce(k.par, '{}'::jsonb),
                        'itineraires', coalesce(i.n, 0),
                        'parcours',    coalesce(p2.n, 0))
                      else jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n)
                 end
                 order by b.n desc, b.code nulls last), '[]'::jsonb)
                 from base b
                 left join canaux k  on k.cible  = b.id
                 left join itis   i  on i.cible  = b.id
                 left join parcs  p2 on p2.cible = b.id)
  );
$$;
