/**
 * La vignette d'un logo d'exposant : recadrée, réduite, encodée une fois.
 *
 * Ce travail se faisait chez le visiteur, à l'ouverture de chaque fiche — voir
 * « recadreMarque » dans `outils/gabarit/_js.html`, qui reste le recours quand
 * la vignette manque. Il donne le même résultat pour tout le monde et n'a donc
 * rien à faire là-bas : la synchronisation le fait une fois, avec le temps
 * qu'il faut, et le visiteur ne reçoit plus que trois kilo-octets.
 *
 * Les codecs sont en WebAssembly (`@jsquash`), les seuls qui tournent dans une
 * fonction Deno sans dépendance native. Le premier logo d'un lot paie leur
 * mise en route — une seconde et demie ; les suivants, une centaine de
 * millisecondes chacun.
 */
import decodePng from "https://esm.sh/@jsquash/png@3.1.1/decode";
import decodeJpeg from "https://esm.sh/@jsquash/jpeg@1.6.0/decode";
import decodeWebp from "https://esm.sh/@jsquash/webp@1.5.0/decode";
import encodeWebp from "https://esm.sh/@jsquash/webp@1.5.0/encode";
import resize from "https://esm.sh/@jsquash/resize@2.1.0";

/* Six cents pixels sur le plus grand côté : la fiche accorde à la marque trois
   cents pixels sur soixante-douze, et un écran dense en demande le double. Au
   delà on paierait des pixels que personne ne regarde. */
const COTE = 600;
/* Soixante-dix-huit : au-dessus, un logo d'aplats ne gagne rien de visible et
   pèse un tiers de plus. */
const QUALITE = 78;
/* Ce qu'on accepte de télécharger. Un avatar tient dans quelques centaines de
   kilo-octets ; au-delà, ce n'est plus un logo, et la synchronisation n'a pas à
   s'y attarder. */
const POIDS_MAX = 8 * 1024 * 1024;

/** Ce qu'une image doit être pour qu'on essaie de la lire. */
const TYPES = /^image\/(png|jpeg|webp)$/i;

export interface Vignette {
  /** Le webp, en base64 : c'est sous cette forme qu'il voyage jusqu'à la base. */
  image: string;
  largeur: number;
  hauteur: number;
}

/** Les octets d'une vignette, tels que l'API publique les rend — un tampon,
 *  que la réponse prend pour corps sans le recopier. */
export function octetsDeVignette(base64: string): ArrayBuffer {
  const brut = atob(base64);
  const tampon = new ArrayBuffer(brut.length);
  const out = new Uint8Array(tampon);
  for (let i = 0; i < brut.length; i++) out[i] = brut.charCodeAt(i);
  return tampon;
}

/**
 * L'empreinte d'une adresse, qui nomme sa vignette.
 *
 * Elle sert aussi de version dans l'adresse publique : le contenu ne peut pas
 * changer sans que l'empreinte change, et tout ce qui la garde — le relais, le
 * navigateur, le service worker — peut la garder pour toujours.
 */
export async function cleDeVignette(source: string): Promise<string> {
  const octets = new TextEncoder().encode(source);
  const empreinte = await crypto.subtle.digest("SHA-256", octets);
  return [...new Uint8Array(empreinte).slice(0, 12)]
    .map((n) => n.toString(16).padStart(2, "0")).join("");
}

/**
 * Le cadre du dessin dans l'image, ou `null` quand il n'y a rien à retirer.
 *
 * Eventmaker range chaque logo dans le carré d'un avatar : un logo en largeur
 * n'y tient qu'une bande au milieu, et la place qu'on lui réserve allait au
 * carré entier. Le vide se reconnaît à la transparence, ou à la couleur unie
 * des quatre coins ; un fond qui change d'un coin à l'autre est une image
 * pleine, à laquelle on ne touche pas.
 *
 * C'est la règle que tenait la page, au pixel près — le recadrage ne doit pas
 * changer de résultat selon qu'il a lieu ici ou là-bas.
 */
function cadre(d: Uint8ClampedArray, w: number, h: number) {
  const px = (x: number, y: number) => (y * w + x) * 4;
  const coins = [px(0, 0), px(w - 1, 0), px(0, h - 1), px(w - 1, h - 1)];
  const transparent = d[coins[0] + 3] < 16;
  // l'écart toléré couvre le bruit d'un JPEG, pas un dégradé
  const ecart = (i: number, j: number) =>
    Math.abs(d[i] - d[j]) + Math.abs(d[i + 1] - d[j + 1]) + Math.abs(d[i + 2] - d[j + 2]);
  const fond = transparent
    ? (i: number) => d[i + 3] < 16
    : (i: number) => d[i + 3] >= 16 && ecart(i, coins[0]) < 48;
  if (!coins.every(fond)) return null;

  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (fond(px(x, y))) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;

  /* Un fond opaque garde un liseré : collé au dessin, il en faisait une
     étiquette découpée aux ciseaux. Un fond transparent n'a pas de bord à
     montrer. */
  let gx = x0, gy = y0, dx = x1 + 1, dy = y1 + 1;
  if (!transparent) {
    const marge = Math.round(0.12 * Math.min(dx - gx, dy - gy));
    gx = Math.max(0, gx - marge);
    gy = Math.max(0, gy - marge);
    dx = Math.min(w, dx + marge);
    dy = Math.min(h, dy + marge);
  }
  const cw = dx - gx, ch = dy - gy;
  // moins d'un dixième gagné sur chaque côté : la copie ne vaut pas sa peine
  if (cw > 0.9 * w && ch > 0.9 * h) return null;
  return { x: gx, y: gy, w: cw, h: ch };
}

/** L'image découpée à un cadre, sans passer par une toile. */
function decoupe(
  d: Uint8ClampedArray,
  w: number,
  b: { x: number; y: number; w: number; h: number },
): ImageData {
  const sortie = new Uint8ClampedArray(b.w * b.h * 4);
  for (let y = 0; y < b.h; y++) {
    const source = ((b.y + y) * w + b.x) * 4;
    sortie.set(d.subarray(source, source + b.w * 4), y * b.w * 4);
  }
  return { data: sortie, width: b.w, height: b.h, colorSpace: "srgb" } as unknown as ImageData;
}

/**
 * La vignette d'un logo, ou `null` quand la source ne rend rien d'utilisable.
 *
 * Aucune panne n'est une erreur : une source injoignable, un format qu'on ne
 * sait pas lire, une image vide laissent simplement le logo tel qu'il est, et
 * la page le chargera chez la source comme avant.
 */
export async function fabriqueVignette(source: string): Promise<Vignette | null> {
  let octets: ArrayBuffer;
  let type: string;
  try {
    const r = await fetch(source, { redirect: "follow" });
    if (!r.ok) return null;
    type = (r.headers.get("content-type") || "").split(";")[0].trim();
    if (!TYPES.test(type)) return null;
    const taille = Number(r.headers.get("content-length") || 0);
    if (taille > POIDS_MAX) return null;
    octets = await r.arrayBuffer();
    if (octets.byteLength > POIDS_MAX) return null;
  } catch {
    return null;
  }

  let im: ImageData;
  try {
    im = type.endsWith("png")
      ? await decodePng(octets)
      : type.endsWith("webp")
      ? await decodeWebp(octets)
      : await decodeJpeg(octets);
  } catch {
    return null;
  }
  if (!im || !im.width || !im.height) return null;

  /* Les pixels, tels que les codecs les rendent : quatre octets par point. Le
     type de `ImageData` s'est ouvert depuis à d'autres profondeurs, que ces
     décodeurs-là ne produisent pas. */
  const d = im.data as unknown as Uint8ClampedArray;
  const b = cadre(d, im.width, im.height);
  const utile = b ? decoupe(d, im.width, b) : im;

  const k = Math.min(1, COTE / Math.max(utile.width, utile.height));
  const petite = k < 1
    ? await resize(utile, {
      width: Math.max(1, Math.round(utile.width * k)),
      height: Math.max(1, Math.round(utile.height * k)),
    })
    : utile;

  try {
    const octets = new Uint8Array(await encodeWebp(petite, { quality: QUALITE }));
    /* Par tranches : « String.fromCharCode » reçoit ses octets en arguments, et
       une image entière en dépasserait la limite. */
    let brut = "";
    for (let i = 0; i < octets.length; i += 8192) {
      brut += String.fromCharCode(...octets.subarray(i, i + 8192));
    }
    return { image: btoa(brut), largeur: petite.width, hauteur: petite.height };
  } catch {
    return null;
  }
}
