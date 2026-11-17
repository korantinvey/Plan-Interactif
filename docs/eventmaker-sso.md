# Eventmaker : identifier un visiteur, retrouver ses rendez-vous et ce qu'il cherche

Le plan sait dresser un parcours de visite, et le garder dans le navigateur ;
il ne savait pas dire *« vous avez rendez-vous à 14 h 30 sur le stand F48 »*.
La réponse tient en deux phrases, et elles ne tombent pas du même côté.

**Les rendez-vous existent, et ils sont bien rattachés à un exposant** — dans le
graphe, sous `viewer`, la vue connectée dont `eventmaker.md` disait qu'on n'avait
pas besoin. On en a besoin maintenant, et le type qu'il rend au bout est
exactement celui que la synchronisation sait déjà poser sur un stand.

**Identifier le visiteur, en revanche, passe par un SSO qu'un administrateur
Eventmaker seul peut ouvrir.** Deux portes verrouillées, pas une : activer le
SSO du compte, puis enregistrer l'application. Rien ne s'essaie de bout en bout
sans elles, et ce document dit précisément ce qui reste à vérifier le jour où
elles s'ouvrent.

Ce qui suit est relevé sur l'API publique, en lecture seule, et daté de
septembre 2026.

**Repris en novembre 2026, par l'autre bout.** Les deux portes sont toujours
fermées, et le plan vit désormais dans l'application Eventmaker du salon, où le
visiteur est déjà connecté. Lui redemander qui il est serait absurde : c'est
l'application qui le sait, et c'est d'elle que le plan doit l'apprendre. Le
chemin « par la page hôte », gardé ici en réserve, devient le chemin de
l'application — « Le plan dans l'application Eventmaker », plus bas. Il sert
deux usages : les rendez-vous, et **les réponses que le visiteur a données en
s'inscrivant**, pour mettre en avant les exposants qui répondent à ce qu'il a
dit chercher.

## Ce que le SSO documenté donne

C'est la seule partie qui soit écrite noir sur blanc, dans
`developers.eventmaker.io/configuration/creating-an-oauth-app`. C'est un OAuth 2
en marque blanche : le compte Eventmaker devient le fournisseur d'identité, sur
un domaine à l'organisateur et à ses couleurs.

```
GET  https://<domaine-sso>/oauth/authorize    client_id, redirect_uri,
                                              response_type=code, scope=public,
                                              state, locale
POST https://<domaine-sso>/oauth/token        client_id, client_secret, code,
                                              redirect_uri, code_verifier,
                                              grant_type=authorization_code
  → { access_token, token_type: "Bearer", expires_in: 7200, scope: "public" }
GET  https://<domaine-sso>/api/v1/me.json     Authorization: Bearer <access_token>
GET  https://<domaine-sso>/contacts/sign_out  redirect_uri
```

Quatre choses à en retenir, qui pèsent toutes sur le montage.

**Le secret interdit le navigateur.** L'échange du code contre un jeton porte
`client_secret` : il se fait sur le serveur, dans une fonction Supabase, jamais
dans une page. C'est la même règle que pour la clé Klipso, pour la même raison.

**Le jeton vit deux heures.** De quoi tenir une visite, pas un salon. Une page
rouverte le lendemain redemande, ou se passe des rendez-vous.

**`public` est le seul périmètre offert.** Il n'y a donc rien à négocier ni à
restreindre : on prend ce qu'il donne, ou rien.

**`/api/v1/me` rend la fiche du contact** — courriel, nom, et les champs définis
dans Eventmaker. La documentation ne lui prête aucun rendez-vous, et le reste de
l'API REST n'en connaît pas davantage : `eventmaker.md` a déjà établi que ses
six ressources documentées ignorent jusqu'aux sessions. Chercher les rendez-vous
de ce côté n'a pas de sens.

**Les deux portes.** « This part is not accessible yet and must be configured by
an Eventmaker admin » pour l'activation du SSO ; « This step is also only
available to Eventmaker admins for now, so please contact us » pour
l'enregistrement de l'application. Sans `client_id` ni `client_secret`, aucune
des vérifications listées plus bas ne peut être faite.

## Le graphe connecté

Le reste n'est pas documenté et se relève sur le schéma. Le procédé est celui
d'`eventmaker.md`, et il tient à une propriété de GraphQL : **une requête est
validée contre le schéma avant d'être exécutée**. Un champ qui n'existe pas
échoue à la validation et le message le nomme ; un champ qui existe mais demande
une autorisation échoue *à l'exécution*, et répond « Unauthorized access ». La
seconde erreur est donc une confirmation. L'introspection, elle, est fermée —
« Not authorized to access schema » — mais les messages sont bavards et
proposent volontiers « Did you mean `…` ».

Tout ce qui suit est relevé ainsi, sans jeton, sans événement valide, et sans
rien écrire : le sondage ne porte que sur des lectures, et la fonctionnalité
visée ne fera jamais que lire.

### Comment on s'y authentifie

Le front d'Eventmaker le dit mieux que n'importe quelle documentation. Son
client Apollo, servi par `assets.eventmaker.io`, tient en trois lignes :

```js
`/api/graphql?locale=${I18n.locale}` + (event_id ? `&event_id=${event_id}` : "")
headers: { authorization: `Bearer ${guestApiToken}` }
```

**L'événement passe en paramètre d'adresse, non en argument GraphQL.** C'est
l'explication du détail qui intrigue au premier sondage : `viewer` n'accepte
aucun argument, pas même `eventId`, là où `publicViewer` l'exige. Les deux
champs ne se renseignent pas au même endroit.

**Le justificatif est un `guestApiToken`**, propre à l'invité, que le site
d'événement dépose dans sa page :

```html
window.eventmaker = { guestApiToken: "", locale: "fr", … }
```

Vide chez un visiteur anonyme — c'est ce qu'on lit sur un site ouvert. Rempli
chez un invité connecté. Il n'apparaît dans aucune ressource REST documentée :
c'est une clé que le visiteur détient, non une clé que l'organisateur distribue.

Un dernier détail du même bundle : le front choisit `viewer` ou
`unregisteredViewer` selon que le statut de l'invité vaut `registered` ou non.
Les deux racines existent et portent la même forme. Un salon où l'on prend
rendez-vous sans être inscrit se lit donc par la seconde.

### Ce que le schéma porte

```
Query.viewer               : ViewerGuest      (aucun argument)
Query.unregisteredViewer   : ViewerGuest      (idem, invité non inscrit)
Query.publicViewer(eventId:): PublicViewer    (déjà utilisé : le programme)
```

| `ViewerGuest` | |
|---|---|
| `id` `uid` `name` `email` `companyName` `position` `avatarUrl` | qui est le visiteur |
| `meetings` | ses rendez-vous → `Meeting` |
| `guestCalendar` | son agenda → `GuestCalendar` |
| `program` `event` | le programme et l'événement |
| `guestStats(statsField:)` | ses compteurs |

| `Meeting` | |
|---|---|
| `id` `status` `name` `description` `format` | l'identité du rendez-vous |
| `startDate` `endDate` | quand |
| `location { id name }` | où, selon Eventmaker — un libellé, pas un stand |
| **`exhibitors`** | **avec qui → `ProgramExhibitor`** |
| `participantResponses { guestId }` | qui a répondu quoi |

`format` sépare le rendez-vous physique du rendez-vous en visio — les compteurs
du front distinguent `PHYSICAL_MEETINGS` de `LIVE_MEETINGS`, et seul le premier
a quelque chose à faire sur un plan.

## Le détail qui décide de tout

`Meeting.exhibitors` rend un **`ProgramExhibitor`** : très exactement le type
que `rolesParConference()` lit déjà sous chaque session du programme public. La
chaîne qui mène au stand est donc déjà écrite, déjà mesurée, et n'a pas à être
réinventée :

```
Meeting.exhibitors[].id                     identifiant de fiche d'invité
  → GET /guests/{id}.json?guest_metadata=true
  → id_dossier                              le GUID que Klipso porte aussi
  → le stand du plan                        par l'index « dossier » d'exposants()
```

C'est l'appariement par dossier que `eventmaker.md` défend longuement, et pour
les mêmes raisons : le numéro de stand est saisi à la main, se compose parfois
de deux emplacements, et ne se prête pas au recoupement. Sur Franchise Expo
Paris 2026, les 101 citations d'exposants du programme portaient toutes un
dossier au format attendu, et les 55 personnes citées comme exposantes se sont
résolues 55 fois sur 55.

Rien ne dit que le remplissage sera aussi bon sur les rendez-vous — c'est un
autre champ, rempli par un autre geste — mais le chemin, lui, est le même, et
son taux se mesurera d'un appel le jour où un jeton existe.

## L'agenda, et pourquoi il ne suffit pas

`viewer.guestCalendar` est la liste unifiée que le front utilise pour signaler
les chevauchements d'horaire. Elle mêle sessions et rendez-vous :

```graphql
query GuestCalendar {
  viewer {
    guestCalendar {
      events { name startDate endDate from role type accesspointId
               location description color }
    }
  }
}
```

Cette requête-là est celle du front, recopiée telle quelle, et elle valide
intégralement contre le schéma : tous ses champs existent.

Elle est pourtant insuffisante à elle seule, et c'est le piège de ce chemin :
**un rang d'agenda ne porte ni identifiant de rendez-vous, ni lien vers un
exposant**. `GuestCalendarEvent` s'arrête aux dix champs ci-dessus — pas de
`id`, pas de `meetingId`, pas de `exhibitors` —, et son seul rattachement,
`accesspointId`, désigne une session. L'agenda dit donc qu'il y a rendez-vous, à
quelle heure, et sous quel nom ; il ne dit pas avec qui, et ne saurait mener à
un stand.

Les deux se complètent, et chacun a son emploi :

| | ce qu'il donne | ce qu'il sert |
|---|---|---|
| `meetings` | l'exposant, donc le stand | poser le rendez-vous sur le plan |
| `guestCalendar` | l'ordre, sessions comprises | ranger la journée, voir les chevauchements |

Commencer par `meetings` seul : c'est lui qui porte la fonctionnalité demandée,
et l'agenda ne devient utile qu'une fois la journée organisée en jeu.

## Le jeton : deux chemins, et ce qui les sépare

C'est là que le montage se décide, et le dépôt n'est pas dans la position la
plus confortable : **le plan est servi depuis Cloudflare, sur une autre origine
que le domaine du salon.** Le `guestApiToken` vit dans la page d'Eventmaker, et
aucun cookie ne traverse. Deux chemins, donc, et ils ne coûtent pas la même
chose.

**Le SSO OAuth, côté serveur.** Le chemin documenté, et le seul qui marche
partout — QR code, borne, application installée, plan ouvert directement. Le
plan renvoie vers `/oauth/authorize`, la fonction Supabase échange le code
contre un jeton, interroge le graphe, et ne rend à la page que ce dont elle a
besoin. Il demande les deux portes admin, et un domaine SSO à régler par salon
dans la console.

**Le jeton passé par la page hôte.** Si l'organisateur encadre le plan dans son
propre site Eventmaker, sa page détient déjà le `guestApiToken` et peut le
transmettre par `postMessage`. Aucune application OAuth à enregistrer. Mais cela
ne vaut que dans ce cadre-là — le plan ouvert depuis un QR code du hall n'y a
pas droit —, et cela revient à confier à une page un justificatif qui ouvre
l'identité, le courriel et les rendez-vous du visiteur. À ne retenir que si un
salon le demande, et jamais comme chemin par défaut.

Le premier reste le bon pour tout ce qui n'est pas l'application — le QR code
du hall, la borne, le plan ouvert seul. Le second est celui de l'application,
où le plan n'est justement pas ouvert seul : c'est la section suivante.

## Le plan dans l'application Eventmaker

### Ce qui change, et ce qui ne change pas

Dans l'application, le visiteur s'est identifié une fois, chez Eventmaker, et
l'application en garde la preuve. Le plan n'a pas à la refaire : il a à
**l'emprunter**, le temps de lire ce qui le concerne. Ce n'est pas un SSO, et
ce n'en est pas un succédané : aucune identité ne s'établit chez nous, aucun
compte ne se crée, et le plan ne sait du visiteur que ce qu'une lecture lui a
rendu, pour la durée de la page.

Les réserves d'au-dessus tiennent toujours — confier à une page un justificatif
qui ouvre l'identité, le courriel et les rendez-vous —, et le montage qui suit
est fait pour elles : le jeton ne traverse qu'après le oui du visiteur, ne
touche jamais le stockage, et ne quitte la page que vers notre propre fonction.

### Trois façons d'être chargé, trois façons de recevoir

Tout dépend de la façon dont l'application affiche le plan, et c'est **la
première chose à établir** — rien de ce qui suit ne s'écrit avant :

| l'application charge… | qui détient le jeton | comment il nous parvient |
|---|---|---|
| une page de son site, qui encadre le plan | la page hôte, `window.eventmaker.guestApiToken` | `postMessage`, de la page hôte au cadre |
| notre adresse, dans une vue web nue | le code natif de l'application | un pont natif injecté, ou le fragment `#` de l'adresse |
| notre adresse, dans le navigateur du téléphone | personne | rien : le plan reste anonyme |

Le premier cas est le seul où le dépôt peut tout faire de son côté, pour peu
que la page hôte accepte quelques lignes de script de l'organisateur. Le
deuxième demande Eventmaker lui-même : une vue web nue n'a pas de page parente
à qui parler, et seul le code de l'application peut y déposer le jeton. Le
fragment est alors la moins mauvaise adresse — il n'atteint ni le serveur, ni
l'en-tête `Referer` —, mais il reste dans l'historique de la vue web : le plan
le lit au chargement et l'efface aussitôt (`history.replaceState`). La requête
d'adresse (`?jeton=`) est exclue : elle finirait dans les journaux de
Cloudflare, et dans ceux de quiconque relaie la page.

La sonde sait déjà dire où l'on est, à moitié : `INTEGRE`
(`modules/cadre-visible.mjs`) sépare le cadre de l'onglet, `support=appli`
la coque déclarée. Il lui manque l'origine du parent —
`location.ancestorOrigins`, que Chromium et WebKit exposent, et qui ne dit rien
du visiteur. Une seule semaine de relevé sur un salon présent dans
l'application tranche entre les trois lignes du tableau.

### Le protocole, dans le cas du cadre

Quatre messages, et l'ordre est le consentement :

```
plan → hôte    { type: "plan-interactif:pret", version: 1 }
                 le plan est monté et sait proposer ; il ne demande rien
plan → hôte    { type: "plan-interactif:demande" }
                 seulement après le « oui » du visiteur, dans la fenêtre
hôte → plan    { type: "plan-interactif:invite", jeton }
                 ou { type: "plan-interactif:anonyme" } — personne n'est connecté
plan → hôte    { type: "plan-interactif:oublie" }
                 le visiteur a retiré son accord ; l'hôte n'a plus à répondre
```

**Le jeton ne traverse qu'après le oui.** L'hôte ne l'envoie pas d'office au
chargement : un jeton reçu sans avoir été demandé serait un jeton détenu sans
consentement, et la page qui l'a reçu, même pour le jeter, l'a eu en main. Le
plan demande, l'hôte répond.

**Les origines sont inscrites, jamais devinées.** Chaque message part vers une
origine nommée — jamais `"*"` —, et chaque réponse n'est reçue que si
`event.origin` figure dans la liste du salon et que `event.source` est bien
`window.parent`. La liste se règle dans la console, colonne
`evenement.origines_hote`, publiée avec la configuration : le domaine du site
Eventmaker du salon, et rien d'autre. Un salon sans origine inscrite ne
propose rien.

**Le jeton ne vit qu'en mémoire.** Ni `localStorage`, ni `sessionStorage`, ni
cookie : le stockage d'un cadre tiers est cloisonné ou refusé (le README le
relève pour les mesures), et un jeton rangé survivrait à la page qui l'a
demandé. Il sert à un appel, puis la variable est vidée. La page rouverte
redemande à l'hôte — sans redemander au visiteur, dont le oui, lui, se garde
(`plan-rdv-invite:<slug>`).

**Une faille d'écriture HTML devient un vol de jeton.** Jusqu'ici, un script
injecté dans le plan pouvait défigurer la page ; avec un jeton en mémoire, il
pourrait l'emporter. C'est la raison de plus pour que `npm run html` ne laisse
rien passer, et pour que la politique de sécurité (`poseCsp`) garde
`connect-src` aussi étroit qu'il l'est : même lu, le jeton ne saurait partir
que vers nos propres fonctions.

### La fonction qui lit pour le plan

La page ne parle pas au graphe d'Eventmaker. Elle confie le jeton, en en-tête
et non dans l'adresse, à une fonction Supabase — `invite-eventmaker`, à créer
—, qui :

1. retrouve elle-même l'événement Eventmaker du salon, par son `slug` — elle ne
   croit jamais l'identifiant qu'une page lui donnerait ;
2. interroge `/api/graphql?event_id=…` avec le jeton, en une seule requête :
   les rendez-vous et les réponses d'inscription ;
3. résout chaque exposant en stand, par le dossier, comme `rolesParConference()` ;
4. applique la correspondance des réponses (section suivante) ;
5. rend **le strict nécessaire**, et l'oublie.

```json
{ "rendezVous": [ { "stand": "F48", "debut": "…", "fin": "…", "nom": "…" } ],
  "interets":   { "thematiques": ["Restauration rapide"], "secteurs": ["…"] } }
```

Ni nom, ni courriel, ni société : le plan n'en fait rien, il n'a pas à les
recevoir. Le prénom, si l'accueil le veut un jour, s'ajoutera en le décidant.

Passer par le serveur coûte un aller-retour, et rapporte trois choses : le
jeton ne touche aucune origine que la nôtre, la correspondance des réponses
s'applique là où les réponses brutes ne sortent pas, et l'appel au graphe se
fait depuis une adresse que l'on connaît, si Eventmaker doit un jour l'inscrire.

## Les réponses d'inscription

### Ce qu'on veut en faire

Un visiteur qui coche, en s'inscrivant, « Restauration rapide » et
« Services aux franchisés » a dit ce qu'il vient chercher avant d'avoir ouvert
le plan. La suggestion (`modules/suggestion.mjs`) attend aujourd'hui qu'il
retienne trois exposants du même critère pour le deviner ; ses réponses le lui
disent dès l'ouverture. **Mettre en avant**, c'est donc partir de ses réponses
là où la suggestion partait de son parcours :

- une rubrique « Pour vous » en tête de la liste, les exposants des valeurs
  qu'il a cochées ;
- leurs stands relevés sur le plan, comme ceux d'une recherche — et c'est déjà
  ce que fait un critère coché dans le panneau de la recherche ;
- la suggestion amorcée par ses intérêts, sans attendre le seuil.

Rien ne s'ajoute au parcours sans geste du visiteur : mettre en avant n'est pas
choisir à sa place.

### Où elles vivent chez Eventmaker

Ce sont des **champs de l'invité**, définis par l'organisateur dans son
formulaire : `/api/v1/me` rend « les champs définis dans Eventmaker », la
ressource REST des invités les porte sous `guest_metadata`. Sous `viewer`, dans
le graphe, **le champ qui les porte n'est pas encore relevé** : le sondage de
novembre n'a pas pu se faire, le réseau de la session refusant
`app.eventmaker.io`. C'est la première vérification de la liste plus bas, et
elle se fait par le même procédé que le reste — une requête qui valide ou dont
le message suggère le bon nom.

### La correspondance, réglée par l'exploitant

Le vocabulaire n'est pas le même des deux côtés, et ne le sera jamais. Les
questions du formulaire sont écrites par l'organisateur chez Eventmaker
(« Quels secteurs vous intéressent ? ») ; les critères d'un exposant viennent de
Klipso — secteurs, thématiques, nomenclature (`modules/recherche.mjs`
`clesCriteres`). Aucun rapprochement automatique ne serait juste partout.

La console porte donc une **table de correspondance**, par salon, dans la
famille de celle des champs (`modules/correspondance.mjs`) :

| question Eventmaker | critère du plan | réponse → valeur(s) |
|---|---|---|
| Secteurs d'intérêt | `thematiques` | « Restauration » → « Restauration rapide », « Restauration à table » |
| Votre projet | — | *non lue* |

Les réponses dont le libellé est le même qu'une valeur se proposent d'elles-mêmes,
à confirmer ; les autres se rangent à la main. **Une question absente de la
table ne sort pas de la fonction** — c'est là que tient la minimisation, et
c'est pourquoi la table s'applique côté serveur : la page ne reçoit jamais que
des valeurs de critères, jamais les réponses elles-mêmes.

Un formulaire d'inscription demande parfois ce qui n'a rien à faire sur un plan
— régime alimentaire, handicap, budget, taille d'entreprise. La console ne
propose à la correspondance que les questions à choix ; les réponses libres ne
se lient pas, et rien ne s'en lit.

### Ce qu'on n'en apprend pas

Les intérêts du visiteur entrent dans la page ; ils n'en ressortent pas. Comme
pour la suggestion, le rapprochement se fait sur l'appareil, et la mesure ne
compte que ce qu'elle compte déjà : une fiche ouverte depuis « Pour vous » se
compte sous un canal à elle, sans dire pourquoi elle y figurait.

## Ce qui reste à vérifier

Rien de tout cela ne s'essaie sans identifiants. Le jour où ils existent, quatre
questions se règlent en quatre appels, et la première commande les autres.

1. **Le jeton OAuth ouvre-t-il le graphe ?** La documentation ne lui promet que
   `/api/v1/me`. Le front, lui, présente un `guestApiToken` sur `/api/graphql`.
   Rien ne dit que les deux se valent, et tout le montage « côté serveur » en
   dépend. À essayer d'abord : un `viewer { id }` avec le jeton OAuth.
2. **Faut-il `?event_id=` pour `viewer` ?** Le front le pose ; le champ n'en
   veut pas comme argument. Reste à savoir si l'événement se déduit du domaine
   quand le paramètre manque.
3. **Que valent `status` et `format` ?** Ce sont des énumérations dont les
   valeurs ne se lisent ni par introspection, ni par validation. Un rendez-vous
   annulé ou refusé n'a rien à faire dans un parcours, et c'est `status` qui le
   dira.
4. **Quelle part des rendez-vous porte un exposant ?** Le chemin vers le stand
   est sûr ; son remplissage ne se mesure que sur un vrai salon, comme les 70
   rattachements sur 178 sessions l'ont été.

Le chemin de l'application ajoute les siennes, qui ne demandent, elles, aucune
porte d'administrateur — sauf la deuxième :

5. **Comment l'application charge-t-elle le plan ?** Cadre dans une page de son
   site, vue web nue, ou navigateur du téléphone : le tableau d'au-dessus. Une
   semaine de sonde, `ancestorOrigins` ajouté, le dit.
6. **Qui peut y poser le script ?** Si c'est un cadre, la page hôte
   accepte-t-elle le code de l'organisateur ? Si c'est une vue web nue, il faut
   Eventmaker, et un pont natif.
7. **Le `guestApiToken` est-il rempli dans l'application**, ou seulement sur le
   site ouvert dans un navigateur ? L'application a sa propre session.
8. **Quel champ de `viewer` porte les réponses d'inscription**, et sous quelle
   forme — question, réponse, libellé ou code ? À relever par validation, depuis
   un réseau qui atteint `app.eventmaker.io`.
9. **Que vaut ce jeton, et combien de temps ?** Le jeton OAuth vit deux heures ;
   celui de l'invité, rien ne le dit. Et s'il ouvre aussi les mutations, le plan
   détient une clé qui écrit chez Eventmaker — raison de plus pour qu'il ne la
   garde qu'en mémoire.
10. **Qui en répond ?** L'organisateur reste responsable des données de ses
    invités ; lire leurs réponses pour leur compte fait du plan un
    sous-traitant, et l'accord passé avec chaque salon doit le dire avant le
    premier jeton reçu.

Une dernière chose, non vérifiée et qui n'a pas à l'être : **la racine
`Mutation` n'a pas été sondée.** La fonctionnalité lit des rendez-vous, elle
n'en crée ni n'en annule jamais — poser un rendez-vous reste l'affaire
d'Eventmaker, et le plan n'a pas à s'en mêler.

## Le montage retenu

### La fenêtre

Le visiteur reste anonyme par défaut, et le plan le lui demande avant tout :

> **Votre visite, à partir de votre inscription**
> Le plan peut lire vos rendez-vous et les centres d'intérêt indiqués à votre
> inscription, pour les poser sur le plan et vous signaler les exposants qui y
> répondent. Rien n'en est conservé.

Une seule question pour les deux usages : le visiteur ne consent pas à un
jeton, il consent à ce qu'on en lit, et l'un ne va pas sans l'autre dans la
même lecture. Dans l'application, il n'y a rien à dire de la contrepartie
« s'identifier mène chez Eventmaker » : il l'est déjà, et la fenêtre le dit
autrement — c'est l'application qui prête son identité, le plan qui lit.

C'est la même façon de faire que `fenetreRappel` dans `_rappels.html`, et pour
les mêmes raisons — le dépôt a déjà tranché cette question une fois, il n'y a
pas à la retrancher :

- **posée une fois par salon**, retenue sous `plan-rdv-invite:<slug>`, avec le
  drapeau de session qui double le stockage ;
- **fermée par n'importe quelle porte**, elle compte comme posée : la question a
  été vue, c'est tout ce qu'on voulait savoir ;
- **jamais pendant la visite guidée**, ni par-dessus une fenêtre déjà ouverte —
  `apresFermeture` la reprend, ses conditions relues ;
- **la contrepartie se dit avant la réponse**, comme au pied du tiroir des
  rappels : s'identifier mène chez Eventmaker, et le visiteur l'apprend avant de
  dire oui, non après.

Elle ne se propose évidemment que là où il y a quelque chose à proposer : un
salon dont le domaine SSO est réglé, ou — dans l'application — dont l'origine
hôte est inscrite, et dont les rendez-vous ou la correspondance des réponses
sont ouverts.

### Le casier

`PARCOURS` porte aujourd'hui `{ stands, confs }`. Les rendez-vous forment un
**troisième casier**, et ne se fondent pas dans les deux premiers — pour une
raison qui se voit à l'usage : `basculeParcours` retire ce qu'elle a mis, or un
rendez-vous ne nous appartient pas. La croix d'un rang de parcours l'effacerait
du plan sans l'effacer d'Eventmaker, et le visiteur croirait l'avoir annulé.

Un rendez-vous se retire donc de la vue, jamais de l'agenda, et le tiroir le dit
— c'est le seul rang du parcours qu'on n'a pas choisi soi-même.

### La journée

C'est l'endroit où cela tombe le mieux, et `_journee.html` l'avait écrit avant
d'en avoir l'usage : *« les conférences sont des rendez-vous qu'on ne déplace
pas, les stands se glissent entre elles »*. Un rendez-vous Eventmaker est
précisément cela — une heure fixe, un lieu — et rejoint les conférences comme
point d'ancrage, sans rien changer à l'algorithme.

Deux réserves. Un rendez-vous en visio n'a pas de place sur le plan : `format`
l'écarte. Et un rendez-vous dont l'exposant ne se résout à aucun stand garde son
heure et son nom, mais ne s'ancre nulle part — il tient l'horaire sans peser sur
le chemin.

### Ce qu'on ne garde pas

Les rendez-vous disent qui le visiteur est et qui il vient voir. C'est la donnée
la plus personnelle que le plan ait jamais approchée, et la mesure du plan tient
justement à ne rien laisser fuir sans consentement.

- **Le jeton ne se range nulle part.** Il sert le temps de l'échange, dans la
  fonction, et disparaît avec elle. Ni base, ni page, ni journal. Reçu de
  l'application, il passe par la page, mais en mémoire seulement, et n'en sort
  que vers la fonction.
- **Les réponses d'inscription ne sortent que traduites.** La fonction ne rend
  que des valeurs de critères, celles que la table de correspondance a liées ;
  une question que l'exploitant n'a pas liée ne quitte pas Eventmaker.
- **Les rendez-vous ne sont pas enregistrés côté serveur.** La fonction rend à
  la page ce qu'il lui faut — un stand, une heure, un libellé — et rien n'en
  reste. Le parcours vit dans le navigateur, comme le reste.
- **La mesure n'apprend rien de l'identité.** Un rendez-vous versé au parcours
  se compte comme un ajout par canal, à la façon de `verseAuParcours` ; le canal
  dit d'où vient le lot, jamais qui l'a apporté.
- **Le refus se respecte, et se garde.** Non veut dire non pour ce salon, et la
  question ne revient pas à chaque ouverture.
