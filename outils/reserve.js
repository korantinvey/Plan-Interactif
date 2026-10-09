/**
 * Ce que seule l'administration reçoit.
 *
 * Les modules du plan servent trois pages — le plan public, sa démonstration
 * figée et l'administration — et chacune recevait tout : la fenêtre des
 * réglages, ses aperçus, ses volets partaient chez chaque visiteur, qui ne
 * pouvait pas s'en servir. Du poids pour rien, et toute la surface
 * d'administration offerte à la lecture.
 *
 * Le code d'administration n'a pas de module à lui : il est tissé dans ceux du
 * plan, le volet d'un réglage voisinant la fonction publique qu'il règle. On ne
 * peut donc pas retirer des fichiers ; on retire des tranches, que la source
 * borne elle-même :
 *
 *   /* @admin — pourquoi *\/          ou   <!-- @admin — pourquoi -->
 *   …ce que le visiteur ne reçoit pas…
 *   /* @fin-admin *\/                     <!-- @fin-admin -->
 *
 * Chaque marqueur tient seul sur sa ligne. Les pages publiques perdent la
 * tranche entière ; l'administration ne perd que les deux lignes des
 * marqueurs, et reçoit donc à l'octet près ce qu'elle recevait avant qu'on les
 * pose — c'est ce qui rend le découpage sans risque pour l'exploitant.
 *
 * Retirer ne suffit pas : un nom déclaré dans une tranche et cité hors d'elle
 * casse la page publique au moment où ce code-là s'exécute, pas avant. Le
 * contrôle qui suit le refuse à la construction, comme un élément retiré du
 * balisage que le script public irait encore chercher.
 */
const { sansTexte, declares } = require("./appels.js");

const DEBUT = /^\s*(?:\/\*|<!--)\s*@admin\b.*?(?:\*\/|-->)\s*$/;
const FIN = /^\s*(?:\/\*|<!--)\s*@fin-admin\s*(?:\*\/|-->)\s*$/;

/* Une tranche de script doit se suffire : autant d'accolades, de parenthèses
   et de crochets ouverts que fermés. Une borne posée une ligne trop bas
   emporte l'accolade qui ferme la fonction d'à côté, et la page publique ne
   s'analyse plus — l'analyseur le dit alors à la ligne 26 994 d'un fichier
   temporaire ; ici, on nomme la tranche. Le balisage n'est pas compté : sa
   prose a des parenthèses qui ne s'apparient pas. */
function equilibre(lignes, debut) {
  if (/^\s*<!--/.test(lignes[0] || "")) return;
  const t = sansTexte(lignes.slice(1).join("\n"));
  const n = (re) => (t.match(re) || []).length;
  const ecarts = [["{", "}"], ["(", ")"], ["[", "]"]]
    .map(([o, f]) => [o + f, n(new RegExp("\\" + o, "g")) - n(new RegExp("\\" + f, "g"))])
    .filter(([, d]) => d);
  if (ecarts.length)
    throw new Error("tranche @admin de la l." + debut + " déséquilibrée (" +
      ecarts.map(([p, d]) => p + " " + (d > 0 ? "+" : "") + d).join(", ") +
      ") : une borne coupe un bloc en deux");
}

/** Découpe le texte : `garde` dit si l'intérieur des tranches reste. */
function decoupe(texte, garde, enBlanc = false) {
  const sortie = [];
  let ouverte = 0;
  let tranche = [];
  texte.split("\n").forEach((l, i) => {
    if (ouverte && !FIN.test(l)) tranche.push(l);
    if (DEBUT.test(l)) {
      if (ouverte) throw new Error("tranche @admin ouverte l." + (i + 1) +
        " dans celle de la l." + ouverte + " : elles ne s'emboîtent pas");
      ouverte = i + 1;
      tranche = [l];
      if (enBlanc) sortie.push("");
      return;
    }
    if (FIN.test(l)) {
      if (!ouverte) throw new Error("@fin-admin l." + (i + 1) + " sans @admin");
      equilibre(tranche, ouverte);
      ouverte = 0;
      if (enBlanc) sortie.push("");
      return;
    }
    if (!ouverte || garde) sortie.push(l);
    else if (enBlanc) sortie.push("");
  });
  if (ouverte) throw new Error("tranche @admin de la l." + ouverte + " jamais refermée");
  return sortie.join("\n");
}

const pourLAdmin = (texte) => decoupe(texte, true);
const pourLePublic = (texte) => decoupe(texte, false);
/* La même découpe, chaque ligne retirée laissée en blanc : la relecture et
   les types relisent ainsi la page publique telle qu'elle est livrée, et une
   remarque y garde le numéro de ligne de sa source. */
const pourLePublicEnBlanc = (texte) => decoupe(texte, false, true);

/* Le JavaScript d'une page, ses scripts mis bout à bout. Ceux qui viennent
   d'un fichier ou portent des données n'en font pas partie. */
function scripts(html) {
  const l = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    if (/\bsrc=/.test(m[1]) || /application\/json/.test(m[1])) continue;
    l.push(m[2]);
  }
  return l.join("\n;\n");
}

/* Ce qu'un module déclare pour tous : les modules sont écrits au premier
   niveau sans retrait, et c'est ce qui les distingue d'une variable locale. */
function hautNiveau(js) {
  const d = new Set();
  const re = /^(?:async\s+)?(?:function\s*\*?\s*|class\s+|(?:const|let|var)\s+)([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = re.exec(js))) d.add(m[1]);
  return d;
}

/* Le balisage hors des scripts et des styles : c'est là que vivent les `id`. */
const balisage = (html) =>
  html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, "");
function identifiants(html) {
  const d = new Set();
  const re = /\bid="([^"]+)"/g;
  let m;
  while ((m = re.exec(balisage(html)))) d.add(m[1]);
  return d;
}

/**
 * Ce que la page publique cite encore de ce qu'on lui a retiré. Une liste
 * vide est la seule réponse acceptable ; la construction échoue sinon.
 *
 * Un nom gardé par `typeof nom` est voulu : c'est l'idiome du dépôt pour
 * s'adresser à un module qu'une page peut ne pas avoir.
 */
/**
 * Les noms que l'administration a et que la page publique n'a pas : déclarés
 * au premier niveau d'une tranche, ou — `enPlus` — exposés par les seuls
 * modules de l'administration. Les deux textes sont du JavaScript.
 */
function retiresDe(jsA, jsP, enPlus = []) {
  const gardes = hautNiveau(jsP);
  return [...new Set([...hautNiveau(jsA), ...enPlus])].filter((n) => !gardes.has(n));
}

function cite(admin, publique, enPlus = []) {
  const jsA = sansTexte(scripts(admin));
  const jsP = sansTexte(scripts(publique));
  const retires = retiresDe(jsA, jsP, enPlus);

  const optionnels = new Set();
  let m;
  const ro = /\btypeof\s+([A-Za-z_$][\w$]*)/g;
  while ((m = ro.exec(jsP))) optionnels.add(m[1]);

  /* Un nom que la page publique redéclare ailleurs, à n'importe quelle
     profondeur, y est présumé local : `boite` ou `geste` ne désignent pas
     partout la fonction de l'éditeur. C'est l'indulgence d'`appels.js`, pour
     la même raison — un contrôle qui crie à tort finit débranché. */
  const locaux = declares(jsP);
  const fautes = [];
  const lignes = jsP.split("\n");
  const cherche = new Set(retires.filter((n) => !optionnels.has(n) && !locaux.has(n)));
  lignes.forEach((l, i) => {
    const re = /(^|[^.\w$])([A-Za-z_$][\w$]*)/g;
    let x;
    while ((x = re.exec(l))) {
      if (!cherche.has(x[2])) continue;
      /* `{ aide: "…" }` nomme une clé, pas la fonction : on le reconnaît au
         deux-points qui suit et à l'accolade ou la virgule qui précède. */
      const apres = l.slice(x.index + x[0].length).match(/^\s*(\S)/);
      const avant = l.slice(0, x.index + x[1].length).match(/(\S)\s*$/);
      if (apres && apres[1] === ":" && (!avant || /[{,]/.test(avant[1]))) continue;
      fautes.push(x[2] + " (script, l." + (i + 1) + ")");
    }
  });

  /* Les éléments : le script public lit `$("id")` dans ses chaînes, qu'on
     relit donc dans le texte brut. */
  const idsP = identifiants(publique);
  const idsRetires = [...identifiants(admin)].filter((n) => !idsP.has(n));
  const brut = scripts(publique);
  idsRetires.forEach((id) => {
    const echappe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("(?:\\$|getElementById)\\(\\s*[\"']" + echappe + "[\"']\\s*\\)");
    if (re.test(brut)) fautes.push("#" + id + " (élément)");
  });
  return [...new Set(fautes)];
}

/** Lève une erreur nommant ce que la page publique cite encore. */
function verifie(admin, publique, nom, enPlus) {
  const f = cite(admin, publique, enPlus);
  if (f.length)
    throw new Error(nom + " cite ce qui ne lui est plus livré :\n  " +
      f.join("\n  ") + "\nÉlargissez la tranche @admin, ou sortez-en ce nom.");
}

module.exports = { pourLAdmin, pourLePublic, pourLePublicEnBlanc, verifie, cite, retiresDe };
