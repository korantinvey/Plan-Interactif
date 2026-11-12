# Les erreurs des visiteurs, jusqu'à un correctif — design

*21 octobre 2026 · branche `remontee-des-anomalies`*

## Pourquoi

Depuis le 10 octobre, la page du plan signale ses erreurs (`modules/erreurs.mjs`
→ Worker `erreur` → table `erreur_page`), et le rapport d'utilisation les
montre. Mais il faut aller les lire : une erreur qui frappe cent visiteurs un
samedi reste inconnue jusqu'à ce que quelqu'un ouvre le rapport du bon salon.
Et une partie des pannes n'y arrive même pas.

## Ce qu'on veut

Quand un visiteur rencontre un bug, il finit, sans geste de personne, en issue
GitHub, puis en diagnostic et, si le correctif est clair, en pull request
proposée par Claude. Les deux étapes se forcent à la main, sans attendre leur
heure.

Ce qui compte comme bug :

- une erreur JavaScript ou une promesse rejetée sans traitement, sur la page
  publique du plan (déjà captée) ;
- une **panne de chargement** qui n'est pas une panne du réseau du visiteur
  (pas encore captée, voir 1).

Hors champ : les erreurs de la page d'administration (toujours comptées comme
aujourd'hui, mais non remontées en issue), et tout bouton « signaler un
problème ».

## 1. Les pannes de chargement, signalées

`demarrage.mjs` termine sa chaîne par
`.catch(e => annonce(panneDuChargement(e), true))`. Ce `catch` avale deux
choses qui n'atteignent jamais `erreurs.mjs` :

- les réponses en erreur de `/api/plan` (HTTP 5xx, corps illisible, salon sans
  pavillon) ;
- **toute exception levée pendant `demarre(d)`**, c'est-à-dire un vrai bug du
  rendu, qui se présente au visiteur comme « Plan indisponible ».

`erreurs.mjs` exporte `signaleErreur(e, lieu)`, qui passe par la même porte
que les écoutes (plafond, dédoublonnage, refus de la mesure respecté). Le
`catch` l'appelle, sauf dans deux cas qui ne sont pas des bugs :

- `TypeError` de `fetch` : le réseau du visiteur ;
- la session expirée (déjà rejetée avec un message propre).

Le lieu vaut la première ligne de notre script dans la pile quand l'erreur en
a une (exception de `demarre`). Sinon, c'est le lieu synthétique `chargement`
et le message `HTTP <code>`, **sans le texte renvoyé par le serveur** : il peut
porter un message de la base, et ce texte va finir dans une issue publique.

Le Worker accepte déjà un lieu sans carte : `lieuDe` rend le chemin tel quel.

## 2. Ce qui a déjà été remonté — migration `erreurs_remontees`

`erreur_page.empreinte` vaut `md5(page message lieu)` : la même erreur a la
même empreinte d'un salon à l'autre et d'un jour à l'autre. C'est la clé de
l'issue.

```
erreur_remontee
  empreinte   text primary key
  issue       integer not null      -- numéro GitHub
  total       integer not null      -- occurrences comptées au dernier passage
  passage     timestamptz not null  -- date de ce passage
```

Sa RLS est activée sans aucune politique : seul le service y lit et y écrit.
Une fonction `erreurs_a_remonter()`, en `security definer` et réservée à
`service_role`, rend pour la page `plan` et les 90 jours gardés :
l'empreinte, le message, le lieu, le total, le nombre de salons et de jours
touchés, la première et la dernière occurrence, la dernière version des pages,
et l'issue et le total déjà remontés (jointure à gauche).

Une fonction `note_remontee(empreinte, issue, total)` fait l'upsert.

Quand la purge à 90 jours fait baisser un total, on ne commente pas : on
recale `total` sur la valeur lue.

## 3. La remontée — `outils/remontee.js` et `.github/workflows/anomalies.yml`

Le script Node, sans dépendance, lit par l'API de gestion Supabase
(`POST /v1/projects/<ref>/database/query`, avec le `SUPABASE_ACCESS_TOKEN`
déjà en secret) et écrit sur GitHub par l'API REST avec le `GITHUB_TOKEN` du
workflow (`issues: write`).

Pour chaque empreinte :

| situation | geste |
|---|---|
| sans issue | ouvre une issue dès la première occurrence, étiquette `anomalie`, puis `note_remontee` |
| issue ouverte, total en hausse | commente « +N depuis le <passage> », version et salons touchés |
| issue fermée, total en hausse | la rouvre avec le même commentaire : **récidive** |
| total égal ou en baisse | recale seulement |

Le titre de l'issue reprend le message tronqué à 80 caractères et le lieu
(`TypeError: x is undefined — modules/fiche.mjs:132`). Le corps contient le
message entier, le lieu, le total, le nombre de salons, la première et la
dernière occurrence, la version des pages, et l'empreinte en pied (que le
diagnostic relit). Il ne contient **aucun slug**, car le dépôt est public et
un slug nomme un client.

Un bug vu une seule fois est un bug : pas de seuil d'occurrences. Le tri se
fait en amont, `erreurs.mjs` écartant déjà extensions, scripts tiers et
erreurs d'une autre origine. Pour ne pas inonder le dépôt d'un coup (une
version cassée peut produire vingt erreurs distinctes en une heure), un
passage ouvre au plus 10 issues ; le reste
attend le passage suivant, et le résumé du workflow le dit.

Le workflow tourne chaque nuit (`43 4 * * *`) et sur `workflow_dispatch`, avec
une seule exécution à la fois (`concurrency`). `npm run anomalies` lance
`gh workflow run anomalies.yml`, suit cette exécution (`gh run watch`), puis
liste les issues `anomalie` ouvertes.

Le script s'essaie hors réseau : `--essai <fichier.json>` lit les lignes d'un
fichier au lieu de la base, et écrit les gestes prévus au lieu de les faire.
Un essai dans `outils/essais/remontee.js` couvre les quatre situations du
tableau.

## 4. Le diagnostic — tâche planifiée Claude « Diagnostic des anomalies »

C'est une tâche planifiée de l'application de bureau, qui tourne en semaine à
8 h 30 et peut aussi se lancer à la main (bouton « Exécuter maintenant », ou en
le demandant dans une session). Sa consigne :

1. Lancer `npm run anomalies` et attendre ce seul passage.
2. Lister les issues ouvertes `anomalie` sans l'étiquette `diagnostiquee`. S'il
   n'y en a aucune, s'arrêter sans rien dire.
3. Pour chacune, dans un arbre à part tiré d'`origin/main` :
   - lire le lieu, puis entrer par `CARTE.md` ;
   - au besoin, retrouver les salons touchés en base par l'empreinte ;
   - reproduire si c'est possible (`?plan=<slug>` sur le serveur d'essai, sans
     toucher aux compteurs) ;
   - commenter l'issue avec la cause, ou avec ce qui manque pour la trouver ;
   - poser l'étiquette `diagnostiquee`.
4. Quand le correctif est clair et limité, l'écrire, `npm run verifie`, puis
   ouvrir une PR qui ferme l'issue. **Jamais de poussée sur `main`, jamais de
   migration** dans une PR automatique : une migration se propose en
   commentaire.
5. Finir par une notification qui résume : issues vues, PR ouvertes.

## Essais

- Migration : rejouée dans PGlite (droits `anon`, `authenticated` et
  `service_role` simulés). `anon` et `authenticated` ne lisent pas
  `erreur_remontee`.
- `outils/essais/remontee.js` : les quatre situations, et le plafond de 10.
- Capture : `npm run construire`, puis une panne provoquée sur le serveur
  d'essai (API coupée en 500, exception injectée dans `demarre`). Seules ces
  deux-là partent vers `/api/erreur` ; une coupure réseau ne part pas.
- Bout en bout : après fusion, un `workflow_dispatch` réel, puis une
  exécution manuelle de la tâche.
