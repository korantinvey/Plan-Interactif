# Procédure de reprise — remonter le plan ailleurs

Ce qu'il faut pour remonter le plan interactif sans le projet Supabase ni le
compte Cloudflare d'aujourd'hui : après la perte de l'un d'eux, pour un
changement d'hébergeur, ou pour monter un second projet (recette).

Le dépôt seul n'y suffit pas. Il porte de quoi **reconstruire** : les pages, le
Worker, le schéma (`supabase/migrations/`), les fonctions
(`supabase/functions/`). Il ne porte rien de ce qui **s'accumule** : les
données, les comptes, les secrets. Cette procédure dit où chacun se trouve, et
dans quel ordre tout reposer.

Trois cas, du plus simple au plus long :

1. **Un autre projet Supabase** (hébergé ou auto-hébergé) — quelques heures,
   sans toucher au code (§ 2 à 5).
2. **Les pages hors de Cloudflare** — un portage du Worker, quelques jours
   (§ 6).
3. **La base hors de Supabase** — une réécriture partielle (§ 7).

---

## 1. À tenir hors de GitHub, dès maintenant

Une reprise échoue sur ce qu'on n'a pas gardé. Ces éléments ne sont ni dans le
dépôt ni dans la sauvegarde. Rangez-les dans un coffre de mots de passe ou dans
un stockage à vous, hors de Supabase, de Cloudflare et de GitHub :

| quoi | où il vit aujourd'hui | si on le perd |
|---|---|---|
| **Sauvegardes de la base** (`donnees-AAAA-MM-JJ.sql.gz`) | artefacts du workflow `Sauvegarde`, **qui expirent** | le travail des exploitants : dessins, apparence, salles, comptes, historique d'usage |
| `VAPID_CLE_PUBLIQUE`, `VAPID_CLE_PRIVEE`, `VAPID_SUJET` | secrets Supabase | les abonnements aux rappels déjà pris : de nouvelles clés les rendent muets |
| clés Klipso, une par base | `prive.cle_klipso`, **que la sauvegarde n'emporte pas** | les synchronisations, tant qu'on n'a pas redemandé les clés à Klipso |
| `KLIPSO_API_KEY` (bases sans clé propre) | secret Supabase | idem |
| `EVENTMAKER_TOKEN` | secret Supabase | le programme venu d'Eventmaker |
| `ORIGINES_AUTORISEES`, `LOT_VIGNETTES` | secrets Supabase | rien de grave : ils se reposent de mémoire |
| la liste des comptes et de leurs salons | table `profil` et table `acces`, dans la sauvegarde | voir § 4.3 |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` n'ont pas à
être gardés : Supabase les fournit lui-même aux fonctions de chaque projet.

Une sauvegarde reste un fichier de données de production : elle n'entre jamais
dans le dépôt.

---

## 2. Monter un nouveau projet Supabase

### 2.1 Le projet

- **Hébergé** : créez le projet et notez trois choses : sa référence (`abcd…`),
  le mot de passe de sa base et sa clé « publishable ».
- **Auto-hébergé** (`supabase/docker` du dépôt Supabase) : les mêmes services
  (PostgREST, GoTrue, Edge Runtime), à votre adresse. Remplacez ci-dessous
  `--project-ref` par `--db-url "postgresql://…"`. Les fonctions se déposent
  dans `volumes/functions/` au lieu de passer par `functions deploy`.

### 2.2 Les extensions

Les migrations des rappels **échouent exprès** sans `pg_cron` et `pg_net` (voir
`20260915131103_programmer_vraiment_la_tache_des_rappels.sql`). Activez-les
avant toute chose : tableau de bord → Database → Extensions.

### 2.3 L'adresse des rappels — avant les migrations

La tâche `rappels-de-conference` appelle la fonction `rappels` par une adresse
que la migration lit **au moment où elle s'applique**. Sans réglage, c'est
l'adresse de l'ancien projet, écrite en dur. Posez donc la nouvelle adresse
d'abord :

```sql
alter database postgres
  set app.rappels_url = 'https://<référence>.supabase.co/functions/v1/rappels/envoi';
```

Si les migrations sont déjà passées, reprogrammez la tâche avec la même
commande que la migration ci-dessus (`cron.schedule('rappels-de-conference', …)`),
puis vérifiez l'adresse dans `cron.job`.

### 2.4 Le schéma

```bash
npx supabase db push --project-ref <référence> --password <mot de passe>
```

Les migrations sont rejouables. Une base neuve les reçoit toutes, dans l'ordre.

### 2.5 Les fonctions et leurs secrets

```bash
npx supabase secrets set --project-ref <référence> \
  VAPID_CLE_PUBLIQUE=… VAPID_CLE_PRIVEE=… VAPID_SUJET=… \
  KLIPSO_API_KEY=… EVENTMAKER_TOKEN=… \
  ORIGINES_AUTORISEES=https://<nouvelle adresse des pages>
npx supabase functions deploy --project-ref <référence> --use-api
```

`supabase/config.toml` retire la vérification du jeton à cinq fonctions
(`verify_jwt = false`) : un déploiement par la CLI l'applique. Sur un serveur
auto-hébergé, vérifiez que c'est bien le cas.

**`ORIGINES_AUTORISEES` est indispensable** dès que les pages changent
d'adresse. Les fonctions n'acceptent en dur que
`plan-interactif.interactiveplan.workers.dev` et `localhost:4180`, et refusent
tout le reste.

---

## 3. Repointer le dépôt sur le nouveau projet

| fichier | quoi changer |
|---|---|
| `outils/projet.js` `PROJETS.production` | `url` et `cle` (la clé « publishable ») ; ou `PROJETS.recette` pour un projet d'essai |
| variable GitHub `SUPABASE_PROJECT_REF` | la référence : `supabase.yml`, `sauvegarde.yml`, `salon-demo.yml` et `performances.yml` la lisent avant leur valeur par défaut |
| secrets GitHub `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD` | ceux du nouveau compte et de la nouvelle base |

Faites ensuite `npm run construire`. `config.js` et `src/pages.mjs` prennent la
nouvelle adresse, puis les pages et le Worker la suivent.

---

## 4. Reverser les données

### 4.1 Ce que porte la sauvegarde

`sauvegarde.yml` exporte chaque nuit le schéma `public`, **sans** `calque` ni
`instantane`, que Klipso sait refaire. Le schéma `auth` n'y est pas (comptes et
mots de passe), ni le schéma `prive` (clés Klipso).

### 4.2 Le versement — sans `profil` ni `acces`

La sauvegarde ne se verse **pas** telle quelle sur une base neuve. `profil.id`
est une clé étrangère vers `auth.users` (`20260910000004_comptes.sql`), et une
base neuve n'a aucun compte : les lignes de `profil`, donc celles d'`acces`,
seraient refusées. On met ces deux tables à part, dans un schéma `reprise`, et
on verse le reste :

```bash
gunzip -c donnees-AAAA-MM-JJ.sql.gz \
  | sed -e 's/COPY "public"\."profil"/COPY "reprise"."profil"/' \
        -e 's/COPY "public"\."acces"/COPY "reprise"."acces"/' \
  > reprise.sql

psql "<chaîne de connexion>" <<'SQL'
create schema reprise;
create table reprise.profil (like public.profil);
create table reprise.acces  (like public.acces);
SQL

psql "<chaîne de connexion>" -v ON_ERROR_STOP=1 -f reprise.sql
```

Si une contrainte bloque malgré tout (ordre des tables, déclencheur),
relancez avec `PGOPTIONS='-c session_replication_role=replica'` devant `psql`.
Cela demande le rôle `postgres`.

### 4.3 Les comptes

Les mots de passe sont perdus avec `auth`, et un compte réinvité reçoit un
**nouvel identifiant** : les anciens accès ne s'y rattachent pas d'eux-mêmes.

1. **Le premier compte** se crée dans le tableau de bord (Authentication → Add
   user). Le déclencheur `profil_a_la_creation` fait administrateur le premier
   compte d'une base vide.
2. **Les autres** s'invitent depuis la console, par l'adresse que porte
   `reprise.profil`.
3. **Leurs rôles et leurs salons** se rattachent par l'adresse, une fois les
   invitations parties :

```sql
update public.profil p set role = r.role, nom = r.nom
  from reprise.profil r
 where lower(p.email) = lower(r.email);

insert into public.acces (profil_id, evenement_id, accorde_le)
select p.id, a.evenement_id, a.accorde_le
  from reprise.acces a
  join reprise.profil r on r.id = a.profil_id
  join public.profil p on lower(p.email) = lower(r.email)
on conflict do nothing;
```

Gardez le schéma `reprise` jusqu'à ce que tous les comptes aient été réinvités.
Supprimez-le ensuite (`drop schema reprise cascade`).

### 4.4 Les clés Klipso, puis la synchronisation

Ressaisissez la clé de chaque base Klipso dans la console. Lancez ensuite
« Synchroniser maintenant » sur chaque salon : elle refait `instantane` et
`calque`, les pavillons et les vignettes. Tant qu'un salon n'est pas
synchronisé, son plan public est vide.

---

## 5. Les pages, de nouveau sur Cloudflare

Sur un autre compte Cloudflare :

1. Créez l'espace KV du cache
   (`npx wrangler kv namespace create plan-interactif`) et reportez son `id`
   dans `wrangler.jsonc` (liaison `CACHE`). Sans lui, le Worker tourne mais
   chaque visite retombe sur Supabase.
2. Reliez le Worker au dépôt (Workers → Créer → Importer un dépôt Git).
   `wrangler.jsonc` porte la commande de construction ; Node 22 est fixé par
   `.nvmrc`.
3. Si l'adresse change, ajoutez-la à `ORIGINES_AUTORISEES` (§ 2.5). Les
   adresses en dur `plan-interactif.interactiveplan.workers.dev` des fichiers
   ci-dessous sont alors à revoir :
   - `outils/genere.js`, `ORIGINE_PRODUCTION` : l'image de partage ;
   - `outils/demo.js` et `outils/scripts/source-demo.js` ;
   - les essais `outils/essais/apercu.js`, `sonde-worker.js` et `entete.js`.

   Les prévisualisations se reconnaissent à leur adresse
   (`src/index.mjs` `enApercu`) : le nom du compte y entre.

---

## 6. Les pages hors de Cloudflare

`web/` est un dossier de fichiers statiques, que tout hébergeur sert. Ce qui
ne se transporte pas tel quel, c'est le Worker `src/index.mjs`. Il est écrit au
format standard `fetch(requete, env, ctx)`, qu'acceptent aussi Deno Deploy,
Vercel (Edge), Netlify (Edge Functions) ou un serveur Node. Trois choses y sont
propres à Cloudflare :

| dans le Worker | à remplacer par |
|---|---|
| `env.ASSETS.fetch(requete)` : servir un fichier de `web/` | le service de fichiers statiques de la plateforme |
| `env.CACHE` / `env.CACHE_APERCU` (KV) : le cache de `/api/plan` | tout stockage clé-valeur avec expiration (Deno KV, Upstash Redis, Netlify Blobs…), ou aucun |
| `run_worker_first` (`wrangler.jsonc`) : le manifeste passe par le script | une règle de réécriture vers la fonction |

Les chemins que le Worker doit garder, tous dans `src/index.mjs` `aiguille` :

- `/manifeste.webmanifest`, `/api/icone`, et l'adresse propre à chaque salon ;
- `/api/plan`, qui relaie `plan-public` avec le cache, et sa question
  « a-t-il changé » (`?entete=…`) ;
- `/api/mesure`, `/api/erreur`, `/api/sonde`, `/api/plan-de-visite`,
  `/api/charge`, `/api/rappels`, `/api/rappels/cle` et `/api/oublie` ;
- `/api/pages`.

**Version minimale, sans le Worker.** Servez `web/` seul. Le plan public ne
s'ouvre plus : la page lit `/api/plan` sur sa propre origine, et rien ne le
sert. Il faut au moins ce relais. Le reste des chemins est perdu, sans casser
la page : manifeste propre à chaque salon, mesures, rappels.

Les essais `outils/essais/apercu.js` et `sonde-worker.js` éprouvent le Worker.
Faites-les passer sur la version portée.

---

## 7. La base hors de Supabase

C'est le cas le plus coûteux. Supabase n'est pas seulement l'hébergeur de
Postgres, le code s'appuie sur ses services :

- **Le schéma.** Les politiques de sécurité emploient `auth.uid()`,
  `auth.users` et les rôles `anon`, `authenticated` et `service_role`. Les
  tâches planifiées passent par `pg_cron` et `pg_net`.
- **Les pages.** Elles parlent directement à `/auth/v1/…` (session, mot de
  passe), `/rest/v1/…` (PostgREST : tables et `rpc`) et `/functions/v1/…`.
- **Les fonctions.** Ce sont des fonctions Deno, qui importent
  `@supabase/supabase-js` et lisent `SUPABASE_URL` et les clés du projet.

Deux voies :

- **Recomposer les briques** sur un Postgres quelconque : PostgREST, GoTrue
  (ou un service d'authentification qui en imite l'API), un environnement Deno
  pour les fonctions, `pg_cron` et `pg_net`. C'est refaire Supabase à la main.
  Autant prendre Supabase auto-hébergé (§ 2.1), qui est exactement cet
  assemblage.
- **Réécrire l'accès.** Une API à soi remplace PostgREST, l'authentification et
  les fonctions, puis les pages l'appellent à la place des trois préfixes
  ci-dessus. C'est un chantier à part entière, sans rapport avec une reprise.

---

## 8. Vérifier la reprise

- `/api/pages` répond, et la construction en ligne est la bonne.
- Un salon synchronisé s'ouvre en public. L'en-tête `X-Cache` passe de `miss`
  à `hit` à la seconde visite ; `absent` dit qu'on tourne sans cache.
- La console s'ouvre avec le premier compte, et un organisateur réinvité
  retrouve ses salons.
- Un dessin enregistré depuis l'administration se relit après rechargement.
- `select jobname, schedule, command from cron.job` montre
  `rappels-de-conference` avec la **nouvelle** adresse, et les purges.
- Un abonnement à un rappel de test arrive bien sur un téléphone.
- Le workflow `Sauvegarde`, lancé à la main, passe au vert sur le nouveau
  projet.
