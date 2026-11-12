-- Nom et prénom, séparés
--
-- `profil.nom` portait l'identité entière, ce qui suffisait tant que la console
-- n'en faisait qu'un titre. Un annuaire, lui, se trie et se lit par nom de
-- famille, tandis que le prénom sert à s'adresser à la personne : ce sont deux
-- champs, et les tenir en un seul obligerait à deviner où couper.
--
-- Rien à reprendre des lignes existantes : ce qui s'y trouve est un nom, et le
-- reste est vide.

alter table profil add column prenom text;

comment on column profil.nom    is 'Nom de famille.';
comment on column profil.prenom is 'Prénom.';

/* Le déclencheur recopiait le nom donné à l'invitation ; il doit désormais en
   recopier deux. Le reste ne bouge pas — le premier compte d'un projet neuf
   est toujours administrateur, faute de quoi personne ne pourrait affecter
   personne. */
create or replace function profil_a_la_creation() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  premier boolean;
  demande text;
begin
  select not exists (select 1 from profil) into premier;
  demande := coalesce(new.raw_user_meta_data ->> 'role', '');
  insert into profil (id, email, nom, prenom, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'nom', ''),
    nullif(new.raw_user_meta_data ->> 'prenom', ''),
    case when premier or demande = 'admin' then 'admin' else 'organisateur' end)
  on conflict (id) do nothing;
  return new;
end $$;
