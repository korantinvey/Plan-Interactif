/* `outils/gabarit/modules/parcours.mjs` — le parcours de visite : le signet et
   ce qu'il dit, le compte d'un lot ; puis le geste et le tiroir, restés dans
   `_parcours.html`.

   Les phrases du morceau soudé se rangent ici plutôt que dans un `_parcours.js`
   à lui. Une page emporte un dictionnaire quand elle porte ce qu'il traduit, et
   reconnaît un module à son chemin, sûrement ; un morceau soudé, elle le
   reconnaît à ses premières déclarations. Celles de `_parcours.html` sont
   parties avec le module, et il ne lui en reste que de banales — une ligne
   comme `const p = document.createElement("p");` — que la console et le
   rapport portent aussi : ils auraient emporté le tiroir sans l'afficher. */
module.exports = {
  "Retirer de mon parcours": "Remove from my visit plan",
  "Ajouter à mon parcours": "Add to my visit plan",
  "Dans mon parcours": "In my visit plan",
  "{n} exposant": "{n} exhibitor",
  "{n} exposants": "{n} exhibitors",
  "{n} conférence": "{n} conference",
  "{n} conférences": "{n} conferences",
  /* Ce qu'un lot versé d'un coup contient, et la question qui le précède. Les
     quatre accords se déclarent un à un : l'anglais ne met pas le pluriel aux
     mêmes endroits que le français, et « 0 » y est déjà au pluriel. */
  "{n} exposant et {n2} conférence": "{n} exhibitor and {n2} conference",
  "{n} exposant et {n2} conférences": "{n} exhibitor and {n2} conferences",
  "{n} exposants et {n2} conférence": "{n} exhibitors and {n2} conference",
  "{n} exposants et {n2} conférences": "{n} exhibitors and {n2} conferences",

  /* `_parcours.html` : le tiroir, le lot versé d'un coup, le vidage. */
  "Retirer du parcours": "Remove from visit plan",
  "rien pour l'instant": "nothing yet",
  "Ouvrez la fiche d'un exposant, ou le programme d'une zone, et touchez le signet pour l'ajouter ici. Votre parcours reste sur cet appareil, et vous pourrez en garder une copie pour le jour du salon.":
    "Open an exhibitor's details, or an area's programme, and tap the bookmark to add it here. Your visit plan stays on this device, and you will be able to keep a copy of it for the day of the show.",
  "Exposants": "Exhibitors",
  "Ajouter {contenu} à votre parcours de visite ?": "Add {contenu} to your visit plan?",
  "Ajouter": "Add",
  "Ajouter tout à mon parcours": "Add everything to my visit plan",
  "Déjà dans votre parcours": "Already in your visit plan",
  "Les exposants et les conférences retenus seront oubliés. Ils ne sont enregistrés que sur cet appareil : rien ne permettra de les retrouver.":
    "The exhibitors and conferences you picked will be forgotten. They are only saved on this device: there will be no way to get them back.",
  "Vider": "Clear",
};
