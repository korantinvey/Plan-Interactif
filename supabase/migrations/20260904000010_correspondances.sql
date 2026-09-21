-- Correspondance des champs d'exposant
--
-- Les champs d'origine ne portent pas le même nom d'un salon à l'autre. Sur
-- Klipso ce sont des propriétés personnalisées — « x_Catalogue_RaisonSociale »
-- ici, « x_EnseigneCatalogue » là — préfixées « x_ » précisément parce qu'elles
-- sont propres au dossier. Sur Eventmaker ce sont des champs de fiche saisis
-- par l'organisateur : « enseigne », « num_stand », « rubriques2 » sur Franchise
-- Expo, autre chose ailleurs.
--
-- Jusqu'ici ces noms étaient écrits dans la synchronisation. Un salon dont les
-- champs s'appelaient autrement produisait des fiches vides, et la correction
-- demandait un déploiement. Elle se règle désormais depuis la console.
--
-- Forme, un bloc par fournisseur :
--
--   {
--     "klipso": {
--       "champs":    {"nom": "x_Catalogue_RaisonSociale", "site": "x_SiteWeb"},
--       "detectes":  [{"cle": "x_SiteWeb", "libelle": "Site web",
--                      "exemple": "https://…"}],
--       "detecteLe": "2026-09-06T10:12:00.000Z"
--     }
--   }
--
-- « champs » est le réglage : cible de la fiche → champ d'origine. Une cible
-- absente garde le champ d'origine par défaut, celui qui était écrit dans la
-- synchronisation ; ajouter une cible plus tard ne casse donc rien.
--
-- « detectes » n'est qu'un souvenir de la dernière lecture de l'API : la
-- console propose ces champs sans avoir à rappeler Klipso ou Eventmaker à
-- chaque ouverture de la fenêtre. Rien ne dépend de sa fraîcheur.

alter table evenement
  add column if not exists correspondances jsonb not null default '{}'::jsonb;

comment on column evenement.correspondances is
  'Champ d''origine retenu pour chaque cible de la fiche, par fournisseur, et souvenir des champs détectés. Cible absente = champ par défaut.';
