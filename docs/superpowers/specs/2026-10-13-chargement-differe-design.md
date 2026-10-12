# Le plan d'abord, le reste ensuite — design

*13 octobre 2026 · branche `chargement-differe`*

## Pourquoi

Sur un téléphone moyen (processeur ralenti 4×, 4G, vrai GPU, salon `fep27`),
le visiteur attend **une dizaine de secondes** avant de voir le plan :

| instant | à l'écran |
|---|---|
| 1,8 s | l'interface, sans plan |
| 4,6 s | recherche et raccourcis prêts, fond vide |
| ~10 s | le plan |

Le profil de ces cinq secondes vides :

- **~2 s** à compiler les programmes graphiques de deck.gl, tous à la fois
  (`_linkShaders` / `_getLinkStatus`), y compris ceux de calques invisibles à
  l'ouverture — figurants 3D, survol, volumes, pastilles ;
- **~1,5 s** à monter la carte du quartier (MapLibre, `environs.mjs`
  `poseCarteGL`), téléchargée depuis jsdelivr, sur le même fil, avant la
  première image ;
- **~0,4 s** à lire le script du plan (353 Ko, 134 Ko compressés), dont
  environ 37 % ne sert pas au premier écran.

## Ce qu'on veut

Le plan paraît dès que ce qui le dessine est prêt. **Cette première image
déclenche tout le reste**, sans délai artificiel : les calques secondaires, la
carte du quartier, et le téléchargement d'un second script portant les
fonctions qu'on n'utilise pas à l'ouverture.

Critère de réussite : sur la mesure ci-dessus, le plan visible nettement plus
tôt qu'aujourd'hui, toutes les fonctions intactes, y compris quand le visiteur
les sollicite avant l'arrivée du second script.

Hors champ : la chaîne en-tête → données de `/api/plan` (deux allers-retours
à la suite, ~1 s sur réseau lent), notée pour plus tard.

## 1. Un signal : « plan affiché »

Un module `affichage.mjs` émet, **une seule fois** par page :

- à la première image deck.gl (`webgl.mjs`, `onAfterRender`, là où `gl-pret`
  est posé aujourd'hui) ;
- ou au repli SVG (`chargeWebgl` `secours` : bibliothèque absente, ou dessin
  trop long).

Il expose `quandAffiche(fn)` — appelle `fn` tout de suite si le signal est déjà
passé — et `planAffiche()` pour l'émettre. Rien d'autre n'attend une minuterie.

## 2. Première image minimale (PR 1)

**Calques.** `assembleWebgl` ne rend, tant que le signal n'est pas passé, que
le socle : blocs des stands et zones, calques de dessin, libellés. Sont
repoussés les familles invisibles à l'ouverture — `couchesFigurants`,
`coucheSurvol`, `coucheSurvolVolume`, `couchesPastilles`, `coucheFocus`,
`couchesPhareNoms` —, la frontière exacte étant fixée par le profil : on ne
repousse qu'une famille dont la compilation coûte et qu'on ne voit pas.

Après le signal, les familles repoussées entrent **une par image**
(`requestAnimationFrame` successifs) : la compilation s'étale, le plan reste
manipulable entre deux.

Une famille sollicitée avant son tour (survol, sélection, focus) entre
sur-le-champ : `GL.differees` est un ensemble, qu'un geste vide de la famille
concernée.

**Carte du quartier.** `dessineFondCarte` ne fait appel à `poseCarteGL` (donc à
`chargeMapLibre`) qu'après le signal ; avant, il ne dessine rien et
`quandAffiche` le rappelle. Les tuiles matricielles (fond sans `style`) ne
changent pas : elles ne coûtent pas de compilation.

## 3. Deux scripts (PR 2)

**Construction.** Pour le seul point d'entrée `plan` de la page publique,
`modules.js` passe esbuild en `format: "esm"`, `splitting: true`. Il en sort :

- `versions/plan.<empreinte>.js` — le premier script ;
- `versions/suite.<empreinte>.js` — le second, et un éventuel morceau commun
  qu'esbuild extrait, chacun sous `versions/`.

La balise devient `<script type="module">`. CSP : `script-src 'self'` couvre
déjà `/versions/`. Le service worker range déjà `/versions/*.js` en cache
(`_sw.js` `BIBLIOTHEQUES`). Les cartes de correspondance suivent chaque
fichier.

**Pages inchangées.** `plan-admin` et la démonstration `plan-smcl` (publiable
en artefact, donc d'un seul tenant) se construisent sans découpage : esbuild
résout alors `import()` sur place, et le comportement est le même, sans
attente.

**Le déclencheur.** Le premier script fait, au signal :
`import("./plan-suite.mjs")`. `plan-suite.mjs` importe les modules repoussés et
branche ce que `lancement.mjs` branchait d'eux.

**Ce qui part dans la suite.** L'itinéraire (`itineraire`, `tiroir-itineraire`,
`trace-itineraire`, `sejour`), `journee`, `parcours`, `tiroir-parcours`,
`suggestion`, `rappels`, `tutoriel`, `installation`, `partage`, `qr`,
`figurants`. La liste exacte se cale sur ce qu'on parvient à détacher
proprement ; un module qui ne se détache qu'au prix d'une porte par appel reste
dans le premier script.

**Couper les liens.** Les importateurs n'y prennent le plus souvent que de
petits utilitaires (`pointRepere`, `nomRepere`, `ecritDistance`,
`oublieGrilles` ; `PARCOURS`, `dansParcours` ; `ITI`, `relance`). Ils sortent
dans des modules légers que les deux scripts partagent — `reperes-noms.mjs`,
`parcours-etat.mjs`, `iti-etat.mjs`, noms à confirmer à l'écriture. Les vraies
actions (ouvrir l'itinéraire, lancer le tutoriel, ouvrir la journée…) passent
par une porte, `suite.mjs` :

```js
export function suite(){ /* la promesse de l'import, partagée */ }
// ex. : suite().then(s => s.versItineraire(cible))
```

Clic avant l'arrivée du second script : l'action attend la promesse, déjà en
route, puis s'exécute. Le bouton ne change pas d'aspect — l'attente se compte
en dixièmes de seconde.

**Garde-fou.** La construction lit le `metafile` d'esbuild et **échoue** si un
module déclaré « de la suite » se retrouve dans le premier script, en nommant
la chaîne d'imports qui l'y a tiré. Elle affiche le poids des deux scripts.

## 4. Vérification

- Le script de mesure (film du chargement et profil, téléphone simulé)
  compare avant et après, variantes alternées dans un même lancement : instant
  où le plan paraît, durée des tâches longues qui suivent.
- `npm run verifie`, `npm run navigateur`, `npm run essais` passent.
- Un essai navigateur dédié : réseau ralenti sur `versions/suite.*`, clic sur
  l'itinéraire avant son arrivée → l'itinéraire s'ouvre.
- `plan-admin` et `plan-smcl` : un seul script, et leurs essais passent.

## Livraison

Deux PR, dans l'ordre : **PR 1** (sections 1 et 2), mesurée seule ; puis
**PR 2** (section 3).
