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
portent toutes un numéro de stand — 55 sur 55.

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
qu'un appel au graphe suffit à établir.

`companyName` porte l'enseigne sur les trois rôles, y compris les conférenciers
sans stand — de quoi rattacher au jugé une session dont l'intervenant vient
d'une enseigne exposante, si l'on veut aller au-delà des 70.

## Ce que la synchronisation en fait

`_partage/eventmaker.ts` porte la méthode `exposantsParConference()`, appelée
par `sync-evenement` quand le domaine « conférences » d'un événement est réglé
sur Eventmaker. Chaque conférence de la charge gagne un champ `exposants`, liste
de `{ stand, nom }` où `stand` est l'identifiant d'un stand du plan — vide quand
le salon ne renseigne pas le rôle.

**L'appariement se fait sur le dossier, jamais sur le numéro de stand.** Klipso
porte `IdDossierExpAff` sur chaque stand, Eventmaker le recopie dans le champ
`id_dossier` de la fiche : c'est la même valeur, un GUID, des deux côtés. Le
numéro de stand ne s'y prête pas — saisi à la main, il se compose parfois de
deux emplacements (« E58 - F59 ») que le plan numérote séparément. Sur Franchise
Expo Paris 2026, `id_dossier` couvre 574 fiches d'exposants contre 566 pour
`num_stand`, et les 101 citations d'exposants dans le programme portent toutes
un dossier au format attendu.

L'appariement des exposants eux-mêmes suit la même règle depuis : `exposants()`
rend deux index, par dossier et par numéro, et la synchronisation essaie le
dossier d'abord. Aucune des deux clés ne couvre seule — sur Franchise Expo Paris
2026, dix fiches n'ont qu'un dossier, deux n'ont qu'un numéro — et la catégorie
« Enseignes - Franchise Invest », qui n'a que des dossiers, n'était jusque-là
retenue par rien.

La résolution dossier → stand se fait dans la synchronisation, où les deux côtés
sont connus : la charge publique ne porte donc que des identifiants de stand du
plan, et aucun identifiant Eventmaker. Rien à migrer non plus — elle est en
jsonb, et `plan-public` la transmet telle quelle. La méthode rend 70
rattachements en cinq secondes, joints sans un orphelin.

Un échec du graphe est journalisé et ignoré : un salon sans rôle « Exposants »
est le cas courant, et une synchronisation par ailleurs bonne n'a pas à échouer
là-dessus.

## Ce que l'API REST ne dit pas, et pourquoi on a cherché ailleurs

La documentation ne connaît que six ressources — events, guests,
guest-categories, check-in points, check-ins, signatures — plus l'API Leads.
Ni session, ni programme, ni intervenant. Les sessions et les programmes
existent pourtant sous `/accesspoints` et `/programs` : ils sont simplement
hors documentation. Voici ce qu'ils rendent, et ce qu'ils taisent.

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

## Les co-exposants

Un stand n'héberge pas toujours une seule enseigne. Sur Franchise Expo Paris
2026, **47 stands en portent plusieurs**, jusqu'à douze — Hippopotamus avec
Burger King, Léon, Volfoni, Pitaya et six autres. Le plan n'en montrait qu'une,
et pas toujours la bonne : la première rencontrée.

Le champ qui les désigne existe, mais pas sous le même nom d'un salon à
l'autre — c'est un champ personnalisé de plus :

| salon | champ | valeurs |
|---|---|---|
| Franchise Expo Paris 2026 / 2027 | `nature` | `DIR` 400 · **`COEX` 119** · `ECH` 50 |
| SIDO & Lyon Cyber Expo 2026 | `categorie_de_l_exposant` | `Exposant simple` 184 · **`Co-Exposant` 156** · `Echange/Presse/Média` 19 |
| Open Source Experience 2026 | `categorie_de_l_exposant` | `Exposant simple` 32, aucun co-exposant |

**La synchronisation ne le lit pourtant pas, et n'en a pas besoin.** Elle le
déduit de la structure, qui est plus sûre qu'un libellé :

```
dossier  → le titulaire du stand   (Klipso le porte sur le stand, Eventmaker le recopie)
numéro   → ses co-exposants        (tout ce qui se réclame du stand sans en tenir le dossier)
```

Rien d'autre ne les relie. J'ai cherché un lien explicite : `cc_commanditaire_uid`
en avait l'air, il est sur les badges des personnes et désigne leur propre
société — **0 fiche société sur 576** le porte. Et chaque co-exposant a **son
propre dossier** : 574 dossiers pour 576 fiches, aucun partagé. Le dossier ne
rapproche donc jamais un hébergé de son hôte ; le numéro de stand, si.

Le champ de rattachement est réglable — cible `coexposant`, défaut `num_stand`,
c'est-à-dire le numéro lui-même. Un salon qui tiendrait le stand hôte dans un
champ à lui le désigne depuis la console ; « Aucun » retire les co-exposants du
plan.

Deux conséquences à connaître.

**Les deux index de `exposants()` renoncent séparément.** Ils renonçaient
ensemble, et c'était un piège : un co-exposant rencontré avant son hôte prenait
le numéro, l'hôte était alors écarté *des deux* index, son dossier ne désignait
plus personne, et le stand se retrouvait au nom de l'hébergé. Un dossier
n'appartenant qu'à une société, il a toujours sa place dans le sien. Rejoué sur
les 7 086 fiches de FEP 2026 : **460 stands sur 460 au nom du bon titulaire**, et
**106 co-exposants publiés** là où aucun ne survivait. Les treize qui manquent à
l'appel des 119 sont seuls sur leur numéro — des pavillons collectifs, où ils
sont titulaires de plein droit.

**Le numéro interrogé est celui du titulaire, pas celui du plan.** Les deux se
ressemblent sans se confondre : Klipso numérote « T44 » et « U43 » séparément là
où Eventmaker saisit « T44 - U43 » pour l'ensemble, et c'est cette écriture-là
que les hébergés recopient. **31 des 47 stands partagés de FEP 2026 portent un
numéro composé** — dont les plus grands, celui d'Hippopotamus et ses dix
enseignes, celui de Carrefour et ses cinq. Chercher les hébergés sous le code du
plan n'y trouvait rien, et comme le titulaire, lui, était bien retrouvé par son
dossier, le stand paraissait normal : simplement sans personne. Trente-six
sociétés sur cent six paraissaient. On part donc du numéro que porte la fiche du
titulaire, et le code du plan ne sert que de repli, quand c'est par lui qu'on
l'a trouvé.

**La page ne dit pas qui loue et qui est hébergé.** Cela relève du contrat
entre l'organisateur et ses exposants ; un visiteur cherche une enseigne, pas sa
place dans un bail. La fenêtre de choix ne liste donc que des noms, celui du
titulaire en tête — ce qui le dit assez pour qui veut le savoir.

**La recherche les voit pour eux-mêmes.** Chaque société hébergée a son rang
dans les résultats — « Burger King · T150 » — et l'ouvrir mène droit à sa
fiche. Un clic sur la forme du stand, lui, demande d'abord qui l'on
vient voir : on y a désigné un emplacement, pas un nom. Le plan garde le stand
allumé quand on cherche un hébergé, tout en portant le nom de son titulaire :
c'est le seul endroit où une enseigne répond pour une autre, et il le faut bien,
c'est là qu'on va. Hors recherche, la liste reste le sommaire des emplacements
du pavillon, pour que son compte soit celui qu'annonce l'en-tête.

Sur le plan, le stand garde en toutes circonstances le nom de son titulaire —
c'est lui qui loue l'emplacement, et c'est ce nom-là qui est peint sur la
cloison — et porte à côté de son numéro une pastille « +2 » qui dit combien
d'enseignes l'accompagnent. Le nombre est celui des hébergés, pas le total :
c'est ce que « + » veut dire partout ailleurs. La pastille pousse le numéro vers
la gauche pour que le couple reste centré, et s'efface quand la largeur du stand
ne la porte pas — une pastille débordant sur la cloison désignerait le voisin.

**Le programme reste au titulaire.** Le graphe rattache une conférence par le
dossier de qui la tient, et le dossier d'un co-exposant ne correspond à aucun
stand : la synchronisation ne sait pas lui attribuer de conférence, et la fiche
n'en invente pas.

Ce raisonnement vaut pour **un plan Klipso et des exposants Eventmaker**, et
pour cette combinaison seule : c'est elle qui met le dossier des deux côtés.

## Les thématiques d'un exposant

Elles n'ont pas de champ à elles : comme la nomenclature, ce sont des champs
personnalisés que l'organisateur nomme, et il en nomme rarement deux pareil.
Relevé sur trois salons du compte :

| salon | ce qui range ses exposants |
|---|---|
| Franchise Expo Paris 2026 | `rubriques2`, `rubriques`, `categories` |
| SIDO & Lyon Cyber Expo | `nomenclatures`, `domaines_d_application`, `champs_d_intervention`, `mots_cles` |
| Open Source Experience 2026 | `champs_d_intervention`, `expertises` |

La cible `thematiques` de la correspondance est donc réglable comme les autres,
mais c'est la seule cible d'affichage **sans champ par défaut** : un défaut
deviné signalerait en rouge « champ habituel introuvable » sur tous les salons
qui n'en tiennent pas, c'est-à-dire la plupart. À l'exploitant de désigner le
sien depuis la console — *Fiche détail*, onglet *Stand* ; la
liste des champs relevés lui montre un exemple de valeur pour chacun, et c'est
lui qui décide, car les noms ne suffisent pas : `champs_d_intervention` et
`domaines_d_application` ne se distinguent que par ce qu'ils contiennent.

Cet exemple sert aussi à éviter un piège. Un salon qui reprend la codification
Klipso ne descend que des codes — `OSXPDEV26C12`, `SIDO26_NOM101` — quand un
autre descend des libellés lisibles, « Solutions transverses ». Rien ne les
résout de ce côté : la codification se lit chez Klipso, avec le nom du champ
Klipso, que la fiche Eventmaker ne porte pas. Le champ à désigner est donc celui
dont l'exemple se lit.

**Un champ à choix multiple ne descend pas en liste.** Eventmaker joint ses
valeurs par un point-virgule — `SIDO26_NOM101;SIDO26_NOM102;SIDO26_NOM204` — là
où Klipso rend un tableau. Sans les séparer, la fiche afficherait la ligne
entière comme une seule rubrique ; c'est ce que faisait la nomenclature sur les
salons qui la tiennent ainsi.

Le graphe ne sert à rien ici : `publicViewer` ne porte que le programme, et ni
`exhibitors` ni `themes` n'existent à sa racine. Tout se lit en REST, sur la
fiche d'invité, avec les champs qu'on lisait déjà.

## Deux pièges

`/exhibitors.json` **ignore `page` et `per_page`** : il rend ses 613 fiches à
chaque appel. Une boucle de pagination qui n'attend qu'une page courte y tourne
sans fin. `toutesPages()` s'arrête donc aussi quand une page rend ce que la
précédente rendait déjà.

Chercher le nom d'un exposant dans l'intitulé d'une session **ne remplace pas le
graphe**, et c'est mesuré : 72 sessions nomment un exposant, contre 70 rattachées
exactement. Les chiffres se ressemblent, les listes non — une enseigne citée
n'anime pas forcément, « Boulangerie : vers une premiumisation » n'est qu'un
BOULANGER pris dans un mot, et « en 2026 » a la forme d'un numéro de stand sans
en être un.

# Les rendez-vous d'un visiteur

Le plan sait maintenant reprendre les rendez-vous qu'un visiteur a pris avec des
exposants depuis l'application du salon, et en faire des points fixes de sa
journée. Ce qui suit dit ce qui a été **établi**, ce qui a été **supposé**, et
comment vérifier le second.

## Où ils vivent

Dans le même graphe que le programme, mais sous `viewer` — la vue connectée —
et non `publicViewer`. L'introspection y est fermée comme ailleurs ; les champs
se sont relevés par les messages d'erreur, qui nomment le type et proposent le
nom voisin.

```graphql
viewer {                       # type ViewerGuest — pas d'argument, le jeton dit qui
  meetings {                   # type Meeting
    id
    startDate                  # ISO, avec décalage — pas d'équivalent « heure locale »
    endDate
    status
    location { name }          # type MeetingLocation — « Table 12 », un libellé, pas une zone
    exhibitors { id name companyName }        # type ProgramExhibitor
    participantResponses { guestId … }        # type MeetingParticipantResponse
  }
}
```

**Le point qui fait tout tenir : `Meeting.exhibitors` est du type
`ProgramExhibitor`**, exactement celui que portent les sessions du programme. Le
rattachement au plan emprunte donc la chaîne déjà éprouvée, sans rien inventer :

```
fiche d'invité (id du graphe) → REST /guests/:id → id_dossier → stand du plan
```

`_partage/eventmaker.ts` porte `rendezVous(jetonVisiteur, idEvenement)`, et la
lecture des dossiers est désormais partagée avec `exposantsParConference()` sous
`dossiersDeFiches()` — c'était deux fois le même code.

## Ce qui manquait pour les situer

La résolution dossier → stand n'existait que **pendant** la synchronisation,
qui tient les deux côtés à la fois. Les conférences s'en accommodaient : elles y
sont résolues une fois pour toutes, et la charge publique ne porte plus que des
stands. Un rendez-vous, lui, se lit à la demande — il appartient à quelqu'un, il
change entre deux synchronisations.

La correspondance est donc conservée : `evenement.dossiers`, écrite par la
synchronisation, lue par la fonction `rdv`. Elle **ne descend pas** dans la
charge publique — ce sont des identifiants de dossiers commerciaux, que personne
n'a à recevoir pour regarder un plan. La synchronisation d'un seul pavillon la
complète au lieu de la remplacer, sans quoi les autres perdraient la leur.

## Deux jetons, à ne pas confondre

| jeton | d'où il vient | ce qu'il ouvre |
|---|---|---|
| celui du visiteur | l'application du salon, ou l'écran de connexion | `viewer` — ses rendez-vous, et rien d'autre |
| celui de l'organisateur | les secrets de la fonction | les fiches d'invités en REST, pour en tirer les dossiers |

Le premier ne transite qu'en en-tête `X-Jeton-Eventmaker`, jamais par
`Authorization` — cette place est prise par la passerelle Supabase, et y glisser
un jeton Eventmaker ferait refuser l'appel avant qu'il n'arrive. Il n'est ni
écrit, ni journalisé, ni mis en cache, à aucun étage.

Le second ne quitte pas le serveur, et c'est la raison d'être de la fonction :
sans elle, la page pourrait interroger le graphe elle-même — il est joignable
depuis un navigateur — mais ne saurait traduire une fiche Eventmaker en stand.

## Ce qui reste à vérifier sur un salon réel

**`viewer` refuse tout net sans identité** — `{"errors":[{"message":
"Unauthorized access"}]}` — et c'est le seul fait établi de ce côté. Ce qui n'a
**pas** pu l'être, faute d'un compte de test : qu'un jeton obtenu par
l'application OAuth documentée suffise à l'ouvrir. Eventmaker pourrait n'y
accepter qu'une session faite sur son propre site, ou exiger un périmètre que le
seul `public` disponible ne couvre pas.

C'est le seul vrai risque de la fonctionnalité, et il se lève en une commande,
avec un jeton de visiteur d'essai sur un salon qui a des rendez-vous :

```bash
curl -s https://app.eventmaker.io/api/graphql \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <jeton du visiteur>' \
  -d '{"query":"{ viewer { meetings { id startDate status exhibitors { id companyName } } } }"}'
```

Une liste en retour, et tout le reste tient. Un `Unauthorized access`, et il
faudra demander à Eventmaker par quel chemin le graphe connecté s'ouvre — le
reste du montage, lui, ne changerait pas : seule la façon d'obtenir le jeton
serait à revoir, et elle est isolée dans un seul module de chaque côté.
