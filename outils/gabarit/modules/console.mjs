/* ============================================================
   Point d'entrée de la console

   Mêmes règles que `plan.mjs` : le socle commun (`_console-base.html`) et ce
   qui le suit restent un script classique, auquel ces noms sont confiés par
   l'objet global. Ce sont les mêmes fonctions que celles du plan, et non plus
   des copies : un échappement corrigé ici l'est sur toutes les pages, et une
   vignette de logo se recadre selon la règle même du plan.

   Le reste est sorti de la console elle-même, morceau par morceau : l'export
   (partagé avec le rapport), le vocabulaire de la correspondance des champs,
   la fenêtre d'avancement d'une synchronisation, l'icône de l'onglet, l'appel
   des fonctions du projet, le fuseau horaire, la synchronisation et les
   vignettes des logos, les comptes ; puis les salons eux-mêmes — la liste,
   celui qu'on regarde, leurs pavillons (`evenements.mjs`) —, et ce qui ne
   tenait qu'à eux : la fiche d'un salon, sa provenance, la fiche détail, la
   duplication. Ce qu'ils ne peuvent pas importer — la fenêtre du socle,
   l'appel à la base, ce que la console redessine — leur est confié par le
   code soudé (`brancheExport`, `brancheAvancement`, `brancheFonctions`,
   `brancheFuseau`, `brancheSynchronisation`, `brancheComptes`,
   `brancheEvenements`, `brancheProvenance`, `brancheFicheDetail`,
   `brancheDuplication`, `brancheFiche`), à la place que leur code tenait.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc, separeValeurs } from "./texte.mjs";
import { CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON }
  from "./session.mjs";
import { exporteExposants, brancheExport } from "./export.mjs";
import { DEFAUT_CHAMP, AUCUN_CHAMP, encode, decode, correspondance, intitule, intituleSuite,
  ACCORDS, aplani, autreFace } from "./correspondance.mjs";
import { brancheAvancement } from "./avancement.mjs";
import { reduitIcone } from "./icone-onglet.mjs";
import { brancheFonctions, refus } from "./appel-fonction.mjs";
import { brancheFuseau, champFuseau } from "./fuseau.mjs";
import { brancheSynchronisation, synchronise } from "./synchronisation.mjs";
import { MOI, poseComptes, brancheComptes, litMonProfil, ouvreComptes } from "./comptes.mjs";
import { vivants } from "./vivant.mjs";
import { EVTS, selection, PLANS, poseEvenements, brancheEvenements, slugifie, courant,
  chargePlans, majEvenement } from "./evenements.mjs";
import { brancheProvenance } from "./provenance.mjs";
import { brancheFicheDetail } from "./fiche-detail.mjs";
import { brancheDuplication, dupliquer } from "./duplication.mjs";
import { brancheFiche, dessineFiche, ouvreSources } from "./fiche-evenement.mjs";

Object.assign(globalThis, {
  $, esc, separeValeurs,
  CLE_CFG, CLE_SESSION, contenuJeton, resteJeton, echangeSession, RESTE_JETON,
  exporteExposants, brancheExport,
  DEFAUT_CHAMP, AUCUN_CHAMP, encode, decode, correspondance, intitule, intituleSuite,
  ACCORDS, aplani, autreFace,
  brancheAvancement,
  reduitIcone,
  brancheFonctions, refus,
  brancheFuseau, champFuseau,
  brancheSynchronisation, synchronise,
  poseComptes, brancheComptes, litMonProfil, ouvreComptes,
  poseEvenements, brancheEvenements, slugifie, courant, chargePlans, majEvenement,
  brancheProvenance,
  brancheFicheDetail,
  brancheDuplication, dupliquer,
  brancheFiche, dessineFiche, ouvreSources,
});

/* Le profil du compte connecté est un état du module des comptes, remplacé à
   chaque chargement : le code soudé le lit par son nom, toujours à jour, et
   l'oublie par `poseComptes`. */
Object.defineProperties(globalThis, vivants({ MOI: () => MOI }, "poseComptes"));

/* Les salons, celui qu'on regarde et leurs pavillons sont des états du module
   des salons, remplacés au chargement, au choix dans la liste, à la création
   et au rechargement : le code soudé les lit par leur nom, toujours à jour, et
   les remplace par `poseEvenements`. */
Object.defineProperties(globalThis, vivants({
  EVTS: () => EVTS, selection: () => selection, PLANS: () => PLANS,
}, "poseEvenements"));
