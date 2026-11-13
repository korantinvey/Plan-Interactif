/* `outils/gabarit/modules/socle-console.mjs` — le socle de la console et du
   rapport : les appels, l'accès au projet, la connexion, le thème. La fenêtre
   (`fenetre-console.mjs`) n'a pas de phrase à elle : « Annuler » et
   « Valider » sont déjà au dictionnaire du plan. */
module.exports = {
  "Non autorisé.": "Not authorised.",
  "Action non autorisée pour ce compte.": "Action not allowed for this account.",
  "Erreur {code}": "Error {code}",
  "Erreur {code} sur {chemin}": "Error {code} on {chemin}",
  "Connexion au projet": "Connect to the project",
  "L'adresse de l'": "The project's",
  "API": "API",
  "du projet, en": "address, ending in",
  "— pas celle du tableau de bord. La clé publique est faite pour circuler côté navigateur : c'est son rôle. Ne mettez jamais ici la clé de service.":
    "— not the dashboard one. The public key is meant to be used in the browser: that is what it is for. Never put the service key here.",
  "Connexion": "Sign in",
  "Projet : {adresse}": "Project: {adresse}",
  "non configuré": "not configured",
  "Changer de projet": "Change project",
  "Thème sombre": "Dark theme",
  "Thème clair": "Light theme",
  // l'adresse du projet refusée en clair : elle porterait le mot de passe
  "L'adresse du projet doit commencer par https://": "The project address must start with https://",
  // un appel parti vers un projet que l'on a quitté entre-temps
  "Le projet a changé pendant l'appel.": "The project changed during the call.",
};
