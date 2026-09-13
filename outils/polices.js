/**
 * Les polices, servies depuis `web/polices/` plutôt que par Google.
 *
 * Une feuille demandée à `fonts.googleapis.com` transmet à Google l'adresse IP
 * de chaque visiteur, à chaque ouverture du plan, avant qu'il ait rien pu
 * choisir. Le tribunal régional de Munich l'a jugé contraire au RGPD
 * (LG München I, 20 janvier 2022), et aucun bandeau n'y remédie : les polices
 * partent avec la page, avant toute réponse. Servies depuis notre domaine,
 * elles ne font plus parler personne — et le plan ne dépend plus d'un tiers
 * pour mesurer ses libellés.
 *
 * Ce script ne fait pas partie de la construction, et c'est voulu : il
 * télécharge, alors que `npm run construire` doit tourner sans réseau. Les
 * fichiers qu'il produit sont versionnés, comme `plans.json` ; on ne le
 * relance que pour changer la liste ci-dessous :
 *
 *   npm run polices
 *
 * Il écrit :
 *   web/polices/<famille>-<style>-<graisse>-<sous-ensemble>-<empreinte>.woff2
 *   web/polices/<famille>.css — pour une page qui charge une famille à la
 *                               demande, ou qui n'est pas construite
 *   outils/polices.json       — les déclarations, que `genere.js` pose dans
 *                               l'en-tête de chaque page
 *
 * L'empreinte dans le nom est ce qui permet de garder un fichier sans jamais le
 * redemander : un fichier changé change d'adresse. Le service de second plan
 * s'en sert (voir `_sw.js`).
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

/* Les familles, dans la syntaxe de l'API de Google. Une famille ajoutée ici
   n'est servie qu'une fois ce script relancé, et la construction refaite. */
const FAMILLES = [
  "Archivo:wght@500;600;700",
  "Instrument+Sans:wght@400;500;600",
  "IBM+Plex+Mono:wght@400;500;600",
  "Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400",
  "Courier+Prime:wght@400;700",
];

/* Le latin étendu en plus du latin : le français tient dans le second, mais un
   plan affiche des enseignes venues de partout — un « ł » polonais ou un « ş »
   turc tomberait sinon dans la police du système, au milieu d'un nom. Le
   cyrillique, le grec et le vietnamien restent de côté : ce serait doubler le
   poids pour des caractères qu'aucun salon servi n'affiche, et le navigateur
   les dessine quand même, dans une police de repli. */
const SOUS_ENSEMBLES = ["latin-ext", "latin"];

/* Google choisit le format selon le navigateur qui demande : sans un agent
   récent, il répondrait en TTF, trois fois plus lourd. Tous les navigateurs
   que le plan sert lisent le WOFF2. */
const AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

const RACINE = path.join(__dirname, "..");
const DOSSIER = path.join(RACINE, "web", "polices");

const nomDeFichier = (famille) =>
  famille.replace(/'/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function demande(adresse, binaire) {
  const r = await fetch(adresse, { headers: { "User-Agent": AGENT } });
  if (!r.ok) throw new Error(adresse + " → " + r.status);
  return binaire ? Buffer.from(await r.arrayBuffer()) : r.text();
}

/** Les blocs `@font-face` de la feuille, chacun avec son sous-ensemble. */
function blocs(css) {
  const trouves = [];
  const motif = /\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  let m;
  while ((m = motif.exec(css))) {
    const descripteurs = {};
    for (const ligne of m[2].split(";")) {
      const i = ligne.indexOf(":");
      if (i > 0) descripteurs[ligne.slice(0, i).trim()] = ligne.slice(i + 1).trim();
    }
    const src = /url\(([^)]+)\)/.exec(descripteurs.src || "");
    if (!src) throw new Error("bloc sans adresse de fichier : " + m[2]);
    delete descripteurs.src;
    trouves.push({ sousEnsemble: m[1], adresse: src[1], descripteurs });
  }
  return trouves;
}

/**
 * Une déclaration par fichier.
 *
 * Google répète la même police variable sous chaque graisse demandée — trois
 * blocs pour Archivo, un seul fichier. Les fusionner en une plage (`500 700`)
 * dit la même chose au navigateur, et évite surtout à la page autonome, qui
 * embarque ses fichiers, d'en porter trois copies.
 */
function fusionne(liste) {
  const parFichier = new Map();
  for (const b of liste) {
    const cle = b.adresse + "|" + b.sousEnsemble + "|" + b.descripteurs["font-style"];
    const deja = parFichier.get(cle);
    const g = Number(b.descripteurs["font-weight"]);
    if (!deja) { parFichier.set(cle, { ...b, graisses: [g] }); continue; }
    deja.graisses.push(g);
  }
  return [...parFichier.values()].map(({ graisses, ...b }) => {
    const bas = Math.min(...graisses), haut = Math.max(...graisses);
    b.descripteurs["font-weight"] = bas === haut ? String(bas) : bas + " " + haut;
    return b;
  });
}

const regle = (descripteurs, src) =>
  "@font-face{" + Object.entries(descripteurs).map(([k, v]) => k + ":" + v).join(";") +
  ";src:url(" + src + ") format('woff2')}";

(async () => {
  fs.mkdirSync(DOSSIER, { recursive: true });
  const source = "https://fonts.googleapis.com/css2?" +
    FAMILLES.map((f) => "family=" + f).join("&") + "&display=swap";
  const retenus = fusionne(blocs(await demande(source))
    .filter((b) => SOUS_ENSEMBLES.includes(b.sousEnsemble)));

  const faces = [], ecrits = new Set();
  for (const b of retenus) {
    const octets = await demande(b.adresse, true);
    const famille = b.descripteurs["font-family"].replace(/'/g, "");
    const fichier = [nomDeFichier(famille), b.descripteurs["font-style"],
      b.descripteurs["font-weight"].replace(" ", "-"), b.sousEnsemble,
      crypto.createHash("sha256").update(octets).digest("hex").slice(0, 8)].join("-") + ".woff2";
    fs.writeFileSync(path.join(DOSSIER, fichier), octets);
    ecrits.add(fichier);
    faces.push({ famille, sousEnsemble: b.sousEnsemble, fichier, octets: octets.length,
      descripteurs: b.descripteurs });
  }

  // une feuille par famille, aux adresses relatives : elle se sert du dossier
  for (const famille of new Set(faces.map((f) => f.famille))) {
    const fichier = nomDeFichier(famille) + ".css";
    fs.writeFileSync(path.join(DOSSIER, fichier), faces
      .filter((f) => f.famille === famille)
      .map((f) => regle(f.descripteurs, f.fichier)).join("\n") + "\n");
    ecrits.add(fichier);
  }

  /* Le dossier appartient à ce script : un fichier qu'il n'a pas écrit cette
     fois-ci est une version d'avant, qu'aucune page ne demande plus. */
  for (const f of fs.readdirSync(DOSSIER)) {
    if (!ecrits.has(f) && /\.(woff2|css)$/.test(f)) fs.unlinkSync(path.join(DOSSIER, f));
  }

  fs.writeFileSync(path.join(__dirname, "polices.json"),
    JSON.stringify({ source, sousEnsembles: SOUS_ENSEMBLES, faces }, null, 2) + "\n");

  const total = faces.reduce((s, f) => s + f.octets, 0);
  console.log(faces.length, "déclarations,", new Set(faces.map((f) => f.fichier)).size,
    "fichiers,", (total / 1024).toFixed(0), "Ko");
})().catch((e) => { console.error(e.message); process.exit(1); });
