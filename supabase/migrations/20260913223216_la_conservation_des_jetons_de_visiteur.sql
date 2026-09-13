-- La conservation des jetons de visiteur
--
-- Pourquoi : la mesure d'usage tourne sans bandeau de consentement parce
-- qu'elle entre dans l'exemption que la CNIL accorde à la mesure d'audience —
-- et non parce qu'elle ne pose pas de cookie. Le jeton de visiteur, rangé dans
-- le stockage du navigateur, est un traceur au même titre (article 82 de la loi
-- Informatique et Libertés). L'exemption tient à des conditions, dont une
-- durée : ce que le traceur a permis de recueillir ne se garde pas au-delà de
-- vingt-cinq mois. Deux tables portaient encore des jetons que rien n'effaçait
-- avec le temps.
--
--   · `visiteur_jour`, un jeton par salon, par jour et par porte.
--     `purge_presences` ne vidait que sa voisine par stand, `visiteur_cible` :
--     les jetons du salon entier restaient pour toujours. Ils partent désormais
--     au même âge, quatre cents jours. Un seul délai, celui que la notice du
--     plan annonce, et qui garde lisible l'édition précédente d'un salon annuel
--     (voir `20260913170035_les_visiteurs_uniques_par_stand.sql`). Les
--     compteurs restent : ils ne portent aucun jeton, et le rapport y lit
--     toujours les visites d'antan — seuls les visiteurs uniques s'en vont.
--
--   · `mesure`, le journal que les compteurs ont remplacé le 8 septembre, où
--     plus rien n'écrit. Tout ce qu'il contenait a été repris par
--     `20260908000001_compteurs.sql`, dont le commentaire annonçait qu'une
--     migration ultérieure pourrait le supprimer : la voici. Il gardait chaque
--     jeton avec l'heure de chaque geste — le détail le plus fin que ce système
--     ait jamais tenu, et le seul que personne ne lisait.
--
-- Et un rendez-vous qui ne dépende de personne. La purge ne tournait qu'à la
-- synchronisation d'un salon, geste d'exploitant fait depuis la console : une
-- saison creuse sans synchronisation, et plus rien ne s'effaçait, alors que la
-- notice promet une durée. `pg_cron` la lance désormais chaque nuit. L'appel à
-- la synchronisation reste en place : une purge qui ne trouve rien ne coûte
-- qu'une lecture d'index.
--
-- Ce qui survit ailleurs, pour mémoire : les sauvegardes nocturnes
-- (`sauvegarde.yml`) gardent quatre-vingt-dix jours de copies, si bien qu'un
-- jeton peut y durer quelque quatre cent quatre-vingt-dix jours — loin des
-- vingt-cinq mois. Une sauvegarde antérieure à cette migration porte encore la
-- table `mesure` : versée sur une base à jour, elle laisse une erreur sur cette
-- seule table, et le reste se restaure.

-- ------------------------------------------------------------------ purge
/*
 * Les jours se purgent comme les présences, et par le même genre d'index.
 *
 * Sans lui, la purge parcourrait la table entière à chaque passage : sa clé
 * commence par le salon, et la purge n'en nomme aucun.
 */
create index if not exists visiteur_jour_jour on visiteur_jour (jour);

/*
 * La purge couvre désormais tout ce qui porte un jeton.
 *
 * Même nom, même signature, même appelant : la synchronisation l'appelle déjà
 * sans argument, et une fonction renommée l'aurait laissée appeler dans le
 * vide — l'échec y est muet par construction. Le nom dit « présences », et un
 * jeton vu tel jour en est une.
 *
 * Même plancher contre l'argument mal tapé : un appel avec `0` viderait la
 * mesure d'un salon en cours.
 */
create or replace function purge_presences(p_jours integer default 400)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_limite constant date := current_date - greatest(coalesce(p_jours, 400), 31);
  n_presence bigint; n_visiteur bigint;
begin
  delete from visiteur_cible where jour < v_limite;
  get diagnostics n_presence = row_count;
  delete from visiteur_jour where jour < v_limite;
  get diagnostics n_visiteur = row_count;
  return n_presence + n_visiteur;
end;
$$;

comment on function purge_presences is
  'Efface les jetons de visiteur de plus de N jours (400 par défaut, jamais moins de 31) : présences par stand et visiteurs par jour. Lancée chaque nuit par pg_cron, et à chaque synchronisation.';

revoke all on function purge_presences(integer) from public;
grant execute on function purge_presences(integer) to service_role;

-- ------------------------------------------------------------ remise à zéro
/*
 * La remise à zéro sans le journal, qui n'existe plus.
 *
 * Elle rend les mêmes clés qu'avant, `journal` en moins : la console fait la
 * somme en comptant zéro pour une clé absente, si bien que l'ordre dans lequel
 * cette migration et la page arrivent en production n'y change rien.
 */
create or replace function reinitialise_compteurs(p_evenement uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  n_compteur bigint; n_cible bigint; n_visiteur bigint; n_presence bigint;
begin
  if not acces_salon(p_evenement) then
    raise exception 'Ce salon ne vous est pas accessible.' using errcode = '42501';
  end if;

  delete from compteur where evenement_id = p_evenement;
  get diagnostics n_compteur = row_count;
  delete from compteur_cible where evenement_id = p_evenement;
  get diagnostics n_cible = row_count;
  delete from visiteur_cible where evenement_id = p_evenement;
  get diagnostics n_presence = row_count;
  delete from visiteur_jour where evenement_id = p_evenement;
  get diagnostics n_visiteur = row_count;

  return jsonb_build_object(
    'compteurs', n_compteur,
    'cibles',    n_cible,
    'presences', n_presence,
    'visiteurs', n_visiteur);
end;
$$;

comment on function reinitialise_compteurs is
  'Efface toute la mesure d''un salon — fréquentation, audience par stand, présences, jetons de visiteurs. Irréversible. Ne touche pas à « cible », qui porte les libellés.';

revoke all on function reinitialise_compteurs(uuid) from public;
grant execute on function reinitialise_compteurs(uuid) to authenticated;

-- ---------------------------------------------------------------- le journal
drop table if exists mesure;

-- ------------------------------------------------------------------ la nuit
/*
 * Chaque nuit, avant la sauvegarde.
 *
 * 01 h 43 UTC, une demi-heure avant `sauvegarde.yml` (02 h 17) : la copie de
 * la nuit n'emporte pas les jetons que la purge vient de rendre caducs.
 *
 * Sous garde. `pg_cron` est une extension de la plateforme : si elle venait à
 * manquer — une base locale montée sans elle, une offre qui la retirerait —,
 * l'échec de sa création ne doit pas bloquer le déploiement de tout ce qui
 * suit. La purge garde alors son autre rendez-vous, la synchronisation, et
 * l'avertissement reste dans le journal du déploiement.
 *
 * Les droits sont ceux que Supabase prescrit à l'installation. La tâche tourne
 * sous le rôle qui l'a programmée, propriétaire de la fonction : le retrait des
 * droits publics ne la concerne pas.
 */
do $$
begin
  create extension if not exists pg_cron with schema pg_catalog;
exception when others then
  raise warning 'pg_cron indisponible (%) : la purge des jetons ne tournera qu''à la synchronisation.', sqlerrm;
end $$;

-- à part de la tâche : un refus sur les droits ne doit pas la coûter
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
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- un même nom remplace la tâche : rejouer la migration ne la double pas
    perform cron.schedule('purge-des-jetons-de-visiteur', '43 1 * * *',
                          'select public.purge_presences()');
  end if;
exception when others then
  raise warning 'Purge nocturne non programmée (%) : elle ne tournera qu''à la synchronisation.', sqlerrm;
end $$;
