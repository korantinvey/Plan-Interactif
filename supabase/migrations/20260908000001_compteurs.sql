-- Mesure d'utilisation : des compteurs plutôt qu'un journal
--
-- La table `mesure` gardait une ligne par geste. Le compte était juste, mais le
-- volume suivait la fréquentation : un salon de cinq mille visiteurs sur quatre
-- jours écrivait un demi-million de lignes — cent trente mégaoctets, index
-- compris — et rien ne les effaçait jamais. Le jour où le disque est plein, le
-- projet passe en lecture seule : le plan continue d'être servi, mais la
-- console ne peut plus rien écrire, et on le découvre en essayant de
-- synchroniser un salon la veille de son ouverture.
--
-- Un compteur ne grossit pas avec le trafic : il grossit avec le produit de ses
-- dimensions. Le nombre de stands est un plafond fixe, que cinq cents ou
-- cinquante mille personnes viennent. Le même salon tient désormais en quelques
-- milliers de lignes, et cesse de croître quand la fréquentation double.
--
-- Ce que le journal permettait et que le compteur ne permet plus : croiser deux
-- genres sur un même visiteur — « ceux qui calculent un itinéraire ouvrent-ils
-- plus de fiches ». Aucun chiffre du rapport ne posait cette question.
--
-- Ce que le journal ne permettait pas et que le compteur permet : dire **quel**
-- stand a été consulté. Il ne retenait que le genre du geste, jamais son objet.

-- ------------------------------------------------------------------- cibles
/*
 * Ce qu'un geste peut désigner : un stand, une conférence.
 *
 * Deux rôles, et c'est ce qui justifie une table plutôt qu'un simple texte
 * libre dans le compteur.
 *
 * Elle porte les libellés. Un rapport qui affiche « s2e90eb0d : 240 »
 * n'intéresse personne ; il faut « L27 — AIRBNB ». Les aller chercher dans
 * `instantane.charge` à chaque affichage serait pénible, et la charge pèse
 * plusieurs centaines de kilo-octets.
 *
 * Elle ferme le vocabulaire. C'est le principe tenu partout ici : ce qui ne
 * s'énumère pas est écarté, jamais enregistré sous un nom approximatif. Une
 * cible en texte libre le romprait — n'importe qui pourrait poster des
 * identifiants inventés et faire grossir à volonté ce qu'on garde pour
 * toujours. La clé étrangère du compteur le rend impossible.
 *
 * L'identifiant est celui que la synchronisation donne au stand — les huit
 * premiers caractères du GUID Klipso — et non son numéro : sur SMCL, 243
 * stands n'en portent aucun et 84 numéros sont partagés par deux stands.
 */
create table cible (
  evenement_id uuid not null references evenement (id) on delete cascade,
  genre        text not null check (genre in ('fiche_stand', 'fiche_conf')),
  id           text not null,
  code         text,                                  -- le numéro de stand, s'il en a un
  nom          text,
  modifie_le   timestamptz not null default now(),
  primary key (evenement_id, genre, id)
);

comment on table cible is
  'Les objets qu''un geste peut désigner. Écrite par la synchronisation ; donne leurs libellés au rapport et ferme le vocabulaire des compteurs.';

-- --------------------------------------------------------------- compteurs
/*
 * Deux tables, parce que les deux questions n'ont pas la même granularité.
 *
 * Croiser l'objet et l'heure reconstruirait le problème qu'on fuit :
 * 931 stands × 9 canaux × 48 heures, c'est quatre cent mille lignes possibles
 * pour un seul salon. La fréquentation se lit donc à l'heure et sans objet ;
 * l'audience d'un objet se lit au jour.
 */
create table compteur (
  evenement_id uuid not null references evenement (id) on delete cascade,
  -- tronquée à l'heure : assez fin pour dire quand on vient, assez large pour
  -- que le nombre de lignes reste borné par les heures d'ouverture
  heure        timestamptz not null,
  genre        text not null check (genre in (
                 'visite', 'recherche', 'itineraire', 'parcours',
                 'fiche_stand', 'fiche_conf')),
  -- '' plutôt que null : c'est une colonne de clé primaire, et null n'y
  -- distinguerait pas deux lignes
  canal        text not null default '',
  n            integer not null default 0,
  primary key (evenement_id, heure, genre, canal)
);

comment on table compteur is
  'La fréquentation, à l''heure et sans objet. Une ligne par (événement, heure, genre, canal).';

/*
 * L'audience d'un stand ou d'une conférence.
 *
 * L'ordre des colonnes de la clé n'est pas indifférent : `cible` avant `jour`
 * fait de « l'historique d'un stand » un balayage contigu, et du palmarès d'un
 * salon un parcours de préfixe.
 *
 * Ce qu'on y lit, ce sont des consultations, pas des visiteurs uniques : compter
 * les seconds demanderait de retenir les paires (stand, visiteur), soit
 * exactement le volume qu'on vient de supprimer. C'est aussi le nombre que
 * l'exposant comprend.
 */
create table compteur_cible (
  evenement_id uuid not null references evenement (id) on delete cascade,
  genre        text not null check (genre in ('fiche_stand', 'fiche_conf')),
  cible        text not null,
  jour         date not null,                         -- dans le fuseau du salon
  canal        text not null default '',
  n            integer not null default 0,
  primary key (evenement_id, genre, cible, jour, canal),
  foreign key (evenement_id, genre, cible)
    references cible (evenement_id, genre, id) on delete cascade
);

comment on table compteur_cible is
  'Les consultations d''un stand ou d''une conférence, au jour. Pas des visiteurs uniques : les compter coûterait le volume qu''on a supprimé.';

-- --------------------------------------------------------- visiteurs uniques
/*
 * Le seul chiffre qu'un compteur ne sait pas produire.
 *
 * « Combien de visiteurs » n'est pas une somme, c'est un cardinal : il faut
 * avoir vu les jetons. Mais il ne faut pas avoir gardé les gestes — une ligne
 * par (visiteur, jour) au lieu de vingt-sept par visiteur, soit un vingtième du
 * volume, et le décompte reste exact, en tout comme par jour.
 *
 * Le jeton ne désigne toujours personne : tiré au hasard par le navigateur,
 * propre à cet événement, sans adresse ni agent utilisateur à côté.
 */
create table visiteur_jour (
  evenement_id uuid not null references evenement (id) on delete cascade,
  jour         date not null,                         -- dans le fuseau du salon
  visiteur     text not null,
  -- « combien de programmes de visite » se compte en visiteurs qui en ont
  -- composé un : le drapeau porte ici ce qu'un compteur ne saurait dire
  parcours     boolean not null default false,
  primary key (evenement_id, jour, visiteur)
);

comment on table visiteur_jour is
  'Un jeton de visiteur vu tel jour. Le strict nécessaire pour un décompte unique exact, sans garder les gestes.';
comment on column visiteur_jour.visiteur is
  'Jeton aléatoire tiré par le navigateur, propre à cet événement. Ne désigne personne et ne suit rien d''autre.';

-- ------------------------------------------------------------------ lecture
alter table cible          enable row level security;
alter table compteur       enable row level security;
alter table compteur_cible enable row level security;
alter table visiteur_jour  enable row level security;

-- Aucune politique d'écriture : elle passe par `enregistre_mesures` et par la
-- synchronisation, qui tiennent la clé de service. Une table de compteurs
-- ouverte au public serait un formulaire de spam, et cette fois le spam
-- resterait.
create policy "lecture authentifiée des cibles" on cible
  for select to authenticated using (true);
create policy "lecture authentifiée des compteurs" on compteur
  for select to authenticated using (true);
create policy "lecture authentifiée des compteurs par cible" on compteur_cible
  for select to authenticated using (true);
create policy "lecture authentifiée des visiteurs" on visiteur_jour
  for select to authenticated using (true);

-- ----------------------------------------------------------------- écriture
/*
 * Un paquet de gestes, en un aller-retour.
 *
 * La fonction serveur faisait deux appels — retrouver l'événement, puis écrire.
 * Un compteur en demanderait quatre. Tout se fait donc ici, dans une seule
 * transaction : l'événement est résolu, le vocabulaire filtré, les trois tables
 * incrémentées ensemble ou pas du tout.
 *
 * Le vocabulaire n'est plus énuméré qu'ici et dans les contraintes des tables.
 * Ce qui ne s'y range pas est écarté sans bruit : mieux vaut un compteur qui
 * manque une ligne qu'une colonne où l'on ne sait plus ce qu'on lit.
 *
 * Rend faux si l'événement n'existe pas ou n'est pas publié — un brouillon n'a
 * pas de visiteurs, ce qu'on mesurerait serait l'exploitant qui le prépare.
 */
create or replace function enregistre_mesures(
  p_slug     text,
  p_visiteur text,
  p_gestes   jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  GENRES constant text[] := array[
    'visite', 'recherche', 'itineraire', 'parcours', 'fiche_stand', 'fiche_conf'];
  CANAUX constant text[] := array[
    'recherche', 'liste', 'plan', 'image', 'conference', 'salle', 'exposant',
    'parcours', 'lien'];
  v_evt    uuid;
  v_tz     text;
  v_jour   date;
  v_gestes jsonb;
begin
  select e.id, e.fuseau into v_evt, v_tz
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- Le jour se date dans le fuseau du salon : sinon les deux premières heures
  -- d'une soirée parisienne tomberaient la veille. Un fuseau inconnu ferait
  -- échouer la conversion : on retombe sur UTC.
  if v_tz is null or not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;
  v_jour := (now() at time zone v_tz)::date;

  /* On nettoie une fois, on compte trois fois.

     Un genre hors liste emporte son geste : on ne sait pas ce qu'on compterait.
     Un canal hors liste, non — le geste a bien eu lieu, seule sa provenance
     est illisible, et la perdre fausserait le total d'une fiche ouverte pour
     de bon. Il rejoint les sans-canal, que le rapport nomme « autre ». */
  select coalesce(jsonb_agg(jsonb_build_object(
           'genre', genre,
           'canal', case when canal = any(CANAUX) then canal else '' end,
           'cible', cible)), '[]'::jsonb)
    into v_gestes
    from (
      select x->>'genre'               as genre,
             coalesce(x->>'canal', '') as canal,
             coalesce(x->>'cible', '') as cible
        from jsonb_array_elements(p_gestes) x
    ) t
   where genre = any(GENRES);

  -- un paquet vidé par les filtres n'est pas une erreur, et ne fait pas de son
  -- porteur un visiteur de plus
  if jsonb_array_length(v_gestes) = 0 then return true; end if;

  insert into compteur (evenement_id, heure, genre, canal, n)
  select v_evt, date_trunc('hour', now()), x->>'genre', x->>'canal', count(*)
    from jsonb_array_elements(v_gestes) x
   group by 1, 2, 3, 4
      on conflict (evenement_id, heure, genre, canal)
      do update set n = compteur.n + excluded.n;

  -- Une cible inconnue est écartée plutôt que de faire échouer le paquet
  -- entier : la clé étrangère ne sert plus que de garde-fou.
  insert into compteur_cible (evenement_id, genre, cible, jour, canal, n)
  select v_evt, x->>'genre', x->>'cible', v_jour, x->>'canal', count(*)
    from jsonb_array_elements(v_gestes) x
   where x->>'genre' in ('fiche_stand', 'fiche_conf')
     and x->>'cible' <> ''
     and exists (select 1 from cible c
                  where c.evenement_id = v_evt
                    and c.genre = x->>'genre'
                    and c.id = x->>'cible')
   group by 1, 2, 3, 4, 5
      on conflict (evenement_id, genre, cible, jour, canal)
      do update set n = compteur_cible.n + excluded.n;

  insert into visiteur_jour (evenement_id, jour, visiteur, parcours)
  values (v_evt, v_jour, p_visiteur,
          exists (select 1 from jsonb_array_elements(v_gestes) x
                   where x->>'genre' = 'parcours'))
      on conflict (evenement_id, jour, visiteur)
      do update set parcours = visiteur_jour.parcours or excluded.parcours;

  return true;
end;
$$;

comment on function enregistre_mesures is
  'Applique un paquet de gestes aux compteurs, en une transaction. Rend faux si l''événement n''est pas publié.';

revoke all on function enregistre_mesures(text, text, jsonb) from public;
grant execute on function enregistre_mesures(text, text, jsonb) to service_role;

-- ------------------------------------------------------------------ rapport
/*
 * Le rapport, désormais lu dans les compteurs.
 *
 * La forme de l'objet rendu ne change pas d'une clé : la page du rapport n'a
 * rien à savoir de ce remplacement.
 *
 * Deux nuances tenues par cette réécriture. Les canaux se lisent dans
 * `compteur` et non dans `compteur_cible` : le premier est daté à l'heure, donc
 * une période qui ne commence pas à minuit se découpe juste. Et `depuis` est
 * désormais tronqué à l'heure — il ne sert qu'à distinguer « personne n'est
 * venu » de « la mesure n'existait pas encore », ce qu'une heure dit aussi bien.
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
    select coalesce(
      (select e.fuseau from evenement e
        where e.id = p_evenement
          and e.fuseau in (select name from pg_timezone_names)),
      'UTC') as tz
  ),
  c as (
    select genre, canal, heure, n
      from compteur
     where evenement_id = p_evenement
       and (p_debut is null or heure >= p_debut)
       and (p_fin   is null or heure <  p_fin)
  ),
  -- les jetons se datent au jour : la période s'y ramène par le fuseau du salon
  v as (
    select jour, visiteur, parcours
      from visiteur_jour
     where evenement_id = p_evenement
       and (p_debut is null or jour >= (p_debut at time zone (select tz from zone))::date)
       and (p_fin   is null or jour <  (p_fin   at time zone (select tz from zone))::date)
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
        select (heure at time zone (select tz from zone))::date as j,
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
    'fuseau', (select tz from zone),
    'jours', (select coalesce(jsonb_agg(jsonb_build_object(
                'j', j, 'visites', visites, 'visiteurs', visiteurs)), '[]'::jsonb)
                from jours),
    'depuis', (select min(heure) from compteur where evenement_id = p_evenement)
  );
$$;

-- ------------------------------------------------------- reprise du journal
/*
 * L'historique déjà écrit rejoint les compteurs, une seule fois.
 *
 * Une reprise qui incrémente n'est pas rejouable : la garde sur les compteurs
 * vides est ce qui permet de rejouer la migration sans compter deux fois.
 * Les anciennes lignes n'ont pas de cible — le journal ne retenait pas l'objet
 * du geste — donc `compteur_cible` ne reçoit rien d'elles, et c'est normal.
 */
do $$
begin
  if exists (select 1 from mesure limit 1)
     and not exists (select 1 from compteur limit 1) then

    insert into compteur (evenement_id, heure, genre, canal, n)
    select evenement_id, date_trunc('hour', cree_le), genre, coalesce(canal, ''), count(*)
      from mesure group by 1, 2, 3, 4;

    insert into visiteur_jour (evenement_id, jour, visiteur, parcours)
    select m.evenement_id,
           (m.cree_le at time zone coalesce(
              (select e.fuseau from evenement e
                where e.id = m.evenement_id
                  and e.fuseau in (select name from pg_timezone_names)),
              'UTC'))::date,
           m.visiteur,
           bool_or(m.genre = 'parcours')
      from mesure m group by 1, 2, 3;
  end if;
end $$;

comment on table mesure is
  'Journal des gestes, remplacé par les compteurs. Plus rien n''y écrit ; il ne reste que pour l''historique déjà repris, et une migration ultérieure pourra le supprimer.';
