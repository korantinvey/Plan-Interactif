# Défauts d'avant, relevés pendant la sortie en modules

Trouvés par les agents en déplaçant le code ; aucun n'a été corrigé pendant la
découpe, qui devait garder le comportement à l'identique. À reprendre à la fin.

## Comportement visible

1. **Publication au repos en plein geste** — l'envoi automatique de la
   configuration (`modules/enregistrement.mjs` `programmePublication`) peut
   partir pendant qu'un geste de dessin est en cours.
2. **Remise à zéro des compteurs : « Annuler »** appelle
   `ouvreReglages("Statistiques")` puis `fermeModale()` referme aussitôt la
   fenêtre rouverte : on ne revient jamais sur l'onglet Statistiques, malgré
   le commentaire (`modules/chaleur.mjs` / `modules/reglages.mjs`).
3. **Onglet « Recherche » en français** dans la fenêtre des réglages en
   anglais, alors que l'entrée « Recherche » → « Search » existe.
4. **Volet Co-Exposants** : `(DATA?.plans || []).flatMap(...)` traite
   `plans` comme un tableau ; si c'est un objet indexé (les autres morceaux le
   parcourent par `Object.values`), l'onglet dit toujours « aucun stand
   partagé ». À vérifier sur de vraies données.
5. **Clic sur un texte libre** : il ne le sélectionne pas (SVG et WebGL) ; le
   clic est intercepté avant `editionPointerDown`, sans doute par un libellé
   du plan posé dessus.
6. **Rectangle tracé juste après avoir décoché les aimants** : rien n'est
   produit (outil de tracé de `_dessin.html`).
7. **Visite guidée, étape de la zone** : le rendu WebGL redessine le plan en
   continu ; très lent en rendu logiciel, non vérifié sur un vrai téléphone.
   La bulle se pose aussi pendant qu'un tiroir glisse, d'où des places qui
   varient selon le moment.

8. **Console : deux boutons referment la fenêtre qu'ils viennent d'ouvrir**
   (`ouvreModale`) — « Changer de projet » dans la fenêtre de connexion appelle
   `ecranConfig()` sans rendre `false`, et `fermeModale()` referme aussitôt la
   fenêtre de configuration : il ne reste aucune fenêtre. « Valider » dans la
   configuration ouvre la connexion, refermée de la même façon.
9. **Console : jeton de mot de passe arrivé par erreur** — pendant la
   redirection vers la page du mot de passe, la console commence quand même à
   charger ; `GET profil` et `GET evenement` partent ou non selon le moment.
10. **Cadrage initial sur téléphone** : `fit` varie de quelques pixels d'un
    chargement à l'autre, sans doute selon le moment où la barre et le tiroir
    sont mesurés.
11. **Fenêtre d'ordre des calques après un renommage** : elle n'est pas
    rouverte, malgré le commentaire (« puis on revient ») ; la fenêtre de
    renommage, en se refermant, emporte sans doute celle rouverte entre-temps.

## Code et outils

12. **Phrase publique dans un dictionnaire d'exploitant** : « Touchez le plan à
    l'endroit où ce code sera affiché. » est affichée par `bandeauVisee`
    (`modules/tiroir-itineraire.mjs`, public) mais traduite dans
    `outils/anglais/affiche-ici.js` ; la page publique ne la reçoit que parce
    qu'elle trouve la phrase dans son propre code.


13. **Heuristique `signaturesDe`** (`outils/traductions.js`) : reconnaît le
   dictionnaire d'une page par les premières lignes de déclaration d'un
   fichier source ; une ligne banale partagée y verse un dictionnaire entier
   à tort. À reprendre seule, une fois la découpe finie.
14. ~~`initialesDe` recopiée~~ — réglé par la sortie de la console : une seule copie dans `modules/session.mjs`.
15. **`btnRecharger`** : code mort.
16. **Commentaires périmés** :
    - celui d'`ecritColonnesEvenement` attribue `base` à `_pousse.html` ;
      elle vit dans `modules/session.mjs` ;
    - un commentaire orphelin décrivant `voletAdmin` se trouve avant
      `voletCoexposants` (`modules/reglages.mjs`) ;
    - `supabase/functions/plan-public/index.ts` (vers la ligne 924) cite
      encore `_geometrie.html` (laissé pour ne pas redéployer une fonction).
