# Suivi d'exécution — sonde de performance

Copie du registre du coordinateur (normalement hors dépôt, dans `.superpowers/sdd/`), versionnée pour qu'une autre session reprenne le chantier. Tâches 1 à 7 terminées ; reste la tâche 8 (vérification d'ensemble, PR). Les décisions R1 à R5 et les « Ruling » priment sur le plan.

# SDD ledger — plan: docs/superpowers/plans/2026-10-21-sonde-de-performance.md

Spec: docs/superpowers/specs/2026-10-21-sonde-de-performance-design.md
Branche: sonde-de-performance — arbre C:/projets/plan-sonde — départ ec99c97

## Contrôle préalable

| tâches | produit → consommé | constat |
|---|---|---|
| T1 / T2 | migration, `sonde_enregistre`, `baseNeuve`, `commeCompte` | cohérent |
| T1 / T4 | colonnes chiffrées extraites de `p_resume` ← forme du résumé | **chemins JSON non fixés** → Ruling R1 |
| T1 / T5 | `sonde_publique(p_slug,p_page,p_version,p_visite,p_resume)` | cohérent |
| T2 / T4 | `sonde_admin(p_slug,p_version,p_visite,p_resume)` | cohérent |
| T2 / T6 | `performances_du_salon` → `{bilans, aujourdhui, recues, ecartees}` | cohérent |
| T2 / T7 | `perf_bilan`, `releve_perf` lus par le script | cohérent |
| T3 / T4 | `mesures-page.mjs` (`appareil({agentComplet,gl})`, `chargement`, `observe`…), `CONTEXTE_PERDU` | cohérent |
| T4 / T5 | corps `{slug,page,visite,resume}` ; gels `{fichier,ligne,colonne}` → `lieu` | cohérent avec R1 |
| T1 seule | essais ↔ code | cohérent (`setseed` vaut pour `random()` en plpgsql) |
| T2 seule | `detail.etapes` ↔ jalons | dérivation à fixer → R1 |
| T3 seule | essai de caractérisation qui passe d'emblée | voulu (fige l'existant) |
| T4 seule | essai « boucle d'images » par la pile d'appel | **la page servie est un paquet esbuild : la pile ne nomme pas `sonde.mjs`** → Ruling R2 |
| T5 seule | cohérent |
| T6 seule | cohérent |
| T7 seule | cohérent |
| T8 seule | `controle.js` plante sous Windows (chemins `\`) | connu, contourné (copie locale) ; pas de correctif dans ce plan |

Ruling R1: forme du résumé `sonde-plan/1` fixée ici et donnée aux tâches 1, 2, 4, 5, 7 :
```
{ format:"sonde-plan/1", page, support, debut, duree,
  chargement:{ jalons:{ reponse, domPret, "plan-demarre", donnees, "plan-affiche", lcp },
               transfertKo, depuisCache, lourds:[{fichier,sorte,ms,transfertKo,tailleKo}] },
  fluidite:{ classique:{gestes, tranches:[7 entiers, tranches TRANCHES], saccades, partPlus33},
             immersif:{même forme} },
  gels:{ n, totalMs, maxMs, pires:[{ms, geste, fichier, fonction, position}] (3 au plus) },   ← amendé par R4
  reactivite:{ n, pireMs, pireType },
  gpu:{ repeints:{n,p50,p95,max}, gpuMsP95, cpuMsP95, fpsMin, densite, logos:{…bilanLogos}, pertesContexte, basculeSvg },
  memoire:{ picMo },
  appareil:{ mobile, systeme, navigateur:{famille,version}, densite, ecran, coeurs, memoireGo,
             reseau:{type,debitMbps,rttMs,economie}, carte:{fabricant,puce,webgl2,textureMax}, mouvementReduit },
  plan:{ emplacements, noeudsDom, immersifUtilise } }
```
Colonnes : affiche_ms ← chargement.jalons."plan-affiche" ; donnees_ms ← chargement.jalons.donnees ; transfert_ko ← chargement.transfertKo ; part_plus33_classique/immersif ← fluidite.<vue>.partPlus33 ; gels ← gels.n ; repeint_ms_p95 ← gpu.repeints.p95 ; gpu_ms_p95 ← gpu.gpuMsP95 ; pertes_contexte ← gpu.pertesContexte ; mobile ← appareil.mobile ; immersif ← plan.immersifUtilise ; support ← support. Champ absent → null. Étapes du bilan : reponse = jalons.reponse ; donnees = jalons.donnees ; preparation = "plan-affiche" − donnees ; affichage = "plan-affiche". — pourquoi : la base et la sonde doivent lire les mêmes chemins, le plan ne les fixait pas — si faux : renommage dans deux fichiers.

Ruling R2: l'essai « aucune boucle d'images au repos » lit un compteur exposé par la sonde (`window.__essais.sonde.images`, nombre d'images comptées) au lieu de la pile d'appel de `requestAnimationFrame` — pourquoi : le paquet servi ne nomme pas les modules dans la pile — si faux : l'essai mesure le compteur et non l'appel réel ; la sonde doit donc incrémenter le compteur dans le rappel même de la boucle.

## Avancement
Task 1: dispatched (base ec99c97, implémenteur a8712b3637f9f307c, sonnet)
Task 1: implémenté 3c5becf (34 ok) ; relecture a770f13bd6b53a5d8 (sonnet)
Task 1: relecture — spec ✅, 1 Important (plafond 300 non éprouvé, sonde-base.js ~188-193)
Task 1: minor (deferred): essai RLS passe par un refus de privilège, pas par la RLS ; commeCompte inutilisé
Task 1: minor (deferred): course entre deux envois simultanés d'une même visite neuve (migration ~558-565) — résumé du 2e non appliqué, ecartees possiblement +1
Task 1: minor (deferred): octet_length(p_resume::text) mesure la sérialisation Postgres (avec espaces) — garder une marge côté sonde/Worker
Task 1: minor (deferred): PGlite (WASM) ajouté à `npm run essais` — surveiller la CI
Task 1: fix round 1/5 (1 addressed, 0 open; commits 3c5becf..7a76790)
Task 1: minor (deferred): base.js saute la migration 20260915131103 (rappels, exige pg_cron/pg_net)
Task 1: complete (commits ec99c97..7a76790, review clean)
Task 2: dispatched (base 7a76790, implémenteur a302a0bd0761912aa, sonnet)
Task 2: implémenté e7ac6ec (65 ok)
Task 2: relecture — spec ✅ ; 1 Critical (bilan_perf/purge_perf exécutables par anon/authenticated via privilèges par défaut Supabase), 3 Important (fuseau du bilan de nuit ; bilan_perf détruit un jour purgé ; essai du plafond d'appareils trop faible)
Ruling: le bilan de nuit recalcule les trois derniers jours (current_date − 2 .. current_date) au lieu de « la veille » seule — pourquoi : `jour` est dans le fuseau du salon, la veille UTC tronque les salons à l'ouest de UTC−3, et une nuit manquée se rattrape — si faux : trois recalculs par nuit au lieu d'un, coût négligeable
Ruling: le correctif des droits s'étend à `sonde_enregistre` (même exposition probable que bilan_perf : revoke from public seul) — pourquoi : un appel direct contournerait la garde « salon publié » — si faux : un revoke de trop, sans effet
Task 2: minor (deferred): search_path sans pg_temp sur les fonctions security definer
Task 2: minor (deferred): mobile nul compté comme bureau dans perf_bilan
Task 2: minor (deferred): essai de `aujourdhui` ne compare aucune valeur
Task 2: minor (deferred): max(famille) peut mêler deux systèmes pour une même carte
Ruling: `sonde_detail` reste exécutable par `authenticated` — pourquoi : fonction security invoker soumise à la RLS, appelée par performances_du_salon (invoker) ; la révoquer casserait la lecture — si faux : un compte lit par elle ce que la RLS lui montre déjà, rien de plus
Task 2: fix round 1/5 (4 addressed, 0 open; commits e7ac6ec..a51ff86)
Task 2: complete (commits 7a76790..a51ff86, review clean)
Task 3: dispatched (base a51ff86, implémenteur af555745a551f4f73, sonnet)
Task 3: implémenté ab66fa4 (releve.spec 2/2)
Task 3: relecture — spec ✅ ; 1 Important (CONTEXTE_PERDU.dis sans garde avant le démontage : une exception d'auditeur laisse le plan « actif » sans contexte)
Task 3: minor (deferred): `appareil({agentComplet:false})` rend aussi `fenetre`, hors forme R1 → à exclure dans la tâche 4
Task 3: minor (deferred): EdgiOS classé Safari
Task 3: minor (deferred): essai « sans LoAF » ne prouve pas l'absence réelle des entrées
Task 3: minor (deferred): agentComplet:false et appareil({gl}) non essayés avant la tâche 4
Task 3: fix round 1/5 (1 addressed, 0 open; commits ab66fa4..78718d6)
Task 3: minor (deferred): essai de la garde — seule l'assertion GL discrimine ; nom « repasser en SVG » inexact ; filtre /auditeur/ large
Task 3: complete (commits a51ff86..78718d6, review clean)
Ruling R3: la sonde vise ≤ 3 500 octets de JSON.stringify pour son résumé — pourquoi : la RPC mesure octet_length(p_resume::text), sérialisation Postgres qui ajoute des espaces après « : » et « , » ; 4 096 côté navigateur serait refusé côté base — si faux : un peu de détail tronqué en trop
Task 4: dispatched (base 78718d6, implémenteur aabc739986094e104, opus)
Task 4: implémenté 2ff145b (sonde.spec 10/10, voisins 32/32) — DONE_WITH_CONCERNS : 596 lignes ; partPlus33 de releve.mjs compte >50 ms ; ligne/colonne des gels via relecture du paquet en cache ; borne et cache arrière sans `chargement`
Task 4: minor (deferred): `partPlus33` de releve.mjs compte les images > 50 ms (tranches 4..6), la sonde > 33 ms — nom trompeur côté relevé, figé par l'essai de la tâche 3
Task 4: relecture (opus) — spec ✅ sur R1/R2/R3 ; 3 Important : appareil absent des visites courtes/pannes ; appareil.mobile null sous Safari/Firefox ; la relecture du paquet entre dans `lourds`/transfertKo
Ruling R4: la conversion position → ligne/colonne des gels passe au Worker (tâche 5) ; la page n'envoie que `position` (caractère dans le fichier) — R1 amendé : gels.pires = [{ms, geste, fichier, fonction, position}] — pourquoi : décoder 420-660 Ko sur un téléphone qui vient de geler coûte une tâche longue de plus, et le fetch pollue `lourds` ; le Worker lit déjà les fichiers servis (env.ASSETS) pour les cartes — si faux : la tâche 5 fait la conversion, coût serveur négligeable
Ruling R5: « refus de la mesure en cours de visite : pousse() ne vérifie pas actif() » est traité comme Important et entre dans la correction — pourquoi : c'est un manquement au consentement, pas du poli — si faux : une ligne de plus
Task 4: minor (deferred): gpu.repeints.p50/p95 valent 0 sans repeint (SVG) au lieu de null
Task 4: minor (deferred): keydown/pointerdown hors du plan ouvrent des gestes et gonflent `gestes`
Task 4: minor (deferred): pointeur tactile resté posé fige les gestes
Task 4: minor (deferred): pousseEnCours — un envoi demandé pendant un autre attend le déclencheur suivant (borne : 1 h)
Task 4: minor (deferred): pour la tâche 5, sendBeacon part en text/plain ; le Worker ne doit pas exiger application/json
Task 4: minor (deferred): pas d'essai des bornes de la file ni de la reprise réseau ; essai du cache arrière peut se sauter en silence
Task 4: minor (deferred): sonde.mjs 596 lignes ; file et envois formeraient un module si le fichier grossit
Task 4: minor (deferred): appareil.systeme null hors Chromium (or le bilan s'en sert comme « famille »)
Task 4: fix round 1/5 (4 addressed, 0 open; commits 2ff145b..21d37ac)
Task 4: minor (deferred): repli `pointer: coarse` classe mobile un portable tactile à pointeur grossier
Task 4: minor (deferred): sous refus, la péremption de la file ne s'applique plus (rien n'est envoyé)
Task 4: complete (commits 78718d6..21d37ac, review clean)
Task 5: dispatched (base 21d37ac, implémenteur ab3f6e4a37e7a5a93, sonnet)
Task 5: implémenté 447974f (sonde-worker tout passe, apercu ok)
Task 5: relecture — spec ✅ (approuvé avec réserve) ; 3 Important : taille en caractères et non en octets ; resume tableau accepté ; split du préfixe à chaque gel
Ruling: la mesure en octets ne s'applique qu'à `/api/sonde` ; `erreur` garde sa mesure en caractères — pourquoi : hors du périmètre de la tâche, et la base borne déjà ses messages — si faux : une ligne à reprendre dans `erreur`
Task 5: minor (deferred): null mis en cache à vie pour un script illisible
Task 5: minor (deferred): variable `origine` recevant `requete.url` dans geleResolu
Task 5: minor (deferred): `ms` d'un gel non borné
Task 5: minor (deferred): pas d'essai CRLF ni de colonne 1
Task 5: fix round 1/5 (3 addressed, 0 open; commits 447974f..1de1d1e)
Task 5: minor (deferred): essai CRLF appelle env.ASSETS.fetch sans liaison à this (sans effet avec la doublure)
Task 5: complete (commits 21d37ac..1de1d1e, review clean)
Task 6: dispatched (base 1de1d1e, implémenteur a806f3b08a523093a, sonnet)
Task 6: interrompue (départ de l'utilisateur) — travail partiel abandonné ; à reprendre depuis le début dans la session cloud
Task 6: reprise dans la session cloud, branche `claude/peaceful-dirac-rljft7` (partie de `sonde-de-performance`) ; rapport-performances.spec 3/3 (dont l'anglais)
Ruling: « Depuis le début » demande 90 jours à `performances_du_salon` — pourquoi : `p_jours` nul y vaut 7, et les bilans ne se gardent que 90 jours — si faux : la période « tout » montrerait une semaine
Ruling: « N visites reçues, dont M écartées » compte recues + ecartees — pourquoi : `perf_jour.recues` ne compte que les retenues, « dont » doit désigner une partie du tout — si faux : un libellé à reprendre
Ruling: le bloc se montre aussi sur un salon sans mesure d'usage (brouillon) dès qu'il a des relevés — pourquoi : la sonde relève l'admin d'un salon non publié, c'est sa raison d'être
Task 6: minor (deferred): les médianes de la période sont des moyennes de médianes quotidiennes pesées par les visites (la base ne garde pas mieux) ; la journée en cours pèse `recues − Σ bilans`, qui compte aussi admin et borne
Task 6: au passage, deux remarques laissées par la tâche 4 dans sonde.mjs (ESLint : déstructuration inutilisée ; TypeScript : `echantillonne` générique) — `npm run verifie` échouait sur la branche
Task 6: complete
Task 7: `performances-regles.js` (6 règles, `pistes`, `regressions`), `performances.js` (relevés de 14 jours par l'API de gestion, `--sec`, `--depuis`, `--au`), `performances.yml` ; essais 27/27, dont la requête du script sur le schéma (PGlite)
Ruling: le script lit `releve_perf` seul, pas `perf_bilan` — pourquoi : le détail se garde 30 jours, deux semaines y tiennent, et des bilans quotidiens ne refont pas une médiane de semaine — si faux : une requête de plus
Task 7: minor (deferred): les repeints ne se séparent pas par vue dans le résumé : la règle immersive lit ceux des visites qui ont utilisé l'immersif
Task 7: complete


---

# Contexte donné à chaque agent

(Les chemins Windows ci-dessous ne valent que pour le poste d'origine.)

# Contexte commun à toutes les tâches de la sonde de performance

Dépôt : C:/projets/plan-sonde (arbre git, branche `sonde-de-performance`). Travaillez **uniquement** dans cet arbre ; ne touchez pas à C:/projets/Plan Interactif ni aux autres arbres.
Lisez d'abord `CLAUDE.md` (règles du dépôt) puis `CARTE.md` (index des sources avec numéros de ligne) pour vous repérer. N'ouvrez pas `web/` (fabriqué).
Spec (autorité) : `docs/superpowers/specs/2026-10-21-sonde-de-performance-design.md`.

## Contraintes globales (verbatim du plan)

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

## Décisions du coordinateur

Lisez dans `.superpowers/sdd/2026-10-21-sonde-de-performance/progress.md` les décisions **R1** (forme exacte du résumé `sonde-plan/1` et colonnes chiffrées) et **R2** (compteur d'images exposé pour l'essai). Elles priment sur toute ambiguïté du plan.

## Particularités du poste (Windows, Git Bash)

- La construction exige des fins de ligne LF (`core.autocrlf` à false dans cet arbre) : « balise de script introuvable » signifie des CRLF, pas une erreur de code.
- `node outils/controle.js` plante sous Windows (il ne remplace pas `\` dans ses noms de fichiers temporaires) : défaut connu, hors de votre tâche. Pour contrôler la syntaxe, lancez
  `node "C:/Users/kokok/AppData/Local/Temp/claude/C--projets-Plan-Interactif/18916daf-c0c3-452d-8ca0-e24e9a92a16b/scratchpad/controle-windows.js" "C:/projets/plan-sonde"`.
- Playwright : `playwright install` bloque sur ce poste. Utilisez le Chrome installé (`channel: "chrome"`), par exemple avec une config jetable hors du dépôt, ou `npx playwright test --project=bureau` si la config du dépôt suffit. Le serveur d'essai `outils/serve.js` écoute sur 4180, souvent déjà pris par une autre session : servez cet arbre sur un autre port (détourner `http.Server.prototype.listen`, cf. le script `serve-gestes.js` du même dossier scratchpad) et passez l'adresse par `PLAN_ADRESSE=http://localhost:<port>`.
- Python n'est pas installé.
- Ne poussez rien (`git push` interdit) ; commitez sur la branche locale.
