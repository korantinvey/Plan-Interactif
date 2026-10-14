/**
 * Le salon de démonstration — un vrai plan, des exposants inventés.
 *
 * `plan-smcl.html` montre le SMCL tel que Klipso l'a rendu : ses exposants,
 * leurs sites, les espaces de l'organisateur sous leurs noms de marque. On ne
 * le montre pas à un prospect. Cette page-ci garde ce qui fait un plan
 * crédible — les pavillons, la géométrie des stands, leur numérotation, leur
 * état de commercialisation, la répartition des familles de produits — et
 * remplace tout ce qui nomme quelqu'un :
 *
 *   - chaque exposant reçoit un nom, une raison sociale, une ville, un site en
 *     `.example` (domaine réservé, qui ne mène chez personne) et un numéro
 *     dans la plage que l'ARCEP réserve à la fiction (01 99 00 xx xx) ;
 *   - les codes de nomenclature deviennent des libellés lisibles, inventés ;
 *   - les espaces de l'organisateur prennent des noms génériques, et les
 *     calques de fond qui recopiaient leurs noms de marque sont retirés ;
 *   - les identifiants Klipso (pavillons, stands, zones) sont refaits ;
 *   - un programme de conférences, absent des données figées, est ajouté
 *     pour que la fiche d'une zone, la journée organisée et les rappels aient
 *     de quoi se montrer.
 *
 * Tout est tiré d'un hasard à graine fixe : deux constructions donnent le même
 * salon, octet pour octet — sans quoi la version du service de second plan
 * changerait à chaque construction (`genere.js` `FABRIQUEES`). Un même exposant
 * réel présent sur deux stands y reçoit le même nom inventé, tiré de son nom
 * réel par empreinte : rien ne permet de remonter de l'un à l'autre.
 *
 * Appelé par `genere.js`, qui pose le résultat dans `web/demo.html` ;
 * `outils/essais/demo.js` vérifie qu'aucun nom réel n'y survit.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/* Changer le sel redistribue tous les noms : à ne toucher que pour cela. */
const SEL = "demo-2027";

/** Un hasard reproductible, tiré d'une clé. */
function hasard(cle) {
  let a = crypto.createHash("sha256").update(SEL + "|" + cle).digest().readUInt32LE(0);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pioche = (r, l) => l[Math.floor(r() * l.length)];
const deux = (r) => String(Math.floor(r() * 100)).padStart(2, "0");
const empreinte = (t, n = 8) => crypto.createHash("sha256").update(SEL + "|" + t).digest("hex").slice(0, n);

/* ---------- la nomenclature : une famille par lettre de code ----------
   Les codes Klipso du SMCL (« SMCL26_J4C ») gardent leur répartition — un
   stand en porte deux ou trois —, sous des libellés inventés. Chaque famille a
   son vocabulaire d'enseigne, pour qu'un « Voltéa Énergies » ne vende pas des
   aires de jeux. */
const FAMILLES = {
  A: { nom: "Administration & gestion", mots: ["Gestion", "Conseil", "Solutions", "Public"],
    sous: [["Logiciels de gestion", "Management software"], ["Dématérialisation", "Paperless administration"],
      ["Archivage", "Archiving"], ["Ressources humaines", "Human resources"],
      ["Finances locales", "Local finance"], ["Marchés publics", "Public procurement"],
      ["Conseil juridique", "Legal advice"], ["Assurances", "Insurance"],
      ["Formation des agents", "Staff training"], ["État civil", "Civil registry"]] },
  B: { nom: "Communication & citoyenneté", mots: ["Médias", "Com", "Éditions", "Signal"],
    sous: [["Signalétique", "Signage"], ["Affichage numérique", "Digital displays"],
      ["Participation citoyenne", "Citizen participation"], ["Édition & impression", "Publishing & printing"],
      ["Événementiel", "Events"], ["Médias locaux", "Local media"],
      ["Applications citoyennes", "Citizen apps"], ["Objets promotionnels", "Promotional items"]] },
  C: { nom: "Construction & aménagement", mots: ["Urbain", "Aménagement", "Bâti", "Structures"],
    sous: [["Bâtiments modulaires", "Modular buildings"], ["Aires de jeux", "Playgrounds"],
      ["Mobilier urbain", "Street furniture"], ["Voirie", "Roads"], ["Éclairage public", "Street lighting"],
      ["Revêtements de sol", "Floor coverings"], ["Clôtures & portails", "Fences & gates"],
      ["Équipements sportifs", "Sports equipment"], ["Rénovation énergétique", "Energy retrofit"],
      ["Ingénierie", "Engineering"]] },
  D: { nom: "Énergie & climat", mots: ["Énergies", "Solaire", "Watt", "Thermique"],
    sous: [["Photovoltaïque", "Solar power"], ["Réseaux de chaleur", "District heating"],
      ["Efficacité énergétique", "Energy efficiency"], ["Bornes de recharge", "Charging stations"],
      ["Stockage d'énergie", "Energy storage"], ["Bois-énergie", "Wood energy"],
      ["Audit énergétique", "Energy audit"]] },
  E: { nom: "Santé, social & enfance", mots: ["Santé", "Enfance", "Solidarité", "Care"],
    sous: [["Petite enfance", "Early childhood"], ["Restauration collective", "Catering"],
      ["Maintien à domicile", "Home care"], ["Santé connectée", "Connected health"],
      ["Accessibilité", "Accessibility"], ["Seniors", "Seniors"],
      ["Équipements scolaires", "School equipment"], ["Insertion", "Social inclusion"]] },
  F: { nom: "Environnement & cadre de vie", mots: ["Environnement", "Propreté", "Nature", "Eau"],
    sous: [["Gestion des déchets", "Waste management"], ["Propreté urbaine", "Street cleaning"],
      ["Eau & assainissement", "Water & sanitation"], ["Espaces verts", "Green spaces"],
      ["Biodiversité", "Biodiversity"], ["Qualité de l'air", "Air quality"],
      ["Compostage", "Composting"], ["Matériel de nettoyage", "Cleaning equipment"]] },
  G: { nom: "Sécurité & prévention", mots: ["Sécurité", "Protection", "Vigie", "Prévention"],
    sous: [["Vidéoprotection", "Video surveillance"], ["Police municipale", "Municipal police"],
      ["Contrôle d'accès", "Access control"], ["Sécurité incendie", "Fire safety"],
      ["Gestion de crise", "Crisis management"], ["Défibrillateurs", "Defibrillators"]] },
  H: { nom: "Culture, sport & loisirs", mots: ["Loisirs", "Sport", "Culture", "Scène"],
    sous: [["Équipements culturels", "Cultural facilities"], ["Bibliothèques", "Libraries"],
      ["Billetterie", "Ticketing"], ["Spectacle vivant", "Performing arts"], ["Tourisme", "Tourism"],
      ["Parcs de loisirs", "Leisure parks"], ["Matériel sportif", "Sports gear"],
      ["Piscines", "Swimming pools"], ["Parasport", "Para sport"]] },
  I: { nom: "Numérique & connectivité", mots: ["Numérique", "Data", "Connect", "Cloud"],
    sous: [["Très haut débit", "Broadband"], ["Cybersécurité", "Cybersecurity"],
      ["Données ouvertes", "Open data"], ["Ville intelligente", "Smart city"],
      ["Hébergement", "Hosting"], ["Téléphonie", "Telephony"],
      ["Inclusion numérique", "Digital inclusion"], ["Objets connectés", "Connected devices"]] },
  J: { nom: "Transport & mobilité", mots: ["Mobilité", "Transports", "Cycles", "Move"],
    sous: [["Transport à la demande", "On-demand transport"], ["Vélos & cycles", "Bicycles"],
      ["Stationnement", "Parking"], ["Véhicules électriques", "Electric vehicles"],
      ["Covoiturage", "Carpooling"], ["Signalisation routière", "Road signs"],
      ["Logistique urbaine", "Urban logistics"], ["Véhicules utilitaires", "Utility vehicles"],
      ["Autopartage", "Car sharing"], ["Transport scolaire", "School transport"]] },
  K: { nom: "Développement & attractivité", mots: ["Territoires", "Développement", "Avenir", "Atout"],
    sous: [["Développement économique", "Economic development"], ["Commerce de proximité", "Local retail"],
      ["Revitalisation des centres-bourgs", "Town centre revival"], ["Marketing territorial", "Place branding"],
      ["Financement", "Funding"], ["Tiers-lieux", "Third places"],
      ["Agriculture urbaine", "Urban farming"], ["Circuits courts", "Short supply chains"]] },
};

/* ---------- les noms d'enseigne ---------- */
const DEBUTS = ["Al", "Bel", "Cal", "Cor", "Dal", "Del", "Ev", "Fal", "Gal", "Hel", "Is", "Jun", "Kal",
  "Lum", "Lor", "Mar", "Nov", "Or", "Pol", "Quen", "Ri", "Sol", "Sy", "Tal", "Ter", "Ur", "Val", "Ver",
  "Vi", "Zé", "Ar", "Bré", "Cé", "Fé", "Ly", "Mé", "Né", "Pré", "Rhô", "Tri"];
const MILIEUX = ["a", "é", "i", "o", "ya", "ri", "li", "ne", "va", "ra", "to", "mi", "lo", "dé", "", ""];
const FINS = ["ris", "lia", "nov", "tis", "ga", "lys", "mo", "tec", "via", "sys", "dia", "nor", "bel",
  "rane", "lane", "vik", "mia", "ten", "zio", "ka", "line", "dor", "phane", "tura"];
const FORMES = ["SAS", "SAS", "SAS", "SARL", "SARL", "SA", "SCOP", "EURL"];
const FORMES_ASSO = ["Association", "Fédération", "Réseau", "Collectif"];
const OBJETS_ASSO = ["des communes rurales", "pour la transition locale", "des acteurs du vélo",
  "des élus de la montagne", "pour l'inclusion numérique", "des territoires solidaires",
  "des petites villes", "pour le sport pour tous", "des aidants", "des jardins partagés"];

/* Des villes réelles — un lieu ne nomme personne —, la France d'abord. */
const VILLES = [
  ["75011", "Paris", "France"], ["69003", "Lyon", "France"], ["13002", "Marseille", "France"],
  ["31000", "Toulouse", "France"], ["44000", "Nantes", "France"], ["33000", "Bordeaux", "France"],
  ["59000", "Lille", "France"], ["67000", "Strasbourg", "France"], ["35000", "Rennes", "France"],
  ["34000", "Montpellier", "France"], ["06000", "Nice", "France"], ["38000", "Grenoble", "France"],
  ["21000", "Dijon", "France"], ["49000", "Angers", "France"], ["37000", "Tours", "France"],
  ["63000", "Clermont-Ferrand", "France"], ["87000", "Limoges", "France"], ["25000", "Besançon", "France"],
  ["51100", "Reims", "France"], ["76000", "Rouen", "France"], ["14000", "Caen", "France"],
  ["29200", "Brest", "France"], ["64000", "Pau", "France"], ["86000", "Poitiers", "France"],
  ["57000", "Metz", "France"], ["54000", "Nancy", "France"], ["45000", "Orléans", "France"],
  ["80000", "Amiens", "France"], ["72000", "Le Mans", "France"], ["42000", "Saint-Étienne", "France"],
  ["92100", "Boulogne-Billancourt", "France"], ["93200", "Saint-Denis", "France"],
  ["94200", "Ivry-sur-Seine", "France"], ["78000", "Versailles", "France"], ["91300", "Massy", "France"],
  ["74000", "Annecy", "France"], ["17000", "La Rochelle", "France"], ["56100", "Lorient", "France"],
  ["1000", "Bruxelles", "Belgique"], ["4000", "Liège", "Belgique"], ["1003", "Lausanne", "Suisse"],
  ["1204", "Genève", "Suisse"], ["08001", "Barcelone", "Espagne"], ["1450", "Luxembourg", "Luxembourg"],
];
const VOIES = ["rue de la Gare", "avenue de la République", "rue des Artisans", "boulevard Pasteur",
  "rue du Moulin", "allée des Tilleuls", "rue de l'Industrie", "chemin des Vignes", "rue Victor-Hugo",
  "place du Marché", "rue des Écoles", "avenue Jean-Jaurès", "rue du Port", "quai des Chartrons"];

const PRENOMS = ["Camille", "Julien", "Sophie", "Karim", "Élodie", "Thomas", "Nadia", "Antoine", "Léa",
  "Mehdi", "Claire", "Hugo", "Inès", "Pierre", "Manon", "Yann", "Sarah", "Olivier", "Amina", "Lucas",
  "Hélène", "Bruno", "Fatou", "Nicolas", "Agathe", "Samuel", "Laure", "Rémi", "Chloé", "Damien"];
const NOMS_FAMILLE = ["Martin", "Bernard", "Dubois", "Moreau", "Laurent", "Garnier", "Fournier",
  "Girard", "Bonnet", "Lambert", "Rousseau", "Vincent", "Muller", "Lefèvre", "Faure", "André",
  "Mercier", "Blanc", "Guérin", "Boyer", "Chevalier", "Perrin", "Morin", "Mathieu", "Clément",
  "Gauthier", "Roussel", "Henry", "Barbier", "Arnaud"];

/* ---------- les espaces de l'organisateur ----------
   Noms de marque du SMCL (« Vis ta ville », « Atmosphère », « Léni »…)
   ramenés à ce que l'espace est. Un nom générique — « Accueil », « Vestiaire »
   — passe tel quel ; un nom que la liste ne connaît pas devient « Espace n ». */
const ZONES = {
  "Vis ta ville A table": ["Village Restauration", "Food village"],
  "Vis ta ville Adaptée": ["Village Accessibilité", "Accessibility village"],
  "Le Refuge": ["Espace Détente", "Chill-out area"],
  "VESTIAIRE": ["Vestiaire", "Cloakroom"],
  "VIS TON SPORT": ["Terrain de démonstration", "Demo court"],
  "ZONE ACCUEIL": ["Accueil", "Welcome desk"],
  "Accueil": ["Accueil", "Welcome desk"],
  "Réserve Accueil": ["Réserve", "Storage"],
  "Racks Presse": ["Présentoirs presse", "Press racks"],
  "ZONE ANNEXE": ["Zone annexe", "Annex"],
  "Salle des Evénements": ["Salle des événements", "Events hall"],
  "Vis ta ville En scène": ["Village Culture", "Culture village"],
  "Atmosphère Qualité de vie et longévité": ["Agora Bien vieillir", "Healthy ageing forum"],
  "Arène du Sport": ["Scène Sport", "Sports stage"],
  "LAB Inclusif & Solidaire": ["Atelier Solidarités", "Solidarity workshop"],
  "Vis ta ville Au coeur du parcours de soins": ["Village Santé", "Health village"],
  "Léni": ["Point info", "Info point"],
  "Atmosphère Foncier, sol et ressources": ["Agora Foncier & ressources", "Land & resources forum"],
  "Atmophère Prévention et gestion des risques": ["Agora Risques & prévention", "Risk prevention forum"],
  "Atmosphère Planification écologique et énergétique": ["Agora Transition énergétique", "Energy transition forum"],
  "LA SERRE": ["Jardin d'innovation", "Innovation garden"],
  "LAB": ["Atelier Démonstrations", "Demo workshop"],
  "Vis Ta Ville En mouvement": ["Village Mobilités", "Mobility village"],
  "Vis Ta Ville Au coeur de la vie locale": ["Village Vie locale", "Local life village"],
  "Vis Ta Ville Mairie Connectée": ["Village Mairie numérique", "Digital town hall village"],
  "Atmophère Mobilité et logistique": ["Agora Mobilité & logistique", "Mobility & logistics forum"],
  "ARENE de l'Audace": ["Grande Scène", "Main stage"],
};
/* Les espaces où l'on tient des conférences, et le thème de chacun : son
   programme puise d'abord dans les sujets de ce thème, la grande scène et la
   salle des événements dans tous. */
const SALLES = {
  "Agora Bien vieillir": "Santé, social & enfance",
  "Atelier Solidarités": "Santé, social & enfance",
  "Agora Foncier & ressources": "Construction & aménagement",
  "Agora Risques & prévention": "Sécurité & prévention",
  "Agora Transition énergétique": "Énergie & climat",
  "Agora Mobilité & logistique": "Transport & mobilité",
  "Scène Sport": "Culture, sport & loisirs",
  "Atelier Démonstrations": "Numérique & connectivité",
  "Grande Scène": null,
  "Salle des événements": null,
};

/* Les calques de fond qui ne font que recopier les noms des espaces — masqués
   au départ, mais qu'un visiteur peut rallumer : ils citeraient les marques de
   l'organisateur sous les noms neufs. */
const CALQUES_RETIRES = new Set(["INFOPRO_TEXTE_ZONES_ORGA", "INFOPRO_NOM_ZONE_IG"]);
/* Les textes de fond qui nomment quelqu'un : un programme de l'organisateur
   dans la délimitation des secteurs, l'exploitant d'un local dans le bâtiment. */
const TEXTES = {
  "SALON DES SPORTS &amp; PARASPORTS": "SPORTS &amp; PARASPORTS",
  "PARKOPOLIS": "STATIONNEMENT &amp; VOIRIE",
  "Vinci": "",
  "Locataire:": "",
};

/* ---------- le programme ---------- */
/* Mardi et mercredi, sous les deux formes que la source donne : l'heure locale
   du salon, et l'instant ISO (heure d'hiver à Paris). */
const JOURS = [["03/16/2027", "2027-03-16"], ["03/17/2027", "2027-03-17"]];
const CRENEAUX = [["10:00", "10:45"], ["11:30", "12:15"], ["14:00", "14:45"], ["15:30", "16:15"]];
const TYPES = [["Conférence", "#2563eb"], ["Table ronde", "#9333ea"], ["Atelier", "#059669"],
  ["Retour d'expérience", "#d97706"]];
/* Rangés par thème — celui d'une famille de la nomenclature, ce qui permet de
   confier la séance à un exposant du métier. */
const SUJETS = {
  "Énergie & climat": ["Réussir la rénovation énergétique des écoles",
    "Éclairage public : éteindre la nuit, retours de terrain",
    "Réseau de chaleur bois : le montage d'un projet communal",
    "Bornes de recharge : planifier le maillage du territoire",
    "Solaire sur les toits publics : du cadastre à la mise en service",
    "Piloter les consommations de cinquante bâtiments"],
  "Transport & mobilité": ["Le vélo dans les villes moyennes : par où commencer ?",
    "Transport à la demande en zone rurale",
    "Logistique du dernier kilomètre en centre-ville",
    "Zones à faibles émissions : accompagner plutôt que sanctionner",
    "Stationnement : moins de places, mieux partagées",
    "Électrifier la flotte communale"],
  "Santé, social & enfance": ["Restauration scolaire : 50 % de produits durables, mode d'emploi",
    "Accueillir les seniors : habitat, mobilité, lien social",
    "Déserts médicaux : ce qu'une commune peut vraiment faire",
    "Crèches : recruter quand personne ne postule",
    "Aidants : repérer, soutenir, relayer",
    "Le maintien à domicile vu par ceux qui le font"],
  "Sécurité & prévention": ["Gestion de crise : l'exercice qui a tout changé",
    "Vidéoprotection : cadre légal et bonnes pratiques",
    "Prévenir les inondations : l'apport des solutions fondées sur la nature",
    "Police municipale et gendarmerie : travailler ensemble",
    "Plan communal de sauvegarde : le tenir à jour"],
  "Construction & aménagement": ["Accessibilité des bâtiments publics : où en est-on ?",
    "Aires de jeux inclusives : concevoir pour tous les enfants",
    "Zéro artificialisation nette : densifier sans défigurer",
    "Friches : du terrain vague au quartier",
    "Construire en bois local"],
  "Culture, sport & loisirs": ["Sport pour tous : ouvrir les équipements aux associations",
    "Culture hors les murs : la bibliothèque qui se déplace",
    "Piscines : rénover ou reconstruire ?",
    "Le parasport dans les clubs de quartier",
    "Un festival à l'échelle d'un village"],
  "Numérique & connectivité": ["Cybersécurité : protéger une mairie de 5 000 habitants",
    "Données ouvertes : ce que la loi impose, ce qu'on peut en faire",
    "Inclusion numérique : former les habitants éloignés",
    "Démarches en ligne : le guichet qui ne ferme jamais",
    "Capteurs urbains : mesurer avant de décider"],
  "Environnement & cadre de vie": ["Îlots de fraîcheur : désimperméabiliser les cours d'école",
    "Biodiversité : un atlas communal en deux ans",
    "Réduire les déchets de la commune de 30 %"],
  "Développement & attractivité": ["Revitaliser un centre-bourg sans grand budget",
    "Tiers-lieux : faire vivre un lieu après l'inauguration",
    "Circuits courts : relier producteurs et cantines"],
  "Administration & gestion": ["Financer ses projets avec les fonds européens",
    "Mutualiser les achats entre communes",
    "Recruter et fidéliser les agents territoriaux"],
  "Communication & citoyenneté": ["Participation citoyenne : du budget participatif à la décision",
    "Signalétique : se repérer dans une ville qui change"],
};
const TOUS_SUJETS = Object.entries(SUJETS).flatMap(([theme, l]) => l.map((titre) => [titre, theme]));

/** Une enseigne inventée, dans le vocabulaire de sa famille. */
function enseigne(r, famille) {
  const marque = pioche(r, DEBUTS) + pioche(r, MILIEUX) + pioche(r, FINS);
  const mot = famille ? pioche(r, famille.mots) : "";
  const x = r();
  if (!mot || x < 0.35) return marque;
  if (x < 0.8) return marque + " " + mot;
  return mot + " " + marque;
}

const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Les logos dessinés par `logos-demo.js`, par nom de société ; rien s'il
 *  n'a pas encore tourné. */
function lisLogos() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, "logos-demo.json"), "utf8")); }
  catch (e) { return {}; }
}

/**
 * Le salon de démonstration, tiré du plan figé.
 * @param {{ evenement: string, plans: any[] }} source  le contenu de `outils/plans.json`
 */
function salonDemo(source) {
  /* Les libellés de la nomenclature : chaque code reçoit, dans l'ordre de sa
     famille, le sous-thème suivant — une famille plus fournie que sa liste en
     réemploie, ce qui ne fait que regrouper deux codes sous un libellé. */
  const codes = [...new Set(source.plans.flatMap((p) => p.stands.flatMap((s) => s.nomencl || [])))].sort();
  const libelle = new Map();
  const rang = {};
  const anglais = {};
  for (const c of codes) {
    const l = c.replace(/^[A-Z0-9]+_/, "")[0];
    const f = FAMILLES[l] || FAMILLES.K;
    const i = rang[l] = (rang[l] ?? -1) + 1;
    const [fr, en] = f.sous[i % f.sous.length];
    libelle.set(c, fr);
    anglais[fr] = en;
  }
  const familleDe = (s) => {
    const c = (s.nomencl || [])[0];
    return c ? FAMILLES[c.replace(/^[A-Z0-9]+_/, "")[0]] : null;
  };

  /* Un exposant réel → une société inventée. La clé est son nom réel : ses
     stands gardent un seul nom, et l'empreinte ne se remonte pas. */
  const pris = new Set();
  const societes = new Map();
  function societe(cle, famille) {
    if (societes.has(cle)) return societes.get(cle);
    const r = hasard("societe|" + cle);
    let nom = "";
    let asso = r() < 0.08;
    for (let essai = 0; !nom || pris.has(nom.toLowerCase()); essai++) {
      nom = asso
        ? pioche(r, FORMES_ASSO) + " " + pioche(r, OBJETS_ASSO)
        : enseigne(r, famille);
      if (essai > 4) asso = false;
    }
    pris.add(nom.toLowerCase());
    const [cp, ville, pays] = pioche(r, VILLES);
    const s = {
      nom,
      plan: asso ? nom.toUpperCase() : nom.toUpperCase() + " " + pioche(r, FORMES),
      site: "https://www." + slug(nom) + ".example",
      adr: (1 + Math.floor(r() * 120)) + " " + pioche(r, VOIES),
      cp, ville, pays,
      ...(pays === "France" ? { tel: "01 99 00 " + deux(r) + " " + deux(r) } : {}),
    };
    societes.set(cle, s);
    return s;
  }

  const familleStand = new Map();
  const plans = source.plans.map((p, i) => {
    const n = i + 1;
    const ids = new Map();
    const id = (ancien) => {
      if (!ids.has(ancien)) ids.set(ancien, "p" + i + "-" + empreinte("id|" + ancien));
      return ids.get(ancien);
    };

    const stands = p.stands.map((s) => {
      const o = {
        id: id(s.id), code: s.code, plan: null, nom: null, site: null, nomencl: null,
        m2: s.m2, angles: s.angles, niveaux: s.niveaux, etat: s.etat, d: s.d, c: s.c, bb: s.bb,
      };
      if (!s.nom && !s.plan) return o;
      const soc = societe(s.nom || s.plan, familleDe(s));
      /* Un emplacement libre garde parfois la seule raison sociale d'un
         ancien dossier : il la garde, inventée, et rien de plus. */
      if (!s.nom) return { ...o, plan: soc.plan };
      Object.assign(o, soc);
      if (familleDe(s)) familleStand.set(o.id, familleDe(s).nom);
      o.nomencl = s.nomencl ? [...new Set(s.nomencl.map((c) => libelle.get(c)))] : null;
      /* Quelques grands stands hébergent : de quoi montrer la fiche partagée
         et le choix entre enseignes. */
      const r = hasard("coex|" + s.id);
      if (s.m2 >= 36 && r() < 0.12) {
        o.coex = Array.from({ length: 1 + Math.floor(r() * 3) }, (_, k) => {
          const h = societe("coex|" + s.id + "|" + k, familleDe(s));
          return { ...h, nomencl: o.nomencl };
        });
      }
      return o;
    });

    let anonymes = 0;
    const zones = p.zones.map((z) => {
      const nom = z.nom == null ? null : (ZONES[z.nom] || ["Espace " + (++anonymes), "Area " + anonymes]);
      return { id: id(z.id), nom: nom && nom[0], ...(nom ? { nom_en: nom[1] } : {}),
        m2: z.m2, d: z.d, c: z.c, bb: z.bb };
    });

    const fond = p.fond.filter((f) => !CALQUES_RETIRES.has(f.cle)).map((f) => ({
      ...f,
      svg: f.svg.replace(/(<text[^>]*>)([^<]*)(<\/text>)/g,
        (tout, a, t, b) => (t in TEXTES ? (TEXTES[t] ? a + TEXTES[t] + b : "") : tout)),
    }));

    return {
      id: "demo-pavillon-" + n, libelle: p.libelle, hall: "DEMO_H" + n,
      emprise: p.emprise, fond, stands, zones, conferences: [],
    };
  });

  /* Le programme : chaque salle reçoit des créneaux sur deux jours, sur son
     thème d'abord, et chaque séance est tenue par un exposant du même
     pavillon et du même métier — la fiche de l'un mène à l'autre. Aucun
     titre ne sert deux fois tant qu'il en reste. */
  let numero = 0;
  const dits = new Set();
  const villesFr = VILLES.filter((v) => v[2] === "France").map((v) => v[1]);
  plans.forEach((p) => {
    const occupes = p.stands.filter((s) => s.nom);
    p.zones.filter((z) => z.nom in SALLES).forEach((z) => {
      const theme = SALLES[z.nom];
      const r = hasard("salle|" + z.id);
      const ordre = [...TOUS_SUJETS].sort(() => r() - 0.5)
        .sort((x, y) => (y[1] === theme) - (x[1] === theme));
      JOURS.forEach(([jour, iso]) => CRENEAUX.forEach(([de, a]) => {
        if (r() < 0.25) return;   // un programme sans trou n'a pas l'air vrai
        const [titre, sujet] = ordre.find((x) => !dits.has(x[0])) || pioche(r, ordre);
        dits.add(titre);
        numero++;
        const [type, couleur] = pioche(r, TYPES);
        const metier = occupes.filter((s) => familleStand.get(s.id) === sujet);
        const hote = pioche(r, metier.length ? metier : occupes);
        const gens = Array.from({ length: type === "Table ronde" ? 3 : 1 + Math.floor(r() * 2) }, (_, k) => {
          const ville = pioche(r, villesFr);
          return {
            nom: pioche(r, PRENOMS) + " " + pioche(r, NOMS_FAMILLE),
            societe: k === 0 ? hote.nom : "Ville " + (/^Le /.test(ville) ? ville.replace(/^Le /, "du ")
              : /^[AEIOUÉÈ]/.test(ville) ? "d'" + ville : "de " + ville),
          };
        });
        p.conferences.push({
          id: "demo-conf-" + numero, nom: titre,
          texte: "Élus, agents et entreprises partagent ce qui a marché, ce qui a coincé, " +
            "et ce qu'ils referaient autrement. Questions de la salle en fin de séance.",
          debut: iso + "T" + de + ":00+01:00", fin: iso + "T" + a + ":00+01:00",
          debutLocal: jour + " " + de, finLocal: jour + " " + a,
          salle: z.nom, type, couleur, theme: sujet, zone: z.id,
          exposants: [{ stand: hote.id, nom: hote.nom }],
          intervenants: gens,
        });
      }));
    });
  });

  /* Les logos, dessinés une fois pour toutes (`logos-demo.js`) et embarqués
     comme le seraient des vignettes reçues par lot : la page n'a pas d'API à
     qui les demander (`modules/vignettes.mjs` `vignettesLisibles`). Une
     société qui n'en a pas — le fichier n'a pas suivi un changement de
     noms — garde son nom seul ; l'essai le signale. */
  const vignettes = {};
  const logos = lisLogos();
  const pose = (soc) => {
    const b64 = soc && soc.nom && logos[soc.nom];
    if (!b64) return;
    const cle = empreinte("logo|" + soc.nom, 16);
    soc.vignette = cle;
    vignettes[cle] = "data:image/webp;base64," + b64;
  };
  plans.forEach((p) => p.stands.forEach((s) => { pose(s); (s.coex || []).forEach(pose); }));

  /* Les réglages que l'exploitant aurait publiés : les logos sur le toit des
     stands, ce qu'une démonstration doit montrer d'emblée. Recopiés dans
     chaque pavillon, comme le fait la publication. */
  const apparence = { reglages: { _ambiance: { cle: "classique", logos: true } } };
  plans.forEach((p) => { p.apparence = apparence; });

  return { evenement: "Salon Démo 2027", fuseau: "Europe/Paris", anglais, vignettes, plans };
}

module.exports = { salonDemo };
