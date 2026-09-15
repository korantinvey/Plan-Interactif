-- Le rappel avant une conférence
--
-- Un visiteur retient trois conférences le matin, puis passe sa journée dans
-- les allées. À quinze heures moins le quart il est à l'autre bout du hall, le
-- téléphone dans la poche, et la conférence qu'il avait notée commence sans
-- lui. Le parcours savait l'heure ; personne ne la lui a rappelée.
--
-- Ce que cette migration ajoute est le réveil qui manquait. Et il faut dire
-- pourquoi il vit ici, sur un serveur, plutôt que dans la page — parce que la
-- réponse n'allait pas de soi, et qu'elle coûte quelque chose.
--
-- Une application d'alarme native ne compte pas le temps elle-même : elle
-- confie l'instant à l'ordonnanceur du système, qui la réveille. Le web n'a pas
-- cet ordonnanceur. Les minuteries d'une page meurent avec l'onglet — sur
-- mobile, gelé en quelques secondes dès qu'il passe en arrière-plan ; le
-- service de second plan est arrêté après quelques secondes d'inactivité et
-- aucune attente ne lui survit ; et l'API qui aurait comblé ce manque,
-- *Notification Triggers*, n'a jamais quitté l'essai d'origine de Chrome. Reste
-- le Web Push, seul mécanisme capable de réveiller une page fermée — mais le
-- service de poussée du navigateur relaie, il n'attend pas. L'heure, il faut
-- que quelqu'un la tienne, et ce quelqu'un est forcément un serveur.
--
-- **Ce que cela déplace, et qu'il ne faut pas enjoliver.** Le tiroir du parcours
-- promet, en toutes lettres, que la liste retenue ne quitte pas l'appareil.
-- Cette table est la première exception à cette phrase, et la phrase est
-- réécrite avec elle. Trois bornes la rendent tenable :
--
--   · **rien n'y entre sans un geste.** Le visiteur doit toucher l'interrupteur
--     du tiroir, puis accorder l'autorisation que le navigateur lui demande.
--     Sans les deux, aucune ligne ;
--   · **on n'y range que le nécessaire**, et pas la liste. Un rang porte
--     l'abonnement — une adresse opaque tirée par le navigateur, qui ne désigne
--     ni une personne ni un appareil hors de ce service — l'instant d'envoi, et
--     le texte tout prêt de la notification. Les stands retenus n'y sont pas ;
--     les conférences non rappelées non plus ;
--   · **rien ne survit au salon.** Un rang part avec sa conférence passée
--     (`purge_rappels`, chaque nuit), et tous ceux d'un appareil partent au
--     premier refus du service de poussée — une application désinstallée, une
--     icône retirée de l'écran d'accueil, des données de site effacées.
--
-- Le texte de la notification est composé par la page, non par le serveur. Ce
-- n'est pas un détour : c'est ce qui permet qu'il parte dans la langue que le
-- visiteur lisait, et cela évite au serveur d'avoir à connaître le programme
-- pour écrire une phrase. Il chiffre et poste ce qu'on lui a confié, sans le
-- relire — le service de poussée, lui, ne peut pas le lire du tout.

-- ------------------------------------------------------------------ la table
create table if not exists rappel_de_conference (
  id          uuid primary key default gen_random_uuid(),
  evenement   uuid not null references evenement(id) on delete cascade,
  -- l'adresse que le navigateur a tirée, et les deux secrets qui chiffrent
  -- pour lui : sans ce trio, rien ne part, et il ne vaut que pour cet appareil
  abonnement  text not null,
  p256dh      text not null,
  auth        text not null,
  conference  text not null,
  envoi_a     timestamptz not null,
  titre       text not null,
  corps       text not null default '',
  adresse     text,
  -- la durée de vie du message, en secondes : passé ce délai, le service de
  -- poussée le jette au lieu de le remettre. C'est ce qui empêche un téléphone
  -- rallumé en fin de journée d'annoncer une conférence terminée depuis des
  -- heures — un rappel en retard est pire que pas de rappel
  vie         integer not null default 900,
  envoye_a    timestamptz,
  cree_a      timestamptz not null default now(),
  -- une conférence ne se rappelle qu'une fois par appareil : réenregistrer un
  -- parcours remplace le rang au lieu d'en poser un second. Le salon entre dans
  -- la clé parce que les identifiants viennent d'Eventmaker et ne sont uniques
  -- que chez lui : deux salons ouverts sur le même téléphone ne doivent pas se
  -- prendre mutuellement leur place
  unique (abonnement, evenement, conference)
);

comment on table rappel_de_conference is
  'Les rappels en attente : quoi envoyer, à quel appareil, à quelle minute. Écrite par la fonction « rappels » sur geste du visiteur, vidée par « purge_rappels ».';

-- Ce que la tâche lit à chaque minute, et rien d'autre : l'index ne porte que
-- ce qui reste à envoyer, et se vide donc à mesure qu'on envoie.
create index if not exists rappel_a_envoyer
  on rappel_de_conference (envoi_a) where envoye_a is null;

-- Pour retrouver d'un coup tous les rangs d'un appareil — à son réenregistrement
-- comme à sa disparition.
create index if not exists rappel_par_abonnement
  on rappel_de_conference (abonnement);

-- ----------------------------------------------------------------- l'accès
alter table rappel_de_conference enable row level security;

/*
 * Aucune politique, et c'est voulu : cette table n'est lisible que par la clé
 * de service, donc par les seules fonctions ci-dessous. Elle ne porte rien
 * qu'un écran de la console montre, et un compte d'exploitant n'a aucune raison
 * de lire les rappels que des visiteurs se sont posés.
 */

-- ----------------------------------------------------- poser ses rappels
/**
 * Enregistrer, pour un appareil, tout ce qu'il attend de ce salon.
 *
 * La page envoie sa liste entière plutôt que ses changements : c'est la même
 * idée que le parcours lui-même, qui se relit en entier à chaque affichage.
 * Une conférence retirée disparaît donc d'elle-même, sans qu'il faille compter
 * les gestes ni deviner lequel a manqué. Un envoi vide efface tout — c'est
 * ainsi que l'interrupteur s'éteint.
 */
create or replace function enregistre_rappels(
  p_slug       text,
  p_abonnement text,
  p_p256dh     text,
  p_auth       text,
  p_rappels    jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  RANGS_MAX constant int := 60;   -- un parcours raisonnable, et une borne ferme
  v_evt uuid;
begin
  select e.id into v_evt
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- Ce qui vaut pour cet appareil et ce salon repart de zéro. On ne touche pas
  -- à ce qu'il a posé sur un autre salon : un même téléphone en ouvre plusieurs.
  delete from rappel_de_conference
   where abonnement = p_abonnement and evenement = v_evt;

  -- Le tri et la borne se prennent à part : ce qui dépasse est ce qui vient le
  -- plus tard, et non ce qui se trouvait en fin de liste.
  with entrants as (
    select r as e
      from jsonb_array_elements(coalesce(p_rappels, '[]'::jsonb)) r
     where r->>'conf' is not null
       and r->>'titre' is not null
       -- un instant déjà passé ne se rappelle plus : la page a pu être ouverte
       -- après le début de la conférence, ou rester ouverte jusque-là
       and (r->>'envoi_a')::timestamptz > now()
     order by (r->>'envoi_a')::timestamptz
     limit RANGS_MAX)
  insert into rappel_de_conference
         (evenement, abonnement, p256dh, auth, conference, envoi_a, titre, corps, adresse, vie)
  select v_evt, p_abonnement, p_p256dh, p_auth,
         left(e->>'conf', 200),
         (e->>'envoi_a')::timestamptz,
         left(e->>'titre', 200),
         left(coalesce(e->>'corps', ''), 400),
         left(coalesce(e->>'adresse', ''), 500),
         greatest(60, least(86400, coalesce((e->>'vie')::int, 900)))
    from entrants
  on conflict (abonnement, evenement, conference) do nothing;

  return true;
end;
$$;

comment on function enregistre_rappels is
  'Remplace les rappels d''un appareil pour un salon publié. Une liste vide les efface tous.';

revoke all on function enregistre_rappels(text, text, text, text, jsonb) from public;

-- --------------------------------------------------------- ce qui est dû
/**
 * Prendre les rappels de la minute, et les marquer pris dans le même geste.
 *
 * Marquer avant d'envoyer, et non après : deux passages qui se chevauchent —
 * une minute qui déborde sur la suivante — enverraient sinon le même rappel
 * deux fois. Un message perdu parce que l'envoi a échoué après la marque vaut
 * mieux qu'un message envoyé deux fois : le premier ne se remarque pas, le
 * second se remarque beaucoup. `skip locked` fait le reste.
 */
create or replace function rappels_dus(p_max int default 200)
returns table (
  id         uuid,
  abonnement text,
  p256dh     text,
  auth       text,
  titre      text,
  corps      text,
  adresse    text,
  vie        integer
)
language sql
security invoker
set search_path = public
as $$
  update rappel_de_conference r
     set envoye_a = now()
   where r.id in (
         select d.id from rappel_de_conference d
          where d.envoye_a is null and d.envoi_a <= now()
          order by d.envoi_a
          limit greatest(1, least(500, p_max))
            for update skip locked)
  returning r.id, r.abonnement, r.p256dh, r.auth, r.titre, r.corps, r.adresse, r.vie;
$$;

comment on function rappels_dus is
  'Les rappels arrivés à échéance, marqués envoyés dans le même geste. Appelée à la minute par la fonction « rappels ».';

revoke all on function rappels_dus(int) from public;

-- ------------------------------------------------- un appareil qui n'est plus
/**
 * 404 ou 410 du service de poussée : l'abonnement n'existe plus. L'application
 * a été désinstallée, l'icône retirée de l'écran d'accueil, les données du site
 * effacées. Sans cet effacement, la base garderait pour toujours des adresses
 * mortes qu'on retenterait à chaque conférence.
 */
create or replace function oublie_abonnement(p_abonnement text)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from rappel_de_conference where abonnement = p_abonnement;
$$;

comment on function oublie_abonnement is
  'Efface tous les rappels d''un appareil dont le service de poussée dit qu''il n''existe plus.';

revoke all on function oublie_abonnement(text) from public;

-- -------------------------------------------------------------- la purge
/**
 * Un rappel ne vaut que jusqu'à sa conférence. Passé deux jours, ce qui reste
 * est soit envoyé, soit manqué — dans les deux cas sans usage. Deux jours et
 * non deux heures : de quoi lire le journal après un salon qui s'est mal passé.
 */
create or replace function purge_rappels()
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare n integer;
begin
  delete from rappel_de_conference where envoi_a < now() - interval '2 days';
  get diagnostics n = row_count;
  return n;
end;
$$;

comment on function purge_rappels is
  'Efface les rappels dont l''heure est passée depuis plus de deux jours. Lancée chaque nuit par pg_cron.';

revoke all on function purge_rappels() from public;

-- ------------------------------------------------------------ la minute
/*
 * Ce qui tient l'heure.
 *
 * `pg_cron` réveille la fonction `rappels` à chaque minute ; elle prend ce qui
 * est dû et le poste. La minute est la granularité du besoin : un rappel à
 * quinze minutes qui part à quatorze ou à seize ne gêne personne, et descendre
 * plus bas coûterait soixante fois plus d'appels pour rien.
 *
 * L'adresse appelée est celle de ce projet, et se remplace sans migration par
 * `alter database … set app.rappels_url = '…'` — une autre instance, un essai
 * local.
 *
 * Sous garde, comme la purge des jetons : `pg_cron` et `pg_net` sont des
 * extensions de la plateforme, et une base montée sans elles ne doit pas faire
 * échouer le déploiement de tout ce qui précède. Les rappels ne partent alors
 * pas, et l'avertissement reste dans le journal.
 */
do $$
begin
  create extension if not exists pg_cron with schema pg_catalog;
exception when others then
  raise warning 'pg_cron indisponible (%) : les rappels de conférence ne partiront pas.', sqlerrm;
end $$;

do $$
begin
  create extension if not exists pg_net;
exception when others then
  raise warning 'pg_net indisponible (%) : les rappels de conférence ne partiront pas.', sqlerrm;
end $$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    grant usage on schema cron to postgres;
    grant all privileges on all tables in schema cron to postgres;
  end if;
exception when others then
  raise warning 'Droits sur le schéma cron non accordés (%).', sqlerrm;
end $$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from pg_extension where extname = 'pg_net') then
    -- un même nom remplace la tâche : rejouer la migration ne la double pas
    perform cron.schedule('rappels-de-conference', '* * * * *', $cron$
      select net.http_post(
        url := coalesce(
          current_setting('app.rappels_url', true),
          'https://jylkfskotuafptaxujao.supabase.co/functions/v1/rappels/envoi'),
        headers := '{"Content-Type": "application/json"}'::jsonb,
        body := '{}'::jsonb,
        timeout_milliseconds := 20000)
    $cron$);
  end if;
exception when others then
  raise warning 'Tâche des rappels non programmée (%) : les rappels ne partiront pas.', sqlerrm;
end $$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- 02 h 11, entre la purge des jetons et la sauvegarde
    perform cron.schedule('purge-des-rappels', '11 2 * * *',
                          'select public.purge_rappels()');
  end if;
exception when others then
  raise warning 'Purge des rappels non programmée (%).', sqlerrm;
end $$;
