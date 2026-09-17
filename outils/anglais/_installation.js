/* `outils/gabarit/_installation.html` — l'invitation à installer le plan : la
   fenêtre que lit le visiteur, et sa case dans l'onglet « Admin » des réglages.
   Les intitulés des gestes sont ceux que les systèmes affichent en anglais :
   on les cherche des yeux, ils doivent être les mêmes. */
module.exports = {
  // la fenêtre
  "Installer le plan": "Install the map",
  "Le plan, sur votre écran d'accueil": "The map, on your home screen",
  "Ajoutez-le comme une application : il s'ouvrira d'un geste, en plein écran, et restera consultable sur place, même quand le réseau ne passe plus.":
    "Add it like an app: it will open in one tap, full screen, and stay available on site, even when there is no signal.",
  "Plus tard": "Not now",
  "Installer": "Install",
  "Guidez-moi": "Show me how",

  /* Les gestes, là où aucun bouton ne peut les faire. Chaque pictogramme et
     chaque intitulé en gras coupe la phrase en nœuds de texte, traduits l'un
     après l'autre : d'où les mots seuls, que le contrôle croit couverts par
     des phrases plus longues et que le moteur, lui, ne trouve pas. */
  "Touchez": "Tap",
  "Choisissez": "Choose",
  "ou": "or",
  "Ajouter": "Add",
  "dans la barre du navigateur — sous": "in the browser bar — under",
  "s'il n'y paraît pas.": "if it isn't shown.",
  "Sur l'écran d'accueil": "Add to Home Screen",
  ", plus bas dans la liste.": ", further down the list.",
  "Validez par": "Confirm with",
  "Ouvrez le menu du navigateur": "Open the browser menu",
  "Ajouter à l'écran d'accueil": "Add to Home screen",

  /* Le guide, qui reste au bord de l'écran le temps des gestes. Son intitulé
     et ses gestes sont ceux de la fenêtre : rien de plus à traduire ici. */
  "Fermer le guide": "Close the guide",

  // le rappel, l'application installée et le plan lu dans le navigateur
  "L'application est installée": "The app is installed",
  "Déjà sur votre écran d'accueil": "Already on your home screen",
  "Vous lisez le plan dans le navigateur. Ouvert depuis l'application, il s'affiche en plein écran, se lance d'un geste et reste consultable sur place, même quand le réseau ne passe plus.":
    "You are reading the map in the browser. Opened from the app, it shows full screen, launches in one tap, and stays available on site, even when there is no signal.",
  "Rester ici": "Stay here",
  "Ouvrir l'application": "Open the app",
  "Compris": "OK",

  /* iOS ne dit pas qu'une application est installée, et rien ne l'y ouvre : la
     même fenêtre y parle au conditionnel, à qui a lu les gestes d'ajout. */
  "Le plan en application": "The map as an app",
  "Si vous l'avez ajouté à votre écran d'accueil, ouvrez-le depuis son icône plutôt que depuis le navigateur : il s'affiche en plein écran, se lance d'un geste et reste consultable sur place, même quand le réseau ne passe plus.":
    "If you added it to your home screen, open it from its icon rather than from the browser: it shows full screen, launches in one tap, and stays available on site, even when there is no signal.",

  // le bouton n'a rien ouvert
  "Ouvrez-la depuis son icône": "Open it from its icon",
  "Sur votre écran d'accueil": "On your home screen",
  "Le navigateur n'a pas pu passer la main. Touchez cette icône sur votre écran d'accueil : le plan s'y ouvre en plein écran, et reste consultable même sans réseau.":
    "The browser could not hand over. Tap this icon on your home screen: the map opens full screen there, and stays available even without a signal.",

  // la case des réglages
  "Inviter les visiteurs à installer le plan": "Invite visitors to install the map",
  "Sur téléphone et tablette, quand le plan est ouvert dans le navigateur : une fenêtre propose de l'ajouter à l'écran d'accueil, dès l'ouverture. Là où le navigateur n'installe pas d'un bouton — sur iPhone, notamment —, les gestes restent ensuite au bord de l'écran, le temps de les faire. Une autre fenêtre rappelle l'application à qui l'a déjà, dix secondes après l'ouverture. Une fois par jour au plus chacune, et plus du tout après deux refus. Aperçu de l'invitation :":
    "On phones and tablets, when the map is open in the browser: a window offers to add it to the home screen, as soon as it opens. Where the browser cannot install from a button — on iPhone in particular — the steps then stay at the edge of the screen, for as long as it takes. Another window reminds visitors who already have the app, ten seconds in. At most once a day each, and never again after two refusals. Preview of the invitation:",
  ". Du rappel :": ". Of the reminder:",
  "Android": "Android",
};
