-- Sonde de performance
--
-- Pourquoi : on ne savait la lenteur d'un plan que par celui qui s'en plaignait,
-- et seulement sur le poste de celui qui l'essayait. La page mesure désormais
-- elle-même son chargement, sa fluidité et ses gels chez les vrais visiteurs
-- (`sonde.mjs`), et dépose un résumé par visite ici, par le Worker.
--
-- Une visite tient une ligne : la sonde renvoie son résumé en cours de route
-- (dix secondes après l'affichage, puis quand l'onglet se cache), et chaque
-- envoi remplace le précédent. Sans cela, un salon très fréquenté écrirait
-- plusieurs lignes par visiteur pour n'en lire qu'une.
--
-- Ce qui s'écrit ne dit rien du visiteur : un UUID tiré au hasard par la page,
-- jamais l'agent utilisateur complet, ni adresse. Le résumé est borné ici — la
-- clé publique circule dans chaque page, cette porte est la seule qu'on ne
-- contourne pas.

create table if not exists releve_perf (
  evenement_id          uuid not null references evenement (id) on delete cascade,
  -- tiré au hasard par la page ; sur la borne, un nouveau toutes les heures
  visite                uuid not null,
  -- dans le fuseau du salon, daté à la première réception : un renvoi après
  -- minuit ne déplace pas la visite de jour (sinon elle compterait deux fois)
  jour                  date not null,
  page                  text not null check (page in ('plan', 'admin', 'borne')),
  support               text,
  version               text not null default '',
  mobile                boolean,
  immersif              boolean,
  recu                  timestamptz not null default now(),
  maj                   timestamptz not null default now(),
  -- les colonnes chiffrées sont extraites du résumé (`sonde-plan/1`) : on les
  -- trie et on les moyenne sans ouvrir le jsonb
  affiche_ms            integer,
  donnees_ms            integer,
  transfert_ko          integer,
  part_plus33_classique real,
  part_plus33_immersif  real,
  gels                  integer,
  repeint_ms_p95        real,
  gpu_ms_p95            real,
  pertes_contexte       integer,
  resume                jsonb not null,
  primary key (evenement_id, visite)
);

comment on table releve_perf is
  'Un résumé de performance par visite d''une page du plan, remplacé à chaque envoi. Aucune donnée sur le visiteur.';

create index if not exists releve_perf_par_jour on releve_perf (evenement_id, jour, page);

-- Les visites reçues et écartées par salon, jour et page : le quota se décide
-- sur ce compte, et le bilan dit combien de visites il ne représente pas.
create table if not exists perf_jour (
  evenement_id uuid not null references evenement (id) on delete cascade,
  jour         date not null,
  page         text not null check (page in ('plan', 'admin', 'borne')),
  recues       integer not null default 0,
  ecartees     integer not null default 0,
  primary key (evenement_id, jour, page)
);

comment on table perf_jour is
  'Visites retenues et écartées par le quota de la sonde, par salon, jour et page.';

alter table releve_perf enable row level security;
alter table perf_jour   enable row level security;

-- lire : les mêmes droits que sur les compteurs du salon ; aucune politique
-- d'écriture, tout passe par les fonctions ci-dessous
drop policy if exists "lecture des relevés accessibles" on releve_perf;
create policy "lecture des relevés accessibles" on releve_perf
  for select to authenticated using (acces_salon(evenement_id));
drop policy if exists "lecture des quotas accessibles" on perf_jour;
create policy "lecture des quotas accessibles" on perf_jour
  for select to authenticated using (acces_salon(evenement_id));

/* Un nombre du résumé, ou rien. Un champ absent ou mal typé donne null, un
   champ démesuré se borne : mieux vaut une colonne vide qu'une visite refusée
   pour un débordement d'entier. Bornés à un milliard, ils tiennent dans un
   integer et dans un real. */
create or replace function sonde_nombre(j jsonb) returns numeric
language sql
immutable
set search_path = public
as $$
  select case when jsonb_typeof(j) = 'number'
              then least(greatest((j #>> '{}')::numeric, -1000000000), 1000000000)
         end;
$$;

revoke all on function sonde_nombre(jsonb) from public;

/* Enregistre un résumé : remplace celui de la visite si elle est connue, sinon
   la fait passer sous le quota de sa page. Interne — `sonde_publique` et
   `sonde_admin` la tiennent, aucun rôle ne l'appelle directement.

   Une visite connue n'est jamais retirée : le quota décide de qui entre, pas de
   qui reste. Pour `plan`, les cent premières visites du jour entrent toutes,
   les suivantes avec une probabilité de 100 / n : l'échantillon reste
   représentatif de la journée entière, pas de son matin. */
create or replace function sonde_enregistre(
  p_evt     uuid,
  p_page    text,
  p_version text,
  p_visite  uuid,
  p_resume  jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  PLAN_MAX    constant integer := 300;
  PLAN_SUR    constant integer := 100;
  AUTRE_MAX   constant integer := 50;
  v_tz        text;
  v_jour      date;
  v_version   text := left(regexp_replace(coalesce(p_version, ''), '[^a-f0-9]', '', 'g'), 16);
  v_recues    integer;
  v_ecartees  integer;
  v_entre     boolean;
  v_support   text;
  v_mobile    boolean;
  v_immersif  boolean;
  v_affiche   integer;
  v_donnees   integer;
  v_transfert integer;
  v_classique real;
  v_immersive real;
  v_gels      integer;
  v_repeint   real;
  v_gpu       real;
  v_pertes    integer;
  v_lignes    integer;
begin
  if p_evt is null or p_visite is null or p_resume is null
     or jsonb_typeof(p_resume) <> 'object'
     or p_page is null or p_page not in ('plan', 'admin', 'borne')
     or octet_length(p_resume::text) > 4096 then
    return false;
  end if;

  -- les colonnes chiffrées : les chemins que la sonde écrit (`sonde-plan/1`)
  v_support  := case when jsonb_typeof(p_resume -> 'support') = 'string'
                     then left(regexp_replace(p_resume ->> 'support', '[^A-Za-z0-9_ ./:-]', '', 'g'), 40) end;
  v_mobile   := case when jsonb_typeof(p_resume #> '{appareil,mobile}') = 'boolean'
                     then (p_resume #>> '{appareil,mobile}')::boolean end;
  v_immersif := case when jsonb_typeof(p_resume #> '{plan,immersifUtilise}') = 'boolean'
                     then (p_resume #>> '{plan,immersifUtilise}')::boolean end;
  v_affiche   := round(sonde_nombre(p_resume #> '{chargement,jalons,plan-affiche}'));
  v_donnees   := round(sonde_nombre(p_resume #> '{chargement,jalons,donnees}'));
  v_transfert := round(sonde_nombre(p_resume #> '{chargement,transfertKo}'));
  v_classique := sonde_nombre(p_resume #> '{fluidite,classique,partPlus33}');
  v_immersive := sonde_nombre(p_resume #> '{fluidite,immersif,partPlus33}');
  v_gels      := round(sonde_nombre(p_resume #> '{gels,n}'));
  v_repeint   := sonde_nombre(p_resume #> '{gpu,repeints,p95}');
  v_gpu       := sonde_nombre(p_resume #> '{gpu,gpuMsP95}');
  v_pertes    := round(sonde_nombre(p_resume #> '{gpu,pertesContexte}'));

  -- Une visite connue : son résumé est remplacé, sans toucher au quota ni au
  -- jour. Renvoyée après minuit, elle resterait comptée la veille.
  update releve_perf
     set maj = now(), version = v_version, support = v_support,
         mobile = v_mobile, immersif = v_immersif,
         affiche_ms = v_affiche, donnees_ms = v_donnees, transfert_ko = v_transfert,
         part_plus33_classique = v_classique, part_plus33_immersif = v_immersive,
         gels = v_gels, repeint_ms_p95 = v_repeint, gpu_ms_p95 = v_gpu,
         pertes_contexte = v_pertes, resume = p_resume
   where evenement_id = p_evt and visite = p_visite;
  get diagnostics v_lignes = row_count;
  if v_lignes > 0 then return true; end if;

  -- Le jour se date dans le fuseau du salon, comme les compteurs ; un fuseau
  -- inconnu ferait échouer la conversion : on retombe sur UTC.
  select e.fuseau into v_tz from evenement e where e.id = p_evt;
  if v_tz is null or not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;
  v_jour := (now() at time zone v_tz)::date;

  insert into perf_jour (evenement_id, jour, page) values (p_evt, v_jour, p_page)
  on conflict do nothing;
  -- le verrou de la ligne du jour met les visites neuves en file : deux
  -- arrivées simultanées ne lisent pas le même compte pour entrer toutes deux
  select recues, ecartees into v_recues, v_ecartees
    from perf_jour
   where evenement_id = p_evt and jour = v_jour and page = p_page
   for update;

  if p_page = 'plan' then
    v_entre := v_recues < PLAN_SUR
            or (v_recues < PLAN_MAX
                and random() < PLAN_SUR::double precision / greatest(v_recues + v_ecartees, 1));
  else
    v_entre := v_recues < AUTRE_MAX;
  end if;

  if not v_entre then
    update perf_jour set ecartees = ecartees + 1
     where evenement_id = p_evt and jour = v_jour and page = p_page;
    return false;
  end if;

  insert into releve_perf (evenement_id, visite, jour, page, support, version, mobile,
                           immersif, affiche_ms, donnees_ms, transfert_ko,
                           part_plus33_classique, part_plus33_immersif, gels,
                           repeint_ms_p95, gpu_ms_p95, pertes_contexte, resume)
  values (p_evt, p_visite, v_jour, p_page, v_support, v_version, v_mobile,
          v_immersif, v_affiche, v_donnees, v_transfert,
          v_classique, v_immersive, v_gels,
          v_repeint, v_gpu, v_pertes, p_resume)
  on conflict (evenement_id, visite) do nothing;
  get diagnostics v_lignes = row_count;
  -- la même visite arrivée en même temps par un autre appel : déjà comptée
  if v_lignes > 0 then
    update perf_jour set recues = recues + 1
     where evenement_id = p_evt and jour = v_jour and page = p_page;
  end if;
  return true;
end;
$$;

comment on function sonde_enregistre is
  'Interne : remplace le résumé d''une visite connue, ou fait passer une visite neuve sous le quota de sa page.';

revoke all on function sonde_enregistre(uuid, text, text, uuid, jsonb) from public;

/* La porte, appelée par le Worker avec la clé publique. Un salon publié, une
   page du public (`plan` ou `borne` : l'exploitant passe par `sonde_admin`),
   un résumé de 4 Ko au plus — le reste est refusé en rendant faux, sans bruit. */
create or replace function sonde_publique(
  p_slug    text,
  p_page    text,
  p_version text,
  p_visite  uuid,
  p_resume  jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evt uuid;
begin
  if p_page is null or p_page not in ('plan', 'borne') then return false; end if;
  select e.id into v_evt from evenement e
   where e.slug = left(coalesce(p_slug, ''), 80) and e.etat = 'publie';
  if v_evt is null then return false; end if;
  return sonde_enregistre(v_evt, p_page, p_version, p_visite, p_resume);
end;
$$;

comment on function sonde_publique is
  'Porte publique de la sonde de performance, appelée par le Worker : borne le résumé et le range sous le quota de la page.';

revoke all on function sonde_publique(text, text, text, uuid, jsonb) from public;
grant execute on function sonde_publique(text, text, text, uuid, jsonb) to anon, service_role;

/* La porte de l'exploitant : la page d'administration se mesure avant même que
   le salon soit publié (c'est là qu'on prépare le plan, donc là qu'il est
   lent en premier). Pas de clé publique ici : il faut un compte qui a accès au
   salon, et `acces_salon` en décide — sans compte, `auth.uid()` est nul et la
   réponse est fausse. Le salon peut n'être pas publié. */
create or replace function sonde_admin(
  p_slug    text,
  p_version text,
  p_visite  uuid,
  p_resume  jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_evt uuid;
begin
  if auth.uid() is null then return false; end if;
  select e.id into v_evt from evenement e where e.slug = left(coalesce(p_slug, ''), 80);
  if v_evt is null or not acces_salon(v_evt) then return false; end if;
  return sonde_enregistre(v_evt, 'admin', p_version, p_visite, p_resume);
end;
$$;

comment on function sonde_admin is
  'Porte de l''exploitant : enregistre la mesure de la page d''administration d''un salon, publié ou non, pour qui y a accès.';

revoke all on function sonde_admin(text, text, uuid, jsonb) from public, anon;
grant execute on function sonde_admin(text, text, uuid, jsonb) to authenticated;

/* Le bilan d'un jour : une ligne par salon, page et support (mobile ou
   bureau), avec les centiles qu'on lit d'un coup d'œil et un `detail` pour
   creuser. Il survit au relevé, purgé à 30 jours : c'est lui qui montre la
   tendance sur trois mois. */
create table if not exists perf_bilan (
  evenement_id    uuid not null references evenement (id) on delete cascade,
  jour            date not null,
  page            text not null check (page in ('plan', 'admin', 'borne')),
  mobile          boolean not null,
  visites         integer not null,
  affiche_p50     double precision,
  affiche_p90     double precision,
  donnees_p50     double precision,
  donnees_p90     double precision,
  transfert_p50   double precision,
  part_plus33_p50 double precision,
  gels_moy        double precision,
  pertes_contexte integer,
  detail          jsonb,
  primary key (evenement_id, jour, page, mobile)
);

comment on table perf_bilan is
  'Le bilan de performance d''un jour : centiles par salon, page et support, calculés chaque nuit sur releve_perf.';

alter table perf_bilan enable row level security;
drop policy if exists "lecture des bilans accessibles" on perf_bilan;
create policy "lecture des bilans accessibles" on perf_bilan
  for select to authenticated using (acces_salon(evenement_id));

/* Le détail d'un ensemble de relevés : vues, appareils les plus lents, fichiers
   les plus fréquemment lourds, étapes du chargement. Partagé par le bilan de
   nuit et par « aujourd'hui », pour que les deux disent la même chose. Les
   étapes viennent des jalons : la préparation est ce qui sépare l'arrivée des
   données de l'affichage du plan. Invoker : appelé par un compte, il ne voit
   que les relevés que la RLS lui laisse. */
create or replace function sonde_detail(
  p_evt    uuid,
  p_de     date,
  p_a      date,
  p_page   text,
  p_mobile boolean
) returns jsonb
language sql
stable
set search_path = public
as $$
  with r as (
    select r.*,
           coalesce(case when r.immersif then r.part_plus33_immersif end, r.part_plus33_classique) as part,
           nullif(trim(concat_ws(' ', r.resume #>> '{appareil,carte,fabricant}', r.resume #>> '{appareil,carte,puce}')), '') as carte,
           r.resume #>> '{appareil,systeme}' as famille,
           sonde_nombre(r.resume #> '{chargement,jalons,reponse}') as reponse
      from releve_perf r
     where r.evenement_id = p_evt and r.jour between p_de and p_a
       and (p_page is null or r.page = p_page)
       and (p_mobile is null or r.mobile is not distinct from p_mobile)
  ),
  appareils as (
    select carte, coalesce(max(famille), '') as famille, count(*)::int as visites,
           percentile_cont(0.5) within group (order by part) as part_plus33_p50,
           percentile_cont(0.5) within group (order by affiche_ms) as affiche_p50
      from r where carte is not null
     group by carte
     order by affiche_p50 desc nulls last, carte
     limit 10
  ),
  lourds as (
    select l ->> 'fichier' as fichier, count(distinct r.visite)::int as visites,
           percentile_cont(0.5) within group (order by sonde_nombre(l -> 'transfertKo')) as ko_p50
      from r
      cross join lateral jsonb_array_elements(
        case when jsonb_typeof(r.resume #> '{chargement,lourds}') = 'array'
             then r.resume #> '{chargement,lourds}' else '[]'::jsonb end) l
     where jsonb_typeof(l -> 'fichier') = 'string'
     group by l ->> 'fichier'
     order by visites desc, fichier
     limit 10
  )
  select jsonb_build_object(
    'vues', jsonb_build_object(
      'classique', (select jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by part_plus33_classique),
          'p90', percentile_cont(0.9) within group (order by part_plus33_classique)) from r),
      'immersif', (select jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by part_plus33_immersif),
          'p90', percentile_cont(0.9) within group (order by part_plus33_immersif)) from r)),
    'appareils', coalesce((select jsonb_agg(jsonb_build_object(
          'carte', carte, 'famille', famille, 'visites', visites,
          'part_plus33_p50', part_plus33_p50, 'affiche_p50', affiche_p50)
          order by affiche_p50 desc nulls last, carte) from appareils), '[]'::jsonb),
    'lourds', coalesce((select jsonb_agg(jsonb_build_object(
          'fichier', fichier, 'visites', visites, 'ko_p50', ko_p50)
          order by visites desc, fichier) from lourds), '[]'::jsonb),
    'etapes', (select jsonb_build_object(
        'reponse', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by reponse),
          'p90', percentile_cont(0.9) within group (order by reponse)),
        'donnees', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by donnees_ms),
          'p90', percentile_cont(0.9) within group (order by donnees_ms)),
        'preparation', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by affiche_ms - donnees_ms),
          'p90', percentile_cont(0.9) within group (order by affiche_ms - donnees_ms)),
        'affichage', jsonb_build_object(
          'p50', percentile_cont(0.5) within group (order by affiche_ms),
          'p90', percentile_cont(0.9) within group (order by affiche_ms))) from r));
$$;

revoke all on function sonde_detail(uuid, date, date, text, boolean) from public;
grant execute on function sonde_detail(uuid, date, date, text, boolean) to authenticated;

/* Recalcule le bilan d'un jour. Rejouable : le jour est remplacé en entier, un
   relevé tardif ou une correction ne laisse ni doublon ni ligne périmée. */
create or replace function bilan_perf(p_jour date) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from perf_bilan where jour = p_jour;
  insert into perf_bilan (evenement_id, jour, page, mobile, visites, affiche_p50, affiche_p90,
                          donnees_p50, donnees_p90, transfert_p50, part_plus33_p50, gels_moy,
                          pertes_contexte, detail)
  select g.evenement_id, p_jour, g.page, g.mobile, g.visites, g.affiche_p50, g.affiche_p90,
         g.donnees_p50, g.donnees_p90, g.transfert_p50, g.part_p50, g.gels_moy, g.pertes,
         sonde_detail(g.evenement_id, p_jour, p_jour, g.page, g.mobile)
    from (
      select r.evenement_id, r.page, coalesce(r.mobile, false) as mobile, count(*)::int as visites,
             percentile_cont(0.5) within group (order by r.affiche_ms) as affiche_p50,
             percentile_cont(0.9) within group (order by r.affiche_ms) as affiche_p90,
             percentile_cont(0.5) within group (order by r.donnees_ms) as donnees_p50,
             percentile_cont(0.9) within group (order by r.donnees_ms) as donnees_p90,
             percentile_cont(0.5) within group (order by r.transfert_ko) as transfert_p50,
             -- la part de saccades de la vue qu'on a réellement utilisée
             percentile_cont(0.5) within group (order by
               coalesce(case when r.immersif then r.part_plus33_immersif end, r.part_plus33_classique)) as part_p50,
             avg(r.gels) as gels_moy,
             sum(r.pertes_contexte)::int as pertes
        from releve_perf r
       where r.jour = p_jour
       group by r.evenement_id, r.page, coalesce(r.mobile, false)
    ) g;
end;
$$;

comment on function bilan_perf is
  'Recalcule le bilan de performance d''un jour (rejouable).';

revoke all on function bilan_perf(date) from public;

/* La nuit : le bilan de la veille d'abord, puis la purge — un relevé n'est
   effacé qu'après avoir nourri son bilan. 30 jours pour les relevés, 90 pour
   les bilans et les quotas. */
create or replace function purge_perf() returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform bilan_perf(current_date - 1);
  delete from releve_perf where jour < current_date - 30;
  delete from perf_bilan  where jour < current_date - 90;
  delete from perf_jour   where jour < current_date - 90;
end;
$$;

comment on function purge_perf is
  'Bilan de la veille, puis purge : relevés à 30 jours, bilans et quotas à 90.';

revoke all on function purge_perf() from public;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- un même nom remplace la tâche : rejouer la migration ne la double pas
    perform cron.schedule('perf-de-la-nuit', '41 2 * * *', 'select public.purge_perf()');
  end if;
exception when others then
  raise warning 'Bilan de performance de la nuit non programmé (%).', sqlerrm;
end $$;

/* Ce que l'écran des performances lit : les bilans de la période, la journée
   en cours calculée à la volée, et ce que les quotas ont retenu ou écarté.
   Invoker : c'est la RLS qui décide ; sans accès au salon, tout est vide. */
create or replace function performances_du_salon(p_evenement uuid, p_jours integer default 7)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_tz  text;
  v_auj date;
  v_de  date;
begin
  select e.fuseau into v_tz from evenement e where e.id = p_evenement;
  if v_tz is null or not exists (select 1 from pg_timezone_names where name = v_tz) then v_tz := 'UTC'; end if;
  v_auj := (now() at time zone v_tz)::date;
  v_de  := v_auj - (greatest(least(coalesce(p_jours, 7), 90), 1) - 1);
  return jsonb_build_object(
    'bilans', coalesce((select jsonb_agg(to_jsonb(b) order by b.jour desc, b.page, b.mobile)
                          from perf_bilan b
                         where b.evenement_id = p_evenement and b.jour >= v_de), '[]'::jsonb),
    'aujourdhui', sonde_detail(p_evenement, v_auj, v_auj, 'plan', null),
    'recues',     coalesce((select sum(recues)   from perf_jour
                             where evenement_id = p_evenement and jour >= v_de), 0)::int,
    'ecartees',   coalesce((select sum(ecartees) from perf_jour
                             where evenement_id = p_evenement and jour >= v_de), 0)::int);
end;
$$;

comment on function performances_du_salon is
  'Les performances d''un salon sur p_jours jours : bilans, journée en cours (page plan), visites reçues et écartées.';

revoke all on function performances_du_salon(uuid, integer) from public, anon;
grant execute on function performances_du_salon(uuid, integer) to authenticated;

-- `sonde_detail` s'exécute avec les droits de l'appelant : il lui faut cet utilitaire pur
grant execute on function sonde_nombre(jsonb) to authenticated;
