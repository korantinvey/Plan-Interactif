-- Sources de données par domaine
--
-- Jusqu'ici un événement avait une seule provenance : Klipso, désigné par
-- `event_id`. Les stands, les conférences et les produits pourront venir
-- d'ailleurs — Eventmaker aujourd'hui, autre chose demain — et chaque
-- fournisseur désigne l'événement par sa propre clé.
--
-- D'où une colonne unique plutôt que quatre paires de colonnes : la liste des
-- domaines et celle des fournisseurs vont s'allonger, et un ajout ne doit pas
-- demander une migration.
--
-- Forme attendue, chaque entrée étant facultative :
--   {
--     "plan":        {"fournisseur": "klipso", "cle": null},
--     "stands":      {"fournisseur": "klipso", "cle": null},
--     "conferences": {"fournisseur": "klipso", "cle": null},
--     "produits":    {"fournisseur": "klipso", "cle": null}
--   }
--
-- Une clé nulle ou vide signifie « celle de l'événement » : c'est le cas
-- courant, où tout vient du même dossier Klipso, et cela évite de recopier le
-- même GUID quatre fois.

alter table evenement
  add column if not exists sources jsonb not null default '{}'::jsonb;

comment on column evenement.sources is
  'Fournisseur et clé d''identification par domaine (plan, stands, conferences, produits). Clé vide = celle de l''événement.';

-- Les événements existants viennent tous de Klipso, par l'identifiant déjà
-- saisi : on le rend explicite plutôt que de laisser un objet vide que
-- l'interface devrait deviner.
update evenement
set sources = jsonb_build_object(
      'plan',        jsonb_build_object('fournisseur', 'klipso', 'cle', null),
      'stands',      jsonb_build_object('fournisseur', 'klipso', 'cle', null),
      'conferences', jsonb_build_object('fournisseur', 'klipso', 'cle', null),
      'produits',    jsonb_build_object('fournisseur', 'klipso', 'cle', null))
where sources = '{}'::jsonb;
