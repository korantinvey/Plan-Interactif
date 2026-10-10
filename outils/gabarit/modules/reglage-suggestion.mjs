/* ============================================================
   La suggestion — le volet de l'exploitant

   Le volet « Suggestion » des réglages, et le relevé du classement qui part
   aux visiteurs réduit à trois noms par valeur. Ce que le visiteur reçoit, et
   le pourquoi de la fonction, sont dans `modules/suggestion.mjs` ; ce module-ci
   n'est embarqué que par `plan-admin.mjs`.

   Le glissement de la fenêtre s'importe de `glisse-fenetre.mjs`, comme les
   critères de la recherche, la configuration et son enregistrement, le champ
   intitulé et le tiroir du parcours, qu'un réglage changé refait,
   s'importent (`recherche.mjs`, `configuration.mjs`, `fiche-zone.mjs`,
   `tiroir-parcours.mjs`).
   ============================================================ */
import { esc, COLLATION } from "./texte.mjs";
import { TOUS, parId } from "./donnees.mjs";
import { accesBase, base } from "./session.mjs";
import { evenementCourant } from "./chaleur.mjs";
import { SUGG_SEUIL_MIN, SUGG_SEUIL_MAX, reglageSugg, seuilSugg, PRESENTATIONS_SUGG, presentationsSugg,
  critereSugg, nomValeurSugg } from "./suggestion.mjs";
import { rafraichitParcours } from "./tiroir-parcours.mjs";
import { clesCriteres, valeursCritere, libelleCritere } from "./recherche.mjs";
import { conf, enregistreConf } from "./configuration.mjs";
import { champZone } from "./fiche-zone.mjs";
import { glisseFenetre } from "./glisse-fenetre.mjs";

export const NOM_VOLET_SUGGESTION = "Suggestion";

/* Combien de noms on retient par valeur. Un seul suffirait si le visiteur ne
   l'avait jamais dans sa liste — mais c'est précisément le plus consulté du
   secteur, donc souvent le premier qu'il a retenu. Trois laissent de quoi
   proposer quand même, sans publier un classement. */
const SUGG_CHAMPIONS = 3;

/* ------------------------------------------------------------
   Ce que le salon porte, vu du critère

   Un relevé par valeur, en un seul passage. Interroger chaque valeur à son
   tour rebalayait les neuf cents stands autant de fois qu'un salon range de
   villes — et c'est le rangement par ville qui en compte le plus.
   ------------------------------------------------------------ */
function indexSugg(cle){
  const par = new Map();
  TOUS.forEach(o => {
    // sans nom, un emplacement n'a personne à proposer
    if (o.kind !== "stand" || !o.nom) return;
    /* Dédoublonné par fiche : une liste à choix multiple peut porter deux fois
       la même valeur, et l'exposant compterait deux fois dans la sienne. */
    new Set(valeursCritere(o, cle)).forEach(v => {
      if (!par.has(v)) par.set(v, []);
      par.get(v).push(o);
    });
  });
  return par;
}

/**
 * Les valeurs sur lesquelles une suggestion peut tomber, de la plus portée à
 * la moins portée.
 *
 * Deux exposants ne suffisent pas, même au seuil le plus bas : il faudrait que
 * le visiteur les retienne tous les deux pour l'atteindre, et il ne resterait
 * alors personne à proposer. On s'arrête donc à trois — ce qui écarte du même
 * coup la longue traîne des valeurs qu'un seul exposant porte, et garde la
 * liste des réglages lisible sur un salon rangé par ville.
 */
function valeursSugg(cle){
  return [...indexSugg(cle)]
    .filter(([, l]) => l.length >= 3)
    .sort((a, b) => (b[1].length - a[1].length) || COLLATION.compare(a[0], b[0]))
    .map(([v, l]) => ({ v, expos: l }));
}

/* ------------------------------------------------------------
   Côté administration
   ------------------------------------------------------------ */
/**
 * Le classement d'activité, relevé dans les compteurs et réduit par valeur.
 *
 * `audience_cibles` rend les cibles consultées, de la plus ouverte à la moins
 * ouverte, et seulement celles que quelqu'un a ouvertes : un salon qui n'a pas
 * encore ouvert rend une liste vide, et la suggestion se tait plutôt que de
 * proposer au hasard un exposant qu'elle annonce comme le plus consulté.
 */
async function relevePalmares(cle){
  const acces = accesBase();
  if (!acces) throw new Error("session absente, reconnectez-vous");
  const evt = await evenementCourant(acces);
  const r = await base(acces, "rpc/audience_cibles", {
    method: "POST",
    body: JSON.stringify({ p_evenement: evt, p_jours: null, p_genre: "fiche_stand" }),
  });
  const rang = new Map(((r && r.cibles) || []).map((c, i) => [String(c.id), i]));
  const auto = {};
  valeursSugg(cle).forEach(({ v, expos }) => {
    const l = expos.filter(o => rang.has(String(o.id)))
      .sort((a, b) => rang.get(String(a.id)) - rang.get(String(b.id)))
      .slice(0, SUGG_CHAMPIONS).map(o => String(o.id));
    if (l.length) auto[v] = l;
  });
  return auto;
}

/** « G55 — SMC2 », pour une liste de choix. */
const etiquetteSugg = (o) => [o.code, o.nom].filter(Boolean).join(" — ") || o.id;

/**
 * Le volet « Suggestion » des réglages.
 *
 * Le corps se redessine à chaque choix plutôt que de tout montrer d'avance :
 * le classement et la liste des exposants choisis à la main ne se lisent pas
 * ensemble — ils répondent à la même question, et la seconde réponse qu'on ne
 * suit pas se lit comme un réglage oublié.
 */
export function voletSuggestion(hote){
  const p = document.createElement("p");
  p.textContent = "Un exposant de plus, proposé au visiteur quand plusieurs " +
    "de ceux qu'il a retenus dans son parcours se ressemblent. Le " +
    "rapprochement se fait sur son appareil, à partir de tables préparées " +
    "ici : rien de ce qu'il retient ne remonte jamais.";
  hote.appendChild(p);

  if (conf("_parcours").visible === false){
    const a = document.createElement("p");
    a.className = "alerte";
    a.textContent = "Le parcours de visite est retiré de ce plan, dans " +
      "l'onglet « Admin » : sans lui, il n'y a ni liste à compléter ni tiroir " +
      "où poser la proposition.";
    hote.appendChild(a);
  }

  const cles = clesCriteres();
  if (!cles.length){
    const a = document.createElement("p");
    a.className = "alerte";
    a.textContent = "Aucun critère n'est réglé sur ce salon : le " +
      "rapprochement n'a rien sur quoi se faire. Les champs qui font des " +
      "critères se désignent dans la console, sur la fiche du salon ; le " +
      "secteur en est un dès que « Montrer les secteurs » est coché.";
    hote.appendChild(a);
    return;
  }

  const r = reglageSugg();

  const bloc = document.createElement("div");
  bloc.className = "reglages";
  const l = document.createElement("label");
  l.innerHTML = '<input type="checkbox"><span></span>';
  l.querySelector("span").textContent = "Proposer un exposant pour compléter le parcours";
  const marche = l.querySelector("input");
  marche.checked = r.active === true;
  bloc.appendChild(l);
  hote.appendChild(bloc);

  const corps = document.createElement("div");
  corps.className = "voletSugg";
  hote.appendChild(corps);

  marche.onchange = e => {
    r.active = e.target.checked;
    enregistreConf();
    glisseFenetre(dessine);
    // le tiroir ouvert derrière la fenêtre obéit sur-le-champ
    rafraichitParcours();
  };

  /* Ce qui se lit sous la case, et qui dépend de tout ce qui précède : le
     critère décide des valeurs, la provenance décide de ce qu'on en montre. */
  function dessine(){
    corps.innerHTML = "";
    if (r.active !== true) return;
    /* Un salon qui vient d'allumer la suggestion n'a pas de critère retenu : le
       premier de la liste est celui que la console range en tête, et le plus
       large — le secteur quand il y en a un. Retenu pour de bon, et non le
       temps d'afficher la liste : c'est déjà celui sur lequel les visiteurs
       seront rapprochés. */
    if (!critereSugg()){ r.critere = cles[0]; enregistreConf(); }

    const crit = champZone(corps, "Critère de rapprochement",
      document.createElement("select"),
      "Ce que plusieurs exposants d'une même liste doivent avoir en commun " +
      "pour qu'on en propose un de plus. Ce sont les critères de recherche du " +
      "salon, ceux-là mêmes que le visiteur peut cocher.");
    crit.innerHTML = cles.map(c =>
      '<option value="' + esc(c) + '">' + esc(libelleCritere(c)) + "</option>").join("");
    crit.value = r.critere;
    crit.onchange = e => {
      r.critere = e.target.value;
      /* Les tables sont rangées par valeur, et les valeurs d'un autre champ ne
         désignent rien ici : les garder aurait laissé un réglage invisible
         décider de ce qu'on propose. */
      delete r.fixes; delete r.auto; delete r.releve;
      enregistreConf();
      glisseFenetre(dessine);
      rafraichitParcours();
    };

    const seuil = document.createElement("div");
    seuil.className = "reglage-nb";
    seuil.innerHTML = '<label><span class="l"></span>' +
      '<input type="number" min="' + SUGG_SEUIL_MIN + '" max="' + SUGG_SEUIL_MAX + '" step="1">' +
      '<span class="u">exposants</span></label><span class="aide"></span>';
    seuil.querySelector(".l").textContent = "Déclencher à partir de";
    seuil.querySelector(".aide").textContent =
      "Combien d'exposants d'une même valeur doivent figurer dans le parcours " +
      "avant qu'on en propose un autre. Plus bas, la proposition arrive tôt et " +
      "au jugé ; plus haut, elle se fait attendre.";
    const nb = seuil.querySelector("input");
    nb.value = seuilSugg();
    /* Un champ vidé le temps de retaper ne doit rien écrire : on ne retient
       que ce qui tient dans les bornes, et le champ se remet d'aplomb quand on
       le quitte — comme le temps de visite, dans l'onglet « Plan ». */
    nb.oninput = e => {
      const v = Math.round(+e.target.value);
      if (v >= SUGG_SEUIL_MIN && v <= SUGG_SEUIL_MAX){
        r.seuil = v; enregistreConf(); rafraichitParcours();
      }
    };
    nb.onblur = () => { nb.value = seuilSugg(); };
    corps.appendChild(seuil);

    const prez = champZone(corps, "Présentation",
      document.createElement("div"),
      "Dans le parcours, la proposition attend en tête de la liste, là où le " +
      "visiteur va de lui-même. Dans une fenêtre, elle s'ouvre dès que le " +
      "seuil est atteint : elle se voit, et elle interrompt. Elle ne s'y " +
      "impose qu'une fois par proposition, jamais par-dessus une autre " +
      "fenêtre, et jamais à l'ouverture du plan sur une liste d'hier. Les " +
      "deux cochées, la fenêtre refermée laisse la proposition dans le parcours.");
    const cases = {};
    [["tiroir", "En tête du parcours de visite"],
     ["fenetre", "Dans une fenêtre, dès le seuil atteint"]].forEach(([ou, libelle]) => {
      const l = document.createElement("label");
      l.className = "cocheZ";
      l.innerHTML = '<input type="checkbox"><span></span>';
      l.querySelector("span").textContent = libelle;
      cases[ou] = l.querySelector("input");
      prez.appendChild(l);
    });
    /* La dernière case cochée ne se décoche pas : sans l'une ni l'autre, la
       proposition serait calculée pour n'être montrée nulle part — ce que la
       case « Proposer » dit déjà, et plus franchement. */
    const accorde = () => {
      const l = presentationsSugg();
      PRESENTATIONS_SUGG.forEach(ou => {
        cases[ou].checked = l.indexOf(ou) >= 0;
        cases[ou].disabled = l.length === 1 && cases[ou].checked;
      });
    };
    PRESENTATIONS_SUGG.forEach(ou => {
      cases[ou].onchange = () => {
        r.presentation = PRESENTATIONS_SUGG.filter(x => cases[x].checked);
        enregistreConf();
        accorde();
        // la carte quitte le tiroir ou y revient : il obéit sur-le-champ
        rafraichitParcours();
      };
    });
    accorde();

    const source = champZone(corps, "Exposant proposé",
      document.createElement("select"),
      "D'où vient le nom qu'on met sous les yeux du visiteur.");
    source.innerHTML =
      '<option value="activite">Le plus consulté du salon, dans cette valeur</option>' +
      '<option value="fixe">Un exposant choisi, un par valeur</option>';
    source.value = r.source === "fixe" ? "fixe" : "activite";
    source.onchange = e => {
      r.source = e.target.value;
      enregistreConf();
      glisseFenetre(dessine);
      rafraichitParcours();
    };

    if (r.source === "fixe") choixFixes(corps); else palmaresEnPlace(corps);
  }

  /* --- la provenance « le plus consulté » --- */
  function palmaresEnPlace(hote2){
    const cle = r.critere;
    const valeurs = valeursSugg(cle);
    const bloc2 = document.createElement("div");
    bloc2.className = "champZ";
    bloc2.innerHTML = '<span class="tZ">Classement</span>' +
      '<p class="aideZ">Relevé dans les compteurs d\'usage, sur toute la vie ' +
      'du salon. Il ne part aux visiteurs que réduit à ce qu\'il en faut — les ' +
      'trois exposants les plus consultés de chaque valeur — et jamais entier : ' +
      'le classement d\'un salon ne regarde que son organisateur.</p>' +
      '<p class="etatZ"></p><div class="acts"></div><div class="suggVals"></div>';
    hote2.appendChild(bloc2);
    const etat = bloc2.querySelector(".etatZ");
    const liste = bloc2.querySelector(".suggVals");

    const ecrit = () => {
      const auto = r.auto || {};
      const n = Object.keys(auto).length;
      etat.dataset.mal = "false";
      etat.textContent = r.releve
        ? n + (n > 1 ? " valeurs ont" : " valeur a") + " un exposant à proposer, " +
          "sur " + valeurs.length + " · relevé le " +
          new Date(r.releve).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })
        : "Aucun relevé pour l'instant : la suggestion se tait tant qu'elle " +
          "n'a pas de classement.";
      liste.innerHTML = "";
      valeurs.forEach(({ v, expos }) => {
        const ids = auto[v] || [];
        const chef = ids.length ? parId.get(String(ids[0])) : null;
        const rang = document.createElement("div");
        rang.className = "rang";
        rang.innerHTML = '<span class="nV"></span><span class="vV"></span>' +
          '<span class="cV"></span>';
        rang.querySelector(".nV").textContent = nomValeurSugg(cle, v);
        rang.querySelector(".vV").textContent = chef
          ? chef.nom : "personne n'a encore été consulté ici";
        if (!chef) rang.querySelector(".vV").classList.add("rien");
        rang.querySelector(".cV").textContent = expos.length + " exposants";
        liste.appendChild(rang);
      });
    };

    const acts = bloc2.querySelector(".acts");
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn";
    b.textContent = "Relever le classement";
    acts.appendChild(b);

    const releve = (dire) => {
      b.disabled = true;
      if (dire){ etat.dataset.mal = "false"; etat.textContent = "Lecture des compteurs…"; }
      return relevePalmares(cle).then(auto => {
        /* On n'écrit que si quelque chose a bougé : ce volet se relève à chaque
           ouverture, et republier un relevé identique ferait repartir la
           configuration entière pour rien. */
        if (JSON.stringify(auto) !== JSON.stringify(r.auto || {}) || !r.releve){
          r.auto = auto;
          r.releve = new Date().toISOString();
          enregistreConf();
          rafraichitParcours();
        }
        b.disabled = false;
        glisseFenetre(ecrit);
      }).catch(e => {
        b.disabled = false;
        /* Un relevé qui échoue ne retire rien : le précédent reste en place et
           continue de servir, on dit seulement qu'il n'a pas été rafraîchi. */
        ecrit();
        etat.dataset.mal = "true";
        etat.textContent = "Classement non rafraîchi : " + e.message;
      });
    };

    b.onclick = () => releve(true);
    ecrit();
    /* Et d'office en arrivant : un classement qu'il faut penser à rafraîchir
       est un classement périmé le jour du salon. */
    releve(false);
  }

  /* --- la provenance « un exposant choisi » --- */
  function choixFixes(hote2){
    const cle = r.critere;
    const valeurs = valeursSugg(cle);
    const bloc2 = document.createElement("div");
    bloc2.className = "champZ";
    bloc2.innerHTML = '<span class="tZ">Un exposant par valeur</span>' +
      '<p class="aideZ">Chaque liste ne propose que les exposants qui portent ' +
      'cette valeur : ce qu\'on met sous les yeux du visiteur doit ressembler ' +
      'à ce qu\'il a retenu. Une valeur laissée vide ne propose rien, et le ' +
      'plan passe à la suivante.</p><div class="suggVals"></div>';
    hote2.appendChild(bloc2);
    const liste = bloc2.querySelector(".suggVals");

    /* Ce que le volet ne montre plus ne doit plus décider de rien : un exposant
       désigné puis démonté, une valeur retombée sous les trois exposants qu'il
       lui faut. L'un s'afficherait « aucun » pendant que le réglage continue de
       le nommer, l'autre proposerait sans que rien ne le dise ici. On les
       retire pour de bon, en une fois. */
    let perimes = false;
    Object.keys(r.fixes || {}).forEach(v => {
      if (!valeurs.some(x => x.v === v)){ delete r.fixes[v]; perimes = true; }
    });

    valeurs.forEach(({ v, expos }) => {
      const rang = document.createElement("div");
      rang.className = "rang";
      rang.innerHTML = '<span class="nV"></span><select></select>' +
        '<span class="cV"></span>';
      rang.querySelector(".nV").textContent = nomValeurSugg(cle, v);
      rang.querySelector(".cV").textContent = expos.length + " exposants";
      const s = rang.querySelector("select");
      s.innerHTML = '<option value="">— aucun —</option>' +
        expos.slice().sort((a, b) => COLLATION.compare(String(a.nom), String(b.nom)))
          .map(o => '<option value="' + esc(o.id) + '">' +
                    esc(etiquetteSugg(o)) + "</option>").join("");
      const garde = String((r.fixes || {})[v] || "");
      s.value = garde;
      if (garde && s.value !== garde){ delete r.fixes[v]; perimes = true; }
      s.onchange = e => {
        const f = r.fixes || (r.fixes = {});
        if (e.target.value) f[v] = e.target.value; else delete f[v];
        enregistreConf();
        rafraichitParcours();
      };
      liste.appendChild(rang);
    });

    if (perimes){ enregistreConf(); rafraichitParcours(); }
  }

  dessine();
}
