/* ============================================================
   La suggestion — un exposant de plus, pour compléter la visite

   Un visiteur qui retient quatre enseignes du même secteur ne compose pas une
   liste au hasard : il cherche quelque chose, et sa liste le dit avant lui. Le
   tiroir du parcours lui propose alors un exposant de plus, pris dans ce qui
   revient déjà — le plus consulté du salon sur ce critère, ou celui que
   l'organisateur a désigné.

   Rien ne quitte l'appareil pour autant : le rapprochement se fait sur la
   liste qu'il a sous les yeux, avec des tables préparées en administration et
   publiées comme le reste des réglages. Le plan ne demande rien au serveur, et
   ne lui apprend pas ce que le visiteur retient.

   D'où la forme de ces tables. Les compteurs d'usage ne sont lisibles que d'un
   compte qui a accès au salon — `audience_cibles` est en « security invoker »,
   et le plan public n'y entrera jamais. Le classement est donc relevé en
   administration, réduit à ce que la suggestion en fera — les trois exposants
   les plus consultés de chaque valeur — et c'est ce relevé qui part aux
   visiteurs. Publier le classement entier aurait dit à tout le monde quel
   stand personne n'ouvre ; trois noms par valeur ne disent que ce qu'ils
   proposent.

   Ce module porte ce que le visiteur reçoit : la proposition, sa carte, sa
   fenêtre. Le volet « Suggestion » des réglages et le relevé du classement
   vivent dans `modules/reglage-suggestion.mjs`, que seul `plan-admin.mjs`
   embarque. La fiche, la configuration et l'option vendue s'importent
   (`fiche.mjs`, `configuration.mjs`), les critères de la recherche de
   `recherche.mjs`. Le tiroir du parcours (`tiroir-parcours.mjs`) importe
   celui-ci pour y poser la proposition, et ne peut donc s'importer d'ici :
   il se confie en se chargeant, par `confieALaSuggestion`. Le module n'a pas
   de branchement.
   ============================================================ */
import { $ } from "./dom.mjs";
import { COLLATION } from "./texte.mjs";
import { DATA, parId } from "./donnees.mjs";
import { ouvreModale, fermeModale } from "./fenetre.mjs";
import { PARCOURS, boutonParcours, dansParcours } from "./parcours.mjs";
import { OUI_NON, clesCriteres, valeursCritere, libelleCritere } from "./recherche.mjs";
import { select } from "./fiche.mjs";
import { conf, suggestionOfferte } from "./configuration.mjs";

/**
 * Ce que la carte emprunte au tiroir du parcours (`tiroir-parcours.mjs`), qui
 * l'importe pour la poser : de quoi refaire le tiroir et poser le bouton « au
 * parcours ». Il ne l'appelle que de là — le tiroir qu'il remplit, l'ajout
 * qui peut faire atteindre le seuil —, et le lui passe donc à chaque appel.
 * La fiche, la configuration et l'option vendue s'importent.
 * @typedef {{ remplit: () => void,
 *   branche: (hote: any, canal: any) => void }} TiroirDuParcours
 */


/* Trois exposants du même critère : deux sont une coïncidence, quatre une
   habitude. C'est le seuil qu'on propose, pas celui qu'on impose. */
const SUGG_SEUIL_DEFAUT = 3;
export const SUGG_SEUIL_MIN = 2, SUGG_SEUIL_MAX = 12;

/* Ce que le visiteur a écarté d'un revers de main, le temps de cette page.
   En mémoire et non dans son stockage : un refus porte sur l'instant — la
   liste qu'il avait alors, l'exposant qu'on lui mettait sous les yeux — et le
   retenir d'une visite à l'autre condamnerait un exposant sans raison. */
export const SUGG_ECARTES = new Set();

/* Et ce que la fenêtre a déjà mis au premier plan. Une proposition ne s'impose
   qu'une fois : revenue à chaque ajout, elle se ferait fermer sans être lue,
   puis fermerait le plan avec elle. Le tiroir, quand on l'y pose aussi, n'a
   pas ce scrupule à avoir — on y va pour la voir. */
export const SUGG_MONTREES = new Set();

/* La mesure a son canal. Une fiche ouverte depuis la proposition, un exposant
   ajouté depuis elle, ne se comptent pas comme ceux qu'on est allé chercher :
   c'est le seul chiffre qui dise si la fonction sert. Le vocabulaire est celui
   des compteurs — voir la migration « suggestion_un_canal_de_mesure_a_elle ». */
const CANAL_SUGG = "suggestion";

/* ------------------------------------------------------------
   Le réglage
   ------------------------------------------------------------ */
export const reglageSugg = () => conf("_suggestion");

export function seuilSugg(){
  const v = Math.round(+reglageSugg().seuil);
  return v >= SUGG_SEUIL_MIN && v <= SUGG_SEUIL_MAX ? v : SUGG_SEUIL_DEFAUT;
}

/**
 * Où la proposition se présente : l'un, l'autre, ou les deux.
 *
 * « tiroir » l'attend en tête du parcours, là où le visiteur va de lui-même ;
 * « fenetre » la met au premier plan dès que le seuil est atteint. La seconde
 * se voit, et c'est tout son intérêt comme tout son risque : elle interrompt.
 * D'où le réglage plutôt qu'un choix fait à la place de l'organisateur — un
 * salon professionnel de deux heures et un salon grand public d'un week-end
 * n'ont pas la même tolérance à l'interruption. Les deux ensemble ne se
 * contredisent pas : la fenêtre refermée, la proposition reste là où le
 * visiteur la retrouvera s'il change d'avis.
 *
 * Le réglage a d'abord été un choix unique, écrit en chaîne : un salon publié
 * avant les deux cases garde ce qu'il avait choisi. Une liste vide se lit
 * comme le tiroir seul : éteindre la fonction revient à la case « Proposer »,
 * pas à celle-ci.
 */
export const PRESENTATIONS_SUGG = ["tiroir", "fenetre"];

export function presentationsSugg(){
  const v = reglageSugg().presentation;
  const l = Array.isArray(v) ? PRESENTATIONS_SUGG.filter(x => v.indexOf(x) >= 0)
          : [v === "fenetre" ? "fenetre" : "tiroir"];
  return l.length ? l : ["tiroir"];
}
const presenteSugg = (ou) => presentationsSugg().indexOf(ou) >= 0;

/** Le critère sur lequel on rapproche, s'il désigne encore quelque chose. Un
 *  champ décoché dans la console, ou des secteurs éteints depuis, ne le font
 *  pas : la suggestion se tait plutôt que de rapprocher sur du vide. */
export function critereSugg(){
  const cle = reglageSugg().critere;
  return cle && clesCriteres().indexOf(cle) >= 0 ? cle : null;
}

/* ------------------------------------------------------------
   Côté visiteur
   ------------------------------------------------------------ */
/**
 * Ce qu'on propose, et pourquoi — ou rien.
 *
 * La valeur qui revient le plus l'emporte, et l'on descend jusqu'à en trouver
 * une qui ait encore quelqu'un à proposer : un visiteur qui a déjà retenu les
 * trois enseignes que le relevé connaît pour son secteur n'en est pas quitte
 * pour autant — le deuxième secteur de sa liste prend le relais, s'il atteint
 * lui aussi le seuil.
 */
function suggestionCourante(){
  /* L'option d'abord, le réglage ensuite : le salon qui n'a pas pris la
     recommandation n'a pas d'onglet où la régler, et un réglage écrit avant
     qu'on la ferme ne doit pas continuer de proposer. */
  if (!suggestionOfferte()) return null;
  const r = reglageSugg();
  if (r.active !== true) return null;
  // le parcours retiré, il n'y a plus de tiroir où poser la proposition
  if (conf("_parcours").visible === false) return null;
  const cle = critereSugg();
  if (!cle) return null;

  const seuil = seuilSugg();
  const retenus = PARCOURS.stands.map(id => parId.get(id)).filter(Boolean);
  if (retenus.length < seuil) return null;

  const compte = new Map();
  retenus.forEach(o => new Set(valeursCritere(o, cle))
    .forEach(v => compte.set(v, (compte.get(v) || 0) + 1)));

  const fortes = [...compte].filter(([, n]) => n >= seuil)
    .sort((a, b) => (b[1] - a[1]) || COLLATION.compare(a[0], b[0]));
  for (const [v, n] of fortes){
    const o = exposantPropose(cle, v);
    if (o) return { cle: cle, valeur: v, n: n, o: o };
  }
  return null;
}

/**
 * L'exposant que cette valeur appelle, s'il en reste un.
 *
 * Les deux provenances rendent la même chose — des identifiants, dans l'ordre
 * où on les proposera — et se lisent donc pareil. Ce qui les sépare est en
 * amont : l'une est relevée dans les compteurs, l'autre écrite à la main.
 */
function exposantPropose(cle, v){
  const r = reglageSugg();
  const pris = new Set(PARCOURS.stands.map(String));
  const ids = r.source === "fixe"
    ? [(r.fixes || {})[v]]
    : ((r.auto || {})[v] || []);
  for (const id of ids){
    const o = id ? parId.get(String(id)) : null;
    /* Déjà dans la liste, il ne la compléterait pas ; démonté depuis le
       relevé, il n'est plus nulle part ; écarté, on vient de le dire. */
    if (o && o.kind === "stand" && o.nom &&
        !pris.has(String(o.id)) && !SUGG_ECARTES.has(String(o.id))) return o;
  }
  return null;
}

/** « Agroalimentaire », ou l'intitulé du champ quand la valeur ne dit rien
 *  d'elle-même : un oui/non ne se coche que sous le nom de sa question. */
export const nomValeurSugg = (cle, v) => OUI_NON[cle] ? libelleCritere(cle) : v;

/* Comment se nomme ce que plusieurs exposants ont en commun.
   Les critères que le plan connaît d'avance ont leur article — « du secteur »,
   « de la ville ». Un champ que le salon s'est ajouté n'en a pas : rien ne dit
   le genre de « Famille » ni d'« Univers », et « de la famille » sur un salon
   qui range par « Univers » se lirait de travers. Ceux-là se disent « marqués
   « X » », qui va avec tout — et avec le oui/non par la même occasion, dont la
   valeur cochée n'est jamais qu'un « Oui ». */
const ARTICLE_CRITERE = {
  secteur: "du secteur", ville: "de la ville", pays: "du pays",
  nomenclature: "de la nomenclature", thematiques: "de la thématique",
};

/**
 * Ce que la proposition dit d'elle-même : d'où elle vient, puis où elle mène.
 *
 * Dans cet ordre, et en une phrase. Un nom qui tombe sans motif se lit comme
 * de la réclame ; le même, précédé de ce que le visiteur vient de retenir trois
 * fois, se lit comme la suite de ce qu'il était en train de faire.
 */
function phraseSuggestion(s){
  const art = ARTICLE_CRITERE[s.cle];
  const quoi = art ? art + " « " + s.valeur + " »"
                   : "marqués « " + nomValeurSugg(s.cle, s.valeur) + " »";
  return "Vous avez ajouté " + s.n + " exposants " + quoi + " à votre liste. " +
         "Vous pourriez être intéressé par l'exposant " + s.o.nom + ".";
}

/**
 * La carte, telle qu'elle se lit des deux côtés : en tête du tiroir, ou au
 * premier plan dans sa fenêtre.
 *
 * La même, parce que c'est la même proposition : le motif, l'exposant, et les
 * deux gestes qu'on peut faire dessus — le retenir, ou aller le voir sur le
 * plan. Les deux portent le canal de la suggestion jusqu'aux compteurs.
 *
 * Le retenir est ce pour quoi la carte s'affiche, et le geste se donne donc au
 * pied, en toutes lettres et sur toute la largeur. Le signet des rangs du
 * parcours, posé de côté, ne le disait qu'à qui savait déjà le lire : une
 * marque de vingt-huit pixels à côté d'un nom n'a pas l'air de la réponse
 * qu'une proposition attend, et sous une fenêtre à deux boutons elle ne
 * pesait plus rien du tout — on y lit les boutons.
 *
 * `ferme` n'est donné que par la fenêtre, et la désigne autant qu'il la
 * referme : le bandeau de la carte y disparaît — son intitulé serait celui de
 * la fenêtre, redit une ligne plus bas — et sa croix avec, la fenêtre ayant
 * déjà la sienne et son « Non merci ».
 */
/** @param {any} s @param {(() => void) | null} ferme @param {TiroirDuParcours} tiroir */
function carteSuggestion(s, ferme, tiroir){
  const o = s.o;
  const d = document.createElement("div");
  d.className = "pSugg";
  d.innerHTML = '<div class="sTete"><span class="eyebrow">Pour compléter votre visite</span>' +
    '<button type="button" class="sEcarte" title="Ne plus me proposer celui-ci" ' +
    'aria-label="Ne plus me proposer celui-ci">&times;</button></div>' +
    '<p class="sMotif"></p>' +
    '<div class="pRang"><button type="button" class="pOuvre">' +
    '<span class="pt"></span><span class="ps"></span></button></div>' +
    boutonParcours("stand", o.id);

  if (ferme) d.querySelector(".sTete").remove();

  d.querySelector(".sMotif").textContent = phraseSuggestion(s);
  d.querySelector(".pt").textContent = o.nom;
  d.querySelector(".ps").textContent =
    DATA.plans[o.p].libelle + (o.code ? " · " + o.code : "");
  /* Aller le voir, c'est vouloir le voir sur le plan : la fiche s'ouvre et ce
     qui la cachait se retire, comme pour un rang du parcours. */
  d.querySelector(".pOuvre").onclick = () => {
    if (ferme) ferme();
    select(o.id, true, CANAL_SUGG);
  };
  const croix = d.querySelector(".sEcarte");
  if (croix) croix.onclick = () => {
    SUGG_ECARTES.add(String(o.id));
    tiroir.remplit();
  };
  // le bouton vit comme les signets : il ajoute, il compte, et il se retourne
  tiroir.branche(d, CANAL_SUGG);
  /* La fenêtre s'est ouverte pour cette proposition-là : acceptée, elle n'a
     plus rien à dire, et « Non merci » sous un exposant qu'on vient de retenir
     se lirait de travers. Le tiroir fait de même à sa façon — la carte y cède
     la place au rang, ou à la proposition suivante. Branché après
     le bouton du tiroir pour passer après la bascule, et non avant elle. */
  if (ferme) d.querySelector(".parc").addEventListener("click", () => {
    if (dansParcours("stand", o.id)) ferme();
  });
  return d;
}

/**
 * La proposition en tête du tiroir du parcours, quand il y en a une.
 *
 * Seulement si le tiroir est coché : l'organisateur qui n'a choisi que la
 * fenêtre ne veut pas la même carte redite dans le parcours, où elle
 * reviendrait attendre le visiteur qui l'a refermée d'un « Non merci ».
 */
/** @param {HTMLElement} hote @param {TiroirDuParcours} tiroir */
export function poseSuggestion(hote, tiroir){
  if (!presenteSugg("tiroir")) return;
  const s = suggestionCourante();
  if (s) hote.appendChild(carteSuggestion(s, null, tiroir));
}

/**
 * La même, au premier plan.
 *
 * Appelée depuis l'ajout d'un exposant au parcours, et de là seulement : c'est
 * le geste qui peut faire atteindre le seuil. Le chargement d'une liste retenue
 * lors d'une visite précédente n'en est pas un — accueillir le visiteur par une
 * fenêtre qu'il n'a pas demandée serait autre chose que compléter sa visite.
 */
/** @param {TiroirDuParcours} tiroir */
export function fenetreSuggestion(tiroir){
  if (!presenteSugg("fenetre")) return;
  /* Une fenêtre déjà ouverte a été demandée, elle : la remplacer par une
     proposition que personne n'attendait ferait perdre ce qu'on y faisait —
     un réglage en cours de saisie, une confirmation à donner. */
  if ($("modale").classList.contains("open")) return;
  const s = suggestionCourante();
  if (!s) return;
  /* Une proposition ne s'impose qu'une fois. La valeur autant que l'exposant :
     le même nom proposé pour un autre motif est une autre proposition. */
  const marque = s.cle + "\u0000" + s.valeur + "\u0000" + s.o.id;
  if (SUGG_MONTREES.has(marque)) return;
  SUGG_MONTREES.add(marque);
  /* Le rang de la carte s'ouvre au clic, comme dans le tiroir — mais dans une
     fenêtre à deux boutons, on lit les boutons et pas les rangs. Le geste est
     donc redit au pied, où on l'attend.

     En retrait, lui : l'accent revient au bouton de la carte, parce que
     compléter sa visite, c'est retenir l'exposant — le voir sur le plan est
     l'autre chemin, celui qu'on prend quand on veut d'abord regarder. Deux
     boutons pleins auraient laissé la proposition sans réponse évidente. */
  ouvreModale("Pour compléter votre visite", corps => {
    corps.appendChild(carteSuggestion(s, fermeModale, tiroir));
  }, [{ libelle: "Non merci" },
      { libelle: "Voir sur le plan",
        action: () => select(s.o.id, true, CANAL_SUGG) }], "sugg");
}