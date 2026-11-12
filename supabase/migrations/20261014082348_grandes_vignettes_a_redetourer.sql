-- Grandes vignettes à redétourer
--
-- Pourquoi : le détourage gardait blancs des creux qu'il devait retirer —
-- l'œil des lettres posées dans un cadre (SEPCO), celui d'une lettre grasse
-- sur un logo long et bas (Chapuis) — et `modules/detourage.mjs` les retire
-- désormais. Les grandes déjà faites passent pour détourées, et la
-- préparation des logos ne les redemanderait jamais : on les remet à faire,
-- pour qu'elle les refasse une fois au nouveau tri. D'ici là, le toit garde
-- la grande d'avant, transparente au bord, qui se pose telle quelle.

update vignette_de_logo set grande_detouree = false where grande_detouree;
