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

## Avancement

**Étape 1, premier pas — le lecteur des stands et des zones (14 novembre
2026).** Le dessin ne lit plus ni le style calculé ni le tracé des stands et
des zones : `modules/style-emplacements.mjs` résout leur style en
JavaScript, sur les mêmes entrées que la feuille (classes et variables du
groupe, états de la racine, couleurs de la page), et `webgl.mjs` garde
chaque tracé une fois lu (`tracesDe`). Le SVG est encore construit et
encore marqué par ses écrivains (`.sel`, `.dim`, secteurs…) : ce pas ne
change que le lecteur.

L'essai `outils/essais/navigateur/style-emplacements.spec.js` compare le
style résolu au style calculé sur environ 33 000 combinaisons (classes du
groupe × états de la racine × couleurs réglées ou non) ; un écart introduit
exprès le fait échouer en nommant la combinaison.

Mesuré processeur ralenti quatre fois, ancien et nouveau code tour à tour
dans la même session (un tirage chacun, bruit d'environ ±30 % entre
tirages) :

| moment | relecture, ancien | nouveau |
|---|---|---|
| choisir un stand, cinq fois | 146 ms | 85 ms — plus de relecture du tracé ni du style calculé |
| recherche, six lettres | 86 ms | 53 ms |
| ouverture, changement de pavillon | — | pas de gain attendu : chaque tracé est lu une première fois dans les deux versions ; les écarts mesurés (de −52 % à +19 %) suivent le bruit de la machine |

Pendant un choix de stand, l'ancienne lecture appelait `getComputedStyle`
481 fois, la nouvelle 4. L'interrupteur `?emplacements=feuille`, qui rendait
l'ancienne lecture sur un même déploiement le temps de comparer, est retiré
depuis la clôture de l'étape 2 : les essais comparent les deux lectures sans
lui (`webgl.mjs` `compareLectures`).

**Étape 1, deuxième pas — l'état des emplacements (14 novembre 2026).**
Le dessin ne lit plus l'état d'un emplacement sur son groupe SVG :
`modules/etat-emplacements.mjs` le tient, et chaque module qui le décide le
lui dit par un mutateur, là même où il pose sa classe — `fiche.mjs` et
`points-interet.mjs` (`poseChoisi`), `recherche.mjs` (`poseRetires`),
`cartouche-poi.mjs` (`posePhares`), `secteurs.mjs` (`poseSecteurs`), et en
administration `chaleur.mjs` (`poseChaleurs`) et `reprise-emplacements.mjs`
(`poseRepris`). Le masquage d'une zone se lit dans ses données. Le modèle
n'importe que `donnees.mjs` : tous ceux qui l'informent dépendent déjà du
dessin, et le modèle ne pouvait pas les importer sans boucle.

Trois lectures restent sur le groupe, et `webgl.mjs` `emplacementGl` en
dépend encore : la classe `zone`, qui dit si l'emplacement est une zone ;
l'état `:focus-visible`, que seul le navigateur connaît ; et les tracés de
ses enfants, dont il tire la géométrie. Les retirer demanderait de porter les
trois dans le modèle et dans les données — c'est le chantier des groupes,
ci-dessous, et non un nettoyage.

L'essai `outils/essais/navigateur/etat-emplacements.spec.js` parcourt des
états réels de la page — recherche, stand choisi, fiche refermée, zones de
restauration mises en avant, secteurs teints, autre pavillon — et compare,
groupe par groupe, ce que le modèle dit à ce que le SVG porte ; un écrivain
qui oublie le modèle le fait échouer. La carte de chaleur et la zone masquée
ne s'y éprouvent pas : la page publique ne les a pas, et aucun essai de
l'administration ne les ouvre encore.

**Étape 1, pas 3a — les lecteurs passent aux données (en cours).** Avant
de cesser de construire les stands dans le SVG caché, plus rien ne doit les
y chercher. `etat-emplacements.mjs` rend les emplacements du pavillon dans
l'ordre où le plan pose leurs groupes (`emplacements`), et le groupe d'un
emplacement s'il est construit (`groupeEmplacement`). Fait :

- la recherche, le cartouche, le masquage des zones, les secteurs et la
  carte de chaleur décident sur les données et ne marquent le groupe que
  s'il existe ; les halos de la chaleur se mesurent sur le tracé à défaut du
  groupe ;
- la visite guidée dit au modèle la zone qu'elle désigne — et le style
  reprend la règle de `_styles-divers.css` qui pâlit les autres, oubliée au
  premier pas (régression corrigée, l'essai des règles la couvre) ;
- les outils du comptoir et des food trucks lisent leurs zones dans les
  données.

**Étape 1, pas 3a et 3b — les stands et les zones sortent du SVG caché
(15 novembre 2026).** Plus rien ne lit leur forme ni leur décor sur leurs
groupes, et quand le WebGL peint, les groupes ne portent plus de tracé.

- **La désignation des gestes.** `cibleWebgl` et `viseEnAvance` rendent une
  désignation — la sorte, la clé et les identifiants de ce qui est visé
  (`modules/designation.mjs`) — et non plus le groupe peint. `gestes.mjs` et
  tous ceux qu'il prévient (recherche, cartouche, borne, code « Vous êtes
  ici », fiche, reprise d'un emplacement) la reçoivent ; le retrait et la
  mise en avant se jugent au modèle et aux données (`recherche.mjs`
  `estRetiree`, `cartouche-poi.mjs` `oublieChoixPoi`).
- **La fiche, les distinctions, le parcours.** La fiche trouve l'emplacement
  qu'elle allume et la boîte d'où elle s'étire dans les données
  (`etat-emplacements.mjs` `emplacementPour`, `ajoutLie`, `boiteEmplacement`,
  projetée par `webgl.mjs` `rectEcranBoite`) ; `decoupeStand` ne cherche plus
  que les stands dessinés. Les distinctions relèvent tracé et boîte sur
  `traceStand(s.d)` ; le parcours trace ses liserés sur les données — ce qui
  est retenu remplace la classe `enparcours`, la teinte d'une tuile choisie
  vient de `styleEmplacement`. Les halos de la chaleur et les logos lisent
  aussi les données.
- **Le dessin.** `webgl.mjs` peint chaque emplacement depuis ses données
  (`donneeDuGroupe`, `emplacementGl`, `formeEmplacementGl`) : tracé de
  l'ambiance, hauteur du volume (libre, masquée, choisie au modèle), décor
  dans la configuration (comptoir, camions, estrade), outil que tient
  l'exploitant au modèle (`poseComptoirEnMain`, `poseCamionEnMain`).
  `formeGl` ne garde que les formes des calques, à plat. Une forme retouchée
  prévient le dessin (`FORME_CHANGEE`) : rien ne bouge plus dans le groupe
  pour que le guet la voie.
- **Les groupes sans tracé.** `svg-de-secours.mjs` (l'ancien
  `habillage-svg.mjs`) dit si le SVG peint le plan ; `rendu.mjs` ne pose le
  tracé d'un groupe qu'alors, et le rend à tous les groupes si le SVG reprend
  la main. L'essai `svg-de-secours.spec.js` le vérifie, perte de la carte
  graphique comprise.

*Décision (15 novembre 2026) : les groupes vides restent la couche
accessible.* Chaque emplacement garde son groupe, sans tracé : nommé,
focalisable, c'est ce que le clavier parcourt et ce que lit la lecture
d'écran, et la poignée par laquelle le dessin désigne un emplacement et fait
monter son volume. Une couche à part, en HTML, aurait refait tout cela pour
le même résultat. Le dessin n'y lit plus que la clé et le focus.

**Étape 5, pour les stands et les zones — le modèle prévient le dessin
(15 novembre 2026).** Le guet du SVG (`webgl.mjs`) ne surveille plus
`#stands` ni `#zones` : leurs groupes ne disent plus rien au dessin. Le
modèle le prévient (`etat-emplacements.mjs` `EMPLACEMENTS_CHANGES`). Chaque
mutateur compare l'avant et l'après et ne dit que le bloc touché — une lettre
tapée qui n'éteint rien ne relit rien — et donne les clés qui viennent d'être
choisies, dont le volume part sans attendre (`anticipeHausses`). Ce qui
change hors des mutateurs se dit par `signaleEmplacements` : le décor et le
masquage d'une zone (`fiche-zone.mjs`, `reglage-comptoir.mjs`,
`reglage-foodtrucks.mjs`), un emplacement ajouté, nommé, lié, retiré ou
reformé (`reprise-emplacements.mjs`), un pavillon monté (`rendu.mjs`), une
couche éteinte (`apparence.mjs`) ; `secteurs.mjs` `peintSecteur` repose sa
table, que le modèle compare par signature.

Les écrivains marquent encore le groupe — classe, variable, attribut —, mais
pour le seul rendu de secours. `svg-de-secours.spec.js` éprouve le contrat :
une classe posée à l'insu du modèle ne fait relire aucun bloc ; un choix dit
au modèle relit celui des stands.

Reste du guet : les calques de l'habillage, les calques dessinés, les
surcouches et les outils de l'exploitant, qui s'écrivent encore dans le SVG
caché et que le dessin y relit.

**Étape 2 — les surcouches, autrement que les stands.** Leur gain de
performance est négligeable : quelques dizaines d'éléments. Reprendre leurs
règles dans un module de style en ferait une seconde copie, quand le SVG de
secours a toujours besoin de la première. Une surcouche écrit donc son style
en attributs SVG, dans le module qui la dessine ; la feuille ne la peint plus,
et le dessin la lit par un lecteur d'attributs commun
(`modules/style-attributs.mjs`, `webgl.mjs` `PAR_ATTRIBUTS`). Une seule
source, et des règles en moins dans la feuille.

- *Fait* : les marques des distinctions (`distinctions.mjs` `traceDist`) — trois
  règles retirées de la feuille ; `outils/essais/navigateur/surcouches.spec.js`
  compare les deux lectures sur cinq combinaisons de modes, de teintes et
  d'ambiances, et échoue si une règle de la feuille les peint encore.
- *Fait* : la zone que désigne la visite guidée (`tutoriel.mjs`
  `marqueZoneTuto`) — son halo et son trait, trois règles retirées ; l'essai
  la compare sans animation, que le dessin ne rejoue pas.
- *Fait* : les liserés du choix et du parcours (`parcours.mjs`
  `dessineMarques`) — six règles retirées, dont les deux qui cachaient le
  parcours (`sans-parcours`, `poi-actif`) : il ne se trace plus du tout tant
  qu'elles sont sur la racine. Leurs couleurs venaient de jetons de la racine,
  que la feuille suivait d'elle-même ; le calque se retrace donc quand ce
  qu'il en tire change (`guetteRacine`, une signature comparée, pas à chaque
  frappe). L'essai éprouve stand et zone choisis, parcours, Tuiles, une
  couleur changée et les deux retraits.
- *Fait* : le trajet et ses pastilles (`trace-itineraire.mjs`
  `peintItineraire`) — quatorze règles retirées, dont onze de la comète du
  sens, qu'aucun module n'écrivait plus depuis que l'étincelle l'a remplacée.
  Le fil garde son dégradé par tronçons, écrit en `color-mix` des deux
  jetons résolus. La machinerie de la comète, morte elle aussi, a quitté
  ensuite le dessin et le moteur : l'extension qui faisait défiler les
  tirets, son pendant dans le shader des traits, et sa part de la boucle
  d'animation.
- *Registre* : une surcouche écrite en attributs garde les couleurs du moment
  où elle a été tracée, là où la feuille suivait un jeton changé. Chacune
  s'inscrit donc dans `jetons-racine.mjs` `suitLaRacine` (une signature de ce
  qu'elle tire de la racine, de quoi se retracer) : marques, distinctions,
  zone de la visite guidée, trajet. Les distinctions ne suivaient plus
  l'accent depuis leur passage aux attributs — c'est corrigé, et éprouvé.
- *Décision (14 novembre 2026) : les calques dessinés restent à la feuille.*
  Ils pèsent peu — vingt-sept formes sur tout FEP 2027, aucune sur SMCL —, et
  les migrer n'aurait rien gagné en vitesse. Ni en clarté : l'épaisseur d'un
  trait qui suit le zoom passe par `var(--trait-f)`, qu'un attribut refuse ;
  les stands dessinés partagent la cascade des stands, leurs noms celle de
  `#labels`. On aurait remplacé une règle par trois mécanismes. Le dessin les
  lit donc toujours dans le style calculé (`parcoursGl`), et l'étape 2 est
  close.

**Décision (14 novembre 2026), revue le 15 : les groupes des stands restent.** Mesurés,
les stands et les zones ne font que 6 à 8 % du SVG caché de SMCL (500 à 900
éléments par pavillon), contre 89 à 93 % pour l'habillage de Klipso. Depuis
les pas 1 et 2, le dessin n'y lit plus ni le style ni l'état décidé par la
page — seulement la nature de zone, le focus du clavier et les tracés (voir
le deuxième pas) ; ils restent la couche de désignation, de clavier et de
lecteur d'écran, et le repli SVG.
Les retirer — désignation par clé, fiche, décor des zones, distinctions,
parcours, couche accessible — n'en vaut la peine que si la maintenance le
demande un jour. On est passé à l'habillage. Le 15 novembre, la migration a
été menée à son terme (voir plus haut, pas 3a et 3b) : les groupes sont
restés, vidés de leur tracé.

**Étape 3 — l'habillage de Klipso (14 novembre 2026).**

- *Premier pas* : le dessin lit chaque calque dans une copie détachée de son
  balisage (`modules/calque-detache.mjs`, partagée avec le panneau des
  calques), et en résout le style sans la feuille
  (`modules/style-habillage.mjs`) : réglage de l'exploitant par calque et
  sous-calque, attributs de Klipso hérités, et les deux règles de
  `_styles-plan.css` qui l'emportent sur eux. L'essai
  `outils/essais/navigateur/habillage.spec.js` compare les deux lectures sur
  47 920 formes (SMCL tel quel) et 37 703 (avec des réglages d'exploitant) :
  toutes identiques.
- *Second pas* : quand le WebGL peint, le SVG caché ne porte plus
  l'habillage (`modules/habillage-svg.mjs`, devenu `svg-de-secours.mjs`). Le dessin le lui rend s'il lui
  rend la main — dessin trop long à venir, carte graphique perdue — et
  `apparence.mjs` remplit alors les calques montrés. Une signature du
  réglage, posée sur le groupe du calque, prévient le dessin quand
  l'exploitant change une couleur. Sur SMCL, pavillon 1, le SVG caché passe
  de 6 280 éléments à 561.

*Mesure* (SMCL 2026, processeur ralenti quatre fois, deux paires de
tirages, ancienne lecture `?emplacements=feuille` et nouvelle tour à tour sur
la même construction — moyennes, fil principal : script, style et mise en
page) :

| moment | avant | après |
|---|---|---|
| ouverture | 4 367 ms | 3 278 ms (−25 %) |
| changement de pavillon (pavillon 2) | 2 355 ms | 1 451 ms (−38 %) |
| changement de pavillon (pavillon 3) | 1 874 ms | 1 386 ms (−26 %) |
| recherche, six lettres | 760 ms | 592 ms (−22 %) |
| cinq stands choisis | 715 ms | 641 ms (−10 %) |
| restylages au survol, à la souris | 247 à 294 ms | 16 à 25 ms |
| restylages d'un glissé, à la souris | 385 à 532 ms | 43 à 52 ms |
| éléments du SVG caché, pavillons 1, 2, 3 | 6 142 / 14 583 / 7 906 | 561 / 884 / 657 |
| mémoire du processus de rendu | 212 à 215 Mo | 199 à 200 Mo |

Le gain vient du style et de la mise en page du SVG caché (à l'ouverture,
1 231 ms → 482). La relecture reste autour de 900 ms à l'ouverture : c'est
le découpage des tracés de l'habillage, qui reste à faire avec ou sans SVG.

L'étape 3 est close. Le fond de carte n'était pas dans le SVG caché : ses
tuiles vivent dans un SVG à part, hors du plan (`#fondTuiles`), le fond figé
dans un bloc HTML (`#fondFige`), et le dessin ne les lit pas ; seul l'aplat
qui vide le hall (`#trouDuFond`, un tracé) reste dans le plan. L'ordre des
calques (`ordre-trace.mjs`) ne touche plus qu'à des groupes vides. Il faudra que les modules qui les cherchent
encore dans le DOM — la fiche (`noeud`), les gestes, les logos, les
distinctions, le parcours, la visite guidée, les outils de l'exploitant —
les trouvent dans le modèle, que la désignation rende une clé et non un
élément, et qu'une couche accessible remplace leurs boutons. Le modèle
préviendra alors le dessin lui-même, à la place du guet du SVG.

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

## Le conteneur `#plan` : surface du pointeur et point d'accroche

L'élément `<svg id="plan">` a deux rôles qui ne tiennent pas à son contenu,
et qu'il garde jusqu'au bout :

- **La surface du pointeur.** Il est posé au-dessus du dessin, et tous les
  gestes s'y écoutent : `gestes.mjs` l. 364 à 538 (appui, mouvement,
  relâché, annulation, molette, clavier), `fiche.mjs` l. 103,
  `outil-dessin.mjs` l. 812 à 815 (sortie du pointeur, dépôt d'une image).
  Onze modules y capturent le pointeur pendant un geste (`setPointerCapture`
  : `gestes`, `edition`, `outil-dessin`, `reprise-emplacements`,
  `outil-comptoir`, `outil-foodtruck`, `outil-escalier`,
  `placement-libelles`, `batiments`, `calage-carte`), et y posent le curseur
  (`gestes.mjs` l. 270, `edition.mjs` l. 582 et 593,
  `reprise-emplacements.mjs` l. 140, 561, 652, 666, 731).
- **Le point d'accroche des surcouches**, posées juste à côté de lui dans la
  page : `appels.mjs` l. 68, `mini-carte.mjs` l. 42, `chaleur.mjs` l. 231,
  `trace-itineraire.mjs` l. 216 et 267, `vous-etes-ici.mjs` l. 104, et la
  toile du dessin elle-même (`webgl.mjs` l. 460 et 3328).

Il suffit donc de garder `#plan` comme une surface vide et transparente : ce
sont ses enfants qui partent, pas lui. Vidé, il ne coûte plus rien — le
curseur qu'on y pose, aujourd'hui hérité par les six mille éléments du
pavillon, ne restyle plus rien.

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
  l'itinéraire, les halos de la chaleur. Elles lisent les données et la vue,
  pas le SVG du plan ; elles ne s'accrochent qu'à son conteneur, qui reste
  (voir « Le conteneur `#plan` ») ;
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
