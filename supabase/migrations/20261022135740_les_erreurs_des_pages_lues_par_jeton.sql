-- Les erreurs des pages lues par jeton
--
-- Pourquoi : les gels d'une démo se lisent dans les relevés de la sonde
-- (`lecture_perf`), mais une erreur JavaScript qui casse la page et force à
-- la recharger n'y laisse rien : elle va dans `erreur_page`, que seule la
-- console lisait, sous la session d'un exploitant. Analyser une séance depuis
-- une session Claude Code demandait donc de recopier le rapport à la main.
--
-- `lecture_perf` apprend `erreurs` : les lignes de `erreur_page` — message,
-- endroit du code, version, nombre, dernière occurrence — avec le slug du
-- salon. Rien d'autre ne s'ouvre : le même jeton, les mêmes bornes de dates,
-- de limite et de pagination, et la table ne dit rien du visiteur
-- (migration `les_erreurs_des_pages_du_plan`).
--
-- La fonction est redéfinie en entier, à l'identique hors de cette branche :
-- `create or replace` ne sait pas en ajouter une seule.
--
-- Rejouable : `create or replace`, et les droits redonnés à l'identique.

create or replace function lecture_perf(
  p_jeton    text,
  p_quoi     text,
  p_de       date    default null,
  p_a        date    default null,
  p_slug     text    default null,
  p_limite   integer default 1000,
  p_decalage integer default 0
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_a       date;
  v_de      date;
  v_limite  integer := least(greatest(coalesce(p_limite, 1000), 1), 2000);
  v_decal   integer := greatest(coalesce(p_decalage, 0), 0);
  v_slug    text := nullif(btrim(coalesce(p_slug, '')), '');
  v_rendu   jsonb;
begin
  -- le format se vérifie avant tout hachage : un jeton démesuré n'est pas haché
  if p_jeton is null or p_jeton !~ '^[0-9a-f]{64}$'
     or not exists (select 1 from lecteur_perf
                     where empreinte = encode(sha256(convert_to(p_jeton, 'UTF8')), 'hex')) then
    return null;
  end if;

  if p_quoi is null or p_quoi not in ('releves', 'bilans', 'jours', 'erreurs', 'salons') then
    raise exception 'lecture_perf : p_quoi doit valoir releves, bilans, jours, erreurs ou salons (reçu : %)', p_quoi;
  end if;

  -- `jour` est daté dans le fuseau du salon, `current_date` est en UTC : sans
  -- `p_a`, la fenêtre va jusqu'à demain pour ne pas perdre le jour d'un salon à l'est
  v_a  := coalesce(p_a, current_date + 1);
  v_de := greatest(coalesce(p_de, coalesce(p_a, current_date) - 6), v_a - 90);

  if p_quoi = 'releves' then
    select coalesce(jsonb_agg(l.ligne order by l.jour, l.recu, l.evenement_id, l.visite), '[]'::jsonb)
      into v_rendu
      from (select r.jour, r.recu, r.evenement_id, r.visite,
                   (to_jsonb(r) - 'evenement_id') || jsonb_build_object('slug', e.slug) as ligne
              from releve_perf r join evenement e on e.id = r.evenement_id
             where r.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
             order by r.jour, r.recu, r.evenement_id, r.visite
             limit v_limite offset v_decal) l;
  elsif p_quoi = 'bilans' then
    select coalesce(jsonb_agg(l.ligne order by l.jour, l.evenement_id, l.page, l.mobile), '[]'::jsonb)
      into v_rendu
      from (select b.jour, b.evenement_id, b.page, b.mobile,
                   (to_jsonb(b) - 'evenement_id') || jsonb_build_object('slug', e.slug) as ligne
              from perf_bilan b join evenement e on e.id = b.evenement_id
             where b.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
             order by b.jour, b.evenement_id, b.page, b.mobile
             limit v_limite offset v_decal) l;
  elsif p_quoi = 'jours' then
    select coalesce(jsonb_agg(l.ligne order by l.jour, l.evenement_id, l.page), '[]'::jsonb)
      into v_rendu
      from (select j.jour, j.evenement_id, j.page,
                   (to_jsonb(j) - 'evenement_id') || jsonb_build_object('slug', e.slug) as ligne
              from perf_jour j join evenement e on e.id = j.evenement_id
             where j.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
             order by j.jour, j.evenement_id, j.page
             limit v_limite offset v_decal) l;
  elsif p_quoi = 'erreurs' then
    -- `jour` est ici celui du serveur (`erreur_page`) : la même fenêtre suffit
    select coalesce(jsonb_agg(l.ligne order by l.jour, l.evenement_id, l.empreinte), '[]'::jsonb)
      into v_rendu
      from (select x.jour, x.evenement_id, x.empreinte,
                   (to_jsonb(x) - 'evenement_id') || jsonb_build_object('slug', e.slug) as ligne
              from erreur_page x join evenement e on e.id = x.evenement_id
             where x.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
             order by x.jour, x.evenement_id, x.empreinte
             limit v_limite offset v_decal) l;
  else
    select coalesce(jsonb_agg(l.ligne order by l.slug, l.id), '[]'::jsonb)
      into v_rendu
      from (select e.slug, e.id,
                   jsonb_build_object('id', e.id, 'slug', e.slug, 'nom', e.nom) as ligne
              from evenement e
             where v_slug is null or e.slug = v_slug
             order by e.slug, e.id
             limit v_limite offset v_decal) l;
  end if;

  return v_rendu;
end;
$$;

comment on function lecture_perf is
  'Lecture seule des relevés, bilans, quotas et salons de la sonde de performance, et des erreurs des pages, sur présentation d''un jeton de lecteur_perf.';

revoke all on function lecture_perf(text, text, date, date, text, integer, integer) from public;
grant execute on function lecture_perf(text, text, date, date, text, integer, integer) to anon, authenticated;
