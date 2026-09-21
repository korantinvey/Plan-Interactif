# Eventmaker : les produits d'un exposant

Le plan sait montrer une enseigne, son secteur, sa nomenclature et ses
conférences. Il ne sait pas dire *« ce stand présente cette machine-là »*.
Eventmaker, lui, le sait : la ressource existe, elle s'appelle **`guest_product`**,
et elle est **dans l'API REST** — hors documentation, comme les sessions, mais
au même endroit que le reste.

```
GET /api/v1/events/{id}/guest_products.json?auth_token=…&per_page=500&page=1
  → [ { _id, name, description, illustration, guest_id, published_on_website, … } ]
```

Le rattachement au plan ne coûte rien : `guest_id` désigne **la fiche d'invité
de l'exposant**, celle-là même que `exposants()` indexe déjà. Un produit se pose
donc sur le stand de sa fiche, sans nouvelle clé, sans appariement, sans
approximation. Mesuré sur C!Print Lyon 2026 : **745 produits publiés sur 753
retrouvent un stand**, les huit autres tenant à trois fiches effacées depuis et
à cinq exposants sans numéro.

## Ce que le relevé donne, salon par salon

Les cent événements du compte, interrogés un par un : **33 portent des
produits**, 6 327 en tout, dont **3 601 publiés**. Les mieux garnis :

| salon | produits | publiés | avec image | avec thématique | fiches |
|---|---|---|---|---|---|
| CTCO / C!Print Lyon 2025 | 1 484 | 537 | 171 | 0 | 149 |
| C!Print Lyon 2026 | 930 | **753** | 466 | 443 | 123 |
| C!Print Madrid 2026 | 657 | 623 | 468 | 393 | 82 |
| CTCO Lyon 2026 | 348 | 239 | 220 | 201 | 48 |
| SIDO & Lyon Cyber Expo 2026 | 287 | 166 | 99 | 110 | 64 |
| SHOP! Le Salon x CBrand 2026 | 216 | 194 | 190 | 82 | 28 |
| Franchise Expo Paris 2026 | 68 | **0** | 0 | 0 | 27 |

C'est une famille de salons qui s'en sert — C!Print, CTCO, SIDO, SHOP!,
Premium Sourcing, Drive to Zero —, et pas le reste. Un plan qui compte dessus
doit donc le vérifier salon par salon, ce qu'un appel suffit à établir.

## `published_on_website` n'est pas un réglage d'affichage, c'est un tri

C'est le piège du lot, et il se voit à l'œil nu. La moitié des produits du
compte ne sont pas publiés, et **ce ne sont pas des produits** : l'onglet sert
de bloc-notes à qui le veut. Sur Franchise Expo Paris 2026, les soixante-huit
entrées s'appellent « Appel dans 15 jours », « Appeller », « Compte » — des
notes commerciales, sans description ni image, et pas une publiée. Sur CTCO /
C!Print Lyon 2025, les non publiées sont des en-têtes de rayon : « All
categories », « Business », « Outerwear ».

Une seule conduite tient : **ne lire que `published_on_website === true`**.
C'est aussi ce que fait le site public d'Eventmaker, et c'est pour cela que
l'organisateur n'a jamais vu ces notes paraître.

## Le modèle, champ par champ

```
_id                             identifiant du produit
name                            son nom, dans la langue de qui l'a saisi
description                     { html, draftjs_content } — voir plus bas
illustration                    { url, medium:{url}, small:{url} }
documentation                   { url } — une fiche PDF, 231 produits sur 753
video_link                      une adresse, 148 sur 753 ; "" plutôt que null
thematic_ids                    les thématiques du salon, mêmes identifiants qu'ailleurs
guest_id                        la fiche de l'exposant  ← le rattachement au plan
owner_guest_id                  un doublon de coulisses, sans usage — voir plus bas
guest_product_collection_id     toujours nul sur les 33 salons
published_on_website            le seul tri qui vaille
bookmarks_count                 ce que les visiteurs du site ont mis de côté
frontend_searchable_keywords    { fr:[…], en:[…], es:[…] } — voir « L'anglais »
website_path_slug               son adresse sur le site public
created_at, updated_at, event_id
```

**`description` n'est pas multilingue**, malgré son air de l'être : c'est un
couple `{ html, draftjs_content }`, deux écritures du même texte, celle de
l'éditeur et celle du rendu. Seul `html` sert ; `draftjs_content` pèse autant
et ne dit rien de plus. Cent soixante-dix-sept produits de C!Print Lyon 2026
ont une description vide — le champ vaut alors `{}` et non `{ html: null }`.

**`owner_guest_id` ne mène nulle part.** Il avait l'air d'être le lien qu'on
cherchait ; il est renseigné sur 293 produits sur 753, désigne une fiche de la
**même société** dans une autre catégorie d'invités, sans nom, sans courriel —
la fiche de coulisses par laquelle l'organisateur saisit. **Aucune ne porte de
numéro de stand**, sur aucun des trois salons mesurés : 0 sur 753, 0 sur 166,
0 sur 194. C'est `guest_id`, et lui seul.

**Le champ de stand n'est pas le même qu'à Franchise Expo.** Ces salons-là
nomment `no_stand` ce que FEP appelle `num_stand`, et aucun ne porte
`id_dossier` — 0 fiche sur les trois salons. L'appariement par dossier, celui
des conférences, n'a donc rien à quoi s'accrocher ici : le produit tient à sa
fiche, la fiche à son numéro, et la cible réglable depuis la console suffit.

## L'illustration, et pourquoi elle ne rejoue pas le piège du logo

Les variantes carrées d'un avatar ne valaient rien — elles recadrent et
amputent (`eventmaker.md`, « Les deux variantes carrées »). **Celles d'un
produit sont d'une autre espèce** : elles ajustent au lieu de recadrer, la
proportion est gardée, et le long côté est borné à 1000 pour `medium`, 500 pour
`small`.

```
Calandra CMI 1726   orig  617×705   61 ko | medium  875×1000  367 ko | small 438×500 119 ko
Machine HT          orig 1600×1200 459 ko | medium 1000×750   640 ko | small 500×375 169 ko
Pro C7500           orig 6000×3376 1596 ko | medium 1000×563   63 ko | small 500×282  21 ko
```

`small` est donc utilisable telle quelle dans une liste, ce que l'avatar ne
permettait pas. Mais la troisième ligne dit l'autre moitié : **la variante
grossit ce qui était plus petit qu'elle**, et pèse alors quatre à six fois
l'original. Prendre la plus légère des deux, et non la plus petite.

Et il n'y a pas de pastille d'initiales à écarter ici : sur une fiche sans
image, les trois adresses valent `null` ensemble. Le domaine est le même S3
public que les logos, servi sans jeton.

## L'anglais existe, l'API ne le rend pas

C'est la lacune du lot, et elle est nette. `frontend_searchable_keywords` est
**rangé par langue** — `fr`, `en`, `es` — et les mots anglais y sont bien de
l'anglais, tirés d'une traduction de la description : « perfect », « high
production sublimation », « roll-to-roll ». Cette traduction existe donc quelque
part chez Eventmaker ; **elle ne descend par aucun chemin de l'API**.

Cherché, et trouvé fermé : `?locale=en` est ignoré, `/translations.json` de
l'événement ne porte que les libellés du CMS (sept entrées « produits », toutes
des titres de page), et `guest_product_translations`, `product_translations` et
leurs variantes rendent 404. Le site public, lui, rend la page traduite : la
traduction se fait au rendu, et reste de son côté.

Conséquence pour le plan : **un produit paraîtrait dans la langue où son
exposant l'a saisi**, quelle que soit la langue de la page. Ce n'est pas propre
mais ce n'est pas nouveau — c'est déjà le sort des exposants et de la
nomenclature, que `CLAUDE.md` range parmi les données et non parmi les chaînes
du code. Reste que sur C!Print Madrid, dont l'événement est en espagnol, tout
le catalogue l'est aussi.

## Ce que l'API ne fait pas, et qu'il faudra porter

- **Aucun filtre ne marche.** `guest_id`, `published_on_website`, `q` sont
  acceptés sans effet : la liste revient entière, l'air d'avoir été filtrée —
  le même piège que `accesspoint_id` sur `/guests`. On prend tout et on trie
  chez soi.
- **`per_page` plafonne à 500.** Deux pages pour les 930 produits de C!Print
  Lyon 2026, trois pour le plus gros catalogue du compte. C'est peu au regard des
  vingt-trois mille fiches que la synchronisation parcourt déjà.
- **La fiche unitaire n'existe pas.** `/guest_products/{id}.json` rend 500, pas
  404 : le chemin est routé et la vue manque. Rien à en attendre.
- **Les collections n'existent pas non plus.**
  `/guest_product_collections.json` rend `[]` partout, et
  `guest_product_collection_id` est nul sur les 6 327 produits. Le rangement
  passe par `thematic_ids`, qui sont les thématiques du salon — hiérarchiques,
  colorées, et déjà relues par la synchronisation pour les exposants.

## Ce qu'il en coûterait

La charge est modeste et le parcours connu. Deux appels pour les produits,
aucun appel de plus pour le rattachement — la synchronisation tient déjà
l'index des fiches. Sur C!Print Lyon 2026, la liste brute pèse 2,6 Mo, dont la
moitié en `frontend_searchable_keywords` et en `draftjs_content` : **débarrassée
des deux, 1,3 Mo pour 930 produits**, et 1 Mo pour les seuls publiés. Un
exposant en porte quatre à la médiane, quarante-quatre au plus.

Le domaine existe déjà : `sources.produits` est dans le schéma depuis
`20260904000002_sources.sql`, la console propose `aucun · klipso · eventmaker`
(`_console-js.html`, l. 972), et `sync-evenement` compte une étape « Produits »
dont le poids est zéro. **Il n'y manque que le relevé**, à écrire à côté de
`rolesParConference()` dans `_partage/eventmaker.ts`, et la charge à verser sur
l'exposant plutôt qu'à côté : un produit sans son stand ne se cherche pas.

Ce qui reste à trancher avant d'écrire, et qui ne se tranche pas dans l'API :
où la fiche les montre, si la recherche les remonte comme elle remonte une
conférence, et ce que le plan fait d'une image de 500 pixels quand la fiche
d'exposant n'en montre qu'une, son logo.
