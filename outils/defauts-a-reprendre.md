# Défauts d'avant, relevés pendant la sortie en modules

Trouvés par les agents en déplaçant le code ; aucun n'a été corrigé pendant la
découpe, qui devait garder le comportement à l'identique. Repris ensuite, un
par un : chaque défaut reproduit d'abord, corrigé au plus juste, puis rejoué.
Ce qui reste ouvert est en tête ; le reste garde la trace de ce qu'on a trouvé.

## Encore ouvert

14. **Heuristique `signaturesDe`** (`outils/traductions.js`) : reconnaît le
    dictionnaire d'une page par les premières lignes de déclaration d'un
    fichier source ; une ligne banale partagée y verse un dictionnaire entier
    à tort. À reprendre seule.

### En attente d'une décision de comportement

3. **Onglet « Recherche » en français** dans la fenêtre des réglages en
   anglais. Ne se reproduit pas sur `plans.json` : l'onglet dit « Search »
   partout. Seul cas trouvé : un exposant nommé « Recherche » — `_langue.js`
   protège les noms d'exposants (`PROTEGES`) dans toute la page, l'onglet
   compris. À trancher : borner cette protection aux contenus de données, ou
   l'accepter.
5. **Clic sur un texte libre**, et 6. **rectangle tracé après avoir décoché les
   aimants** : le code n'y est pour rien — le texte se choisit, le rectangle
   se trace, en SVG comme en WebGL. Ce qui prenait le geste, c'est la boîte à
   outils flottante `#outils`, posée sur l'endroit visé. À trancher : la
   déplacer ou la réduire quand elle couvre ce qu'on édite.
11. **« Annuler » un renommage depuis l'ordre des calques** ne ramène pas à la
    fenêtre d'ordre (« Valider » et Entrée, eux, y ramènent désormais). Le
    commentaire « puis on revient » se lit dans les deux sens.

## Corrigés

1. **Publication au repos en plein geste** — le repos se comptait depuis la
   dernière modification, non depuis la fin du geste ; un envoi déjà parti
   relisait aussi les dessins après ses appels réseau. L'envoi attend que le
   geste soit lâché (`modules/enregistrement.mjs`, `confieGesteEnCours` donné
   par `modules/gestes-admin.mjs`) et relève ce qu'il écrit avant le réseau.
2. **Remise à zéro : « Annuler »** ramène sur l'onglet Statistiques
   (`modules/chaleur.mjs`, `ferme: false`).
7. **Visite guidée, étape de la zone** — chaque pouls reposait la classe
   `tutoCible`, et le WebGL redessinait tout le plan ; la bulle se posait
   contre la fiche en plein mouvement. Classe posée une fois, bulle reposée
   quand les tiroirs ont fini (`modules/tutoriel.mjs`).
8. **Console : deux boutons refermaient la fenêtre qu'ils ouvraient** —
   « Changer de projet » et « Valider » rendent `false`
   (`modules/socle-console.mjs`).
9. **Console : jeton de mot de passe** — la page qui part ne charge plus rien ;
   le socle choisit le premier écran (`premierEcran`).
10. **Cadrage initial sur téléphone** — `fit` mesurait le tiroir de la liste en
    train de glisser ; un recadrage une fois la liste posée
    (`modules/demarrage.mjs` `recadreListePosee`).
11. **Ordre des calques après un renommage** par le bouton « Valider » : il y
    ramène, comme la touche Entrée (`modules/outil-dessin.mjs` `demandeNom`) ;
    pour « Annuler », voir plus haut.
13. **Consigne de visée du code « Vous êtes ici »** traduite avec le tiroir qui
    l'affiche (`outils/anglais/tiroir-itineraire.js`).
15. **`initialesDe` recopiée** — une seule copie dans `modules/session.mjs`.
16. **`btnRecharger`** — le bouton sert ; seule une copie des pavillons que rien
    ne relisait, dans son gestionnaire de la console, était morte.
17. **Commentaires périmés** — renvois aux fichiers soudés devenus modules,
    dans les sources des pages. Restent, hors des pages : `supabase/functions/`
    (`plan-public/index.ts`, `mesure/index.ts`, `sync-evenement/index.ts`,
    `_partage/vignette.ts` — laissés pour ne pas redéployer une fonction pour
    un commentaire), `src/index.mjs`, `README.md`.

## Sans défaut

4. **Volet Co-Exposants** : `DATA.plans` est bien un tableau partout ; avec des
   co-exposants, le volet les compte.
12. **Image liée à un exposant, en WebGL** : l'essai d'origine portait un PNG
    corrompu, que la couche d'image de deck.gl ne charge pas. Une image valide
    — et l'outil réencode toujours celles qu'on pose — ouvre la fiche.
