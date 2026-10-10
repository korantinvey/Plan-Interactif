/* ============================================================
   L'ordonnanceur de la journée organisée

   Ranger des stands entre des conférences, sur un ou plusieurs jours, en
   payant en mètres la marche, l'écart entre les jours et les demi-heures déjà
   chargées. Le calcul ne lit rien de la page : on lui donne les créneaux, les
   distances et ce qu'il sait de la charge, il rend un ordre.

   C'est pour cela qu'il vit seul dans son module : les essais (`npm run
   essais`, `npm run fep26`) l'importent, c'est-à-dire exactement le code que
   la page reçoit. Ce qui prépare le séjour — la matrice des distances, les
   créneaux, le déroulé — est à part, dans `sejour.mjs`, lié qu'il est à
   l'itinéraire et au parcours.
   ============================================================ */

/**
 * Ce qu'on accepte de marcher en plus pour que les jours se ressemblent.
 *
 * L'écart entre les jours se mesure dans la même unité que ce qu'ils coûtent
 * (voir `ecartDesJours` et `chargeDuJour`), et se compare donc directement à
 * un détour. À un, ce serait un échange à parts égales ; c'est trop peu, et
 * pour une raison qui ne se devine pas.
 *
 * Un créneau borné par une conférence ne coûte rien à remplir — il dure ce
 * qu'il dure, qu'on y visite ou qu'on y patiente. Le jour qui porte une
 * conférence attire donc tout ce qui peut tenir avant elle, et le jour qui
 * n'en porte aucune se retrouve avec ce qui reste : quatorze stands d'un côté,
 * un de l'autre. Le déséquilibre est alors réel, et il faut un poids franc
 * pour le défaire.
 *
 * Quatre suffit, et l'essai le montre sur ce cas-là : au-dessous, la journée
 * de conférence garde deux ou trois stands de trop ; à quatre, les deux jours
 * se partagent la liste à un stand près — et la marche totale est au passage
 * la plus courte de toutes celles qu'on a essayées, l'équilibre ayant mené le
 * calcul vers un partage plus naturel. Au-delà, plus rien ne s'améliore, et
 * l'équilibre devient une fin en soi : on se met à traverser le salon pour
 * égaliser deux totaux qui l'étaient déjà.
 */
const EQUILIBRE = 4;

/* ------------------------------------------------------------
   Ce qu'une demi-heure chargée coûte, en mètres

   Le seuil d'un stand n'est pas une porte qui se ferme. Il dit à partir de
   combien de **nos** utilisateurs simultanés le calcul doit chercher un autre
   ordre, et rien de plus : le plan ne connaît pas la fréquentation réelle du
   stand, et ne prétend pas la connaître. Ce que l'ordonnanceur en retient est
   donc un prix, payé dans la seule monnaie qu'il connaisse — le mètre, celle
   de `TRANSFERT_M` (`sejour.mjs`) qui chiffre déjà un changement de pavillon.

   Les points ci-dessous se lisent « à tel taux d'occupation, tel détour vaut
   encore la peine d'être fait pour l'éviter », et la peine s'interpole entre
   eux : un stand à 70 % coûte quarante mètres, à 90 % cent quarante. Le
   premier point fixe la marge de sécurité — en dessous de soixante pour cent,
   rien n'est dû.

   L'échelle se règle sur un arbitrage voulu : arriver sur un stand à trente
   pour cent après huit cent cinquante mètres vaut mieux que d'y arriver à
   soixante-dix après huit cent vingt. Trente mètres de détour doivent donc
   être couverts par la peine de 70 % — d'où les quarante qu'elle vaut.

   Au-delà de deux fois le seuil la courbe continue à la même pente, puis
   plafonne : pousser plus fort ne distinguerait plus rien, et la journée est
   de toute façon surdemandée partout à la fois. Même là le stand reste
   visitable — c'est un prix, il n'y a pas d'infini dans ce tableau.
   ------------------------------------------------------------ */
/* Ce qui, sur un plan, porte un seuil et se remplit.
   Un seul genre aujourd'hui — les autres sont écrits là pour dire où ils
   iraient, non pour être implémentés avant qu'on en ait besoin :
   zone, allee, entree, escalier, liaison. */
export const GENRES_RESSOURCE = { stand: "stand" };

/* Lire la charge autour de l'heure d'arrivée, ou dans la seule case où elle
   tombe. Le lissage ne change rien aux agrégats — mesuré sur cinq taux
   d'adoption — mais il retire un cas absurde : deux visiteurs séparés de deux
   minutes, de part et d'autre de dix heures et demie, voyaient leurs journées
   différer de mille quatre cent soixante-sept mètres. Le douzième cas de
   `npm run essais` le vérifie, lissage coupé puis remis. */
let LISSAGE_CHARGE = true;

/** Couper ou remettre le lissage. Seul ce douzième cas s'en sert : la page
 *  lisse toujours, et ne reçoit donc pas ce nom. */
export const poseLissage = (v) => { LISSAGE_CHARGE = v; };

const PEINE_CHARGE = [
  [ .60,    0],   // la marge : en dessous, on ne compte rien
  [ .80,   80],   // faible
  [1.00,  200],   // significative : le stand est à son seuil
  [1.20,  450],   // forte : plus qu'un changement de pavillon
  [1.50,  800],   // très forte
  [2.00, 1200],   // très forte, et toujours franchissable
];
export const PEINE_MAX = 1800;

/** Le seuil à partir duquel une cellule coûte quelque chose. */
export const SEUIL_PEINE = PEINE_CHARGE[0][0];

/**
 * Ce que coûte une visite posée sur une demi-heure déjà chargée.
 *
 * Rend des mètres, comparables à ceux du trajet. Zéro sans seuil connu : un
 * stand que personne n'a dessiné ne se voit imposer aucune contrainte.
 */
export function peineDeCharge(charge, seuil){
  if (!(seuil > 0)) return 0;
  const taux = (+charge || 0) / seuil;
  const P = PEINE_CHARGE;
  if (taux <= P[0][0]) return 0;
  for (let i = 1; i < P.length; i++)
    if (taux <= P[i][0])
      return P[i - 1][1] + (P[i][1] - P[i - 1][1]) *
             (taux - P[i - 1][0]) / (P[i][0] - P[i - 1][0]);
  const n = P.length - 1;
  const pente = (P[n][1] - P[n - 1][1]) / (P[n][0] - P[n - 1][0]);
  return Math.min(PEINE_MAX, P[n][1] + pente * (taux - P[n][0]));
}

/* ------------------------------------------------------------
   L'ordre de visite, et la répartition sur les jours
   ------------------------------------------------------------ */
/**
 * Ranger les stands entre les conférences, et les conférences sur leurs jours.
 *
 * Le problème est celui du voyageur de commerce, avec des rendez-vous en
 * plus : l'ordre exact demanderait d'essayer toutes les permutations, et
 * vingt stands en font deux milliards de milliards. On construit donc au plus
 * juste — à chaque tour, le stand dont l'insertion coûte le moins, là où elle
 * tient — puis on reprend l'ensemble par trois mouvements qui rattrapent
 * l'essentiel : retourner un morceau de créneau, déplacer un arrêt ailleurs,
 * et échanger deux arrêts de deux jours différents.
 *
 * Reste à dire ce que « coûter » veut dire, et c'est là que la première
 * version se trompait. Elle ne comptait que les mètres. Or un créneau qui se
 * termine sur une conférence dure ce qu'il dure, qu'on le remplisse ou non :
 * y glisser un stand ne coûtait donc rien de plus qu'ailleurs en distance, et
 * le calcul les entassait après la dernière conférence, où chaque insertion
 * se payait au plus court. Le visiteur se retrouvait avec deux heures
 * trente-neuf à patienter devant une salle, et six stands à voir ensuite.
 *
 * Compter le temps mort comme la marche — une minute d'attente valant une
 * minute de marche — rapprochait du but sans y être : dans un créneau qui a
 * du mou, les minutes de marche se retranchent exactement aux minutes
 * d'attente, et la distance s'annule. Le coût d'une insertion valait alors
 * « moins une visite », quel que soit le détour : tous les candidats faisaient
 * match nul et c'est le premier rencontré qui l'emportait. Les creux se
 * remplissaient, mais l'ordre à l'intérieur ne devait plus rien au chemin.
 *
 * On sépare donc les deux questions, parce que ce sont deux questions :
 *
 *   Ce qui pèse d'abord, c'est ce qui tombe après le dernier rendez-vous. Un
 *   créneau borné dure ce qu'il dure ; tout ce qu'on n'y met pas s'ajoute à
 *   la fin de la journée et rallonge l'attente d'autant. Un stand posé dans
 *   le créneau ouvert coûte donc le temps de sa visite, converti en mètres.
 *
 *   Ce qui départage ensuite, c'est la distance, et elle seule — un créneau
 *   borné ne coûte plus que ses mètres, l'attente n'y étant que ce qui reste.
 *
 * Le forfait n'est pas infranchissable, et c'est voulu : traverser deux
 * pavillons pour combler vingt minutes de creux n'a rien d'un progrès. Il
 * vaut ce que vaut la visite qu'on déplace, et un détour plus cher qu'elle
 * l'emporte.
 *
 * Plusieurs jours n'ajoutent qu'une chose à tout cela : les créneaux ne sont
 * plus ceux d'une journée mais ceux de toutes, et un stand se pose dans
 * n'importe lequel. Une seule différence de fond — un stand posé le mardi
 * n'est pas un stand posé le mercredi, même à distance égale, parce qu'une
 * visite se juge aussi sur l'équilibre de ses jours. D'où le compte ci-dessous.
 *
 * Un stand qui ne tient nulle part reste dehors et se dit : mieux vaut une
 * liste courte et vraie qu'un programme intenable.
 */

/**
 * L'écart entre les jours, dans la même unité que ce qu'on lui donne.
 *
 * On veut un nombre, pas un discours : quelque chose qu'on puisse ajouter au
 * total et comparer à un détour. La somme des carrés divisée par la somme
 * vaut exactement la moyenne quand tous les jours se valent, et la dépasse
 * d'autant qu'ils s'écartent ; leur différence est donc une grandeur de même
 * nature que les charges qu'on compare, et nulle sur une visite équilibrée.
 *
 * Elle a la bonne pente, aussi : soulager le jour le plus lourd la fait
 * descendre vite, soulager un jour déjà léger ne la fait presque pas bouger.
 * C'est ce qu'on veut d'un rééquilibrage — qu'il s'occupe du jour qui fatigue.
 *
 * Un seul jour : elle vaut zéro, et le calcul retombe exactement sur celui
 * d'avant. Une visite d'un jour ne paie rien pour une mécanique qui ne la
 * concerne pas.
 */
function ecartDesJours(charges, poids){
  let somme = 0, pesee = 0, rapportes = 0;
  for (let i = 0; i < charges.length; i++){
    const w = poids && poids[i] > 0 ? poids[i] : 1;
    somme += charges[i];
    pesee += w;
    rapportes += charges[i] * charges[i] / w;
  }
  return somme > 0 ? rapportes / somme - somme / pesee : 0;
}

/**
 * Ce que chaque jour doit porter, les uns par rapport aux autres.
 *
 * « Égaux » n'est pas toujours ce qu'on veut. On arrive le premier jour avec
 * de l'élan et l'envie d'avancer, et le dernier se finit souvent par un train
 * à prendre ; à l'inverse, un visiteur qui n'arrive qu'à midi le premier jour
 * préfère charger les suivants. Un curseur dit lequel, et se lit ici en un
 * poids par jour : le calcul vise alors des charges proportionnelles à ces
 * poids plutôt qu'égales, ce qui est la même chose quand ils valent tous un.
 *
 * L'amplitude est bornée, et ce n'est pas de la timidité : à poids nul, un
 * jour retenu se viderait entièrement — or le visiteur a dit qu'il venait ce
 * jour-là, et un programme vide n'est pas une réponse. Du simple au quadruple
 * entre le premier et le dernier est déjà une pente franche.
 */
const PENTE_MAX = 0.6;
/* La pente va de -1 à +1, dans le sens où on la fait glisser : à gauche, les
   premiers jours portent plus ; à droite, les derniers. Le signe suit donc le
   curseur, et non l'intuition arithmétique — c'est le curseur qu'on lit. */
export function poidsDesJours(n, pente){
  const l = [];
  for (let i = 0; i < n; i++)
    l.push(n > 1 ? 1 - (pente || 0) * PENTE_MAX * (1 - 2 * i / (n - 1)) : 1);
  return l;
}

/**
 * Ce qu'une journée coûte au visiteur, en mètres.
 *
 * La marche, et les visites — car ce qui pèse dans une journée de salon, ce
 * n'est pas que le chemin : vingt minutes par stand, et douze stands font
 * quatre heures là où l'allée qui les relie en fait vingt minutes. Équilibrer
 * les seuls mètres laissait donc passer une journée de quatorze stands en face
 * d'une journée d'un seul, parce que leurs distances, elles, se ressemblaient —
 * et c'est arrivé dès qu'un jour portait une conférence et l'autre non : le
 * créneau borné du premier accueillait tout, l'autre restait vide.
 *
 * Une visite se compte donc en mètres elle aussi, au pas de marche : c'est
 * déjà la conversion dont se sert le forfait du dernier créneau, et elle rend
 * les deux grandeurs additionnables. À nombre de stands égal, l'écart ne
 * départage plus que les distances — ce qu'on lui demande d'abord.
 */
const chargeDuJour = (m, n, visiteEnMetres) => m + visiteEnMetres * n;

/**
 * La répartition, puis l'ordre.
 *
 * `jours` porte les créneaux de chacun — les intervalles entre rendez-vous —,
 * `restants` les stands à poser, et `imposeDe` ceux que le visiteur a lui-même
 * placés : ils ne vont que là où il l'a dit.
 */
export function rangeSejour(jours, restants, dist, tempsCreneau, visiteEnMetres, imposeDe,
                     concentration){
  const creneaux = [];
  jours.forEach(j => j.creneaux.forEach(c => { c.jour = j; creneaux.push(c); }));

  /* Les mètres du créneau, et au passage ce qu'on a marché en arrivant sur
     chaque stand. Ce second tableau ne coûte rien ici — on parcourt déjà — et
     c'est lui qui dira l'heure d'une visite sans refaire le trajet à chaque
     candidat essayé. */
  const mesureCreneau = (c) => {
    let m = 0, prec = c.de;
    const pref = [];
    for (const s of c.stands){ m += dist(prec, s); pref.push(m); prec = s; }
    c.pref = pref;
    return m + dist(prec, c.vers);
  };

  /* ------------------------------------------------------------------
     La charge d'un stand : un prix, jamais une porte fermée

     Ce qui empêche une visite n'est pas la densité de l'allée, c'est que toute
     l'équipe du stand est déjà en conversation : le visiteur suivant n'est
     reçu par personne. Mais « déjà en conversation » se dégrade, il ne
     s'interrompt pas — une équipe à quatre-vingts pour cent reçoit encore,
     un peu moins bien, et à cent vingt elle reçoit toujours, mal.

     L'ordonnanceur en tire donc un coût et non un refus, et c'est un
     renversement par rapport à la version précédente, qui rendait une
     demi-heure pleine **indisponible**. Trois choses le motivent.

     D'abord le fond : le seuil est une estimation déduite d'une surface, pas
     une mesure. Lui donner force de loi, c'est donner à une règle de trois le
     dernier mot sur le parcours de quelqu'un.

     Ensuite l'effet de bord : un refus laisse des exposants dehors quand tout
     est plein, ce qu'aucune règle ne veut. Il fallait alors une soupape — un
     seuil relevé d'un cran, et un garde-fou sur le nombre de crans — soit
     une machinerie entière dont un prix n'a aucun besoin. Un stand demandé
     reste dans le parcours ; seule son heure se négocie.

     Enfin la mesure : la version chiffrée concentrait moins que la version qui
     refusait — trois fois le seuil contre quatre et demie sur la même
     simulation. Un refus ne se déplace pas, il se contourne au plus près ;
     un prix se compare, et la recherche locale sait le faire descendre.

     Reste ce que le refus avait apporté de juste, et qu'on garde : insérer une
     visite **recule celles qui la suivent**, et l'une d'elles peut tomber sur
     une demi-heure chargée. Ce décalage entre donc dans le compte, au même
     titre que le détour.
     ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
     Trois notions, qu'il ne faut jamais confondre

     Le **seuil de concentration** est ce que la surface laisse supposer, ou ce
     que l'exploitant a déclaré. Il vient de la configuration, il s'affiche dans
     le volet, et le moteur ne le modifie jamais.

     La **charge annoncée** est le nombre de journées organisées qui se sont
     déclarées sur ce stand pendant cette demi-heure. Ce ne sont pas les
     visiteurs du salon : c'est la seule population que le compteur voie, celle
     qui se sert de l'outil. Rien ici n'est donc un modèle de la fréquentation
     réelle — c'est un **budget de concentration de nos propres utilisateurs**,
     de quoi éviter que le calcul fabrique lui-même des attroupements qui
     n'auraient pas eu lieu sans lui.

     Le **seuil effectif** est ce que l'ordonnanceur emploie le temps d'un
     rangement. Il ne sort pas d'ici, ne s'écrit nulle part, et ne vaut que
     pour le jour où on le calcule.
     ------------------------------------------------------------------ */
  const seuilEffectif = (j, i) => {
    const r = concentration.ressource(i);
    return r ? r.seuil * (concentration.dilatation ? concentration.dilatation(j.cle) : 1) : 0;
  };

  /* Ce que dure une visite, en minutes. On ne se le fait pas passer : c'est
     exactement ce que `tempsCreneau` compte pour une visite et zéro mètre, et
     le redemander en paramètre laisserait deux chiffres se contredire. */
  const DUREE_VISITE = Math.max(1, tempsCreneau({ stands: [] }, 0, 1));

  /**
   * La charge autour d'une heure, et non dans la case où elle tombe.
   *
   * Les demi-heures sont l'unité du seuil, non une frontière du monde :
   * arriver à 10 h 29 ou à 10 h 31 ne doit pas rendre deux réponses
   * étrangères l'une à l'autre. On lit donc **toutes** les tranches que la
   * visite traverse, chacune au prorata du temps qu'on y passe — une visite de
   * vingt minutes commencée à 10 h 29 compte pour un vingtième dans la tranche
   * de dix heures et dix-neuf vingtièmes dans celle de dix heures et demie.
   *
   * C'est le lissage que la frontière brutale appelait, et il ne coûte qu'une
   * ou deux lectures de plus : une visite ne chevauche jamais plus de deux
   * tranches tant qu'elle dure moins d'une demi-heure.
   */
  const chargeAutourDe = (cleJour, s, t) => {
    if (!LISSAGE_CHARGE)
      return concentration.chargeAnnoncee(cleJour, s, trancheDe(t));
    const fin = t + DUREE_VISITE;
    let somme = 0, poids = 0, deb = t, tr = trancheDe(t), borne = (tr + 1) * 30;
    while (deb < fin){
      const f = Math.min(fin, borne), w = f - deb;
      somme += w * concentration.chargeAnnoncee(cleJour, s, tr);
      poids += w;
      deb = f;
      tr = Math.min(TRANCHES_JOUR - 1, tr + 1);
      borne += 30;
    }
    return poids > 0 ? somme / poids : 0;
  };

  /* L'heure à laquelle on arrive sur un stand : ce qu'on a marché pour
     l'atteindre, plus les visites qui l'ont précédé dans le créneau. C'est la
     formule de `tempsCreneau`, appliquée à un préfixe au lieu du tout — et
     c'est l'heure que le moteur emploie déjà partout ailleurs, aucune autre
     n'est calculée pour la charge. */
  const peineDe = (c, k, mArrivee, s) => {
    if (!concentration) return 0;
    const cap = seuilEffectif(c.jour, s);
    if (!(cap > 0)) return 0;
    const t = c.t0 + tempsCreneau(c, mArrivee, k);
    /* Le visiteur se compte lui-même : ce qu'on chiffre est la charge telle
       qu'elle sera **s'il vient**, non telle qu'elle est sans lui. Sans ce un,
       deux demi-heures à une place près se valent alors que l'une déborderait
       et pas l'autre. Le plan qu'on a soi-même annoncé la veille est déjà dans
       le relevé et se compte donc deux fois — une unité sur un seuil qui
       en vaut trois ou douze, et le retirer demanderait au serveur de
       reconnaître l'appelant. */
    return peineDeCharge(chargeAutourDe(c.jour.cle, s, t) + 1, cap);
  };

  /** Ce que la charge coûte à un créneau tel qu'il est rangé. */
  const peineCreneau = (c) => {
    if (!concentration) return 0;
    let p = 0;
    for (let k = 0; k < c.stands.length; k++)
      p += peineDe(c, k, (c.pref && c.pref[k]) || 0, c.stands[k]);
    return p;
  };

  /** Ce que coûterait le stand qu'on envisage de glisser à cette place. */
  const peineCandidat = (c, s, k) => {
    if (!concentration) return 0;
    const avant = k === 0 ? 0 : c.pref[k - 1];
    const prec = k === 0 ? c.de : c.stands[k - 1];
    return peineDe(c, k, avant + dist(prec, s), s);
  };

  /**
   * Ce que le décalage coûte — ou rapporte — aux visites qui suivent.
   *
   * Elles reculent du détour et du temps d'une visite ; certaines tomberont
   * sur une demi-heure plus chargée, d'autres sur une plus calme. On rend la
   * différence, qui peut donc être négative, et c'est très bien ainsi : une
   * insertion qui désengorge la fin d'un créneau mérite d'être vue.
   */
  const peineDecalee = (c, k, d) => {
    if (!concentration) return 0;
    let p = 0;
    for (let x = k; x < c.stands.length; x++)
      p += peineDe(c, x + 1, c.pref[x] + d, c.stands[x]) -
           peineDe(c, x,     c.pref[x],     c.stands[x]);
    return p;
  };

  /**
   * Ce qu'un créneau coûte, en mètres.
   *
   * Le dernier de la journée ne bute sur rien, sinon la fermeture du salon
   * quand elle est connue : ce qu'on y met retarde la journée d'autant, et
   * chaque stand y porte le forfait. Les autres butent sur une conférence et
   * ne coûtent que leur chemin — ce qu'ils ne remplissent pas se passe à
   * patienter, ce dont le forfait rend déjà compte de l'autre côté.
   *
   * S'y ajoute ce que la charge coûte, dans la même monnaie : c'est par ce
   * seul point que la concentration entre dans le calcul, et c'est ce qui fait que
   * toutes les reprises la voient sans qu'aucune ait à la connaître.
   */
  const coutCreneau = (c) =>
    (c.dernier ? c.m + visiteEnMetres * c.stands.length : c.m) + peineCreneau(c);

  /**
   * Un créneau qui déborde sur son rendez-vous.
   *
   * Ce n'est pas un arrangement cher, c'en est un impossible : il se refuse,
   * il ne se paie pas. La première version lui donnait un coût infini, ce qui
   * revenait au même sur une seule journée — mais sur plusieurs, un jour rendu
   * intenable par ses seules conférences emportait le séjour entier dans son
   * infini, et plus rien ne se posait nulle part. Le refus se prononce donc
   * sur le créneau qu'on touche, et le compte du séjour reste un nombre.
   */
  const deborde = (c) => c.tMax !== null &&
    c.t0 + tempsCreneau(c, c.m, c.stands.length) > c.tMax;

  /* Un créneau vient de changer : lui et son jour se remettent d'accord. Les
     totaux se tiennent à jour de proche en proche — les refaire en entier à
     chaque essai coûterait le tour de tous les créneaux pour un stand
     déplacé d'un cran. */
  const remet = (c) => {
    const m = c.m, cout = c.cout, n = c.n;
    c.m = mesureCreneau(c);
    c.n = c.stands.length;
    c.cout = coutCreneau(c);
    c.jour.m += c.m - m;
    c.jour.n += c.n - n;
    c.jour.cout += c.cout - cout;
  };
  creneaux.forEach(c => { c.m = 0; c.cout = 0; c.n = 0; });
  jours.forEach(j => { j.m = 0; j.cout = 0; j.n = 0; });
  creneaux.forEach(remet);

  /* Le séjour chiffré, sans son équilibre : ce qu'on marche, plus ce que les
     demi-heures chargées coûtent. Les deux sont des mètres, et c'est bien tout
     l'intérêt — un détour se compare à une attente. */
  const metres = () => {
    let t = 0;
    for (const j of jours) t += j.cout;
    return t;
  };

  /**
   * Le séjour chiffré, un jour pris autrement.
   *
   * `sauf` permet de chiffrer ce que serait le séjour si ce jour-là mesurait
   * autre chose, sans rien déplacer : la recherche essaie chaque stand à
   * chaque place de chaque créneau de chaque jour, et se refait à chaque
   * stand posé — poser puis défaire pour comparer coûterait un ordre de
   * grandeur de plus.
   */
  /* La répartition visée : celle que le curseur a dite, ou l'égalité. */
  const poids = jours.map(j => j.poids > 0 ? j.poids : 1);
  /* L'écart se débraye le temps d'un départ — voir les deux essais, plus bas.
     Il pèse toujours, lui, dans le compte qui les départage. */
  let peseEcart = true;
  const total = (sauf, m, cout, n) => {
    const charges = [];
    let t = 0;
    for (const j of jours){
      charges.push(chargeDuJour(j === sauf ? m : j.m, j === sauf ? n : j.n, visiteEnMetres));
      t += j === sauf ? cout : j.cout;
    }
    return t + (peseEcart ? EQUILIBRE * ecartDesJours(charges, poids) : 0);
  };

  /* Ce qu'insérer un stand à une place ajoute au créneau : deux distances
     gagnées contre une perdue. */
  const ecartInsertion = (c, s, k) => {
    const prec = k === 0 ? c.de : c.stands[k - 1];
    const suiv = k === c.stands.length ? c.vers : c.stands[k];
    return dist(prec, s) + dist(s, suiv) - dist(prec, suiv);
  };

  /* Poser ce qui reste, au meilleur endroit où cela tient — tous jours
     confondus. Rend le nombre de stands posés : une reprise qui raccourcit un
     créneau borné peut y libérer la place d'un stand refusé au premier
     passage. */
  const insere = (candidats) => {
    let poses = 0;
    while (candidats.length){
      let choix = null;
      for (const s of candidats){
        const impose = imposeDe ? imposeDe(s) : null;
        for (const c of (impose ? impose.creneaux : creneaux)){
          const j = c.jour;
          for (let k = 0; k <= c.stands.length; k++){
            const d = ecartInsertion(c, s, k);
            const m = c.m + d, n = c.stands.length + 1;
            if (c.tMax !== null && c.t0 + tempsCreneau(c, m, n) > c.tMax) continue;
            /* Le candidat, et ce que son insertion fait aux visites qu'elle
               recule : les deux se paient, et le second terme est celui que la
               version d'avant avait raison de regarder. */
            const dp = peineCandidat(c, s, k) + peineDecalee(c, k, d);
            const t = total(j, j.m + d,
                            j.cout + d + dp + (c.dernier ? visiteEnMetres : 0), j.n + 1);
            if (!choix || t < choix.t) choix = { t: t, c: c, k: k, s: s };
          }
        }
      }
      // rien ne se pose : on rend la main, c'est à `essai` de décider la suite
      if (!choix) break;
      choix.c.stands.splice(choix.k, 0, choix.s);
      remet(choix.c);
      candidats.splice(candidats.indexOf(choix.s), 1);
      poses++;
    }
    return poses;
  };

  /**
   * Deux façons de juger, parce que ce sont deux questions.
   *
   * Changer un stand de jour, c'est répartir : l'écart entre les jours compte
   * avec les mètres, et c'est tout l'objet du calcul.
   *
   * Ranger autrement les stands d'un même jour, c'est ordonner : seuls les
   * mètres comptent. Leur opposer l'écart aurait un effet absurde — refuser de
   * raccourcir le jour le plus court sous prétexte que cela l'éloignerait des
   * autres. Marcher moins n'est jamais un tort ; c'est marcher plus d'un côté
   * que de l'autre qui en est un.
   */
  const reprend = (tours) => {
    for (let tour = 0; tour < tours; tour++){
      let gagne = false;

      /* Retourner un morceau de créneau. L'ordre change, le jour ne change
         pas : on juge sur les seuls mètres. */
      for (const c of creneaux){
        for (let i = 0; i < c.stands.length - 1; i++){
          for (let k = i + 1; k < c.stands.length; k++){
            const avant = metres(), debordait = deborde(c);
            const copie = c.stands.slice();
            c.stands.splice(i, k - i + 1, ...c.stands.slice(i, k + 1).reverse());
            remet(c);
            /* Un créneau qui débordait déjà garde le droit de raccourcir : le
               refuser l'enfermerait dans l'ordre où on l'a trouvé. Rien à
               ajouter ici pour la charge : `remet` vient de la recompter dans
               `c.cout`, donc `metres()` la porte déjà. */
            if (metres() < avant - 1e-9 && (debordait || !deborde(c))) gagne = true;
            else { c.stands = copie; remet(c); }
          }
        }
      }

      /* Déplacer un arrêt ailleurs — dans un autre créneau du même jour, ou
         dans un autre jour. C'est le mouvement qui répartit, et le seul. */
      for (const c of creneaux){
        for (let i = 0; i < c.stands.length; i++){
          const s = c.stands[i];
          const impose = imposeDe ? imposeDe(s) : null;
          const avantM = metres(), avantT = total(), debordait = deborde(c);
          c.stands.splice(i, 1);
          remet(c);
          let mieux = null;
          for (const d of (impose ? impose.creneaux : creneaux)){
            const meme = d.jour === c.jour;
            const base = meme ? avantM : avantT;
            for (let k = 0; k <= d.stands.length; k++){
              const e = ecartInsertion(d, s, k);
              const m = d.m + e, n = d.stands.length + 1;
              if (d.tMax !== null && d.t0 + tempsCreneau(d, m, n) > d.tMax &&
                  !(d === c && debordait)) continue;
              const j = d.jour;
              const dp = peineCandidat(d, s, k) + peineDecalee(d, k, e);
              const note = meme
                ? metres() + e + dp + (d.dernier ? visiteEnMetres : 0)
                : total(j, j.m + e, j.cout + e + dp + (d.dernier ? visiteEnMetres : 0), j.n + 1);
              /* Les gains des deux questions ne se comparent pas entre eux :
                 on retient le meilleur de chaque camp au fil de la boucle, et
                 c'est le premier trouvé qui l'emporte à égalité — un
                 déplacement dans la journée avant un changement de jour, donc
                 le moins surprenant des deux. */
              if (note < base - 1e-9 && (!mieux || note - base < mieux.gain))
                mieux = { gain: note - base, d: d, k: k };
            }
          }
          if (mieux){ mieux.d.stands.splice(mieux.k, 0, s); remet(mieux.d); gagne = true; }
          else { c.stands.splice(i, 0, s); remet(c); }
        }
      }

      /* Échanger deux arrêts de deux jours différents.
     
         Quand chaque jour est plein, plus rien ne se déplace tout seul : le
         créneau d'arrivée déborderait. C'est pourtant là que l'écart se creuse
         — un jour chargé de stands lointains, l'autre d'une poignée de stands
         voisins — et l'échange est le seul mouvement qui le réduise encore.
         Chacun prend la place de l'autre ; le retournement du tour suivant
         remet l'ordre d'aplomb. */
      if (jours.length > 1) for (const a of creneaux) for (const b of creneaux){
        if (a.jour === b.jour) continue;
        for (let i = 0; i < a.stands.length; i++){
          for (let k = 0; k < b.stands.length; k++){
            const s = a.stands[i], u = b.stands[k];
            if (imposeDe && (imposeDe(s) || imposeDe(u))) continue;
            const avant = total();
            a.stands[i] = u; b.stands[k] = s;
            remet(a); remet(b);
            if (!deborde(a) && !deborde(b) && total() < avant - 1e-9) gagne = true;
            else { a.stands[i] = s; b.stands[k] = u; remet(a); remet(b); }
          }
        }
      }

      if (!gagne) break;
    }
    /* Une fois les mouvements simples épuisés, on regarde de près là où ça
       coûte — voir `permuteCongestion`. */
    permuteCongestion();
  };

  /**
   * Tout essayer, mais seulement là où la congestion se paie.
   *
   * Les trois mouvements ci-dessus sont puissants et pas exhaustifs : ils
   * retournent un morceau, déplacent un arrêt, échangent deux arrêts de deux
   * jours. Certains ordres ne s'atteignent par aucune suite de ces trois-là
   * sans passer par un arrangement pire, que la recherche refuse en chemin.
   * Quand le créneau paie une peine, ces ordres-là valent d'être essayés.
   *
   * Deux bornes, et les deux comptent. On ne permute **que si le créneau
   * paie** : là où la congestion n'est pas un problème, le moteur garde
   * exactement le comportement qu'il avait, ce qui est la seule façon de ne
   * pas faire payer à tout le monde une mécanique qui ne sert qu'à quelques-uns.
   * Et on ne permute qu'une **fenêtre** : sept arrêts font cinq mille ordres,
   * quatorze en feraient quatre-vingt-sept milliards. La fenêtre se pose
   * autour de l'arrêt le plus cher, qui est par construction celui dont le
   * déplacement rapporte le plus.
   *
   * Les arrêts qui encadrent la fenêtre ne bougent pas : c'est ce qui en fait
   * un mouvement local, comparable aux autres, et ce qui garantit qu'aucune
   * contrainte d'ailleurs n'est touchée — le jour d'un stand imposé, les
   * mètres d'un changement de pavillon, l'heure d'une conférence continuent
   * d'être jugés par `deborde` et par le score, comme pour tout mouvement.
   */
  const PERMUTE_MAX = 7;
  const permuteCongestion = () => {
    if (!concentration) return;
    for (const c of creneaux){
      const n = c.stands.length;
      if (n < 3 || peineCreneau(c) <= 0) continue;

      /* L'arrêt le plus cher, et la fenêtre autour de lui. */
      let pire = 0, cher = -1;
      for (let k = 0; k < n; k++){
        const p = peineDe(c, k, (c.pref && c.pref[k]) || 0, c.stands[k]);
        if (p > pire){ pire = p; cher = k; }
      }
      if (cher < 0) continue;
      const L = Math.min(n, PERMUTE_MAX);
      const w0 = Math.max(0, Math.min(n - L, cher - (L >> 1)));
      const fenetre = c.stands.slice(w0, w0 + L);

      const debordait = deborde(c);
      let note = metres(), meilleure = null;
      const essaieOrdre = (fait, reste) => {
        if (!reste.length){
          const avant = c.stands.slice();
          c.stands = c.stands.slice(0, w0).concat(fait, c.stands.slice(w0 + L));
          remet(c);
          if (metres() < note - 1e-9 && (debordait || !deborde(c))){
            note = metres(); meilleure = fait.slice();
          }
          c.stands = avant; remet(c);
          return;
        }
        for (let i = 0; i < reste.length; i++)
          essaieOrdre(fait.concat([reste[i]]),
                      reste.slice(0, i).concat(reste.slice(i + 1)));
      };
      essaieOrdre([], fenetre);

      if (meilleure){
        c.stands = c.stands.slice(0, w0).concat(meilleure, c.stands.slice(w0 + L));
        remet(c);
      }
    }
  };

  /* Ce que le visiteur a placé lui-même passe d'abord : il choisit son jour,
     le calcul choisit la place. Ce qui ne tient pas le jour dit reste dehors
     plutôt que de partir ailleurs — on ne déplace pas de son propre chef ce
     qu'on vient de nous demander de placer là, on le dit. */
  const imposes = imposeDe ? restants.filter(s => imposeDe(s)) : [];
  const libres = imposeDe ? restants.filter(s => !imposeDe(s)) : restants.slice();

  /* Les reprises coûtent le carré du nombre d'arrêts d'un créneau, et se
     refont à chaque tour : trois cents exposants retenus y passeraient une
     minute sur un téléphone de salon. On borne donc les tours par la taille
     du problème — une liste ordinaire les a tous, une liste démesurée
     s'arrête quand l'essentiel est pris. */
  const tours = Math.max(3, Math.min(30,
    Math.round(900 / Math.max(1, imposes.length + libres.length))));

  /**
   * Deux départs plutôt qu'un.
   *
   * La construction au plus juste pose les stands un par un, et l'ordre dans
   * lequel elle les pose dépend de ce qu'elle compte. Compter l'écart dès la
   * pose oriente donc la recherche dès le premier stand — et pas toujours du
   * bon côté : mesuré sur dix stands d'un pavillon du plan SMCL, l'arrangement
   * ainsi construit faisait cinq cent trente-huit mètres là où le meilleur
   * partage cinq-cinq en fait quatre cent quatre-vingt-dix. Dix pour cent de
   * marche en trop, sans un gramme d'équilibre en plus : les deux journées
   * étaient même un peu moins semblables. Les reprises ne l'en sortaient pas
   * — il aurait fallu échanger trois stands à la fois, et chaque échange pris
   *   seul aggrave.
   *
   * On part donc deux fois. Une fois en comptant l'écart dès la pose, une fois
   * en ne comptant que les mètres — l'équilibre ne revenant qu'aux reprises,
   * qui savent, elles, déplacer et échanger. Les deux arrangements sont ensuite
   * jugés au même aune, l'écart compris, et le meilleur l'emporte. Sur l'essai
   * ci-dessus, le second rend exactement le meilleur partage cinq-cinq.
   *
   * Cela double le temps de la recherche, non celui du calcul : la matrice,
   * qui en est le gros, est bâtie une fois et sert aux deux.
   */
  const etat = () => creneaux.map(c => c.stands.slice());
  const remonte = (e) => {
    creneaux.forEach((c, i) => { c.stands = e[i].slice(); });
    creneaux.forEach(remet);
  };

  const essai = (ecartALaPose) => {
    creneaux.forEach(c => { c.stands = []; });
    creneaux.forEach(remet);
    const dehorsImposes = imposes.slice(), dehorsLibres = libres.slice();
    peseEcart = ecartALaPose;
    if (dehorsImposes.length) insere(dehorsImposes);
    insere(dehorsLibres);
    peseEcart = true;
    reprend(tours);
    /* Sans heure de fermeture, tout finit posé au premier passage et la boucle
       ne tourne pas. Avec, un créneau que les reprises ont raccourci peut
       accueillir ce qu'on avait laissé dehors : on y revient, quelques fois
       au plus, tant que cela pose quelque chose. */
    for (let passe = 0; passe < 3 && dehorsLibres.length && insere(dehorsLibres); passe++)
      reprend(tours);
    /* Plus rien à faire pour la charge à ce stade, et c'est le signe que le
       prix a remplacé le refus : un stand chargé se pose quand même, plus cher.
       Ce qui reste dehors ne l'est donc que pour une raison d'heure — une
       conférence qu'aucun arrangement ne contourne —, comme avant que la
       concentration n'existait pas. */
    return { note: total(), etat: etat(), dehors: dehorsImposes.concat(dehorsLibres) };
  };

  const avec = essai(true);
  /* Un seul jour n'a pas d'écart à compter : le second départ rendrait le
     premier, au mot près, et coûterait le double pour rien. */
  const sans = jours.length > 1 ? essai(false) : avec;
  /* À égalité, celui qui comptait l'écart dès la pose : c'est le calcul
     qu'on décrit partout ailleurs, et le second n'est là que s'il fait mieux.
     Un stand de moins laissé dehors l'emporte sur des mètres, toujours : une
     visite plus courte parce qu'on y voit moins n'est pas plus courte. */
  const mieux = sans.dehors.length < avec.dehors.length ||
                (sans.dehors.length === avec.dehors.length && sans.note < avec.note - 1e-9);
  const gagnant = mieux ? sans : avec;
  remonte(gagnant.etat);

  /* Ce qui n'a trouvé sa place nulle part. Les imposés en tête : ils n'ont pas
     tenu là où on les voulait, ce qui ne se dit pas comme le reste. */
  restants.length = 0;
  restants.push(...gagnant.dehors);
  return restants;
}

/* La demi-heure plutôt que l'heure : une visite dure vingt minutes par défaut,
   et l'heure pleine serait deux fois trop large pour dire qu'une équipe est
   prise. Quarante-huit dans une journée, et la dernière absorbe ce qui
   dépasse — une visite programmée à minuit passé est de toute façon une
   journée qu'on a mal dite. */
export const TRANCHES_JOUR = 48;
export const trancheDe = (min) =>
  Math.max(0, Math.min(TRANCHES_JOUR - 1, Math.floor((+min || 0) / 30)));

/* ------------------------------------------------------------
   Le desserrage des seuils, quand le salon est globalement surdemandé

   Un seuil déduit d'une surface est une estimation, pas une limite.
   Quand ce que les journées organisées demandent dépasse globalement ce que
   les stands demandés peuvent recevoir, toutes les demi-heures passent
   au-dessus du seuil : la courbe rend partout le même rouge, et cesse de
   départager quoi que ce soit — ce qui est son seul emploi. On desserre alors
   la mesure d'un peu.

   **D'un peu, et c'est tout l'objet de ce qui suit.** Une dilatation qui
   suivrait la demande serait circulaire : elle dirait « puisque beaucoup de
   gens veulent ce stand, il peut recevoir beaucoup de gens », et la peine
   s'évanouirait exactement là où elle sert. Une version précédente le faisait
   — le rapport constaté, appliqué tel quel, jusqu'à quatre fois — et un salon
   deux fois surdemandé y voyait tous ses seuils doubler, ramenant un
   stand à deux cents pour cent à cent pile, c'est-à-dire à deux cents mètres
   de peine au lieu de mille deux cents.

   La dilatation est donc **progressive et plafonnée bas** : un cinquième au
   plus, atteint à deux fois la demande, et rien en dessous du seuil. La
   demande continue ainsi de produire de la peine quand le seuil s'adapte,
   ce qui est la seule propriété qui compte ici.

   Elle est aussi **globale au jour**, et non par stand — et c'est délibéré.
   Desserrer le seuil d'un stand parce qu'il est demandé, ce serait
   précisément la circularité qu'on écarte. Dilater celle de tous parce que le
   salon entier est surdemandé répond à une autre question, qui porte sur le
   salon et non sur la popularité d'un stand.

   Le rapport se calcule sur les stands qui ont une charge annoncée et une
   seuil connu, non sur le hall entier : comparer la demande de vingt stands
   au seuil cumulé de six cents rendrait toujours un, et le mécanisme ne
   se déclencherait jamais.
   ------------------------------------------------------------ */

/* Le rapport constaté, et ce qu'on desserre en face. Interpolé entre les
   points, plafonné au dernier — deux fois la demande ne donne pas deux fois
   le seuil, elle en donne un cinquième de plus. */
const DILATATION = [
  [1.00, 1.00],   // sous le seuil : on ne desserre rien
  [1.25, 1.05],
  [1.50, 1.10],
  [2.00, 1.20],   // et pas davantage au-delà
];

/* Une journée de salon ouvre rarement moins de six heures ; sous ce plancher,
   c'est la lecture qui est partielle, pas la journée qui est courte. */
export const TRANCHES_MINI = 12;

/** Ce que le rapport « demande sur seuil » desserre. Jamais moins d'un :
 *  on n'a pas à serrer un salon que personne ne demande. */
export function dilatationPour(rapport){
  const D = DILATATION;
  if (!(rapport > D[0][0])) return 1;
  for (let i = 1; i < D.length; i++)
    if (rapport <= D[i][0])
      return D[i - 1][1] + (D[i][1] - D[i - 1][1]) *
             (rapport - D[i - 1][0]) / (D[i][0] - D[i - 1][0]);
  return D[D.length - 1][1];
}
