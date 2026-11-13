/* La largeur d'une icône png, telle que le manifeste l'annonce
   (`supabase/functions/_partage/png.ts`). La console réduit l'icône d'une
   application quand elle pèse trop : le manifeste doit dire sa vraie taille. */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const zlib = require("zlib");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** Un png minimal de cette largeur, en adresse de données. */
function png(largeur, hauteur = largeur){
  const bloc = (nom, donnees) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(donnees.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32 ? zlib.crc32(Buffer.concat([Buffer.from(nom), donnees])) : 0);
    return Buffer.concat([l, Buffer.from(nom), donnees, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largeur, 0); ihdr.writeUInt32BE(hauteur, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  const octets = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    bloc("IHDR", ihdr), bloc("IEND", Buffer.alloc(0))]);
  return "data:image/png;base64," + octets.toString("base64");
}

(async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "supabase", "functions", "_partage", "png.ts"), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { largeurPng } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));

  console.log("\n=== La largeur lue dans l'en-tête ===");
  for (const l of [512, 384, 256]) dit(largeurPng(png(l)) === l, "une icône de " + l + " pixels", String(largeurPng(png(l))));
  dit(largeurPng(null) === null, "rien");
  dit(largeurPng("data:image/webp;base64,AAAA") === null, "un autre format");
  dit(largeurPng("data:image/png;base64,!!!!") === null, "des octets illisibles");
  dit(largeurPng(png(9000)) === null, "une largeur absurde");

  console.log(ko ? "\n" + ko + " échec(s)" : "\nTout tient.");
  process.exit(ko ? 1 : 0);
})();
