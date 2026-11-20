/**
 * La désignation par le calcul (`modules/moteur-gl-calcul.mjs`), éprouvée
 * hors de la page.
 *
 * Le survol et le clic ne demandent plus à la carte graphique ce qu'ils
 * visent : le moteur rejoue sa passe de désignation sur le processeur. Ce
 * qu'il faut qu'il rejoue comme elle, et que la comparaison dans le
 * navigateur (`navigateur/designation-calcul.spec.js`) ne croise pas
 * forcément sur un salon : la découpe par le plan proche — un stand tout
 * près de l'œil, en immersif —, la profondeur arrondie aux seize bits du
 * tampon de désignation, l'ordre des triangles, et la projection gardée tant que la vue
 * ne bouge pas.
 *
 *   node outils/essais/moteur-gl-calcul.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const module_ = (nom) => import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", nom)));

(async () => {
  const K = await module_("moteur-gl-calcul.mjs");
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

  console.log("La profondeur du tampon");
  dit(K.profondeur16(1) === K.PROFONDEUR_VIDE, "le lointain vaut le tampon vidé");
  dit(K.profondeur16(-1) === 0, "le proche vaut zéro");
  dit(K.profondeur16(1e-9) === K.profondeur16(0), "deux profondeurs à moins d'un cran se confondent, comme dans le tampon");
  dit(K.COMPARAISONS["less-equal"](5, 5) && !K.COMPARAISONS.less(5, 5), "à égalité, « moins ou égal » passe, « moins » non");
  // deux surfaces que seize bits confondent et que vingt-quatre départageraient : le tampon de la désignation en a seize
  dit(K.PROFONDEUR_VIDE === 0xffff, "seize bits, comme le tampon de la désignation");
  dit(K.profondeur16(1e-5) === K.profondeur16(0) && Math.round((1e-5 * .5 + .5) * 0xffffff) !== Math.round(.5 * 0xffffff),
    "à un cent-millième d'écart, confondues en seize bits, que vingt-quatre départageaient");
  dit(K.COMPARAISONS.equal === undefined, "une comparaison que le calcul ne rejoue pas manque : il s'abstiendra");

  console.log("Un triangle et le point");
  const a = [-1, -1, 0, 1], b = [1, -1, 0, 1], c = [0, 1, 0, 1];
  dit(K.couvre(a, b, c, [0, 0]) === K.profondeur16(0), "dedans : sa profondeur");
  dit(K.couvre(a, b, c, [.9, .9]) === -1, "dehors : rien");
  dit(K.couvre(c, b, a, [0, 0]) === K.profondeur16(0), "tourné dans l'autre sens : la carte ne retire aucune face");
  dit(K.couvre(a, b, c, [0, -1]) >= 0, "sur un bord : couvert");
  dit(K.couvre([-1, -1, .5, 1], [1, -1, .5, 1], [0, 1, -.5, 1], [0, 0]) === K.profondeur16(0),
    "la profondeur suit le triangle, à plat sur l'écran");

  console.log("La découpe par les plans proche et lointain");
  // derrière l'œil en entier : w négatif partout
  dit(K.couvre([-1, -1, 0, -1], [1, -1, 0, -1], [0, 1, 0, -1], [0, 0]) === -1, "derrière l'œil : rien, malgré une image qui retombe à l'écran");
  /* Un triangle qui traverse le plan proche (z = −w) : la part devant lui
     reste, l'autre part est coupée — sans découpe, la division par w
     retournerait la part de derrière et la ferait tomber sous le point. */
  const traverse = [[-2, -2, -3, 1], [2, -2, -3, 1], [0, 2, 1, 1]];
  dit(K.couvre(traverse[0], traverse[1], traverse[2], [0, 1.5]) >= 0, "la part devant le plan proche se désigne");
  dit(K.couvre(traverse[0], traverse[1], traverse[2], [0, -1.5]) === -1, "la part derrière lui, non");
  dit(K.couvre([-1, -1, 2, 1], [1, -1, 2, 1], [0, 1, 2, 1], [0, 0]) === -1, "au-delà du lointain : rien");

  console.log("Les triangles d'une couche, dans l'ordre");
  // deux carrés superposés, le second plus près : l'ordre et la profondeur de chacun
  const pos = new Float32Array([-1, -1, .5, 1, -1, .5, 1, 1, .5, -1, 1, .5, -.5, -.5, 0, .5, -.5, 0, .5, .5, 0, -.5, .5, 0]);
  const indices = new Uint32Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7]);
  const objets = new Float32Array([0, 0, 0, 0, 1, 1, 1, 1]);
  const vus = [];
  // hors de la diagonale qui coupe chaque carré en deux triangles, où les deux le couvriraient
  let memo = K.traverse(I, pos, indices, objets, [.1, .3], (o, z) => vus.push([o, z]));
  dit(JSON.stringify(vus.map(v => v[0])) === "[0,1]", "chaque objet qui couvre le point, dans l'ordre de la couche", JSON.stringify(vus));
  dit(vus[1][1] < vus[0][1], "le second, plus près, a la moindre profondeur");
  const hors = [];
  K.traverse(I, pos, indices, objets, [.8, .6], (o) => hors.push(o), memo);
  dit(JSON.stringify(hors) === "[0]", "hors du second, le premier seul", JSON.stringify(hors));

  console.log("La projection gardée");
  const garde = K.traverse(I, pos, indices, objets, [.1, .3], () => {}, memo);
  dit(garde === memo, "la même vue : la projection se reprend");
  const decale = [...I]; decale[12] = 1.6;
  const vusDecale = [];
  memo = K.traverse(decale, pos, indices, objets, [.1, .3], (o) => vusDecale.push(o), memo);
  dit(memo !== garde && JSON.stringify(vusDecale) === "[]", "la vue bougée : la projection se refait, et le point n'est plus couvert", JSON.stringify(vusDecale));
  const monte = new Float32Array(pos); monte[2] = .9;
  dit(K.traverse(decale, monte, indices, objets, [0, 0], () => {}, memo) !== memo, "les sommets changés : la projection se refait");

  console.log(ko ? `\n${ko} échec(s)` : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
