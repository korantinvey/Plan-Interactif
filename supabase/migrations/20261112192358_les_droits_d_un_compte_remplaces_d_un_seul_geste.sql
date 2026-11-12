-- Les droits d'un compte remplacés d'un seul geste
--
-- Pourquoi : la fonction `comptes` remplaçait la liste des salons d'un compte
-- en deux requêtes — tout effacer, puis tout poser —, chacune validée à part.
-- Deux administrateurs qui modifiaient au même moment le même organisateur
-- pouvaient s'entrelacer : effacement A, effacement B, ajout A, ajout B. Le
-- compte gardait l'union des deux listes, chacun recevait « fait », et un salon
-- qu'on venait de lui retirer lui restait ouvert. La revue de CodeRabbit l'a
-- relevé (pull request #529, risques d'architecture).
--
-- Une fonction fait désormais le remplacement dans une seule transaction, et
-- met en file, par un verrou, deux remplacements du même compte : le second
-- remplace bien le premier.

create or replace function remplace_acces(p_profil uuid, p_evenements uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('acces:' || p_profil::text, 0));
  delete from acces where profil_id = p_profil;
  insert into acces (profil_id, evenement_id)
  select p_profil, e
    from unnest(coalesce(p_evenements, '{}'::uuid[])) as e
  on conflict do nothing;
end;
$$;

comment on function remplace_acces is
  'Remplace en une transaction les salons ouverts à un compte. Réservée à la fonction « comptes », sous la clé de service.';

-- Seule la fonction « comptes » s'en sert, après avoir vérifié que l'appelant
-- est administrateur : ni un visiteur ni un compte connecté ne l'appellent.
revoke all on function remplace_acces(uuid, uuid[]) from public, anon, authenticated;
grant execute on function remplace_acces(uuid, uuid[]) to service_role;
