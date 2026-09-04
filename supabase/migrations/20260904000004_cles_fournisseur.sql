-- Clé d'identification de l'événement chez les autres fournisseurs
--
-- Un fournisseur désigne l'événement à sa façon : Klipso par un GUID
-- (« 3cad0e36-eaaf-f011-a8d8-005056ac7c95 »), Eventmaker par un identifiant
-- de vingt-quatre caractères hexadécimaux (« 69ef6fb4406b394eda9b8a3e »). Dès
-- qu'un domaine change de source, il faut savoir quel événement lire chez elle.
--
-- Une colonne unique, indexée par fournisseur, plutôt qu'une colonne par
-- fournisseur : la liste va s'allonger et un ajout ne doit pas demander une
-- migration.
--
--   { "eventmaker": "69ef6fb4406b394eda9b8a3e" }
--
-- Klipso n'y figure pas : son identité tient dans `instance` et `event_id`,
-- antérieurs au modèle multi-fournisseurs et déjà exposés dans la console.
-- La déplacer ici ne gagnerait rien aujourd'hui et créerait deux vérités.

alter table evenement
  add column if not exists cles jsonb not null default '{}'::jsonb;

comment on column evenement.cles is
  'Identifiant de l''événement chez chaque fournisseur autre que Klipso, dont l''identité reste portée par instance et event_id.';
