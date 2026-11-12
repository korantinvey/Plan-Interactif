-- Les erreurs des pages du plan
--
-- Pourquoi : une page qui plantait chez un visiteur ne le disait à personne.
-- Rien ne remontait — ni la console du navigateur, que seul le visiteur voit,
-- ni le Worker, qui sert des fichiers sans les exécuter. On l'apprenait d'un
-- organisateur, des jours après, quand on l'apprenait.
--
-- La page signale désormais ses erreurs (`modules/erreurs.mjs`) au Worker
-- (`src/index.mjs` `erreur`), qui ramène la position minifiée au module et à
-- la ligne d'origine avant d'écrire ici, par une porte bornée comme celle des
-- mesures. Ce qui s'écrit ne dit rien du visiteur : ni jeton, ni adresse, ni
-- agent utilisateur — un message d'erreur, l'endroit du code, un compte par
-- jour. Une erreur qui se répète mille fois tient une ligne, et non mille.

create table if not exists erreur_page (
  evenement_id uuid not null references evenement (id) on delete cascade,
  -- le jour dans le fuseau du serveur : c'est un relevé technique, pas un
  -- chiffre de fréquentation à comparer d'un salon à l'autre
  jour         date not null default current_date,
  -- `plan` (le visiteur) ou `admin` (l'exploitant)
  page         text not null,
  -- ce qui identifie l'erreur pour la compter : la page, le message, l'endroit
  empreinte    text not null,
  message      text not null,
  -- `modules/fiche.mjs:132` quand la carte l'a dit, sinon le fichier servi
  lieu         text not null default '',
  -- la construction des pages en ligne quand elle est arrivée (`/api/pages`)
  version      text not null default '',
  nombre       integer not null default 1,
  derniere     timestamptz not null default now(),
  primary key (evenement_id, jour, empreinte)
);

comment on table erreur_page is
  'Erreurs remontées par les pages du plan, comptées par salon, jour et erreur. Aucune donnée sur le visiteur.';

alter table erreur_page enable row level security;

-- lire et effacer : les mêmes droits que sur les compteurs du salon
drop policy if exists "lecture des erreurs accessibles" on erreur_page;
create policy "lecture des erreurs accessibles" on erreur_page
  for select to authenticated using (acces_salon(evenement_id));
drop policy if exists "effacement des erreurs accessibles" on erreur_page;
create policy "effacement des erreurs accessibles" on erreur_page
  for delete to authenticated using (acces_salon(evenement_id));

/* La porte, appelée par le Worker avec la clé publique — qui circule dans
   chaque page : tout ce qu'elle reçoit est borné ici, la seule porte qu'on ne
   contourne pas. Cinq erreurs par appel, des textes courts, un salon publié,
   et pas plus de deux cents erreurs distinctes par salon et par jour : une
   page qui s'emballe, ou quelqu'un qui écrirait n'importe quoi, ne remplit
   pas la base — les répétitions d'une erreur connue, elles, se comptent
   toujours. */
create or replace function erreur_publique(
  p_slug    text,
  p_page    text,
  p_version text,
  p_erreurs jsonb
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  PAR_APPEL constant integer := 5;
  PAR_JOUR  constant integer := 200;
  v_evt     uuid;
  v_page    text := case when p_page = 'admin' then 'admin' else 'plan' end;
  v_version text := left(regexp_replace(coalesce(p_version, ''), '[^a-f0-9]', '', 'g'), 16);
  v_e       record;
begin
  select e.id into v_evt from evenement e
   where e.slug = left(coalesce(p_slug, ''), 80) and e.etat = 'publie';
  if v_evt is null then return false; end if;

  for v_e in
    select m, l from (
      -- les caractères de contrôle partent : ce texte s'affichera dans la console
      select left(regexp_replace(coalesce(x->>'message', ''), '[[:cntrl:]]', ' ', 'g'), 300) as m,
             left(regexp_replace(coalesce(x->>'lieu', ''), '[^A-Za-z0-9_./:-]', '', 'g'), 160) as l
        from jsonb_array_elements(
               case when jsonb_typeof(p_erreurs) = 'array' then p_erreurs else '[]'::jsonb end
             ) with ordinality as t(x, rang)
       where rang <= PAR_APPEL and jsonb_typeof(x) = 'object'
    ) s
    where m <> ''
  loop
    insert into erreur_page as ep (evenement_id, page, empreinte, message, lieu, version)
    select v_evt, v_page, md5(v_page || ' ' || v_e.m || ' ' || v_e.l), v_e.m, v_e.l, v_version
     where exists (select 1 from erreur_page
                    where evenement_id = v_evt and jour = current_date
                      and empreinte = md5(v_page || ' ' || v_e.m || ' ' || v_e.l))
        or (select count(*) from erreur_page
             where evenement_id = v_evt and jour = current_date) < PAR_JOUR
    on conflict (evenement_id, jour, empreinte) do update
       set nombre = least(ep.nombre + 1, 1000000),
           derniere = now(),
           version = excluded.version;
  end loop;
  return true;
end;
$$;

comment on function erreur_publique is
  'Porte publique des erreurs des pages, appelée par le Worker : borne les erreurs reçues et les compte par salon et par jour.';

revoke all on function erreur_publique(text, text, text, jsonb) from public;
grant execute on function erreur_publique(text, text, text, jsonb) to anon, service_role;

/* Ce que lit le rapport d'utilisation : les erreurs des N derniers jours,
   les plus fréquentes d'abord. Par les droits de l'appelant : la politique de
   lecture ne lui montre que les salons qu'il administre. */
create or replace function erreurs_du_salon(
  p_evenement uuid,
  p_jours     integer default 7
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(jsonb_agg(e order by e.nombre desc, e.derniere desc), '[]'::jsonb)
    from (
      select page, message, lieu, sum(nombre)::integer as nombre,
             max(derniere) as derniere, (array_agg(version order by derniere desc))[1] as version
        from erreur_page
       where evenement_id = p_evenement
         and (p_jours is null or jour > current_date - p_jours)
       group by page, message, lieu
       order by 4 desc, 5 desc
       limit 50
    ) e;
$$;

comment on function erreurs_du_salon is
  'Les erreurs des pages d''un salon sur ses N derniers jours, les plus fréquentes d''abord ; lues avec les droits de l''appelant.';

revoke all on function erreurs_du_salon(uuid, integer) from public;
grant execute on function erreurs_du_salon(uuid, integer) to authenticated;

/* Un relevé technique ne se garde pas : quatre-vingt-dix jours suffisent à
   voir qu'une erreur est revenue, ou qu'elle est partie avec un correctif. */
create or replace function purge_erreurs() returns void
language sql
security definer
set search_path = public
as $$
  delete from erreur_page where jour < current_date - 90;
$$;

revoke all on function purge_erreurs() from public;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- un même nom remplace la tâche : rejouer la migration ne la double pas
    perform cron.schedule('purge-des-erreurs-des-pages', '29 2 * * *',
                          'select public.purge_erreurs()');
  end if;
exception when others then
  raise warning 'Purge des erreurs non programmée (%).', sqlerrm;
end $$;
