#!/bin/bash
# Prépare une session Claude Code. Deux choses, et elles n'ont pas la même
# portée : le pilote de fusion se déclare partout, l'installation seulement à
# distance — sur un poste, l'environnement est déjà celui du développeur, et
# réinstaller à chaque ouverture serait une nuisance.
#
# À distance, le conteneur part d'un clone nu, sans node_modules : sans cette
# étape, `npm run construire` et `npm run verifie` échouent dès la première
# commande.
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Le pilote de fusion que réclame `.gitattributes` pour `web/`, `tpl-multi.html`
# et `CARTE.md`. `true` ne fait rien, et ne rien faire garde la version en
# place : ces fichiers se refabriquent, ils n'ont donc rien à négocier lors
# d'une fusion. Déclaré avant la sortie ci-dessous, car un poste de travail en a
# autant besoin qu'un conteneur — c'est là que les fusions se font.
git config merge.ours.name "Garde la version en place : le fichier se reconstruit"
git config merge.ours.driver true

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# `ci` plutôt qu'`install` : `install` réécrit package-lock.json dès que la
# version de npm du conteneur diffère de celle qui l'a produit — l'arbre se
# retrouvait sali à chaque ouverture de session. `ci` s'en tient au fichier.
npm ci --no-audit --no-fund

# Le conteneur préinstalle Chromium pour sa propre version de Playwright, et
# celle qu'épingle le dépôt cherche le sien sous une autre révision : tout
# essai dans le navigateur échouait sur « Executable doesn't exist », sans rien
# dire du code. On donne au dossier attendu le navigateur déjà là, par un lien
# — rien ne se télécharge. Lue dans `playwright-core`, la révision suit
# l'épinglage sans qu'on ait à la recopier. Une marche de confort : elle ne
# doit jamais empêcher la session de démarrer.
NAVIGATEURS="${PLAYWRIGHT_BROWSERS_PATH:-/opt/pw-browsers}"
if [ -d "$NAVIGATEURS" ]; then
  for sorte in chromium chromium-headless-shell; do
    dossier="${sorte//-/_}"
    # le paquet n'exporte pas `browsers.json` : on le prend à côté de son `package.json`
    revision=$(node -p "require(require('path').join(require.resolve('playwright-core/package.json'), '..', 'browsers.json')).browsers.find(b => b.name === '$sorte').revision" 2>/dev/null) || continue
    voulu="$NAVIGATEURS/$dossier-$revision"
    [ -e "$voulu" ] && continue
    present=$(ls -d "$NAVIGATEURS/$dossier"-[0-9]* 2>/dev/null | sort -V | tail -1)
    [ -n "$present" ] && ln -s "$present" "$voulu" 2>/dev/null || true
  done
fi

# La chaîne de fabrication doit être opérationnelle, pas seulement installée.
npm run construire >/dev/null
echo "Plan interactif : dépendances installées, pages reconstruites."
