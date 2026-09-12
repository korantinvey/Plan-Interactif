# Plan interactif — repères de travail

Plans de salon interactifs alimentés par Klipso (API GAIA), avec une console
d'administration multi-événements. Le `README.md` décrit le système et son
déploiement ; ce fichier ne retient que ce qui se paie cher quand on l'ignore.

## La chaîne de fabrication, et son piège

Les pages de `web/` ne sont pas écrites à la main : elles sont **assemblées**
depuis `outils/gabarit/`, puis **versionnées**, car Cloudflare les sert sans
étape de construction.

```
outils/gabarit/*.html → outils/tpl-multi.html → web/*.html
outils/gabarit/_console.css                   → web/console.css
outils/gabarit/** + supabase/**               → CARTE.md
```

Le piège tient en une phrase : modifier un module de `outils/gabarit/` sans
reconstruire laisse un dépôt d'apparence juste, et des visiteurs qui reçoivent
l'ancienne page. Donc, après toute retouche du gabarit :

```bash
npm run construire   # reconstruit web/
npm run verifie      # reconstruit, et sort en erreur si web/ était en retard
```

Les pages reconstruites font partie du commit. Le workflow `Pages` rattrape
l'oubli — il reconstruit et valide sur la branche poussée — mais ne comptez pas
dessus : il ajoute alors un commit par-dessus le vôtre, que vous devrez tirer
avant de pousser à nouveau. Lancez `npm run verifie` avant de valider.

## Ne jamais modifier directement

- `web/*.html`, `web/console.css`, `web/config.js` — sortie de la
  construction ; éditez `outils/gabarit/`.
- `outils/tpl-multi.html` — intermédiaire, régénéré par `assemble.js`.
- `CARTE.md` — index relu dans les sources par `carte.js`. Pour le corriger,
  corrigez ce qu'il décrit : un bandeau de section, un nom de fonction.

## Plusieurs sessions en parallèle

Deux conversations ouvertes sur le même dépôt se heurtaient à deux endroits.
Les deux sont désamorcés, chacun avec un geste qui l'accompagne.

**Les fichiers fabriqués ne se fusionnent plus.** `.gitattributes` marque
`web/**`, `outils/tpl-multi.html` et `CARTE.md` en `merge=ours` : git garde la
version en place au lieu de mélanger deux reconstructions — une ligne de gabarit
en réécrivait mille, recopiées quatre fois, et le conflit portait sur du contenu
que personne n'avait tapé. Le geste qui va avec n'est pas optionnel : **après
toute fusion ou rebasage, `npm run construire`**, sans quoi `web/` ne reflète
qu'une des deux branches. `npm run verifie` le signale, le workflow `Pages` le
rattrape — un commit plus tard, à retirer avant la poussée suivante.

**Les migrations sont horodatées à la seconde**, non plus numérotées à la
suite : `npm run migration -- "Titre"` produit `AAAAMMJJHHMMSS_titre.sql`.
Deviner « le numéro suivant » revenait à le prendre en même temps que l'autre
session, puis à renommer un fichier peut-être déjà appliqué en production. Une
migration partie sur `main` ne se renomme jamais : elle y est enregistrée sous
son ancien nom, et rejouerait sous le nouveau.

**Jamais de poussée forcée.** Le workflow `Pages` commite sur la branche poussée
quand `web/` était en retard : le clone local se retrouve derrière sans l'avoir
vu, et un `--force` efface alors le travail d'à côté. `git pull --rebase`, et
`npm run verifie` avant de valider pour que le robot n'ait rien à ajouter.

## Données figées

`web/plan-smcl.html` embarque ses données au lieu d'appeler l'API : c'est la
version de démonstration, publiable en artefact (une page publiée ne peut
appeler aucune API externe). Sa source est `outils/plans.json`, **versionnée**
— sans elle la construction échoue sur un clone neuf, et elle ne se régénère
qu'avec une clé Klipso. Les mêmes données sont déjà dans la page publiée : la
versionner n'expose rien de plus.

## Où vit quoi

| | |
|---|---|
| `outils/gabarit/` | la source des pages |
| `web/` | les pages construites, servies par Cloudflare |
| `supabase/migrations/` | schéma de la base — horodatées, rejouables |
| `supabase/functions/` | synchronisation Klipso et API publique |
| `src/index.mjs` | Worker Cloudflare : relais et cache de `/api/plan` |
| `.github/workflows/` | reconstruction des pages, déploiement Supabase |

## Chercher sans tout ouvrir

Le dépôt est petit, et pourtant coûteux à lire en aveugle : `web/` recopie
`outils/gabarit/` en quatre exemplaires, si bien qu'une recherche de « calque »
remontait 444 lignes dont 400 étaient la même chose recopiée. Trois choses
règlent cela — servez-vous-en avant d'ouvrir quoi que ce soit.

- **`CARTE.md`** est l'index des sources : pour chaque module, ses sections, ses
  fonctions et ses identifiants, **avec les numéros de ligne**. Il est produit
  par `npm run construire` et vérifié par `npm run verifie` — il ne peut donc
  pas mentir. C'est le premier fichier à lire, et souvent le seul avant d'aller
  droit au bon endroit.
- **`.ignore`** retire de la recherche plein texte `web/`, `tpl-multi.html` et
  `plans.json` : ils sont fabriqués ou figés, on n'y corrige rien. Ils restent
  lisibles en les nommant, quand il faut vraiment vérifier une page construite.
- **Deux modules dépassent 1300 lignes.** On y entre par tranche
  (`sed -n '531,700p'`), jamais en entier : `CARTE.md` donne la tranche.

### Ce qu'on veut toucher, et où

| intention | où |
|---|---|
| recherche, index des exposants, liste | `_js.html` § 1 et 5 |
| sortes d'éléments que la recherche remonte | `_admin1.html` `voletRecherche`, porte dans `_js.html` `visible` ; repères cherchables dans `_dessin.html` |
| rendu du plan, libellés, zoom, sélection, fiche | `_js.html` § 3, 4, 6, 7, 8 |
| tiroir de la liste sur écran étroit | `_js.html` l. 1188 |
| couleurs, visibilité et réglages des calques | `_admin1.html` |
| fiche d'une zone, salles de conférence qu'elle abrite | `_admin1.html` `champsZone`, `champSalles` ; colonne `salles` |
| démarrage de la page, appel API, panne réseau | `_admin2.html` |
| tracé des calques de dessin | `_dessin.html` |
| verrouiller un calque de dessin | `_dessin.html` § Le verrou d'un calque, cadenas posé par `_pile.html` `boutonVerrou` |
| déplacer, redimensionner une forme existante | `_edition.html` |
| cote, aimants, grille des stands, taille exacte, duplication | `_aimants.html` |
| ordre des calques, pile, couleur du fond du plan | `_pile.html` |
| enregistrer la configuration pour tous | `_pousse.html` |
| parcours de visite | `_parcours.html` |
| suggestion d'un exposant de plus, onglet « Suggestion » | `_suggestion.html` |
| itinéraire d'un point du salon à un autre | `_itineraire.html` |
| ordre de visite, conférences, horaires | `_journee.html` |
| comptage d'usage | `_mesure.html`, `supabase/functions/mesure/`, migration `compteurs` |
| carte de chaleur du plan | `_chaleur.html`, migration `audience` |
| remise à zéro des compteurs | `_chaleur.html` § Remise à zéro, `_admin1.html` `ouvreReglages`, migration `remise_a_zero` |
| styles et structure de l'écran du plan | `_head.html` (CSS l. 8-1034, balisage l. 1035+) |
| console multi-événements | `_console-js.html`, socle `_console-base.html` |
| icône d'onglet des pages du plan | `_console-js.html` `champFavicon`, posée par `_js.html` `poseFavicon`, migration `icone_d_onglet_du_salon` |
| rapport d'utilisation | `_rapport-js.html`, styles `_console.css` |
| export tableur des exposants | `_export.html` (console **et** rapport), écriture `.xlsx` dans `_classeur.html` — mêmes chiffres que la carte de chaleur, par `audience_cibles` |
| accès administrateur d'un plan | `_auth-plan.html` |
| comptes, profils, salons affectés | `_console-js.html` § Comptes, `supabase/functions/comptes/`, migration `comptes` |
| invitation, mot de passe oublié | `_motdepasse.html` |
| synchronisation Klipso | `supabase/functions/sync-evenement/`, `_partage/gaia.ts`, `champs.ts` |
| API publique du plan, cache | `supabase/functions/plan-public/`, `src/index.mjs` |

## Déploiement

Rien ne se déploie à la main. Une poussée sur `main` applique les migrations et
redéploie les fonctions (`supabase.yml`) ; Cloudflare suit le dépôt de son côté
pour `web/` et le Worker. Toute poussée, sur n'importe quelle branche,
reconstruit les pages (`pages.yml`).

Conséquence à garder en tête : **une migration poussée sur `main` part en
production**. Les migrations sont rejouables et jamais réécrites : une
correction est une migration de plus.

## Secrets

Aucune clé dans le dépôt. `.env` est exclu ; les clés serveur vivent dans les
secrets Supabase (`npx supabase secrets set …`). La clé `service_role` et la
clé Klipso ne doivent jamais atteindre une page ni un commit.

Toute nouvelle adresse de déploiement doit être ajoutée à
`ORIGINES_AUTORISEES`, sans quoi les fonctions refusent ses appels.

## Conventions

Le code, les commentaires et les messages de commit sont en **français
accentué**. Les commentaires expliquent *pourquoi*, pas *quoi* — c'est le ton
en place dans tout le dépôt, gardez-le.
