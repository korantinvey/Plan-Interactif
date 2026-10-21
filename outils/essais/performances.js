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

console.log("Les noms libres");
{ const rel = [];
  const noms = ["plan-fep27", "fep27-logo.png", "fep27.webp", "https://cdn.exemple.net/img/fep27-logo.png?slug=fep27", "plan.1321f61dd3.js"];
  for (let i = 0; i < 10; i++) rel.push(visite(i, { lourds: noms.map((n) => ({ fichier: n, transfertKo: 900 })), donnees_ms: 5000, affiche_ms: 7000 }));
  const { corps } = P.fiche({ releves: rel, bilans: [], aujourdhui: AUJ });
  const noms2 = P.indicateurs(rel)[0].lourds.map((l) => l.fichier);
  dit(!corps.includes("fep27") && !noms2.join().includes("fep27") && noms2.includes("autre fichier .png") && noms2.includes("autre fichier .webp"), "un nom libre (plan-fep27, fep27-logo.png, fep27.webp) ne sort pas : il est regroupé par extension", noms2.join(" | "));
  dit(noms2.includes("plan.1321f61dd3.js"), "un fichier versionné de nos pages garde son nom");
  dit(P.fichierPropre("/plan-fep27") === "autre fichier" && P.fichierPropre("fep27.php") === "autre fichier", "une extension inconnue n'est pas citée non plus");
}

console.log("L'injection markdown");
{ const mauvais = "@x ](http://e) <img src=x> #12 | `a` ![i](u)";
  const t = P.texteSur(mauvais);
  dit(!/[/@#[\]!<>`|]/.test(t), "texteSur retire / @ # [ ] ! < > ` |", JSON.stringify(t));
  dit(P.texteSur("x".repeat(200)).length === 60 && P.texteSur("Mali-G78 (ARM) · v1.2+") === "Mali-G78 (ARM) · v1.2+", "tronquée à 60, garde ._·+()- et les lettres");
  const rel = [];
  for (let i = 0; i < 10; i++) rel.push(visite(i, { systeme: "@x", carte: "](http://e) <img> #12 |", version: "v|1 [a](b)", immersif: false, pertes_contexte: 1 }));
  const { corps } = P.fiche({ releves: rel, bilans: [], aujourdhui: AUJ });
  dit(!/@x|\]\(|<img|#12|\[a\]/.test(corps), "ni mention, ni lien, ni image, ni titre venus des relevés ne passent dans le corps"); }

console.log("La semaine d'avant");
{ const bil = [
    { salon: "salon-aaaa", jour: jour(10), page: "plan", mobile: true, visites: 10, affiche_p50: 1000, donnees_p50: 500, part_plus33_p50: 0.1, gels_moy: 0, pertes_contexte: 1 },
    { salon: "salon-aaaa", jour: jour(9), page: "plan", mobile: true, visites: 30, affiche_p50: 2000, donnees_p50: 900, part_plus33_p50: 0.2, gels_moy: 1, pertes_contexte: 2 },
    { salon: "salon-aaaa", jour: jour(3), page: "plan", mobile: true, visites: 99, affiche_p50: 9999, donnees_p50: 1, part_plus33_p50: 0.9, gels_moy: 0, pertes_contexte: 0 }];
  const m = P.bilanSemaine(bil.map((b) => Object.assign({}, b)), jour(14), jour(8)).get("plan|true");
  dit(m && m.visites === 40 && Math.abs(m.affiche_p50 - 1750) < 1e-9 && Math.abs(m.donnees_p50 - 800) < 1e-9 && Math.abs(m.part_plus33_p50 - 0.175) < 1e-9 && m.pertes === 3,
    "bilanSemaine pondère par les visites et ignore les autres jours", JSON.stringify(m));
  const rel = []; for (let i = 0; i < 8; i++) rel.push(visite(i, { affiche_ms: 3500, donnees_ms: 1600, part_plus33_classique: 0.35 }));
  const { corps } = P.fiche({ releves: rel, bilans: bil, aujourdhui: AUJ });
  const ligne = (corps.match(/^\| plan \| téléphone.*$/m) || [""])[0];
  dit(/1750 ms \(\+100 %\)/.test(ligne) && /800 ms \(\+100 %\)/.test(ligne) && /18 % \(\+100 %\)/.test(ligne), "le tableau compare l'affichage, les données et les images lentes à la semaine d'avant", ligne); }
{ const q = P.requetes(AUJ)[0];
  dit(!/transfert_ko|pic_mo|gels/.test(q) && /case when jour >= '2026-10-21'::date - 7 then resume #> '\{chargement,lourds\}'|jsonb_typeof/.test(q) && /case when jour >= '2026-10-21'::date - 7 then resume #>> '\{appareil,systeme\}'/.test(q),
    "la lecture ne joint lourds, systeme, carte… que pour la semaine analysée, et laisse les colonnes inutiles"); }

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

console.log("La publication (gh factice)");
{ const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "perf-gh-"));
  const journal = path.join(dossier, "journal.jsonl");
  const faux = path.join(dossier, "gh");
  fs.writeFileSync(faux, `#!${process.execPath}
const fs = require("fs");
let entree = ""; process.stdin.on("data", (d) => (entree += d)).on("end", () => {
  const a = process.argv.slice(2);
  fs.appendFileSync(process.env.JOURNAL, JSON.stringify({ a, entree }) + "\\n");
  if (a[0] === "label" && a[1] === "list") console.log(process.env.FAUX_LIBELLES || "[]");
  else if (a[0] === "issue" && a[1] === "list") console.log(process.env.FAUX_ISSUES || "[]");
  else if (a[0] === "issue" && a[1] === "create") console.log("https://github.com/x/y/issues/9");
});
`, { mode: 0o755 });
  const f = path.join(dossier, "r.json");
  const rel = []; for (let i = 0; i < 10; i++) rel.push(visite(i, { donnees_ms: 4000 }));
  fs.writeFileSync(f, JSON.stringify({ aujourdhui: AUJ, releves: rel, bilans: [] }));
  const lance = (extra) => {
    fs.writeFileSync(journal, "");
    const env = Object.assign({}, process.env, { PATH: dossier + path.delimiter + process.env.PATH, JOURNAL: journal, GITHUB_REPOSITORY: "x/y" }, extra);
    delete env.SUPABASE_ACCESS_TOKEN;
    execFileSync(process.execPath, [path.join(__dirname, "..", "performances.js"), "--depuis", f], { env, encoding: "utf8" });
    return fs.readFileSync(journal, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  };
  const titre = "Performances — semaine du 2026-10-19";
  let c = lance({});
  const creation = c.find((x) => x.a[0] === "issue" && x.a[1] === "create");
  dit(creation && creation.a.includes(titre) && creation.a.includes("performances") && /Semaine analysée/.test(creation.entree), "l'issue n'existe pas : elle est créée, titrée par le lundi, étiquetée, corps en entrée");
  dit(c.some((x) => x.a[0] === "label" && x.a[1] === "create") && !c.some((x) => x.a.includes("--force")), "l'étiquette manquante est créée, sans --force");
  c = lance({ FAUX_ISSUES: JSON.stringify([{ number: 7, title: titre }]), FAUX_LIBELLES: JSON.stringify([{ name: "performances" }]) });
  const maj = c.find((x) => x.a[0] === "issue" && x.a[1] === "edit");
  dit(maj && maj.a[2] === "7" && !c.some((x) => x.a[1] === "create") && /Semaine analysée/.test(maj.entree), "l'issue existe : elle est mise à jour, ni créée ni étiquette recréée");
  fs.rmSync(dossier, { recursive: true, force: true });
}

if (ko) { console.log("\n" + ko + " échec(s)"); process.exit(1); }
console.log("\ntout est ok");
