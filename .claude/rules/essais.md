---
paths:
  - "outils/essais/**"
---

# Un essai qui réussit pour la bonne raison

CodeRabbit a relevé plusieurs fois des essais qui passaient aussi sur le code
fautif (#533, #547, #556, #557).

- **Un essai de correction échoue sans elle.** Le vérifier avant de pousser, en
  retirant la correction, et le dire dans la pull request.
- **Se synchroniser sur le signal propre à ce qu'on éprouve**, jamais sur un
  effet voisin : la présence d'une autre entrée dans le cache ne prouve pas que
  le premier `waitUntil` a fini (#557).
- **Une attente longue ne masque pas le délai qu'on éprouve.** Attendre
  `GL.pret` jusqu'à 30 s laisse passer un repli censé tenir en 4 s (#556) :
  mesurer depuis l'événement, sans l'attente générique.
- **Un double qui acquitte tout n'éprouve pas une réparation.** Pour un échec
  partiel, provoquer l'échec et garder les écritures du double, puis vérifier
  l'état final (#547).
- **Mettre un accent dans les données** : un compte d'octets fait par
  `length` (unités UTF-16) ne se trahit qu'avec un caractère non ASCII (#557).
- **Ne pas régler un essai à l'horloge du poste** : la CI gèle le rendu jusqu'à
  deux secondes et laisse plus de 400 ms entre deux ordres de l'essai. Guetter
  avant d'agir, relever à l'appel plutôt qu'image par image, reconnaître une
  couche à sa propriété (`props.hausse`) plutôt qu'à son identifiant, et dire
  « scénario non exploitable » quand le préalable manque (#568).
