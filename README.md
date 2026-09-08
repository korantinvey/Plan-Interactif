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
35 « Retour ». La ligne offre donc, sous le champ, les valeurs que la
synchronisation a vues ; on coche celles qui comptent. Plusieurs peuvent
compter à la fois — un salon tiendra « Retour » pour un retour à signaler, un
autre non. Aucune cochée, rien n'est signalé, et la ligne le dit.

Un champ qui porte plus de huit valeurs distinctes est du texte libre : sa liste
n'est pas proposée. Un salon synchronisé avant que le relevé ne garde les
valeurs distinctes n'en a pas non plus. Dans les deux cas la ligne le dit, et
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

Le pied du tiroir porte **« Organiser ma journée »**, qui met cette liste en
heures : c'est l'objet de la section suivante.

Cette liste **ne quitte jamais l'appareil** : elle vit dans le stockage local du
navigateur, sous une clé par événement (`plan-parcours:<slug>`), et ne contient
que des identifiants. Rien n'est envoyé au serveur, aucun compte n'est demandé,
et un exposant renommé entre deux visites s'affiche sous son nouveau nom — les
libellés sont relus dans les données à chaque affichage. Ce que le plan ne
connaît plus est écarté au chargement, pour qu'un stand démonté ne laisse pas
un rang mort.

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
- **Ce qui sépare deux pavillons ne figure sur aucun plan.** D'un pavillon à
  l'autre, le trajet se coupe à la porte — le tronçon de départ jusqu'à la
  porte la plus proche, puis celui d'une porte du pavillon suivant jusqu'à
  l'arrivée — et le visiteur lit « rejoignez le pavillon 7.2 » entre deux
  tracés qui, eux, sont exacts. La distance annoncée est celle des tronçons, et
  l'affichage le dit (« au moins 165 m »). Sans repère « Entrée/Sortie » sur le
  plan, cette partie n'est pas tracée, et le tiroir l'explique plutôt que
  d'inventer. Entrée et sortie ne font qu'un repère : on entre et on sort par
  la même porte, et le trajet l'emprunte dans les deux sens. Les plans posés
  avant cette fusion n'ont rien à reprendre — l'ancien pictogramme « Sortie »
  se range sous le nouveau.

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

Les deux bouts par lesquels on peut prendre le problème. **Barrer est presque
toujours le plus court** — un bloc sanitaire fait un rectangle, une allée en
fait cinquante — et c'est ce que la liste propose en premier. Le dernier rôle
reste là pour le hall dont le vide n'est, dans l'ensemble, pas praticable : dès
qu'un pavillon porte une circulation dessinée, elle remplace l'enveloppe et ce
qui n'est pas dessiné cesse de l'être. Cela coûte une après-midi de tracé, et il
vaut mieux le savoir avant de s'y mettre. Dans les deux cas, tracez les surfaces
telles qu'elles sont : le dégagement au bord est retiré tout seul.

Une case **« Voir ce qui est praticable »**, dans la même barre, teinte la
grille telle que le calcul la voit. Sans elle on dessine à l'aveugle : deux
allées qui ne se touchent pas d'un demi-mètre ne se remarquent qu'au premier
trajet qui échoue, et sans dire où. Elle n'existe qu'en administration.

Le rôle vit dans les réglages, à côté de l'ordre des calques, et part aux
visiteurs à la publication : les colonnes de `calque_dessin` sont fixées, celles
des réglages ne le sont pas, et rien de tout cela ne demande de migration.

### Le mode accessible

Cocher « Itinéraire accessible » change deux choses, sans changer le calcul :

1. **Le passage minimal double** — un mètre quarante au lieu de quatre-vingt-dix
   centimètres, la largeur qu'exige un fauteuil roulant. Une allée plus étroite
   disparaît simplement de la grille, et le trajet passe ailleurs.
2. **Les obstacles s'ajoutent.** Les repères « Escalier » et « Escalator » sont
   noircis sur l'emprise même de leur pastille — ce qu'on voit est ce qui est
   évité, sans rien redessiner. Les pentes, les emmarchements et les estrades
   n'ont pas de pictogramme et n'en auront pas : ils se tracent sur un calque
   dont le rôle est *Infranchissable en fauteuil*. Ce calque reste invisible au
   visiteur — c'est le trajet qui en tient compte, pas le dessin — et se
   reconnaît à son trait pointillé pendant l'édition.

Quand aucun chemin accessible n'existe, le tiroir le dit franchement et propose
de décocher l'option pour voir le trajet ordinaire. C'est le seul cas où la
réponse est « non » : mieux vaut cela qu'un trajet qui fait monter un escalier.

Un calque masqué ne compte pas, ni ses formes ni ses repères : le trajet doit
s'expliquer par ce qu'on voit à l'écran. La fonction se retire comme le parcours
de visite, depuis « Réglages du plan » — « Proposer le calcul d'itinéraire » —
et le bouton des fiches suit celui de la barre.

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
a posé des repères de porte — « Peu importe » reste offert, la journée commence
alors au premier stand. La liste des départs ne montre que les portes : un
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

Entre deux pavillons, la journée hérite de la franchise de l'itinéraire : rien
dans les données ne décrit ce qui les relie, le trajet n'est pas tracé, et la
distance annoncée devient « au moins ». Ordonner demande pourtant un prix,
sans quoi l'algorithme ferait l'aller-retour entre deux halls comme il change
d'allée : un forfait dissuasif suffit à regrouper les visites pavillon par
pavillon, et il ne compte jamais dans les mètres annoncés.

### Le temps de visite par stand

Combien de temps passe-t-on devant un exposant ? Cela ne se devine pas depuis le
plan — un salon grand public tourne vite, un salon d'affaires beaucoup moins —
et c'est pourtant ce qui décide combien de stands tiennent entre deux
conférences. Le réglage vit donc en administration, dans « Réglages du plan »
sous les cases à cocher : **Temps de visite par stand**, en minutes, vingt par
défaut. Comme les autres réglages, il faut publier la configuration pour qu'il
parvienne aux visiteurs.

Organiser une journée, c'est calculer une vingtaine d'itinéraires : le bouton
disparaît avec « Proposer le calcul d'itinéraire », dont il emprunte tout le
moteur.

## Le rapport d'utilisation

Le plan était une boîte noire : on savait combien d'exposants il portait, jamais
s'il servait. La page `rapport` répond à la question que pose l'organisateur —
combien sont venus, ce qu'ils ont cherché, quelles fiches ils ont ouvertes, et
**par quel chemin**. On y arrive depuis la console, par le bouton
« Utilisation » de la fiche d'un événement, ou directement :
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

Le détail par canal est ce qui se lit le plus vite : aucun clic sur un logo dit
qu'aucun logo n'a été posé ; une recherche qui domine dit que le plan sert de
répertoire plus que de plan.

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
| `compteur` | la fréquentation, à l'heure, sans objet |
| `compteur_cible` | l'audience d'un stand ou d'une conférence, au jour |
| `visiteur_jour` | un jeton vu tel jour — le seul décompte qui ne soit pas une somme |

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

### Ce qui est enregistré, et ce qui ne l'est pas

Un compteur porte l'événement, le geste, le canal, l'objet désigné, une heure.
`visiteur_jour` porte un jeton et une date. **Rien d'autre** — ni adresse IP, ni
agent utilisateur, ni identité, ni cookie. Le jeton de visiteur est tiré au
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

La lecture passe par `rapport_utilisation()`, qui agrège tout en un appel.

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
| `/rapport?plan=<slug>` | le rapport d'utilisation | authentifié |

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
