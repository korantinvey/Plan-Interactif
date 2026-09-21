-- L'empreinte du dessin d'un calque, tenue par la base elle-même.
--
-- Le fond d'un pavillon est servi sous une adresse déclarée immuable : le
-- navigateur la garde un an sans jamais revenir demander, et le cache du relais
-- un mois. Il faut donc que l'adresse change exactement quand le dessin change.
-- L'horodatage de synchronisation en tenait lieu, et se trompait des deux
-- côtés : trop large — une synchronisation qui ne change rien faisait
-- retélécharger tout le fond — et trop étroit, puisqu'il ne bouge ni pour la
-- synchronisation d'un seul pavillon, ni pour une retouche faite en base.
--
-- Une colonne calculée dit la vérité dans les deux sens : elle suit le contenu,
-- quoi que ce soit qui l'ait écrit, et ne bouge pas quand il ne bouge pas.
-- Trente-deux octets par calque, tenus par le moteur ; il n'y a rien à penser
-- à mettre à jour, donc rien qui puisse être oublié.
alter table calque
  add column empreinte text generated always as (md5(svg)) stored;

comment on column calque.empreinte is
  'md5 du dessin, calculé par la base : sert de version à l''adresse du fond.';
