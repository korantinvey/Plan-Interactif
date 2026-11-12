/**
 * Règle ESLint : du HTML ne s'écrit dans la page que fait de morceaux sûrs.
 *
 * Les pages bâtissent leur balisage en texte — `innerHTML`, `outerHTML`,
 * `insertAdjacentHTML` — et l'échappent à la main (`modules/texte.mjs` `esc`).
 * Ce qui s'y interpole vient pour beaucoup d'ailleurs : le nom d'un exposant,
 * sa description, une adresse saisie dans Klipso. Un seul oubli d'échappement,
 * et un exposant qui s'appellerait `<img src=x onerror=…>` ferait exécuter son
 * script chez chaque visiteur du salon. Un cadriciel échappe par défaut ; ici,
 * c'est cette règle qui tient ce rôle.
 *
 * Est sûr, et seulement cela :
 *   — un texte écrit dans le code, un nombre, un booléen ;
 *   — un appel à ce qui échappe ou relit (`esc`, et `modules/sur.mjs` `lien`,
 *     `assainitRiche`), ou à ce qui ne rend qu'un nombre (`Math.round`,
 *     `toFixed`, `Number`…) ;
 *   — un gabarit, une concaténation, une alternative (`a ? b : c`, `a || b`),
 *     un tableau joint ou un `.map(…).join(…)`, dont chaque morceau est sûr ;
 *   — une variable du module dont chaque valeur écrite est sûre, et une
 *     fonction du module dont chaque `return` est sûr.
 *
 * Le reste — un paramètre, ce qu'un autre module rend, une propriété d'objet —
 * n'est pas prouvé, et la règle le signale. Elle ne dit pas qu'il y a une
 * faille : elle dit qu'elle ne peut pas prouver qu'il n'y en a pas. Ce qu'elle
 * relevait le jour de son arrivée est inscrit dans `html-acceptes.json` et se
 * résorbe module par module (`outils/controles/html.js`).
 */

/* Ce qui rend du texte sans balise, ou du balisage déjà relu. */
const ECHAPPENT = new Set(["esc", "lien", "assainitRiche"]);
/* Ce qui ne rend qu'un nombre, ou sa forme écrite. */
const NUMERIQUES = new Set(["Number", "parseInt", "parseFloat", "String"]);
const METHODES_NUMERIQUES = new Set(["toFixed", "toPrecision", "round", "floor", "ceil", "abs", "min", "max", "trunc"]);
/* Ce qui garde la sûreté de la chaîne qu'on lui confie. */
const METHODES_NEUTRES = new Set(["trim", "toUpperCase", "toLowerCase", "padStart", "padEnd", "repeat", "slice", "toString"]);

const OPERATEURS_NUMERIQUES = new Set(["-", "*", "/", "%", "**", "|", "&", "^", "<<", ">>", ">>>",
  "<", ">", "<=", ">=", "==", "!=", "===", "!==", "in", "instanceof"]);

/** @type {import("eslint").Rule.RuleModule} */
const regle = {
  meta: {
    type: "problem",
    docs: { description: "Le HTML écrit dans la page n'est fait que de morceaux échappés ou sûrs." },
    schema: [],
    messages: {
      nonProuve: "« {{morceau}} » entre dans du HTML sans être prouvé sûr : passez-le par `esc()`, " +
        "ou bâtissez le nœud par `textContent`.",
    },
  },
  create(context) {
    const source = context.sourceCode;
    /* Une fonction ou une variable déjà jugée ; `null` pendant qu'on la juge,
       pour qu'une récursion ne tourne pas en rond (elle compte alors comme sûre :
       ses autres chemins décident). */
    const memo = new Map();

    const texte = (n) => {
      const t = source.getText(n).replace(/\s+/g, " ");
      return t.length > 60 ? t.slice(0, 57) + "…" : t;
    };

    /** La variable que nomme un identifiant, dans la portée où il paraît. */
    function variableDe(id) {
      let portee = source.getScope(id);
      while (portee) {
        const v = portee.set.get(id.name);
        if (v) return v;
        portee = portee.upper;
      }
      return null;
    }

    /** Les expressions qu'une fonction rend. `null` si elle en rend une qu'on ne voit pas. */
    function retoursDe(fn) {
      if (fn.type === "ArrowFunctionExpression" && fn.expression) return [fn.body];
      const retours = [];
      const parcours = (n) => {
        if (!n || typeof n.type !== "string") return;
        if (n !== fn && /Function/.test(n.type)) return;  // ses fonctions internes rendent pour elles
        if (n.type === "ReturnStatement") retours.push(n.argument);
        for (const cle of Object.keys(n)) {
          if (cle === "parent") continue;
          const v = n[cle];
          if (Array.isArray(v)) v.forEach(parcours);
          else if (v && typeof v.type === "string") parcours(v);
        }
      };
      parcours(fn.body);
      return retours;
    }

    function fonctionSure(fn) {
      if (memo.has(fn)) return memo.get(fn) !== false;
      memo.set(fn, null);
      const r = retoursDe(fn).every((e) => !e || estSur(e).sur);
      memo.set(fn, r);
      return r;
    }

    /** Une variable est sûre si rien de ce qu'on y écrit ne l'est pas. */
    function variableSure(v) {
      if (memo.has(v)) return memo.get(v) !== false;
      memo.set(v, null);
      let r = v.defs.length > 0;
      for (const def of v.defs) {
        if (def.type === "Parameter" || def.type === "ImportBinding" || def.type === "CatchClause") r = false;
        else if (def.type === "FunctionName") r = r && fonctionSure(def.node);
        else if (def.type === "Variable") {
          const init = def.node.init;
          if (init && /Function/.test(init.type)) r = r && fonctionSure(init);
          else if (init) r = r && estSur(init).sur;
          // une déclaration nue n'écrit rien : ce sont ses affectations qui comptent
        } else r = false;
        if (!r) break;
      }
      if (r) {
        for (const ref of v.references) {
          if (ref.isWrite() && ref.writeExpr && !(ref.init)) {
            if (!estSur(ref.writeExpr).sur) { r = false; break; }
          }
        }
      }
      memo.set(v, r);
      return r;
    }

    /** Ce que la fonction appelée promet de rendre. */
    function appelSur(n) {
      const c = n.callee;
      if (c.type === "Identifier") {
        if (ECHAPPENT.has(c.name) || NUMERIQUES.has(c.name)) return { sur: true };
        const v = variableDe(c);
        // une fonction importée n'a pas son corps ici : `esc` et les siens sont nommés plus haut
        if (v && v.defs.every((d) => d.type !== "ImportBinding") && variableSure(v)) return { sur: true };
        return { sur: false, morceau: n };
      }
      if (c.type === "MemberExpression" && !c.computed && c.property.type === "Identifier") {
        const m = c.property.name;
        if (c.object.type === "Identifier" && c.object.name === "Math") return { sur: true };
        if (METHODES_NUMERIQUES.has(m) || m === "toLocaleString") return { sur: true };
        if (m === "join") {
          const sep = n.arguments[0];
          if (sep && !estSur(sep).sur) return estSur(sep);
          return listeSure(c.object);
        }
        if (METHODES_NEUTRES.has(m)) return estSur(c.object);
      }
      return { sur: false, morceau: n };
    }

    /** Ce qu'on joint : un tableau écrit, ou un `.map` dont chaque rendu est sûr. */
    function listeSure(n) {
      if (n.type === "ArrayExpression") {
        for (const e of n.elements) {
          if (!e) continue;
          const r = estSur(e.type === "SpreadElement" ? e.argument : e);
          if (!r.sur) return r;
        }
        return { sur: true };
      }
      if (n.type === "CallExpression" && n.callee.type === "MemberExpression" &&
          !n.callee.computed && ["map", "flatMap"].includes(n.callee.property.name)) {
        const fn = n.arguments[0];
        if (fn && /Function/.test(fn.type)) {
          for (const e of retoursDe(fn)) {
            if (!e) continue;
            const r = estSur(e);
            if (!r.sur) return r;
          }
          return { sur: true };
        }
        if (fn && fn.type === "Identifier" && (ECHAPPENT.has(fn.name))) return { sur: true };
        return { sur: false, morceau: n };
      }
      if (n.type === "CallExpression" && n.callee.type === "MemberExpression" &&
          !n.callee.computed && ["filter", "slice", "concat", "sort", "reverse"].includes(n.callee.property.name)) {
        return listeSure(n.callee.object);
      }
      return { sur: false, morceau: n };
    }

    /** `{ sur: true }`, ou le premier morceau qu'on n'a pas pu prouver. */
    function estSur(n) {
      switch (n.type) {
        case "Literal": return { sur: true };
        case "TemplateLiteral":
          for (const e of n.expressions) { const r = estSur(e); if (!r.sur) return r; }
          return { sur: true };
        case "BinaryExpression":
          if (OPERATEURS_NUMERIQUES.has(n.operator)) return { sur: true };
          { const g = estSur(n.left); if (!g.sur) return g; return estSur(n.right); }
        case "UnaryExpression": case "UpdateExpression": return { sur: true };
        case "ConditionalExpression":
          { const a = estSur(n.consequent); if (!a.sur) return a; return estSur(n.alternate); }
        case "LogicalExpression":
          /* `a && b` rend `b`, ou ce que `a` a de faux — `""`, `0`, `null` :
             rien qui porte une balise. */
          if (n.operator === "&&") return estSur(n.right);
          { const g = estSur(n.left); if (!g.sur) return g; return estSur(n.right); }
        case "SequenceExpression": return estSur(n.expressions[n.expressions.length - 1]);
        case "AssignmentExpression": return estSur(n.right);
        case "CallExpression": return appelSur(n);
        case "TaggedTemplateExpression": return { sur: false, morceau: n };
        case "ChainExpression": return estSur(n.expression);
        case "MemberExpression":
          // une longueur, un compte : des nombres
          if (!n.computed && n.property.type === "Identifier" && ["length", "size"].includes(n.property.name)) return { sur: true };
          return { sur: false, morceau: n };
        case "Identifier": {
          if (n.name === "undefined" || n.name === "NaN" || n.name === "Infinity") return { sur: true };
          const v = variableDe(n);
          return v && variableSure(v) ? { sur: true } : { sur: false, morceau: n };
        }
        default: return { sur: false, morceau: n };
      }
    }

    function juge(valeur) {
      const r = estSur(valeur);
      if (!r.sur) context.report({ node: r.morceau, messageId: "nonProuve", data: { morceau: texte(r.morceau) } });
    }

    const PROPRIETES = new Set(["innerHTML", "outerHTML"]);
    return {
      AssignmentExpression(n) {
        const g = n.left;
        if (g.type === "MemberExpression" && !g.computed && PROPRIETES.has(g.property.name)) juge(n.right);
      },
      CallExpression(n) {
        const c = n.callee;
        if (c.type === "MemberExpression" && !c.computed && c.property.name === "insertAdjacentHTML" && n.arguments[1]) {
          juge(n.arguments[1]);
        }
      },
    };
  },
};

module.exports = { rules: { "html-echappe": regle } };
