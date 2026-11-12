-- Identifiant de calque de dessin propre à la page
--
-- Un calque naît dans le navigateur et y porte un identifiant court. La base,
-- elle, lui attribue un uuid à l'insertion. Sans clé commune, enregistrer
-- revenait à tout supprimer puis tout réécrire — destructeur si l'écriture
-- échoue à mi-chemin, et l'identifiant changeait à chaque passage.
--
-- Cette colonne porte l'identifiant de la page. L'enregistrement devient un
-- rapprochement sur (plan, clé) : ce qui existe est mis à jour, ce qui a
-- disparu de la page est retiré, et rien n'est détruit avant d'être remplacé.

alter table calque_dessin
  add column if not exists cle text;

create unique index if not exists calque_dessin_plan_cle
  on calque_dessin (plan_id, cle) where cle is not null;

comment on column calque_dessin.cle is
  'Identifiant du calque tel que la page le connaît. Sert de clé de rapprochement à l''enregistrement.';
