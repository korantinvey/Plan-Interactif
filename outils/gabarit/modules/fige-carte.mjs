/* ============================================================
   16 ter. Les environs — le fond figé, photographié par l'exploitant

   Le fond de carte se dessinait chez chaque visiteur, et pour un fond
   vectoriel cela voulait dire MapLibre : huit cents kilo-octets de script, un
   second contexte WebGL, des tuiles entières à décoder, des gels de 0,4 à
   5,4 s sur FUNEXPO 2026 (sonde, 10 novembre 2026). Pour une image qui ne
   change jamais : même carré, même cap, même style.

   L'exploitant la photographie donc une fois, en enregistrant son calage. Le
   fond retenu — vectoriel ou en images, peu importe, tous passent par le même
   moteur — est peint hors de l'écran, orienté comme le plan, niveau par
   niveau (`lot-fige.mjs` `blocsDeCapture`), découpé en images carrées et
   rangé dans le seau public « environs » du projet. Le calage du pavillon
   reçoit le lot (`fige`), et le visiteur n'a plus que des images à poser
   (`environs.mjs`).

   Un geste d'exploitant : `plan-admin.mjs` l'embarque par `calage-carte.mjs`,
   `plan.mjs` jamais.
   ============================================================ */
import { P } from "./donnees.mjs";
import { accesBase, stockage } from "./session.mjs";
import { identifiants } from "./enregistrement.mjs";
import { CARTES, bornesDuFond, borneLeStyle, chargeMapLibre, vueGL, vueGLValable,
  styleDeLaCarte, figeAJour } from "./environs.mjs";
import { PX_FIGE, sourceDuFige, niveauxDuLot, blocsDeCapture, carreDuFond } from "./lot-fige.mjs";

const SEAU = "environs";
/* Le plus grand côté qu'on demande à la toile : c'est aussi la borne que
   MapLibre s'impose (`maxCanvasSize`), au-delà de laquelle il réduirait la
   finesse sans le dire. */
const TOILE_MAX = 4096;
/* Une vue dont les tuiles n'arrivent pas en une minute et demie ne
   viendra pas : le service est en panne, mieux vaut le dire. */
const ATTENTE_VUE = 90000;
/* Les envois partent quelques-uns à la fois : un seul ferait durer la
   photographie, cent à la fois feraient refuser le seau. */
const ENVOIS_DE_FRONT = 4;

/* La photographie en cours, numérotée : une seconde demande — le calage
   réenregistré entre-temps — rend la première caduque. */
let _gen = 0;

/** Le plus grand côté de toile que la carte graphique de ce poste accepte. */
function toileMax(){
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return PX_FIGE;
    const rb = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
    const vp = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const tx = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const ext = gl.getExtension("WEBGL_lose_context");
    if (ext) ext.loseContext();
    return Math.max(PX_FIGE, Math.min(TOILE_MAX, rb, tx, vp ? Math.min(vp[0], vp[1]) : TOILE_MAX));
  } catch (e) { return PX_FIGE; }
}

/** Un fond en images, mis dans la forme que le moteur prend : une seule
 *  source de tuiles, une seule couche. Le photographier par MapLibre plutôt
 *  qu'à la main, c'est une seule façon de faire pour tous les fonds. */
function styleEnImages(/** @type {any} */ fond){
  return {
    version: 8,
    sources: { r: { type: "raster", tiles: [fond.url], tileSize: 256,
                    maxzoom: fond.max || 19, attribution: fond.credit } },
    layers: [{ id: "r", type: "raster", source: "r" }],
  };
}

/** La carte au repos — toutes ses tuiles peintes —, ou l'échec. */
function auRepos(/** @type {any} */ carte){
  return new Promise((ok, non) => {
    const minute = setTimeout(() => non(new Error("les tuiles n'arrivent pas")), ATTENTE_VUE);
    carte.once("idle", () => { clearTimeout(minute); ok(undefined); });
    carte.triggerRepaint();
  });
}

/** Une image de la toile, découpée et compressée. Le webp d'abord, le jpeg
 *  là où le navigateur ne sait pas l'écrire. */
function decoupe(/** @type {HTMLCanvasElement} */ toile, /** @type {number} */ sx, /** @type {number} */ sy){
  const c = document.createElement("canvas");
  c.width = c.height = PX_FIGE;
  const ctx = /** @type {CanvasRenderingContext2D} */ (c.getContext("2d"));
  ctx.drawImage(toile, sx, sy, PX_FIGE, PX_FIGE, 0, 0, PX_FIGE, PX_FIGE);
  const en = (/** @type {string} */ type, /** @type {number} */ q) =>
    new Promise(ok => c.toBlob(b => ok(b), type, q));
  return en("image/webp", 0.82).then((/** @type {any} */ b) =>
    b && b.type === "image/webp" ? b : en("image/jpeg", 0.86));
}

/** Tout ce qui est rangé sous `prefixe`, dossiers parcourus. */
async function contenu(/** @type {any} */ acces, /** @type {string} */ prefixe){
  /** @type {string[]} */
  const fichiers = [];
  for (let depuis = 0;; depuis += 1000){
    const l = await stockage(acces, "object/list/" + SEAU, {
      method: "POST", body: JSON.stringify({ prefix: prefixe, limit: 1000, offset: depuis }),
    }) || [];
    for (const o of l){
      // un dossier n'a pas d'identifiant : on y descend
      if (o.id === null || o.id === undefined) fichiers.push(...await contenu(acces, prefixe + o.name + "/"));
      else fichiers.push(prefixe + o.name);
    }
    if (l.length < 1000) return fichiers;
  }
}

/**
 * Les lots du pavillon affiché, sauf celui qu'on garde — ou ce seul lot, quand
 * il est venu trop tard. Sans cela chaque calage réenregistré laisserait
 * quelques mégaoctets derrière lui ; et un lot ne se retire qu'une fois le
 * suivant inscrit, pour que le visiteur ait toujours un fond à poser.
 */
export async function retireLesLots(/** @type {{garde?: string, seul?: string, pavillon?: string}} */ quoi = {}){
  const acces = accesBase();
  if (!acces) return;
  /* Le pavillon se fixe avant d'attendre le réseau, ou se reçoit de
     l'appelant : relu après, il pouvait être celui où l'exploitant venait de
     passer — et c'est son fond à lui qui partait. */
  const pavillon = quoi.pavillon ?? P().id;
  const planId = (await identifiants(acces))[pavillon];
  if (!planId) return;
  const racine = planId + "/" + (quoi.seul ? quoi.seul + "/" : "");
  const partent = (await contenu(acces, racine))
    .filter(n => !quoi.garde || !n.startsWith(planId + "/" + quoi.garde + "/"));
  for (let a = 0; a < partent.length; a += 500){
    await stockage(acces, "object/" + SEAU, {
      method: "DELETE", body: JSON.stringify({ prefixes: partent.slice(a, a + 500) }),
    });
  }
}

/**
 * Photographie le fond du calage `cal` pour le pavillon affiché, et range le
 * lot. Rend ce que le calage doit porter sous `fige`, et où le lot est rangé
 * — de quoi retirer ceux d'avant une fois celui-ci inscrit.
 *
 * `dit` reçoit l'avancement : la photographie prend une minute, et un long
 * silence se lit comme une panne.
 */
export async function figeLeFond(/** @type {any} */ cal, /** @type {(txt: string, mal?: boolean) => void} */ dit){
  const gen = ++_gen;
  const acces = accesBase();
  if (!acces) throw new Error("aucune session : reconnectez-vous depuis la console.");
  const p = P(), fond = cal && CARTES[cal.fond];
  if (!fond) throw new Error("aucun fond retenu");
  if (!p.emprise) throw new Error("ce pavillon n'a pas d'emprise");
  const planId = (await identifiants(acces))[p.id];
  if (!planId) throw new Error("ce pavillon n'est pas encore en base : enregistrez la configuration d'abord.");

  const zone = carreDuFond(p.emprise);
  const cote = zone.x1 - zone.x0;
  /** @type {any} */
  const lot = { source: sourceDuFige(cal, zone), x0: zone.x0, y0: zone.y0, cote: cote,
                px: PX_FIGE, niveaux: niveauxDuLot(cote) };
  const blocs = blocsDeCapture(lot, toileMax());
  const total = blocs.reduce((n, b) => n + b.images.length, 0);
  // l'adresse change à chaque photographie : un lot ne change jamais de contenu
  const nom = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  dit("Photographie du fond : préparation…");
  const gl = await chargeMapLibre();
  const bornes = bornesDuFond(cal, zone);
  const style = fond.style || fond.objet ? styleDeLaCarte(cal, fond) : styleEnImages(fond);

  /* Hors de l'écran, à sa taille réelle : MapLibre peint ce que son hôte
     mesure. Sans opacité ni inclinaison — ce qui se pose par-dessus se règle
     chez le visiteur, et ne se refige pas. */
  const hote = document.createElement("div");
  hote.setAttribute("aria-hidden", "true");
  hote.style.cssText = "position:fixed;left:-20000px;top:0;pointer-events:none;";
  document.body.appendChild(hote);
  const taille = (/** @type {number} */ px) => { hote.style.width = hote.style.height = px + "px"; };
  taille(blocs[0].px);

  /** @type {any} */
  let carte = null;
  let faites = 0, octets = 0, ext = "webp";
  try {
    // la première vue d'emblée : partir du globe entier demanderait ses tuiles
    const v0 = vueGL(cal, { x: blocs[0].x, y: blocs[0].y, w: blocs[0].cote, h: blocs[0].cote,
                            mParPx: blocs[0].cote / blocs[0].px });
    carte = new gl.Map({
      container: hote, interactive: false, attributionControl: false, fadeDuration: 0,
      center: v0.center, zoom: v0.zoom, bearing: v0.bearing,
      // un pixel de toile pour un pixel d'image : l'écran du poste n'y fait rien
      pixelRatio: 1, preserveDrawingBuffer: true,
      maxCanvasSize: [TOILE_MAX, TOILE_MAX],
    });
    carte.setStyle(style, { transformStyle: (/** @type {any} */ _a, /** @type {any} */ apres) =>
      borneLeStyle(apres, bornes) });
    /* Borné comme l'attente des tuiles : un style qui ne répond jamais
       laissait le bouton éteint, « préparation… » à l'écran, et la carte hors
       écran en mémoire — le `finally` ne venait pas. */
    await new Promise((ok, non) => {
      const delai = setTimeout(() => non(new Error("le style ne répond pas")), ATTENTE_VUE);
      carte.once("load", () => { clearTimeout(delai); ok(undefined); });
      /* Seul le style arrête tout : une tuile refusée — hors couverture, une
         panne passagère — laisse un trou dans une image, et le moteur passe
         à la suivante. */
      carte.on("error", (/** @type {any} */ ev) => {
        if (ev && (ev.sourceId || ev.tile)) return;
        non(new Error((ev && ev.error && ev.error.message) || "style refusé"));
      });
    });

    for (const b of blocs){
      if (gen !== _gen) throw new Error("photographie remplacée par une plus récente");
      taille(b.px);
      carte.resize();
      const v = vueGL(cal, { x: b.x, y: b.y, w: b.cote, h: b.cote, mParPx: b.cote / b.px });
      if (!vueGLValable(v)) throw new Error("vue impossible à peindre");
      carte.jumpTo(v);
      await auRepos(carte);
      const toile = carte.getCanvas();
      const file = b.images.slice();
      const envoie = async () => {
        for (let im; (im = file.shift());){
          const blob = /** @type {Blob} */ (await decoupe(toile, im.sx, im.sy));
          if (!blob) throw new Error("image illisible");
          if (blob.type === "image/jpeg") ext = "jpg";
          const chemin = planId + "/" + nom + "/" + b.k + "/" + im.i + "/" + im.j + "." +
            (blob.type === "image/jpeg" ? "jpg" : "webp");
          await stockage(acces, "object/" + SEAU + "/" + chemin, {
            method: "POST", body: blob,
            headers: { "Content-Type": blob.type, "cache-control": "max-age=31536000", "x-upsert": "true" },
          });
          octets += blob.size;
          dit("Photographie du fond : " + (++faites) + " / " + total + " images…");
        }
      };
      /* Les images d'un bloc se découpent toutes avant la vue suivante : la
         toile n'est lisible que tant qu'on ne l'a pas repeinte. */
      await Promise.all(Array.from({ length: ENVOIS_DE_FRONT }, envoie));
    }
  } finally {
    try { if (carte) carte.remove(); } catch (e) {}
    hote.remove();
  }

  Object.assign(lot, {
    adresse: acces.cfg.url + "/storage/v1/object/public/" + SEAU + "/" + planId + "/" + nom + "/",
    ext: ext, le: new Date().toISOString(), images: total, octets: octets,
  });
  return { fige: lot, nom: nom };
}

/** Le lot dit en une ligne, pour le volet : quand, combien, et ce qu'il évite. */
export function ditLot(/** @type {any} */ cal){
  const p = P();
  const zone = p && p.emprise ? carreDuFond(p.emprise) : null;
  if (!cal || !cal.fond) return "";
  if (!figeAJour(cal, zone))
    return cal.fige
      ? "Le fond a changé depuis sa dernière photographie : enregistrez le calage pour le figer de nouveau. D'ici là, chaque visiteur le dessine en direct."
      : "Le fond n'est pas encore figé : chaque visiteur le dessine en direct. Enregistrez le calage pour le figer.";
  const f = cal.fige;
  const le = new Date(f.le).toLocaleDateString("fr-FR");
  const mo = Math.round(f.octets / 1e5) / 10;
  return "Fond figé le " + le + " — " + f.images + " images, " +
    String(mo).replace(".", ",") + " Mo : les visiteurs ne chargent ni moteur de carte ni tuiles.";
}
