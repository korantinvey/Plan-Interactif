-- Zones organisateur que l'itinéraire peut traverser
--
-- Une zone organisateur est un mur pour le calcul de trajet : c'est vrai d'une
-- réserve ou d'un local technique, faux d'un accueil, d'une agora, d'une
-- esplanade — des sols qu'on traverse, et que l'itinéraire contournait en
-- faisant faire le tour de ce qu'on aurait coupé. Sur Franchise Expo Paris, le
-- trajet depuis l'entrée fait le tour de l'accueil avant de rejoindre la
-- première allée.
--
-- Rien dans la source ne distingue les deux : Klipso donne un contour et
-- parfois un nom. L'exploitant désigne donc les zones qu'on traverse, une par
-- une, depuis l'onglet « Zones » des réglages du plan.
--
-- Indexées par identifiant de zone, comme les noms et les masquages :
--
--   { "z2c32b37a": true, "zb4be08ec": true }
--
-- Appliquées à la lecture, comme eux : cocher une zone doit changer le
-- prochain trajet, sans attendre le prochain passage sur Klipso.

alter table evenement
  add column if not exists zones_traversables jsonb not null default '{}'::jsonb;

comment on column evenement.zones_traversables is
  'Zones organisateur que l''itinéraire traverse au lieu de les contourner, indexées par identifiant de zone. Appliquées à la lecture.';
