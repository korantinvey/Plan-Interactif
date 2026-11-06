-- Funexpo 2026 : la conférence de Requiem Memory
--
-- Pourquoi : le site du salon ajoute à son programme une conférence du
-- mercredi 18 novembre à 10 h 30, que le programme recopié en octobre
-- (20261020224043) n’avait pas. Elle s’y ajoute telle que le site la donne,
-- sans heure de fin ; la salle est celle de toutes les autres conférences
-- datées, et l’anglais, que la page anglaise n’a pas encore, est traduit du
-- français.
--
-- La conférence ne s’ajoute que si son identifiant manque : rejouée, la
-- migration ne la doublerait pas. La prochaine synchronisation du salon la
-- porte au plan.

update evenement
set conferences_saisies = conferences_saisies || $conference$[
  {
    "id": "funexpo26-requiem-memory",
    "nom": "Retrouver une sépulture, réunir ce que l’on sait d’une personne, et le transmettre à ceux qui viendront après",
    "texte": null,
    "debut": "2026-11-18T10:30:00+01:00",
    "fin": null,
    "salle": "Salle de conférences",
    "type": "Conférence",
    "intervenants": [
      {
        "nom": "Christophe Houdart",
        "societe": "Requiem Memory",
        "fonction": "gérant"
      }
    ],
    "en": {
      "nom": "Finding a grave, gathering what is known about a person, and passing it on to those who come after",
      "salle": "Conference room",
      "type": "Conference"
    }
  }
]$conference$::jsonb
where slug = 'funexpo-2026'
  and not conferences_saisies @> '[{"id": "funexpo26-requiem-memory"}]'::jsonb;
