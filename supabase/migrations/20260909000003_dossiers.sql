-- Les dossiers d'exposants, retenus pour situer un rendez-vous
--
-- Un rendez-vous pris dans l'application du salon nomme son exposant par
-- l'identifiant de sa fiche Eventmaker, jamais par un numéro de stand. Pour le
-- poser sur le plan il faut la même chaîne que pour les conférences —
-- fiche → `id_dossier` → stand — dont le dernier maillon n'est connu que de la
-- synchronisation : c'est elle qui tient les deux côtés à la fois, le dossier
-- que Klipso porte sur le stand et l'identifiant qu'elle vient d'attribuer.
--
-- Les conférences n'avaient pas ce problème : elles sont résolues pendant la
-- synchronisation, et la charge publique ne porte déjà que des stands. Un
-- rendez-vous, lui, se lit à la demande — il appartient à un visiteur, il
-- change entre deux synchronisations — et la correspondance doit donc lui
-- survivre.
--
-- Elle reste ici, et ne descend pas dans la charge publique : ce sont des
-- identifiants de dossiers commerciaux, que personne n'a à recevoir pour
-- regarder un plan. Seules les fonctions serveur la lisent.
alter table evenement
  add column dossiers jsonb not null default '{}'::jsonb;

comment on column evenement.dossiers is
  'Dossier exposant Klipso → identifiant de stand du plan. Écrit par la synchronisation, lu par la fonction « rdv » pour situer un rendez-vous. Jamais publié.';
