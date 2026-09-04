/**
 * Extraction sommaire du texte d'un PDF : on décompresse les flux et on garde
 * ce qui est entre parenthèses, c'est-à-dire les chaînes que les opérateurs de
 * dessin de texte reçoivent. Cela suffit à chercher un nom d'entité dans la
 * documentation GAIA ; ce n'est pas un lecteur de PDF.
 *
 *   node outils/lire-pdf.js <fichier.pdf> [motif]
 */
const fs = require("fs");
const zlib = require("zlib");

const chemin = process.argv[2];
const motif = process.argv[3];
const brut = fs.readFileSync(chemin);
const latin = brut.toString("latin1");

let texte = "";
const debut = /stream\r?\n/g;
let m;
while ((m = debut.exec(latin))) {
  const d = m.index + m[0].length;
  const f = brut.indexOf(Buffer.from("endstream"), d);
  if (f < 0) continue;
  try { texte += zlib.inflateSync(brut.subarray(d, f)).toString("latin1"); } catch (e) { /* flux non compressé */ }
}

const chaines = texte.match(/\((?:[^()\\]|\\.)*\)/g) || [];
const plat = chaines.map((s) => s.slice(1, -1).replace(/\\([()\\])/g, "$1")).join("");

if (!motif) {
  fs.writeFileSync(process.env.TEMP + "/gaia.txt", plat);
  console.log("caractères extraits :", plat.length, "→", process.env.TEMP + "/gaia.txt");
} else {
  const re = new RegExp(motif, "gi");
  let n = 0, t;
  while ((t = re.exec(plat)) && n < 40) {
    console.log("…" + plat.slice(Math.max(0, t.index - 110), t.index + 150).replace(/\s+/g, " ") + "…\n");
    n++;
  }
  console.log("occurrences affichées :", n);
}
