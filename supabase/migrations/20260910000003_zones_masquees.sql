-- Zones organisateur retirées du plan public
--
-- Toutes les zones que Klipso renvoie ne sont pas destinées au visiteur :
-- locaux techniques, réserves, quais de livraison occupent le plan sans rien
-- lui apprendre. L'exploitant les désigne une par une ; elles disparaissent
-- alors du plan public, et restent visibles en administration — en teinte
-- pâlie — pour qu'il puisse revenir sur son choix.
--
-- Indexées par identifiant de zone, comme les noms :
--
--   { "z2c32b37a": true, "zb4be08ec": true }
--
-- Appliquées à la lecture, comme eux : masquer une zone doit se voir tout de
-- suite, sans attendre le prochain passage sur Klipso.

alter table evenement
  add column if not exists zones_masquees jsonb not null default '{}'::jsonb;

comment on column evenement.zones_masquees is
  'Zones organisateur masquées au visiteur, indexées par identifiant de zone. Appliquées à la lecture.';
