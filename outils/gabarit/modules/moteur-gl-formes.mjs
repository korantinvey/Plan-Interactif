/* ============================================================
   Le moteur du plan — les aplats et les traits

   `SolidPolygonLayer` et `PathLayer`, comme `webgl.mjs` les déclare : les
   stands, les zones, le sol du hall, leurs contours, les cloisons,
   l'itinéraire. Un aplat se triangule une fois (earcut) ; en vue immersive il
   monte en volume, dessus et façades éclairés comme ceux de deck.gl. Un trait
   se peint segment par segment, chacun une gélule dont les bouts ronds font
   les jointures ; ses tirets, son défilement et le filtre de zoom des
   extensions de `webgl.mjs` se décident dans le shader.

   Ce que la couche reçoit et quand elle le refait : `moteur-gl-couche.mjs`.
   ============================================================ */
import earcut from "earcut";
import { Couche, ENTETE_SOMMETS, ENTETE_FRAGMENTS, remplis, tampon, aRefaire } from "./moteur-gl-couche.mjs";

/* ------------------------------------------------------------
   Ce que les couches partagent : les attributs posés sur la carte graphique
   ------------------------------------------------------------ */

/**
 * Les tampons d'une couche et leur assemblage (« vertex array ») : un
 * attribut y entre par son numéro dans le programme, rempli ou constant.
 */
export class Assemblage {
  constructor(/** @type {WebGL2RenderingContext} */ gl){
    this.gl = gl;
    this.vao = /** @type {WebGLVertexArrayObject} */ (gl.createVertexArray());
    /** @type {Map<number, WebGLBuffer>} */
    this.tampons = new Map();
    /** @type {Map<number, number[]>} les attributs constants, posés avant chaque dessin */
    this.constantes = new Map();
    /** @type {WebGLBuffer | null} */
    this.indices = null;
    this.octets = 0;
  }
  /** Pose un attribut : des données (un tampon neuf remplace l'ancien) ou une constante. */
  pose(/** @type {number} */ emplacement, /** @type {any} */ r, /** @type {number} */ taille,
    /** @type {"f32" | "u8n"} */ type, /** @type {number} */ diviseur){
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    const ancien = this.tampons.get(emplacement);
    if (ancien){ gl.deleteBuffer(ancien); this.tampons.delete(emplacement); }
    if (r.constante){
      gl.disableVertexAttribArray(emplacement);
      const c = type === "u8n" ? r.constante.map((/** @type {number} */ x) => x / 255) : r.constante;
      this.constantes.set(emplacement, [c[0] || 0, c[1] || 0, c[2] || 0, c.length > 3 ? c[3] : (taille > 3 ? 0 : 1)]);
    } else {
      this.constantes.delete(emplacement);
      const b = tampon(gl, r.donnees);
      this.octets += r.donnees.byteLength;
      this.tampons.set(emplacement, b);
      gl.enableVertexAttribArray(emplacement);
      gl.vertexAttribPointer(emplacement, taille, type === "u8n" ? gl.UNSIGNED_BYTE : gl.FLOAT, type === "u8n", 0, 0);
      gl.vertexAttribDivisor(emplacement, diviseur);
    }
    gl.bindVertexArray(null);
  }
  /** Les indices des triangles. */
  poseIndices(/** @type {Uint32Array} */ idx){
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    if (this.indices) gl.deleteBuffer(this.indices);
    this.indices = tampon(gl, idx, gl.ELEMENT_ARRAY_BUFFER);
    this.octets += idx.byteLength;
    gl.bindVertexArray(null);
  }
  /** Avant de dessiner : l'assemblage, et les valeurs des attributs constants — qui ne tiennent pas à lui. */
  lie(){
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    for (const [e, c] of this.constantes) gl.vertexAttrib4f(e, c[0], c[1], c[2], c[3]);
  }
  detruit(){
    const gl = this.gl;
    for (const b of this.tampons.values()) gl.deleteBuffer(b);
    if (this.indices) gl.deleteBuffer(this.indices);
    gl.deleteVertexArray(this.vao);
    this.tampons.clear();
  }
}

/** Le quadrilatère qu'une instance déploie : quatre coins, en bande. */
export function coins(/** @type {WebGL2RenderingContext} */ gl, /** @type {Assemblage} */ a,
  /** @type {number} */ emplacement, /** @type {number[]} */ valeurs){
  a.pose(emplacement, { donnees: new Float32Array(valeurs) }, 2, "f32", 0);
}

/**
 * Remplit, ou remplit de nouveau, les attributs objet par objet d'une couche.
 * `acces` : les seules fonctions d'accès à refaire ; rien, toutes.
 */
export function remplisAttributs(/** @type {any} */ couche, /** @type {Assemblage} */ a,
  /** @type {Record<string, import("./moteur-gl-couche.mjs").SpecAttribut>} */ specs, /** @type {ArrayLike<number>} */ comptes,
  /** @type {number} */ total, /** @type {number} */ diviseur, /** @type {Set<string> | null} */ acces){
  const p = couche.props, data = p.data;
  for (const spec of Object.values(specs)){
    if (acces && !acces.has(spec.accessor)) continue;
    a.pose(/** @type {number} */ (spec.emplacement), remplis(spec, p[spec.accessor], data, comptes, total), spec.taille, spec.type, diviseur);
  }
}

/** Les attributs objet par objet, numérotés à la suite de ceux de la géométrie. */
export function numerote(/** @type {string[]} */ geometrie, /** @type {Record<string, any>} */ specs){
  let n = geometrie.length;
  for (const s of Object.values(specs)) s.emplacement = n++;
  return [...geometrie, ...Object.keys(specs)];
}

/* Le filtre de zoom de `webgl.mjs` (`FiltreZoom`), tel que ses couches le
   déclarent : trois zooms par objet — où il se lit, où il cède la place, où il
   change d'atlas — et, pour la couche, un mode et un drapeau « muet ». Hors
   de la plage, le sommet part hors du cadre. */
export const GLSL_FILTRE = `
uniform vec3 u_filtre;
bool filtreTait(vec3 zf){
  float z = zoomVue();
  bool garde = u_filtre.x > 1.5 ? z < zf.z : (u_filtre.x > 0.5 && z >= zf.z);
  if (u_filtre.y > 0.5 && u_designe < 0.5) garde = true;
  return z < zf.x || z >= zf.y || garde;
}
`;
/** Les réglages du filtre de zoom, posés par l'extension (`draw`) — rien si la couche n'en porte pas. */
export function reglageFiltre(/** @type {any} */ couche){
  const f = couche.moduleProps.filtreZoom;
  return f ? [f.mode || 0, f.muet || 0, f.etire || 1] : [0, 0, 1];
}
/** La spécification de l'attribut du filtre de zoom. */
export const ATTRIBUT_FILTRE = { accessor: "getZoomFiltre", taille: 3, type: /** @type {"f32"} */ ("f32"), defaut: [-100, 100, -100] };

/* ------------------------------------------------------------
   La lumière des volumes — celle de deck.gl et luma.gl, à l'identique :
   une part ambiante, et chaque lumière directionnelle en diffus et en
   reflet, selon la matière de la couche.
   ------------------------------------------------------------ */
export const GLSL_LUMIERE = `
uniform vec3 u_ambiante;
uniform vec3 u_sens[3];
uniform vec3 u_teinte[3];
uniform int u_nSens;
uniform vec4 u_matiere;
uniform vec3 u_reflet;
uniform vec3 u_oeil;
vec3 eclaire(vec3 c, vec3 p, vec3 n){
  vec3 vue = normalize(u_oeil - p);
  vec3 l = u_matiere.x * c * u_ambiante;
  for (int i = 0; i < 3; i++){
    if (i >= u_nSens) break;
    vec3 d = -u_sens[i];
    float lambert = dot(d, n), brille = 0.0;
    if (lambert > 0.0) brille = pow(max(dot(n, normalize(d + vue)), 0.0), u_matiere.z);
    l += (max(lambert, 0.0) * u_matiere.y * c + brille * u_reflet) * u_teinte[i];
  }
  return l;
}
`;

/** Pose la lumière et la matière d'une couche éclairée. */
export function poseLumiere(/** @type {WebGL2RenderingContext} */ gl, /** @type {any} */ prog, /** @type {any} */ ctx,
  /** @type {any} */ matiere){
  const L = ctx.lumieres, m = matiere && typeof matiere === "object" ? matiere : {};
  gl.uniform3fv(prog.u("u_ambiante"), L.ambiante);
  gl.uniform1i(prog.u("u_nSens"), L.sens.length);
  if (L.sens.length){
    gl.uniform3fv(prog.u("u_sens"), L.sens.flat());
    gl.uniform3fv(prog.u("u_teinte"), L.teintes.flat());
  }
  gl.uniform4f(prog.u("u_matiere"), m.ambient ?? .35, m.diffuse ?? .6, m.shininess ?? 32, 0);
  const s = m.specularColor || [30, 30, 30];
  gl.uniform3f(prog.u("u_reflet"), s[0] / 255, s[1] / 255, s[2] / 255);
  gl.uniform3fv(prog.u("u_oeil"), ctx.oeil);
}

/* ------------------------------------------------------------
   Les aplats — `SolidPolygonLayer`
   ------------------------------------------------------------ */

const ATTR_POLYGONE = {
  a_c: { accessor: "getFillColor", taille: 4, type: /** @type {"u8n"} */ ("u8n"), defaut: [0, 0, 0, 255] },
  a_haut: { accessor: "getElevation", taille: 1, type: /** @type {"f32"} */ ("f32"), defaut: [1000] },
};
const GEO_POLYGONE = ["a_p", "a_n", "a_dessus", "a_objet"];
const LISTE_POLYGONE = numerote(GEO_POLYGONE, ATTR_POLYGONE);

const VS_POLYGONE = ENTETE_SOMMETS + GLSL_LUMIERE + `
in vec3 a_p; in vec3 a_n; in float a_dessus; in float a_objet; in vec4 a_c; in float a_haut;
uniform float u_elevation;
uniform float u_relief;
uniform float u_eclaire;
uniform float u_opacite;
out vec4 v_c;
void main(){
  vec3 p = a_p;
  p.z += a_dessus * a_haut * u_elevation * u_relief;
  vec4 m = u_modele * vec4(p, 1.0);
  gl_Position = recadre(u_vp * m);
  if (u_designe > 0.5){ v_c = couleurObjet(a_objet); return; }
  vec3 c = a_c.rgb;
  if (u_eclaire > 0.5) c = eclaire(c, m.xyz, normalize(mat3(u_modele) * a_n));
  v_c = vec4(c, a_c.a * u_opacite);
}`;
const FS_COULEUR = ENTETE_FRAGMENTS + `
in vec4 v_c;
void main(){ fragColor = v_c; }`;

/** L'aire signée d'un anneau, l'axe des y vers le haut. */
const aire = (/** @type {number[][]} */ a) => {
  let s = 0;
  for (let i = 0, j = a.length - 1; i < a.length; j = i++) s += (a[j][0] - a[i][0]) * (a[j][1] + a[i][1]);
  return s / 2;
};

/** Les anneaux d'un polygone, quelle que soit sa forme : un anneau seul, ou une liste d'anneaux. */
function anneauxDe(/** @type {any} */ poly){
  if (!poly || !poly.length) return [];
  if (typeof poly[0][0] === "number") return [poly];
  return poly.filter((/** @type {any} */ a) => a && a.length >= 3);
}

export class SolidPolygonLayer extends Couche {
  static programme(){ return { nom: "polygone", vs: VS_POLYGONE, fs: FS_COULEUR, attributs: LISTE_POLYGONE }; }

  /**
   * La géométrie : les triangles du dessus, et en relief les façades, deux
   * triangles par arête, leur normale vers l'extérieur.
   */
  geometrie(/** @type {any} */ ctx){
    const p = this.props, data = p.data, relief = Boolean(p.extruded);
    const [ox, oy, oz] = ctx.origine, getPolygon = p.getPolygon;
    const pos = [], nor = [], des = [], obj = [], idx = [];
    const comptes = new Int32Array(data.length);
    const info = { index: 0, data, target: [] };
    let n = 0;
    for (let i = 0; i < data.length; i++){
      info.index = i;
      const anneaux = anneauxDe(typeof getPolygon === "function" ? getPolygon(data[i], info) : getPolygon);
      if (!anneaux.length) continue;
      const depart = n;
      const plat = [], trous = [], z = [];
      for (const a of anneaux){
        // un anneau fermé à la main répète son premier point : earcut n'en veut pas
        const b = a.length > 3 && a[0][0] === a[a.length - 1][0] && a[0][1] === a[a.length - 1][1] ? a.slice(0, -1) : a;
        if (plat.length) trous.push(plat.length / 2);
        for (const q of b){ plat.push(q[0] - ox, q[1] - oy); z.push((q[2] || 0) - oz); }
      }
      const t = earcut(plat, trous, 2);
      for (let k = 0; k < plat.length / 2; k++){
        pos.push(plat[2 * k], plat[2 * k + 1], z[k]); nor.push(0, 0, 1); des.push(1); obj.push(i);
      }
      for (const v of t) idx.push(depart + v);
      n += plat.length / 2;
      if (relief){
        // les façades : chaque arête, de bas en haut, tournée vers le dehors
        anneaux.forEach((a, r) => {
          const b = a.length > 3 && a[0][0] === a[a.length - 1][0] && a[0][1] === a[a.length - 1][1] ? a.slice(0, -1) : a;
          const sens = (aire(b) > 0 ? 1 : -1) * (r === 0 ? 1 : -1);
          for (let k = 0; k < b.length; k++){
            const u = b[k], v = b[(k + 1) % b.length];
            const dx = v[0] - u[0], dy = v[1] - u[1], l = Math.hypot(dx, dy) || 1;
            const nx = dy / l * sens, ny = -dx / l * sens;
            const zu = (u[2] || 0) - oz, zv = (v[2] || 0) - oz;
            const s = n;
            pos.push(u[0] - ox, u[1] - oy, zu, v[0] - ox, v[1] - oy, zv, u[0] - ox, u[1] - oy, zu, v[0] - ox, v[1] - oy, zv);
            for (let j = 0; j < 4; j++){ nor.push(nx, ny, 0); obj.push(i); }
            des.push(0, 0, 1, 1);
            idx.push(s, s + 1, s + 2, s + 2, s + 1, s + 3);
            n += 4;
          }
        });
      }
      comptes[i] = n - depart;
    }
    return { comptes, total: n, tampons: { a_p: new Float32Array(pos), a_n: new Float32Array(nor),
      a_dessus: new Float32Array(des), a_objet: new Float32Array(obj) }, indices: new Uint32Array(idx) };
  }

  prepare(/** @type {any} */ ctx, /** @type {any} */ ancienne){
    const gl = ctx.gl;
    const r = aRefaire(this, ancienne && ancienne.etat ? ancienne : null, ["getPolygon"], ["extruded"]);
    let e = ancienne && ancienne.etat;
    if (r.tout || !e){
      if (e) e.a.detruit();
      const g = this.geometrie(ctx);
      const a = new Assemblage(gl);
      a.pose(0, { donnees: g.tampons.a_p }, 3, "f32", 0);
      a.pose(1, { donnees: g.tampons.a_n }, 3, "f32", 0);
      a.pose(2, { donnees: g.tampons.a_dessus }, 1, "f32", 0);
      a.pose(3, { donnees: g.tampons.a_objet }, 1, "f32", 0);
      a.poseIndices(g.indices);
      e = { a, comptes: g.comptes, total: g.total, n: g.indices.length };
      remplisAttributs(this, a, ATTR_POLYGONE, e.comptes, e.total, 0, null);
    } else if (r.acces.size) remplisAttributs(this, e.a, ATTR_POLYGONE, e.comptes, e.total, 0, r.acces);
    this.etat = e;
  }

  dessine(/** @type {any} */ ctx, /** @type {any} */ prog){
    const gl = ctx.gl, p = this.props, e = this.etat;
    if (!e || !e.n) return;
    // la lumière ne touche que les volumes d'une matière — sans effet de lumière, celle de deck.gl par défaut
    const eclaire = p.extruded && p.material !== false ? 1 : 0;
    gl.uniform1f(prog.u("u_elevation"), p.elevationScale ?? 1);
    gl.uniform1f(prog.u("u_relief"), p.extruded ? 1 : 0);
    gl.uniform1f(prog.u("u_eclaire"), eclaire);
    if (eclaire) poseLumiere(gl, prog, ctx, p.material);
    e.a.lie();
    gl.drawElements(gl.TRIANGLES, e.n, gl.UNSIGNED_INT, 0);
  }

  detruit(){ if (this.etat){ this.etat.a.detruit(); this.etat = null; } }
}
SolidPolygonLayer.layerName = "SolidPolygonLayer";
SolidPolygonLayer.defaultProps = { filled: true, extruded: false, wireframe: false, elevationScale: 1, material: true,
  getPolygon: (/** @type {any} */ d) => d.polygon, getFillColor: [0, 0, 0, 255], getElevation: 1000, _normalize: true };

/* ------------------------------------------------------------
   Les traits — `PathLayer`
   ------------------------------------------------------------ */

const ATTR_TRAIT = {
  a_c: { accessor: "getColor", taille: 4, type: /** @type {"u8n"} */ ("u8n"), defaut: [0, 0, 0, 255] },
  a_l: { accessor: "getWidth", taille: 1, type: /** @type {"f32"} */ ("f32"), defaut: [1] },
  a_tiret: { accessor: "getDashArray", taille: 2, type: /** @type {"f32"} */ ("f32"), defaut: [0, 0] },
  a_zf: ATTRIBUT_FILTRE,
};
const GEO_TRAIT = ["a_coin", "a_a", "a_b", "a_dist", "a_bouts", "a_objet"];
const LISTE_TRAIT = numerote(GEO_TRAIT, ATTR_TRAIT);

/* Un segment, une gélule. Couché, il s'élargit dans le plan du sol, d'une
   demi-largeur comptée en mètres à l'échelle du centre de la vue — comme
   deck.gl, qui le couche aussi : vu de biais, un trait lointain s'amincit.
   Face à l'œil (`billboard`), il s'élargit à l'écran. Un pixel de plus de
   chaque côté porte le lissage du bord. */
const VS_TRAIT = ENTETE_SOMMETS + GLSL_FILTRE + `
in vec2 a_coin; in vec3 a_a; in vec3 a_b; in float a_dist; in vec2 a_bouts; in float a_objet;
in vec4 a_c; in float a_l; in vec2 a_tiret; in vec3 a_zf;
uniform vec4 u_largeur;
uniform float u_face;
uniform float u_opacite;
out vec4 v_c; out vec2 v_q; out float v_lg; out float v_r; out float v_pos; out vec2 v_tiret; out vec2 v_bouts;
void main(){
  float px = a_l * u_largeur.y * (u_largeur.x > 0.5 ? 1.0 : u_echelle);
  px = clamp(px, u_largeur.z, u_largeur.w);
  float r = px * 0.5, m = r + 1.0;
  v_r = r; v_c = a_c; v_tiret = a_tiret; v_bouts = a_bouts;
  if (u_designe > 0.5) v_c = couleurObjet(a_objet);
  else v_c.a *= u_opacite;
  if (filtreTait(a_zf) || px <= 0.0){ gl_Position = vec4(0.0, 0.0, 2.0, 1.0); return; }
  vec4 A = u_modele * vec4(a_a, 1.0), B = u_modele * vec4(a_b, 1.0);
  if (u_face > 0.5){
    vec4 ca = u_vp * A, cb = u_vp * B;
    vec2 ea = ca.xy / ca.w * u_ecran * 0.5, eb = cb.xy / cb.w * u_ecran * 0.5;
    vec2 d = eb - ea; float lg = length(d); vec2 u = lg > 0.0 ? d / lg : vec2(1.0, 0.0), n = vec2(-u.y, u.x);
    float le = mix(-m, lg + m, a_coin.x), tr = a_coin.y * m;
    vec4 c = mix(ca, cb, clamp(le / max(lg, 1e-6), 0.0, 1.0));
    vec2 e = ea + u * le + n * tr;
    v_q = vec2(le, tr); v_lg = lg; v_pos = (a_dist * u_echelle + le) / max(r, 1e-6);
    gl_Position = recadre(vec4(e / (u_ecran * 0.5) * c.w, c.z, c.w));
    return;
  }
  vec2 d = (B.xy - A.xy) * u_echelle; float lg = length(d);
  vec2 u = lg > 0.0 ? d / lg : vec2(1.0, 0.0), n = vec2(-u.y, u.x);
  float le = mix(-m, lg + m, a_coin.x), tr = a_coin.y * m;
  float t = clamp(le / max(lg, 1e-6), 0.0, 1.0);
  vec3 p = mix(A.xyz, B.xyz, t);
  p.xy += (u * (le - t * lg) + n * tr) / u_echelle;
  v_q = vec2(le, tr); v_lg = lg; v_pos = (a_dist * u_echelle + le) / max(r, 1e-6);
  gl_Position = recadre(u_vp * vec4(p, 1.0));
}`;
const FS_TRAIT = ENTETE_FRAGMENTS + `
in vec4 v_c; in vec2 v_q; in float v_lg; in float v_r; in float v_pos; in vec2 v_tiret; in vec2 v_bouts;
uniform vec3 u_defile;
void main(){
  // les bouts du trait sont droits : seules les jointures s'arrondissent
  if ((v_q.x < 0.0 && v_bouts.x > 0.5) || (v_q.x > v_lg && v_bouts.y > 0.5)) discard;
  if (v_tiret.y > 0.0 && mod(v_pos, v_tiret.x + v_tiret.y) > v_tiret.x) discard;
  float unite = u_defile.x + u_defile.y;
  if (unite > 0.0 && mod(v_pos + u_defile.z, unite) > u_defile.x) discard;
  float x = clamp(v_q.x, 0.0, v_lg);
  float d = length(vec2(v_q.x - x, v_q.y));
  float a = clamp(v_r - d + 0.5, 0.0, 1.0);
  if (u_designe > 0.5){ if (d > v_r) discard; fragColor = v_c; return; }
  if (a <= 0.0) discard;
  fragColor = vec4(v_c.rgb, v_c.a * a);
}`;

export class PathLayer extends Couche {
  static programme(){ return { nom: "trait", vs: VS_TRAIT, fs: FS_TRAIT, attributs: LISTE_TRAIT }; }

  geometrie(/** @type {any} */ ctx){
    const p = this.props, data = p.data, [ox, oy, oz] = ctx.origine, getPath = p.getPath;
    const comptes = new Int32Array(data.length);
    const info = { index: 0, data, target: [] };
    const chemins = [];
    let n = 0;
    for (let i = 0; i < data.length; i++){
      info.index = i;
      const c = typeof getPath === "function" ? getPath(data[i], info) : getPath;
      if (!c || c.length < 2){ chemins.push(null); continue; }
      chemins.push(c); comptes[i] = c.length - 1; n += c.length - 1;
    }
    const ab = new Float32Array(n * 6), dist = new Float32Array(n), bouts = new Float32Array(n * 2), obj = new Float32Array(n);
    let s = 0;
    chemins.forEach((c, i) => {
      if (!c) return;
      let d = 0;
      for (let k = 0; k + 1 < c.length; k++, s++){
        const u = c[k], v = c[k + 1];
        ab.set([u[0] - ox, u[1] - oy, (u[2] || 0) - oz, v[0] - ox, v[1] - oy, (v[2] || 0) - oz], s * 6);
        dist[s] = d; obj[s] = i;
        bouts[2 * s] = k === 0 ? 1 : 0; bouts[2 * s + 1] = k + 2 === c.length ? 1 : 0;
        d += Math.hypot(v[0] - u[0], v[1] - u[1], (v[2] || 0) - (u[2] || 0));
      }
    });
    return { comptes, total: n, ab, dist, bouts, obj };
  }

  prepare(/** @type {any} */ ctx, /** @type {any} */ ancienne){
    const gl = ctx.gl;
    const r = aRefaire(this, ancienne && ancienne.etat ? ancienne : null, ["getPath"]);
    let e = ancienne && ancienne.etat;
    if (r.tout || !e){
      if (e) e.a.detruit();
      const g = this.geometrie(ctx);
      const a = new Assemblage(gl);
      coins(gl, a, 0, [0, -1, 1, -1, 0, 1, 1, 1]);
      gl.bindVertexArray(a.vao);
      const b = tampon(gl, g.ab); a.tampons.set(1, b); a.octets += g.ab.byteLength;
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 0); gl.vertexAttribDivisor(1, 1);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 24, 12); gl.vertexAttribDivisor(2, 1);
      gl.bindVertexArray(null);
      a.pose(3, { donnees: g.dist }, 1, "f32", 1);
      a.pose(4, { donnees: g.bouts }, 2, "f32", 1);
      a.pose(5, { donnees: g.obj }, 1, "f32", 1);
      e = { a, comptes: g.comptes, total: g.total };
      remplisAttributs(this, a, ATTR_TRAIT, e.comptes, e.total, 1, null);
    } else if (r.acces.size) remplisAttributs(this, e.a, ATTR_TRAIT, e.comptes, e.total, 1, r.acces);
    this.etat = e;
  }

  dessine(/** @type {any} */ ctx, /** @type {any} */ prog){
    const gl = ctx.gl, p = this.props, e = this.etat;
    if (!e || !e.total) return;
    const pixels = p.widthUnits === "pixels" ? 1 : 0;
    gl.uniform4f(prog.u("u_largeur"), pixels, p.widthScale ?? 1, p.widthMinPixels || 0,
      p.widthMaxPixels === undefined ? 1e6 : p.widthMaxPixels);
    gl.uniform1f(prog.u("u_face"), p.billboard ? 1 : 0);
    gl.uniform3fv(prog.u("u_filtre"), reglageFiltre(this));
    const d = this.moduleProps.defile;
    gl.uniform3f(prog.u("u_defile"), d ? d.tirets[0] : 0, d ? d.tirets[1] : 0, d ? d.decalage : 0);
    e.a.lie();
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, e.total);
  }

  detruit(){ if (this.etat){ this.etat.a.detruit(); this.etat = null; } }
}
PathLayer.layerName = "PathLayer";
PathLayer.defaultProps = { widthUnits: "meters", widthScale: 1, widthMinPixels: 0, widthMaxPixels: Number.MAX_SAFE_INTEGER,
  jointRounded: false, capRounded: false, miterLimit: 4, billboard: false,
  getPath: (/** @type {any} */ d) => d.path, getColor: [0, 0, 0, 255], getWidth: 1 };
