---
paths:
  - "supabase/**"
---

# La base et les fonctions serveur

Ce que les revues de CodeRabbit ont trouvé côté Supabase (#531, #533, #535,
#542, #543). Chaque point s'éprouve dans `outils/essais/revue-droits.js` ou
`outils/essais/rls-salons.js` (PGlite).

- **Une fonction que seules les fonctions serveur appellent** est fermée à
  `anon` et `authenticated`, et ouverte explicitement à `service_role`
  (`revoke … from public, anon, authenticated; grant … to service_role`).
- **Aucune politique `using (true)` ouverte à `authenticated`** sur une table
  qui porte `evenement_id` : la lecture passe par `acces_salon(evenement_id)`.
  Une table de mesure nouvelle a déjà laissé un salon lire tous les autres.
- **Toute entrée publique est bornée** : horizon de date (un an au plus),
  plafond de lignes compté sur un index, taille en octets, sommes plafonnées —
  trois relevés suffisaient à faire échouer le bilan, et la purge de tous les
  salons avec lui.
- **Lire puis écrire sous concurrence** se fait sous un verrou pris avant la
  lecture et tenu jusqu'à l'écriture (`pg_advisory_xact_lock`, ou
  `select … for update`), comme `remplace_acces`. Une transaction ordinaire n'y
  suffit pas : deux administrateurs simultanés y lisaient la même liste et
  laissaient l'union des deux.
- **Ce qui est réservé à l'administrateur l'est dans la base** (déclencheur),
  pas seulement dans l'interface.
- **Une migration n'avale pas d'erreur** : si `pg_cron` refuse une tâche, elle
  échoue bruyamment plutôt que de passer sans rien programmer.
- **Fonctions** : une destination sortante se prend dans une liste fermée, sans
  suivre de redirection ; un jeton ne se recopie jamais dans un message
  d'erreur rangé en base ; une liste longue se lit par tranches, et son échec
  se dit.
