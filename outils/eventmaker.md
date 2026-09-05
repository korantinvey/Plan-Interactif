# Eventmaker : lier une conférence à un exposant

Le plan sait placer un exposant sur un stand et afficher un programme ; il ne
savait pas dire *« cette conférence est tenue par l'enseigne du stand F48 »*.
Il le sait maintenant, et exactement : **le lien existe, dans l'API GraphQL du
programme public**, pas dans l'API REST.

La chaîne, en deux appels :

```
POST https://app.eventmaker.io/api/graphql          (public, sans jeton)
  publicViewer(eventId:).program(id:).sessions → exhibitors[].id
GET  /api/v1/events/{id}/guests/{exhibitorId}.json?guest_metadata=true
  → NUM stand → le stand du plan
```

Sur Franchise Expo Paris 2026 : **70 sessions sur 178 rattachées à un stand**,
sans recoupement ni approximation, et les 55 personnes citées comme exposants
portent toutes un numéro de stand — 55 sur 55. La sonde le refait sur commande
(section 8) ; les rattachements atterrissent dans `brut/eventmaker/`.

## Le graphe, dans le détail

L'adresse est `/api/graphql` — sur `app.eventmaker.io` comme sur le domaine du
salon, indifféremment. Elle est **publique** : ni jeton, ni en-tête ; c'est ce
que lit le programme du site public, où l'on voit bien les exposants sous
chaque session. `publicViewer(eventId:)` est la vue du visiteur ; `viewer`, sa
version connectée, dont nous n'avons pas besoin.

Chaque session y porte trois rôles :

| rôle | ce qu'il vaut, sur FEP 2026 |
|---|---|
| `speakers` | 141 sessions ; 285 personnes, **aucun stand** (ce sont des conférenciers) |
| `moderators` | 93 sessions ; 45 personnes, aucun stand |
| `exhibitors` | 70 sessions ; **55 personnes, 55 numéros de stand** |

Le type `ProgramExhibitor` ne rend que `id`, `name`, `nameSortValue`,
`companyName`, `position`, `illustrationUrl` : le stand n'est pas dans le
graphe et se relit en REST par l'identifiant, qui est bien celui d'une fiche
d'invité (55 sur 55 résolues). L'introspection du schéma est fermée — les noms
de champs se devinent par les messages d'erreur, qui sont bavards.

Un salon range souvent ses sessions dans plusieurs programmes : un complet, des
thématiques qui y puisent. Il faut dédoublonner par identifiant de session,
sinon on compte deux fois.

Le mécanisme est le même partout, son remplissage non : Open Source Experience
2026 range ses 59 sessions en huit programmes, toutes avec intervenants, **pas
une avec exposants**. Le rôle « Exposants » n'est renseigné que si l'organisateur
l'a fait — un plan qui compte dessus doit donc le vérifier salon par salon, ce
que la section 8 rend en une ligne.

`companyName` porte l'enseigne sur les trois rôles, y compris les conférenciers
sans stand — de quoi rattacher au jugé une session dont l'intervenant vient
d'une enseigne exposante, si l'on veut aller au-delà des 70.

## Ce que l'API REST ne dit pas, et pourquoi on a cherché ailleurs

La documentation ne connaît que six ressources — events, guests,
guest-categories, check-in points, check-ins, signatures — plus l'API Leads.
Ni session, ni programme, ni intervenant. Les sessions et les programmes
existent pourtant sous `/accesspoints` et `/programs` : ils sont simplement
hors documentation, et les sections 1 à 7 de la sonde en font le tour.

- **La session ne nomme personne.** Ses quatre-vingt-dix champs décrivent
  salle, horaire, direct, jauge. La fiche détaillée n'ajoute rien.
- **Aucun paramètre ne l'ouvre.** `guest_metadata`, `extended`, `full`,
  `with_speakers` rendent la même charge ; `include=…` rend 500. Sur
  `/guests`, seuls `uid`, `search` et `category[]` existent : `accesspoint_id`
  et consorts ne sont pas refusés, ils sont **ignorés**, et la liste complète
  revient l'air d'avoir été filtrée.
- **Les chemins voisins n'existent pas.** Une vingtaine essayés, tous 404, y
  compris `/programs/:id/{sessions,speakers,exhibitors,guests}`. Pas de v2, pas
  de `/graphql` à la racine — le graphe est sous `/api/graphql`.
- **`access_privileges` est une fausse piste.** Une fiche porte ses
  inscriptions de session, sans aucun rôle : les catégories les mieux servies
  sont « Étudiant » et « Newsletter ». Sur les 8 333 fiches des catégories
  exposants et conférenciers, 566 portent un stand, 512 sont inscrites à une
  session, **13 les deux**. C'est de l'assistance, pas de l'animation.
- **Aucun organisateur ne l'a saisi à la main.** Les cent événements du compte,
  près de 2 500 sessions : pas un champ personnalisé de session ne nomme un
  exposant ni un stand. La piste « demander un champ à l'organisateur » n'a
  plus lieu d'être — le graphe donne mieux, et sans rien demander.

## Deux pièges

`/exhibitors.json` **ignore `page` et `per_page`** : il rend ses 613 fiches à
chaque appel. Une boucle de pagination qui n'attend qu'une page courte y tourne
sans fin. `toutesPages()` s'arrête donc aussi quand une page rend ce que la
précédente rendait déjà.

Le recoupement textuel (section 7) reste dans la sonde à titre de comparaison —
72 sessions nommant un exposant, contre 70 rattachées exactement — mais il n'a
plus d'usage : une enseigne citée n'anime pas forcément, et « Boulangerie :
vers une premiumisation » n'est qu'un BOULANGER pris dans un mot.
