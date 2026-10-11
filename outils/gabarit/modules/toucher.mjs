/* ============================================================
   Un toucher qui se sent — la vibration brève du téléphone

   Un plan sous le doigt ne répond qu'à l'œil : le stand touché s'allume, la
   fiche monte, mais la main, elle, ne sait pas si elle a pris quelque chose.
   Une vibration de quelques millisecondes le lui dit, comme le clavier d'un
   téléphone. Deux moments seulement, pour qu'elle garde un sens : le doigt
   choisit un stand ou un repère, et le pincement bute sur la limite du zoom.

   Les téléphones Android l'offrent ; l'iPhone ne laisse pas une page faire
   vibrer, et l'appel n'y fait rien. Seul le doigt la déclenche — la souris et
   le clavier n'ont rien à sentir. Le navigateur la refuse aussi tant que la
   page n'a pas été touchée : c'est toujours un geste qui l'appelle ici.
   ============================================================ */

/* Assez pour se sentir, trop peu pour s'entendre sur une table. */
export const PRISE = 10, BUTEE = 18;

/**
 * Vibre `ms` millisecondes, si l'appareil sait le faire et que c'est un doigt
 * qui agit.
 * @param {number} ms
 * @param {string} [sorte] le `pointerType` du geste
 */
export function vibre(ms, sorte){
  if (sorte && sorte !== "touch") return;
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
}
