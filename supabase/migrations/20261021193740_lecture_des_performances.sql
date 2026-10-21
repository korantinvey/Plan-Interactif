-- Lecture des performances par HTTPS
--
-- Pourquoi : analyser les relevés de la sonde de performance depuis une session
-- Claude Code. Son conteneur ne joint Supabase que par HTTPS, avec la clé
-- publiable : pas de connexion Postgres directe, et les politiques de lecture
-- des relevés exigent un compte d'exploitant, qu'on ne veut pas lui confier.
--
-- Une seule porte, `lecture_perf`, ouverte à la clé publiable mais qui ne répond
-- qu'à qui présente un jeton. Ce jeton, l'exploitant le crée lui-même dans
-- l'éditeur SQL (`select lecteur_perf_nouveau('claude');`) : seul le propriétaire
-- de la base peut en émettre ou en retirer, aucun rôle de l'API ne le peut.
--
-- La base ne garde que l'empreinte sha256 du jeton, jamais le jeton : lire
-- `lecteur_perf` ne permet donc pas de se faire passer pour le lecteur. Le jeton
-- n'est montré qu'une fois, à sa création.
--
-- Rien n'est écrit par la lecture, et elle ne touche que les relevés, les
-- bilans, les quotas et la liste des salons (id, slug, nom) : ni compte, ni
-- configuration, ni programme. Elle se révoque d'un mot
-- (`select lecteur_perf_retire('claude');`), et un jeton de même nom en
-- remplace un autre : refaire le jeton invalide l'ancien.
--
-- Rejouable : tout est `if not exists` ou `create or replace`.

create table if not exists lecteur_perf (
  -- sha256 du jeton, en hexadécimal
  empreinte text primary key,
  nom       text not null unique,
  cree      timestamptz not null default now()
);

comment on table lecteur_perf is
  'Les jetons de lecture des performances, par empreinte sha256 : le jeton lui-même n''est jamais gardé.';

alter table lecteur_perf enable row level security;
-- aucune politique : personne ne lit cette table par l'API
revoke all on lecteur_perf from public, anon, authenticated;

/* Émet un jeton de 244 bits (deux UUID aléatoires sans tirets), remplace celui
   du même nom, et le rend — c'est la seule fois qu'il se voit. */
create or replace function lecteur_perf_nouveau(p_nom text) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_jeton text;
begin
  if p_nom is null or btrim(p_nom) = '' then
    raise exception 'lecteur_perf_nouveau : un nom est requis';
  end if;
  v_jeton := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
  delete from lecteur_perf where nom = p_nom;
  insert into lecteur_perf (empreinte, nom)
  values (encode(sha256(convert_to(v_jeton, 'UTF8')), 'hex'), p_nom);
  return v_jeton;
end;
$$;

comment on function lecteur_perf_nouveau is
  'Propriétaire seul : crée (ou remplace) le jeton de lecture des performances de ce nom et le rend, une unique fois.';

revoke all on function lecteur_perf_nouveau(text) from public, anon, authenticated;

create or replace function lecteur_perf_retire(p_nom text) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lignes integer;
begin
  delete from lecteur_perf where nom = p_nom;
  get diagnostics v_lignes = row_count;
  return v_lignes > 0;
end;
$$;

comment on function lecteur_perf_retire is
  'Propriétaire seul : révoque le jeton de lecture de ce nom. Rend faux s''il n''existait pas.';

revoke all on function lecteur_perf_retire(text) from public, anon, authenticated;

/* La porte de lecture. Sans jeton valable, `null` et rien d'autre : elle ne dit
   pas si le jeton était court, faux ou révoqué.

   Les dates : `jour` entre `p_de` et `p_a`, par défaut les sept derniers jours
   (aujourd'hui compris). L'écart est borné à 90 jours — au-delà, `p_de` remonte
   à `p_a` moins 90 jours — pour qu'une requête reste une lecture, pas une
   copie de la base. La limite est bornée à 2000 lignes par appel : au-delà, on
   pagine par `p_decalage`. Le tri est total (jour, puis clés de la table), pour
   que deux pages se suivent sans trou ni doublon. */
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
set search_path = public
as $$
declare
  v_a       date;
  v_de      date;
  v_limite  integer := least(greatest(coalesce(p_limite, 1000), 1), 2000);
  v_decal   integer := greatest(coalesce(p_decalage, 0), 0);
  v_slug    text := nullif(btrim(coalesce(p_slug, '')), '');
  v_rendu   jsonb;
begin
  if p_jeton is null or length(p_jeton) < 32
     or not exists (select 1 from lecteur_perf
                     where empreinte = encode(sha256(convert_to(p_jeton, 'UTF8')), 'hex')) then
    return null;
  end if;

  if p_quoi is null or p_quoi not in ('releves', 'bilans', 'jours', 'salons') then
    raise exception 'lecture_perf : p_quoi doit valoir releves, bilans, jours ou salons (reçu : %)', p_quoi;
  end if;

  v_a  := coalesce(p_a, current_date);
  v_de := greatest(coalesce(p_de, v_a - 6), v_a - 90);

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
  'Lecture seule des relevés, bilans, quotas et salons de la sonde de performance, sur présentation d''un jeton de lecteur_perf.';

revoke all on function lecture_perf(text, text, date, date, text, integer, integer) from public;
grant execute on function lecture_perf(text, text, date, date, text, integer, integer) to anon, authenticated;
