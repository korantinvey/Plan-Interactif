/**
 * La source du salon de démonstration : un salon réel, tel que l'API publique
 * le sert à un visiteur.
 *
 *   npm run source-demo            (FEP27, le salon par défaut)
 *   npm run source-demo -- autre   (un autre slug publié)
 *
 * `outils/demo.js` en garde la géométrie, l'apparence, les dessins et les
 * zones, et en invente tout le reste. On la range ici, versionnée, pour la
 * même raison que `plans.json` : la construction tourne sans réseau, et rien
 * n'y est plus exposé que ce que la page publique du salon montre déjà.
 *
 * Trois choses en sont retirées dès la lecture, parce qu'elles ne servent pas
 * et vieilliraient mal : les adresses des logos — signées, elles expirent —,
 * leurs clés de vignette, et le logo déposé sur une zone.
 */
const fs = require("fs");
const path = require("path");

const SLUG = process.argv[2] || "fep27";
const ORIGINE = process.env.PLAN_ADRESSE || "https://plan-interactif.interactiveplan.workers.dev";
const SORTIE = path.join(__dirname, "..", "donnees", "source-demo.json");

(async () => {
  const r = await fetch(ORIGINE + "/api/plan?slug=" + encodeURIComponent(SLUG));
  if (!r.ok) throw new Error("lecture de " + SLUG + " : HTTP " + r.status);
  const d = await r.json();
  if (d.erreur) throw new Error(d.erreur);

  const sansLogo = (s) => {
    delete s.logo; delete s.vignette; delete s.vignetteWebp;
    (s.coex || []).forEach(sansLogo);
  };
  for (const p of d.plans) {
    p.stands.forEach(sansLogo);
    p.zones.forEach((z) => { delete z.logo; });
  }
  delete d.favicon;
  delete d.app;
  d.source = { slug: SLUG, lu_le: new Date().toISOString().slice(0, 10) };

  fs.writeFileSync(SORTIE, JSON.stringify(d) + "\n");
  console.log(SLUG + " : " + d.plans.map((p) => p.libelle + ", " + p.stands.length + " emplacements").join(" ; ") +
    " → " + path.relative(process.cwd(), SORTIE) + " (" + Math.round(fs.statSync(SORTIE).size / 1024) + " Ko)");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
