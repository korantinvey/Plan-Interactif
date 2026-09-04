-- Rattachement des salles de conférence aux zones organisateur
--
-- Une conférence Eventmaker se tient dans une salle — « Agora (P160) ». Le code
-- entre parenthèses est un emplacement du plan, posé comme texte sur le calque
-- de numérotation : on retrouve donc la zone qui le contient, et par elle la
-- position de la conférence sur le plan.
--
-- Le rapprochement réussit dans dix cas sur onze sur Franchise Expo 2026. Le
-- onzième porte un code absent du plan, et rien ne le devinera : il faut
-- pouvoir le désigner à la main. D'où cette colonne, qui garde les deux — ce
-- que la synchronisation a trouvé, et ce que l'exploitant a corrigé.
--
--   {
--     "<id de salle Eventmaker>": {
--       "nom":    "Agora (P160)",
--       "code":   "P160",
--       "zone":   "z2c32b37a",
--       "auto":   "z2c32b37a",     zone trouvée par la synchronisation
--       "manuel": false            vrai si « zone » vient de l'exploitant
--     }
--   }
--
-- Un rattachement manuel n'est jamais écrasé par la synchronisation : elle met
-- « auto » à jour, mais laisse « zone » tel quel.

alter table evenement
  add column if not exists salles jsonb not null default '{}'::jsonb;

comment on column evenement.salles is
  'Salles de conférence et zone organisateur correspondante. « manuel » protège un rattachement choisi par l''exploitant.';
