/* ============================================================
   Le texte sur le plan — sa mesure, sa coupe en lignes, sa place

   Tout ce qui écrit sur le plan
   s'en sert : les libellés des stands et des zones (`libelles.mjs`), les
   repères et les stands dessinés à la main (`dessin.mjs`), la case du
   numéro dans la liste (`recherche.mjs`), l'affiche du hall
   (`affiche-ici.mjs`). Il ne dépend de rien d'autre que du canevas : c'est ce
   qui permet à chacun de l'importer, y compris ceux que les libellés
   importent à leur tour.

   Le changement de langue vide les mesures gardées (`gestes.mjs`
   `brancheLangue`) : il importe la table telle quelle, qui n'est jamais
   remplacée.
   ============================================================ */
import { esc } from "./texte.mjs";

/* ============================================================
   2. Mesure de texte — largeur réelle dans la police de rendu
   ============================================================ */
const _cvs = document.createElement("canvas").getContext("2d");
/* Une mesure par police et par texte, sous la clé « police|texte » : la
   police, telle que le canevas la reçoit, se relit de la clé quand il faut
   remesurer. */
export const _lg = new Map();
function mesureTexte(police, txt){
  _cvs.font = police;
  const v = _cvs.measureText(txt).width / 100;
  return v > 0 ? v : txt.length * .55;
}
export function largeur(txt, police){
  const p = police[0] + " 100px " + police[1];
  const k = p + "|" + txt;
  let v = _lg.get(k);
  if (v === undefined){
    v = mesureTexte(p, txt);
    _lg.set(k, v);
  }
  return v;
}

/* Une police qui arrive après la mesure la rend fausse : tant que son fichier
   manque, le canevas mesure dans celle de repli. Et elle arrive souvent après —
   celle des numéros n'est demandée qu'au premier tracé du plan, celle d'un
   modèle qu'au moment où on le choisit, la partie accentuée d'une police qu'au
   premier nom qui en a besoin. `document.fonts.ready`, tenu une seule fois au
   chargement, n'en voit aucune. On guette donc chaque arrivée, et l'on refait
   les mesures gardées : si l'une change, le plan se retrace sur les bonnes.
   La comparaison épargne le tracé aux polices qui ne touchent pas le plan —
   celle d'une fiche, d'une fenêtre.

   L'écoute elle-même se pose au branchement de la recherche (`recherche.mjs`
   `brancheRecherche`), qui refait les noms et la liste, parmi les premiers
   du lancement : elle passe ainsi avant celle du rendu WebGL, qui repeint à la même arrivée en relisant les
   libellés, et les trouve déjà retaillés. */
export function remesureTextes(){
  let change = false;
  for (const [k, v] of _lg){
    const i = k.indexOf("|");
    const w = mesureTexte(k.slice(0, i), k.slice(i + 1));
    if (w !== v){ _lg.set(k, w); change = true; }
  }
  return change;
}

/* La graisse et la police dans lesquelles le plan écrit ses libellés,
   `P_NOM` et `P_CODE`, vivent avec la police des noms
   (`modules/polices-plan.mjs`) : on les lit ici par accesseur, et seul
   `posePoliceLibelles` les remplace. */

function decoupe(txt, n){
  if (n === 1) return [txt];
  const mots = txt.split(/\s+/);
  if (mots.length < n) return null;
  const cible = Math.ceil(txt.length / n);
  const out = [""];
  for (const m of mots){
    const cur = out[out.length - 1];
    if (cur && (cur + " " + m).length > cible && out.length < n) out.push(m);
    else out[out.length - 1] = cur ? cur + " " + m : m;
  }
  return out.length === n ? out : null;
}
export function habille(txt, w, h, maxPolice, police){
  let best = null;
  for (let n = 1; n <= 3; n++){
    const lignes = decoupe(txt, n);
    if (!lignes) continue;
    const plusLarge = Math.max(...lignes.map(l => largeur(l, police)));
    const f = Math.min(w / plusLarge, h / (lignes.length * 1.18), maxPolice);
    if (!best || f > best.f) best = { f, lignes };
  }
  return best;
}
export function lignesSvg(lignes, f, x, yCentre, cls){
  const dep = yCentre - ((lignes.length - 1) * f * 1.18) / 2 + f * .33;
  return lignes.map((t, i) =>
    '<text class="' + cls + '" x="' + x + '" y="' + (dep + i * f * 1.18).toFixed(2) +
    '" font-size="' + f.toFixed(2) + '">' + esc(t) + '</text>').join("");
}

/* ============================================================
   4. Libellés — le nom de l'exposant prime sur le numéro
   ============================================================ */
/* Où écrire le nom, et de quelle place on dispose.
   Sur une forme découpée — un L, un U, un stand à redent — le centre de la
   boîte englobante tombe hors de la forme et cette boîte promet une largeur
   qui n'existe pas. La synchronisation calcule alors un ancrage intérieur et
   la place réellement libre autour de lui ; un rectangle n'en a pas besoin. */
export const ancre = (o) => o.lc || o.c;
export const place = (o) => o.lb || o.bb;
