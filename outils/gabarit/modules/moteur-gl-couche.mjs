/* ============================================================
   Le moteur du plan — la couche, ses attributs et ses programmes

   Une couche se déclare comme chez deck.gl : une classe (`SolidPolygonLayer`,
   `PathLayer`…), un identifiant, des données et des fonctions d'accès, que
   `webgl.mjs` refait à chaque assemblage. Le moteur garde d'une image à
   l'autre ce que la carte graphique a reçu pour chaque identifiant, et ne le
   refait qu'aux conditions de deck.gl — c'est ce sur quoi tout `webgl.mjs`
   compte pour ne pas reconvertir le plan à chaque image :

   - des données neuves (une autre identité, que `dataComparator` ne dit pas
     égale à l'ancienne) refont tout ;
   - un `updateTriggers` qui change refait l'attribut de cette fonction
     d'accès — et la géométrie, si la fonction la décide ;
   - une constante qui change de valeur se repose, sans rien refaire ;
   - une fonction d'accès neuve, sans déclencheur, ne refait rien : deck.gl
     l'ignore, et `webgl.mjs` en crée de neuves à chaque assemblage.

   Le reste des réglages — `opacity`, `modelMatrix`, `parameters`,
   `elevationScale`, les réglages d'une extension — se lit au dessin.

   Les extensions de `webgl.mjs` (`FiltreZoom`, `LissageSdf`,
   `TiretsQuiDefilent`…) écrivent du GLSL pour les shaders de deck.gl. Le
   moteur ne les compile pas : il les reconnaît à leur nom (`extensionName`)
   et fait la même chose dans les siens. Leurs méthodes `initializeState` et
   `draw` tournent comme chez deck.gl, la couche pour `this` : c'est par
   elles que `webgl.mjs` règle, à chaque image, ce que les shaders lisent
   (`setShaderModuleProps`).
   ============================================================ */

/* ------------------------------------------------------------
   Les programmes
   ------------------------------------------------------------ */

/**
 * Le début commun des shaders de sommets : la vue, la matrice de la couche,
 * la fenêtre de la désignation, et la couleur qui dit un objet désigné.
 *
 * `u_recadre` resserre l'image sur la fenêtre de la désignation : quelques
 * pixels autour du doigt, peints seuls dans un tampon de leur taille. Hors
 * de la désignation il vaut (0, 0, 1, 1) et ne change rien.
 */
export const ENTETE_SOMMETS = `#version 300 es
precision highp float;
uniform mat4 u_vp;
uniform mat4 u_modele;
uniform vec4 u_recadre;
uniform vec2 u_ecran;
uniform float u_echelle;
uniform float u_designe;
uniform float u_couche;
vec4 recadre(vec4 c){ c.xy = (c.xy - u_recadre.xy * c.w) * u_recadre.zw; return c; }
vec4 couleurObjet(float i){
  float n = i + 1.0;
  return vec4(mod(n, 256.0), mod(floor(n / 256.0), 256.0), mod(floor(n / 65536.0), 256.0), u_couche) / 255.0;
}
/* Ce que le zoom vaut ici : le logarithme des pixels par mètre au centre de la vue. */
float zoomVue(){ return log2(u_echelle); }
`;

/** Le début commun des shaders de fragments. */
export const ENTETE_FRAGMENTS = `#version 300 es
precision highp float;
uniform float u_designe;
uniform float u_opacite;
out vec4 fragColor;
`;

/**
 * Un programme lié, ses emplacements d'attributs fixés à l'avance — le même
 * numéro pour le même nom, quelle que soit la carte graphique — et ses
 * uniformes retrouvés une fois.
 *
 * La compilation part sans attendre : sur une carte graphique qui compile en
 * tâche de fond (`KHR_parallel_shader_compile`), tous les programmes du
 * moteur se compilent ensemble, et `pret` dit, sans bloquer, quand l'un l'est.
 */
export class Programme {
  constructor(/** @type {WebGL2RenderingContext} */ gl, /** @type {string} */ nom, /** @type {string} */ vs,
    /** @type {string} */ fs, /** @type {string[]} */ attributs){
    this.gl = gl; this.nom = nom; this.attributs = attributs;
    this.lie = false; this.erreur = "";
    /** @type {Map<string, WebGLUniformLocation | null>} */
    this.uniformes = new Map();
    const p = /** @type {WebGLProgram} */ (gl.createProgram());
    this.vs = this.shader(gl.VERTEX_SHADER, vs);
    this.fs = this.shader(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, this.vs); gl.attachShader(p, this.fs);
    attributs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
    gl.linkProgram(p);
    this.p = p;
    this.parallele = gl.getExtension("KHR_parallel_shader_compile");
  }
  shader(/** @type {number} */ type, /** @type {string} */ src){
    const s = /** @type {WebGLShader} */ (this.gl.createShader(type));
    this.gl.shaderSource(s, src); this.gl.compileShader(s);
    return s;
  }
  /** Le programme est-il prêt à dessiner ? Ne bloque pas tant que la carte graphique compile. */
  pret(){
    if (this.lie) return !this.erreur;
    const gl = this.gl;
    if (this.parallele && !gl.getProgramParameter(this.p, this.parallele.COMPLETION_STATUS_KHR)) return false;
    this.lie = true;
    if (!gl.getProgramParameter(this.p, gl.LINK_STATUS)){
      this.erreur = this.nom + " : " + (gl.getProgramInfoLog(this.p) || "") +
        (gl.getShaderInfoLog(this.vs) || "") + (gl.getShaderInfoLog(this.fs) || "");
      console.warn("Moteur du plan, programme refusé — " + this.erreur);
    }
    gl.deleteShader(this.vs); gl.deleteShader(this.fs);
    return !this.erreur;
  }
  /** L'emplacement d'un uniforme, retrouvé une fois. */
  u(/** @type {string} */ nom){
    let l = this.uniformes.get(nom);
    if (l === undefined){ l = this.gl.getUniformLocation(this.p, nom); this.uniformes.set(nom, l); }
    return l;
  }
  detruit(){ this.gl.deleteProgram(this.p); }
}

/* ------------------------------------------------------------
   Les attributs

   Un attribut est rempli objet par objet : la valeur que la fonction d'accès
   rend pour un objet est recopiée sur chacun de ses sommets (ou de ses
   instances), dont la géométrie a dit le nombre. Une fonction d'accès qui
   rend une constante — ou une constante donnée à sa place — ne remplit
   rien : la carte graphique la lit comme une valeur fixe de l'attribut.
   ------------------------------------------------------------ */

/**
 * @typedef {object} SpecAttribut
 * @property {string} accessor la fonction d'accès qui le remplit (`getFillColor`)
 * @property {number} taille le nombre de composantes (1 à 4)
 * @property {"f32" | "u8n"} type flottants, ou octets ramenés à [0, 1]
 * @property {number[]} defaut la valeur d'un objet sans valeur
 * @property {(v: any, d: any, i: number) => ArrayLike<number> | number} [transforme] ce que l'attribut garde de la valeur rendue
 * @property {number} [emplacement] son numéro dans le programme
 */

/** Une valeur rendue par une fonction d'accès, mise à la taille de l'attribut. */
function composantes(/** @type {any} */ v, /** @type {SpecAttribut} */ spec){
  const o = new Array(spec.taille);
  if (typeof v === "number"){ o.fill(0); o[0] = v; }
  for (let k = 0; k < spec.taille; k++){
    const x = v && typeof v === "object" ? v[k] : (k === 0 ? v : undefined);
    o[k] = x === undefined || x === null || !Number.isFinite(+x) ? spec.defaut[k] : +x;
  }
  return o;
}

/**
 * Remplit un attribut : `comptes[i]` sommets pour l'objet `i`. Rend la
 * constante si la fonction d'accès n'en est pas une.
 * @returns {{ constante: number[] } | { donnees: Float32Array | Uint8Array }}
 */
export function remplis(/** @type {SpecAttribut} */ spec, /** @type {any} */ acces, /** @type {any[]} */ data,
  /** @type {ArrayLike<number>} */ comptes, /** @type {number} */ total){
  if (typeof acces !== "function"){
    const v = spec.transforme ? spec.transforme(acces, null, -1) : acces;
    return { constante: composantes(v === undefined ? spec.defaut : v, spec) };
  }
  const n = spec.taille, u8 = spec.type === "u8n";
  const donnees = u8 ? new Uint8Array(total * n) : new Float32Array(total * n);
  const info = { index: 0, data, target: [] };
  let o = 0;
  for (let i = 0; i < data.length; i++){
    const c = comptes[i];
    if (!c) continue;
    info.index = i;
    let v = acces(data[i], info);
    if (spec.transforme) v = spec.transforme(v, data[i], i);
    const q = composantes(v, spec);
    if (u8) for (let k = 0; k < n; k++) q[k] = Math.max(0, Math.min(255, Math.round(q[k])));
    for (let j = 0; j < c; j++, o += n) for (let k = 0; k < n; k++) donnees[o + k] = q[k];
  }
  return { donnees };
}

/** Un tampon de sommets, posé sur la carte graphique. */
export function tampon(/** @type {WebGL2RenderingContext} */ gl, /** @type {BufferSource} */ donnees,
  /** @type {number} */ cible = WebGL2RenderingContext.ARRAY_BUFFER){
  const b = /** @type {WebGLBuffer} */ (gl.createBuffer());
  gl.bindBuffer(cible, b);
  gl.bufferData(cible, donnees, gl.STATIC_DRAW);
  return b;
}

/* ------------------------------------------------------------
   Les extensions
   ------------------------------------------------------------ */

/**
 * Une extension, comme `deck.LayerExtension`. Le moteur ne lit pas ses
 * shaders (`getShaders`) : il la reconnaît à son nom. Ses `defaultProps`
 * s'ajoutent à ceux de la couche qui la porte, comme chez deck.gl.
 */
export class LayerExtension {
  constructor(/** @type {any} */ opts = {}){ this.opts = opts; }
  getShaders(){ return {}; }
}
/** @type {string} */
LayerExtension.extensionName = "LayerExtension";
/** @type {any} */
LayerExtension.defaultProps = {};

/** Les tirets d'un trait, comme `deck.PathStyleExtension` : `getDashArray` en demi-épaisseurs. */
export class PathStyleExtension extends LayerExtension {}
PathStyleExtension.extensionName = "PathStyleExtension";
PathStyleExtension.defaultProps = { getDashArray: { type: "accessor", value: [0, 0] }, dashJustified: false,
  dashGapPickable: false };

/** Le nom d'une extension, tel qu'elle le déclare. */
export const nomExtension = (/** @type {any} */ e) => (e && e.constructor && e.constructor.extensionName) || "";

/* ------------------------------------------------------------
   La couche
   ------------------------------------------------------------ */

/** Une valeur par défaut, dite comme deck.gl la dit parfois : `{ type: "accessor", value }`. */
const valeurDefaut = (/** @type {any} */ v) =>
  v && typeof v === "object" && !Array.isArray(v) && typeof v.type === "string" && "value" in v ? v.value : v;

const REGLAGES_COMMUNS = { id: "", data: [], visible: true, pickable: false, opacity: 1, modelMatrix: null,
  parameters: {}, extensions: [], updateTriggers: {}, dataComparator: null };

/**
 * La couche, comme `deck.Layer` : ses réglages (`props`) — ceux de sa classe,
 * de ses extensions, puis les siens —, et rien d'autre. Ce que la carte
 * graphique en a reçu vit dans le moteur, sous son identifiant, et passe
 * d'une couche à celle qui la remplace.
 */
export class Couche {
  constructor(/** @type {any[]} */ ...lots){
    const propres = Object.assign({}, ...lots.filter(Boolean));
    /** @type {any} */
    const props = { ...REGLAGES_COMMUNS };
    const chaine = [];
    for (let c = /** @type {any} */ (this.constructor); c && c !== Object; c = Object.getPrototypeOf(c)) chaine.unshift(c);
    for (const c of chaine) if (Object.prototype.hasOwnProperty.call(c, "defaultProps"))
      for (const [k, v] of Object.entries(c.defaultProps)) props[k] = valeurDefaut(v);
    for (const e of propres.extensions || []){
      const d = e && e.constructor && e.constructor.defaultProps;
      if (d) for (const [k, v] of Object.entries(d)) if (!(k in props)) props[k] = valeurDefaut(v);
    }
    Object.assign(props, propres);
    if (!props.data) props.data = [];
    if (!props.parameters) props.parameters = {};
    if (!props.updateTriggers) props.updateTriggers = {};
    if (!props.extensions) props.extensions = [];
    /** @type {any} */
    this.props = props;
    /** @type {string} */
    this.id = props.id;
    /* Ce que la couche garde en marchant : ses attributs ajoutés par une
       extension, les réglages que ses extensions posent pour les shaders. */
    /** @type {any} */
    this.state = {};
    /** @type {Record<string, any>} */
    this.moduleProps = {};
    /** @type {any} */
    this.etat = null;
  }

  /** Une copie, quelques réglages changés — comme `layer.clone`. */
  clone(/** @type {any} */ autres){
    const C = /** @type {any} */ (this.constructor);
    return new C(this.props, autres);
  }

  /** Ce qu'une extension pose pour les shaders, à chaque image (`draw`). */
  setShaderModuleProps(/** @type {Record<string, any>} */ o){ Object.assign(this.moduleProps, o); }

  /** Le gestionnaire des attributs : une extension y ajoute les siens (`initializeState`). */
  getAttributeManager(){
    const couche = this;
    return {
      addInstanced(/** @type {Record<string, { size: number, accessor: string }>} */ o){
        couche.state.ajoutes = { ...(couche.state.ajoutes || {}), ...o };
      },
      add(/** @type {Record<string, { size: number, accessor: string }>} */ o){
        couche.state.ajoutes = { ...(couche.state.ajoutes || {}), ...o };
      },
    };
  }

  /* Ce que chaque sorte de couche fait à sa façon : recevoir sur la carte
     graphique ce qu'elle a à peindre (en reprenant ce qu'en avait la couche
     qu'elle remplace), le peindre, le rendre. */
  prepare(/** @type {any} */ ctx, /** @type {any} */ ancienne){}
  dessine(/** @type {any} */ ctx, /** @type {any} */ prog){}
  detruit(){}
  /** Le programme de la sorte : son nom, ses shaders, ses attributs dans l'ordre. */
  static programme(){ return { nom: "", vs: "", fs: "", attributs: /** @type {string[]} */ ([]) }; }

  /** L'extension de ce nom que porte la couche, ou rien. */
  extension(/** @type {string} */ nom){
    return (this.props.extensions || []).find((/** @type {any} */ e) => nomExtension(e) === nom) || null;
  }
}
Couche.layerName = "Layer";
/** @type {any} */
Couche.defaultProps = {};

/* ------------------------------------------------------------
   Ce qui change d'une couche à celle qui la remplace
   ------------------------------------------------------------ */

/** L'égalité de deck.gl pour un déclencheur : à un niveau de profondeur. */
export function egalProfondeur1(/** @type {any} */ a, /** @type {any} */ b){
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
}

/** Deux valeurs constantes égales — un tableau de nombres comparé terme à terme. */
export function memeValeur(/** @type {any} */ a, /** @type {any} */ b){
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => x === b[i]);
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)){
    const x = /** @type {any} */ (a), y = /** @type {any} */ (b);
    return x.length === y.length && x.every((/** @type {number} */ v, /** @type {number} */ i) => v === y[i]);
  }
  return false;
}

/**
 * Ce que la couche neuve oblige à refaire, comparée à celle qu'elle remplace :
 * `tout` (les données, ou un réglage qui décide de la géométrie), ou la liste
 * des fonctions d'accès dont l'attribut est à remplir de nouveau.
 * @returns {{ tout: boolean, acces: Set<string> }}
 */
export function aRefaire(/** @type {Couche} */ neuve, /** @type {Couche | null} */ ancienne,
  /** @type {string[]} */ geometrie, /** @type {string[]} */ reglagesGeometrie = []){
  const r = { tout: false, acces: new Set() };
  if (!ancienne){ r.tout = true; return r; }
  const p = neuve.props, a = ancienne.props;
  if (p.data !== a.data && !(typeof p.dataComparator === "function" && p.dataComparator(p.data, a.data))){
    r.tout = true; return r;
  }
  for (const k of reglagesGeometrie) if (!memeValeur(p[k], a[k]) && !egalProfondeur1(p[k], a[k])){ r.tout = true; return r; }
  const tp = p.updateTriggers || {}, ta = a.updateTriggers || {};
  const cles = new Set([...Object.keys(tp), ...Object.keys(ta)]);
  for (const k of cles){
    // « all » refait tout, comme chez deck.gl
    if (!egalProfondeur1(tp[k], ta[k])){
      if (k === "all" || geometrie.includes(k)){ r.tout = true; return r; }
      r.acces.add(k);
    }
  }
  // une constante changée, ou une fonction devenue constante — et l'inverse
  for (const k of Object.keys(p)) if (k.startsWith("get")){
    const f = typeof p[k] === "function", g = typeof a[k] === "function";
    if (f !== g || (!f && !memeValeur(p[k], a[k]))){
      if (geometrie.includes(k)){ r.tout = true; return r; }
      r.acces.add(k);
    }
  }
  return r;
}
