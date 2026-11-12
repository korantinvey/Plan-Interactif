-- Une clé par base Klipso
--
-- Une seule clé, `KLIPSO_API_KEY`, servait jusqu'ici à toutes les instances :
-- elle se posait une fois pour toutes dans les secrets des fonctions. C'était
-- tenable tant que tous les salons vivaient sous les bases d'un même client
-- Klipso. Dès qu'un salon arrive d'une autre base, avec sa propre clé, il
-- fallait toucher aux secrets du projet — un geste hors de la console, et une
-- seule valeur pour deux clients.
--
-- La base Klipso — l'instance, le sous-domaine `<instance>.svc.calypso-event.net`
-- — devient donc une chose que la console connaît, et chacune porte sa clé.
-- Deux tables, parce que deux lectures n'ont pas le même droit :
--
--   · `public.base_klipso` — la liste, que la console propose à la création
--     d'un salon. Rien de secret : l'administrateur la lit.
--   · `prive.cle_klipso`   — la clé. Personne ne la lit, pas même
--     l'administrateur qui l'a saisie : elle s'écrit par
--     `enregistre_base_klipso`, et seule la synchronisation, sous la clé de
--     service, la relit par `cle_klipso`.
--
-- Le schéma `prive` n'est pas publié par l'API (seul `public` l'est), et la
-- sauvegarde n'emporte que `public` : une clé ne voyage donc jamais dans un
-- artefact GitHub. Après un sinistre, elle se ressaisit, comme un mot de passe.
--
-- Une base sans clé propre garde la clé commune `KLIPSO_API_KEY` : c'est le
-- cas de toutes celles qu'on relève ci-dessous dans les salons existants, qui
-- se synchronisaient avec elle et doivent continuer de le faire.

create schema if not exists prive;
revoke all on schema prive from public, anon, authenticated;

create table base_klipso (
  -- le sous-domaine, tel qu'il entre dans l'adresse de l'API — sans
  -- transformation : il y figure deux fois, et la seconde est un chemin
  instance        text primary key check (instance ~ '^[A-Za-z0-9][A-Za-z0-9-]*$'),
  cree_le         timestamptz not null default now(),
  -- null tant que la base vit sur la clé commune
  cle_modifiee_le timestamptz
);

comment on table base_klipso is
  'Les bases Klipso connues de la console. Leur clé vit dans prive.cle_klipso, que rien ne lit hors de la synchronisation.';
comment on column base_klipso.cle_modifiee_le is
  'Dernière saisie de la clé propre à cette base ; null quand la clé commune KLIPSO_API_KEY sert.';

alter table base_klipso enable row level security;
-- Supabase l'accorde d'office aux tables de `public` ; écrit, il dit que la
-- lecture seule est voulue — l'écriture passe par la fonction plus bas.
revoke all on base_klipso from anon, authenticated;
grant select on base_klipso to authenticated;
-- Créer un salon est le fait de l'administrateur ; choisir sa base aussi. Un
-- organisateur n'a pas à connaître les autres clients Klipso du projet.
create policy "lecture des bases Klipso par l'administrateur" on base_klipso
  for select to authenticated using (est_admin());

create table prive.cle_klipso (
  instance text primary key references public.base_klipso (instance) on delete cascade,
  cle      text not null check (length(cle) > 0)
);
alter table prive.cle_klipso enable row level security;
revoke all on prive.cle_klipso from public, anon, authenticated;

-- Les bases des salons en place, sans clé propre : la liste de la console
-- n'est pas vide le premier jour, et rien ne change pour leur synchronisation.
insert into base_klipso (instance)
select distinct trim(instance) from evenement
where trim(instance) ~ '^[A-Za-z0-9][A-Za-z0-9-]*$' and trim(instance) <> 'demo'
on conflict do nothing;

/*
 * Ajoute une base, ou remplace la clé d'une base connue — le même geste : une
 * clé qui change chez Klipso se ressaisit sous la même instance.
 *
 * `security definer` parce que l'appelant n'a aucun droit sur `prive`, et ne
 * doit pas en avoir : la clé entre, elle ne ressort pas. La fonction ne rend
 * que la ligne publique.
 */
create or replace function enregistre_base_klipso(p_instance text, p_cle text)
returns base_klipso
language plpgsql security definer set search_path = public as $$
declare
  i text := trim(coalesce(p_instance, ''));
  c text := trim(coalesce(p_cle, ''));
  ligne base_klipso;
begin
  if not est_admin() then
    raise exception 'Seul un administrateur enregistre une base Klipso.' using errcode = '42501';
  end if;
  if i !~ '^[A-Za-z0-9][A-Za-z0-9-]*$' then
    raise exception 'Instance Klipso invalide : le sous-domaine seul, lettres, chiffres et tirets.';
  end if;
  if c = '' then
    raise exception 'La clé de la base Klipso est vide.';
  end if;
  insert into base_klipso (instance, cle_modifiee_le) values (i, now())
  on conflict (instance) do update set cle_modifiee_le = now()
  returning * into ligne;
  insert into prive.cle_klipso (instance, cle) values (i, c)
  on conflict (instance) do update set cle = excluded.cle;
  return ligne;
end $$;

revoke all on function enregistre_base_klipso(text, text) from public, anon;
grant execute on function enregistre_base_klipso(text, text) to authenticated;

/* La clé d'une base, pour la seule synchronisation. Null quand la base n'a pas
   de clé propre : la fonction retombe alors sur la clé commune. */
create or replace function cle_klipso(p_instance text) returns text
language sql stable security definer set search_path = public as $$
  select cle from prive.cle_klipso where instance = trim(p_instance);
$$;

revoke all on function cle_klipso(text) from public, anon, authenticated;
grant execute on function cle_klipso(text) to service_role;
