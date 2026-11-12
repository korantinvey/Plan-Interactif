/**
 * Ce qu'une demande mal formée ou un jeton refusé doivent recevoir : un refus
 * qui dit ce qui ne va pas, jamais un 500.
 *
 * Un 500 compte pour une panne dans les journaux, et il renvoyait à l'appelant
 * le message brut de la bibliothèque ou de Postgres — « No suitable key or
 * wrong key type », « invalid input syntax for type uuid » — qui décrit la
 * mécanique du serveur à qui sonde. Ces deux règles sont rangées à part pour
 * qu'un essai les éprouve telles que la fonction les reçoit
 * (`outils/essais/refus.js`).
 */

/**
 * Le jeton présenté a été refusé par la base.
 *
 * PostgREST range sous `PGRST301` tout jeton qu'il ne sait pas lire — forgé,
 * mal signé, sans signature, tronqué — et sous `PGRST303` un jeton expiré. On
 * se fiait autrefois au message, en y cherchant « jwt », « token » ou
 * « expired » : un jeton forgé reçoit « No suitable key or wrong key type », qui
 * n'en contient aucun, et ressortait en 500. Le message reste lu, faute de code,
 * pour une erreur venue d'ailleurs que de PostgREST.
 */
export function sessionRefusee(
  erreur: { code?: string | null; message?: string | null } | null | undefined,
): boolean {
  if (!erreur) return false;
  if (erreur.code === "PGRST301" || erreur.code === "PGRST303") return true;
  return /jwt|token|expired/i.test(erreur.message ?? "");
}

/**
 * Un identifiant de pavillon tel que Klipso les donne, et que la colonne
 * `plan.id_klipso` range en `uuid`. Lu avant la base : Postgres refuse un
 * texte qui n'en a pas la forme par une erreur, que la fonction rendait en 500.
 */
export function identifiantDePavillon(texte: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    .test(texte);
}
