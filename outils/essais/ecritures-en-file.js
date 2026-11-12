/**
 * Les écritures en file : `modules/ecritures-en-file.mjs`, éprouvé seul.
 *
 * Ce que la console change à l'écran avant que la base l'ait pris, puis défait
 * si elle le refuse. Chaque cas ici est une séquence qu'une revue de code a
 * trouvée en défaut quand ce geste était recodé à la main : des clics
 * rapprochés, un serveur qui répond lentement, qui refuse, qui refuse deux
 * fois de suite. Le serveur est simulé : chaque écriture attend qu'on lui
 * dise de réussir ou d'échouer, dans l'ordre que le cas choisit.
 *
 *   node outils/essais/ecritures-en-file.js     (lancé par `npm run essais`)
 */
const path = require("path");
const { pathToFileURL } = require("url");

let ko = 0;
const dit = (ok, q, d) => {
  console.log((ok ? "  ok   " : "  ÉCHEC") + "  " + q + (d ? "   → " + d : ""));
  if (!ok) ko++;
};
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Un serveur qu'on fait répondre à la main, requête par requête. */
function serveur() {
  const attentes = [];
  const recus = [];
  return {
    recus,
    /** Une écriture : retient ce qu'elle envoie, attend la décision. */
    ecrit: (valeur) => new Promise((ok, refus) => {
      recus.push(valeur);
      attentes.push({ ok: () => ok(valeur), refus: () => refus(new Error("refusé")) });
    }),
    /** Fait répondre la plus ancienne requête en attente. */
    async repond(reussit) {
      for (let i = 0; i < 20 && !attentes.length; i++) await new Promise((r) => setImmediate(r));
      const a = attentes.shift();
      if (!a) throw new Error("aucune requête en attente");
      if (reussit) a.ok(); else a.refus();
      await new Promise((r) => setImmediate(r));
    },
    enAttente: () => attentes.length,
  };
}

(async () => {
  const { creeFileEcritures } = await import(
    pathToFileURL(path.join(__dirname, "..", "gabarit", "modules", "ecritures-en-file.mjs")).href);

  console.log("Une écriture après l'autre");
  {
    const s = serveur(), f = creeFileEcritures({ v: 0 });
    f.ecrit(() => s.ecrit({ v: 1 }));
    f.ecrit(() => s.ecrit({ v: 2 }));
    await new Promise((r) => setImmediate(r));
    dit(s.enAttente() === 1, "la seconde attend que la première ait répondu", s.enAttente() + " en vol");
    await s.repond(true);
    dit(s.enAttente() === 1, "puis part à son tour");
    await s.repond(true);
    dit(egal(f.confirme(), { v: 2 }), "l'état confirmé est celui de la dernière", JSON.stringify(f.confirme()));
  }

  console.log("Chaque écriture part de ce que la précédente a fait confirmer");
  {
    const s = serveur(), f = creeFileEcritures({ a: 0, b: 0 });
    f.ecrit((c) => s.ecrit({ ...c, a: 1 }));
    f.ecrit((c) => s.ecrit({ ...c, b: 1 }));
    await s.repond(true);
    await s.repond(true);
    dit(egal(s.recus[1], { a: 1, b: 1 }), "la seconde envoie aussi le changement de la première",
      JSON.stringify(s.recus[1]));
  }

  console.log("Seule la dernière réponse remet l'écran à jour");
  {
    const s = serveur(), f = creeFileEcritures(0);
    const r1 = f.ecrit(() => s.ecrit(1));
    const r2 = f.ecrit(() => s.ecrit(2));
    await s.repond(true);
    await s.repond(true);
    const [a, b] = await Promise.all([r1, r2]);
    dit(a.ok && !a.dernier, "la première réussit, mais n'est plus la dernière");
    dit(b.ok && b.dernier, "la seconde réussit et a le dernier mot");
  }

  console.log("Un refus revient à ce que la base tient, pas à l'inverse du clic");
  {
    /* Case décochée ; on coche, puis on décoche pendant le premier envoi ; les
       deux sont refusés. L'inverse du dernier clic recochait la case : la base,
       elle, n'a jamais quitté « décoché ». */
    const s = serveur(), f = creeFileEcritures(false);
    const r1 = f.ecrit(() => s.ecrit(true));
    const r2 = f.ecrit(() => s.ecrit(false));
    await s.repond(false);
    await s.repond(false);
    const [a, b] = await Promise.all([r1, r2]);
    dit(!a.ok && !a.dernier, "le premier refus laisse la main au geste suivant");
    dit(!b.ok && b.dernier && b.confirme === false, "le dernier refus ramène à « décoché »",
      String(b.confirme));
  }
  {
    /* Coché par une écriture réussie, puis un geste refusé : le refus ramène
       à « coché », que la base vient de prendre — pas à l'état du chargement. */
    const s = serveur(), f = creeFileEcritures(false);
    const r1 = f.ecrit(() => s.ecrit(true));
    const r2 = f.ecrit(() => s.ecrit(false));
    await s.repond(true);
    await s.repond(false);
    const b = (await Promise.all([r1, r2]))[1];
    dit(!b.ok && b.dernier && b.confirme === true, "le refus revient au dernier état confirmé",
      String(b.confirme));
  }

  console.log("Un refus ne rompt pas la file");
  {
    const s = serveur(), f = creeFileEcritures(0);
    f.ecrit(() => s.ecrit(1));
    const r2 = f.ecrit(() => s.ecrit(2));
    await s.repond(false);
    await s.repond(true);
    const b = await r2;
    dit(b.ok && b.confirme === 2, "l'écriture suivante part et réussit");
  }
  {
    const f = creeFileEcritures(0);
    const r = await f.ecrit(() => { throw new Error("tout de suite"); });
    dit(!r.ok && r.erreur instanceof Error, "une erreur levée d'emblée se lit dans la réponse");
    const r2 = await f.ecrit(() => 3);
    dit(r2.ok && r2.confirme === 3, "et la file continue derrière");
  }

  console.log("L'état confirmé n'est jamais partagé");
  {
    /* Le piège du volet de la fiche : l'état confirmé et l'état affiché étaient
       le même objet, que le clic suivant modifiait en place. */
    const charge = { stand: { nom: true } };
    const f = creeFileEcritures(charge);
    charge.stand.nom = false;
    dit(f.confirme().stand.nom === true, "modifier l'objet chargé ne change pas l'état confirmé");
    const r = await f.ecrit((c) => c);
    r.confirme.stand.nom = false;
    dit(f.confirme().stand.nom === true, "modifier la réponse non plus");
    const affiche = f.confirme();
    affiche.stand.nom = false;
    dit(f.confirme().stand.nom === true, "ni modifier la copie qu'on a lue");
    const rendu = { stand: { nom: true } };
    await f.ecrit(() => rendu);
    rendu.stand.nom = false;
    dit(f.confirme().stand.nom === true, "ni modifier ce que l'écriture a rendu");
  }

  console.log("Une écriture qui ne rend rien garde l'état confirmé");
  {
    const f = creeFileEcritures({ v: 1 });
    const r = await f.ecrit(() => undefined);
    dit(r.ok && egal(r.confirme, { v: 1 }), "rien de rendu, rien de changé");
  }

  console.log("Les clés séparent les gestes qui ne se remplacent pas");
  {
    /* Deux cases de la même fiche : on coche A, puis B. Le refus de A doit
       recaler A, même si B a bougé depuis — B n'a rien dit sur A. */
    const s = serveur(), f = creeFileEcritures(null);
    const ra = f.ecrit(() => s.ecrit("A"), "a");
    const rb = f.ecrit(() => s.ecrit("B"), "b");
    await s.repond(false);
    await s.repond(true);
    const [a, b] = await Promise.all([ra, rb]);
    dit(!a.ok && a.dernier, "le refus de A reste le dernier mot sur A");
    dit(b.ok && b.dernier, "B a le sien");
    dit(egal(s.recus, ["A", "B"]), "mais elles ont partagé la file, dans l'ordre");
  }
  {
    const s = serveur(), f = creeFileEcritures(null);
    const r1 = f.ecrit(() => s.ecrit(1), "a");
    f.ecrit(() => s.ecrit(2), "b");
    const r3 = f.ecrit(() => s.ecrit(3), "a");
    await s.repond(false);
    await s.repond(true);
    await s.repond(true);
    dit(!(await r1).dernier && (await r3).dernier, "sur une même clé, le geste suivant prend le relais");
  }

  console.log("Attendre que la file soit vide");
  {
    const s = serveur(), f = creeFileEcritures(0);
    f.ecrit(() => s.ecrit(1));
    f.ecrit(() => s.ecrit(2));
    let fini = false;
    f.vide().then(() => { fini = true; });
    await s.repond(true);
    dit(!fini, "pas tant qu'une écriture attend");
    await s.repond(false);
    await new Promise((r) => setImmediate(r));
    dit(fini, "puis une fois la dernière répondue, refus compris");
  }

  console.log(ko ? "\n" + ko + " échec(s)." : "\nTout passe.");
  process.exit(ko ? 1 : 0);
})();
