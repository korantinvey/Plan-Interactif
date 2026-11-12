-- Un seul nom de produit dans le commentaire du nom de l'application
--
-- Pourquoi : le produit s'appelle Event2Map, et rien d'autre. Le commentaire
-- de `nom_app`, posé par « l_icone_et_le_nom_de_l_application_installee »,
-- portait encore l'ancien nom — un second nom pour la même chose, que le
-- prochain à lire le schéma aurait pris pour une distinction. Une migration
-- appliquée ne se réécrit pas : celle-ci repose le commentaire à sa place.

comment on column evenement.nom_app is
  'Nom de l''application installée, écrit sous l''icône de l''écran d''accueil. Nul : le relais écrit « Plan <salon> by Event2Map ».';
