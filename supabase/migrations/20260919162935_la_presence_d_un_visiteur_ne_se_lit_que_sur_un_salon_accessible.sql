-- La présence d'un visiteur ne se lit que sur un salon accessible
--
-- `visiteur_cible` est arrivée après les cinq autres tables de mesure, et elle
-- est la seule à ne pas avoir reçu leur borne. Sa politique de lecture disait
-- `using (true)` là où `mesure`, `cible`, `compteur`, `compteur_cible` et
-- `visiteur_jour` disent toutes `acces_salon(evenement_id)` — et son propre
-- commentaire annonçait pourtant « le même partage que les trois autres tables
-- de mesure ». L'effacement, lui, était bien borné : c'est la lecture, et elle
-- seule, qui était restée ouverte.
--
-- Ce que cela laissait passer, avec un simple compte d'organisateur et la clé
-- publique livrée dans les pages :
--
--   · la table entière, tous salons confondus — `evenement_id`, le stand ou la
--     conférence touchés, le geste, le canal, le jour, le jeton du visiteur ;
--   · de quoi recomposer l'audience par stand d'un salon concurrent, alors que
--     `compteur_cible` la refusait deux lignes plus haut ;
--   · les identifiants des salons des autres, que `evenement` ne rend jamais —
--     la fuite se suffisait donc à elle-même, sans rien savoir d'avance ;
--   · et par `audience_cibles()`, qui est en « security invoker » et lit cette
--     table sans autre garde que celle-ci, les totaux de visiteurs uniques d'un
--     salon qu'on ne peut pas ouvrir : `total_visiteurs`, ses canaux, ses
--     itinéraires, ses parcours, ses suggestions.
--
-- La fréquentation d'un salon est une donnée d'exploitation : la migration des
-- comptes l'écrit en toutes lettres — « le rapport d'utilisation n'est pas
-- public, et il ne l'est pas non plus entre organisateurs ». Le cloisonnement
-- ne tenait donc pas par cette table-ci.
--
-- Rien ne se perd à la refermer : `audience_cibles()` filtre déjà sur le salon
-- demandé, et un compte qui y a droit lit exactement les mêmes lignes qu'avant.
-- Seul disparaît ce qu'il n'aurait jamais dû voir.

drop policy if exists "lecture authentifiée des présences" on visiteur_cible;
create policy "lecture des présences accessibles" on visiteur_cible
  for select to authenticated using (acces_salon(evenement_id));

comment on table visiteur_cible is
  'Qui a touché quoi, une fois. Une paire déjà vue n''ajoute rien : c''est ce qui permet de compter des visiteurs uniques par stand sans retenir les gestes. Lecture et effacement bornés au salon accessible, comme les cinq autres tables de mesure.';
