/* ============================================================
   Le moteur du plan — les images, les objets, les textures

   `BitmapLayer` : une image posée sur le plan — le logo qu'un exploitant
   pose sur un stand, une image d'un calque —, couchée sur ses bornes ou
   dressée sur ses quatre coins. `SimpleMeshLayer` : un maillage répété,
   chaque exemplaire à sa place, tourné et mis à l'échelle — les figurants,
   et les logos des stands, chacun un carré qui lit sa case d'une planche.

   Comme chez deck.gl : mêmes matrices d'exemplaire (orientation, échelle,
   translation, ou la matrice entière), même lumière par fragment, une
   normale tirée de la surface quand le maillage n'en donne pas, et la
   couleur de la texture telle quelle quand il en a une. Les extensions de
   `logos-stands.mjs` (`CasesEtFondu`) et de `webgl.mjs`
   (`TeinteDesFigurants`) se refont dans le shader, réglées par ce qu'elles
   déclarent (`fonduZoom`, `palettesFigurants`).

   La carte graphique (`appareil`) offre aussi ce que `logos-stands.mjs`
   demandait à luma.gl pour tenir sa planche : une texture qu'on remplit case
   par case, ses niveaux réduits, et la copie d'une texture dans une autre.
   ============================================================ */
import { Couche, ENTETE_SOMMETS, ENTETE_FRAGMENTS, aRefaire, remplis } from "./moteur-gl-couche.mjs";
import { Assemblage, remplisAttributs, numerote, GLSL_LUMIERE, poseLumiere } from "./moteur-gl-formes.mjs";

/* ------------------------------------------------------------
   Les textures, et la carte graphique que `logos-stands.mjs` interroge
   ------------------------------------------------------------ */
const FILTRES = /** @type {Record<string, number>} */ ({ nearest: 0x2600, linear: 0x2601 });

/** Une texture, comme celles de luma.gl que `logos-stands.mjs` emploie. */
export class TextureMoteur {
  constructor(/** @type {WebGL2RenderingContext} */ gl, /** @type {any} */ o){
    this.gl = gl;
    this.width = o.width; this.height = o.height;
    this.niveaux = Math.max(1, o.mipLevels || 1);
    this.handle = /** @type {WebGLTexture} */ (gl.createTexture());
    compteCree(gl, "Textures Created");
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.texStorage2D(gl.TEXTURE_2D, this.niveaux, gl.RGBA8, o.width, o.height);
    reglePrise(gl, o.sampler || {}, this.niveaux > 1);
    this.detruite = false;
  }
  /** Une image posée dans la texture, à `(x, y)`. */
  copyExternalImage(/** @type {any} */ o){
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.handle);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, o.x || 0, o.y || 0, o.width ?? o.image.width, o.height ?? o.image.height,
      gl.RGBA, gl.UNSIGNED_BYTE, o.image);
  }
  generateMipmapsWebGL(){
    if (this.niveaux < 2) return;
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
  }
  destroy(){ if (!this.detruite){ this.detruite = true; this.gl.deleteTexture(this.handle); } }
}

/** Le filtrage et les bords d'une texture liée. */
function reglePrise(/** @type {WebGL2RenderingContext} */ gl, /** @type {any} */ s, /** @type {boolean} */ niveaux){
  const min = s.minFilter === "nearest" ? "nearest" : "linear";
  const mip = niveaux && s.mipmapFilter !== "none" ? (s.mipmapFilter === "nearest" ? "nearest" : "linear") : "";
  const minGl = !mip ? FILTRES[min]
    : min === "linear" ? (mip === "linear" ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR_MIPMAP_NEAREST)
    : (mip === "linear" ? gl.NEAREST_MIPMAP_LINEAR : gl.NEAREST_MIPMAP_NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minGl);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, FILTRES[s.magFilter || "linear"] || gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ani = s.maxAnisotropy && gl.getExtension("EXT_texture_filter_anisotropic");
  if (ani) gl.texParameterf(gl.TEXTURE_2D, ani.TEXTURE_MAX_ANISOTROPY_EXT, s.maxAnisotropy);
}

/* Ce que la carte graphique a créé, que la sonde relève comme elle relevait
   ceux de luma.gl (`sonde.mjs` `travauxDeck`), par contexte. */
/** @type {WeakMap<WebGL2RenderingContext, Record<string, number>>} */
const CREES = new WeakMap();
/** Compte une création sur cette carte graphique : « Shaders Created », « Textures Created »… */
export function compteCree(/** @type {WebGL2RenderingContext} */ gl, /** @type {string} */ nom, n = 1){
  let c = CREES.get(gl);
  if (!c) CREES.set(gl, c = {});
  c[nom] = (c[nom] || 0) + n;
}

/** La carte graphique, telle que `logos-stands.mjs` l'interroge, et ses comptes tels que la sonde les lit. */
export function appareil(/** @type {WebGL2RenderingContext} */ gl){
  const features = new Set();
  if (gl.getExtension("EXT_texture_filter_anisotropic")) features.add("texture-filterable-anisotropic-webgl");
  return {
    gl, type: "moteur-gl", features,
    limits: { maxTextureDimension2D: gl.getParameter(gl.MAX_TEXTURE_SIZE) },
    getMipLevelCount: (/** @type {number} */ w, /** @type {number} */ h) => Math.floor(Math.log2(Math.max(w, h, 1))) + 1,
    createTexture: (/** @type {any} */ o) => new TextureMoteur(gl, o),
    createFramebuffer(/** @type {any} */ o){
      const fbo = gl.createFramebuffer(), t = o.colorAttachments[0];
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.handle, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return { fbo, destroy: () => gl.deleteFramebuffer(fbo) };
    },
    /* La copie d'une texture dans une autre : ce que la planche des logos
       recopie quand elle grandit, sans repasser par le processeur. */
    createCommandEncoder(){
      return {
        copyTextureToTexture(/** @type {any} */ o){
          const [sx, sy] = o.origin || [0, 0], [dx, dy] = o.destinationOrigin || [0, 0];
          gl.bindFramebuffer(gl.READ_FRAMEBUFFER, o.sourceTexture.fbo);
          gl.bindTexture(gl.TEXTURE_2D, o.destinationTexture.handle);
          gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, dx, dy, sx, sy, o.width, o.height);
          gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
        },
        finish(){ return this; },
      };
    },
    submit(){},
    statsManager: {
      getStats: (/** @type {string} */ nom) => nom !== "GPU Resource Counts" ? null
        : { get: (/** @type {string} */ k) => ({ count: (CREES.get(gl) || {})[k] || 0 }) },
    },
  };
}

/**
 * La texture d'une image donnée à une couche — une texture du moteur telle
 * quelle, ou une image, une toile, envoyée une fois par identité.
 */
function textureDe(/** @type {WebGL2RenderingContext} */ gl, /** @type {any} */ etat, /** @type {any} */ source,
  /** @type {any} */ reglages){
  if (!source) return null;
  if (source instanceof TextureMoteur) return source.detruite ? null : source;
  if (etat.source === source && etat.tex) return etat.tex;
  if (etat.tex) etat.tex.destroy();
  const w = source.naturalWidth || source.width, h = source.naturalHeight || source.height;
  if (!w || !h){ etat.tex = null; etat.source = null; return null; }
  const t = new TextureMoteur(gl, { width: w, height: h, mipLevels: Math.floor(Math.log2(Math.max(w, h))) + 1,
    sampler: { mipmapFilter: "linear", ...(reglages || {}) } });
  t.copyExternalImage({ image: source, x: 0, y: 0, width: w, height: h });
  t.generateMipmapsWebGL();
  etat.tex = t; etat.source = source;
  return t;
}

/* Les images données par leur adresse, chargées une fois pour toute la page :
   deck.gl les demandait au réseau, et ne les montrait qu'arrivées. */
/** @type {Map<string, { image: HTMLImageElement | null, attente: Set<() => void>, echec?: boolean }>} */
const IMAGES = new Map();
function imageDe(/** @type {string} */ adresse, /** @type {() => void} */ arrivee){
  let e = IMAGES.get(adresse);
  if (!e){
    const img = new Image();
    // comme la demande de deck.gl : une image d'ailleurs n'est lisible que si son serveur l'autorise
    if (!/^(data|blob):/.test(adresse)) img.crossOrigin = "anonymous";
    const n = { image: /** @type {HTMLImageElement | null} */ (null), attente: new Set([arrivee]), echec: false };
    IMAGES.set(adresse, n);
    img.onload = () => { n.image = img; for (const f of n.attente) f(); n.attente.clear(); };
    /* Une image en échec le reste : chaque image du plan lui ajoutait sinon un
       rappel que rien ne viderait plus. On ne la redemande pas non plus — ce
       serait une requête par image peinte. */
    img.onerror = () => { n.echec = true; n.attente.clear(); };
    img.src = adresse;
    return null;
  }
  if (!e.image && !e.echec) e.attente.add(arrivee);
  return e.image;
}

/* ------------------------------------------------------------
   L'image — `BitmapLayer`
   ------------------------------------------------------------ */
const VS_IMAGE = ENTETE_SOMMETS + `
in vec3 a_p; in vec2 a_uv;
out vec2 v_uv; out vec4 v_c;
void main(){
  v_uv = a_uv;
  v_c = couleurObjet(0.0);
  gl_Position = recadre(u_vp * u_modele * vec4(a_p, 1.0));
}`;
const FS_IMAGE = ENTETE_FRAGMENTS + `
uniform sampler2D u_image;
in vec2 v_uv; in vec4 v_c;
void main(){
  if (u_designe > 0.5){ fragColor = v_c; return; }
  vec4 c = texture(u_image, v_uv);
  fragColor = vec4(c.rgb, c.a * u_opacite);
}`;

/** Les quatre coins d'une image — bas gauche, haut gauche, haut droit, bas droit —, depuis ses bornes. */
function coinsImage(/** @type {any} */ b){
  if (Array.isArray(b[0])) return b.map((/** @type {number[]} */ p) => [p[0], p[1], p[2] || 0]);
  const [g, bas, d, haut] = b;
  return [[g, bas, 0], [g, haut, 0], [d, haut, 0], [d, bas, 0]];
}

export class BitmapLayer extends Couche {
  static programme(){ return { nom: "image", vs: VS_IMAGE, fs: FS_IMAGE, attributs: ["a_p", "a_uv"] }; }

  prepare(/** @type {any} */ ctx, /** @type {any} */ ancienne){
    const gl = ctx.gl, p = this.props, o = ctx.origine;
    let e = ancienne && ancienne.etat;
    const cle = JSON.stringify(p.bounds) + "|" + o.join();
    if (!e || e.cle !== cle){
      if (e) e.a.detruit();
      const c = coinsImage(p.bounds || [0, 0, 1, 1]).map(q => [q[0] - o[0], q[1] - o[1], q[2] - o[2]]);
      const a = new Assemblage(gl);
      a.pose(0, { donnees: new Float32Array([...c[0], ...c[1], ...c[3], ...c[2]]) }, 3, "f32", 0);
      a.pose(1, { donnees: new Float32Array([0, 1, 0, 0, 1, 1, 1, 0]) }, 2, "f32", 0);
      e = { a, cle, tex: e ? e.tex : null, source: e ? e.source : null };
    }
    this.etat = e;
    // une image donnée par son adresse se dessine une fois arrivée
    const img = p.image;
    this.source = typeof img === "string" ? imageDe(img, () => ctx.moteur.redraw()) : img;
  }

  dessine(/** @type {any} */ ctx, /** @type {any} */ prog){
    const gl = ctx.gl, e = this.etat;
    if (!e) return;
    const t = textureDe(gl, e, this.source, this.props.textureParameters);
    if (!t) return;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t.handle);
    gl.uniform1i(prog.u("u_image"), 0);
    e.a.lie();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  detruit(){
    if (!this.etat) return;
    this.etat.a.detruit();
    if (this.etat.tex) this.etat.tex.destroy();
    this.etat = null;
  }
}
BitmapLayer.layerName = "BitmapLayer";
BitmapLayer.defaultProps = { image: null, bounds: [1, 0, 0, 1], textureParameters: null, desaturate: 0,
  transparentColor: [0, 0, 0, 0], tintColor: [255, 255, 255] };

/* ------------------------------------------------------------
   Le maillage répété — `SimpleMeshLayer`
   ------------------------------------------------------------ */
const ATTR_MAILLAGE = (/** @type {number[]} */ o) => ({
  a_ipos: { accessor: "getPosition", taille: 3, type: /** @type {"f32"} */ ("f32"), defaut: [0, 0, 0],
    transforme: (/** @type {any} */ p) => p ? [p[0] - o[0], p[1] - o[1], (p[2] || 0) - o[2]] : p },
  a_icol: { accessor: "getColor", taille: 4, type: /** @type {"u8n"} */ ("u8n"), defaut: [0, 0, 0, 255] },
  a_case: { accessor: "getCaseLogo", taille: 4, type: /** @type {"f32"} */ ("f32"), defaut: [0, 0, 1, 1] },
  a_fig: { accessor: "getFigurant", taille: 4, type: /** @type {"f32"} */ ("f32"), defaut: [0, 0, 0, 0] },
  a_allure: { accessor: "getAllure", taille: 1, type: /** @type {"f32"} */ ("f32"), defaut: [0] },
});
const GEO_MAILLAGE = ["a_p", "a_n", "a_col", "a_uv", "a_m0", "a_m1", "a_m2", "a_t", "a_objet"];
const LISTE_MAILLAGE = numerote(GEO_MAILLAGE, ATTR_MAILLAGE([0, 0, 0]));

/* Les palettes des figurants, une par partie — l'ordre de `PARTIES` : bas,
   chaussures, haut, peau, cheveux. */
const PARTIES_FIG = ["bas", "chaussures", "haut", "peau", "cheveux"];
// seize couleurs par partie au plus : le shader l'écrit en dur (`u_palettes[80]`)
const TAILLE_PALETTE = 16;

const VS_MAILLAGE = ENTETE_SOMMETS + `
in vec3 a_p; in vec3 a_n; in vec3 a_col; in vec2 a_uv; in vec3 a_m0; in vec3 a_m1; in vec3 a_m2; in vec3 a_t; in float a_objet;
in vec3 a_ipos; in vec4 a_icol; in vec4 a_case; in vec4 a_fig; in float a_allure;
uniform float u_taille;
uniform float u_parFormes;
uniform highp sampler2D u_formes;
uniform float u_cases;
uniform float u_figurants;
uniform vec3 u_palettes[80];
uniform vec2 u_fondu;
out vec2 v_uv; out vec3 v_n; out vec3 v_p; out vec4 v_c; out float v_fondu;
void main(){
  mat3 m = mat3(a_m0, a_m1, a_m2);
  // les allures rangées en texture : le sommet, sa partie et sa normale, au rang que la carte dessine
  vec3 sp = a_p, sn = a_n; float partie0 = a_col.r;
  if (u_parFormes > 0.5){
    ivec2 rang = ivec2(gl_VertexID, int(a_allure + 0.5) * 2);
    vec4 f = texelFetch(u_formes, rang, 0);
    sp = f.xyz; partie0 = f.w;
    sn = texelFetch(u_formes, rang + ivec2(0, 1), 0).xyz;
  }
  vec3 p = (m * sp) * u_taille + a_t;
  vec4 w = u_modele * vec4(p + a_ipos, 1.0);
  v_p = w.xyz;
  v_n = mat3(u_modele) * (m * sn);
  v_uv = a_uv;
  v_c = vec4(a_col * a_icol.rgb, a_icol.a);
  v_fondu = 1.0;
  if (u_cases > 0.5){
    v_uv = a_case.xy + v_uv * a_case.zw;
    v_fondu = smoothstep(u_fondu.x, u_fondu.y, zoomVue());
  }
  if (u_figurants > 0.5){
    int partie = int(partie0 + 0.5);
    int k = partie == 0 ? int(a_fig.x) : partie == 1 ? int(a_fig.w) : partie == 2 ? int(a_fig.x)
      : partie == 3 ? int(a_fig.y) : int(a_fig.z);
    v_c = vec4(u_palettes[clamp(partie, 0, 4) * 16 + clamp(k, 0, 15)], v_c.a);
  }
  if (u_designe > 0.5) v_c = couleurObjet(a_objet);
  gl_Position = recadre(u_vp * w);
}`;
const FS_MAILLAGE = ENTETE_FRAGMENTS + GLSL_LUMIERE + `
uniform sampler2D u_image;
uniform float u_texture;
uniform float u_plat;
uniform float u_eclaire;
in vec2 v_uv; in vec3 v_n; in vec3 v_p; in vec4 v_c; in float v_fondu;
void main(){
  if (u_designe > 0.5){
    // effacé, il ne se vise plus : un appui le traverse jusqu'à ce qu'il recouvre
    if (v_fondu < 0.02) discard;
    fragColor = v_c; return;
  }
  vec4 c = u_texture > 0.5 ? texture(u_image, v_uv) : v_c;
  c.a *= v_fondu;
  if (v_fondu < 1.0 && c.a < 0.02) discard;
  vec3 n = u_plat > 0.5 ? normalize(cross(dFdx(v_p), dFdy(v_p))) : normalize(v_n);
  vec3 l = u_eclaire > 0.5 ? eclaire(c.rgb, v_p, n) : c.rgb;
  fragColor = vec4(l, c.a * u_opacite);
}`;

/** La matrice 3 × 3 et la translation d'un exemplaire, comme deck.gl les tire de ses réglages. */
function matriceExemplaire(/** @type {any} */ o, /** @type {any} */ s, /** @type {any} */ t, /** @type {any} */ m, /** @type {number[]} */ out){
  if (m && m.length === 16){
    out[0] = m[0]; out[1] = m[1]; out[2] = m[2]; out[3] = m[4]; out[4] = m[5]; out[5] = m[6];
    out[6] = m[8]; out[7] = m[9]; out[8] = m[10]; out[9] = m[12]; out[10] = m[13]; out[11] = m[14];
    return out;
  }
  const r = Math.PI / 180, pitch = o[0] * r, yaw = o[1] * r, roll = o[2] * r;
  const sr = Math.sin(roll), sp = Math.sin(pitch), sw = Math.sin(yaw), cr = Math.cos(roll), cp = Math.cos(pitch), cw = Math.cos(yaw);
  out[0] = s[0] * cw * cp; out[1] = s[0] * sw * cp; out[2] = s[0] * -sp;
  out[3] = s[1] * (-sw * cr + cw * sp * sr); out[4] = s[1] * (cw * cr + sw * sp * sr); out[5] = s[1] * cp * sr;
  out[6] = s[2] * (sw * sr + cw * sp * cr); out[7] = s[2] * (-cw * sr + sw * sp * cr); out[8] = s[2] * cp * cr;
  out[9] = t[0]; out[10] = t[1]; out[11] = t[2];
  return out;
}

/**
 * La texture des allures, quand une couche en porte (`formes`, `webgl.mjs`
 * `CoucheFigurants`) : toutes les allures des figurants dans une seule
 * couche, chacun lisant la sienne au rang du sommet (`figurants.mjs`
 * `formesEnTexture`). La couche de `webgl.mjs` réécrit le shader de deck.gl
 * pour cela, que ce moteur n'emploie pas : il fait la même lecture dans le
 * sien, sans quoi les figurants se dessineraient sur le maillage vide qui ne
 * sert qu'à compter les sommets.
 * @returns {any}
 */
function textureFormes(/** @type {WebGL2RenderingContext} */ gl, /** @type {any} */ f){
  if (!f) return null;
  const handle = /** @type {WebGLTexture} */ (gl.createTexture());
  gl.bindTexture(gl.TEXTURE_2D, handle);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, f.largeur, f.hauteur, 0, gl.RGBA, gl.FLOAT, f.donnees);
  // des nombres lus au texel près : rien ne se filtre, et une texture flottante ne le pourrait pas partout
  for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST],
    [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
  gl.bindTexture(gl.TEXTURE_2D, null);
  compteCree(gl, "Textures Created");
  return { handle, destroy(){ gl.deleteTexture(handle); } };
}

/** Les attributs d'un maillage, ceux qu'il ne donne pas posés comme deck.gl les pose. */
function attributsMaillage(/** @type {any} */ mesh){
  const a = mesh && (mesh.attributes || mesh) || {};
  const pos = a.positions || a.POSITION;
  if (!pos) return null;
  const n = pos.value.length / (pos.size || 3);
  const nor = a.normals || a.NORMAL, col = a.colors || a.COLOR_0, uv = a.texCoords || a.TEXCOORD_0;
  return { n, pos: pos.value, nor: nor ? nor.value : new Float32Array(n * 3), plat: !nor,
    col: col ? col.value : new Float32Array(n * 3).fill(1), uv: uv ? uv.value : new Float32Array(n * 2),
    indices: mesh && mesh.indices ? (mesh.indices.value || mesh.indices) : null };
}

export class SimpleMeshLayer extends Couche {
  static programme(){ return { nom: "maillage", vs: VS_MAILLAGE, fs: FS_MAILLAGE, attributs: LISTE_MAILLAGE }; }

  prepare(/** @type {any} */ ctx, /** @type {any} */ ancienne){
    const gl = ctx.gl, p = this.props, data = p.data;
    const specs = ATTR_MAILLAGE(ctx.origine);
    numerote(GEO_MAILLAGE, specs);
    let e = ancienne && ancienne.etat;
    const r = aRefaire(this, e ? ancienne : null, ["getOrientation", "getScale", "getTranslation", "getTransformMatrix"]);
    if (e && (ancienne.props.mesh !== p.mesh || ancienne.props.formes !== p.formes)) r.tout = true;
    if (r.tout || !e){
      if (e) e.a.detruit();
      const M = attributsMaillage(p.mesh);
      const a = new Assemblage(gl);
      const comptes = new Int32Array(data.length).fill(1);
      e = { a, M, comptes, total: data.length, tex: e ? e.tex : null, source: e ? e.source : null,
        formes: e && ancienne.props.formes === p.formes ? e.formes : (e && e.formes && e.formes.destroy(), textureFormes(gl, p.formes)) };
      if (M){
        a.pose(0, { donnees: new Float32Array(M.pos) }, 3, "f32", 0);
        a.pose(1, { donnees: new Float32Array(M.nor) }, 3, "f32", 0);
        a.pose(2, { donnees: new Float32Array(M.col) }, 3, "f32", 0);
        a.pose(3, { donnees: new Float32Array(M.uv) }, 2, "f32", 0);
        if (M.indices) a.poseIndices(new Uint32Array(M.indices));
        // la matrice de chaque exemplaire : douze nombres, en quatre attributs
        const mat = new Float32Array(data.length * 12), tmp = new Array(12);
        const info = { index: 0, data, target: [] };
        const f = (/** @type {any} */ v, /** @type {any} */ d) => typeof v === "function" ? v(d, info) : v;
        const tm = p.getTransformMatrix;
        const avecMatrice = Array.isArray(tm) ? tm.length === 16 : Boolean(data.length && typeof tm === "function" && tm(data[0], info));
        for (let i = 0; i < data.length; i++){
          info.index = i;
          const d = data[i];
          matriceExemplaire(f(p.getOrientation, d), f(p.getScale, d), f(p.getTranslation, d), avecMatrice ? f(tm, d) : null, tmp);
          mat.set(tmp, i * 12);
        }
        gl.bindVertexArray(a.vao);
        const b = /** @type {WebGLBuffer} */ (gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, mat, gl.STATIC_DRAW);
        a.tampons.set(4, b); a.octets += mat.byteLength;
        for (let k = 0; k < 4; k++){
          gl.enableVertexAttribArray(4 + k);
          gl.vertexAttribPointer(4 + k, 3, gl.FLOAT, false, 48, k * 12);
          gl.vertexAttribDivisor(4 + k, 1);
        }
        gl.bindVertexArray(null);
        a.pose(8, remplis({ accessor: "", taille: 1, type: "f32", defaut: [0] }, (/** @type {any} */ d, /** @type {any} */ i) => i.index, data, comptes, data.length), 1, "f32", 1);
        remplisAttributs(this, a, specs, comptes, data.length, 1, null);
      }
    } else if (r.acces.size && e.M) remplisAttributs(this, e.a, specs, e.comptes, e.total, 1, r.acces);
    this.etat = e;
  }

  dessine(/** @type {any} */ ctx, /** @type {any} */ prog){
    const gl = ctx.gl, p = this.props, e = this.etat;
    if (!e || !e.M || !e.total) return;
    const t = textureDe(gl, e, p.texture, p.textureParameters);
    gl.uniform1f(prog.u("u_texture"), t ? 1 : 0);
    if (t){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t.handle);
      gl.uniform1i(prog.u("u_image"), 0);
    } else if (p.texture) return;
    gl.uniform1f(prog.u("u_taille"), p.sizeScale ?? 1);
    gl.uniform1f(prog.u("u_parFormes"), e.formes ? 1 : 0);
    if (e.formes){
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, e.formes.handle);
      gl.uniform1i(prog.u("u_formes"), 1);
      gl.activeTexture(gl.TEXTURE0);
    }
    gl.uniform1f(prog.u("u_plat"), e.M.plat ? 1 : 0);
    const cases = this.extension("CasesEtFondu");
    gl.uniform1f(prog.u("u_cases"), cases ? 1 : 0);
    const fondu = p.fonduZoom || [-100, -100];
    gl.uniform2f(prog.u("u_fondu"), fondu[0], fondu[1]);
    const palettes = this.extension("TeinteDesFigurants") && p.palettesFigurants;
    gl.uniform1f(prog.u("u_figurants"), palettes ? 1 : 0);
    if (palettes){
      const v = new Float32Array(5 * TAILLE_PALETTE * 3);
      PARTIES_FIG.forEach((nom, i) => (palettes[nom] || []).slice(0, TAILLE_PALETTE).forEach((/** @type {number[]} */ c, k) =>
        v.set([c[0] / 255, c[1] / 255, c[2] / 255], (i * TAILLE_PALETTE + k) * 3)));
      gl.uniform3fv(prog.u("u_palettes"), v);
    }
    const eclaire = p.material !== false && p.material !== null ? 1 : 0;
    gl.uniform1f(prog.u("u_eclaire"), eclaire);
    if (eclaire) poseLumiere(gl, prog, ctx, p.material);
    e.a.lie();
    if (e.M.indices) gl.drawElementsInstanced(gl.TRIANGLES, e.M.indices.length, gl.UNSIGNED_INT, 0, e.total);
    else gl.drawArraysInstanced(gl.TRIANGLES, 0, e.M.n, e.total);
  }

  detruit(){
    if (!this.etat) return;
    this.etat.a.detruit();
    // la texture d'une toile, la couche l'a faite ; celle de la planche est à `logos-stands.mjs`
    if (this.etat.tex) this.etat.tex.destroy();
    if (this.etat.formes) this.etat.formes.destroy();
    this.etat = null;
  }
}
SimpleMeshLayer.layerName = "SimpleMeshLayer";
SimpleMeshLayer.defaultProps = { mesh: null, texture: null, sizeScale: 1, _instanced: true, wireframe: false, material: true,
  getPosition: (/** @type {any} */ d) => d.position, getColor: [0, 0, 0, 255], getOrientation: [0, 0, 0], getScale: [1, 1, 1],
  getTranslation: [0, 0, 0], getTransformMatrix: [], textureParameters: null };
