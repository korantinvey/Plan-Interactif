/* ============================================================
   Fiche d'un salon dans la console — ses champs, ses pavillons, ses sources

   Ce que la console montre du salon ouvert (`dessineFiche`) : son identité —
   nom, identifiant d'adresse, icône de l'onglet, fuseau —, ses données — leur
   provenance, la fiche détail, la synchronisation —, ses pavillons et le
   fragment qui l'intègre à un site. S'y ajoute la fenêtre « Sources de
   données » (`ouvreSources`), où se saisissent les identifiants du salon chez
   chaque fournisseur : elle écrit les mêmes colonnes, par les mêmes champs.

   Le salon ouvert, ses pavillons et son écriture viennent de
   `evenements.mjs` ; la provenance, la fiche détail, le fuseau, la
   synchronisation et l'icône de l'onglet, de leurs modules ; la session, lue
   au moment de dessiner, les briques et la fenêtre, la barre d'état, l'appel
   à la base et l'adresse des pages, du socle (`socle-console.mjs`,
   `fenetre-console.mjs`). Ce que la console redessine après une écriture —
   tout l'écran, la liste des salons, l'adresse — lui est confié par l'écran
   de la console (`brancheFiche`, `ecran-console.mjs`), qui l'importe :
   l'importer ici bouclerait.
   ============================================================ */
import { $ } from "./dom.mjs";
import { reduitIcone } from "./icone-onglet.mjs";
import { champFuseau } from "./fuseau.mjs";
import { synchronise } from "./synchronisation.mjs";
import { MOI } from "./comptes.mjs";
import { PLANS, courant, majEvenement, slugifie } from "./evenements.mjs";
import { DOMAINES, FOURNISSEURS_CONF, fournisseurUtilise, source, resumeProvenance,
  ouvreProvenance } from "./provenance.mjs";
import { resumeFiche, ouvreFiche } from "./fiche-detail.mjs";
import { ouvreModale } from "./fenetre-console.mjs";
import { SESSION, bloc, grille, signale, rest, BASE_PAGES } from "./socle-console.mjs";

/** @type {{
 *   dessine: () => void,
 *   dessineChoix: () => void,
 *   majAdresse: () => void,
 * }} */
let _console = {
  dessine: () => {},
  dessineChoix: () => {},
  majAdresse: () => {},
};

/** Ce que la console confie à la fiche : voir `_console`. */
export function brancheFiche(branche) {
  _console = branche;
}

const RYTHMES = [[0, "Manuel uniquement"], [15, "Toutes les 15 minutes"],
                 [60, "Toutes les heures"], [360, "Toutes les 6 heures"],
                 [1440, "Une fois par jour"]];

/* ------------------------------------------------------------------
   Fiche
   ------------------------------------------------------------------ */
function champ(cle, libelle, aide, attrs) {
  const e = courant();
  const l = document.createElement("label");
  l.innerHTML = '<span></span><input ' + (attrs || "") + '>' + (aide ? '<span class="aide"></span>' : "");
  l.querySelector("span").textContent = libelle;
  if (aide) l.querySelector(".aide").textContent = aide;
  const i = l.querySelector("input");
  i.value = e[cle] == null ? "" : e[cle];
  let attente;
  i.oninput = () => {
    e[cle] = i.value;
    if (cle === "slug") e.slug = slugifie(i.value);
    clearTimeout(attente);
    attente = setTimeout(async () => {
      try {
        await majEvenement(e.id, { [cle]: e[cle] });
        if (cle === "nom") _console.dessineChoix();
        if (cle === "slug") { i.value = e.slug; majIntegration(); _console.majAdresse(); }
      } catch (err) { signale(err.message, true); }
    }, 500);
  };
  return l;
}


/* ------------------------------------------------------------------
   Icône de l'onglet

   L'image déposée se réduit dans `modules/icone-onglet.mjs` (`reduitIcone`,
   ses paliers et le poids retenu) ; ici, le champ qui la montre et l'écrit.
   ------------------------------------------------------------------ */

/**
 * Le champ de l'icône : la choisir, la voir, la retirer.
 *
 * Il s'écrit au moment du choix, et non à la sortie de la fiche comme les
 * champs de texte voisins : déposer une image est déjà un geste achevé, et
 * rien ne s'y saisit à moitié. Le retrait part de même, et rend l'onglet à
 * l'icône du navigateur.
 *
 * La vignette est aussi la cible du glisser-déposer — c'est le geste qu'on
 * fait devant elle, et il évite la boîte de dialogue du système.
 */
function champFavicon() {
  const e = courant();
  const l = document.createElement("div");
  l.className = "champ-fic";
  l.innerHTML = '<span></span>' +
    '<div class="iconeZ"><div class="vue"></div>' +
    '<div class="actes"><button type="button" class="btn petit"></button>' +
    '<button type="button" class="btn petit oter">Retirer</button>' +
    '<span class="dit"></span></div>' +
    '<input type="file" accept="image/*" hidden></div>' +
    '<span class="aide"></span>';
  l.querySelector("span").textContent = "Icône de l'onglet";
  l.querySelector(".aide").textContent =
    "Elle paraît dans l'onglet du plan public comme dans celui de " +
    "l'administration, à côté du nom du salon. Réduite puis enregistrée avec " +
    "l'événement, elle part avec le plan sans dépendre d'un fichier hébergé " +
    "ailleurs. Un carré se reconnaît mieux à seize pixels qu'un logo en " +
    "longueur. Glissez-la sur la vignette, ou choisissez-la.";

  const vue = l.querySelector(".vue");
  const choisir = l.querySelector(".actes button");
  const oter = l.querySelector(".oter");
  const dit = l.querySelector(".dit");
  const fichier = l.querySelector("input");

  const peint = (mot) => {
    vue.innerHTML = e.favicon ? '<img alt="">' : '<span>Aucune</span>';
    if (e.favicon) vue.querySelector("img").src = e.favicon;
    choisir.textContent = e.favicon ? "Remplacer…" : "Choisir un fichier…";
    oter.hidden = !e.favicon;
    dit.dataset.mal = "false";
    dit.textContent = mot !== undefined ? mot
      : e.favicon ? Math.round(e.favicon.length / 1365) + " Ko" : "";
  };

  const ecrit = async (src) => {
    const avant = e.favicon;
    e.favicon = src;
    peint(src ? "Enregistrement…" : "Retrait…");
    try {
      await majEvenement(e.id, { favicon: src || null });
      peint();
    } catch (err) {
      // l'écran doit montrer ce que la base tient, pas ce qu'on a tenté
      e.favicon = avant;
      peint();
      signale(err.message, true);
    }
  };

  const prend = (f) => {
    if (!f) return;
    peint("Lecture…");
    reduitIcone(f).then(ecrit).catch((err) => {
      dit.textContent = "Échec : " + err.message;
      dit.dataset.mal = "true";
    });
  };

  choisir.onclick = () => fichier.click();
  fichier.onchange = () => { prend(fichier.files[0]); fichier.value = ""; };
  oter.onclick = () => ecrit("");
  vue.addEventListener("dragover", (ev) => {
    ev.preventDefault();
    vue.dataset.survol = "1";
  });
  vue.addEventListener("dragleave", () => { delete vue.dataset.survol; });
  vue.addEventListener("drop", (ev) => {
    ev.preventDefault();
    delete vue.dataset.survol;
    prend(ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0]);
  });

  peint();
  return l;
}

export function dessineFiche() {
  const e = courant();
  const f = $("fiche");
  if (!SESSION) { f.innerHTML = '<div class="vide">Connectez-vous pour accéder aux événements.</div>'; return; }
  if (!e) {
    /* Un organisateur sans salon n'a rien à créer et rien à choisir : lui
       proposer « Nouveau » l'enverrait contre un refus de la base. Ce qui lui
       manque, c'est une affectation, et c'est cela qu'on lui dit. */
    f.innerHTML = '<div class="vide"></div>';
    f.querySelector(".vide").innerHTML = MOI?.role === "admin"
      ? "Aucun salon pour l'instant.<br>Créez-en un avec « Nouveau »."
      : "Aucun salon ne vous a été affecté.<br>" +
        "Demandez l'accès à l'administrateur du projet.";
    return;
  }
  f.innerHTML = "";

  const b1 = bloc("Identité");
  const g1 = grille();
  g1.appendChild(champ("nom", "Nom de l'événement"));
  g1.appendChild(champ("slug", "Identifiant d'URL", "Sert d'adresse publique du plan."));
  g1.appendChild(champFavicon());
  g1.appendChild(champFuseau());
  b1.appendChild(g1);
  f.appendChild(b1);

  /* D'où viennent les données, ce qu'on en montre, et à quelle fraîcheur : la
     synchronisation tenait un bloc à elle pour une liste déroulante et un
     bouton, et la question qu'elle répond est celle des lignes voisines. */
  const bd = bloc("Données");
  bd.appendChild(ligneReglage("Provenance des données", () => resumeProvenance(e),
    ouvreProvenance));
  bd.appendChild(ligneReglage("Fiche détail", () => resumeFiche(e), ouvreFiche));

  const rythme = document.createElement("select");
  rythme.setAttribute("aria-label", "Rythme de rafraîchissement");
  rythme.innerHTML = RYTHMES.map((r) => '<option value="' + r[0] + '"' +
    (e.rythme_min === r[0] ? " selected" : "") + '>' + r[1] + '</option>').join("");
  rythme.onchange = async (ev) => {
    e.rythme_min = +(/** @type {HTMLSelectElement} */ (ev.target)).value;
    try { await majEvenement(e.id, { rythme_min: e.rythme_min }); }
    catch (err) { signale(err.message, true); }
  };
  const bsync = document.createElement("button");
  bsync.className = "btn petit";
  bsync.id = "btnSync";
  bsync.textContent = "Synchroniser maintenant";
  bd.appendChild(ligneOutil("Synchronisation", '<span id="msgSync"></span>', [rythme, bsync]));

  f.appendChild(bd);
  majMsgSync(e);
  $("btnSync").onclick = () => synchronise(e);

  /* --- pavillons --- */
  const plans = PLANS[e.id] || [];
  const publies = plans.filter((p) => p.publie).length;
  const b3 = bloc("Pavillons", plans.length
    ? plans.length + " pavillon" + (plans.length > 1 ? "s" : "") + " · " +
      publies + " publié" + (publies > 1 ? "s" : "")
    : "");
  if (!plans.length) {
    const p = document.createElement("p");
    p.className = "astuce";
    p.textContent = "Aucun pavillon connu. Lancez une synchronisation pour les récupérer.";
    b3.appendChild(p);
  } else {
    const t = document.createElement("table");
    // nommé pour qu'un écran étroit le fasse défiler seul, sans emporter la fiche
    t.className = "pavillons";
    t.innerHTML = "<thead><tr><th>Publier</th><th>Pavillon</th><th>Hall</th>" +
      '<th class="num">Emplacements</th><th class="num">Zones</th></tr></thead><tbody></tbody>';
    const tb = t.querySelector("tbody");
    plans.forEach((p) => {
      const tr = document.createElement("tr");
      if (!p.publie) tr.className = "eteint";
      tr.innerHTML = '<td><label class="coche"><input type="checkbox"' +
        (p.publie ? " checked" : "") + '></label></td>' +
        '<td class="nomplan"></td><td class="mono hall"></td>' +
        '<td class="num">' + (p.nb_stands ?? "—") + '</td>' +
        '<td class="num">' + (p.nb_zones ?? "—") + '</td>';
      tr.querySelector(".nomplan").textContent = p.libelle;
      tr.querySelector(".hall").textContent = p.hall || "—";
      tr.querySelector("input").onchange = async (ev) => {
        p.publie = ev.target.checked;
        try {
          await rest("plan?id=eq." + p.id, {
            method: "PATCH",
            headers: { "Prefer": "return=minimal" },
            body: JSON.stringify({ publie: p.publie }),
          });
          _console.dessine();
        } catch (err) { signale(err.message, true); }
      };
      tb.appendChild(tr);
    });
    b3.appendChild(t);
  }
  f.appendChild(b3);

  const b4 = bloc("Intégration");
  const astuce = document.createElement("p");
  astuce.className = "astuce";
  /* Le rapport sépare les portes d'accès : le dire ici, où l'on décide de
     poser le cadre, évite de chercher plus tard pourquoi les visites du site
     n'apparaissent pas dans le même chiffre que celles du plan. */
  astuce.textContent = "Collez ce fragment dans la page du salon. Les visites " +
    "qui en viennent se comptent à part, sous « Cadre sur un site », dans le " +
    "rapport d'utilisation.";
  b4.appendChild(astuce);
  const zone = document.createElement("div");
  zone.className = "integration";
  zone.style.marginTop = "10px";
  zone.innerHTML = '<textarea id="fragment" readonly></textarea>' +
    '<button class="btn petit" id="btnCopier">Copier</button>';
  b4.appendChild(zone);
  f.appendChild(b4);
  majIntegration();
  $("btnCopier").onclick = (ev) => {
    navigator.clipboard?.writeText($("fragment").value).then(
      () => { ev.target.textContent = "Copié"; setTimeout(() => ev.target.textContent = "Copier", 1600); },
      () => { ev.target.textContent = "Échec"; });
  };
}


/**
 * Une ligne du bloc « Données » : ce dont il s'agit, ce que cela vaut, et de
 * quoi le changer. Les trois colonnes sont les mêmes d'une ligne à l'autre —
 * c'est cet alignement qui fait retrouver la ligne qu'on cherche.
 */
function ligneOutil(titre, valeur, controles) {
  const d = document.createElement("div");
  d.className = "reglage-ligne";
  d.innerHTML = '<span class="rt"></span><span class="rv">' + valeur +
                '</span><span class="act"></span>';
  d.querySelector(".rt").textContent = titre;
  const a = d.querySelector(".act");
  controles.forEach((c) => a.appendChild(c));
  return d;
}

/**
 * Une ligne dont le détail s'ouvre en fenêtre : quatre listes déroulantes et
 * neuf cases à cocher rendaient la fiche illisible alors qu'on n'y touche
 * qu'une fois par salon. Ici, seul le résumé reste.
 */
function ligneReglage(titre, resume, ouvre) {
  const b = document.createElement("button");
  b.className = "btn petit";
  b.textContent = "Modifier";
  const d = ligneOutil(titre, "", [b]);
  const v = d.querySelector(".rv");
  const maj = () => { v.textContent = resume(); };
  maj();
  b.onclick = () => ouvre(maj);
  return d;
}

/** Champ de clé. Il n'est pas caché quand le fournisseur n'est pas encore
 *  retenu : on saisit souvent l'identifiant avant de basculer la source. */
function champCle(cle, libelle, aide, forme, exemple) {
  const e = courant();
  const l = document.createElement("label");
  l.innerHTML = '<span></span><input spellcheck="false"><span class="aide"></span>';
  l.querySelector("span").textContent = libelle;
  const i = l.querySelector("input"), a = l.querySelector(".aide");
  i.value = (e.cles || {})[cle] || "";
  i.placeholder = exemple;
  if (!fournisseurUtilise(e, cle)) l.classList.add("source-inerte");

  const dit = () => {
    const v = i.value.trim();
    a.textContent = v && forme && !forme.test(v)
      ? "Format inattendu — un identifiant ressemble à « " + exemple + " »."
      : aide;
    a.classList.toggle("alerte", Boolean(v && forme && !forme.test(v)));
  };
  dit();

  let attente;
  i.oninput = () => {
    dit();
    clearTimeout(attente);
    attente = setTimeout(async () => {
      e.cles = { ...(e.cles || {}) };
      const v = i.value.trim();
      if (v) e.cles[cle] = v; else delete e.cles[cle];
      try { await majEvenement(e.id, { cles: e.cles }); }
      catch (err) { signale(err.message, true); }
    }, 500);
  };
  return l;
}

/**
 * Fenêtre des raccordements, un onglet par fournisseur. Chaque onglet dit
 * aussi ce qu'il alimente : un identifiant saisi sans qu'aucun domaine ne
 * s'en serve ne produirait rien, et c'est le genre d'oubli qu'on ne voit pas.
 */
export function ouvreSources(apres) {
  ouvreModale("Sources de données", (corps) => {
    const e = courant();
    const barre = document.createElement("div");
    barre.className = "onglets";
    const boutons = [], panneaux = [];

    FOURNISSEURS_CONF.forEach((f, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = f.nom;
      b.setAttribute("aria-pressed", String(i === 0));
      barre.appendChild(b);
      boutons.push(b);

      const pan = document.createElement("div");
      pan.hidden = i > 0;
      const g = grille();
      f.champs.forEach((c) => {
        g.appendChild(c.dansCles
          ? champCle(c.dansCles, c.libelle, c.aide, c.forme, c.exemple)
          : champ(c.colonne, c.libelle, c.aide, 'spellcheck="false"'));
      });
      pan.appendChild(g);

      const sert = DOMAINES.filter(([d]) => source(e, d) === f.cle).map(([, lib]) => lib);
      const note = document.createElement("p");
      note.className = "aide";
      note.textContent = sert.length
        ? "Alimente : " + sert.join(", ") + "."
        : "Aucun domaine n'utilise cette source pour le moment.";
      pan.appendChild(note);
      panneaux.push(pan);

      b.onclick = () => {
        boutons.forEach((x, k) => x.setAttribute("aria-pressed", String(k === i)));
        panneaux.forEach((x, k) => { x.hidden = k !== i; });
      };
    });

    corps.appendChild(barre);
    panneaux.forEach((x) => corps.appendChild(x));
  }, [{ libelle: "Terminé", genre: "primaire" }], apres);
}

function majIntegration() {
  const e = courant(), t = $("fragment");
  if (!e || !t) return;
  t.value = '<iframe src="' + BASE_PAGES + 'plan?plan=' + (e.slug || "evenement") +
    '" style="width:100%;height:80vh;border:0" title="Plan du salon" loading="lazy"></iframe>';
}

function majMsgSync(e) {
  const m = $("msgSync");
  if (!m) return;
  if (e.derniere_err) { m.className = "err"; m.textContent = "Dernière erreur : " + e.derniere_err; return; }
  m.className = "";
  // la ligne s'intitule déjà « Synchronisation » : le mot n'a pas à revenir
  m.textContent = e.derniere_sync
    ? "Dernière : " +
      new Date(e.derniere_sync).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
    : "Jamais synchronisé.";
}
