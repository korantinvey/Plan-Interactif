const VERSION = "ef73b2003c04";
const CACHE = "plan-" + VERSION;
const DURABLE = "plan-durable";
const HORS_LIGNE = "hors-ligne.html";

const LOTS_GARDES = 24;

const POLICES = /^\/polices\/[^/]+\.woff2$/;
const BIBLIOTHEQUES = /^\/bibliotheques\/[^/]+\.js$/;

const FONDS_DE_CARTE = new Set([
  "https://data.geopf.fr",
  "https://tile.openstreetmap.org",
  "https://tiles.versatiles.org",
  "https://tiles.openfreemap.org",
  "https://cdn.jsdelivr.net",
]);

const TUILE_XYZ = /\/\d+\/\d+\/\d+(\.\w+)?$/;
const GLYPHES = /\/glyphs\/[^/]+\/\d+-\d+\.pbf$/;
const estUneTuile = (u) =>
  u.searchParams.has("TILEROW") || TUILE_XYZ.test(u.pathname) || GLYPHES.test(u.pathname);

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.add(new Request(HORS_LIGNE, { cache: "reload" })))
      .catch(() => {})
      .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => n.startsWith("plan-") && n !== CACHE && n !== DURABLE)
            .map((n) => caches.delete(n))))
      .then(() => self.clients.claim()));
});

function range(e, requete, reponse) {
  const copie = reponse.clone();
  e.waitUntil(caches.open(CACHE).then((c) => c.put(requete, copie)).catch(() => {}));
  return reponse;
}

async function oublieLesVersionsDAvant(cache, adresse) {
  const memeFond = (u) =>
    u.origin === adresse.origin && u.pathname === adresse.pathname &&
    u.searchParams.get("slug") === adresse.searchParams.get("slug") &&
    u.searchParams.get("fond") === adresse.searchParams.get("fond") &&
    u.searchParams.get("v") !== adresse.searchParams.get("v");
  for (const cle of await cache.keys()) {
    let u;
    try { u = new URL(cle.url); } catch (_) { continue; }
    if (memeFond(u)) await cache.delete(cle);
  }
}

async function dabordCache(e, requete, ou) {
  const cache = await caches.open(ou);
  const garde = await cache.match(requete);
  if (garde) return garde;
  const reponse = await fetch(requete);
  if (!reponse.ok) return reponse;
  if ((reponse.headers.get("Cache-Control") || "").includes("no-store")) return reponse;
  const copie = reponse.clone();
  const adresse = new URL(requete.url);
  e.waitUntil(caches.open(ou).then(async (c) => {
    await c.put(requete, copie);
    if (adresse.pathname !== "/api/plan") return;
    if (adresse.searchParams.get("v")) await oublieLesVersionsDAvant(c, adresse);
    if (adresse.searchParams.get("vignettes")) await borneLesLots(c);
  }).catch(() => {}));
  return reponse;
}

async function borneLesLots(cache) {
  const lots = (await cache.keys()).filter((c) => {
    try { return new URL(c.url).searchParams.has("vignettes"); } catch (_) { return false; }
  });
  const trop = lots.length - LOTS_GARDES;
  if (trop <= 0) return;
  for (const vieux of lots.slice(0, trop)) await cache.delete(vieux);
}

const TUILES_GARDEES = 120;

const TUILES_ENTRE_MENAGES = 20;
let _depuisLeMenage = TUILES_ENTRE_MENAGES;

async function borneLesTuiles(cache) {
  if (++_depuisLeMenage < TUILES_ENTRE_MENAGES) return;
  _depuisLeMenage = 0;
  const tuiles = (await cache.keys()).filter((c) => {
    try { return new URL(c.url).origin !== location.origin; } catch (_) { return false; }
  });
  const trop = tuiles.length - TUILES_GARDEES;
  if (trop <= 0) return;
  for (const vieille of tuiles.slice(0, trop)) await cache.delete(vieille);
}

const _sansCors = new Set();

async function demandeTiers(cle) {
  if (_sansCors.has(new URL(cle.url).origin)) return null;
  try {
    return await fetch(cle, { mode: "cors", credentials: "omit" });
  } catch (panne) { return null; }
}

async function commePosee(requete) {
  const brut = await fetch(requete);
  _sansCors.add(new URL(requete.url).origin);
  return brut;
}

async function tuileDeCarte(e, requete) {
  const cle = new Request(requete.url);
  const cache = await caches.open(DURABLE);
  const garde = await cache.match(cle, { ignoreVary: true });
  if (garde) return garde;

  const recu = await demandeTiers(cle);
  if (!recu) return commePosee(requete);
  if (!recu.ok) return recu;

  const copie = recu.clone();
  e.waitUntil(caches.open(DURABLE).then(async (c) => {
    await c.put(cle, copie);
    await borneLesTuiles(c);
  }).catch(() => {}));
  return recu;
}

async function fondDeCarte(e, requete) {
  const cle = new Request(requete.url);
  const recu = await demandeTiers(cle);
  if (recu && recu.ok) {
    const copie = recu.clone();
    e.waitUntil(caches.open(CACHE).then((c) => c.put(cle, copie)).catch(() => {}));
    return recu;
  }
  if (recu) return recu;
  const garde = await caches.match(cle, { ignoreVary: true });
  return garde || commePosee(requete);
}

async function dabordReseau(e, requete, cle) {
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) range(e, cle || requete, reponse);
    return reponse;
  } catch (panne) {
    const garde = await caches.match(cle || requete);
    if (garde) return garde;
    throw panne;
  }
}

async function navigation(e, requete) {
  const cle = new Request(new URL(requete.url).pathname
    .replace(/^\/plan-[a-z0-9][a-z0-9-]{0,63}$/, "/plan"));
  try {
    return await dabordReseau(e, requete, cle);
  } catch (panne) {
    return (await caches.match(HORS_LIGNE)) || Response.error();
  }
}

self.addEventListener("fetch", (e) => {
  const requete = e.request;
  if (requete.method !== "GET") return;
  if (requete.headers.get("Authorization")) return;

  const adresse = new URL(requete.url);

  if (adresse.origin === location.origin) {
    if (adresse.pathname === "/api/plan") {
      e.respondWith(adresse.searchParams.get("v") ||
                    adresse.searchParams.get("vignette") ||
                    adresse.searchParams.get("vignettes")
        ? dabordCache(e, requete, DURABLE)
        : dabordReseau(e, requete));
      return;
    }
    if (adresse.pathname.startsWith("/api/")) return;

    e.respondWith(requete.mode === "navigate"
      ? navigation(e, requete)
      : POLICES.test(adresse.pathname) || BIBLIOTHEQUES.test(adresse.pathname)
        ? dabordCache(e, requete, CACHE)
        : dabordReseau(e, requete));
    return;
  }

  if (FONDS_DE_CARTE.has(adresse.origin)) {
    e.respondWith(estUneTuile(adresse)
      ? tuileDeCarte(e, requete)
      : fondDeCarte(e, requete));
    return;
  }
});

self.addEventListener("push", (e) => {
  let m = {};
  try { m = (e.data && e.data.json()) || {}; } catch (err) {}
  const titre = m.titre || "Conférence à venir";
  e.waitUntil(self.registration.showNotification(titre, {
    body: m.corps || "",
    icon: "icone-192.png",
    badge: "icone-onglet.svg",
    lang: m.langue || "fr",
    tag: "conf:" + (m.conf || titre),
    renotify: true,
    requireInteraction: true,
    data: { adresse: m.adresse || "./" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const adresse = (e.notification.data && e.notification.data.adresse) || "./";
  e.waitUntil((async () => {
    const cible = new URL(adresse, self.location.origin);
    const ouverts = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of ouverts) {
      if (new URL(c.url).pathname !== cible.pathname) continue;
      try { await c.navigate(cible.href); } catch (err) {}
      return c.focus();
    }
    return self.clients.openWindow(cible.href);
  })());
});
