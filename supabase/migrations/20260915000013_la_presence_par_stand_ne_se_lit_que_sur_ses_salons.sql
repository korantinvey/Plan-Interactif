-- La présence par stand ne se lit que sur ses salons
--
-- Pourquoi : `visiteur_cible` se lisait en entier par n'importe quel compte
-- connecté. Un organisateur à qui l'on n'a affecté qu'un salon y voyait
-- l'audience de tous les autres — quels stands ont été ouverts, quels jours,
-- par combien de visiteurs distincts.
--
--   create policy "lecture authentifiée des présences" on visiteur_cible
--     for select to authenticated using (true);
--
-- Le commentaire qui l'accompagnait annonçait « le même partage que les trois
-- autres tables de mesure ». Ce n'en était pas un : `mesure`, `compteur`,
-- `compteur_cible` et `visiteur_jour` sont bornées par `acces_salon()` depuis
-- la migration des comptes, qui avait justement fermé les lectures ouvertes à
-- tout compte connecté. `visiteur_cible` est née trois jours plus tard, et a
-- repris la formule d'avant.
--
-- Deux chemins, et ils ne rendent pas la même chose. Vérifié en rejouant les
-- migrations sur une base neuve, avec deux organisateurs d'un salon chacun :
--
--   — la lecture directe de la table, avec la session du compte et la clé
--     publique que les pages transportent, rendait le détail du voisin : quel
--     stand, quel jour, quel canal, et les jetons de ses visiteurs ;
--   — `audience_cibles`, en « security invoker », rendait ses totaux. Sa
--     branche `vus` lit `visiteur_cible` sans passer par `cible` : la liste
--     par stand ressortait vide, faute d'accès aux libellés, mais
--     `total_visiteurs` et sa ventilation par canal et par geste, eux,
--     ressortaient justes.
--
-- Le cloisonnement tenait donc partout sauf sur cette table-là.
--
-- La fréquentation d'un salon est une donnée d'exploitation, et c'est ce que
-- la migration des comptes avait posé en principe. On l'applique ici.
--
-- Rien d'autre ne bouge : l'effacement était déjà borné, l'écriture reste le
-- monopole d'`enregistre_mesures` sous la clé de service, et un exploitant
-- continue de lire la présence de ses propres salons — c'est ce que le
-- rapport et l'export tableur demandent, et ils la demandent salon par salon.

drop policy if exists "lecture authentifiée des présences" on visiteur_cible;

create policy "lecture des présences accessibles" on visiteur_cible
  for select to authenticated using (acces_salon(evenement_id));

comment on table visiteur_cible is
  'Qui a touché quoi, une fois. Une paire déjà vue n''ajoute rien : c''est ce qui permet de compter des visiteurs uniques par stand sans retenir les gestes. Ne se lit que sur les salons affectés au compte.';
