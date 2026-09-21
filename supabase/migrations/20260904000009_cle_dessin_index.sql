-- L'index partiel ne peut pas servir de cible de conflit
--
-- « create unique index … where cle is not null » exclut les lignes sans clé,
-- ce qui est logique, mais Postgres refuse alors « on conflict (plan_id, cle) »
-- : la clause d'un index partiel devrait être répétée dans l'ordre, et
-- PostgREST ne sait pas l'écrire. L'enregistrement échouait en 42P10.
--
-- Un index complet convient : deux lignes sans clé restent permises, Postgres
-- tenant chaque valeur nulle pour distincte des autres.

drop index if exists calque_dessin_plan_cle;

create unique index if not exists calque_dessin_plan_cle
  on calque_dessin (plan_id, cle);
