---
name: relecture
description: Relit un diff de ce dépôt pour y trouver les fautes que rien ne contrôle automatiquement — parité SVG/WebGL, horodatage d'une migration, fichier fabriqué édité en direct, clé dans le commit, coût d'un rendu. À charger avant de relire une pull request ou ses propres modifications, et utilisée par le workflow `Relecture`.
---

# Relire un changement du plan interactif

Ce dépôt est déjà tenu par des contrôles mécaniques : `npm run verifie`
reconstruit les pages, analyse le JavaScript de tout ce qui est servi et refuse
une phrase affichée sans traduction ; le workflow `Pages` refait les trois sur
chaque poussée. **Ne relevez donc pas ce qu'ils voient déjà** — une page en
retard sur son gabarit, une redéclaration de fonction, une traduction
manquante. Le signaler une seconde fois n'ajoute rien et noie le reste.

Ce qui suit est l'inverse : ce que rien ne contrôle, et qui se paie après la
fusion. C'est là qu'une relecture gagne sa place.

## Les fautes qui ont déjà coûté quelque chose

**Un effet visuel du plan vu dans un seul rendu.** Le plan est peint par WebGL
par défaut, et par SVG seulement avec `?rendu=svg`. Le rendu WebGL relit le SVG
caché mais **ignore les feuilles de style** : une animation, une transition, un
filtre ou une lueur ajoutés en CSS dans `_head.html` ne se voient qu'en SVG
tant qu'ils ne sont pas rejoués dans `_webgl.html` (`animeCouche`,
`majAnimationWebgl`, `lueurDe`). C'est arrivé deux fois, et deux fois la
correction est partie en production sans rien changer pour qui regardait.
Donc : tout ajout visuel au plan en CSS se relit en cherchant son double dans
`_webgl.html`, et son absence est un défaut, pas une réserve.

**Une migration antérieure à la dernière de `main`.** Les migrations sont
horodatées à la seconde. Une branche qui a vécu quelques jours porte une
migration datée de sa création, tandis que `main` en a reçu de plus récentes,
déjà appliquées : `supabase db push` refuse alors d'en insérer une avant la
dernière posée, et le déploiement échoue **après la fusion, sur `main`**.
Comparez le nom du fichier ajouté dans `supabase/migrations/` à la dernière
migration de `main` ; s'il lui est antérieur, dites-le, et dites qu'il faut le
réhorodater — c'est sans risque tant que la migration n'a jamais été appliquée.

**Un fichier fabriqué corrigé en direct.** `web/*.html`, `web/console.css`,
`web/config.js`, `web/sw.js`, `web/manifeste.webmanifest`, `web/icone*`,
`outils/tpl-multi.html` et `CARTE.md` sont des sorties de construction : une
correction portée là est effacée à la reconstruction suivante. La source est
dans `outils/gabarit/`, `outils/pwa.js` ou `outils/icones.js`. Un diff qui
touche un de ces fichiers **sans** toucher la source correspondante est une
faute ; l'inverse — les deux ensemble — est exactement ce qu'on attend d'un
commit.

**Un rendu qu'on alourdit sans le mesurer.** La fluidité est un critère de
première importance ici. Le cas nommé dans le dépôt : un geste de
`pointermove` qui appelle `dessineDessins` (tous les calques refaits, cartouche
remesuré) au lieu de `redessineForme` (la seule forme tirée). Cherchez la même
faute de degré ailleurs : un travail proportionnel à tout le plan placé dans
une rafale d'événements, une lecture de géométrie qui force un recalcul de mise
en page dans une boucle, un `filter` ou une ombre CSS posés sur un calque
entier.

**Un code qui relit du texte affiché pour savoir où il en est.** Les pages
restent écrites en français et `_langue.js` les traduit dans le navigateur :
sous `?lang=en`, le texte d'un bouton est en anglais. Comparer à une chaîne
française littérale marche en français et casse en anglais, sans bruit.
Comparez à `traduit("…")`, ou mieux à un état.

## Ce qui ne doit jamais passer

- **Une clé dans le diff.** Aucune clé dans le dépôt : la clé `service_role` et
  la clé Klipso ne doivent atteindre ni une page ni un commit. Les clés serveur
  vivent dans les secrets Supabase. Un jeton, un mot de passe ou une chaîne de
  connexion ajoutés à un fichier versionné arrêtent la relecture là.
- **Une requête à un tiers depuis une page.** Aucune page ne demande ses
  polices à Google : chaque visiteur lui transmettrait son adresse IP, et la
  mesure du plan tient justement à ne rien laisser fuir sans consentement.
  `npm run construire` le refuse pour les polices ; il ne voit pas une autre
  origine ajoutée à la main.
- **Une nouvelle adresse de déploiement absente de `ORIGINES_AUTORISEES`.**
  Sans cela les fonctions refusent ses appels. Seule `mesure` accepte toutes
  les origines, et c'est voulu.
- **Une migration réécrite.** Elles sont rejouables et jamais modifiées : une
  correction est une migration de plus. Et une migration poussée sur `main`
  part en production, donc son contenu se relit avec cette idée en tête.
- **Une poussée forcée.** Le workflow `Pages` commite sur la branche poussée
  quand `web/` était en retard : un `--force` efface alors ce commit sans
  l'avoir vu.

## La forme

Le code, les commentaires et les messages de commit sont en **français
accentué**, et les commentaires expliquent *pourquoi*, pas *quoi*. Un
commentaire qui paraphrase la ligne suivante est du bruit à retirer ; une
décision non évidente laissée sans raison est une dette.

## Comment le dire

`CARTE.md` donne, pour chaque module, ses sections et ses fonctions **avec les
numéros de ligne** : il est produit par la construction, donc il ne peut pas
mentir. Lisez-le avant d'ouvrir quoi que ce soit, et n'ouvrez les deux modules
qui dépassent 1300 lignes que par tranches.

Une remarque utile nomme le fichier et la ligne, dit ce qui casse et dans quel
cas, et propose la correction. Une remarque dont vous n'êtes pas sûr se dit
comme telle, ou ne se dit pas : sur un dépôt de cette taille, trois remarques
justes valent mieux que douze dont la moitié sont des suppositions. Et rien ne
se pousse sur `main` au nom d'une relecture — une relecture propose.
