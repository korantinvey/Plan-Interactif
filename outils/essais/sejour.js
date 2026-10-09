/**
 * La préparation du séjour : `modules/sejour.mjs`, éprouvée seule.
 *
 * Ce module range les stands d'un parcours entre des jours, des conférences et
 * des heures d'ouverture, puis déroule chaque jour en heures et en trajets.
 * Une régression n'y fait rien planter : elle annonce un stand après la
 * fermeture, fait remonter le temps d'une journée, compte le forfait d'un
 * changement de pavillon dans les mètres annoncés, ou déplace toute la visite
 * quand on n'a touché qu'un exposant. D'où des cas qui mesurent ce qu'il rend,
 * sur des halls dessinés ici, plutôt que de relire le code.
 *
 * La grille de marche se peint sur un canevas, que Node n'a pas. On lui en
 * prête un, réduit à ce que `grille` et le tronçon emploient — remplir, tracer,
 * découper, relire les pixels — sur des contours faits de segments : c'est
 * tout ce que portent les halls d'ici. Une case est peinte si son centre l'est,
 * ce que fait aussi le seuil de `grille` sur le lissage d'un vrai canevas.
 *
 *   node outils/essais/sejour.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const pres = (a, b, tol) => Math.abs(a - b) <= tol;
const r1 = (x) => Math.round(x * 10) / 10;

/* ------------------------------------------------------------
   Le canevas prêté
   ------------------------------------------------------------ */
/* Un contour : des sous-chemins, chacun une suite de points et s'il est fermé.
   Les commandes absolues et relatives M, L, H, V, Z suffisent aux halls d'ici
   et à l'enveloppe que `grille` bâtit point par point. */
class Path2D {
  constructor(d){
    this.subs = [];
    if (typeof d !== "string") return;
    const jetons = d.match(/[MLHVZmlhvz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
    let cmd = "", x = 0, y = 0, k = 0;
    const nombre = () => +jetons[k++];
    while (k < jetons.length){
      if (/[A-Za-z]/.test(jetons[k])) cmd = jetons[k++];
      const rel = cmd === cmd.toLowerCase();
      switch (cmd.toUpperCase()){
        case "M": { const a = nombre(), b = nombre();
          x = rel ? x + a : a; y = rel ? y + b : b; this.moveTo(x, y);
          cmd = rel ? "l" : "L"; break; }
        case "L": { const a = nombre(), b = nombre();
          x = rel ? x + a : a; y = rel ? y + b : b; this.lineTo(x, y); break; }
        case "H": { const a = nombre(); x = rel ? x + a : a; this.lineTo(x, y); break; }
        case "V": { const b = nombre(); y = rel ? y + b : b; this.lineTo(x, y); break; }
        case "Z": this.closePath(); break;
        default: throw new Error("commande de contour inconnue de l'essai : " + cmd);
      }
    }
  }
  moveTo(x, y){ this.subs.push({ pts: [[x, y]], ferme: false }); }
  lineTo(x, y){
    if (!this.subs.length) this.moveTo(x, y);
    else this.subs[this.subs.length - 1].pts.push([x, y]);
  }
  closePath(){
    const s = this.subs[this.subs.length - 1];
    if (!s) return;
    s.ferme = true;
    this.moveTo(s.pts[0][0], s.pts[0][1]);
  }
}

/* Le nombre d'enroulements autour d'un point : non nul, il est dedans. Un
   sous-chemin se referme toujours pour remplir, comme sur un canevas. */
function dedans(subs, x, y){
  let n = 0;
  for (const s of subs){
    const p = s.pts;
    for (let i = 0; i < p.length; i++){
      const a = p[i], b = p[(i + 1) % p.length];
      if (a[1] <= y){ if (b[1] > y && (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1]) > 0) n++; }
      else if (b[1] <= y && (b[0] - a[0]) * (y - a[1]) - (x - a[0]) * (b[1] - a[1]) < 0) n--;
    }
  }
  return n !== 0;
}
function distanceAuSegment(x, y, a, b){
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)) : 0;
  return Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy);
}

class Toile {
  constructor(){ this.width = 300; this.height = 150; this._ctx = null; }
  getContext(){ return this._ctx || (this._ctx = new Contexte(this)); }
}
class Contexte {
  constructor(cv){
    this.canvas = cv;
    this.t = [1, 0, 0, 1, 0, 0];
    this.globalCompositeOperation = "source-over";
    this.lineWidth = 1;
    this.masque = null;
    this.pile = [];
    this.alpha = null;
  }
  _pixels(){
    const n = this.canvas.width * this.canvas.height;
    if (!this.alpha || this.alpha.length !== n) this.alpha = new Uint8Array(n);
    return this.alpha;
  }
  setTransform(a, b, c, d, e, f){ this.t = [a, b, c, d, e, f]; }
  save(){ this.pile.push({ t: this.t.slice(), g: this.globalCompositeOperation,
                           l: this.lineWidth, m: this.masque }); }
  restore(){
    const s = this.pile.pop();
    if (!s) return;
    this.t = s.t; this.globalCompositeOperation = s.g; this.lineWidth = s.l; this.masque = s.m;
  }
  /* Du pixel au repère de l'utilisateur : la transformation inverse. */
  _versUtilisateur(px, py){
    const [a, b, c, d, e, f] = this.t, det = a * d - b * c;
    const X = px - e, Y = py - f;
    return [(d * X - c * Y) / det, (-b * X + a * Y) / det];
  }
  _versPixel(x, y){
    const [a, b, c, d, e, f] = this.t;
    return [a * x + c * y + e, b * x + d * y + f];
  }
  _peint(path, test, marge){
    const w = this.canvas.width, h = this.canvas.height, A = this._pixels();
    const echelle = Math.hypot(this.t[0], this.t[1]);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of path.subs) for (const q of s.pts){
      const [X, Y] = this._versPixel(q[0], q[1]);
      x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
    }
    const m = marge * echelle + 1;
    const i0 = Math.max(0, Math.floor(x0 - m)), i1 = Math.min(w - 1, Math.ceil(x1 + m));
    const j0 = Math.max(0, Math.floor(y0 - m)), j1 = Math.min(h - 1, Math.ceil(y1 + m));
    const efface = this.globalCompositeOperation === "destination-out";
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++){
      const k = j * w + i;
      if (this.masque && !this.masque[k]) continue;
      const [x, y] = this._versUtilisateur(i + .5, j + .5);
      if (test(x, y)) A[k] = efface ? 0 : 255;
    }
  }
  fill(path){ this._peint(path, (x, y) => dedans(path.subs, x, y), 0); }
  stroke(path){
    const r = this.lineWidth / 2;
    this._peint(path, (x, y) => path.subs.some(s => {
      const p = s.pts;
      const n = s.ferme ? p.length : p.length - 1;
      if (p.length === 1) return Math.hypot(x - p[0][0], y - p[0][1]) <= r;
      for (let i = 0; i < n; i++) if (distanceAuSegment(x, y, p[i], p[(i + 1) % p.length]) <= r) return true;
      return false;
    }), r);
  }
  fillRect(x, y, w, h){
    const t = new Path2D();
    t.moveTo(x, y); t.lineTo(x + w, y); t.lineTo(x + w, y + h); t.lineTo(x, y + h); t.closePath();
    this.fill(t);
  }
  clip(path){
    const w = this.canvas.width, h = this.canvas.height, M = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++){
      const [x, y] = this._versUtilisateur(i + .5, j + .5);
      M[j * w + i] = (!this.masque || this.masque[j * w + i]) && dedans(path.subs, x, y) ? 1 : 0;
    }
    this.masque = M;
  }
  drawImage(cv){
    const src = cv.getContext()._pixels(), A = this._pixels();
    const efface = this.globalCompositeOperation === "destination-out";
    for (let k = 0; k < A.length && k < src.length; k++)
      if (src[k] > 128 && (!this.masque || this.masque[k])) A[k] = efface ? 0 : 255;
  }
  getImageData(x, y, w, h){
    const A = this._pixels(), W = this.canvas.width, data = new Uint8ClampedArray(w * h * 4);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++)
      data[(j * w + i) * 4 + 3] = A[(y + j) * W + x + i];
    return { data: data };
  }
  isPointInPath(path, px, py){
    const [x, y] = this._versUtilisateur(px, py);
    return dedans(path.subs, x, y);
  }
}

/* Le reste de ce qu'une page fournit, et que les modules lisent au chargement :
   ni réglage de construction, ni salon dans l'adresse — donc ni API, ni mesure,
   ni charge annoncée. Tout autre élément qu'un canevas serait une surprise. */
Object.assign(globalThis, {
  Path2D,
  document: {
    currentScript: null,
    createElement: (t) => { if (t === "canvas") return new Toile(); throw new Error("élément " + t); },
  },
  location: { search: "", pathname: "/plan" },
});

/* ------------------------------------------------------------
   Les halls
   ------------------------------------------------------------ */
/* Un rectangle, comme le dessine un emplacement : quatre coins et un retour. */
const rect = (x0, y0, x1, y1) => "M " + x0 + " " + y0 + " L " + x1 + " " + y0 + " L " + x1 + " " +
  y1 + " L " + x0 + " " + y1 + " Z";

/* Deux rangées de stands de quatre mètres, jointifs, face à face de part et
   d'autre d'une allée de huit mètres. L'enveloppe des emplacements fait le
   hall : on ne marche que dans l'allée. */
function pavillon(i, nom, n){
  const stands = [];
  for (let k = 0; k < n; k++){
    const x0 = 4 + 4 * k;
    for (const [rang, y0] of [["A", 4], ["B", 16]]){
      const id = nom + rang + (k + 1);
      stands.push({ id: id, kind: "stand", p: i, code: id, nom: "Exposant " + id,
                    d: rect(x0, y0, x0 + 4, y0 + 4), c: [x0 + 2, y0 + 2] });
    }
  }
  const x1 = 4 + 4 * n + 2;
  return { i: i, id: "plan-" + nom, libelle: "Hall " + nom,
           emprise: { x0: 0, y0: 0, x1: x1, y1: 24 }, stands: stands, zones: [] };
}

(async () => {
  const M = (f) => import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", f)).href);
  const D = await M("donnees.mjs");
  const I = await M("itineraire.mjs");
  const Pa = await M("parcours.mjs");
  const S = await M("sejour.mjs");

  /* Deux pavillons sans porte ni passage déclaré : le trajet de l'un à l'autre
     n'est pas tracé, il se dit. Une zone sert de salle de conférence dans le
     premier — elle aussi un emplacement, au bout de la première rangée. */
  const A = pavillon(0, "A", 8), B = pavillon(1, "B", 3);
  const salle = { id: "Z1", kind: "zone", p: 0, nom: "Salle Agora",
                  d: rect(36, 4, 40, 8), c: [38, 6] };
  A.zones.push(salle);
  const plans = [A, B];
  const TOUS = plans.flatMap(p => p.stands.concat(p.zones));
  const parId = new Map(TOUS.map(o => [String(o.id), o]));

  /* Le salon : trois jours, des horaires qui changent le dernier, des
     conférences aux heures du programme, écrites comme Eventmaker les écrit. */
  const conf = (id, jour, h0, h1, zone, extra) => Object.assign({
    id: id, nom: "Conférence " + id, salle: zone ? "Agora" : "",
    debutLocal: "05/1" + jour + "/2031 " + h0, finLocal: "05/1" + jour + "/2031 " + h1,
    zone: zone || null }, extra || {});
  const CONFS = new Map([
    ["c1", conf("c1", 3, "14:00", "15:00", "Z1")],      // le deuxième jour, à 14 h
    ["c2", conf("c2", 3, "14:30", "15:30", "Z1")],      // la recouvre
    ["c3", conf("c3", 2, "08:00", "09:00", "Z1")],      // le premier jour, avant l'arrivée
    ["c4", conf("c4", 4, "11:00", "11:45", null)],      // sans salle située, le troisième jour
    ["c5", conf("c5", 5, "10:00", "11:00", "Z1")],      // un jour qu'on ne retient pas
  ]);
  D.poseDonnees({ DATA: { plans: plans, fuseau: "Europe/Paris" }, TOUS: TOUS, parId: parId,
                  CONFS: CONFS });

  const HORAIRES = {
    "20310512": { ouverture: 540, fermeture: 1080 },
    "20310513": { ouverture: 540, fermeture: 1080 },
    "20310514": { ouverture: 540, fermeture: 960 },
  };
  let visite = 20;
  const ITI = { pmr: false };
  const CONF = {};
  I.brancheItineraire({
    conf: () => CONF, dessins: () => ({}),
    cheminForme: (f) => f.d, pictoForme: () => "", nomTypeRepere: () => "",
    estPorte: () => false, ouvreEntrant: () => false, ouvreSortant: () => false,
    instantConf: Pa.instantConf, finInstant: S.finInstant,
  });
  S.brancheSejour({
    minutesVisite: () => visite,
    horairesSalon: (j) => HORAIRES[j] || { ouverture: null, fermeture: null },
    seuilConcentration: () => 0, seuilImpose: () => false,
    iti: () => ITI,
  });
  const parcours = (stands, confs) => Pa.poseParcours({ PARCOURS: { stands: stands, confs: confs || [] } });
  const JOURS = [
    { cle: "20310512", nom: "lundi 12 mai", court: "lun. 12" },
    { cle: "20310513", nom: "mardi 13 mai", court: "mar. 13" },
    { cle: "20310514", nom: "mercredi 14 mai", court: "mer. 14" },
  ];
  const choix = (jours, arrivee, pente) => ({ jours: jours, arrivee: arrivee, depart: null,
                                              pente: pente || 0 });
  const ALLURE_M_MIN = I.ALLURE * 60;
  const stands = (j) => j.etapes.filter(e => e.genre === "stand");

  /* Ce que toute journée doit tenir, quoi qu'on lui ait demandé : l'horloge
     ne recule pas, une visite dure ce qu'elle dure, la marche dit ses minutes
     au pas annoncé, et rien ne finit après la fermeture. */
  const tientDebout = (j, tv, allure) => {
    let t = -Infinity, m = 0;
    const fautes = [];
    j.etapes.forEach((e, k) => {
      if (e.genre === "stand"){
        if (e.t0 < t - 1e-9) fautes.push("stand " + k + " avant l'heure");
        if (!pres(e.t1 - e.t0, tv, 1e-9)) fautes.push("stand " + k + " de " + (e.t1 - e.t0) + " min");
        if (j.fermeture !== null && e.t1 > j.fermeture + 1e-9) fautes.push("stand " + k + " après la fermeture");
        t = e.t1;
      } else if (e.genre === "conf"){
        t = Math.max(t, e.t1);
      } else if (e.genre === "marche"){
        if (!pres(e.min, e.m / allure, 1e-9)) fautes.push("marche " + k + " au mauvais pas");
        m += e.m;
      }
    });
    if (!pres(m, j.m, 1e-6)) fautes.push("mètres du jour " + r1(j.m) + " pour " + r1(m) + " marchés");
    return fautes;
  };

  console.log("\n=== 1. La matrice des distances, sur un hall connu ===");
  {
    parcours(["AA1", "AA4", "AA8", "AB1", "BA1"]);
    const p = S.prepareSejour(choix([JOURS[0]], 540), null);
    const i = (id) => p.PTS.findIndex(pt => pt && pt.id === id);
    const d = (a, b) => p.dist(i(a), i(b));
    /* Même rangée, trois stands plus loin : douze mètres d'axe à axe. La
       distance se prend d'une accroche à l'autre, et l'accroche tombe quelque
       part devant la façade : à sa largeur près, quatre mètres. */
    dit(pres(d("AA1", "AA4"), 12, 4), "même rangée, trois stands plus loin : 12 m d'allée, à une façade près",
      r1(d("AA1", "AA4")) + " m");
    dit(pres(d("AA1", "AA8"), 28, 4), "même rangée, sept stands plus loin : 28 m d'allée, à une façade près",
      r1(d("AA1", "AA8")) + " m");
    dit(d("AA1", "AA8") > d("AA1", "AA4"), "plus loin dans l'allée, plus long");
    /* En face, de l'autre côté de l'allée : on la traverse, on ne la longe pas. */
    dit(d("AA1", "AB1") > 0 && d("AA1", "AB1") <= 8 + 4, "le stand d'en face : la largeur de l'allée, pas plus",
      r1(d("AA1", "AB1")) + " m");
    dit(pres(d("AA1", "AA8"), d("AA8", "AA1"), I.PAS_GRILLE),
      "la distance ne dépend pas du sens", r1(d("AA1", "AA8")) + " / " + r1(d("AA8", "AA1")));
    dit(d("AA1", "AA8") <= d("AA1", "AA4") + d("AA4", "AA8") + I.PAS_GRILLE,
      "aucun détour n'est plus court que le droit chemin");
    /* D'un pavillon à l'autre, sans porte déclarée : le forfait seul, et tout
       entier — c'est une dissuasion, pas une mesure. */
    dit(d("AA1", "BA1") === 300, "d'un pavillon à l'autre, sans porte : le forfait de 300 m",
      d("AA1", "BA1") + " m");
    dit(p.dist(-1, i("AA1")) === 0, "le départ « peu importe » ne coûte rien");
    const q = S.prepareSejour(choix([JOURS[0]], 540), null);
    dit(q.PTS.every((pt, k) => q.PTS.every((pu, l) => q.dist(k, l) === p.dist(k, l))),
      "deux préparations des mêmes arrêts rendent la même matrice");
    S.oublieMatrice();
    const r = S.prepareSejour(choix([JOURS[0]], 540), null);
    dit(r.PTS.every((pt, k) => r.PTS.every((pu, l) => r.dist(k, l) === p.dist(k, l))),
      "rebalayée après l'avoir jetée, elle ne change pas");
    ITI.pmr = true;
    const a = S.prepareSejour(choix([JOURS[0]], 540), null);
    ITI.pmr = false;
    const ia = (id) => a.PTS.findIndex(pt => pt && pt.id === id);
    dit(a.pmr === true && a.dist(ia("AA1"), ia("AA8")) >= d("AA1", "AA8") - I.PAS_GRILLE,
      "en accessible, l'allée ne raccourcit pas", r1(a.dist(ia("AA1"), ia("AA8"))) + " m");
    dit(pres(a.enMinutes(60), 60 / (I.ALLURE_PMR * 60), 1e-9) && pres(p.enMinutes(60), 60 / ALLURE_M_MIN, 1e-9),
      "le pas de marche suit le mode : " + I.ALLURE + " m/s, " + I.ALLURE_PMR + " m/s en accessible");
  }

  console.log("\n=== 2. Une journée sans conférence ===");
  {
    const ids = ["AA1", "AB2", "AA3", "AB4", "AA5", "AB6"];
    parcours(ids);
    const s = S.calculeSejour(choix([JOURS[0]], 600), null);
    const j = s.jours[0];
    const vus = stands(j);
    dit(vus.length === 6 && !s.restants.length, "les six stands tiennent dans la journée",
      vus.length + " placés, " + s.restants.length + " restants");
    dit(vus[0].t0 === 600, "sans départ désigné, la journée commence au premier stand, à l'arrivée",
      vus[0].t0 + " min");
    const fautes = tientDebout(j, 20, ALLURE_M_MIN);
    dit(!fautes.length, "l'horloge avance, chaque visite dure vingt minutes, la marche suit le pas",
      fautes.join(" ; "));
    dit(pres(j.fin, vus[5].t1, 1e-9), "la journée finit avec sa dernière visite", j.fin + " min");
    dit(j.nArrets === 6 && j.arrets.length === 6, "un arrêt numéroté par stand",
      j.nArrets + " arrêts");
    dit(j.ids.size === 6 && ids.every(id => j.ids.has(id)), "le jour porte les exposants du parcours");
    dit(pres(s.m, j.m, 1e-9) && j.m > 0 && j.m < 200, "les mètres du séjour sont ceux du jour, et ceux d'un seul hall",
      r1(j.m) + " m");
    /* L'ordre retenu marche moins que celui de la liste, et moins que celui
       qu'on suivrait sans réfléchir — une rangée, puis l'autre. Mesuré sur la
       matrice, qui est ce que le rangement compare. */
    const p = S.prepareSejour(choix([JOURS[0]], 600), null);
    const rang = (id) => p.PTS.findIndex(pt => pt && pt.id === id);
    const long = (suite) => suite.reduce((a, x, k) => k ? a + p.dist(suite[k - 1], x) : 0, 0);
    const retenu = long(p.jours[0].creneaux[0].stands);
    const liste = long(ids.map(rang));
    const rangees = long(["AA1", "AA3", "AA5", "AB6", "AB4", "AB2"].map(rang));
    dit(retenu <= liste && retenu <= rangees,
      "l'ordre retenu marche moins que la liste, et qu'une rangée après l'autre",
      r1(retenu) + " m contre " + r1(liste) + " et " + r1(rangees) + " — " + vus.map(e => e.o.id).join(" "));
    visite = 45;
    const t = S.calculeSejour(choix([JOURS[0]], 600), null);
    visite = 20;
    dit(t.tv === 45 && !tientDebout(t.jours[0], 45, ALLURE_M_MIN).length,
      "le temps par stand est celui que l'exploitant a réglé", "45 min");
  }

  console.log("\n=== 3. Les conférences, à l'heure du programme ===");
  {
    parcours(["AA1", "AA2", "AA3", "AB3", "AB5", "AA7"], ["c1", "c2", "c3", "c4", "c5"]);
    const s = S.calculeSejour(choix(JOURS, 600), null);
    const [j1, j2, j3] = s.jours;
    const c1 = j2.etapes.find(e => e.genre === "conf");
    dit(c1 && c1.c.id === "c1" && c1.t0 === 840 && c1.t1 === 900,
      "la conférence du mardi garde son heure : 14h00 – 15h00", c1 ? c1.t0 + "–" + c1.t1 : "absente");
    dit(j2.chevauchent.map(c => c.id).join() === "c2", "celle qui la recouvre se dit, sans se programmer");
    dit(j1.passees.map(c => c.id).join() === "c3" && j1.rdv.length === 0,
      "commencée avant l'arrivée, elle se dit manquée plutôt que de se programmer");
    dit(s.horsJour.map(c => c.id).join() === "c5", "un jour qu'on ne retient pas : hors des jours retenus",
      s.horsJour.map(c => c.id).join());
    dit(s.sansLieu.map(c => c.id).join() === "c4", "une conférence sans salle située se signale");
    const c4 = j3.etapes.find(e => e.genre === "conf");
    dit(c4 && c4.t0 === 660 && c4.t1 === 705 && !c4.pt, "elle garde son heure, sans trajet pour y mener",
      c4 ? c4.t0 + "–" + c4.t1 : "absente");
    const avant = j2.etapes.slice(0, j2.etapes.indexOf(c1)).filter(e => e.genre === "stand");
    dit(avant.every(e => e.t1 <= 840 + c1.retard), "ce qui précède la conférence finit avant elle",
      avant.map(e => e.t1).join(" "));
    dit(s.jours.every(j => !tientDebout(j, 20, ALLURE_M_MIN).length), "chaque jour tient debout",
      s.jours.map(j => tientDebout(j, 20, ALLURE_M_MIN).join(",")).join(" | "));
    const attente = j2.etapes.filter(e => e.genre === "attente").reduce((a, e) => a + e.min, 0);
    dit(pres(attente, j2.attente, 1e-9), "l'attente du jour est la somme de ses creux", r1(attente) + " min");
    /* Parti de l'autre pavillon à l'heure même : le changement de hall prend
       cinq minutes, et la ligne le dit plutôt que de décaler la séance. */
    parcours([], ["c1"]);
    const loin = Object.assign(I.pointObjet(parId.get("BA1")), { detail: "Hall B" });
    const u = S.calculeSejour(Object.assign(choix([JOURS[1]], 840), { depart: loin }), null);
    const cu = u.jours[0].etapes.find(e => e.genre === "conf");
    dit(cu && cu.t0 === 840 && cu.retard === 5 && u.jours[0].retards.length === 1 &&
        u.jours[0].etapes[0].genre === "depart",
      "un rendez-vous qu'on n'atteint pas garde son heure, et dit son retard",
      cu ? "retard " + r1(cu.retard) + " min" : "absente");
  }

  console.log("\n=== 4. Les heures du salon ===");
  {
    const ids = ["AA1", "AA2", "AA3", "AA4", "AA5", "AA6", "AA7", "AA8"];
    parcours(ids);
    const s = S.calculeSejour(choix([JOURS[0]], 480), null);
    const j = s.jours[0];
    dit(j.avantOuverture && j.arrivee === 540 && j.demandee === 480,
      "arrivé avant l'ouverture, la journée part de l'ouverture", j.arrivee + " min");
    const f = S.calculeSejour(choix([JOURS[2]], 900), null);
    const jf = f.jours[0], placés = stands(jf).length;
    dit(placés >= 1 && placés <= 3 && placés + f.restants.length === 8,
      "une heure avant la fermeture : ce qui ne tient pas se dit, rien ne se perd",
      placés + " placés, " + f.restants.length + " restants");
    dit(!tientDebout(jf, 20, ALLURE_M_MIN).length && jf.fin <= 960, "rien ne finit après seize heures",
      jf.fin + " min");
    /* Le rangement juge sur la matrice, qui ignore virages et amorces ; le
       trajet tracé coûte un peu plus. À une demi-minute près, le troisième
       stand que la matrice faisait tenir finirait après la fermeture : le
       déroulé le rend aux restants plutôt que de le programmer. */
    parcours(["AA1", "AB4", "AA8"]);
    const ap = S.apercuRepartition(choix([JOURS[2]], 899.5));
    const g = S.calculeSejour(choix([JOURS[2]], 899.5), null);
    dit(ap.jours[0].stands === 3 && stands(g.jours[0]).length === 2 && g.restants.length === 1 &&
        g.jours[0].fin <= 960,
      "ce que le trajet tracé repousse après la fermeture rejoint les restants",
      ap.jours[0].stands + " rangés, " + stands(g.jours[0]).length + " déroulés, fin à " + r1(g.jours[0].fin));
  }

  console.log("\n=== 5. Plusieurs jours, un exposant déplacé ===");
  {
    const ids = ["AA1", "AA2", "AA3", "AA4", "AB1", "AB2", "AB3", "AB4", "BA1", "BA2", "BB1", "BB2"];
    parcours(ids);
    const s = S.calculeSejour(choix(JOURS.slice(0, 2), 540), null);
    const n = s.jours.map(j => stands(j).length);
    dit(n[0] + n[1] === 12 && n[0] > 0 && n[1] > 0, "deux jours égaux : chacun en porte", n.join(" + "));
    const transferts = s.jours.flatMap(j => j.etapes.filter(e => e.genre === "transfert"));
    dit(transferts.every(e => e.min === 5), "changer de pavillon réserve cinq minutes à l'horaire",
      transferts.length + " changement(s)");
    dit(s.jours.every(j => j.m < 300), "le forfait de dissuasion ne compte jamais dans les mètres annoncés",
      s.jours.map(j => r1(j.m)).join(" / ") + " m");
    dit(s.jours.every(j => j.etapes.some(e => e.genre === "transfert") === j.coupe),
      "un jour qui change de pavillon se dit coupé, et lui seul");
    const ap = S.apercuRepartition(choix(JOURS.slice(0, 2), 540));
    dit(ap.jours.map(j => j.stands).join() === n.join() && ap.restants === s.restants.length,
      "l'aperçu du curseur annonce ce que le calcul rend", ap.jours.map(j => j.stands).join(" + "));
    /* Les premiers jours chargés, puis les derniers : le curseur incline. */
    const tot = (p) => S.apercuRepartition(choix(JOURS.slice(0, 2), 540, p)).jours.map(j => j.stands);
    const avant = tot(-1), apres = tot(1);
    dit(avant[0] >= avant[1] && apres[1] >= apres[0], "le curseur charge les premiers jours, ou les derniers",
      avant.join("+") + " puis " + apres.join("+"));

    /* L'exposant déplacé : lui seul change de jour. */
    const cle = (j) => j.cle;
    const ou = new Map(s.jours.flatMap(j => [...j.ids].map(id => [id, cle(j)])));
    const cible = ids.find(id => ou.get(id) === JOURS[0].cle);
    const fige = new Map(s.assignation); fige.delete(cible);
    S.PLACES.set(cible, JOURS[1].cle);
    const t = S.calculeSejour(choix(JOURS.slice(0, 2), 540), fige);
    const ou2 = new Map(t.jours.flatMap(j => [...j.ids].map(id => [id, cle(j)])));
    dit(ou2.get(cible) === JOURS[1].cle, "l'exposant placé le mardi y est", cible);
    const bouges = ids.filter(id => id !== cible && ou.get(id) !== ou2.get(id));
    dit(!bouges.length, "aucun autre n'a changé de jour", bouges.join(" "));
    dit(!t.refuses.length, "rien n'est refusé là où il tient");
    /* Le retirer du parcours emporte la consigne : elle ne ressusciterait pas. */
    parcours(ids.filter(id => id !== cible));
    S.calculeSejour(choix(JOURS.slice(0, 2), 540), null);
    dit(!S.PLACES.has(cible), "un exposant retiré du parcours n'est plus placé nulle part");
    /* Deux placés le dernier jour, vingt minutes avant la fermeture : un seul
       y tient, l'autre se dit refusé plutôt que de disparaître. */
    parcours(["AA1", "AA2", "AA3", "AA4", "AA5", "AA6"]);
    S.PLACES.clear();
    S.PLACES.set("AA5", JOURS[2].cle);
    S.PLACES.set("AA6", JOURS[2].cle);
    const r = S.calculeSejour(choix([JOURS[2]], 940), null);
    const tenu = stands(r.jours[0]).map(e => e.o.id), refus = r.refuses.map(o => o.id);
    dit(tenu.length === 1 && refus.length === 1 && [tenu[0], refus[0]].sort().join() === "AA5,AA6",
      "deux placés là où un seul tient : l'un y est, l'autre se dit refusé",
      "tenu " + tenu.join() + ", refusé " + refus.join());
    dit(r.restants.length === 5, "le reste du parcours se dit resté de côté", r.restants.length + " restants");
    S.PLACES.clear();
  }

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
