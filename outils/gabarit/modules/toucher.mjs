/* ============================================================
   Un toucher qui se sent — la vibration brève du téléphone

   Un plan sous le doigt ne répond qu'à l'œil : le stand touché s'allume, la
   fiche monte, mais la main, elle, ne sait pas si elle a pris quelque chose.
   Une vibration de quelques millisecondes le lui dit, comme le clavier d'un
   téléphone. Deux moments seulement, pour qu'elle garde un sens : le doigt
   choisit un stand ou un repère, et le pincement bute sur la limite du zoom.

   Android l'offre par `navigator.vibrate`. L'iPhone n'a pas cet appel, et
   la vibration y restait muette ; mais depuis iOS 18, Safari fait vibrer
   l'appareil quand on bascule un interrupteur natif (`<input switch>`). On
   en garde un, invisible, et on le bascule par son étiquette — c'est le geste
   du doigt qui l'actionne, comme si on l'avait touché. Un iPhone plus ancien
   n'y gagne rien, et n'y perd rien.

   Seul le doigt la déclenche — la souris et le clavier n'ont rien à sentir.
   Le navigateur la refuse aussi tant que la page n'a pas été touchée : c'est
   toujours un geste qui l'appelle ici.
   ============================================================ */

/* Assez pour se sentir, trop peu pour s'entendre sur une table. Le web ne
   règle pas la force d'une vibration, seulement sa durée : c'est elle qui
   dose. Dix millisecondes ne se sentaient pas sur un vrai téléphone Android
   — le moteur n'a pas le temps de démarrer —, et trente se sentaient trop
   fort au choix d'un stand, qu'on fait sans cesse ; vingt, essayées au doigt
   parmi d'autres durées sur un vrai téléphone, se sentent sans appuyer. La
   butée reste plus marquée : elle dit que le plan ne suivra plus la main,
   pas qu'il a pris quelque chose. */
export const PRISE = 20, BUTEE = 45;

/**
 * Vibre `ms` millisecondes, si l'appareil sait le faire et que c'est un doigt
 * qui agit.
 * @param {number} ms
 * @param {string} [sorte] le `pointerType` du geste
 */
export function vibre(ms, sorte){
  if (sorte && sorte !== "touch") return;
  try {
    if (navigator.vibrate){ navigator.vibrate(ms); return; }
    interrupteur().click();
  } catch (e) {}
}

/** @type {HTMLLabelElement | null} */
let etiquette = null;
/* L'interrupteur de Safari, posé une fois et hors de vue. Hors de vue et non
   caché : un élément masqué (`display:none`) ne se bascule plus, et ne fait
   donc plus rien vibrer. */
function interrupteur(){
  if (etiquette) return etiquette;
  etiquette = document.createElement("label");
  etiquette.setAttribute("aria-hidden", "true");
  etiquette.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  const c = document.createElement("input");
  c.type = "checkbox"; c.setAttribute("switch", ""); c.tabIndex = -1;
  etiquette.appendChild(c);
  document.body.appendChild(etiquette);
  return etiquette;
}
