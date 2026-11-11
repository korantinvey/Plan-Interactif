/* ============================================================
   Essai de vibration — une page de diagnostic, en prévisualisation seulement

   Le plan appelle bien `navigator.vibrate` (`modules/toucher.mjs`), et un
   téléphone Android sous Chrome n'en sentait pourtant rien, ni au choix d'un
   stand ni aux butées. Chrome refuse d'ouvrir une adresse `data:` tapée — il
   en fait une recherche —, et un artefact vit dans un cadre d'une autre
   origine, où Chrome refuse la vibration : il fallait une vraie page, à une
   vraie adresse, pour séparer ce que fait le téléphone de ce que fait le plan.

   Chaque bouton dit ce que Chrome a répondu ; « true » sans rien sentir veut
   dire que le téléphone a mangé la demande (mode silencieux, retour tactile
   coupé, économiseur de batterie). Le Worker ne la sert qu'à une adresse de
   prévisualisation (`index.mjs` `enApercu`) : la production n'en a rien.

   Elle sert aussi à régler la force : le web ne règle que des durées, et une
   impulsion plus courte, ou hachée, se sent plus douce — ce que seul un doigt
   sur un vrai téléphone peut trancher.
   ============================================================ */

const PAGE = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Essai de vibration</title>
<style>
  h2 { font-size: 17px; margin: 22px 0 4px; }
  body { font: 18px/1.4 system-ui, sans-serif; margin: 16px; background: #fff; color: #111; }
  button { font: inherit; display: block; width: 100%; margin: 10px 0; padding: 18px; border-radius: 12px; border: 1px solid #888; background: #f2f2f2; }
  #journal { white-space: pre-wrap; font: 14px/1.4 ui-monospace, monospace; background: #f6f6f6; padding: 10px; border-radius: 8px; }
</style>
</head>
<body>
<h1>Essai de vibration</h1>
<p>Touchez chaque bouton, et notez ce que vous sentez. Une série chiffrée alterne vibration et pause, en millisecondes.</p>
<h2>Le choix d'un stand, plus ou moins fort</h2>
<button data-ms="30">30 ms — jusqu'ici</button>
<button data-ms="25">25 ms</button>
<button data-ms="20">20 ms — aujourd'hui</button>
<button data-ms="15">15 ms</button>
<button data-ms="10">10 ms</button>
<h2>Hachée : une impulsion adoucie</h2>
<button data-ms="8,12,8">8 · 12 · 8</button>
<button data-ms="5,15,5,15,5">5 · 15 · 5 · 15 · 5</button>
<button data-ms="4,16,4,16,4,16,4">4 · 16 · 4 · 16 · 4 · 16 · 4</button>
<h2>Pour comparer</h2>
<button data-ms="45">45 ms — une butée</button>
<button data-ms="300">300 ms</button>
<div id="journal"></div>
<script>
  const journal = document.getElementById("journal");
  const note = (t) => { journal.textContent += t + "\\n"; };
  note("vibrate présent : " + (typeof navigator.vibrate === "function"));
  note("dans un cadre : " + (window.top !== window.self));
  note("navigateur : " + navigator.userAgent);
  for (const b of document.querySelectorAll("button")) {
    b.addEventListener("click", () => {
      const ms = b.dataset.ms.split(",").map(Number);
      let rendu;
      try { rendu = navigator.vibrate ? navigator.vibrate(ms.length > 1 ? ms : ms[0]) : "absent"; }
      catch (e) { rendu = "erreur : " + e.message; }
      note(b.dataset.ms + " ms → " + rendu + " (page déjà touchée : " +
        (navigator.userActivation ? navigator.userActivation.hasBeenActive : "?") + ")");
    });
  }
</script>
</body>
</html>`;

/** La page d'essai, jamais gardée en cache : on la change en la regardant. */
export function essaiVibration() {
  return new Response(PAGE, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
