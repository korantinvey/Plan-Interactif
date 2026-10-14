/**
 * Le salon de démonstration, écrit dans la base comme un vrai salon.
 *
 *   SUPABASE_SERVICE_ROLE_KEY=… node outils/salon-demo.js
 *   (ou le workflow « Salon de démonstration », qui va chercher la clé)
 *
 * `web/demo.html` montre le salon inventé de `outils/demo.js`, mais figé : rien
 * ne s'y règle. Écrit dans la base sous le slug `demo`, le même salon paraît
 * dans la console, s'ouvre en administration (`/plan-admin?plan=demo`) et se
 * publie à `/plan-demo` — calques à masquer, couleurs, fiches, comme ailleurs.
 *
 * La synchronisation ne le touche pas : elle refuse l'instance `demo`
 * (`sync-evenement` `INSTANCE_DEMO`). C'est d'ici que ses données viennent, et
 * relancer l'import les refait sans rien perdre de ce qui a été réglé :
 *
 *   - l'événement n'est créé qu'une fois ; ensuite seuls l'anglais des listes
 *     et la date des données sont repris — son nom, son état, ses zones
 *     renommées ou masquées restent ceux de la console ;
 *   - les pavillons et les calques gardent leurs identifiants, tirés du sel de
 *     `demo.js` : les réglages, rangés par identifiant de calque, retrouvent
 *     leur calque ;
 *   - l'apparence n'est posée qu'à la création — celle de la console
 *     l'emporte ensuite ;
 *   - l'instantané et les logos, eux, sont refaits : ce sont les données.
 *
 * Les logos entrent dans `vignette_de_logo` comme ceux qu'une console aurait
 * fabriqués, sous l'adresse `<site>/logo.webp` de chaque société : un domaine
 * en `.example`, qui ne mène nulle part, et que seule la vignette sert.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PROJETS } = require("./projet.js");
const { salonDemo } = require("./demo.js");

const SLUG = "demo";
const INSTANCE = "demo";

const URL_BASE = process.env.SUPABASE_URL || PROJETS.production.url;
const CLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!CLE) {
  console.error("SUPABASE_SERVICE_ROLE_KEY manque : la base n'écrit rien sans la clé de service.");
  process.exit(1);
}

/** Un appel à la base, qui échoue en disant ce qu'il faisait. */
async function base(chemin, options, quoi) {
  const r = await fetch(URL_BASE + "/rest/v1/" + chemin, {
    ...options,
    headers: {
      apikey: CLE, Authorization: "Bearer " + CLE, "Content-Type": "application/json",
      ...(options && options.headers),
    },
  });
  if (!r.ok) throw new Error(quoi + " : " + r.status + " " + (await r.text()).slice(0, 400));
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}
const ecrit = (table, lignes, conflit, quoi, garde) => base(
  table + "?on_conflict=" + conflit,
  {
    method: "POST", body: JSON.stringify(lignes),
    headers: { Prefer: "return=representation,resolution=" + (garde ? "ignore" : "merge") + "-duplicates" },
  },
  quoi,
);

/** Un uuid tiré d'une clé : le même à chaque import, donc les mêmes réglages. */
function uuid(cle) {
  const h = crypto.createHash("sha256").update("demo-2027|" + cle).digest("hex");
  return h.slice(0, 8) + "-" + h.slice(8, 12) + "-5" + h.slice(13, 16) + "-a" + h.slice(17, 20) + "-" + h.slice(20, 32);
}

/** La clé d'une vignette, comme la calcule le serveur (`_partage/vignette.ts` `cleDeVignette`). */
const cleDeVignette = (source) =>
  crypto.createHash("sha256").update(source).digest().subarray(0, 12).toString("hex");

/** Largeur et hauteur d'un WebP, lues dans son en-tête. */
function tailleWebp(b) {
  const sorte = b.toString("ascii", 12, 16);
  if (sorte === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (sorte === "VP8L") {
    const n = b.readUInt32LE(21);
    return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)];
  }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}

(async () => {
  const salon = salonDemo(JSON.parse(fs.readFileSync(path.join(__dirname, "plans.json"), "utf8")));

  /* Les logos : la page figée les porte en octets, la base les sert sous
     l'adresse de chaque société. */
  const vignettes = new Map();
  const versAdresse = (soc) => {
    if (!soc.vignette) return;
    const source = soc.site.replace(/\/$/, "") + "/logo.webp";
    const image = salon.vignettes[soc.vignette].replace(/^data:image\/webp;base64,/, "");
    const [largeur, hauteur] = tailleWebp(Buffer.from(image, "base64"));
    vignettes.set(source, {
      cle: cleDeVignette(source), source, format: "webp", image, largeur, hauteur,
      // la même pour le toit vu de près : elle est déjà sans fond
      grande: image, grande_detouree: true, pose: new Date().toISOString(),
    });
    delete soc.vignette;
    soc.logo = source;
  };
  salon.plans.forEach((p) => p.stands.forEach((s) => { versAdresse(s); (s.coex || []).forEach(versAdresse); }));

  /* L'événement : créé une fois, puis laissé à la console. */
  const maintenant = new Date().toISOString();
  let [evt] = await base("evenement?select=id,nom,etat&slug=eq." + SLUG, {}, "Lecture de l'événement");
  if (!evt) {
    [evt] = await ecrit("evenement", [{
      nom: salon.evenement, slug: SLUG, instance: INSTANCE, rythme_min: 0, etat: "publie",
      fuseau_choisi: salon.fuseau, libelles_en: salon.anglais, derniere_sync: maintenant,
    }], "slug", "Création de l'événement");
    console.log("Événement créé : " + evt.nom);
  } else {
    await base("evenement?id=eq." + evt.id, {
      method: "PATCH", body: JSON.stringify({ libelles_en: salon.anglais, derniere_sync: maintenant }),
    }, "Mise à jour de l'événement");
    console.log("Événement repris : " + evt.nom + " (" + evt.etat + ")");
  }

  for (const p of salon.plans) {
    const [pl] = await ecrit("plan", [{
      evenement_id: evt.id, id_klipso: uuid("plan|" + p.id), libelle: p.libelle, hall: p.hall,
      emprise: p.emprise, nb_stands: p.stands.length, nb_zones: p.zones.length, modifie_le: maintenant,
    }], "evenement_id,id_klipso", "Écriture du pavillon " + p.libelle);

    await ecrit("calque", p.fond.map((c) => ({
      plan_id: pl.id, id_klipso: uuid("calque|" + p.id + "|" + c.cle), cle: c.cle, libelle: c.nom,
      type: null, ordre_klipso: c.ordre, svg: c.svg,
    })), "plan_id,id_klipso", "Écriture des calques de " + p.libelle);

    await ecrit("instantane", [{
      plan_id: pl.id, genere_le: maintenant,
      charge: { stands: p.stands, zones: p.zones, conferences: p.conferences, emprise: p.emprise },
    }], "plan_id", "Écriture de l'instantané de " + p.libelle);

    /* Posée à la création seulement : ensuite, c'est la console qui règle.
       Les calques que les données figées masquent au départ — cotes,
       numérotation, qui doublent ce que le plan écrit — le sont ici aussi :
       la base ne garde pas ce drapeau, la configuration si. */
    const masques = Object.fromEntries(p.fond.filter((c) => c.visible === false)
      .map((c) => [c.cle, { visible: false }]));
    await ecrit("apparence", [{ plan_id: pl.id, reglages: { ...masques, ...p.apparence.reglages } }],
      "plan_id", "Apparence de " + p.libelle, true);

    console.log(p.libelle + " : " + p.stands.length + " stands, " + p.zones.length + " zones, " +
      p.conferences.length + " conférences, " + p.fond.length + " calques");
  }

  const lignes = [...vignettes.values()];
  for (let i = 0; i < lignes.length; i += 100) {
    await ecrit("vignette_de_logo", lignes.slice(i, i + 100), "cle", "Écriture des logos");
  }
  console.log(lignes.length + " logos");
  console.log("Prêt : /plan-admin?plan=" + SLUG + " pour le régler, /plan-" + SLUG + " pour le voir.");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
