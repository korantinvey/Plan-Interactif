/* ============================================================
   L'application installée — ce que le plan public en sait

   Le plan public s'ajoute à l'écran d'accueil comme une application
   (`installation.mjs`), et l'icône qui s'y posait était celle du produit :
   la même pour tous les salons. L'organisateur dépose donc la sienne et écrit
   le nom qui paraîtra dessous — le réglage vit dans `reglage-application.mjs`,
   que seule l'administration reçoit.

   Ce module-ci est la part que le visiteur reçoit : où le relais sert l'icône
   de ce salon, et ce que le salon a choisi de porter. La fenêtre qui invite à
   installer s'en sert pour montrer l'icône qu'on aura.
   ============================================================ */
import { API } from "./salon.mjs";
import { DATA } from "./donnees.mjs";

/**
 * L'adresse où le relais sert l'icône de ce salon.
 *
 * Déduite de celle du plan plutôt qu'écrite une seconde fois : les deux sont
 * des chemins du même relais, et un déploiement ailleurs n'a ainsi qu'un
 * réglage à changer. L'empreinte que la base calcule entre dans l'adresse —
 * une icône remplacée change donc d'adresse, et tout ce qui garde celle-ci
 * peut la garder pour toujours (`src/index.mjs` `iconeApp`).
 */
function adresseIconeApp(empreinte, masque){
  if (!API || !empreinte || !DATA || !DATA.slug) return "";
  return API.replace(/\/[^/]*$/, "/icone") +
    "?salon=" + encodeURIComponent(DATA.slug) +
    (masque ? "&masque=1" : "") + "&v=" + encodeURIComponent(empreinte);
}

/** Ce que le salon a choisi de porter : son nom d'application, son icône. */
export const appDuSalon = () => (DATA && DATA.app) || {};

/** L'icône de l'application de ce salon, s'il en a déposé une. */
export const iconeDeLApplication = (masque) => adresseIconeApp(appDuSalon().icone, masque);
