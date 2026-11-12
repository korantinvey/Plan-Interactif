-- Fiches des zones organisateur : ce que l'exploitant écrit lui-même
--
-- Une zone n'a pas de fiche d'exposant derrière elle : Klipso n'en donne que
-- le nom et le contour, et son programme vient des conférences. Tout ce qu'un
-- visiteur pourrait vouloir savoir d'un espace de restauration, d'une agora ou
-- d'une halte-garderie — ce qu'on y trouve, à quelle heure, sur quelle page
-- s'inscrire — n'existe donc nulle part.
--
-- D'où cette table de fiches, indexée par identifiant de zone comme les noms
-- et les masquages :
--
--   { "z2c32b37a": { "type": "restauration",
--                    "description": "<p>Ouvert de 9h à 19h.</p>",
--                    "lien": "https://exemple.fr/agora" } }
--
-- Le type dit à quoi la zone sert — restauration, conférences, vestiaire,
-- accueil — là où l'intitulé du salon ne le dit pas : « Atmosphère Mobilité »
-- ne se devine pas. Il ouvre l'entrée correspondante dans le cartouche des
-- points d'intérêt du plan, d'où le visiteur retrouve d'un geste toutes les
-- zones du même type. La page ne connaît qu'une poignée de valeurs et ignore
-- ce qu'elle ne reconnaît pas : la colonne ne les contraint donc pas, comme
-- elle ne contraint pas le reste de la fiche.
--
-- La description est saisie dans un éditeur de texte : elle porte donc du
-- balisage, restreint à ce qui se met en forme — paragraphes, gras, italique,
-- listes, liens. La page ne lui fait pas confiance pour autant et la relit
-- avant de l'afficher : ce qui est enregistré ici a beau venir d'un compte
-- authentifié, il traverse ensuite le plan de tous les visiteurs.
--
-- Le libellé de la zone n'y figure pas : il vit déjà dans « zones », d'où il
-- s'applique au plan comme à la fiche.
--
-- Appliquée à la lecture, comme les deux autres : écrire une description doit
-- se voir tout de suite, sans attendre le prochain passage sur Klipso.

alter table evenement
  add column if not exists zones_fiches jsonb not null default '{}'::jsonb;

comment on column evenement.zones_fiches is
  'Fiches de zones organisateur saisies par l''exploitant — type, description et lien — indexées par identifiant de zone. Appliquées à la lecture.';
