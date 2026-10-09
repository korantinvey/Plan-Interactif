/* ============================================================
   L'avancement d'une synchronisation — la fenêtre, et son secours

   Une synchronisation dure, et se raconte pendant qu'elle dure : la fenêtre
   suit les étapes que le serveur annonce, et le relevé de secours va lire à la
   base où il en est quand le flux ne passe pas. L'appel lui-même — le flux, la
   session, le refus — reste à la console (`_console-js.html` `fluxFonction`,
   `synchronise`), qui les relie.

   Ce que le module ne peut pas importer lui est confié par la console
   (`brancheAvancement`) : la fenêtre du socle, qui n'est pas celle du plan
   (`modules/fenetre.mjs`), et l'appel à la base, porteur de la session.
   ============================================================ */

/** @type {{
 *   ouvreModale: (titre: string, remplit: (corps: HTMLElement) => void,
 *     boutons: Array<{ libelle: string, genre?: string, action?: () => any }>,
 *     apres?: () => void) => void,
 *   verrouilleModale: (oui: boolean) => void,
 *   rest: (chemin: string, options?: RequestInit) => Promise<any>,
 * }} */
let _console = {
  ouvreModale: () => {},
  verrouilleModale: () => {},
  rest: async () => null,
};

/** Ce que la console confie à la fenêtre et au relevé : voir `_console`. */
export function brancheAvancement(branche) {
  _console = branche;
}

/**
 * La fenêtre qui rend compte d'une synchronisation.
 *
 * Elle montre trois choses, et pas une de plus : où l'on en est dans
 * l'ensemble, où l'on en est dans l'étape qui tourne, et ce qui a été compté.
 * La barre du haut est jalonnée d'une étape à l'autre — un jalon par étape,
 * régulièrement espacés — parce qu'une barre nue dit qu'on attend sans dire
 * quoi ; la sous-barre suit les éléments de l'étape en cours ; le tableau en
 * dessous garde les chiffres, qui sont ce qu'on vient vérifier.
 *
 * Les jalons sont à intervalle égal, et leur part n'est pas chiffrée. Posés à
 * la part que le nombre d'éléments valait à chaque étape, ils tombaient à des
 * endroits — 46 %, 57 % — qui donnaient à lire une précision qui n'existe pas :
 * ce sont des estimations, pas une promesse de durée. Une étape vaut une
 * étape ; ce qui se compte vraiment se compte dans l'étape, sur la sous-barre
 * et dans le tableau.
 *
 * Les étapes sont annoncées par le serveur, non devinées ici : lui seul sait
 * ce qu'il va réellement faire. Le poids qu'il leur donne — leur nombre
 * d'éléments, estimé d'après la dernière synchronisation puis corrigé — ne
 * décide plus de la largeur d'un segment ; il sert de repère à l'avancement
 * d'une étape dont on ignore le total, et un poids nul dit qu'elle n'est pas
 * reprise du tout.
 *
 * La fenêtre ne se ferme pas d'elle-même : le bilan est ce qu'on vient y lire,
 * et il arrive à la dernière ligne.
 */
export function fenetreAvancement(titre, etiquette) {
  let etapes = [], vivante = true, plafond = 0, annoncees = false;
  const compte = new Map();
  let rail, noms, pctTxt, quoi, compteTxt, sous, sousJauge, dl, bilan, ecarte, chrono, relais;
  const nb = (n) => Math.round(Number(n) || 0).toLocaleString("fr-FR");

  /* Le temps écoulé depuis le clic, affiché en clair.

     Une attente ne se raconte pas : « c'est long » ne dit pas si l'on a
     patienté six secondes ou soixante, et c'est pourtant là-dessus que se
     tranche un serveur lent d'une réponse retenue en chemin. Le chronomètre
     rend cette différence lisible sans ouvrir le journal. */
  const duree = (ms) => {
    const s = Math.floor(ms / 1000);
    return s < 60 ? s + " s"
      : Math.floor(s / 60) + " min " + String(s % 60).padStart(2, "0") + " s";
  };

  /* Le journal de la synchronisation, du clic à la dernière ligne.

     Il ne garde pas seulement ce que le serveur a dit, mais quand chaque chose
     est arrivée et en combien de tronçons : c'est la seule façon de
     distinguer, après coup, un serveur lent d'un relais qui retient. Il sert
     donc au diagnostic d'un défaut d'affichage autant qu'à celui d'une
     synchronisation ratée.

     Il vit dans la page et nulle part ailleurs : on ne l'envoie à personne, on
     le télécharge. */
  const t0 = performance.now();
  const horloge = setInterval(() => {
    if (chrono) chrono.textContent = duree(performance.now() - t0);
  }, 500);
  const journal = {
    salon: etiquette || titre,
    ouvertLe: new Date().toISOString(),
    page: location.href,
    navigateur: navigator.userAgent,
    lignes: [],
  };
  const trace = (o) => {
    journal.lignes.push({ ms: Math.round(performance.now() - t0), ...o });
    /* La réponse reçue mérite d'être dite : tant qu'on lit « Connexion au
       serveur… », on ne sait pas si c'est le réseau, la fonction ou un tampon
       qui fait attendre. Ce message-là tranche entre le premier et les deux
       autres. */
    if (o.evt === "reponse" && quoi && !annoncees) {
      quoi.textContent = "Réponse reçue — en attente de la première étape…";
    }
  };

  function telechargeJournal() {
    const nomFichier = "synchro-" +
      String(etiquette || "salon").toLowerCase().normalize("NFD")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + "-" +
      new Date().toISOString().slice(0, 19).replace(/[:T-]/g, "") + ".json";
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(
      new Blob([JSON.stringify(journal, null, 2)], { type: "application/json" }));
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    // révoquer tout de suite annulerait le téléchargement en cours
    setTimeout(() => URL.revokeObjectURL(lien.href), 10000);
  }

  _console.ouvreModale(titre, (c) => {
    const d = document.createElement("div");
    d.className = "sync";
    d.innerHTML =
      '<div class="sync-tete"><span class="eyebrow">Avancement</span>' +
        '<span class="sync-chrono mono">0 s</span>' +
        '<span class="sync-pct mono">0 %</span></div>' +
      '<div class="sync-noms"></div>' +
      '<div class="sync-rail"><span class="sync-depart"></span></div>' +
      '<p class="sync-ecarte" hidden></p>' +
      '<p class="sync-relais" hidden></p>' +
      '<div class="sync-cours"><span class="sync-quoi"></span>' +
        '<span class="sync-compte mono"></span></div>' +
      '<div class="sync-sous" data-etat="battant"><span></span></div>' +
      '<dl class="sync-chiffres"></dl>' +
      '<p class="sync-bilan"></p>';
    c.appendChild(d);
    rail = d.querySelector(".sync-rail");
    noms = d.querySelector(".sync-noms");
    pctTxt = d.querySelector(".sync-pct");
    quoi = d.querySelector(".sync-quoi");
    compteTxt = d.querySelector(".sync-compte");
    sous = d.querySelector(".sync-sous");
    sousJauge = sous.querySelector("span");
    dl = d.querySelector(".sync-chiffres");
    bilan = d.querySelector(".sync-bilan");
    ecarte = d.querySelector(".sync-ecarte");
    chrono = d.querySelector(".sync-chrono");
    relais = d.querySelector(".sync-relais");
    quoi.textContent = "Connexion au serveur…";
  }, [
    /* Le journal se télécharge aussi pendant que ça tourne, et pas seulement
       à la fin : une synchronisation qui reste muette est justement celle dont
       on voudrait le relevé, et attendre une fin qui ne vient pas le rendrait
       inatteignable. */
    { libelle: "Journal", action: () => { telechargeJournal(); return false; } },
    { libelle: "Fermer", genre: "primaire" },
  ], () => { vivante = false; clearInterval(horloge); });
  _console.verrouilleModale(true);

  // Les étapes qui ont un segment : celles que la synchronisation reprend.
  const vues = () => etapes.filter((e) => e.poids > 0);

  /* Un segment par étape, tous de même largeur, et un jalon au bout de chacun.
     Une étape non reprise n'a pas de segment : elle en occuperait un sans
     jamais rien y faire avancer. Elle est nommée sous la barre, pour qu'on la
     sache écartée et non oubliée. */
  function construitRail() {
    if (!rail) return;
    rail.innerHTML = '<span class="sync-depart"></span>';
    noms.innerHTML = "";
    vues().forEach((e) => {
      e.seg = document.createElement("div");
      e.seg.className = "sync-seg";
      e.seg.innerHTML =
        '<span class="sync-piste"><span></span></span><span class="sync-point"></span>';
      rail.appendChild(e.seg);

      e.nom = document.createElement("div");
      e.nom.className = "sync-nom";
      e.nom.textContent = e.libelle;
      e.nom.title = e.libelle + (e.source && e.source !== "aucun" ? " — " + e.source : "");
      noms.appendChild(e.nom);
    });
    const hors = etapes.filter((e) => e.poids <= 0);
    ecarte.hidden = !hors.length;
    ecarte.textContent = hors.length
      ? "Non repris : " + hors.map((e) => e.libelle + (e.det ? " (" + e.det + ")" : "")).join(" · ")
      : "";
  }

  function rafraichit() {
    if (!rail) return;
    vues().forEach((e) => {
      if (!e.seg) return;
      e.seg.dataset.etat = e.etat;
      e.nom.dataset.etat = e.etat;
      e.seg.querySelector(".sync-piste > span").style.width =
        Math.round(e.frac * 100) + "%";
    });
    /* Le pourcentage et le remplissage disent la même chose, et c'est la
       condition pour qu'on les croie : les segments étant égaux, la part faite
       est la moyenne de ce que chaque étape a avancé. */
    const l = vues();
    const p = l.reduce((a, e) => a + e.frac, 0) / (l.length || 1) * 100;
    plafond = Math.max(plafond, Math.min(100, p));
    pctTxt.textContent = Math.round(plafond) + " %";
    /* Tant qu'aucune étape n'a bougé, le curseur se tient au point de départ.
       Une barre entièrement grise et un écran figé se ressemblent trop : c'est
       ce point allumé, avec le chronomètre et la sous-barre qui bat, qui dit
       qu'on attend le serveur et non qu'on a planté. */
    rail.dataset.etat = l.some((e) => e.etat !== "attente") ? "" : "connexion";
  }

  return {
    /** Le relevé de ce que le flux a rendu, et de quand. */
    trace,

    /**
     * Dire que l'avancement ne vient pas du flux, mais d'un relevé au serveur.
     *
     * Une fois, et sans plus disparaître : c'est la seule marque visible d'un
     * flux retenu en chemin. Sans elle, on chercherait la panne du côté de la
     * synchronisation — qui, elle, se déroule normalement — au lieu de la
     * chercher entre le serveur et ce poste-là.
     */
    avoueReleve() {
      if (!relais || !relais.hidden) return;
      relais.hidden = false;
      relais.textContent = "Flux retenu en chemin — avancement relevé au serveur.";
    },

    /**
     * La liste des étapes. `pressenties` distingue celle que la console a
     * devinée pour ne pas ouvrir sur une barre vide de celle que le serveur
     * annonce, qui seule fait foi et remplace la première.
     */
    ouvre(liste, pressenties) {
      etapes = liste.map((e) => ({
        cle: e.cle, libelle: e.libelle, source: e.source,
        poids: Math.max(0, Number(e.poids ?? 1) || 0), frac: 0, etat: "attente", det: "",
      }));
      if (!pressenties) annoncees = true;
      construitRail();
      rafraichit();
    },

    /** Une ligne du flux qui parle d'une étape : son état, son poids, son avancement. */
    pas(o) {
      const e = etapes.find((x) => x.cle === o.etape);
      if (!e) return;
      let refaire = false;
      if (o.poids !== undefined) {
        e.poids = Math.max(0, Number(o.poids) || 0);
        refaire = true;
      }
      /* Le détail d'une étape sans segment s'affiche sous la barre, dans la
         ligne des écartées : une étape qui pesait déjà zéro n'en refait pas
         une, et son « non synchronisé » ne s'y serait jamais posé. */
      if (o.info !== undefined && e.det !== String(o.info)) {
        e.det = String(o.info);
        if (e.poids <= 0) refaire = true;
      }
      if (o.fait !== undefined) {
        /* Sans total connu — les catégories Eventmaker ne disent pas combien
           de fiches elles portent — l'estimation d'après la dernière
           synchronisation tient lieu de repère. Plafonnée, elle ne prétend
           jamais avoir fini. */
        const f = o.total
          ? Math.min(1, o.fait / o.total)
          : Math.min(0.95, e.poids ? o.fait / e.poids : 0);
        e.frac = Math.max(e.frac, f);
      }
      if (o.etat) {
        e.etat = o.etat;
        if (o.etat === "fait") e.frac = 1;
        if (o.etat === "ignoree") {
          e.frac = 1;
          if (e.poids > 0) { e.poids = 0; refaire = true; }
        }
      }
      if (o.etat === "encours" && quoi) {
        quoi.textContent = e.libelle + " · " + (o.detail || e.det || "en cours");
        const u = o.unite ? " " + o.unite : "";
        /* Un pavillon entamé compte pour le premier, pas pour zéro : la part
           est fractionnaire — c'est elle qui remplit la sous-barre — mais le
           décompte se lit en éléments entiers. */
        compteTxt.textContent = o.fait === undefined ? ""
          : o.total ? Math.ceil(o.fait).toLocaleString("fr-FR") + " / " + nb(o.total) + u
          : o.fait ? nb(o.fait) + u : "";
        const bat = o.fait !== undefined && !o.total;
        sous.dataset.etat = bat ? "battant" : "chiffre";
        sousJauge.style.width = bat ? "100%"
          : Math.round((o.total ? Math.min(1, o.fait / o.total) : 0) * 100) + "%";
      }
      if (refaire) construitRail();
      rafraichit();
    },

    /** Les compteurs, qui s'écrasent par leur nom et ne font qu'une ligne chacun. */
    chiffres(o) {
      Object.entries(o || {}).forEach(([k, v]) => compte.set(k, v));
      if (!dl) return;
      dl.innerHTML = "";
      compte.forEach((v, k) => {
        const l = document.createElement("div");
        l.innerHTML = "<dt></dt><dd></dd>";
        l.querySelector("dt").textContent = k;
        l.querySelector("dd").textContent = nb(v);
        dl.appendChild(l);
      });
    },

    /**
     * Le mot de la fin, et la fenêtre rendue à qui voudra la fermer.
     *
     * Trois fins, et non deux : une synchronisation peut aboutir en laissant
     * un défaut derrière elle — une nomenclature restée en codes — et la dire
     * « interrompue » serait faux, la taire le serait autant.
     *   "ok"     tout est passé
     *   "alerte" c'est fait, mais quelque chose est à regarder
     *   "echec"  on s'est arrêté en chemin
     */
    fini(message, issue) {
      // ne déverrouiller que si c'est toujours cette fenêtre-ci qui est ouverte :
      // une autre a pu prendre sa place pendant que la synchronisation tournait
      if (vivante) _console.verrouilleModale(false);
      clearInterval(horloge);
      if (chrono) chrono.textContent = duree(performance.now() - t0);
      trace({ evt: "fin", issue: issue || "ok", message });
      if (!bilan) return;
      const panne = issue === "echec";
      bilan.className = "sync-bilan " + (issue || "ok");
      bilan.textContent = message;
      /* Sur échec la sous-barre s'efface au lieu de se figer : battante, elle
         restait pleine et se lisait comme une étape réussie, quand le jalon
         rouge au-dessus disait le contraire. Ce qu'elle comptait est de toute
         façon resté dans le tableau. */
      sous.hidden = panne;
      sous.dataset.etat = "fini";
      quoi.textContent = panne ? "Interrompu" : "Terminé";
      compteTxt.textContent = "";
      if (!panne) {
        sousJauge.style.width = "100%";
        plafond = 100;
        pctTxt.textContent = "100 %";
      }
    },
  };
}

/* Le rythme du relevé de secours.

   Le silence se mesure sur le battement du flux, non sur ses lignes : la
   lecture des fiches ou l'allègement d'un calque tiennent la ligne muette
   pendant des dizaines de secondes sans que rien n'aille mal, et c'est
   justement pour le dire que la fonction pousse du remplissage toutes les deux
   secondes. Cinq secondes sans un octet, ce sont donc deux battements manqués
   — un retard que la lenteur seule n'explique plus.

   Puis deux secondes entre deux lectures, soit l'ordre de grandeur du dépôt
   d'en face : une écriture par seconde et demie au plus. */
const RELEVE_SILENCE = 5000, RELEVE_RYTHME = 2000;

/**
 * L'avancement relu sur la fiche du salon, quand le flux ne passe pas.
 *
 * Le flux ne parvient pas partout : un antivirus qui inspecte le TLS, un
 * relais d'entreprise, un compresseur qui attend d'avoir de quoi remplir son
 * bloc gardent la réponse entière et ne la rendent qu'à la fin. La fenêtre
 * reste alors sur « Connexion au serveur… » toute la synchronisation durant,
 * puis affiche le bilan d'un coup — sur un poste, quand le téléphone d'à côté
 * déroule les étapes du même salon. Le serveur a déjà fait tout ce qu'il peut
 * pour que le flux traverse ; ce qui le retient est de l'autre côté.
 *
 * On lit donc ailleurs ce qu'on n'arrive pas à recevoir : la fonction dépose
 * où elle en est sur la ligne du salon, et une requête ordinaire va l'y
 * chercher. Elle rejoue les mêmes lignes que le flux, si bien que la fenêtre
 * ignore laquelle des deux voies la nourrit.
 *
 * Le relevé se reconnaît à un jeton tiré ici et passé à la fonction, non à sa
 * date : comparer l'horloge du serveur à celle du poste reviendrait à confier
 * l'affichage au réglage de ce dernier. Un jeton qui ne correspond pas — une
 * fonction d'avant qui ne le renvoie pas encore, un relevé qu'une
 * synchronisation morte a laissé là — laisse simplement le secours muet.
 */
export function suitAuServeur(id, jeton, applique, vue) {
  let vivant = true, minuteur = null, annonce = false;
  let dernierSigne = Date.now();

  const tour = async () => {
    /* Le secours se retire tant que le flux donne signe de vie — mais il ne se
       retire pas pour de bon : une réponse rendue par à-coups, ou dont seul le
       premier tronçon passe avant qu'un tampon ne se referme, laisserait
       sinon la fenêtre muette pour tout le reste. */
    if (vivant && Date.now() - dernierSigne >= RELEVE_SILENCE) {
      try {
        const r = await _console.rest("evenement?id=eq." + id + "&select=sync_avancement");
        const etat = r?.[0]?.sync_avancement;
        if (vivant && etat && etat.jeton === jeton) {
          const lignes = etat.lignes || [];
          vue.trace({ evt: "releve", lignes: lignes.length });
          vue.avoueReleve();
          lignes.forEach((o) => {
            /* L'annonce des étapes refait la barre et remet chacune à zéro :
               la rejouer à chaque tour la ferait clignoter pour rien. */
            if (o.etapes && annonce) return;
            if (o.etapes) annonce = true;
            applique(o);
          });
        }
      } catch (err) {
        // une lecture manquée n'est qu'un tour perdu : la synchronisation, elle,
        // suit son cours de son côté
        vue.trace({ evt: "releve-refuse", message: err.message });
      }
    }
    if (vivant) minuteur = setTimeout(tour, RELEVE_RYTHME);
  };

  minuteur = setTimeout(tour, RELEVE_SILENCE);
  return {
    /** Un octet est arrivé par le flux : c'est qu'il n'a pas été retenu. */
    signeDeVie() { dernierSigne = Date.now(); },
    arrete() { vivant = false; clearTimeout(minuteur); },
  };
}
