/**
 * Le salon de démonstration — le plan d'un vrai salon, des exposants inventés.
 *
 * La source est un salon réel tel que l'API publique le sert à un visiteur
 * (`outils/source-demo.json`, FEP27 : `npm run source-demo`). On en garde ce
 * qui fait un plan crédible et ne nomme personne — la géométrie des stands et
 * des zones, les dessins posés à la main, l'apparence réglée par l'exploitant,
 * les champs propres au salon — et on remplace le reste :
 *
 *   - tous les emplacements sont occupés : un stand libre, en option ou en
 *     contact reçoit lui aussi un exposant, un numéro et un logo — un plan de
 *     démonstration à moitié vide montrerait surtout des trous ;
 *   - six secteurs inventés remplacent ceux de la source, chacun posé sur une
 *     zone d'un seul tenant du plan (`zonesImplantation`), avec sa
 *     nomenclature et sa couleur ;
 *   - chaque exposant reçoit un nom tiré de son secteur, une raison sociale,
 *     une ville, un site en `.example` (domaine réservé, qui ne mène chez
 *     personne) et un numéro dans la plage que l'ARCEP réserve à la fiction
 *     (01 99 00 xx xx) ; ses réseaux sociaux ne sont pas inventés — un faux
 *     compte sur un vrai réseau pourrait être celui de quelqu'un ;
 *   - chacun présente un catalogue de produits, et les espaces de conférence
 *     portent un programme inventé — titres et intervenants — sur les deux
 *     jours du salon, les 2 et 3 juin 2027 ;
 *   - ce que l'apparence et les zones citaient — sponsor, libellé posé à la
 *     main, fiche d'un restaurant, mention d'une fédération — est remplacé ;
 *   - le « Food Court » devient une zone de foodtrucks, et ses camions portent
 *     le logo d'enseignes inventées (`FOODTRUCKS`).
 *
 * Les identifiants des stands, des zones et des dessins restent ceux de la
 * source : ce sont des empreintes, et l'apparence comme les dessins les
 * désignent. Celui du pavillon, un identifiant Klipso, est refait.
 *
 * Tout est tiré d'un hasard à graine fixe : deux constructions donnent le même
 * salon, octet pour octet — sans quoi la version du service de second plan
 * changerait à chaque construction (`genere.js` `FABRIQUEES`).
 *
 * Appelé par `genere.js` (`web/demo.html`) et par `salon-demo.js` (la base) ;
 * `outils/essais/demo.js` vérifie qu'aucun nom réel n'y survit.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

/* Changer le sel redistribue tous les noms — et rend les logos à refaire
   (`npm run logos-demo`). */
const SEL = "demo-2027";

/* Où sont servies les images des produits. Elles sont posées dans `web/` à la
   construction (`imagesProduits`), mais la fiche n'accepte qu'une adresse
   complète (`sur.mjs` `adresseImage`) : c'est donc celle de la production. */
const ORIGINE = "https://plan-interactif.interactiveplan.workers.dev";
const DOSSIER_PRODUITS = "demo-produits";

/* Les enseignes des foodtrucks : inventées, comme les exposants, et dessinées
   par `logos-demo.js` avec eux. Leurs camions se garent dans les zones dites
   ici, chacun avec son logo sur sa devanture (`decor.mjs` `enseignesCamions`).
   L'ordre compte : c'est celui où les camions reçoivent leur enseigne. */
const FOODTRUCKS = ["Le Camion Gourmand", "Tacos Nomades", "Pizza Vagabonde", "Burger Ambulant",
  "Crêpes en Route", "Wok Itinérant"];
const ZONES_FOODTRUCKS = new Set(["Food Court"]);

/** La largeur sur la hauteur d'un logo WebP, lue dans son en-tête ; un carré
 *  si le format n'est pas celui qu'on attend. */
function rapportWebp(b64) {
  const o = Buffer.from(b64.slice(0, 64), "base64");
  if (o.toString("latin1", 0, 4) !== "RIFF" || o.toString("latin1", 8, 12) !== "WEBP") return 1;
  const sorte = o.toString("latin1", 12, 16);
  let l = 0, h = 0;
  if (sorte === "VP8X") { l = 1 + o.readUIntLE(24, 3); h = 1 + o.readUIntLE(27, 3); }
  else if (sorte === "VP8L") { const b = o.readUInt32LE(21); l = 1 + (b & 0x3fff); h = 1 + ((b >> 14) & 0x3fff); }
  else if (sorte === "VP8 ") { l = o.readUInt16LE(26) & 0x3fff; h = o.readUInt16LE(28) & 0x3fff; }
  return l > 0 && h > 0 ? +(l / h).toFixed(3) : 1;
}

/** Les logos des foodtrucks, dans l'ordre de `FOODTRUCKS`, prêts pour le
 *  réglage d'un camion ; ceux que `logos-demo.js` n'a pas encore dessinés manquent. */
function logosFoodtrucks(logos) {
  return FOODTRUCKS.filter((nom) => logos[nom])
    .map((nom) => ({ nom, logo: "data:image/webp;base64," + logos[nom], lr: rapportWebp(logos[nom]) }));
}

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
const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const clone = (o) => JSON.parse(JSON.stringify(o));

/* ---------- les secteurs ----------
   Six secteurs inventés, et non ceux de la source : la nomenclature d'un vrai
   salon le reconnaît aussi sûrement que ses exposants. Chacun porte le
   vocabulaire de ses enseignes, ses sous-catégories (la nomenclature), sa
   couleur sur le plan, ses couleurs d'image et son catalogue : un « Burger
   Snack » ne vend pas de l'assurance. */
const SECTEURS = {
  "Restauration": { en: "Food service", couleur: "#f6a96b", c: ["#dc2626", "#fdba74"],
    mots: ["Burger", "Tacos", "Poké", "Pizza", "Bistrot", "Brasserie", "Comptoir"],
    sous: { "Restauration rapide": "Fast food", "Restauration à table": "Sit-down dining",
      "Café et boulangerie": "Café and bakery" },
    produits: ["Restaurant en centre commercial", "Format drive", "Cuisine de livraison", "Food truck",
      "Brasserie de 120 couverts"] },
  "Alimentation": { en: "Food retail", couleur: "#8fd694", c: ["#15803d", "#bbf7d0"],
    mots: ["Épicerie", "Gourmet", "Market", "Primeur", "Bio", "Cave"],
    sous: { "Épicerie fine": "Delicatessen", "Magasin bio": "Organic store", "Cave et spiritueux": "Wine and spirits" },
    produits: ["Boutique de quartier", "Supérette de proximité", "Coffrets gourmands", "Épicerie vrac",
      "Atelier dégustation"] },
  "Mode et beauté": { en: "Fashion and beauty", couleur: "#f3a6c8", c: ["#be185d", "#fbcfe8"],
    mots: ["Mode", "Style", "Shoes", "Optic", "Beauty", "Spa"],
    sous: { "Prêt-à-porter": "Ready-to-wear", "Cosmétique": "Cosmetics", "Optique": "Eyewear" },
    produits: ["Boutique de centre-ville", "Corner en grand magasin", "Institut de beauté", "Collection capsule",
      "Boutique éphémère"] },
  "Habitat et immobilier": { en: "Home and real estate", couleur: "#8fb8f2", c: ["#0f766e", "#99f6e4"],
    mots: ["Habitat", "Rénov", "Maison", "Déco", "Immo", "Cuisines"],
    sous: { "Rénovation": "Renovation", "Cuisine et bain": "Kitchen and bath", "Agence immobilière": "Real estate agency" },
    produits: ["Agence rénovation clé en main", "Showroom cuisine", "Pack isolation", "Agence immobilière",
      "Gestion locative"] },
  "Services à la personne": { en: "Personal services", couleur: "#b9a3f5", c: ["#4338ca", "#c7d2fe"],
    mots: ["Services", "Domicile", "Coiffure", "Pressing", "Fit", "Kids"],
    sous: { "Aide à domicile": "Home help", "Sport et bien-être": "Sport and wellness",
      "Garde d'enfants": "Childcare" },
    produits: ["Agence de services à domicile", "Salon de coiffure", "Studio de remise en forme",
      "Pressing écologique", "Micro-crèche"] },
  "Conseil et financement": { en: "Advice and finance", couleur: "#f2d16b", c: ["#334155", "#cbd5e1"],
    mots: ["Conseil", "Finance", "Assurances", "Partners", "Capital", "Expertise"],
    sous: { "Expertise de la franchise": "Franchise expertise", "Banque et assurance": "Banking and insurance",
      "Services aux entreprises": "Business services" },
    produits: ["Audit de réseau", "Rédaction du DIP", "Prêt création franchise", "Assurance multirisque commerce",
      "Centre d'affaires"] },
};
/* Celui des conférenciers et des animateurs du programme. */
const SECTEUR_EXPERTS = "Conseil et financement";

/**
 * Les zones d'implantation : les stands découpés en autant de parts que de
 * secteurs, d'un seul tenant chacune, comme un organisateur range un secteur
 * dans un coin du hall plutôt que de le semer partout.
 *
 * Chaque coupe partage les secteurs en deux moitiés et passe par la plus
 * large allée qui laisse à chaque côté, à peu près, la part de stands de ses
 * secteurs — d'abord entre les halls, puis le long des allées : des zones
 * d'un seul tenant, et de tailles voisines. Un pur calcul sur les centres : la même source donne les mêmes zones.
 * @param {any[]} stands
 * @param {number} k  le nombre de zones
 * @returns {Map<string, number>} le rang de la zone de chaque stand
 */
function zonesImplantation(stands, k) {
  const zone = new Map();
  let suivante = 0;
  (function coupe(liste, k) {
    if (k <= 1 || liste.length < 2) {
      const z = suivante++;
      liste.forEach((s) => zone.set(s.id, z));
      return;
    }
    let mieux = null;
    for (const kg of new Set([Math.floor(k / 2), Math.ceil(k / 2)])) {
      // la coupe tombe près de la part qui revient au premier côté
      const vise = liste.length * kg / k, marge = liste.length * 0.12;
      for (const axe of [0, 1]) {
        const tries = [...liste].sort((a, b) => a.c[axe] - b.c[axe] || (a.id < b.id ? -1 : 1));
        const de = Math.max(1, Math.ceil(vise - marge)), a = Math.min(tries.length - 1, Math.floor(vise + marge));
        for (let i = de; i <= a; i++) {
          const ecart = tries[i].c[axe] - tries[i - 1].c[axe];
          if (!mieux || ecart > mieux.ecart) mieux = { ecart, tries, i, kg };
        }
      }
    }
    const { tries, i, kg } = mieux;
    coupe(tries.slice(0, i), kg);
    coupe(tries.slice(i), k - kg);
  })(stands, k);
  return zone;
}

/* ---------- les noms ---------- */
const DEBUTS = ["Al", "Bel", "Cal", "Cor", "Dal", "Del", "Ev", "Fal", "Gal", "Hel", "Is", "Jun", "Kal",
  "Lum", "Lor", "Mar", "Nov", "Or", "Pol", "Quen", "Ri", "Sol", "Sy", "Tal", "Ter", "Ur", "Val", "Ver",
  "Vi", "Zé", "Ar", "Bré", "Cé", "Fé", "Ly", "Mé", "Né", "Pré", "Rhô", "Tri", "Ko", "Mo", "Pa", "Ti"];
const MILIEUX = ["a", "é", "i", "o", "ya", "ri", "li", "ne", "va", "ra", "to", "mi", "lo", "dé", "", ""];
const FINS = ["ris", "lia", "nov", "tis", "ga", "lys", "mo", "tec", "via", "sys", "dia", "nor", "bel",
  "rane", "lane", "vik", "mia", "ten", "zio", "ka", "line", "dor", "phane", "tura", "lo", "zen"];
const FORMES = ["SAS", "SAS", "SAS", "SARL", "SARL", "SA", "EURL"];

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
  ["78000", "Versailles", "France"], ["74000", "Annecy", "France"], ["17000", "La Rochelle", "France"],
  ["1000", "Bruxelles", "Belgique"], ["1003", "Lausanne", "Suisse"], ["08001", "Barcelone", "Espagne"],
  ["1450", "Luxembourg", "Luxembourg"], ["H2X 1Y4", "Montréal", "Canada"],
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

/* ---------- le programme ----------
   Le salon de démonstration se tient les 2 et 3 juin 2027 : ses dates
   remplacent celles de la source, et le programme s'y pose. Rien n'y est
   repris du programme réel — ni titre, ni intervenant : chaque titre est
   composé d'un sujet et d'un angle tirés au hasard, chaque intervenant d'un
   prénom, d'un nom et d'une société inventés. Les espaces « Pitch »
   présentent un exposant chacun. */
const HORAIRES = {
  debut: "2027-06-02", fin: "2027-06-03",
  jours: { "20270602": { ouverture: "09:00", fermeture: "18:30" },
    "20270603": { ouverture: "09:00", fermeture: "18:00" } },
};
const CRENEAUX = ["09:30", "10:30", "11:30", "12:30", "14:00", "15:00", "16:00", "17:00"];
const DUREES = [30, 45, 45, 60];
const TYPES = [["Conférence", "#2563eb"], ["Table ronde", "#9333ea"], ["Atelier", "#059669"],
  ["Témoignage", "#d97706"]];
const SUJETS = ["Le financement de départ", "L'apport personnel", "Le choix de l'emplacement",
  "La reconversion professionnelle", "Le contrat de réseau", "Le premier bilan", "Le recrutement",
  "La fidélisation des équipes", "Le point de vente connecté", "Le développement à l'étranger",
  "Le commerce de proximité", "La formation des nouveaux venus", "La reprise d'un commerce",
  "L'ouverture en centre commercial", "Le bail commercial", "La relation avec la tête de réseau",
  "L'entrepreneuriat à deux", "La transition écologique du magasin", "La gestion de trésorerie",
  "Le marketing local", "L'ouverture d'un second point de vente", "Les aides à la création",
  "Le prêt bancaire", "La création en zone rurale", "Les concepts de petite surface",
  "L'animation commerciale", "La sortie du réseau", "Les données clients"];
const ANGLES = ["mode d'emploi", "les pièges à éviter", "cinq questions à se poser",
  "retours d'expérience", "idées reçues et réalités", "par où commencer ?", "la méthode pas à pas",
  "regards croisés", "ce qui change en 2027", "les bons réflexes", "ce que les chiffres disent",
  "témoignages de terrain", "comment s'y préparer"];
const TEXTES = [
  "Des entrepreneurs et des experts partagent ce qui a marché, ce qui a coincé, et ce " +
    "qu'ils referaient autrement. Questions de la salle en fin de séance.",
  "Une heure pour faire le tour du sujet, exemples chiffrés à l'appui, et repartir avec " +
    "une liste des points à vérifier.",
  "Un échange concret entre porteurs de projet et professionnels du secteur, suivi d'un " +
    "temps de questions.",
  "Les intervenants reviennent sur leur parcours et détaillent les étapes, les délais et " +
    "les coûts qu'ils n'avaient pas anticipés.",
];

/** Une enseigne inventée, dans le vocabulaire de son secteur. */
function enseigne(r, mots) {
  const marque = pioche(r, DEBUTS) + pioche(r, MILIEUX) + pioche(r, FINS);
  const x = r();
  if (!mots || x < 0.4) return marque;
  if (x < 0.8) return marque + " " + pioche(r, mots);
  return pioche(r, mots) + " " + marque;
}

/**
 * Le salon de démonstration, tiré de la source.
 * @param {any} source  le contenu de `outils/source-demo.json`
 * @param {{ logos?: Record<string, string> }} [o]  les logos par nom de société
 *   (`logos-demo.json` à défaut) — `logos-demo.js` passe `{}`, il les dessine
 */
function salonDemo(source, o) {
  const logos = (o && o.logos) || lisLogos();
  const src = clone(source);

  /* Le secteur de chaque stand : celui de sa zone d'implantation, quel que
     soit celui de la source. */
  const secteurs = Object.keys(SECTEURS);
  const secteurDe = new Map();
  src.plans.forEach((p) => zonesImplantation(p.stands, secteurs.length)
    .forEach((z, id) => secteurDe.set(id, secteurs[z])));

  const pris = new Set();
  const societes = new Map();
  const vignettes = {};
  let sansLogo = 0;
  /** Une société inventée — une seule par exposant réel, sous sa clé. */
  function societe(cle, sect) {
    if (societes.has(cle)) return clone(societes.get(cle));
    const r = hasard("societe|" + cle);
    const def = SECTEURS[sect] || {};
    let nom = "";
    for (let i = 0; !nom || pris.has(nom.toLowerCase()); i++) nom = enseigne(r, def.mots);
    pris.add(nom.toLowerCase());
    const [cp, ville, pays] = pioche(r, VILLES);
    const s = {
      nom, plan: nom.toUpperCase() + " " + pioche(r, FORMES),
      site: "https://www." + slug(nom) + ".example",
      adr: (1 + Math.floor(r() * 120)) + " " + pioche(r, VOIES), cp, ville, pays,
      ...(pays === "France" ? { tel: "01 99 00 " + deux(r) + " " + deux(r) } : {}),
    };
    /* Le catalogue : de deux à cinq offres du secteur, dans un ordre à elle.
       L'image est celle de l'offre, servie par le site. */
    const offres = (def.produits || []).map((n, i) => [n, i]).sort(() => r() - 0.5);
    s.produits = offres.slice(0, 2 + Math.floor(r() * Math.min(4, offres.length - 1))).map(([n, i]) => ({
      id: "p" + empreinte("produit|" + nom + "|" + i, 10), nom: n,
      texte: "<p>" + n + ", chez " + nom + " : le concept, l'accompagnement à " +
        "l'ouverture et les conditions d'entrée dans le réseau.</p>",
      image: ORIGINE + "/" + DOSSIER_PRODUITS + "/" + slug(sect) + "-" + i + ".svg",
      grande: null, doc: null, video: null, themes: [sect],
    }));
    if (logos[nom]) {
      const k = empreinte("logo|" + nom, 16);
      s.vignette = k;
      vignettes[k] = "data:image/webp;base64," + logos[nom];
    } else sansLogo++;
    societes.set(cle, s);
    return clone(s);
  }

  /* Les codes des stands que la source ne numérote pas : un numéro « D »
     (démonstration), dans l'ordre du plan. */
  let numero = 0;
  const stands = (p) => p.stands.map((s) => {
    const r = hasard("stand|" + s.id);
    const sect = secteurDe.get(s.id);
    const reel = s.nom || s.plan || ("libre|" + s.id);
    const soc = societe(s.nom ? reel : "libre|" + s.id, sect);
    const o = {
      id: s.id, code: s.code || "D" + String(++numero).padStart(2, "0"),
      ...soc, sect, nomencl: [sect, pioche(r, Object.keys(SECTEURS[sect].sous))],
      m2: s.m2, angles: s.angles, niveaux: s.niveaux, etat: "Affecte",
      d: s.d, c: s.c, bb: s.bb,
      ...(s.hall ? { hall: s.hall } : {}),
      ...(s.lb != null ? { lb: s.lb, lc: s.lc } : {}),
      // les marques de la fiche : celles de la source, ou tirées pour un stand peuplé
      ...((s.nom ? s.neuf : r() < 0.1) ? { neuf: true } : {}),
      ...((s.nom ? s.adh : r() < 0.4) ? { adh: true } : {}),
    };
    /* Les champs propres au salon gardent leurs réponses — « Oui », « Non » —,
       sauf celui que l'exploitant a créé pour essayer. */
    const perso = { ...(s.perso || {}) };
    delete perso.test;
    if (!s.nom) {
      perso["parcours-de-visite-2"] = r() < 0.3 ? "Oui" : "Non";
      perso.reprise = r() < 0.2 ? "Oui" : "Non";
    }
    if (Object.keys(perso).length) o.perso = perso;
    if (s.coex && s.coex.length) {
      o.coex = s.coex.map((c, k) => {
        const h = societe("coex|" + (c.nom || s.id + k), sect);
        return { ...h, nomencl: o.nomencl, ...(c.adh ? { adh: true } : {}) };
      });
    }
    return o;
  });

  /* Les zones gardent leur nom — « Agora », « Pitch », « Club business » ne
     nomment personne. Leurs fiches non : un restaurant qui s'y présentait
     sous son enseigne, un « test » oublié. */
  const FICHES_ZONES = {
    restauration: "<p>Restauration rapide et boissons, de 9 h à 18 h chaque jour du salon.</p>",
    accueil: "<p>Badges, plan papier et informations pratiques.</p>",
  };
  const zones = (p) => p.zones.map((z) => {
    const o = { ...z };
    delete o.lien; delete o.logo;
    if (ZONES_FOODTRUCKS.has(o.nom)) o.type = "foodtruck";
    if (o.description) o.description = FICHES_ZONES[o.type] || "";
    if (!o.description) delete o.description;
    return o;
  });

  /* L'apparence de l'exploitant, débarrassée de ce qui nommait quelqu'un ou
     ne désigne plus rien : les calques Klipso, dont la démonstration n'a pas
     le dessin. */
  const ID_PLAN = (p) => "d" + empreinte("plan|" + p.id, 7) + "-0000-5000-a000-" + empreinte("plan2|" + p.id, 12);
  const CLE_NUMEROS = "Numérotation des stands";
  function apparence(p, idPlan, parId) {
    const a = clone(p.apparence || { pile: [], reglages: {} });
    const klipso = new Set(p.fond.map((c) => c.cle));
    const reglages = {};
    for (const [k, v] of Object.entries(a.reglages || {})) {
      const tete = k.split("/")[0];
      if (klipso.has(tete)) continue;
      if (k.startsWith("_calage:")) { reglages["_calage:" + idPlan] = v; continue; }
      if (k.startsWith("secteur:")) continue;
      if (k.startsWith("_lab:") && v && typeof v.e === "string") {
        // un libellé posé à la main recopie le nom de ce qu'il désigne
        const cible = parId.get(k.slice(5));
        reglages[k] = { ...v, e: v.e.replace(/^[^|]*/, () => (cible && cible.nom) || "") };
        continue;
      }
      reglages[k] = v;
    }
    if (reglages._sponsor) {
      reglages._sponsor = { ...reglages._sponsor, nom: "Banque Démo",
        lien: "www.banque-demo.example", logo: "" };
    }
    if (reglages._adherent) reglages._adherent = { ...reglages._adherent, texte: "Membre du réseau" };
    if (reglages._suggestion) {
      /* Les exposants désignés, rangés sous le secteur qu'ils ont reçu : trois
         au plus pour le classement, un seul quand l'organisateur choisit. */
      const auto = {}, fixes = {};
      Object.values(reglages._suggestion.auto || {}).flat().forEach((id) => {
        const sect = secteurDe.get(id);
        if (sect && (auto[sect] = auto[sect] || []).length < 3) auto[sect].push(id);
      });
      Object.values(reglages._suggestion.fixes || {}).forEach((id) => {
        const sect = secteurDe.get(id);
        if (sect && !fixes[sect]) fixes[sect] = id;
      });
      reglages._suggestion = { ...reglages._suggestion, auto, fixes };
    }
    for (const [nom, def] of Object.entries(SECTEURS)) reglages["secteur:" + nom] = { couleur: def.couleur };
    reglages[CLE_NUMEROS] = { visible: false };
    reglages._ambiance = { ...(reglages._ambiance || {}), logos: true };
    /* Un camion par zone de foodtrucks, au milieu, couché sur son long côté,
       avec l'enseigne suivante : la zone du plan n'en tient pas davantage. */
    const enseignes = logosFoodtrucks(logos);
    const garees = [...parId.values()].filter((z) => z.type === "foodtruck" && z.bb);
    if (enseignes.length && garees.length) {
      reglages._foodtrucks = { ...(reglages._foodtrucks || {}) };
      garees.forEach((z, i) => {
        const e = enseignes[i % enseignes.length];
        reglages._foodtrucks[z.id] = [{ u: 0.5, v: 0.5, a: z.bb[0] >= z.bb[1] ? 0 : 90, logo: e.logo, lr: e.lr }];
      });
    }
    // la pile : les calques Klipso cèdent leur place à la numérotation
    const pile = [];
    for (const e of a.pile || []) {
      if (e.startsWith("fond:")) { if (!pile.includes("fond:" + CLE_NUMEROS)) pile.push("fond:" + CLE_NUMEROS); continue; }
      if (e.startsWith("dessin:") && !p.dessins.some((d) => "dessin:" + d.id === e && !RETIRES.has(d.nom))) continue;
      pile.push(e);
    }
    return { pile, reglages };
  }

  /* Les dessins : on les garde, sauf l'essai qu'on avait oublié, et le calque
     qui nommait une enseigne réelle prend un nom générique. */
  const RETIRES = new Set(["test secteur"]);
  const dessins = (p) => (p.dessins || []).filter((d) => !RETIRES.has(d.nom)).map((d) => ({
    ...d, nom: /^Coex /.test(d.nom) ? "Stands partagés" : d.nom,
  }));

  /* La numérotation des stands, comme le calque que Klipso en fait : un fond
     à montrer ou à cacher, et la base veut au moins un calque par pavillon. */
  const numeros = (st) => '<g id="numeros" data-s="rgb(0,0,0)" data-f="none">' + st.map((s) =>
    '<text x="' + s.c[0] + '" y="' + s.c[1] + '" font-size="0.6" text-anchor="middle">' +
      s.code.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</text>").join("") + "</g>";

  const plans = src.plans.map((p) => {
    const idPlan = ID_PLAN(p);
    const st = stands(p);
    const zs = zones(p);
    const parId = new Map([...st, ...zs].map((x) => [x.id, x]));
    return {
      id: idPlan, libelle: "Plan du salon", hall: null,
      emprise: p.emprise, calage: p.calage || null,
      fond: [{ id: empreinte("calque|" + idPlan, 8), cle: CLE_NUMEROS, nom: CLE_NUMEROS, ordre: 1,
        visible: false, svg: numeros(st) }],
      stands: st, zones: zs, ...(p.zonesCachees ? { zonesCachees: p.zonesCachees } : {}),
      conferences: [], apparence: apparence(p, idPlan, parId), dessins: dessins(p),
    };
  });

  /* Le programme, sur les jours de `HORAIRES`. L'heure se dit dans le fuseau
     du salon, à l'heure d'été comme d'hiver. */
  const fuseau = src.fuseau || "Europe/Paris";
  const JOURS = Object.keys(HORAIRES.jours).sort().map((j) => ({
    iso: j.slice(0, 4) + "-" + j.slice(4, 6) + "-" + j.slice(6, 8),
    local: j.slice(4, 6) + "/" + j.slice(6, 8) + "/" + j.slice(0, 4),
    fin: HORAIRES.jours[j].fermeture,
  }));
  const decalage = (iso) => {
    const nom = new Intl.DateTimeFormat("en-US", { timeZone: fuseau, timeZoneName: "longOffset" })
      .formatToParts(new Date(iso + "T12:00:00Z")).find((x) => x.type === "timeZoneName").value;
    return nom.replace("GMT", "") || "+00:00";
  };
  const instant = (iso, hm) => iso + "T" + hm + ":00" + decalage(iso);
  const plus = (hm, min) => {
    const t = +hm.slice(0, 2) * 60 + +hm.slice(3) + min;
    return String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
  };
  /* Des conférenciers inventés : un nom tiré une fois pour toutes par
     personne, pour qu'un même expert revienne sous le même nom d'une séance
     à l'autre, et quelques cabinets qui n'exposent pas. */
  const rp = hasard("conferenciers");
  const CABINETS = Array.from({ length: 8 }, () => pioche(rp, ["Cabinet ", "Atelier ", "Groupe ", ""]) +
    enseigne(rp, ["Conseil", "Avocats", "Expertise", "Partenaires"]));
  const gens = new Map();
  const personne = (r, societe) => {
    if (!gens.has(societe)) gens.set(societe, []);
    const deja = gens.get(societe);
    if (deja.length && r() < 0.6) return { nom: pioche(r, deja), societe };
    const nom = pioche(r, PRENOMS) + " " + pioche(r, NOMS_FAMILLE);
    deja.push(nom);
    return { nom, societe };
  };
  let n = 0;
  const dits = new Set();
  plans.forEach((p) => {
    p.apparence.reglages._horaires = clone(HORAIRES);
    const occupes = p.stands;
    const experts = occupes.filter((s) => s.sect === SECTEUR_EXPERTS);
    const salles = p.zones.filter((z) => z.nom && (z.type === "conferences" ||
      /^(Plateau TV|Place des experts)$/.test(z.nom)));
    salles.forEach((z) => {
      const r = hasard("salle|" + z.id);
      const pitch = /^Pitch/.test(z.nom);
      JOURS.forEach((j) => {
        let libre = "00:00";
        CRENEAUX.forEach((de) => {
          if (de < libre || de >= j.fin || r() < (pitch ? 0.25 : 0.35)) return;
          const duree = pitch ? 20 : pioche(r, DUREES);
          const fin = plus(de, duree);
          if (fin > j.fin) return;
          libre = fin;
          n++;
          const hote = pioche(r, pitch ? occupes : (experts.length && r() < 0.4 ? experts : occupes));
          let titre;
          if (pitch) titre = hote.nom + " : " + pioche(r, ["le concept en vingt minutes",
            "un réseau qui recrute", "rencontre avec le fondateur", "le modèle en chiffres"]);
          else {
            const sujet = r() < 0.2 ? hote.sect : pioche(r, SUJETS);
            titre = sujet + " : " + pioche(r, ANGLES);
            for (let essai = 0; dits.has(titre) && essai < 20; essai++)
              titre = pioche(r, SUJETS) + " : " + pioche(r, ANGLES);
          }
          dits.add(titre);
          const [type, couleur] = pitch ? ["Pitch", "#e11d48"] : pioche(r, TYPES);
          const exterieur = () => pioche(r, CABINETS);
          const intervenants = [personne(r, hote.nom)];
          if (!pitch && type === "Table ronde") {
            intervenants.push(personne(r, pioche(r, occupes).nom),
              personne(r, r() < 0.5 ? exterieur() : pioche(r, occupes).nom));
          } else if (!pitch && r() < 0.3) intervenants.push(personne(r, exterieur()));
          const animateurs = !pitch && r() < 0.5
            ? [personne(r, experts.length && r() < 0.6 ? pioche(r, experts).nom : exterieur())] : [];
          p.conferences.push({
            id: "demo-conf-" + n, nom: titre,
            texte: pitch ? "Le dirigeant de " + hote.nom + " présente son concept, son modèle " +
              "économique et le profil des candidats recherchés." : pioche(r, TEXTES),
            debut: instant(j.iso, de), fin: instant(j.iso, fin),
            debutLocal: j.local + " " + de, finLocal: j.local + " " + fin,
            salle: z.nom, type, couleur, theme: hote.sect, zone: z.id,
            exposants: [{ stand: hote.id, nom: hote.nom }],
            intervenants, ...(animateurs.length ? { animateurs } : {}),
          });
        });
      });
    });
  });

  /* La fiche : celle de la source, sans le champ créé pour essayer. */
  const fiche = clone(src.fiche || {});
  if (fiche.perso) fiche.perso = fiche.perso.filter((c) => c.cle !== "test");
  if (fiche.ordre) fiche.ordre = fiche.ordre.filter((c) => c !== "perso:test");

  /* L'anglais des listes : ce que la démonstration montre encore des champs
     de la source, et les secteurs inventés avec leurs sous-catégories. */
  const montre = new Set();
  plans.forEach((p) => p.stands.forEach((s) => {
    [s.sect, ...(s.nomencl || []), ...Object.values(s.perso || {})].forEach((v) => montre.add(v));
  }));
  const anglais = Object.fromEntries(Object.entries(src.anglais || {}).filter(([k]) => montre.has(k)));
  for (const [nom, def] of Object.entries(SECTEURS)) Object.assign(anglais, { [nom]: def.en }, def.sous);

  return {
    evenement: "Salon Démo 2027", fuseau: src.fuseau || "Europe/Paris",
    fiche, calage: src.calage || null, anglais,
    nomsZones: {}, zonesMasquees: {}, zonesTraversables: src.zonesTraversables || {},
    fichesZones: {}, salles: {},
    vignettes, plans, sansLogo,
  };
}

/** Les logos dessinés par `logos-demo.js`, par nom de société ; rien s'il
 *  n'a pas encore tourné. */
function lisLogos() {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, "logos-demo.json"), "utf8")); }
  catch (e) { return {}; }
}

/** La source versionnée. */
const lisSource = () => JSON.parse(fs.readFileSync(path.join(__dirname, "source-demo.json"), "utf8"));

/**
 * Les images des produits : une par offre de chaque secteur, en SVG — un
 * aplat aux couleurs du secteur, une forme, le nom de l'offre. Posées dans
 * `web/demo-produits/` par la construction.
 * @returns {Record<string, string>} le nom de fichier, et son contenu
 */
function imagesProduits() {
  const sortie = {};
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  for (const [sect, def] of Object.entries(SECTEURS)) {
    def.produits.forEach((nom, i) => {
      const [c1, c2] = def.c;
      const r = hasard("image|" + sect + "|" + i);
      const forme = Math.floor(r() * 3);
      const motif = forme === 0 ? '<circle cx="250" cy="150" r="90" fill="' + c2 + '" opacity=".9"/>'
        : forme === 1 ? '<rect x="160" y="60" width="180" height="180" rx="36" fill="' + c2 + '" opacity=".9"/>'
        : '<path d="M250 50 L350 240 L150 240 Z" fill="' + c2 + '" opacity=".9"/>';
      // le nom sur deux lignes au plus, coupé au mot
      const mots = nom.split(" ");
      const lignes = nom.length > 22 ? [mots.slice(0, Math.ceil(mots.length / 2)).join(" "),
        mots.slice(Math.ceil(mots.length / 2)).join(" ")] : [nom];
      sortie[slug(sect) + "-" + i + ".svg"] =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 375" width="500" height="375">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 +
        '"/><stop offset="1" stop-color="' + c1 + '" stop-opacity=".75"/></linearGradient></defs>' +
        '<rect width="500" height="375" fill="url(#g)"/>' + motif +
        lignes.map((l, k) => '<text x="250" y="' + (300 + k * 34 - (lignes.length - 1) * 17) +
          '" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" fill="#fff" ' +
          'text-anchor="middle">' + esc(l) + "</text>").join("") + "</svg>\n";
    });
  }
  return sortie;
}

module.exports = { salonDemo, lisSource, imagesProduits, DOSSIER_PRODUITS, ORIGINE, FOODTRUCKS, logosFoodtrucks, lisLogos };
