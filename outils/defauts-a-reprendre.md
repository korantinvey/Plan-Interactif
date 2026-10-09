# Défauts d'avant, relevés pendant la sortie en modules

Trouvés par les agents en déplaçant le code ; aucun n'a été corrigé pendant la
découpe, qui devait garder le comportement à l'identique. Repris ensuite, un
par un : chaque défaut reproduit d'abord, corrigé au plus juste, puis rejoué.
Tous sont maintenant réglés ; la liste garde la trace de ce qu'on a trouvé.

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
    « Annuler » y ramène aussi.
13. **Consigne de visée du code « Vous êtes ici »** traduite avec le tiroir qui
    l'affiche (`outils/anglais/tiroir-itineraire.js`).
15. **`initialesDe` recopiée** — une seule copie dans `modules/session.mjs`.
16. **`btnRecharger`** — le bouton sert ; seule une copie des pavillons que rien
    ne relisait, dans son gestionnaire de la console, était morte.
3. **Onglet « Recherche » resté en français** quand un exposant porte ce nom :
   la protection des noms ne vaut plus dans ce que la page dit en son nom —
   onglets des réglages, titre et boutons d'une fenêtre, bande
   d'administration, palettes (`_langue.js` `INTERFACE`).
5. / 6. **Boîte à outils posée sur ce qu'on édite** : elle se replie sur sa
   tête, d'un bouton ou d'elle-même quand la forme choisie ou déplacée passe
   dessous (`modules/edition.mjs` `replieOutils`) ; la déplacer ne ferait que
   couvrir le panneau des calques.
14. **Heuristique `signaturesDe`** (`outils/traductions.js`) — une ligne
    banale que d'autres sources portaient aussi versait un dictionnaire entier
    dans une page sans le module (celui du rapport dans la console, et
    l'inverse) : seules comptent les lignes propres au morceau.
17. **Commentaires périmés** — renvois aux fichiers soudés devenus modules,
    dans les sources des pages, puis dans `src/index.mjs`, `README.md` et
    `CLAUDE.md`. Restent ceux de `supabase/functions/` (`plan-public/index.ts`,
    `mesure/index.ts`, `sync-evenement/index.ts`, `_partage/vignette.ts`) :
    laissés pour ne pas redéployer une fonction pour un commentaire — à
    reprendre avec la prochaine retouche de chacune.

## Sans défaut

4. **Volet Co-Exposants** : `DATA.plans` est bien un tableau partout ; avec des
   co-exposants, le volet les compte.
12. **Image liée à un exposant, en WebGL** : l'essai d'origine portait un PNG
    corrompu, que la couche d'image de deck.gl ne charge pas. Une image valide
    — et l'outil réencode toujours celles qu'on pose — ouvre la fiche.
