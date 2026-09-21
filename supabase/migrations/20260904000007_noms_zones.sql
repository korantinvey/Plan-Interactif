-- Noms des zones organisateur choisis par l'exploitant
--
-- Une zone tire son nom de Klipso — x_LibZOD — ou, à défaut, des textes posés
-- sur le plan et regroupés par proximité. Sur certains salons ni l'un ni
-- l'autre ne donne rien : les vingt-deux zones de Franchise Expo 2026
-- s'affichent toutes « Zone sans nom ».
--
-- D'où cette table de noms, indexée par identifiant de zone :
--
--   { "z2c32b37a": "Agora", "zb4be08ec": "Pitch Restauration Rapide" }
--
-- Elle est appliquée à la lecture, pas à la synchronisation : renommer une
-- zone doit se voir tout de suite, sans attendre le prochain passage sur
-- Klipso.

alter table evenement
  add column if not exists zones jsonb not null default '{}'::jsonb;

comment on column evenement.zones is
  'Noms de zones organisateur saisis par l''exploitant, indexés par identifiant de zone. Appliqués à la lecture.';
