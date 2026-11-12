/**
 * L'allègement des calques d'habillage ne garde que ce qui dessine :
 * `supabase/functions/_partage/svg.ts` `allege`, éprouvé seul.
 *
 * Le dessin d'un calque part tel quel dans la page de chaque visiteur. Deux
 * choses à tenir ensemble : un attribut qui n'est pas du dessin — `on…`,
 * `style`, `href`, une adresse — n'en sort pas ; et un plan réel en sort à
 * l'octet près, car ce que l'exploitant a réglé (couleurs, sous-calques
 * masqués) se règle sur ce que l'allègement écrit. Le premier se prouve sur des
 * pièges écrits ici, le second sur les calques de `outils/donnees/plans.json`.
 *
 *   node outils/essais/svg.js     (lancé par `npm run essais`)
 */
const fs = require("fs");
const path = require("path");
const ts = require("typescript");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "supabase", "functions", "_partage", "svg.ts"), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { allege } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
  const calque = (corps) => '<svg><g id="A">' + corps + "</g></svg>";

  console.log("\n=== 1. Ce qui n'est pas du dessin n'en sort pas ===");
  const PIEGES = [
    ["un gestionnaire d'événement", '<path d="M0 0L10 10" onmouseover="alert(1)"/>', /onmouseover/],
    ["un gestionnaire sans guillemets", '<path d="M0 0L10 10" onclick=alert(1)/>', /onclick/],
    ["un gestionnaire entre apostrophes, sur un texte", "<text x=\"1\" y=\"2\" onfocus='alert(1)'>Hall</text>", /onfocus/],
    ["un style", '<circle cx="1" cy="2" r="3" style="background:url(https://x/y)"/>', /style/],
    ["un lien", '<path d="M0 0L10 10" href="javascript:alert(1)" xlink:href="javascript:alert(1)"/>', /href|javascript/],
    ["une adresse dans un attribut permis", '<path d="M0 0L10 10" stroke-dasharray="url(https://x/y)"/>', /url\(/],
    ["du javascript: dans un attribut permis", '<path d="M0 0L10 10" transform="javascript:alert(1)"/>', /javascript/],
  ];
  for (const [q, corps, interdit] of PIEGES) {
    const { svg, ecartes } = allege(calque(corps));
    dit(!interdit.test(svg) && ecartes.length > 0, q, svg);
  }
  {
    const { svg } = allege(calque('<path d="M0 0L10 10" onmouseover="alert(1)" stroke="#f00" stroke-width="0.2"/>'));
    dit(/<path d="M0 0L10 10" stroke="currentColor" stroke-width="0.2"\/>/.test(svg),
      "le dessin, lui, reste : tracé, trait, épaisseur", svg);
  }
  {
    const { svg } = allege(calque('<text x="1" y="2" font-size="0.6" text-anchor="start" onclick="z">Salle &amp; bar</text>'));
    dit(svg.includes('<text x="1" y="2" font-size="0.6" text-anchor="start">Salle &amp; bar</text>'),
      "un texte garde sa place, sa taille et ses mots", svg);
  }
  {
    const { ecartes } = allege(calque('<path d="M0 0L9 9" onload="a"/><circle cx="1" cy="1" r="1" onload="b" style="c"/>'));
    dit(JSON.stringify(ecartes) === JSON.stringify(["circle@onload", "circle@style", "path@onload"]),
      "ce qui est écarté est nommé, une fois chacun, pour le journal", ecartes.join(", "));
  }

  console.log("\n=== 2. Un plan réel n'y perd rien ===");
  /* L'instantané garde le dessin allégé par une version plus ancienne, un
     groupe par sous-calque marqué de ses couleurs d'origine. On le rend à la
     forme que Klipso exporte — des groupes nus — et on l'allège : rien n'en
     doit être écarté, sans quoi un attribut que les plans emploient manquerait
     à `PERMIS` ; et l'allègement, repassé sur ce qu'il rend, ne bouge plus
     rien. (À l'arrivée de la liste fermée, la sortie a été comparée à celle de
     la version d'avant sur ces mêmes calques : identique à l'octet.) */
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "donnees", "plans.json"), "utf8"));
  const dessins = [];
  const parcours = (o) => {
    if (typeof o === "string") { if (o.startsWith("<g id=")) dessins.push(o); }
    else if (o && typeof o === "object") Object.values(o).forEach(parcours);
  };
  parcours(d);
  let pareils = 0;
  const ecartes = new Set();
  for (const s of dessins) {
    const brut = "<svg>" + s.replace(/<g id="([^"]+)" data-s="[^"]*" data-f="[^"]*">/g, '<g id="$1">')
      .replace(/<\/g>/g, "") + "</g></svg>";
    const r = allege(brut);
    const encore = allege("<svg>" + r.svg.replace(/ data-s="[^"]*" data-f="[^"]*"/g, "")
      .replace(/<\/g>/g, "") + "</g></svg>");
    if (encore.svg === r.svg) pareils++;
    r.ecartes.forEach((e) => ecartes.add(e));
  }
  dit(dessins.length >= 10, "les calques de l'instantané sont lus", dessins.length + " calques");
  dit(pareils === dessins.length, "allégé deux fois, un plan ne bouge plus", pareils + "/" + dessins.length);
  dit(ecartes.size === 0, "aucun attribut des plans réels n'est écarté", [...ecartes].join(", "));

  console.log(ko ? "\n" + ko + " ÉCHEC(S)\n" : "\nLe dessin des calques ne porte que du dessin.\n");
  process.exit(ko ? 1 : 0);
})();
