/* ============================================================
   Ce qui vient d'ailleurs, relu avant d'être affiché

   Une adresse saisie à la main, le logo d'une société lu chez la source,
   celui d'une zone déposé par un exploitant, une description écrite dans
   l'éditeur : tout cela passe par la base, revient par l'API et finit dans la
   page de tous les visiteurs. Rien n'y est tenu pour sûr parce qu'il serait
   arrivé par le bon chemin — on ne garde que ce qu'on reconnaît.

   Les règles sont réunies ici pour se lire d'un trait, et s'éprouver sans le
   plan : aucune ne dépend de l'état de la page.
   ============================================================ */
import { esc } from "./texte.mjs";

/**
 * Une adresse en lien cliquable, affichée sans son protocole.
 *
 * Les champs de réseaux sociaux sont saisis à la main : tantôt une adresse
 * complète, tantôt un simple nom de compte. On complète ce qui manque plutôt
 * que d'afficher un lien mort.
 */
export function lien(v){
  const u = adresseWeb(v);
  if (!u) return "";
  return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' +
         esc(u.replace(/^https?:\/\//i, "").replace(/\/$/, "")) + '</a>';
}

/** Une adresse saisie à la main, ramenée à une adresse web complète. */
export function adresseWeb(v){
  const u = String(v == null ? "" : v).trim().replace(/\\/g, "");
  if (!u) return "";
  return /^https?:/i.test(u) ? u : "https://" + u.replace(/^\/+/, "");
}

/**
 * Une adresse dont on peut faire un lien.
 *
 * Tout ce qui n'est pas une page, un courriel ou un numéro est écarté :
 * « javascript: » et « data: » sont des adresses valides pour le navigateur,
 * et exécuteraient ce qu'on aurait posé dedans.
 */
export function adresseSure(v){
  const u = String(v == null ? "" : v).trim().replace(/[\u0000-\u001F]/g, "");
  if (!u) return "";
  if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
  // une adresse écrite sans protocole est une page web : c'est le cas courant
  if (/^[\w.-]+\.[a-z]{2,}(\/|$|\?|#)/i.test(u)) return "https://" + u.replace(/^\/+/, "");
  return "";
}

/* Ce qu'un logo de zone a le droit d'être : une image que la page a fabriquée
   elle-même, et rien d'autre.

   Le « svg » n'y figure pas, et c'est délibéré : il porte du script, que le
   navigateur exécute dès qu'on le pose autrement que dans une image. Le
   convertisseur n'en produit de toute façon jamais — il rend ce que la toile
   sait écrire, webp là où c'est possible, png partout. */
export const IMAGE_SURE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

/**
 * Le logo d'une société, relu avant d'être affiché.
 *
 * Celui-ci n'est pas déposé mais lu chez la source — l'avatar d'une fiche
 * Eventmaker — et c'est donc une adresse, quand celui d'une zone est une image
 * embarquée. La synchronisation applique déjà la règle ; la page ne s'en remet
 * pas à elle pour autant : « data: » et « javascript: » sont des adresses
 * valides, et cette fiche-là est posée chez tous les visiteurs.
 */
export function adresseImage(v){
  const u = String(v == null ? "" : v).trim().replace(/[\u0000-\u001F]/g, "");
  return /^https?:\/\//i.test(u) ? u : "";
}

/**
 * Le logo d'une zone, relu avant d'être affiché.
 *
 * Il suit le chemin de la description — saisi par un exploitant authentifié,
 * enregistré en base, renvoyé par l'API, posé dans la fiche de tous les
 * visiteurs — et mérite donc la même méfiance : ce n'est pas parce qu'il est
 * arrivé par l'éditeur qu'il en vient.
 */
export function imageSure(v){
  const u = String(v == null ? "" : v).trim();
  return IMAGE_SURE.test(u) ? u : "";
}

/* Ce qu'une description écrite dans l'éditeur a le droit de contenir, et sous
   quel nom elle le garde : de la mise en forme, rien d'autre. Les balises que
   les navigateurs produisent pour dire la même chose — « b », « i », « div » —
   sont ramenées à celle qu'on garde, pour n'avoir qu'un balisage à habiller. */
const RICHE_BALISES = { P: "p", DIV: "p", BR: "br", STRONG: "strong", B: "strong",
  EM: "em", I: "em", U: "u", UL: "ul", OL: "ol", LI: "li", A: "a" };
/* Celles dont le contenu part avec elles : le texte d'un script n'est pas du
   texte, et le déplier reviendrait à l'écrire dans la fiche. */
const RICHE_MUETTES = { SCRIPT: 1, STYLE: 1, IFRAME: 1, OBJECT: 1, EMBED: 1,
  TEMPLATE: 1, NOSCRIPT: 1, SVG: 1, MATH: 1, LINK: 1, META: 1, FORM: 1 };

/**
 * La description d'une zone, relue avant d'être affichée.
 *
 * Elle est écrite par un exploitant authentifié, dans un éditeur qui ne produit
 * que de la mise en forme — mais elle passe par la base, revient par l'API, et
 * finit dans la fiche de tous les visiteurs. Un balisage arrivé par un autre
 * chemin que l'éditeur ne doit pas s'y exécuter : on ne filtre donc pas ce
 * qu'on refuse, on ne garde que ce qu'on reconnaît.
 *
 * Une balise inconnue mais inoffensive — un titre, une police — laisse son
 * texte derrière elle : perdre la mise en forme vaut mieux que perdre la
 * phrase.
 */
export function assainitRiche(html){
  const brut = String(html == null ? "" : html);
  if (!brut) return "";
  const lu = new DOMParser().parseFromString("<body>" + brut + "</body>", "text/html").body;
  const sortie = document.createElement("div");
  const copie = (de, vers) => {
    de.childNodes.forEach(n => {
      if (n.nodeType === 3){ vers.appendChild(document.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1) return;
      /* `tagName` n'est en capitales que pour un élément HTML : un `<svg>` ou
         un `<math>` analysés dans un document HTML sont des éléments étrangers
         et gardent la casse d'écriture. Les deux entrées « SVG » et « MATH » de
         la table ne pouvaient donc jamais correspondre : ils tombaient dans la
         branche « inconnue : on la déplie », et leurs enfants avec — dans un
         sous-arbre SVG, `<script>` et `<style>` ont eux aussi un nom
         minuscule, et leur texte finissait affiché en clair. */
      const balise = n.tagName.toUpperCase();
      if (RICHE_MUETTES[balise]) return;
      const nom = RICHE_BALISES[balise];
      // inconnue : on la déplie, son contenu reste
      if (!nom){ copie(n, vers); return; }
      const e = document.createElement(nom);
      if (nom === "a"){
        const u = adresseSure(n.getAttribute("href"));
        // un lien sans adresse tenable n'est plus qu'un bout de phrase
        if (!u){ copie(n, vers); return; }
        e.setAttribute("href", u);
        e.setAttribute("target", "_blank");
        e.setAttribute("rel", "noopener");
      }
      copie(n, e);
      vers.appendChild(e);
    });
  };
  copie(lu, sortie);
  rangeRiche(sortie);
  return sortie.innerHTML;
}

/* Ce que le balisage doit être en sortie : des blocs au premier rang, du texte
   dedans. Un éditeur laisse rarement les choses ainsi — une liste mise en forme
   reste dans le paragraphe qui la portait, une première ligne n'en a jamais eu.
   Or « p » n'accepte pas de bloc : le navigateur qui relit la fiche referme
   alors le paragraphe devant la liste, et laisse un blanc là où on ne l'attend
   pas. Autant ranger ici, où l'on tient encore l'arbre. */
const BLOCS_RICHE = { P: 1, UL: 1, OL: 1 };

/** Une suite de nœuds rangée en blocs : chaque passage de texte prend un « p ». */
function enBlocs(noeuds){
  const frag = document.createDocumentFragment();
  let par = null;
  [...noeuds].forEach(n => {
    if (n.nodeType === 1 && BLOCS_RICHE[n.tagName]){ par = null; frag.appendChild(n); return; }
    // un blanc entre deux blocs n'ouvre pas un paragraphe pour lui seul
    if (!par && n.nodeType === 3 && !n.nodeValue.trim()) return;
    if (!par){ par = document.createElement("p"); frag.appendChild(par); }
    par.appendChild(n);
  });
  return frag;
}

function rangeRiche(hote){
  // les blocs glissés dans un paragraphe en sortent, avec ce qui les entoure
  for (let tour = 0; tour < 8; tour++){
    const dedans = [...hote.querySelectorAll("p")]
      .filter(e => [...e.children].some(c => BLOCS_RICHE[c.tagName]));
    if (!dedans.length) break;
    dedans.forEach(e => e.replaceWith(enBlocs(e.childNodes)));
  }
  // et ce qui traîne au premier rang sans paragraphe en prend un
  if ([...hote.childNodes].some(n => !(n.nodeType === 1 && BLOCS_RICHE[n.tagName])))
    hote.replaceChildren(enBlocs(hote.childNodes));
  /* Refermer un paragraphe devant une liste en sème un vide de part et
     d'autre : c'est la ponctuation du navigateur, pas une ligne blanche que
     quelqu'un aurait voulue — celle-là porte un « br ». */
  hote.querySelectorAll("p").forEach(e => {
    if (!e.textContent.trim() && !e.querySelector("br")) e.remove();
  });
}
