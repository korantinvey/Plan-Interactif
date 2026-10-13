/* ============================================================
   L'encodeur AVIF des vignettes de logos — console seulement

   Aucun navigateur ne sait écrire de l'AVIF depuis une toile : Chrome répond
   en PNG sans rien dire. L'encodeur est donc celui de libavif, compilé en
   WebAssembly et rapatrié par `npm run avif` dans `web/bibliotheques/`.

   Pourquoi s'en donner la peine : sur les logos de FUNEXPO 2026, l'AVIF pèse
   moitié moins que le WebP pour les petites vignettes, et trois fois moins
   pour les grandes, sans écart visible. Le lot des petites part chez chaque
   visiteur au démarrage — 5,4 Mo compressés pour Franchise Expo.

   Seule la console l'importe (`synchronisation.mjs`), et ne le charge qu'au
   moment de préparer des logos : trois mégaoctets et demi que ni le visiteur
   ni l'exploitant qui ne synchronise pas n'ont à recevoir. S'il ne se charge
   pas, les vignettes se font en WebP, comme avant.
   ============================================================ */

/* Les noms portent l'empreinte du contenu, et la demande la vérifie : ce
   dossier se garde un an sans revalider. À refaire par `npm run avif`. */
const ENCODEUR_AVIF = {
  script: "bibliotheques/avif-enc-2.1.1-c8038560.min.js",
  integriteScript: "sha384-m6PvbVs5FjU1uxFFchw7NMUdQFGpHp/XltC16fp2OgiMIf7OFLoKCETabBC8JXuZ",
  wasm: "bibliotheques/avif-enc-2.1.1-d9f2a951.wasm",
  integriteWasm: "sha384-05Hrg6MAEOyGEl+DBp138l7mH4bs/srHNfuLKY1bXS0R9WI/amgsW509B8FkaZWr",
};

/* La qualité éprouvée sur les logos de FUNEXPO : à 50, aucun écart visible
   avec le WebP d'avant, même sur un fond texturé. La vitesse 6 est trois fois
   plus lente que la 8, mais ses vignettes pèsent un cinquième de moins — et
   c'est chaque visiteur qui les reçoit, quand l'encodage ne se fait qu'une
   fois par salon. Sept dixièmes de seconde par logo, petite et grande. */
const OPTIONS = { quality: 50, speed: 6 };

/** @type {Promise<any> | null} */
let pret = null;

/** Le script de l'encodeur, posé dans la page ; il s'inscrit sur l'objet
 *  global, comme le fait deck.gl. */
const script = () => new Promise((fin, echec) => {
  const s = document.createElement("script");
  s.src = ENCODEUR_AVIF.script;
  s.integrity = ENCODEUR_AVIF.integriteScript;
  s.crossOrigin = "anonymous";
  s.onload = fin;
  s.onerror = () => echec(new Error("encodeur AVIF indisponible"));
  document.head.appendChild(s);
});

/**
 * L'encodeur, prêt à servir — ou `null` s'il ne peut pas l'être : réseau,
 * empreinte qui ne concorde plus, navigateur sans WebAssembly. Demandé une
 * fois ; les appels suivants reçoivent la même réponse.
 */
export function encodeurAvif(){
  if (!pret) pret = (async () => {
    try {
      const [, octets] = await Promise.all([
        script(),
        fetch(ENCODEUR_AVIF.wasm, { integrity: ENCODEUR_AVIF.integriteWasm })
          .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.arrayBuffer(); }),
      ]);
      const enc = /** @type {any} */ (globalThis).encodeurAvif;
      await enc.prepare(await WebAssembly.compile(octets));
      return enc;
    } catch (e) {
      console.warn("Vignettes : encodeur AVIF indisponible, elles se feront en WebP.", e);
      return null;
    }
  })();
  return pret;
}

/**
 * Une toile en AVIF, en base64 — ou `null` quand l'encodeur n'a pas su : la
 * vignette se fait alors en WebP, et n'est pas perdue pour autant.
 */
export function avif64(enc, /** @type {HTMLCanvasElement} */ toile){
  try {
    const ctx = toile.getContext("2d");
    if (!ctx) return null;
    const image = ctx.getImageData(0, 0, toile.width, toile.height);
    const octets = enc.encode(image, OPTIONS);
    /* Par tranches : « String.fromCharCode » reçoit ses octets en arguments,
       et une image entière en dépasserait la limite. */
    let brut = "";
    for (let i = 0; i < octets.length; i += 8192){
      brut += String.fromCharCode.apply(null, octets.subarray(i, i + 8192));
    }
    return btoa(brut);
  } catch (e) {
    return null;
  }
}
