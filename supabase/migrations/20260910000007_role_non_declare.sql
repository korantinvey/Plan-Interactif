-- Le rôle ne se déclare pas soi-même
--
-- Le déclencheur de création de profil lisait le rôle dans les métadonnées du
-- compte : « raw_user_meta_data->>'role' vaut admin, donc admin ». Ces
-- métadonnées viennent de celui qui crée le compte. Pour une invitation
-- envoyée par la console, c'est l'exploitant, et tout va bien. Pour une
-- inscription faite à la porte — POST /auth/v1/signup, avec la clé publique
-- qui est livrée dans les pages — c'est l'inscrit lui-même :
--
--   { "email": "…", "password": "…", "data": { "role": "admin" } }
--
-- et le déclencheur lui accordait l'administration de tous les salons, de
-- leurs mesures et de la gestion des comptes. Le cloisonnement construit par
-- « acces_salon() » tombait alors d'un bloc, non parce qu'une politique était
-- fausse, mais parce que la question « est-il administrateur ? » recevait sa
-- réponse de l'intéressé.
--
-- Le rôle demandé n'est donc plus lu. Un compte naît organisateur, sauf le
-- tout premier d'un projet neuf — sans lui personne n'affecterait personne.
-- Cela n'enlève rien à la console : « comptes » invite avec la clé de service,
-- puis écrit le rôle voulu dans la foulée, sans passer par les métadonnées.
--
-- Reste que l'inscription libre, si elle est ouverte côté Supabase, laisse
-- créer des comptes sans invitation. Ils ne voient plus rien — un
-- organisateur sans affectation n'a aucun salon — mais le réglage
-- « Authentication → Sign In / Providers → Allow new users to sign up » a
-- vocation à rester fermé : le projet n'a pas d'inscription libre.

create or replace function profil_a_la_creation() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  premier boolean;
begin
  select not exists (select 1 from profil) into premier;
  insert into profil (id, email, nom, prenom, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'nom', ''),
    nullif(new.raw_user_meta_data ->> 'prenom', ''),
    /* Le nom et le prénom sont du renseignement : les prendre tels quels ne
       coûte qu'un annuaire mal orthographié. Le rôle est un droit, et ne
       s'accorde qu'ici ou par « comptes ». */
    case when premier then 'admin' else 'organisateur' end)
  on conflict (id) do nothing;
  return new;
end $$;

comment on function profil_a_la_creation is
  'Crée le profil d''un compte. Le rôle demandé dans les métadonnées est ignoré : seul le premier compte du projet naît administrateur.';
