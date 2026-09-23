-- Les droits de l'API de données écrits dans les migrations
--
-- Pourquoi. Jusqu'au 30 octobre 2026, Supabase accordait de lui-même à `anon`,
-- `authenticated` et `service_role` tous les droits sur chaque table créée dans
-- `public`. Aucune de nos migrations ne les écrivait donc : elles les
-- tenaient pour acquis. Après cette date, une table créée sans `grant` est
-- injoignable par l'API de données — et cela vaut aussi pour les migrations
-- rejouées sur un projet neuf, une branche de préversion ou un
-- `supabase db reset`.
--
-- En production cette migration ne change rien : les tables existantes gardent
-- les droits reçus à leur création, et ce sont exactement ceux-ci. Elle rend le
-- schéma rejouable. Sans elle, un projet reconstruit depuis les migrations
-- aurait toutes ses tables et aucun moyen d'y toucher : les fonctions, qui
-- passent par `.from()` avec la clé `service_role`, recevraient « permission
-- denied » — cette clé ignore le RLS, pas les droits —, et la console, qui écrit
-- en `authenticated` par `/rest/v1/`, de même.
--
-- On reprend tels quels les droits d'avant, et non un jeu resserré : les
-- resserrer est un autre changement, qui se décide table par table, et qui ne
-- doit pas se glisser dans une migration censée ne rien modifier en
-- production. La barrière reste le RLS, activé sur chacune de ces tables.
--
-- `on all tables in schema public` ne vise que les tables présentes au moment où
-- la migration passe. C'est voulu : une table créée ensuite porte ses droits
-- dans sa propre migration, ce que `npm run droits` vérifie.

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
