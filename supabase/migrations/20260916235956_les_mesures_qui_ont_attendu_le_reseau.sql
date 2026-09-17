-- Les mesures qui ont attendu le réseau
--
-- Pourquoi : un salon se visite là où le réseau manque — un hall de béton, un
-- forfait épuisé, un wifi saturé par dix mille visiteurs — et le plan y tient
-- déjà tout seul, sur ce que le service de second plan a gardé (`_sw.js`). Les
-- mesures, elles, tombaient : le `fetch` échouait, le `catch` se taisait, et la
-- demi-journée du visiteur resté au fond du hall ne comptait pour rien. Le
-- rapport montrait alors un salon désert aux heures où il était plein — et
-- c'est justement là, au sous-sol, que l'organisateur veut savoir si son plan
-- sert.
--
-- La page range donc ce qui n'a pas pu partir et le renvoie à la reconnexion
-- (`_mesure.html`). Restait la date : le serveur horodatait chaque paquet à sa
-- réception, si bien qu'une matinée sans réseau se serait entassée à midi, à la
-- minute où le visiteur retrouve une barre. Sur un rapport qui se lit par
-- heures, cela ne déplace pas un détail : cela invente un pic et vide une
-- matinée.
--
-- Le paquet dit donc combien de temps il a attendu, et la fonction le retire de
-- `now()`. Un recul plutôt qu'un instant, et c'est tout l'intérêt : c'est une
-- différence entre deux lectures de la même horloge, jamais une heure lue sur
-- l'appareil. Une horloge de téléphone mal réglée — ou réglée sur un autre
-- fuseau, ce qui est le cas ordinaire d'un visiteur venu de loin — ne fausse
-- donc rien, et le serveur n'a rien à savoir de l'heure qu'il est là-bas.
--
-- Il reste que ce nombre vient du navigateur, et ce qui vient du navigateur se
-- borne : trente jours au plus, zéro au moins. Au-delà, le paquet daterait
-- d'avant le salon.

/*
 * Ce que le recul déplace, et ce qu'il ne déplace pas.
 *
 * `compteur.heure` et le jour de `compteur_cible`, `visiteur_cible` et
 * `visiteur_jour` : ce sont les quatre endroits où une mesure porte une date,
 * et les quatre doivent dire quand le geste a eu lieu.
 *
 * Le jour se date toujours dans le fuseau du salon, comme avant — c'est le
 * salon qui définit sa journée, pas l'appareil du visiteur. Le recul s'applique
 * donc à l'instant, et le fuseau à l'instant reculé, dans cet ordre : reculer
 * après avoir daté aurait retranché des secondes à une date.
 *
 * Le reste est inchangé : mêmes filtres, même vocabulaire, même transaction,
 * mêmes quatre tables.
 */
drop function if exists enregistre_mesures(text, text, jsonb, text, boolean);

create or replace function enregistre_mesures(
  p_slug     text,
  p_visiteur text,
  p_gestes   jsonb,
  p_support  text    default '',
  -- faux quand le navigateur a refusé de retenir le jeton du visiteur
  p_retenu   boolean default true,
  -- secondes écoulées entre les gestes et leur arrivée ici
  p_recul    integer default 0
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  /* Un mois : au-delà, le rapport du salon est rendu depuis longtemps et ces
     gestes fausseraient des chiffres arrêtés. La page ne garde de toute façon
     pas si longtemps ce qui attend — mais la borne est ici, où l'on ne peut
     pas la contourner. */
  RECUL_MAX constant integer := 30 * 86400;
  GENRES constant text[] := array[
    'visite', 'recherche', 'itineraire', 'parcours', 'partage',
    'fiche_stand', 'fiche_conf'];
  -- les gestes qui peuvent désigner quelque chose, et ce qu'ils désignent
  VISANTS constant text[] := array[
    'fiche_stand', 'fiche_conf', 'itineraire', 'parcours'];
  OBJETS constant text[] := array['fiche_stand', 'fiche_conf'];
  CANAUX constant text[] := array[
    'recherche', 'liste', 'plan', 'image', 'conference', 'salle', 'exposant',
    'parcours', 'lien', 'suggestion', 'partage'];
  /* Les quatre portes. Closes comme le reste : une valeur inventée rejoint
     « non précisé » plutôt que d'ouvrir une cinquième colonne dans le rapport
     au premier venu qui poste ce qu'il veut. */
  SUPPORTS constant text[] := array['web', 'integre', 'pwa', 'appli'];
  v_evt     uuid;
  v_tz      text;
  v_quand   timestamptz;
  v_jour    date;
  v_support text;
  v_gestes  jsonb;
begin
  select e.id, e.fuseau into v_evt, v_tz
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- L'instant du geste : maintenant, moins ce que le paquet a attendu.
  v_quand := now() - least(greatest(coalesce(p_recul, 0), 0), RECUL_MAX)
                     * interval '1 second';

  -- Le jour se date dans le fuseau du salon : sinon les deux premières heures
  -- d'une soirée parisienne tomberaient la veille. La colonne ne porte qu'un
  -- fuseau lisible ou rien — le déclencheur `fuseau_iana` y veille — et un
  -- salon sans fuseau se compte en UTC.
  v_jour := (v_quand at time zone coalesce(v_tz, 'UTC'))::date;

  v_support := case when p_support = any(SUPPORTS) then p_support else '' end;

  /* On nettoie une fois, on compte quatre fois.

     Un genre hors liste emporte son geste : on ne sait pas ce qu'on compterait.
     Un canal hors liste, non — le geste a bien eu lieu, seule sa provenance
     est illisible, et la perdre fausserait le total d'une fiche ouverte pour
     de bon. Il rejoint les sans-canal, que le rapport nomme « autre ».

     Un objet illisible vide la cible plutôt que le geste, pour la même raison :
     un itinéraire dont on ne sait plus vers quoi reste un itinéraire. */
  select coalesce(jsonb_agg(jsonb_build_object(
           'genre', genre,
           'canal', case when canal = any(CANAUX) then canal else '' end,
           'objet', objet,
           'cible', case when objet = '' then '' else cible end)), '[]'::jsonb)
    into v_gestes
    from (
      select b.genre, b.canal, b.cible,
             case
               -- une fiche ouverte désigne l'objet qui porte son nom
               when b.genre = any(OBJETS) then b.genre
               when b.dit   = any(OBJETS) then b.dit
               else ''
             end as objet
        from (
          select x->>'genre'               as genre,
                 coalesce(x->>'canal', '') as canal,
                 coalesce(x->>'cible', '') as cible,
                 -- « dit » et non « objet » : ce que la page annonce, avant
                 -- qu'on l'ait retenu ou écarté
                 coalesce(x->>'objet', '') as dit
            from jsonb_array_elements(p_gestes) x
        ) b
       where b.genre = any(GENRES)
    ) t;

  -- un paquet vidé par les filtres n'est pas une erreur, et ne fait pas de son
  -- porteur un visiteur de plus
  if jsonb_array_length(v_gestes) = 0 then return true; end if;

  insert into compteur (evenement_id, heure, genre, canal, support, n)
  select v_evt, date_trunc('hour', v_quand), x->>'genre', x->>'canal', v_support, count(*)
    from jsonb_array_elements(v_gestes) x
   group by 1, 2, 3, 4, 5
      on conflict (evenement_id, heure, genre, canal, support)
      do update set n = compteur.n + excluded.n;

  -- Une cible inconnue est écartée plutôt que de faire échouer le paquet
  -- entier : la clé étrangère ne sert plus que de garde-fou.
  insert into compteur_cible (evenement_id, genre, objet, cible, jour, canal, n)
  select v_evt, x->>'genre', x->>'objet', x->>'cible', v_jour, x->>'canal', count(*)
    from jsonb_array_elements(v_gestes) x
   where x->>'genre' = any(VISANTS)
     and x->>'cible' <> ''
     and exists (select 1 from cible c
                  where c.evenement_id = v_evt
                    and c.genre = x->>'objet'
                    and c.id = x->>'cible')
   group by 1, 2, 3, 4, 5, 6
      on conflict (evenement_id, genre, objet, cible, jour, canal)
      do update set n = compteur_cible.n + excluded.n;

  -- La présence : le même filtre, mais sans compter. Ce que cette ligne rend
  -- possible et que la précédente ne pourra jamais rendre, c'est « combien de
  -- personnes », par opposition à « combien de fois ».
  insert into visiteur_cible (evenement_id, objet, cible, genre, canal, jour, visiteur)
  select distinct v_evt, x->>'objet', x->>'cible', x->>'genre', x->>'canal',
         v_jour, p_visiteur
    from jsonb_array_elements(v_gestes) x
   where x->>'genre' = any(VISANTS)
     and x->>'cible' <> ''
     and exists (select 1 from cible c
                  where c.evenement_id = v_evt
                    and c.genre = x->>'objet'
                    and c.id = x->>'cible')
      on conflict do nothing;

  /* Le doute sur le stockage l'emporte sur la confiance : un « et » plutôt
     qu'un « ou ». Un jeton dont un seul envoi a dit qu'il n'était pas retenu
     ne vaut pas un visiteur, et le compter comme tel serait l'inflation qu'on
     cherche justement à rendre visible. */
  insert into visiteur_jour (evenement_id, jour, visiteur, support, parcours, retenu)
  values (v_evt, v_jour, p_visiteur, v_support,
          exists (select 1 from jsonb_array_elements(v_gestes) x
                   where x->>'genre' = 'parcours'),
          coalesce(p_retenu, true))
      on conflict (evenement_id, jour, visiteur, support)
      do update set parcours = visiteur_jour.parcours or excluded.parcours,
                    retenu   = visiteur_jour.retenu and excluded.retenu;

  return true;
end;
$$;

revoke all on function enregistre_mesures(text, text, jsonb, text, boolean, integer) from public;
grant execute on function enregistre_mesures(text, text, jsonb, text, boolean, integer) to service_role;
