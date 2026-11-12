# Eventmaker : identifier un visiteur, et retrouver ses rendez-vous

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

Le premier est le bon. Le second est ce qu'on essaiera si les portes tardent à
s'ouvrir, en le disant.

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

Une dernière chose, non vérifiée et qui n'a pas à l'être : **la racine
`Mutation` n'a pas été sondée.** La fonctionnalité lit des rendez-vous, elle
n'en crée ni n'en annule jamais — poser un rendez-vous reste l'affaire
d'Eventmaker, et le plan n'a pas à s'en mêler.

## Le montage retenu

### La fenêtre

Le visiteur reste anonyme par défaut, et le plan le lui demande avant tout :

> **Vos rendez-vous**
> Souhaitez-vous ajouter vos rendez-vous à votre parcours de visite ?

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
salon dont le domaine SSO est réglé, et dont les rendez-vous sont ouverts.

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
  fonction, et disparaît avec elle. Ni base, ni page, ni journal.
- **Les rendez-vous ne sont pas enregistrés côté serveur.** La fonction rend à
  la page ce qu'il lui faut — un stand, une heure, un libellé — et rien n'en
  reste. Le parcours vit dans le navigateur, comme le reste.
- **La mesure n'apprend rien de l'identité.** Un rendez-vous versé au parcours
  se compte comme un ajout par canal, à la façon de `verseAuParcours` ; le canal
  dit d'où vient le lot, jamais qui l'a apporté.
- **Le refus se respecte, et se garde.** Non veut dire non pour ce salon, et la
  question ne revient pas à chaque ouverture.
