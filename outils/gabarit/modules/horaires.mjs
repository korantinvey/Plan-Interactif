/* ============================================================
   La journée du salon — ses dates, ses heures, le temps passé sur un stand

   Sortie de `_admin1.html`. Ce que l'exploitant dit du déroulé du salon, et
   que la journée organisée relit chez le visiteur (`journee.mjs`,
   `sejour.mjs`) : l'onglet « Plan » l'écrit (`volets.mjs`, `reglages.mjs`).
   Il ne demande rien au code soudé : la configuration et l'écriture d'un
   jour s'importent.
   ============================================================ */
import { CONF } from "./configuration.mjs";
import { jourCourt } from "./temps.mjs";

/**
 * Combien de temps on passe sur un stand.
 *
 * Ce n'est pas un réglage d'affichage : c'est ce qui décide combien de
 * visites tiennent entre deux conférences quand le visiteur demande qu'on
 * organise sa journée. Le mettre trop bas remplit un programme intenable ;
 * trop haut, il laisse des stands de côté sans raison.
 *
 * Vingt minutes est ce qu'on observe sur un salon professionnel — le temps
 * d'une poignée de main, d'une démonstration et d'une carte de visite. Un
 * salon grand public tourne plus vite, un salon d'affaires beaucoup moins :
 * cela ne se devine pas depuis le plan, d'où le réglage.
 */
const VISITE_DEFAUT = 20;      // minutes
export const VISITE_MIN = 5, VISITE_MAX = 120;
export function minutesVisite(){
  const v = Math.round(+(CONF["_visite"] || {}).minutes);
  return v >= VISITE_MIN && v <= VISITE_MAX ? v : VISITE_DEFAUT;
}

/**
 * Les dates du salon, et ses heures jour par jour.
 *
 * Sans heures, la journée organisée n'avait pas de fin : ce qui ne tenait pas
 * entre deux conférences se rangeait après la dernière, et le visiteur se
 * voyait programmer un stand à dix-neuf heures quarante dans un hall fermé
 * depuis une heure. Klipso ne donne ni les dates ni les heures ; c'est
 * l'exploitant qui les dit.
 *
 * Les dates d'abord, les heures ensuite, une paire par jour : un salon change
 * d'horaires d'un jour à l'autre — le dernier ferme plus tôt, le jour réservé
 * aux professionnels ouvre avant — et « tous les jours, sauf » se lisait moins
 * bien qu'une ligne par date. Les dates servent aussi au visiteur : ce sont
 * les jours qu'on lui propose, conférences ou non.
 *
 *   { debut: "2027-03-21", fin: "2027-03-23",
 *     jours: { "20270321": { ouverture: "10:00", fermeture: "19:00" } } }
 *
 * Les jours sont indexés comme `momentLocal` date une conférence, ce qui les
 * compare sans conversion. Un jour sans heures n'a pas de borne.
 */
export const JOURS_SALON_MAX = 31;   // au-delà, c'est une date mal tapée, pas un salon
export function lueHeure(s){
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ""));
  return m && +m[1] < 24 && +m[2] < 60 ? +m[1] * 60 + +m[2] : null;
}
export function lueDate(s){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
}

/** Les jours du salon, dans l'ordre ; vide tant que les dates n'en disent
 *  rien de lisible. Une date de fin absente fait un salon d'un jour. */
export function datesSalon(){
  const h = CONF["_horaires"] || {};
  const a = lueDate(h.debut), b = lueDate(h.fin) || a;
  if (!a || b < a) return [];
  const l = [];
  for (const d = new Date(a); d <= b && l.length < JOURS_SALON_MAX; d.setUTCDate(d.getUTCDate() + 1)){
    const an = d.getUTCFullYear(), mois = d.getUTCMonth() + 1, jour = d.getUTCDate();
    l.push({ cle: an + String(mois).padStart(2, "0") + String(jour).padStart(2, "0"),
             nom: jourCourt({ an: an, mois: mois, jour: jour }) });
  }
  return l;
}

/** Les heures d'un jour, en minutes depuis minuit ; `null` là où rien n'est dit. */
export function horairesSalon(jour){
  const j = (jour && ((CONF["_horaires"] || {}).jours || {})[jour]) || {};
  const ouverture = lueHeure(j.ouverture), fermeture = lueHeure(j.fermeture);
  /* Une fermeture qui précède l'ouverture n'est pas un salon de nuit, c'est
     une saisie à moitié faite : on n'en retient rien plutôt que de rendre une
     journée vide. L'onglet des réglages le signale. */
  if (ouverture !== null && fermeture !== null && fermeture <= ouverture)
    return { ouverture: null, fermeture: null, incoherent: true };
  return { ouverture: ouverture, fermeture: fermeture };
}
