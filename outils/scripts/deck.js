/**
 * deck.gl, réduit à ce que le plan dessine : `npm run deck`.
 *
 * Le rendu par la carte graphique (`modules/webgl.mjs`) chargeait le
 * `dist.min.js` du paquet `deck.gl` : la bibliothèque entière, 470 Ko
 * compressés — quatre fois le script du plan — pour huit classes. Ce script
 * rassemble ces huit-là depuis les paquets de deck.gl, à la même version, et
 * laisse esbuild écarter le reste : plus de la moitié en moins. Une seule
 * retouche à ce qui dessine, la chauffe des programmes (`RETOUCHES`) ; rien
 * d'autre ne change.
 *
 * Il ne se refait qu'avec le réseau, comme les polices : les paquets se
 * téléchargent dans un dossier temporaire, hors du dépôt, et seul le fichier
 * produit est versionné (`web/bibliotheques/`). Une classe de plus dont le
 * plan aurait besoin s'ajoute à `CLASSES` ; une version neuve, à `VERSION`
 * — puis on relance, et l'on reporte dans `modules/webgl.mjs` (`DECK_WEBGL`)
 * le nom et l'empreinte que ce script affiche.
 *
 *   npm run deck
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const esbuild = require("esbuild");

/* La version que le plan dessine. La 9.3 et non la 9.4 : sur la carte
   graphique d'essai, la 9.4.0 ne dessinait plus les points. */
const VERSION = "9.3.11";

/* Ce que `modules/webgl.mjs` emprunte à `deck`, et rien d'autre : un nom
   manquant ici tomberait sur `undefined` au premier dessin. */
const CLASSES = {
  "@deck.gl/core": ["Deck", "OrthographicView", "LayerExtension", "View", "Viewport",
    "LightingEffect", "AmbientLight", "DirectionalLight"],
  "@deck.gl/layers": ["TextLayer", "PathLayer", "SolidPolygonLayer", "BitmapLayer"],
  "@deck.gl/extensions": ["PathStyleExtension"],
  "@deck.gl/mesh-layers": ["SimpleMeshLayer"],
};

/* Le nom porte l'empreinte du contenu, et non la seule version : le site garde
   ce dossier un an sans revalider (`genere.js`, `_headers`). Une classe de
   plus à la même version, sous le même nom, serait restée l'ancienne chez qui
   l'avait déjà — et, l'intégrité ne concordant plus, son plan en SVG. */
const DOSSIER = path.join(__dirname, "..", "..", "web", "bibliotheques");

/* Deux retouches à luma.gl, le moteur sous deck.gl : la chauffe des programmes
   (`modules/webgl.mjs`, « La chauffe »).

   luma.gl lance la compilation d'un programme en tâche de fond — la carte
   graphique peut en compiler plusieurs à la fois —, puis lit aussitôt la
   liste de ses attributs : la page attend alors que ce programme-là soit
   prêt, et le suivant ne part qu'après. Sur les postes Windows, le plan
   attendait ainsi la carte graphique une seconde et demie à son ouverture,
   un programme après l'autre (sonde, FUNEXPO 2026, 10 novembre 2026).

   Tant que le plan pose sur la carte graphique un tableau `__chauffe`, un
   programme créé y est rangé, et la lecture de ses attributs attend qu'on
   la demande une fois la chauffe finie : le plan lance tous ses programmes
   d'un coup, attend qu'ils soient prêts sans rien bloquer, puis ses vraies
   couches les reprennent du cache de luma.gl, qui ne les détruit jamais
   (`_destroyPipelines: false`). Pendant la chauffe, les couches qui
   demandent ces attributs — celles de la chauffe seules — reçoivent une
   liste vide, sans la garder. Hors chauffe, rien ne change.

   Le texte remplacé est cherché tel quel : s'il manque — une autre version
   de luma.gl —, la construction s'arrête au lieu de livrer un deck.gl sans
   la retouche. */
const RETOUCHES = [
  {
    fichier: /@luma\.gl[\\/]webgl[\\/]dist[\\/]adapter[\\/]resources[\\/]webgl-shared-render-pipeline\.js$/,
    avant: "        this.introspectedLayout = getShaderLayoutFromGLSL(this.device.gl, this.handle);\n",
    apres: "        const chauffe = this.device.__chauffe;\n" +
      "        if (chauffe) {\n" +
      "            chauffe.push(this);\n" +
      "            let lu = null;\n" +
      "            Object.defineProperty(this, 'introspectedLayout', { configurable: true, enumerable: true,\n" +
      "                get: () => lu || (this.device.__chauffe ? { attributes: [], bindings: [], uniforms: [] }\n" +
      "                    : (lu = getShaderLayoutFromGLSL(this.device.gl, this.handle))),\n" +
      "                set: (v) => { lu = v; } });\n" +
      "        }\n" +
      "        else\n" +
      "            this.introspectedLayout = getShaderLayoutFromGLSL(this.device.gl, this.handle);\n",
  },
  {
    fichier: /@luma\.gl[\\/]webgl[\\/]dist[\\/]adapter[\\/]resources[\\/]webgl-render-pipeline\.js$/,
    avant: "        this.introspectedLayout = webglSharedRenderPipeline.introspectedLayout;\n",
    apres: "        if (this.device.__chauffe) {\n" +
      "            let lu = null, forme = null;\n" +
      "            const vide = () => ({ attributes: [], bindings: [], uniforms: [] });\n" +
      "            Object.defineProperty(this, 'introspectedLayout', { configurable: true, enumerable: true,\n" +
      "                get: () => lu || (this.device.__chauffe ? vide() : (lu = webglSharedRenderPipeline.introspectedLayout)),\n" +
      "                set: (v) => { lu = v; } });\n" +
      "            Object.defineProperty(this, 'shaderLayout', { configurable: true, enumerable: true,\n" +
      "                get: () => forme || (this.device.__chauffe ? vide() : (forme = props.shaderLayout\n" +
      "                    ? mergeShaderLayout(this.introspectedLayout, props.shaderLayout) : this.introspectedLayout)),\n" +
      "                set: (v) => { forme = v; } });\n" +
      "        }\n" +
      "        else\n" +
      "            this.introspectedLayout = webglSharedRenderPipeline.introspectedLayout;\n",
  },
  {
    fichier: /@luma\.gl[\\/]webgl[\\/]dist[\\/]adapter[\\/]resources[\\/]webgl-render-pipeline\.js$/,
    avant: "        this.shaderLayout = props.shaderLayout\n" +
      "            ? mergeShaderLayout(this.introspectedLayout, props.shaderLayout)\n" +
      "            : this.introspectedLayout;\n",
    apres: "        if (!this.device.__chauffe)\n" +
      "            this.shaderLayout = props.shaderLayout\n" +
      "                ? mergeShaderLayout(this.introspectedLayout, props.shaderLayout)\n" +
      "                : this.introspectedLayout;\n",
  },
];
const appliquees = new Set();
const retouche = {
  name: "retouches-luma",
  setup(build) {
    build.onLoad({ filter: /@luma\.gl[\\/]webgl[\\/].*\.js$/ }, (args) => {
      const siennes = RETOUCHES.filter((r) => r.fichier.test(args.path));
      if (!siennes.length) return undefined;
      let texte = fs.readFileSync(args.path, "utf8");
      for (const r of siennes) {
        if (texte.split(r.avant).length !== 2) {
          throw new Error("Retouche de luma.gl introuvable dans " + args.path + " :\n" + r.avant);
        }
        texte = texte.replace(r.avant, () => r.apres);
        appliquees.add(r);
      }
      return { contents: texte, loader: "js" };
    });
  },
};

async function construit() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "deck-"));
  try {
    fs.writeFileSync(path.join(tmp, "package.json"), "{}");
    execFileSync("npm", ["install", "--no-audit", "--no-fund", "--silent",
      ...Object.keys(CLASSES).map((p) => p + "@" + VERSION)], { cwd: tmp, stdio: "inherit" });

    const noms = Object.values(CLASSES).flat();
    const entree = Object.entries(CLASSES)
      .map(([p, c]) => "import { " + c.join(", ") + " } from " + JSON.stringify(p) + ";").join("\n") +
      // la page attend `deck` sur l'objet global, comme le posait la bibliothèque entière
      "\nglobalThis.deck = { " + noms.join(", ") + " };\n";
    fs.writeFileSync(path.join(tmp, "entree.mjs"), entree);

    const r = await esbuild.build({
      entryPoints: [path.join(tmp, "entree.mjs")],
      bundle: true, minify: true, format: "iife", write: false,
      legalComments: "none", target: "es2020",
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "warning",
      plugins: [retouche],
    });
    if (appliquees.size !== RETOUCHES.length) {
      throw new Error("Retouches de luma.gl : " + appliquees.size + " sur " + RETOUCHES.length +
        " appliquées — le fichier visé n'est plus dans le paquet.");
    }
    const code = r.outputFiles[0].text;
    const SORTIE = path.join(DOSSIER, "deck.gl-" + VERSION + "-plan-" +
      crypto.createHash("sha256").update(code).digest("hex").slice(0, 8) + ".min.js");
    fs.writeFileSync(SORTIE, code);
    const empreinte = "sha384-" + crypto.createHash("sha384").update(code).digest("base64");
    console.log("Écrit : " + path.relative(process.cwd(), SORTIE) +
      " (" + Math.round(code.length / 1024) + " Ko)\n" +
      "À reporter dans modules/webgl.mjs (DECK_WEBGL) :\n" +
      '  src: "bibliotheques/' + path.basename(SORTIE) + '",\n' +
      '  integrite: "' + empreinte + '",\n' +
      "Puis retirez du dépôt le fichier qu'il remplace.");
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

construit().catch((e) => { console.error(e.message); process.exit(1); });
