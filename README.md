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
- Le **secteur est une propriété de l'emplacement**, `Stand.SecteurExp`, et non
  un champ de dossier exposant : il n'a rien à régler, il vaut pour un stand
  encore libre, et il tient même quand les exposants viennent d'ailleurs. C'est
  un champ « choix », donc un code dont le libellé se lit dans la codification —
  comme la nomenclature. Le calque de délimitation cité plus haut n'en dit rien :
  il ne porte que des traits.
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
déploiement. Elle se règle désormais depuis la console, dans la fenêtre **Fiche
détail**, où chaque ligne porte les deux décisions qui la concernent : la case
qui décide qu'un champ paraît, et la liste qui dit d'où sa valeur vient.

Une fiche assemble deux choses qui n'ont ni la même nature ni la même
provenance, et la fenêtre les sépare en deux cadres dont l'en-tête nomme le
fournisseur : **Le stand**, l'emplacement tel que le plan le décrit, toujours
Klipso ; et **L'exposant**, la société qui l'occupe, qui peut venir d'ailleurs.
C'est la question qu'on se pose devant une ligne mal réglée — ce champ, je le
cherche chez qui ? Une seule ligne échappe aux deux, les conférences, et le dit
dans sa propre colonne : elles viennent du programme, dont la source se règle à
part.

**La liste des champs disponibles se relève à la synchronisation**, qui lit de
toute façon les fiches où ils se trouvent. Rien à détecter à part, aucun bouton :
côté Eventmaker le relevé ne coûte pas un appel de plus, côté Klipso il en coûte
deux — le schéma déclare ce qui existe et en donne le libellé français, un
échantillon de fiches dit ce qui est rempli.

**Une affectation est proposée dans la foulée** : pour chaque cible, le champ que
la synchronisation utilisait déjà, retenu s'il figure parmi ceux qu'on vient de
voir. Une bonne part des champs est standard — les champs natifs d'une fiche
d'invité Eventmaker, les propriétés non préfixées d'un dossier Klipso — et se
règle ainsi toute seule ; il ne reste à désigner que les personnalisés. Chaque
entrée de la liste s'annonce avec un exemple de sa valeur, seul moyen commode de
distinguer `x_Catalogue_RaisonSociale` de `x_Catalogue_Enseigne`, et les champs
personnalisés viennent en tête.

Chaque ligne dit d'où vient ce qu'elle porte : proposé par le relevé, choisi à la
main, ou vide. Une cible dont le champ habituel n'a pas été trouvé **reste vide**
plutôt que de désigner un champ inexistant — mieux vaut une fiche sans site web
qu'une synchronisation qui échoue. Une cible qu'aucun champ ne porte d'office
chez ce fournisseur reste vide elle aussi, et c'est son état normal : Klipso
n'expose ni adresse ni réseaux sociaux, mais ils deviennent réglables dès que le
salon a les champs correspondants. Un champ choisi à la main n'est plus jamais
reproposé, et décocher l'affichage ne l'efface pas.

Une cible sort du lot : **« Nouvel exposant »**. Elle n'apporte aucun texte à la
fiche mais y pose une pastille, à côté du pavillon et du numéro de stand. Le
champ qui la déclenche n'existe que sur les salons qui distinguent leurs
nouveaux venus — ailleurs la cible reste vide et rien ne paraît.

**« Logo »** n'apporte pas de texte non plus : elle pose en tête de fiche
l'image que porte la fiche de l'exposant. Côté Eventmaker, c'est l'avatar de
l'invité — là où les organisateurs déposent le logo de l'enseigne : dix-huit
des vingt et un salons du compte en tiennent, et Franchise Expo Paris 2026 en
a sur 572 de ses 576 fiches d'exposants.

Trois variantes en descendent, et une seule convient : `avatar`, l'image
déposée. `avatar_medium` et `avatar_thumb` sont recadrées au carré — le logo
« Collabora Office », large de 1772 pixels sur 667, y devient « Colla /
Offic » — et, sur une fiche sans logo, ne sont pas vides pour autant : elles
désignent une image fabriquée à la volée, les initiales de la personne
inscrite sur une pastille de couleur. La synchronisation écarte celles-là, mais
c'est bien `avatar` qu'il faut désigner.

L'image se charge chez la source, à l'ouverture d'une fiche et pas avant :
c'est ce qui la garde dans la fiche et hors de la liste des exposants, où les
cinq cents logos d'un salon pèsent soixante-dix mégaoctets quand une fiche
seule en charge vingt-huit kilo-octets — la médiane. Elle vient en tête du
corps, dans le même cadre à fond clair que le logo d'une zone organisateur et
pour la même raison : un logo est le plus souvent sombre sur transparent, et
s'effacerait sur le fond noir des modèles de fiche qui en portent un. L'adresse
qui ne répond plus efface son cadre avec elle.

Deux façons de dire oui, parce que les sources n'en offrent qu'une chacune.

Sur un **champ oui/non**, c'est l'accord qui s'énumère : valent oui `oui`, `o`,
`1`, `x`, `vrai`, `true`, `on` et leurs majuscules ; tout le reste, y compris ce
qu'on ne sait pas lire, vaut non. La règle inverse — prendre pour un oui tout ce
qui n'est pas un non reconnu — a été essayée et retirée : un champ portant une
date d'adhésion ou un tiret devenait un oui, et la fiche affirmait quelque chose
de faux.

Sur un **champ à choix**, aucune valeur n'est un oui, et c'est pourtant l'une
d'elles qui désigne les nouveaux venus. Franchise Expo 2026 range ainsi ses
577 exposants sur `anciennete` : 363 « Client N-1 », 176 « Nouveau Client »,
35 « Retour ». La ligne offre donc, sous le champ, ce que le champ peut valoir ;
on coche celles qui comptent. Plusieurs peuvent compter à la fois — un salon
tiendra « Retour » pour un retour à signaler, un autre non. Aucune cochée, ce
sont les accords ci-dessus qui reprennent la main : la ligne nomme celui que le
champ peut porter, ou dit que rien ne sera signalé quand il n'y en a aucun.

**Ce que le champ peut valoir n'est pas ce que les fiches portent**, et la
distinction se paie : côté Klipso les valeurs se relèvent sur vingt-cinq fiches,
où une valeur rare n'a aucune chance de figurer, et un salon où personne n'est
encore exclu porte `false` sur toutes ses fiches sans que `true` cesse d'exister.
Trois provenances remplissent donc la ligne, et le trait discontinu marque tout
ce qu'aucune fiche relevée ne porte :

- les valeurs **relevées** — toutes les fiches côté Eventmaker, qui sont lues de
  toute façon, un échantillon côté Klipso ;
- la **codification déclarée** par Klipso pour ce champ, demandée en un appel
  par entité au relevé des champs. Elle donne la liste entière et son libellé :
  la case porte « Prêt-à-porter » là où la fiche ne porte que `FEP26_GAM102`,
  le code restant sous la souris puisque c'est lui qui sera comparé ;
- l'**autre face** d'un oui/non, déduite du couple — `true`/`false`,
  `oui`/`non`, `1`/`0`, `on`/`off` et leurs écritures — et proposée dans
  l'orthographe de celle qu'on a vue.

**Ce qui sépare une liste d'un texte libre, c'est la répétition et non le
nombre.** Huit valeurs distinctes ou moins, c'est une liste sans discussion.
Au-delà, on regarde si les valeurs reviennent : un salon qui range ses exposants
en quatorze catégories les répète sur trois cents fiches, quand trois cents
raisons sociales ne se répètent jamais. Le seuil des huit appliqué seul écartait
les deux — un champ à quatorze catégories n'offrait rien à cocher, et la ligne
annonçait des « valeurs inconnues » qu'aucune synchronisation n'aurait relevées.
Un champ écarté dit maintenant qu'il l'a été, au lieu de se faire passer pour un
relevé muet.

Quarante valeurs restent le plafond de ce qui s'affiche, relevées ou déclarées :
la nomenclature d'un salon en compte deux cents, et deux cents cases ne se
lisent pas. Un salon synchronisé avant que le relevé ne garde les valeurs
distinctes n'a rien à proposer non plus. Dans tous ces cas la ligne le dit, et
laisse saisir la valeur à la main plutôt que de faire attendre le prochain
passage. « Exclu de la liste » se règle exactement de la même façon.

Trois lignes ne s'affichent jamais mais décident du reste, sous « Ce qui ne
s'affiche pas » : le **numéro de stand** et l'**identifiant de dossier**, par
lesquels une fiche Eventmaker retrouve son emplacement sur le plan — mal réglés,
aucun exposant n'apparaît, c'est le premier endroit où regarder — et
l'**exclusion du catalogue**, qui retire un exposant du plan public.

Tant qu'aucune synchronisation n'a eu lieu, chaque cible garde le champ qu'y
utilisait la synchronisation : un salon déjà en service ne change pas de
comportement, et une cible ajoutée plus tard ne le fait pas non plus. Le réglage
prend effet à la synchronisation suivante.

### Les champs qu'un salon est seul à tenir

Les cibles ci-dessus sont les mêmes partout, et c'est bien ainsi : une enseigne,
une ville, un site web se retrouvent d'un salon à l'autre. Mais chaque salon a un
champ que les autres n'ont pas — « Gamme de produits », « Franchise depuis »,
« Pays d'origine de l'enseigne » — dont personne d'autre n'a l'usage. L'ajouter
au code revenait à l'ajouter à tous les salons pour qu'un seul s'en serve.

Le cadre **Champs propres à ce salon**, en bas de la fenêtre, en crée autant
qu'il en faut. On donne l'intitulé — celui que la fiche affichera —, puis on
désigne le champ d'origine dans la même liste que les autres cibles. Le champ
n'existe que pour l'événement où il a été créé : son intitulé vit dans la fiche,
son origine dans la correspondance, comme n'importe quelle cible. Il se renomme
et se retire d'une pression, et le retirer efface aussi son origine et son
réglage de recherche — un champ que plus rien n'affiche n'a pas à être demandé à
l'API.

Un champ à choix côté Klipso ne porte qu'un code : sa codification est demandée
comme celle de la nomenclature, une fois par champ et pour tout l'événement, de
sorte que la fiche montre « Prêt-à-porter » et non `FEP26_GAM102`.

**Un champ à choix multiple se sépare tout seul.** Ni Klipso ni Eventmaker ne
rendent une liste : ils rendent une chaîne où les valeurs se suivent, jointes
par un point-virgule — « Devenir master-franchisé;Adhérent FFF ». Prise telle
quelle, la chaîne entière ferait une valeur à part entière : le filtre
proposerait autant d'entrées que de combinaisons, et deux exposants qui
partagent une thématique ne se retrouveraient pas. C'est la règle commune aux
thématiques, à la nomenclature et aux champs propres au salon, appliquée à la
synchronisation comme à l'affichage — les fiches déjà relevées n'attendent donc
pas le prochain passage pour se laisser filtrer.

### Les critères de recherche

Chercher par mot-clé suppose de savoir quoi taper. Un visiteur qui veut « les
enseignes de restauration présentes en Auvergne-Rhône-Alpes » ne sait pas sous
quel intitulé le salon range cela — mais l'exploitant, lui, le sait.

Chaque ligne de la fenêtre porte donc une troisième case, **Critère**. Cochée, le
champ est proposé au visiteur comme filtre, et ses valeurs entrent dans ce que la
recherche plein texte balaie. Toutes les lignes ne s'y prêtent pas : un numéro de
téléphone ou une adresse ne se choisissent pas dans une liste, et le secteur
comme les thématiques ont déjà leur bande de puces sous la recherche — un second
filtre pour eux ferait double emploi. Les champs propres au salon, eux, sont tous
éligibles.

La case ne décide pas de l'affichage : un champ peut filtrer sans paraître sur la
fiche — un code interne, une famille de produits — et l'inverse est vrai tout
autant. C'est pourquoi son origine reste réglable même quand la fiche ne le
montre pas.

Côté visiteur, rien n'est offert d'office. **Les valeurs proposées viennent des
fiches**, jamais d'une liste tenue à part : un filtre qui proposerait une ville
où personne n'expose ne rendrait que des listes vides. Elles portent le nombre de
fiches qu'elles retiennent, et se rangent de la plus portée à la moins portée.

Un critère que rien ne renseigne ne paraît donc pas — sauf sur le **plan
d'administration**, où il se montre et dit pourquoi : les valeurs se relèvent à
la synchronisation, et un champ tout juste réglé n'en a encore aucune. Sans
cela, un champ créé, associé et coché semblerait n'avoir servi à rien alors
qu'il attend seulement le prochain passage.

Sur le plan, les critères tiennent derrière **un seul bouton**, à côté de la
recherche : dépliés, ils prendraient sur un téléphone la place du plan. La
fenêtre les montre repliés, un par ligne, avec ce qui est retenu dans chacun ;
on en déplie un à la fois, et un critère à cent trente-neuf valeurs se tamise sur
place plutôt que de repousser les autres hors de vue. Ce qui est retenu se relit
sous la recherche, chaque valeur sur une puce qui la retire d'une pression —
sans quoi, la fenêtre refermée, on ne saurait plus pourquoi la liste est si
courte.

Les critères se cumulent entre eux, avec le mot-clé, avec le filtre par secteur
et avec celui par thématique, et portent sur tout le salon : un exposant retenu peut être dans un
autre pavillon que celui qu'on regarde. Une société hébergée répond pour
elle-même — c'est bien sa fiche à elle qui porte sa ville et ses rubriques — et
le stand qui l'accueille reste allumé sur le plan.

## Ce qui s'enregistre, et quand

Tout ce qu'on règle en administration — couleurs, visibilité et ordre des
calques, calques de dessin, repères, libellés placés à la main, fiches de zones
— **s'enregistre tout seul**, un peu plus d'une seconde après le dernier geste.
Rien ne reste en attente d'un clic : le navigateur en garde une copie, mais c'est
la base qui fait foi, et c'est elle que les visiteurs lisent.

Ce délai n'est pas de la prudence, c'est de l'arithmétique : un sélecteur de
couleur tiré à la souris émet un événement par pixel parcouru. On attend que la
main s'arrête, puis on écrit une fois.

Le pied du panneau des calques dit où l'on en est, et c'est tout ce qu'il y a à
surveiller :

| ce qu'il affiche | ce que cela veut dire |
|---|---|
| Configuration enregistrée | la base a tout ; les visiteurs le voient au rechargement suivant |
| Enregistrement… | le dernier geste part, ou attend son tour |
| Enregistrer — réessayer | l'envoi a échoué ; il se retente seul toutes les vingt secondes, et un clic le relance tout de suite |

Un échec ne perd rien. Le travail reste sur le poste, les pavillons dont les
dessins n'ont pas été reçus restent marqués, et le chargement suivant les
repousse de lui-même — là encore sans rien demander. Fermer l'onglet juste après
un réglage ne le perd pas non plus : l'envoi part sans attendre la fin du délai
dès que la page passe à l'arrière-plan.

### Le jeton de session se renouvelle tout seul

Un jeton d'accès Supabase vit une heure ; personne ne travaille une heure
d'affilée sur un plan, on l'ouvre le matin et on y revient dans la journée.
Passé ce délai la base refusait tout, et chacun le disait à sa façon : le bouton
d'enregistrement tournait en rond sur son « réessayer », la carte de chaleur et
le classement de la suggestion rendaient un `JWT expired` brut.

La session était pourtant récupérable : la console range à côté du jeton qui
expire celui qui permet d'en obtenir un neuf. L'échange se fait donc dans
`base()`, le seul endroit par lequel passent tous les appels du plan à la
base — avant de partir quand il reste moins d'une minute au jeton, et après
coup si la base refuse quand même (horloge en retard, jeton révoqué ailleurs).
Un seul échange à la fois : un jeton de renouvellement ne sert qu'une fois, et
la publication écrit pavillon par pavillon.

Le 403 n'est pas touché : c'est un droit qui manque, pas un jeton qui se périme.
Et quand l'échange lui-même ne rattrape plus rien — absence après plusieurs
jours, déconnexion depuis un autre poste — l'erreur se lit en toutes lettres,
« session expirée, reconnectez-vous », plutôt qu'en JSON.

### Et le plan public, lui, suit

Enregistrer ne suffit pas : le plan public n'est pas lu dans la base à chaque
visite, il est servi par le Worker depuis son stockage KV, et cette copie ne se
périmait que d'elle-même — dix minutes de fraîcheur, puis une copie dépassée
encore servie le temps d'en refaire une. L'administration pouvait donc dire
« enregistrée » un quart d'heure avant que les visiteurs voient quoi que ce
soit, et personne ne savait à partir de quand regarder.

La page le dit donc au Worker en finissant : `POST /api/oublie?slug=…`, qui
efface ce qu'il gardait de ce salon. La visite suivante relit la base et
repeuple le cache. Oublier ne coûte qu'une lecture de plus, mais demande une
session de ce projet — sinon ce chemin serait un moyen de vider le cache en
boucle. Le fond de plan n'a rien à oublier : son adresse porte une version, et
l'apparence entre dans son calcul.

Reste la part du navigateur du visiteur, qu'on ne peut pas effacer à distance :
elle est courte — trente secondes, une minute de grâce en cas de panne — parce
qu'un navigateur qui revient retombe sur le Worker, qui répond de son stockage
sans toucher la base. Compter donc **moins d'une minute** entre le geste et le
plan public, et un rechargement.

Deux conséquences à connaître. **Il n'y a plus d'essai sans publication** : une
couleur changée part aux visiteurs, il faut la changer à nouveau pour revenir en
arrière. Et **deux administrateurs sur le même salon s'écrasent l'un l'autre**,
le dernier à régler ayant le dernier mot — ce qui était déjà vrai du bouton,
mais arrive maintenant sans qu'on l'ait demandé.

## Placer un libellé à la main

Le nom d'un stand se pose tout seul : au milieu de l'emplacement, à la taille
que la place autorise, découpé en une à trois lignes selon ce qui rentre. C'est
juste pour un rectangle, et ce l'est moins dès que le plan sort du cas d'école
— un stand en L dont le nom tombe sur la découpe, deux enseignes voisines dont
les noms se touchent, une zone organisateur dont l'intitulé traverse une allée.
L'exploitant voit ces cas-là ; le calcul, non.

Le **crayon** de la couche *Textes*, dans le panneau des calques, ouvre un mode
où l'on attrape un libellé et où on le pose ailleurs. Une palette s'ouvre sur celui qu'on retouche : sa taille, et de quoi
revenir au placement automatique. Les flèches du clavier l'ajustent au quart de
mètre, au mètre touche majuscule tenue. Hors de ce mode, un libellé ne reçoit
aucun clic — c'est le stand qui est dessous qu'on désigne à travers lui.

Deux choses valent d'être sues :

- **La taille est un facteur, pas une valeur.** Elle multiplie ce que le calcul
  a trouvé au lieu de le remplacer, si bien que l'enseigne garde le découpage
  en lignes que sa place lui donnait : l'agrandir ne la recompose pas d'un coup
  en travers du stand.
- **Dans ce mode, un libellé réglé s'affiche quelle que soit sa taille à
  l'écran.** Sans cela, le réduire au point de le faire disparaître le rendrait
  inatteignable, et le réglage impossible à défaire.

Le réglage se range dans l'apparence du salon, avec les couleurs et l'ordre des
calques, et part aux visiteurs de lui-même.

### Ce qui le périme, et ce qui ne le périme pas

Une synchronisation ne touche jamais à l'apparence : un placement fait
aujourd'hui est encore là demain, c'est ce qu'on attend de lui.

Mais un décalage ne veut dire quelque chose que par rapport à une forme et à un
texte donnés. Chaque placement porte donc l'**empreinte** de ce dont il dépend :
ce qui s'écrit — le nom, le numéro — et la forme qui le porte, son ancrage et
la place dont il dispose autour. Si Klipso renomme l'exposant, déplace le stand
ou le redimensionne, l'empreinte ne correspond plus et le placement cesse de
s'appliquer : le libellé revient à sa position calculée. Le laisser flotter à
côté d'un stand qui a bougé serait pire que de le replacer tout seul.

Il n'est pas effacé pour autant, il cesse de valoir : si la forme revient telle
qu'elle était, il revient avec elle. Une synchronisation qui ne change rien —
le cas ordinaire — ne périme donc rien.

Le nom retenu dans l'empreinte est celui qui s'affiche, y compris quand
l'exploitant l'a choisi lui-même sur une zone : renommer, c'est écrire autre
chose, et cet autre chose n'a pas de raison de tenir à la même taille au même
endroit.

## Reprendre la forme d'un stand ou d'une zone

Les emplacements et les zones organisateur viennent de la source du plan, et
c'est bien ainsi : personne ne veut redessiner neuf cents stands. Mais la source
se trompe, ou tarde. Un stand posé de travers, une zone qui déborde sur l'allée,
un îlot recomposé la veille du montage et pas encore ressaisi : l'exploitant
voit le plan, la source non.

Le **crayon** des couches *Stands* et *Zones organisateur*, dans le panneau des
calques, ouvre un mode où l'on reprend une forme à la main — comme celui de la
couche *Textes* ouvre le placement des libellés. On clique l'emplacement, on le
glisse pour le déplacer, on tire ses poignées pour le redimensionner ; les
flèches du clavier l'ajustent au quart de mètre, au mètre touche majuscule
tenue. Les trois modes — dessin, libellés, géométrie — se ferment l'un l'autre :
leurs glissers viseraient le même pointeur.

Deux choses commandent le geste :

- **Les aimants sont ceux du dessin.** La forme s'accroche aux coins et aux
  centres des emplacements voisins, à leur grille, et aux formes déjà
  dessinées — c'est contre eux qu'on la range, et eux seuls sont justes au
  centimètre. *Alt* relâche l'accrochage le temps d'un geste. Une forme ne
  s'accroche jamais à elle-même.
- **Un rectangle d'aplomb reste un rectangle.** Ses quatre coins commandent, la
  poignée opposée tenant bon ; tirer un seul de ses sommets en aurait fait un
  trapèze. Une forme quelconque — un L, une zone au contour libre — se reprend
  sommet par sommet. Deux champs donnent la largeur et la hauteur exactes quand
  la forme est rectangulaire.

Le **cadenas** de la ligne, lui, est **fermé d'avance**, à l'inverse de celui
d'un calque de dessin. Un calque de dessin naît ouvert parce que c'est pour y
dessiner qu'on le crée ; les emplacements, eux, sont là depuis la
synchronisation, et neuf fois sur dix on ne vient au panneau que pour les
recolorer ou les masquer. Il faut donc avoir voulu ouvrir le cadenas — et le
refermer referme le mode.

Le réglage se range dans l'apparence du salon, comme le placement d'un libellé,
et part aux visiteurs de lui-même : c'est la forme reprise qu'ils voient.
**« Géométrie d'origine »**, dans la palette, rend à l'emplacement celle que la
source lui donne et efface le réglage.

### Ce qu'une synchronisation en fait

Chaque reprise porte l'**empreinte** de la géométrie dont elle part — le tracé
servi par la source, condensé. Si la source ne touche pas à l'emplacement,
l'empreinte correspond encore et la forme reprise tient : c'est tout l'objet.
Si elle le déplace ou le redécoupe, l'empreinte ne correspond plus et la reprise
cesse de s'appliquer : **c'est la nouvelle géométrie de la source qui s'affiche**.
La source a tranché, et la forme qu'elle décrit maintenant n'est plus celle
qu'on avait reprise.

Le réglage n'est pas effacé pour autant, il cesse de valoir — si la source
revient sur ses pas, il revient avec elle.

L'empreinte porte sur le tracé servi, et sur rien d'autre : elle ne sait pas
d'où il vient et n'a pas à le savoir. Klipso aujourd'hui, une autre sorte de
source demain, la règle est la même sans qu'on y touche.

## Verrouiller un calque de dessin

Un plan finit par porter un calque auquel on ne touche plus : le contour du
hall, les murs qui barrent les trajets, le repérage posé une fois pour toutes.
Il reste pourtant à un clic du crayon, au milieu de ceux qu'on retouche encore,
et une forme y part à la dérive sans qu'on s'en aperçoive — on croyait dessiner
sur le calque d'à côté.

Le **cadenas** de sa ligne, dans le panneau des calques, le ferme. Le calque ne
s'ouvre alors plus au dessin : ni tracé, ni forme attrapée, ni déplacement, ni
suppression. Le crayon et la croix de sa ligne s'éteignent avec lui, et la
fenêtre de réorganisation montre le cadenas là où elle offrait de renommer. Une
image glissée sur le plan, qui se posait d'office sur le dernier calque, va
maintenant au dernier qui ne soit pas verrouillé.

Ce qu'il laisse passer, il le laisse exprès : **masquer le calque et changer sa
couleur restent libres** — c'est en les réglant qu'on travaille autour de ce
qu'on protège — et **son rang dans la pile** aussi, qui ne touche pas au dessin
et se reprend d'un geste.

Le verrou vit dans les réglages, comme le rôle d'un calque dans les itinéraires,
et part aux autres postes avec eux : les colonnes de `calque_dessin` sont
fixées, celles des réglages ne le sont pas, et rien de tout cela ne demande de
migration.

## Le parcours de visite

Le visiteur retient des exposants — par le signet en tête de leur fiche — et des
conférences — par celui posé à côté de chaque ligne du programme d'une zone
organisateur, ou depuis la fiche de la conférence. Un bouton de la barre du haut
ouvre la liste, portant le nombre de choses retenues ; ce qui y figure porte un
liseré sur le plan, une zone entrant par les conférences qu'elle abrite.

La fonction se retire depuis « Réglages du plan », en administration, avec les
icônes de zoom et l'échelle : décocher « Proposer le parcours de visite » fait
disparaître d'un coup le bouton, les signets et le liseré. Comme les autres
réglages, il part aux visiteurs tout seul, sans rien à publier. Le retrait ne détruit rien — les listes déjà constituées sur les
téléphones réapparaissent si le réglage se rouvre.

Le pied du tiroir porte **« Organiser ma journée »**, qui met cette liste en
heures : c'est l'objet de la section suivante.

Cette liste **ne quitte jamais l'appareil** : elle vit dans le stockage local du
navigateur, sous une clé par événement (`plan-parcours:<slug>`), et ne contient
que des identifiants. Rien n'est envoyé au serveur, aucun compte n'est demandé,
et un exposant renommé entre deux visites s'affiche sous son nouveau nom — les
libellés sont relus dans les données à chaque affichage. Ce que le plan ne
connaît plus est écarté au chargement, pour qu'un stand démonté ne laisse pas
un rang mort.

## Compléter une visite — la suggestion

Un visiteur qui retient quatre enseignes du même secteur ne compose pas une liste
au hasard : il cherche quelque chose, et sa liste le dit avant lui. Le plan lui
propose alors **un exposant de plus**, en tête de son parcours, en disant d'où
vient la proposition avant de dire où elle mène :

> Vous avez ajouté 4 exposants du secteur « Agroalimentaire » à votre liste.
> Vous pourriez être intéressé par l'exposant CLUB CAFE.

Suit le nom, son emplacement, le signet pour l'ajouter et la croix pour ne plus
le voir. **En tête, et non à la suite** : elle découle de la liste, sa place
logique était donc après elle — mais sur un téléphone le tiroir ne montre que
trois rangs, et personne ne fait défiler sa propre liste pour voir ce qu'il y a
après ce qu'il a lui-même retenu. Le refus vaut le temps de la page : il porte sur l'instant, pas sur
l'exposant.

Le critère que le plan connaît d'avance porte son article — « du secteur », « de
la ville », « du pays ». Un champ que le salon s'est ajouté n'en a pas : rien ne
dit le genre de « Famille » ni d'« Univers », et ceux-là se disent « marqués
« X » », qui va avec tout.

**Un exposant déjà dans la liste n'est jamais proposé** — il ne la compléterait
pas. Pas plus qu'un exposant écarté d'un revers de main, ou démonté depuis le
dernier relevé. Quand la valeur n'a plus personne à offrir, c'est la valeur
suivante de la liste qui est examinée.

La fonction est éteinte d'origine et se règle dans « Réglages du plan », onglet
**« Suggestion »** :

- **le critère de rapprochement** — un des critères de recherche du salon,
  ceux-là mêmes que le visiteur peut cocher : secteur, ville, nomenclature,
  thématiques, ou un champ que le salon s'est ajouté ;
- **le seuil** — combien d'exposants d'une même valeur doivent figurer dans le
  parcours avant qu'on en propose un autre, de 2 à 12 (3 d'origine) ;
- **la présentation** — *discrète*, la proposition attend en tête du tiroir du
  parcours, là où le visiteur va de lui-même ; *au premier plan*, elle s'ouvre
  **en plus** dans une fenêtre dès que le seuil réglé est atteint, quel qu'il
  soit. La fenêtre ne remplace pas le tiroir, elle s'y ajoute ;
- **l'exposant proposé**, de deux provenances :
  - **le plus consulté du salon** dans cette valeur, relevé dans les compteurs
    d'usage ;
  - **un exposant choisi**, un par valeur — la liste ne propose que ceux qui
    portent la valeur, puisque ce qu'on met sous les yeux du visiteur doit
    ressembler à ce qu'il a retenu.

Seules les valeurs qu'**au moins trois exposants** portent sont réglables : à
deux, il faudrait que le visiteur les retienne tous pour atteindre le seuil, et
il ne resterait plus personne à proposer.

### La fenêtre au premier plan, et ce qui la retient

Elle interrompt — c'est tout son intérêt, et tout son risque. Trois règles la
tiennent, et ce sont elles qui font la différence entre un coup de pouce et une
réclame :

- **sur un ajout, jamais à l'ouverture.** C'est le geste d'ajouter un exposant
  qui peut faire atteindre le seuil ; rouvrir le plan sur une liste retenue la
  veille n'en est pas un, et accueillir le visiteur par une fenêtre qu'il n'a
  pas demandée serait autre chose que compléter sa visite ;
- **une fois par proposition.** Le couple valeur + exposant est retenu le temps
  de la page. Revenue à chaque ajout, la fenêtre se ferait fermer sans être lue ;
- **jamais par-dessus une autre fenêtre.** Celle qui est ouverte a été demandée,
  elle : un réglage en cours de saisie, une confirmation à donner.

### Est-ce que ça sert ? — la mesure

Un exposant proposé se lit et s'ajoute comme n'importe quel autre : ses fiches
et ses ajouts se comptaient donc sans se distinguer de ceux qu'on est allé
chercher soi-même, et l'on ne pouvait pas répondre à la seule question qui
décide de garder la fonction ou de l'éteindre.

Le vocabulaire des compteurs porte donc un canal de plus, `suggestion`, et deux
chiffres le rendent :

- **les fiches ouvertes depuis la proposition** — une barre « Proposé pour
  compléter une visite » dans le rapport d'utilisation, une colonne du même nom
  dans l'export par exposant ;
- **les ajouts au parcours venus de la proposition** — colonne « Ajouts depuis
  une suggestion » de l'export, à côté du total des ajouts et non déduite de lui.

Les deux gestes de la carte les portent, du tiroir comme de la fenêtre : ouvrir
la fiche, et toucher le signet. Rien à reprendre dans ce qui est déjà
enregistré — aucun geste passé ne portait ce canal, et les compteurs d'hier
gardent exactement leur sens.

### Ce qui ne sort pas du salon, et ce qui n'y entre pas

Le rapprochement se fait **sur l'appareil du visiteur**, sur la liste qu'il a
sous les yeux : rien de ce qu'il retient ne remonte, et le plan ne demande rien
au serveur pour proposer.

Il faut donc que la page publique ait de quoi répondre seule, alors que les
compteurs d'usage ne sont lisibles que d'un compte qui a accès au salon —
`audience_cibles` est en « security invoker ». Le classement est par conséquent
relevé **en administration**, à chaque ouverture de l'onglet et par le bouton
« Relever le classement », puis réduit à ce que la suggestion en fera : les trois
exposants les plus consultés de chaque valeur. C'est ce relevé, et lui seul, qui
part aux visiteurs avec le reste des réglages. Le classement entier aurait dit à
tout le monde quel stand personne n'ouvre ; trois noms par valeur ne disent que
ce qu'ils proposent.

Trois plutôt qu'un parce que le premier de la liste est aussi celui que le
visiteur a le plus de chances d'avoir déjà retenu — c'est le plus consulté du
secteur. Les suivants prennent alors le relais, et quand la valeur n'a plus
personne à offrir, c'est la valeur d'après qui est examinée.

Un salon qui n'a pas encore ouvert n'a aucun classement : la suggestion se tait
plutôt que d'annoncer comme le plus consulté un exposant tiré au hasard. L'onglet
le dit en clair — « *n valeurs ont un exposant à proposer, sur N* » — et
« un exposant choisi » est la provenance qui rend la fonction vivante dès le
premier jour.

Retirer le parcours de visite retire la suggestion avec lui : il n'y a plus ni
liste à compléter ni tiroir où poser la proposition, et l'onglet le signale.

### Un seul thème, et c'est le clair

Le plan n'a pas de mode sombre, ni pour le visiteur ni pour l'exploitant, et
n'écoute pas la préférence de l'appareil. Il l'a eu : la feuille de style
peignait la nuit dès que `prefers-color-scheme` la réclamait, et un bouton dans
la barre permettait d'en changer.

Un plan de salon ne se lit pas le soir au fond d'un lit. Il se consulte debout
dans un hall éclairé, à côté d'une signalétique imprimée en noir sur blanc, le
plus souvent sur un téléphone dont le thème sombre a été réglé une fois puis
oublié — si bien que le plan arrivait noir chez des visiteurs qui n'avaient rien
demandé. Deux jeux de couleurs, c'était aussi deux fois à vérifier pour chacun
des onze habillages, et une raison de plus pour qu'une couleur réglée par
l'exploitant tienne d'un côté et pas de l'autre.

La console, elle, garde les deux et suit l'appareil : on y travaille la journée
durant, devant un écran qu'on ne quitte pas. C'est le seul endroit du dépôt où
la nuit subsiste — `_console.css` pour les tons, `_console-base.html` pour le
bouton. La barre du navigateur suit la même partition : une couleur pour les
pages du plan, deux pour la console (`outils/pwa.js`, option `deuxThemes` de
`page()` dans `outils/genere.js`).

### Les fenêtres portent l'habillage, sauf les outils

La fenêtre modale restait au fond neutre pendant que le bandeau, la liste, la
fiche, le parcours et l'itinéraire portaient la couleur du salon. C'est pourtant
là que le visiteur coche ses critères de recherche, lit le programme d'une
conférence, choisit une société sur un stand partagé, fait organiser sa journée,
confirme un vidage de parcours et reçoit la proposition qui complète sa visite.
Elle porte donc le modèle comme les tiroirs — sur la fenêtre et non sur le voile
qui la porte, celui-ci devant rester le gris sombre qui met le plan en retrait.

Restent neutres les **fenêtres d'exploitation**, que leur genre nomme :
`large` pour les réglages du plan et la fiche d'une zone, `outil` pour la remise
à zéro des compteurs, l'ordre des calques et le nom d'un calque. Ce sont les
outils de l'exploitant, et deux d'entre elles ne pourraient pas porter
d'habillage sans mentir :

- les **réglages** montrent les onze habillages en vignettes, et l'on ne compare
  pas onze habillages depuis une fenêtre qui en porte déjà un : celles dont le
  modèle ne redéfinit pas son propre fond laisseraient voir celui de la fenêtre
  au travers ;
- la **remise à zéro** écrit son avertissement en rouge, d'un rouge qui ne
  s'accorde à aucun fond puisqu'il ne vient d'aucun jeton. Sur un habillage
  coloré il devenait illisible — et c'est le seul écran du plan où quelque chose
  se perd sans retour.

Le fond de la fenêtre se pose en `background-color` et non en `background` :
plusieurs modèles y déposent un dégradé ou une trame, et la forme courte, écrite
après eux dans la feuille, les effacerait. Même ornière que sur le parcours et
l'itinéraire.

## L'itinéraire d'un stand à l'autre

Un bouton de la barre du haut, et un bouton « Itinéraire » sur chaque fiche,
ouvrent un tiroir à deux champs : d'où l'on part, où l'on va. **Il n'y a pas de
géolocalisation** — sous une charpente métallique le GPS ne situe rien, et
baliser les allées demanderait une pose que personne ne finance. Le visiteur
désigne donc son départ comme son arrivée, parmi les stands, les zones et les
repères posés par l'exploitant ; c'est pour cela que les repères comptent
autant que les stands dans la liste : « Entrée » est le départ le plus probable
de quelqu'un qui arrive.

Deux manières de désigner un point, parce qu'on ne sait pas toujours le nom de
ce qu'on voit. La saisie propose ses résultats en dérouleur, sous le champ
qu'on remplit. Le viseur, au bord de chaque champ, donne le geste inverse : le
clic suivant sur le plan remplit le champ au lieu d'ouvrir une fiche, et tant
que l'autre champ est vide il enchaîne — deux touchers suffisent pour un
trajet. Sur un téléphone le tiroir couvre les deux tiers de l'écran : il
s'efface le temps de la visée, un bandeau rappelant ce qu'on choisit, et
revient dès qu'elle aboutit.

Le chemin se calcule sans qu'aucune allée soit décrite nulle part. Les données
ne donnent que les emplacements ; l'allée, c'est ce qui reste entre eux. Le
pavillon est donc pavé de cases d'un demi-mètre, on y noircit les stands et les
zones — épaissis de la moitié du passage nécessaire, pour ne pas raser les
cloisons — et un A\* cherche la suite de cases blanches la plus courte.

Trois réglages font la différence entre un chemin juste et un chemin qu'on suit
des yeux, et ils tiennent tous à la même observation : entre deux points d'une
allée, une grille offre des milliers de trajets de même longueur.

- **Quatre voisins, jamais huit.** Une diagonale de grille n'a pas d'équivalent
  dans une allée.
- **Un virage coûte quatre cases.** Sans ce prix, A* choisit au hasard parmi
  les escaliers équivalents et le trait traverse l'allée en biais. À deux
  mètres, un crochet ne se justifie plus que s'il fait gagner davantage : les
  tronçons redeviennent de longues lignes droites.
- **Le bord d'une allée coûte deux cases de plus que son milieu**, la pénalité
  s'éteignant à deux mètres du mur. Le prix du virage se retourne ici contre
  le centrage : rejoindre le milieu en coûte deux, et il faut que la traversée
  se rembourse. Le réglage d'origine — un quart de case d'écart — demandait
  seize mètres de ligne droite avant d'être rentable, si bien que le trait
  longeait les emplacements d'un bout à l'autre du hall ; à deux, quatre
  mètres suffisent. L'accroche vise elle aussi le milieu plutôt que le bord :
  la première case d'allée rencontrée touche la façade, et démarrer là obligeait
  à deux virages que le calcul ne payait qu'à contrecœur. Mesuré sur cent vingt
  trajets : la part du tracé collée au mur tombe de 26 % à 7 %, pour 6 % de
  longueur en plus.
- **Longer un bord coûte une demi-case.** La pénalité s'éteint à deux mètres du
  mur le plus proche — au-delà, dans une aire dégagée, aucun « milieu » n'a de
  sens — et tient le trait au centre du passage partout ailleurs.

Le chemin obtenu se réduit ensuite à ses tournants, et rien d'autre : pas de
fil tendu entre deux angles, qui les couperait par définition. L'amorce, du
centre du stand à l'allée, est coudée pour la même raison. Sur les trois
pavillons, cinq cents segments d'essai : aucun de travers, et un mètre
quatre-vingts de dégagement en moyenne de part et d'autre du trait.

Deux choix méritent d'être connus avant de les remettre en cause :

- **On ne passe pas derrière les stands de périphérie.** L'emprise d'un
  pavillon est une boîte qui déborde d'une douzaine de mètres autour des
  emplacements ; rien n'y empêcherait un trajet de contourner le hall par
  l'extérieur. À défaut de mieux, la marche est bornée à l'enveloppe convexe
  des emplacements, dont les stands du pourtour dessinent le bord.
- **Ce qui sépare deux plans ne figure sur aucun d'eux.** Tant que l'exploitant
  n'a rien relié — voir *Passer d'un plan à l'autre*, plus bas — le trajet se
  coupe à la porte : le tronçon de départ jusqu'à la porte la plus proche, puis
  celui d'une porte du pavillon suivant jusqu'à l'arrivée, et le visiteur lit
  « rejoignez le pavillon 7.2 » entre deux tracés qui, eux, sont exacts. La
  distance annoncée est alors celle des seuls tronçons, et l'affichage le dit
  (« au moins 165 m »). Sans repère « Entrée/Sortie » sur le plan, cette partie
  n'est pas tracée, et le tiroir l'explique plutôt que d'inventer. Entrée et
  sortie ne font qu'un type de repère : on entre et on sort par la même porte,
  et le trajet l'emprunte dans les deux sens. Les plans posés avant cette fusion
  n'ont rien à reprendre — l'ancien pictogramme « Sortie » se range sous le
  nouveau.

### Entrer sur un emplacement

On n'entre pas sur un stand en traversant son voisin, et l'on y entre par le
milieu d'une façade qui n'est pas mitoyenne. La règle paraît évidente ; elle ne
l'était pas pour le calcul, qui la violait de deux manières.

L'accroche s'écartait du centre en anneaux **murs compris**, sans distinguer à
qui ils appartenaient : un stand serré entre deux voisins s'accrochait à
l'allée d'en face, à travers le stand du voisin. Elle ne franchit désormais que
sa propre emprise, dégagement compris — peinte comme la grille l'a été, pour
que les deux se recouvrent exactement. Un emplacement qu'aucune allée ne borde
garde son garde-fou : mieux vaut un trait qui coupe par le voisin qu'un stand
qu'on ne sait plus atteindre.

L'amorce, elle, sortait du stand **parallèlement à l'allée** avant d'en
franchir la façade : elle longeait l'intérieur de l'emplacement sur toute sa
profondeur, puis ressortait par le côté — d'où les crochets dessinés au milieu
des stands. Elle quitte maintenant l'emplacement droit, perpendiculairement, et
le côté par lequel elle sort est **la face libre la plus proche** : celles
qu'un autre emplacement borde sont écartées, ce qui fait sortir un stand de
rangée par son unique côté ouvert plutôt que par le voisin qui se trouvait dans
l'axe. Les façades se lisent dans la géométrie et non dans le pavage : entre
deux stands serrés, les dégagements se rejoignent et tout devient mur, si bien
qu'on ne distinguait plus une façade fermée d'un passage trop étroit.

Éprouvé sur les 974 emplacements des trois pavillons : trois amorces sur mille
traversent encore un voisin, toutes sur des emplacements que le plan enclave.

Enfin, **les mètres parcourus à l'intérieur d'un emplacement ne comptent pas**.
Le trait part du centre du stand parce que c'est lui qu'on montre, mais
personne ne traverse un stand de son milieu à sa façade pour en sortir : on y
est déjà. Les compter gonflait chaque tronçon de la demi-profondeur de ses deux
emplacements, et autant de minutes de marche annoncées pour rien sur une
journée de vingt visites.

### Ce qui n'est pas praticable

L'enveloppe des emplacements est un pis-aller : elle ignore tout ce que le fond
de plan est seul à savoir. Un bloc sanitaire, un local technique, une réserve
n'est ni un stand ni une zone — il n'existe que dans le dessin — et un trajet le
traverse comme s'il n'était pas là.

On a d'abord voulu lire ce dessin. Il est bien rangé en sous-calques nommés —
`5-SANITAIRES`, `INFOPRO_SURFACE_POTEAUX` — et les mesurer un à un montre qu'on
pourrait en barrer certains sans rien casser. Mais ces noms sont ceux du bureau
d'études qui a produit le DWG, ils changent d'un salon à l'autre, et le fond est
un export de traits où murs, cotes et hachures se ressemblent : ce qui marche
pour trois pavillons ne s'industrialise pas. **Cette piste est abandonnée, et
c'est un choix, pas un oubli.**

On demande donc, plutôt que de deviner. Un calque de dessin reçoit un **rôle
dans les itinéraires**, réglé dans la barre de dessin, et tout ce qu'on y trace
le porte :

| rôle | effet |
|---|---|
| *Aucun* | le calque est décoratif, comme avant |
| *Infranchissable* | ce qui est dessiné barre le passage à tout le monde |
| *Infranchissable en fauteuil* | il n'est contourné qu'en itinéraire accessible |
| *Où l'on peut marcher* | les trajets ne sortent plus de ce qui est dessiné ici |
| *Où l'on peut marcher — PMR uniquement* | ce qui est dessiné ne s'ouvre qu'en itinéraire accessible, et reste fermé aux autres |

Les deux bouts par lesquels on peut prendre le problème. **Barrer est presque
toujours le plus court** — un bloc sanitaire fait un rectangle, une allée en
fait cinquante — et c'est ce que la liste propose en premier. Le dernier rôle
reste là pour le hall dont le vide n'est, dans l'ensemble, pas praticable : dès
qu'un pavillon porte une circulation dessinée, elle remplace l'enveloppe et ce
qui n'est pas dessiné cesse de l'être. Cela coûte une après-midi de tracé, et il
vaut mieux le savoir avant de s'y mettre. Dans les deux cas, tracez les surfaces
telles qu'elles sont : le dégagement au bord est retiré tout seul.

Le rôle *PMR uniquement* sert un cas que ni barrer ni ouvrir ne savait dire : le
couloir qui mène à l'ascenseur est bien praticable, et le trajet ordinaire n'a
pourtant rien à y faire — l'escalier d'à côté est plus court, et personne ne
tient à y envoyer la foule d'un salon. Ouvert au fauteuil, fermé au marcheur :
c'est le seul rôle dont l'effet dépend du mode. Faites-le **mordre d'un bon
mètre sur l'allée qu'il rejoint** — le couloir est creusé de son dégagement
comme une allée l'est du sien, et une jonction bord à bord serait mangée par
cette érosion. Mordez dans la longueur de l'allée et non en travers : cette
morsure se referme sur le marcheur comme le reste du couloir. La case « Voir ce qui est praticable », l'option accessible
cochée puis décochée, montre les deux grilles et tranche la question.

Une case **« Voir ce qui est praticable »**, dans la même barre, teinte la
grille telle que le calcul la voit. Sans elle on dessine à l'aveugle : deux
allées qui ne se touchent pas d'un demi-mètre ne se remarquent qu'au premier
trajet qui échoue, et sans dire où. Elle n'existe qu'en administration.

Le rôle vit dans les réglages, à côté de l'ordre des calques, et part aux
visiteurs avec eux : les colonnes de `calque_dessin` sont fixées, celles
des réglages ne le sont pas, et rien de tout cela ne demande de migration.

### Ce qu'un repère est, et ce qu'il s'appelle

Un repère porte deux choses distinctes, et les confondre coûtait cher.

Son **type** se choisit dans une liste — Entrée/Sortie, WC, Escalier, Accueil,
Restauration, Ascenseur… — et c'est lui qui porte les propriétés : le
pictogramme affiché, la qualité de passage par où un trajet change de plan, et
l'obstacle qu'un escalier ou un escalator oppose au mode accessible. Son **libellé** s'écrit librement et ne sert qu'à distinguer un
exemplaire d'un autre.

Le type était auparavant deviné depuis le libellé, sur correspondance exacte :
« Entrée » était une porte, « Entrée Nord » n'en était plus une — ni pour le
dessin, ni pour l'itinéraire, ni pour la liste des départs. Un hall qui nommait
ses portes perdait ce qui les rendait utiles, et deux escaliers ne pouvaient
pas être nommés sans cesser tous deux d'être des escaliers.

**Sur le plan, la pastille ne porte que le pictogramme.** Le libellé s'écrivait
à côté dès qu'il disait autre chose que lui — « Entrée Nord » a besoin de son
nord — mais un nom écrit à la taille du plan ne se lit qu'en zoomant, et la
pastille s'allongeait de tout ce texte en travers de l'allée qu'elle désigne.
Le pictogramme répond à la question qu'on se pose de loin : ce que c'est. Le
nom se demande de près, et **le clic ouvre une fiche** qui le donne, avec ce
que le repère dessert quand c'est un passage — un escalier qui monte à deux
étages le dit là. Deux boutons y suivent, comme sur la fiche d'un exposant :
centrer sur le plan, et prendre ce repère pour arrivée d'un itinéraire. Le
cartouche des points d'intérêt, en bas du plan, continue de les nommer tous et
met en avant ceux qui portent le même nom.

Un repère sans pictogramme — un libellé libre, « Point presse » — garde sa
pastille de texte : c'est tout ce qu'il a à montrer.

Le type se change après coup depuis le panneau de la forme choisie — une porte
mal typée ne se voit qu'en essayant un trajet, et il serait absurde de la
redessiner pour cela.

Les repères posés avant cette séparation n'ont que leur libellé : il continue
d'être interprété pour eux, et leur plan s'affiche comme il le faisait. Le type
s'écrit dès qu'on y touche.

### Matérialiser un co-exposant sur son stand

La synchronisation rend **une forme par dossier**. Un stand loué à plusieurs
n'en a donc qu'une, et les sociétés qui s'y installent n'existent que dans une
liste, sous le nom du titulaire : la fiche les nomme, la recherche les trouve,
mais sur le plan elles ne sont nulle part. Le visiteur qui cherche l'une d'elles
arrive devant une cloison où est peint le nom d'une autre. Un stand de
restauration en héberge jusqu'à onze.

L'outil **Stand** de la barre de dessin les matérialise. On choisit l'exposant —
titulaire ou co-exposant, la liste mêle les deux et les désigne par
« numéro — enseigne » — puis on trace sa part du stand comme un rectangle. La
part est un dessin, elle vit sur un calque et se publie avec lui ; ce n'est pas
une donnée, et la synchronisation suivante ne la touche pas.

Ce qu'elle n'est pas, c'est un dessin de plus :

- elle se **lit** comme un stand — même aplat, même teinte de secteur, même
  liseré de survol et de sélection, même libellé, avec le numéro de
  l'emplacement dessous ;
- elle **s'ouvre** au clic sur la fiche complète de sa société, celle-là et pas
  une autre : on ne redemande pas qui l'on vient voir, la forme vient de le
  dire ;
- elle suit le **filtre** de sa société et non celui de l'emplacement — une
  hébergée écartée par un critère s'éteint quand bien même son hôte reste
  allumé, ce qui est précisément la raison de l'avoir dessinée ;
- elle renvoie l'**itinéraire** vers le stand qui la porte. On ne marche pas
  jusqu'à un co-exposant : on marche jusqu'à son hôte, et c'est là qu'on le
  trouve.

Le rattachement se change après coup dans le panneau de la forme choisie. Vidé,
la forme reste sur le plan mais devient muette — plus de libellé, plus de clic —
et le dit ainsi qu'elle attend son exposant. Il en va de même quand la
synchronisation retire la société qu'elle désignait : on ne se rabat pas sur le
titulaire, ce serait donner à une enseigne la place d'une autre.

### Poser le logo d'un exposant sur son stand

L'outil **Image** dépose une image sur le plan — un logo, une affiche, un plan
d'aménagement — et la réduit en data-URI avec le reste du dessin : une page
publiée ne charge aucune ressource externe, et un lien vers un fichier ailleurs
meurt le jour où l'ailleurs change.

Son champ demande un **exposant**, comme celui de l'outil Stand, à une
différence près : il est facultatif. Un stand dessiné n'existe que par la
société qu'il désigne ; une image existe d'abord pour ce qu'elle montre. Nommé,
l'exposant fait de l'image une porte — la toucher ouvre sa fiche, celle de
l'enseigne désignée et non le choix entre les deux quand le stand est partagé,
puisque la liste mêle titulaires et hébergés comme celle de l'outil Stand.
Laissé vide, l'image reste un dessin et laisse passer le clic vers ce qui est
dessous : un plan d'aménagement posé sur un hall n'a pas à empêcher d'ouvrir les
stands qu'il recouvre.

Le nom saisi vaut pour toutes les images posées ensuite, comme la vignette
choisie : on aligne souvent plusieurs logos sur le même stand partagé. Et le
rattachement se change après coup dans le panneau de la forme choisie, au même
champ que celui d'un stand dessiné — les deux formes se rattachent à une société,
elles n'ont pas à le demander de deux façons.

Ce qu'une image liée n'est pas, c'est un stand dessiné : elle ne prend ni la
teinte de son secteur, ni le filtre de la recherche. L'emplacement qu'elle
recouvre porte déjà tout cela. Ce qu'elle ajoute est le geste qu'un visiteur
fait de lui-même — toucher le logo qu'il reconnaît —, et la mesure le compte à
part, sur le canal `image`.

**Le rattachement est une option du plan**, et l'image ne l'est pas. Un salon
qui n'a pas pris « Ajout d'images liées à un stand » garde l'outil et pose ses
images comme n'importe quel dessin ; c'est le champ qui nomme l'exposant qui
s'en va, du dessin comme du panneau d'édition, et plus aucune image ne se relie.
Celles qui l'étaient gardent leur lien : on retire le geste, pas ce qu'il a
produit.

### Passer d'un plan à l'autre

Un salon ne tient pas dans un plan : un hall a deux niveaux, et son premier
étage est un plan à part ; deux halls voisins communiquent par une porte, et
chacun est un plan. Les données ne disent rien de ce qui les relie — c'est
l'exploitant qui le sait, et qui le déclare.

Un repère qui est un **passage** — Entrée/Sortie, Escalier, Escalator,
Ascenseur — porte, dans le panneau de la forme choisie, la liste de ce qu'il
rejoint. On y ajoute ce qu'il dessert : l'escalier à son palier, la porte à
celle d'en face. **Un passage en rejoint autant qu'il en dessert** — l'escalier
du rez-de-chaussée monte au premier et au second, et ce sont deux passages,
chacun avec son temps. Seuls les passages des **autres** plans sont proposés —
en relier deux du même hall ne décrirait rien qu'une allée ne dise déjà. La
liaison s'écrit des deux côtés d'un seul geste, se retire d'une croix, et part
aux visiteurs avec les dessins, dès qu'elle est faite.

Chaque ligne de la liste porte un **temps de passage**, en minutes, qui s'ajoute
au temps de marche du trajet. Il se règle par couple et non par repère, pour la
raison qui précède : le même escalier met deux minutes au premier étage et cinq
au second. Le champ laissé vide n'est pas zéro — c'est le temps ordinaire du
type de passage, celui qu'affiche son invite : une minute pour une porte, un
escalier ou un escalator, deux pour un ascenseur, qui s'attend.

Le calcul enchaîne alors les plans comme il enchaîne les allées : on marche
jusqu'à l'escalier, on le prend, on repart de son palier à l'étage. Le tiroir
déroule les étapes — *60 m dans le pavillon 7.1*, *prenez l'escalier « Escalier
Nord », comptez 2 min*, *20 m dans le pavillon 7.2* — et chaque étape qui se
déroule ailleurs ouvre son plan d'un clic. La distance annoncée n'est plus
minorée : elle est celle du trajet entier, et le temps de chaque passage
s'ajoute à celui de la marche.

Un passage a aussi un prix, en mètres, qui n'est pas une mesure mais un
arbitrage : quinze pour une porte, vingt-cinq pour un escalator, trente pour un
escalier, quarante-cinq pour un ascenseur. C'est ce qu'on accepte de marcher en
plus pour l'éviter — de quoi préférer un couloir à un ascenseur qu'il faut
attendre, sans jamais refuser le seul chemin qui existe. **Le temps déclaré
pèse sur ce prix** : ce qu'il ajoute au temps ordinaire du type se convertit en
mètres au pas de marche, si bien qu'un ascenseur annoncé à cinq minutes coûte
autant qu'un long détour et que le trajet lui préfère l'escalier — ce qui est
exactement ce qu'on veut dire en le déclarant.

En mode accessible, escaliers et escalators sortent du graphe : seuls les
portes et les ascenseurs relient encore. Un étage desservi par ses seuls
escaliers redevient donc hors d'atteinte, et le tiroir le dit — c'est la
réponse juste, et le remède est un ascenseur relié, pas un calcul plus
optimiste.

La liaison se lit dans les deux sens même écrite d'un seul côté : un dessin
repris d'un salon précédent, un côté effacé par mégarde, et le passage existe
toujours dans le hall. Un calque masqué, en revanche, ne relie rien — comme
partout ailleurs, le trajet doit s'expliquer par ce qu'on voit.

### Le mode accessible

Cocher « Itinéraire accessible » change trois choses, sans changer le calcul :

1. **Le passage minimal double** — un mètre quarante au lieu de quatre-vingt-dix
   centimètres, la largeur qu'exige un fauteuil roulant. Une allée plus étroite
   disparaît simplement de la grille, et le trajet passe ailleurs.
2. **Les obstacles s'ajoutent.** Les repères « Escalier » et « Escalator » sont
   noircis sur l'emprise même de leur pastille — ce qu'on voit est ce qui est
   évité, sans rien redessiner. Les pentes, les emmarchements et les estrades
   n'ont pas de pictogramme et n'en auront pas : ils se tracent sur un calque
   dont le rôle est *Infranchissable en fauteuil*. Ce calque reste invisible au
   visiteur — c'est le trajet qui en tient compte, pas le dessin, et le masquer
   n'y change rien — et se reconnaît à son trait pointillé pendant l'édition.
3. **Des passages s'ouvrent**, ce qui est plus rare. Un calque *Où l'on peut
   marcher — PMR uniquement* trace les couloirs qu'on réserve au fauteuil : le
   couloir de l'ascenseur, la rampe qui contourne les marches. Ils n'existent
   que dans cette grille-là, et le trajet ordinaire les longe sans y entrer.

Quand aucun chemin accessible n'existe, le tiroir le dit franchement et propose
de décocher l'option pour voir le trajet ordinaire. C'est le seul cas où la
réponse est « non » : mieux vaut cela qu'un trajet qui fait monter un escalier.

Un calque masqué ne compte pas, ni ses repères ni les liaisons qu'ils portent :
le trajet doit s'expliquer par ce qu'on voit à l'écran. Les calques *de rôle*
font exception, et c'est voulu : *Infranchissable*, *Infranchissable en
fauteuil* et les deux *Où l'on peut marcher* décrivent le terrain, pas
l'affichage. On
les éteint justement parce que le visiteur n'a pas à voir le contour des
sanitaires — le trajet, lui, continue de les contourner.

La fonction se retire comme le parcours de visite, depuis « Réglages du plan »
— « Proposer le calcul d'itinéraire » — et le bouton des fiches suit celui de
la barre.

### La borne interactive

Le plan pose la même question à tout le monde : « d'où partez-vous ? ». Elle est
inévitable sur un téléphone, et absurde sur l'écran vissé à l'entrée du hall,
qui ne bouge pas de la journée. Il suffit de le lui dire une fois, et c'est ce
que fait le **mode borne** : ouvrez le plan avec `?borne` dans l'adresse, et
l'écran devient une borne interactive.

```
https://plan.exemple.fr/plan?plan=smcl-2026&borne
https://plan.exemple.fr/plan?plan=smcl-2026&borne=Entrée%20Nord
https://plan.exemple.fr/plan?plan=smcl-2026&borne=poser
```

Le mode se déclare dans l'adresse et nulle part ailleurs — c'est ce qu'un
navigateur de borne sait faire, ouvrir une adresse et ne plus en sortir, et cela
laisse l'état du mode visible : on en sort en rouvrant la page sans le
paramètre. Ce n'est pas non plus un réglage du salon : ceux-là partent chez tous
les visiteurs, et la position d'un écran n'appartient qu'à cet écran-là.

**Où la borne est posée.** Sans valeur, `?borne` demande la pose la première
fois — un bandeau, puis un appui sur le plan à l'endroit où l'écran se trouve —
et l'appareil la retient pour les fois suivantes. Un appui sur un repère lui en
donne le nom ; partout ailleurs, c'est l'endroit exact du doigt qui compte, et
non le stand dont on frôle la cloison. `?borne=Entrée Nord` fixe la position
dans l'adresse elle-même, ce qu'il faut pour un appareil dont le navigateur vide
son stockage chaque nuit : le nom est celui d'un repère ou le numéro d'un stand,
tel qu'il se lit sur le plan. `?borne=poser` oublie la position retenue et
redemande — c'est le geste de l'exploitant qui déplace l'écran, et il n'a rien à
effacer sur l'appareil.

**Ce que le mode change.** Le départ n'est plus une question : il est là où la
borne est posée, le champ le dit — « Vous êtes ici » — et ne se laisse pas
modifier ; la cible et l'inversion quittent le tiroir plutôt que d'y rester sans
effet. « Itinéraire » depuis une fiche donne le trajet sans rien demander de
plus, et « Organiser ma journée » ne demande plus par où l'on commence. Le plan
porte un « Vous êtes ici » à l'endroit de la borne, de taille constante à
l'écran comme les pastilles du trajet.

**Elle se remet toute seule.** Quatre-vingt-dix secondes sans un geste, et
l'écran redevient ce qu'il était : recherche vide, aucune fiche, parcours
oublié, itinéraire effacé, pavillon de la borne cadré. Une borne n'appartient à
personne, et le visiteur suivant ne doit pas trouver ce que le précédent a
cherché. L'invitation à installer le plan et la visite guidée ne se proposent
pas sur une borne : l'écran est déjà à demeure, et « première visite ? » ne veut
rien dire adressé à un passant. Le générique du démarrage, lui, se rejoue à chaque
remise : c'est le démarrage du visiteur suivant, et l'écran au repos d'une borne
est justement celui qu'on regarde en s'approchant.

**Et la mesure.** Une borne est un appareil, pas un visiteur : elle en voit
passer des centaines dans la journée. Son jeton n'est donc pas retenu — un jeton
neuf à chaque ouverture, un de plus à chaque remise à zéro, et chaque remise
compte une visite — et le paquet annonce au serveur qu'il n'est pas retenu, de
sorte que le rapport sait qu'il recompte peut-être plutôt que de gonfler une
audience en silence. C'est déjà la situation d'un cadre posé sur un site tiers ;
voir *Combien de fois, et combien de qui*.

### « Vous êtes ici » — le code affiché dans le hall

La borne règle le cas de l'écran vissé au mur. Reste le visiteur, avec son
téléphone, sous la même charpente métallique où le GPS ne situe rien : lui non
plus ne sait pas nommer l'allée où il se tient, et la seule chose que le salon
puisse lui dire, c'est *là où tu viens de photographier ce code*.

**Produire un code.** Dans la page d'administration, le bouton **« Vous êtes
ici »** de la bande du haut arme la visée ; un appui sur le plan désigne
l'endroit, et une fenêtre rend le code, le lien en toutes lettres, et une
affiche prête à tirer.

L'endroit se désigne de trois façons, et le code n'est pas le même :

| ce qu'on touche | ce que le code retient |
|---|---|
| un repère | son libellé — `?ici=Entrée%20Nord` |
| un stand | son numéro — `?ici=A15` |
| une zone, ou le fond de plan nu | le point exact du doigt — `?ici=@176f3930,-6750.4,8800.2` |

Un repère est un lieu nommé, et c'est pour cela qu'on l'a posé. Un stand est
petit : son centre est là où l'on se tient quand on est devant, et son numéro se
relit sur l'affiche en cas de doute. Une zone, non — on est *dans* une zone, et
son centre peut être à trente mètres du totem : c'est alors l'endroit du doigt
qui compte, comme sur le fond de plan nu. Le pavillon y est désigné par le début
de son identifiant et non par son rang : une synchronisation qui ajoute un hall
décale les rangs, et l'affiche collée la veille désignerait le pavillon d'à
côté.

Un nom ne part dans le code que s'il en revient : le plan vérifie que ce nom-là
retrouve bien ce point-là, et se rabat sur les coordonnées sinon. Un code
imprimé une fois pour tout le salon n'a pas le droit de se tromper de voisin.

**L'affiche.** Un SVG au format d'une feuille A4 : il s'agrandit sans grossir,
ce qu'on demande à un code qu'on tirera peut-être en A3 sur un totem, et il part
chez l'imprimeur tel quel. Elle porte le nom du salon, « Vous êtes ici »,
l'endroit, le pavillon, le damier et le geste à faire — chaque ligne ramenée à
la largeur de la feuille, parce qu'un nom de salon à rallonge déborderait là où
un sigle flottait. « Imprimer » la tire directement ; le reste de la page ne
part pas avec elle.

**Ce que le visiteur reçoit.** Le plan s'ouvre sur le bon pavillon, un point
« Vous êtes ici » posé à l'endroit du code, et le départ de l'itinéraire déjà
rempli : « Itinéraire » depuis une fiche donne le trajet sans rien demander de
plus, et « Organiser ma journée » ne demande plus par où l'on commence. C'est le
départ imposé de la borne, et rien du reste — un téléphone n'est pas un écran
public : il garde son jeton de mesure, son parcours et son invitation à
installer, et ne se remet pas à zéro toutes les quatre-vingt-dix secondes.

La visite guidée, elle, cède la place : celui qui vient de photographier un code
est debout au milieu d'une allée, et ce qu'il cherche des yeux est le point
qu'on vient de poser — « Première visite ? » passerait devant. C'est la règle
qui vaut déjà pour un lien vers un stand ou un parcours partagé, et comme eux,
elle ne consomme pas sa chance : la visite se proposera à l'ouverture suivante.

**Et cela s'éteint.** Le visiteur avance, et le point cesse d'être vrai au bout
de quelques allées. Un rappel au bas de l'écran porte donc **« Désactiver »** :
le point quitte le plan, le champ de départ redevient une liste déroulante qu'on
remplit, et l'adresse cesse d'affirmer une position — ni le rechargement, ni le
partage, ni la mise à l'écran d'accueil ne ramènent ce qu'on vient d'écarter.
L'arrivée reste, elle : on n'a pas changé de destination en reprenant la main
sur son départ. Il n'y a pas de bouton pour rallumer, et c'est volontaire —
celui qui éteint est ailleurs, et l'affiche d'à côté, elle, est au bon endroit.

Rien de tout cela ne passe par le serveur : la position tient dans l'adresse,
comme le parcours partagé tient dans la sienne. Aucun code à créer, aucun à
faire expirer, aucune table à purger après le salon, et une affiche qui se
scanne hors ligne sur un plan déjà visité. Le revers est qu'un code déjà affiché
ne se corrige pas à distance : si l'endroit change, on en refait un. Un code que
le plan ne reconnaît plus — un stand démonté, un pavillon disparu d'une édition
à l'autre — se dit au visiteur en une phrase, et le plan reste un plan ordinaire
plutôt que d'affirmer une position tirée au sort.

## Organiser sa journée

Une liste de douze stands et de deux conférences ne dit ni par où commencer, ni
si la journée y suffira. Le bouton **« Organiser ma journée »**, au pied du
parcours, pose une question — à quelle heure arrivez-vous — et range le reste :
les conférences retenues sont des rendez-vous qu'on ne déplace pas, les stands
se glissent entre elles, et l'ordre retenu est celui qui fait le moins de
chemin. Le tiroir bascule alors de la liste au déroulé : une heure par arrêt,
la distance et la durée de chaque marche entre eux, et le trajet complet tracé
sur le plan, chaque pastille portant le rang de l'arrêt.

Trois questions au plus, et deux ne se posent que si elles ont lieu d'être : le
jour, quand le salon en compte plusieurs ; le point d'entrée, quand l'exploitant
a posé des repères de type *Entrée/Sortie* — « Peu importe » reste offert, la
journée commence alors au premier stand. Un plan sans aucune porte marquée ne
pose pas la question et le dit, plutôt que de laisser son absence passer pour
un oubli. La liste des départs ne montre que les portes : un
escalier ou des sanitaires ne sont pas des endroits par lesquels on commence sa
journée, et les proposer repoussait les entrées hors de l'écran. Un hall qui a
plusieurs portes du même nom les voit numérotées, faute de mieux — les renommer
« Entrée Nord » reste le vrai remède. L'option « Itinéraire accessible » du
tiroir voisin vaut ici aussi : elle change les allures autant que les chemins.

Le calcul est celui d'un voyageur de commerce avec des rendez-vous. L'ordre
exact demanderait d'essayer toutes les permutations — vingt stands en font deux
milliards de milliards — on construit donc au plus juste, en insérant à chaque
tour le stand qui coûte le moins là où il tient, puis on reprend l'ensemble par
deux mouvements : retourner un morceau de créneau, déplacer un arrêt ailleurs.
Les distances entre arrêts ne viennent pas d'un A\* par paire — vingt arrêts en
font quatre cents — mais d'un balayage en largeur par arrêt, qui donne d'un
coup la longueur d'allée vers tous les autres ; le trait montré, lui, reste
celui du calcul d'itinéraire.

**Ce que « coûter » veut dire compte autant que l'algorithme**, et deux
formulations s'y cassent les dents avant la bonne.

Ne compter que les mètres produit un programme absurde : un créneau qui bute
sur une conférence dure ce qu'il dure, qu'on le remplisse ou non, si bien qu'y
glisser un stand ne coûte pas moins qu'ailleurs — tout s'entasse après la
dernière conférence, laissant deux heures trente-neuf à patienter devant une
salle.

Compter une minute d'attente comme une minute de marche remplit bien les creux,
mais dégénère : dans un créneau qui a du mou, les minutes de marche se
retranchent *exactement* aux minutes d'attente, et la distance s'annule —
l'insertion vaut « moins une visite » quel que soit le détour, tous les
candidats font match nul, et c'est le premier rencontré qui l'emporte. Les
trajets doublaient de longueur sans que rien ne le signale.

Ce sont donc **deux questions séparées, traitées séparément** :

- **Ce qui tombe après le dernier rendez-vous pèse d'abord.** Un créneau borné
  dure ce qu'il dure ; ce qu'on n'y met pas s'ajoute à la fin de la journée. Un
  stand posé dans le créneau ouvert coûte le temps de sa visite, converti en
  mètres au pas de marche. Le forfait n'est pas infranchissable, et c'est
  voulu : traverser deux pavillons pour combler vingt minutes de creux n'a rien
  d'un progrès.
- **La distance départage ensuite**, et elle seule : un créneau borné ne coûte
  que ses mètres, l'attente n'y étant que ce qui reste.

Sur une journée de douze stands et deux conférences, la formulation dégénérée
rendait 1 477 m ; celle-ci en rend 631, pour la même heure de fin.

Quand un creux subsiste malgré tout, le tiroir dit d'où il vient — il n'y avait
plus rien à voir d'ici là, ou l'avancer coûtait plus de marche qu'il ne fait
gagner — plutôt que de le laisser passer pour une étourderie du calcul.

Il faut savoir ce qu'un creux qui reste veut dire, parce qu'il ressemble à un
défaut sans en être un. L'attente totale d'une journée vaut

```
Σ(intervalles entre rendez-vous) − Σ(marche) − temps de visite × (stands casés dedans)
```

— elle ne dépend donc **que du nombre** de stands casés entre les conférences,
pas du créneau où chacun tombe. Déplacer un stand vers un créneau qui bâille y
comble le trou et en creuse un identique ailleurs. Ce qui reste à optimiser,
une fois les créneaux pleins, c'est la marche, et c'est ce que le calcul fait.

Un creux garde pourtant une propriété utile quand il précède le **premier**
rendez-vous : celui-là ne tient qu'à l'heure qu'on a dite en arrivant, et le
visiteur peut s'en débarrasser seul. La ligne le lui dit — « en arrivant à
10h38, vous ne perdriez rien » — ce qui est exact par construction : le créneau
raccourcit d'autant, et son contenu y tient toujours.

Ce que la journée ne peut pas tenir, elle le dit : une conférence commencée
avant l'arrivée, une autre retenue un autre jour, une qui se tient pendant une
autre déjà retenue, une salle rattachée à aucune zone du plan, un rendez-vous
qu'on n'atteindrait qu'en retard. Rien n'est retiré du parcours au passage — le
visiteur décide de ce qu'il sacrifie.

Deux conférences qui se recouvrent ne s'enchaînent pas : on garde celle qui
commence la première et l'autre se range à part, faute de pouvoir assister aux
deux. Les programmer à la suite ferait une journée qui remonte le temps — le
défaut existait, et la suite de l'après-midi se retrouvait planifiée dans le
passé. **L'horloge du visiteur n'avance jamais à reculons** : une conférence
garde les heures du programme, mais si on ne peut y être qu'après le début, la
ligne le dit — « vous y seriez à 12h02 » — et la suite part de l'heure qu'il
est vraiment.

Entre deux plans, la journée hérite de l'itinéraire, franchise comprise : là
où des passages sont déclarés, elle enchaîne les plans et trace tout le trajet ;
là où rien n'est relié, le trajet n'est pas tracé et la distance annoncée
devient « au moins ». Ordonner demande de toute façon un prix, sans quoi
l'algorithme ferait l'aller-retour entre deux halls comme il change d'allée :
un forfait dissuasif — trois cents mètres — suffit à regrouper les visites
pavillon par pavillon. Deux plans qu'un passage joint n'en valent qu'une
soixantaine : un étage se rejoint par son escalier, et l'ordre de visite doit
pouvoir y monter puis redescendre. Ni l'un ni l'autre ne compte jamais dans les
mètres annoncés.

### Le temps de visite par stand

Combien de temps passe-t-on devant un exposant ? Cela ne se devine pas depuis le
plan — un salon grand public tourne vite, un salon d'affaires beaucoup moins —
et c'est pourtant ce qui décide combien de stands tiennent entre deux
conférences. Le réglage vit donc en administration, dans « Réglages du plan »
sous les cases à cocher : **Temps de visite par stand**, en minutes, vingt par
défaut. Comme les autres réglages, il part aux visiteurs tout seul.

Organiser une journée, c'est calculer une vingtaine d'itinéraires : le bouton
disparaît avec « Proposer le calcul d'itinéraire », dont il emprunte tout le
moteur.

### Le rappel avant une conférence

Un visiteur retient trois conférences le matin, puis passe sa journée dans les
allées. À quinze heures moins le quart il est à l'autre bout du hall, le
téléphone dans la poche, et la conférence qu'il avait notée commence sans lui.
Le parcours savait l'heure ; personne ne la lui a rappelée.

Le réglage vit dans l'onglet **Admin**, au pied des cases qui disent ce que les
visiteurs voient : **Rappeler les conférences retenues**, et sous elle
**Prévenir avant le début** — en minutes, un quart d'heure par défaut. Il y est
avec l'invitation à installer le plan et la visite guidée, parce que c'est la
même sorte de décision, et parce que c'est l'exploitant qui en répond : ce qui
est rappelé quitte l'appareil, et tout le monde ne le recevra pas. Le tiroir du
parcours montre alors, en tête des conférences, un interrupteur « Me prévenir
15 min avant ». Il faut que le visiteur le touche, puis qu'il accorde au
navigateur l'autorisation demandée : sans les deux gestes, rien ne part et rien
n'est enregistré.

**La question, dès la première conférence retenue.** Un interrupteur au fond
d'un tiroir n'appelle personne, et celui à qui le rappel sert vient justement de
retenir une conférence sans se douter que le plan sait la lui rappeler. Une
fenêtre le lui demande donc à ce moment-là — **« Pour ne pas la manquer »** —, et
répondre oui vaut l'interrupteur : le navigateur demande son autorisation, et le
rappel est posé. Elle ne se montre qu'une fois par salon, quelle que soit la
réponse : refusée, elle ne revient pas, et le tiroir reste la porte pour changer
d'avis. Elle se tait quand elle n'a rien à proposer — sur un iPhone non installé,
quand les notifications ont déjà été autorisées ou bloquées, pendant la visite
guidée, et quand les conférences retenues commencent avant le délai réglé. Une
fiche ouverte n'est pas balayée pour autant : la fenêtre attend qu'on la referme.

Une autorisation **déjà accordée** ne la ferme pas, en revanche, et il a fallu
s'y reprendre : la fenêtre demande, elle n'autorise pas, et un accord déjà donné
ne change que ceci — le navigateur ne redemandera rien après le oui. L'écarter
revenait à priver du rappel tout visiteur ayant accepté les notifications sur ce
domaine, un autre salon ou une autre année, puisque le navigateur range cette
permission par origine et non par salon. Seul un refus ferme la question.

**L'interrupteur ne disparaît plus.** Il s'effaçait quand rien n'était
rappelable — toutes les conférences retenues passées, ou commençant avant le
délai réglé —, et la fenêtre se taisait avec lui. C'était confondre la
préférence et la promesse : « prévenez-moi avant mes conférences » vaut pour
celles qu'on ajoutera ensuite, et se pose une fois pour toutes. Le visiteur
restait devant un tiroir muet, sans rien à toucher ni rien à lire ; l'exploitant
d'un salon terminé cherchait en vain la commande qu'il venait d'activer.
L'interrupteur est donc toujours offert, et une seconde ligne dit ce qui ne
partira pas encore : « Vos conférences retenues sont passées. Le rappel vaudra
pour les prochaines que vous ajouterez. » Elle se tait dès qu'il y a de quoi
rappeler.

Enfin, l'écran d'administration n'a pas de visiteur : la fenêtre ne s'y montre
jamais. Deux liens dans l'aide de la case y répondent. **Aperçu** ouvre la
fenêtre telle qu'elle paraîtra — sans rien allumer, sans consommer la question,
et en ramenant aux réglages quand on la referme ; c'est le même geste que les
aperçus de l'invitation à installer. **Essayer un vrai rappel** va plus loin :
il pose sur cet appareil un rappel pour dans une demi-minute, par le chemin
exact des autres, et la notification reçue dit d'un coup si les clés VAPID, la
tâche de la minute et le service de second plan répondent. Sans lui, la
plomberie ne se vérifiait qu'avec une conférence à venir — c'est-à-dire jamais,
pour qui règle un salon dont le programme est passé ou pas encore synchronisé.

Deux choses en découlent, et le bouton les dit plutôt que d'échouer en silence.
L'essai a besoin du service de second plan, que seule la page publique
installe : sur un navigateur qui n'a jamais ouvert le plan, il demande de le
faire une fois. Et il **remplace** les rappels de cet appareil pour ce salon —
c'est le contrat de l'API —, si bien qu'il renvoie avec lui ceux du parcours
en cours, pour ne rien perdre de l'exploitant qui suit aussi son propre salon.

**Ce que cela déplace.** Le tiroir promet, en toutes lettres, que le parcours ne
quitte pas l'appareil. Le rappel est la seule exception, et la phrase le dit
maintenant. Ce qui part est l'abonnement que le navigateur vient de tirer — une
adresse opaque, qui ne désigne personne hors de ce service —, l'heure d'envoi et
le texte tout prêt de la notification. Les stands retenus ne partent pas ; les
conférences non rappelées non plus. Tout s'efface deux jours après la
conférence, et d'un coup dès que le service de poussée signale un appareil
disparu.

La notification est composée par la page, dans la langue que le visiteur lisait.
Le serveur la chiffre et la poste sans la relire — le service de poussée du
navigateur, lui, ne peut pas la lire du tout.

**Pourquoi un serveur pour une minuterie.** Parce qu'une page n'a aucun moyen de
se réveiller elle-même : ses minuteries meurent avec l'onglet, gelé en quelques
secondes dès qu'il passe en arrière-plan sur un téléphone ; le service de second
plan est arrêté après quelques secondes d'inactivité ; et l'API qui aurait comblé
ce manque — *Notification Triggers* — n'a jamais quitté l'essai d'origine de
Chrome. Un rappel « local » ne serait parti qu'avec le plan ouvert sous les yeux,
c'est-à-dire au moment précis où il ne sert à rien. Le Web Push est le seul
mécanisme qui réveille une page fermée, et le service de poussée relaie sans
attendre : `pg_cron` tient l'heure, à la minute, et appelle la fonction
`rappels`.

**Ce qui ne marchera pas, et qu'il vaut mieux savoir avant de le promettre sur
une plaquette.** Sur iPhone, le Web Push n'existe que pour un plan ajouté à
l'écran d'accueil : dans un onglet Safari, dans Chrome iOS, dans le navigateur
intégré de LinkedIn ou d'Instagram, il n'y a pas de `PushManager` du tout —
l'interrupteur ne se montre pas, et une ligne dit ce qu'il faudrait faire. C'est
le cas qui mange le plus de visiteurs, pour un plan dont l'adresse circule par
QR et par publication. Sur Android tout marche depuis un simple onglet, mais les
notifications de Chrome lui-même peuvent être coupées au niveau du système, et
les gestionnaires de batterie de certains constructeurs retardent le réveil.
Partout, un mode de concentration retient le rappel : le web ne dispose pas du
niveau d'interruption qu'une application native réclame pour le percer. Les
horaires restent donc lisibles dans le tiroir, pour tous — le rappel est un
bonus, pas la façon de connaître son programme.

Enfin le message porte une durée de vie égale au délai du rappel. Passé ce
point, le service de poussée le jette au lieu de le remettre : un téléphone
rallumé en fin de journée n'annonce pas une conférence terminée depuis des
heures.

## La visite guidée

Le programme d'une salle, le chemin jusqu'à elle, le parcours qu'on se compose,
la journée qu'on en tire : tout cela attend derrière des icônes que personne
n'essaie une à une. À la première ouverture d'un salon, le plan propose donc
d'en faire le tour — « Découvrir le plan » —, et le visiteur y fait **lui-même**
chaque geste, sur le vrai plan. Une bulle posée à côté dit quoi toucher, un
repère lumineux encadre ce qu'il faut toucher, tout le reste s'estompe, et la
visite attend que ce soit fait pour passer à la suite. Rien n'est simulé : la conférence retenue en chemin est dans le
parcours, la journée organisée aussi.

Quatre chapitres, dans cet ordre :

1. **Le programme des zones** — le plan s'amène sur une zone organisateur qui a
   un programme, en surbrillance ; le visiteur la touche, puis retient une
   conférence par son signet.
2. **L'itinéraire** — depuis la fiche de cette zone, « Itinéraire » : l'arrivée
   est remplie, le visiteur désigne son départ sur le plan, et lit le trajet.
3. **Mon parcours de visite** — le signet de la barre du haut est présenté là où
   il est ; le visiteur touche un stand de son choix, le retient, ouvre « Mon
   parcours », et découvre « Partager », qui donne la liste à un autre téléphone
   par un code ou un lien.
4. **Ma journée** — « Organiser ma journée », une heure d'arrivée, et l'ordre de
   visite apparaît. Sur un parcours encore vide, la fonction se présente quand
   même, et dit qu'il lui faut d'abord un stand retenu.

Chaque chapitre ne paraît que si sa fonction existe sur ce salon : sans
conférence rattachée à une zone, la visite commence à l'itinéraire ; sans
parcours, elle s'arrête avant ; sans itinéraire, la journée disparaît avec lui.
La consigne se relit dans l'état de la page plutôt que dans une liste d'étapes
franchies : le visiteur qui referme une fiche, trouve son stand par la liste ou
touche une autre zone voit la consigne le suivre. « Suivant », en haut de la
bulle, saute au chapitre suivant ; la croix ou Échap quittent la visite.

Le voile qui estompe le reste ne prend aucun clic : on garde la main sur la page
entière. Autour d'une zone désignée, le plan recule comme sous le cartouche des
points d'intérêt ; quand c'est le plan qu'on touche — un stand, un point de
départ —, il reste clair et seuls la barre et la liste s'effacent.

La visite ne choisit ni le stand ni la conférence à la place du visiteur : un
exposant imposé verrait ses chiffres gonfler dans le rapport d'utilisation. Seule
la zone est montrée du doigt, et une zone organisateur ne se compte pas.

Elle se propose **une fois par salon et par appareil**, quelle que soit la
réponse, sous la clé `plan-tutoriel:<slug>` du stockage local ; un navigateur qui
refuse ce stockage ne se la voit pas proposer, faute de pouvoir retenir la
réponse. Elle attend aussi son tour : un visiteur arrivé par le lien d'un stand
ou avec un parcours partagé ne se la voit pas proposer cette fois-là, mais à sa
prochaine ouverture. La page d'administration ne la propose jamais.

L'exploitant la règle dans « Réglages du plan », onglet **Plan** : **Proposer la
visite guidée au premier démarrage**, cochée par défaut. L'aide de la case dit
quels chapitres ce salon présentera, et **Essayer** la lance aussitôt, pour voir
ce que les visiteurs verront. Comme les autres réglages, la case part aux
visiteurs toute seule.

## Le générique du démarrage

Un salon se vend aussi par son plan : l'organisateur qui propose à un partenaire
« le plan interactif du salon » lui promet l'écran que tous les visiteurs
traversent. Il n'y avait, jusqu'ici, aucune place où le poser. Les seules
disponibles étaient dans le plan lui-même — là où l'on cherche un exposant, et
où une marque gêne la lecture.

Le démarrage, lui, est une place vraie, et elle ne coûte rien à personne. La
page s'ouvre, les données arrivent, le plan se dessine : cet intervalle est perdu
de toute façon, et le visiteur le passait devant un rectangle vide. **Un logo
l'occupe, puis s'efface de lui-même.** Rien n'est à fermer, rien n'attend un
geste : un écran qui réclame un clic pour disparaître est une réclame, celui-ci
est un générique.

**Il ne retarde pas.** Ses secondes se comptent depuis l'ouverture de la page, et
non depuis l'instant où le logo paraît : le temps de chargement est compris
dedans, jamais ajouté après. Un plan qui met plus longtemps à venir que le
générique ne devait durer n'en reçoit pas du tout — il n'y aurait plus d'attente
à remplir, seulement de l'attente à ajouter.

**Il ne bloque pas.** Un doigt posé dessus l'efface sur-le-champ, la touche
d'échappement aussi, et une panne de chargement de même : le message qui dit ce
qui ne va pas passe avant le logo qui le couvrirait. Il couvre le plan, et le
plan seul — la barre du haut, la liste et sa ligne « Chargement du plan… »
restent lisibles dessous, et le visiteur voit que quelque chose se fait.

**Il paraît au premier trait de la page**, et non à l'arrivée des données : posé
avec elles, il serait arrivé avec ce qu'il devait couvrir. Or à cet instant la
page ne sait rien du salon qu'elle ouvre. Ce qu'il montre est donc relu sur
l'appareil, sous la clé `plan-sponsor:<slug>` du stockage local, laissé là par la
visite précédente. Une première ouverture sur un appareil neuf le montre à
l'arrivée des données, si elles sont venues à temps, et pose le cache pour les
suivantes.

**Trois façons de commencer**, dans « Réglages du plan », onglet **Admin**, au
bas de ce que voient les visiteurs. Réservé au profil administrateur, comme les
cases qui l'entourent : ce n'est pas un réglage de salon mais un réglage de
prestataire — la place du démarrage est celle qu'on vend, ou celle où l'on dit
d'où vient le plan, et l'organisateur qui l'ouvrirait n'y trouverait que de quoi
retirer la marque de qui le lui fournit.

- **Aucun logo** — le plan s'ouvre droit sur le hall. C'est le réglage d'origine :
  un salon déjà en ligne ne se met pas à montrer un écran de plus sans que
  personne l'ait demandé.
- **Le logo Event2Map**, avec la mention « powered by ». Rien à déposer, rien à
  régler : la marque vient de la construction, elle est nette à toute taille, et
  elle porte son propre carré de nuit — donc lisible sur n'importe quel fond de
  plan. C'est
  le seul endroit où elle paraisse devant un visiteur ; ailleurs elle se tient
  dans ce qui appartient à l'outil — la bande d'administration, la console,
  l'écran d'accès — pour ne pas déguiser le salon en Event2Map. Ici elle ne le
  déguise pas non plus : elle passe, elle le dit, et elle cède la place au hall.
- **Le logo d'un sponsor** — celui d'un partenaire du salon, avec son nom, une
  mention choisie dans une liste (« Partenaire officiel », « Avec le soutien
  de »… ; une liste et non un champ libre, parce que le plan se lit aussi en
  anglais) et un lien facultatif, ouvert dans un nouvel onglet quand le visiteur
  touche le logo. Le logo est réduit puis enregistré avec la configuration, comme
  celui d'une zone : il part avec le plan, sans dépendre d'un fichier hébergé
  ailleurs. Il se pose sur le fond du plan — le gris clair d'origine, ou la
  couleur réglée dans « Apparence » : un logo dessiné en blanc sur fond
  transparent y disparaîtrait.

La durée, de deux à dix secondes, vaut pour l'un comme pour l'autre : c'est le
même générique.

L'administration ne le joue jamais : l'exploitant y recharge son plan vingt fois
par heure. **Aperçu**, au pied du volet, le montre à la demande. Et parce que
chaque visite comptée dans le rapport d'utilisation le voit, le nombre de visites
dit au sponsor combien de fois son logo a paru.

Un changement de mode met une visite à parvenir : l'appareil montre d'abord ce
que sa visite précédente y a laissé, et pose le bon pour la suivante. C'est le
prix du cache, et il vaut mieux que l'inverse — un logo échangé en cours de
générique se verrait plus que la marque.

## Installer le plan, et le consulter hors ligne

Un salon se visite là où le réseau manque : un hall de béton, un forfait
épuisé, dix mille visiteurs sur la même borne. Or tout arrivait du serveur à
chaque ouverture — la page, ses polices, le plan lui-même — et une barre à zéro
ne laissait qu'un écran vide portant « Plan indisponible ».

Le plan public est donc une application installable, et il se garde sur
l'appareil.

**S'installer.** Chrome propose « Installer » dans sa barre d'adresse, Android
« Ajouter à l'écran d'accueil », iOS la même chose depuis le menu de partage.
Le plan s'ouvre ensuite sans barre de navigateur, avec son icône et sa couleur.
Rien à faire pour l'exploitant : la page se déclare installable d'elle-même. Il
peut en plus faire proposer l'installation au visiteur, par une fenêtre — voir
plus bas, « Inviter à l'installer ».

**Le plan public, et lui seul.** La console, le rapport, l'administration du
plan et la page de mot de passe sont des outils de travail : on les ouvre dans
un navigateur, à côté d'autre chose, et une icône de plus sur le bureau n'y
ajouterait rien — ces écrans ne tiennent de toute façon pas sans leur session
ni sans la base. Le visiteur du salon, lui, est exactement celui qui veut
l'icône et le plan sans réseau. Seule `web/plan.html` porte donc le manifeste
et inscrit le service ; les autres pages n'en gardent que l'icône d'onglet et
la couleur de barre, qui n'ont rien à voir avec l'installation. La construction
le dit à chaque passage : une seule ligne porte la mention `application`.

Une nuance à connaître : un service de second plan, une fois inscrit, vaut pour
tout le domaine — un fichier servi à la racine ne peut pas se limiter à une
page. Un exploitant qui ouvre la console après avoir consulté un plan passera
donc par lui. Il n'y trouvera que le réseau d'abord, et jamais rien de ce qui
porte une identité.

**Chaque salon est sa propre application.** C'est le point qui a demandé du
soin. Une même page sert tous les salons — `?plan=` tranche — quand le
manifeste, lui, est fabriqué une fois pour toutes : il ne peut donc désigner de
page de départ sans les trahir tous sauf un, et le plan installé depuis un
salon rouvrait celui d'un autre. La spécification prévoit bien qu'un
`start_url` absent vaille « la page depuis laquelle on installe », ce qui
aurait tout réglé, mais Chromium refuse alors d'installer : il vérifie la
validité d'une adresse qu'il n'a pas encore remplacée.

Le manifeste versionné porte donc l'adresse nue — le salon par défaut — et la
page demande le sien : `manifeste.webmanifest?salon=…&depart=/plan?plan=…`. Le
Worker reprend alors ce même fichier et n'y change que le nom et l'adresse de
départ, qu'il vérifie : `start_url` désigne ce que le système ouvrira plus
tard, seul, sans la page, et seul un chemin de ce site y entre. Un manifeste à
tenir, aucun à fabriquer par salon — et, sans JavaScript, le fichier nu reste
installable.

Un détail qui se paie cher si on l'ignore : Cloudflare sert un fichier de
`web/` **avant** d'exécuter le Worker. Le manifeste serait donc parti tel quel,
sans que rien ne le signale — d'où le `run_worker_first` de `wrangler.jsonc`,
qui fait passer le script devant pour ce seul chemin.

**Le nom du salon sur l'écran d'accueil.** L'application s'appelle « Plan SMCL
by Event2Plan », et non du nom du produit : c'est le salon qu'on cherche du
regard parmi ses icônes. Le manifeste ne peut pourtant pas le porter tel qu'il
est fabriqué — il est lu avant que la page ait appelé l'API, donc avant qu'elle
sache quoi que ce soit du salon. La page nomme donc le slug, `salon=…`, qu'elle
connaît dès son en-tête, et le Worker va chercher le nom : une lecture à part
(`plan-public?slug=…&nom=1`), qui ne rend que quatre colonnes là où le plan
entier pèse ses stands et ses zones, et qu'il garde un jour comme le plan. Le
nom n'est donc jamais reçu de l'adresse, seulement cherché : un lien fabriqué
ne peut pas faire poser sur un écran d'accueil une application au nom qu'il
aurait choisi. Sous l'icône, où la place est d'une douzaine de signes, le salon
seul.

Une exception, iOS : il ne lit pas le manifeste pour l'écran d'accueil mais la
balise `apple-mobile-web-app-title`, écrite avec la page. `nommeApplication`
(`_installation.html`) la corrige dès les données arrivées — elle n'est relue
qu'au moment de l'ajout. L'onglet et son icône, eux, prennent le nom du salon
au même instant.

Un salon renommé dans la console porte son nouveau nom à la visite d'après :
l'enregistrement fait oublier au relais le plan **et** le nom.

**Son icône et son nom, salon par salon.** Les deux se règlent dans l'onglet
« Admin » des réglages du plan, réservé au profil administrateur, sous « Sur
l'écran d'accueil ».

L'icône se choisit entre deux : celle du produit, la même pour tous les salons,
ou le logo du salon, déposé là. Rien de déposé, c'est celle du produit — il n'y
a pas de mode à régler à côté de l'image, qui aurait pu la contredire. Le nom,
lui, est un champ : vide, c'est « Plan SMCL by Event2Plan » ; écrit, c'est ce
qui paraît sous l'icône, tel quel.

Un seul fichier à choisir, deux images fabriquées. Android ne pose pas une
icône telle quelle : il la rogne à la forme du système, cercle ou goutte selon
l'appareil, et une image qui ne se déclare pas rognable finit en timbre-poste
dans un carré blanc. L'administration fabrique donc, du même fichier, le logo
au bord de son carré et le même logo rentré dans la zone sûre — le cercle des
quatre cinquièmes — sur un fond opaque tiré du logo : son propre fond s'il en a
un, le blanc sinon, la nuit du produit pour un logo clair qui sur du blanc
disparaîtrait. L'aperçu montre les deux formes côte à côte, parce que personne
ne devine ce qu'un rognage laisse.

Ces images ne partent pas avec le plan : elles ne sont lues qu'à
l'installation, et les faire voyager jusqu'à chaque visiteur aurait coûté un
demi-mégaoctet pour rien. Le manifeste les désigne par une adresse que le
Worker sert de la base — `/api/icone?salon=…&v=…` —, où `v` est l'empreinte que
la base calcule de l'image. C'est elle qui fait qu'une icône remplacée se voit
sur un écran d'accueil déjà installé : le navigateur relit le manifeste, y
trouve une adresse inconnue, et va chercher l'image. Et comme l'adresse ne peut
plus mentir sur son contenu, tout ce qui la garde peut la garder pour toujours.

iOS, là encore, se corrige à part : `nommeApplication` y repose le nom et
l'icône du salon dès les données arrivées. C'est la version opaque qui lui est
donnée — il remplit de noir la transparence d'une icône d'écran d'accueil, où
un logo sombre disparaissait. La fenêtre qui invite à installer montre la même,
pour la même raison.

**Tenir sans réseau.** `web/sw.js`, inscrit depuis le plan public, s'installe
au premier passage et se place entre la page et le réseau. Il ne précharge rien : ce qui a servi une fois est
gardé, et cela suffit — on installe un plan de salon après l'avoir ouvert,
jamais avant. Précharger aurait retéléchargé le mégaoctet de la page au moment
même où le visiteur venait de le recevoir.

| Ce qui passe | Comment |
|---|---|
| une page | le réseau d'abord : elle porte tout son code, et l'exécuter depuis la copie d'hier sur les données d'aujourd'hui n'a pas de sens |
| `/api/plan` | le réseau d'abord, la copie gardée en secours |
| le fond d'un pavillon | la copie d'abord : son adresse porte sa version, il ne peut pas être périmé |
| les polices | la copie d'abord : leurs adresses portent leur empreinte |
| le reste de `web/` | la copie d'abord, renouvelée derrière |
| un appel porteur d'une identité | rien n'est lu ni gardé : il peut rendre un brouillon, et le poste peut être partagé |
| les mesures d'usage | elles ne font que passer |

Résultat : un salon déjà ouvert une fois se rouvre entier sans réseau, fond de
plan compris. Un salon jamais ouvert le dit en français plutôt qu'en
`Failed to fetch`, et une page jamais visitée tombe sur `hors-ligne.html`.

**Se renouveler.** Le cache est nommé d'une empreinte de ce que la construction
a produit : elle change quand les pages changent, et pas autrement. Une mise en
ligne met donc au rebut tout ce qui précède, et le service prend la main sans
attendre la fermeture des onglets. Un horodatage aurait jeté le cache du
visiteur à chaque mise en ligne, y compris celles qui ne le concernaient pas —
et fait bouger `web/` à chaque construction, sous le nez de `npm run verifie`.

**L'icône** n'est pas une image déposée : elle est dessinée par
`outils/icones.js`, qui en tire les quatre tailles attendues — la vectorielle
de l'onglet, deux PNG pour le manifeste, une cinquième rognable qu'Android
masque à sa façon, une dernière pour iOS. Un seul dessin à corriger, et rien à
rouvrir dans un éditeur d'images le jour où l'on change une couleur.

Tout cela s'essaie en local : `npm run essai` sert les pages **et** complète le
manifeste comme le fait le Worker. Sans ce même geste, l'essai montrerait une
application installable qui rouvre toujours le même salon — le seul défaut
qu'on cherche justement à voir.

### Inviter à l'installer

S'installer suppose de savoir que c'est possible. Chrome range l'installation
dans son menu, Safari au bas de sa feuille de partage — et le visiteur qui en
aurait le plus besoin, celui qui a photographié un code à l'entrée et
découvrira au fond du hall que la barre est tombée à zéro, est justement celui
qui n'ira pas l'y chercher.

Une fenêtre peut donc le lui proposer. Elle se règle dans l'onglet « Admin » des
réglages — « Inviter les visiteurs à installer le plan » — et part aux
visiteurs avec la publication, comme tout réglage. La case porte ses aperçus :
l'organisateur règle son salon depuis un ordinateur, où la fenêtre ne paraîtra
jamais. Elle est **décochée par défaut** : une fenêtre qui interrompt ne
s'ajoute pas d'elle-même à un salon déjà en ligne.

Elle interrompt, et ce sont ses conditions qui en font une proposition plutôt
qu'une réclame. Toutes doivent tenir :

- **le plan public, et lui seul** — la page qui porte le manifeste ;
- **ouvert dans un navigateur** — lancé depuis l'écran d'accueil, le plan est
  déjà installé, et dans le cadre d'un site tiers ce n'est pas à nous de
  proposer quoi que ce soit. La porte se lit comme pour la mesure ;
- **sur un téléphone ou une tablette** — sur un ordinateur, l'application
  n'apporte qu'une fenêtre sans barre d'adresse ;
- **dès l'ouverture, jamais par-dessus ce qu'on fait** — le plan affiché, la
  fenêtre suit un instant après. Si autre chose occupe l'écran — la fiche d'un
  stand ouverte par un lien, un parcours partagé, un doigt posé, une saisie,
  un stand visé pour un itinéraire —, elle attend que ce soit fini : c'est la
  raison de la venue, et elle passe avant. Un onglet ouvert en arrière-plan
  attend qu'on y vienne ;
- **là où l'installation aboutit** — voir le tableau ;
- **rarement** — une fois par jour au plus, et plus jamais après deux refus,
  une installation, ou « J'ai compris ».

| navigateur | ce que propose la fenêtre |
|---|---|
| Chrome, Edge, Samsung Internet sur Android | un bouton « Installer », qui ouvre la fenêtre du navigateur — une fois seulement que celui-ci a jugé le plan installable, ce qu'il ne fait pas quand il l'est déjà. Il le fait d'ordinaire dès le chargement, mais peut attendre un premier geste et un peu d'usage : la fenêtre attend alors avec lui |
| Safari et les autres navigateurs d'iOS et d'iPadOS | les trois gestes : « Partager », « Sur l'écran d'accueil », « Ajouter » |
| Firefox et les autres navigateurs d'Android | les deux gestes de leur menu |
| la vue web d'une application — un lien ouvert depuis un réseau social | rien : l'installation y est impossible |

**Une fois installé**, une seconde fenêtre dit où le retrouver : sur l'écran
d'accueil, sous le nom « Plan » — que rien ne relie au nom du salon qu'on vient
de lire. Elle ne l'ouvre pas à la place du visiteur : ni lien ni interface ne
passent de l'onglet à l'application, et ce que le système sait faire malgré
tout est l'objet de la section suivante. Seul Chromium annonce l'installation
(`appinstalled`), qu'elle soit partie de la fenêtre ou du menu du navigateur ;
la confirmation attend que la fenêtre d'installation du système se soit
retirée, une minute au plus. Sur iOS la page n'en sait rien, et les trois
gestes décrits disaient déjà où regarder. La case des réglages en porte un
troisième aperçu, « une fois installé ».

Fermer sans répondre — la croix, le voile, « Échap » — vaut « Plus tard ». Les
réponses restent sur l'appareil, rangées sous le nom du salon : chaque salon est
sa propre application, et en avoir refusé une ne dit rien de l'autre. Rien ne
remonte au serveur. Ce que la fenêtre produit se lit pourtant déjà dans le
rapport d'utilisation : les lancements depuis l'écran d'accueil ont leur porte.

Un détail de Chromium a demandé du soin. L'événement par lequel il annonce le
plan installable peut arriver **avant les données**, donc avant qu'on sache ce
que veut le salon. Il faut pourtant décider sur-le-champ de le retenir, et le retenir retire le
bandeau que Chrome aurait posé en bas de l'écran. L'appareil garde donc ce que
le salon voulait à la visite précédente : réglage éteint, le bandeau du
navigateur reste tel quel ; sans visite précédente, l'événement est retenu, et
le bandeau attend au pire une visite de plus.

### Rappeler l'application à qui reste dans le navigateur

Installer n'est pas utiliser. Le visiteur qui a l'application revient souvent
par le navigateur sans y penser : un lien suivi depuis un message, un code relu
à l'entrée, un onglet resté ouvert de la veille. Le plan s'ouvre alors dans un
onglet parmi d'autres, barres comprises, et tombera avec le réseau — tout ce
que l'installation devait éviter.

Une fenêtre le lui dit **dix secondes après que le plan est à l'écran**, et lui
propose d'y passer — d'un bouton là où c'est possible. Elle suit la même case
que l'invitation, les mêmes garde-fous — jamais par-dessus une fiche ouverte, un doigt posé, une
saisie — et la même discipline : une fois par jour au plus, plus rien après
deux refus. Elle a ses compteurs à elle : avoir écarté l'une ne tait pas
l'autre, et une installation les remet à zéro.

Deux conditions de plus la rendent sincère.

**Savoir qu'elle est installée.** Le plan retient l'installation qu'il a vue
passer, mais une mémoire ne se corrige pas d'elle-même : l'application retirée
le lendemain, il inviterait à ouvrir une icône qui n'est plus là.
`getInstalledRelatedApps()` répond pour de bon — c'est à cela que sert le
`related_applications` où l'application se nomme elle-même dans son manifeste,
sous l'adresse exacte d'où elle a été posée, que le Worker écrit avec le reste.
Son démenti n'est cru qu'après un aveu : cette adresse n'est pas toujours celle
que la page demande, et une liste vide dirait sinon « retirée » d'une
application bien présente.

**Savoir l'ouvrir.** Une adresse ordinaire n'y suffit pas : elle reste dans
l'onglet, un navigateur ne se dessaisissant jamais d'un site qu'il sait
afficher. Sur Android, le raccourci qu'y pose Chromium est un vrai paquet, que
le système enregistre parmi ceux qui ouvrent les adresses du site : une adresse
`intent://` s'adresse à lui par-dessus le navigateur, et l'application s'ouvre.
Sans nom de paquet — Chromium le fabrique sous un nom haché — et sans adresse
de repli : sans preneur, l'intention retombe et il ne se passe rien, ce qui
vaut mieux qu'un plan rechargé sous les yeux du visiteur. Le silence se lit une
seconde et demie plus tard, à la page toujours là, et une dernière fenêtre dit
alors où est l'icône — puis le bouton n'est plus proposé sur cet appareil.

**Sur iOS, la même fenêtre parle autrement**, parce qu'elle sait moins. Rien
n'y dit qu'une application est posée — pas d'`appinstalled`, pas de
`getInstalledRelatedApps()`, et le stockage de l'application est séparé de
celui du navigateur —, et rien ne l'y ouvre. Elle ne peut donc ni affirmer ni
proposer : elle s'adresse à celui qui a lu les trois gestes d'ajout et dit les
avoir compris — le seul dont on sache qu'il a eu affaire à l'installation — et
se borne à lui suggérer l'icône, au conditionnel.

| | Android | iOS |
|---|---|---|
| titre | « L'application est installée » | « Le plan en application » |
| ce qu'elle sait | l'application est posée sur l'appareil | que les gestes d'ajout ont été lus et compris |
| boutons | « Rester ici » · « Ouvrir l'application » | « Plus tard » · « Compris » |
| après | l'application s'ouvre, ou la fenêtre dit où est l'icône | la suggestion est close, et ne revient pas |

La case des réglages porte les aperçus des deux : l'organisateur règle son
salon depuis un ordinateur, où aucune ne paraîtra.

## Le rapport d'utilisation

Le plan était une boîte noire : on savait combien d'exposants il portait, jamais
s'il servait. La page `rapport` répond à la question que pose l'organisateur —
combien sont venus, ce qu'ils ont cherché, quelles fiches ils ont ouvertes, et
**par quel chemin**. On y arrive depuis la console, par
« Rapport d'utilisation » au menu **Actions** de la fiche d'un événement, ou
directement :
`…/rapport?plan=<slug>`. La connexion est celle de la console, la même session.

Ce qu'elle montre, pour la période choisie — sept, trente, quatre-vingt-dix
jours, ou depuis le début :

- **Visites** et **visiteurs uniques**. Une visite est une ouverture du plan :
  revenir le lendemain en fait une seconde, naviguer deux heures d'affilée n'en
  fait qu'une. Un visiteur est un navigateur, compté une fois sur la période.
- **Recherches** : les mots-clés menés à leur terme, doublons écartés — retirer
  une lettre puis la remettre reste la même recherche.
- **Itinéraires calculés** et **programmes de visite** composés.
- **Fiches exposants ouvertes**, en tout puis par canal : par la recherche, par
  un clic sur le plan, par un clic sur un logo posé dessus, par le nom cité dans
  une conférence, par la liste du pavillon, par le programme de visite, ou par un
  lien direct.
- **Fiches conférences ouvertes**, de même : depuis le programme d'une salle,
  depuis la fiche de l'exposant qui la tient, ou depuis le programme de visite.
- Les **visites jour par jour**, dans le fuseau du salon.
- Le détail **par moyen d'accès** : une carte par porte — navigateur, cadre posé
  sur un site, écran d'accueil, application — avec ses visites, ses visiteurs et
  ses fiches ouvertes.

Le détail par canal est ce qui se lit le plus vite : aucun clic sur un logo dit
qu'aucun logo n'a été posé ; une recherche qui domine dit que le plan sert de
répertoire plus que de plan.

### Par quelle porte on arrive

Le même plan se rejoint par quatre portes, et chaque paquet de mesures dit
laquelle. Sans cela les quatre se confondaient dans un chiffre unique, et ce
chiffre ne voulait rien dire : « mille deux cents visites » ne répond pas à la
question que pose un organisateur qui vient de payer une application ou de coller
un cadre sur son site — est-ce que **cette** porte sert ?

| porte | ce que c'est | comment elle se reconnaît |
|---|---|---|
| `web` | le plan ouvert dans un onglet | ce qui reste quand aucune autre ne répond |
| `integre` | encadré dans la page d'un site ou d'une application tierce | le document n'est pas au sommet de sa fenêtre |
| `pwa` | installé sur l'appareil, lancé hors du navigateur | `display-mode: standalone`, ou `navigator.standalone`, la forme d'iOS |
| `appli` | servi par une coque déposée sur une boutique | la coque le déclare |

Une coque d'application ne se **voit** pas : une vue web plein écran qui charge
la page hébergée est en tout point un navigateur. C'est donc à l'hôte de
l'annoncer, en ajoutant `support=appli` à l'adresse qu'il ouvre :

```
https://…/plan?plan=smcl-2026&support=appli
```

C'est une déclaration, pas une preuve ; le vocabulaire clos borne ce qu'elle peut
raconter — une valeur inventée compte sous « non précisé » plutôt que d'ouvrir
une colonne au premier venu. Les coques qui embarquent la page au lieu de charger
l'adresse hébergée se reconnaissent en plus à leur protocole (`capacitor://`,
`ionic://`, `tauri://`).

Deux mises en garde, que le rapport affiche sous les cartes parce qu'elles sont
des propriétés du comptage et non des approximations :

- **Les visites ne se comparent pas d'une porte à l'autre.** Une visite est une
  session d'onglet, et ce qu'une session d'onglet dure ne dépend pas de nous :
  rouvrir une application en ouvre une neuve à chaque fois, un cadre en ouvre une
  par page du site qui le porte, un onglet laissé deux heures n'en ouvre qu'une.
  Chaque porte se lit dans son ordre de grandeur, jamais contre les autres.
- **La somme des visiteurs dépasse le total, et c'est juste.** Un navigateur, une
  application et un cadre posé sur un site tiers ne partagent aucun jeton — le
  stockage d'un cadre tiers est cloisonné par le navigateur. Le même visiteur
  compte une fois par porte, et une seule au total, qui se compte en jetons
  distincts et non en lignes.

Une troisième tient au stockage. Un cadre posé sur un site tiers se voit souvent
**refuser** le stockage, quand il n'est pas seulement cloisonné : le jeton ne se
retient plus, et chaque ouverture ajoutait un « visiteur unique » sans que rien
ne le signale. La page dit désormais si son jeton a pu être retenu,
`visiteur_jour` le garde, et le rapport affiche « dont N au stockage refusé,
recomptés à chaque ouverture ». Le chiffre vient à côté du total, jamais en
déduction : ces visiteurs ont bien ouvert le plan, on sait seulement qu'ils y
sont peut-être comptés plusieurs fois. Le rapport signale ce qu'il ne peut pas
corriger — le corriger demanderait de reconnaître un visiteur sans son
consentement, ce que ce système ne fait pas.

Ce qui **n'apprend pas** la porte, et c'est délibéré : `compteur_cible`, donc la
carte de chaleur et le classeur des exposants. L'audience d'un stand est son
audience, quelle que soit la porte prise pour l'atteindre ; y ajouter une
quatrième dimension multiplierait par quatre la seule table dont le volume ait
jamais inquiété, pour répondre à une question que personne ne pose.

Enfin, la fonction `mesure` accepte **toutes les origines**, seule de tout le
projet, et il n'y a donc aucune liste à tenir pour qu'une porte compte. CORS n'a
jamais rien gardé ici — un `curl` l'ignore entièrement — et ce qui protège
l'écriture est ailleurs : la clé de service reste au serveur, le vocabulaire est
clos, la cible doit exister dans l'événement, l'événement doit être publié, le
paquet est borné. Ce que la liste faisait, en revanche, c'était jeter en silence
les mesures de tout visiteur qui n'était pas arrivé par un domaine inscrit : un
cadre en bac à sable poste depuis `null`, une coque qui embarque la page poste
depuis le protocole de son cadre de travail. Le navigateur coupait, `fetch` se
taisait, et la porte dont on voulait mesurer l'usage était la seule à ne rien
compter — l'oubli ne se voyant qu'au rapport, des semaines plus tard, sous la
forme d'un salon qui paraît désert. Rien ne sort de cette fonction : la réponse
est vide, aucun appel ne porte d'identité. `plan-public`, `comptes` et
`sync-evenement` gardent leur liste, elles : elles rendent des données.

### Des compteurs, et non un journal

Rien ne garde le détail des gestes. Un geste **incrémente un compteur**, et c'est
tout ce qu'il en reste.

La raison tient au volume. Une ligne par geste — ce qui se faisait au début —
suit la fréquentation : cinq mille visiteurs sur quatre jours écrivent un
demi-million de lignes, cent trente mégaoctets index compris, que rien n'efface
jamais. Un compteur, lui, grossit avec le produit de ses dimensions, non avec le
trafic : le nombre de stands est un plafond fixe, que cinq cents ou cinquante
mille personnes viennent. Le même salon tient en quelques milliers de lignes, et
n'en écrit pas une de plus si la fréquentation double.

Trois tables, parce que les trois questions n'ont pas la même forme.

| | |
|---|---|
| `compteur` | la fréquentation, à l'heure, par porte, sans objet |
| `compteur_cible` | l'audience d'un stand ou d'une conférence, au jour — en gestes |
| `visiteur_cible` | qui a touché quoi, une fois — en personnes |
| `visiteur_jour` | un jeton vu tel jour, par porte — le seul décompte qui ne soit pas une somme |

Croiser l'objet et l'heure reconstruirait le problème qu'on fuit : 931 stands ×
9 canaux × 48 heures font quatre cent mille lignes possibles. D'où deux
granularités, et non une.

`visiteur_jour` existe parce que « combien de visiteurs » est un cardinal, pas
une somme : il faut avoir vu les jetons. Mais il ne faut pas avoir gardé les
gestes — une ligne par (visiteur, jour) au lieu de vingt-sept par visiteur, et le
décompte reste exact.

Ce qu'on y perd : croiser deux genres sur un même visiteur, « ceux qui calculent
un itinéraire ouvrent-ils plus de fiches ». Aucun chiffre du rapport ne posait
cette question. Ce qu'on y gagne : savoir **quel** stand a été consulté, ce que
le journal ne disait pas — il ne retenait que le genre du geste, jamais son objet.

### Combien de fois, et combien de qui

Un exposant à qui l'on annonce « 240 » comprend « 240 personnes sont venues me
voir ». Ce que le produit lui donnait, c'étaient 240 **ouvertures de fiche** :
le même visiteur qui rouvre cinq fois pesait cinq. L'écart n'est pas un détail
de vocabulaire — il change le chiffre d'un facteur qu'on ne connaît même pas, et
ce chiffre part par courriel à l'exposant.

Chaque nombre par stand existe donc maintenant en deux exemplaires : le geste et
la personne. `compteur_cible` compte les gestes, `visiteur_cible` retient les
personnes — une ligne par (stand, geste, canal, jour, visiteur), où **une paire
déjà vue n'ajoute rien**. Rouvrir la même fiche cinquante fois y pèse une ligne.

| dans le classeur | ce que ça compte |
|---|---|
| Fiches ouvertes | les ouvertures |
| Visiteurs uniques | les personnes distinctes qui en ont ouvert au moins une |
| Ouvertures · clic sur le plan | les ouvertures venues de ce canal |
| Visiteurs · clic sur le plan | les personnes distinctes venues par ce canal |
| Itinéraires calculés / Visiteurs ayant demandé la route | idem, pour la route |
| Ajouts au programme / Visiteurs l'ayant mis à leur programme | idem, pour le parcours |
| Ajouts depuis une suggestion / Visiteurs venus d'une suggestion | idem, pour la suggestion |

Les deux ensemble se lisent enfin : un stand ouvert 240 fois par 8 personnes et
un stand ouvert 240 fois par 200 ne racontent pas la même chose, et aucun des
deux nombres seul ne les distingue.

Trois choses à savoir avant d'en tirer une conclusion.

**Les colonnes de visiteurs ne s'additionnent pas.** La somme des visiteurs par
canal dépasse le total de visiteurs de la fiche : celui qui a ouvert la fiche
depuis le plan puis depuis la recherche compte dans les deux, et une fois au
total. Un cardinal n'est pas une somme — même propriété que les portes d'accès,
pour la même raison. « Total interactions » n'a d'ailleurs pas de jumelle en
personnes : additionner trois cardinaux qui se recouvrent ne donnerait aucun
nombre réel.

**« Visiteur unique » désigne un jeton de navigateur**, donc une partition de
stockage. Le même humain qui ouvre le plan dans son navigateur puis dans
l'application installée compte deux fois ; celui dont le navigateur refuse le
stockage — cas ordinaire d'un cadre posé sur un site tiers — compte une fois par
ouverture. Le rapport le signale au niveau du salon. Faire mieux demanderait
d'identifier les gens, ce que ce système ne fait pas.

**Le comptage commence le jour de sa mise en service.** Un salon mesuré avant
n'a aucune présence enregistrée : les colonnes de visiteurs sont alors **retirées
du classeur** plutôt que remplies de zéros, qui se liraient « personne n'est
venu » là où il faut lire « on ne comptait pas encore les personnes ». Un
classeur voyage seul, souvent jusqu'à l'exposant : il ne peut pas porter de note
de bas de page.

Ce que ce chiffre corrige au passage, sans qu'on ait eu à réparer quoi que ce
soit — trois défauts de comptage s'effacent d'eux-mêmes dès qu'on compte des
personnes et non des gestes : la pastille « N exposants ici » d'un stand
partagé, qui gonflait le total du stand de gestes faits à l'intérieur de sa
fiche ; l'itinéraire, qui ne se dédoublonne que sur le dernier trajet demandé,
si bien qu'une bascule PMR ou une inversion recomptait un trajet vers le même
stand ; et le stand ajouté au parcours, retiré, puis rajouté, qui pesait deux
ajouts pour son exposant. Dans les trois cas : même visiteur, même stand, une
seule présence.

#### Ce que cette table coûte

Elle renverse une décision prise en même temps que les compteurs, et il faut le
dire franchement. `compteur_cible` portait en tête : « compter les visiteurs
uniques demanderait de retenir les paires (stand, visiteur), soit exactement le
volume qu'on vient de supprimer. » Cette phrase se trompait d'ordre de grandeur
— le demi-million de lignes qu'elle fuyait était un journal d'un geste par
ligne, vingt-sept par visiteur et par jour, alors qu'une paire répétée n'ajoute
rien. Pour 931 stands et 20 000 visiteurs, on compte 180 000 à 400 000 lignes,
environ 65 Mo index compris : un huitième du journal supprimé.

Ce qu'elle disait de vrai, en revanche : la propriété qui justifiait les
compteurs — **ne pas grossir avec le trafic** — est perdue, et perdue
entièrement. Cette table est linéaire en fréquentation. D'où une purge :
`purge_presences()` retire les présences de plus de **400 jours** (et jamais
moins de 31, contre l'erreur de manipulation), et avec elles les jetons de
`visiteur_jour` du même âge — ce qui tient aussi la mesure dans son exemption de
consentement (voir « Sans bandeau de consentement »). Elle tourne chaque nuit à
01 h 43 UTC par `pg_cron`, une demi-heure avant la sauvegarde, et à chaque
synchronisation Klipso en secours. Quatre cents jours et non trois cent
soixante-cinq : un salon annuel se compare à l'édition précédente, et la
comparaison se fait souvent quelques semaines après.

Les compteurs, eux, ne se purgent jamais : ils sont bornés par construction, et
c'est l'historique long d'un salon. Un salon purgé garde donc ses consultations
et perd ses visiteurs uniques passés — c'est l'ordre des regrets qu'on a choisi.

### Ce qui est enregistré, et ce qui ne l'est pas

Un compteur porte l'événement, le geste, le canal, l'objet désigné, une heure et
la porte par laquelle le plan a été atteint. `visiteur_jour` porte un jeton, une
date, la même porte, et si le stockage a accepté de retenir ce jeton.
`visiteur_cible` porte un jeton en face d'un stand, une fois. **Rien
d'autre** — ni adresse IP, ni agent utilisateur, ni identité, ni cookie. La porte
n'y change rien : c'est la façon dont la page est affichée, pas une propriété de
qui la regarde, et elle ne prend que quatre valeurs. Le jeton de visiteur est tiré au
hasard par le navigateur et rangé chez lui sous une clé propre à l'événement
(`plan-visiteur:<slug>`) : il ne suit personne d'un salon à l'autre, encore moins
d'un site à l'autre. Les chiffres par stand sont des agrégats où aucun jeton ne
figure.

La page ne mesure rien dans deux cas : la version à données figées
(`plan-smcl.html`), qui n'appelle aucune API, et la page d'administration, où
l'on mesurerait l'exploitant en train de préparer son salon. Un événement en
brouillon n'est pas mesuré non plus : la fonction refuse ce qui n'est pas publié.

Les gestes partent **par paquets** — vingt, ou trente secondes d'inactivité, ou
le départ de la page via `sendBeacon`, qui survit à la fermeture de l'onglet.
Trente secondes et non quatre : à quatre, chaque fiche ouverte partait dans son
propre paquet, et la mesure devenait le premier poste d'appels du système, devant
le plan lui-même. Une panne réseau se tait : la mesure ne doit jamais gêner la
visite.

L'écriture passe par la fonction `mesure`, jamais par les tables : une table
ouverte en écriture au public serait un formulaire de spam — et cette fois le
spam resterait, puisque plus rien ne se purge. Elle appelle
`enregistre_mesures()`, qui résout l'événement, filtre le vocabulaire et
incrémente les trois compteurs en une seule transaction. Le vocabulaire est clos
— un genre inconnu est écarté, pas enregistré sous un nom approximatif — et une
cible que l'événement ne porte pas l'est aussi : la table `cible`, écrite par la
synchronisation, dit ce qui existe et donne les libellés que le rapport affiche.
Un canal inconnu, en revanche, n'emporte pas son geste : la fiche a bien été
ouverte, seule sa provenance est illisible, et elle compte sous « autre ».

La lecture passe par `rapport_utilisation()`, qui agrège tout en un appel, et
par `audience_cibles()` pour le détail par stand.

### Sans bandeau de consentement

La page publique ne demande aucun consentement, et ce n'est pas parce qu'elle ne
pose pas de cookie. La règle — article 82 de la loi Informatique et Libertés,
qui transpose la directive ePrivacy — vise tout ce qu'une page écrit ou lit sur
l'appareil du visiteur : le jeton rangé dans `localStorage` est un traceur au
même titre qu'un cookie. Ce qui dispense de demander, c'est l'**exemption que la
CNIL accorde à la mesure d'audience**, et elle tient à des conditions que le
système remplit une à une.

| Condition | Où elle est tenue |
|---|---|
| des statistiques anonymes, pour le seul organisateur | ni adresse IP ni agent utilisateur, envoyés ou enregistrés ; les exposants ne reçoivent que des totaux |
| aucun suivi d'un site ou d'un salon à l'autre | un jeton tiré au hasard, rangé sous `plan-visiteur:<slug>` |
| treize mois de vie au plus pour le traceur, sans que les visites les prolongent | l'échéance est écrite à côté du jeton, et un autre est tiré à son terme (`MESURE_VIE_MOIS`, `_mesure.html`) |
| vingt-cinq mois au plus pour ce qu'il a permis de recueillir | `purge_presences()` efface les jetons de `visiteur_cible` et `visiteur_jour` à 400 jours, chaque nuit |
| l'information du visiteur, et le moyen de refuser | la notice « Confidentialité », au pied de la liste, et sa case « Ne pas mesurer mes visites » |

Le refus est gardé sur l'appareil (`plan-mesure-refusee`) et vaut pour tous les
salons du domaine : il jette les gestes en attente et efface les jetons. Revenir
dessus tire un jeton neuf, que rien ne relie à l'ancien. La notice nomme
l'organisateur du salon comme celui qui répond de la mesure, et le prestataire
comme agissant pour lui.

Ce qui ferait tomber l'exemption, et exigerait alors un vrai consentement :
croiser ces chiffres avec un autre fichier, remettre à un tiers autre chose que
des totaux, reconnaître un visiteur d'un salon à l'autre, ou garder un jeton
au-delà des durées ci-dessus. La notice annonce ces durées en toutes lettres :
changer l'une sans l'autre la ferait mentir.

Les **polices** relèvent du même souci par un autre chemin. Demandées à Google,
elles lui transmettaient l'adresse IP de chaque visiteur à chaque ouverture,
avant toute réponse possible — le tribunal régional de Munich l'a jugé contraire
au RGPD le 20 janvier 2022. Elles sont désormais servies depuis `web/polices/`
(voir « Fabriquer les pages »), et la construction échoue si une page en
redemande une à Google.

### Remettre les compteurs à zéro

La recette d'un plan se fait sur le plan : on ouvre des fiches, on cherche une
enseigne, on calcule un itinéraire — et sur la page publique, la seule qui
mesure. Ces gestes sont ceux de l'exploitant, et ils comptent comme ceux d'un
visiteur : rien ne les en distingue à l'écriture, puisque la page publique ne
regarde aucune session. C'est ce qui lui permet de ne poser ni cookie ni
identité, et c'est pourquoi le premier chiffre d'un salon est toujours faux.

Personne ne peut deviner quand la recette s'arrête : la veille de l'ouverture,
rien ne dit au système que les visites qui suivent sont les vraies. C'est donc
un geste, depuis **l'engrenage du plan d'administration**, volet
« Statistiques ».

Il est protégé, parce qu'il n'y a rien derrière : la fenêtre dit ce qui part et
ce qui reste, affiche les chiffres en cours — un nombre sur ce qu'on s'apprête
à perdre, et la preuve au passage que la base répond — et n'ouvre le bouton
qu'une fois le mot **réinitialiser** écrit en toutes lettres. Un bouton rouge se
clique par réflexe ; une phrase se tape en connaissance de cause. Le mot se
compare sans ses accents ni sa casse : on demande une intention, pas une
disposition de clavier.

`reinitialise_compteurs()` efface en une transaction — un échec à mi-chemin
laisserait un salon dont les visiteurs uniques ne correspondraient plus à ses
visites, pire qu'un salon faux. Elle vide `compteur`, `compteur_cible`,
`visiteur_cible` et `visiteur_jour` pour ce salon. `cible` reste : ce n'est pas
de la mesure mais le vocabulaire écrit par la synchronisation, et la vider
priverait le rapport de ses libellés jusqu'à la synchronisation suivante. Elle
vidait aussi l'ancien journal `mesure`, supprimé depuis avec tout ce qu'il
gardait (`20260913223216_la_conservation_des_jetons_de_visiteur.sql`).

Comme partout ici, la fonction est en « security invoker » : elle n'ajoute
aucun pouvoir, ce sont les politiques d'effacement — bornées par
`acces_salon()` — qui tranchent. Un compte sans accès au salon est refusé
explicitement plutôt que de se voir répondre « zéro ligne effacée », qui se
lirait comme une réussite.

### La carte de chaleur

Le rapport dit combien de fiches ont été ouvertes ; il ne dit pas lesquelles.
C'est l'autre moitié de la question, et la seule qui se reporte sur le plan de
l'année suivante : quel emplacement a retenu, quelle travée personne n'a
regardée. `compteur_cible` le sait — une ligne par (stand, jour, canal) — mais
neuf cents lignes de tableau ne se lisent pas. Sur le plan, si.

C'est **un calque de la page d'administration du plan** : il s'allume dans la
pile des calques, sous « Stands » — c'est cette couche qu'il repeint, comme les
couleurs de secteur juste au-dessus. Seul de toute la pile, il n'a pas de
sélecteur de couleur : les siennes ne se choisissent pas, elles sortent des
chiffres et se refont à chaque changement de période.

Il ne part **jamais** sur le plan public, et deux choses l'en empêchent plutôt
qu'une. Il n'existe pas dans `CONF` — l'enregistrement de la configuration n'a
donc rien à emporter, ni réglage ni rang dans la pile. Et il refuse de
s'allumer hors administration : la page publique appelle bien le même code à
chaque montage, elle n'y trouve simplement rien à peindre. Une pastille
« non publié » le dit dans la pile, parce que rien d'autre ne le dirait.

Les emplacements se colorent du
bleu — pas ou peu de consultations — au rouge, et le cartouche donne la période
(sept, trente, quatre-vingt-dix jours, ou depuis le début), l'échelle et les dix
premiers, cliquables pour aller les voir sur le plan. Le survol d'un stand donne
son chiffre exact. Rien ne s'enregistre : c'est une lecture, pas un réglage, et
l'enregistrement de la configuration ne l'emporte pas.

Deux commandes, et elles ne font pas la même chose. Le chevron du cartouche le
**replie sur sa légende** — le plan reste peint, on gagne le coin de l'écran, et
l'échelle demeure parce qu'une carte thermique sans elle n'est plus qu'un
coloriage. C'est la case de la pile qui **éteint la lecture** et rend au plan
ses couleurs ordinaires. Le repli est retenu d'une lecture à l'autre, et la
pile s'arrête où le cartouche commence : ils partagent le même bord.

Trois choses qu'il faut savoir avant d'en tirer une conclusion :

- La **couleur suit les consultations**, pas les visiteurs uniques : un stand
  rouge est un stand dont la fiche s'est beaucoup ouverte, ce qui n'est pas la
  même chose qu'un stand que beaucoup de gens ont ouvert. Les deux nombres sont
  désormais côte à côte — le cartouche donne le total en personnes, le palmarès
  ajoute « N vis. » à chaque ligne — mais c'est le premier qui peint, parce que
  c'est lui qui a une échelle : voir « Combien de fois, et combien de qui ».
- Les **zones organisateur ne sont pas comptées** : la page ne les mesure pas
  davantage, une zone n'est pas un exposant. Elles gardent leur teinte.
- L'échelle est **logarithmique**. Rapportée au maximum, elle n'aurait rien
  montré : la fiche la plus ouverte l'est dix à cent fois plus que la médiane, et
  tout le reste du plan serait resté du même bleu. Le cartouche porte donc des
  nombres à ses bornes et en son milieu, jamais des pourcentages.

La rampe est celle d'une caméra thermique — bleu, cyan, vert, jaune, orange,
rouge. C'est le langage que tout le monde a déjà vu : personne n'a besoin qu'on
lui dise que le rouge est chaud, et la carte se lit sans passer par sa légende.

Elle se paie en deux endroits, et les deux sont traités. La clarté n'y avance
pas d'un bout à l'autre — le jaune du milieu est plus vif que le rouge du bout —
donc le rang ne se lit pas dans la couleur seule : d'où les nombres au
cartouche, et le chiffre exact au survol d'un stand. Et comme aucune encre ne
tient sur toute la rampe — noire, elle se perd sur le bleu ; blanche, sur le
jaune — les libellés reçoivent un liseré clair le temps de la lecture, mesuré
en `em` pour qu'il suive la taille du texte quand on dézoome. La couleur de
libellé que l'exploitant a pu régler est écartée pendant ce temps : elle avait
été accordée à ses stands, pas à une caméra thermique.

Contrairement au reste du plan, la rampe ne suit aucun réglage de couleur : une
image thermique ne se décline pas à la charte du salon.

## La version anglaise

Un salon parisien reçoit des visiteurs qui ne lisent pas le français, et des
exposants aussi. Toutes les pages — le plan public, son administration, la
console, le rapport, la page de mot de passe, la page hors ligne — existent
donc en anglais, et un drapeau en haut de chacune passe de l'une à l'autre
sans recharger. Il montre toujours la langue vers laquelle il mène — le
drapeau britannique sur une page en français, le français sur une page en
anglais : c'est ce que cherche des yeux quelqu'un qui ne lit pas la page.
Deux lettres, « EN », ne se comprenaient pas d'un coup d'œil. Le drapeau est
dessiné et non tiré des emojis, que Windows n'affiche pas.

**Quelle langue à l'ouverture.** L'adresse d'abord : `?lang=en` est ce qu'on
imprime sur une affiche ou ce qu'on envoie à un exposant étranger, et vaut sur
n'importe quel appareil — la racine le transmet au plan vers lequel elle
redirige. Puis le choix déjà fait sur l'appareil, retenu dès qu'on a cliqué le
drapeau. À la première visite enfin, la langue du navigateur : le français pour
qui le lit, l'anglais pour les autres, car un visiteur allemand ou japonais lit
plus souvent l'anglais que le français.

**Pourquoi le code reste en français.** Les pages écrivent leurs textes de
mille façons — `textContent`, un gabarit passé à `innerHTML`, un `title` posé à
la volée — et plusieurs sessions les retouchent en même temps. Envelopper chaque
chaîne dans un appel aurait réécrit des milliers de lignes, et chaque phrase
nouvelle aurait dû se souvenir de l'appel. La version anglaise se pose donc
par-dessus la page : `outils/gabarit/_langue.js`, injecté en tête de chaque page
par `genere.js`, observe ce que la page écrit et remplace chaque phrase par sa
traduction. En français, rien n'est observé ; la langue d'origine ne coûte
rien. La page mesure parfois ce qu'elle vient d'écrire — la largeur d'un
cartouche, d'une pastille — : toute mesure commence alors par traduire ce que
l'observateur n'a pas encore vu, pour que la page mesure l'anglais qu'elle
affichera.

Trois cas passent malgré tout par un appel explicite, `traduit("…")` : ce qui
quitte la page (l'export tableur, le texte de la feuille de partage du
téléphone), ce que le code compare à l'écran (le texte d'un bouton relu), et
ce qu'il cherche ou mesure lui-même (le nom d'un repère).

**Le dictionnaire.** `outils/anglais/` tient un fichier par module du gabarit,
qui associe chaque phrase française à sa version anglaise — un anglais
britannique, celui des salons européens. Une phrase est une clé entière : une
enseigne ne tombe jamais par hasard sur « Calculer un itinéraire ». Ce que la
page compose se traduit par un modèle :

```js
"{n} exposants retenus": "{n} exhibitors match",
"Retirer le critère {critere} {valeur}": "Remove filter {critere} {valeur}",
```

`{n}` accepte un nombre et le réécrit à l'anglaise (`1 234,5` → `1,234.5`) ;
toute autre accolade accepte un texte, traduit à son tour s'il est lui-même une
clé, gardé tel quel sinon — un nom de salle, un exposant. Zéro prend le pluriel
en anglais : « 0 fiche ouverte » devient « 0 records opened » sans clé de plus.
Les dates et les heures n'ont pas de clé : une chaîne faite seulement de jours,
de mois, d'heures et de nombres se réécrit mot à mot (« lundi 14 septembre ·
10h30 » → « Monday 14 September · 10:30 »). Et ce qui est mis bout à bout sans
être une clé — des phrases à la suite, des morceaux séparés par `·`, `—` ou une
virgule — se traduit morceau par morceau.

Chaque page n'emporte que la part du dictionnaire qui la concerne :
`outils/traductions.js` retient les entrées dont la page porte le module, ou
dont les morceaux se lisent dans son code. `serveur.js` et `donnees.js`, qui
traduisent ce que la synchronisation écrit, partent avec toute page qui
interroge le serveur.

**Ajouter une phrase.** Une phrase nouvelle affichée par le code s'ajoute avec
sa traduction, dans le fichier du module. `npm run verifie` relève toutes les
chaînes visibles du gabarit et refuse celles qui n'en ont pas, avec le fichier
et la ligne ; le workflow `Pages` refait le même contrôle. Une chaîne que le
relevé croit visible à tort — un nom de classe, un mot tenu par le code — se
déclare dans `outils/anglais/invisibles.js`. Le relevé lit les sources, pas
l'écran : pour voir ce qui reste en français sur une page réelle, ouvrez-la
avec `?lang=en&manques`, parcourez-la, puis `LANGUE.manques()` dans la console
du navigateur rend les textes restés en français, du plus fréquent au plus rare.

**Les zones, dans les deux langues.** Le libellé et la description d'une zone
organisateur sont écrits par l'exploitant : aucun dictionnaire ne les connaît.
Leur fiche, dans les réglages du plan, les demande donc deux fois — en
français et en anglais — et montre les quatre champs quelle que soit la langue
de l'écran : on écrit l'anglais depuis la version française, et le français
depuis l'anglaise. La version anglaise se range dans `zones_fiches`
(`nom_en`, `description_en`) avec le reste de la fiche, et part au visiteur
par l'API. Laissée vide, c'est la française qui s'affiche. Le nom se choisit à
la source là où la zone est nommée pour elle-même — sur le plan, dans la
liste, en titre de sa fiche — et passe par le moteur partout ailleurs, cité
dans un itinéraire par exemple ; les deux descriptions sont posées dans la
fiche, et la langue de la page dit laquelle se voit.

**Les listes de valeurs, en anglais depuis les sources.** Secteurs,
nomenclature, parcours de visite, offres de reprise : leurs valeurs viennent de
Klipso ou d'Eventmaker, et les deux en tiennent l'anglais. La synchronisation
le relève et l'écrit dans `evenement.libelles_en`, en une table valeur
française → valeur anglaise, toutes listes confondues ; `plan-public` la sert
sous `anglais`, et la page la confie au moteur (`LANGUE.donnees`), qui
traduit ces valeurs partout où elles paraissent — fiche, critères de recherche,
console. La recherche les connaît dans les deux langues.

- **Klipso** rend chaque libellé de codification dans toutes les langues que le
  salon a saisies (`label: { fr, en }`) : l'anglais vient du même appel que le
  français (`Gaia.codificationLangues`).
- **Eventmaker** ne pose pas la traduction sur le champ mais dans les
  traductions de l'événement (`/events/:id/translations.json`), sous une clé
  faite de l'identifiant du champ et de la valeur réduite — minuscules, chaque
  suite de signes ni lettre ASCII ni chiffre remplacée par
  `SPECIAL_HASH_KEY_CHARACTER` (`Eventmaker.listesEnAnglais`). Vérifié sur
  Franchise Expo Paris 2027 : 23 secteurs sur 23, 118 sous-secteurs sur 119,
  le parcours de visite en entier. Deux appels par synchronisation, pour toutes
  les listes de l'événement.

Une valeur que la source ne traduit pas reste en français. Un relevé incomplet
— Eventmaker injoignable — ne remplace pas le précédent. L'intitulé des champs
propres au salon, lui, est écrit par l'exploitant : il se donne en français et
en anglais depuis la console, en renommant le champ (`fiche.perso[].libelle_en`).

**Ce qui ne se traduit pas.** Ce que l'exploitant ou le visiteur tape — un
éditeur, un champ de saisie — et tout élément marqué `translate="no"`. Et les
données : les noms d'exposants, la nomenclature et les secteurs de Klipso, les
titres et descriptions des conférences d'Eventmaker, les libellés que
l'exploitant a saisis. Ils arrivent en français de leur source, et s'affichent
tels quels. Les noms d'exposants sont de plus protégés : `_js.html` les confie
au moteur (`LANGUE.protege`), qui n'y touche jamais — ni seuls, ni cités dans
une phrase — même quand une enseigne tombe sur un mot du dictionnaire ou du
calendrier. Le manifeste de l'application installée reste lui aussi en
français — et le nom qu'il porte est celui du salon, qui ne se traduit pas
davantage.

## Les options du plan

Cinq fonctions du plan ne reviennent pas à tous les salons : elles se vendent à
part, et se règlent salon par salon dans « Réglages du plan », onglet **Admin**,
sous l'intertitre *Les options du plan*. Comme le générique du démarrage qui
ferme le même onglet, elles sont réservées au profil administrateur : ce n'est
pas un réglage de salon mais un réglage de prestataire, et l'organisateur n'y
trouverait que de quoi fermer ce qu'on lui a vendu.

| option | ce que fermer retire |
|---|---|
| **Dessin des stands** | l'outil qui matérialise un exposant, ou l'une de ses hébergées, sur sa part d'un emplacement |
| **Ajout d'images liées à un stand** | le champ qui lie une image du dessin à un exposant. L'outil image reste : ce qui se vend est le lien, pas l'image |
| **Organiser ma journée** | le bouton du tiroir du parcours qui met la visite en heures |
| **Programme de conférences** | tout ce qui vient du programme : celui d'une zone, les conférences d'un exposant, la recherche par titre, les horaires du parcours, les rappels |
| **Recommandations sponsorisées** | la proposition d'un exposant de plus, et l'onglet « Suggestion » avec elle |

**Ouvertes par défaut.** Un réglage absent ne retire rien : les salons déjà en
ligne gardent ce qu'ils ont, et l'option ne se remarque que le jour où on la
ferme. C'est la règle des commandes du plan, qui vivent quelques lignes plus
haut dans le même onglet.

**Fermer retire la porte, pas ce qui est derrière.** Les stands déjà dessinés
restent sur le plan, les images déjà liées gardent leur lien, les conférences
restent dans l'instantané que la synchronisation continue de rapporter, ce qui
était réglé pour la suggestion reste écrit : rouvrir l'option retrouve le tout. Une seule chose ne se rend pas,
et la case le dit — le parcours d'un visiteur ne garde que ce que le plan connaît
encore, si bien que celui qui rouvre le plan pendant que le programme est fermé y
perd les conférences qu'il avait retenues.

Deux façons de fermer, selon ce qu'il y a à retirer. Les trois premières se
ferment par la feuille de style, sur une classe posée sur la racine : un
élément part de l'écran — le bouton de l'outil Stand (`sans-dessin-stand`), le
champ d'exposant de l'outil Image (`sans-image-stand`), le bouton de la journée
(`sans-journee`). Le code refuse ensuite ce que la feuille de style a caché,
plutôt que de s'y fier : une valeur restée dans un champ invisible ne relie
rien. Le programme, lui, n'est pas une commande qu'on masque mais un index
qu'on refait — `indexeConferences()` de `_js.html` le relit à chaque bascule, et
la recherche, les fiches, le tiroir du parcours, la journée et les rappels
suivent d'eux-mêmes, n'ayant plus rien à lire.

Le réglage vit sous la clé `_options` de la configuration du salon, et se publie
avec le reste : c'est l'enregistrement de la configuration qui le porte aux
visiteurs.

## Comptes et profils

Il n'y a pas d'inscription libre : un compte est créé par quelqu'un qui en a
déjà un, et reçoit son mot de passe par courriel. Deux profils, et un seul
mécanisme derrière.

| profil | ce qu'il voit | ce qu'il peut faire |
|---|---|---|
| **Administrateur** | tous les salons, présents et à venir | tout, y compris créer des salons et gérer les comptes |
| **Organisateur** | les salons qu'on lui a affectés | tout, sur ces salons-là |

L'organisateur n'est pas un demi-administrateur. Sur un salon qui lui revient,
il a exactement les mêmes droits : synchroniser, régler l'apparence, dessiner,
publier, lire le rapport d'utilisation, supprimer. Ce qui change n'est pas la
nature du droit, c'est son étendue. Il ne peut pas créer de salon — il en
reçoit — ni voir ceux des autres, qui ne lui apparaissent nulle part.

Cette limite n'est pas une affaire d'interface. C'est la base qui l'applique,
par ses politiques de sécurité, et deux fonctions y suffisent :
`est_admin()` et `acces_salon(<salon>)`. Toute politique d'écriture appelle
l'une ou l'autre, de sorte que la règle n'est écrite qu'une fois. Un
organisateur qui forgerait une requête à la main obtiendrait la même réponse
que la console lui donne : rien.

### Créer un compte

Dans la console, **Comptes** — le bouton n'apparaît que pour un
administrateur. On y saisit une adresse, un nom, un profil, et l'on coche les
salons. L'invité reçoit un courriel, choisit son mot de passe sur la page
`/motdepasse`, et se retrouve connecté.

Tant qu'il n'a pas ouvert son invitation, son compte porte la mention
« Invitation en attente ». **Renvoyer l'invitation** relance le courriel ; le
compte n'est jamais recréé, ce qui lui ferait perdre ses salons.

Le même bouton sert plus tard à **envoyer un lien de mot de passe** à qui l'a
oublié. L'intéressé peut aussi se débrouiller seul : « Mot de passe oublié »,
sur l'écran de connexion de la console comme sur celui du plan, mène à la même
page.

Un administrateur ne peut ni se retirer son propre rôle, ni supprimer son
propre compte : ce serait fermer la porte de l'intérieur, sans personne
au-dehors pour rouvrir.

Le rôle ne se demande pas. Un compte qui naît porte les nom et prénom qu'on a
donnés à l'invitation, mais toujours le profil d'organisateur — c'est la
fonction `comptes`, avec la clé de service, qui écrit ensuite le rôle voulu.
Le déclencheur lisait autrefois ce rôle dans les métadonnées du compte, qui
viennent de celui qui le crée : une inscription faite à la porte pouvait s'y
déclarer administrateur, et le cloisonnement tombait d'un bloc.

### Le premier compte

Un projet neuf n'a personne pour affecter qui que ce soit. Le tout premier
compte créé est donc administrateur, quelle que soit la porte empruntée —
l'invitation depuis la console, ou **Authentication → Users → Add user** dans
le tableau de bord Supabase. Les suivants sont organisateurs par défaut.

Sur un projet déjà en service, la migration reprend les comptes existants
comme administrateurs : ce sont ceux de l'exploitant, et la migration ne doit
pas fermer la console à celui qui la pousse.

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

Trois de plus pour les rappels de conférence, sans quoi la fonction `rappels`
répond 503 et aucun rappel ne part — le reste du plan ne s'en aperçoit pas :

```bash
npx web-push generate-vapid-keys        # une fois, et on les garde
npx supabase secrets set \
  VAPID_CLE_PUBLIQUE=… VAPID_CLE_PRIVEE=… VAPID_SUJET=mailto:contact@exemple.fr
```

La paire ne se régénère pas à la légère : changer la clé publique invalide
tous les abonnements posés par les visiteurs, qui devront rouvrir le plan pour
s'abonner de nouveau. `VAPID_SUJET` doit être un `mailto:` ou un `https:` —
Apple refuse le jeton autrement, par un 403 sans explication.

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

### Les polices

Les polices ne viennent pas de Google : chaque page ouverte lui aurait transmis
l'adresse IP de son visiteur. Elles sont téléchargées une fois dans
`web/polices/`, versionnées, et déclarées par la construction dans l'en-tête des
pages qui portent `<!--__POLICES__-->` — en fichiers voisins pour les pages
servies, embarquées en `data:` pour la page autonome (`plan-smcl.html`).

```bash
npm run polices      # télécharge les familles des modèles et celles au choix → web/polices/
```

Deux listes. Les familles des **modèles**, en tête de `outils/polices.js`, sont
déclarées dans toutes les pages. Les polices **au choix** pour les noms du plan
se lisent dans `POLICES_NOMS` (`_admin1.html`) — l'onglet qui les propose reste
la seule liste — et ne se chargent qu'une fois choisies, par leur feuille
`web/polices/<famille>.css`.

Le téléchargement n'appartient pas à la construction, qui doit tourner sans
réseau. On ne le relance que pour changer l'une des deux listes ; il écrit aussi
`outils/polices.json`, que la construction relit. Deux garde-fous font échouer
`npm run construire` : une page qui demanderait encore une police à Google, et
une police proposée dans l'onglet qui n'aurait pas été rapatriée sous sa
graisse.

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

Les migrations sont rejouables : `db push` n'applique que celles qui manquent.
Les fonctions, elles, se redéploient entièrement à chaque fois.

Une nouvelle migration se crée avec `npm run migration -- "Titre"`, qui la
nomme `AAAAMMJJHHMMSS_titre.sql`. L'horodatage n'est pas cosmétique : deux
branches ouvertes en même temps devinaient le même numéro de suite, et l'une
devait renommer son fichier au moment de la fusion — or une migration déjà
appliquée en production est enregistrée là-bas sous son ancien nom, et
rejouerait sous le nouveau. À la seconde près, la collision n'a plus lieu.

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
| `/plan?plan=<slug>&support=appli` | le même, ouvert par une coque d'application qui se déclare | libre |
| `/plan-admin?plan=<slug>` | le même, avec calques et dessins | authentifié |
| `/admin-plans` | la console des événements | authentifié |
| `/rapport?plan=<slug>` | le rapport d'utilisation | authentifié |
| `/motdepasse` | choisir ou réinitialiser son mot de passe | par lien reçu |

La page publique ne contient aucune commande d'administration : elles sont
retirées du document au chargement. La page d'administration exige une session
Supabase valide, vérifiée auprès du serveur à chaque ouverture.

### À faire côté Supabase

Créer le compte administrateur dans **Authentication → Users → Add user**, avec
un mot de passe. C'est ce compte qui ouvre la console ; il n'y a pas
d'inscription libre, et c'est voulu. Le premier compte du projet est
administrateur d'office — voir « Comptes et profils ».

« Pas d'inscription libre » est un réglage, pas une propriété du code :
**Authentication → Sign In / Providers → Allow new users to sign up** doit être
fermé. Ouvert, il laisse créer un compte à qui détient la clé publique, c'est-à-dire
à qui a ouvert une page. Ce compte-là ne voit rien — un organisateur sans salon
affecté n'en lit aucun — mais il n'a rien à faire dans l'annuaire.

Deux autres réglages conditionnent les invitations et les mots de passe oubliés :

- **Authentication → URL Configuration** : deux champs, et les deux comptent.
  *Site URL* doit porter l'adresse de service (`https://<domaine>`) ; elle vaut
  `http://localhost:3000` sur un projet neuf. Les *Redirect URLs* doivent
  contenir `https://<domaine>/motdepasse` — ajouter `https://<domaine>/**`
  évite d'y revenir à chaque page.

  C'est le réglage qui se remarque le plus tard : Supabase n'annonce pas qu'il
  écarte une adresse de retour absente de la liste, il la remplace par *Site
  URL*. Un lien d'invitation ou de mot de passe oublié pointant vers
  `localhost` ne vient donc jamais du code — il dit que le domaine manque dans
  ces deux champs.
- **Authentication → Emails** : le service d'envoi intégré de Supabase est
  limité à quelques messages par heure et n'est pas prévu pour la production.
  Dès qu'on invite de vrais organisateurs, brancher un **SMTP** à soi
  (Project Settings → Authentication → SMTP Settings).

### Sécurité des fonctions

`sync-evenement` exige un utilisateur authentifié : elle écrit en base et
interroge Klipso avec la clé de l'organisateur. La simple clé publique, qui
circule dans toutes les pages, ne suffit pas. Elle vérifie en outre que
l'appelant a bien ce salon — elle écrit ensuite avec la clé de service, qui
ignore les politiques de la base, et c'est donc là qu'il faut poser la
question. Elle n'interroge Klipso que pour un salon de la base, jamais pour
une instance et un événement nommés dans la requête : ce serait prêter la clé
Klipso de l'exploitant, et rendre les pavillons d'un salon voisin.

`comptes` crée, modifie et supprime les comptes : cela relève de l'API
d'administration de Supabase, qui exige la clé de service. Cette clé ne pouvant
pas descendre dans un navigateur, elle reste dans la fonction, qui relit
elle-même le rôle de l'appelant en base. Un jeton valide d'organisateur n'y
obtient rien.

`plan-public` reste en lecture libre — c'est son rôle — mais les deux fonctions
n'annoncent leurs en-têtes CORS que pour les origines déclarées dans
`ORIGINES`. Toute nouvelle adresse de déploiement doit y être ajoutée.
