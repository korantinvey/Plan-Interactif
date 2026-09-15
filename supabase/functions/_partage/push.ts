/**
 * Porter une notification jusqu'à un navigateur.
 *
 * Le web n'a pas de réveil. Une application d'alarme native confie l'instant à
 * l'ordonnanceur du système, qui la réveille ; une page n'a rien de tel — les
 * minuteries meurent avec l'onglet, le service de second plan est arrêté après
 * quelques secondes d'inactivité, et l'API qui aurait comblé ce manque
 * (*Notification Triggers*) n'a jamais quitté l'essai d'origine. Reste le Web
 * Push : le service de poussée du navigateur — Google, Apple, Mozilla, selon
 * l'appareil — sait réveiller une page fermée, mais il ne sait pas attendre.
 * Il relaie, il n'ordonnance pas. L'heure, c'est à nous de la tenir, et c'est
 * pourquoi ce module existe côté serveur.
 *
 * Deux choses à faire pour qu'un message parte, et aucune n'est facultative.
 *
 * **Se nommer** (RFC 8292). Le service de poussée n'accepte un message que
 * signé par celui qui a émis l'abonnement : un jeton ES256 portant l'origine
 * visée, une expiration courte et une adresse de contact. Apple est le plus
 * strict des trois — un `sub` qui n'est pas un `mailto:` ou un `https:`, une
 * expiration au-delà de vingt-quatre heures, et c'est un 403 sans explication.
 *
 * **Chiffrer** (RFC 8291). Le service de poussée ne doit pas pouvoir lire ce
 * qu'il transporte, et le protocole ne lui en laisse pas le choix : la charge
 * est chiffrée pour le seul navigateur destinataire, avec un secret dérivé de
 * sa clé publique et du secret d'authentification qu'il a tirés lui-même. Nous
 * ne détenons ni l'un ni l'autre : ils viennent de l'abonnement, et le message
 * ne se déchiffre nulle part ailleurs que sur l'appareil.
 *
 * Écrit à la main plutôt que tiré d'une bibliothèque : `web-push` est fait pour
 * Node et son module `crypto`, et ce qu'il faut ici tient en quatre dérivations
 * que WebCrypto sait faire seul. Une dépendance de moins à suivre dans une
 * fonction qui tourne à la minute.
 */

/**
 * Des octets que WebCrypto accepte.
 *
 * Le paramètre se dit en toutes lettres parce que `Uint8Array` nu désigne
 * depuis TypeScript 5.7 un tableau qui peut être adossé à de la mémoire
 * partagée — que `BufferSource` refuse. Tout ce qui passe ici vient d'un
 * `ArrayBuffer` ordinaire ; l'écrire évite au contrôle de typage de devoir le
 * deviner, et au déploiement de s'arrêter dessus.
 */
type Octets = Uint8Array<ArrayBuffer>;

/* ------------------------------------------------------------------
   Base64url — la monnaie du protocole, sans remplissage
   ------------------------------------------------------------------ */
export function octets(b64: string): Octets {
  const net = b64.replace(/-/g, "+").replace(/_/g, "/");
  const brut = atob(net + "=".repeat((4 - (net.length % 4)) % 4));
  const sortie = new Uint8Array(brut.length);
  for (let i = 0; i < brut.length; i++) sortie[i] = brut.charCodeAt(i);
  return sortie;
}

export function base64url(o: Uint8Array): string {
  let brut = "";
  for (let i = 0; i < o.length; i++) brut += String.fromCharCode(o[i]);
  return btoa(brut).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function colle(...morceaux: Uint8Array[]): Octets {
  const total = morceaux.reduce((n, m) => n + m.length, 0);
  const sortie = new Uint8Array(total);
  let i = 0;
  for (const m of morceaux) { sortie.set(m, i); i += m.length; }
  return sortie;
}

const texte = (s: string) => new TextEncoder().encode(s);

/* ------------------------------------------------------------------
   Le jeton VAPID
   ------------------------------------------------------------------ */
/**
 * La clé privée arrive sous sa forme brute — trente-deux octets, le scalaire
 * et rien d'autre, tel que le produit `npx web-push generate-vapid-keys`.
 * WebCrypto ne sait pas l'importer ainsi : il lui faut une clé complète, donc
 * les coordonnées du point public, qui sont précisément les soixante-quatre
 * octets qui suivent le préfixe de la clé publique.
 */
async function cleDeSignature(publique: Octets, privee: Octets) {
  return await crypto.subtle.importKey(
    "jwk",
    {
      kty: "EC",
      crv: "P-256",
      x: base64url(publique.slice(1, 33)),
      y: base64url(publique.slice(33, 65)),
      d: base64url(privee),
      ext: false,
    },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

/**
 * Douze heures de validité. La limite d'Apple est de vingt-quatre ; rester à
 * la moitié laisse de la marge à une horloge qui dérive, dans un sens comme
 * dans l'autre, sans qu'un jeton traîne pour autant.
 */
async function jetonVapid(origine: string, sujet: string, publique: Octets, privee: Octets) {
  const tete = base64url(texte(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const corps = base64url(texte(JSON.stringify({
    aud: origine,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: sujet,
  })));
  const signe = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    await cleDeSignature(publique, privee),
    texte(tete + "." + corps),
  );
  /* WebCrypto rend déjà la signature en `r || s` bruts, qui est la forme
     attendue par JOSE — pas le DER qu'on aurait à défaire. */
  return tete + "." + corps + "." + base64url(new Uint8Array(signe));
}

/* ------------------------------------------------------------------
   Le chiffrement de la charge
   ------------------------------------------------------------------ */
const INFO_CLE = texte("WebPush: info\0");
const INFO_CONTENU = texte("Content-Encoding: aes128gcm\0");
const INFO_JETABLE = texte("Content-Encoding: nonce\0");

/** `HKDF(sel, matière, info)` en un appel : WebCrypto enchaîne extraction et
 *  expansion, ce qui est exactement la suite que décrit la RFC. */
async function derive(sel: Octets, matiere: Octets, info: Octets, n: number): Promise<Octets> {
  const k = await crypto.subtle.importKey("raw", matiere, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: sel, info }, k, n * 8));
}

/**
 * Le corps du message, tel que le navigateur le redemandera.
 *
 * Une paire éphémère par envoi : sa moitié publique voyage en clair dans
 * l'en-tête du contenu, et c'est elle qui permet au destinataire de refaire le
 * même secret partagé de son côté. En changer à chaque fois est ce qui fait
 * que deux notifications au même appareil ne partagent aucune clé.
 */
async function chiffre(charge: Octets, p256dh: Octets, auth: Octets): Promise<Octets> {
  const paire = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]) as CryptoKeyPair;
  const noteur = new Uint8Array(await crypto.subtle.exportKey("raw", paire.publicKey));
  const destinataire = await crypto.subtle.importKey(
    "raw", p256dh, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const partage = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "ECDH", public: destinataire }, paire.privateKey, 256));

  /* Le secret d'authentification sert de sel à la première dérivation : c'est
     lui qui lie la clé au navigateur, et non au seul échange de clés. */
  const matiere = await derive(auth, partage, colle(INFO_CLE, p256dh, noteur), 32);
  const sel = crypto.getRandomValues(new Uint8Array(16));
  const cle = await derive(sel, matiere, INFO_CONTENU, 16);
  const jetable = await derive(sel, matiere, INFO_JETABLE, 12);

  /* `0x02` clôt le dernier — et ici le seul — enregistrement. Un `0x01` dirait
     qu'un autre suit, et le destinataire attendrait ce qui ne viendra pas. */
  const scelle = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: jetable },
    await crypto.subtle.importKey("raw", cle, "AES-GCM", false, ["encrypt"]),
    colle(charge, new Uint8Array([2])),
  ));

  const entete = new Uint8Array(21);
  entete.set(sel, 0);
  new DataView(entete.buffer).setUint32(16, 4096);   // taille d'enregistrement
  entete[20] = noteur.length;
  return colle(entete, noteur, scelle);
}

/* ------------------------------------------------------------------
   L'envoi
   ------------------------------------------------------------------ */
export type Abonnement = { endpoint: string; p256dh: string; auth: string };

export type Cles = { publique: string; privee: string; sujet: string };

export type Issue = { parti: boolean; statut: number; perime: boolean };

/**
 * Poster un message, et dire ce qu'il en advient.
 *
 * `vie` est ce qui sépare un rappel d'une nuisance. Le service de poussée garde
 * un message tant qu'il ne trouve pas l'appareil, et le remet ensuite : sans
 * borne, un téléphone rallumé deux heures plus tard reçoit « votre conférence
 * commence dans un quart d'heure » alors qu'elle est finie. On la cale sur le
 * délai du rappel lui-même — passé ce point, mieux vaut que le message soit
 * jeté que délivré.
 *
 * `perime` distingue le seul échec qui appelle une écriture : 404 et 410 disent
 * que l'abonnement n'existe plus — l'application désinstallée, les données du
 * site effacées, l'icône retirée de l'écran d'accueil. Ces rangs-là se
 * suppriment, sans quoi la base garderait pour toujours des adresses mortes
 * qu'on retenterait à chaque minute.
 */
export async function pousse(
  abonnement: Abonnement,
  charge: string,
  cles: Cles,
  vie: number,
): Promise<Issue> {
  const origine = new URL(abonnement.endpoint).origin;
  const publique = octets(cles.publique);
  const corps = await chiffre(
    texte(charge), octets(abonnement.p256dh), octets(abonnement.auth));
  const jeton = await jetonVapid(origine, cles.sujet, publique, octets(cles.privee));

  const r = await fetch(abonnement.endpoint, {
    method: "POST",
    headers: {
      "Authorization": "vapid t=" + jeton + ", k=" + base64url(publique),
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      "TTL": String(Math.max(0, Math.round(vie))),
      /* Un rappel horaire réveille l'appareil ; c'est ce que cette mention
         demande, et le seul niveau d'urgence qui ait ici un sens. Le web ne
         dispose pas de l'échappement aux modes de concentration qu'une
         application native peut réclamer — celui-là ne se rattrape pas. */
      "Urgency": "high",
    },
    body: corps,
  });
  return { parti: r.ok, statut: r.status, perime: r.status === 404 || r.status === 410 };
}
