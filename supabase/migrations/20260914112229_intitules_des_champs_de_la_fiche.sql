-- Intitulés des champs de la fiche détail
--
-- Rien à créer : le réglage tient dans la colonne jsonb « fiche », qui existe
-- déjà. Cette migration dit ce qu'elle porte désormais, faute de quoi la forme
-- ne se lirait que dans le code qui l'écrit.
--
-- Un intitulé au-dessus d'une valeur n'apprend pas toujours quelque chose :
-- « Site web » devant une adresse en toutes lettres, « Facebook » au-dessus du
-- picto qui le dit déjà. À l'inverse, trois lignes réunies sous « Contact » ne
-- disent plus laquelle est le téléphone. L'exploitant décide donc champ par
-- champ, depuis le plan — engrenage, « Fiche Stand ».
--
--   fiche.intitules = {"site": false, "telephone": true}
--
-- Les clés sont celles de « fiche.ordre », préfixe « perso: » compris. Une
-- entrée absente vaut l'usage, qui dépend de la place du champ : annoncé quand
-- il est seul, tu quand il est réuni sous un titre — c'est même ce qui fait un
-- groupe. Un champ réuni qui garde son intitulé le pose devant sa valeur et non
-- au-dessus, où il ferait un second titre sous le premier.
--
-- Au passage, « fiche.ordre » ne liste plus que les champs qui paraissent : la
-- même fenêtre décide maintenant de ce que la fiche montre — les champs en
-- réserve d'un côté, ceux de la fiche de l'autre, et le glissé qui va de l'un à
-- l'autre — et un champ ne peut plus tenir un rang sans paraître. La visibilité
-- reste écrite là où elle l'était, dans « fiche.stand », que la console règle
-- aussi. Un champ masqué puis réaffiché depuis la console reprend la place que
-- le défaut lui donne, derrière le champ qu'il y suit.

comment on column evenement.fiche is
  'Champs affichés sur la fiche détail, par type (entrée absente = affiché) ; '
  'champs propres au salon dans « perso » ; champs proposés comme critères de '
  'recherche dans « criteres » (entrée absente = pas un critère) ; ordre de '
  'lecture des champs affichés dans « ordre » (absent ou vide = ordre par '
  'défaut) ; champs réunis sous un même titre dans « groupes » (absent = aucun '
  'groupe) ; intitulés affichés devant les valeurs dans « intitules » (entrée '
  'absente = annoncé seul, tu dans un groupe).';
