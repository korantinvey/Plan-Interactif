-- La porte publique des mesures
--
-- Pourquoi : un essai de charge — trois mille visiteurs arrivés en une
-- demi-minute — a montré que le chemin des mesures plafonnait vers cent
-- paquets par seconde, six sur dix abandonnés au bout de trente secondes,
-- alors que le plan, servi depuis le cache, répondait en quatre-vingts
-- millisecondes au même rythme. Ce n'était pas l'écriture : les paquets visaient
-- un salon inexistant, et rien ne s'écrivait. C'était l'étage des fonctions —
-- chaque paquet réveillait la fonction `mesure`, qui n'appelait que ceci.
--
-- Le Worker appelle donc la base directement, par son interface REST, sans
-- passer par une fonction. Cette interface est ouverte à quiconque tient la
-- clé publique — qui circule dans chaque page, c'est son rôle. Ce que la
-- fonction `mesure` bornait doit donc l'être ici, la seule porte qu'on ne
-- contourne pas : jetons réduits à une forme connue, soixante gestes au plus,
-- attente bornée. Le reste — genres, canaux, supports, cibles, salon publié —
-- `enregistre_mesures` le tenait déjà, et le tient toujours : on ne la touche
-- pas, on se pose devant.
--
-- La fonction `mesure` reste déployée : c'est le repli du Worker quand cette
-- porte manque — le Worker et la base ne se déploient pas au même instant —
-- ou qu'elle flanche.

create or replace function mesure_publique(
  p_slug     text,
  p_visiteur text,
  p_gestes   jsonb,
  p_support  text    default '',
  p_retenu   boolean default true,
  p_recul    integer default 0
) returns boolean
language plpgsql
-- l'appelant est anonyme : c'est le propriétaire qui écrit, et seulement ainsi
security definer
set search_path = public
as $$
declare
  -- les bornes de la fonction `mesure`, reprises telles quelles
  PAQUET_MAX constant integer := 60;
  RECUL_MAX  constant integer := 90 * 86400;
  v_slug     text := left(coalesce(p_slug, ''), 80);
  v_visiteur text := left(regexp_replace(coalesce(p_visiteur, ''), '[^A-Za-z0-9_-]', '', 'g'), 40);
  v_gestes   jsonb;
begin
  if v_slug = '' or v_visiteur = '' then
    raise exception 'Paramètres manquants.' using errcode = '22023';
  end if;

  /* Un geste n'entre qu'en une forme connue et bornée. Ce qui n'est pas un
     objet est écarté sans bruit, comme un genre vide : la page a pu envoyer un
     paquet que les filtres vident, et elle n'a rien à en faire. */
  select coalesce(jsonb_agg(jsonb_build_object(
           'genre', genre, 'canal', canal, 'cible', cible, 'objet', objet)), '[]'::jsonb)
    into v_gestes
    from (
      select left(regexp_replace(coalesce(x->>'genre', ''), '[^A-Za-z0-9_-]', '', 'g'), 20) as genre,
             left(regexp_replace(coalesce(x->>'canal', ''), '[^A-Za-z0-9_-]', '', 'g'), 20) as canal,
             left(regexp_replace(coalesce(x->>'cible', ''), '[^A-Za-z0-9_-]', '', 'g'), 64) as cible,
             left(regexp_replace(coalesce(x->>'objet', ''), '[^A-Za-z0-9_-]', '', 'g'), 20) as objet
        from jsonb_array_elements(
               case when jsonb_typeof(p_gestes) = 'array' then p_gestes else '[]'::jsonb end
             ) with ordinality as t(x, rang)
       where rang <= PAQUET_MAX
         and jsonb_typeof(x) = 'object'
    ) g
   where genre <> '';

  if jsonb_array_length(v_gestes) = 0 then return true; end if;

  return enregistre_mesures(
    v_slug, v_visiteur, v_gestes,
    left(regexp_replace(coalesce(p_support, ''), '[^A-Za-z0-9_-]', '', 'g'), 20),
    coalesce(p_retenu, true),
    least(greatest(coalesce(p_recul, 0), 0), RECUL_MAX));
end;
$$;

comment on function mesure_publique is
  'Porte publique des mesures, appelée par le Worker sans fonction intermédiaire : borne le paquet puis le confie à enregistre_mesures.';

revoke all on function mesure_publique(text, text, jsonb, text, boolean, integer) from public;
grant execute on function mesure_publique(text, text, jsonb, text, boolean, integer) to anon, service_role;
