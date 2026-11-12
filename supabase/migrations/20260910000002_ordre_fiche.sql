-- Ordre d'affichage du corps de la fiche détail
--
-- Rien à créer : le réglage tient dans la colonne jsonb « fiche », qui existe
-- déjà. Cette migration dit ce qu'elle porte désormais, faute de quoi la forme
-- ne se lirait que dans le code qui l'écrit.
--
-- L'ordre du code valait pour tous les salons, alors que c'est justement là
-- qu'ils diffèrent : ici le secteur est ce qu'on vient lire, là l'adresse, là
-- encore le champ que le salon s'est ajouté passe devant tout le reste.
--
--   fiche.ordre = ["secteur", "raison", "adresse", "perso:gamme", …]
--
-- La liste ne nomme que le corps : l'enseigne, le pavillon et le numéro de
-- stand tiennent dans l'en-tête, les conférences ont leur propre volet, et
-- rien de tout cela ne se déplace. Absente ou vide, l'ordre du code s'applique.
--
-- Une clé que la liste ignore — un champ ajouté au code, ou par le salon,
-- après le réglage — n'est pas perdue pour autant : elle reprend la place que
-- l'ordre par défaut lui donne, derrière le champ qu'elle y suit. La rejeter à
-- la fin l'aurait sortie de son voisinage sans qu'on l'ait demandé.

comment on column evenement.fiche is
  'Champs affichés sur la fiche détail, par type (entrée absente = affiché) ; '
  'champs propres au salon dans « perso » ; champs proposés comme critères de '
  'recherche dans « criteres » (entrée absente = pas un critère) ; ordre de '
  'lecture du corps dans « ordre » (absent ou vide = ordre par défaut).';
