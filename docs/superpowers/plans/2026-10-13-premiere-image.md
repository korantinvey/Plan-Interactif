# Le plan d'abord — PR 1 : première image minimale — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le plan paraît avant que la carte du quartier (MapLibre) et les figurants 3D ne se préparent ; c'est sa première image peinte qui les déclenche.

**Architecture:** Un module sans import, `affichage.mjs`, porte un signal unique « plan affiché », émis par la première image deck.gl, le repli SVG ou la fin du démarrage sans WebGL, et délivré après la peinture. `environs.mjs` n'appelle MapLibre qu'après ce signal ; `webgl.mjs` ne rend les figurants qu'après lui. Aucune minuterie.

**Tech Stack:** modules ES assemblés par esbuild (`outils/modules.js`), deck.gl 9.3 (bibliothèque locale), MapLibre 4 (jsdelivr), Playwright (`outils/essais/navigateur/`).

**Spec:** `docs/superpowers/specs/2026-10-13-chargement-differe-design.md` (sections 1, 2 et 4). La PR 2 (deux scripts) aura son propre plan, une fois celle-ci mesurée.

## Global Constraints

- Code, commentaires, messages de commit : français accentué ; les commentaires disent *pourquoi*, sur le ton du dépôt (voir les en-têtes de `annonce.mjs`, `environs.mjs`).
- On travaille dans l'arbre `C:/projets/plan-chargement`, branche `chargement-differe`, jamais dans `C:\projets\Plan Interactif` (1068 commits de retard).
- `git config core.autocrlf false` dans l'arbre : la construction exige des fins de ligne LF.
- Ne jamais modifier `web/**`, `outils/tpl-multi.html`, `CARTE.md` : `npm run construire` les refait.
- Jamais de poussée forcée ; `git pull --rebase` ; `npm run construire` après toute fusion.
- Serveur d'essai à soi : port **4380** (le 4180 est pris par d'autres sessions). Commande :
  `node -e 'const h=require("http");const l=h.Server.prototype.listen;h.Server.prototype.listen=function(p,...a){return l.call(this,4380,...a)};require("C:/projets/plan-chargement/outils/serve.js")'`
  lancée depuis `C:/projets/plan-chargement`, en arrière-plan. Il relit `web/` à chaque requête : reconstruire suffit, pas de relance.
- Playwright avec le Chrome du poste, jamais `playwright install` : config jetable `playwright.chrome.config.js` (tâche 1, étape 1), supprimée avant le commit final.
- Aucune chaîne visible nouvelle (sinon traduction obligatoire dans `outils/anglais/`).
- Chaque message de commit se termine par la ligne `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (omise dans les commandes ci-dessous pour la lisibilité).

## Review Focus

1. **Le repli à 4 s tombe avant la première image WebGL** (téléphone lent) : le SVG est alors montré, et le signal doit partir — un plan est bien affiché. Couvert par l'idempotence de `planAffiche` (tâche 1) ; rien ne doit partir deux fois.
2. **Pas de WebGL2 / `?rendu=svg`** : aucune image deck.gl n'arrivera jamais. Sans émission par `demarre`, la carte du quartier ne se monterait plus du tout. Essai SVG en tâche 1.
3. **Administration : l'exploitant cale la carte** (`calage-carte.mjs` → `dessineFondCarte`) : le signal est passé depuis longtemps, MapLibre doit se monter immédiatement. Couvert par `fond-carte.spec.js` existant (tâche 3, étape 5).
4. **Changement de fond pendant l'attente** : `poseCarteGL` appelé deux fois avant le signal. Le drapeau `_monteGL` et le compteur `_genGL` existants doivent continuer d'écarter la première demande. Couvert par la reprise de leur logique telle quelle (tâche 3).
5. **Perte de contexte WebGL puis remontage** : `GL.pret` est remis à zéro, `onAfterRender` rappelle `planAffiche` — doit rester sans effet. Couvert par l'idempotence (tâche 1, essai « une seule fois »).

---

### Task 0 : Mesurer l'état de départ

**Files:**
- Create: `outils/essais/premiere-image.js`
- Modify: `package.json` (script `premiere-image`)

**Interfaces:**
- Produces: `npm run premiere-image -- <url> [essais]` → imprime, par essai et en médiane, `peint` (ms entre la navigation et la première image peinte après `gl-pret`) et `bloque` (plus longue tâche après `gl-pret`).

- [ ] **Step 1: Écrire le script de mesure**

```js
/**
 * L'instant où le visiteur voit son plan, sur un téléphone simulé.
 *
 * `gl-pret` dit que deck.gl a fini sa première image ; il ne dit pas que
 * l'écran l'a montrée. Le 13 octobre 2026, MapLibre se montait dans la
 * foulée, avant la peinture, et retenait le plan deux secondes de plus sans
 * que rien dans la page ne le trahisse. On compte donc ce que l'écran
 * peint : la première image du film (`Page.startScreencast`) postérieure à
 * `gl-pret`.
 *
 * Processeur ralenti 4×, réseau 4G : les ordres de grandeur d'un téléphone
 * moyen. Le Chrome du poste (`channel: "chrome"`), qui utilise la vraie carte
 * graphique — la compilation des programmes, c'est elle.
 *
 *   node outils/essais/premiere-image.js http://localhost:4380/plan.html?plan=fep27 3
 */
const { chromium } = require("playwright");

const [adresse, n = "3"] = process.argv.slice(2);
if (!adresse) { console.error("usage : premiere-image.js <adresse> [essais]"); process.exit(2); }

async function essai(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const c = await ctx.newCDPSession(p);
  await c.send("Network.enable");
  await c.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1e6, uploadThroughput: 3e5 });
  await c.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.addInitScript(() => {
    window.__longues = [];
    new PerformanceObserver(l => l.getEntries().forEach(e => __longues.push([e.startTime, e.duration])))
      .observe({ type: "longtask", buffered: true });
    new MutationObserver(() => {
      if (!window.__glPret && document.documentElement.classList.contains("gl-pret")) window.__glPret = performance.now();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  });
  const images = [];
  c.on("Page.screencastFrame", f => {
    images.push(f.metadata.timestamp * 1000);
    c.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await c.send("Page.startScreencast", { format: "jpeg", quality: 10, everyNthFrame: 1 });
  await p.goto(adresse, { waitUntil: "commit" });
  await p.waitForFunction(() => window.__glPret, null, { timeout: 60_000 });
  await p.waitForTimeout(5000);
  const r = await p.evaluate(() => ({ origine: performance.timeOrigin, glPret: __glPret, longues: __longues }));
  await c.send("Page.stopScreencast");
  await ctx.close();
  const peinte = images.map(t => t - r.origine).find(t => t >= r.glPret);
  const bloque = Math.max(0, ...r.longues.filter(([d]) => d + 1 >= r.glPret).map(([, d]) => d));
  return { glPret: Math.round(r.glPret), peint: Math.round(peinte ?? NaN), bloque: Math.round(bloque) };
}

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const res = [];
  for (let i = 0; i < Number(n); i++) { const r = await essai(b); res.push(r); console.log(JSON.stringify(r)); }
  await b.close();
  const med = k => res.map(r => r[k]).sort((a, z) => a - z)[Math.floor(res.length / 2)];
  console.log("médiane — gl-pret", med("glPret"), "ms · peint", med("peint"), "ms · plus longue tâche ensuite", med("bloque"), "ms");
})();
```

- [ ] **Step 2: Déclarer le script**

Dans `package.json`, `scripts`, après `"charge"` :

```json
    "premiere-image": "node outils/essais/premiere-image.js",
```

- [ ] **Step 3: Construire, servir, mesurer la référence**

```bash
cd C:/projets/plan-chargement && npm run construire
```
Serveur 4380 lancé en arrière-plan (commande des contraintes globales), puis :
```bash
cd C:/projets/plan-chargement && npm run premiere-image -- "http://localhost:4380/plan.html?plan=fep27" 5
```
Attendu (13 octobre) : `peint` ≈ 8 000 à 10 000 ms. **Noter la médiane** : c'est la référence de la PR.

- [ ] **Step 4: Commit**

```bash
git add outils/essais/premiere-image.js package.json
git commit -m "Mesure l'instant où le plan est peint, sur un téléphone simulé"
```

---

### Task 1 : Le signal « plan affiché »

**Files:**
- Create: `outils/gabarit/modules/affichage.mjs`
- Modify: `outils/gabarit/modules/webgl.mjs` (imports l. 44 ; `chargeWebgl` l. 111-128 ; `onAfterRender` l. 164-169)
- Modify: `outils/gabarit/modules/demarrage.mjs` (imports l. 37 ; `demarre` après `fit()` l. 89)
- Create: `outils/essais/navigateur/chargement.spec.js`
- Create (jetable, non commité) : `playwright.chrome.config.js`

**Interfaces:**
- Produces (`affichage.mjs`) :
  - `planAffiche(): void` — émet, une seule fois ; les inscrits partent après la peinture suivante.
  - `quandAffiche(f: () => void): void` — inscrit `f`, ou l'appelle tout de suite si c'est déjà passé.
  - `apresAffichage(): Promise<void>` — la même chose en promesse.
  - `estAffiche(): boolean`.
  - La classe `plan-affiche` sur `<html>` dès que les inscrits sont réveillés.

- [ ] **Step 1: Config Playwright jetable**

`C:/projets/plan-chargement/playwright.chrome.config.js` :

```js
// jetable : le Chrome du poste, `playwright install` bloquant ici — à ne pas commiter
const p = require("./playwright.config.js");
module.exports = { ...p, projects: p.projects.map(x => ({ ...x, use: { ...x.use, channel: "chrome" } })) };
```

- [ ] **Step 2: Écrire les essais qui échouent**

`outils/essais/navigateur/chargement.spec.js` :

```js
/**
 * Le plan d'abord : ce qui ne sert pas à la première image attend qu'elle
 * soit peinte (`modules/affichage.mjs`).
 *
 * Rien ne sort sur le réseau : les données sont celles de `plans.json`, et
 * MapLibre — chargée d'un CDN dans la vraie page — est remplacée par une carte
 * témoin qui note si le plan était déjà affiché quand on l'a construite.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe } = require("./aide");

test.describe("le plan d'abord", () => {
  test("le signal part en rendu SVG, où aucune image WebGL ne viendra", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.goto("/plan.html?plan=smcl-2026&rendu=svg");
    await attendLaListe(page);
    await expect(page.locator("html")).toHaveClass(/\bplan-affiche\b/);
    expect(erreurs).toEqual([]);
  });

  test("le signal part avec la première image WebGL, et une seule fois", async ({ page }) => {
    const erreurs = await prepare(page);
    await page.addInitScript(() => {
      window.__ajouts = 0;
      new MutationObserver(l => l.forEach(m => {
        const avant = (m.oldValue || "").split(/\s+/).includes("plan-affiche");
        if (!avant && document.documentElement.classList.contains("plan-affiche")) window.__ajouts++;
      })).observe(document.documentElement, { attributes: true, attributeFilter: ["class"], attributeOldValue: true });
    });
    await page.goto("/plan.html?plan=smcl-2026");
    await attendLaListe(page);
    const gl = await page.waitForFunction(() => document.documentElement.classList.contains("gl-pret"), null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!gl, "pas de carte graphique : le plan reste en SVG");
    await expect(page.locator("html")).toHaveClass(/\bplan-affiche\b/);
    // la vue se refait, le dessin repeint : le signal ne repart pas
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__ajouts)).toBe(1);
    expect(erreurs).toEqual([]);
  });
});
```

- [ ] **Step 3: Vérifier qu'ils échouent**

Serveur 4380 en marche, `npm run construire` fait, puis :
```bash
cd C:/projets/plan-chargement && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/chargement.spec.js
```
Attendu : FAIL sur `toHaveClass(/plan-affiche/)` (la classe n'existe pas encore).

- [ ] **Step 4: Écrire `affichage.mjs`**

```js
/* ============================================================
   Le plan est affiché — ce qui attendait peut venir

   Le visiteur vient voir le plan. Tout ce qui ne le dessine pas — la carte du
   quartier, les figurants — peut attendre qu'il soit à l'écran, et pas
   davantage : c'est la première image peinte qui les appelle, non une
   minuterie. Le 13 octobre 2026, sur un téléphone moyen, MapLibre se montait
   dans la foulée de la première image de deck.gl, avant que l'écran ait pu la
   montrer, et retenait le plan deux secondes de plus.

   Le signal part une seule fois par page, de l'un des trois endroits où le
   plan devient visible : la première image WebGL (`webgl.mjs`), le repli sur
   le SVG (`webgl.mjs` `chargeWebgl`), ou la fin du démarrage quand aucun
   dessin WebGL n'est attendu (`demarrage.mjs`). Les inscrits ne partent
   qu'après l'image suivante : le travail repoussé ne peut plus passer devant
   la peinture qu'il attendait.

   À la différence d'une annonce (`annonce.mjs`), il se souvient : qui
   s'inscrit après coup est appelé tout de suite. Sans aucun import : tous
   peuvent l'importer.
   ============================================================ */

/** @type {Array<() => void>} */
const inscrits = [];
let prevu = false, affiche = false;

/** Le plan est-il à l'écran ? */
export function estAffiche(){ return affiche; }

/** Appeler `f` une fois le plan à l'écran — tout de suite s'il y est déjà. */
export function quandAffiche(/** @type {() => void} */ f){
  if (affiche) f(); else inscrits.push(f);
}

/** La même attente, en promesse. */
export function apresAffichage(){
  return new Promise(/** @type {(ok: (v?: any) => void) => void} */ (ok) => quandAffiche(ok));
}

/** Le plan vient de devenir visible : une fois, et les suivantes ne font rien. */
export function planAffiche(){
  if (prevu) return;
  prevu = true;
  /* `requestAnimationFrame` puis `setTimeout` : le rappel passe après l'image
     que le navigateur peint, et non avant. */
  requestAnimationFrame(() => setTimeout(() => {
    affiche = true;
    document.documentElement.classList.add("plan-affiche");
    // un inscrit qui échoue ne doit pas priver les autres
    for (const f of inscrits.splice(0)){
      try { f(); } catch (e) { console.warn("Après l'affichage :", e); }
    }
  }, 0));
}
```

- [ ] **Step 5: Brancher `webgl.mjs`**

Après la ligne 44 (`import { DATA, P } from "./donnees.mjs";`) :

```js
import { planAffiche } from "./affichage.mjs";
```

Dans `chargeWebgl`, remplacer :

```js
  const secours = () => racine.classList.remove("gl-attente");
```
par :
```js
  /* Le SVG montré faute de dessin, c'est encore le plan à l'écran : ce qui
     attendait l'affichage n'a plus à attendre. */
  const secours = () => { racine.classList.remove("gl-attente"); planAffiche(); };
```

Dans `onAfterRender`, après `document.documentElement.classList.remove("gl-attente");` :

```js
      planAffiche();
```

- [ ] **Step 6: Brancher `demarrage.mjs`**

Après la ligne 37 (`import { montePlan, chargeFond } from "./rendu.mjs";`) :

```js
import { planAffiche } from "./affichage.mjs";
```

Dans `demarre`, juste après `fit();` :

```js
  /* Sans dessin WebGL attendu — `?rendu=svg`, pas de WebGL2 —, aucune image
     ne viendra dire que le plan est à l'écran : il l'est, en SVG, dès ici.
     Avec un dessin attendu, c'est sa première image qui le dira
     (`webgl.mjs`). */
  if (!document.documentElement.classList.contains("gl-attente")) planAffiche();
```

- [ ] **Step 7: Reconstruire, vérifier que les essais passent**

```bash
cd C:/projets/plan-chargement && npm run construire && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/chargement.spec.js
```
Attendu : 2 passed (ou le second « skipped » faute de GPU — sur ce poste il doit passer).

- [ ] **Step 8: Contrôles statiques**

```bash
cd C:/projets/plan-chargement && npm run lint && npm run types && npm run portes
```
Attendu : sans erreur. Si `portes` signale le nouveau module, suivre son message (liste d'acceptation `outils/portes-acceptees.json` seulement si le message le demande).

- [ ] **Step 9: Commit**

```bash
git add outils/gabarit/modules/affichage.mjs outils/gabarit/modules/webgl.mjs outils/gabarit/modules/demarrage.mjs outils/essais/navigateur/chargement.spec.js
git commit -m "Un signal « plan affiché », émis après la peinture de la première image"
```

---

### Task 2 : Les figurants après la première image

**Files:**
- Modify: `outils/gabarit/modules/webgl.mjs` (import de la tâche 1 ; `couchesFigurants` l. ~1380 ; `brancheWebgl` l. 136)
- Modify: `outils/essais/navigateur/chargement.spec.js`

**Interfaces:**
- Consumes: `estAffiche()`, `quandAffiche(f)` de `affichage.mjs` (tâche 1) ; `planifieWebgl()` (existant, `webgl.mjs` l. 456).

- [ ] **Step 1: Écrire l'essai qui échoue**

Ajouter dans le `describe` de `chargement.spec.js` :

```js
  test("les figurants n'entrent qu'après la première image", async ({ page }) => {
    const erreurs = await prepare(page);
    // à la première image, on compte ce que deck.gl reçoit
    await page.addInitScript(() => {
      new MutationObserver(() => {
        if (window.__figPremiere !== undefined || !document.documentElement.classList.contains("gl-pret")) return;
        const couches = (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(Boolean);
        window.__figPremiere = couches.filter(l => /^figurants/.test(l.id)).length;
      }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    });
    // la vue immersive fait entrer la caméra, et avec elle les figurants
    await page.goto("/plan.html?plan=smcl-2026&ambiance=immersif");
    await attendLaListe(page);
    const camera = await page.waitForFunction(() => window.__essais.GL.camera, null, { timeout: 15_000 })
      .then(() => true, () => false);
    test.skip(!camera, "pas de carte graphique : le plan reste à plat");
    await expect.poll(() => page.evaluate(() => window.__figPremiere)).toBe(0);
    await expect.poll(() => page.evaluate(() =>
      (window.__essais.GL.deck.props.layers || []).flat(Infinity).filter(l => l && /^figurants/.test(l.id)).length))
      .toBeGreaterThan(0);
    expect(erreurs).toEqual([]);
  });
```

- [ ] **Step 2: Vérifier qu'il échoue**

```bash
cd C:/projets/plan-chargement && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/chargement.spec.js -g figurants
```
Attendu : FAIL, `__figPremiere` vaut 5 au lieu de 0.

- [ ] **Step 3: Repousser les figurants**

L'import de la tâche 1 devient :

```js
import { planAffiche, estAffiche, quandAffiche } from "./affichage.mjs";
```

Première ligne de `couchesFigurants` :

```js
function couchesFigurants(){
  /* Décor : leurs programmes coûtent un tiers de seconde à compiler sur la
     première image, qu'ils retardaient sans rien apprendre au visiteur. Ils
     entrent à l'image d'après (`brancheWebgl`). */
  if (!estAffiche()) return [];
  if (!GL.camera || !cameraEnJeu() || !DATA || !P()) return [];
```

`brancheWebgl` devient :

```js
export function brancheWebgl(){
  chargeWebgl();
  // ce que la première image a laissé de côté (`couchesFigurants`) y entre
  quandAffiche(planifieWebgl);
}
```

- [ ] **Step 4: Reconstruire, vérifier que l'essai passe**

```bash
cd C:/projets/plan-chargement && npm run construire && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/chargement.spec.js outils/essais/navigateur/vue-immersive.spec.js
```
Attendu : tout passe.

- [ ] **Step 5: Commit**

```bash
git add outils/gabarit/modules/webgl.mjs outils/essais/navigateur/chargement.spec.js
git commit -m "Les figurants entrent à l'image qui suit la première"
```

---

### Task 3 : La carte du quartier après la première image

**Files:**
- Modify: `outils/gabarit/modules/environs.mjs` (imports l. 43 ; `poseCarteGL` l. 522)
- Modify: `outils/essais/navigateur/chargement.spec.js`

**Interfaces:**
- Consumes: `apresAffichage()` de `affichage.mjs` (tâche 1) ; `chargeMapLibre()` (existant, `environs.mjs` l. 338).

- [ ] **Step 1: Écrire l'essai qui échoue**

En tête de `chargement.spec.js`, compléter l'import et ajouter le témoin :

```js
const { prepare, attendLaListe, DONNEES } = require("./aide");

const MAPLIBRE = "https://cdn.jsdelivr.net/npm/maplibre-gl@4/**";
/* Une carte témoin : elle note, au chargement de la bibliothèque puis à la
   construction de la carte, si le plan était déjà à l'écran. Elle ne charge
   jamais rien d'autre. */
const MAPLIBRE_TEMOIN =
  "window.__biblioApres = document.documentElement.classList.contains('plan-affiche');" +
  "window.maplibregl = { Map: class { constructor(o){ window.__carteApres = " +
  "document.documentElement.classList.contains('plan-affiche'); } " +
  "on(){ return this; } jumpTo(){} setStyle(){} remove(){} } };";
```

Puis, dans le `describe` :

```js
  test("la carte du quartier attend que le plan soit à l'écran", async ({ page }) => {
    const erreurs = await prepare(page);
    // le premier pavillon calé sur un fond vectoriel : c'est MapLibre qui le peint
    const donnees = JSON.parse(JSON.stringify(DONNEES));
    donnees.plans[0].calage = { lon: 2.287851, lat: 48.830212, x: 0, y: 0, angle: 0, fond: "osm" };
    await page.route("**/api/plan*", (r) => {
      const url = new URL(r.request().url());
      if (url.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-quartier" } });
      if (url.searchParams.get("fond")) return r.fulfill({ json: { calques: [] } });
      return r.fulfill({ status: 200, contentType: "application/json",
                         headers: { "X-Version": "essai-quartier" }, body: JSON.stringify(donnees) });
    });
    // posée après `prepare`, cette interception passe avant la sienne
    await page.route(MAPLIBRE, (r) => r.request().url().endsWith(".css")
      ? r.fulfill({ status: 200, contentType: "text/css", body: "" })
      : r.fulfill({ status: 200, contentType: "text/javascript", body: MAPLIBRE_TEMOIN }));
    await page.goto("/plan.html?plan=smcl-2026");
    await attendLaListe(page);
    await expect.poll(() => page.evaluate(() => window.__carteApres)).toBe(true);
    expect(await page.evaluate(() => window.__biblioApres)).toBe(true);
    expect(erreurs).toEqual([]);
  });
```

- [ ] **Step 2: Vérifier qu'il échoue**

```bash
cd C:/projets/plan-chargement && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/chargement.spec.js -g quartier
```
Attendu : FAIL, `__carteApres` vaut `false` (ou `__biblioApres`). Si `__carteApres` reste `undefined` jusqu'au délai, le fond `osm` ne passe pas par MapLibre sur la page publique : relire `fondCourant()` / `styleDuFond` dans `environs.mjs` et choisir, dans la liste des fonds, un fond qui a un `style` ou un `objet`, puis corriger la donnée de l'essai avant de continuer.

- [ ] **Step 3: Repousser MapLibre**

Après la ligne 43 de `environs.mjs` (`import { solIncline } from "./camera.mjs";`) :

```js
import { apresAffichage } from "./affichage.mjs";
```

Dans `poseCarteGL`, remplacer :

```js
  chargeMapLibre().then(gl => {
```
par :
```js
  /* Ni la bibliothèque — huit cents kilo-octets à lire —, ni la carte et ses
     programmes à compiler, avant que le plan soit à l'écran : montée dans la
     foulée de la première image, la carte la retenait deux secondes sur un
     téléphone (`affichage.mjs`). Une fois le plan affiché, l'attente est nulle. */
  apresAffichage().then(chargeMapLibre).then(gl => {
```

Rien d'autre ne change dans la fonction : `_monteGL` et `_genGL` continuent d'écarter un montage devenu caduc pendant l'attente, qui est désormais un peu plus longue.

- [ ] **Step 4: Reconstruire, vérifier que l'essai passe**

```bash
cd C:/projets/plan-chargement && npm run construire && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/chargement.spec.js
```
Attendu : 4 passed.

- [ ] **Step 5: L'administration n'a pas bougé**

```bash
cd C:/projets/plan-chargement && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js outils/essais/navigateur/fond-carte.spec.js
```
Attendu : tout passe (l'exploitant cale la carte bien après le signal).

- [ ] **Step 6: Commit**

```bash
git add outils/gabarit/modules/environs.mjs outils/essais/navigateur/chargement.spec.js
git commit -m "La carte du quartier se monte après la première image du plan"
```

---

### Task 4 : Mesurer, tout éprouver, ouvrir la PR

**Files:**
- Delete (non commité) : `playwright.chrome.config.js`

- [ ] **Step 1: Mesurer après**

```bash
cd C:/projets/plan-chargement && npm run construire && npm run premiere-image -- "http://localhost:4380/plan.html?plan=fep27" 5
```
Attendu : `peint` en baisse nette sur la référence de la tâche 0 (de l'ordre de deux secondes : la durée de montage de MapLibre plus les figurants). Si le gain est inférieur à une seconde, s'arrêter et rapporter les chiffres plutôt que d'ouvrir la PR.

- [ ] **Step 2: Toute la suite**

```bash
cd C:/projets/plan-chargement && PLAN_ADRESSE=http://localhost:4380 npx playwright test -c playwright.chrome.config.js
```
```bash
cd C:/projets/plan-chargement && npm run essais && npm run lint && npm run types && npm run portes && node outils/traductions.js && npm run verifie
```
Attendu : tout passe. Exception connue sur ce poste : `verifie` peut échouer sur un ENOENT en copiant `web/versions/anglais.*.js`, y compris sur `main` propre — le noter, ne pas le corriger ici.

- [ ] **Step 3: Clone neuf**

```bash
S="C:/Users/kokok/AppData/Local/Temp/claude/C--projets-Plan-Interactif/2eff8c1d-150c-46cc-b4fc-002100a758db/scratchpad"; rm -rf "$S/clone" && git -c core.autocrlf=false clone -q -c core.autocrlf=false -b chargement-differe C:/projets/plan-chargement "$S/clone" && cd "$S/clone" && npm ci --silent && npm run construire && node outils/controle.js && git status --porcelain web && node outils/traductions.js
```
Attendu : construction et contrôle sans erreur, `git status` vide.

- [ ] **Step 4: Retirer la config jetable, pousser, ouvrir la PR**

```bash
cd C:/projets/plan-chargement && rm playwright.chrome.config.js && git status --short && git push -u origin chargement-differe
```
Puis `gh pr create` — titre « Le plan d'abord : la carte du quartier et les figurants après la première image », corps : les chiffres avant/après de `premiere-image` (médianes), ce qui a été repoussé et pourquoi (profil), l'essai écarté de la compilation asynchrone, la PR 2 à suivre. Terminer le corps par la ligne d'attribution de session.
