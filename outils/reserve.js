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
const { sansTexte } = require("./appels.js");

const DEBUT = /^\s*(?:\/\*|<!--)\s*@admin\b.*?(?:\*\/|-->)\s*$/;
const FIN = /^\s*(?:\/\*|<!--)\s*@fin-admin\s*(?:\*\/|-->)\s*$/;

/** Découpe le texte : `garde` dit si l'intérieur des tranches reste. */
function decoupe(texte, garde) {
  const sortie = [];
  let ouverte = 0;
  texte.split("\n").forEach((l, i) => {
    if (DEBUT.test(l)) {
      if (ouverte) throw new Error("tranche @admin ouverte l." + (i + 1) +
        " dans celle de la l." + ouverte + " : elles ne s'emboîtent pas");
      ouverte = i + 1;
      return;
    }
    if (FIN.test(l)) {
      if (!ouverte) throw new Error("@fin-admin l." + (i + 1) + " sans @admin");
      ouverte = 0;
      return;
    }
    if (!ouverte || garde) sortie.push(l);
  });
  if (ouverte) throw new Error("tranche @admin de la l." + ouverte + " jamais refermée");
  return sortie.join("\n");
}

const pourLAdmin = (texte) => decoupe(texte, true);
const pourLePublic = (texte) => decoupe(texte, false);

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
function cite(admin, publique) {
  const jsA = sansTexte(scripts(admin));
  const jsP = sansTexte(scripts(publique));
  const gardes = hautNiveau(jsP);
  const retires = [...hautNiveau(jsA)].filter((n) => !gardes.has(n));

  const optionnels = new Set();
  let m;
  const ro = /\btypeof\s+([A-Za-z_$][\w$]*)/g;
  while ((m = ro.exec(jsP))) optionnels.add(m[1]);

  const fautes = [];
  const lignes = jsP.split("\n");
  const cherche = new Set(retires.filter((n) => !optionnels.has(n)));
  lignes.forEach((l, i) => {
    const re = /(^|[^.\w$])([A-Za-z_$][\w$]*)/g;
    let x;
    while ((x = re.exec(l)))
      if (cherche.has(x[2])) fautes.push(x[2] + " (script, l." + (i + 1) + ")");
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
function verifie(admin, publique, nom) {
  const f = cite(admin, publique);
  if (f.length)
    throw new Error(nom + " cite ce qui ne lui est plus livré :\n  " +
      f.join("\n  ") + "\nÉlargissez la tranche @admin, ou sortez-en ce nom.");
}

module.exports = { pourLAdmin, pourLePublic, verifie, cite };
