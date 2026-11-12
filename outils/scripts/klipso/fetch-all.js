/* Récupère tous les pavillons de l'événement : plan, calques d'habillage,
   stands avec formes, zones de dessin. Un dossier par plan.            */
const fs = require("fs"), path = require("path");

const KEY  = process.env.KLIPSO_API_KEY;
const INST = "infoprodigital";
const B    = `https://${INST}.svc.calypso-event.net/${INST}`;
const EV   = "3cad0e36-eaaf-f011-a8d8-005056ac7c95";
const OUT  = __dirname;

let tok = null, exp = 0;
async function token() {
  if (tok && Date.now() < exp) return tok;
  const r = await fetch(`${B}/account/getApiKeyAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "Application/Json", "X-GAIA-ClientApp": "ApiWsFO" },
    body: JSON.stringify({ apiKey: KEY }),
  }).then(r => r.json());
  if (!r.isValid) throw new Error("authentification refusée");
  tok = r.data.accessToken; exp = Date.now() + 13 * 60000;
  return tok;
}

async function entetes() {
  return { "Content-Type": "Application/Json", "Authorization": "Bearer " + (await token()),
           "X-GAIA-ClientApp": "ApiWsFO", "X-GAIA-EventId": EV };
}

async function get(body) {
  const r = await fetch(`${B}/entity/get`, { method: "POST", headers: await entetes(), body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.isValid) throw new Error(JSON.stringify(j.error));
  return j;
}

/* pagination : sans tri explicite la même ligne peut revenir deux fois */
async function tout(entite, spec) {
  const out = [];
  for (let start = 1; ; start += 500) {
    const j = await get({ [entite]: { ...spec, inlineCount: true, start, take: 500 } });
    out.push(...(j.data || []));
    if (!j.data || !j.data.length || out.length >= j.count) return out;
  }
}

const eq = (champ, val) => ({ type: "Condition", leftOperand: { type: "FieldPath", fieldPath: champ },
                              operator: "Equal", rightOperand: { type: "Value", value: val } });

(async () => {
  const plans = (await get({ Plan: { fields: ["_AllFields"], inlineCount: true, start: 1, take: 50 } })).data;
  console.log("pavillons :", plans.length);

  const index = [];
  for (const plan of plans) {
    const id = plan.Id;
    console.log("\n== " + plan.Libelle + "  (" + plan.HallExp + ")");
    const dossierSvg = path.join(OUT, "svg", id);
    fs.mkdirSync(dossierSvg, { recursive: true });

    const calques = await tout("Calque", {
      fields: ["Id", "IdPlan", "Libelle", "Type", "Ordre", "VisibleParDefaut",
               "CouleurRemplissage", "CouleurLigne", "CouleurTexte", "SVG"],
      filter: eq("IdPlan", id), order: [{ fieldPath: "Ordre", direction: "asc" }],
    });

    for (const c of calques.filter(c => c.SVG && c.SVG.idMedia)) {
      const r = await fetch(`${B}/media/getById?idMedia=${c.SVG.idMedia}`, { headers: await entetes() });
      const txt = await r.text();
      fs.writeFileSync(path.join(dossierSvg, c.Libelle + ".svg"), txt);
      console.log("   svg", c.Libelle.padEnd(36), (txt.length / 1024).toFixed(0).padStart(5), "Ko");
    }

    const stands = await tout("Stand", {
      fields: ["Id", "IdPlan", "IdIlot", "IdDossierExpAff", "NomSurPlan", "Enseigne", "Allee", "NoStand",
               "Allee2", "NoStand2", "NbAngles", "NbNiveau", "Longueur", "Largeur", "SurfaceBrute",
               "EtatCommercialisation", "StandFictif", "x_CouleurPlan"],
      entities: {
        SetStandShapeStand: { fields: ["Shape", "IdCalque", "SurfaceBrute"] },
        RefDossierExpAff: { fields: ["Id", "AvancementImplantation", "x_ExcluListeexposants",
                                     "x_Catalogue_RaisonSociale", "x_Nomenclature", "x_Catalogue_SiteWeb",
                                     "x_Catalogue_PresentationSociete>fr;en", "Categorie"] },
      },
      filter: eq("IdPlan", id), order: [{ fieldPath: "Id", direction: "asc" }],
    });

    const zones = await tout("ZoneDessin", { fields: ["_AllFields"], filter: eq("IdPlan", id),
                                             order: [{ fieldPath: "Id", direction: "asc" }] });
    console.log("   stands", stands.length, "| zones", zones.length, "| calques", calques.length);

    fs.mkdirSync(path.join(OUT, "brut"), { recursive: true });
    fs.writeFileSync(path.join(OUT, "brut", id + ".json"), JSON.stringify({ plan, calques, stands, zones }));
    index.push({ id, libelle: plan.Libelle, hall: plan.HallExp, stands: stands.length, zones: zones.length });
  }
  fs.writeFileSync(path.join(OUT, "brut", "index.json"), JSON.stringify(index, null, 1));
  console.log("\n→ brut/ écrit :", index.map(p => p.libelle + " " + p.stands + "st").join(" | "));
})().catch(e => { console.error("ECHEC:", e.message); process.exit(1); });
