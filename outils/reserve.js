/**
 * Ce que seule l'administration reçoit, dans le balisage.
 *
 * Le plan public et l'administration partagent leur balisage (`_head.html`),
 * et chacune recevait tout : la fenêtre des réglages, ses volets, la boîte à
 * outils partaient chez chaque visiteur, qui ne pouvait pas s'en servir. Le
 * JavaScript, lui, se partage par le point d'entrée (`plan-admin.mjs` reprend
 * `plan.mjs` et y ajoute ses modules) ; le balisage se partage par des
 * tranches, que la source borne elle-même :
 *
 *   <!-- @admin — pourquoi -->
 *   …ce que le visiteur ne reçoit pas…
 *   <!-- @fin-admin -->
 *
 * Chaque marqueur tient seul sur sa ligne. Les pages publiques perdent la
 * tranche entière ; l'administration ne perd que les deux lignes des
 * marqueurs, et reçoit donc à l'octet près ce qu'elle recevait avant qu'on les
 * pose — c'est ce qui rend le découpage sans risque pour l'exploitant.
 *
 * Retirer ne suffit pas : un élément retiré que le script public irait encore
 * chercher casse la page publique au moment où ce code-là s'exécute, pas
 * avant. Le contrôle qui suit le refuse à la construction.
 */
const DEBUT = /^\s*<!--\s*@admin\b.*?-->\s*$/;
const FIN = /^\s*<!--\s*@fin-admin\s*-->\s*$/;

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
 * Les éléments retirés de la page publique que son script cherche encore. Une
 * liste vide est la seule réponse acceptable ; la construction échoue sinon.
 * Le script public lit `$("id")` dans ses chaînes, qu'on relit donc dans le
 * texte brut.
 */
function cite(admin, publique) {
  const idsP = identifiants(publique);
  const idsRetires = [...identifiants(admin)].filter((n) => !idsP.has(n));
  const brut = scripts(publique);
  return idsRetires.filter((id) => {
    const echappe = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("(?:\\$|getElementById)\\(\\s*[\"']" + echappe + "[\"']\\s*\\)");
    return re.test(brut);
  }).map((id) => "#" + id);
}

/** Lève une erreur nommant ce que la page publique cite encore. */
function verifie(admin, publique, nom) {
  const f = cite(admin, publique);
  if (f.length)
    throw new Error(nom + " cite ce qui ne lui est plus livré :\n  " +
      f.join("\n  ") + "\nÉlargissez la tranche @admin, ou sortez-en cet élément.");
}

module.exports = { pourLAdmin, pourLePublic, verifie, cite };
