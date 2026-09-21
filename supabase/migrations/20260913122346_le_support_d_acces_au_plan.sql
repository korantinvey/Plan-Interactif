-- Le support d'accès au plan
--
-- Pourquoi : le même plan se rejoint par quatre portes. Ouvert dans un
-- navigateur, encadré dans la page d'un site tiers ou dans la vue web d'une
-- application, installé sur l'écran d'accueil, ou servi par une coque déposée
-- sur une boutique. Les compteurs ne savaient dire aucune des quatre, et les
-- mélangeaient dans un chiffre unique : « mille deux cents visites » ne
-- répondait donc pas à la question que pose un organisateur qui vient de payer
-- une application ou de coller un cadre sur son site — est-ce que **cette**
-- porte sert ?
--
-- Ce n'est pas qu'un détail qui manquait, c'est le total qui devenait illisible,
-- parce qu'une visite ne veut pas dire la même chose d'une porte à l'autre :
--
--   · une page encadrée démarre une visite à chaque page du site qui la porte,
--     là où un onglet ouvert deux heures n'en fait qu'une ;
--   · une application lancée depuis l'écran d'accueil repart à froid vingt fois
--     par jour, et compte donc vingt visites là où le navigateur en compte une ;
--   · un cadre posé sur un site tiers voit son stockage cloisonné par le
--     navigateur — quand il ne le refuse pas tout à fait. Le jeton de visiteur
--     ne se retient plus, si bien que chaque ouverture ajoutait un « visiteur
--     unique », et cette inflation partait dans le total commun sans que rien
--     ne la signale.
--
-- Le support est donc une dimension de plus sur `compteur` et `visiteur_jour`,
-- et l'aveu de stockage un booléen sur le second : séparés, les quatre chiffres
-- se lisent chacun dans son ordre de grandeur, et leur somme reste celle qu'on
-- affichait.
--
-- Ce qui ne bouge pas, et c'est délibéré : `compteur_cible` n'apprend pas le
-- support. L'audience d'un stand est son audience, quelle que soit la porte
-- prise pour l'atteindre ; y ajouter une quatrième dimension multiplierait par
-- quatre la seule table dont le volume ait jamais inquiété — 931 stands ×
-- canaux × jours — pour répondre à une question que personne ne pose. La carte
-- de chaleur et le classeur des exposants gardent donc exactement leurs
-- chiffres.

-- --------------------------------------------------------------- la colonne
/*
 * `''` et non `'web'` pour ce qui est déjà compté.
 *
 * Rétrodater les anciennes lignes en « web » serait faux : une partie vient
 * de cadres posés sur des sites, et l'écran d'accueil d'iOS produit un lancement
 * autonome sans qu'aucun manifeste soit nécessaire — ces visites existaient
 * donc déjà, confondues avec les autres. La chaîne vide dit « on ne comptait pas
 * encore le support », ce que le rapport nomme « non précisé ».
 *
 * Pas de contrainte de vocabulaire sur la colonne, à l'inverse de `genre` : le
 * support se comporte comme `canal`, dont la liste vit dans
 * `enregistre_mesures` seule. Une porte de plus s'ajoutera alors par un
 * remplacement de fonction, sans toucher aux tables ni à ce qu'elles portent.
 */
alter table compteur      add column if not exists support text not null default '';
alter table visiteur_jour add column if not exists support text not null default '';

/*
 * Le jeton a-t-il pu être retenu.
 *
 * Quand le navigateur refuse le stockage de site — navigation privée, cadre
 * tiers cloisonné, cookies bloqués — la page tire un jeton volatil plutôt que
 * de renoncer à mesurer : mieux vaut compter ce visiteur une fois par ouverture
 * que ne pas le compter. Mais alors sa ligne ne représente pas un visiteur, elle
 * représente une ouverture, et le rapport doit pouvoir le dire au lieu de
 * laisser croire à une audience plus large qu'elle n'est.
 *
 * `true` par défaut : tout ce qui est déjà enregistré l'a été par un jeton
 * retenu, ou sans qu'on sache — et dans le doute la colonne ne doit pas jeter
 * la suspicion sur l'historique.
 */
alter table visiteur_jour add column if not exists retenu boolean not null default true;

comment on column compteur.support is
  'Par quelle porte le plan a été atteint : web, integre, pwa, appli. Vide pour ce qui précède la mesure du support.';
comment on column visiteur_jour.support is
  'La porte prise par ce jeton. Dans la clé : un même visiteur passé du site à l''application compte une fois par porte, et une seule au total.';
comment on column visiteur_jour.retenu is
  'Faux si le navigateur a refusé de retenir le jeton : la ligne vaut alors une ouverture, pas un visiteur.';

-- ------------------------------------------------------------------- la clé
/*
 * Le support entre dans les deux clés primaires, et ce n'est pas la même
 * conséquence des deux côtés.
 *
 * Sur `compteur`, c'est une dimension de plus sur une table de sommes : au pire
 * quatre lignes là où il y en avait une, et les heures d'ouverture bornent tout
 * cela comme avant.
 *
 * Sur `visiteur_jour`, c'est plus délicat, parce qu'on y compte un cardinal. Un
 * visiteur qui ouvre le plan sur le site du salon puis dans l'application y
 * gagne deux lignes — deux jetons distincts de toute façon, le stockage n'étant
 * pas partagé entre les deux. Les totaux restent donc justes tant qu'ils se
 * comptent en jetons distincts et non en lignes, et c'est ce que corrige le
 * rapport plus bas. En pratique le volume ne bouge pas : un visiteur passe par
 * une porte, pas par quatre.
 */
alter table compteur      drop constraint if exists compteur_pkey;
alter table compteur      add primary key (evenement_id, heure, genre, canal, support);
alter table visiteur_jour drop constraint if exists visiteur_jour_pkey;
alter table visiteur_jour add primary key (evenement_id, jour, visiteur, support);

-- ----------------------------------------------------------------- écriture
/*
 * Le paquet de gestes porte désormais sa porte.
 *
 * Le support accompagne le paquet et non chacun de ses gestes : c'est une
 * propriété de la façon dont la page a été ouverte, pas du geste qu'on y fait.
 * Le répéter trente fois dans un envoi l'exposerait à se contredire, pour
 * trente fois plus d'octets.
 *
 * L'ancienne signature à trois arguments disparaît, et les nouveaux paramètres
 * ont une valeur par défaut : un appel qui ne les donne pas — une page servie
 * depuis un cache, le temps que le déploiement se propage — reste résolu, et
 * compte sous « non précisé » plutôt que d'échouer. La laisser à côté aurait
 * créé deux définitions à faire vivre en parallèle, et une ambiguïté de
 * résolution avec celle-ci.
 *
 * Le reste est inchangé, au support près : mêmes filtres, même transaction,
 * mêmes trois tables. `compteur_cible` n'en reçoit rien, pour la raison dite en
 * tête de cette migration.
 */
drop function if exists enregistre_mesures(text, text, jsonb);

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
    'visite', 'recherche', 'itineraire', 'parcours', 'fiche_stand', 'fiche_conf'];
  -- les gestes qui peuvent désigner quelque chose, et ce qu'ils désignent
  VISANTS constant text[] := array[
    'fiche_stand', 'fiche_conf', 'itineraire', 'parcours'];
  OBJETS constant text[] := array['fiche_stand', 'fiche_conf'];
  CANAUX constant text[] := array[
    'recherche', 'liste', 'plan', 'image', 'conference', 'salle', 'exposant',
    'parcours', 'lien', 'suggestion'];
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

comment on function enregistre_mesures is
  'Applique un paquet de gestes aux compteurs, en une transaction, sous la porte par laquelle le plan a été atteint. Rend faux si l''événement n''est pas publié.';

revoke all on function enregistre_mesures(text, text, jsonb, text, boolean) from public;
grant execute on function enregistre_mesures(text, text, jsonb, text, boolean) to service_role;

-- ------------------------------------------------------------------ rapport
/*
 * Le rapport, porte par porte.
 *
 * Deux corrections que le support rend nécessaires, et qui valent d'être dites
 * parce qu'elles touchent des chiffres déjà affichés :
 *
 *   · les visiteurs d'un jour se comptaient en lignes de `visiteur_jour`. La
 *     ligne n'est plus le visiteur depuis que le support entre dans la clé :
 *     c'est un `count(distinct visiteur)`, comme le total l'a toujours fait.
 *     Sans cela, un visiteur qui passe du cadre à l'application gonflerait le
 *     bâton de son jour ;
 *   · les visiteurs volatils se comptent à part. Ce ne sont pas des visiteurs
 *     de moins — ils ont bien ouvert le plan — mais des visiteurs dont on sait
 *     qu'ils sont peut-être comptés plusieurs fois. Le chiffre vient à côté du
 *     total plutôt qu'en déduction : le rapport n'a pas à corriger ce qu'il ne
 *     peut que signaler.
 *
 * `supports` rend une liste et non un objet indexé : l'ordre porte du sens — la
 * porte la plus fréquentée d'abord — et une liste le garde là où un objet JSON
 * le laisse à la bonne volonté du lecteur.
 *
 * La somme des visiteurs de chaque porte dépasse le total, et c'est juste : un
 * jeton retenu par un navigateur n'est pas celui de l'application du même
 * téléphone, et le navigateur lui-même n'en partage aucun avec le cadre posé
 * sur un site tiers. La page le dit.
 */
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

comment on function rapport_utilisation is
  'Les chiffres d''usage d''un salon sur les N derniers jours, comptés dans son fuseau, et le détail par porte d''accès. Rend tout en un objet.';

revoke all on function rapport_utilisation(uuid, integer) from public;
grant execute on function rapport_utilisation(uuid, integer) to authenticated;
