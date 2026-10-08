-- Le cloisonnement des présences, et des droits d'exécution
--
-- Trois défauts relevés par l'audit de sécurité, et éprouvés sur une base
-- locale par `npm run essais:base` avant d'être corrigés ici.
--
-- 1. Les présences d'un salon se lisaient depuis n'importe quel autre.
--
--    La politique de lecture de `visiteur_cible` disait « le même partage que
--    les trois autres tables de mesure », et posait `using (true)`. Or ces
--    trois-là sont bornées par `acces_salon()` depuis la migration `comptes` :
--    la phrase décrivait leur état d'avant. Un organisateur du salon A lisait
--    donc, par l'API, qui avait ouvert quelle fiche sur tous les salons du
--    projet — l'audience stand par stand de ses concurrents, jour par jour.
--    Les jetons ne désignent personne ; l'audience d'un salon, elle, est une
--    donnée d'exploitation qui n'appartient qu'à lui.
--
--    `audience_cibles` et `rapport_utilisation` sont en « security invoker » :
--    pour le salon qu'on interroge, `acces_salon()` laisse passer exactement ce
--    que `using (true)` laissait passer. Rien ne change pour eux.
--
-- 2. Retirer l'exécution à `public` ne la retirait à personne.
--
--    Chaque fonction se fermait par `revoke all … from public`. Mais Supabase
--    accorde explicitement l'exécution de toute fonction créée dans `public` à
--    `anon` et à `authenticated`, par ses privilèges par défaut : ces droits-là
--    ne passent pas par `public`, et le retrait les laissait en place. Quinze
--    fonctions restaient ainsi appelables avec la clé publique livrée dans les
--    pages — `rappels_dus`, `purge_presences`, `reinitialise_compteurs`…
--
--    Toutes sont en « security invoker », et la sécurité au niveau des lignes
--    les vide sous `anon` : l'essai le vérifie, aucune ne rend ni n'efface
--    rien. Ce n'était donc pas une brèche, mais une seule fonction passée un
--    jour en « security definer » en aurait fait une, sans que rien ne le
--    signale. On rend ici à chacune les seuls appelants qu'elle a.
--
-- 3. Les salons d'un compte se remplaçaient en deux temps.
--
--    La fonction `comptes` effaçait les affectations, puis insérait les
--    nouvelles. Un salon supprimé entre l'affichage de la console et l'envoi
--    — ou un identifiant mal formé — faisait échouer l'insertion après
--    l'effacement : le compte se retrouvait sans aucun salon, et la console
--    affichait une erreur sans dire lequel il avait perdu. `ecrit_compte` fait
--    le profil et ses salons en une transaction : tout passe, ou rien.

-- ---------------------------------------------------------------- présences
drop policy if exists "lecture authentifiée des présences" on visiteur_cible;
create policy "lecture des présences accessibles" on visiteur_cible
  for select to authenticated using (acces_salon(evenement_id));

-- ------------------------------------------------------ droits d'exécution
/*
 * Par nom plutôt que par signature : plusieurs de ces fonctions ont changé de
 * paramètres d'une migration à l'autre, et une signature recopiée de travers
 * ferait échouer le retrait — ou pire, le ferait porter sur une surcharge
 * abandonnée en laissant la bonne ouverte.
 */
do $$
declare
  f record;
begin
  -- Celles qu'appellent les fonctions Edge, sous la clé de service, et nul autre.
  for f in
    select p.oid::regprocedure as sig from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname in (
       'enregistre_mesures', 'enregistre_rappels', 'rappels_dus',
       'oublie_abonnement', 'purge_rappels', 'purge_presences',
       'oublie_rappels_perimes', 'pose_plan_de_visite', 'charge_prevue')
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;

  /* Celles qu'appelle la console, sous la session de l'exploitant : elles
     bornent elles-mêmes au salon par `acces_salon()` ou par les politiques.
     Les fonctions utilitaires — fuseau, empreinte d'un horaire — n'écrivent
     ni ne lisent rien qui sorte ; elles restent aux comptes connectés, dont
     les écritures sur `evenement` les déclenchent. */
  for f in
    select p.oid::regprocedure as sig from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname in (
       'audience_cibles', 'rapport_utilisation', 'reinitialise_compteurs',
       'periode_salon', 'fuseau_iana', 'empreinte_debut')
  loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated, service_role', f.sig);
  end loop;
end $$;

/* Et pour la suite : une fonction créée demain dans `public` naîtra fermée, et
   ne s'ouvrira que par un `grant` écrit dans sa migration. C'est déjà l'usage
   du dépôt — chaque fonction s'y accompagne de son `grant` — ; ce qui manquait
   est que l'oubli ferme au lieu d'ouvrir. */
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- ------------------------------------------------ les salons d'un compte
/*
 * Le profil et ses salons, écrits ensemble.
 *
 * `p_champs` ne porte que ce qui change — `nom`, `prenom`, `role`, `email` :
 * une clé absente laisse la colonne telle quelle. `p_evenements` nul laisse
 * les salons tels quels ; un tableau, même vide, les remplace en entier.
 *
 * « security invoker », et ouverte à la seule clé de service : c'est la
 * fonction `comptes` qui l'appelle, après avoir vérifié que l'appelant est
 * administrateur. Un compte connecté qui l'appellerait par l'API passerait de
 * toute façon par les politiques de `profil` et `acces` ; il n'a pas à la voir.
 */
create or replace function ecrit_compte(
  p_profil uuid,
  p_champs jsonb,
  p_evenements uuid[]
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update profil set
    nom        = case when p_champs ? 'nom'    then p_champs ->> 'nom'    else nom    end,
    prenom     = case when p_champs ? 'prenom' then p_champs ->> 'prenom' else prenom end,
    role       = case when p_champs ? 'role'   then p_champs ->> 'role'   else role   end,
    email      = case when p_champs ? 'email'  then p_champs ->> 'email'  else email  end,
    modifie_le = now()
  where id = p_profil;
  if not found then
    raise exception 'Compte inconnu.' using errcode = 'P0002';
  end if;

  if p_evenements is not null then
    delete from acces where profil_id = p_profil;
    /* Un salon inexistant lève sur la clé étrangère, et la transaction emporte
       l'effacement avec elle : les salons d'avant restent. */
    insert into acces (profil_id, evenement_id)
    select distinct p_profil, e from unnest(p_evenements) e;
  end if;
end $$;

comment on function ecrit_compte(uuid, jsonb, uuid[]) is
  'Écrit le profil d''un compte et remplace ses salons en une seule transaction. Réservée à la fonction comptes (clé de service).';

revoke execute on function ecrit_compte(uuid, jsonb, uuid[]) from public, anon, authenticated;
grant execute on function ecrit_compte(uuid, jsonb, uuid[]) to service_role;
