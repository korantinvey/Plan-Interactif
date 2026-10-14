/**
 * Le détourage des logos : `modules/detourage.mjs`, éprouvé seul.
 *
 * Il ne se trompe jamais bruyamment : un blanc gardé à tort se voit sur le
 * toit d'un stand, un blanc retiré à tort perce un logo, et rien ne plante.
 * On dessine donc des logos au pixel près — un « O », un cadre qui enclôt des
 * lettres, un texte blanc sur un aplat — et l'on regarde, pixel par pixel, ce
 * qui reste.
 *
 *   node outils/essais/detourage.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

/** Une image blanche et opaque, et de quoi y peindre des rectangles. */
function image(w, h) {
  const px = new Uint8ClampedArray(w * h * 4).fill(255);
  const peint = (x0, y0, x1, y1, [r, v, b, a = 255]) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const k = (y * w + x) * 4;
      px[k] = r; px[k + 1] = v; px[k + 2] = b; px[k + 3] = a;
    }
  };
  // un cadre de cette épaisseur, dedans compris entre ses bords
  const cadre = (x0, y0, x1, y1, e, c) => {
    peint(x0, y0, x1, y0 + e, c); peint(x0, y1 - e, x1, y1, c);
    peint(x0, y0, x0 + e, y1, c); peint(x1 - e, y0, x1, y1, c);
  };
  const alpha = (x, y) => px[(y * w + x) * 4 + 3];
  return { px, w, h, peint, cadre, alpha };
}

const NOIR = [20, 20, 20], ROUGE = [200, 0, 40];

(async () => {
  const { detoure } = await import(pathToFileURL(path.join(
    __dirname, "..", "gabarit", "modules", "detourage.mjs")).href);

  console.log("le fond qui touche le bord");
  {
    const i = image(200, 100);
    i.peint(40, 30, 160, 70, NOIR);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(5, 5) === 0, "le blanc du pourtour s'efface");
    dit(i.alpha(100, 50) === 255, "le dessin reste");
  }

  console.log("l'œil d'une lettre");
  {
    // un « O » : un anneau carré au trait de six pixels
    const i = image(200, 100);
    i.cadre(70, 20, 130, 80, 6, NOIR);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(100, 50) === 0, "le dedans du « O » s'efface");
    dit(i.alpha(72, 50) === 255, "son trait reste");
  }

  console.log("un logo encadré d'un filet, ses lettres dedans");
  {
    /* Le cas de CLP : un filet fin enclôt un grand blanc, où des lettres
       sont posées. Mesurée en passant par le blanc, la distance au dehors
       comptait le pourtour des lettres, loin du bord, et gardait le blanc. */
    const i = image(300, 200);
    i.cadre(40, 20, 260, 180, 3, NOIR);
    for (let n = 0; n < 6; n++) i.peint(70 + n * 28, 70, 88 + n * 28, 130, NOIR);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(150, 40) === 0, "le blanc dans le cadre s'efface", "alpha " + i.alpha(150, 40));
    dit(i.alpha(75, 100) === 255, "les lettres restent");
    dit(i.alpha(41, 100) === 255, "le filet reste");
  }

  console.log("un texte blanc sur un aplat");
  {
    // l'aplat déborde largement les lettres : leur blanc est voulu
    const i = image(300, 200);
    i.peint(30, 30, 270, 170, ROUGE);
    for (let n = 0; n < 4; n++) i.peint(90 + n * 32, 80, 110 + n * 32, 120, [255, 255, 255]);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(100, 100) === 255, "le blanc des lettres reste", "alpha " + i.alpha(100, 100));
    dit(i.alpha(5, 5) === 0, "le fond autour de l'aplat s'efface");
  }

  console.log("des lettres à œil dans un cadre");
  {
    /* Le cas de SEPCO : une ellipse fine enclôt les lettres, dont les yeux
       n'ont de distance au fond qu'une fois le dedans du cadre retiré. */
    const i = image(300, 200);
    i.cadre(40, 20, 260, 180, 3, NOIR);
    i.cadre(90, 60, 150, 140, 8, NOIR);
    i.cadre(160, 60, 220, 140, 8, NOIR);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(60, 40) === 0, "le blanc dans le cadre s'efface");
    dit(i.alpha(120, 100) === 0, "l'œil de la première lettre s'efface", "alpha " + i.alpha(120, 100));
    dit(i.alpha(190, 100) === 0, "l'œil de la seconde aussi", "alpha " + i.alpha(190, 100));
    dit(i.alpha(93, 100) === 255, "leur trait reste");
  }

  console.log("l'œil d'une lettre grasse sur un logo bas");
  {
    /* Le cas de Chapuis : sur un logo long et bas, le trait d'un « p » gras
       dépasse le seuil tiré du petit côté, mais pas la largeur de son œil. */
    const i = image(400, 80);
    i.cadre(150, 10, 190, 70, 11, NOIR);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(170, 40) === 0, "l'œil s'efface", "alpha " + i.alpha(170, 40));
    dit(i.alpha(155, 40) === 255, "son trait reste");
  }

  console.log("un texte blanc dans un bandeau mince");
  {
    /* Le cas d'AQUILUS : un bandeau bien plus mince que le petit côté du
       logo, et des lettres blanches dedans. Le seuil tiré du petit côté les
       retirait toutes ; plus fines que la marge du bandeau, elles restent. */
    const i = image(300, 300);
    i.peint(20, 140, 280, 172, ROUGE);
    for (let n = 0; n < 8; n++) i.peint(40 + n * 30, 148, 44 + n * 30, 164, [255, 255, 255]);
    detoure(i.px, i.w, i.h);
    dit(i.alpha(42, 156) === 255, "le blanc des lettres reste", "alpha " + i.alpha(42, 156));
    dit(i.alpha(5, 5) === 0, "le fond autour du bandeau s'efface");
  }

  console.log("un logo déjà détouré");
  {
    const i = image(200, 100);
    i.peint(0, 0, 200, 100, [255, 255, 255, 0]);
    i.peint(50, 30, 150, 70, ROUGE);
    const avant = Buffer.from(i.px);
    detoure(i.px, i.w, i.h);
    dit(Buffer.from(i.px).equals(avant), "rien ne change");
  }

  if (ko) { console.log(`\n${ko} échec(s)`); process.exit(1); }
  console.log("\ntout est bon");
})();
