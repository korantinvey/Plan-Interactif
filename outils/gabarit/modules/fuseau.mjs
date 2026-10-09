/* ============================================================
   Fuseau horaire du salon — le champ de la console

   Il date les jours du rapport et de la mesure, et dit à la page l'heure qu'il
   est au salon. Trois provenances, dans cet ordre : celui qu'on règle ici,
   celui qu'Eventmaker donne à la synchronisation, et Paris. C'est la base qui
   tranche — un déclencheur calcule `fuseau` depuis les deux autres — et le
   champ relit ce qu'elle a retenu plutôt que de le deviner.

   Ce que le module ne peut pas importer lui est confié par la console
   (`brancheFuseau`, `_console-js.html`) : le salon ouvert, lu au moment où la
   fiche se dessine, l'appel à la base et la barre d'état.
   ============================================================ */
import { esc } from "./texte.mjs";

/** @type {{
 *   courant: () => any,
 *   rest: (chemin: string, options?: RequestInit) => Promise<any>,
 *   signale: (txt: string, erreur?: boolean) => void,
 * }} */
let _console = {
  courant: () => null,
  rest: async () => null,
  signale: () => {},
};

/** Ce que la console confie au champ : voir `_console`. */
export function brancheFuseau(branche) {
  _console = branche;
}

const FUSEAU_DEFAUT = "Europe/Paris";

/**
 * Le nom saisi, écrit comme la liste l'écrit — « Europe/Paris » pour
 * « europe/paris » —, ou nul s'il ne se lit pas.
 *
 * Pas `resolvedOptions()` : il ramène un fuseau à celui dont il est l'alias,
 * et « America/Montreal » revenait sous les yeux en « America/Toronto ». Le
 * même fuseau, mais pas celui qu'on a choisi.
 */
function fuseauConnu(nom, connus) {
  const bas = nom.toLowerCase();
  const tel = connus.find((z) => z.toLowerCase() === bas);
  if (tel) return tel;
  try {
    new Intl.DateTimeFormat("fr-FR", { timeZone: nom });
    return nom;
  } catch (e) {
    return null;
  }
}

export function champFuseau() {
  const e = _console.courant();
  const l = document.createElement("label");
  l.innerHTML = '<span>Fuseau horaire</span>' +
    '<input list="fuseaux" spellcheck="false" autocomplete="off">' +
    '<datalist id="fuseaux"></datalist><span class="aide"></span>';
  const i = l.querySelector("input");
  const aide = l.querySelector(".aide");
  // la liste vient du navigateur : c'est lui qui devra lire le fuseau retenu
  const connus = typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone") : [];
  l.querySelector("datalist").innerHTML =
    connus.map((z) => '<option value="' + esc(z) + '">').join("");

  // ce que donnerait le champ vide : c'est ce que l'invite montre
  const sansChoix = () => e.fuseau_source || FUSEAU_DEFAUT;
  const peint = (mot) => {
    i.value = e.fuseau_choisi || "";
    i.placeholder = sansChoix();
    aide.classList.toggle("alerte", Boolean(mot));
    aide.textContent = mot || (e.fuseau_choisi
      ? "Choisi ici, il l'emporte sur la synchronisation. Videz le champ pour " +
        "revenir à " + sansChoix() + (e.fuseau_source ? ", donné par Eventmaker." : ", le défaut.")
      : e.fuseau_source
      ? "Donné par Eventmaker à la synchronisation. Choisissez-en un autre pour l'écarter."
      : "Par défaut : aucune source n'en donne. Réglez-le si le salon se tient ailleurs.") +
      (mot ? "" : " Il date les jours du rapport et l'heure du plan.");
  };

  i.onchange = async () => {
    const saisi = i.value.trim();
    const nom = saisi ? fuseauConnu(saisi, connus) : null;
    if (saisi && !nom) {
      // la saisie reste sous les yeux : on corrige une faute, on ne la retape pas
      aide.classList.add("alerte");
      aide.textContent = "« " + saisi + " » n'est pas un fuseau connu : choisissez-le dans la liste.";
      return;
    }
    try {
      const [r] = await _console.rest("evenement?id=eq." + e.id +
        "&select=fuseau,fuseau_source,fuseau_choisi", {
        method: "PATCH",
        headers: { "Prefer": "return=representation" },
        body: JSON.stringify({ fuseau_choisi: nom, modifie_le: new Date().toISOString() }),
      });
      if (!r) throw new Error("modification refusée");
      Object.assign(e, r);
      /* La base traduit à son tour, et rend nul ce qu'elle ne sait pas lire —
         un nom trop récent pour son répertoire de fuseaux. Le taire laisserait
         croire que le choix a pris. */
      peint(nom && !r.fuseau_choisi
        ? "La base ne connaît pas « " + nom + " » : c'est " + r.fuseau + " qui reste retenu."
        : undefined);
    } catch (err) {
      peint();
      _console.signale(err.message, true);
    }
  };

  peint();
  return l;
}
