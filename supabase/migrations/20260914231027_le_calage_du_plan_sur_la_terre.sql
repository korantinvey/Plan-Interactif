-- Le calage du plan sur la Terre
--
-- Pourquoi : le plan est déjà métrique, et personne ne le sait. Klipso stocke
-- la géométrie en mètres dans le repère monde AutoCAD du parc, et l'import ne
-- fait qu'en retourner le Y (`_partage/geometrie.ts`) : un stand de six mètres
-- mesure six unités, l'échelle du plan dit des mètres parce que ce sont des
-- mètres. Il ne manque donc pas une projection pour situer le hall dans son
-- quartier — il manque trois nombres, ceux qui disent où tombe l'origine et
-- vers où pointe l'axe des X.
--
--   calage = {"lon": 2.2884, "lat": 48.8302,   -- un point, sur la Terre
--             "x": -6757.4,  "y": 8815.2,      -- le même, dans le plan
--             "angle": 0.3241}                 -- radians, plan → est/nord
--
-- Le repère du plan a son Y vers le bas, la Terre son nord vers le haut : la
-- matrice de passage retourne, et se trouve être sa propre réciproque — un
-- seul calcul sert dans les deux sens. La page en tire le rectangle de terrain
-- qui entoure un pavillon, va y chercher les rues et les bâtiments, et les
-- range en mètres-plan dans un calque d'habillage ordinaire.
--
-- Sur l'événement et non sur le pavillon : les pavillons d'un salon viennent
-- d'un seul export CAO, donc d'un seul repère. On le vérifie sur les trois
-- niveaux du pavillon 7 de la démonstration, dont les emprises se recouvrent à
-- quelques mètres près au lieu de partir chacune d'une origine à elle. Un parc
-- qui exporterait ses halls dans des repères indépendants demanderait un
-- calage par pavillon ; ce n'est pas ce que Klipso rend ici.
--
-- Ce qui se calcule à partir de ce calage — le tracé des environs — est
-- enregistré, lui, dans `calque`, sous un identifiant qu'aucune
-- synchronisation ne produira. Le visiteur reçoit donc un calque de plus, en
-- mètres-plan comme les autres : rien dans la page publique n'a besoin de
-- savoir que la Terre est ronde, ni d'appeler quoi que ce soit au dehors.

alter table evenement add column if not exists calage jsonb;

comment on column evenement.calage is
  'Où tombe le repère du plan sur la Terre : {lon, lat, x, y, angle} — un point en WGS84, le même en mètres-plan, et la rotation en radians de l''axe des X vers l''est. Nul tant que le salon n''a pas été calé.';
