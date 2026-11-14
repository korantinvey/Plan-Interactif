# Le plan en WebGL natif — inventaire avant migration

Relevé le 14 novembre 2026, au commit `384b72e`. Les numéros de ligne
vieillissent dès le commit suivant : ils disent où regarder ce jour-là, pas
où regarder toujours. Ce qui compte, c'est la liste des modules, ce que
chacun fait au SVG, et ce qui le remplace.

## La cible

Aujourd'hui, le SVG est à la fois la base du WebGL et son repli :

```
données → SVG caché + feuille de style → guet, getComputedStyle, relecture → WebGL
```

La cible inverse le sens : un modèle de scène — formes et style, en
JavaScript — que le WebGL peint directement, et que le SVG ne peint plus que
pour les postes sans carte graphique.

```
données → modèle de scène → WebGL
                          ↘ SVG, seulement en repli
```

Un précédent existe déjà : les noms des stands. `modules/libelles.mjs`
`libellesWebgl` les construit depuis les données (`P().stands`,
`P().zones`), sans relire le SVG ; il ne lui demande que leur style, par des
témoins cachés (`webgl.mjs` `poseModelesLibelles`).

## En chiffres

36 modules touchent au SVG du plan — 22 publics, 14 de l'exploitant —, plus
le lecteur lui-même (`webgl.mjs`), pour environ 240 points relevés. Une
vingtaine d'autres modules n'emploient que du SVG d'interface, qui reste
hors du chantier (voir « Ce qui reste en SVG »).

| étape | modules | points | ce que le modèle doit fournir |
|---|---|---|---|
| 1 — stands et zones | 13 | 52 | géométrie des emplacements, état (choisi, retiré, secteur, mis en avant), identité à la désignation |
| 2 — surcouches et calques dessinés | 6 | 95 | formes dessinées, repères, flèches, images, itinéraire, parcours, borne, distinctions |
| 3 — habillage et fond | 3 (+ `rendu.mjs`) | 16 | calques de Klipso lus une fois, ordre des calques, fond figé et son masque |
| 4 — outils de l'exploitant | 14 | 81 | poignées, cadres, guides et cotes à taille d'écran ; désignation par identifiant |
| 5 — retrait du lecteur | `webgl.mjs` | 15 fonctions | — |

Les points sont comptés par sorte : une même ligne qui construit et ordonne
compte deux fois.

## Ce que les modules font au SVG

Sept sortes de contact, qui ne se remplacent pas de la même façon :

| sorte | exemple | ce qui la remplace |
|---|---|---|
| **construit** | `createElementNS`, `innerHTML`, `setAttribute("d", …)` | une primitive du modèle |
| **balisage** | `'<g class="stand" data-id="' + …` | idem, écrite en données au lieu de texte |
| **lit** | `getBBox`, `getAttribute("d")`, `getComputedStyle(el).fill` | la donnée elle-même, ou la règle de style |
| **vise** | `closest("[data-id]")`, `priseWebgl` qui rend un élément | une désignation qui rend un identifiant |
| **cherche** | `svg.querySelector('#stands g[data-id="…"]')` | un index du modèle par identifiant |
| **style** | `classList.toggle("dim")`, `"sel"`, `"phare"` | un état du modèle, que lisent les règles de style |
| **ordonne** | `svg.insertBefore(g, …)`, l'ordre des nœuds | l'ordre d'une liste du modèle |

## Étape 1 — stands et zones

Le plus gros du gain par geste : la sélection fait aujourd'hui relire tout le
bloc des stands, et la recherche restyle le SVG entier.

| module | ce qu'il fait au SVG | ce qui le remplace | difficulté |
|---|---|---|---|
| `rendu.mjs` | écrit `#zones` et `#stands` en balisage, avec leurs boutons pour le clavier | blocs « stands » et « zones » du modèle, depuis `DATA` ; une couche accessible à part | moyenne |
| `ambiance.mjs` | réécrit le tracé des stands pour l'ambiance Tuiles (`traceStand`) | une variante de géométrie calculée dans le modèle | faible |
| `fiche.mjs` | retrouve le nœud d'un stand, pose `.sel` | `state.sel`, lu par la règle de style | faible |
| `recherche.mjs` | pose `.dim` sur les stands retirés (`marqueRetrait`) | la visibilité, calculée depuis le filtre | faible |
| `secteurs.mjs` | lit `data-sect` pour colorer | une règle de couleur par secteur | faible |
| `cartouche-poi.mjs` | pose `.phare` sur repères, zones, noms | un état « mis en avant » | faible |
| `points-interet.mjs` | pose `.sel` sur un repère | idem | faible |
| `gestes.mjs` | désigne par `cibleWebgl` ou `closest`, liste les stands allumés | une désignation qui rend un identifiant ; le plus proche cherché dans le modèle | moyenne — l'ordre de priorité des gestes ne doit pas bouger |
| `logos-stands.mjs` | relève les groupes des stands pour leurs identifiants | l'index du modèle | faible |
| `libelles.mjs`, `nom-emplacement.mjs`, `texte-plan.mjs` | écrivent les noms en SVG (rendu SVG seul), posent les témoins de style | le peintre SVG du repli, nourri par le modèle ; les témoins remplacés par des jetons de style | moyenne |
| `vue.mjs` | écrit la `viewBox` (rendu SVG seul), pose `.fige` | reste au peintre SVG | faible |

Avec cette étape : `webgl.mjs` `rectEcranWebgl`, qui passe par `getBBox`, lit
la boîte dans le modèle (les emplacements ont déjà `bb` et `c`).

## Étape 2 — surcouches et calques dessinés

| module | ce qu'il fait au SVG | ce qui le remplace | difficulté |
|---|---|---|---|
| `dessin.mjs` | écrit les calques dessinés (`.dcal`) : formes, flèches, repères, images, stands dessinés et leur nom ; pose `.sel`, `.dim`, `.pick`, `.neuve` ; `redessineForme` pendant un geste | des primitives par forme, depuis `calques-dessin.mjs`, qui tient déjà les formes en mètres | forte — sert au visiteur et à l'exploitant, et compte le plus de sortes de formes |
| `distinctions.mjs` | écrit `#dists`, lit le tracé et la boîte des stands | la géométrie du modèle | moyenne |
| `parcours.mjs` | écrit les marques du parcours, lit le tracé et la couleur calculée des stands | le modèle et la règle de style | moyenne |
| `trace-itineraire.mjs` | écrit `#itin` : lueur, traits, bouts, numéros, taille au zoom | des primitives ; les tirets qui défilent existent déjà en WebGL | moyenne |
| `vous-etes-ici.mjs` | écrit le point de la borne | une primitive | faible |
| `tutoriel.mjs` | écrit le contour de la zone désignée, cherche ses noms | une primitive et l'index | faible |

## Étape 3 — habillage et fond

| module | ce qu'il fait au SVG | ce qui le remplace | difficulté |
|---|---|---|---|
| `apparence.mjs` | injecte le balisage de Klipso de chaque calque (`f.svg`), y pose remplissage et trait | les calques lus une fois en primitives — au mieux à la synchronisation, côté serveur (`_partage/svg.ts` les nettoie déjà) | forte — volume (jusqu'à 1,4 Mo par calque), et fidélité au SVG de Klipso : transformations, textes, `svg` imbriqués |
| `rendu.mjs` (l. 69) | crée le groupe des calques d'habillage | idem | — |
| `ordre-trace.mjs` | ordonne les calques par l'ordre des nœuds | l'ordre d'une liste | faible |
| `environs.mjs` | pose dans le SVG les images du fond figé et le masque du hall | une image et un masque du modèle | moyenne |

## Étape 4 — outils de l'exploitant

Les outils travaillent déjà sur des données, et visent déjà par la carte
graphique (`edition.mjs` l. 572 et 599). Le SVG ne leur sert plus que
d'intermédiaire : chaque mouvement réécrit la forme, que le guet fait
reconvertir avec tout son calque, et les poignées sont réécrites à chaque
changement de vue pour garder leur taille à l'écran — ce qu'un shader tient
seul.

| module | ce qu'il fait au SVG | ce qui le remplace | difficulté |
|---|---|---|---|
| `edition.mjs` | écrit poignées et cadre (`#poignees`), mesure un texte tourné par `getBBox`, pose `.pick` | primitives à taille d'écran ; mesure par `texte-plan.mjs` ; désignation par identifiant | moyenne |
| `reprise-emplacements.mjs` | écrit les poignées de la reprise, pose `.geopick`, réécrit un tracé pendant le geste | idem | moyenne |
| `aimants.mjs` | écrit la cote et les guides | primitives à taille d'écran | faible |
| `batiments.mjs` | écrit le cadrage d'un bâtiment (`#calageApercu`) | primitives ; l'aperçu du lieu dans le panneau reste en SVG d'interface | faible |
| `nappe.mjs` | pose la grille comme une image | une image du modèle, ou une grille dans le shader | faible |
| `chaleur.mjs` | pose les classes de la carte de chaleur, mesure chaque stand par `getBBox`, ajoute des bulles `title` | un état du modèle, la boîte des données ; les halos, déjà une toile à part, restent | moyenne |
| `fiche-zone.mjs` | pose `.masquee` sur les zones | un état | faible |
| `outil-comptoir.mjs`, `outil-foodtruck.mjs` | lisent le tracé d'une zone **dans le DOM** (`getAttribute("d")`) | la donnée, `P().zones` — à faire dès maintenant, c'est une simple lecture | faible |
| `outil-escalier.mjs` | mesure un repère par `getBBox` | la géométrie du repère | faible |
| `placement-libelles.mjs` | désigne un nom (`libelleSousWebgl`), pose `mode-libelles` | désignation par identifiant | faible |
| `calage-carte.mjs`, `outil-dessin.mjs`, `bande-admin.mjs` | posent un état sur la racine (`cale-deplace`, `mode-edition`…) | un état lu par les règles | faible |

Points à surveiller, qui ne se voient que lorsqu'ils manquent : la tolérance
de visée des poignées, le curseur qui change au survol (lu aujourd'hui dans
la feuille, `webgl.mjs` `getComputedStyle(o.prise).cursor`), les retours
visuels pendant le geste.

## Étape 5 — retrait du lecteur

Dans `webgl.mjs`, ce qui ne sert qu'à relire le SVG et part à la fin :

- le guet : les deux `MutationObserver` (l. 536 et 556), `blocDe` (844),
  `blocsDansLOrdre` (910), et la partie de `repeintWebgl` (915) qui
  reconvertit les blocs salis ;
- la conversion : `convertitBloc` (1899), `parcoursGl` (1938), `formeGl`
  (2583), `texteGl` (2664), `imageGl` (2688) ;
- les témoins de style : `poseModelesLibelles` (3156), `lisModelesLibelles`
  (3162), la couleur du sol relue par `getComputedStyle` (904) ;
- la désignation qui rend un élément : `cibleWebgl` (4002), `priseWebgl`
  (4012), `rectEcranWebgl` (4022), qui rendront un identifiant ou une boîte
  du modèle.

Les deux voies cohabitent jusque-là : un bloc migré est peint depuis le
modèle, les autres sont encore relus dans le SVG.

## La feuille de style

`_styles-plan.css` donne au plan son apparence par environ 64 règles sur ses
nœuds, et 7 animations que le WebGL rejoue déjà de lui-même. Une partie de
ces règles dépend d'**états posés sur la racine** de la page :
`mode-edition`, `mode-chaleur`, `chaleur-halos`, `mode-libelles`,
`mode-geo-stands`, `mode-geo-zones`, `cale-deplace`, `cale-tourne`,
`ambiance-tuiles`, `ambiance-immersif`, `poi-actif`. Le modèle devra les lire
comme un état, et les règles de style passer en JavaScript. Les couleurs
peuvent rester des variables de la feuille, lues une fois
(`configuration.mjs` le fait déjà) : ce sont des jetons, pas des règles.

## Ce qui reste en SVG

Hors du chantier, parce que ce n'est pas le plan :

- les pictogrammes et icônes : `reperes.mjs` (des tracés, qui restent des
  données), `corps-fiche.mjs`, `installation.mjs`, `journee.mjs`,
  `volets.mjs`, `pile.mjs`, `socle-dessin.mjs`, `apercus.mjs`, ceux de
  `parcours.mjs`, `cartouche-poi.mjs`, `chaleur.mjs`, `calage-carte.mjs`,
  `batiments.mjs` ;
- ce qui s'exporte ou s'affiche à part : le code QR (`qr.mjs`), l'affiche
  « Vous êtes ici » (`affiche-ici.mjs`), la mini-carte (`mini-carte.mjs`,
  qui lit déjà les données), les aperçus des réglages
  (`reglage-comptoir.mjs`, `reglage-foodtrucks.mjs`) ;
- les surcouches posées au-dessus du plan, à l'échelle de l'écran : les
  filets des appels (`appels.mjs`), le pouls de la borne et l'étincelle de
  l'itinéraire, les halos de la chaleur ;
- le SVG comme **format d'entrée** : Klipso livre l'habillage et les tracés
  en SVG ; on continue de le lire, une fois.

## Les essais

Sept fichiers lisent le DOM du SVG : `survol.spec.js` (4 lectures),
`plan.spec.js` (2), `visite.spec.js`, `sans-carte-graphique.spec.js`,
`noms-couches.spec.js`, `noms-uniformes.spec.js`, `choix-immersif.spec.js`,
et l'aide `aide.js` `standAViser`. Ils liront le modèle.

Treize fichiers forcent `?rendu=svg` pour la vitesse : sans carte graphique,
le WebGL logiciel des machines d'essai les ralentit de dix à vingt fois.
Avec un modèle de scène, un essai d'interface peut vérifier la scène sans la
peindre — c'est la voie à prendre, plutôt que de tout passer en WebGL.

## Ce que la migration change aux performances

Ce n'est pas seulement une mise à jour technique. Relevé sur SMCL 2026, dans
Chromium, processeur ralenti quatre fois — à peu près un téléphone moyen —,
la part qui revient au SVG caché quand le WebGL peint :

| moment | aujourd'hui | dû au SVG caché |
|---|---|---|
| ouverture (pavillon 1, 6 142 éléments) | ≈ 4,1 s de fil principal | relecture 1,0 s, montage 0,27 s, la plus grande part de 1,2 s de style et de mise en page |
| changement de pavillon (pavillon 2, 14 583 éléments) | ≈ 2,1 s | relecture 0,6 s, montage 0,49 s |
| choisir un stand | ≈ 120 ms | 22 ms : tout le bloc des stands relu pour une classe |
| recherche, six lettres | ≈ 780 ms | 90 ms de relecture, et un restylage complet du SVG (≈ 80 ms) |
| restylage complet (ambiance, carte de chaleur, couleur réglée) | 204 ms | 85 % : 31 ms sans le SVG |
| survol et glissé à la souris, sur ordinateur, sans ralentissement | — | 20 à 25 ms par changement de cible, et au début et à la fin d'un glissé : le curseur et sa variable s'héritent dans tout le SVG |
| mémoire (pavillon 2) | ≈ 36 Mo de tas natif | ≈ 8,5 Mo, un quart |

Ce qui ne change pas :

- le zoom et le glissé au doigt, qui ne passent déjà plus par le SVG ;
- ce que coûte le dessin à la carte graphique ;
- les postes sans carte graphique, qui gardent le repli SVG. Le moteur du
  plan y tient moins d'une image par seconde (0,8 à 0,9), contre 18 à 60
  pour le SVG : le coût vient des traits (environ 80 %) puis des textes, pas
  de la surface de l'écran.

Ce qui resterait à payer : lire le SVG de Klipso, environ un quart de la
relecture actuelle — une fois par pavillon au lieu d'à chaque bloc sali, ou
plus du tout si la synchronisation le fait côté serveur.

Pas encore mesuré : l'édition chez l'exploitant (combien coûte un glissé de
forme, qui fait reconvertir tout son calque à chaque mouvement), un vrai
téléphone, et l'imitation Windows (WARP) plutôt que SwiftShader.

## Les décisions à prendre avant

1. **deck.gl gelé ou retiré.** Sinon le modèle devra lui parler aussi. Le
   gel suffit : plus d'obligation de parité pour les effets neufs.
2. **Ce que garantit le repli.** Proposé : le plan public seulement, à plat,
   sans vue immersive ni animations ni figurants ; un effet neuf ne s'écrit
   que pour le WebGL, sauf s'il porte du sens pour le visiteur (sélection,
   itinéraire, borne).
3. **L'administration exige le WebGL.** Sans quoi le repli devrait aussi
   peindre poignées, guides et cotes.
4. **Où lire l'habillage** : dans la page, une fois par pavillon, ou à la
   synchronisation — qui change ce que sert `/api/plan` et demande de
   versionner son format.
5. **La couche accessible** qui remplace les boutons des stands dans le SVG.
6. **La stratégie d'essai** : vérifier le modèle plutôt que le rendu.

Un premier pas sans attendre ces décisions : les outils du comptoir et du
food truck lisent le tracé des zones dans le DOM alors que la donnée existe.

## Annexe — les lignes relevées

Relevé par motifs, puis trié à la main : les lignes d'interface sont
écartées. Chaque ligne est classée par sorte (voir « Ce que les modules font
au SVG »).

### Étape 1 — Stands et zones

| module | sorte | lignes |
|---|---|---|
| `rendu.mjs` (264 l.) | construit | 69, 154, 155 |
|  | balisage | 118, 132, 139, 146 |
| `ambiance.mjs` (226 l.) | construit | 218, 222 |
|  | cherche | 221 |
| `fiche.mjs` (1200 l.) | cherche | 147 |
|  | style | 187, 190, 1155 |
| `recherche.mjs` (1081 l.) | cherche | 579, 586 |
|  | style | 584, 588, 613 |
| `secteurs.mjs` (216 l.) | cherche | 168, 208 |
| `cartouche-poi.mjs` (341 l.) | cherche | 275, 279, 286 |
|  | style | 277, 280, 287, 288, 337 |
| `points-interet.mjs` (139 l.) | cherche | 51, 79 |
|  | style | 78, 80 |
| `gestes.mjs` (641 l.) | vise | 305, 402, 403, 539 |
|  | cherche | 306 |
|  | style | 478 |
| `logos-stands.mjs` (1402 l.) | cherche | 1166 |
| `libelles.mjs` (416 l.) | balisage | 141 |
|  | cherche | 301, 369 |
|  | vise | 370 |
| `nom-emplacement.mjs` (341 l.) | balisage | 55, 66, 108 |
| `texte-plan.mjs` (158 l.) | balisage | 144 |
| `vue.mjs` (743 l.) | style | 111, 118 |
|  | construit | 161, 295 |

### Étape 2 — Surcouches et calques dessinés

| module | sorte | lignes |
|---|---|---|
| `dessin.mjs` (683 l.) | balisage | 124, 154, 156, 157, 306, 361, 369, 372, 376, 378, 380, 393, 395, 522, 526, 543, 548, 567 |
|  | cherche | 133, 172, 212, 236, 607, 628, 629, 639, 657, 668 |
|  | construit | 140, 174, 182, 214, 246, 250, 258, 262 |
|  | style | 222, 640, 659, 670, 671 |
|  | ordonne | 248, 260 |
| `distinctions.mjs` (451 l.) | construit | 81 |
|  | balisage | 94, 96, 116, 138, 141, 147, 148, 274 |
|  | lit | 117, 126, 240 |
|  | style | 125, 224 |
|  | cherche | 232, 266 |
| `parcours.mjs` (601 l.) | construit | 357 |
|  | cherche | 362, 396, 427 |
|  | ordonne | 362 |
|  | style | 382, 407 |
|  | lit | 383, 405 |
|  | balisage | 406, 408 |
| `trace-itineraire.mjs` (375 l.) | balisage | 139, 144, 164, 166, 172, 173 |
|  | construit | 303, 336, 337 |
|  | cherche | 306 |
|  | ordonne | 306 |
| `vous-etes-ici.mjs` (145 l.) | construit | 67 |
|  | cherche | 70 |
|  | ordonne | 70 |
|  | balisage | 134, 135, 136 |
| `tutoriel.mjs` (1052 l.) | cherche | 1005, 1014, 1021, 1036 |
|  | construit | 1018, 1026, 1028 |
|  | ordonne | 1021 |

### Étape 3 — Habillage et fond

| module | sorte | lignes |
|---|---|---|
| `apparence.mjs` (243 l.) | construit | 46, 64, 65, 67, 68, 92, 93 |
|  | cherche | 52, 85 |
| `ordre-trace.mjs` (78 l.) | cherche | 54 |
|  | ordonne | 66 |
| `environs.mjs` (1344 l.) | construit | 1158, 1196, 1321 |
|  | lit | 1196 |
|  | balisage | 1216 |

### Étape 4 — Outils de l'exploitant

| module | sorte | lignes |
|---|---|---|
| `edition.mjs` (740 l.) | construit | 74 |
|  | ordonne | 76 |
|  | balisage | 86, 91, 115, 116, 118, 119 |
|  | cherche | 107, 127, 142 |
|  | lit | 109, 129 |
|  | style | 143 |
|  | vise | 572, 599 |
| `reprise-emplacements.mjs` (775 l.) | style | 131, 132, 173, 485 |
|  | vise | 154, 155, 646 |
|  | cherche | 167, 172 |
|  | construit | 223, 352 |
|  | ordonne | 225 |
|  | balisage | 234, 237 |
| `aimants.mjs` (536 l.) | construit | 84, 90, 91, 92, 314 |
|  | ordonne | 86, 316 |
|  | balisage | 321 |
| `batiments.mjs` (612 l.) | cherche | 302, 337 |
|  | construit | 368, 378 |
|  | ordonne | 370 |
|  | balisage | 378, 380, 381 |
|  | vise | 389 |
| `nappe.mjs` (85 l.) | construit | 68, 70, 71, 72, 73, 75, 77 |
|  | cherche | 78 |
|  | ordonne | 78 |
| `chaleur.mjs` (798 l.) | style | 168, 169, 223 |
|  | cherche | 172 |
|  | lit | 187 |
|  | construit | 195 |
| `fiche-zone.mjs` (988 l.) | cherche | 239, 689, 927 |
|  | style | 929 |
| `outil-comptoir.mjs` (224 l.) | cherche | 79, 95 |
|  | lit | 84 |
| `outil-foodtruck.mjs` (196 l.) | cherche | 52, 76 |
|  | lit | 63 |
| `outil-escalier.mjs` (230 l.) | cherche | 56, 104 |
|  | lit | 70 |
| `placement-libelles.mjs` (249 l.) | style | 113 |
|  | vise | 176 |
| `calage-carte.mjs` (927 l.) | style | 431, 432 |
| `outil-dessin.mjs` (964 l.) | style | 587 |
| `bande-admin.mjs` (125 l.) | style | 37 |
