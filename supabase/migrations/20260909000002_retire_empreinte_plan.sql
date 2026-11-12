-- Une seule empreinte de fond, et c'est la base qui la tient
--
-- `plan.empreinte` versionnait le fond depuis la synchronisation : elle était
-- calculée là, sur les dessins de tous les calques mis bout à bout. Elle a fait
-- son office — le fond ne se retélécharge plus à chaque passage — mais elle ne
-- voit que ce qui passe par la synchronisation, et le fond ne dépend plus
-- seulement d'elle : il est maintenant découpé selon ce que l'exploitant
-- affiche, et la façon de le découper peut changer sans qu'un seul dessin
-- bouge.
--
-- `calque.empreinte` prend la suite, et pour chaque calque : le moteur la
-- calcule lui-même, elle suit donc le contenu quel que soit ce qui l'a écrit.
-- L'API compose la version à partir des seuls calques qu'elle sert, de ce qui
-- est masqué et de son propre format. Garder les deux laisserait une colonne
-- écrite à chaque synchronisation que plus personne ne lit.

alter table plan drop column if exists empreinte;
