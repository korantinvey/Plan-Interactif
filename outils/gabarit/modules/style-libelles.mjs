/* ============================================================
   Le style des noms du plan, résolu sans la feuille

   Le dessin (`webgl.mjs`) peint les noms des stands et des zones depuis leurs
   données (`libelles.mjs` `libellesWebgl`) ; il lui faut, pour chaque sorte de
   nom — enseigne, numéro, zone, coexposant, choisi, masqué, mis en avant,
   tenu à la main —, l'encre, le liseré, la police et la graisse que la feuille
   donne aux noms du SVG (`_styles-plan.css`, `#labels`). Il les relisait sur
   des témoins cachés posés dans le SVG, un par sorte. Ce module résout les
   mêmes règles en JavaScript, sur les mêmes entrées : les jetons de la
   racine (`--c-lab-stand`, `--police-lab-nom`, `--c-sel-trait`…) et ses
   états (`ambiance-tuiles`, `mode-chaleur`, `sans-lab-stand`, `mode-libelles`,
   `poi-actif`, `tuto-retrait`).

   La feuille garde ces règles pour le SVG de secours : qui en change une
   change aussi celle-ci. `outils/essais/navigateur/style-libelles.spec.js`
   compare les deux, sorte par sorte, sur les combinaisons de ce que la feuille
   regarde.

   Il ne lit que la racine, et ne connaît du dessin que la conversion des
   couleurs, qu'on lui confie (`couleurGl`, de `trace.mjs`).
   ============================================================ */

/** Les sortes de noms que le dessin distingue : la clé, puis les classes du
 *  texte dans le SVG. Un numéro (« cd ») n'a pas de classe à lui. */
export const SORTES_LIBELLES = ["nm", "nm sel", "zn", "zn sel", "zn masquee", "zn sel masquee", "cd", "cd sel",
  "coexN", "coexN sel", "coexPast", "coexPast sel"];
/** Celles qui se mettent en avant sous le cartouche : les noms des zones. */
export const SORTES_PHARE = ["zn", "zn sel", "zn masquee", "zn sel masquee"];

/**
 * @typedef {{ couleur: number[], trait: number[], halo: { couleur: number[], largeur: number } | null,
 *   famille: string, graisse: string, visible: boolean }} ModeleLibelle
 */

/**
 * Les modèles de tous les noms, par clé — les sortes, leur version mise en
 * avant (« zn phare »…), le nom tenu à la main (« pick »), et les deux teintes
 * qui ne sont pas des noms : le survol et le point d'intérêt.
 * @param {(c: string, alpha: number) => number[] | null} couleurGl
 * @returns {Map<string, ModeleLibelle>}
 */
export function modelesLibelles(couleurGl){
  const racine = document.documentElement, cs = getComputedStyle(racine), r = racine.classList;
  const v = (/** @type {string} */ n) => cs.getPropertyValue(n).trim();
  // `var(--a, var(--b, x))` : la première définie
  const jeton = (/** @type {string[]} */ noms, defaut = "") => { for (const n of noms){ const x = v(n); if (x) return x; } return defaut; };
  const tuiles = r.contains("ambiance-tuiles"), chaleur = r.contains("mode-chaleur");
  const sansStand = r.contains("sans-lab-stand"), sansZone = r.contains("sans-lab-zone");
  const libelles = r.contains("mode-libelles");
  /* Le retrait du plan : derrière la visite guidée (`_styles-divers.css`, qui
     vient après : à force égale, elle l'emporte), puis derrière le cartouche,
     sauf pour ce qu'il met en avant. */
  const retrait = (/** @type {boolean} */ phare) =>
    r.contains("tuto-retrait") ? .22 : r.contains("poi-actif") && !phare ? .16 : 1;
  const sel = jeton(["--c-sel-trait", "--accent"]);
  const famNom = jeton(["--police-lab-nom", "--sans"]), famCode = jeton(["--police-lab-code"], '"IBM Plex Mono", monospace');
  const graisseNom = jeton(["--graisse-lab-nom"], "600"), graisseCode = jeton(["--graisse-lab-code"], "500");
  const blancLisere = "rgba(255,255,255,.85)";

  /** @type {Map<string, ModeleLibelle>} */
  const out = new Map();
  const pose = (/** @type {string} */ cle, /** @type {string} */ sorte, /** @type {{ phare?: boolean, pick?: boolean }} */ o) => {
    const cl = new Set(sorte.split(" "));
    const zone = cl.has("zn"), choisi = cl.has("sel"), pastille = cl.has("coexPast"), coex = cl.has("coexN");
    let fill, stroke = "none", largeur = 0, famille = famCode, graisse = graisseCode, opacite = retrait(!!o.phare);
    if (pastille){
      fill = choisi ? v("--surface") : v("--accent-soft");
      stroke = choisi ? sel : v("--accent");
    } else {
      // un numéro ; l'enseigne, une zone, un coexposant prennent la police du nom
      fill = jeton(["--c-lab-stand", "--ink-2"]);
      if (cl.has("nm")){ famille = famNom; graisse = graisseNom; fill = jeton(["--c-lab-stand", "--ink"]); }
      if (zone){
        famille = famNom; graisse = graisseNom; fill = jeton(["--c-lab-zone", "--zone"]);
        stroke = jeton(["--c-lab-zone-lisere"], blancLisere); largeur = .18;
      }
      if (cl.has("masquee")) opacite *= .45;
      if (coex){ fill = v("--accent"); graisse = "700"; }
      // mis en avant : l'encre sombre et un halo clair, qui le tiennent sur tout fond
      if (o.phare){ fill = "#0F1316"; stroke = blancLisere; largeur = .15; }
      if (coex && choisi) fill = sel;
      if (choisi && !tuiles) fill = sel;
      // le nom qu'on tient à la main, en plaçant les libellés
      if (o.pick && libelles) fill = v("--accent");
      // sur la carte de chaleur, les noms peints sur les cloisons, et eux seuls — la règle la plus forte
      if (chaleur && !zone && !choisi && !coex){ fill = "#0F1316"; stroke = "rgba(255,255,255,.82)"; largeur = .15; }
    }
    const visible = !(zone ? sansZone : sansStand);
    const trait = couleurGl(stroke, opacite) || [0, 0, 0, 0];
    out.set(cle, { couleur: couleurGl(fill, opacite) || [0, 0, 0, 0], trait,
      halo: !pastille && stroke !== "none" && largeur > 0 ? { couleur: trait, largeur } : null,
      famille, graisse: String(graisse), visible });
  };
  for (const s of SORTES_LIBELLES) pose(s, s, {});
  for (const s of SORTES_PHARE) pose(s + " phare", s, { phare: true });
  pose("pick", "nm", { pick: true });
  // le survol et le point d'intérêt : deux teintes, posées hors des noms
  const teinte = (/** @type {string} */ cle, /** @type {string} */ fill, /** @type {string} */ stroke) =>
    out.set(cle, { couleur: couleurGl(fill, 1) || [0, 0, 0, 0], trait: couleurGl(stroke, 1) || [0, 0, 0, 0],
      halo: null, famille: famCode, graisse: graisseCode, visible: true });
  teinte("survol", jeton(["--c-survol", "--accent-soft"]), v("--accent"));
  teinte("poi", jeton(["--c-poi", "--accent"]), "none");
  return out;
}

/** La couleur du sol du hall, comme la feuille la donne à l'aplat qui le vide
 *  (`#trouDuFond`) : celle que l'exploitant a choisie, ou celle de la page. */
export function couleurSol(/** @type {(c: string, alpha: number) => number[] | null} */ couleurGl){
  const cs = getComputedStyle(document.documentElement);
  return couleurGl(cs.getPropertyValue("--c-fond").trim() || cs.getPropertyValue("--ground").trim(), 1);
}
