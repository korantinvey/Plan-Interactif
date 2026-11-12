/* ============================================================
   Ce qu'ouvre une ligne de la liste

   La liste (`recherche.mjs`) pose ses lignes ; ce module dit ce qu'un clic
   sur l'une d'elles ouvre — la fiche d'un stand, d'une conférence, d'un
   repère. Il est au-dessus de la fiche et des repères, qu'il importe : la
   liste, que la fiche importe, ne le pouvait pas, et se faisait confier ces
   trois gestes.

   Une seule écoute pour toutes les lignes : elles naissent et meurent à
   chaque frappe, et aucune ne garderait la sienne. Elle se pose à son rang
   (`lancement.mjs`, juste après la recherche) : avant celle des tiroirs, qui
   replie la liste sur un téléphone une fois la ligne choisie.
   ============================================================ */
import { $ } from "./dom.mjs";
import { select, ficheConf } from "./fiche.mjs";
import { vaAuRepere } from "./points-interet.mjs";

export function brancheLignesListe(){
  const box = $("list");
  box.addEventListener("click", e => {
    const b = /** @type {HTMLElement | null} */ (e.target instanceof Element ? e.target.closest(".row") : null);
    if (!b || !box.contains(b)) return;
    /* Une conférence n'est pas un emplacement : `select` ne saurait pas la
       cadrer, et c'est sa fiche qu'on ouvre — d'où elle offre de situer sa
       salle sur le plan. */
    if (b.dataset.sorte === "conf"){ ficheConf(b.dataset.id, "recherche"); return; }
    // un repère s'ouvre sur son plan, et depuis sa pastille : ce n'est pas un
    // emplacement, et « select » n'aurait rien à cadrer
    if (b.dataset.sorte === "poi"){ vaAuRepere(b.dataset.id, +b.dataset.p); return; }
    /* Un rang part avec l'identifiant, et la fiche s'ouvre droit sur la
       société du rang cliqué : la liste vient de la nommer, redemander
       laquelle on veut serait une question dont on a déjà la réponse. Le
       canal, la liste l'a écrit sur elle en se dessinant. */
    select(b.dataset.id, true, box.dataset.canal || "liste", Number(b.dataset.soc));
  });
}
