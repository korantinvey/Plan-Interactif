/* ============================================================
   Le parcours écrit dans un lien, et relu

   Du calcul seul : ni la page, ni le stockage, ni le salon. C'est ce qui
   permet de l'éprouver hors du navigateur (`outils/essais/parcours.js`) —
   un lien déjà photographié, déjà envoyé, doit se relire tel qu'il a été
   écrit, et l'aller-retour se mesure mieux qu'il ne se relit.

   La fenêtre de partage et l'accueil d'un parcours reçu s'en servent
   (`modules/partage.mjs`, `_partage.html`).
   ============================================================ */

/**
 * Le parcours voyage dans le fragment — ce qui suit le « # ». Deux raisons,
 * et la première décide : un fragment n'est pas envoyé au serveur. Ni le
 * Worker, ni Cloudflare, ni Supabase ne voient jamais passer la liste, et il
 * n'y a donc aucun journal à purger. La seconde est qu'un lien qui se suffit
 * à lui-même s'ouvre hors ligne : un salon déjà visité s'affiche sans réseau
 * (voir `_sw.js`), et le parcours arrive avec l'adresse.
 */
export const CLE_LIEN_PARCOURS = "parcours=";

/* Le format, en tête du fragment. Un lien envoyé la veille au soir doit
   s'ouvrir le lendemain matin : si le format change un jour, ce chiffre fera
   refuser proprement l'ancien plutôt que de l'ouvrir de travers. */
const FORMAT_PARTAGE = "2";

/**
 * Ce sont les identifiants qui voyagent, et non les rangs de la liste.
 *
 * Les rangs auraient tenu en deux caractères chacun — un code quatre fois plus
 * court. Mais ils ne veulent dire quelque chose que dans l'instantané qui les
 * a produits : une synchronisation Klipso entre l'envoi et la lecture décale
 * tout ce qui suit l'exposant ajouté, et l'autre visiteur reçoit alors une
 * liste plausible et fausse — le pire des deux mondes. L'identifiant, lui, ne
 * désigne jamais qu'une chose, et cesse simplement d'exister quand le stand
 * s'en va : `chargeParcours` sait déjà écarter ce que les données ne
 * connaissent plus.
 *
 * Le drapeau « u » fait lire l'identifiant signe par signe et non par moitié :
 * sans lui, un émoji, qui tient sur deux moitiés, était codé moitié par
 * moitié, et chacune, qui n'est pas un caractère, revenait en « � ». Pour tout
 * autre signe, le code écrit reste le même.
 */
const codeIdParcours = id => String(id).replace(/[^A-Za-z0-9_-]/gu, c =>
  Array.from(new TextEncoder().encode(c),
             o => "%" + o.toString(16).toUpperCase().padStart(2, "0")).join(""));

/**
 * Le fragment entier : le format, les stands, les conférences.
 *
 * En « &clé=valeur », la syntaxe d'une adresse ordinaire, et non plus séparé
 * par des tildes. La différence ne se voit pas dans le code, elle se voit dans
 * le téléphone d'en face : un lecteur de codes ne lit pas une adresse, il lit
 * du texte et décide ensuite si cela y ressemble. Les tildes le faisaient
 * hésiter — le lecteur d'Android proposait « Rechercher » et « Copier le
 * texte » là où il faut « Ouvrir » — quand « ?a=1&b=2 », que la moitié du web
 * emploie jusque dans ses fragments, ne laisse aucun doute.
 *
 * Une section vide ne s'écrit pas du tout : un parcours sans conférence finissait
 * sur un tilde solitaire, ce qui est exactement ce qu'une adresse n'a jamais.
 */
export const codeParcours = p => CLE_LIEN_PARCOURS + FORMAT_PARTAGE +
  (p.stands.length ? "&s=" + p.stands.map(codeIdParcours).join(".") : "") +
  (p.confs.length ? "&c=" + p.confs.map(codeIdParcours).join(".") : "");

/**
 * Un champ du fragment, tel qu'il y est écrit — et non décodé.
 *
 * C'est pourquoi `URLSearchParams` ne sert pas ici, alors que c'est l'outil
 * fait pour cela : il décode avant de rendre la valeur, si bien qu'un
 * identifiant portant un point échappé rendrait au séparateur un point qui
 * n'en était pas un. On découpe d'abord, on décode ensuite.
 */
const champParcours = (frag, nom) => {
  const m = new RegExp("(?:^|&)" + nom + "=([^&]*)").exec(frag);
  return m ? m[1] : null;
};

/** Et l'inverse, qui n'accorde sa confiance à rien : le fragment se tape à la
 *  main aussi bien qu'il se scanne. */
export function litCodeParcours(frag){
  const liste = t => (t || "").split(".").map(x => {
    try { return decodeURIComponent(x); } catch (e) { return ""; }
  }).filter(Boolean);
  const v = champParcours(frag, "parcours");
  if (v === null) return null;
  if (v === FORMAT_PARTAGE)
    return { stands: liste(champParcours(frag, "s")),
             confs:  liste(champParcours(frag, "c")) };
  /* Le premier format séparait ses trois parties par des tildes. Il n'aura vécu
     qu'un jour, mais un code déjà photographié, déjà envoyé, doit continuer de
     s'ouvrir : le relire coûte deux lignes, et c'est à cela que sert le chiffre
     de tête. */
  const m = /^1~([^~]*)~([^~]*)$/.exec(v);
  return m ? { stands: liste(m[1]), confs: liste(m[2]) } : null;
}
