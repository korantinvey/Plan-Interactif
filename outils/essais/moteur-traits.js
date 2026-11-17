/**
 * La géométrie des traits du moteur du plan (`moteur-gl-formes.mjs`
 * `PathLayer.geometrie`), éprouvée contre celle d'avant.
 *
 * La boucle a été réécrite pour ne plus créer de petits tableaux à chaque
 * segment : c'était la plus lourde de la première image. Ce qu'elle pose dans
 * la carte graphique ne devait pas changer d'un bit — sans quoi un trait de
 * l'habillage se décalerait, ou un angle s'ouvrirait, sans qu'aucun autre
 * essai ne le voie. L'étalon est donc l'ancienne écriture, gardée ici telle
 * qu'elle était, et comparée sur des chemins choisis pour leurs cas limites :
 * fermés, segments nuls, relief, un seul segment, chemins vides.
 *
 *   node outils/essais/moteur-traits.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** L'écriture d'avant, l'étalon. */
function geometrieDAvant(data, getPath, [ox, oy, oz]){
  const comptes = new Int32Array(data.length);
  const info = { index: 0, data, target: [] };
  const chemins = [];
  let n = 0;
  for (let i = 0; i < data.length; i++){
    info.index = i;
    const c = typeof getPath === "function" ? getPath(data[i], info) : getPath;
    if (!c || c.length < 2){ chemins.push(null); continue; }
    chemins.push(c); comptes[i] = c.length - 1; n += c.length - 1;
  }
  const ab = new Float32Array(n * 6), dist = new Float32Array(n), bouts = new Float32Array(n * 2), obj = new Float32Array(n);
  const coupe = new Float32Array(n * 4);
  let s = 0;
  chemins.forEach((c, i) => {
    if (!c) return;
    const m = c.length - 1;
    const dirs = [];
    for (let k = 0; k < m; k++){
      const dx = c[k + 1][0] - c[k][0], dy = c[k + 1][1] - c[k][1], l = Math.hypot(dx, dy);
      dirs.push(l > 0 ? [dx / l, dy / l] : null);
    }
    const ferme = m > 1 && c[0][0] === c[m][0] && c[0][1] === c[m][1];
    const bissectrice = (a, b, u) => {
      if (!a || !b || !u) return [0, 0];
      let x = a[0] + b[0], y = a[1] + b[1];
      const l = Math.hypot(x, y);
      if (l < 1e-9){ x = u[0]; y = u[1]; } else { x /= l; y /= l; }
      return [x * u[0] + y * u[1], -x * u[1] + y * u[0]];
    };
    let d = 0;
    for (let k = 0; k < m; k++, s++){
      const u = c[k], v = c[k + 1];
      ab.set([u[0] - ox, u[1] - oy, (u[2] || 0) - oz, v[0] - ox, v[1] - oy, (v[2] || 0) - oz], s * 6);
      dist[s] = d; obj[s] = i;
      bouts[2 * s] = k === 0 && !ferme ? 1 : 0; bouts[2 * s + 1] = k + 1 === m && !ferme ? 1 : 0;
      const avant = k > 0 ? dirs[k - 1] : ferme ? dirs[m - 1] : null;
      const apres = k + 1 < m ? dirs[k + 1] : ferme ? dirs[0] : null;
      coupe.set([...bissectrice(avant, dirs[k], dirs[k]), ...bissectrice(dirs[k], apres, dirs[k])], s * 4);
      d += Math.hypot(v[0] - u[0], v[1] - u[1], (v[2] || 0) - (u[2] || 0));
    }
  });
  return { comptes, total: n, ab, dist, bouts, obj, coupe };
}

/** Un tirage reproductible : le même d'une fois à l'autre. */
function hasard(graine){
  let x = graine >>> 0;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

function chemins(){
  const h = hasard(20261117);
  const pt = (z) => z ? [h() * 900 - 50, h() * 600, h() * 8] : [h() * 900 - 50, h() * 600];
  const l = [
    [], [[1, 2]], null,
    [[0, 0], [10, 0]],                                   // un seul segment
    [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],        // fermé
    [[0, 0], [10, 0], [10, 0], [10, 10]],                // un segment nul au milieu
    [[5, 5], [5, 5], [5, 5]],                            // rien que des segments nuls
    [[0, 0], [10, 0], [0, 0]],                           // demi-tour : bissectrice dégénérée
    [[0, 0], [10, 0], [0, 0], [0, 0]],                   // fermé et nul à la fois
    [[0, 0, 2], [10, 0, 2], [10, 10, 5]],                // en relief
  ];
  // de quoi agrandir les directions gardées d'un chemin à l'autre
  for (let i = 0; i < 300; i++){
    const n = 2 + Math.floor(h() * (i % 50 === 0 ? 400 : 12)), z = i % 7 === 0;
    const c = Array.from({ length: n }, () => pt(z));
    if (i % 3 === 0) c.push(c[0].slice());
    if (i % 11 === 0) c.splice(1, 0, c[1].slice());
    l.push(c);
  }
  return l;
}

const egauxAuBit = (a, b) => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));

(async () => {
  const { PathLayer } = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "moteur-gl-formes.mjs")));
  const data = chemins();
  const getPath = (d) => d;
  for (const origine of [[0, 0, 0], [412.5, 300.25, 1]]){
    const couche = new PathLayer({ data, getPath });
    const neuve = couche.geometrie({ origine });
    const avant = geometrieDAvant(data, getPath, origine);
    console.log("Origine " + origine.join(", "));
    dit(neuve.total === avant.total, "autant de segments", neuve.total + " / " + avant.total);
    for (const cle of ["comptes", "ab", "dist", "bouts", "obj", "coupe"]){
      dit(egauxAuBit(neuve[cle], avant[cle]), cle + " identiques au bit près");
    }
  }
  // un chemin donné tel quel, sans fonction : la même règle que deck.gl
  const fixe = [[0, 0], [3, 4], [3, 0]];
  const neuve = new PathLayer({ data: [1, 2], getPath: fixe }).geometrie({ origine: [0, 0, 0] });
  const avant = geometrieDAvant([1, 2], fixe, [0, 0, 0]);
  dit(egauxAuBit(neuve.coupe, avant.coupe) && egauxAuBit(neuve.ab, avant.ab), "un chemin commun à toutes les données");

  if (ko){ console.log("\n" + ko + " échec(s)"); process.exit(1); }
  console.log("\nTout est en ordre.");
})().catch((e) => { console.error(e); process.exit(1); });
