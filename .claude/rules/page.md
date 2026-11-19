---
paths:
  - "outils/gabarit/modules/**"
  - "outils/gabarit/_sw.js"
  - "outils/gabarit/*.html"
  - "src/**"
---

# Ce que la page reçoit, et ce qu'elle montre

Remarques de CodeRabbit vérifiées justes, hors requêtes concurrentes
(#533, #535, #542, #543, #557).

- **Tout attribut HTML passe par `esc()`, identifiant compris** : un `data-id`
  écrit brut à côté d'un `data-aj` échappé laissait sortir un `"` (#542). Une
  valeur relue par `getAttribute` ou `textContent` est décodée : elle se
  ré-échappe avant d'être recollée dans du HTML.
- **Ce qui vient de la base ou d'un fichier de sauvegarde se ramène à son type
  dès l'entrée** — des sommets en nombres, pas en chaînes (#533 `calquesSurs`).
- **Ce qui appartient à un compte part avec lui** : déconnexion, changement de
  compte ou de projet vident plans, annuaire et session (#542).
- **Une réponse ne se juge pas à son `Content-Type`** : on lit le corps (hors
  images) (#557). Des octets se comptent par `byteLength`, pas par `length`.
- **Les dates** : un 31 février se refuse ; une heure ISO sans décalage se lit
  dans le fuseau du salon (#543).
- **Clavier** : une fenêtre rend le focus à la fermeture
  (`modules/focus-fenetre.mjs`) ; un contrôle sans texte a un nom ; une liste
  déroulante ou un éditeur riche garde ses touches quand le plan écoute le
  clavier (#535, #543).
- **Une notice, un commentaire ne promettent pas plus que le code** : la notice
  de mesure affirmait qu'aucun navigateur n'était relevé, alors que la sonde
  envoie sa famille et sa version (#542).
