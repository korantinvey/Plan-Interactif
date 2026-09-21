-- La lecture publique repasse par la fonction, et par elle seule
--
-- Les six politiques retirées ici ouvraient les tables au rôle « anon »,
-- c'est-à-dire à la clé publique livrée avec les pages. Elles étaient nées du
-- besoin de « plan-public », qui lisait sous cette clé — mais elles ouvraient
-- au monde ce qu'elles ouvraient à la fonction, et le monde y trouvait plus
-- qu'elle ne consent à rendre :
--
--   · tous les salons publiés d'un coup, sans avoir à en connaître le slug,
--     là où la fonction n'en sert qu'un et sur demande ;
--   · les zones que l'exploitant a masquées, que la fonction retire ;
--   · le dessin des calques qu'il a éteints, que la fonction ampute — deux
--     mégaoctets sur un salon, pour trente-cinq kilooctets à l'écran ;
--   · l'identité de l'événement chez ses fournisseurs, qui ne sort nulle part
--     ailleurs.
--
-- Le soin pris dans « plan-public » à ne servir que le nécessaire ne
-- protégeait donc rien, tant qu'on pouvait lire à côté. Le visiteur y lit
-- désormais sous la clé de service, et la publication est gardée par la
-- fonction elle-même : « salon() » ne rend qu'un événement publié,
-- « publies() » que des pavillons publiés.
--
-- La sécurité au niveau des lignes reste active sur ces tables : sans
-- politique, le rôle « anon » n'y lit plus rien du tout. Les politiques
-- d'écriture, cloisonnées par compte, ne sont pas touchées ; l'exploitant
-- authentifié continue de lire par elles.
--
-- ATTENTION À L'ORDRE DE DÉPLOIEMENT. Le workflow applique les migrations
-- avant de déployer les fonctions : appliquer celle-ci sur une version de
-- « plan-public » qui lit encore sous « anon » éteint le plan public jusqu'au
-- déploiement suivant. Elle ne part donc qu'une fois la fonction en place.

drop policy if exists "lecture publique des événements publiés" on evenement;
drop policy if exists "lecture publique des pavillons publiés"  on plan;
drop policy if exists "lecture publique des calques"            on calque;
drop policy if exists "lecture publique de l'apparence"         on apparence;
drop policy if exists "lecture publique des dessins"            on calque_dessin;
drop policy if exists "lecture publique des instantanés"        on instantane;
