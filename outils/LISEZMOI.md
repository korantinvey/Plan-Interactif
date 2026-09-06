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
| `_pousse.html` | publication de l'habillage vers la base |
| `_modales.html` | fenêtres de confirmation et d'ordre |
| `_parcours.html` | parcours de visite : signets, tiroir, liseré |
| `_itineraire.html` | itinéraire : grille de marche, A\*, tiroir, mode PMR |
| `_mesure.html` | comptage des gestes, envoyé par paquets |
| `_admin2.html` | démarrage : données figées ou appel à l'API |

Trois modules restent hors de cet assemblage, parce qu'ils ne servent pas la
même page : `_auth-plan.html` est l'écran d'accès greffé sur la seule page
d'administration, `_index.html` la redirection de la racine, et `_config.js`
la configuration copiée telle quelle. La console et le rapport ont leur propre
socle — `_console-base.html`, entouré de `_console-head.html` et
`_console-js.html` d'un côté, `_rapport-head.html` et `_rapport-js.html` de
l'autre — et partagent `_console.css`.

```bash
node assemble.js   # gabarit/ → tpl-multi.html, et chk.js pour node --check
node genere.js     # tpl-multi.html + gabarit/ → web/
```

`genere.js` écrit six pages et deux fichiers annexes :

| page | ce qu'elle est |
|---|---|
| `web/plan.html` | le plan public, servi par l'API |
| `web/plan-admin.html` | le même, derrière l'écran d'accès |
| `web/plan-smcl.html` | démonstration à données figées |
| `web/index.html` | la racine, qui redirige |
| `web/admin-plans.html` | la console des événements |
| `web/rapport.html` | le rapport d'usage |
| `web/config.js` · `web/console.css` | copiés depuis `gabarit/` |

`web/plan-smcl.html` embarque ses données au lieu d'appeler l'API : c'est la
version publiable en artefact — une page publiée ne peut appeler aucune API
externe, sa politique de sécurité l'interdit.

## Exploration

Ces scripts ont servi à établir la structure des données Klipso. Ils ne sont
plus nécessaires au fonctionnement, la fonction serveur fait le même travail,
mais ils restent commodes pour inspecter une nouvelle instance.

```bash
KLIPSO_API_KEY=... node fetch-all.js   # → brut/ et svg/
node optim.js                          # allège les SVG
node build-all.js                      # → plans.json
```

`eventmaker.md` dit par où une conférence Eventmaker tient à un exposant : pas
par l'API REST, où rien ne les relie, mais par `/api/graphql`, celui du
programme public, qui range sous chaque session ses intervenants, ses animateurs
et ses exposants. L'appariement se fait ensuite sur l'identifiant de dossier,
que Klipso porte sur le stand et qu'Eventmaker recopie sur la fiche. C'est là
qu'il faut aller avant de rouvrir la question.

## Serveur local

```bash
node serve.js      # http://localhost:4180
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
