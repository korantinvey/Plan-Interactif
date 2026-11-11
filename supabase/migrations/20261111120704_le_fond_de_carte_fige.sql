-- Le fond de carte figé
--
-- Pourquoi : le fond de carte se dessinait en direct chez chaque visiteur.
-- Pour un fond vectoriel, cela voulait dire MapLibre — huit cents kilo-octets
-- de script à lire, un second contexte WebGL à monter et ses programmes à
-- compiler, des tuiles entières à décoder pour en garder un carré —, puis un
-- recadrage à chaque vue posée. Sur FUNEXPO 2026 la sonde en relevait des gels
-- de 0,4 à 5,4 s (10 novembre 2026). Or tout y est fixe : le carré autour du
-- hall, son cap, son style. Chaque visiteur recalculait la même image.
--
-- L'exploitant la calcule donc une fois, en enregistrant son calage : la page
-- d'administration photographie le fond retenu, orienté comme le plan, en une
-- pyramide d'images, et les range ici. Le visiteur reçoit des images, rien
-- d'autre (`modules/fige-carte.mjs`, `modules/environs.mjs` `imagesFigees`).
--
-- Dans Storage, et non en base64 dans une table comme les icônes et les
-- vignettes : un fond figé pèse quelques mégaoctets par pavillon, en une
-- centaine d'images, et le relais du Worker n'accepte que mille écritures de
-- son stockage par jour — chaque image servie par lui en aurait coûté une. Un
-- seau public les sert sans passer ni par une fonction ni par le relais, sous
-- une adresse qui porte son lot et ne change donc jamais de contenu.
--
--   environs/<id du pavillon>/<lot>/<niveau>/<colonne>/<ligne>.webp
--
-- Le premier dossier nomme le pavillon : c'est lui qui dit qui peut écrire,
-- par la même règle que le pavillon lui-même (`acces_salon`). Le calage qui
-- désigne le lot vit dans `plan.calage.fige`.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('environs', 'environs', true, 2097152,
        array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

/*
 * Le pavillon nommé en tête d'un chemin du seau est-il administrable par le
 * compte connecté ?
 *
 * Le nom est vérifié avant d'être converti : un chemin qui ne commence pas par
 * un identifiant ferait lever la conversion, et l'erreur remonterait comme une
 * panne de la politique au lieu d'un simple refus.
 */
create or replace function environs_accessible(p_nom text) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when split_part(p_nom, '/', 1) ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then exists (
      select 1 from plan p
      where p.id = split_part(p_nom, '/', 1)::uuid and acces_salon(p.evenement_id))
    else false
  end;
$$;

comment on function environs_accessible(text) is
  'Vrai si le pavillon nommé en tête du chemin d''une image du fond figé est administrable par le compte connecté.';

/* La lecture publique passe par l'adresse publique du seau, qui ne consulte
   aucune politique. Celle-ci ne sert qu'à l'exploitant : lister un pavillon
   pour en retirer les lots d'avant, et remplacer une image — Storage demande
   la lecture pour écraser. */
drop policy if exists "environs : lecture par l'exploitant" on storage.objects;
create policy "environs : lecture par l'exploitant" on storage.objects
  for select to authenticated
  using (bucket_id = 'environs' and environs_accessible(name));

drop policy if exists "environs : dépôt par l'exploitant" on storage.objects;
create policy "environs : dépôt par l'exploitant" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'environs' and environs_accessible(name));

drop policy if exists "environs : remplacement par l'exploitant" on storage.objects;
create policy "environs : remplacement par l'exploitant" on storage.objects
  for update to authenticated
  using (bucket_id = 'environs' and environs_accessible(name))
  with check (bucket_id = 'environs' and environs_accessible(name));

drop policy if exists "environs : retrait par l'exploitant" on storage.objects;
create policy "environs : retrait par l'exploitant" on storage.objects
  for delete to authenticated
  using (bucket_id = 'environs' and environs_accessible(name));
