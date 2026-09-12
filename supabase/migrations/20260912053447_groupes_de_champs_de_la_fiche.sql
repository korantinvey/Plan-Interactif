-- Groupes de champs de la fiche détail
--
-- Rien à créer : le réglage tient dans la colonne jsonb « fiche », qui existe
-- déjà. Cette migration dit ce qu'elle porte désormais, faute de quoi la forme
-- ne se lirait que dans le code qui l'écrit.
--
-- Trois lignes qui se suivent — l'adresse, la ville, le pays — portaient trois
-- intitulés pour une seule information, et la fiche s'allongeait d'autant. Un
-- groupe les réunit sous un titre que l'exploitant écrit : les intitulés de ses
-- membres s'effacent, et leurs valeurs se lisent l'une sous l'autre, comme les
-- valeurs multiples d'un même champ.
--
--   fiche.groupes = [{"titre": "Adresse",
--                     "cles": ["adresse", "ville", "pays"]}]
--
-- Les clés sont celles de « fiche.ordre », préfixe « perso: » compris : un
-- champ propre au salon se groupe comme les autres. Un groupe paraît à la place
-- du premier de ses membres que l'ordre rencontre, et ses membres s'y lisent
-- dans l'ordre du corps — c'est la liste rangée qui fait foi, pas celle du
-- groupe. Un membre masqué ou vide n'y donne pas de ligne ; un groupe dont
-- aucun membre n'en donne ne paraît pas, un titre seul n'annonçant rien.
--
-- Le titre est facultatif : vide, le groupe reprend l'intitulé de son premier
-- membre, ce qui vaut mieux qu'un intitulé vide au-dessus de trois lignes.
--
-- Le réglage se prend depuis le plan — engrenage, « Fiche » — et non plus
-- depuis la console, où l'aperçu ne pouvait montrer ni l'habillage retenu par
-- le salon ni les valeurs d'un vrai stand.

comment on column evenement.fiche is
  'Champs affichés sur la fiche détail, par type (entrée absente = affiché) ; '
  'champs propres au salon dans « perso » ; champs proposés comme critères de '
  'recherche dans « criteres » (entrée absente = pas un critère) ; ordre de '
  'lecture du corps dans « ordre » (absent ou vide = ordre par défaut) ; '
  'champs réunis sous un même titre dans « groupes » (absent = aucun groupe).';
