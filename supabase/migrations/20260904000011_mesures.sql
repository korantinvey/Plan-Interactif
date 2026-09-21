-- Reporting d'utilisation
--
-- Le plan était jusqu'ici une boîte noire : on savait combien d'exposants il
-- portait, jamais s'il servait. L'organisateur qui paie le salon demande le
-- contraire — combien de visiteurs, combien de recherches, quelles fiches
-- ouvertes, et par quel chemin on y arrive.
--
-- Une ligne par geste, agrégée à la lecture. Le volume reste modeste : un
-- visiteur de salon produit quelques dizaines de gestes, un salon de dix mille
-- visiteurs quelques centaines de milliers de lignes — rien pour Postgres, et
-- le détail permet de rejouer un découpage qu'on n'avait pas prévu.
--
-- Ce qui n'est pas enregistré compte autant : ni adresse IP, ni agent
-- utilisateur, ni identité. « visiteur » est un jeton aléatoire tiré par le
-- navigateur et rangé chez lui, propre à cet événement — il ne suit personne
-- d'un salon à l'autre, encore moins d'un site à l'autre. « session » distingue
-- deux venues du même navigateur. Ni l'un ni l'autre ne désigne quelqu'un.

create table mesure (
  id           bigint generated always as identity primary key,
  evenement_id uuid not null references evenement (id) on delete cascade,
  -- le geste ; la liste est close, et c'est elle qui protège la table des
  -- écritures fantaisistes autant que la fonction qui les reçoit
  genre        text not null check (genre in (
                 'visite', 'recherche', 'itineraire', 'parcours',
                 'fiche_stand', 'fiche_conf')),
  -- par où l'on est arrivé : renseigné pour les fiches, nul ailleurs
  canal        text,
  visiteur     text not null,
  session      text not null,
  cree_le      timestamptz not null default now()
);

comment on table mesure is
  'Un geste de visiteur, sans identité ni adresse. Agrégée par rapport_utilisation().';
comment on column mesure.visiteur is
  'Jeton aléatoire tiré par le navigateur, propre à cet événement. Ne désigne personne et ne suit rien d''autre.';
comment on column mesure.canal is
  'Chemin d''ouverture d''une fiche : recherche, liste, plan, image, conference, salle, exposant, parcours, lien.';

-- Toutes les lectures partent d'un événement et d'une période, dans cet ordre.
create index on mesure (evenement_id, cree_le desc);
-- Compter les visiteurs uniques balaie la période entière : l'index qui porte
-- déjà le jeton évite d'aller chercher la table pour chaque ligne.
create index on mesure (evenement_id, genre, visiteur);

alter table mesure enable row level security;

-- Aucune politique d'écriture : elle passe par la fonction `mesure`, qui tient
-- la clé de service et vérifie ce qu'on lui donne. Une table ouverte en
-- écriture au public serait un formulaire de spam.
create policy "lecture authentifiée des mesures" on mesure
  for select to authenticated using (true);

-- ------------------------------------------------------------------ rapport
/*
 * Tout le rapport en un aller-retour.
 *
 * La console pourrait compter elle-même, mais il lui faudrait rapatrier les
 * lignes — des centaines de milliers pour un salon qui marche. On agrège ici,
 * et il ne repart que deux douzaines de nombres.
 *
 * « security invoker » : c'est la politique de la table qui tranche, comme
 * partout ailleurs dans ce schéma. Un visiteur non authentifié appelant cette
 * fonction ne verrait aucune ligne, donc aucun chiffre.
 */
create or replace function rapport_utilisation(
  p_evenement uuid,
  p_debut     timestamptz default null,
  p_fin       timestamptz default null
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with zone as (
    -- Le découpage par jour se fait dans le fuseau du salon : sinon les deux
    -- premières heures d'une soirée parisienne tomberaient la veille. Un
    -- fuseau inconnu ferait échouer la conversion : on retombe sur UTC.
    select coalesce(
      (select e.fuseau from evenement e
        where e.id = p_evenement
          and e.fuseau in (select name from pg_timezone_names)),
      'UTC') as tz
  ),
  m as (
    select genre, canal, visiteur, session, cree_le
      from mesure
     where evenement_id = p_evenement
       and (p_debut is null or cree_le >= p_debut)
       and (p_fin   is null or cree_le <  p_fin)
  ),
  fiches as (
    select genre, coalesce(nullif(canal, ''), 'autre') as canal, count(*) as n
      from m where genre in ('fiche_stand', 'fiche_conf')
     group by 1, 2
  ),
  jours as (
    select (cree_le at time zone (select tz from zone))::date as j,
           count(*) filter (where genre = 'visite')        as visites,
           count(distinct visiteur)                        as visiteurs
      from m group by 1 order by 1
  )
  select jsonb_build_object(
    'visites',     (select count(*) from m where genre = 'visite'),
    'visiteurs',   (select count(distinct visiteur) from m),
    'recherches',  (select count(*) from m where genre = 'recherche'),
    'itineraires', (select count(*) from m where genre = 'itineraire'),
    -- « combien de programmes de visite » se compte en visiteurs qui en ont
    -- composé un, pas en gestes : un programme appartient à quelqu'un
    'parcours',    (select count(distinct visiteur) from m where genre = 'parcours'),
    'parcours_gestes', (select count(*) from m where genre = 'parcours'),
    'stands', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_stand'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_stand')),
    'conferences', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_conf'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_conf')),
    'fuseau', (select tz from zone),
    'jours', (select coalesce(jsonb_agg(jsonb_build_object(
                'j', j, 'visites', visites, 'visiteurs', visiteurs)), '[]'::jsonb)
                from jours),
    -- de quand date la première mesure : sans elle, une console ne sait pas
    -- distinguer « personne n'est venu » de « la mesure n'existait pas encore »
    'depuis', (select min(cree_le) from mesure where evenement_id = p_evenement)
  );
$$;

comment on function rapport_utilisation is
  'Compte les gestes d''un événement sur une période. Renvoie tout le rapport en un objet.';

revoke all on function rapport_utilisation(uuid, timestamptz, timestamptz) from public;
grant execute on function rapport_utilisation(uuid, timestamptz, timestamptz) to authenticated;
