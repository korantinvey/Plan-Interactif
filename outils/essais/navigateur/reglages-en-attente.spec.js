/**
 * Les réglages d'apparence restés en attente, réparés après un rechargement
 * (`configuration.mjs` `REGLAGES_EN_ATTENTE`, `enregistrement.mjs`
 * `noteReglagesCharges`).
 *
 * Un envoi qui passe sur un pavillon puis échoue sur l'autre laisse la base en
 * désaccord : le pavillon le plus récent porte la valeur neuve, l'autre
 * l'ancienne. La référence réunie du chargement porte la neuve, et l'envoi, qui
 * ne pose que ce qui en diffère, ne réparait rien. On recharge ici dans cet
 * état, la valeur neuve en attente sur le poste, et l'on éprouve que l'envoi
 * qui suit la porte à chaque pavillon — puis que l'attente se vide.
 *
 * La session de l'exploitant et la base sont simulées : rien ne sort.
 */
const { test, expect } = require("@playwright/test");
const { prepare, attendLaListe, DONNEES } = require("./aide");

const BASE = "https://base.essai";

test("un réglage resté en attente sur un pavillon y repart après le rechargement", async ({ page }) => {
  const erreurs = await prepare(page);
  // le pavillon le plus récent a reçu la couleur neuve, les autres non
  const donnees = JSON.parse(JSON.stringify(DONNEES));
  donnees.plans.forEach((p, i) => {
    p.apparence = {
      pile: [],
      reglages: { _essai: { couleur: i === 0 ? "#222222" : "#111111" } },
      modifie_le: i === 0 ? "2026-11-13T10:00:00Z" : "2026-11-13T09:00:00Z",
    };
  });
  const enBase = Object.fromEntries(donnees.plans.map((p, i) => ["u" + i, p.apparence.reglages]));

  await page.addInitScript((base) => {
    localStorage.setItem("console-config", JSON.stringify({ url: base, anonKey: "anon" }));
    localStorage.setItem("console-session", JSON.stringify({ access_token: "a.b.c" }));
    localStorage.setItem("plan-conf-attente:smcl-2026",
      JSON.stringify({ _essai: JSON.stringify({ couleur: "#222222" }) }));
  }, BASE);
  await page.route("**/api/plan*", (r) => {
    const u = new URL(r.request().url());
    if (u.searchParams.get("entete")) return r.fulfill({ json: { v: "essai-attente" } });
    return r.fulfill({ status: 200, contentType: "application/json", headers: { "X-Version": "essai-attente" },
      body: JSON.stringify(donnees) });
  });
  const fusions = [];
  await page.route(BASE + "/**", (r) => {
    const req = r.request();
    const url = new URL(req.url());
    if (url.pathname === "/auth/v1/user") return r.fulfill({ json: { id: "u1" } });
    if (url.pathname === "/rest/v1/evenement") return r.fulfill({ json: [{ id: "e1" }] });
    if (url.pathname === "/rest/v1/plan") {
      return r.fulfill({ json: donnees.plans.map((p, i) => ({ id: "u" + i, id_klipso: p.id })) });
    }
    if (url.pathname === "/rest/v1/apparence" && req.method() === "GET") {
      return r.fulfill({ json: Object.entries(enBase).map(([plan_id, reglages]) => ({ plan_id, reglages })) });
    }
    if (url.pathname === "/rest/v1/rpc/fusionne_apparence") {
      fusions.push(JSON.parse(req.postData() || "{}"));
      return r.fulfill({ status: 204, body: "" });
    }
    if (req.method() !== "GET") return r.fulfill({ status: 204, body: "" });
    return r.fulfill({ json: [] });
  });

  await page.goto("/plan-admin.html?plan=smcl-2026");
  await attendLaListe(page);

  // l'envoi qui suit le chargement passe par chaque pavillon, la valeur neuve posée
  await expect.poll(() => fusions.length, { timeout: 20_000 }).toBe(donnees.plans.length);
  for (const f of fusions) {
    expect(f.p_posees && f.p_posees._essai, "pavillon " + f.p_plan_id).toEqual({ couleur: "#222222" });
  }
  // et, l'envoi réussi, plus rien n'attend sur le poste
  await expect.poll(() => page.evaluate(() => localStorage.getItem("plan-conf-attente:smcl-2026")))
    .toBeNull();
  expect(erreurs).toEqual([]);
});
