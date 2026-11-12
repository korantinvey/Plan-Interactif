/* ============================================================
   Le moteur du plan — WebGL2, écrit pour lui

   Le plan se peignait par deck.gl : 750 Ko de bibliothèque générale, dont le
   plan n'employait qu'une quinzaine de classes. Ce moteur fait le même
   travail pour ce seul plan, en une petite partie du poids : à scène égale,
   cinq fois moins de mémoire, et le processeur vingt-cinq fois moins
   sollicité à chaque image d'un zoom (banc du 12 novembre 2026, SMCL 2026).

   Il parle comme deck.gl. `webgl.mjs` déclare ses couches de la même façon —
   mêmes classes, mêmes réglages, mêmes fonctions d'accès, mêmes règles de
   mise à jour — et reçoit l'un ou l'autre sous le même nom, `deck` : le
   moteur par défaut, ou deck.gl lui-même si l'adresse porte `?moteur=deck`,
   le recours en cas de souci. Rien des règles du plan n'a donc été réécrit ;
   ce qui change, c'est qui les peint.

   Ce module tient la toile, le contexte, la boucle d'images et la
   désignation (`Deck`), et réunit les classes que `webgl.mjs` emploie
   (`MOTEUR_GL`). Les couches vivent à part : aplats et traits
   (`moteur-gl-formes.mjs`), textes (`moteur-gl-texte.mjs`), images et objets
   (`moteur-gl-objets.mjs`) ; ce qu'elles partagent, `moteur-gl-couche.mjs` ;
   les vues et leurs matrices, `moteur-gl-matrices.mjs`.

   Ce qu'il ne reprend pas de deck.gl, et pourquoi :
   - la boucle d'images ne tourne pas au repos : une image n'est demandée que
     lorsqu'un réglage change. deck.gl en demandait une à chaque trame pour
     ne rien peindre ; ici, rien ne réveille la page qui ne bouge pas.
   - pas de chauffe à retoucher : tous les programmes partent compiler
     ensemble à la création du moteur, sans que la page les attende
     (`KHR_parallel_shader_compile`), et une image n'est peinte que lorsque
     tous ceux qu'elle emploie sont prêts — jamais à moitié.
   - la désignation peint seulement les quelques pixels autour du doigt, dans
     un tampon de leur taille : ni le tampon à l'échelle de l'écran de deck.gl
     ni sa profondeur en flottants (`webgl.mjs` `sansProfondeurDeDesignation`).
   ============================================================ */
import { Viewport, View, OrthographicView, rapporte, IDENTITE, mul4, translation4 } from "./moteur-gl-matrices.mjs";
import { Couche, LayerExtension, PathStyleExtension, Programme, nomExtension } from "./moteur-gl-couche.mjs";
import { SolidPolygonLayer, PathLayer } from "./moteur-gl-formes.mjs";
import { TextLayer } from "./moteur-gl-texte.mjs";
import { BitmapLayer, SimpleMeshLayer, appareil, compteCree } from "./moteur-gl-objets.mjs";

/* ------------------------------------------------------------
   Les lumières, comme celles de deck.gl
   ------------------------------------------------------------ */
export class AmbientLight {
  constructor(/** @type {any} */ p = {}){ this.type = "ambient"; this.color = p.color || [255, 255, 255]; this.intensity = p.intensity ?? 1; }
}
export class DirectionalLight {
  constructor(/** @type {any} */ p = {}){
    this.type = "directional"; this.color = p.color || [255, 255, 255]; this.intensity = p.intensity ?? 1;
    const d = p.direction || [0, 0, -1], l = Math.hypot(d[0], d[1], d[2]) || 1;
    this.direction = [d[0] / l, d[1] / l, d[2] / l];
  }
}
export class LightingEffect {
  constructor(/** @type {Record<string, any>} */ lumieres = {}){ this.lights = lumieres; }
}
/* Sans effet de lumière, deck.gl en pose un d'office : une ambiance pleine
   et deux jours. Le mobilier et les figurants du plan à plat s'y éclairent. */
const LUMIERES_PAR_DEFAUT = [new AmbientLight({ intensity: 1 }),
  new DirectionalLight({ intensity: 1, direction: [-1, 3, -1] }),
  new DirectionalLight({ intensity: .9, direction: [1, -8, -2.5] })];

/** Les lumières d'une image, prêtes pour les shaders. */
function lumieresDe(/** @type {any[]} */ effets){
  const e = (effets || []).find(x => x instanceof LightingEffect);
  const liste = e ? Object.values(e.lights) : LUMIERES_PAR_DEFAUT;
  const ambiante = [0, 0, 0], sens = [], teintes = [];
  for (const l of liste){
    const t = l.color.map((/** @type {number} */ c) => c / 255 * l.intensity);
    if (l.type === "ambient") for (let k = 0; k < 3; k++) ambiante[k] += t[k];
    else if (l.type === "directional" && sens.length < 3){ sens.push(l.direction); teintes.push(t); }
  }
  return { ambiante, sens, teintes };
}

/* ------------------------------------------------------------
   Le moteur
   ------------------------------------------------------------ */

/** Les sortes de couches, et le programme de chacune. */
const SORTES = [SolidPolygonLayer, PathLayer, TextLayer, BitmapLayer, SimpleMeshLayer];

/* Les réglages de dessin d'une couche (`parameters`), comme deck.gl les
   nomme. Par défaut : la profondeur consultée « inférieure ou égale » et
   écrite, le mélange par l'opacité. */
const COMPARE = { never: 0x0200, less: 0x0201, equal: 0x0202, "less-equal": 0x0203, greater: 0x0204,
  "not-equal": 0x0205, "greater-equal": 0x0206, always: 0x0207 };

/* Ce qu'une image attend au plus ses programmes avant de peindre sans eux :
   une carte graphique qui ne dirait jamais avoir fini ne laisse pas le plan
   vide. */
const ATTENTE_PROGRAMMES = 8000;

let _numero = 0;

export class Deck {
  constructor(/** @type {any} */ props = {}){
    this.id = "moteur-" + (++_numero);
    /** @type {any} */
    this.props = { layers: [], effects: [], viewState: {}, useDevicePixels: true, layerFilter: null, ...props };
    this.isInitialized = false;
    /** la désignation sait se faire sans attendre la carte graphique (`webgl.mjs` `lectureDifferee`) */
    this.designationDifferee = true;
    /** @type {Map<string, any>} la dernière couche de chaque identifiant, et ce que la carte graphique en a */
    this.couches = new Map();
    /** @type {any[]} */
    this.ordre = [];
    this.sales = true;
    this.image = 0;
    this.finalise = false;
    /** @type {number[] | null} */
    this.origine = null;
    /** @type {Viewport | null} */
    this.vue = null;
    this.debutProgrammes = performance.now();
    /** les comptes de la sonde : ce que deck.gl appelait `metrics` */
    /* Au-delà des noms de deck.gl, ce que vaut chaque étape d'une image — la
       mise à jour des couches (`attributesTimePerFrame`), leur dessin
       (`drawTimePerFrame`) —, la désignation (`pickTime`, `pickCount`) et la
       chauffe (`chauffeMs`) : le relevé ?perf les garde tels quels. */
    this.metrics = { fps: 0, cpuTimePerFrame: 0, gpuTimePerFrame: 0, layersCount: 0, drawLayersCount: 0, framesRedrawn: 0,
      updateAttributesTime: 0, updateLayersCount: 0, attributesTimePerFrame: 0, drawTimePerFrame: 0, pickTime: 0, pickCount: 0,
      chauffeMs: 0 };
    this._comptes = this._comptesVides();
    /* Les comptes que la sonde lisait chez deck.gl sous ces noms : le temps
       passé à refaire les attributs, et les couches refaites, depuis les
       derniers `metrics` — remis à zéro avec eux, comme chez deck.gl. */
    this.stats = {
      get: (/** @type {string} */ nom) => nom === "Update Attributes" ? { time: this._comptes.attrMs }
        : nom === "Layer updates" ? { count: this._comptes.couches } : null,
    };
    const toile = props.canvas || document.createElement("canvas");
    if (!props.canvas){
      toile.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;display:block";
      (props.parent || document.body).appendChild(toile);
    }
    this.canvas = toile;
    const webgl = (props.deviceProps && props.deviceProps.webgl) || {};
    /** @type {WebGL2RenderingContext | null} */
    // les attributs du contexte de deck.gl : refusé là où il l'était, sans gros handicap
    const gl = toile.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true, depth: true,
      stencil: false, preserveDrawingBuffer: Boolean(webgl.preserveDrawingBuffer), powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true });
    if (!gl){
      this.device = null;
      setTimeout(() => this.props.onError && this.props.onError(new Error("WebGL2 indisponible")), 0);
      return;
    }
    this.gl = gl;
    // la carte graphique, telle que `logos-stands.mjs` y range sa planche
    this.device = appareil(gl);
    // tous les programmes partent compiler ensemble, sans que la page les attende
    /** @type {Map<string, Programme>} */
    this.programmes = new Map();
    for (const S of SORTES){
      const d = /** @type {any} */ (S).programme();
      this.programmes.set(d.nom, new Programme(gl, d.nom, d.vs, d.fs, d.attributs));
    }
    compteCree(gl, "Shaders Created", 2 * SORTES.length);
    compteCree(gl, "SharedRenderPipelines Created", SORTES.length);
    this.isInitialized = true;
    toile.addEventListener("webglcontextlost", (e) => { e.preventDefault(); this.perdu = true; });
    // après le constructeur, comme chez deck.gl : qui l'a créé le tient déjà
    setTimeout(() => {
      if (this.finalise) return;
      if (this.props.onLoad) this.props.onLoad();
      this._planifie();
    }, 0);
  }

  setProps(/** @type {any} */ p){
    if (this.finalise) return;
    Object.assign(this.props, p);
    if ("layers" in p) this.sales = true;
    this._planifie();
  }

  /** Redessine : tout de suite si une raison est donnée, à la prochaine image sinon. */
  redraw(/** @type {string | undefined} */ raison){
    if (raison) this._dessine(); else this._planifie();
  }

  getCanvas(){ return this.canvas; }

  /** La vue de la dernière image — rien avant elle. */
  getViewports(){ return this.vue ? [this.vue] : []; }

  finalize(){
    if (this.finalise) return;
    this.finalise = true;
    cancelAnimationFrame(this.image);
    const gl = this.gl;
    if (gl && !gl.isContextLost()){
      for (const c of this.couches.values()) try { c.detruit(); } catch (e) { /* une couche déjà défaite */ }
      for (const p of this.programmes.values()) p.detruit();
      if (this._designation) this._designation.detruit(gl);
    }
    this.couches.clear();
    // la mémoire de la carte graphique rendue tout de suite, sans attendre le ramasse-miettes
    const perte = gl && gl.getExtension("WEBGL_lose_context");
    if (perte) perte.loseContext();
    if (!this.props.canvas && this.canvas.parentNode) this.canvas.remove();
  }

  _planifie(){
    if (this.image || this.finalise) return;
    this.image = requestAnimationFrame(() => { this.image = 0; this._dessine(); });
  }

  /** La taille de la toile, en pixels CSS et réels. */
  _taille(){
    const t = this.canvas, w = t.clientWidth || this.props.width || 1, h = t.clientHeight || this.props.height || 1;
    const u = this.props.useDevicePixels;
    const dpr = typeof u === "number" ? u : u === false ? 1 : (window.devicePixelRatio || 1);
    const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
    if (t.width !== W) t.width = W;
    if (t.height !== H) t.height = H;
    return { w, h, W, H, dpr };
  }

  /** La vue de cette image, rapportée à l'origine du moteur. */
  _vue(/** @type {number} */ w, /** @type {number} */ h){
    const vs = this.props.viewState || {};
    let v = this.props.views;
    if (Array.isArray(v)) v = v[0];
    if (!v) v = new OrthographicView({});
    const vp = typeof v.makeViewport === "function" ? v.makeViewport({ width: w, height: h, viewState: vs })
      : new Viewport({ ...vs, width: w, height: h });
    this.vue = vp;
    if (!this.origine){
      const c = vs.target || [0, 0, 0];
      this.origine = [Math.round(c[0] || 0), Math.round(c[1] || 0), 0];
    }
    return vp;
  }

  /** Les couches de la liste, aplaties, sans les vides. */
  _aplatis(/** @type {any} */ liste, /** @type {any[]} */ out = []){
    for (const c of liste || []){
      if (!c) continue;
      if (Array.isArray(c)) this._aplatis(c, out);
      else out.push(c);
    }
    return out;
  }

  /** Les couches neuves prennent la place des anciennes de même identifiant. */
  _reconcilie(/** @type {any} */ ctx){
    const t0 = performance.now();
    const neuves = this._aplatis(this.props.layers), vues = new Set(), ordre = [];
    for (const c of neuves){
      if (!(c instanceof Couche) || vues.has(c.id)) continue;
      vues.add(c.id);
      const avant = this.couches.get(c.id);
      const meme = avant && avant !== c && avant.constructor === c.constructor;
      try {
        if (avant && avant !== c && !meme){ avant.detruit(); }
        if (avant !== c){
          // l'état des extensions suit la couche qui remplace
          if (meme) c.state = avant.state;
          else for (const e of c.props.extensions || []) if (e && typeof e.initializeState === "function")
            try { e.initializeState.call(c, {}, e); } catch (x) { /* une extension sans attributs à elle */ }
          c.prepare(ctx, meme ? avant : null);
          this._comptes.couches++;
        }
        this.couches.set(c.id, c);
        ordre.push(c);
      } catch (e){
        this._rate(new Error("la couche « " + c.id + " » n'a pas pu se préparer : " + (/** @type {any} */ (e).message || e)));
      }
    }
    for (const [id, c] of this.couches) if (!vues.has(id)){ try { c.detruit(); } catch (e) { /* déjà défaite */ } this.couches.delete(id); }
    this.ordre = ordre;
    this.sales = false;
    this._comptes.attrMs += performance.now() - t0;
  }

  /** Le contexte de dessin commun à toutes les couches d'une passe. */
  _contexte(/** @type {Viewport} */ vp, /** @type {number} */ w, /** @type {number} */ h, /** @type {number} */ dpr){
    const o = /** @type {number[]} */ (this.origine);
    const vpRel = mul4(vp.viewProjectionMatrix, translation4(o[0], o[1], o[2]));
    return { gl: this.gl, moteur: this, origine: o, vue: vp, vp: new Float32Array(vpRel), echelle: vp.scale,
      ecran: [w, h], dpr, lumieres: lumieresDe(this.props.effects), oeil: this._oeil(vp, o) };
  }

  /** Où se tient l'œil, rapporté à l'origine : pour le reflet des volumes. */
  _oeil(/** @type {Viewport} */ vp, /** @type {number[]} */ o){
    const m = vp.viewProjectionMatrix;
    if (!vp.perspective) return [vp.position[0] - o[0], vp.position[1] - o[1], 1e6];
    /* L'œil est le point dont l'image n'a ni x, ni y, ni w : trois équations
       linéaires, résolues par Cramer. */
    const A = [[m[0], m[4], m[8]], [m[1], m[5], m[9]], [m[3], m[7], m[11]]], b = [-m[12], -m[13], -m[15]];
    const det = (/** @type {number[][]} */ M) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
      M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    const D = det(A);
    if (Math.abs(D) < 1e-18) return [vp.position[0] - o[0], vp.position[1] - o[1], 1e6];
    const col = (/** @type {number} */ k) => A.map((r, i) => r.map((x, j) => j === k ? b[i] : x));
    return [det(col(0)) / D - o[0], det(col(1)) / D - o[1], det(col(2)) / D - o[2]];
  }

  /** Les couches qu'une passe peint, dans l'ordre. */
  _peintes(/** @type {Viewport} */ vp, /** @type {boolean} */ designe){
    const f = this.props.layerFilter;
    return this.ordre.filter(c => c.props.visible !== false && (!designe || c.props.pickable) &&
      (!f || f({ layer: c, viewport: vp, isPicking: designe, renderPass: designe ? "picking" : "screen" }) !== false));
  }

  /** Les programmes de ces couches sont-ils tous prêts ? */
  _prets(/** @type {any[]} */ couches){
    const noms = new Set(couches.map(c => c.constructor.programme().nom));
    let tous = true;
    for (const n of noms){ const p = this.programmes.get(n); if (p && !p.pret() && !p.lie) tous = false; }
    return tous || performance.now() - this.debutProgrammes > ATTENTE_PROGRAMMES;
  }

  /** Un raté du dessin, dit à qui a créé le moteur (`onError`) — une fois par raté. */
  _rate(/** @type {any} */ e){
    const m = e && e.message ? e.message : String(e);
    const dits = this._rates || (this._rates = new Set());
    if (dits.has(m)) return;
    dits.add(m);
    if (this.props.onError) this.props.onError(e);
  }

  /** Peint une couche : ses réglages, ses extensions, son programme. */
  _peins(/** @type {any} */ ctx, /** @type {any} */ c, /** @type {number} */ rang){
    const gl = ctx.gl, p = c.props;
    const prog = this.programmes.get(c.constructor.programme().nom);
    if (prog && prog.erreur && !ctx.chauffe) this._rate(new Error("programme refusé — " + prog.erreur));
    if (!prog || !prog.lie || prog.erreur) return false;
    // les extensions règlent ce que les shaders liront (`setShaderModuleProps`)
    for (const e of p.extensions || []) if (e && typeof e.draw === "function"){
      try { e.draw.call(c, { uniforms: {}, context: {} }, e); } catch (x) { /* une extension qui ne règle rien */ }
    }
    const r = p.parameters || {};
    gl.depthFunc(/** @type {any} */ (COMPARE)[r.depthCompare] || gl.LEQUAL);
    gl.depthMask(r.depthWriteEnabled === undefined ? true : Boolean(r.depthWriteEnabled));
    /* Un décalage de profondeur (`depthBias`, `depthBiasSlopeScale`, les noms
       de luma.gl) : ce qui se peint dans le plan même d'une autre surface —
       la teinte du survol sur les façades d'un volume — passe devant elle au
       lieu de s'y mêler en rayures. */
    if (r.depthBias || r.depthBiasSlopeScale){
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(r.depthBiasSlopeScale || 0, r.depthBias || 0);
    } else gl.disable(gl.POLYGON_OFFSET_FILL);
    if (!ctx.designe){
      const m = r.colorMask;
      if (Array.isArray(m)) gl.colorMask(Boolean(m[0]), Boolean(m[1]), Boolean(m[2]), Boolean(m[3]));
      else gl.colorMask(true, true, true, true);
    }
    gl.useProgram(prog.p);
    gl.uniformMatrix4fv(prog.u("u_vp"), false, ctx.vp);
    gl.uniformMatrix4fv(prog.u("u_modele"), false, p.modelMatrix ? new Float32Array(rapporte(p.modelMatrix, ctx.origine)) : IDENTITE);
    gl.uniform4fv(prog.u("u_recadre"), ctx.recadre || [0, 0, 1, 1]);
    gl.uniform2f(prog.u("u_ecran"), ctx.ecran[0], ctx.ecran[1]);
    gl.uniform1f(prog.u("u_echelle"), ctx.echelle);
    gl.uniform1f(prog.u("u_designe"), ctx.designe ? 1 : 0);
    gl.uniform1f(prog.u("u_couche"), rang);
    gl.uniform1f(prog.u("u_opacite"), p.opacity ?? 1);
    c.dessine(ctx, prog);
    return true;
  }

  _dessine(){
    if (this.finalise || !this.gl || this.perdu) return;
    const gl = this.gl;
    if (gl.isContextLost()){ this.perdu = true; return; }
    const t0 = performance.now();
    const { w, h, W, H, dpr } = this._taille();
    const vp = this._vue(w, h);
    const ctx = this._contexte(vp, w, h, dpr);
    // la chauffe, sur une image à elle, avant toute image qui se montre
    if (!this.chaud){ this._chauffe(ctx); this._planifie(); return; }
    if (this.sales) this._reconcilie(ctx);
    const couches = this._peintes(vp, false);
    // une image à moitié peinte ne se montre pas : elle attend ses programmes
    if (!this._prets(couches)){ this._planifie(); return; }
    const t1 = performance.now();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, W, H);
    gl.colorMask(true, true, true, true);
    gl.depthMask(true);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    let n = 0;
    for (const c of couches){
      try { if (this._peins(ctx, c, 0)) n++; }
      catch (e){ this._rate(new Error("la couche « " + c.id + " » n'a pas pu se peindre : " + (/** @type {any} */ (e).message || e))); }
    }
    gl.bindVertexArray(null);
    gl.colorMask(true, true, true, true);
    const t2 = performance.now();
    this._compte(t2 - t0, couches.length, n, t2 - t1);
    /* Ce qui a été peint suit avec l'image : une image où aucune couche n'a pu
       se peindre ne doit pas passer pour la première, qui retire le SVG. */
    if (this.props.onAfterRender) this.props.onAfterRender({ device: this.device, gl, peintes: n, couches: couches.length });
  }

  _comptesVides(){ return { images: 0, cpu: 0, dessin: 0, debut: performance.now(), attrMs: 0, couches: 0, designation: 0, designations: 0 }; }

  /* ----------------------------------------------------------
     La chauffe

     Sous Windows, le navigateur traduit chaque programme pour Direct3D
     (ANGLE), et une part de ce travail attend le premier dessin, qui seul dit
     sous quelle forme arrivent les sommets : la première image du plan le
     payait pour tous ses programmes à la fois — 405 ms sur un PC à carte
     graphique intégrée (relevé ?perf, FEP27, 12 novembre 2026). deck.gl avait
     sa chauffe pour cela (`webgl.mjs`, « La chauffe »).

     Ici, sitôt les programmes compilés, une couche de chaque sorte, d'un seul
     objet, aux mêmes formats d'attributs que les vraies, se dessine dans un
     seul pixel, couleur et profondeur masquées : rien ne se voit, et la
     traduction se paie sur une image à elle. La toile jetable que `webgl.mjs`
     prépare pendant que les données arrivent la fait aussi : le navigateur
     garde le travail, et la vraie toile le retrouve fait.
     ---------------------------------------------------------- */
  _chauffe(/** @type {any} */ ctx){
    const progs = [...this.programmes.values()];
    for (const p of progs) p.pret();
    if (progs.some(p => !p.lie) && performance.now() - this.debutProgrammes < ATTENTE_PROGRAMMES) return;
    const gl = /** @type {WebGL2RenderingContext} */ (this.gl), t0 = performance.now();
    this.chaud = true;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, 0, 1, 1);
    gl.enable(gl.DEPTH_TEST);
    ctx.chauffe = true;
    for (const c of couchesDeChauffe()){
      try { c.prepare(ctx, null); this._peins(ctx, c, 0); }
      catch (e) { /* une sorte qui ne chauffe pas : elle se traduira à son premier dessin, comme avant */ }
      finally { try { c.detruit(); } catch (e) { /* déjà défaite */ } }
    }
    gl.bindVertexArray(null);
    gl.disable(gl.SCISSOR_TEST);
    gl.colorMask(true, true, true, true);
    gl.depthMask(true);
    this.metrics.chauffeMs = Math.round(performance.now() - t0);
  }

  /** Les comptes de la sonde, tirés toutes les soixante images, comme deck.gl. */
  _compte(/** @type {number} */ cpu, /** @type {number} */ nCouches, /** @type {number} */ nPeintes, dessin = 0){
    const k = this._comptes;
    k.images++; k.cpu += cpu; k.dessin += dessin;
    // les images peintes depuis la création, comme le compteur de deck.gl que les essais lisent
    this._metricsCounter = (this._metricsCounter || 0) + 1;
    this.metrics.layersCount = nCouches; this.metrics.drawLayersCount = nPeintes;
    this.metrics.framesRedrawn++;
    if (k.images < 60) return;
    const duree = performance.now() - k.debut;
    this.metrics.fps = duree > 0 ? k.images / duree * 1000 : 0;
    this.metrics.cpuTimePerFrame = k.cpu / k.images;
    this.metrics.updateAttributesTime = k.attrMs;
    this.metrics.updateLayersCount = k.couches;
    this.metrics.attributesTimePerFrame = k.attrMs / k.images;
    this.metrics.drawTimePerFrame = k.dessin / k.images;
    this.metrics.pickTime = k.designation;
    this.metrics.pickCount = k.designations;
    if (this.props._onMetrics) this.props._onMetrics(this.metrics);
    this._comptes = this._comptesVides();
  }

  /* ----------------------------------------------------------
     La désignation

     Ce qui est sous le doigt : les couches désignables repeintes, chaque
     objet de la couleur qui dit son numéro et celui de sa couche, dans un
     tampon grand des seuls pixels autour du point. Le plus proche du point
     l'emporte, comme chez deck.gl.
     ---------------------------------------------------------- */
  /** Peint la fenêtre de désignation et pose la lecture de ses pixels. */
  _peintDesignation(/** @type {{ x: number, y: number, radius?: number }} */ o){
    if (this.finalise || !this.gl || this.perdu || !this.vue) return null;
    const gl = this.gl;
    const { w, h, dpr } = this._taille();
    const vp = this._vue(w, h);
    const ctx = this._contexte(vp, w, h, dpr);
    if (this.sales) this._reconcilie(ctx);
    const couches = this._peintes(vp, true).slice(0, 254);
    if (!couches.length) return null;
    const r = Math.max(0, Math.round(o.radius || 0)), cote = 2 * r + 1;
    const D = this._designation || (this._designation = new TamponDesignation(gl));
    D.taille(cote);
    /* La fenêtre de « cote » pixels CSS centrée sur le point devient tout
       l'espace de découpe : le reste de la scène tombe dehors. */
    const cx = (o.x / w) * 2 - 1, cy = 1 - (o.y / h) * 2;
    ctx.recadre = [cx, cy, w / cote, h / cote];
    ctx.designe = true;
    gl.bindFramebuffer(gl.FRAMEBUFFER, D.fbo);
    gl.viewport(0, 0, cote, cote);
    gl.colorMask(true, true, true, true);
    gl.depthMask(true);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    couches.forEach((c, i) => { try { this._peins(ctx, c, i + 1); } catch (e) { /* une couche de moins sous le doigt */ } });
    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // l'écran n'a pas changé, mais ce qui l'avait peint a pu bouger : qu'il se repeigne au besoin
    return { couches, cote, r, D };
  }

  /** Ce que les pixels lus disent : l'objet le plus proche du centre. */
  _lis(/** @type {any} */ passe, /** @type {Uint8Array} */ px){
    const { couches, cote, r } = passe;
    let mieux = null, d2 = Infinity;
    for (let y = 0; y < cote; y++) for (let x = 0; x < cote; x++){
      const k = (y * cote + x) * 4, rang = px[k + 3];
      if (!rang) continue;
      const d = (x - r) * (x - r) + (y - r) * (y - r);
      if (d > r * r || d >= d2) continue;
      const i = px[k] + px[k + 1] * 256 + px[k + 2] * 65536 - 1;
      const couche = couches[rang - 1];
      if (!couche || i < 0) continue;
      d2 = d; mieux = { layer: couche, index: i, object: objetDe(couche, i), picked: true };
    }
    return mieux;
  }

  /** Ce qui est sous le point, la réponse attendue de la carte graphique. */
  pickObject(/** @type {{ x: number, y: number, radius?: number }} */ o){
    const t0 = performance.now();
    const passe = this._peintDesignation(o);
    if (!passe) return null;
    const gl = /** @type {WebGL2RenderingContext} */ (this.gl), px = new Uint8Array(passe.cote * passe.cote * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, passe.D.fbo);
    gl.readPixels(0, 0, passe.cote, passe.cote, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // la relecture attend la carte graphique : elle compte dans la désignation
    this._comptes.designation += performance.now() - t0; this._comptes.designations++;
    return this._lis(passe, retourne(px, passe.cote));
  }

  /** La même question, la réponse lue sans que la page attende la carte graphique. */
  async pickObjectAsync(/** @type {{ x: number, y: number, radius?: number }} */ o){
    const t0 = performance.now();
    const passe = this._peintDesignation(o);
    this._comptes.designation += performance.now() - t0; this._comptes.designations++;
    if (!passe) return null;
    const gl = /** @type {WebGL2RenderingContext} */ (this.gl), n = passe.cote * passe.cote * 4;
    const pbo = /** @type {WebGLBuffer} */ (gl.createBuffer());
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, n, gl.STREAM_READ);
    gl.bindFramebuffer(gl.FRAMEBUFFER, passe.D.fbo);
    gl.readPixels(0, 0, passe.cote, passe.cote, gl.RGBA, gl.UNSIGNED_BYTE, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    const barriere = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    try {
      await new Promise((ok) => {
        const guette = () => {
          if (this.finalise || gl.isContextLost()){ ok(null); return; }
          /* L'état de la barrière, lu sans rien attendre — comme luma.gl. Sur
             un poste Windows, « clientWaitSync » même sans délai faisait
             attendre la page jusqu'à cent millisecondes à chaque survol
             (relevé ?perf, FEP27, 12 novembre 2026). */
          if (gl.getSyncParameter(/** @type {WebGLSync} */ (barriere), gl.SYNC_STATUS) !== gl.SIGNALED){ setTimeout(guette, 4); return; }
          ok(null);
        };
        guette();
      });
    } finally { if (!gl.isContextLost()) gl.deleteSync(barriere); }
    if (this.finalise || gl.isContextLost()) return null;
    const px = new Uint8Array(n);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
    gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, px);
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
    gl.deleteBuffer(pbo);
    return this._lis(passe, retourne(px, passe.cote));
  }
}

/** Les couches de la chauffe : une de chaque sorte, d'un seul objet, ses
 *  attributs remplis par des fonctions comme ceux des vraies couches — c'est
 *  leur format qui décide de la traduction —, et rien qui se voie. */
function couchesDeChauffe(){
  const muet = { parameters: { colorMask: [false, false, false, false], depthWriteEnabled: false } };
  const carre = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const rien = () => [0, 0, 0, 0], un = () => 1, zoom = () => [-100, 100, -100];
  const toile = document.createElement("canvas");
  toile.width = toile.height = 1;
  const tri = (/** @type {number[]} */ v) => ({ value: new Float32Array(v), size: v.length / 3 === 3 ? 3 : 2 });
  return [
    new SolidPolygonLayer({ id: "chauffe-aplat", data: [carre], getPolygon: (/** @type {any} */ d) => d, getFillColor: rien,
      getElevation: un, extruded: true, ...muet }),
    new PathLayer({ id: "chauffe-trait", data: [carre], getPath: (/** @type {any} */ d) => d, getColor: rien, getWidth: un,
      getDashArray: () => [0, 0], getZoomFiltre: zoom, widthUnits: "pixels", ...muet }),
    new TextLayer({ id: "chauffe-texte", data: [0], getText: () => "a", getPosition: () => [0, 0, 0], getColor: rien,
      getSize: un, getAngle: () => 0, getPixelOffset: () => [0, 0], getTextAnchor: () => "middle", getZoomFiltre: zoom,
      characterSet: "a", fontSettings: { fontSize: 24, buffer: 4 }, ...muet }),
    new BitmapLayer({ id: "chauffe-image", image: toile, bounds: [0, 0, 1, 1], ...muet }),
    new SimpleMeshLayer({ id: "chauffe-maillage", data: [0], getPosition: () => [0, 0, 0], getColor: rien,
      getCaseLogo: () => [0, 0, 1, 1], getFigurant: rien,
      mesh: { attributes: { positions: tri([0, 0, 0, 1, 0, 0, 0, 1, 0]), normals: tri([0, 0, 1, 0, 0, 1, 0, 0, 1]),
        texCoords: { value: new Float32Array([0, 0, 1, 0, 0, 1]), size: 2 } } }, ...muet }),
  ];
}

/** L'objet désigné : la donnée de la couche, comme deck.gl la rend. */
function objetDe(/** @type {any} */ c, /** @type {number} */ i){
  const d = c.props.data;
  return Array.isArray(d) ? d[i] : (typeof c.objetDesigne === "function" ? c.objetDesigne(i) : null);
}

/** Les lignes de pixels lues de bas en haut, remises dans le sens de l'écran. */
function retourne(/** @type {Uint8Array} */ px, /** @type {number} */ cote){
  const o = new Uint8Array(px.length), l = cote * 4;
  for (let y = 0; y < cote; y++) o.set(px.subarray(y * l, y * l + l), (cote - 1 - y) * l);
  return o;
}

/** Le petit tampon où se peint la désignation : couleurs et profondeur. */
class TamponDesignation {
  constructor(/** @type {WebGL2RenderingContext} */ gl){
    this.gl = gl;
    this.cote = 0;
    this.fbo = /** @type {WebGLFramebuffer} */ (gl.createFramebuffer());
    this.couleur = /** @type {WebGLRenderbuffer} */ (gl.createRenderbuffer());
    this.profondeur = /** @type {WebGLRenderbuffer} */ (gl.createRenderbuffer());
  }
  taille(/** @type {number} */ cote){
    if (cote === this.cote) return;
    const gl = this.gl;
    this.cote = cote;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.couleur);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA8, cote, cote);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.profondeur);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, cote, cote);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.couleur);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.profondeur);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }
  detruit(/** @type {WebGL2RenderingContext} */ gl){
    gl.deleteFramebuffer(this.fbo); gl.deleteRenderbuffer(this.couleur); gl.deleteRenderbuffer(this.profondeur);
  }
}

/** Ce que `webgl.mjs` emprunte au moteur, sous les noms de deck.gl. */
export const MOTEUR_GL = { Deck, OrthographicView, View, Viewport, LayerExtension, PathStyleExtension,
  LightingEffect, AmbientLight, DirectionalLight, SolidPolygonLayer, PathLayer, TextLayer, BitmapLayer, SimpleMeshLayer,
  nomExtension };
