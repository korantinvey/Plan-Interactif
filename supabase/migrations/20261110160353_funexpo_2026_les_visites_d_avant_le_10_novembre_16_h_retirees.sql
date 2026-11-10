-- Funexpo 2026 : les visites d'avant le 10 novembre, 16 h, retirées
--
-- Pourquoi : jusqu'au mardi 10 novembre à 16 h (heure du salon), le plan de
-- Funexpo était en recette — les gestes comptés sont ceux de l'exploitant, pas
-- de ses visiteurs. Ceux d'après sont gardés. La remise à zéro de la console
-- (`reinitialise_compteurs`) aurait tout emporté, d'où cette coupure datée.
--
-- La coupure n'est exacte que là où la mesure a l'heure :
--
--   · `compteur` — visites, recherches, itinéraires, fiches ouvertes — est
--     tronqué à l'heure : tout ce qui précède 16 h part, à la minute près.
--
--   · `compteur_cible`, `visiteur_cible`, `visiteur_jour` — l'audience par
--     stand et les visiteurs uniques — ne connaissent que le jour. Les jours
--     d'avant le 10 partent ; le 10 reste entier. L'effacer emporterait les
--     premiers vrais visiteurs, qu'aucune colonne ne distingue des essais du
--     matin ; le garder laisse au plus quelques jetons de recette dans les
--     visiteurs uniques de ce jour-là.
--
--   · `plan_de_visite` reste : ses jours sont ceux du salon, non ceux où l'on
--     a organisé sa journée, et rien n'y dit quand un plan a été annoncé.
--
-- Les bornes sont des dates fixes : rejouée, ou appliquée plus tard, la
-- migration n'efface jamais rien d'après la coupure.

with s as (
  select id,
         (timestamp '2026-11-10 16:00' at time zone coalesce(fuseau, 'Europe/Paris')) as coupure
    from evenement
   where slug = 'funexpo-2026'
)
delete from compteur c
 using s
 where c.evenement_id = s.id
   and c.heure < s.coupure;

delete from compteur_cible
 where evenement_id = (select id from evenement where slug = 'funexpo-2026')
   and jour < date '2026-11-10';

delete from visiteur_cible
 where evenement_id = (select id from evenement where slug = 'funexpo-2026')
   and jour < date '2026-11-10';

delete from visiteur_jour
 where evenement_id = (select id from evenement where slug = 'funexpo-2026')
   and jour < date '2026-11-10';
