/* ============================================================
   Le moteur du plan — les textes

   `TextLayer`, comme `webgl.mjs` le déclare : les noms des stands et des
   zones, les numéros, les textes des calques. Chaque lettre est un
   quadrilatère pris dans un atlas — une image où chaque caractère d'une
   police est tracé une fois —, et le shader la pose à sa place.

   Le procédé est celui de deck.gl, à l'identique, arrondis compris : mêmes
   mesures du Canvas pour tracer l'atlas, même champ de distance (tiny-sdf,
   la même version) pour le grand atlas, même mise en page des lignes, même
   façon de poser, tourner et grossir chaque lettre, et le liseré en deux
   passes. Un nom tombe donc au même pixel quel que soit le moteur, et les
   réglages que `webgl.mjs` a mesurés sous deck.gl — seuils, atlas, liseré,
   lissage — valent tels quels.

   Ce que les extensions de `webgl.mjs` faisaient dans les shaders de
   deck.gl se fait ici dans le sien : le filtre de zoom (`FiltreZoom`), et le
   lissage des lettres (`LissageSdf`) — bande du contour recalculée au pixel
   pour le grand atlas, quatre échantillons et couverture relevée pour le
   petit, décalés au tiers de pixel pour les passes du lissage sous-pixel.
   ============================================================ */
import TinySDF from "@mapbox/tiny-sdf";
import { Couche, ENTETE_SOMMETS, ENTETE_FRAGMENTS, aRefaire } from "./moteur-gl-couche.mjs";
import { Assemblage, coins, remplisAttributs, numerote, GLSL_FILTRE, reglageFiltre, ATTRIBUT_FILTRE } from "./moteur-gl-formes.mjs";
import { compteCree } from "./moteur-gl-objets.mjs";

/* ------------------------------------------------------------
   Les atlas — ceux de deck.gl (`FontAtlasManager`), mêmes mesures
   ------------------------------------------------------------ */
const REGLAGES_POLICE = { fontFamily: "Monaco, monospace", fontWeight: "normal", fontSize: 64, buffer: 4, sdf: false,
  cutoff: .25, radius: 12, smoothing: .1 };
const LARGEUR_ATLAS = 1024;
const MONTANTE = .9, DESCENDANTE = .3;
const CARACTERE_ABSENT = 32;
/* Le seuil sous lequel le champ de distance est dehors : celui de deck.gl. */
const SEUIL_SDF = 192 / 256;

const cleAtlas = (/** @type {any} */ r) => r.sdf
  ? `${r.fontFamily} ${r.fontWeight} ${r.fontSize} ${r.buffer} ${r.radius} ${r.cutoff}`
  : `${r.fontFamily} ${r.fontWeight} ${r.fontSize} ${r.buffer}`;

/** Les atlas déjà tracés, partagés par toutes les couches et tous les moteurs de la page — les derniers servis gardés. */
/** @type {Map<string, any>} */
const ATLAS = new Map();

function stylePolice(/** @type {CanvasRenderingContext2D} */ cx, /** @type {any} */ r){
  cx.font = `${r.fontWeight} ${r.fontSize}px ${r.fontFamily}`;
  cx.fillStyle = "#000"; cx.textBaseline = "alphabetic"; cx.textAlign = "left";
}

/** Les mesures d'un caractère — ou de la police, sans caractère — telles que deck.gl les prend. */
function mesure(/** @type {CanvasRenderingContext2D} */ cx, /** @type {number} */ taille, /** @type {string | undefined} */ c){
  if (c === undefined){
    const m = cx.measureText("A");
    if (m.fontBoundingBoxAscent) return { advance: 0, width: 0, ascent: Math.ceil(m.fontBoundingBoxAscent),
      descent: Math.ceil(m.fontBoundingBoxDescent) };
    return { advance: 0, width: 0, ascent: taille * MONTANTE, descent: taille * DESCENDANTE };
  }
  const m = cx.measureText(c);
  if (!m.actualBoundingBoxAscent) return { advance: m.width, width: m.width, ascent: taille * MONTANTE, descent: taille * DESCENDANTE };
  return { advance: m.width, width: Math.ceil(m.actualBoundingBoxRight - m.actualBoundingBoxLeft),
    ascent: Math.ceil(m.actualBoundingBoxAscent), descent: Math.ceil(m.actualBoundingBoxDescent) };
}

/**
 * L'atlas d'une police, à jour de ces caractères : repris s'il les a tous,
 * complété sinon — les caractères neufs se rangent à la suite, ceux déjà
 * tracés ne bougent pas.
 */
export function atlasDe(/** @type {any} */ reglages, /** @type {string | string[]} */ jeu, /** @type {number} */ limite){
  const r = { ...REGLAGES_POLICE, ...reglages };
  const cle = cleAtlas(r);
  let a = ATLAS.get(cle);
  const neufs = new Set(Array.from(jeu || ""));
  if (a) for (const c of Object.keys(a.mapping)) neufs.delete(c);
  if (a){ ATLAS.delete(cle); ATLAS.set(cle, a); }
  if (a && !neufs.size) return a;
  if (!a){
    const toile = document.createElement("canvas");
    toile.width = LARGEUR_ATLAS; toile.height = 0;
    a = { cle, reglages: r, toile, mapping: /** @type {Record<string, any>} */ ({}), xOffset: 0, yOffsetMin: 0, yOffsetMax: 0,
      baselineOffset: 0, version: 0 };
    ATLAS.set(cle, a);
    while (ATLAS.size > Math.max(3, limite || 3)) ATLAS.delete(/** @type {string} */ (ATLAS.keys().next().value));
  }
  const toile = a.toile, cx = /** @type {CanvasRenderingContext2D} */ (toile.getContext("2d", { willReadFrequently: true }));
  stylePolice(cx, r);
  const sdf = r.sdf ? new TinySDF({ fontSize: r.fontSize, buffer: r.buffer, radius: r.radius, cutoff: r.cutoff,
    fontFamily: r.fontFamily, fontWeight: `${r.fontWeight}` }) : null;
  // la rangée : comme `buildMapping`, les caractères neufs à la suite des anciens
  let x = a.xOffset, yMin = a.yOffsetMin, yMax = a.yOffsetMax;
  for (const c of neufs){
    const { advance, width, ascent, descent } = mesure(cx, r.fontSize, c);
    const height = ascent + descent;
    if (x + width + r.buffer * 2 > LARGEUR_ATLAS){ x = 0; yMin = yMax; }
    a.mapping[c] = { x: x + r.buffer, y: yMin + r.buffer, width, height, advance, anchorX: width / 2, anchorY: ascent };
    x += width + r.buffer * 2;
    yMax = Math.max(yMax, yMin + height + r.buffer * 2);
  }
  a.xOffset = x; a.yOffsetMin = yMin; a.yOffsetMax = yMax;
  const hauteur = Math.pow(2, Math.ceil(Math.log2(Math.max(1, yMax))));
  if (toile.height !== hauteur){
    const garde = toile.height > 0 ? cx.getImageData(0, 0, toile.width, toile.height) : null;
    toile.height = hauteur;
    if (garde) cx.putImageData(garde, 0, 0);
  }
  stylePolice(cx, r);
  for (const c of neufs){
    const f = a.mapping[c];
    if (sdf){
      const g = sdf.draw(c), img = new ImageData(g.width, g.height);
      for (let i = 0; i < g.data.length; i++) img.data[4 * i + 3] = g.data[i];
      const mesuree = f.width, gauche = r.buffer, haut = r.buffer;
      const x0 = Math.max(0, Math.round(f.x - gauche)), y0 = Math.max(0, Math.round(f.y - haut));
      const w = Math.min(img.width, toile.width - x0), h = Math.min(img.height, toile.height - y0);
      cx.putImageData(img, x0, y0, 0, 0, w, h);
      f.x = x0; f.y = y0; f.width = w; f.height = h;
      f.anchorX += w / 2 - gauche - mesuree / 2;
      f.anchorY += haut;
    } else cx.fillText(c, f.x, f.y + f.anchorY);
  }
  const m = mesure(cx, r.fontSize, undefined);
  a.baselineOffset = (m.ascent - m.descent) / 2;
  a.version++;
  return a;
}

/** La texture d'un atlas sur une carte graphique, refaite quand l'atlas a grandi. */
/** @type {WeakMap<WebGL2RenderingContext, Map<string, any>>} */
const TEXTURES = new WeakMap();
function textureDe(/** @type {WebGL2RenderingContext} */ gl, /** @type {any} */ a){
  let m = TEXTURES.get(gl);
  if (!m){ m = new Map(); TEXTURES.set(gl, m); }
  let t = m.get(a.cle);
  if (t && t.version === a.version && t.atlas === a) return t;
  if (!t){ t = { tex: gl.createTexture(), version: -1, atlas: a }; m.set(a.cle, t); compteCree(gl, "Textures Created"); }
  gl.bindTexture(gl.TEXTURE_2D, t.tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, a.toile);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);
  t.version = a.version; t.atlas = a; t.w = a.toile.width; t.h = a.toile.height;
  return t;
}

/* ------------------------------------------------------------
   La mise en page — `transformParagraph` et `getIconOffsets` de deck.gl
   ------------------------------------------------------------ */
const ANCRE = /** @type {Record<string, number>} */ ({ start: 1, middle: 0, end: -1 });
const LIGNE = /** @type {Record<string, number>} */ ({ top: 1, center: 0, bottom: -1 });

/**
 * Les lettres d'un texte, chacune `[décalage x, décalage y, largeur,
 * hauteur, x, y]` en points de l'atlas, posées autour du point du texte.
 */
export function metsEnPage(/** @type {string} */ texte, /** @type {any} */ a, /** @type {number} */ interligne,
  /** @type {string} */ ancre, /** @type {string} */ ligne){
  const car = Array.from(texte), n = car.length, M = a.mapping;
  const lh = interligne * a.reglages.fontSize;
  const x = new Array(n).fill(0), y = new Array(n).fill(0), large = new Array(n).fill(0);
  let rangs = 0, haut = a.baselineOffset + lh / 2, debut = 0, fin = 0;
  for (let i = 0; i <= n; i++){
    const c = car[i];
    if (c === "\n" || i === n) fin = i;
    if (fin > debut){
      let cur = 0;
      for (let j = debut; j < fin; j++){
        const f = M[car[j]];
        if (f){ x[j] = cur + f.anchorX; cur += f.advance; } else { x[j] = cur; cur += CARACTERE_ABSENT; }
      }
      for (let j = debut; j < fin; j++){ y[j] = haut; large[j] = cur; }
      rangs++; haut += lh;
      debut = fin;
    }
    if (c === "\n"){ x[debut] = 0; y[debut] = 0; large[debut] = 0; debut++; }
  }
  const h = rangs * lh;
  const ax = ANCRE[ancre] ?? 0, ay = LIGNE[ligne] ?? 0;
  return car.map((c, i) => {
    const f = M[c] || { x: 0, y: 0, width: 0, height: 0, anchorY: 0 };
    return [((ax - 1) * large[i]) / 2 + x[i], f.height / 2 - f.anchorY + ((ay - 1) * h) / 2 + y[i], f.width, f.height, f.x, f.y];
  });
}

/* ------------------------------------------------------------
   La couche — `TextLayer`
   ------------------------------------------------------------ */
const attributsTexte = (/** @type {number[]} */ o) => ({
  a_pos: { accessor: "getPosition", taille: 3, type: /** @type {"f32"} */ ("f32"), defaut: [0, 0, 0],
    transforme: (/** @type {any} */ p) => p ? [p[0] - o[0], p[1] - o[1], (p[2] || 0) - o[2]] : p },
  a_taille: { accessor: "getSize", taille: 1, type: /** @type {"f32"} */ ("f32"), defaut: [32] },
  a_angle: { accessor: "getAngle", taille: 1, type: /** @type {"f32"} */ ("f32"), defaut: [0] },
  a_c: { accessor: "getColor", taille: 4, type: /** @type {"u8n"} */ ("u8n"), defaut: [0, 0, 0, 255] },
  a_pxoff: { accessor: "getPixelOffset", taille: 2, type: /** @type {"f32"} */ ("f32"), defaut: [0, 0] },
  a_zf: { ...ATTRIBUT_FILTRE },
});
const GEO_TEXTE = ["a_coin", "a_glyphe", "a_cadre", "a_objet"];
const LISTE_TEXTE = numerote(GEO_TEXTE, attributsTexte([0, 0, 0]));

const VS_TEXTE = ENTETE_SOMMETS + GLSL_FILTRE + `
in vec2 a_coin; in vec4 a_glyphe; in vec4 a_cadre; in float a_objet;
in vec3 a_pos; in float a_taille; in float a_angle; in vec4 a_c; in vec2 a_pxoff; in vec3 a_zf;
uniform vec4 u_taille;
uniform float u_police;
uniform float u_face;
uniform float u_flipY;
uniform vec2 u_atlasDim;
out vec4 v_c; out vec2 v_uv;
vec2 tourne(vec2 v, float a){ float r = radians(a), c = cos(r), s = sin(r); return mat2(c, -s, s, c) * v; }
void main(){
  float px = clamp(a_taille * u_taille.y * (u_taille.x > 0.5 ? u_echelle : 1.0), u_taille.z, u_taille.w);
  vec2 o = a_coin / 2.0 * a_glyphe.zw + a_glyphe.xy;
  o = tourne(o, a_angle) * (px / u_police) + a_pxoff;
  o.y *= -1.0;
  v_c = u_designe > 0.5 ? couleurObjet(a_objet) : a_c;
  v_uv = mix(a_cadre.xy, a_cadre.xy + a_cadre.zw, (a_coin + 1.0) / 2.0) / u_atlasDim;
  if (filtreTait(a_zf)){ gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec4 base = u_modele * vec4(a_pos, 1.0);
  if (u_face > 0.5){
    o.y *= u_filtre.z;
    vec4 c = u_vp * base;
    c.xy += o / u_ecran * 2.0;
    gl_Position = recadre(c);
  } else {
    vec2 m = o / u_echelle;
    if (u_flipY > 0.5) m.y *= -1.0;
    m.y *= u_filtre.z;
    gl_Position = recadre(u_vp * (base + vec4(m, 0.0, 0.0)));
  }
}`;
const FS_TEXTE = ENTETE_FRAGMENTS + `
uniform sampler2D u_atlas;
uniform vec4 u_sdf;
uniform vec4 u_contour;
uniform vec2 u_sousPixel;
uniform float u_lissage;
in vec4 v_c; in vec2 v_uv;
void main(){
  if (u_designe > 0.5){ fragColor = v_c; return; }
  float alpha = texture(u_atlas, v_uv).a;
  vec4 color = v_c;
  bool sdf = u_sdf.x > 0.5;
  if (sdf){
    float d = alpha;
    alpha = smoothstep(u_sdf.y - u_sdf.z, u_sdf.y + u_sdf.z, d);
    if (u_sdf.w > 0.0){
      float dedans = alpha;
      alpha = smoothstep(u_sdf.w - u_sdf.z, u_sdf.w + u_sdf.z, d);
      color = mix(u_contour, v_c, dedans);
    }
  }
  float a = alpha * color.a;
  if (a < 0.001) discard;
  fragColor = vec4(color.rgb, a * u_opacite);
  if (u_lissage < 0.5) return;
  if (sdf){
    float dist = texture(u_atlas, v_uv).a;
    float bande = clamp(fwidth(dist) * 0.6, 0.0008, u_sdf.z);
    float dedans = smoothstep(u_sdf.y - bande, u_sdf.y + bande, dist);
    if (u_sdf.w > 0.0){
      vec4 teinte = mix(u_contour, v_c, dedans);
      dedans = smoothstep(u_sdf.w - bande, u_sdf.w + bande, dist);
      fragColor = vec4(teinte.rgb, dedans * teinte.a * u_opacite);
    } else fragColor.a = dedans * v_c.a * u_opacite;
  } else {
    vec2 pasX = dFdx(v_uv), pasY = dFdy(v_uv);
    vec2 centre = v_uv + pasX * u_sousPixel.x;
    pasX *= u_sousPixel.y;
    float couvre = texture(u_atlas, centre - 0.125 * pasX - 0.375 * pasY, -1.0).a;
    couvre += texture(u_atlas, centre + 0.375 * pasX - 0.125 * pasY, -1.0).a;
    couvre += texture(u_atlas, centre + 0.125 * pasX + 0.375 * pasY, -1.0).a;
    couvre += texture(u_atlas, centre - 0.375 * pasX + 0.125 * pasY, -1.0).a;
    float reduit = length(fwidth(v_uv) * vec2(textureSize(u_atlas, 0)));
    float releve = mix(0.75, 0.55, clamp((reduit - 2.0) / 3.0, 0.0, 1.0));
    fragColor.a = pow(0.25 * couvre, releve) * v_c.a * u_opacite;
  }
}`;

/** Les caractères qu'une couche demande : son jeu, ou ceux de ses textes (« auto »). */
function jeuDe(/** @type {any} */ p){
  const j = p.characterSet;
  if (j && j !== "auto") return j;
  const s = new Set();
  const info = { index: 0, data: p.data, target: [] };
  p.data.forEach((/** @type {any} */ d, /** @type {number} */ i) => {
    info.index = i;
    for (const c of Array.from(String((typeof p.getText === "function" ? p.getText(d, info) : p.getText) ?? ""))) s.add(c);
  });
  return [...s];
}

export class TextLayer extends Couche {
  static programme(){ return { nom: "texte", vs: VS_TEXTE, fs: FS_TEXTE, attributs: LISTE_TEXTE }; }

  /** Les réglages de l'atlas de la couche : ceux de sa police, puis sa famille et sa graisse. */
  reglagesAtlas(){
    const p = this.props;
    return { ...REGLAGES_POLICE, ...(p.fontSettings || {}), fontFamily: p.fontFamily, fontWeight: p.fontWeight };
  }

  geometrie(/** @type {any} */ ctx, /** @type {any} */ a){
    const p = this.props, data = p.data;
    const info = { index: 0, data, target: [] };
    const comptes = new Int32Array(data.length), lettres = [];
    let n = 0;
    for (let i = 0; i < data.length; i++){
      info.index = i;
      const t = typeof p.getText === "function" ? p.getText(data[i], info) : p.getText;
      if (t === undefined || t === null || t === ""){ lettres.push(null); continue; }
      const ancre = typeof p.getTextAnchor === "function" ? p.getTextAnchor(data[i], info) : p.getTextAnchor;
      const ligne = typeof p.getAlignmentBaseline === "function" ? p.getAlignmentBaseline(data[i], info) : p.getAlignmentBaseline;
      const l = metsEnPage(String(t), a, p.lineHeight ?? 1, ancre, ligne);
      lettres.push(l); comptes[i] = l.length; n += l.length;
    }
    const glyphe = new Float32Array(n * 4), cadre = new Float32Array(n * 4), obj = new Float32Array(n);
    let k = 0;
    lettres.forEach((l, i) => {
      if (!l) return;
      for (const g of l){ glyphe.set([g[0], g[1], g[2], g[3]], 4 * k); cadre.set([g[4], g[5], g[2], g[3]], 4 * k); obj[k] = i; k++; }
    });
    return { comptes, total: n, glyphe, cadre, obj };
  }

  prepare(/** @type {any} */ ctx, /** @type {any} */ ancienne){
    const gl = ctx.gl, p = this.props;
    const limite = /** @type {any} */ (this.constructor).fontAtlasCacheLimit;
    const a = atlasDe(this.reglagesAtlas(), jeuDe(p), limite);
    const specs = attributsTexte(ctx.origine);
    numerote(GEO_TEXTE, specs);
    let e = ancienne && ancienne.etat;
    const r = aRefaire(this, e ? ancienne : null, ["getText", "getTextAnchor", "getAlignmentBaseline"], ["lineHeight"]);
    // un autre atlas, ou le même grandi : les lettres se remettent en page
    if (e && (e.atlas !== a || e.versionAtlas !== a.version)) r.tout = true;
    if (r.tout || !e){
      if (e) e.a.detruit();
      const g = this.geometrie(ctx, a);
      const as = new Assemblage(gl);
      coins(gl, as, 0, [-1, -1, 1, -1, -1, 1, 1, 1]);
      as.pose(1, { donnees: g.glyphe }, 4, "f32", 1);
      as.pose(2, { donnees: g.cadre }, 4, "f32", 1);
      as.pose(3, { donnees: g.obj }, 1, "f32", 1);
      e = { a: as, comptes: g.comptes, total: g.total, atlas: a, versionAtlas: a.version };
      remplisAttributs(this, as, specs, e.comptes, e.total, 1, null);
    } else if (r.acces.size) remplisAttributs(this, e.a, specs, e.comptes, e.total, 1, r.acces);
    this.etat = e;
  }

  dessine(/** @type {any} */ ctx, /** @type {any} */ prog){
    const gl = ctx.gl, p = this.props, e = this.etat;
    if (!e || !e.total) return;
    const t = textureDe(gl, e.atlas), r = e.atlas.reglages;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.uniform1i(prog.u("u_atlas"), 0);
    gl.uniform2f(prog.u("u_atlasDim"), t.w, t.h);
    gl.uniform1f(prog.u("u_police"), r.fontSize);
    const unites = p.sizeUnits === "pixels" ? 0 : 1;
    gl.uniform4f(prog.u("u_taille"), unites, p.sizeScale ?? 1, p.sizeMinPixels || 0,
      p.sizeMaxPixels === undefined ? Number.MAX_SAFE_INTEGER : p.sizeMaxPixels);
    gl.uniform1f(prog.u("u_face"), p.billboard === false ? 0 : 1);
    gl.uniform1f(prog.u("u_flipY"), ctx.vue && ctx.vue.flipY ? 1 : 0);
    gl.uniform3fv(prog.u("u_filtre"), reglageFiltre(this));
    const sp = this.moduleProps.sousPixel || { decalage: 0, largeur: 1 };
    gl.uniform2f(prog.u("u_sousPixel"), sp.decalage, sp.largeur);
    gl.uniform1f(prog.u("u_lissage"), this.extension("LissageSdf") ? 1 : 0);
    const sdf = Boolean(r.sdf), lissage = r.smoothing ?? REGLAGES_POLICE.smoothing;
    const lisere = sdf && p.outlineWidth ? p.outlineWidth / (r.radius || REGLAGES_POLICE.radius) : 0;
    const oc = p.outlineColor || [0, 0, 0, 255];
    gl.uniform4f(prog.u("u_contour"), oc[0] / 255, oc[1] / 255, oc[2] / 255, (oc[3] ?? 255) / 255);
    e.a.lie();
    // le liseré, puis la lettre par-dessus : deux passes, comme deck.gl
    gl.uniform4f(prog.u("u_sdf"), sdf ? 1 : 0, SEUIL_SDF, lissage, lisere ? Math.max(lissage, SEUIL_SDF * (1 - lisere)) : -1);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, e.total);
    if (lisere && !ctx.designe){
      gl.uniform4f(prog.u("u_sdf"), 1, SEUIL_SDF, lissage, SEUIL_SDF);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, e.total);
    }
  }

  detruit(){ if (this.etat){ this.etat.a.detruit(); this.etat = null; } }
}
TextLayer.layerName = "TextLayer";
/** Les atlas gardés, comme chez deck.gl : `webgl.mjs` le relève une fois. */
/** @type {number} */
TextLayer.fontAtlasCacheLimit = 24;
TextLayer.defaultProps = { billboard: true, sizeScale: 1, sizeUnits: "pixels", sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER, fontFamily: REGLAGES_POLICE.fontFamily, fontWeight: REGLAGES_POLICE.fontWeight,
  lineHeight: 1, outlineWidth: 0, outlineColor: [0, 0, 0, 255], fontSettings: {}, characterSet: " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
  getText: (/** @type {any} */ d) => d.text, getPosition: (/** @type {any} */ d) => d.position, getColor: [0, 0, 0, 255],
  getSize: 32, getAngle: 0, getTextAnchor: "middle", getAlignmentBaseline: "center", getPixelOffset: [0, 0] };
