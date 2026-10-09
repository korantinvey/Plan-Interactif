/* ============================================================
   Les aperçus de la fenêtre des réglages — l'exploitant seul

   Les vignettes qui montrent une liste et une fiche sous chaque habillage, et
   le relevé du salon qu'elles se partagent : quels champs il renseigne, quel
   stand les remplit le mieux, quels voisins la liste lui donne. Les volets
   « Apparence » (`volets.mjs`) et « Fiche Stand » (`reglage-fiche.mjs`) les
   importent.

   Un module de l'administration : `plan-admin.mjs` l'embarque, le visiteur ne
   le reçoit jamais. L'ordre et les libellés des champs, leur rangement en
   sections, les pictos des réseaux sociaux et ce que la fiche montre
   s'importent de `corps-fiche.mjs`, la règle même que la fiche applique. Ce
   que la recherche tient encore dans le code soudé — le préfixe des champs
   propres au salon, le code d'une case de la liste — lui est confié par
   `brancheApercus`, que `_reglages.html` appelle à la place que ce code y
   tenait.
   ============================================================ */
import { esc, separeValeurs, COLLATION } from "./texte.mjs";
import { DATA } from "./donnees.mjs";
import { montre, libelleCorps, ordreCorps, corpsRange, PICTO_RS, pictoRS } from "./corps-fiche.mjs";

/* Ce que le code soudé confie au branchement. Tout y est déclaré avant lui
   (`_recherche.html`) et ne change plus : on le prend tel quel. */
let PREFIXE_PERSO;
let codeCase;

/**
 * Le branchement des aperçus, appelé par le code soudé à la place que ce code
 * y tenait (`_reglages.html`), dans une tranche que le visiteur ne reçoit pas.
 *
 * @param {{ PREFIXE_PERSO: string, codeCase: Function }} b
 */
export function brancheApercus(b){
  ({ PREFIXE_PERSO, codeCase } = b);
}

/* ------------------------------------------------------------------
   L'exposant des aperçus

   Les onze vignettes montrent la même liste et la même fiche sous onze
   habillages : c'est en les comparant à elles-mêmes qu'on choisit. Mais elles
   ne peuvent pas être inventées — un salon qui a retiré l'adresse et remonté
   sa nomenclature choisirait son modèle sur des champs qu'il n'affiche pas,
   dans un ordre qui n'est pas le sien.

   Les vignettes portent donc les champs retenus, dans l'ordre réglé depuis la
   console, et les valeurs d'un vrai stand — et, à côté, les voisins de
   sommaire de ce stand, tels que la liste les rangerait.
   ------------------------------------------------------------------ */

/* Comment lire chaque champ du corps sur un stand. Les mêmes sources que la
   fiche : ce que le plan porte reste au stand, le reste vient de la société. */
const LECTURE_CORPS = {
  raison: o => o.plan && o.plan !== o.nom ? o.plan : "",
  secteur: o => o.sect,
  adresse: o => o.adr,
  // le code postal se pose devant la ville, comme sur la fiche
  ville: o => [o.cp, o.ville].filter(Boolean).join(" "),
  pays: o => o.pays,
  niveaux: o => o.niveaux > 1 ? String(o.niveaux) : "",
  telephone: o => o.tel,
  site: o => o.site,
  facebook: o => o.fb,
  linkedin: o => o.li,
  instagram: o => o.ig,
  nomenclature: o => o.nomencl,
  thematiques: o => o.themes,
};

/* Les champs qui tiennent en un mot s'apparient deux par deux sur écran
   étroit : la vignette le montre, comme la fiche le fait. */
const COURTS_CORPS = ["ville", "pays", "niveaux", "telephone"];

/* De quoi remplir un champ que le stand retenu ne renseigne pas, quand
   d'autres du salon le portent. Le taire ferait choisir un modèle sur une
   fiche plus courte que la vraie, et laisserait croire le champ retiré. */
const EXEMPLES_CORPS = {
  nom: "Ateliers Ligneron", code: "D14", pavillon: "Pavillon 2",
  raison: "Ligneron & Fils SARL", secteur: "Aménagement & second œuvre",
  adresse: "8 rue de la Filature", ville: "44000 Nantes", pays: "France",
  niveaux: "2", telephone: "02 40 00 00 00", site: "ateliers-ligneron.fr",
  facebook: "facebook.com/ligneron", linkedin: "linkedin.com/company/ligneron",
  instagram: "instagram.com/ligneron",
  nomenclature: "Menuiserie;Agencement de boutique",
  thematiques: "Réemploi;Bois de pays",
};

/* De quoi peupler la liste d'un salon dont aucun stand n'est encore connu.
   Une liste vide ne dirait rien d'un habillage : c'est sur des lignes qui se
   suivent que se voit un filet, un pointillé ou un rail. */
const EXEMPLES_LISTE = [
  ["B07", "Atelier du Marais"], ["C02", "Bois & Compagnie"],
  ["D14", "Ateliers Ligneron"], ["D22", "Duchêne Agencement"],
  ["E05", "Fonderie de l'Ouest"], ["E18", "Granit Armor"],
  ["F03", "Habitat Lumière"], ["F11", "Menuiseries Rocher"],
];

/** Ce qu'un stand porte pour un champ du corps, en une chaîne. */
function texteCorps(o, cle){
  if (cle.indexOf(PREFIXE_PERSO) === 0){
    return separeValeurs((o.perso || {})[cle.slice(PREFIXE_PERSO.length)]).join(";");
  }
  const l = LECTURE_CORPS[cle];
  return l ? separeValeurs(l(o)).join(";") : "";
}

/**
 * Les champs, parmi ceux-là, que ce salon renseigne vraiment.
 *
 * Un champ de fiche n'existe que si la console lui a désigné un champ
 * d'origine, et que les fiches lues y portent quelque chose : sans cela, la
 * page a beau le ranger, il ne paraîtra sur aucune fiche. Les proposer tous
 * faisait ranger des lignes que personne ne verrait jamais, puis chercher dans
 * le plan la cause d'une absence qui se règle dans la console.
 *
 * On lit donc le salon plutôt que le catalogue des champs possibles — les
 * sociétés hébergées comprises : leur fiche porte les mêmes champs, et un site
 * web qu'aucun titulaire ne renseigne peut n'être qu'à elles.
 *
 * Un salon dont aucun stand n'est encore lu ne prouve rien : avant la première
 * synchronisation tout reste proposé, sans quoi le volet s'ouvrirait vide et
 * le rangement attendrait les données.
 */
export function clesPortees(cles){
  let reste = cles.slice(), lus = 0;
  const lit = (o) => { reste = reste.filter(c => !texteCorps(o, c)); };
  Object.values((DATA || {}).plans || {}).forEach(pl => (pl.stands || []).forEach(o => {
    if (!o.nom) return;
    lus++;
    if (!reste.length) return;
    lit(o);
    (o.coex || []).forEach(lit);
  }));
  return lus ? cles.filter(c => reste.indexOf(c) < 0) : cles;
}

/**
 * Le stand qui remplit le mieux les champs retenus.
 *
 * Le premier venu n'irait pas : il peut n'avoir ni adresse, ni thématique, ni
 * nomenclature — c'est-à-dire rien de ce que les modèles habillent — et on
 * choisirait un habillage sur une fiche vide.
 */
function standApercu(cles){
  let mieux = null, pavillon = "", hall = "", score = 0, neuf = false;
  Object.values(DATA.plans || {}).forEach(pl => (pl.stands || []).forEach(o => {
    if (!o.nom) return;
    neuf = neuf || Boolean(o.neuf);
    const n = cles.reduce((s, c) => s + (texteCorps(o, c) ? 1 : 0), 0);
    if (n > score){
      score = n; mieux = o;
      // le hall tient au stand, pas au pavillon : un plan peut en couvrir deux
      pavillon = pl.libelle || ""; hall = o.hall || "";
    }
  }));
  return { stand: mieux, pavillon, hall, neuf };
}

/**
 * Les lignes de la liste d'aperçu : le stand de la fiche et ses voisins de
 * sommaire, dans l'ordre où la liste les range.
 *
 * Le stand de la fiche est marqué courant, et non le premier venu : les
 * modèles habillent la ligne ouverte plus que les autres — un négatif, un
 * curseur, un point allumé — et c'est celle-là qu'on veut voir en regard de la
 * fiche qui la déplie.
 */
function lignesApercu(stand){
  const pl = stand && DATA.plans ? DATA.plans[stand.p] : null;
  const voisins = ((pl && pl.stands) || []).filter(o => o.nom)
    .sort((a, b) => COLLATION.compare(String(a.nom), String(b.nom)));
  /* Une liste de deux lignes ne montre pas un habillage : sans assez de
     voisins, on prend les exemples plutôt qu'une vignette à moitié vide. */
  if (voisins.length < 4){
    return EXEMPLES_LISTE.map(([code, nom], i) =>
      ({ code, nom, courant: i === 2 }));
  }
  /* Le stand retenu, avec ce qui le précède et ce qui le suit : la vignette
     montre huit lignes, et la sienne ne doit être ni la première ni la
     dernière — un filet de séparation se lit entre deux voisines. */
  const i = Math.max(0, voisins.indexOf(stand));
  const debut = Math.min(Math.max(0, i - 2), Math.max(0, voisins.length - 8));
  return voisins.slice(debut, debut + 8).map(o =>
    ({ code: codeCase(o), nom: o.nom, courant: o === stand }));
}

/**
 * Ce que les onze vignettes montrent : relevé une fois, elles s'en partagent.
 *
 * Un champ propre au salon que le stand retenu ne renseigne pas n'a pas
 * d'exemple à prêter — le code ne connaît pas son sujet — d'où la mention en
 * clair plutôt qu'une valeur inventée qui passerait pour une vraie.
 *
 * Ce que le salon ne renseigne nulle part n'y paraît pas du tout : la fiche ne
 * le montrera jamais, et un habillage choisi sur une ligne qui n'existe pas se
 * choisit sur une autre fiche que la sienne.
 */
export function contenuApercu(){
  const persos = (DATA.fiche && DATA.fiche.perso) || [];
  const cles = clesPortees(ordreCorps(persos.map(c => PREFIXE_PERSO + c.cle))
    .filter(c => montre("stand", c)));
  const { stand, pavillon, hall, neuf } = standApercu(cles);
  const vals = {};
  cles.forEach(c => {
    vals[c] = (stand && texteCorps(stand, c)) || EXEMPLES_CORPS[c] ||
      (c.indexOf(PREFIXE_PERSO) === 0 ? "Valeur d'exemple" : "");
  });
  return {
    cles: cles.filter(c => vals[c]), vals,
    nom: (stand && stand.nom) || EXEMPLES_CORPS.nom,
    code: (stand && stand.code) || EXEMPLES_CORPS.code,
    pavillon: pavillon || EXEMPLES_CORPS.pavillon,
    /* Le hall ne se supplée pas : tous les salons n'en portent pas, et un
       exemple inventé ferait choisir un habillage sur une pastille plus longue
       que la vraie. Il ne paraît donc que coché et renseigné. */
    hall: montre("stand", "hall") ? hall : "",
    /* La pastille ne paraît que là où le salon distingue ses nouveaux venus :
       le réglage seul la ferait voir sur des salons dont aucune fiche ne porte
       le champ, et plusieurs modèles l'habillent — on choisirait sur une
       marque qu'on n'aura jamais. */
    neuf: neuf && montre("stand", "nouveau"),
    lignes: lignesApercu(stand),
    /* Le compteur du pavillon, tel que la liste l'écrit : c'est une ligne de
       texte que plusieurs modèles habillent — capitales, chasse fixe,
       italique — et la taire priverait la vignette de sa tête. */
    compte: (() => {
      const pl = stand && DATA.plans ? DATA.plans[stand.p] : null;
      const n = ((pl && pl.stands) || []).length || EXEMPLES_LISTE.length;
      return n + (n > 1 ? " résultats" : " résultat") + " · " +
        ((pl && pl.libelle) || pavillon || EXEMPLES_CORPS.pavillon);
    })(),
  };
}

export function apercuFiche(cle, vu){
  const d = document.createElement("div");
  d.className = "apercu modele-" + cle;
  // l'aperçu se regarde, il ne se manipule pas
  d.inert = true;
  /* Une adresse web s'affiche en lien sur la fiche : la vignette le montre
     aussi, plusieurs modèles n'habillant que les liens. Les réseaux sociaux,
     eux, s'y montrent en pictos comme sur la fiche — c'est leur hauteur et
     leur couleur qu'on juge en choisissant un habillage, pas celles d'une
     adresse qu'ils n'affichent plus. */
  const LIENS = ["site"];
  /* Les champs sous la forme que « corpsRange » attend, et le rangement par la
     même fonction que la vraie fiche : les groupes réglés par l'exploitant se
     voient donc sur les onze vignettes, sans quoi il choisirait un habillage
     sur une fiche qui n'est plus la sienne. */
  const champs = {};
  vu.cles.forEach(c => {
    const l = separeValeurs(vu.vals[c]);
    if (!l.length) return;
    champs[c] = {
      cle: c,
      libelle: esc(libelleCorps(c)),
      valeur: PICTO_RS[c] ? pictoRS(c, l[0])
        : l.length > 1
        ? l.map(x => '<span class="ligne">' + esc(x) + '</span>')
        : LIENS.indexOf(c) >= 0 ? '<a href="#">' + esc(l[0]) + '</a>' : esc(l[0]),
      classe: COURTS_CORPS.indexOf(c) >= 0 ? "court" : "",
    };
  });
  const corps = corpsRange(vu.cles, champs);
  /* Le programme reste celui de l'exemple, quand tout le reste vient du salon :
     le stand qui remplit le mieux la fiche ne tient pas forcément de
     conférence, et le modèle qui déroule une ligne de temps n'aurait rien à
     montrer. */
  const confs = montre("stand", "conferences")
    ? '<div class="field prog-bloc"><span class="eyebrow">Conférences</span><div class="prog">' +
        '<div class="confRang"><span class="conf"><span class="h">10h30 – 11h15</span>' +
        '<span class="t">Le bois de pays dans la commande publique</span>' +
        '<span class="ty">Table ronde</span></span></div>' +
        '<div class="confRang"><span class="conf"><span class="h">16h00 – 16h45</span>' +
        '<span class="t">Agencer une boutique en réemploi</span>' +
        '<span class="ty">Démonstration</span></span></div>' +
      '</div></div>'
    : "";
  const code = montre("stand", "code") ? vu.code : "";
  d.innerHTML =
    '<div class="detail-hd" data-code="' + esc(code) + '">' +
      /* Des balises neutres plutôt que des boutons : l'aperçu vit dans un
         bouton — celui qui choisit le modèle — et un bouton n'en contient pas
         un autre. Les classes suffisent à l'habillage. */
      '<div class="hdActs"><span class="marque">' +
      '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>' +
      '</span><span class="close">&times;</span></div>' +
      '<div class="hdTete"><span class="eyebrow">Stand</span>' +
        (vu.neuf ? '<span class="badge dist pic d-neuf">Nouvel exposant</span>' : "") +
      '</div>' +
      '<div class="hdNom"><h2>' + esc(vu.nom) + '</h2></div>' +
      '<div class="hdBadges">' +
        '<span class="badge code">' +
        esc([vu.pavillon, vu.hall, code].filter(Boolean).join(" · ")) + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="detail-bd">' + corps + confs +
      '<div class="acts"><span class="btn">Centrer sur le plan</span>' +
      '<span class="btn itin">Itinéraire</span></div>' +
    '</div>';
  return d;
}

/**
 * L'autre moitié de la vignette : la liste des exposants sous le même
 * habillage.
 *
 * Des balises neutres, comme pour la fiche : l'aperçu vit dans le bouton qui
 * choisit le modèle, et celui-ci ne peut contenir ni bouton ni champ de
 * saisie. Les classes sont celles du vrai panneau — c'est la même feuille de
 * style qui l'habille, à la réduction près.
 */
function apercuListe(cle, vu){
  const d = document.createElement("div");
  d.className = "apercu-liste liste-" + cle;
  // l'aperçu se regarde, il ne se manipule pas
  d.inert = true;
  const lignes = vu.lignes.map(l =>
    '<span class="row" data-sorte="stand" aria-current="' + (l.courant ? "true" : "false") + '">' +
    '<span class="code">' + esc(l.code) + '</span>' +
    '<span><span class="nm">' + esc(l.nom) + '</span><span class="s"></span></span></span>').join("");
  d.innerHTML =
    '<div class="search"><div class="search-field">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
      '<span class="champ">Exposant, stand…</span>' +
    '</div></div>' +
    '<div class="count"><span>' + esc(vu.compte) + '</span></div>' +
    '<div class="list">' + lignes + '</div>';
  return d;
}

/** Les deux moitiés d'un habillage, dans l'ordre de l'écran : la liste, puis
 *  la fiche qu'on ouvre depuis elle. C'est leur accord qu'on choisit. */
export function apercuDuo(cle, vu){
  const d = document.createElement("div");
  d.className = "duo";
  d.appendChild(apercuListe(cle, vu));
  d.appendChild(apercuFiche(cle, vu));
  return d;
}
