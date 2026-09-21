-- L'audience d'un stand, lue d'un coup — de quoi peindre le plan
--
-- Le rapport dit combien de fiches ont été ouvertes ; il ne dit pas
-- lesquelles. C'est pourtant l'autre moitié de la question, et la seule que
-- l'organisateur reporte sur son plan de l'an prochain : quel emplacement a
-- retenu, quelle travée personne n'a regardée. Les compteurs le savent depuis
-- `20260908000001_compteurs.sql` — `compteur_cible` retient une ligne par
-- (stand, jour, canal) — mais rien ne le lisait encore.
--
-- On agrège ici plutôt que dans la page : neuf cents stands, quatre jours et
-- neuf canaux font jusqu'à trente mille lignes pour un salon, quand la page
-- n'a besoin que d'un nombre par stand. La forme est celle de
-- `rapport_utilisation` — tout le nécessaire en un objet, un aller-retour.
--
-- « security invoker », comme partout ici : ce sont les politiques de
-- `compteur_cible` et de `cible` qui tranchent, donc `acces_salon()`. La
-- fréquentation d'un salon reste une donnée d'exploitation, et cette fonction
-- n'y ouvre aucune porte de plus.

create or replace function audience_cibles(
  p_evenement uuid,
  -- les N derniers jours, comptés dans le fuseau du salon ; nul pour tout
  p_jours     integer default null,
  p_genre     text    default 'fiche_stand'
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with zone as (
    -- Le découpage par jour est celui des compteurs : dans le fuseau du salon,
    -- sinon les deux premières heures d'une soirée parisienne tomberaient la
    -- veille. Un fuseau inconnu ferait échouer la conversion : on retombe sur
    -- UTC, comme ailleurs.
    select coalesce(
      (select e.fuseau from evenement e
        where e.id = p_evenement
          and e.fuseau in (select name from pg_timezone_names)),
      'UTC') as tz
  ),
  bornes as (
    select case
             when p_jours is null then null
             else (now() at time zone (select tz from zone))::date
                  - (greatest(p_jours, 1) - 1)
           end as depuis
  ),
  somme as (
    select cc.cible, sum(cc.n)::bigint as n
      from compteur_cible cc
     where cc.evenement_id = p_evenement
       -- le vocabulaire reste clos : un genre inventé ne rend rien plutôt que
       -- de faire croire à un salon sans audience
       and p_genre in ('fiche_stand', 'fiche_conf')
       and cc.genre = p_genre
       and ((select depuis from bornes) is null
            or cc.jour >= (select depuis from bornes))
     group by 1
  )
  select jsonb_build_object(
    'genre',  p_genre,
    'jours',  p_jours,
    'fuseau', (select tz from zone),
    'debut',  (select depuis from bornes),
    'total',  (select coalesce(sum(n), 0) from somme),
    /* De quand date le comptage par objet, toutes périodes confondues. Sans
       lui, une page ne sait pas distinguer « personne n'a ouvert de fiche » de
       « on ne comptait pas encore les fiches » — et le journal qui a précédé
       les compteurs ne retenait pas leur objet, si bien que ce jour-là est
       postérieur au premier visiteur mesuré. */
    'depuis', (select min(jour) from compteur_cible
                where evenement_id = p_evenement and genre = p_genre),
    /* Les libellés viennent de `cible`, écrite par la synchronisation : un
       identifiant seul — « s2e90eb0d : 240 » — n'intéresse personne. En
       jointure externe, car une cible retirée du salon depuis garde ses
       consultations, et les taire fausserait le total qu'on affiche. */
    'cibles', (select coalesce(jsonb_agg(jsonb_build_object(
                 'id', s.cible, 'code', c.code, 'nom', c.nom, 'n', s.n)
                 order by s.n desc, c.code nulls last), '[]'::jsonb)
                 from somme s
                 left join cible c
                        on c.evenement_id = p_evenement
                       and c.genre = p_genre
                       and c.id = s.cible)
  );
$$;

comment on function audience_cibles is
  'Les consultations par stand (ou par conférence) d''un salon sur les N derniers jours. Rend tout en un objet, libellés compris.';

revoke all on function audience_cibles(uuid, integer, text) from public;
grant execute on function audience_cibles(uuid, integer, text) to authenticated;
