/* ============================================================
   La scène du plan, peinte dans le SVG quand c'est lui qui montre le plan

   Les surcouches du visiteur — marques des distinctions, liserés du parcours,
   zone de la visite guidée, point de la borne, trajet — se posent en données
   dans la scène (`scene.mjs`), que le dessin (`webgl.mjs`) peint. Sur un
   poste sans carte graphique, c'est le SVG qui montre le plan
   (`svg-de-secours.mjs`) : ce module les y pose, depuis les mêmes données,
   chacune dans le groupe qui porte le nom de son jeu (`#dists`, `#itin`…) —
   la feuille y retrouve ce qu'elle anime encore, le battement de la zone
   désignée. Quand le WebGL peint, il n'écrit rien : le SVG caché n'a pas à
   porter ce que personne ne regarde.

   Les repères des outils de l'exploitant n'y passent pas : l'administration
   exige le WebGL.

   Écrit par l'API du DOM, et non en HTML : les données viennent pour partie
   des exposants (un tracé, un nom de borne), et rien n'a à y être échappé.
   Les couleurs passent par le style en ligne, seul à accepter un jeton de la
   racine (`var(--accent)`) ; les traits gardent leur épaisseur à l'écran.

   Il s'inscrit en se chargeant : le point d'entrée du plan l'importe sans nom.
   ============================================================ */
import { JEUX, reperes, SCENE_CHANGEE } from "./scene.mjs";
import { SVG_REPRIS, svgPeint } from "./svg-de-secours.mjs";
import { svg } from "./vue-etat.mjs";

const NS = "http://www.w3.org/2000/svg";
const traceDe = (/** @type {number[][][]} */ anneaux, ferme = true) =>
  anneaux.map(a => "M" + a.map(p => p[0] + " " + p[1]).join("L") + (ferme ? "Z" : "")).join("");

/* Une couleur écrite en toutes lettres se pose en attribut, comme les modules
   l'écrivaient ; un jeton de la racine, que l'attribut refuse, en style. */
function couleur(/** @type {SVGElement} */ el, /** @type {"fill" | "stroke"} */ quoi, /** @type {string | undefined} */ c){
  if (c && c.startsWith("--")) el.style.setProperty(quoi, "var(" + c + ")");
  else el.setAttribute(quoi, c || "none");
}

/** Le nœud SVG d'un repère. */
function noeud(/** @type {import("./scene.mjs").Repere} */ r){
  const op = r.opacite === undefined ? 1 : r.opacite;
  /** @type {SVGElement} */
  let el;
  if (r.sorte === "texte"){
    el = document.createElementNS(NS, "text");
    const [x, y] = r.position || [0, 0];
    el.setAttribute("x", String(x)); el.setAttribute("y", String(y));
    el.setAttribute("font-size", String(r.taille || 1));
    if (r.ancre === "middle" || r.ancre === "centre") el.setAttribute("text-anchor", "middle");
    if (r.ancre === "centre") el.setAttribute("dominant-baseline", "central");
    if (r.graisse) el.setAttribute("font-weight", String(r.graisse));
    if (r.famille) el.setAttribute("font-family", r.famille);
    couleur(el, "fill", r.plein);
    el.textContent = r.texte || "";
  } else if (r.sorte === "image"){
    el = document.createElementNS(NS, "image");
    const b = r.bornes || [0, 0, 0, 0];
    el.setAttribute("x", String(b[0])); el.setAttribute("y", String(b[1]));
    el.setAttribute("width", String(b[2] - b[0])); el.setAttribute("height", String(b[3] - b[1]));
    el.setAttribute("preserveAspectRatio", "none");
    el.setAttribute("href", r.href || "");
  } else {
    el = document.createElementNS(NS, "path");
    const aplat = r.sorte === "aplat";
    el.setAttribute("d", aplat ? traceDe(r.anneaux || []) : traceDe([r.chemin || []], Boolean(r.ferme)));
    couleur(el, "fill", aplat ? r.plein : undefined);
    if (aplat) el.setAttribute("fill-rule", "evenodd");
    couleur(el, "stroke", r.trait);
    if (r.trait){
      el.setAttribute("stroke-width", String(r.epaisseur || 1));
      el.setAttribute("vector-effect", "non-scaling-stroke");
      el.setAttribute("stroke-linejoin", "round");
      if (r.rond) el.setAttribute("stroke-linecap", "round");
      if (r.tirets) el.setAttribute("stroke-dasharray", r.tirets.join(" "));
    }
  }
  // une seule opacité : celle du nœud ; deux, celles de l'aplat et du trait
  if (r.opaciteTrait !== undefined){
    el.setAttribute("fill-opacity", String(op));
    el.setAttribute("stroke-opacity", String(r.opaciteTrait));
  } else if (op < 1) el.setAttribute("opacity", String(op));
  if (r.classe) el.setAttribute("class", r.classe);
  return el;
}

/** Les groupes des jeux publics, rangés dans l'ordre de la scène : les
 *  marques des distinctions juste après les stands, le reste à la fin du plan. */
function range(){
  const st = document.getElementById("stands");
  for (const j of JEUX){
    const g = j.public && document.getElementById(j.nom);
    if (!g) continue;
    if (j.rang === "stands"){ if (st && st.nextSibling !== g) st.after(g); }
    else svg.appendChild(g);
  }
}

/** Pose un jeu public dans le SVG s'il peint le plan, l'en retire sinon. */
function peint(/** @type {string} */ nom){
  const j = JEUX.find(x => x.nom === nom);
  if (!j || !j.public || !svg) return;
  /** @type {Element | null} */
  let g = document.getElementById(nom);
  const liste = reperes(nom);
  if (!svgPeint() || !liste.length){ if (g) g.remove(); return; }
  if (!g){
    g = document.createElementNS(NS, "g");
    g.id = nom;
    g.setAttribute("aria-hidden", "true");
    svg.appendChild(g);
    range();
  }
  g.replaceChildren(...liste.map(noeud));
}

SCENE_CHANGEE.ecoute(peint);
// le SVG reprend la main : tout ce qu'il doit montrer se pose
SVG_REPRIS.ecoute(() => { for (const j of JEUX) if (j.public) peint(j.nom); });
