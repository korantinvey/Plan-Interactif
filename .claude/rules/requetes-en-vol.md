---
paths:
  - "outils/gabarit/modules/**"
  - "outils/gabarit/_sw.js"
  - "src/**"
---

# Ce qui change pendant qu'une requête attend

C'est la famille la plus relevée par CodeRabbit (#535, #536, #542, #543, #547) :
du code juste quand la réponse arrive seule et vite, faux dès qu'elle tarde,
échoue à moitié ou croise un autre geste.

- **Une écriture de l'écran vers la base passe par `modules/ecritures-en-file.mjs`**
  (`creeFileEcritures`), jamais par une file recodée à la main : six copies
  s'y étaient trompées chacune à sa façon. Seule la dernière réponse d'une clé
  remet l'écran à jour ; un refus revient à l'état confirmé, pas à l'inverse
  du clic ; l'état confirmé n'est jamais l'objet affiché.
- **Après chaque `await`, se demander ce qui a pu changer** : le compte, la
  session, le projet, le salon, le pavillon, le geste en cours. Une réponse
  dont le contexte a changé ne s'applique pas — une session renouvelée après
  une déconnexion la rétablissait (#542), un fond figé s'effaçait sur le
  pavillon d'à côté (#535), un relevé dépassé écrivait encore (#543).
- **Ce qui existe en plusieurs exemplaires n'est confirmé que par chacun.** Un
  réglage posé pavillon par pavillon : après un échec partiel, l'égalité avec
  la valeur agrégée ne prouve rien (#547). Un état « en vol » ne se vide
  qu'après le dernier contrôle qui peut encore lever.
- **Un succès suivi d'un échec secondaire ne se dit pas raté** : une copie
  créée dont seul le rechargement de la liste échoue est une copie créée (#543).
- **Un `catch` laisse l'état d'accord avec l'écran.** Ce qui se redessine sur
  `LANGUE_CHANGEE` doit redire l'échec, pas le dernier succès (#526).
- **Ce qui se prend se rend quelle que soit la sortie** (`finally`) : plan
  oublié, caméra rendue, image décodée relâchée (#543).

Avant de pousser, rejouer de tête : deux gestes rapides de suite ; un refus
après un succès ; deux refus de suite ; une déconnexion ou un changement de
compte pendant la requête ; un échec au milieu d'une boucle sur les pavillons ;
la page rechargée avant la réponse.
