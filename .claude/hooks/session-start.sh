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

# La chaîne de fabrication doit être opérationnelle, pas seulement installée.
npm run construire >/dev/null
echo "Plan interactif : dépendances installées, pages reconstruites."
