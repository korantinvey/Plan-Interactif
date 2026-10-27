/* ============================================================
   Les secteurs du salon, et la teinte de chacun sur le plan

   L'index des secteurs, refait à chaque
   chargement (`indexeSecteurs`, que `index-salon.mjs` `indexe` appelle), la couleur
   que le plan et le sélecteur montrent, la pastille qu'une puce de critère
   porte, et la teinte posée sur les stands. Seul `indexeSecteurs` remplace
   `SECTEURS`, qu'il range avec les autres index du salon (`donnees.mjs`) :
   la configuration l'y lit.

   Le découpage suit le secteur tant que l'exploitant n'en a pas choisi un
   autre (`champDecoupage`) : la ville, le pays, un champ propre au salon. Le
   module garde son nom et ses mots — « secteur » y désigne une part du
   découpage, quel que soit le champ qui la trace.

   La carte de chaleur se pose sur les mêmes formes et suit la teinte ; elle
   n'est que d'administration (`modules/chaleur.mjs`, par `plan-admin.mjs`),
   qui la confie à ce module en se chargeant (`injecteChaleur`) : la page
   publique, qui ne l'embarque pas, garde la teinte seule.
   ============================================================ */
import { COLLATION } from "./texte.mjs";
import { hslHex } from "./couleurs.mjs";
import { DATA, parId, SECTEURS, poseDonnees } from "./donnees.mjs";
import { conf, jeton } from "./configuration.mjs";
import { valeursCritere, CLE_SECTEUR } from "./filtre.mjs";
import { libelleCritere, PREFIXE_PERSO } from "./corps-fiche.mjs";

/* La carte de chaleur, quand la page l'a reçue ; rien sinon. */
let coloreChaleur = () => {};

/** L'injection de la carte de chaleur, que `chaleur.mjs` remplit en se chargeant.
 *  @param {() => void} f */
export function injecteChaleur(f){ coloreChaleur = f; }

/** Le champ qui découpe le salon en couleurs : le secteur, sauf choix contraire. */
export const champDecoupage = () => conf("_secteurs").champ || CLE_SECTEUR;

/* La première valeur d'un champ sur un stand. Le secteur se lit en direct :
   c'est celui de l'emplacement, et il est là même quand le critère ne l'est pas. */
const premiere = (o, champ) =>
  (champ === CLE_SECTEUR ? o.sect : valeursCritere(o, champ)[0]) || null;

/**
 * La part du découpage où tombe un stand, ou rien.
 *
 * Une seule valeur par stand : un stand n'a qu'une couleur. Un champ à valeurs
 * multiples s'y range donc sous la première — c'est pourquoi nomenclature et
 * thématiques, qui en portent des dizaines, ne sont pas offertes au choix
 * (`champsDecoupables`).
 */
export const valeurDecoupage = (o) => premiere(o, champDecoupage());

/**
 * Où se range la couleur choisie pour une part du découpage.
 *
 * Celle d'un secteur garde sa clé d'avant (« secteur:nom »), sans quoi les
 * salons déjà réglés perdraient leurs couleurs. Les autres champs se rangent
 * sous « _secteurs », un tiroir par champ : revenir à la ville après un détour
 * par le pays retrouve les couleurs qu'on lui avait données, et deux champs
 * qui partagent une valeur — « Oui » — ne se la disputent pas.
 * @param {string} nom
 */
export function confTeinte(nom){
  const champ = champDecoupage();
  if (champ === CLE_SECTEUR) return conf("secteur:" + nom);
  const s = conf("_secteurs");
  const parChamp = s.teintes = s.teintes || {};
  const t = parChamp[champ] = parChamp[champ] || {};
  return t[nom] = t[nom] || {};
}

/* Les champs qu'on peut proposer pour découper : ceux qui tiennent en une
   valeur par stand. Les champs propres au salon s'y ajoutent à leur suite. */
const DECOUPABLES = [CLE_SECTEUR, "ville", "pays", "nouveau", "adherent"];

/**
 * Les champs que le salon renseigne, chacun avec son nombre de parts.
 *
 * Un champ qu'aucun stand ne remplit ne découperait rien : il n'est pas
 * proposé — sauf celui qui est en place, pour qu'on voie ce qui est retenu
 * même après une synchronisation qui l'aurait vidé.
 * @returns {{cle: string, libelle: string, n: number}[]}
 */
export function champsDecoupables(){
  const persos = ((DATA && DATA.fiche && DATA.fiche.perso) || [])
    .filter(c => c && c.cle).map(c => PREFIXE_PERSO + c.cle);
  const stands = (DATA ? DATA.plans : []).flatMap(p => p.stands);
  const actuel = champDecoupage();
  return DECOUPABLES.concat(persos).map(cle => ({
    cle, libelle: libelleCritere(cle),
    n: new Set(stands.map(o => premiere(o, cle)).filter(Boolean)).size,
  })).filter(c => c.n > 0 || c.cle === actuel);
}

/* Les secteurs, et la teinte de chacun.

   Les teintes tournent sur une roue plutôt que de se tirer d'une palette
   nommée : un salon découpe en cinq secteurs, un autre en dix-huit, et une
   palette finie redonnerait deux fois la même couleur sans qu'on l'ait voulu.
   L'ordre est celui des noms, jamais celui des stands : le même secteur garde
   sa couleur d'un pavillon à l'autre, et d'une synchronisation à la suivante. */
const TEINTES = [212, 28, 145, 340, 262, 42, 190, 8, 100, 310, 172, 62];
export function indexeSecteurs(){
  const noms = [...new Set(DATA.plans.flatMap(p => p.stands.map(valeurDecoupage)))]
    .filter(Boolean).sort(COLLATION.compare);
  poseDonnees({ SECTEURS: new Map(noms.map((n, i) => [n, TEINTES[i % TEINTES.length]])) });
}

/* L'index lui-même vit avec les autres, dans `donnees.mjs` ; il s'importe
   d'ici comme avant. */
export { SECTEURS };

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
  return couleurConf(confTeinte(nom).couleur) ||
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
  const c = couleurConf(confTeinte(nom).couleur);
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
    const nom = on && o ? valeurDecoupage(o) : null;
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
      const c = couleurConf(confTeinte(nom).couleur);
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
  const c = couleurConf(confTeinte(nom).couleur);
  document.querySelectorAll("#stands g[data-sect], #couches .dcal .sdes[data-sect]")
    .forEach(g => {
      const o = parId.get(g.dataset.id);
      if (!o || valeurDecoupage(o) !== nom) return;
      if (c) g.style.setProperty("--sect-c", c);
      else g.style.removeProperty("--sect-c");
    });
}
