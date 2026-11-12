-- La lecture des présences bornée au salon
--
-- Pourquoi : `visiteur_cible` (`…_les_visiteurs_uniques_par_stand.sql`) est
-- née avec une lecture ouverte à tout compte connecté — `using (true)` — en
-- croyant suivre « le même partage que les trois autres tables de mesure ».
-- Ce partage-là avait cessé trois jours plus tôt : `…_comptes.sql` avait borné
-- toutes les tables de mesure par `acces_salon(evenement_id)`, la fréquentation
-- d'un salon étant une donnée d'exploitation de son organisateur. Un compte
-- d'organisateur lisait donc, par l'API, les visiteurs uniques par stand et
-- par jour de tous les salons — ceux de ses concurrents compris.
--
-- La table ne porte que des jetons tirés par le navigateur : rien qui désigne
-- une personne. Ce qui fuyait, c'est l'audience d'un client lue par un autre.
--
-- La migration fautive est appliquée : on ne la réécrit pas, on la corrige ici.
-- `outils/essais/rls-salons.js` refuse désormais qu'une table rattachée à un
-- salon s'ouvre en lecture à tout compte connecté.

drop policy if exists "lecture authentifiée des présences" on visiteur_cible;
drop policy if exists "lecture des présences accessibles" on visiteur_cible;
create policy "lecture des présences accessibles" on visiteur_cible
  for select to authenticated using (acces_salon(evenement_id));
