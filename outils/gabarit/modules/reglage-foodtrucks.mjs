/* ============================================================
   Les camions d'un foodtruck — combien, où, dans quel sens

   La vue immersive range d'office les camions d'une zone « Foodtruck » le
   long de son plus long côté (`decor.mjs` `camions`) : ni leur nombre ni leur
   place ne disaient ce qui se gare vraiment sur le salon. Ce champ de la
   fiche d'une zone montre son contour, vu comme sur le plan, et les camions
   dessus : on en choisit le nombre, on les fait glisser, on tire la poignée
   ronde de celui qu'on tient pour le tourner.

   Comme le comptoir d'un accueil (`reglage-comptoir.mjs`), le réglage
   appartient à l'apparence du plan : il se range dans la configuration
   (`_foodtrucks`, par zone, une liste), part au visiteur à la publication, et
   s'enregistre au lâcher. Le plan suit par l'attribut posé sur la zone
   (`rendu.mjs` `texteCamions`), que le dessin relit.

   Les mêmes camions se prennent aussi sur le plan, en vue immersive
   (`outil-foodtruck.mjs`).

   Un module de l'administration : `fiche-zone.mjs` l'importe.
   ============================================================ */
import { CONF, enregistreConf } from "./configuration.mjs";
import { camions, figeCamions, ajouteCamion, rapprocheCamion, reglageCamionsValide, CAMION, CAMIONS_MAX }
  from "./decor.mjs";
import { anneauDe, emprise } from "./outil-comptoir.mjs";
import { texteCamions } from "./rendu.mjs";

const NS = "http://www.w3.org/2000/svg";
/* Le pas de l'angle sous la poignée : un camion se gare droit, ou de biais à
   quarante-cinq degrés — Maj libère le pas. */
const PAS_ANGLE = 5;

const el = (/** @type {string} */ nom, /** @type {Record<string, any>} */ attrs = {}) => {
  const n = document.createElementNS(NS, nom);
  Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
  return n;
};
const bouton = (/** @type {string} */ texte) => {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = texte;
  return b;
};

/**
 * Écrire le réglage d'une zone — ou l'oublier, « null » rendant le rangement
 * d'office — et le poser sur la zone dessinée, que le plan relit.
 * @param {string} id
 * @param {{ u: number, v: number, a: number }[] | null} r
 */
export function ecritCamions(id, r){
  const t = CONF._foodtrucks = CONF._foodtrucks || {};
  if (r) t[id] = r.map(c => ({ u: +c.u.toFixed(4), v: +c.v.toFixed(4), a: Math.round((((c.a % 360) + 360) % 360) * 10) / 10 }));
  else delete t[id];
  if (!Object.keys(t).length) delete CONF._foodtrucks;
  // la zone peut être d'un autre pavillon : chacune se repeint
  document.querySelectorAll('#zones g[data-id="' + CSS.escape(String(id)) + '"]').forEach(g => {
    if (r) g.setAttribute("data-foodtrucks", texteCamions(t[id]));
    else g.removeAttribute("data-foodtrucks");
  });
}

/**
 * Le champ des camions, posé dans « bloc », qu'on montre ou cache selon le
 * type choisi. Rend `montre(oui)`.
 * @param {HTMLElement} bloc
 * @param {any} o la zone
 */
export function champFoodtrucks(bloc, o){
  const champ = /** @type {HTMLElement} */ (bloc.closest(".champZ") || bloc);
  const an = anneauDe(o.d);
  if (!an){ champ.hidden = true; return () => {}; }
  const { x0, y0, w, h } = emprise(an);
  const marge = Math.max(w, h) * .08;

  const toile = /** @type {SVGSVGElement} */ (el("svg", { class: "comptoirZ camionsZ",
    viewBox: [x0 - marge, y0 - marge, w + 2 * marge, h + 2 * marge].join(" "),
    preserveAspectRatio: "xMidYMid meet", role: "img" }));
  toile.setAttribute("aria-label", "Contour de la zone et ses foodtrucks");
  toile.appendChild(el("path", { class: "solZ", d: "M" + an.map(p => p.join(" ")).join("L") + "Z" }));
  const parc = el("g");
  const tige = el("line", { class: "tigeZ" });
  const poignee = el("circle", { class: "poigneeZ" });
  toile.append(parc, tige, poignee);

  const nombre = document.createElement("input");
  nombre.type = "number";
  nombre.min = "0"; nombre.max = String(CAMIONS_MAX); nombre.step = "1";
  nombre.className = "nombreZ";
  nombre.setAttribute("aria-label", "Nombre de foodtrucks");
  const moins = bouton("−"), plus = bouton("+");
  moins.setAttribute("aria-label", "Un foodtruck de moins");
  plus.setAttribute("aria-label", "Un foodtruck de plus");
  const compte = document.createElement("div");
  compte.className = "rangeeComptoirZ";
  const dit = document.createElement("span");
  dit.className = "degresZ";
  compte.append(moins, nombre, plus, dit);

  const angle = document.createElement("input");
  angle.type = "range";
  angle.min = "0"; angle.max = "359"; angle.step = "1";
  angle.setAttribute("aria-label", "Orientation du foodtruck choisi");
  const degres = document.createElement("span");
  degres.className = "degresZ";
  const quart = bouton("Quart de tour"), retire = bouton("Retirer"), auto = bouton("Placement automatique");
  const rangee = document.createElement("div");
  rangee.className = "rangeeComptoirZ";
  rangee.append(angle, degres, quart, retire, auto);
  bloc.append(compte, toile, rangee);

  /* L'état du champ : le réglage enregistré, ou rien tant qu'on n'a touché à
     rien — c'est alors le rangement d'office que l'exploitant voit. */
  let r = reglageCamionsValide((CONF._foodtrucks || {})[o.id]) ? figeCamions(an, CONF._foodtrucks[o.id]) : null;
  /** Le camion tenu, par son rang. */
  let tenu = -1;
  const poses = () => camions(an, r);
  /** Le réglage qu'on modifie : celui en place, ou le rangement d'office figé. */
  const fige = () => (r = figeCamions(an, r));

  const dessine = () => {
    const liste = poses();
    if (tenu >= liste.length) tenu = liste.length - 1;
    parc.replaceChildren(...liste.map((c, i) => {
      const g = el("g", { class: "camionZ" + (i === tenu ? " tenu" : ""),
        transform: "translate(" + c.cx + " " + c.cy + ") rotate(" + c.angle + ") scale(" + c.k + ")" });
      // la caisse, la cabine à l'avant, le store et le comptoir sur le flanc qui sert
      g.append(el("rect", { class: "caisseZ", x: -CAMION.ar, y: -CAMION.dos, width: 4.8, height: 2.3 }),
        el("rect", { class: "cabineZ", x: 1.7, y: -1.05, width: 1.4, height: 2.1 }),
        el("rect", { class: "storeZ", x: -CAMION.ar, y: .65, width: 4.8, height: .5 }),
        el("rect", { class: "guichetZ", x: -2.3, y: 1.15, width: 3.2, height: .35 }));
      g.addEventListener("pointerdown", commence("place", i));
      return g;
    }));
    const c = liste[tenu];
    tige.style.display = poignee.style.display = c ? "" : "none";
    if (c){
      // la poignée au-delà de la cabine, assez loin pour qu'on l'attrape dans une zone immense
      const t = c.angle * Math.PI / 180, d0 = CAMION.av * c.k, d1 = d0 + Math.max(1.4, Math.max(w, h) * .07);
      tige.setAttribute("x1", String(c.cx + Math.cos(t) * d0)); tige.setAttribute("y1", String(c.cy + Math.sin(t) * d0));
      tige.setAttribute("x2", String(c.cx + Math.cos(t) * d1)); tige.setAttribute("y2", String(c.cy + Math.sin(t) * d1));
      poignee.setAttribute("cx", String(c.cx + Math.cos(t) * d1)); poignee.setAttribute("cy", String(c.cy + Math.sin(t) * d1));
      poignee.setAttribute("r", String(Math.max(.4, Math.max(w, h) * .028)));
      const a = Math.round(((c.angle % 360) + 360) % 360) % 360;
      angle.value = String(a);
      degres.textContent = a + "°";
    } else degres.textContent = "";
    angle.disabled = quart.disabled = retire.disabled = !c;
    nombre.value = String(liste.length);
    moins.disabled = !liste.length;
    dit.textContent = r ? "" : "rangement automatique";
    auto.disabled = !r;
  };

  const enregistre = () => { ecritCamions(o.id, r); enregistreConf(); };

  /** Vouloir un autre réglage pour le camion tenu : il reste dans sa zone. */
  const veut = (/** @type {(q: { u: number, v: number, a: number }) => void} */ change) => {
    const liste = fige();
    if (!liste[tenu]) return;
    const depart = { ...liste[tenu] }, voulu = { ...depart };
    change(voulu);
    voulu.u = Math.min(1, Math.max(0, voulu.u));
    voulu.v = Math.min(1, Math.max(0, voulu.v));
    liste[tenu] = rapprocheCamion(an, depart, voulu);
  };

  const versPlan = (/** @type {PointerEvent} */ e) => {
    const m = toile.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };
  /** @type {{ genre: string, dx: number, dy: number } | null} */
  let geste = null;
  function commence(/** @type {string} */ genre, /** @type {number} */ i){
    return (/** @type {PointerEvent} */ e) => {
      const p = versPlan(e);
      if (!p) return;
      e.preventDefault(); e.stopPropagation();
      if (i >= 0) tenu = i;
      const c = poses()[tenu];
      if (!c) return;
      geste = { genre, dx: p[0] - c.cx, dy: p[1] - c.cy };
      toile.setPointerCapture(e.pointerId);
      dessine();
    };
  }
  poignee.addEventListener("pointerdown", commence("tourne", -1));
  // un appui sur le sol nu relâche le camion tenu
  toile.addEventListener("pointerdown", () => { if (!geste && tenu >= 0){ tenu = -1; dessine(); } });
  toile.addEventListener("pointermove", e => {
    if (!geste) return;
    const p = versPlan(e), c = poses()[tenu];
    if (!p || !c) return;
    if (geste.genre === "place"){
      const { dx, dy } = geste;
      veut(q => { q.u = (p[0] - dx - x0) / w; q.v = (p[1] - dy - y0) / h; });
    } else {
      // la poignée prolonge l'axe arrière → cabine : l'angle se lit du milieu vers elle
      let a = Math.atan2(p[1] - c.cy, p[0] - c.cx) * 180 / Math.PI;
      if (!e.shiftKey) a = Math.round(a / PAS_ANGLE) * PAS_ANGLE;
      veut(q => { q.a = a; });
    }
    dessine();
  });
  const lache = () => { if (!geste) return; geste = null; enregistre(); };
  toile.addEventListener("pointerup", lache);
  toile.addEventListener("pointercancel", lache);

  /** Amener le nombre de camions à « n » : on retire les derniers, on ajoute
   *  aux places libres — jusqu'à ce que la zone soit pleine. */
  const vise = (/** @type {number} */ n) => {
    let liste = fige();
    n = Math.max(0, Math.min(CAMIONS_MAX, Math.round(n) || 0));
    if (n < liste.length) liste = liste.slice(0, n);
    while (liste.length < n){
      const q = ajouteCamion(an, liste);
      if (!q) break;
      liste = [...liste, q];
    }
    r = liste;
    if (tenu >= liste.length) tenu = -1;
    dessine();
    enregistre();
  };
  nombre.onchange = () => vise(+nombre.value);
  moins.onclick = () => vise(poses().length - 1);
  plus.onclick = () => {
    const avant = poses().length;
    vise(avant + 1);
    // le nouveau venu est pris en main : c'est lui qu'on va placer
    if (poses().length > avant){ tenu = avant; dessine(); }
    else dit.textContent = "la zone est pleine";
  };
  angle.oninput = () => { veut(q => { q.a = +angle.value; }); dessine(); };
  angle.onchange = enregistre;
  quart.onclick = () => { veut(q => { q.a += 90; }); dessine(); enregistre(); };
  retire.onclick = () => {
    const liste = fige();
    liste.splice(tenu, 1);
    tenu = -1;
    dessine();
    enregistre();
  };
  auto.onclick = () => { r = null; tenu = -1; dessine(); enregistre(); };

  dessine();
  return (/** @type {boolean} */ oui) => { champ.hidden = !oui; };
}
