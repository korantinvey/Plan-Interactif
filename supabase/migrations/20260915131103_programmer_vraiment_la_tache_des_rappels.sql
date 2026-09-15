-- Programmer vraiment la tâche des rappels
--
-- La migration précédente a posé la table, les fonctions, et deux tâches
-- `pg_cron`. La purge nocturne est bien là. Celle qui envoie les rappels à la
-- minute, non — et le déploiement est passé au vert sans rien dire.
--
-- Le mécanisme de l'échec mérite d'être écrit, parce qu'il se reproduira
-- ailleurs. Le bloc était « sous garde », sur le modèle de la purge des jetons :
--
--     if exists (… 'pg_cron') and exists (… 'pg_net') then
--       perform cron.schedule('rappels-de-conference', '* * * * *', …);
--     end if;
--
-- `pg_net` n'étant pas installé, la condition était fausse, rien ne s'est
-- programmé, et aucune exception n'a été levée puisqu'il n'y avait pas d'erreur
-- à attraper : le `if` a simplement été faux. La garde, pensée pour qu'une base
-- montée sans extension ne bloque pas le déploiement, a transformé une panne
-- totale en silence complet — les visiteurs pouvaient s'abonner, la promesse
-- s'affichait, et rien ne serait jamais parti.
--
-- On en tire deux règles, appliquées ici.
--
-- **Ce qui manque se dit, et coûte le déploiement.** Une purge qui ne tourne pas
-- fait grossir une table ; un rappel qui ne part pas rompt une promesse faite à
-- un visiteur, et personne ne s'en aperçoit avant le salon. Ces deux-là ne
-- valent pas la même indulgence : cette migration **échoue** si la tâche n'est
-- pas programmée à la fin.
--
-- **On vérifie ce qu'on a fait, pas ce qu'on a demandé.** Appeler
-- `cron.schedule` ne prouve rien ; c'est la présence de la ligne dans
-- `cron.job` qui le prouve, et c'est elle qu'on relit.
--
-- Le schéma de `pg_net` est relevé plutôt que supposé : selon l'installation,
-- `http_post` vit dans `net` ou ailleurs, et coder le nom en dur était la
-- seconde façon de se tromper en silence.

-- ---------------------------------------------------------------- l'extension
/*
 * `pg_net` permet à la base d'appeler une adresse HTTP. Sans lui, rien ne peut
 * réveiller la fonction qui poste les notifications.
 *
 * Sa création reste tentée ici — elle suffit sur une installation qui l'autorise
 * — mais son échec n'est plus avalé : il est redit par l'exception finale, avec
 * le geste qui le répare.
 */
do $$
begin
  create extension if not exists pg_net;
exception when others then
  raise warning 'Création de pg_net refusée (%) : à activer depuis le tableau de bord.', sqlerrm;
end $$;

-- ------------------------------------------------------------------ la tâche
do $$
declare
  /* L'adresse appelée est celle de ce projet, et se remplace sans migration par
     `alter database … set app.rappels_url = '…'`. */
  v_url    text := coalesce(
    current_setting('app.rappels_url', true),
    'https://jylkfskotuafptaxujao.supabase.co/functions/v1/rappels/envoi');
  v_schema text;
  v_cmd    text;
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'pg_cron absent : les rappels de conférence ne partiront pas. '
      'Activez l''extension (tableau de bord → Database → Extensions), puis rejouez.';
  end if;

  /* Relevé, non supposé : `http_post` vit dans le schéma où `pg_net` a été
     installé, et une adresse codée en dur y échouerait sans bruit. */
  select n.nspname into v_schema
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where p.proname = 'http_post'
   order by case when n.nspname = 'net' then 0 else 1 end
   limit 1;

  if v_schema is null then
    raise exception 'pg_net absent : la base ne peut appeler aucune adresse, et '
      'les rappels de conférence ne partiront pas. Activez l''extension '
      '(tableau de bord → Database → Extensions → pg_net), puis rejouez.';
  end if;

  v_cmd := format(
    'select %I.http_post(url := %L, headers := %L::jsonb, body := %L::jsonb, '
    'timeout_milliseconds := 20000)',
    v_schema, v_url, '{"Content-Type": "application/json"}', '{}');

  -- un même nom remplace la tâche : rejouer ne la double pas
  perform cron.schedule('rappels-de-conference', '* * * * *', v_cmd);

  /* Ce qui manquait la première fois : relire. Demander ne suffit pas. */
  if not exists (select 1 from cron.job
                  where jobname = 'rappels-de-conference' and active) then
    raise exception 'La tâche « rappels-de-conference » n''a pas été programmée, '
      'et aucun rappel ne partira.';
  end if;

  raise notice 'Tâche « rappels-de-conference » programmée : % (schéma %).',
    v_cmd, v_schema;
end $$;
