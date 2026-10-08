/* ============================================================
   Point d'entrée des trois pages du plan — public, démonstration,
   administration

   Le code du plan est encore soudé en un seul script classique, qui ne sait
   pas importer. Ce que les modules lui fournissent lui est donc confié par
   l'objet global, le temps qu'il devienne module à son tour : chaque nom qui
   quitte cette liste est un nom que le code soudé n'utilise plus.

   La liste est relue par les outils (`outils/modules.js`) : la relecture et
   les types la tiennent pour déclarée, la construction la pose avant le
   script du plan. On n'y met donc qu'un objet littéral de noms.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs, COLLATION } from "./texte.mjs";
import { hslHex, rgbHex, hexa, luminance } from "./couleurs.mjs";
import { marquePrete, recadreMarque } from "./marque.mjs";
import { API, SLUG, cheminDuSalon, cheminPartageable, BORNE } from "./salon.mjs";
import { accesBase, base } from "./session.mjs";
import { ouvreModale, fermeModale, confirme, poseAvantFermeture, poseApresFermeture, brancheFenetre }
  from "./fenetre.mjs";
import { lien, adresseWeb, adresseSure, IMAGE_SURE, adresseImage, imageSure, assainitRiche }
  from "./sur.mjs";
import { arrondiGeo, empreinteGeo, anneauxGeo, traceGeo, boiteAnneaux, boiteGeo }
  from "./forme.mjs";
import { DEG, metresParDegre, versTerre, versLePlan, reancre, PX_TUILE, TOUR_MERCATOR, pixelsMercator,
  latitudeDePixel, echelleDesTuiles, niveauDesTuiles, aireDuContour, centreDuContour, axeDuContour }
  from "./terre.mjs";
import { JOURS, MOIS, momentLocal, jourLong, jourCourt, dateDeCle, jourBref, jourISO,
  minutesDe, ecritHeure, ecritMinutes } from "./temps.mjs";
import { QR_VERSION_LISIBLE, qrTrame, qrChemin, qrSvg } from "./qr.mjs";
import { mesure, mesureOuverte, jetonMesure, supportMesure, renouvelleVisiteur, brancheMesure }
  from "./mesure.mjs";

Object.assign(globalThis, {
  $, esc, separeValeurs, COLLATION,
  hslHex, rgbHex, hexa, luminance,
  marquePrete, recadreMarque,
  API, SLUG, cheminDuSalon, cheminPartageable, BORNE,
  accesBase, base,
  ouvreModale, fermeModale, confirme, poseAvantFermeture, poseApresFermeture, brancheFenetre,
  lien, adresseWeb, adresseSure, IMAGE_SURE, adresseImage, imageSure, assainitRiche,
  arrondiGeo, empreinteGeo, anneauxGeo, traceGeo, boiteAnneaux, boiteGeo,
  DEG, metresParDegre, versTerre, versLePlan, reancre, PX_TUILE, TOUR_MERCATOR, pixelsMercator,
  latitudeDePixel, echelleDesTuiles, niveauDesTuiles, aireDuContour, centreDuContour, axeDuContour,
  JOURS, MOIS, momentLocal, jourLong, jourCourt, dateDeCle, jourBref, jourISO,
  minutesDe, ecritHeure, ecritMinutes,
  QR_VERSION_LISIBLE, qrTrame, qrChemin, qrSvg,
  mesure, mesureOuverte, jetonMesure, supportMesure, renouvelleVisiteur, brancheMesure,
});
