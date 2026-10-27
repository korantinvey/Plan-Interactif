# Outils

Ce dossier tient tout ce qui n'est ni une page, ni le Worker, ni le serveur
Supabase. Il se range par ce qu'on en fait : la racine construit, le reste se
lance à part.

| dossier | ce qu'il tient | qui le lance |
|---|---|---|
| `*.js` (racine) | la chaîne de construction : `assemble.js`, `genere.js`, `carte.js`, et ce qu'ils importent | `npm run construire`, Cloudflare, la CI |
| `gabarit/` | la source des pages ; `modules/` tout le JavaScript | — |
| `anglais/` | le dictionnaire anglais, un fichier par module | la construction |
| `donnees/` | les données figées que la construction relit (`plans.json`, `polices.json`, `lieux.json`, la démonstration) | la construction ; se refont par `scripts/` |
| `controles/` | `verifie.js` et ce qu'il lance : syntaxe, ESLint, types, portes, guide, et leurs cliquets | `npm run verifie`, la CI |
| `essais/` | les essais hors page, un fichier par essai ; `aides/` ce qu'ils partagent ; `navigateur/` le plan dans Chromium | `npm run essais`, `npm run navigateur` |
| `bancs/` | les bancs de mesure longs | `npm run fep26`, `npm run charge` |
| `scripts/` | le reste, lancé à la main ou par un workflow | voir plus bas |

La chaîne elle-même est décrite dans `CLAUDE.md` (« La chaîne de fabrication ») ;
`CARTE.md` dit, module par module, ce que contient le gabarit.

## Un essai de plus

`npm run essais` est `node --test "outils/essais/*.js"` : tout fichier de
`essais/` est un essai, lancé dans son propre processus, en parallèle des
autres, et compté en échec s'il sort en erreur. Un essai neuf n'a donc rien à
déclarer ailleurs ; un module qu'il partage avec d'autres va dans `aides/`,
sans quoi il serait lancé lui aussi.

## Serveur local

```bash
npm run essai      # node outils/scripts/serve.js — http://localhost:4180
```

Il sert `web/` tel quel — c'est tout l'intérêt : on essaie exactement ce qui
sera déployé. Une adresse sans extension prend `.html`, `/` mène à l'accueil,
et `/api/plan` relaie vers la fonction Supabase comme le fait le Worker.

| adresse | page |
|---|---|
| `/` | l'accueil, qui redirige vers la console |
| `/plan` | le plan public |
| `/plan-smcl` | le plan à données figées |
| `/plan-admin` | le plan avec son écran d'accès |
| `/admin-plans` · `/rapport` | la console, le rapport |

## Exploration de Klipso

`scripts/klipso/` a servi à établir la structure des données Klipso. Ces
scripts ne sont plus nécessaires au fonctionnement, la fonction serveur fait le
même travail, mais ils restent commodes pour inspecter une nouvelle instance.

```bash
KLIPSO_API_KEY=... node outils/scripts/klipso/fetch-all.js   # → brut/ et svg/
node outils/scripts/klipso/optim.js                          # allège les SVG
node outils/scripts/klipso/build-all.js                      # → donnees/plans.json
```

## Les notes d'étude

Elles vivent dans `docs/`, à la racine du dépôt.

`docs/eventmaker.md` dit par où une conférence Eventmaker tient à un exposant :
pas par l'API REST, où rien ne les relie, mais par `/api/graphql`, celui du
programme public, qui range sous chaque session ses intervenants, ses animateurs
et ses exposants. L'appariement se fait ensuite sur l'identifiant de dossier,
que Klipso porte sur le stand et qu'Eventmaker recopie sur la fiche. C'est là
qu'il faut aller avant de rouvrir la question.

`docs/eventmaker-sso.md` prolonge l'enquête du côté du visiteur : comment
l'identifier — un OAuth 2 en marque blanche, que seul un administrateur
Eventmaker peut ouvrir — et où vivent les rendez-vous qu'il a pris. Pas
davantage dans l'API REST : sous `viewer`, la racine connectée du même graphe,
où un rendez-vous nomme son exposant par le type que la synchronisation sait
déjà poser sur un stand. Le document relève le schéma champ par champ, distingue
ce qui est vérifié de ce qui attend un jeton, et décrit le montage retenu pour
le parcours de visite.

`docs/eventmaker-produits.md` relève la troisième pièce du même jeu : les
produits que les exposants présentent. Ceux-là sont bien dans l'API REST, sous
`guest_products`, hors documentation comme les sessions, et leur `guest_id`
désigne la fiche d'exposant que la synchronisation indexe déjà — le stand suit
sans appariement. Le document dit lesquels des cent salons en portent, pourquoi
seul `published_on_website` sépare un produit d'une note commerciale, ce que
valent les trois tailles d'illustration, et où s'arrête l'anglais.

`docs/defauts-a-reprendre.md` garde les défauts d'avant relevés pendant la
sortie en modules, et comment chacun a été repris.
