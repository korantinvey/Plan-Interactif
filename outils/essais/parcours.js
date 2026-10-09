/**
 * Le parcours écrit dans un lien : `modules/lien-parcours.mjs`, éprouvé seul.
 *
 * Un lien de partage part sur un autre téléphone, ou dans une note qu'on
 * rouvrira le jour du salon. Une erreur ici ne casse rien à l'écran : le lien
 * s'ouvre sur un parcours plausible et faux — un identifiant coupé en deux par
 * un point qu'il portait, un accent perdu en route. D'où des cas qui mesurent
 * l'aller-retour plutôt que de relire le code : ce qu'on a écrit doit revenir
 * tel quel, et ce qu'on n'a pas écrit ne doit rien rendre.
 *
 *   node outils/essais/parcours.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const pareil = (a, b) => JSON.stringify(a) === JSON.stringify(b);

(async () => {
  const L = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "lien-parcours.mjs")).href);

  console.log("\n=== 1. L'aller-retour, sur des parcours variés ===");
  const CAS = [
    ["un parcours vide", { stands: [], confs: [] }],
    ["des stands seuls", { stands: ["12", "A-3", "hall_7"], confs: [] }],
    ["des conférences seules", { stands: [], confs: ["c1", "987654"] }],
    ["les deux", { stands: ["1", "2", "3"], confs: ["x", "y"] }],
    ["un point dans un identifiant — le séparateur", { stands: ["7.1", "7.1.2"], confs: ["a.b"] }],
    ["les signes de l'adresse", { stands: ["a&b", "c=d", "e#f", "g?h", "i/j", "k+l", "m%20n"], confs: ["~", "1~2~3"] }],
    ["des espaces et des accents", { stands: ["Hall été", " devant "], confs: ["Conférence d'ouverture"] }],
    ["des signes d'autres écritures", { stands: ["中文", "Ω≈ç", "Ελλάδα"], confs: ["日本語"] }],
    /* Hors du plan de base d'Unicode, un signe tient sur deux moitiés : codées
       chacune à part, elles revenaient en « � ». */
    ["un émoji, hors du plan de base", { stands: ["🎪", "stand-🎪-7", "𝔸.b"], confs: ["🎤 ouverture"] }],
    ["un long parcours", { stands: Array.from({ length: 300 }, (_, i) => "s" + i), confs: Array.from({ length: 80 }, (_, i) => "conf-" + i) }],
  ];
  for (const [nom, p] of CAS){
    const code = L.codeParcours(p);
    const lu = L.litCodeParcours(code);
    dit(pareil(lu, p), nom, pareil(lu, p) ? code.length + " signes" : code + " ⇒ " + JSON.stringify(lu));
  }

  console.log("\n=== 2. Le lien, tel qu'un navigateur le rend ===");
  /* Le fragment passe par une adresse : la barre du navigateur, un lecteur de
     codes, une messagerie. Il ne doit porter aucun signe qu'une adresse
     réécrirait, sans quoi `location.hash` ne rendrait pas ce qui a été écrit. */
  for (const [nom, p] of CAS){
    const code = L.codeParcours(p);
    const u = new URL("https://plan.exemple/plan?plan=salon#" + code);
    const brut = u.hash.replace(/^#/, "");
    dit(brut === code && pareil(L.litCodeParcours(brut), p), nom + ", relu d'une adresse");
  }
  dit(CAS.every(([, p]) => /^[A-Za-z0-9_%.&=-]*$/.test(L.codeParcours(p))),
    "le fragment ne porte que des signes qu'aucune adresse ne réécrit");

  console.log("\n=== 3. Le format, tel qu'il est déjà parti ===");
  /* Des liens sont déjà photographiés, déjà envoyés : le format écrit ne peut
     pas changer sans que son chiffre change. */
  dit(L.codeParcours({ stands: [], confs: [] }) === "parcours=2", "un parcours vide",
    L.codeParcours({ stands: [], confs: [] }));
  dit(L.codeParcours({ stands: ["12", "A-3"], confs: [] }) === "parcours=2&s=12.A-3",
    "une section vide ne s'écrit pas", L.codeParcours({ stands: ["12", "A-3"], confs: [] }));
  dit(L.codeParcours({ stands: ["7.1"], confs: ["é"] }) === "parcours=2&s=7%2E1&c=%C3%A9",
    "le point et l'accent, échappés octet par octet", L.codeParcours({ stands: ["7.1"], confs: ["é"] }));
  dit(L.codeParcours({ stands: ["🎪"], confs: [] }) === "parcours=2&s=%F0%9F%8E%AA",
    "un émoji, en ses quatre octets UTF-8 comme tout autre signe", L.codeParcours({ stands: ["🎪"], confs: [] }));
  dit(L.codeParcours({ stands: ["a\uD83Cb"], confs: [] }) === "parcours=2&s=a%EF%BF%BDb",
    "une moitié d'émoji isolée, en « � » comme avant", L.codeParcours({ stands: ["a\uD83Cb"], confs: [] }));
  dit(L.codeParcours({ stands: [], confs: [] }).indexOf(L.CLE_LIEN_PARCOURS) === 0,
    "le fragment commence par la clé que l'accueil cherche");

  console.log("\n=== 4. Ce qui se relit, et ce qui ne rend rien ===");
  const LECTURES = [
    ["le premier format, aux tildes", "parcours=1~12.13~c1", { stands: ["12", "13"], confs: ["c1"] }],
    ["le premier format, vide", "parcours=1~~", { stands: [], confs: [] }],
    ["les sections dans l'autre ordre", "parcours=2&c=x&s=y", { stands: ["y"], confs: ["x"] }],
    ["une section vide écrite quand même", "parcours=2&s=&c=x", { stands: [], confs: ["x"] }],
    ["un échappement cassé : le rang seul est perdu", "parcours=2&s=%E0%A4%A.12", { stands: ["12"], confs: [] }],
    ["des points en trop", "parcours=2&s=..1..2.", { stands: ["1", "2"], confs: [] }],
    ["un champ inconnu ignoré", "parcours=2&z=9&s=1", { stands: ["1"], confs: [] }],
    ["un format à venir", "parcours=3&s=1", null],
    ["le premier format mal formé", "parcours=1~12", null],
    ["un autre fragment", "section=2", null],
    ["un fragment vide", "", null],
    ["une clé qui ne fait que ressembler", "xparcours=2&s=1", null],
  ];
  for (const [nom, frag, attendu] of LECTURES){
    const lu = L.litCodeParcours(frag);
    dit(pareil(lu, attendu), nom, JSON.stringify(lu));
  }

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
