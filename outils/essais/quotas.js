/**
 * La surveillance des quotas, sur des mesures fabriquées.
 *
 * Un jour de salon qui brûle les écritures KV doit crier avant d'atteindre la
 * limite ; une matinée trop jeune ne doit pas projeter un pic sur la journée ;
 * un projet Supabase en pause doit passer au rouge ; un indicateur qui se
 * dégrade doit, seul, déclencher l'alerte ; et la fiche, publiée dans un dépôt
 * public, ne doit donner ni compte ni jeton.
 *
 *   node outils/essais/quotas.js     (lancé par `npm run essais`)
 */
const { LIMITES, joursCloudflare, bilan, corps, degradations, niveauxPrecedents } = require("../scripts/quotas.js");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

const jour = (date, o = {}) => ({ date, requetes: 0, erreurs: 0, lectures: 0, ecritures: 0, suppressions: 0, listes: 0, ...o });
const supabaseSain = (o = {}) => ({
  statut: "ACTIVE_HEALTHY", forfait: "pro", baseOctets: 120 * 1024 * 1024, stockageOctets: 0,
  utilisateurs: 3, fonctions24h: 2000, sortie24hOctets: 50 * 1024 * 1024, manques: [], ...o,
});
const ligne = (b, cle) => b.lignes.find((l) => l.cle === cle);

// --- les rangées de l'API GraphQL ramenées à un jour par rangée
{
  const c = joursCloudflare({
    workers: [{ dimensions: { date: "2026-11-06" }, sum: { requests: 900, errors: 2 } },
              { dimensions: { date: "2026-11-06" }, sum: { requests: 100, errors: 0 } }],
    kv: [{ dimensions: { date: "2026-11-06", actionType: "read" }, sum: { requests: 700 } },
         { dimensions: { date: "2026-11-06", actionType: "write" }, sum: { requests: 40 } },
         { dimensions: { date: "2026-11-05", actionType: "write" }, sum: { requests: 10 } }],
    stockage: [{ dimensions: { date: "2026-11-05", namespaceId: "a" }, max: { byteCount: 5 } },
               { dimensions: { date: "2026-11-06", namespaceId: "a" }, max: { byteCount: 7 } },
               { dimensions: { date: "2026-11-06", namespaceId: "b" }, max: { byteCount: 3 } }],
  });
  const j6 = c.jours.find((j) => j.date === "2026-11-06");
  dit(j6.requetes === 1000 && j6.erreurs === 2, "requêtes du Worker additionnées par jour", JSON.stringify(j6));
  dit(j6.lectures === 700 && j6.ecritures === 40, "opérations KV rangées par sorte");
  dit(c.jours[0].date === "2026-11-05", "jours dans l'ordre");
  dit(c.stockageOctets === 10, "place occupée : dernier jour, tous espaces confondus", String(c.stockageOctets));
}

// --- un jour de salon : 600 écritures KV à midi, en gratuit, projette 1 200
{
  const midi = new Date("2026-11-06T12:00:00Z");
  const b = bilan({
    cloudflare: { jours: [jour("2026-11-05", { ecritures: 80 }), jour("2026-11-06", { requetes: 20000, ecritures: 600 })], stockageOctets: 1e6 },
    supabase: supabaseSain(),
  }, { forfaitCloudflare: "gratuit" }, midi);
  const e = ligne(b, "cloudflare.ecritures");
  dit(e.utilise === 600 && e.limite === LIMITES.cloudflare.gratuit.ecritures, "écritures du jour contre 1 000", e.utilise + "/" + e.limite);
  dit(Math.round(e.projection) === 1200, "projetées sur la journée", String(e.projection));
  dit(e.niveau === "critique", "au rouge avant la limite", e.niveau);
  dit(e.pire === 80, "le pire jour passé du mois", String(e.pire));
  dit(ligne(b, "cloudflare.requetes").niveau === "ok", "20 000 requêtes à midi : au vert");
  dit(ligne(b, "supabase.etat").niveau === "ok" && ligne(b, "supabase.forfait").niveau === "ok", "Supabase Pro sain : au vert");
}

// --- à une heure du matin, un pic ne se projette pas
{
  const b = bilan({
    cloudflare: { jours: [jour("2026-11-06", { ecritures: 100 })], stockageOctets: 0 },
    supabase: supabaseSain(),
  }, {}, new Date("2026-11-06T01:00:00Z"));
  const e = ligne(b, "cloudflare.ecritures");
  dit(e.projection == null && e.niveau === "ok", "pas de projection avant deux heures", e.niveau);
}

// --- en payant, le mois civil compte, et le dépassement est facturé
{
  const b = bilan({
    cloudflare: { jours: [jour("2026-11-01", { requetes: 3e6 }), jour("2026-11-02", { requetes: 3e6 })], stockageOctets: 0 },
    supabase: supabaseSain(),
  }, { forfaitCloudflare: "payant" }, new Date("2026-11-03T00:00:00Z"));
  const r = ligne(b, "cloudflare.requetes");
  dit(r.utilise === 6e6 && r.periode === "mois", "requêtes cumulées sur le mois", String(r.utilise));
  dit(r.niveau === "critique" && r.bloquant === false, "6 M en deux jours : au rouge, mais facturé", r.niveau);
}

// --- Supabase : projet en pause, forfait gratuit, base pleine aux trois quarts
{
  const b = bilan({
    cloudflare: { absent: "CLOUDFLARE_API_TOKEN ou CLOUDFLARE_ACCOUNT_ID manque" },
    supabase: supabaseSain({ statut: "INACTIVE", forfait: "free", baseOctets: 380 * 1024 * 1024, fonctions24h: 20000 }),
  }, {}, new Date("2026-11-06T12:00:00Z"));
  dit(ligne(b, "supabase.etat").niveau === "critique", "projet en pause : au rouge");
  dit(ligne(b, "supabase.forfait").niveau === "attention", "forfait gratuit : signalé");
  dit(ligne(b, "supabase.base").niveau === "attention", "base à 76 % de 500 Mo : à l'orange", String(ligne(b, "supabase.base").part));
  const f = ligne(b, "supabase.fonctions");
  dit(f.projection === 600000 && f.niveau === "critique", "20 000 appels par jour : 600 000 au mois, au-delà de 500 000", f.niveau);
  dit(ligne(b, "cloudflare").niveau === "inconnu", "Cloudflare sans jeton : inconnu, sans faire tomber le reste");
}

// --- l'alerte ne part que sur ce qui se dégrade
{
  const au = new Date("2026-11-06T12:00:00Z");
  const mesures = (ecritures) => ({
    cloudflare: { jours: [jour("2026-11-06", { ecritures })], stockageOctets: 0 }, supabase: supabaseSain(),
  });
  const avant = niveauxPrecedents(corps(bilan(mesures(100), {}, au)));
  dit(avant["cloudflare.ecritures"] === "ok", "l'état se relit dans le corps de l'issue");
  const pire = bilan(mesures(400), {}, au);
  const d = degradations(pire, avant);
  dit(d.length === 1 && d[0].cle === "cloudflare.ecritures", "une seule ligne se dégrade", d.map((x) => x.cle).join(","));
  dit(degradations(pire, niveauxPrecedents(corps(pire))).length === 0, "rien de neuf : pas d'alerte");
  dit(degradations(bilan(mesures(100), {}, au), niveauxPrecedents(corps(pire))).length === 0, "une amélioration n'alerte pas");
  dit(Object.keys(niveauxPrecedents("pas d'état ici")).length === 0, "un corps sans état se lit vide");
}

// --- la fiche est publique
{
  const b = bilan({
    cloudflare: { jours: [jour("2026-11-06", { ecritures: 10 })], stockageOctets: 2048 },
    supabase: supabaseSain(),
  }, {}, new Date("2026-11-06T12:00:00Z"));
  const t = corps(b);
  dit(t.includes("KV — écritures") && t.includes("| 🟢 |"), "la fiche liste les lignes");
  dit(!/accountTag|Bearer|jylkfskotuafptaxujao/.test(t), "ni compte, ni jeton, ni projet");
}

console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
process.exit(ko ? 1 : 0);
