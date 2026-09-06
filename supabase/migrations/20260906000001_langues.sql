-- Langues offertes au visiteur
--
-- Un salon parle d'abord la langue de son pays ; certains en offrent une
-- seconde à leurs visiteurs étrangers. Ce n'est pas une propriété des données —
-- Eventmaker porte les descriptifs traduits qu'on lui a donnés, sans dire
-- lesquels publier — mais une décision d'exploitant : d'où sa place ici, à côté
-- de `fiche`, et non dans la source.
--
-- Le français ouvre toujours la liste : c'est la langue de rédaction du plan,
-- et celle des libellés dépourvus de traduction. Une liste réduite à
-- « ["fr"] » — la valeur par défaut — ne fait paraître aucun sélecteur : le
-- visiteur d'un salon monolingue ne doit pas avoir à choisir.
--
--   ["fr"]         un salon français, comme avant
--   ["fr", "en"]   le plan bascule en anglais d'un appui

alter table evenement
  add column if not exists langues jsonb not null default '["fr"]'::jsonb;

comment on column evenement.langues is
  'Langues offertes au visiteur, dans l''ordre d''affichage. Le français ouvre toujours la liste : les libellés sans traduction y retombent.';
