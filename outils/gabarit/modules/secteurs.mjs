/* ============================================================
   Les secteurs du salon, et la teinte de chacun sur le plan

   L'index des secteurs, refait à chaque
   chargement (`indexeSecteurs`, que `index-salon.mjs` `indexe` appelle), la couleur
   que le plan et le sélecteur montrent, la pastille qu'une puce de critère
   porte, et la teinte posée sur les stands. Seul `indexeSecteurs` remplace
   `SECTEURS` ; la configuration, qui ne peut l'importer, le reçoit par un
   lecteur, confié au chargement (`confieALaConfiguration`).

   La carte de chaleur se pose sur les mêmes formes et suit la teinte ; elle
   n'est que d'administration (`modules/chaleur.mjs`, par `plan-admin.mjs`),
   qui la confie à ce module en se chargeant (`confieChaleur`) : la page
   publique, qui ne l'embarque pas, garde la teinte seule.
   ============================================================ */
import { COLLATION } from "./texte.mjs";
import { hslHex } from "./couleurs.mjs";
import { DATA, parId } from "./donnees.mjs";
import { conf, jeton, confieALaConfiguration } from "./configuration.mjs";

/* La carte de chaleur, quand la page l'a reçue ; rien sinon. */
let coloreChaleur = () => {};

/** La porte de la carte de chaleur, que `chaleur.mjs` ouvre en se chargeant.
 *  @param {() => void} f */
export function confieChaleur(f){ coloreChaleur = f; }

/* Les secteurs, et la teinte de chacun.

   Les teintes tournent sur une roue plutôt que de se tirer d'une palette
   nommée : un salon découpe en cinq secteurs, un autre en dix-huit, et une
   palette finie redonnerait deux fois la même couleur sans qu'on l'ait voulu.
   L'ordre est celui des noms, jamais celui des stands : le même secteur garde
   sa couleur d'un pavillon à l'autre, et d'une synchronisation à la suivante. */
const TEINTES = [212, 28, 145, 340, 262, 42, 190, 8, 100, 310, 172, 62];
export let SECTEURS = new Map();

export function indexeSecteurs(){
  const noms = [...new Set(DATA.plans.flatMap(p => p.stands.map(s => s.sect)))]
    .filter(Boolean).sort(COLLATION.compare);
  SECTEURS = new Map(noms.map((n, i) => [n, TEINTES[i % TEINTES.length]]));
}

/**
 * Les secteurs se montrent-ils ?
 *
 * Un salon qui ne sectorise pas n'a rien à montrer ; ailleurs c'est un réglage,
 * car un plan déjà réglé au blanc ou à la couleur maison de l'exploitant ne
 * doit pas se retrouver bariolé sans qu'il l'ait demandé.
 */
export const secteursMontres = () => SECTEURS.size > 0 && conf("_secteurs").visible !== false;

/* La configuration voyage par la base et finit dans un attribut de style : on
   n'accepte d'elle que la forme hexadécimale, celle que rend le sélecteur. */
const couleurConf = v => /^#[0-9A-Fa-f]{3,8}$/.test(String(v || "")) ? String(v) : null;

/**
 * La couleur d'un secteur, telle que le plan la montre.
 *
 * Celle que l'exploitant a choisie s'il l'a fait ; sinon la teinte automatique,
 * résolue comme le plan la résout — c'est bien la couleur qu'on voit à l'écran
 * que le sélecteur doit présenter, et non la teinte brute d'où elle sort.
 */
export function couleurSecteur(nom){
  return couleurConf(conf("secteur:" + nom).couleur) ||
    hslHex(SECTEURS.get(nom) || 0,
           parseFloat(jeton("--sect-s")) || 58, parseFloat(jeton("--sect-l")) || 87);
}

/**
 * La pastille d'un secteur, telle qu'une puce de critère la porte.
 *
 * Le secteur a rejoint les critères de recherche, où rien d'autre n'est
 * coloré : sa teinte n'y est plus une décoration mais ce qui rattache le nom
 * qu'on coche aux stands qu'on voit sur le plan. Elle vient donc avec lui,
 * là où la bande la portait.
 */
export function pastilleSecteur(nom){
  const h = SECTEURS.get(nom);
  if (h === undefined) return "";
  const c = couleurConf(conf("secteur:" + nom).couleur);
  return '<i class="pastille" style="--sect-h:' + h +
    (c ? ";--sect-c:" + c : "") + '"></i>';
}

/**
 * La teinte du secteur, posée sur le groupe du stand plutôt que sur son tracé :
 * la feuille de style la lit de là, et garde la main sur le survol et la
 * sélection, qui doivent l'emporter sur elle.
 */
export function coloreSecteurs(){
  /* Le coloriage éteint, le stand perd sa marque de secteur : la feuille de
     style n'a plus de teinte à poser, sans qu'on ait à la lui interdire.

     Les stands dessinés à la main la reçoivent aussi : ils découpent un
     emplacement, et un découpage qui ne prendrait pas sa couleur trouerait le
     secteur d'un blanc que rien n'expliquerait. */
  const on = secteursMontres();
  document.querySelectorAll("#stands g, #couches .dcal .sdes[data-id]").forEach(g => {
    const o = parId.get(g.dataset.id);
    const nom = on && o ? o.sect : null;
    const h = nom ? SECTEURS.get(nom) : undefined;
    if (h === undefined){
      g.removeAttribute("data-sect");
      g.style.removeProperty("--sect-h");
      g.style.removeProperty("--sect-c");
    } else {
      g.setAttribute("data-sect", "");
      g.style.setProperty("--sect-h", h);
      /* Une couleur choisie remplace la teinte au lieu de s'y ajouter : elle
         se pose telle quelle, comme celle des autres couches, et ne se laisse
         donc pas pâlir par la clarté dont le plan tient les secteurs. */
      const c = couleurConf(conf("secteur:" + nom).couleur);
      if (c) g.style.setProperty("--sect-c", c);
      else g.style.removeProperty("--sect-c");
    }
  });
  /* La carte de chaleur se pose sur les mêmes formes et par-dessus la même
     teinte. Elle suit donc ici : c'est le seul point que traversent tous les
     chemins qui rebâtissent les stands — changement de pavillon, arrivée du
     fond, rafraîchissement des découpages dessinés. Elle ne fait rien tant
     qu'on ne l'a pas ouverte, ce qui n'arrive qu'en administration — la seule
     page qui la reçoive (`modules/chaleur.mjs`, par `plan-admin.mjs`). */
  coloreChaleur();
}

/**
 * La teinte d'un seul secteur, posée sans relire tout le plan.
 *
 * `coloreSecteurs` balaie les stands du salon et rappelle la carte de chaleur :
 * c'est ce qu'il faut quand la sectorisation change, et bien trop quand une
 * seule couleur bouge — le nuancier en envoie une rafale, et le balayage
 * complet ne tient pas ce rythme. Ici on ne touche que les stands concernés ;
 * le reste est déjà en place et le restera.
 */
export function peintSecteur(nom){
  if (!secteursMontres()) return;
  const c = couleurConf(conf("secteur:" + nom).couleur);
  document.querySelectorAll("#stands g[data-sect], #couches .dcal .sdes[data-sect]")
    .forEach(g => {
      const o = parId.get(g.dataset.id);
      if (!o || o.sect !== nom) return;
      if (c) g.style.setProperty("--sect-c", c);
      else g.style.removeProperty("--sect-c");
    });
}

/* Les secteurs, confiés à la configuration dès que ce module se charge : elle
   les relit pour savoir si une clé nomme un secteur, et ne peut importer ce
   module, qui l'importe. Par un lecteur, puisque l'index les remplace à chaque
   chargement. */
confieALaConfiguration({ secteurs: () => SECTEURS });
