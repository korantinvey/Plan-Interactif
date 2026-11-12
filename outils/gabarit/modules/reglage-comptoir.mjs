/* ============================================================
   Le comptoir d'un accueil — où l'exploitant le pose, dans quel sens

   La vue immersive meuble une zone « Accueil » d'un comptoir (`decor.mjs`
   `comptoir`). Rien ne dit où est l'entrée du hall : posé d'office au milieu
   de la zone, il tombait en plein passage. Ce champ de la fiche d'une zone
   montre son contour, vu comme sur le plan, et le comptoir dessus : on le
   fait glisser pour le placer, on tire sa poignée ronde pour le tourner.

   Le réglage n'appartient pas à la fiche de l'événement mais à l'apparence
   du plan : il se range dans la configuration (`_comptoirs`, par zone), part
   au visiteur à la publication comme le reste, et vaut pour une zone de la
   source comme pour une zone ajoutée à la main. Il s'enregistre au lâcher,
   sans attendre la fermeture de la fiche : c'est un geste sur le plan, pas
   un texte qu'on rédige.

   Le plan suit sans rien remonter : le comptoir posé en attribut sur la zone
   (`rendu.mjs`) est ce que le dessin relit, et le SVG observé se repeint dès
   qu'il change.

   Le même comptoir se prend aussi sur le plan, en vue immersive
   (`outil-comptoir.mjs`), d'où ce champ emprunte la lecture du contour.

   Un module de l'administration : `fiche-zone.mjs` l'importe.
   ============================================================ */
import { CONF, enregistreConf } from "./configuration.mjs";
import { comptoir, reglageComptoirValide, rapprocheComptoir } from "./decor.mjs";
import { anneauDe } from "./outil-comptoir.mjs";

const NS = "http://www.w3.org/2000/svg";
/* Le pas de l'angle sous la poignée : un comptoir se pose droit, de biais à
   quarante-cinq degrés, rarement entre deux — Maj libère le pas. */
const PAS_ANGLE = 5;

const el = (/** @type {string} */ nom, /** @type {Record<string, any>} */ attrs = {}) => {
  const n = document.createElementNS(NS, nom);
  Object.keys(attrs).forEach(k => n.setAttribute(k, attrs[k]));
  return n;
};

/**
 * Le champ du comptoir, posé dans « bloc », qu'on montre ou cache selon le
 * type choisi. Rend `montre(oui)`.
 * @param {HTMLElement} bloc
 * @param {any} o la zone
 */
export function champComptoir(bloc, o){
  // le champ entier se cache, intitulé et aide compris
  const champ = /** @type {HTMLElement} */ (bloc.closest(".champZ") || bloc);
  const an = anneauDe(o.d);
  if (!an){ champ.hidden = true; return () => {}; }
  const xs = an.map(p => p[0]), ys = an.map(p => p[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const w = Math.max(Math.max(...xs) - x0, 1e-6), h = Math.max(Math.max(...ys) - y0, 1e-6);
  const marge = Math.max(w, h) * .08;

  const toile = /** @type {SVGSVGElement} */ (el("svg", { class: "comptoirZ", viewBox: [x0 - marge, y0 - marge, w + 2 * marge, h + 2 * marge].join(" "),
    preserveAspectRatio: "xMidYMid meet", role: "img" }));
  toile.setAttribute("aria-label", "Contour de la zone et son comptoir");
  toile.appendChild(el("path", { class: "solZ", d: "M" + an.map(p => p.join(" ")).join("L") + "Z" }));
  const meuble = el("g", { class: "meubleZ" });
  const plateau = el("rect", { class: "plateauZ" });
  const plantes = [el("circle", { class: "planteZ" }), el("circle", { class: "planteZ" })];
  const tige = el("line", { class: "tigeZ" });
  const poignee = el("circle", { class: "poigneeZ" });
  meuble.append(...plantes, plateau, tige, poignee);
  toile.appendChild(meuble);

  const angle = document.createElement("input");
  angle.type = "range";
  angle.min = "0"; angle.max = "179"; angle.step = "1";
  angle.setAttribute("aria-label", "Orientation du comptoir");
  const degres = document.createElement("span");
  degres.className = "degresZ";
  const quart = document.createElement("button");
  quart.type = "button";
  quart.textContent = "Quart de tour";
  const auCentre = document.createElement("button");
  auCentre.type = "button";
  auCentre.textContent = "Placement automatique";
  const rangee = document.createElement("div");
  rangee.className = "rangeeComptoirZ";
  rangee.append(angle, degres, quart, auCentre);
  bloc.append(toile, rangee);

  /* L'état du champ : le réglage enregistré, ou le placement d'office tant
     qu'on n'a touché à rien — c'est lui que l'exploitant voit sur le plan. */
  let r = reglageComptoirValide((CONF._comptoirs || {})[o.id]) ? { ...CONF._comptoirs[o.id] } : null;
  const place = () => {
    const c = comptoir(an, r);
    const a = ((c.angle % 180) + 180) % 180;
    return { ...c, angle: a };
  };

  const dessine = () => {
    const c = place();
    // le comptoir garde au moins une taille qu'on attrape, dans une zone immense
    const demi = Math.max(c.demi, Math.max(w, h) * .05), prof = Math.max(c.prof, Math.max(w, h) * .015);
    plateau.setAttribute("x", String(-demi)); plateau.setAttribute("y", String(-prof));
    plateau.setAttribute("width", String(2 * demi)); plateau.setAttribute("height", String(2 * prof));
    meuble.setAttribute("transform", "translate(" + c.cx + " " + c.cy + ") rotate(" + c.angle + ")");
    const rp = Math.max(w, h) * .025;
    plantes.forEach((p, i) => {
      p.setAttribute("cx", String((i ? 1 : -1) * (demi + rp * 1.6))); p.setAttribute("cy", "0");
      p.setAttribute("r", String(rp));
    });
    // la poignée de rotation, au bout d'une tige perpendiculaire au comptoir
    const bout = prof + Math.max(w, h) * .09;
    tige.setAttribute("x1", "0"); tige.setAttribute("y1", String(-prof));
    tige.setAttribute("x2", "0"); tige.setAttribute("y2", String(-bout));
    poignee.setAttribute("cx", "0"); poignee.setAttribute("cy", String(-bout));
    poignee.setAttribute("r", String(rp * 1.1));
    angle.value = String(Math.round(c.angle) % 180);
    degres.textContent = Math.round(c.angle) % 180 + "°";
    auCentre.disabled = !r;
  };

  /** Le réglage qui part : celui du moment, ramené à des nombres courts. */
  const enregistre = () => {
    const t = CONF._comptoirs = CONF._comptoirs || {};
    if (r) t[o.id] = { u: +r.u.toFixed(4), v: +r.v.toFixed(4), a: Math.round(r.a * 10) / 10 };
    else delete t[o.id];
    if (!Object.keys(t).length) delete CONF._comptoirs;
    enregistreConf();
    // le plan relit l'attribut et se repeint ; la zone peut être d'un autre pavillon
    document.querySelectorAll('#zones g[data-id="' + CSS.escape(String(o.id)) + '"]').forEach(g => {
      if (r) g.setAttribute("data-comptoir", [t[o.id].u, t[o.id].v, t[o.id].a].join(" "));
      else g.removeAttribute("data-comptoir");
    });
  };

  /** Le réglage qu'on modifie : celui en place, ou le placement d'office figé. */
  const fige = () => {
    // un réglage qui ne tient plus dans la zone retouchée ne compte plus
    if (r && comptoir(an, r).choisi) return r;
    const c = place();
    return (r = { u: (c.cx - x0) / w, v: (c.cy - y0) / h, a: c.angle });
  };
  /** Vouloir un autre réglage : le comptoir reste dans sa zone, et s'arrête
   *  contre le bord qu'on lui fait franchir (`decor.mjs` `rapprocheComptoir`). */
  const veut = (/** @type {(q: { u: number, v: number, a: number }) => void} */ change) => {
    const depart = { ...fige() }, voulu = { ...depart };
    change(voulu);
    voulu.u = Math.min(1, Math.max(0, voulu.u));
    voulu.v = Math.min(1, Math.max(0, voulu.v));
    voulu.a = ((voulu.a % 180) + 180) % 180;
    r = rapprocheComptoir(an, depart, voulu);
  };

  const versPlan = (/** @type {PointerEvent} */ e) => {
    const m = toile.getScreenCTM();
    if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [p.x, p.y];
  };
  /** @type {{ genre: string, dx: number, dy: number } | null} */
  let geste = null;
  const commence = (/** @type {string} */ genre) => (/** @type {PointerEvent} */ e) => {
    const p = versPlan(e);
    if (!p) return;
    e.preventDefault(); e.stopPropagation();
    const c = place();
    geste = { genre, dx: p[0] - c.cx, dy: p[1] - c.cy };
    toile.setPointerCapture(e.pointerId);
  };
  plateau.addEventListener("pointerdown", commence("place"));
  plantes.forEach(p => p.addEventListener("pointerdown", commence("place")));
  poignee.addEventListener("pointerdown", commence("tourne"));
  toile.addEventListener("pointermove", e => {
    if (!geste) return;
    const p = versPlan(e);
    if (!p) return;
    if (geste.genre === "place"){
      const { dx, dy } = geste;
      veut(q => { q.u = (p[0] - dx - x0) / w; q.v = (p[1] - dy - y0) / h; });
    } else {
      const c = place();
      // la poignée est du côté « -y » du comptoir : l'angle se lit d'elle au milieu
      let a = Math.atan2(p[0] - c.cx, -(p[1] - c.cy)) * 180 / Math.PI;
      if (!e.shiftKey) a = Math.round(a / PAS_ANGLE) * PAS_ANGLE;
      veut(q => { q.a = a; });
    }
    dessine();
  });
  const lache = () => { if (!geste) return; geste = null; enregistre(); };
  toile.addEventListener("pointerup", lache);
  toile.addEventListener("pointercancel", lache);

  angle.oninput = () => { veut(q => { q.a = +angle.value; }); dessine(); };
  angle.onchange = enregistre;
  quart.onclick = () => { veut(q => { q.a += 90; }); dessine(); enregistre(); };
  auCentre.onclick = () => { r = null; dessine(); enregistre(); };

  dessine();
  return (/** @type {boolean} */ oui) => { champ.hidden = !oui; };
}
