-- Les rappels ne s'oublient pas sur un programme tronqué
--
-- Pourquoi : `oublie_rappels_perimes` efface, après chaque synchronisation,
-- les rappels en attente que le programme dément — une conférence annulée, ou
-- décalée : partir à l'ancienne heure serait pire que ne rien envoyer. Il ne
-- s'en gardait que d'un programme vide. Or la source peut rendre un programme
-- tronqué sans erreur — une page de résultats qui manque —, et chaque
-- conférence absente passait alors pour annulée : ses rappels s'effaçaient,
-- et ne revenaient qu'à la réouverture du plan par chaque visiteur.
--
-- Le programme lu se compare donc à celui de la synchronisation d'avant : s'il
-- compte moins de la moitié de ses conférences, rien ne s'efface cette
-- fois-là. Le compte est retenu quand même — une vraie annulation en masse ne
-- retient les rappels que jusqu'à la synchronisation suivante, qui la confirme.
-- Le compte retenu vit sur l'événement (`conferences_vues`) ; il manque au
-- premier passage, qui efface comme avant.
--
-- Redéfinie à l'identique pour le reste (migration
-- `20260917004611_oublier_un_rappel_que_le_programme_a_dementi`) ; ses droits
-- (`20261112214003`) tiennent à travers `create or replace`.

alter table evenement add column if not exists conferences_vues integer;

comment on column evenement.conferences_vues is
  'Conférences distinctes du programme à la dernière synchronisation : un programme lu nettement plus court n''efface aucun rappel (oublie_rappels_perimes).';

create or replace function oublie_rappels_perimes(p_evenement uuid)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  n integer;
  vues integer;
  avant integer;
begin
  select count(distinct c->>'id')
    into vues
    from instantane i
    join plan p on p.id = i.plan_id
    cross join lateral
      jsonb_array_elements(case when jsonb_typeof(i.charge->'conferences') = 'array'
                                then i.charge->'conferences' else '[]'::jsonb end) c
   where p.evenement_id = p_evenement;

  /* La garde annoncée : sans programme, pas de démenti. Un événement qui n'en a
     jamais eu passe ici à chaque synchronisation, et ne doit rien effacer. */
  if coalesce(vues, 0) = 0 then
    return 0;
  end if;

  select conferences_vues into avant from evenement where id = p_evenement;
  update evenement set conferences_vues = vues where id = p_evenement;

  /* Moins de la moitié de ce qu'on voyait : une lecture tronquée plutôt
     qu'un programme vidé. On n'efface rien, et la synchronisation suivante,
     comparée à ce compte-ci, tranchera. */
  if avant is not null and vues * 2 < avant then
    raise notice 'Programme de % lu à % conférences au lieu de % : aucun rappel oublié.',
      p_evenement, vues, avant;
    return 0;
  end if;

  with programme as (
    select c->>'id' as conf, empreinte_debut(c) as heure
      from instantane i
      join plan p on p.id = i.plan_id
      cross join lateral
        jsonb_array_elements(coalesce(i.charge->'conferences', '[]'::jsonb)) c
     where p.evenement_id = p_evenement)
  delete from rappel_de_conference r
   where r.evenement = p_evenement
     and r.envoye_a is null
     and r.debut_vu is not null
     and not exists (select 1 from programme g
                      where g.conf = r.conference and g.heure = r.debut_vu);
  get diagnostics n = row_count;
  return n;
end;
$$;
