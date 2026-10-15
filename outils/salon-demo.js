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
 *   - l'apparence et les dessins ne sont posés qu'à la création d'un
 *     pavillon — ceux de la console l'emportent ensuite ;
 *   - l'instantané, le programme, les produits et les logos, eux, sont
 *     refaits : ce sont les données.
 *
 * Quand la source change de plan (`npm run source-demo` sur un autre salon),
 * les pavillons d'avant sont retirés et les réglages du salon — fiche, zones
 * masquées, calage — reprennent ceux de la nouvelle source.
 *
 * Les logos entrent dans `vignette_de_logo` comme ceux qu'une console aurait
 * fabriqués, sous l'adresse `<site>/logo.webp` de chaque société : un domaine
 * en `.example`, qui ne mène nulle part, et que seule la vignette sert.
 */
const crypto = require("crypto");
const { PROJETS } = require("./projet.js");
const { salonDemo, lisSource } = require("./demo.js");

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
  const { sansLogo, ...salon } = salonDemo(lisSource());
  if (sansLogo) console.warn(sansLogo + " société(s) sans logo — npm run logos-demo");

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

  /* L'événement : créé une fois, puis laissé à la console — sauf quand le plan
     lui-même change (une autre source) : ses réglages de salon désignaient
     alors des zones qui n'existent plus, et on repose ceux de la source. */
  const maintenant = new Date().toISOString();
  const masquees = Object.fromEntries(salon.plans.flatMap((p) => (p.zonesCachees || []).map((z) => [z.id, true])));
  const reglagesDuSalon = {
    fiche: salon.fiche, calage: salon.calage, fuseau_choisi: salon.fuseau,
    zones: {}, zones_masquees: masquees, zones_traversables: salon.zonesTraversables,
    zones_fiches: {}, salles: {},
  };
  let [evt] = await base("evenement?select=id,nom,etat&slug=eq." + SLUG, {}, "Lecture de l'événement");
  let neuf = false;
  if (!evt) {
    [evt] = await ecrit("evenement", [{
      nom: salon.evenement, slug: SLUG, instance: INSTANCE, rythme_min: 0, etat: "publie",
      libelles_en: salon.anglais, derniere_sync: maintenant, ...reglagesDuSalon,
    }], "slug", "Création de l'événement");
    neuf = true;
    console.log("Événement créé : " + evt.nom);
  }

  /* Les pavillons d'avant qui ne sont plus dans la source s'en vont, avec
     leurs calques, leur instantané, leur apparence et leurs dessins. */
  const avant = await base("plan?select=id,id_klipso&evenement_id=eq." + evt.id, {}, "Lecture des pavillons");
  const voulus = new Set(salon.plans.map((p) => p.id));
  const partants = avant.filter((p) => !voulus.has(p.id_klipso));
  if (partants.length) {
    await base("plan?id=in.(" + partants.map((p) => p.id).join(",") + ")", { method: "DELETE" },
      "Retrait des pavillons d'avant");
    console.log(partants.length + " pavillon(s) d'avant retiré(s)");
  }
  const changeDePlan = !neuf && (partants.length > 0 || salon.plans.some((p) => !avant.some((a) => a.id_klipso === p.id)));
  await base("evenement?id=eq." + evt.id, {
    method: "PATCH",
    body: JSON.stringify({ libelles_en: salon.anglais, derniere_sync: maintenant,
      ...(changeDePlan ? reglagesDuSalon : {}) }),
  }, "Mise à jour de l'événement");
  if (!neuf) console.log("Événement repris : " + evt.nom + " (" + evt.etat + ")" +
    (changeDePlan ? " — réglages du salon reposés pour le nouveau plan" : ""));

  for (const p of salon.plans) {
    const nouveau = !avant.some((a) => a.id_klipso === p.id);
    const [pl] = await ecrit("plan", [{
      evenement_id: evt.id, id_klipso: p.id, libelle: p.libelle, hall: p.hall, calage: p.calage,
      emprise: p.emprise, nb_stands: p.stands.length, nb_zones: p.zones.length, modifie_le: maintenant,
    }], "evenement_id,id_klipso", "Écriture du pavillon " + p.libelle);

    await ecrit("calque", p.fond.map((c) => ({
      plan_id: pl.id, id_klipso: uuid("calque|" + p.id + "|" + c.cle), cle: c.cle, libelle: c.nom,
      type: null, ordre_klipso: c.ordre, svg: c.svg,
    })), "plan_id,id_klipso", "Écriture des calques de " + p.libelle);

    /* Les zones que la source masque y entrent aussi : la base les garde dans
       l'instantané, et c'est `zones_masquees` qui les retire au visiteur. */
    const zones = [...p.zones, ...(p.zonesCachees || []).filter((z) => !p.zones.some((x) => x.id === z.id))
      .map((z) => ({ ...z, nom: null }))];
    await ecrit("instantane", [{
      plan_id: pl.id, genere_le: maintenant,
      charge: { stands: p.stands, zones, conferences: p.conferences, emprise: p.emprise },
    }], "plan_id", "Écriture de l'instantané de " + p.libelle);

    // posée à la création seulement : ensuite, c'est la console qui règle
    await ecrit("apparence", [{ plan_id: pl.id, pile: p.apparence.pile, reglages: p.apparence.reglages }],
      "plan_id", "Apparence de " + p.libelle, true);

    /* Les dessins de même : ils se retouchent en administration, et un import
       qui les reposerait effacerait ce travail. */
    if (nouveau && p.dessins.length) {
      await base("calque_dessin", {
        method: "POST",
        body: JSON.stringify(p.dessins.map((d, rang) => ({
          plan_id: pl.id, cle: d.id, nom: d.nom, couleur: d.couleur, rempli: Boolean(d.rempli),
          visible: d.visible !== false, rang, formes: d.formes || [],
        }))),
      }, "Écriture des dessins de " + p.libelle);
    }

    console.log(p.libelle + " : " + p.stands.length + " stands, " + p.zones.length + " zones, " +
      p.conferences.length + " conférences, " +
      p.stands.reduce((a, s) => a + (s.produits || []).length, 0) + " produits, " +
      p.dessins.length + " dessins" + (nouveau ? "" : " (dessins et apparence gardés)"));
  }

  const lignes = [...vignettes.values()];
  for (let i = 0; i < lignes.length; i += 100) {
    await ecrit("vignette_de_logo", lignes.slice(i, i + 100), "cle", "Écriture des logos");
  }
  console.log(lignes.length + " logos");
  console.log("Prêt : /plan-admin?plan=" + SLUG + " pour le régler, /plan-" + SLUG + " pour le voir.");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
