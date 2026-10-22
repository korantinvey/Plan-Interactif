/**
 * Le décor de la vue immersive (`modules/decor.mjs`), éprouvé hors de la page.
 *
 * Le mobilier se range seul dans une zone dont rien ne dit l'aménagement : ce
 * qu'on vérifie, c'est qu'il y tient — aucune pièce ne déborde du contour,
 * même tourné — qu'une zone se meuble selon son type, et qu'une zone immense
 * ne coûte pas au dessin plus que la borne.
 *
 *   node outils/essais/decor.js     (chaîné dans `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const dedans = (an, x, y) => {
  let ok = false;
  for (let i = 0, j = an.length - 1; i < an.length; j = i++){
    const [xi, yi] = an[i], [xj, yj] = an[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
};
/** Un rectangle de `w` × `h` mètres, tourné de `deg` degrés autour de (x, y). */
const rect = (x, y, w, h, deg = 0) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([u, v]) => [x + u * c - v * s, y + u * s + v * c]);
};

(async () => {
  const { meuble, TYPES_MEUBLES, objetRepere, OBJETS_REPERE, comptoir, poigneeComptoir, comptoirTient, rapprocheComptoir, poigneeObjet,
    camions, figeCamions, ajouteCamion, camionsSeGenent, enseignesCamions } = await import(pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "decor.mjs")));

  for (const deg of [0, 27]){
    console.log("Zones tournées de " + deg + "°");
    for (const type of TYPES_MEUBLES){
      const zone = rect(1350, -1500, 22, 14, deg);
      const p = meuble(type, zone);
      dit(p.length > 0, type + " : la zone se meuble", p.length + " pièces");
      const deborde = p.filter(x => x.polygon.some(([a, b]) => !dedans(zone, a, b)));
      dit(!deborde.length, type + " : rien ne déborde du contour", deborde.length ? deborde[0].role : "");
    }
  }

  console.log("Ce que chaque type pose");
  const roles = (type) => new Set(meuble(type, rect(0, 0, 22, 14)).map(x => x.role));
  dit(["plateau", "assise"].every(r => roles("restauration").has(r)), "un restaurant : des tables et des chaises");
  dit(["carrosserie", "habitacle", "store", "plateau"].every(r => roles("foodtruck").has(r)) &&
    !roles("foodtruck").has("comptoir") &&
    !roles("foodtruck").has("assise"), "un foodtruck : des camions et des mange-debout, sans chaises");
  {
    const seul = meuble("foodtruck", rect(0, 0, 5.5, 2.6));
    dit(seul.filter(x => x.role === "carrosserie").length === 1, "un foodtruck à la taille d'un camion : un camion, réduit");
    // aucune taille plancher : une zone minuscule reçoit encore son camion, et « + » en ajoute
    const mini = rect(0, 0, .6, .4);
    dit(meuble("foodtruck", mini).filter(x => x.role === "carrosserie").length === 1, "une zone minuscule : son camion, très réduit");
    const a = ajouteCamion(mini, []), b = a && ajouteCamion(mini, [a]);
    dit(Boolean(a) && camions(mini, [a]).length === 1, "une zone minuscule vide n'est pas pleine");
    dit(!b || camions(mini, [a, b]).length === 2, "un second camion, s'il entre, tient aussi");
  }
  dit(["scene", "ecran", "assise"].every(r => roles("conferences").has(r)), "une salle : une scène, un écran, des sièges");
  dit(roles("accueil").has("comptoir"), "un accueil : un comptoir");
  dit(roles("vestiaire").has("portant"), "un vestiaire : des portants");
  dit(["tapis", "plateau", "canape", "plante"].every(r => roles("lounge").has(r)),
    "un lounge : des tapis, des tables basses, des canapés, des plantes");
  dit(!meuble("transport", rect(0, 0, 22, 14)).length && !meuble("", rect(0, 0, 22, 14)).length,
    "une zone sans type meublable reste vide");
  dit(!meuble("restauration", rect(0, 0, 1.5, 1.5)).length, "une zone trop petite ne reçoit rien");

  console.log("Le comptoir placé à la main");
  const hall = rect(10, 20, 22, 14);       // de -1 à 21 en x, de 13 à 27 en y
  const auto = comptoir(hall, null);
  dit(!auto.choisi && Math.abs(auto.cx - 10) < 1e-6 && Math.abs(auto.cy - 20) < 1e-6,
    "sans réglage, il se pose au milieu");
  dit(Math.abs(Math.abs(Math.sin(auto.angle * Math.PI / 180)) - 1) < 1e-6,
    "sans réglage, en travers du plus long côté", auto.angle.toFixed(1) + "°");
  const place = comptoir(hall, { u: .25, v: .75, a: 0 });
  dit(place.choisi && Math.abs(place.cx - 4.5) < 1e-6 && Math.abs(place.cy - 23.5) < 1e-6,
    "réglé, il se pose où on l'a voulu, en part de l'emprise");
  const pieces = meuble("accueil", hall, { u: .25, v: .75, a: 0 });
  const plat = pieces.find(x => x.role === "comptoir");
  const ys = plat.polygon.map(p => p[1]), xs = plat.polygon.map(p => p[0]);
  dit(Math.max(...xs) - Math.min(...xs) > Math.max(...ys) - Math.min(...ys),
    "tourné à 0°, son long côté suit l'horizontale du plan");
  const tourne = meuble("accueil", hall, { u: .5, v: .5, a: 90 }).find(x => x.role === "comptoir");
  const ys2 = tourne.polygon.map(p => p[1]), xs2 = tourne.polygon.map(p => p[0]);
  dit(Math.max(...ys2) - Math.min(...ys2) > Math.max(...xs2) - Math.min(...xs2), "tourné à 90°, la verticale");
  dit(comptoir(hall, { u: 2, v: .5, a: 0 }).choisi === false, "un réglage hors de l'emprise est ignoré");
  dit(meuble("accueil", hall, { u: NaN, v: 0, a: 0 }).some(x => x.role === "comptoir"),
    "un réglage illisible laisse le placement d'office");

  const enMain = meuble("accueil", hall, { u: .25, v: .75, a: 0 }, true);
  dit(["comptoir-choisi", "tige", "poignee"].every(r => enMain.some(x => x.role === r)),
    "choisi, le comptoir sort sa poignée");
  const [hx, hy] = poigneeComptoir(comptoir(hall, { u: .25, v: .75, a: 0 }));
  dit(Math.abs(hx - 4.5) < 1e-6 && hy < 23.5, "tourné à 0°, la poignée est au-dessus de lui sur le plan");
  const [hx2] = poigneeComptoir(comptoir(hall, { u: .5, v: .5, a: 90 }));
  dit(hx2 > 10, "tourné à 90°, elle passe à sa droite");

  console.log("Le comptoir reste dans sa zone");
  dit(!comptoir(hall, { u: .02, v: .5, a: 0 }).choisi,
    "un réglage qui le ferait déborder est oublié pour le placement d'office");
  dit(meuble("accueil", hall, { u: .02, v: .5, a: 0 }).every(x => x.polygon.every(([a, b]) => dedans(hall, a, b))),
    "et rien n'est dessiné hors de la zone");
  const centre = { u: .5, v: .5, a: 0 };
  const contre = rapprocheComptoir(hall, centre, { u: 0, v: .5, a: 0 });
  const cc = comptoir(hall, contre);
  dit(cc.choisi && Math.abs(cc.cx - cc.demi - (-1)) < .2, "tiré vers le bord, il s'y arrête",
    "bord gauche à " + (cc.cx - cc.demi).toFixed(2));
  const longe = rapprocheComptoir(hall, centre, { u: 0, v: .3, a: 0 });
  dit(comptoir(hall, longe).choisi && Math.abs(longe.v - .3) < 1e-3, "tiré de biais, il glisse le long du bord");
  // contre le bord d'une zone de quatre mètres, il ne peut se mettre debout
  const etroit = rect(0, 0, 10, 4);
  const debout = rapprocheComptoir(etroit, { u: .5, v: .15, a: 0 }, { u: .5, v: .15, a: 90 });
  dit(comptoir(etroit, debout).choisi && debout.a < 90, "dans une zone étroite, il ne tourne que tant qu'il passe",
    debout.a.toFixed(1) + "°");
  // une zone en L : les quatre coins dedans, l'angle rentrant perce le plateau
  const L = [[0, 0], [20, 0], [20, 6], [6, 6], [6, 20], [0, 20]];
  const pique = { cx: 6.5, cy: 6.5, angle: 45, demi: 4, prof: .35 };
  dit(!comptoirTient(L, pique), "dans une zone en L, l'angle rentrant ne traverse pas le plateau");
  dit(comptoirTient(L, { cx: 12, cy: 3, angle: 0, demi: 4, prof: .35 }), "posé dans une branche du L, il tient");

  console.log("Les camions placés à la main");
  {
    const parc = rect(10, 10, 30, 20);
    const auto = figeCamions(parc, null);
    dit(auto.length > 0 && camions(parc, auto).length === auto.length, "le rangement d'office se fige sans rien perdre",
      auto.length + " camions");
    dit(!camions(parc, []).length && !meuble("foodtruck", parc, []).some(x => x.role === "carrosserie"),
      "zéro camion choisi : aucun camion", "");
    const un = [{ u: .5, v: .5, a: 90 }];
    const c = camions(parc, un)[0];
    dit(c && Math.abs(c.cx - 10) < 1e-6 && Math.abs(c.cy - 10) < 1e-6 && c.angle === 90, "un camion se pose où on le met");
    const tourne = meuble("foodtruck", parc, un).filter(x => x.role === "carrosserie");
    const ys = tourne[0].polygon.map(p => p[1]), xs = tourne[0].polygon.map(p => p[0]);
    dit(Math.max(...ys) - Math.min(...ys) > Math.max(...xs) - Math.min(...xs), "tourné d'un quart, il s'allonge en hauteur");
    let r = [];
    for (let i = 0; i < 6; i++){ const n = ajouteCamion(parc, r); if (n) r = [...r, n]; }
    const poses = camions(parc, r);
    dit(poses.length === 6, "six camions ajoutés tiennent dans la zone", poses.length + "");
    dit(!poses.some((a, i) => poses.some((b, j) => i < j && camionsSeGenent(a, b))), "les camions ajoutés ne se chevauchent pas");
    const p = meuble("foodtruck", parc, r);
    dit(!p.some(x => x.polygon.some(([a, b]) => !dedans(parc, a, b))), "rien ne déborde du contour");
    dit(camions(parc, [{ u: .01, v: .01, a: 0 }]).length === 1, "un camion qui déborde du contour reste posé");
    const logo = "data:image/png;base64,AAAA";
    const marque = [{ u: .5, v: .5, a: 0, logo, lr: 2 }, { u: .2, v: .2, a: 0 }];
    dit(figeCamions(parc, marque)[0].logo === logo && !figeCamions(parc, marque)[1].logo, "figé, un camion garde son logo");
    const [dev] = enseignesCamions(parc, marque, false);
    dit(enseignesCamions(parc, marque, false).length === 1 && dev.logo === logo, "un logo par camion qui en a un");
    // vu depuis le comptoir (en bas de l'écran, à angle nul), l'arrière à gauche, le haut en l'air
    dit(dev.coins.every(p => Math.abs(p[1] - (10 + 1.18)) < 1e-6) && dev.coins[0][0] < dev.coins[3][0] &&
      dev.coins[1][2] > dev.coins[0][2] && dev.coins[0][2] >= .9 - 1e-6, "en volume, le logo se dresse sur la devanture");
    const larg = dev.coins[3][0] - dev.coins[0][0], haut = dev.coins[1][2] - dev.coins[0][2];
    dit(Math.abs(larg / haut - 2) < 1e-6, "le logo garde ses proportions", (larg / haut).toFixed(2));
    for (const a of [0, 180]){
      const [t] = enseignesCamions(parc, [{ u: .5, v: .5, a, logo, lr: 2 }], true);
      dit(t.coins[1][1] < t.coins[0][1] && t.coins[3][0] > t.coins[0][0], "à plat, tourné de " + a + "°, le logo se lit à l'endroit");
    }
    dit(meuble("foodtruck", parc, r, 2).some(x => x.role === "poignee") &&
      meuble("foodtruck", parc, r, 2).filter(x => x.role === "comptoir-choisi").length === 1, "tenu, un camion sort sa poignée");
  }

  console.log("Une zone immense");
  const n = meuble("conferences", rect(0, 0, 400, 300)).length;
  dit(n <= 600, "le décor s'arrête à la borne", n + " pièces");

  console.log("Les objets des repères");
  for (const g of OBJETS_REPERE){
    const o = objetRepere(g, 100, 50, 7.2);
    const sommet = Math.max(...o.pieces.map(x => x.haut));
    dit(o.pieces.length > 0 && o.dessus >= sommet, g + " : un objet, la pastille posée dessus", "dessus " + o.dessus.toFixed(2));
    const xs = o.pieces.flatMap(x => x.polygon.map(p => p[0]));
    dit(Math.max(...xs) - Math.min(...xs) <= 7.2, g + " : pas plus large que sa pastille");
  }
  dit(!objetRepere("wc", 0, 0, 7).pieces.length, "un repère sans objet reste une pastille au sol");
  const esc = objetRepere("escalier", 0, 0, 6);
  const marches = esc.pieces.map(x => x.haut);
  dit(marches.every((h, i) => !i || h > marches[i - 1]), "les marches montent l'une après l'autre");
  dit(esc.ancre[1] < 0, "la pastille se pose au fond, au-dessus de la dernière marche");

  console.log("Un escalier tourné");
  const droite = objetRepere("escalier", 0, 0, 6, 90);
  const hautes = droite.pieces.map(x => x.haut), plusHaute = droite.pieces[hautes.indexOf(Math.max(...hautes))];
  const basse = droite.pieces[hautes.indexOf(Math.min(...hautes))];
  // la marche la plus haute court jusqu'au fond : son centre est plus loin dans le sens de la montée
  const centreX = (q) => q.polygon.reduce((s, p) => s + p[0], 0) / q.polygon.length;
  dit(centreX(plusHaute) > centreX(basse), "tourné de 90°, il monte vers la droite du plan");
  dit(droite.ancre[0] > 0 && Math.abs(droite.ancre[1]) < 1e-6, "la pastille suit le haut des marches");
  const droit = objetRepere("escalier", 3, 4, 6, 0);
  dit(JSON.stringify(objetRepere("escalier", 3, 4, 6, 360).pieces.map(q => q.polygon.map(p => p.map(v => +v.toFixed(6)))))
    === JSON.stringify(droit.pieces.map(q => q.polygon.map(p => p.map(v => +v.toFixed(6))))), "un tour complet le ramène");
  const tenu = objetRepere("escalator", 0, 0, 6, 45, true);
  dit(tenu.pieces.some(x => x.role === "poignee") && tenu.pieces.some(x => x.role === "tige"), "tenu, il sort sa poignée");
  const [px, py] = poigneeObjet("escalator", 0, 0, 6, 45);
  const rond = tenu.pieces.find(x => x.role === "poignee");
  const rx = rond.polygon.reduce((s, p) => s + p[0], 0) / rond.polygon.length, ry = rond.polygon.reduce((s, p) => s + p[1], 0) / rond.polygon.length;
  dit(Math.hypot(rx - px, ry - py) < 1e-6 && px > 0 && py < 0, "la poignée est où l'outil la vise, au haut des marches");

  if (ko){ console.log("\n" + ko + " échec(s)."); process.exit(1); }
  console.log("\nLe décor tient.");
})();
