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

- `web/*.html` — sortie de la construction ; éditez `outils/gabarit/`.
- `outils/tpl-multi.html` — intermédiaire, régénéré par `assemble.js`.

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
| `supabase/migrations/` | schéma de la base — numérotées, rejouables |
| `supabase/functions/` | synchronisation Klipso et API publique |
| `src/index.mjs` | Worker Cloudflare : relais et cache de `/api/plan` |
| `.github/workflows/` | reconstruction des pages, déploiement Supabase |

## Déploiement

Rien ne se déploie à la main. Une poussée sur `main` applique les migrations et
redéploie les fonctions (`supabase.yml`) ; Cloudflare suit le dépôt de son côté
pour `web/` et le Worker. Toute poussée, sur n'importe quelle branche,
reconstruit les pages (`pages.yml`).

Conséquence à garder en tête : **une migration poussée sur `main` part en
production**. Les migrations sont numérotées et rejouables, jamais réécrites.

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
