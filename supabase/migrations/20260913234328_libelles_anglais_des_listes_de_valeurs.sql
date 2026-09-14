-- Libellés anglais des listes de valeurs
--
-- Pourquoi : la version anglaise du plan traduit ce que la page écrit, mais les
-- valeurs des listes viennent des sources — secteurs, nomenclature, parcours de
-- visite, offres de reprise — et aucun dictionnaire ne les connaît. Les sources,
-- elles, en tiennent souvent l'anglais : Klipso donne chaque libellé de
-- codification dans plusieurs langues, Eventmaker range les traductions des
-- listes d'un événement à part de ses champs.
--
-- La synchronisation relève donc cet anglais et l'écrit ici, en une table
-- valeur française → valeur anglaise, toutes listes confondues :
--
--   { "Bâtiment et habitat": "Construction",
--     "Adhérent FFF": "FFF member" }
--
-- Une table par salon plutôt qu'une traduction posée sur chaque fiche : une
-- valeur revient sur des centaines de fiches, et la page la traduit partout où
-- elle paraît — liste, fiche, critères de recherche — sans que chacun de ces
-- endroits ait à choisir entre les deux langues.
--
-- Réécrite à chaque synchronisation complète : c'est un relevé de ce que disent
-- les sources, pas un réglage de l'exploitant.

alter table evenement
  add column if not exists libelles_en jsonb not null default '{}'::jsonb;

comment on column evenement.libelles_en is
  'Anglais des valeurs des listes (secteurs, nomenclature, champs à choix), relevé dans les sources à chaque synchronisation : valeur française → valeur anglaise.';
