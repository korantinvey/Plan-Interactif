/* ============================================================
   Les dates et les heures du salon

   Une heure se relit telle que la source l'écrit, dans le fuseau du salon, et
   ne passe jamais par l'horloge du visiteur : il peut lire le programme depuis
   un autre pays. D'où des jours et des heures tenus en nombres — `{ jour, mois,
   an, h, min, cle }` —, que ce module lit et écrit sans rien savoir du plan.
   ============================================================ */

/**
 * Les noms des jours et des mois, en français : la page traduit ce qu'elle
 * affiche (`_langue.js`).
 *
 * L'heure vient d'Eventmaker sous sa forme locale — « 03/14/2026 10:30 » — ce
 * qui évite de deviner le fuseau du salon depuis le navigateur d'un visiteur
 * qui peut être ailleurs. On la relit telle quelle plutôt que d'en faire une
 * date, dont le rendu dépendrait justement du fuseau.
 */
export const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
export const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                     "août", "septembre", "octobre", "novembre", "décembre"];

/**
 * L'heure d'une conférence, dans le fuseau du salon.
 *
 * Eventmaker donne deux formes. « 03/14/2026 10:30 » est l'heure locale du
 * salon : on la relit telle quelle, c'est la seule qui ne demande rien. La
 * forme ISO, elle, porte un décalage — souvent Z — qu'il faut ramener au
 * fuseau de l'événement, sans quoi un visiteur d'un autre pays lirait des
 * horaires faux.
 */
export function momentLocal(v, fuseau){
  const t = String(v || "");
  const m = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/.exec(t);
  if (m){
    return { jour: +m[2], mois: +m[1], an: +m[3], h: m[4].padStart(2, "0"), min: m[5],
             cle: m[3] + m[1] + m[2] };
  }
  const d = new Date(t);
  if (isNaN(d.getTime())) return null;
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", {
      timeZone: fuseau || undefined, year: "numeric", month: "2-digit",
      day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(d).map(x => [x.type, x.value]));
    return { jour: +p.day, mois: +p.month, an: +p.year,
             h: String(p.hour).padStart(2, "0"), min: p.minute,
             cle: p.year + p.month + p.day };
  } catch (e) {
    return null;   // fuseau inconnu : mieux vaut taire l'heure que la fausser
  }
}

/** Une date écrite en toutes lettres : « samedi 14 mars 2026 ». */
export function jourLong(d){
  if (!d) return "";
  const dt = new Date(d.an, d.mois - 1, d.jour);
  return JOURS[dt.getDay()] + " " + d.jour + " " + MOIS[d.mois - 1] + " " + d.an;
}

/** La même, sans l'année : « samedi 14 mars ». */
export const jourCourt = d => d
  ? JOURS[new Date(d.an, d.mois - 1, d.jour).getDay()] + " " + d.jour + " " + MOIS[d.mois - 1]
  : "";

/** Une clé de jour — « 20270321 », telle que `momentLocal` la rend — relue en
 *  date. C'est par elle que les conférences, les horaires et les choix du
 *  visiteur se rejoignent, sans jamais passer par un fuseau. */
export const dateDeCle = (cle) => /^\d{8}$/.test(String(cle))
  ? { an: +String(cle).slice(0, 4), mois: +String(cle).slice(4, 6), jour: +String(cle).slice(6, 8) }
  : null;

/** Le jour en deux mots — « mar. 21 » : un onglet en porte trois de front sur
 *  un téléphone, ce que « mardi 21 mars » ne permet pas. */
export function jourBref(cle){
  const d = dateDeCle(cle);
  if (!d) return "";
  return JOURS[new Date(d.an, d.mois - 1, d.jour).getDay()].slice(0, 3) + ". " + d.jour;
}

/** Le jour d'un séjour, tel que la base le veut : « AAAA-MM-JJ ». */
export function jourISO(cle){
  const d = dateDeCle(cle);
  return d ? String(d.an).padStart(4, "0") + "-" +
             String(d.mois).padStart(2, "0") + "-" +
             String(d.jour).padStart(2, "0") : "";
}

/**
 * L'instant absolu d'une heure murale du salon — `{ an, mois, jour, h, min }`,
 * telle que `momentLocal` la rend —, dans son fuseau, ce jour-là.
 *
 * Tout le reste raisonne en heure locale du salon ; une minuterie, elle, se
 * pose sur un instant. On suppose l'heure murale exprimée en UTC, on regarde
 * ce que le fuseau en aurait affiché, et on corrige de l'écart. Deux tours,
 * parce que la correction peut elle-même franchir le changement d'heure — un
 * dimanche de mars à deux heures et demie du matin.
 *
 * Un fuseau que le navigateur ne connaît pas ne donne pas d'instant du tout
 * (`NaN`) : c'est la règle de `momentLocal`, qui refuse une heure plutôt que
 * d'en afficher une fausse.
 */
export function instantMural(p, fuseau){
  const mural = Date.UTC(p.an, p.mois - 1, p.jour, +p.h, +p.min);
  let t = mural;
  for (let i = 0; i < 2; i++){
    const lu = momentLocal(new Date(t).toISOString(), fuseau);
    if (!lu) return NaN;
    t = mural - (Date.UTC(lu.an, lu.mois - 1, lu.jour, +lu.h, +lu.min) - t);
  }
  return t;
}

/* ------------------------------------------------------------
   Les heures, en minutes depuis minuit
   ------------------------------------------------------------ */
export const minutesDe = (d) => d ? (+d.h) * 60 + (+d.min) : null;

export function ecritHeure(m){
  // une journée qui déborde sur la nuit repasse par zéro plutôt que d'écrire 26h
  const t = ((Math.round(m) % 1440) + 1440) % 1440;
  return String(Math.floor(t / 60)).padStart(2, "0") + "h" + String(t % 60).padStart(2, "0");
}
export function ecritMinutes(m){
  const t = Math.max(1, Math.round(m));
  if (t < 60) return t + " min";
  const h = Math.floor(t / 60), r = t % 60;
  return h + " h" + (r ? " " + r + " min" : "");
}
