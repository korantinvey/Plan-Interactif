# Sonde de performance — plan de construction

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** chaque visite du plan (public, admin, borne) dépose en silence un résumé de performance dans Supabase ; le rapport d'utilisation le montre, et une fiche GitHub hebdomadaire en tire des pistes.

**Architecture:** un module navigateur `sonde.mjs` (mesures partagées avec `releve.mjs`) envoie un résumé ≤ 4 Ko au Worker (`/api/sonde` → RPC `sonde_publique`) ou, sur la page admin, directement à la RPC authentifiée `sonde_admin`. La base garde une ligne par visite (30 j) et un bilan quotidien (90 j). Le rapport lit `performances_du_salon` ; `outils/performances.js` lit la base chaque lundi et ouvre une issue `performances`.

**Tech Stack:** modules ES du gabarit (`outils/gabarit/modules/`), Worker Cloudflare (`src/index.mjs`), Postgres Supabase (plpgsql, pg_cron), Playwright, PGlite (essais de base), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-21-sonde-de-performance-design.md` — à lire avant chaque tâche.

## Global Constraints

- Code, commentaires, messages de commit et textes visibles en **français accentué** ; les commentaires disent *pourquoi* (ton du dépôt).
- Après toute retouche de `outils/gabarit/` : `npm run construire` ; `CARTE.md` reconstruit fait partie du commit. Ne jamais éditer `web/`, `outils/tpl-multi.html`, `CARTE.md` à la main.
- Migration créée par `npm run migration -- "Sonde de performance"` (horodatée) ; rejouable (`create … if not exists`, `create or replace`, `cron.schedule` sous garde `pg_extension`, comme `20261010121534_les_erreurs_des_pages_du_plan.sql`).
- Résumé : **4 Ko** au plus sérialisé (RPC refuse au-delà) ; corps du Worker **6 Ko** au plus.
- Quotas par salon et par jour : `plan` **300**, `admin` **50**, `borne` **50** ; pour `plan`, les **100** premières visites entrent, puis probabilité `100 / n`.
- Rétention : `releve_perf` **30 jours** ; `perf_bilan`, `perf_jour` **90 jours**.
- Envois : **10 s** après `plan-affiche` ; à chaque `visibilitychange` caché / `pagehide` ; toutes les **10 min** si visible et gestes depuis le dernier envoi. Borne : nouvel UUID toutes les **heures**. File hors ligne `localStorage["plan-sonde"]` : **5** résumés, **7 jours**.
- Refus de mesure (`mesureOuverte()` faux) : rien, sauf page admin. Avec `?perf` : la sonde ne tourne pas.
- Aucune boucle `requestAnimationFrame` hors d'un geste et de sa traîne de 300 ms.
- Ni agent utilisateur complet, ni identité, ni slug dans une issue (étiquette `salon-` + 4 premiers caractères de `md5(evenement_id)`).
- Aucune clé dans le dépôt ; le script hebdomadaire lit `SUPABASE_ACCESS_TOKEN` et `GITHUB_TOKEN` de l'environnement.

## Review Focus

1. **Visite à cheval sur minuit** : la ligne garde le `jour` de sa première réception ; un envoi après minuit la remplace sans la compter dans le quota du lendemain. → essai en Tâche 1.
2. **Résumé trop gros** (beaucoup de fichiers lourds, noms longs, scripts fautifs) : la sonde tronque d'elle-même sous 4 Ko au lieu de se faire refuser à chaque envoi. → essai en Tâche 4.
3. **Page rendue par le cache arrière** (`pageshow` avec `persisted`) : c'est une nouvelle visite (nouvel UUID, jalons de chargement absents), pas la reprise de l'ancienne. → essai en Tâche 4.
4. **Session admin expirée** : l'envoi à `sonde_admin` échoue en 401 sans erreur visible ni boucle de réessai ; le résumé rejoint la file. → essai en Tâche 4.
5. **Navigateur sans `long-animation-frame` ni `performance.memory`** (Safari, Firefox) : champs absents, résumé valide, rien ne lève. → essai en Tâche 3.

---

### Task 1: La base — tables, porte publique et tirage

**Files:**
- Create: `supabase/migrations/<horodatage>_sonde_de_performance.sql` (par `npm run migration -- "Sonde de performance"`)
- Create: `outils/essais/base.js` (rejoue toutes les migrations dans PGlite)
- Create: `outils/essais/sonde-base.js`
- Modify: `package.json` (devDependency `@electric-sql/pglite` `0.5.8` ; ajouter `node outils/essais/sonde-base.js` à `essais`)

**Interfaces:**
- Produces:
  - table `releve_perf (evenement_id uuid → evenement(id) on delete cascade, visite uuid, jour date, page text check in ('plan','admin','borne'), support text, version text, mobile boolean, immersif boolean, recu timestamptz, maj timestamptz, affiche_ms integer, donnees_ms integer, transfert_ko integer, part_plus33_classique real, part_plus33_immersif real, gels integer, repeint_ms_p95 real, gpu_ms_p95 real, pertes_contexte integer, resume jsonb, primary key (evenement_id, visite))`, RLS lecture `acces_salon(evenement_id)`.
  - table `perf_jour (evenement_id, jour, page, recues integer, ecartees integer, primary key (evenement_id, jour, page))`.
  - `sonde_publique(p_slug text, p_page text, p_version text, p_visite uuid, p_resume jsonb) returns boolean`, `security definer`, exécutable par `anon, service_role`.
  - fonction interne `sonde_enregistre(p_evt uuid, p_page text, p_version text, p_visite uuid, p_resume jsonb) returns boolean` (remplacement, quota, tirage, colonnes chiffrées extraites de `p_resume`), non exposée.
  - `outils/essais/base.js` : `async function baseNeuve() → PGlite` (rôles `anon`, `authenticated`, `service_role`, schéma `auth` avec `auth.users` et `auth.uid()` lisant `request.jwt.claim.sub`, toutes les migrations dans l'ordre) et `async function commeCompte(db, id)`.

- [ ] **Step 1: Écrire `outils/essais/base.js`** selon la recette de la note « Essayer une migration sans Docker » (rôles, `auth.users (id uuid, email, raw_user_meta_data jsonb)`, `auth.uid()`, migrations triées par nom ; le premier compte inséré devient administrateur).
- [ ] **Step 2: Écrire les essais qui échouent** dans `outils/essais/sonde-base.js`, au format de `outils/essais/apercu.js` (`dit(ok, question, détail)`, sortie 1 si un échec) :
  - salon publié, visite neuve → `sonde_publique` rend `true`, une ligne, `affiche_ms` = `resume.chargement.jalons["plan-affiche"]` ;
  - même `visite` renvoyée avec un autre résumé → toujours **une** ligne, `maj` avancé, `resume` remplacé, `perf_jour.recues` inchangé ;
  - salon non publié → `false`, aucune ligne ;
  - `p_resume` de 4097 octets sérialisé → `false` ;
  - `p_visite` nul → `false` ;
  - 100 visites `plan` → toutes entrent ; avec `setseed(0.5)` puis 400 visites de plus → lignes `plan` ≤ 300 et `recues + ecartees` = 500 ;
  - 60 visites `admin` → 50 lignes, `ecartees` = 10 ; les visites `admin` ne réduisent pas le quota `plan` ;
  - **minuit** : une visite reçue le jour J, renvoyée « le jour J+1 » (forcer `jour` à J-1 sur la ligne avant le renvoi) → la ligne garde son `jour`, `perf_jour` de J+1 non touché ;
  - la migration rejouée une seconde fois → aucune erreur.
- [ ] **Step 3: Lancer** `node outils/essais/sonde-base.js` → ÉCHEC (fonction inexistante).
- [ ] **Step 4: Écrire la migration** : tables, RLS, `sonde_enregistre`, `sonde_publique`. `jour` = date dans le fuseau du salon, comme `compteur_cible`. Le tirage, pour une visite **neuve** de `plan` : `n` = `recues + ecartees` du jour ; entre si `recues < 100`, sinon si `recues < 300 and random() < 100.0 / greatest(n, 1)` ; `admin`/`borne` : entre si `recues < 50`. Refusée → `ecartees + 1`.
- [ ] **Step 5: Lancer** `node outils/essais/sonde-base.js` → tous `ok`.
- [ ] **Step 6: Commit** — `Sonde : la base reçoit une visite par ligne, sous quotas par page`.

### Task 2: La base — porte de l'admin, bilan de nuit, lecture, purge

**Files:**
- Modify: la migration de la Tâche 1
- Modify: `outils/essais/sonde-base.js`

**Interfaces:**
- Consumes: `sonde_enregistre`, `releve_perf`, `perf_jour`, `baseNeuve`, `commeCompte` (Tâche 1).
- Produces:
  - `sonde_admin(p_slug text, p_version text, p_visite uuid, p_resume jsonb) returns boolean`, `security definer` mais n'écrit que si `acces_salon(id du salon)` est vrai pour `auth.uid()` ; salon publié ou non ; `page` = `admin` ; exécutable par `authenticated` seulement.
  - table `perf_bilan (evenement_id, jour, page, mobile, visites integer, affiche_p50, affiche_p90, donnees_p50, donnees_p90, transfert_p50, part_plus33_p50, gels_moy, pertes_contexte integer, detail jsonb, primary key (evenement_id, jour, page, mobile))`, RLS `acces_salon`. `detail` : `{ vues: {classique:{p50,p90}, immersif:{p50,p90}}, appareils: [{carte, famille, visites, part_plus33_p50, affiche_p50}] (10 au plus, les plus lents), lourds: [{fichier, visites, ko_p50}] (10 au plus, les plus fréquents), etapes: {reponse, donnees, preparation, affichage: {p50,p90}} }`.
  - `bilan_perf(p_jour date) returns void` (recalcule le bilan d'un jour, rejouable), `purge_perf() returns void` (bilan de la veille, puis purge 30/90 j), tâche `pg_cron` `'perf-de-la-nuit'` à `'41 2 * * *'` sous garde.
  - `performances_du_salon(p_evenement uuid, p_jours integer default 7) returns jsonb`, `security invoker`, `authenticated` : `{ bilans: [...lignes perf_bilan de la période...], aujourdhui: {...même forme que detail, calculée sur releve_perf du jour...}, recues, ecartees }`.

- [ ] **Step 1: Ajouter les essais qui échouent** :
  - `sonde_admin` comme le premier compte (administrateur) sur un salon **non publié** → `true`, ligne `page = 'admin'` ;
  - `sonde_admin` sans `request.jwt.claim.sub`, puis comme un compte sans accès → `false`, aucune ligne ;
  - 30 visites fabriquées la veille (mobile et bureau, classique et immersif, deux cartes graphiques, fichiers lourds répétés) → `bilan_perf(veille)` produit les lignes attendues : `visites` exacts, `affiche_p50` égal à la médiane calculée dans l'essai, `detail.lourds[0].fichier` = le fichier le plus fréquent, `detail.appareils` ≤ 10 ;
  - `bilan_perf` rejoué → mêmes lignes, pas de doublon ;
  - `purge_perf()` avec une ligne `releve_perf` de 31 jours et un bilan de 91 jours → les deux effacés, ceux de 29/89 jours gardés ;
  - `performances_du_salon` comme administrateur → `bilans` non vide ; comme compte sans accès → `bilans` vide.
- [ ] **Step 2: Lancer** → ÉCHEC.
- [ ] **Step 3: Écrire** `sonde_admin`, `perf_bilan`, `bilan_perf`, `purge_perf`, la tâche cron, `performances_du_salon` (centiles par `percentile_cont`).
- [ ] **Step 4: Lancer** `node outils/essais/sonde-base.js` → tous `ok`.
- [ ] **Step 5: Commit** — `Sonde : l'admin mesuré avant publication, et le bilan de chaque nuit`.

### Task 3: Les mesures partagées, sorties de `releve.mjs`

**Files:**
- Create: `outils/gabarit/modules/mesures-page.mjs`
- Modify: `outils/gabarit/modules/releve.mjs` (importe au lieu de définir)
- Modify: `outils/gabarit/modules/webgl.mjs` (annonce `CONTEXTE_PERDU`)
- Test: `outils/essais/navigateur/releve.spec.js` (neuf)

**Interfaces:**
- Produces (dans `mesures-page.mjs`) :
  - `TRANCHES`, `SACCADE` (50), `FIN_GESTE` (300), `centile(tri, p)`, `fichier(url)` (nom seul, sans requête) ;
  - `chargement(max = 40) → { page, ressources: [{fichier, sorte, debut, ms, transfertKo, tailleKo}], transfertKo, depuisCache }` ;
  - `appareil({ agentComplet = true, gl = null } = {}) → {…}` — avec `agentComplet: false`, remplace `agent` par `navigateur: { famille, version }` (version majeure) ; avec `gl` (un contexte WebGL existant), lit la carte graphique dessus sans créer de canevas ;
  - `observe(type, f, plus)` (le `PerformanceObserver` sous garde de `releve.mjs`).
- Produces (dans `webgl.mjs`) : `export const CONTEXTE_PERDU = creeAnnonce()`, `dis(raison)` au début de `perdContexteWebgl`.

- [ ] **Step 1: Écrire l'essai** `releve.spec.js` (`@base`) : `/plan?plan=smcl-2026&perf` → la pastille paraît ; « Partager le relevé » produit un JSON où `format` = `releve-plan/1`, `appareil.agent` est une chaîne, `chargement.ressources` est un tableau. Et, page lancée avec `PerformanceObserver.supportedEntryTypes` privé de `long-animation-frame` et `performance.memory` supprimé (`addInitScript`) → le relevé partagé reste valide, aucune erreur de page (**Review Focus 5**).
- [ ] **Step 2: Lancer** `npx playwright test outils/essais/navigateur/releve.spec.js` → passe déjà (il fige le comportement actuel).
- [ ] **Step 3: Extraire** les fonctions vers `mesures-page.mjs` ; `releve.mjs` les importe ; ajouter `agentComplet`/`gl` à `appareil` ; poser `CONTEXTE_PERDU`.
- [ ] **Step 4: `npm run construire`**, relancer l'essai → passe ; `node outils/controle.js` → aucun défaut.
- [ ] **Step 5: Commit** — `Relevé : les mesures de la page sorties dans un module partagé`.

### Task 4: La sonde silencieuse

**Files:**
- Create: `outils/gabarit/modules/sonde.mjs`
- Modify: `outils/gabarit/modules/lancement.mjs` (`brancheSonde()` après `brancheMesure()`)
- Test: `outils/essais/navigateur/sonde.spec.js`

**Interfaces:**
- Consumes: `mesures-page.mjs` (Tâche 3), `CONTEXTE_PERDU`, `REPEINT_FINI`, `GL` (`webgl.mjs`), `PLAN_DEMARRE`, `quandAffiche`, `bilanLogos`, `mesureOuverte`, `supportMesure`, `SLUG`, `PLAN_ADMIN`, `BORNE`, `entetesApi` (`salon.mjs`).
- Produces: `export function brancheSonde()` ; `export function resumeSonde() → object` (le résumé courant, pour les essais : exposé aussi sur `window.__essais.sonde` quand `window.__essais` existe) ; format `"sonde-plan/1"`, groupes du tableau du § 1 de la spec.
- Envoi public : `POST /api/sonde`, corps `{ slug, page, visite, resume }` (`fetch` `keepalive` ; `navigator.sendBeacon` sur `pagehide`/caché). Envoi admin : `POST <base>/rest/v1/rpc/sonde_admin` avec `entetesApi()`, corps `{ p_slug, p_version, p_visite, p_resume }`, `fetch` `keepalive` (un *beacon* ne porte pas d'en-têtes) ; `p_version` lu des scripts sous `/versions/`.

- [ ] **Step 1: Écrire les essais qui échouent** (`@base` pour les quatre premiers), `/api/sonde` intercepté comme `/api/erreur` dans `erreurs.spec.js` :
  - après l'affichage du plan, un envoi part en ≤ 15 s ; `resume.format` = `sonde-plan/1`, `visite` est un UUID, `resume.chargement.jalons["plan-affiche"]` > 0, `resume.appareil.agent` **absent** et `resume.appareil.navigateur.famille` présent ; `JSON.stringify(resume).length` ≤ 4096 ;
  - mesure refusée (`localStorage["plan-mesure-refusee"]` posé avant le chargement) → aucun envoi en 15 s ;
  - `?perf` → aucun envoi vers `/api/sonde` ;
  - **sans geste, aucune boucle d'images** : `addInitScript` qui compte les appels à `requestAnimationFrame` faits depuis `sonde.mjs` (pile contenant `sonde`) ; plan affiché, 3 s sans geste → compte stable ; un glisser → le compte monte, puis se fige 1 s après ;
  - un glisser puis `visibilitychange` caché → second envoi, **même** `visite`, `resume.fluidite.classique.gestes` ≥ 1 ;
  - `?borne` avec `page.clock` avancé d'1 h → l'envoi suivant porte un **autre** `visite` ;
  - **trop gros** (Review Focus 2) : 60 ressources lourdes aux noms de 200 caractères injectées par `page.route` → le résumé envoyé reste ≤ 4096 ;
  - **cache arrière** (Review Focus 3) : naviguer ailleurs puis `page.goBack()` avec `pageshow.persisted` → le premier envoi qui suit porte un nouvel UUID ;
  - **admin, session expirée** (Review Focus 4) : page admin de `fenetres-admin.spec.js`, `rpc/sonde_admin` intercepté en 401 → aucune erreur de page, un seul essai d'envoi, `localStorage["plan-sonde"]` contient le résumé.
- [ ] **Step 2: `npm run construire`, lancer** `npx playwright test outils/essais/navigateur/sonde.spec.js` → ÉCHEC.
- [ ] **Step 3: Écrire `sonde.mjs`** : rien si `?perf` ou (`!PLAN_ADMIN && !mesureOuverte()`) ; UUID par `crypto.randomUUID()` ; boucle d'images démarrée par le geste et arrêtée après `FIN_GESTE` sans images ; vue lue par `GL.camera` ; `deck.metrics` lu à la fin d'un geste ; carte graphique lue sur le contexte de `GL.deck` sinon une fois en `requestIdleCallback` ; troncature sous 4 Ko (retirer d'abord les scripts des gels, puis réduire les lourds de 5 à 0, puis couper les noms à 60 caractères) ; file hors ligne sur le modèle de `mesure.mjs` (`plan-mesures`) ; `pageshow` persisté → nouvelle visite.
- [ ] **Step 4: Brancher** `brancheSonde()` dans `lancePlan` ; `npm run construire` ; relancer → tous passent ; `node outils/controle.js`, `node outils/traductions.js` → sans défaut.
- [ ] **Step 5: Commit** — `Sonde : chaque visite dépose son résumé de performance, sans rien coûter au repos`.

### Task 5: La route du Worker

**Files:**
- Modify: `src/index.mjs` (fonction `sonde`, route `/api/sonde` à côté de `/api/erreur`)
- Create: `outils/essais/sonde-worker.js` ; Modify: `package.json` (`essais`)

**Interfaces:**
- Consumes: corps `{ slug, page, visite, resume }` (Tâche 4) ; RPC `sonde_publique` (Tâche 1) ; `lieuDe`, `ecritEnProduction`, `ecartee`, `VERSION_DES_PAGES`, `CLE_PUBLIQUE`.
- Produces: `POST /api/sonde` → 204 ; 405 hors POST ; 403 autre origine ; 413 au-delà de 6144 octets ; 400 corps illisible.

- [ ] **Step 1: Écrire les essais qui échouent** sur le vrai Worker, avec un `fetch` prêté comme dans `apercu.js` : un corps valide sous l'adresse de production → un appel à `…/rest/v1/rpc/sonde_publique` avec `p_version` = `VERSION_DES_PAGES`, `p_page` ∈ {`plan`,`borne`} (tout autre → `plan`), `p_visite` et `p_resume` repris ; sous une adresse d'aperçu → 204 avec `X-Apercu: ecarte` et aucun appel ; GET → 405 ; `Origin` étranger → 403 ; 6145 octets → 413 ; `"{"` → 400 ; un gel portant `{fichier:"/versions/plan.0123456789.js", ligne, colonne}` → relayé avec `lieu` résolu par `lieuDe`.
- [ ] **Step 2: Lancer** `node outils/essais/sonde-worker.js` → ÉCHEC.
- [ ] **Step 3: Écrire `sonde(requete, env)`** sur le modèle d'`erreur`.
- [ ] **Step 4: Lancer** → tous `ok` ; `node outils/essais/apercu.js` → toujours `ok`.
- [ ] **Step 5: Commit** — `Worker : la porte des relevés de performance`.

### Task 6: Le bloc « Performances » du rapport

**Files:**
- Modify: `outils/gabarit/modules/rapport-utilisation.mjs` (`chargeRapport`, `dessineRapport`, fonction `performances(hote, p)`)
- Modify: `outils/gabarit/_console.css` si un style manque
- Test: `outils/essais/navigateur/rapport-performances.spec.js`

**Interfaces:**
- Consumes: `performances_du_salon` (Tâche 2) — forme `{ bilans, aujourdhui, recues, ecartees }`.

- [ ] **Step 1: Écrire l'essai qui échoue** : page `rapport.html` avec session simulée (comme les essais admin existants), `rpc/rapport_utilisation` et `rpc/performances_du_salon` interceptés avec un jeu fabriqué → un bloc titré « Performances » montre : « Ouverture du plan » avec médiane et 90e centile téléphone/bureau en secondes à une décimale ; « Fluidité » classique contre immersif en pourcentage d'images lentes ; « Poids » médian en Ko et les fichiers les plus fréquents ; « Appareils qui souffrent » (carte graphique, visites) ; « N visites relevées » et, si `ecartees` > 0, « dont M écartées par le plafond ». `rpc/performances_du_salon` en 404 → le reste du rapport s'affiche, le bloc dit « Pas encore de relevé ».
- [ ] **Step 2: `npm run construire`, lancer** → ÉCHEC.
- [ ] **Step 3: Écrire** le chargement (`.catch(() => null)`, comme les erreurs) et le bloc, période du rapport (`joursPeriode()`), textes échappés.
- [ ] **Step 4: `npm run construire`, relancer** → passe ; `node outils/traductions.js` sans défaut (ajouter les chaînes si la console est traduite).
- [ ] **Step 5: Commit** — `Rapport : les performances du salon, en mots simples`.

### Task 7: La fiche de pistes hebdomadaire

**Files:**
- Create: `outils/performances.js`, `outils/performances-regles.js`
- Create: `.github/workflows/performances.yml`
- Create: `outils/essais/performances.js` ; Modify: `package.json` (`"performances": "node outils/performances.js"`, essai ajouté à `essais`)

**Interfaces:**
- `performances-regles.js` : `export`(CommonJS) `REGLES: [{ id, titre, levier, applique(ind) → { touche: number, ecart: number, detail: string } | null }]` et `pistes(indicateurs) → [{ id, titre, levier, detail, gain }]` triées par `gain = touche × ecart` décroissant.
- `performances.js` : lit par l'API de gestion Supabase (`POST https://api.supabase.com/v1/projects/<ref>/database/query`, jeton `SUPABASE_ACCESS_TOKEN`, ref du projet de production de `outils/projet.js`) les 14 derniers jours de `perf_bilan` et `releve_perf` ; calcule les indicateurs par page × mobile × vue et par version ; écrit le corps de l'issue ; avec `--sec`, l'imprime sans rien publier ; sinon crée ou met à jour l'issue titrée « Performances — semaine du AAAA-MM-JJ » (lundi), étiquette `performances`, par `gh`.

- [ ] **Step 1: Écrire les essais qui échouent** (`outils/essais/performances.js`) sur des indicateurs fabriqués : chaque règle de la spec (données lentes sur téléphone ; fichier lourd présent dans > 50 % des visites ; préparation longue ; immersif moins fluide **sans** `gpuTime` → la règle se déclenche quand même ; logos lourds sur téléphone ; pertes de contexte sur une famille) produit sa piste ; un indicateur qui se dégrade entre deux versions produit une ligne « version A → version B » ; l'ordre suit `gain` ; le corps de l'issue, construit à partir de salons dont le slug est `fep27`, ne contient ni `fep27` ni aucun slug, et nomme `salon-` + 4 caractères hexadécimaux, la même étiquette pour le même `evenement_id`.
- [ ] **Step 2: Lancer** `node outils/essais/performances.js` → ÉCHEC.
- [ ] **Step 3: Écrire** les règles (seuils de départ raisonnables, commentés comme tels) et le script ; `npm run performances -- --sec` doit tourner sans jeton en mode essai sur un fichier de relevés (`--depuis <fichier.json>`).
- [ ] **Step 4: Écrire `performances.yml`** : `schedule: '17 5 * * 1'` et `workflow_dispatch` ; `permissions: issues: write, contents: read` ; `SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}`, `GH_TOKEN: ${{ github.token }}` ; `npm ci` puis `npm run performances`.
- [ ] **Step 5: Lancer** les essais → `ok` ; `npm run verifie` → `CARTE.md` à jour.
- [ ] **Step 6: Commit** — `Pistes de performance : une fiche chaque lundi, classée par gain`.

### Task 8: Vérification d'ensemble

- [ ] **Step 1:** `npm run construire && node outils/controle.js && node outils/traductions.js && npm run essais` → tout passe (sur Windows, `controle.js` ne sait pas encore nommer ses fichiers temporaires avec `\` : le lancer dans un clone LF ou sous WSL si besoin).
- [ ] **Step 2:** `npx playwright test outils/essais/navigateur/sonde.spec.js outils/essais/navigateur/releve.spec.js outils/essais/navigateur/rapport-performances.spec.js` → passe.
- [ ] **Step 3:** serveur d'essai de l'arbre, `/plan.html?plan=fep27` : un glisser en classique puis en immersif, onglet caché → l'envoi vers `/api/sonde` apparaît dans le réseau, ≤ 4 Ko. Donner le lien local à l'exploitant.
- [ ] **Step 4:** pousser la branche, ouvrir la PR ; rappeler dans sa description que la migration part en production à la fusion.
