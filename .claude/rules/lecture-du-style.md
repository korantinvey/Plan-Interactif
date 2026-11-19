---
paths:
  - "outils/gabarit/modules/style-*.mjs"
  - "outils/gabarit/modules/webgl.mjs"
  - "outils/gabarit/modules/moteur-gl*.mjs"
  - "outils/gabarit/modules/trace.mjs"
  - "outils/gabarit/modules/habillage*.mjs"
  - "outils/gabarit/modules/calque-detache.mjs"
  - "outils/gabarit/modules/distinctions.mjs"
  - "outils/gabarit/_styles-plan.css"
  - "supabase/functions/_partage/svg.ts"
---

# Remplacer ce que le navigateur résolvait

Le dessin WebGL lit le style dans les données plutôt que dans le style calculé.
Chaque lecture maison hérite alors de tout ce que le navigateur faisait sans
qu'on le voie : six remarques de CodeRabbit sur la seule #553, chacune juste,
aucune vue par les essais parce qu'aucun salon réel n'employait ces écritures.

- **Partir de ce que le nettoyage laisse passer** (`_partage/svg.ts`), pas de ce
  que les salons emploient, et traiter chaque forme valide :
  - `inherit`, qui remonte au parent comme une valeur absente ;
  - les pourcentages (`opacity="50%"` vaut 0,5), bornés à [0, 1] ;
  - les mots-clés (`font-size="small"`, `medium`), mesurés et non tirés d'une
    table : ils suivent la taille de police réglée par le visiteur ;
  - les unités (`em`, `rem`, `%`, `pt`) ;
  - l'alpha (`#rrggbbaa`), et les mélanges prémultipliés comme `color-mix`.
- **`parseFloat` ne valide rien** : `NaN`, ou 50 au lieu de 0,5, efface ou
  sature le dessin en silence, et en WebGL seulement.
- **L'héritage remonte jusqu'au vrai parent.** Une copie détachée reçoit ce que
  le calque posé porte (son opacité en `poi-actif`), sans quoi `inherit` s'y
  arrête trop tôt.
- **La comparaison SVG/WebGL reçoit un cas par écriture rare**
  (`habillage.spec.js`, `style-emplacements.spec.js`), qui échoue sur le code
  d'avant.
- **La documentation dit ce qui reste lu ailleurs** : affirmer que le dessin ne
  lit plus le groupe SVG, quand il y lit encore la classe et `:focus-visible`,
  invite à le retirer (#553, `docs/migration-webgl.md`).
