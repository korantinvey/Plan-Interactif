-- Les compteurs d'usage lus par jeton
--
-- Pourquoi : les relevés de la sonde disent si le plan a été rapide, pas si
-- les visiteurs y ont trouvé ce qu'ils cherchaient. Ce qui le dit —
-- recherches, fiches ouvertes, itinéraires, programmes de visite, visiteurs
-- uniques — vit dans les compteurs, que seul le rapport de la console lisait,
-- sous la session d'un exploitant. Analyser une journée de salon depuis une
-- session Claude Code demandait donc de recopier le rapport à la main.
--
-- `lecture_perf` apprend quatre lectures, sous le même jeton, les mêmes
-- bornes de dates, de limite et de pagination :
--
--   · `compteurs` — les lignes de `compteur` : l'heure, le geste, le canal, la
--     porte d'accès, le nombre. Le jour d'une heure se prend dans le fuseau du
--     salon, comme partout ailleurs.
--   · `audience` — les lignes de `compteur_cible`, avec le numéro et le nom du
--     stand ou de la conférence (`cible`), qui sont ceux du plan public.
--   · `visiteurs` — les visiteurs uniques de `visiteur_jour`, par jour et par
--     porte, par jour toutes portes confondues (`support` nul), et sur toute
--     la fenêtre (`jour` et `support` nuls). Chaque niveau est un décompte
--     exact de jetons distincts : un visiteur venu deux jours ne s'additionne
--     pas, ce que l'addition des lignes du jour ferait.
--   · `visiteurs_cible` — les visiteurs uniques par stand ou conférence et par
--     geste, de `visiteur_cible`, par jour et sur la fenêtre (`jour` nul).
--
-- Les jetons de visiteur ne sortent jamais : ces deux dernières lectures ne
-- rendent que des nombres. Un jeton ne désigne personne, mais il relierait
-- entre eux les gestes d'un même navigateur, et la lecture n'en a pas besoin.
-- Rien d'autre ne s'ouvre, et rien ne s'écrit.
--
-- Une remise à zéro (`reinitialise_compteurs`) efface les lignes : la lecture
-- la respecte sans rien en savoir.
--
-- La fonction est redéfinie en entier, à l'identique hors de ces branches :
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

  if p_quoi is null or p_quoi not in ('releves', 'bilans', 'jours', 'erreurs', 'salons',
                                      'compteurs', 'audience', 'visiteurs', 'visiteurs_cible') then
    raise exception 'lecture_perf : p_quoi doit valoir releves, bilans, jours, erreurs, salons, compteurs, audience, visiteurs ou visiteurs_cible (reçu : %)', p_quoi;
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
  elsif p_quoi = 'compteurs' then
    /* L'heure garde son instant : c'est elle qui permet de couper une fenêtre
       à midi. Le filtre, lui, se fait en jours du salon, comme les autres. */
    select coalesce(jsonb_agg(l.ligne order by l.heure, l.evenement_id, l.genre, l.canal, l.support), '[]'::jsonb)
      into v_rendu
      from (select c.heure, c.evenement_id, c.genre, c.canal, c.support,
                   jsonb_build_object('slug', e.slug, 'heure', c.heure, 'genre', c.genre,
                                      'canal', c.canal, 'support', c.support, 'n', c.n) as ligne
              from compteur c join evenement e on e.id = c.evenement_id
             where (c.heure at time zone coalesce(e.fuseau, 'Europe/Paris'))::date between v_de and v_a
               and (v_slug is null or e.slug = v_slug)
             order by c.heure, c.evenement_id, c.genre, c.canal, c.support
             limit v_limite offset v_decal) l;
  elsif p_quoi = 'audience' then
    select coalesce(jsonb_agg(l.ligne order by l.jour, l.evenement_id, l.objet, l.cible, l.genre, l.canal), '[]'::jsonb)
      into v_rendu
      from (select a.jour, a.evenement_id, a.objet, a.cible, a.genre, a.canal,
                   jsonb_build_object('slug', e.slug, 'jour', a.jour, 'objet', a.objet,
                                      'cible', a.cible, 'code', k.code, 'nom', k.nom,
                                      'genre', a.genre, 'canal', a.canal, 'n', a.n) as ligne
              from compteur_cible a
              join evenement e on e.id = a.evenement_id
              left join cible k on k.evenement_id = a.evenement_id
                               and k.genre = a.objet and k.id = a.cible
             where a.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
             order by a.jour, a.evenement_id, a.objet, a.cible, a.genre, a.canal
             limit v_limite offset v_decal) l;
  elsif p_quoi = 'visiteurs' then
    /* Trois niveaux, chacun en jetons distincts : un visiteur passé par deux
       portes, ou venu deux jours, n'y compte qu'une fois. Les nuls disent le
       niveau — `support` nul, tous supports ; `jour` nul, toute la fenêtre. */
    select coalesce(jsonb_agg(l.ligne order by l.slug, l.jour nulls first, l.support nulls first), '[]'::jsonb)
      into v_rendu
      from (select g.slug, g.jour, g.support,
                   jsonb_build_object('slug', g.slug, 'jour', g.jour, 'support', g.support,
                                      'visiteurs', g.visiteurs, 'volatils', g.volatils,
                                      'avec_parcours', g.avec_parcours) as ligne
              from (select e.slug, v.jour, v.support,
                           count(distinct v.visiteur) as visiteurs,
                           count(distinct v.visiteur) filter (where not v.retenu) as volatils,
                           count(distinct v.visiteur) filter (where v.parcours) as avec_parcours
                      from visiteur_jour v join evenement e on e.id = v.evenement_id
                     where v.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
                     group by grouping sets ((e.slug, v.jour, v.support), (e.slug, v.jour), (e.slug))) g
             order by g.slug, g.jour nulls first, g.support nulls first
             limit v_limite offset v_decal) l;
  elsif p_quoi = 'visiteurs_cible' then
    select coalesce(jsonb_agg(l.ligne order by l.slug, l.jour nulls first, l.objet, l.cible, l.genre), '[]'::jsonb)
      into v_rendu
      from (select g.slug, g.jour, g.objet, g.cible, g.genre,
                   jsonb_build_object('slug', g.slug, 'jour', g.jour, 'objet', g.objet,
                                      'cible', g.cible, 'code', k.code, 'nom', k.nom,
                                      'genre', g.genre, 'visiteurs', g.visiteurs) as ligne
              from (select e.id as evenement_id, e.slug, v.jour, v.objet, v.cible, v.genre,
                           count(distinct v.visiteur) as visiteurs
                      from visiteur_cible v join evenement e on e.id = v.evenement_id
                     where v.jour between v_de and v_a and (v_slug is null or e.slug = v_slug)
                     group by grouping sets ((e.id, e.slug, v.objet, v.cible, v.genre, v.jour),
                                             (e.id, e.slug, v.objet, v.cible, v.genre))) g
              left join cible k on k.evenement_id = g.evenement_id
                               and k.genre = g.objet and k.id = g.cible
             order by g.slug, g.jour nulls first, g.objet, g.cible, g.genre
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
  'Lecture seule, sur présentation d''un jeton de lecteur_perf : relevés, bilans, quotas et salons de la sonde de performance, erreurs des pages, et compteurs d''usage — fréquentation, audience par stand, visiteurs uniques en nombres, jamais en jetons.';

revoke all on function lecture_perf(text, text, date, date, text, integer, integer) from public;
grant execute on function lecture_perf(text, text, date, date, text, integer, integer) to anon, authenticated;
