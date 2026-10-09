/* ============================================================
   Point d'entrée de la console

   Mêmes règles que `plan.mjs` : le socle commun (`_console-base.html`) et ce
   qui le suit restent un script classique, auquel ces noms sont confiés par
   l'objet global. Ce sont les mêmes fonctions que celles du plan, et non plus
   des copies : un échappement corrigé ici l'est sur toutes les pages, et une
   vignette de logo se recadre selon la règle même du plan.

   Le reste est sorti de la console elle-même, morceau par morceau : l'export
   (partagé avec le rapport), le vocabulaire de la correspondance des champs,
   la fenêtre d'avancement d'une synchronisation, l'icône de l'onglet. Ce
   qu'ils ne peuvent pas importer — la fenêtre du socle, l'appel à la base, le
   salon ouvert — leur est confié par le code soudé (`brancheExport`,
   `brancheAvancement`), à la place que leur code tenait.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs } from "./texte.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON }
  from "./session.mjs";
import { vignetteDeLogo } from "./marque.mjs";
import { exporteExposants, brancheExport } from "./export.mjs";
import { DEFAUT_CHAMP, AUCUN_CHAMP, encode, decode, correspondance, intitule, intituleSuite,
  ACCORDS, aplani, autreFace } from "./correspondance.mjs";
import { fenetreAvancement, suitAuServeur, brancheAvancement } from "./avancement.mjs";
import { reduitIcone } from "./icone-onglet.mjs";

Object.assign(globalThis, {
  $, esc, separeValeurs,
  CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON,
  vignetteDeLogo,
  exporteExposants, brancheExport,
  DEFAUT_CHAMP, AUCUN_CHAMP, encode, decode, correspondance, intitule, intituleSuite,
  ACCORDS, aplani, autreFace,
  fenetreAvancement, suitAuServeur, brancheAvancement,
  reduitIcone,
});
