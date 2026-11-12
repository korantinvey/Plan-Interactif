-- Champs propres à un salon, et critères de recherche
--
-- Rien à créer : les deux réglages tiennent dans des colonnes jsonb qui
-- existent déjà. Cette migration ne fait que dire ce qu'elles portent
-- désormais, faute de quoi la forme ne se lirait que dans le code qui l'écrit.
--
-- 1. Les cibles de la fiche sont les mêmes partout — une enseigne, une ville,
--    un site web se retrouvent d'un salon à l'autre. Mais chaque salon a un
--    champ que les autres n'ont pas, dont personne d'autre n'a l'usage.
--    L'ajouter au code revenait à l'ajouter à tous les salons pour qu'un seul
--    s'en serve. Il vit donc à côté de l'événement qui l'a créé :
--
--      fiche.perso = [{"cle": "gamme", "libelle": "Gamme de produits"}]
--
--    Le champ d'origine qui l'alimente, lui, reste dans « correspondances »
--    comme n'importe quelle cible, sous la clé « perso:gamme » — le préfixe le
--    met hors d'atteinte d'une cible que le code ajouterait plus tard.
--
-- 2. Chercher par mot-clé suppose de savoir quoi taper. L'exploitant désigne
--    donc les champs à proposer au visiteur comme filtres :
--
--      fiche.criteres = {"ville": true, "perso:gamme": true}
--
--    Une entrée absente vaut « pas un critère » : rien n'est offert d'office,
--    un plan qui déplierait douze filtres sur un téléphone n'aurait plus de
--    plan. Les valeurs proposées, elles, ne sont pas ici — elles se relèvent
--    dans les fiches à l'affichage, un filtre proposant une ville où personne
--    n'expose ne rendant que des listes vides.

comment on column evenement.fiche is
  'Champs affichés sur la fiche détail, par type (entrée absente = affiché) ; '
  'champs propres au salon dans « perso » ; champs proposés comme critères de '
  'recherche dans « criteres » (entrée absente = pas un critère).';

comment on column evenement.correspondances is
  'Champ d''origine retenu pour chaque cible de la fiche, par fournisseur, et '
  'souvenir des champs détectés. Cible absente = champ par défaut. Les champs '
  'propres au salon s''y règlent sous le préfixe « perso: ».';
