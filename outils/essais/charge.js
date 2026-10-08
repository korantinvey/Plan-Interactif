#!/usr/bin/env node
/**
 * Essai de charge : N visiteurs qui arrivent en même temps sur un plan.
 *
 * Chaque visiteur refait ce que fait la page, dans le même ordre :
 *   1. la page elle-même (`/plan?plan=<salon>`), servie par Cloudflare ;
 *   2. l'entête de version et le plan, en parallèle — comme `demandePlan` ;
 *   3. puis, tant que dure sa visite, un paquet de mesures toutes les trente
 *      secondes environ — le rythme de `MESURE_DELAI`, qui est un plafond :
 *      un vrai visiteur en envoie plutôt moins.
 *
 * Les mesures visent par défaut un salon qui n'existe pas. Ce n'est pas une
 * précaution de façade : `enregistre_mesures` cherche alors l'événement, ne le
 * trouve pas et rend faux — toute la chaîne travaille (Worker, fonction, base),
 * rien ne s'écrit. Sans quoi trois mille visiteurs fictifs rejoindraient les
 * compteurs d'un vrai salon, et son rapport. `--ecrire` lève cette garde,
 * en connaissance de cause.
 *
 * Ce que l'essai ne dit pas : lancé d'une seule machine, il mesure aussi cette
 * machine et son lien. Une adresse qui tire trois mille connexions peut être
 * freinée par Cloudflare comme une attaque — des 429 ou des 403 en série
 * parlent alors de l'essai, pas du plan.
 *
 *   node outils/essais/charge.js --base https://… --salon smcl-2026
 *        [--visiteurs 3000] [--montee 60] [--duree 300] [--ecrire] [--journee]
 */
"use strict";

const args = process.argv.slice(2);
const opt = (nom, defaut) => {
  const i = args.indexOf("--" + nom);
  if (i < 0) return defaut;
  const v = args[i + 1];
  return v === undefined || v.startsWith("--") ? true : v;
};

const BASE = String(opt("base", "")).replace(/\/$/, "");
const SALON = opt("salon", "");
const VISITEURS = Number(opt("visiteurs", 3000));
const MONTEE = Number(opt("montee", 60)) * 1000;
const DUREE = Number(opt("duree", 300)) * 1000;
const ECRIRE = opt("ecrire", false) === true;
const JOURNEE = opt("journee", false) === true;
const SALON_MESURE = ECRIRE ? SALON : "essai-de-charge-inexistant";

if (!BASE || !SALON) {
  console.error("Usage : node outils/essais/charge.js --base https://… --salon <slug> [--visiteurs 3000] [--montee 60] [--duree 300] [--ecrire] [--journee]");
  process.exit(2);
}

/* Les relevés, par sorte d'appel : durées, codes, et ce que dit le cache. */
const releves = {};
const releve = (sorte) => releves[sorte] ||= { durees: [], codes: {}, cache: {}, octets: 0, pannes: {} };
let enCours = 0, pic = 0, total = 0;
const parSeconde = new Map();

async function appel(sorte, url, init) {
  const r = releve(sorte);
  const t0 = performance.now();
  enCours++; pic = Math.max(pic, enCours); total++;
  try {
    const rep = await fetch(url, { ...init, signal: AbortSignal.timeout(30000) });
    const corps = await rep.arrayBuffer();
    r.durees.push(performance.now() - t0);
    r.codes[rep.status] = (r.codes[rep.status] || 0) + 1;
    const c = rep.headers.get("x-cache");
    if (c) r.cache[c] = (r.cache[c] || 0) + 1;
    r.octets += corps.byteLength;
    return rep;
  } catch (e) {
    // une panne compte comme une réponse : c'est justement ce qu'on cherche
    const cause = e.name === "TimeoutError" ? "délai dépassé" : (e.cause?.code || e.message);
    r.pannes[cause] = (r.pannes[cause] || 0) + 1;
    r.durees.push(performance.now() - t0);
    return null;
  } finally {
    enCours--;
    const s = Math.floor((Date.now() - debut) / 1000);
    parSeconde.set(s, (parSeconde.get(s) || 0) + 1);
  }
}

const attends = (ms) => new Promise((ok) => setTimeout(ok, ms));
const jetonVisiteur = () => Math.random().toString(36).slice(2, 14);

async function visiteur() {
  const api = BASE + "/api/plan?slug=" + encodeURIComponent(SALON);
  await appel("page", BASE + "/plan?plan=" + encodeURIComponent(SALON));
  await Promise.all([
    appel("entête", api + "&entete=1"),
    appel("plan", api),
  ]);
  if (JOURNEE) {
    await appel("charge", BASE + "/api/charge?slug=" + encodeURIComponent(SALON));
  }

  const qui = jetonVisiteur();
  const fin = Date.now() + DUREE;
  let premier = true;
  while (Date.now() < fin) {
    // l'écart aléatoire évite que tous les paquets partent au même tic
    await attends(premier ? 2000 + Math.random() * 5000 : 25000 + Math.random() * 10000);
    if (Date.now() >= fin) break;
    const gestes = premier
      ? [{ genre: "visite" }]
      : [{ genre: "recherche" }, { genre: "fiche_stand", canal: "liste" }];
    premier = false;
    await appel("mesure", BASE + "/api/mesure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: SALON_MESURE, visiteur: qui, support: "web", gestes }),
    });
  }
}

const centile = (t, p) => {
  if (!t.length) return 0;
  const s = [...t].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};
const ms = (x) => Math.round(x) + " ms";

function bilan() {
  const duree = (Date.now() - debut) / 1000;
  console.log("\n— Bilan —");
  console.log(`${VISITEURS} visiteurs, arrivés en ${MONTEE / 1000} s, ${DUREE / 1000} s de visite chacun ; ${Math.round(duree)} s en tout.`);
  console.log(`${total} appels ; pic de ${pic} appels simultanés ; ${Math.max(...parSeconde.values())} appels au plus fort d'une seconde.`);
  console.log(`Mesures ${ECRIRE ? "ÉCRITES dans le salon " + SALON : "adressées à un salon inexistant (rien d'écrit)"}.\n`);
  for (const [sorte, r] of Object.entries(releves)) {
    const n = r.durees.length;
    const pannes = Object.values(r.pannes).reduce((a, b) => a + b, 0);
    const erreurs = Object.entries(r.codes).filter(([c]) => c >= 500 || c == 429).reduce((a, [, n]) => a + n, 0);
    console.log(`${sorte.padEnd(7)} ${String(n).padStart(6)} appels  médiane ${ms(centile(r.durees, 50)).padStart(8)}  p95 ${ms(centile(r.durees, 95)).padStart(8)}  p99 ${ms(centile(r.durees, 99)).padStart(8)}  max ${ms(centile(r.durees, 100)).padStart(8)}`);
    console.log(`        codes ${JSON.stringify(r.codes)}` +
      (Object.keys(r.cache).length ? `  cache ${JSON.stringify(r.cache)}` : "") +
      (pannes ? `  pannes ${JSON.stringify(r.pannes)}` : "") +
      `  ${(r.octets / 1e6).toFixed(1)} Mo` +
      (erreurs || pannes ? `  ⚠ ${(((erreurs + pannes) / n) * 100).toFixed(1)} % en échec` : ""));
  }
}

const debut = Date.now();
// hors terminal, un retour chariot par seconde ferait un journal illisible
const suivi = setInterval(() => {
  const t = Math.round((Date.now() - debut) / 1000);
  const ligne = `${t} s — ${total} appels, ${enCours} en cours, pic ${pic}`;
  if (process.stdout.isTTY) process.stdout.write("\r" + ligne + "   ");
  else if (t % 10 === 0) console.log(ligne);
}, 1000);
process.on("SIGINT", () => { clearInterval(suivi); bilan(); process.exit(1); });

console.log(`Essai de charge : ${VISITEURS} visiteurs sur ${BASE}, salon ${SALON}.`);
Promise.all(
  Array.from({ length: VISITEURS }, () => attends(Math.random() * MONTEE).then(visiteur)),
).then(() => { clearInterval(suivi); bilan(); });
