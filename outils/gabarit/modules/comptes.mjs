/* ============================================================
   Comptes et accès — l'annuaire, et la fiche d'une personne

   Deux écrans plutôt qu'un. Le premier est un annuaire : une ligne par
   personne, ce qu'il faut pour la reconnaître, et rien de plus — on y cherche
   quelqu'un, on n'y règle rien. Le second est sa fiche, où tout se modifie.

   Les réglages tenaient d'abord dans la liste elle-même. À quatre comptes la
   fenêtre faisait trois écrans de haut, et l'on y perdait de vue celui qu'on
   était venu chercher.

   Créer un compte, envoyer son invitation ou le supprimer demande la clé de
   service : tout passe donc par la fonction `comptes`, jamais par la table.

   Le module tient aussi le profil du compte connecté (`MOI`) : la console le
   lit pour savoir ce qu'elle propose, et l'oublie en fin de session par
   `poseComptes({ MOI: null })`. Ce qu'il ne peut pas importer lui est confié
   par la console (`brancheComptes`, `_console-js.html`) : la fenêtre du socle
   et sa grille, l'appel à la base, l'identifiant du compte connecté et la page
   du mot de passe. Les salons à affecter viennent de `evenements.mjs`, relus
   à chaque ouverture puisque le chargement les remplace.
   ============================================================ */
import { $ } from "./dom.mjs";
import { fonction } from "./appel-fonction.mjs";
import { EVTS } from "./evenements.mjs";

/** @type {{
 *   ouvreModale: (titre: string, remplit: (corps: HTMLElement) => void,
 *     boutons: Array<{ libelle: string, genre?: string, action?: () => any }>,
 *     apres?: () => void) => void,
 *   grille: () => HTMLElement,
 *   rest: (chemin: string, options?: RequestInit) => Promise<any>,
 *   idCompte: () => (string | null),
 *   pageMdp: string,
 * }} */
let _console = {
  ouvreModale: () => {},
  grille: () => document.createElement("div"),
  rest: async () => null,
  idCompte: () => null,
  pageMdp: "",
};

/** Ce que la console confie aux comptes : voir `_console`. */
export function brancheComptes(branche) {
  _console = branche;
}

/**
 * La porte du profil connecté : le code soudé le lit par son nom, et le
 * remplace par ici — `poseComptes({ MOI: null })` en fin de session.
 *
 * @param {{ MOI?: any }} valeurs
 */
export function poseComptes(valeurs) {
  for (const [nom, v] of Object.entries(valeurs)) {
    switch (nom) {
      case "MOI": MOI = v; break;
      default: throw new Error("poseComptes : « " + nom + " » n'est pas un état du profil connecté");
    }
  }
}

export let MOI = null;
let COMPTES = [];

/** Le rôle du compte connecté. Il décide de ce que la console propose ; ce
 *  qu'elle obtient, c'est la base qui le décide. */
export async function litMonProfil() {
  const id = _console.idCompte();
  MOI = null;
  if (!id) return;
  const r = await _console.rest("profil?select=id,nom,prenom,email,role&id=eq." + encodeURIComponent(id));
  MOI = (Array.isArray(r) ? r[0] : null) || null;
}

const NOM_ROLE = { admin: "Administrateur", organisateur: "Organisateur" };

/** L'adresse où retomber après avoir cliqué le lien reçu par courriel. */
const RETOUR_MDP = () => _console.pageMdp;

async function litComptes() {
  const r = await fonction("comptes", { action: "liste" });
  COMPTES = r.profils || [];
  return COMPTES;
}

/* Un message qui vit dans la fenêtre plutôt que dans la barre du haut, restée
   derrière le voile. Rendu avec le reste, il survit au redessin — sans quoi un
   enregistrement réussi effacerait sa propre confirmation. */
function ligneMessage(corps, id, mot) {
  const p = document.createElement("p");
  p.id = id;
  p.className = "aide" + (mot.erreur ? " alerte" : "");
  p.textContent = mot.texte;
  corps.appendChild(p);
}

/* Les salons cochés. Un administrateur les a tous par définition : lui en
   cocher serait laisser croire qu'on peut lui en retirer. */
function casesSalons(role, choisis) {
  const zone = document.createElement("div");
  zone.className = "valeurs";
  const note = (texte) => {
    const p = document.createElement("p");
    p.className = "aide";
    p.textContent = texte;
    zone.appendChild(p);
  };
  if (role === "admin") { note("Tous les salons, y compris ceux créés plus tard."); return zone; }
  if (!EVTS.length) { note("Aucun salon à affecter pour l'instant."); return zone; }
  EVTS.forEach((e) => {
    const l = document.createElement("label");
    l.className = "puce";
    l.innerHTML = "<input type='checkbox'><span></span>";
    l.querySelector("span").textContent = e.nom;
    const c = l.querySelector("input");
    c.value = e.id;
    c.checked = choisis.includes(e.id);
    zone.appendChild(l);
  });
  return zone;
}

const cochés = (zone) =>
  Array.from(zone.querySelectorAll("input:checked")).map((c) => c.value);

/* ------------------------------------------------------------------
   L'annuaire
   ------------------------------------------------------------------ */
export function ouvreComptes(message) {
  let hote = null;
  let mot = { texte: message || "Chargement…", erreur: !!(message && message.erreur) };

  function ligne(c) {
    const tr = document.createElement("tr");
    // une invitation jamais ouverte se signale en bord de ligne : c'est ce qui
    // distingue un compte créé d'un compte qui sert
    tr.dataset.actif = c.actif ? "oui" : "non";

    const tdNom = document.createElement("td");
    tdNom.className = "n";
    tdNom.textContent = c.nom || "—";
    const tdPrenom = document.createElement("td");
    tdPrenom.textContent = c.prenom || "—";
    const tdMail = document.createElement("td");
    tdMail.className = "mail";
    tdMail.textContent = c.email;

    const tdRole = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "prov";
    badge.textContent = NOM_ROLE[c.role] || c.role;
    tdRole.appendChild(badge);
    if (!c.actif) {
      const att = document.createElement("span");
      att.className = "prov";
      att.dataset.src = "aucun";
      att.textContent = "En attente";
      tdRole.appendChild(att);
    }
    if (c.id === MOI?.id) {
      const vous = document.createElement("span");
      vous.className = "prov";
      vous.dataset.src = "aucun";
      vous.textContent = "Vous";
      tdRole.appendChild(vous);
    }

    const tdAct = document.createElement("td");
    tdAct.className = "act";
    const bt = document.createElement("button");
    bt.className = "btn petit";
    bt.textContent = "Modifier";
    bt.onclick = () => ouvreFicheCompte(c);
    tdAct.appendChild(bt);

    tr.append(tdNom, tdPrenom, tdMail, tdRole, tdAct);
    return tr;
  }

  function rendu(corps) {
    corps.innerHTML = "";
    if (COMPTES.length) {
      // le tableau garde ses colonnes sur écran étroit plutôt que de les
      // écraser : il défile, la fenêtre non
      const cadre = document.createElement("div");
      cadre.className = "table-defile";
      const t = document.createElement("table");
      t.className = "comptes";
      t.innerHTML = "<thead><tr><th>Nom</th><th>Prénom</th><th>E-mail</th>" +
        "<th>Profil</th><th></th></tr></thead><tbody></tbody>";
      const tb = t.querySelector("tbody");
      COMPTES.forEach((c) => tb.appendChild(ligne(c)));
      cadre.appendChild(t);
      corps.appendChild(cadre);
    }
    ligneMessage(corps, "comptesMsg", mot);
  }

  _console.ouvreModale("Comptes et accès", (corps) => {
    hote = corps;
    rendu(corps);
    litComptes()
      .then(() => {
        mot = { texte: COMPTES.length ? "" : "Aucun compte.", erreur: false };
        if (hote) rendu(hote);
      })
      .catch((e) => {
        mot = { texte: e.message, erreur: true };
        if (hote) rendu(hote);
      });
  }, [{ libelle: "Fermer" },
      { libelle: "Inviter quelqu'un", genre: "primaire",
        // la fenêtre est remplacée par la fiche, elle ne doit pas se refermer
        action: () => { ouvreFicheCompte(null); return false; } }],
     () => { hote = null; });
}

/* ------------------------------------------------------------------
   La fiche d'une personne — la même pour l'inviter et pour la modifier
   ------------------------------------------------------------------ */
function ouvreFicheCompte(c) {
  const neuf = !c;
  const moi = !neuf && c.id === MOI?.id;
  let mot = { texte: "", erreur: false };
  let cMail, cNom, cPrenom, selRole, zone;
  let surSuppression = false;

  const dis = (texte, erreur) => {
    mot = { texte, erreur: !!erreur };
    const p = $("ficheMsg");
    if (p) { p.textContent = texte; p.className = "aide" + (erreur ? " alerte" : ""); }
  };

  /** Retour à l'annuaire, qui recharge : ce qu'on vient d'écrire doit s'y voir. */
  const retour = (message) => ouvreComptes(message);

  const champs = () => ({
    nom: cNom.value,
    prenom: cPrenom.value,
    role: selRole.value,
    evenements: selRole.value === "admin" ? [] : cochés(zone),
  });

  async function enregistre() {
    dis("Enregistrement…");
    try {
      await fonction("comptes", { action: "maj", id: c.id, ...champs() });
      retour("Compte enregistré.");
    } catch (e) { dis(e.message, true); }
  }

  async function invite() {
    const email = cMail.value.trim();
    if (email.indexOf("@") < 1) return dis("Adresse incomplète.", true);
    dis("Envoi de l'invitation…");
    try {
      await fonction("comptes",
        { action: "invite", email, ...champs(), retour: RETOUR_MDP() });
      retour("Invitation envoyée à " + email + ".");
    } catch (e) { dis(e.message, true); }
  }

  async function envoieLien() {
    dis("Envoi…");
    try {
      await fonction("comptes", { action: "relance", id: c.id, retour: RETOUR_MDP() });
      dis("Lien envoyé à " + c.email + ".");
    } catch (e) { dis(e.message, true); }
  }

  async function supprime() {
    /* La fenêtre est déjà celle qui est ouverte : une demande de confirmation
       la remplacerait. On confirme donc sur place, au second clic. */
    if (!surSuppression) {
      surSuppression = true;
      dis("Cliquez à nouveau sur « Supprimer » pour confirmer.", true);
      setTimeout(() => { if (surSuppression) { surSuppression = false; dis(""); } }, 5000);
      return;
    }
    surSuppression = false;
    dis("Suppression…");
    try {
      await fonction("comptes", { action: "supprime", id: c.id });
      retour("Compte supprimé.");
    } catch (e) { dis(e.message, true); }
  }

  const boutons = [{ libelle: "Retour", action: () => { retour(); return false; } }];
  if (neuf) {
    boutons.push({ libelle: "Envoyer l'invitation", genre: "primaire",
                   action: () => { invite(); return false; } });
  } else {
    if (!moi) {
      boutons.push({ libelle: "Supprimer", genre: "danger",
                     action: () => { supprime(); return false; } });
    }
    boutons.push({ libelle: "Envoyer un lien de mot de passe",
                   action: () => { envoieLien(); return false; } });
    boutons.push({ libelle: "Enregistrer", genre: "primaire",
                   action: () => { enregistre(); return false; } });
  }

  _console.ouvreModale(neuf ? "Inviter quelqu'un" : "Modifier le compte", (corps) => {
    const cadre = document.createElement("div");
    cadre.className = "cadre compte";

    if (neuf) {
      const aide = document.createElement("p");
      aide.className = "aide";
      aide.textContent = "Le compte est créé sans mot de passe : l'invité en " +
        "reçoit un lien par courriel, et le choisit lui-même.";
      cadre.appendChild(aide);
    }

    const g = _console.grille();
    const lMail = document.createElement("label");
    lMail.innerHTML = "<span>Adresse e-mail</span><input type='email'>";
    cMail = lMail.querySelector("input");
    if (!neuf) {
      cMail.value = c.email;
      /* L'adresse est l'identité du compte auprès du service d'authentification :
         la changer ici la désaccorderait de celle qui ouvre la session. */
      cMail.readOnly = true;
      const note = document.createElement("span");
      note.className = "aide";
      note.textContent = "L'adresse ne se change pas : c'est elle qui ouvre la session.";
      lMail.appendChild(note);
    }
    const lNom = document.createElement("label");
    lNom.innerHTML = "<span>Nom</span><input autocomplete='family-name'>";
    cNom = lNom.querySelector("input");
    if (!neuf) cNom.value = c.nom || "";
    const lPrenom = document.createElement("label");
    lPrenom.innerHTML = "<span>Prénom</span><input autocomplete='given-name'>";
    cPrenom = lPrenom.querySelector("input");
    if (!neuf) cPrenom.value = c.prenom || "";
    const lRole = document.createElement("label");
    lRole.innerHTML = "<span>Profil</span><select>" +
      "<option value='organisateur'>Organisateur</option>" +
      "<option value='admin'>Administrateur</option></select>";
    selRole = lRole.querySelector("select");
    selRole.value = neuf ? "organisateur" : c.role;
    // se retirer soi-même l'administration fermerait la porte de l'intérieur
    selRole.disabled = moi;
    if (moi) {
      const note = document.createElement("span");
      note.className = "aide";
      note.textContent = "Vous ne pouvez pas retirer votre propre rôle.";
      lRole.appendChild(note);
    }
    g.append(lMail, lNom, lPrenom, lRole);
    cadre.appendChild(g);

    const titre = document.createElement("span");
    titre.className = "eyebrow sous-titre";
    titre.textContent = "Salons";
    cadre.appendChild(titre);
    zone = casesSalons(selRole.value, neuf ? [] : (c.evenements || []));
    cadre.appendChild(zone);
    // changer de profil change ce qu'il y a à cocher : la liste suit sans
    // qu'on ait à refermer la fenêtre
    selRole.onchange = () => {
      const neuve = casesSalons(selRole.value, cochés(zone));
      zone.replaceWith(neuve);
      zone = neuve;
    };

    corps.appendChild(cadre);
    ligneMessage(corps, "ficheMsg", mot);
    setTimeout(() => (neuf ? cMail : cNom).focus(), 40);
  }, boutons);
}
