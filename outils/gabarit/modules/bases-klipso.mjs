/* ============================================================
   Bases Klipso — le menu des bases connues, et la saisie d'une base neuve

   Une base Klipso, c'est une instance — le sous-domaine
   `<instance>.svc.calypso-event.net` — et la clé qui l'ouvre. Chaque client
   Klipso a la sienne : un salon se rattache donc à une base choisie dans un
   menu, et une base neuve se déclare avec sa clé, sans toucher aux secrets du
   projet (`supabase/migrations/…_une_cle_par_base_klipso.sql`).

   La clé entre et ne ressort pas : la console ne lit que la liste
   (`base_klipso`, sans clé) et la date de la dernière saisie. Elle écrit par
   `enregistre_base_klipso`, qui ajoute une base ou remplace sa clé — le même
   geste, puisqu'une clé changée chez Klipso se ressaisit sous la même instance.

   Deux fenêtres s'en servent, de deux façons. « Nouvel événement » lit le
   choix au moment de créer le salon (`lit`, puis `enregistre`) ; « Sources de
   données » enregistre tout de suite, et rend l'instance retenue à qui l'a
   demandée (`surChoix`). Seul l'administrateur lit la liste : la base le
   refuse aux organisateurs, qui gardent le champ libre.
   ============================================================ */
import { rest } from "./socle-console.mjs";

/* Une valeur que le format d'une instance exclut : elle ne peut pas désigner
   une base, même au nom choisi pour la faire mentir. */
const NOUVELLE = "+";
const FORME = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

/** @typedef {{ instance: string, cle_modifiee_le: string | null }} Base */

/** Les bases connues, sans leur clé — rien d'autre ne sort de la base.
 *  @returns {Promise<Base[]>} */
export const chargeBases = () =>
  rest("base_klipso?select=instance,cle_modifiee_le&order=instance");

/** Ajoute une base, ou remplace sa clé. Rend la ligne publique, sans la clé.
 *  @param {string} instance @param {string} cle @returns {Promise<Base>} */
export const enregistreBase = (instance, cle) =>
  rest("rpc/enregistre_base_klipso", {
    method: "POST",
    body: JSON.stringify({ p_instance: instance, p_cle: cle }),
  });

/** @param {string} quand */
const date = (quand) =>
  new Date(quand).toLocaleDateString("fr-FR", { dateStyle: "short" });

/**
 * Le choix de la base d'un salon : le menu, puis — pour une base neuve ou une
 * clé à remplacer — l'instance et la clé.
 *
 * @param {{
 *   bases: Base[],
 *   valeur?: string,
 *   surChoix?: (instance: string) => any,
 * }} reglage  `surChoix` présent, chaque choix s'enregistre aussitôt — c'est
 *   la fenêtre des sources ; absent, la fenêtre appelante lit le choix (`lit`)
 *   et l'enregistre (`enregistre`) quand elle crée le salon.
 */
export function choixBase({ bases, valeur = "", surChoix }) {
  const liste = [...bases];
  const tout = document.createElement("div");
  tout.className = "choix-base";
  tout.innerHTML =
    '<div class="grille"><label><span>Base Klipso</span><select></select>' +
    '<span class="aide"></span></label></div>' +
    '<div class="grille base-neuve" hidden>' +
    '<label class="instance"><span>Instance</span>' +
    '<input spellcheck="false" autocomplete="off" placeholder="moninstance">' +
    '<span class="aide">Le sous-domaine Klipso, devant .svc.calypso-event.net.</span></label>' +
    '<label><span>Clé de l\'API Klipso</span>' +
    '<input type="password" autocomplete="new-password" spellcheck="false">' +
    '<span class="aide">Gardée côté serveur : elle ne se relit plus, elle se remplace.</span></label>' +
    "</div>" +
    '<div class="pied-base"><button type="button" class="btn change-cle">Changer la clé…</button>' +
    '<button type="button" class="btn primaire enregistre-base" hidden>Enregistrer</button>' +
    '<span class="aide alerte" hidden></span></div>';
  const menu = /** @type {HTMLSelectElement} */ (tout.querySelector("select"));
  const aide = /** @type {HTMLElement} */ (tout.querySelector("label .aide"));
  const neuve = /** @type {HTMLElement} */ (tout.querySelector(".base-neuve"));
  const champInstance = /** @type {HTMLElement} */ (tout.querySelector(".instance"));
  const [instance, cle] = /** @type {HTMLInputElement[]} */ ([...neuve.querySelectorAll("input")]);
  const changeCle = /** @type {HTMLButtonElement} */ (tout.querySelector(".change-cle"));
  const bouton = /** @type {HTMLButtonElement} */ (tout.querySelector(".enregistre-base"));
  const alerte = /** @type {HTMLElement} */ (tout.querySelector(".alerte"));

  /* Remplacer la clé d'une base connue ne demande que la clé : l'instance est
     celle du menu. */
  let remplaceCle = false;

  const dit = (/** @type {string} */ txt) => { alerte.textContent = txt; alerte.hidden = !txt; };

  function remplitMenu(/** @type {string} */ choisie) {
    /* Une instance saisie avant que la console ne connaisse les bases — ou
       par un organisateur — reste proposée telle quelle : la taire changerait
       le salon sans que personne l'ait voulu. */
    if (choisie && choisie !== NOUVELLE && !liste.some((b) => b.instance === choisie)) {
      liste.push({ instance: choisie, cle_modifiee_le: null });
    }
    menu.innerHTML = "";
    for (const b of liste) menu.add(new Option(b.instance, b.instance));
    menu.add(new Option("Nouvelle base Klipso…", NOUVELLE));
    // sans base connue, il n'y a rien d'autre à choisir
    menu.value = choisie || (liste[0] ? liste[0].instance : NOUVELLE);
  }

  function montre() {
    const base = liste.find((b) => b.instance === menu.value);
    const nouvelle = menu.value === NOUVELLE;
    if (nouvelle) remplaceCle = false;
    aide.textContent = nouvelle ? "Une base que la console ne connaît pas encore."
      : base?.cle_modifiee_le ? "Sa propre clé, saisie le " + date(base.cle_modifiee_le) + "."
      : "La clé commune du projet (KLIPSO_API_KEY).";
    neuve.hidden = !nouvelle && !remplaceCle;
    champInstance.hidden = !nouvelle;
    changeCle.hidden = nouvelle || remplaceCle;
    changeCle.textContent = base?.cle_modifiee_le ? "Changer la clé…" : "Saisir sa clé…";
    bouton.hidden = !surChoix || neuve.hidden;
    bouton.textContent = nouvelle ? "Enregistrer la base" : "Enregistrer la clé";
    dit("");
  }

  /**
   * Ce qui est choisi, ou null si la saisie est incomplète — l'alerte le dit
   * alors sous le champ. `cle` est vide quand rien ne s'enregistre.
   * @returns {{ instance: string, cle: string } | null}
   */
  function lit() {
    const nouvelle = menu.value === NOUVELLE;
    const i = nouvelle ? instance.value.trim() : menu.value;
    const c = neuve.hidden ? "" : cle.value.trim();
    if (nouvelle && !FORME.test(i)) {
      dit(i ? "L'instance ne garde que le sous-domaine : lettres, chiffres et tirets."
        : "Saisissez l'instance de la base.");
      instance.focus();
      return null;
    }
    if (!neuve.hidden && !c) {
      dit("Saisissez la clé de la base.");
      cle.focus();
      return null;
    }
    dit("");
    return { instance: i, cle: c };
  }

  /** Enregistre la base ou sa clé quand il y en a une à enregistrer, et rend
   *  l'instance retenue. @param {{ instance: string, cle: string }} choix */
  async function enregistre(choix) {
    if (!choix.cle) return choix.instance;
    const ligne = await enregistreBase(choix.instance, choix.cle);
    const k = liste.findIndex((b) => b.instance === ligne.instance);
    if (k < 0) liste.push(ligne); else liste[k] = ligne;
    liste.sort((a, b) => a.instance.localeCompare(b.instance));
    cle.value = "";
    instance.value = "";
    remplaceCle = false;
    remplitMenu(ligne.instance);
    montre();
    return ligne.instance;
  }

  menu.onchange = () => {
    remplaceCle = false;
    montre();
    if (menu.value === NOUVELLE) { instance.focus(); return; }
    if (surChoix) surChoix(menu.value);
  };
  // l'alerte dit ce qui manquait : elle se tait dès qu'on y répond
  neuve.oninput = () => dit("");
  changeCle.onclick = () => { remplaceCle = true; montre(); cle.focus(); };
  bouton.onclick = async () => {
    const choix = lit();
    if (!choix) return;
    bouton.disabled = true;
    try {
      const retenue = await enregistre(choix);
      if (surChoix) await surChoix(retenue);
    } catch (err) {
      dit(err.message);
    } finally {
      bouton.disabled = false;
    }
  };

  remplitMenu(valeur);
  montre();
  return { element: tout, lit, enregistre, dit };
}
