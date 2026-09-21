-- Un geste peut désigner un stand sans être l'ouverture de sa fiche
--
-- L'organisateur veut rendre des comptes à ses exposants, un par un : combien
-- de fois on a ouvert leur fiche, combien de fois on a cliqué leur logo,
-- combien de visiteurs ont demandé la route jusqu'à eux, combien les ont
-- inscrits à leur programme de visite. Les deux premiers chiffres existaient ;
-- les deux derniers, non — l'itinéraire et le parcours se comptaient en bloc,
-- sans jamais dire vers quoi.
--
-- Ce qui l'empêchait tenait à une confusion de vocabulaire dans
-- `compteur_cible` : une seule colonne `genre` y disait à la fois **quel
-- geste** et **quel objet**, ce qui marchait tant que les deux se confondaient
-- — « fiche_stand » nommant l'un et l'autre — et interdisait tout geste dont
-- l'objet ne porte pas le nom.
--
-- On les sépare donc : `genre` ne dit plus que le geste, `objet` dit ce que la
-- cible désigne. La clé étrangère vers `cible` — le verrou qui ferme le
-- vocabulaire et empêche qu'on fasse grossir la table avec des identifiants
-- inventés — suit l'objet, et garde son rôle intact.
--
-- Ce qu'on ne compte toujours pas par stand, et c'est délibéré : la journée
-- organisée, qui calcule une vingtaine d'itinéraires d'un coup. Les rattacher
-- tous ferait passer pour vingt demandes de visiteurs ce qui n'est qu'un seul
-- clic sur « organiser ma journée ».

-- ------------------------------------------------------------------- l'objet
alter table compteur_cible add column if not exists objet text;

-- Les lignes déjà écrites n'ont que des ouvertures de fiche : l'objet s'y lit
-- dans le genre, puisque c'est de leur confusion qu'on sort.
update compteur_cible set objet = genre where objet is null;

alter table compteur_cible alter column objet set not null;

alter table compteur_cible drop constraint if exists compteur_cible_objet_check;
alter table compteur_cible add constraint compteur_cible_objet_check
  check (objet in ('fiche_stand', 'fiche_conf'));

comment on column compteur_cible.objet is
  'Ce que « cible » désigne : un stand ou une conférence. Distinct de « genre », qui ne dit plus que le geste.';
comment on column compteur_cible.genre is
  'Le geste porté sur la cible : sa fiche ouverte, un itinéraire demandé vers elle, son ajout à un programme de visite.';

-- Le vocabulaire du geste s'ouvre à ce qui vise un objet sans être une fiche.
-- « visite » et « recherche » n'y entrent pas : ni l'une ni l'autre ne désigne
-- quoi que ce soit, et les y admettre inviterait à leur inventer une cible.
alter table compteur_cible drop constraint if exists compteur_cible_genre_check;
alter table compteur_cible add constraint compteur_cible_genre_check
  check (genre in ('fiche_stand', 'fiche_conf', 'itineraire', 'parcours'));

alter table compteur_cible
  drop constraint if exists compteur_cible_evenement_id_genre_cible_fkey;
alter table compteur_cible
  drop constraint if exists compteur_cible_evenement_id_objet_cible_fkey;
alter table compteur_cible add constraint compteur_cible_evenement_id_objet_cible_fkey
  foreign key (evenement_id, objet, cible)
  references cible (evenement_id, genre, id) on delete cascade;

/*
 * L'objet entre dans la clé, et ce n'est pas de la précaution gratuite : les
 * identifiants de stand viennent de Klipso, ceux de conférence d'Eventmaker,
 * et rien ne garantit qu'aucun ne se ressemble. Sans lui, un stand et une
 * conférence de même identifiant ajoutés le même jour au même programme
 * s'additionneraient sur une seule ligne.
 *
 * L'ordre reste celui d'origine — la cible avant le jour — pour que
 * l'historique d'un stand se lise d'un balayage contigu.
 */
alter table compteur_cible drop constraint if exists compteur_cible_pkey;
alter table compteur_cible
  add primary key (evenement_id, genre, objet, cible, jour, canal);

-- ----------------------------------------------------------------- écriture
/*
 * Le paquet de gestes, désormais capable de rattacher un itinéraire ou un
 * ajout au programme à ce qu'il visait.
 *
 * Le geste porte donc un champ de plus, `objet`, et la page ne le renseigne
 * que là où il ne se devine pas : pour une fiche ouverte, l'objet est le genre
 * lui-même, et l'ancienne forme du geste continue de s'écrire sans rien
 * changer.
 *
 * Ce qui ne bouge pas : `compteur` reçoit toujours le geste sous son genre
 * propre, cible ou pas. Les totaux du rapport — tant d'itinéraires, tant de
 * gestes de parcours — comptent donc exactement comme avant, y compris ceux
 * qu'aucun stand ne recueille.
 */
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
    'parcours', 'lien'];
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

comment on function enregistre_mesures is
  'Applique un paquet de gestes aux compteurs, en une transaction. Rend faux si l''événement n''est pas publié.';

revoke all on function enregistre_mesures(text, text, jsonb) from public;
grant execute on function enregistre_mesures(text, text, jsonb) to service_role;


-- ------------------------------------------------- l'audience, tout entière
/*
 * `audience_cibles` sait déjà lire `compteur_cible` par stand : c'est elle qui
 * peint la carte de chaleur. L'export tableur pose la même question à la même
 * table, en demandant seulement plus de colonnes — le détail par canal, les
 * itinéraires, les ajouts au programme.
 *
 * On l'élargit donc plutôt que d'écrire une seconde fonction à côté. Deux
 * agrégations du même compteur auraient divergé au premier ajustement — une
 * borne de période corrigée d'un côté, pas de l'autre — et la carte de chaleur
 * aurait fini par montrer d'autres chiffres que le classeur qu'elle illustre.
 *
 * `p_complet` ouvre les deux choses dont l'export a besoin, et que la carte ne
 * veut pas :
 *
 *   · toutes les cibles du salon, même à zéro. Un tableau qui n'aligne que les
 *     stands consultés ne se lit pas — l'organisateur ne saurait pas si un
 *     exposant absent n'a intéressé personne ou n'a jamais été posé sur le
 *     plan. La carte, elle, n'a rien à peindre d'un stand à zéro.
 *   · le détail de chaque ligne. La carte n'affiche qu'un nombre par stand ;
 *     le lui envoyer quand même doublerait sa charge pour rien.
 *
 * La lecture de `compteur_cible`, elle, reste unique : un seul balayage sert
 * les fiches, les itinéraires et les parcours, séparés ensuite par leur genre.
 */
drop function if exists audience_cibles(uuid, integer, text);

create or replace function audience_cibles(
  p_evenement uuid,
  -- les N derniers jours, comptés dans le fuseau du salon ; nul pour tout
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
  with zone as (
    -- Le découpage par jour est celui des compteurs : dans le fuseau du salon,
    -- sinon les deux premières heures d'une soirée parisienne tomberaient la
    -- veille. Un fuseau inconnu ferait échouer la conversion : on retombe sur
    -- UTC, comme ailleurs.
    select coalesce(
      (select e.fuseau from evenement e
        where e.id = p_evenement
          and e.fuseau in (select name from pg_timezone_names)),
      'UTC') as tz
  ),
  bornes as (
    select case
             when p_jours is null then null
             else (now() at time zone (select tz from zone))::date
                  - (greatest(p_jours, 1) - 1)
           end as depuis
  ),
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
       and ((select depuis from bornes) is null
            or cc.jour >= (select depuis from bornes))
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
    'fuseau',  (select tz from zone),
    'debut',   (select depuis from bornes),
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
                        'parcours',    coalesce(p.n, 0))
                      else jsonb_build_object(
                        'id', b.id, 'code', b.code, 'nom', b.nom, 'n', b.n)
                 end
                 order by b.n desc, b.code nulls last), '[]'::jsonb)
                 from base b
                 left join canaux k on k.cible = b.id
                 left join itis   i on i.cible = b.id
                 left join parcs  p on p.cible = b.id)
  );
$$;

comment on function audience_cibles is
  'Les consultations par stand (ou par conférence) d''un salon sur les N derniers jours. Rend tout en un objet, libellés compris. Avec « p_complet », toutes les cibles même à zéro, et le détail de chaque ligne : canaux, itinéraires demandés, ajouts au programme.';

revoke all on function audience_cibles(uuid, integer, text, boolean) from public;
grant execute on function audience_cibles(uuid, integer, text, boolean) to authenticated;
