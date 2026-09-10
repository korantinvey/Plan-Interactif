-- Comptes et profils
--
-- Jusqu'ici, « authentifié » valait « tout permis » : n'importe quel compte du
-- projet voyait et modifiait n'importe quel salon. C'était tenable tant qu'il
-- n'existait qu'un compte. Dès qu'un organisateur extérieur ouvre la console,
-- il faut que la base sache lui répondre non.
--
-- Deux profils, et un seul mécanisme derrière :
--   · admin        — tout, sur tous les salons ;
--   · organisateur — tout, sur les salons qu'on lui a affectés.
--
-- L'organisateur n'est donc pas un demi-administrateur : sur son salon il a
-- exactement les mêmes droits. Ce qui change n'est pas la nature du droit,
-- c'est son étendue. D'où une table d'affectation plutôt qu'une hiérarchie de
-- permissions, et deux fonctions — `est_admin()`, `acces_salon()` — que toutes
-- les politiques appellent : la règle n'est écrite qu'une fois.

-- ------------------------------------------------------------------ profils
/*
 * Le profil double `auth.users` au lieu de s'y substituer : le schéma `auth`
 * appartient à Supabase, on n'y ajoute pas de colonne, et une politique de
 * sécurité ne peut de toute façon pas le lire librement.
 */
create table profil (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  nom        text,
  role       text not null default 'organisateur'
             check (role in ('admin', 'organisateur')),
  cree_le    timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

comment on table profil is
  'Le rôle d''un compte. Créé automatiquement à l''inscription ; l''adresse suit celle de auth.users.';

-- ------------------------------------------------------------- affectations
create table acces (
  profil_id    uuid not null references profil (id) on delete cascade,
  evenement_id uuid not null references evenement (id) on delete cascade,
  accorde_le   timestamptz not null default now(),
  primary key (profil_id, evenement_id)
);

comment on table acces is
  'Les salons d''un organisateur. Sans objet pour un administrateur, qui les a tous.';

-- « quels salons pour ce compte » est la lecture courante, portée par la clé
-- primaire ; « qui a accès à ce salon » ne l'est qu'en console, mais balaierait
-- la table entière sans cet index.
create index on acces (evenement_id);

-- ------------------------------------------------------------- la règle, une fois
/*
 * `security definer` : ces fonctions lisent `profil`, table elle-même protégée
 * par des politiques qui les appellent. Sans cela, la lecture se mordrait la
 * queue. Le `search_path` est figé — une fonction privilégiée ne doit pas
 * pouvoir être détournée vers un schéma déposé par l'appelant.
 */
create or replace function est_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profil p where p.id = auth.uid() and p.role = 'admin');
$$;

create or replace function acces_salon(p_evenement uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select p_evenement is not null and (
    est_admin() or exists (
      select 1 from acces a
      where a.profil_id = auth.uid() and a.evenement_id = p_evenement));
$$;

comment on function acces_salon(uuid) is
  'Vrai si le compte connecté peut administrer ce salon. Seul point de vérité des politiques d''écriture.';

-- --------------------------------------------------------- création du profil
/*
 * Un compte créé sans profil serait un compte sans droits, et rien à l'écran
 * ne dirait pourquoi. Le profil naît donc avec l'utilisateur, quelle que soit
 * la porte empruntée : invitation depuis la console, ou création à la main
 * dans le tableau de bord Supabase.
 *
 * Le tout premier compte est administrateur : autrement, un projet neuf
 * n'aurait personne pour affecter qui que ce soit.
 */
create or replace function profil_a_la_creation() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  premier boolean;
  demande text;
begin
  select not exists (select 1 from profil) into premier;
  demande := coalesce(new.raw_user_meta_data ->> 'role', '');
  insert into profil (id, email, nom, role)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'nom', ''),
    case when premier or demande = 'admin' then 'admin' else 'organisateur' end)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger profil_a_la_creation
  after insert on auth.users
  for each row execute function profil_a_la_creation();

/* L'adresse sert à retrouver un compte et à lui écrire : elle ne doit pas
   diverger de celle qui ouvre la session. */
create or replace function profil_suit_adresse() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update profil set email = coalesce(new.email, ''), modifie_le = now()
  where id = new.id and email is distinct from coalesce(new.email, '');
  return new;
end $$;

create trigger profil_suit_adresse
  after update of email on auth.users
  for each row execute function profil_suit_adresse();

/* Les comptes déjà en place sont ceux de l'exploitant : ils restent
   administrateurs. Sans cette reprise, la migration fermerait la console à
   celui qui la pousse. */
insert into profil (id, email, role)
select u.id, coalesce(u.email, ''), 'admin' from auth.users u
on conflict (id) do nothing;

-- ------------------------------------------------------- lecture des profils
alter table profil enable row level security;
alter table acces  enable row level security;

-- Chacun a besoin de lire son propre rôle : c'est lui qui décide de ce que la
-- console affiche. Le reste de la table n'appartient qu'à l'administrateur.
create policy "lecture de son propre profil" on profil
  for select to authenticated using (id = auth.uid() or est_admin());
create policy "gestion des profils par l'administrateur" on profil
  for all to authenticated using (est_admin()) with check (est_admin());

create policy "lecture de ses propres accès" on acces
  for select to authenticated using (profil_id = auth.uid() or est_admin());
create policy "gestion des accès par l'administrateur" on acces
  for all to authenticated using (est_admin()) with check (est_admin());

-- -------------------------------------------- ce que le public voit, et lui seul
/*
 * Les politiques de lecture publique ne portaient pas de rôle : elles valaient
 * donc aussi pour un compte connecté, à qui elles montraient tous les salons
 * publiés. Un organisateur y aurait lu la liste des salons des autres. On les
 * réserve au visiteur anonyme ; le compte connecté passe par `acces_salon()`.
 */
drop policy "lecture publique des événements publiés" on evenement;
drop policy "lecture publique des pavillons publiés"  on plan;
drop policy "lecture publique des calques"            on calque;
drop policy "lecture publique de l'apparence"         on apparence;
drop policy "lecture publique des dessins"            on calque_dessin;
drop policy "lecture publique des instantanés"        on instantane;

create policy "lecture publique des événements publiés" on evenement
  for select to anon using (etat = 'publie');

create policy "lecture publique des pavillons publiés" on plan
  for select to anon using (
    publie and exists (
      select 1 from evenement e where e.id = plan.evenement_id and e.etat = 'publie'));

create policy "lecture publique des calques" on calque
  for select to anon using (exists (select 1 from plan p where p.id = calque.plan_id));
create policy "lecture publique de l'apparence" on apparence
  for select to anon using (exists (select 1 from plan p where p.id = apparence.plan_id));
create policy "lecture publique des dessins" on calque_dessin
  for select to anon using (exists (select 1 from plan p where p.id = calque_dessin.plan_id));
create policy "lecture publique des instantanés" on instantane
  for select to anon using (exists (select 1 from plan p where p.id = instantane.plan_id));

-- --------------------------------------------------- écriture, salon par salon
drop policy "écriture authentifiée" on evenement;
drop policy "écriture authentifiée" on plan;
drop policy "écriture authentifiée" on calque;
drop policy "écriture authentifiée" on apparence;
drop policy "écriture authentifiée" on calque_dessin;
drop policy "écriture authentifiée" on instantane;

/* Créer un salon reste à l'administrateur : un organisateur reçoit les siens,
   il ne s'en donne pas. Tout le reste — modifier, publier, supprimer — lui est
   ouvert sur les salons qu'il a. */
create policy "création d'un salon par l'administrateur" on evenement
  for insert to authenticated with check (est_admin());
create policy "lecture des salons accessibles" on evenement
  for select to authenticated using (acces_salon(id));
create policy "modification des salons accessibles" on evenement
  for update to authenticated using (acces_salon(id)) with check (acces_salon(id));
create policy "suppression des salons accessibles" on evenement
  for delete to authenticated using (acces_salon(id));

create policy "écriture sur les pavillons accessibles" on plan
  for all to authenticated
  using (acces_salon(evenement_id)) with check (acces_salon(evenement_id));

/* Les quatre tables suivantes pendent d'un pavillon : leur droit est celui du
   salon qui le porte. */
create policy "écriture sur les calques accessibles" on calque
  for all to authenticated
  using (exists (select 1 from plan p where p.id = calque.plan_id and acces_salon(p.evenement_id)))
  with check (exists (select 1 from plan p where p.id = calque.plan_id and acces_salon(p.evenement_id)));

create policy "écriture sur l'apparence accessible" on apparence
  for all to authenticated
  using (exists (select 1 from plan p where p.id = apparence.plan_id and acces_salon(p.evenement_id)))
  with check (exists (select 1 from plan p where p.id = apparence.plan_id and acces_salon(p.evenement_id)));

create policy "écriture sur les dessins accessibles" on calque_dessin
  for all to authenticated
  using (exists (select 1 from plan p where p.id = calque_dessin.plan_id and acces_salon(p.evenement_id)))
  with check (exists (select 1 from plan p where p.id = calque_dessin.plan_id and acces_salon(p.evenement_id)));

create policy "écriture sur les instantanés accessibles" on instantane
  for all to authenticated
  using (exists (select 1 from plan p where p.id = instantane.plan_id and acces_salon(p.evenement_id)))
  with check (exists (select 1 from plan p where p.id = instantane.plan_id and acces_salon(p.evenement_id)));

-- ------------------------------------------------------- mesures et compteurs
/*
 * Le rapport d'utilisation n'est pas public, et il ne l'est pas non plus entre
 * organisateurs : la fréquentation d'un salon est une donnée d'exploitation.
 * `rapport_utilisation()` est en « security invoker » — ces politiques
 * suffisent donc à la borner, sans rien changer à la fonction.
 */
drop policy "lecture authentifiée des mesures"           on mesure;
drop policy "lecture authentifiée des cibles"            on cible;
drop policy "lecture authentifiée des compteurs"         on compteur;
drop policy "lecture authentifiée des compteurs par cible" on compteur_cible;
drop policy "lecture authentifiée des visiteurs"         on visiteur_jour;

create policy "lecture des mesures accessibles" on mesure
  for select to authenticated using (acces_salon(evenement_id));
create policy "lecture des cibles accessibles" on cible
  for select to authenticated using (acces_salon(evenement_id));
create policy "lecture des compteurs accessibles" on compteur
  for select to authenticated using (acces_salon(evenement_id));
create policy "lecture des compteurs par cible accessibles" on compteur_cible
  for select to authenticated using (acces_salon(evenement_id));
create policy "lecture des visiteurs accessibles" on visiteur_jour
  for select to authenticated using (acces_salon(evenement_id));
