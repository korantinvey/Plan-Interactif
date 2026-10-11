/* ============================================================
   Le lever de rideau — le plan se dévoile, allée par allée

   Le plan paraissait d'un bloc, comme une image qu'on aurait fini de
   télécharger. Au premier chargement d'une visite, il se dévoile plutôt par
   bandes, de gauche à droite, à la largeur d'une allée : un montage de salon
   en accéléré, une seconde à peine. Une fois par visite seulement — le
   revoir à chaque retour sur la page deviendrait une attente.

   Le rideau est fait de bandes de la couleur de la scène, posées par-dessus le
   plan et sous les commandes, qui se relèvent l'une après l'autre. Il ne sait
   rien du rendu : il couvre la carte graphique comme le SVG, et le fond de
   carte qui arrive derrière.

   Il attend que le plan soit vraiment là — la première image de la carte
   graphique quand elle dessine, et la fin du générique du sponsor quand il y
   en a un : se relever sous un logo, c'est se relever pour personne.

   Pas de rideau en administration, ni pour qui réduit les animations, ni
   quand la page s'ouvre sur quelque chose de précis — un stand, une
   conférence, un parcours reçu : on vient le voir, pas assister au montage.
   ============================================================ */
import { PLAN_ADMIN, SLUG } from "./salon.mjs";
import { REDUIT } from "./ecran.mjs";
import { svg, emp, versScene } from "./vue.mjs";
import { resteSponsor } from "./sponsor.mjs";

/* La largeur d'une bande, en mètres : à peu près une allée et ses deux rangs
   de stands. Bornée en nombre, pour qu'un petit hall ait encore un mouvement
   et qu'un très grand ne s'éternise pas. */
const BANDE = 9, MIN = 6, MAX = 16;
/* Le relèvement d'une bande, et l'écart entre deux. */
const DUREE = 520, ECART = 42;
/* Le plan qui tarde : on lève quand même. */
const BUTOIR = 5000;

const cleVue = () => "plan-rideau:" + SLUG;

/* `?rideau` le rejoue à chaque chargement : pour le montrer, ou le régler. */
const FORCE = new URLSearchParams(location.search).has("rideau");

function dejaVu(){
  if (FORCE) return false;
  try { return sessionStorage.getItem(cleVue()) === "1"; } catch (e) { return false; }
}
function retiens(){
  try { sessionStorage.setItem(cleVue(), "1"); } catch (e) {}
}

/* La page s'ouvre sur un stand, une conférence ou un parcours : c'est eux
   qu'on vient voir. */
function ouvertSurQuelqueChose(){
  const v = decodeURIComponent((location.hash || "").slice(1)).toLowerCase();
  return (v && v !== "admin") || new URLSearchParams(location.search).has("conf");
}

/**
 * Pose le rideau sur le plan qu'on vient de monter, puis le lève quand le plan
 * est là. Appelée par `demarrage.mjs` `demarre`, juste après le premier
 * cadrage : le rideau doit être en place avant la première image du plan.
 */
export function poseRideau(){
  if (PLAN_ADMIN || REDUIT || dejaVu() || ouvertSurQuelqueChose() || !emp) return;
  const stage = svg.parentElement;
  if (!stage || !stage.clientWidth) return;
  retiens();

  const [x0] = versScene(emp.x0, emp.y0), [x1] = versScene(emp.x1, emp.y1);
  // un peu au-delà des murs : le trait du hall déborde, et son ombre aussi
  const g = Math.max(0, Math.min(x0, x1) - 24), d = Math.min(stage.clientWidth, Math.max(x0, x1) + 24);
  const n = Math.max(MIN, Math.min(MAX, Math.round((emp.x1 - emp.x0) / BANDE)));
  const rideau = document.createElement("div");
  rideau.className = "rideau";
  rideau.setAttribute("aria-hidden", "true");
  const bandes = [];
  for (let i = 0; i < n; i++){
    const b = document.createElement("i");
    /* Un pixel de recouvrement entre deux bandes : arrondies chacune de leur
       côté, deux bandes jointives laissaient voir un fil du plan. */
    /* Les deux bandes du bout vont jusqu'aux bords de la scène : ce qui
       dépasse des murs — une zone, un repère dehors — se montrait sinon avant
       le reste. */
    const gauche = i ? g + (d - g) * i / n : 0;
    const droite = i === n - 1 ? stage.clientWidth : g + (d - g) * (i + 1) / n + 1;
    b.style.left = gauche + "px";
    b.style.width = (droite - gauche) + "px";
    rideau.appendChild(b);
    bandes.push(b);
  }
  // au-dessus du plan, sous tout ce qui se pose après lui dans la scène
  svg.after(rideau);

  let leve = false;
  const releve = (/** @type {boolean} */ vite) => {
    if (leve) return;
    leve = true;
    clearTimeout(butoir);
    stage.removeEventListener("pointerdown", presse, true);
    const anims = bandes.map((b, i) => b.animate(
      [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }],
      { duration: vite ? 180 : DUREE, delay: vite ? 0 : i * ECART,
        easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }));
    Promise.all(anims.map(a => a.finished.catch(() => {}))).then(() => rideau.remove());
  };
  /* Qui touche le plan avant la fin veut s'en servir : le rideau s'efface
     d'un coup plutôt que de se tenir entre lui et sa main. */
  const presse = () => releve(true);
  stage.addEventListener("pointerdown", presse, true);
  const butoir = setTimeout(() => releve(false), BUTOIR);

  const quandPret = () => {
    const sponsor = resteSponsor();
    /* Le générique s'estompe : on commence à se lever pendant qu'il part,
       pour que le mouvement se voie à travers lui. */
    if (sponsor) setTimeout(() => releve(false), Math.max(0, sponsor - 250));
    else requestAnimationFrame(() => releve(false));
  };
  /* La carte graphique ne montre le plan qu'à sa première image, et le dit
     par « gl-pret » ; tant qu'elle se fait attendre, le SVG reste caché. On
     guette la classe sans en écrire aucune sur la racine : le rendu repeint
     tout le plan à chaque changement de celle-ci. */
  const racine = document.documentElement;
  if (!racine.classList.contains("gl-attente")){ quandPret(); return; }
  const guet = new MutationObserver(() => {
    if (racine.classList.contains("gl-attente")) return;
    guet.disconnect();
    quandPret();
  });
  guet.observe(racine, { attributes: true, attributeFilter: ["class"] });
}
