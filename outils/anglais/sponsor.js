/* `outils/gabarit/modules/sponsor.mjs` — le générique du démarrage, tel que le
   visiteur le voit. Le volet où l'exploitant le règle est dans
   `reglage-sponsor.js`.

   « Générique » se dit « splash screen » dans l'écran, et non « title card » :
   c'est le mot qu'un exploitant anglophone reconnaît d'une application, et il
   décrit ce qu'il voit — un écran qui passe. */
module.exports = {
  // ce que le visiteur lit au-dessus du logo, et ce que l'image se dit
  "Avec le soutien de": "With the support of",
  "Partenaire officiel": "Official partner",
  "Sponsor officiel": "Official sponsor",
  "En partenariat avec": "In partnership with",
  "Logo du sponsor": "Sponsor logo",
  /* La mention de la marque et son nom ne changent pas de langue : « powered
     by » est l'usage dans les deux, et « Event2Map » est un nom propre. Les
     entrées restent, sans quoi le contrôle les signalerait à chaque
     construction. */
  "powered by": "powered by",
  "Event2Map": "Event2Map",
};
