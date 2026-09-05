#!/bin/bash
# Prépare une session Claude Code sur le web : le conteneur part d'un clone nu,
# sans node_modules. Sans cette étape, `npm run construire` et `npm run verifie`
# échouent dès la première commande.
#
# Seulement à distance : sur un poste, l'environnement est déjà celui du
# développeur, et réinstaller à chaque ouverture serait une nuisance.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# `install` plutôt que `ci` : l'état du conteneur est mis en cache après le
# hook, et `install` sait repartir d'un node_modules déjà présent.
npm install --no-audit --no-fund

# La chaîne de fabrication doit être opérationnelle, pas seulement installée.
npm run construire >/dev/null
echo "Plan interactif : dépendances installées, pages reconstruites."
