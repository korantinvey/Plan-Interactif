-- Les réglages d'apparence fusionnés clé par clé en base
--
-- Pourquoi : l'enregistrement de l'administration ne renvoyait déjà que les
-- clés que son poste avait changées, mais il les fusionnait lui-même — il
-- lisait le bloc du pavillon, y posait ses clés, puis réécrivait le bloc
-- entier. Entre la lecture et l'écriture, un second administrateur pouvait
-- enregistrer : son réglage était alors écrasé par le bloc lu avant lui, et
-- disparaissait pour tout le monde sans que personne l'ait retiré.
--
-- `fusionne_apparence` fait la fusion dans l'écriture même : les clés
-- retirées sortent, les clés posées entrent, le reste du bloc tel que la base
-- le tient à cet instant. Deux enregistrements croisés gardent chacun leurs
-- clés.
--
-- Sécurité de l'appelant (`security invoker`) : la règle d'écriture sur
-- l'apparence (« écriture sur l'apparence accessible ») reste seule juge, et
-- un organisateur ne fusionne que dans les pavillons de ses salons.

create or replace function fusionne_apparence(
  p_plan_id  uuid,
  p_pile     jsonb,
  p_posees   jsonb,
  p_retirees text[]
) returns void
language sql
security invoker
set search_path = public
as $$
  insert into apparence as a (plan_id, pile, reglages, modifie_le)
  values (p_plan_id, coalesce(p_pile, '[]'::jsonb), coalesce(p_posees, '{}'::jsonb), now())
  on conflict (plan_id) do update
    set pile       = coalesce(excluded.pile, a.pile),
        reglages   = (a.reglages - coalesce(p_retirees, '{}'::text[])) || coalesce(p_posees, '{}'::jsonb),
        modifie_le = now();
$$;

revoke all on function fusionne_apparence(uuid, jsonb, jsonb, text[]) from public, anon;
grant execute on function fusionne_apparence(uuid, jsonb, jsonb, text[]) to authenticated;
