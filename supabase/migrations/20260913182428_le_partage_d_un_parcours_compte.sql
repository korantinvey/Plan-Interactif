-- Le partage d'un parcours, compté
--
-- Pourquoi : un visiteur peut désormais passer son parcours de visite à un
-- autre, par code QR ou par lien. Rien n'en était mesuré — ni le geste
-- d'envoyer, ni ce que le destinataire en reprend — et l'on ne pouvait donc pas
-- répondre à la seule question qui décide de garder la fonction ou de
-- l'éteindre : on partage, d'accord, mais est-ce que cela arrive à quelqu'un ?
--
-- Le vocabulaire s'ouvre de deux mots, et de deux seulement. Un genre,
-- « partage » : le parcours envoyé, qui ne vise rien et n'est ni un ajout ni un
-- retrait — le compter parmi les gestes de parcours aurait faussé « N ajouts ou
-- retraits au total », que le rapport affiche. Un canal, « partage » : les rangs
-- qu'un destinataire a repris, qui sont de vrais ajouts et restent comptés avec
-- les autres, le canal disant seulement d'où ils viennent. Tout le reste du
-- vocabulaire demeure clos : un mot inventé rejoint « autre » plutôt que
-- d'entrer en base sous un nom approximatif.
--
-- Trois fonctions sont réécrites, à l'identique près de cela.
-- `enregistre_mesures` pour accepter les deux mots ; `audience_cibles` pour
-- rendre par exposant ce que le canal a compté, en gestes et en visiteurs
-- distincts, comme elle le fait déjà pour la suggestion ; `rapport_utilisation`
-- pour les deux chiffres du salon entier.
--
-- Rien à reprendre dans ce qui est déjà enregistré : aucun geste passé ne porte
-- ce genre ni ce canal, et les compteurs d'hier gardent exactement leur sens.

/* Le genre est aussi tenu par la table, et pas seulement par la fonction : la
   contrainte est ce qui garantit qu'aucun mot inventé n'entre en base même par
   une autre porte. Elle s'ouvre donc du même mot, et de lui seul.

   `compteur_cible` et `visiteur_cible` gardent la leur telle quelle : un
   parcours envoyé ne vise personne, et n'écrit dans aucune des deux. */
alter table compteur drop constraint if exists compteur_genre_check;
alter table compteur add constraint compteur_genre_check
  check (genre in ('visite', 'recherche', 'itineraire', 'parcours', 'partage',
                   'fiche_stand', 'fiche_conf'));

create or replace function enregistre_mesures(
  p_slug     text,
  p_visiteur text,
  p_gestes   jsonb,
  p_support  text    default '',
  -- faux quand le navigateur a refusé de retenir le jeton du visiteur
  p_retenu   boolean default true
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
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
  v_jour    date;
  v_support text;
  v_gestes  jsonb;
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
  select v_evt, date_trunc('hour', now()), x->>'genre', x->>'canal', v_support, count(*)
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
  -- le même balayage, sur la table qui ne compte pas : mêmes bornes, mêmes
  -- filtres, pour que les deux colonnes du classeur parlent du même périmètre
  vus as (
    select vc.genre, vc.cible, vc.canal, vc.visiteur
      from visiteur_cible vc
     where vc.evenement_id = p_evenement
       and p_genre in ('fiche_stand', 'fiche_conf')
       and vc.objet = p_genre
       and ((select depuis from p) is null or vc.jour >= (select depuis from p))
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
  /* Et ceux qui sont entrés par le parcours de quelqu'un d'autre. Même
     raisonnement que pour la suggestion : un stand que huit visiteurs ont repris
     du parcours d'un ami n'a pas été trouvé huit fois, il a été transmis — et
     l'exposant ne lit pas ce chiffre-là comme les autres. */
  part  as (select cible, sum(n)::bigint as n from lues
             where genre = 'parcours' and canal = 'partage' group by 1),
  -- les mêmes, en visiteurs distincts
  v_somme as (
    select cible, count(distinct visiteur)::bigint as v from vus where genre = p_genre group by 1
  ),
  v_canaux as (
    select cible, jsonb_object_agg(canal, v) as par
      from (select cible, case when canal = '' then 'autre' else canal end as canal,
                   count(distinct visiteur)::bigint as v
              from vus where genre = p_genre group by 1, 2) t
     group by cible
  ),
  v_itis  as (select cible, count(distinct visiteur)::bigint as v from vus where genre = 'itineraire' group by 1),
  v_parcs as (select cible, count(distinct visiteur)::bigint as v from vus where genre = 'parcours'   group by 1),
  v_sugg  as (select cible, count(distinct visiteur)::bigint as v from vus
               where genre = 'parcours' and canal = 'suggestion' group by 1),
  v_part  as (select cible, count(distinct visiteur)::bigint as v from vus
               where genre = 'parcours' and canal = 'partage' group by 1),
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
    -- le salon entier, en visiteurs distincts : celui qui a ouvert huit fiches
    -- y compte une fois, alors que « total » l'a compté huit
    'total_visiteurs', (select count(distinct visiteur) from vus where genre = p_genre),
    'total_visiteurs_canaux',
      (select coalesce(jsonb_object_agg(canal, v), '{}'::jsonb) from (
         select case when canal = '' then 'autre' else canal end as canal,
                count(distinct visiteur)::bigint as v
           from vus where genre = p_genre group by 1) t),
    'total_visiteurs_itineraires',
      (select count(distinct visiteur) from vus where genre = 'itineraire'),
    'total_visiteurs_parcours',
      (select count(distinct visiteur) from vus where genre = 'parcours'),
    'total_visiteurs_suggestions',
      (select count(distinct visiteur) from vus where genre = 'parcours' and canal = 'suggestion'),
    'total_visiteurs_partages',
      (select count(distinct visiteur) from vus where genre = 'parcours' and canal = 'partage'),
    /* De quand date le comptage par objet, toutes périodes confondues. Sans
       lui, une page ne sait pas distinguer « personne n'a ouvert de fiche » de
       « on ne comptait pas encore les fiches » — et le journal qui a précédé
       les compteurs ne retenait pas leur objet, si bien que ce jour-là est
       postérieur au premier visiteur mesuré. */
    'depuis', (select min(jour) from compteur_cible
                where evenement_id = p_evenement and genre = p_genre),
    -- de quand date la présence, qui est plus jeune que tout le reste : nulle,
    -- les colonnes de visiteurs uniques sont vides et non nulles
    'v_depuis', (select min(jour) from visiteur_cible
                  where evenement_id = p_evenement and objet = p_genre),
    'cibles', (select coalesce(jsonb_agg(
                 case when p_complet then jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n,
                        'canaux',      coalesce(k.par, '{}'::jsonb),
                        'itineraires', coalesce(i.n, 0),
                        'parcours',    coalesce(p2.n, 0),
                        'suggestions', coalesce(g.n, 0),
                        'partages',    coalesce(pa.n, 0),
                        'v',             coalesce(vs.v, 0),
                        'v_canaux',      coalesce(vk.par, '{}'::jsonb),
                        'v_itineraires', coalesce(vi.v, 0),
                        'v_parcours',    coalesce(vp.v, 0),
                        'v_suggestions', coalesce(vg.v, 0),
                        'v_partages',    coalesce(vpa.v, 0))
                      else jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n,
                        'v', coalesce(vs.v, 0))
                 end
                 order by b.n desc, b.code nulls last), '[]'::jsonb)
                 from base b
                 left join canaux   k  on k.cible  = b.id
                 left join itis     i  on i.cible  = b.id
                 left join parcs    p2 on p2.cible = b.id
                 left join sugg     g  on g.cible  = b.id
                 left join part     pa on pa.cible = b.id
                 left join v_somme  vs on vs.cible = b.id
                 left join v_canaux vk on vk.cible = b.id
                 left join v_itis   vi on vi.cible = b.id
                 left join v_parcs  vp on vp.cible = b.id
                 left join v_sugg   vg on vg.cible = b.id
                 left join v_part   vpa on vpa.cible = b.id)
  );
$$;

create or replace function rapport_utilisation(
  p_evenement uuid,
  -- les N derniers jours, comptés dans le fuseau du salon ; nul pour tout
  p_jours     integer default null
) returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with p as (select * from periode_salon(p_evenement, p_jours)),
  c as (
    select genre, canal, support, heure, n
      from compteur
     where evenement_id = p_evenement
       -- l'instant, et non le jour reconstruit : la colonne reste comparable
       -- telle quelle, et une période qui ne commence pas à minuit n'existe
       -- plus depuis que la borne vient d'ici
       and ((select debut from p) is null or heure >= (select debut from p))
  ),
  v as (
    select jour, visiteur, parcours, support, retenu
      from visiteur_jour
     where evenement_id = p_evenement
       and ((select depuis from p) is null or jour >= (select depuis from p))
  ),
  fiches as (
    select genre, case when canal = '' then 'autre' else canal end as canal, sum(n) as n
      from c where genre in ('fiche_stand', 'fiche_conf')
     group by 1, 2
  ),
  /* Les deux moitiés d'une porte : ce qu'elle a compté, et combien de jetons
     distincts l'ont franchie. La jointure est pleine parce que les deux côtés
     peuvent manquer — un paquet vidé par les filtres n'écrit aucun compteur, et
     l'historique d'avant cette migration n'a de jetons que sous « non précisé ». */
  sup_gestes as (
    select support as s,
           coalesce(sum(n) filter (where genre = 'visite'), 0)     as visites,
           coalesce(sum(n) filter (where genre = 'recherche'), 0)  as recherches,
           coalesce(sum(n) filter (where genre = 'itineraire'), 0) as itineraires,
           coalesce(sum(n) filter (
             where genre in ('fiche_stand', 'fiche_conf')), 0)     as fiches
      from c group by 1
  ),
  sup_jetons as (
    select support as s, count(distinct visiteur) as visiteurs,
           count(distinct visiteur) filter (where not retenu) as volatils
      from v group by 1
  ),
  supports as (
    select coalesce(g.s, j.s)          as s,
           coalesce(g.visites, 0)      as visites,
           coalesce(j.visiteurs, 0)    as visiteurs,
           coalesce(j.volatils, 0)     as volatils,
           coalesce(g.recherches, 0)   as recherches,
           coalesce(g.itineraires, 0)  as itineraires,
           coalesce(g.fiches, 0)       as fiches
      from sup_gestes g
      full join sup_jetons j on j.s = g.s
  ),
  jours as (
    select j, coalesce(sum(visites), 0) as visites,
              coalesce(sum(visiteurs), 0) as visiteurs
      from (
        select (heure at time zone (select tz from p))::date as j,
               sum(n) filter (where genre = 'visite') as visites,
               null::bigint                           as visiteurs
          from c group by 1
        union all
        -- en jetons distincts : une ligne par porte franchie depuis que le
        -- support entre dans la clé, et le même visiteur en occupe deux
        select jour, null, count(distinct visiteur) from v group by 1
      ) t
     group by j order by j
  )
  select jsonb_build_object(
    'visites',     (select coalesce(sum(n), 0) from c where genre = 'visite'),
    'visiteurs',   (select count(distinct visiteur) from v),
    'visiteurs_volatils', (select count(distinct visiteur) from v where not retenu),
    'recherches',  (select coalesce(sum(n), 0) from c where genre = 'recherche'),
    'itineraires', (select coalesce(sum(n), 0) from c where genre = 'itineraire'),
    'parcours',    (select count(distinct visiteur) from v where parcours),
    'parcours_gestes', (select coalesce(sum(n), 0) from c where genre = 'parcours'),
    /* Le partage, des deux côtés. À gauche le geste d'envoyer — genre à lui,
       parce qu'envoyer sa liste n'est ni l'allonger ni la raccourcir, et le
       compter parmi les ajouts fausserait la ligne d'au-dessus. À droite ce que
       les destinataires en ont repris, qui sont bien des ajouts et restent donc
       comptés avec eux : c'est le canal qui les distingue.

       Les deux ensemble répondent à la seule question qui décide de garder la
       fonction : on partage, mais est-ce que cela arrive à quelqu'un ? */
    'partages', (select coalesce(sum(n), 0) from c where genre = 'partage'),
    'partages_repris', (select coalesce(sum(n), 0) from c
                         where genre = 'parcours' and canal = 'partage'),
    'stands', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_stand'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_stand')),
    'conferences', jsonb_build_object(
      'total',  (select coalesce(sum(n), 0) from fiches where genre = 'fiche_conf'),
      'canaux', (select coalesce(jsonb_object_agg(canal, n), '{}'::jsonb)
                   from fiches where genre = 'fiche_conf')),
    'supports', (select coalesce(jsonb_agg(jsonb_build_object(
                   'support',     s,
                   'visites',     visites,
                   'visiteurs',   visiteurs,
                   'volatils',    volatils,
                   'recherches',  recherches,
                   'itineraires', itineraires,
                   'fiches',      fiches)
                   order by visites desc, visiteurs desc, s), '[]'::jsonb)
                   from supports),
    'fuseau', (select tz from p),
    'jours',  (select coalesce(jsonb_agg(jsonb_build_object(
                'j', j, 'visites', visites, 'visiteurs', visiteurs)), '[]'::jsonb)
                from jours),
    'depuis', (select min(heure) from compteur where evenement_id = p_evenement)
  );
$$;

comment on function enregistre_mesures is
  'Enregistre un paquet de gestes mesurés. Le vocabulaire des genres et des canaux est clos : un genre inconnu emporte son geste, un canal inconnu rejoint « autre ».';

comment on function audience_cibles is
  'L''audience par cible d''un salon : gestes et visiteurs distincts, par canal, avec le détail des ajouts venus d''une suggestion ou d''un parcours partagé.';

comment on function rapport_utilisation is
  'Les chiffres d''usage d''un salon sur les N derniers jours, comptés dans son fuseau, le détail par porte d''accès et le partage des parcours. Rend tout en un objet.';
