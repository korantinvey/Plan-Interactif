# Plan interactif

Plans de salon interactifs alimentés par Klipso (API GAIA), avec une console
d'administration multi-événements.

```
web/                     pages publiques et console
supabase/migrations/     schéma de la base
supabase/functions/      synchronisation et API publique
outils/                  scripts de récupération et d'allègement des SVG
```

## Ce que fait le système

Klipso détient le **qui** (exposants, stands, zones) et le **où** (géométrie des
formes, calques d'habillage). Une fonction serveur va chercher les deux, les
normalise, et écrit un instantané. La page publique ne lit que cet instantané :
elle reste servie même si Klipso est indisponible, et la clé API ne quitte
jamais le serveur.

Points établis pendant l'étude de l'API, à ne pas redécouvrir :

- La géométrie est du **WKT en mètres** dans le repère AutoCAD du parc. La
  conversion écran est `x' = x`, `y' = −y`, faite une seule fois à l'import.
  Elle est démontrée par la concordance entre `Plan.Shape` et le `viewBox` des
  SVG que Klipso génère lui-même.
- La pagination **exige un tri explicite**. Sans `order`, des enregistrements
  disparaissent silencieusement — 19 stands sur 239 lors du premier essai.
- Les **libellés de calques ne sont pas des identifiants** : le calque des
  secteurs s'appelle `INFOPRO_SECTEURS_DELIMITATION` dans deux pavillons et
  `…DELIMITATIONS` dans le troisième. Tout est indexé sur les GUID.
- Le jeton GAIA vit **15 minutes**. On le garde 13. Cela n'a aucun rapport avec
  la fréquence de rafraîchissement du plan, qui se règle par événement.

## Quand les champs ne s'appellent pas pareil

Un salon ne nomme pas ses champs comme le voisin. Klipso porte l'enseigne d'un
exposant dans une propriété personnalisée — `x_Catalogue_RaisonSociale` sur l'un,
autre chose sur l'autre, le préfixe `x_` disant justement qu'elle appartient au
dossier. Eventmaker, lui, laisse l'organisateur nommer les champs de ses fiches :
`num_stand`, `enseigne`, `rubriques2` ici, rien de tel ailleurs.

Ces noms ont d'abord été écrits dans la synchronisation. Un salon qui nommait
autrement produisait des fiches vides — au mieux ; au pire, un numéro de stand
introuvable et pas un exposant sur le plan — et la correction demandait un
déploiement. La console porte donc une fenêtre **Correspondance des champs**,
dans les réglages de l'événement.

Elle procède en deux temps :

1. **Détecter les champs** interroge la source. Côté Klipso, le schéma déclare
   ce qui existe et un échantillon de fiches dit ce qui est rempli ; côté
   Eventmaker, où l'API ne publie aucune liste de champs, quelques fiches
   d'exposant sont lues et l'on relève ce qu'elles portent. Le résultat est
   retenu à côté de l'événement : rouvrir la fenêtre ne redemande rien.
2. **Associer** chaque cible de la fiche détail — enseigne, raison sociale, site
   web, coordonnées, nomenclature — au champ d'origine qui la porte. Un exemple
   de valeur accompagne chaque champ, seul moyen commode de distinguer
   `x_Catalogue_RaisonSociale` de `x_Catalogue_Enseigne`.

Deux cibles ne s'affichent pas mais décident de tout : le **numéro de stand** et
l'**identifiant de dossier**, par lesquels une fiche Eventmaker retrouve son
emplacement sur le plan. Mal réglées, aucun exposant n'apparaît — c'est le
premier endroit où regarder.

Une cible laissée « par défaut » garde le champ qu'utilisait la synchronisation :
un salon déjà en service ne change pas de comportement, et une cible ajoutée
plus tard ne le fait pas non plus. « Aucun » est un réglage à part entière — la
cible reste vide. Le réglage s'applique à la synchronisation suivante.

Un effet de bord utile côté Klipso : adresse, ville, pays, téléphone et réseaux
sociaux n'y étaient pas repris faute de savoir où les prendre. Ils sont
désormais des cibles comme les autres — sans défaut, parce que rien ne les porte
d'office, mais réglables dès que le salon a les champs correspondants.

## Le parcours de visite

Le visiteur retient des exposants — par le signet en tête de leur fiche — et des
conférences — par celui posé à côté de chaque ligne du programme d'une zone
organisateur, ou depuis la fiche de la conférence. Un bouton de la barre du haut
ouvre la liste, portant le nombre de choses retenues ; ce qui y figure porte un
liseré sur le plan, une zone entrant par les conférences qu'elle abrite.

La fonction se retire depuis « Réglages du plan », en administration, avec les
icônes de zoom et l'échelle : décocher « Proposer le parcours de visite » fait
disparaître d'un coup le bouton, les signets et le liseré. Comme les autres
réglages, il faut publier la configuration pour que le changement parvienne aux
visiteurs. Le retrait ne détruit rien — les listes déjà constituées sur les
téléphones réapparaissent si le réglage se rouvre.

Cette liste **ne quitte jamais l'appareil** : elle vit dans le stockage local du
navigateur, sous une clé par événement (`plan-parcours:<slug>`), et ne contient
que des identifiants. Rien n'est envoyé au serveur, aucun compte n'est demandé,
et un exposant renommé entre deux visites s'affiche sous son nouveau nom — les
libellés sont relus dans les données à chaque affichage. Ce que le plan ne
connaît plus est écarté au chargement, pour qu'un stand démonté ne laisse pas
un rang mort.

## Créer le projet Supabase

1. Sur **supabase.com**, créez un compte puis un projet.
2. Choisissez une **région européenne** (Paris ou Francfort) : les données sont
   nominatives et la latence compte pour un plan consulté sur place.
3. Notez le **mot de passe de la base** dans un gestionnaire de mots de passe ;
   il n'est plus affiché ensuite.
4. Le provisionnement prend une ou deux minutes.
5. Dans **Project Settings → API**, relevez l'URL du projet, la clé `anon` et la
   clé `service_role`. Reportez-les dans un `.env` local, copié de
   `.env.example`.

Attention au **plan gratuit** : le projet se met en pause après une semaine sans
activité. C'est sans conséquence en développement, rédhibitoire pour un salon en
cours. Prévoyez le passage au plan payant avant l'ouverture.

## Déployer à la main, la première fois

Le déploiement courant est automatique — voir « Ce qui se fait tout seul ». Ce
qui suit sert à l'installation initiale, ou à reprendre la main quand il le
faut : poser les secrets, relier un projet neuf.

Le CLI est installé comme dépendance de développement du projet — l'installation
globale par npm n'est pas prise en charge par Supabase, et `npx supabase@latest`
ouvre une invite de confirmation qui casse tout collage groupé.

```bash
npm install
```

Puis, **une commande à la fois** : `login` ouvre le navigateur et `db push`
demande le mot de passe de la base.

```bash
npx supabase login
npx supabase link --project-ref jylkfskotuafptaxujao
npx supabase db push
npx supabase secrets set KLIPSO_INSTANCE=infoprodigital
npx supabase secrets set KLIPSO_API_KEY=...
npx supabase secrets set EVENTMAKER_TOKEN=...
npx supabase secrets set ORIGINES_AUTORISEES=https://mon-domaine
npm run fonctions
```

`EVENTMAKER_TOKEN` n'est nécessaire que si un domaine — exposants, conférences
— est réglé sur Eventmaker. `ORIGINES_AUTORISEES` complète la liste inscrite
dans le code : sans elle, une nouvelle adresse de déploiement se verra refuser
les appels.

La référence du projet est la partie variable de l'URL :
`https://<référence>.supabase.co`.

## Reprendre le projet depuis un autre appareil

Deux modes de Claude Code se ressemblent et ne se valent pas ici.

Le **contrôle à distance** pilote une session qui tourne *sur votre
ordinateur* : le téléphone n'est qu'une télécommande. Dès que le poste dort ou
se déconnecte, la session tombe, et l'écran affiche « La session de contrôle à
distance est hors ligne ». Rien n'est perdu, mais rien ne continue non plus.

Les **sessions cloud** (claude.ai/code) tournent dans un conteneur distant,
sans lien avec vos machines : on ouvre le dépôt depuis n'importe quel appareil,
et le travail se poursuit. C'est le mode à utiliser pour reprendre en mobilité.

Le conteneur part d'un clone nu. `.claude/hooks/session-start.sh` l'équipe au
démarrage — `npm install`, puis `npm run construire` — de sorte que la chaîne
de fabrication est opérationnelle dès la première commande. Le hook ne
s'exécute qu'à distance ; sur un poste, il sort immédiatement.

Ce qui ne voyage pas, et n'a pas à voyager : le fichier `.env` et les sessions
des CLI. C'est sans conséquence, parce que plus rien n'en dépend au quotidien —
voir la section suivante.

## Ce qui se fait tout seul

Une poussée suffit. Trois chaînes s'enclenchent, chacune sur ce qui la
concerne :

| ce que vous poussez | ce qui se passe | qui s'en charge |
|---|---|---|
| `outils/gabarit/` | les pages de `web/` sont reconstruites et validées | `.github/workflows/pages.yml` |
| `web/`, `src/` | le site et le Worker sont redéployés | Cloudflare, par son intégration Git |
| `supabase/` | migrations appliquées, fonctions redéployées | `.github/workflows/supabase.yml` |

La reconstruction des pages mérite un mot. `web/` est versionné parce que
Cloudflare sert sans étape de construction, ce qui laissait la place à un oubli
coûteux : un module modifié, une reconstruction sautée, et les visiteurs
recevaient l'ancienne page. Le workflow reconstruit désormais lui-même et
valide le résultat sur la branche poussée. Une retouche du gabarit faite depuis
un téléphone suffit donc, et le commit produit réveille à son tour Cloudflare.

Il pousse avec le jeton de l'action, qui ne redéclenche aucun workflow : la
reconstruction ne peut pas s'appeler en boucle. Sur une pull request, il se
borne à signaler l'écart — la branche peut venir d'une bifurcation, où l'action
n'a pas le droit d'écrire.

### Les deux secrets à créer

Sans eux, le workflow Supabase s'exécute et **échoue** sur l'authentification —
bruyamment, et c'est voulu : un échec silencieux laisserait croire qu'une
migration est passée. Ils se posent dans **Settings → Secrets and variables →
Actions** du dépôt :

| secret | où le trouver |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | supabase.com/dashboard/account/tokens, « Generate new token » |
| `SUPABASE_DB_PASSWORD` | le mot de passe de la base, noté à la création du projet |

**Le jeton d'accès expire le 1er septembre 2027.** Ce jour-là le déploiement
repassera au rouge sur une erreur d'authentification, sans autre explication :
il faudra en générer un nouveau et remplacer le secret. La panne paraîtra
mystérieuse à qui ne l'a pas lu ici.

La référence du projet n'est pas un secret — c'est le sous-domaine de l'API.
Elle est inscrite dans le workflow, et une variable de dépôt
`SUPABASE_PROJECT_REF` la remplace si le projet change.

Les secrets des fonctions — `KLIPSO_API_KEY`, `EVENTMAKER_TOKEN`,
`ORIGINES_AUTORISEES` — restent posés côté Supabase par `npx supabase secrets
set`. Ils n'ont pas à transiter par GitHub, et le déploiement ne les touche
pas.

`workflow_dispatch` permet de relancer le déploiement Supabase à la main depuis
l'onglet **Actions**, sans rien pousser.

## Fabriquer les pages

Les pages de `web/` sont assemblées à partir des modules de `outils/gabarit/`,
puis **versionnées** : c'est ce qui permet à Cloudflare de les servir sans étape
de construction. Le revers est qu'on peut modifier un module et oublier de
reconstruire — le dépôt paraît juste, et les visiteurs reçoivent l'ancienne page.

```bash
npm run construire   # gabarit/ → tpl-multi.html → web/*.html
npm run verifie      # reconstruit, et signale si web/ était en retard
npm run essai        # sert web/ sur http://localhost:4180
```

`npm run verifie` sort en erreur si les pages versionnées ne correspondaient pas
à leurs sources. Le workflow Pages fait ce travail à votre place sur toute
poussée ; lancer `verifie` localement reste plus rapide que d'attendre le
retour de l'intégration, et évite un commit de reconstruction en plus du vôtre.

## Vérifier les fonctions

Les fonctions de `supabase/functions/` tournent sur Deno, pas sur Node : elles
importent leurs dépendances par une adresse, et s'appuient sur `Deno.serve` et
`Deno.env`. Elles sont écrites en TypeScript, et Supabase les type au moment du
déploiement — c'est-à-dire après une poussée sur `main`, c'est-à-dire trop tard.

```bash
npm run typage       # deno check sur les fonctions et leurs modules partagés
```

Deno est récupéré à la volée, il n'y a rien à installer. Le workflow Supabase
lance cette vérification avant d'appliquer les migrations : une fonction qui ne
type pas ne doit pas laisser le schéma en avance sur le code qui le lit.

## Tout remettre en place ailleurs

Rien n'est fait à la main : chaque élément est dans le dépôt, et cet ordre suffit
à reconstituer l'ensemble sur un compte neuf.

| Élément | Où il vit | Comment il s'applique |
|---|---|---|
| Schéma de la base | `supabase/migrations/` | poussée sur `main` (ou `npm run bd`) |
| Fonctions serveur | `supabase/functions/` | poussée sur `main` (ou `npm run fonctions`) |
| Secrets Supabase | nulle part — c'est voulu | `npx supabase secrets set …` |
| Secrets GitHub | nulle part — c'est voulu | Settings → Secrets and variables → Actions |
| Pages | `outils/gabarit/` → `web/` | reconstruites à la poussée |
| Worker et cache | `src/index.mjs`, `wrangler.jsonc` | déployé à chaque poussée sur `main` |
| Configuration livrée | `outils/gabarit/_config.js` → `web/config.js` | reconstruite à la poussée |
| Données de démonstration | `outils/plans.json` → `web/plan-smcl.html` | reconstruites à la poussée |
| Automatisation | `.github/workflows/` | appliquée dès la fusion dans `main` |

Les migrations sont numérotées et rejouables : `db push` n'applique que celles
qui manquent. Les fonctions, elles, se redéploient entièrement à chaque fois.

## Emprunts

Les pictogrammes des points d'intérêt — sanitaires, ascenseur, escalier,
information, restauration… — viennent de **Material Symbols** (Google), sous
licence Apache 2.0. Ils sont recopiés dans la page plutôt qu'appelés à
distance : une page publiée ne doit dépendre d'aucun service tiers pour
s'afficher, et le plan se consulte parfois sur un réseau de salon capricieux.

## Sécurité

La clé `service_role` contourne toutes les règles de sécurité de la base. Elle
n'a sa place que dans les variables d'environnement des fonctions, jamais dans
une page, jamais dans le dépôt. La clé Klipso donne accès à l'ensemble des
données de l'événement, commentaires commerciaux compris : même règle.

## Mise en ligne

Trois briques, chacune à sa place :

| brique | rôle |
|---|---|
| **GitHub** | le dépôt |
| **Cloudflare Pages** | sert `web/` — pages statiques, sans build |
| **Supabase** | base, API, synchronisation |

### Le dépôt

```bash
git remote add origin https://github.com/VOTRE_COMPTE/plan-interactif.git
git branch -M main
git push -u origin main
```

Rien de secret n'y est versionné : `.env` est exclu, les clés vivent dans les
secrets Supabase, et la console demande l'adresse du projet et la clé publique
au premier lancement puis les garde sur le poste.

### Cloudflare Pages

Dans le tableau de bord Cloudflare, **Workers & Pages → Create → Pages →
Connect to Git**, puis :

| réglage | valeur |
|---|---|
| Build command | *laisser vide* |
| Build output directory | `web` |
| Root directory | *laisser vide* |

Il n'y a rien à compiler : `web/` contient des pages autonomes. Chaque poussée
sur `main` redéploie.

Adresse de service :

    https://plan-interactif.interactiveplan.workers.dev

Les pages :

Cloudflare sert les pages sans l'extension `.html`.

| adresse | rôle | accès |
|---|---|---|
| `/plan?plan=<slug>` | le plan des visiteurs | libre |
| `/plan-admin?plan=<slug>` | le même, avec calques et dessins | authentifié |
| `/admin-plans` | la console des événements | authentifié |

La page publique ne contient aucune commande d'administration : elles sont
retirées du document au chargement. La page d'administration exige une session
Supabase valide, vérifiée auprès du serveur à chaque ouverture.

### À faire côté Supabase

Créer le compte administrateur dans **Authentication → Users → Add user**, avec
un mot de passe. C'est ce compte qui ouvre la console ; il n'y a pas
d'inscription libre, et c'est voulu.

### Sécurité des fonctions

`sync-evenement` exige un utilisateur authentifié : elle écrit en base et
interroge Klipso avec la clé de l'organisateur. La simple clé publique, qui
circule dans toutes les pages, ne suffit pas.

`plan-public` reste en lecture libre — c'est son rôle — mais les deux fonctions
n'annoncent leurs en-têtes CORS que pour les origines déclarées dans
`ORIGINES`. Toute nouvelle adresse de déploiement doit y être ajoutée.
