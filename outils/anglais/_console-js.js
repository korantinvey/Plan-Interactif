/* `outils/gabarit/_console-js.html` — la console multi-événements : la fiche
   d'un salon, ses sources, le contenu de la fiche détail, la synchronisation,
   les comptes. */
module.exports = {
  // le rythme de rafraîchissement
  "Manuel uniquement": "Manual only",
  "Toutes les 15 minutes": "Every 15 minutes",
  "Toutes les heures": "Every hour",
  "Toutes les 6 heures": "Every 6 hours",
  "Une fois par jour": "Once a day",

  // la fenêtre de synchronisation
  "Réponse reçue — en attente de la première étape…": "Response received — waiting for the first step…",
  "Avancement": "Progress",
  "Connexion au serveur…": "Connecting to the server…",
  "Journal": "Log",
  "Non repris : {etapes}": "Not included: {etapes}",
  "en cours": "in progress",
  "Interrompu": "Interrupted",

  // la barre du haut et la fiche du salon
  "Publié": "Published",
  "Brouillon": "Draft",
  "brouillon": "draft",
  "Repasser en brouillon": "Switch back to draft",
  "Publier l'événement": "Publish event",
  "Supprimer l'événement ?": "Delete event?",
  "« {salon} », ses pavillons, son apparence et ses dessins seront définitivement perdus.":
    "“{salon}”, its halls, its appearance and its drawings will be permanently lost.",
  "image trop lourde, même réduite — une icône, pas une photo": "image too heavy, even reduced — an icon, not a photo",
  "Icône de l'onglet": "Tab icon",
  "Elle paraît dans l'onglet du plan public comme dans celui de l'administration, à côté du nom du salon. Réduite puis enregistrée avec l'événement, elle part avec le plan sans dépendre d'un fichier hébergé ailleurs. Un carré se reconnaît mieux à seize pixels qu'un logo en longueur. Glissez-la sur la vignette, ou choisissez-la.":
    "It appears in the browser tab of the public map and of the admin map, next to the show's name. Reduced and saved with the event, it travels with the map without depending on a file hosted elsewhere. A square is easier to recognise at sixteen pixels than a wide logo. Drag it onto the thumbnail, or choose it.",
  "Retrait…": "Removing…",
  "Fuseau horaire": "Time zone",
  "Choisi ici, il l'emporte sur la synchronisation.": "Chosen here, it overrides the synchronisation.",
  // les deux phrases se suivent dans la même aide, et se traduisent aussi une à une
  "Choisi ici, il l'emporte sur la synchronisation. Videz le champ pour revenir à {fuseau}, donné par Eventmaker.":
    "Chosen here, it overrides the synchronisation. Clear the field to go back to {fuseau}, given by Eventmaker.",
  "Choisi ici, il l'emporte sur la synchronisation. Videz le champ pour revenir à {fuseau}, le défaut.":
    "Chosen here, it overrides the synchronisation. Clear the field to go back to {fuseau}, the default.",
  "Videz le champ pour revenir à {fuseau}, donné par Eventmaker.": "Clear the field to go back to {fuseau}, given by Eventmaker.",
  "Videz le champ pour revenir à {fuseau}, le défaut.": "Clear the field to go back to {fuseau}, the default.",
  "Donné par Eventmaker à la synchronisation. Choisissez-en un autre pour l'écarter.":
    "Given by Eventmaker during synchronisation. Choose another one to override it.",
  "Par défaut : aucune source n'en donne. Réglez-le si le salon se tient ailleurs.":
    "Default: no source provides one. Set it if the show takes place elsewhere.",
  "Il date les jours du rapport et l'heure du plan.": "It sets the days in the report and the time on the map.",
  "« {saisie} » n'est pas un fuseau connu : choisissez-le dans la liste.": "“{saisie}” is not a known time zone: choose it from the list.",
  "modification refusée": "change refused",
  "La base ne connaît pas « {fuseau} » : c'est {retenu} qui reste retenu.": "The database does not know “{fuseau}”: {retenu} stays in place.",
  "Connectez-vous pour accéder aux événements.": "Sign in to access the events.",
  "Aucun salon pour l'instant.": "No shows yet.",
  "Créez-en un avec « Nouveau ».": "Create one with “New”.",
  "Aucun salon ne vous a été affecté.": "No show has been assigned to you.",
  "Demandez l'accès à l'administrateur du projet.": "Ask the project administrator for access.",
  "Identité": "Identity",
  "Nom de l'événement": "Event name",
  "Identifiant d'URL": "URL identifier",
  "Sert d'adresse publique du plan.": "Used as the public address of the map.",
  "Données": "Data",
  "Provenance des données": "Data sources by domain",
  "Fiche détail": "Record details",
  "Rythme de rafraîchissement": "Refresh rate",
  "Synchroniser maintenant": "Synchronise now",
  "Synchronisation": "Synchronisation",
  "Pavillons": "Halls",
  "{n} publiés": "{n} published",
  "{n} publié": "{n} published",
  "Aucun pavillon connu. Lancez une synchronisation pour les récupérer.": "No known halls. Run a synchronisation to fetch them.",
  "Publier": "Publish",
  "Pavillon": "Hall",
  "Hall": "Hall no.",
  "Emplacements": "Stands",
  "Intégration": "Embedding",
  "Collez ce fragment dans la page du salon. Les visites qui en viennent se comptent à part, sous « Cadre sur un site », dans le rapport d'utilisation.":
    "Paste this snippet into the show's web page. Visits coming from it are counted separately, under “Frame on a website”, in the usage report.",
  "Copier": "Copy",
  "Échec": "Failed",

  // la provenance des données et les sources
  "La géométrie des pavillons et des calques.": "The geometry of halls and layers.",
  "Les sociétés rattachées aux emplacements. La géométrie et les zones restent au plan.":
    "The companies attached to the stands. Geometry and areas stay with the map.",
  "Aucune synchronisation ne les reprend encore.": "No synchronisation picks them up yet.",
  "Non synchronisé": "Not synchronised",
  "Klipso": "Klipso",
  "Eventmaker": "Eventmaker",
  "Instance": "Instance",
  "Le sous-domaine Klipso.": "The Klipso subdomain.",
  "Identifiant d'événement": "Event ID",
  "Le GUID transmis dans l'en-tête X-GAIA-EventId.": "The GUID sent in the X-GAIA-EventId header.",
  "Identifiant de l'événement": "Event ID",
  "Vingt-quatre caractères, visibles dans l'adresse de l'événement sur app.eventmaker.io.":
    "Twenty-four characters, visible in the event's address on app.eventmaker.io.",
  "69ef6fb4406b394eda9b8a3e": "69ef6fb4406b394eda9b8a3e",
  "Format inattendu — un identifiant ressemble à « {exemple} ».": "Unexpected format — an ID looks like “{exemple}”.",
  "Alimente : {domaines}.": "Feeds: {domaines}.",
  "Aucun domaine n'utilise cette source pour le moment.": "No domain uses this source yet.",
  "Les identifiants d'événement se saisissent dans « Sources de données », au menu Actions de la fiche.":
    "Event IDs are entered in “Data sources”, in the Actions menu.",
  "Plan : {source}": "Map: {source}",
  "Exposants : {source}": "Exhibitors: {source}",
  "Conférences : {source}": "Conferences: {source}",
  "Produits : {source}": "Products: {source}",
  "raccordement {sources} incomplet": "{sources} connection incomplete",
  "Klipso pour tout": "Klipso for everything",

  // le contenu de la fiche détail
  "hall de l'emplacement": "hall of the stand",
  "Affiché devant le numéro de stand, sur les seuls stands dont le hall est renseigné. Il se lit sur l'emplacement et non sur le pavillon, un même plan pouvant en couvrir deux. Décoché tant qu'on ne l'a pas voulu.":
    "Shown before the stand number, only on stands whose hall is filled in. It is read from the stand, not the hall on the map, as one map can cover two halls. Unticked until you choose otherwise.",
  "Numéro de stand": "Stand number",
  "allée et numéro de l'emplacement": "aisle and number of the stand",
  "Affiché à côté du pavillon.": "Shown next to the hall.",
  "nombre de niveaux de l'emplacement": "number of levels of the stand",
  "Seulement au-delà d'un niveau.": "Only above one level.",
  "secteur de l'emplacement": "sector of the stand",
  "Le découpage commercial du plan, que Klipso porte sur l'emplacement. Les couleurs et le filtre par secteur se règlent, eux, depuis le plan.":
    "The commercial layout of the map, which Klipso stores on the stand. Sector colours and the sector filter are set from the map.",
  "Enseigne": "Brand",
  "Le titre de la fiche : toujours affiché.": "The record's title: always shown.",
  "Quand elle diffère de l'enseigne.": "When it differs from the brand.",
  "Le logo de l'enseigne, en tête de fiche. Sur Eventmaker, c'est « avatar » qu'il faut désigner : « avatar_medium » et « avatar_thumb » sont recadrés au carré et coupent les bords d'un logo en largeur — et sur une fiche sans logo, ils rendent les initiales de la personne inscrite.":
    "The brand's logo, at the top of the record. On Eventmaker, choose “avatar”: “avatar_medium” and “avatar_thumb” are cropped square and cut off the edges of a wide logo — and on a record without a logo, they return the registrant's initials.",
  "Code postal": "Postcode",
  "avec l'adresse": "with the address",
  "Rejoint l'adresse sur la même ligne, comme sur une enveloppe.": "Joins the address on the same line, as on an envelope.",
  "Téléphone société": "Company phone",
  "Les rubriques du catalogue. Plusieurs champs se cumulent.": "The catalogue categories. Several fields add up.",
  "Ce que l'exposant vient chercher ou proposer, tel que le salon le range. Un champ à valeurs multiples se sépare tout seul ; fiez-vous à l'exemple, certains salons n'y portent que des codes.":
    "What the exhibitor is looking for or offering, as the show classifies it. A multi-value field is split automatically; check the example, some shows only store codes there.",
  "Pose une pastille en tête de fiche. Le champ n'existe que sur les salons qui distinguent leurs nouveaux venus.":
    "Adds a badge at the top of the record. The field only exists on shows that flag their newcomers.",
  "Les conférences tenues par l'exposant, où qu'elles se tiennent.": "The conferences run by the exhibitor, wherever they take place.",
  "programme non synchronisé": "programme not synchronised",
  "programme": "programme",
  "Le stand": "The stand",
  "L'emplacement tel que le plan le décrit. Rien ne s'y règle : ces valeurs ne sont pas des champs de fiche.":
    "The stand as the map describes it. Nothing to set here: these values are not record fields.",
  "L'exposant": "The exhibitor",
  "La société rattachée à l'emplacement, et ce que sa fiche porte.": "The company attached to the stand, and what its record holds.",
  "Exclu de la liste": "Excluded from the list",
  "Une valeur vraie retire l'exposant du plan public, quel que soit le reste.": "A true value removes the exhibitor from the public map, whatever else is set.",
  "Numéro de stand de l'exposant": "Exhibitor's stand number",
  "Le numéro tel que sa fiche le porte, comparé à celui du plan, mise en forme ignorée. Mal réglé, aucun exposant n'apparaît.":
    "The number as the exhibitor's record holds it, compared with the map's, formatting ignored. Set wrongly, no exhibitor appears.",
  "Identifiant de dossier": "Record ID",
  "Le dossier Klipso recopié sur la fiche : le rattachement le plus sûr.": "The Klipso record copied onto the entry: the most reliable link.",
  "Rattachement des co-exposants": "Co-exhibitor link",
  "Le champ où un co-exposant porte le stand de son hôte. Les fiches qui désignent ainsi un stand déjà pris par un dossier sont ses co-exposants, et la fiche du stand les liste tous. « Aucun » les retire du plan.":
    "The field where a co-exhibitor stores its host's stand. Records that point to a stand already taken by another record are its co-exhibitors, and the stand's record lists them all. “None” removes them from the map.",
  "Masqué — {champs}": "Hidden — {champs}",
  "Masqué": "Hidden",
  "Tout affiché": "Everything shown",
  "{n} champs propres au salon": "{n} show-specific fields",
  "{n} champ propre au salon": "{n} show-specific field",
  "{n} critères de recherche": "{n} search filters",
  "{n} critère de recherche": "{n} search filter",
  "aucun critère de recherche": "no search filters",
  "ordre d'affichage remanié": "display order changed",
  "{n} champs de zone masqués": "{n} area fields hidden",
  "{n} champ de zone masqué": "{n} area field hidden",
  "{n} groupes de champs": "{n} field groups",
  "{n} groupe de champs": "{n} field group",
  "{n} champs associés à la main": "{n} fields mapped by hand",
  "{n} champ associé à la main": "{n} field mapped by hand",
  "champs d'origine proposés": "source fields suggested",
  "champs d'origine non relevés": "source fields not collected",
  "Afficher ce champ sur la fiche": "Show this field on the record",
  "Proposer ce champ dans les critères de recherche": "Offer this field as a search filter",
  "Intitulé en français": "Label in French",
  "Intitulé en anglais": "Label in English",
  "Laissé vide, l'intitulé en français s'affiche aussi dans la version anglaise du plan.":
    "Left empty, the French label is also shown in the English version of the map.",
  "Nouveau champ": "New field",
  "Intitulé du champ, tel que la fiche l'affichera": "Field label, as the record will show it",
  "Renommer le champ": "Rename field",
  "Intitulé": "Label",
  "Retirer « {champ} » ?": "Remove “{champ}”?",
  "Le champ, son origine et son réglage de recherche sont effacés. Les valeurs déjà synchronisées disparaîtront de la fiche à la prochaine synchronisation.":
    "The field, its source and its search setting are erased. Values already synchronised will disappear from the record at the next synchronisation.",
  "Renommer {champ}": "Rename {champ}",
  "Retirer {champ}": "Remove {champ}",
  "Modifier": "Edit",
  "Aucune source d'exposants : il n'y a pas de champ d'origine à associer. Choisissez-en une dans « Provenance des données ».":
    "No exhibitor source: there is no source field to map. Choose one in “Data sources by domain”.",
  "Ce qui ne s'affiche pas": "What is not shown",
  "Champs propres à ce salon": "Fields specific to this show",
  "Un champ que ce salon est seul à tenir. Il se règle comme les autres — un champ d'origine, une case pour l'afficher, une case pour en faire un critère de recherche — et n'existe que pour cet événement. Un champ à choix multiple se sépare tout seul : la source joint ses valeurs par un point-virgule, et chacune compte pour elle-même.":
    "A field only this show has. It is set up like the others — a source field, a box to show it, a box to make it a search filter — and only exists for this event. A multiple-choice field is split automatically: the source joins its values with a semicolon, and each one counts on its own.",
  "Ajouter un champ": "Add a field",
  "Aucun champ propre à ce salon pour le moment.": "No show-specific fields yet.",
  "Les champs proposés viennent du relevé de la dernière synchronisation, le {date}.":
    "The suggested fields come from what the last synchronisation collected, on {date}.",
  "Un champ choisi à la main n'est plus jamais reproposé, et le réglage prend effet à la synchronisation suivante.":
    "A field chosen by hand is never suggested again, and the setting takes effect at the next synchronisation.",
  "Les champs d'origine se relèvent à la synchronisation : lancez-en une pour qu'ils soient proposés ici.":
    "Source fields are collected during synchronisation: run one for them to be suggested here.",
  "Le nom et le pavillon sont toujours affichés : sans eux la fiche ne désigne plus rien.":
    "The name and the hall are always shown: without them the record no longer points to anything.",
  "Décocher un champ le renvoie en réserve sur le plan, où il attend d'être réaffiché. C'est là que se règle le reste de la fiche — l'ordre des champs, les sections qui les réunissent sous un même titre, les intitulés qui paraissent devant les valeurs : engrenage, « Fiche Stand ». Ce qu'une fiche de zone organisateur montre — logo, description, lien, programme — s'y règle aussi : engrenage, « Zones ».":
    "Unticking a field sends it back to the reserve on the map, where it waits to be shown again. The rest of the details is set there — the order of the fields, the sections that gather them under one title, the labels that appear before the values: gear icon, “Stand details”. What an organiser area's details show — logo, description, link, programme — is set there too: gear icon, “Areas”.",
  "Afficher": "Show",
  "Sur la fiche": "On the record",
  "Champ d'origine": "Source field",
  "Critère": "Filter",
  "sans champ à régler": "no field to set",
  "Critère de recherche": "Search filter",
  "toujours": "always",

  // le champ d'origine et ses valeurs
  "(vide sur les fiches lues)": "(empty on the records read)",
  "{champs}, puis {suite}": "{champs}, then {suite}",
  "Par défaut — {champ}": "Default — {champ}",
  "Par défaut — aucun champ": "Default — no field",
  "Par défaut": "Default",
  "Aucun — laisser vide": "None — leave empty",
  "Champs": "Fields",
  "{champ} (absent du dernier relevé)": "{champ} (missing from the last collection)",
  "sans champ d'origine connu": "no known source field",
  "champ habituel introuvable : à désigner": "usual field not found: to be chosen",
  "laissé vide": "left empty",
  "champ par défaut": "default field",
  "choisi à la main": "chosen by hand",
  "proposé d'après le dernier relevé": "suggested from the last collection",
  "vaut oui quand la valeur est :": "counts as yes when the value is:",
  "aucune valeur retenue : « {valeurs} » valent oui d'office": "no value selected: “{valeurs}” count as yes by default",
  "aucune valeur retenue : « {valeurs} » vaut oui d'office": "no value selected: “{valeurs}” counts as yes by default",
  "aucune valeur retenue : rien ne sera signalé": "no value selected: nothing will be flagged",
  "trop de valeurs différentes pour en proposer la liste : saisissez celle qui compte":
    "too many different values to list them: type the one that matters",
  "valeurs inconnues : la prochaine synchronisation les relèvera, ou saisissez-en une ici":
    "values unknown: the next synchronisation will collect them, or type one here",
  "valeurs inconnues au relevé du {date} : la prochaine synchronisation les relèvera, ou saisissez-en une ici":
    "values unknown at the collection of {date}: the next synchronisation will collect them, or type one here",
  "portée par aucune des fiches relevées": "found on none of the records collected",
  "relevée sur les fiches": "found on the records",
  "autre valeur…": "other value…",

  // les liens et la synchronisation
  "L'événement est en brouillon : le plan public n'est pas encore servi.": "The event is a draft: the public map is not served yet.",
  "Le plan sur un écran posé dans le salon : il demande où il est, puis les itinéraires en partent":
    "The map on a screen installed at the venue: it asks where it stands, then routes start from there",
  "Ouvrir le plan tel que le voient les visiteurs": "Open the map as visitors see it",
  "Ouvrir le plan avec les calques et les outils de dessin": "Open the map with the layers and drawing tools",
  "accessible même en brouillon": "available even as a draft",
  "Visites, recherches et fiches ouvertes": "Visits, searches and records opened",
  "Dernière erreur : {erreur}": "Last error: {erreur}",
  "Dernière : {date}": "Last: {date}",
  "Jamais synchronisé.": "Never synchronised.",
  "Synchronisation — {salon}": "Synchronisation — {salon}",
  "salon": "show",
  "Synchronisation en cours…": "Synchronisation in progress…",
  "Synchronisation interrompue avant la fin.": "Synchronisation stopped before the end.",
  "{n} pavillons, {n2} emplacements, {n3} appariés.": "{n} halls, {n2} stands, {n3} matched.",
  "{n} pavillon, {n2} emplacements, {n3} appariés.": "{n} hall, {n2} stands, {n3} matched.",
  "{n} pavillons, {n2} emplacements.": "{n} halls, {n2} stands.",
  "{n} pavillon, {n2} emplacements.": "{n} hall, {n2} stands.",
  "Nomenclature en codes : {raison}": "Categories left as codes: {raison}",
  "{n} libellés de nomenclature.": "{n} category labels.",
  "Nom de la copie": "Name of the copy",
  "{salon} — copie": "{salon} — copy",
  "Nouvel événement": "New event",
  "Création…": "Creating…",
  "Événement créé.": "Event created.",
  "Données rechargées.": "Data reloaded.",

  // les comptes
  "Administrateur": "Administrator",
  "Organisateur": "Organiser",
  "Tous les salons, y compris ceux créés plus tard.": "All shows, including those created later.",
  "Aucun salon à affecter pour l'instant.": "No shows to assign yet.",
  "En attente": "Pending",
  "Vous": "You",
  "Nom": "Surname",
  "Prénom": "First name",
  "E-mail": "Email",
  "Profil": "Role",
  "Aucun compte.": "No accounts.",
  "Inviter quelqu'un": "Invite someone",
  "Compte enregistré.": "Account saved.",
  "Adresse incomplète.": "Incomplete address.",
  "Envoi de l'invitation…": "Sending the invitation…",
  "Invitation envoyée à {adresse}.": "Invitation sent to {adresse}.",
  "Envoi…": "Sending…",
  "Lien envoyé à {adresse}.": "Link sent to {adresse}.",
  "Cliquez à nouveau sur « Supprimer » pour confirmer.": "Click “Delete” again to confirm.",
  "Suppression…": "Deleting…",
  "Compte supprimé.": "Account deleted.",
  "Retour": "Back",
  "Envoyer l'invitation": "Send the invitation",
  "Envoyer un lien de mot de passe": "Send a password link",
  "Enregistrer": "Save",
  "Modifier le compte": "Edit account",
  "Le compte est créé sans mot de passe : l'invité en reçoit un lien par courriel, et le choisit lui-même.":
    "The account is created without a password: the invitee receives a link by email and chooses it themselves.",
  "L'adresse ne se change pas : c'est elle qui ouvre la session.": "The address cannot be changed: it is what signs the account in.",
  "Vous ne pouvez pas retirer votre propre rôle.": "You cannot remove your own role.",
  "Salons": "Shows",
  "Chargement impossible : {raison}": "Could not load: {raison}",
  /* Le bilan d'une synchronisation qui n'a reconnu aucun exposant. */
  "Aucun exposant reconnu sur {n} fiches lues : aucune ne porte « {stand} » ni « {dossier} ». Désignez les champs dans « Fiche détail ».":
    "No exhibitor recognised out of {n} records read: none carries “{stand}” or “{dossier}”. Set the fields under “Detail card”.",

  /* Les catégories d'invités qui portent les exposants. */
  "Catégories d'invités": "Guest categories",
  "Les fiches que la synchronisation lit. Une catégorie Eventmaker mêle souvent les sociétés et les personnes qui les représentent : cochez celles qui portent les exposants, et rien d'autre n'est lu. Tout décocher rend la main à la détection automatique. Le réglage prend effet à la synchronisation suivante.":
    "The records the sync reads. An Eventmaker category often mixes companies with the people representing them: tick the ones holding the exhibitors, and nothing else is read. Unticking them all hands control back to automatic detection. The setting takes effect on the next sync.",
  "{n} catégories désignées : la synchronisation ne lira que leurs fiches.":
    "{n} categories selected: the sync will read only their records.",
  "1 catégorie désignée : la synchronisation ne lira que ses fiches.":
    "1 category selected: the sync will read only its records.",
  "Aucune catégorie désignée : la synchronisation cherche elle-même celles dont les fiches portent un numéro de stand, et la dernière en a retenu {n}.":
    "No category selected: the sync looks for those whose records carry a stand number by itself, and the last one kept {n}.",
  "Aucune catégorie désignée : la synchronisation cherche elle-même celles dont les fiches portent un numéro de stand, et la dernière n'en a retenu aucune.":
    "No category selected: the sync looks for those whose records carry a stand number by itself, and the last one kept none.",
  "Les catégories se relèvent à la synchronisation : lancez-en une pour qu'elles soient proposées ici.":
    "Categories are surveyed during a sync: run one for them to be offered here.",
  "des fiches de cette catégorie portent un numéro de stand":
    "records in this category carry a stand number",
  "aucune fiche de cette catégorie ne portait de numéro de stand":
    "no record in this category carried a stand number",
};
