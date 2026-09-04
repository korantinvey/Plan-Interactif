-- Provenance sans clé, et contenu de la fiche détail
--
-- 1. La clé d'identification par domaine était de trop : l'événement en a
--    déjà une, et rien ne justifie de la répéter quatre fois. Il ne reste que
--    le fournisseur.
--
-- 2. Ce qu'une fiche détail montre est une décision d'exploitant, pas une
--    propriété de la donnée. L'état de commercialisation d'un stand, par
--    exemple, n'a pas à sortir sur le site du salon. On l'enregistre donc à
--    côté de l'événement plutôt que dans le navigateur de celui qui l'a
--    réglé, faute de quoi le visiteur n'en verrait rien.
--
--    Forme :
--      {
--        "stand": {"raison":false,"code":true,"surface":true,"angles":true,
--                  "niveaux":true,"etat":true,"site":true,"nomenclature":true},
--        "zone":  {"surface":true}
--      }
--
--    Une entrée absente vaut « affiché » : ajouter un champ plus tard ne doit
--    pas le faire disparaître des salons déjà réglés.

update evenement
set sources = (
  select jsonb_object_agg(d.cle, jsonb_build_object(
    'fournisseur', coalesce(sources -> d.cle ->> 'fournisseur', 'klipso')))
  from (values ('plan'), ('stands'), ('conferences'), ('produits')) as d(cle)
);

comment on column evenement.sources is
  'Fournisseur par domaine (plan, stands, conferences, produits). La clé d''identification reste celle de l''événement.';

alter table evenement
  add column if not exists fiche jsonb not null default '{}'::jsonb;

comment on column evenement.fiche is
  'Champs affichés sur la fiche détail, par type. Entrée absente = affiché.';

update evenement
set fiche = jsonb_build_object(
      'stand', jsonb_build_object(
        'raison', false, 'code', true, 'surface', true, 'angles', true,
        'niveaux', true, 'etat', true, 'site', true, 'nomenclature', true),
      'zone', jsonb_build_object('surface', true))
where fiche = '{}'::jsonb;
