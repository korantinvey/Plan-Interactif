-- Remettre les compteurs d'un salon à zéro
--
-- La recette d'un plan se fait sur le plan lui-même : on ouvre des fiches, on
-- cherche une enseigne, on calcule un itinéraire — et sur la page publique,
-- seule à mesurer. Ces gestes sont ceux de l'exploitant, pas de ses visiteurs.
-- Rien ne les en distingue à l'écriture : la page publique ne regarde aucune
-- session, c'est ce qui lui permet de ne poser ni cookie ni identité. Le
-- premier chiffre du salon est donc faux, et tous ceux qui en découlent.
--
-- D'où cette remise à zéro : explicite, par salon, et déclenchée par celui qui
-- sait quand la recette est finie. Il n'y a pas d'automatisme possible — la
-- veille de l'ouverture, personne ne peut dire au système que les visites qui
-- suivent sont les vraies.
--
-- Trois tables vidées, une quatrième gardée, une cinquième vidée pour une
-- raison qui n'est pas la même.
--
--   · `compteur`, `compteur_cible`, `visiteur_jour` : c'est la mesure, elle
--     part entière.
--
--   · `cible` reste. Ce n'est pas de la mesure mais le vocabulaire écrit par
--     la synchronisation — le numéro et l'enseigne de chaque stand. La vider
--     ne remettrait aucun compteur à zéro, et priverait le rapport de ses
--     libellés jusqu'à la synchronisation suivante.
--
--   · `mesure` — le journal que les compteurs ont remplacé, où plus rien ne
--     s'écrit — part aussi, pour ce salon. Non pour ce qu'il pèse, mais parce
--     que la reprise de `20260908000001_compteurs.sql` s'arme sur « compteur
--     est vide » : une remise à zéro qui l'épargnerait rendrait cette
--     migration capable de ressusciter les anciens gestes le jour où on la
--     rejoue sur une base neuve. On ne laisse pas derrière soi de quoi défaire
--     ce qu'on vient de faire.

-- ---------------------------------------------------------------- politiques
/*
 * L'effacement passe par les politiques, comme la lecture — c'est la règle du
 * schéma, et la fonction ci-dessous n'y ajoute aucun pouvoir : elle est en
 * « security invoker ». Un compte qui n'a pas accès au salon ne peut pas plus
 * effacer ses compteurs en appelant la fonction qu'en s'adressant aux tables.
 *
 * Aucune politique d'insertion ni de mise à jour n'est ouverte pour autant :
 * l'écriture reste le monopole de `enregistre_mesures()`, qui tient la clé de
 * service et filtre ce qu'on lui donne. Ouvrir en écriture ce qu'on ouvre en
 * effacement ferait de ces tables un formulaire de spam.
 */
create policy "effacement des mesures accessibles" on mesure
  for delete to authenticated using (acces_salon(evenement_id));
create policy "effacement des compteurs accessibles" on compteur
  for delete to authenticated using (acces_salon(evenement_id));
create policy "effacement des compteurs par cible accessibles" on compteur_cible
  for delete to authenticated using (acces_salon(evenement_id));
create policy "effacement des visiteurs accessibles" on visiteur_jour
  for delete to authenticated using (acces_salon(evenement_id));

-- ----------------------------------------------------------------- fonction
/*
 * Tout ou rien, et le compte de ce qui est parti.
 *
 * En une transaction : quatre effacements séparés laisseraient, s'ils
 * échouaient à mi-chemin, un salon dont les visiteurs uniques ne
 * correspondraient plus à ses visites — pire qu'un salon faux, un salon
 * incohérent.
 *
 * Le refus est explicite plutôt que silencieux. Sous « security invoker »,
 * un compte sans accès effacerait zéro ligne et s'entendrait répondre
 * « zéro compteur effacé », ce qui se lit comme une réussite. Sur un geste
 * irréversible, l'écran doit pouvoir dire la différence entre « il n'y avait
 * rien » et « ce n'est pas votre salon ».
 */
create or replace function reinitialise_compteurs(p_evenement uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  n_compteur bigint; n_cible bigint; n_visiteur bigint; n_journal bigint;
begin
  if not acces_salon(p_evenement) then
    raise exception 'Ce salon ne vous est pas accessible.' using errcode = '42501';
  end if;

  delete from compteur where evenement_id = p_evenement;
  get diagnostics n_compteur = row_count;
  delete from compteur_cible where evenement_id = p_evenement;
  get diagnostics n_cible = row_count;
  delete from visiteur_jour where evenement_id = p_evenement;
  get diagnostics n_visiteur = row_count;
  delete from mesure where evenement_id = p_evenement;
  get diagnostics n_journal = row_count;

  return jsonb_build_object(
    'compteurs', n_compteur,
    'cibles',    n_cible,
    'visiteurs', n_visiteur,
    'journal',   n_journal);
end;
$$;

comment on function reinitialise_compteurs is
  'Efface toute la mesure d''un salon — fréquentation, audience par stand, jetons de visiteurs, journal hérité. Irréversible. Ne touche pas à « cible », qui porte les libellés.';

revoke all on function reinitialise_compteurs(uuid) from public;
grant execute on function reinitialise_compteurs(uuid) to authenticated;
