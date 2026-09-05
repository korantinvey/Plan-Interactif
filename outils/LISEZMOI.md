# Outils

Chaîne de fabrication des pages, et scripts d'exploration de l'API.

## Gabarit

`gabarit/` contient la page découpée en modules, assemblés dans cet ordre :

| module | rôle |
|---|---|
| `_head.html` | titre, styles, structure |
| `_js.html` | index, libellés, recherche, vue, sélection, interactions |
| `_admin1.html` | apparence des calques, menu d'administration |
| `_dessin.html` | calques de dessin, outils de tracé, historique |
| `_edition.html` | sélection, déplacement, poignées |
| `_pile.html` | panneau : une seule pile pour tous les calques |
| `_modales.html` | fenêtres de confirmation et d'ordre |
| `_admin2.html` | démarrage : données figées ou appel à l'API |

```bash
node assemble.js   # gabarit/ → tpl-multi.html, avec contrôle de syntaxe
node genere.js     # tpl-multi.html → web/plan.html et web/plan-smcl.html
```

`web/plan.html` interroge l'API. `web/plan-smcl.html` embarque les données :
c'est la version de démonstration, publiable en artefact — une page publiée ne
peut appeler aucune API externe, sa politique de sécurité l'interdit.

## Exploration

Ces scripts ont servi à établir la structure des données Klipso. Ils ne sont
plus nécessaires au fonctionnement, la fonction serveur fait le même travail,
mais ils restent commodes pour inspecter une nouvelle instance.

```bash
KLIPSO_API_KEY=... node fetch-all.js   # → brut/ et svg/
node optim.js                          # allège les SVG
node build-all.js                      # → plans.json
```

`sonde-eventmaker.js` cherche, lui, par où une conférence Eventmaker tient à un
exposant : champs de la session, paramètres qui l'ouvriraient, chemins que la
documentation ne cite pas, champs personnalisés des fiches d'invités, et à
défaut de lien, le nom de l'exposant dans l'intitulé.

```bash
EVENTMAKER_TOKEN=... node sonde-eventmaker.js <idEvenement>   # → brut/eventmaker/
```

Le jeton se lit aussi dans `.env`. Le rapport part à l'écran, les charges
brutes dans `brut/eventmaker/`, pour une relecture au calme.

## Serveur local

```bash
node serve.js
```

| route | page |
|---|---|
| `/` `/smcl` | plan à données figées |
| `/api` | plan servi par l'API |
| `/admin` | console des événements |
| `/msmcl` | le plan dans une iframe de 390 px, pour le mobile |
