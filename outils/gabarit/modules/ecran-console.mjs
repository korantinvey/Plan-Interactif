/* ============================================================
   L'écran de la console — la barre du haut, le choix du salon, le démarrage

   Ce que la console montre autour de la fiche : la liste des salons dans la
   barre du haut, l'état du salon ouvert et ce qu'elle en commande, ses liens
   vers le plan, la création, le rechargement, et le dessin de tout l'écran
   (`dessine`) après le chargement (`charge`). C'était la fin du script de la
   console (`_console-js.html`), qui appelait tout le reste sans le dire.

   Tout ce qu'il appelle est désormais un module, qu'il importe : les salons
   (`evenements.mjs`), le socle et sa fenêtre (`socle-console.mjs`,
   `fenetre-console.mjs`), la fiche, la synchronisation, la duplication, les
   comptes, l'export. Trois d'entre eux le rappellent en retour — la fiche
   redessine l'écran après une écriture, la synchronisation et la duplication
   rechargent la console : il le leur confie en se branchant
   (`brancheConsole`), puisqu'ils ne pourraient l'importer sans boucler.

   Le point d'entrée (`console.mjs`) le branche après le socle et l'export,
   au rang que tenait ce code, puis démarre la page ; le socle appelle
   `demarre` après la connexion et `videEcran` à la déconnexion.
   ============================================================ */
import { $ } from "./dom.mjs";
import { esc } from "./texte.mjs";
import { rest, signale, BASE_PAGES, ecranConfig } from "./socle-console.mjs";
import { demande, confirme } from "./fenetre-console.mjs";
import { EVTS, selection, PLANS, poseEvenements, courant, chargePlans, majEvenement, slugifie }
  from "./evenements.mjs";
import { MOI, poseComptes, litMonProfil, ouvreComptes } from "./comptes.mjs";
import { brancheFiche, dessineFiche, ouvreSources } from "./fiche-evenement.mjs";
import { brancheSynchronisation } from "./synchronisation.mjs";
import { brancheDuplication, dupliquer } from "./duplication.mjs";
import { exporteExposants } from "./export.mjs";

/* ------------------------------------------------------------------
   Données
   ------------------------------------------------------------------ */
async function charge() {
  // le rôle avant les salons : c'est lui qui dit ce que la console propose,
  // et la liste des salons n'est déjà plus la même d'un profil à l'autre
  await litMonProfil();
  /* La base ne renvoie que les salons du compte : un organisateur n'en reçoit
     que les siens, un administrateur les reçoit tous. Le tri par date de
     modification met en tête celui qu'on vient de toucher. */
  poseEvenements({ EVTS: await rest("evenement?select=*&order=modifie_le.desc") });
  if (!EVTS.some((e) => e.id === selection)) {
    poseEvenements({ selection: (selonAdresse() || EVTS[0])?.id ?? null });
  }
  if (selection) await chargePlans(selection);
  dessine();
}

/* ------------------------------------------------------------------
   Choix du salon

   La console n'affiche qu'un salon à la fois : la liste de tous les autres
   tenait une colonne entière de l'écran pour un choix qu'on fait une fois en
   arrivant. Elle se replie donc dans la barre du haut, comme sur la page de
   rapport, et la fiche prend toute la largeur.

   Ce que la liste porte ne se décide pas ici : la base ne renvoie que les
   salons auxquels le compte a droit.
   ------------------------------------------------------------------ */
/** Le salon nommé dans l'adresse, s'il fait partie de ceux qu'on peut ouvrir. */
function selonAdresse() {
  const slug = new URLSearchParams(location.search).get("plan");
  return slug ? EVTS.find((e) => e.slug === slug) || null : null;
}

/* Le salon ouvert tient dans l'adresse : on revient sur la console par un
   signet ou par le bouton « Console » du rapport, et on retrouve le sien
   plutôt que le premier de la liste. */
function majAdresse() {
  const e = courant();
  const url = new URL(location.href);
  if (e?.slug) url.searchParams.set("plan", e.slug);
  else url.searchParams.delete("plan");
  history.replaceState(null, "", url);
}

/**
 * Ce que la barre du haut dit du salon ouvert, et ce qu'elle en commande.
 *
 * Ces boutons vivaient en tête de fiche, sur une seconde rangée. Ils décrivent
 * pourtant le même salon que la liste déroulante voisine : les réunir fait un
 * seul endroit où commander, et une ligne au lieu de deux.
 */
function majBarre() {
  const e = courant();
  const badge = $("etatEvt");
  badge.hidden = !e;
  if (e) {
    badge.className = "etat " + e.etat;
    badge.textContent = e.etat === "publie" ? "Publié" : "Brouillon";
  }
  // sans salon ouvert, les commandes qui le visent n'ont pas d'objet ; celles
  // de la console — les comptes, le projet — restent, elles, atteignables
  document.querySelectorAll('.menu-pan [data-portee="salon"]').forEach((b) => {
    b.hidden = !e;
  });
  $("sepActions").hidden = !e;
  $("lienPublic").hidden = !e;
  $("lienAdmin").hidden = !e;
  if (!e) return;

  majLiens(e);
  $("btnEtat").textContent = e.etat === "publie" ? "Repasser en brouillon" : "Publier l'événement";
  $("btnEtat").onclick = async () => {
    e.etat = e.etat === "publie" ? "brouillon" : "publie";
    try { await majEvenement(e.id, { etat: e.etat }); dessine(); }
    catch (err) { signale(err.message, true); }
  };
  $("btnSources").onclick = () => ouvreSources(() => dessine());
  // dupliquer, c'est créer un salon : réservé à l'administrateur, comme
  // « Nouveau ». La base le refuserait de toute façon, mais un bouton qui
  // n'aboutit jamais est un bouton de trop.
  $("btnDupliquer").hidden = MOI?.role !== "admin";
  $("btnDupliquer").onclick = () => dupliquer(e);
  $("btnSupprimer").onclick = () => confirme("Supprimer l'événement ?",
    "« " + e.nom + " », ses pavillons, son apparence et ses dessins seront " +
    "définitivement perdus.", "Supprimer", async () => {
      try {
        await rest("evenement?id=eq." + e.id, { method: "DELETE" });
        poseEvenements({ selection: null });
        await charge();
      } catch (err) { signale(err.message, true); }
    });
}

function dessineChoix() {
  const sel = $("choixEvt");
  // rien à choisir : la liste vide n'aurait rien à dire que la fiche ne dise
  sel.hidden = !EVTS.length;
  if (!EVTS.length) { sel.innerHTML = ""; return; }
  /* Un brouillon se signale dans la liste : c'est le seul état dont on doive
     se souvenir avant même d'ouvrir la fiche — son plan public ne répond pas. */
  sel.innerHTML = EVTS.map((e) =>
    '<option value="' + e.id + '"' + (e.id === selection ? " selected" : "") + '>' +
    esc(e.nom) + (e.etat === "publie" ? "" : " · brouillon") + '</option>').join("");
  sel.onchange = async () => {
    poseEvenements({ selection: sel.value });
    if (!PLANS[selection]) await chargePlans(selection);
    dessine();
  };
}

function majLiens(e) {
  const q = "?plan=" + encodeURIComponent(e.slug || "");
  // un brouillon n'est pas servi aux visiteurs : le dire plutôt que
  // laisser cliquer vers une page qui répondra « introuvable »
  const brouillon = e.etat !== "publie";
  const enBrouillon = "L'événement est en brouillon : le plan public n'est pas encore servi.";
  const pub = $("lienPublic"), adm = $("lienAdmin");
  if (pub) {
    pub.href = BASE_PAGES + "plan" + q;
    pub.classList.toggle("inactif", brouillon);
    pub.title = brouillon ? enBrouillon : "Ouvrir le plan tel que le voient les visiteurs";
  }
  /* La borne n'est que le plan public avec un paramètre de plus. Le lien est
     là pour qu'on n'ait pas à l'écrire de mémoire : on l'ouvre sur la tablette
     posée dans le salon, ou l'on copie son adresse pour l'y porter. */
  const bor = $("lienBorne");
  if (bor) {
    bor.href = BASE_PAGES + "plan" + q + "&borne";
    bor.classList.toggle("inactif", brouillon);
    bor.title = brouillon ? enBrouillon
      : "Le plan sur un écran posé dans le salon : il demande où il est, " +
        "puis les itinéraires en partent";
  }
  if (adm) {
    adm.href = BASE_PAGES + "plan-admin" + q;
    adm.title = "Ouvrir le plan avec les calques et les outils de dessin" +
      (e.etat !== "publie" ? " — accessible même en brouillon" : "");
  }
  // le rapport reste dans l'onglet : c'est une autre page de la console, pas
  // une sortie vers le plan
  const rap = $("lienRapport");
  if (rap) {
    rap.href = BASE_PAGES + "rapport" + q;
    rap.title = "Visites, recherches et fiches ouvertes";
  }
}

/* ------------------------------------------------------------------
   Rendu et démarrage
   ------------------------------------------------------------------ */
/** Fin de session : la console n'a plus d'événements à montrer. */
export function videEcran() {
  poseEvenements({ EVTS: [], selection: null }); poseComptes({ MOI: null });
  dessine();
}

function dessine() {
  /* Les valeurs des listes du salon affiché — critères, correspondances — se
     lisent en anglais dans la console anglaise, comme sur le plan. */
  LANGUE.donnees("sources", (courant() || {}).libelles_en || {});
  // les comptes et la création d'un salon sont le fait de l'administrateur ;
  // un organisateur reçoit ses salons, il ne s'en donne pas
  const patron = MOI?.role === "admin";
  $("btnComptes").hidden = !patron;
  $("btnNouveau").hidden = !patron;
  dessineChoix();
  majBarre();
  dessineFiche();
  majAdresse();
}

export async function demarre() {
  try {
    await charge();
  } catch (e) {
    $("fiche").innerHTML = '<div class="vide"></div>';
    $("fiche").querySelector(".vide").textContent = "Chargement impossible : " + e.message;
  }
}

/* ------------------------------------------------------------------
   Le branchement
   ------------------------------------------------------------------ */
/**
 * Appelé par le point d'entrée (`console.mjs`) à la place que ce code
 * tenait : les modules qui rappellent l'écran reçoivent ce
 * qu'ils ne peuvent importer, et les commandes de la barre du haut se
 * posent, au même rang qu'avant parmi le reste de la page.
 */
export function brancheConsole() {
  /* La fiche du salon ouvert redessine, après une écriture, tout l'écran, la
     liste des salons, l'adresse. */
  brancheFiche({ dessine, dessineChoix, majAdresse });

  /* La synchronisation et la duplication rechargent la console une fois leur
     travail fait. */
  brancheSynchronisation({ charge });
  brancheDuplication({ charge });

  /* ----------------------------------------------------------------
     Barre du haut
     ---------------------------------------------------------------- */
  $("btnNouveau").onclick = () =>
    demande("Nouvel événement", "Nom de l'événement", "", async (nom) => {
      signale("Création…");
      try {
        const rep = await rest("evenement", {
          method: "POST",
          headers: { "Prefer": "return=representation" },
          body: JSON.stringify({
            nom, slug: slugifie(nom) || "evenement", instance: "", etat: "brouillon",
          }),
        });
        const cree = Array.isArray(rep) ? rep[0] : rep;
        if (cree?.id) poseEvenements({ selection: cree.id });
        await charge();
        signale("Événement créé.");
      } catch (err) { signale(err.message, true); }
    });

  /* Rechargement à la demande : la console ne surveille pas la base, et une
     synchronisation lancée ailleurs ne se voit pas toute seule. */
  $("btnRecharger").onclick = async () => {
    const b = $("btnRecharger");
    if (b.disabled) return;
    b.disabled = true;
    b.classList.add("occupe");
    try {
      poseEvenements({ PLANS: {} });
      await charge();
      signale("Données rechargées.");
    } catch (e) {
      signale(e.message, true);
    } finally {
      b.disabled = false;
      b.classList.remove("occupe");
    }
  };

  /* Un relevé de ce que la console a en main — les salons et leurs pavillons —
     copié dans le presse-papiers. Rien ne s'enregistre : cela sert à joindre un
     état à un signalement, pas à sauvegarder quoi que ce soit. */
  $("btnExport").onclick = (ev) => {
    const b = ev.currentTarget;
    const txt = JSON.stringify({ evenements: EVTS, plans: PLANS }, null, 2);
    navigator.clipboard?.writeText(txt).then(
      () => { b.textContent = "Copié"; setTimeout(() => b.textContent = "Copier les données (JSON)", 1700); },
      () => { b.textContent = "Échec de la copie"; });
  };
  /* La console n'a pas de sélecteur de période : elle exporte tout l'historique.
     Celui qui veut découper regarde le rapport, qui offre le même bouton sous la
     période affichée. */
  $("btnExcel").onclick = (ev) => exporteExposants(ev.currentTarget, null);
  $("btnProjet").onclick = () => ecranConfig();

  /* Comptes et accès : l'annuaire et la fiche d'une personne vivent dans
     `modules/comptes.mjs`. */
  $("btnComptes").onclick = () => ouvreComptes();
}
