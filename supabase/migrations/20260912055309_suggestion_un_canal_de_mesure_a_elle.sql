-- Suggestion : un canal de mesure à elle
--
-- Pourquoi : un exposant proposé au bas du parcours, ou dans la fenêtre qui
-- vient au premier plan, se lit et s'ajoute comme n'importe quel autre. Les
-- compteurs enregistraient donc ses fiches et ses ajouts sans les distinguer de
-- ceux qu'on est allé chercher soi-même, et l'on ne pouvait pas répondre à la
-- seule question qui décide de garder la fonction ou de l'éteindre : est-ce
-- qu'elle sert ?
--
-- Le vocabulaire des canaux s'ouvre donc d'un mot, « suggestion ». Il reste
-- clos pour tout le reste : un canal inventé rejoint toujours « autre » plutôt
-- que d'entrer en base sous un nom approximatif.
--
-- Deux fonctions sont réécrites, à l'identique près de cela.
-- `enregistre_mesures` pour accepter le canal ; `audience_cibles` pour rendre
-- ce qu'il a compté — les fiches ouvertes depuis la suggestion paraissent
-- d'elles-mêmes dans `canaux`, les ajouts au parcours demandaient un champ, les
-- leurs étant rangés sous un genre qui ne détaille pas ses provenances.
--
-- Rien à reprendre dans ce qui est déjà enregistré : aucun geste passé ne
-- portait ce canal, et les compteurs d'hier gardent exactement leur sens.

create or replace function enregistre_mesures(
  p_slug     text,
  p_visiteur text,
  p_gestes   jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  GENRES constant text[] := array[
    'visite', 'recherche', 'itineraire', 'parcours', 'fiche_stand', 'fiche_conf'];
  -- les gestes qui peuvent désigner quelque chose, et ce qu'ils désignent
  VISANTS constant text[] := array[
    'fiche_stand', 'fiche_conf', 'itineraire', 'parcours'];
  OBJETS constant text[] := array['fiche_stand', 'fiche_conf'];
  CANAUX constant text[] := array[
    'recherche', 'liste', 'plan', 'image', 'conference', 'salle', 'exposant',
    'parcours', 'lien', 'suggestion'];
  v_evt    uuid;
  v_tz     text;
  v_jour   date;
  v_gestes jsonb;
begin
  select e.id, e.fuseau into v_evt, v_tz
    from evenement e
   where e.slug = p_slug and e.etat = 'publie';
  if v_evt is null then return false; end if;

  -- Le jour se date dans le fuseau du salon : sinon les deux premières heures
  -- d'une soirée parisienne tomberaient la veille. Un fuseau inconnu ferait
  -- échouer la conversion : on retombe sur UTC.
  if v_tz is null or not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;
  v_jour := (now() at time zone v_tz)::date;

  /* On nettoie une fois, on compte trois fois.

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

  insert into compteur (evenement_id, heure, genre, canal, n)
  select v_evt, date_trunc('hour', now()), x->>'genre', x->>'canal', count(*)
    from jsonb_array_elements(v_gestes) x
   group by 1, 2, 3, 4
      on conflict (evenement_id, heure, genre, canal)
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

  insert into visiteur_jour (evenement_id, jour, visiteur, parcours)
  values (v_evt, v_jour, p_visiteur,
          exists (select 1 from jsonb_array_elements(v_gestes) x
                   where x->>'genre' = 'parcours'))
      on conflict (evenement_id, jour, visiteur)
      do update set parcours = visiteur_jour.parcours or excluded.parcours;

  return true;
end;
$$;

create or replace function audience_cibles(
  p_evenement uuid,
  p_jours     integer default null,
  p_genre     text    default 'fiche_stand',
  -- toutes les cibles et tout leur détail : ce que le tableur demande
  p_complet   boolean default false
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with p as (select * from periode_salon(p_evenement, p_jours)),
  /* Un seul balayage de la période, tous gestes confondus. Le filtre porte sur
     `objet` et non sur `genre` : c'est lui qui dit de quoi on parle depuis que
     les deux sont séparés, et pour une fiche ouverte les deux se valent. */
  lues as (
    select cc.genre, cc.cible, cc.canal, cc.n
      from compteur_cible cc
     where cc.evenement_id = p_evenement
       -- le vocabulaire reste clos : un genre inventé ne rend rien plutôt que
       -- de faire croire à un salon sans audience
       and p_genre in ('fiche_stand', 'fiche_conf')
       and cc.objet = p_genre
       and ((select depuis from p) is null or cc.jour >= (select depuis from p))
  ),
  somme as (
    select cible, sum(n)::bigint as n from lues where genre = p_genre group by 1
  ),
  canaux as (
    select cible, jsonb_object_agg(canal, n) as par
      from (select cible, case when canal = '' then 'autre' else canal end as canal,
                   sum(n)::bigint as n
              from lues where genre = p_genre group by 1, 2) t
     group by cible
  ),
  itis  as (select cible, sum(n)::bigint as n from lues where genre = 'itineraire' group by 1),
  parcs as (select cible, sum(n)::bigint as n from lues where genre = 'parcours'   group by 1),
  /* Les ajouts au parcours venus de la suggestion. À part des autres, et non
     déduits d'eux : c'est le seul chiffre qui dise si proposer un exposant de
     plus sert à quelque chose, et le noyer dans le total des ajouts revenait à
     ne pas le mesurer. Les fiches ouvertes depuis la suggestion, elles, sont
     déjà dans `canaux` — un canal de plus n'y demande rien. */
  sugg  as (select cible, sum(n)::bigint as n from lues
             where genre = 'parcours' and canal = 'suggestion' group by 1),
  /*
   * Les deux côtés comptent, d'où la jointure pleine.
   *
   * À gauche, une cible retirée du salon depuis garde ses consultations : les
   * taire fausserait le total qu'on affiche. À droite, un stand que personne
   * n'a ouvert n'a aucune ligne de compteur — et c'est précisément celui que
   * le tableur doit montrer.
   */
  base as (
    select coalesce(s.cible, c.id) as id, c.code, c.nom, coalesce(s.n, 0) as n
      from somme s
      full join (select id, code, nom from cible
                  where evenement_id = p_evenement and genre = p_genre) c
        on c.id = s.cible
     where p_complet or s.cible is not null
  )
  select jsonb_build_object(
    'genre',   p_genre,
    'jours',   p_jours,
    'complet', p_complet,
    'fuseau',  (select tz from p),
    'debut',   (select depuis from p),
    'total',   (select coalesce(sum(n), 0) from somme),
    /* De quand date le comptage par objet, toutes périodes confondues. Sans
       lui, une page ne sait pas distinguer « personne n'a ouvert de fiche » de
       « on ne comptait pas encore les fiches » — et le journal qui a précédé
       les compteurs ne retenait pas leur objet, si bien que ce jour-là est
       postérieur au premier visiteur mesuré. */
    'depuis', (select min(jour) from compteur_cible
                where evenement_id = p_evenement and genre = p_genre),
    'cibles', (select coalesce(jsonb_agg(
                 case when p_complet then jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n,
                        'canaux',      coalesce(k.par, '{}'::jsonb),
                        'itineraires', coalesce(i.n, 0),
                        'parcours',    coalesce(p2.n, 0),
                        'suggestions', coalesce(g.n, 0))
                      else jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n)
                 end
                 order by b.n desc, b.code nulls last), '[]'::jsonb)
                 from base b
                 left join canaux k  on k.cible  = b.id
                 left join itis   i  on i.cible  = b.id
                 left join parcs  p2 on p2.cible = b.id
                 left join sugg   g  on g.cible  = b.id)
  );
$$;
