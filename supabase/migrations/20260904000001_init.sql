-- Plan interactif — schéma initial
--
-- Deux principes tirés de l'étude de l'API Klipso :
--   · on indexe sur les identifiants Klipso (GUID), jamais sur les libellés.
--     Les noms de calques varient d'un pavillon à l'autre (SECTEURS_DELIMITATION
--     contre SECTEURS_DELIMITATIONS) et changent au gré des ré-exports CAO.
--   · la géométrie est stockée en mètres dans le repère écran (x = x_wkt,
--     y = −y_wkt), la conversion étant faite une seule fois à la synchronisation.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- événements
create table evenement (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  slug          text not null unique,
  instance      text not null,                       -- sous-domaine Klipso
  event_id      uuid,                                -- en-tête X-GAIA-EventId
  rythme_min    integer not null default 60,         -- 0 = manuel
  etat          text not null default 'brouillon'
                check (etat in ('brouillon', 'publie')),
  derniere_sync timestamptz,
  derniere_err  text,
  cree_le       timestamptz not null default now(),
  modifie_le    timestamptz not null default now()
);
comment on column evenement.rythme_min is
  'Intervalle de resynchronisation en minutes ; sans rapport avec la durée de vie du jeton GAIA (15 min).';

-- ------------------------------------------------------------------ pavillons
create table plan (
  id           uuid primary key default gen_random_uuid(),
  evenement_id uuid not null references evenement (id) on delete cascade,
  id_klipso    uuid not null,                        -- Plan.Id
  libelle      text not null,
  hall         text,
  publie       boolean not null default true,
  emprise      jsonb,                                -- {x0,y0,x1,y1} en mètres
  nb_stands    integer,
  nb_zones     integer,
  modifie_le   timestamptz not null default now(),
  unique (evenement_id, id_klipso)
);

-- --------------------------------------------------------- calques d'habillage
create table calque (
  id           uuid primary key default gen_random_uuid(),
  plan_id      uuid not null references plan (id) on delete cascade,
  id_klipso    uuid not null,                        -- Calque.Id : la clé stable
  cle          text not null,                        -- libellé technique Klipso
  libelle      text not null,                        -- intitulé lisible
  type         text,                                 -- Habillage, Stand, ZoneDessin…
  ordre_klipso integer,
  svg          text,                                 -- habillage allégé
  unique (plan_id, id_klipso)
);

-- ------------------------------------------- apparence choisie par l'exploitant
create table apparence (
  plan_id    uuid primary key references plan (id) on delete cascade,
  pile       jsonb not null default '[]'::jsonb,     -- ordre des couches
  reglages   jsonb not null default '{}'::jsonb,     -- couleur / visible / rempli
  modifie_le timestamptz not null default now()
);
comment on column apparence.reglages is
  'Indexé par identifiant de calque, jamais par libellé : un renommage côté Klipso ne doit rien casser.';

-- ------------------------------------------------------- calques de dessin
create table calque_dessin (
  id         uuid primary key default gen_random_uuid(),
  plan_id    uuid not null references plan (id) on delete cascade,
  nom        text not null,
  couleur    text not null default '#2F49D1',
  rempli     boolean not null default false,
  visible    boolean not null default true,
  rang       integer not null default 0,
  formes     jsonb not null default '[]'::jsonb,     -- coordonnées absolues, en mètres
  modifie_le timestamptz not null default now()
);

-- ------------------------------------------------------ instantané de rendu
create table instantane (
  plan_id   uuid primary key references plan (id) on delete cascade,
  charge    jsonb not null,                          -- stands + zones, prêts à tracer
  genere_le timestamptz not null default now()
);
comment on table instantane is
  'Résultat de la synchronisation. La page publique le lit seul : elle reste servie même si Klipso est indisponible.';

create index on plan (evenement_id);
create index on calque (plan_id);
create index on calque_dessin (plan_id, rang);

-- ------------------------------------------------------------------ lecture
-- Le public ne voit que ce qui est explicitement publié.
alter table evenement     enable row level security;
alter table plan          enable row level security;
alter table calque        enable row level security;
alter table apparence     enable row level security;
alter table calque_dessin enable row level security;
alter table instantane    enable row level security;

create policy "lecture publique des événements publiés" on evenement
  for select using (etat = 'publie');

create policy "lecture publique des pavillons publiés" on plan
  for select using (
    publie and exists (
      select 1 from evenement e where e.id = plan.evenement_id and e.etat = 'publie'));

create policy "lecture publique des calques" on calque
  for select using (exists (select 1 from plan p where p.id = calque.plan_id));
create policy "lecture publique de l'apparence" on apparence
  for select using (exists (select 1 from plan p where p.id = apparence.plan_id));
create policy "lecture publique des dessins" on calque_dessin
  for select using (exists (select 1 from plan p where p.id = calque_dessin.plan_id));
create policy "lecture publique des instantanés" on instantane
  for select using (exists (select 1 from plan p where p.id = instantane.plan_id));

-- L'écriture passe par les fonctions serveur (clé de service) ou par un
-- utilisateur authentifié du back-office.
create policy "écriture authentifiée" on evenement     for all to authenticated using (true) with check (true);
create policy "écriture authentifiée" on plan          for all to authenticated using (true) with check (true);
create policy "écriture authentifiée" on calque        for all to authenticated using (true) with check (true);
create policy "écriture authentifiée" on apparence     for all to authenticated using (true) with check (true);
create policy "écriture authentifiée" on calque_dessin for all to authenticated using (true) with check (true);
create policy "écriture authentifiée" on instantane    for all to authenticated using (true) with check (true);
