# Eventmaker : lier une conférence à un exposant

Le plan sait placer un exposant sur un stand et afficher un programme ; il ne
sait pas dire *« cette conférence est animée par l'enseigne du stand W110 »*.
La question était de savoir si l'API Eventmaker le dit. `sonde-eventmaker.js`
est allée le demander, sur Franchise Expo Paris 2026 — 178 sessions, 613
exposants, 8 333 fiches d'invités — puis sur les cent événements du compte.

**Elle ne le dit pas.** Voici par où on est passé, pour que personne n'y
retourne sans raison.

## Ce que l'API rend d'une session

Une session est un point d'accès (`/accesspoints.json`) qui porte un
`session_type_id`. Ses quatre-vingt-dix champs décrivent la salle, l'horaire,
le direct, la billetterie, la jauge — **aucun ne nomme un invité, une société
ou un stand**. La fiche détaillée d'une session ne rend rien de plus que la
ligne de liste.

Dix paramètres censés l'ouvrir ont été essayés : `guest_metadata`,
`accesspoint_metadata`, `metadata`, `traits`, `extended`, `full`,
`with_speakers` rendent 200 et la même charge, au champ près ; `include=…`
rend 500.

## Le produit sait, l'API tait

`/programs.json` range sous chaque session trois rôles — **Intervenants,
Animateur, Exposants** — avec, pour chacun, l'affichage du nom de société. La
relation existe donc bien dans Eventmaker.

Aucune adresse ne la rend. `/programs/:id.json` répond 200 ; `/sessions`,
`/speakers`, `/exhibitors`, `/accesspoints` et `/guests` sous le programme
répondent tous 404, comme `/events/:id/{sessions,speakers,session_speakers,
custom_fields,registrations,bookings,attendances,workshops}`, comme
`/accesspoints/:id/{speakers,guests,exhibitors,registrations,roles}`, comme
`/guests/:id/{accesspoints,sessions,registrations}`, comme
`/{access_privileges,guest_accesspoints,accesspoint_guests,roles,
session_roles,website_pages}`.

Ce qui existe à côté : `/session_types`, `/session_rooms`, `/guest_fields`
(251 définitions, aucune ne parle de conférence), `/labels`, `/thematics`,
`/exhibitors` — dont la fiche ne porte que nom et courriel, la fiche riche
étant sur l'invité correspondant.

## La fausse piste : `access_privileges`

Une fiche d'invité porte ses inscriptions de session, intitulé et salle
compris. C'est le seul rattachement invité ↔ session que l'API rende, et il
ressemble à une piste jusqu'à ce qu'on le compte.

Il ne porte **aucun rôle**. Sur l'échantillon, les catégories les mieux
servies sont « Étudiant », « Newsletter » et « Etudiants - Groupe » : ce sont
des places réservées, pas des interventions. À pleine échelle, sur les 8 333
fiches des catégories exposants et conférenciers de Franchise Expo Paris
2026 : 566 portent un numéro de stand, 512 sont inscrites à au moins une
session, **13 les deux**. Les 148 sessions ainsi « touchées » sur 178 le sont
par des porteurs de badge exposant venus écouter.

Le sens inverse n'existe pas non plus : `accesspoint[]`, `accesspoint_id`,
`session_id` sur `/guests.json` ne sont pas refusés, ils sont **ignorés** — la
liste complète revient, l'air d'avoir été filtrée.

## Aucun organisateur ne l'a saisi

Reste le champ personnalisé de session (`traits`), que l'API rend tel quel sur
chaque session : rien n'empêche un organisateur d'y loger un numéro de stand.
Les cent événements du compte ont été balayés, soit près de 2 500 sessions.
Les `traits` rencontrés sont des thématiques, des traductions, des langues,
des parcours, un numéro de conférence. **Pas un ne nomme un exposant ni un
stand.**

## Ce qui reste, donc

1. **Demander le champ.** Un champ personnalisé de session portant le numéro
   de stand — ou l'enseigne exacte — se lit dans `traits` sans un appel de
   plus. C'est la seule voie exacte, et elle ne coûte qu'une consigne à
   l'organisateur.
2. **Recouper le texte, en sachant ce qu'on paie.** Sur Franchise Expo Paris
   2026, 72 sessions sur 178 nomment un exposant dans leur intitulé ou leur
   description (section 7). Le repérage confronte chaque numéro qu'il croit
   voir à la liste réelle des stands, sans quoi « en 2026 » et « à 17 h »
   passeraient pour tels. Reste qu'une enseigne citée n'anime pas forcément :
   « Opportunité Franchise : SO.BIO en direct ! » tient, « Boulangerie : vers
   une premiumisation » n'est qu'un BOULANGER pris dans un mot. À réserver à
   une suggestion, jamais à un rattachement ferme.

## Un piège, au passage

`/exhibitors.json` **ignore `page` et `per_page`** : il rend ses 613 fiches à
chaque appel. Une boucle de pagination qui n'attend qu'une page courte y tourne
sans fin. `toutesPages()` s'arrête donc aussi quand une page rend ce que la
précédente rendait déjà.
