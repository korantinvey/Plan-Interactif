/* ============================================================
   Les libellés du plan — le nom de l'exposant prime sur le numéro

   Deux dessins des noms vivent ici, le SVG et la préparation pour la carte
   graphique (`webgl.mjs`) : les deux écrivent les mêmes noms, aux mêmes seuils, l'un en SVG à chaque arrêt de la
   vue, l'autre une fois pour toutes avec l'intervalle de zoom où chacun se
   lit. Les garder côte à côte, c'est ce qui les tient d'accord.

   Il n'a pas de branchement : l'écoute des polices arrivées, qui le refait
   avec la liste, est posée par la recherche (`recherche.mjs`
   `brancheRecherche`), qui les importe tous deux. La
   vue, les calques de dessin, la boîte d'une forme et le nom d'une zone dans
   la langue du moment s'importent (`vue.mjs`, `calques-dessin.mjs`,
   `forme-choisie.mjs`, `noms-zones.mjs`), comme le dessin des stands et des
   calques (`dessin.mjs`), la mise en avant d'une zone (`cartouche-poi.mjs`)
   et ce qu'un emplacement écrit (`nom-emplacement.mjs`).

   La carte graphique (`webgl.mjs`) et la vue (`vue.mjs`), qu'il importe, le
   reçoivent par leur branchement.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { parId, state, P } from "./donnees.mjs";
import { P_NOM, P_CODE, confieAuxPolices } from "./polices-plan.mjs";
import { largeur, habille, lignesSvg, ancre, place, coupes } from "./texte-plan.mjs";
import { rectangleLibre } from "./place-libre.mjs";
import { PLACE_LIBELLES, libSel, placementLibelle } from "./libelle-place.mjs";
import { GL, planifieWebgl, poseModelesLibelles, confieAuWebgl } from "./webgl.mjs";
import { capCamera, SINUS_INCLINAISON } from "./camera.mjs";
import { view, cadrePlan, repeintLibelles, confieALaVue } from "./vue.mjs";
import { visibleSurPlan, visibleSociete } from "./filtre.mjs";
import { phareZone } from "./cartouche-poi.mjs";
import { libelleEmplacement, coexComptes, coexChoisit, decaleLibelle, facteurLibelle, libelleForce, nomCouche,
  habilleNom, posePaliers, nomsPivotes }
  from "./nom-emplacement.mjs";
import { rafraichitBorne } from "./vous-etes-ici.mjs";
import { rafraichitBouts } from "./trace-itineraire.mjs";
import { mesCalques } from "./calques-dessin.mjs";
import { nomDeLaZone } from "./noms-zones.mjs";
import { logoPose, cedeAuLogo } from "./logos-stands.mjs";
import { boite } from "./forme-choisie.mjs";
import { TYPES_MEUBLES } from "./decor.mjs";
import { decoupeStand, poseLibellesDessines, rafraichitFleches, societeDeForme, nomSurLePlan } from "./dessin.mjs";




/* Ce qu'un emplacement écrit sur le plan — son nom, son numéro, la pastille
   de ses hébergés, le placement réglé à la main — vit dans
   `nom-emplacement.mjs` : le dessin des stands à la main l'écrit aussi, et
   n'importe plus ce module pour cela. Il s'importe d'ici comme avant. */
export { libelleEmplacement, coexChoisit };

/* ============================================================
   4. Libellés — le nom de l'exposant prime sur le numéro
   ============================================================ */
/* Où écrire le nom, et de quelle place on dispose : `ancre` et `place`, dans
   `texte-plan.mjs` — le placement à la main (`libelle-place.mjs`) les lit
   aussi, et ne peut importer ce module-ci. */

/* ------------------------------------------------------------
   Les emplacements découpés.

   Un emplacement peut porter, posés sur lui, les stands dessinés pour les
   sociétés qu'il héberge, ou des stands ajoutés et liés à lui : chacun écrit
   son nom sur sa part. Le nom de l'emplacement s'écrit alors dans la partie
   restée libre (`place-libre.mjs`), et se tait s'il n'en reste plus — sauf
   choisi : on le cherche, il doit se trouver.
   ------------------------------------------------------------ */
let _libres = { cle: "", map: new Map() };

/**
 * Pour chaque emplacement du pavillon qui porte des parts, sa place libre —
 * `{ c, bb }`, un centre et une taille comme ceux d'un emplacement — ou
 * `null` s'il ne lui en reste pas. Les autres n'y figurent pas.
 */
function partsLibres(p){
  const trous = new Map();
  const ajoute = (id, b) => { if (!trous.has(id)) trous.set(id, []); trous.get(id).push(b); };
  for (const s of p.stands){
    if (s.lien && s.lien.stand && s.c && s.bb)
      ajoute(s.lien.stand, [s.c[0] - s.bb[0] / 2, s.c[1] - s.bb[1] / 2, s.c[0] + s.bb[0] / 2, s.c[1] + s.bb[1] / 2]);
  }
  for (const cal of mesCalques()){
    if (cal.visible === false) continue;
    for (const f of cal.formes) if (f.t === "stand" && f.stand && f.pts && f.pts.length) ajoute(f.stand, boite(f));
  }
  const hotes = p.stands.filter(s => trous.has(s.id) && s.c && s.bb);
  /* Le calcul essaie des dizaines de milliers de rectangles par emplacement :
     on ne le refait que si une part, un emplacement ou un nom a changé, et
     non à chaque arrêt de la vue. */
  const cle = (nomsPivotes() ? "v" : "") + hotes.map(s => s.id + ":" + (s.nom || "") + ":" + s.c.join() + ":" + s.bb.join() + ":" +
    trous.get(s.id).map(b => b.map(v => v.toFixed(2)).join()).join(";")).join("|");
  if (cle === _libres.cle) return _libres.map;
  const map = new Map();
  for (const s of hotes){
    const b = [s.c[0] - s.bb[0] / 2, s.c[1] - s.bb[1] / 2, s.c[0] + s.bb[0] / 2, s.c[1] + s.bb[1] / 2];
    // la taille que le nom prendrait, droit ou couché : les mesures de « libelleDroit »
    const c = s.nom ? coupes(s.nom, P_NOM) : [];
    const taille = (w, h) => c.length
      ? Math.max(...c.map(x => Math.min(w * .9 / x.w, h * .62 / (x.n * 1.18), 2.4)))
      : Math.min(w, h);
    const note = (w, h) => Math.max(taille(w, h), nomsPivotes() && h > w * 1.25 ? taille(h, w) : 0);
    const r = rectangleLibre(b, trous.get(s.id), note);
    if (r === b) continue;
    map.set(s, r ? { c: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], bb: [r[2] - r[0], r[3] - r[1]] } : null);
  }
  _libres = { cle, map };
  return map;
}

export function libelles(){
  if (GL.actif){
    libellesWebgl();
    /* Ce qui garde sa taille à l'écran — pastilles de l'itinéraire, pointes
       de flèche, point de la borne — suit la vue dans « appliqueVue », que le
       rendu WebGL court-circuite pendant le geste. On le remet à l'échelle
       ici, une fois le geste posé : le refaire à chaque image repeindrait les
       calques qui les portent. */
    rafraichitBouts();
    rafraichitFleches();
    rafraichitBorne();
    return;
  }
  const l = $("labels"), p = P();
  const libres = partsLibres(p);
  // les paliers des noms, si l'exploitant les a choisis, avant tout nom écrit
  posePaliers(p.stands, p.zones, undefined, libres);
  const r = cadrePlan();
  const pxParM = (r.width || 1) / view.w;
  const dansVue = o => o.c[0] > view.x - 25 && o.c[0] < view.x + view.w + 25 &&
                       o.c[1] > view.y - 25 && o.c[1] < view.y + view.h + 25;
  let out = "";

  /* Chaque libellé dans son propre groupe, sous l'identifiant de ce qu'il
     nomme : c'est ce qui permet de l'attraper pour le placer à la main. Le nom
     de l'attribut n'est pas « data-id » à dessein — ce groupe n'est pas
     l'emplacement, et le clic qui ouvre une fiche ne doit pas le confondre
     avec lui. */
  const groupe = (o, h) => h
    ? '<g class="lbl' + (o.id === libSel ? " pick" : "") +
      // une zone mise en avant depuis le cartouche garde son nom lisible
      (phareZone(o) ? " phare" : "") +
      '" data-lbl="' + esc(o.id) + '">' + h + '</g>'
    : "";

  for (const z of p.zones){
    const sel = z.id === state.sel;
    if (!z.nom || (!sel && (!visibleSurPlan(z) || !dansVue(z)))) continue;
    const pz = place(z);
    out += groupe(z, libelleZone(z, ancre(z), pz[0], pz[1], sel, pxParM,
                                 placementLibelle(z)));
  }

  /* Quand la sélection s'est arrêtée à un découpage, l'emplacement qui
     l'héberge n'est pas ce qu'on a choisi : son libellé reste celui d'un stand
     ordinaire, et c'est le découpage qui écrit le sien en évidence. */
  const decoupe = Boolean(state.sel && decoupeStand(state.sel, state.selSoc));

  for (const s of p.stands){
    /* Un stand ajouté et lié se conduit comme un découpage : il est choisi
       quand sa société l'est, et suit le filtre de celle-ci. */
    const hote = s.lien && parId.get(s.lien.stand);
    const sel = hote
      ? s.lien.stand === state.sel && s.lien.soc === state.selSoc
      : s.id === state.sel && !decoupe;
    const vu = hote ? visibleSociete(hote, s.lien.soc) : visibleSurPlan(s);
    if (!sel && (!vu || !dansVue(s))) continue;
    /* Le stand garde le nom de son titulaire, quelle que soit la fiche
       ouverte : c'est lui qui loue l'emplacement, et c'est ce nom-là qui est
       peint sur la cloison. Les sociétés qu'il héberge se comptent à côté. */
    if (!s.code && !s.nom) continue;
    // découpé, il écrit dans sa part libre ; entièrement découpé, il se tait
    const lib = sel ? undefined : libres.get(s);
    if (lib === null) continue;
    const ps = lib ? lib.bb : place(s);
    out += groupe(s, libelleEmplacement(s, lib ? lib.c : ancre(s), ps[0], ps[1], sel, pxParM,
                                        placementLibelle(s)));
  }

  /* Retriés en plein geste — la main a marqué une pause —, les libellés sont
     encore sur le calque du zoom. On le repeint à la vue du moment : les noms
     qui viennent de devenir lisibles naîtraient sinon déjà étirés. */
  repeintLibelles();
  l.innerHTML = out;
  /* Les stands dessinés à la main écrivent le leur dans leur propre forme, et
     non ici : un calque posé par-dessus celui des textes recouvrirait sinon le
     nom qu'il porte. La règle de lisibilité, elle, est la même — d'où cet
     appel au même endroit. */
  poseLibellesDessines(pxParM);
}


/** Le libellé d'une zone organisateur : son nom, en grand, sur son ancrage. */
function libelleZone(z, az, w, h, sel, pxParM, reg){
  const a = habille(nomDeLaZone(z), w * .88, h * .7, 3.4, P_NOM);
  if (!a) return "";
  const f = a.f * facteurLibelle(reg);
  if (!sel && !libelleForce(reg) && f * pxParM < 6.5) return "";
  const xy = decaleLibelle(az, reg);
  return lignesSvg(a.lignes, f, xy[0], xy[1],
    "zn" + (sel ? " sel" : "") + (z.masquee ? " masquee" : ""));
}


/* ------------------------------------------------------------
   Les noms, pour la carte graphique.

   Le SVG écrit ceux que la vue du moment rend lisibles, et les réécrit à
   chaque arrêt. Ici chaque nom est préparé une fois, avec l'intervalle de
   zoom où il se lit ; la carte graphique les montre ou les tait à chaque
   image, sans rien recalculer. Mêmes seuils, même empilement du nom et du
   numéro que « libelleEmplacement » : l'enseigne seule tant que son numéro
   serait illisible, les deux dès qu'il le devient.
   ------------------------------------------------------------ */
const LOIN = 99;

/**
 * Le nom et le numéro d'un emplacement, avec les intervalles de zoom où chacun
 * se lit. Mêmes mesures que « libelleEmplacement » et « ligneCode » : c'est
 * aussi ce qu'écrit un stand dessiné, qui n'a simplement pas de pastille.
 */
function emplacementWebgl(s, xy, l, h0, sel, reg, noms, pastilles){
  /* Le stand couché (« nomCouche ») se mesure debout ; chaque point posé
     tourne ensuite d'un quart de tour autour de l'ancre, comme le groupe que
     le SVG fait tourner. La bibliothèque compte ses angles à l'inverse du
     SVG : le « rotate(-90) » de l'un est l'angle 90 de l'autre. */
  const tourne = nomCouche(s, l, h0);
  const w = tourne ? h0 : l, h = tourne ? l : h0;
  const pt = tourne ? (x, y) => [xy[0] + (y - xy[1]), xy[1] - (x - xy[0])] : (x, y) => [x, y];
  const angle = tourne ? 90 : 0;
  const k = facteurLibelle(reg), tout = sel || libelleForce(reg);
  const nom = s.nom ? habilleNom(s, w, h, tourne) : null;
  const fn = nom ? nom.f * k : 0;
  const maxCode = s.nom ? Math.min(nom ? nom.f * .78 : 1.2, h * .22) : h * .34;
  const fc = (s.code ? Math.min(maxCode, (w * .9) / largeur(s.code, P_CODE), 1.9) : 0) * k;
  const c = sel ? " sel" : "";
  /* Le nom qui déborde d'un seul côté glisse vers l'allée, son numéro avec
     lui — comme « libelleDroit », dans le repère du nom, avant le quart de
     tour du nom couché. */
  const cx = xy[0] + (nom && nom.dx || 0), cy = xy[1] + (nom && nom.dy || 0);
  // les seuils de « libelleEmplacement », dits en zoom : 2^zoom pixels par mètre
  const seuil = t => tout ? -LOIN : Math.log2(t);
  const zN = nom ? seuil(4.5 / fn) : LOIN;
  const zC1 = fc ? seuil(5 / fc) : LOIN, zC0 = fc ? seuil(6 / fc) : LOIN;
  /* La pastille des sociétés hébergées ne dépend pas du zoom — ses mesures
     sont en corps du numéro — mais seulement de la place : on la décide une
     fois, comme « ligneCode » le fait à chaque écriture. */
  const n = pastilles && fc && coexComptes() ? (s.coex || []).length : 0;
  let past = null;
  if (n){
    const compte = "+" + n, wCode = largeur(s.code, P_CODE) * fc, ecart = fc * .42;
    const wPast = largeur(compte, P_CODE) * fc + fc * .68;
    if (wCode + ecart + wPast <= w * .9 * k) past = { compte, wCode, ecart, wPast };
  }
  const pick = Boolean(PLACE_LIBELLES && s.id && s.id === libSel);
  /* Le centre du bloc et l'écart de chaque ligne, dits à part : la vue
     immersive (`webgl.mjs`) empile les lignes en hauteur au-dessus du stand,
     là où le plan à plat les échelonne dans le sol. Un nom couché garde son
     placement — il est écrit en travers. */
  const pose = (lignes, f, x, y, cls, z0, z1) =>
    noms.push({ text: lignes.join("\n"), position: pt(x, y), angle, taille: f, cls, z0, z1, pick, lbl: s.id,
      ...(tourne ? {} : { centre: [cx, cy], ecart: y - cy }) });
  const bornes = [...new Set([-LOIN, zN, zC1, zC0, LOIN])].sort((a, b) => a - b);
  for (let i = 0; i + 1 < bornes.length; i++){
    const z0 = bornes[i], z1 = bornes[i + 1], zm = (Math.max(z0, -50) + Math.min(z1, 50)) / 2;
    const nomLisible = nom && zm >= zN;
    const codeLisible = fc && zm >= (nomLisible ? zC1 : zC0);
    if (!nomLisible && !codeLisible) continue;
    const hNom = nomLisible ? nom.lignes.length * fn * 1.18 : 0, hCode = codeLisible ? fc * 1.25 : 0;
    const haut = cy - (hNom + hCode) / 2;
    if (nomLisible) pose(nom.lignes, fn, cx, haut + hNom / 2, "nm" + c, z0, z1);
    if (!codeLisible) continue;
    // le numéro a sa ligne de base à 0,92 corps sous le nom ; son milieu, un tiers plus haut
    const milieu = haut + hNom + fc * .59;
    if (!past){ pose([s.code], fc, cx, milieu, "cd" + c, z0, z1); continue; }
    const g = cx - (past.wCode + past.ecart + past.wPast) / 2;
    const xp = g + past.wCode + past.ecart, hp = fc * 1.16;
    // le milieu de la pastille : sa boîte part à 0,84 corps au-dessus de la ligne de base
    const yp = haut + hNom + fc * (.92 - .84 + .58);
    pose([s.code], fc, g + past.wCode / 2, milieu, "cd" + c, z0, z1);
    pose([past.compte], fc, xp + past.wPast / 2, milieu, "coexN" + c, z0, z1);
    pastilles.push({ path: [pt(xp + hp / 2, yp), pt(xp + Math.max(past.wPast - hp / 2, hp / 2 + .001), yp)],
      largeur: hp, cls: "coexPast" + c, z0, z1 });
  }
}

/* Ce que la vue immersive laisse voir de chaque dimension du sol. La
   profondeur suit le cap : un point s'éloigne de l'œil de « x·sin(cap) +
   y·cos(cap) » (`webgl.mjs` `versEcran`), et c'est dans ce sens-là que
   l'inclinaison tasse le sol. Une boîte droite se tasse donc en x et en y
   d'autant que chacun de ses côtés suit ce sens. */
function tassementImmersif(){
  const cap = capCamera(), perte = 1 - SINUS_INCLINAISON;
  return [1 - perte * Math.sin(cap) ** 2, 1 - perte * Math.cos(cap) ** 2];
}

export function libellesWebgl(){
  if (!GL.actif) return;
  // le placement à la main a réécrit « #labels » : les témoins de style y reviennent
  if (!$("labels").querySelector("[data-modele]")) poseModelesLibelles();
  const p = P(), items = [], pastilles = [], dessines = new Map();
  const libres = partsLibres(p);
  posePaliers(p.stands, p.zones, GL.camera ? tassementImmersif() : undefined, libres);
  for (const z of p.zones){
    const sel = z.id === state.sel;
    if (!z.nom || (!sel && !visibleSurPlan(z))) continue;
    const pz = place(z), reg = placementLibelle(z);
    const a = habille(nomDeLaZone(z), pz[0] * .88, pz[1] * .7, 3.4, P_NOM);
    if (!a) continue;
    const f = a.f * facteurLibelle(reg), xy = decaleLibelle(ancre(z), reg);
    items.push({ text: a.lignes.join("\n"), position: xy, taille: f,
      cls: "zn" + (sel ? " sel" : "") + (z.masquee ? " masquee" : "") + (phareZone(z) ? " phare" : ""),
      z0: sel || libelleForce(reg) ? -LOIN : Math.log2(6.5 / f), z1: LOIN,
      pick: Boolean(PLACE_LIBELLES && z.id === libSel), lbl: z.id,
      // une zone meublée n'est qu'un sol en vue immersive : son nom s'y pose (`webgl.mjs` `positionTexte`)
      ...(TYPES_MEUBLES.includes(z.type || "") ? { meuble: true } : {}) });
  }
  const decoupe = Boolean(state.sel && decoupeStand(state.sel, state.selSoc));
  for (const s of p.stands){
    /* Un stand ajouté et lié est choisi quand sa société l'est, et suit le
       filtre de celle-ci — comme dans « libelles ». Choisi seulement par son
       propre identifiant, que la fiche ne sélectionne jamais, il n'était
       jamais forcé : son nom ne s'écrivait qu'au zoom des noms ordinaires,
       qu'un nom harmonisé (`nom-emplacement.mjs` `nomsUniformes`) pouvait
       ne pas atteindre (FEP27, 23 octobre 2026). */
    const hote = s.lien && parId.get(s.lien.stand);
    const sel = hote
      ? s.lien.stand === state.sel && s.lien.soc === state.selSoc
      : s.id === state.sel && !decoupe;
    const vu = hote ? visibleSociete(hote, s.lien.soc) : visibleSurPlan(s);
    if ((!sel && !vu) || (!s.code && !s.nom)) continue;
    // comme en SVG : la part libre d'un emplacement découpé, ou rien
    const lib = sel ? undefined : libres.get(s);
    if (lib === null) continue;
    const ps = lib ? lib.bb : place(s), reg = placementLibelle(s);
    const avant = items.length, avantPastilles = pastilles.length;
    emplacementWebgl(s, decaleLibelle(lib ? lib.c : ancre(s), reg), ps[0], ps[1], sel, reg, items, pastilles);
    // de près, le logo posé sur le toit tient lieu de nom (`logos-stands.mjs`)
    if (logoPose(s)){ cedeAuLogo(items, avant); cedeAuLogo(pastilles, avantPastilles); }
  }
  /* Les stands dessinés gardent leur nom dans leur calque, comme en SVG : un
     calque de dessin empilé par-dessus celui des textes recouvrirait sinon le
     nom qu'il porte. Il se peint donc juste après le calque qui les tient. */
  const couches = $("couches");
  for (const cal of mesCalques()){
    if (cal.visible === false) continue;
    for (const f of cal.formes){
      if (f.t !== "stand") continue;
      const g = couches.querySelector('.sdes[data-f="' + CSS.escape(f.id) + '"]');
      const dcal = g && g.closest(".dcal"), l = societeDeForme(f);
      if (!dcal || !l) continue;
      const nom = nomSurLePlan(l.soc);
      const sel = l.o.id === state.sel && l.i === state.selSoc;
      if ((!nom && !l.o.code) || (!sel && !visibleSociete(l.o, l.i))) continue;
      const b = boite(f);
      if (!dessines.has(dcal)) dessines.set(dcal, []);
      emplacementWebgl({ nom, code: l.o.code }, [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2],
        b[2] - b[0], b[3] - b[1], sel, null, dessines.get(dcal), null);
    }
  }
  const ecrit = d => d.text + d.position[0].toFixed(2) + d.position[1].toFixed(2) + d.taille.toFixed(3) + (d.angle ? "^" + d.angle : "") + d.cls + d.z0.toFixed(3) + d.z1.toFixed(3) + (d.pick ? "*" : "") + (d.meuble ? "m" : "");
  const cle = items.map(ecrit).join("|") + "#" + pastilles.map(d => d.path[0][0].toFixed(2) + d.path[0][1].toFixed(2) + d.cls + d.z0.toFixed(3)).join("|") +
    "#" + [...dessines].map(([g, l]) => g.dataset.dcal + ":" + l.map(ecrit).join("|")).join("#");
  if (cle === GL.cleLibelles) return;
  GL.cleLibelles = cle;
  GL.libelles = items.filter(d => !d.cls.endsWith(" phare"));
  GL.libellesPhare = items.filter(d => d.cls.endsWith(" phare"));
  GL.pastilles = pastilles;
  GL.dessines = dessines;
  GL.versionLibelles = (GL.versionLibelles || 0) + 1;
  GL.couchesLibelles = null;
  planifieWebgl();
}

/* La vue et le rendu par la carte graphique, que ce module importe, refont
   les noms et ne peuvent l'importer : il leur confie en se chargeant ce qui
   les écrit — les deux rendus suivent ainsi les mêmes règles. */
confieALaVue({ libelles });
confieAuWebgl({ libelles, libellesWebgl });

/* Les libellés, confiés à la police des noms dès que ce module se charge :
   elle les fait réécrire quand elle change, et ne peut importer ce module, qui
   l'importe pour mesurer ses noms. */
confieAuxPolices({ libelles });
