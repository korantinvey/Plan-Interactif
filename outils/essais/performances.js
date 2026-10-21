/**
 * La fiche de pistes hebdomadaire : chaque règle produit sa piste, les pistes
 * se classent par gain, une dégradation d'une version à l'autre se nomme, et
 * rien d'un salon ne sort de la base que son étiquette.
 *
 * Le dépôt est public : l'issue ne doit contenir ni slug ni nom de salon. On le
 * vérifie sur le corps entier, construit à partir de salons dont le slug est
 * connu de l'essai — la seule façon de prouver une absence.
 *
 *   node outils/essais/performances.js     (chaîné dans `npm run essais`)
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const { REGLES, pistes } = require("../performances-regles.js");
const P = require("../performances.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/* Des indicateurs sains : aucune règle ne doit s'y déclencher. */
const sains = () => ({
  page: "plan", mobile: true, visites: 100, nImmersif: 40,
  donneesP50: 400, preparationP50: 300, afficheP50: 900,
  partClassique: 0.05, partImmersif: 0.06, repeintP95: 10, gpuP95: null,
  logosMoP50: 20, lourds: [{ fichier: "/versions/plan.abc.js", visites: 10, part: 0.1, koP50: 200 }],
  familles: [{ famille: "Android · Mali-G78", visites: 50, avecPerte: 0 }],
});
const ids = (ind) => pistes([ind]).map((p) => p.id);

console.log("Les règles");
dit(pistes([sains()]).length === 0, "des indicateurs sains ne produisent aucune piste", ids(sains()).join(","));
const regle = (id) => REGLES.find((r) => r.id === id);
dit(["donnees", "lourd", "preparation", "immersif", "logos", "contexte"].every(regle), "les six règles de la spec existent", REGLES.map((r) => r.id).join(","));
dit(REGLES.every((r) => r.titre && r.levier), "chaque règle dit son levier");

{ const i = sains(); i.donneesP50 = 4000;
  dit(ids(i).join() === "donnees", "données du salon lentes sur téléphone : piste", ids(i).join()); }
{ const i = sains(); i.donneesP50 = 4000; i.mobile = false;
  dit(ids(i).length === 0, "les mêmes données lentes sur ordinateur : pas de piste"); }
{ const i = sains(); i.lourds = [{ fichier: "/versions/plan.abc.js", visites: 80, part: 0.8, koP50: 600 }];
  dit(ids(i).join() === "lourd", "un fichier lourd dans plus de la moitié des visites : piste", ids(i).join()); }
{ const i = sains(); i.lourds = [{ fichier: "/versions/plan.abc.js", visites: 40, part: 0.4, koP50: 600 }];
  dit(ids(i).length === 0, "le même fichier dans 40 % des visites : pas de piste"); }
{ const i = sains(); i.preparationP50 = 3000;
  dit(ids(i).join() === "preparation", "préparation longue : piste", ids(i).join()); }
{ const i = sains(); i.partImmersif = 0.4; i.gpuP95 = null;
  const p = pistes([i]);
  dit(p.length === 1 && p[0].id === "immersif", "immersif moins fluide SANS gpuTime : la règle se déclenche quand même", ids(i).join()); }
{ const i = sains(); i.partImmersif = 0.4; i.gpuP95 = 30;
  const p = pistes([i]);
  dit(p.length === 1 && /GPU/.test(p[0].detail), "avec gpuTime, il s'ajoute au détail en indice", p[0] && p[0].detail); }
{ const i = sains(); i.repeintP95 = 80;
  dit(ids(i).join() === "immersif", "repeints longs seuls : la même piste", ids(i).join()); }
{ const i = sains(); i.partImmersif = 0.4; i.nImmersif = 1;
  dit(ids(i).length === 0, "une seule visite immersive ne fait pas une piste"); }
{ const i = sains(); i.logosMoP50 = 400;
  dit(ids(i).join() === "logos", "mémoire des logos élevée sur téléphone : piste", ids(i).join()); }
{ const i = sains(); i.familles = [{ famille: "Android · Mali-G78", visites: 30, avecPerte: 12 }];
  const p = pistes([i]);
  dit(p.length === 1 && p[0].id === "contexte" && /Mali-G78/.test(p[0].detail), "pertes de contexte sur une famille d'appareils : piste qui la nomme", p[0] && p[0].detail); }

console.log("L'ordre");
{ const a = sains(); a.donneesP50 = 1700;            // petit écart
  const b = sains(); b.page = "borne"; b.donneesP50 = 9000; b.visites = 300; // grand écart, beaucoup de visites
  const p = pistes([a, b]);
  dit(p.length === 2 && p[0].gain > p[1].gain && p[0].detail.includes("borne"), "les pistes se classent par gain décroissant", p.map((x) => Math.round(x.gain)).join(" > ")); }

console.log("Les versions");
const jour = (n) => { const d = new Date(Date.UTC(2026, 9, 21)); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };
const AUJ = "2026-10-21";
const UUID = ["11111111-aaaa-4aaa-8aaa-000000000001", "22222222-bbbb-4bbb-8bbb-000000000002"];
const SLUGS = ["fep27", "salon-de-la-biere"];
function visite(i, o) {
  return Object.assign({
    evenement_id: UUID[0], jour: jour(2), page: "plan", version: "v1", mobile: true, immersif: false,
    affiche_ms: 900, donnees_ms: 400, transfert_ko: 500, part_plus33_classique: 0.05, part_plus33_immersif: null,
    gels: 0, repeint_ms_p95: 10, gpu_ms_p95: null, pertes_contexte: 0,
    systeme: "Android", carte: "ARM Mali-G78", logos_octets: 20e6, pic_mo: 150,
    lourds: [{ fichier: "/versions/plan.abc.js", transfertKo: 300 }],
  }, o);
}
{ const rel = [];
  for (let i = 0; i < 8; i++) rel.push(visite(i, { version: "v1", jour: jour(5), affiche_ms: 900 }));
  for (let i = 0; i < 8; i++) rel.push(visite(i, { version: "v2", jour: jour(2), affiche_ms: 2400 }));
  const { corps } = P.fiche({ releves: rel, bilans: [], aujourdhui: AUJ });
  dit(/version v1 → version v2/.test(corps), "une dégradation d'une version à l'autre produit « version A → version B »",
    (corps.match(/.*version v1 → version v2.*/) || [""])[0]); }
{ const rel = [];
  for (let i = 0; i < 8; i++) rel.push(visite(i, { version: "v1", jour: jour(5) }));
  for (let i = 0; i < 8; i++) rel.push(visite(i, { version: "v2", jour: jour(2), affiche_ms: 880 }));
  const { corps } = P.fiche({ releves: rel, bilans: [], aujourdhui: AUJ });
  dit(!/version v1 → version v2/.test(corps), "sans dégradation, pas de ligne de version"); }

console.log("Le respect des salons");
{ const rel = [];
  for (let i = 0; i < 12; i++) {
    rel.push(visite(i, { evenement_id: UUID[i % 2], lourds: [{ fichier: "/api/plan/" + SLUGS[i % 2] + "?slug=" + SLUGS[i % 2], transfertKo: 900 }], donnees_ms: 5000, affiche_ms: 7000 }));
  }
  const { corps } = P.fiche({ releves: rel, bilans: [], aujourdhui: AUJ });
  const nu = SLUGS.every((s) => !corps.includes(s)) && !corps.includes(UUID[0]) && !corps.includes(UUID[1]);
  dit(nu, "le corps ne contient ni slug ni identifiant de salon");
  const etiq = UUID.map((u) => "salon-" + crypto.createHash("md5").update(u).digest("hex").slice(0, 4));
  dit(etiq.every((e) => corps.includes(e)), "il nomme chaque salon par « salon- » et 4 hexadécimaux", etiq.join(" "));
  dit(P.etiquette(UUID[0]) === etiq[0] && /^salon-[0-9a-f]{4}$/.test(P.etiquette(UUID[0])) && P.etiquette(UUID[0]) === P.etiquette(UUID[0]),
    "la même étiquette pour le même evenement_id, égale au md5 de la base");
  dit(!/(sbp_|Bearer|eyJ)/.test(corps), "aucun jeton dans le corps");
}
{ const q = P.requetes(AUJ).join("\n");
  dit(!/slug|\bnom\b/i.test(q) && /left\(md5\(evenement_id::text\), 4\)/.test(q), "les requêtes ne ramènent ni slug ni nom ; l'étiquette se calcule en SQL"); }

console.log("La semaine sans relevé");
{ const r = P.fiche({ releves: [], bilans: [], aujourdhui: AUJ });
  dit(r.vide === true && /aucun relevé/i.test(r.corps), "aucun relevé : le script le dit et ne publie rien"); }
dit(P.lundiDe("2026-10-21") === "2026-10-19" && P.lundiDe("2026-10-19") === "2026-10-19" && P.lundiDe("2026-10-25") === "2026-10-19", "la semaine porte la date de son lundi");

console.log("Sans jeton");
{ const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "perf-"));
  const f = path.join(dossier, "releves.json");
  const rel = [];
  for (let i = 0; i < 10; i++) rel.push(visite(i, { donnees_ms: 4000, affiche_ms: 6000 }));
  fs.writeFileSync(f, JSON.stringify({ aujourdhui: AUJ, releves: rel, bilans: [] }));
  const env = Object.assign({}, process.env); delete env.SUPABASE_ACCESS_TOKEN; delete env.GH_TOKEN; delete env.GITHUB_TOKEN;
  let sortie = "", code = 0;
  try { sortie = execFileSync(process.execPath, [path.join(__dirname, "..", "performances.js"), "--sec", "--depuis", f], { env, encoding: "utf8" }); }
  catch (e) { code = e.status || 1; sortie = String(e.stdout) + String(e.stderr); }
  dit(code === 0 && /Performances — semaine du 2026-10-19/.test(sortie), "--sec --depuis tourne sans jeton et imprime la fiche", "code " + code);
  fs.rmSync(dossier, { recursive: true, force: true });
}

if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
console.log("\ntout est ok");
