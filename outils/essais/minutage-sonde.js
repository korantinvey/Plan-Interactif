/**
 * Le minutage du relais, tel que la sonde le lit (`modules/mesures-page.mjs`
 * `trajetDecoupe`, `minutageRejoue`).
 *
 * Une réponse resservie par un cache garde le `Server-Timing` de la première
 * fois : la sonde ne doit le rendre que s'il décrit la demande de cette
 * visite. On éprouve ce qui passe — une réponse venue du réseau, même sous le
 * service de second plan, qui la dit pourtant « cache » et sans octet —, et ce
 * qui ne passe pas : la copie du service, le cache HTTP hors du service, une
 * copie vieillie, une horloge trop décalée, une copie récente mais trahie par
 * un relais plus long que l'attente.
 *
 *   node outils/essais/minutage-sonde.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};

(async () => {
  const { trajetDecoupe, trajet, AGE_MAX_MINUTAGE } = await import(pathToFileURL(
    path.join(__dirname, "..", "gabarit", "modules", "mesures-page.mjs")));

  // la page ouverte à cette heure-là ; la réponse arrive 600 ms après le départ, à 1 000 ms
  const ORIGINE = 1_763_330_000_000;
  const T = Math.floor((ORIGINE + 1000) / 1000);
  const entete = (t, dur = 120) => [
    { name: "w", duration: dur, description: "" },
    { name: "cf", duration: 0, description: "CDG" },
    { name: "cache", duration: 0, description: "hit" },
    ...(t === undefined ? [] : [{ name: "t", duration: 0, description: String(t) }]),
  ];
  const entree = (o) => ({ startTime: 400, responseStart: 1000, workerStart: 0, fetchStart: 400,
    transferSize: 5000, decodedBodySize: 40000, deliveryType: "", serverTiming: entete(T), ...o });

  // — ce qui passe
  {
    const d = trajetDecoupe(entree({}), ORIGINE);
    dit(d.relaisMs === 120 && d.cf === "CDG" && d.cache === "hit" && !d.rejoue, "une réponse du réseau rend son minutage", JSON.stringify(d));
    dit(d.attenteMs === 600, "et l'attente de la page, du départ au premier octet", String(d.attenteMs));
  }
  {
    /* Sous le service, Chromium annonce zéro octet et une livraison « cache »
       pour une réponse venue du réseau : ce n'est pas une copie. */
    const e = entree({ workerStart: 401, fetchStart: 405, transferSize: 0, deliveryType: "cache" });
    const d = trajetDecoupe(e, ORIGINE);
    dit(d.relaisMs === 120 && !d.rejoue, "sous le service, une réponse du réseau dite « cache » rend son minutage", JSON.stringify(d));
    dit(d.serviceMs === 4, "et le temps du service avant la demande", String(d.serviceMs));
    dit(trajet(e) === "inconnu", "sans marque ni « cache-storage », son trajet reste inconnu", trajet(e));
  }
  {
    // un relais d'avant l'heure : les autres signes jugent seuls
    const d = trajetDecoupe(entree({ serverTiming: entete(undefined) }), ORIGINE);
    dit(d.relaisMs === 120 && !d.rejoue, "sans heure, une réponse fraîche rend son minutage", JSON.stringify(d));
  }

  // — ce qui ne passe pas
  {
    const e = entree({ workerStart: 401, transferSize: 0, serverTiming: [...entete(T), { name: "sw", duration: 0, description: "cache" }] });
    const d = trajetDecoupe(e, ORIGINE);
    dit(d.rejoue && d.garde && d.relaisMs === undefined && d.cf === undefined, "la copie du service ne rend pas son ancien minutage", JSON.stringify(d));
    dit(trajet(e) === "garde", "et son trajet se dit « garde »", trajet(e));
  }
  {
    // hors du service, zéro octet pour un corps lu : le cache HTTP, même sans heure
    const d = trajetDecoupe(entree({ transferSize: 0, serverTiming: entete(undefined) }), ORIGINE);
    dit(d.rejoue && d.relaisMs === undefined, "relue du cache HTTP, la réponse ne rend pas son minutage", JSON.stringify(d));
  }
  {
    const vieille = trajetDecoupe(entree({ workerStart: 401, transferSize: 0, serverTiming: entete(T - 3600) }), ORIGINE);
    dit(vieille.rejoue && vieille.relaisMs === undefined, "une copie d'il y a une heure se reconnaît à son âge", JSON.stringify(vieille));
    const avance = trajetDecoupe(entree({ serverTiming: entete(T + AGE_MAX_MINUTAGE + 60) }), ORIGINE);
    dit(avance.rejoue && avance.relaisMs === undefined, "une horloge trop décalée : la mesure est perdue, non mal lue", JSON.stringify(avance));
    const proche = trajetDecoupe(entree({ serverTiming: entete(T - AGE_MAX_MINUTAGE + 30) }), ORIGINE);
    dit(!proche.rejoue, "un écart sous le seuil ne suffit pas à l'écarter", JSON.stringify(proche));
  }
  {
    /* Une copie plus récente que le seuil, d'un relais qui avait été lent :
       deux secondes de relais pour six cents millisecondes d'attente. */
    const d = trajetDecoupe(entree({ workerStart: 401, transferSize: 0, serverTiming: entete(T - 30, 2000) }), ORIGINE);
    dit(d.rejoue && d.relaisMs === undefined, "une copie récente se trahit par un relais plus long que l'attente", JSON.stringify(d));
  }

  process.exit(ko ? 1 : 0);
})();
