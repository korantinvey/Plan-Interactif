/* ============================================================
   Les libellés du plan — le nom de l'exposant prime sur le numéro

   Deux dessins des noms vivent ici, le SVG et la préparation pour la carte
   graphique (`webgl.mjs`) : les deux écrivent les mêmes noms, aux mêmes seuils, l'un en SVG à chaque arrêt de la
   vue, l'autre une fois pour toutes avec l'intervalle de zoom où chacun se
   lit. Les garder côte à côte, c'est ce qui les tient d'accord.

   Il se branche par `brancheLibelles`, que le lancement (`lancement.mjs`)
   appelle parmi les premiers — avant l'écoute du rendu WebGL. La
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
import { DATA, parId, state, P } from "./donnees.mjs";
import { P_NOM, P_CODE, confieAuxPolices } from "./polices-plan.mjs";
import { largeur, remesureTextes, habille, lignesSvg, ancre, place } from "./texte-plan.mjs";
import { PLACE_LIBELLES, libSel, placementLibelle } from "./libelle-place.mjs";
import { GL, planifieWebgl, poseModelesLibelles, confieAuWebgl } from "./webgl.mjs";
import { view, cadrePlan, repeintLibelles, confieALaVue } from "./vue.mjs";
import { visibleSurPlan, visibleSociete } from "./filtre.mjs";
import { phareZone } from "./cartouche-poi.mjs";
import { libelleEmplacement, coexComptes, coexChoisit, decaleLibelle, facteurLibelle, libelleForce }
  from "./nom-emplacement.mjs";
import { liste, confieALaRecherche } from "./recherche.mjs";
import { rafraichitBorne } from "./vous-etes-ici.mjs";
import { rafraichitBouts } from "./tiroir-itineraire.mjs";
import { mesCalques } from "./calques-dessin.mjs";
import { nomDeLaZone } from "./noms-zones.mjs";
import { boite } from "./forme-choisie.mjs";
import { dessineDessins, decoupeStand, poseLibellesDessines, rafraichitFleches, societeDeForme,
  nomSurLePlan } from "./dessin.mjs";


/**
 * Le branchement, appelé par le lancement (`lancement.mjs` `lancePlan`) au
 * rang que l'écoute des polices tenait : elle s'y pose à son rang.
 */
export function brancheLibelles(){
  /* Une police arrivée après la mesure la rendait fausse : les mesures gardées
     se refont (`texte-plan.mjs` `remesureTextes`), et le plan se retrace si
     l'une a changé. */
  if (document.fonts && document.fonts.addEventListener)
    document.fonts.addEventListener("loadingdone", () => {
      if (!remesureTextes() || !DATA || !view) return;
      // les repères et les stands dessinés portent leur nom dans leur forme, la
      // liste taille la case du numéro sur la même mesure
      dessineDessins(); libelles(); liste();
    });
}


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
    const ps = place(s);
    out += groupe(s, libelleEmplacement(s, ancre(s), ps[0], ps[1], sel, pxParM,
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
function emplacementWebgl(s, xy, w, h, sel, reg, noms, pastilles){
  const k = facteurLibelle(reg), tout = sel || libelleForce(reg);
  const nom = s.nom ? habille(s.nom, w * .9, h * .62, 2.4, P_NOM) : null;
  const fn = nom ? nom.f * k : 0;
  const maxCode = s.nom ? Math.min(nom ? nom.f * .78 : 1.2, h * .22) : h * .34;
  const fc = (s.code ? Math.min(maxCode, (w * .9) / largeur(s.code, P_CODE), 1.9) : 0) * k;
  const c = sel ? " sel" : "";
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
  const pose = (lignes, f, x, y, cls, z0, z1) =>
    noms.push({ text: lignes.join("\n"), position: [x, y], taille: f, cls, z0, z1, pick, lbl: s.id });
  const bornes = [...new Set([-LOIN, zN, zC1, zC0, LOIN])].sort((a, b) => a - b);
  for (let i = 0; i + 1 < bornes.length; i++){
    const z0 = bornes[i], z1 = bornes[i + 1], zm = (Math.max(z0, -50) + Math.min(z1, 50)) / 2;
    const nomLisible = nom && zm >= zN;
    const codeLisible = fc && zm >= (nomLisible ? zC1 : zC0);
    if (!nomLisible && !codeLisible) continue;
    const hNom = nomLisible ? nom.lignes.length * fn * 1.18 : 0, hCode = codeLisible ? fc * 1.25 : 0;
    const haut = xy[1] - (hNom + hCode) / 2;
    if (nomLisible) pose(nom.lignes, fn, xy[0], haut + hNom / 2, "nm" + c, z0, z1);
    if (!codeLisible) continue;
    // le numéro a sa ligne de base à 0,92 corps sous le nom ; son milieu, un tiers plus haut
    const milieu = haut + hNom + fc * .59;
    if (!past){ pose([s.code], fc, xy[0], milieu, "cd" + c, z0, z1); continue; }
    const g = xy[0] - (past.wCode + past.ecart + past.wPast) / 2;
    const xp = g + past.wCode + past.ecart, hp = fc * 1.16;
    // le milieu de la pastille : sa boîte part à 0,84 corps au-dessus de la ligne de base
    const yp = haut + hNom + fc * (.92 - .84 + .58);
    pose([s.code], fc, g + past.wCode / 2, milieu, "cd" + c, z0, z1);
    pose([past.compte], fc, xp + past.wPast / 2, milieu, "coexN" + c, z0, z1);
    pastilles.push({ path: [[xp + hp / 2, yp], [xp + Math.max(past.wPast - hp / 2, hp / 2 + .001), yp]],
      largeur: hp, cls: "coexPast" + c, z0, z1 });
  }
}

export function libellesWebgl(){
  if (!GL.actif) return;
  // le placement à la main a réécrit « #labels » : les témoins de style y reviennent
  if (!$("labels").querySelector("[data-modele]")) poseModelesLibelles();
  const p = P(), items = [], pastilles = [], dessines = new Map();
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
      pick: Boolean(PLACE_LIBELLES && z.id === libSel), lbl: z.id });
  }
  const decoupe = Boolean(state.sel && decoupeStand(state.sel, state.selSoc));
  for (const s of p.stands){
    const sel = s.id === state.sel && !decoupe;
    if ((!sel && !visibleSurPlan(s)) || (!s.code && !s.nom)) continue;
    const ps = place(s), reg = placementLibelle(s);
    emplacementWebgl(s, decaleLibelle(ancre(s), reg), ps[0], ps[1], sel, reg, items, pastilles);
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
  const ecrit = d => d.text + d.position[0].toFixed(2) + d.position[1].toFixed(2) + d.taille.toFixed(3) + d.cls + d.z0.toFixed(3) + d.z1.toFixed(3) + (d.pick ? "*" : "");
  const cle = items.map(ecrit).join("|") + "#" + pastilles.map(d => d.path[0][0].toFixed(2) + d.cls + d.z0.toFixed(3)).join("|") +
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

/* La recherche, que ce module importe, ne peut l'importer en retour : il lui
   confie en se chargeant ce qu'elle en appelle (les noms à refaire quand le filtre change ce qui paraît). */
confieALaRecherche({ libelles });

/* La vue et le rendu par la carte graphique, que ce module importe, refont
   les noms et ne peuvent l'importer : il leur confie en se chargeant ce qui
   les écrit — les deux rendus suivent ainsi les mêmes règles. */
confieALaVue({ libelles });
confieAuWebgl({ libelles, libellesWebgl });

/* Les libellés, confiés à la police des noms dès que ce module se charge :
   elle les fait réécrire quand elle change, et ne peut importer ce module, qui
   l'importe pour mesurer ses noms. */
confieAuxPolices({ libelles });
