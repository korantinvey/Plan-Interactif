-- Le fuseau d'un salon, au format IANA
--
-- Pourquoi : Eventmaker ne rend pas « Europe/Paris » mais « Paris », le nom que
-- Rails donne à ce fuseau, et la synchronisation le rangeait tel quel. Ni la
-- base ni le navigateur ne le connaissent, et chacun s'en tirait en silence :
--
--   · la base retombait sur UTC. Les jours de Franchise Expo Paris 2026 se
--     dataient à Greenwich, et le rapport les découpait de même ;
--   · la page ne savait plus quelle heure il est au salon. L'itinéraire, qui
--     écarte les salles dont une conférence entre ou sort à cette minute, ne
--     détournait donc plus personne.
--
-- La vérification elle-même coûtait. `pg_timezone_names` n'est pas une table :
-- chaque lecture relève tous les fichiers de fuseaux du serveur. Environ
-- quarante millisecondes mesurées, payées à chaque paquet de mesure — des
-- milliers de fois à l'ouverture d'un salon — pour une réponse qui ne change
-- jamais.
--
-- La règle passe donc de la lecture à l'écriture. `fuseau_iana` traduit ce
-- qu'on lui donne en un fuseau que la base sait lire, ou rend nul, et un
-- déclencheur l'applique à tout ce qui entre dans `evenement.fuseau`, d'où
-- qu'il vienne. La colonne ne porte plus qu'un fuseau lisible ou rien : les
-- fonctions qui la lisent n'ont plus à douter, et `periode_salon` comme
-- `enregistre_mesures` sont réécrites, à l'identique près de cela. Une
-- réécriture ultérieure de l'une d'elles part de cette version, sans quoi le
-- relevé des fuseaux reviendrait dans le chemin de chaque mesure.
--
-- Les salons déjà synchronisés sont repris ici. Les compteurs déjà datés ne le
-- sont pas : `compteur` garde l'heure et se relit dans le bon fuseau dès
-- maintenant, mais les tables datées au jour n'ont que le jour, qu'on ne sait
-- pas refaire. Seuls les gestes faits entre minuit et deux heures du matin,
-- heure de Paris, y sont tombés la veille.

-- ------------------------------------------------------------ la traduction
/*
 * Un fuseau lisible, ou nul.
 *
 * Un nom Rails est traduit d'abord, d'après la table d'ActiveSupport : c'est
 * ce que parle Eventmaker, et ce n'est pas qu'une affaire de préfixe — « Bern »
 * est à Zurich, « Beijing » à Shanghai, « Eastern Time (US & Canada) » à New
 * York. Ce qui n'est pas un nom Rails passe tel quel, s'il est lisible.
 *
 * Lisible se vérifie en essayant, et non en consultant `pg_timezone_names` :
 * c'est exactement la question que la conversion posera plus tard, et la
 * réponse ne coûte rien. Un nom illisible devient nul plutôt que de rester :
 * il ne ferait qu'échouer plus loin, et la page sait déjà se passer d'un
 * fuseau absent.
 */
create or replace function fuseau_iana(p_fuseau text) returns text
language plpgsql
stable
set search_path = public
as $$
declare
  v_nom text := nullif(btrim(p_fuseau), '');
begin
  if v_nom is null then return null; end if;

  select r.iana into v_nom
    from (values
      ('International Date Line West', 'Etc/GMT+12'),
      ('Midway Island', 'Pacific/Midway'),
      ('American Samoa', 'Pacific/Pago_Pago'),
      ('Hawaii', 'Pacific/Honolulu'),
      ('Alaska', 'America/Juneau'),
      ('Pacific Time (US & Canada)', 'America/Los_Angeles'),
      ('Tijuana', 'America/Tijuana'),
      ('Mountain Time (US & Canada)', 'America/Denver'),
      ('Arizona', 'America/Phoenix'),
      ('Chihuahua', 'America/Chihuahua'),
      ('Mazatlan', 'America/Mazatlan'),
      ('Central Time (US & Canada)', 'America/Chicago'),
      ('Saskatchewan', 'America/Regina'),
      ('Guadalajara', 'America/Mexico_City'),
      ('Mexico City', 'America/Mexico_City'),
      ('Monterrey', 'America/Monterrey'),
      ('Central America', 'America/Guatemala'),
      ('Eastern Time (US & Canada)', 'America/New_York'),
      ('Indiana (East)', 'America/Indiana/Indianapolis'),
      ('Bogota', 'America/Bogota'),
      ('Lima', 'America/Lima'),
      ('Quito', 'America/Lima'),
      ('Atlantic Time (Canada)', 'America/Halifax'),
      ('Caracas', 'America/Caracas'),
      ('La Paz', 'America/La_Paz'),
      ('Santiago', 'America/Santiago'),
      ('Newfoundland', 'America/St_Johns'),
      ('Brasilia', 'America/Sao_Paulo'),
      ('Buenos Aires', 'America/Argentina/Buenos_Aires'),
      ('Montevideo', 'America/Montevideo'),
      ('Georgetown', 'America/Guyana'),
      ('Puerto Rico', 'America/Puerto_Rico'),
      ('Greenland', 'America/Godthab'),
      ('Mid-Atlantic', 'Atlantic/South_Georgia'),
      ('Azores', 'Atlantic/Azores'),
      ('Cape Verde Is.', 'Atlantic/Cape_Verde'),
      ('Dublin', 'Europe/Dublin'),
      ('Edinburgh', 'Europe/London'),
      ('Lisbon', 'Europe/Lisbon'),
      ('London', 'Europe/London'),
      ('Casablanca', 'Africa/Casablanca'),
      ('Monrovia', 'Africa/Monrovia'),
      ('UTC', 'Etc/UTC'),
      ('Belgrade', 'Europe/Belgrade'),
      ('Bratislava', 'Europe/Bratislava'),
      ('Budapest', 'Europe/Budapest'),
      ('Ljubljana', 'Europe/Ljubljana'),
      ('Prague', 'Europe/Prague'),
      ('Sarajevo', 'Europe/Sarajevo'),
      ('Skopje', 'Europe/Skopje'),
      ('Warsaw', 'Europe/Warsaw'),
      ('Zagreb', 'Europe/Zagreb'),
      ('Brussels', 'Europe/Brussels'),
      ('Copenhagen', 'Europe/Copenhagen'),
      ('Madrid', 'Europe/Madrid'),
      ('Paris', 'Europe/Paris'),
      ('Amsterdam', 'Europe/Amsterdam'),
      ('Berlin', 'Europe/Berlin'),
      ('Bern', 'Europe/Zurich'),
      ('Zurich', 'Europe/Zurich'),
      ('Rome', 'Europe/Rome'),
      ('Stockholm', 'Europe/Stockholm'),
      ('Vienna', 'Europe/Vienna'),
      ('West Central Africa', 'Africa/Algiers'),
      ('Bucharest', 'Europe/Bucharest'),
      ('Cairo', 'Africa/Cairo'),
      ('Helsinki', 'Europe/Helsinki'),
      ('Kyiv', 'Europe/Kiev'),
      ('Riga', 'Europe/Riga'),
      ('Sofia', 'Europe/Sofia'),
      ('Tallinn', 'Europe/Tallinn'),
      ('Vilnius', 'Europe/Vilnius'),
      ('Athens', 'Europe/Athens'),
      ('Istanbul', 'Europe/Istanbul'),
      ('Minsk', 'Europe/Minsk'),
      ('Jerusalem', 'Asia/Jerusalem'),
      ('Harare', 'Africa/Harare'),
      ('Pretoria', 'Africa/Johannesburg'),
      ('Kaliningrad', 'Europe/Kaliningrad'),
      ('Moscow', 'Europe/Moscow'),
      ('St. Petersburg', 'Europe/Moscow'),
      ('Volgograd', 'Europe/Volgograd'),
      ('Samara', 'Europe/Samara'),
      ('Kuwait', 'Asia/Kuwait'),
      ('Riyadh', 'Asia/Riyadh'),
      ('Nairobi', 'Africa/Nairobi'),
      ('Baghdad', 'Asia/Baghdad'),
      ('Tehran', 'Asia/Tehran'),
      ('Abu Dhabi', 'Asia/Muscat'),
      ('Muscat', 'Asia/Muscat'),
      ('Baku', 'Asia/Baku'),
      ('Tbilisi', 'Asia/Tbilisi'),
      ('Yerevan', 'Asia/Yerevan'),
      ('Kabul', 'Asia/Kabul'),
      ('Ekaterinburg', 'Asia/Yekaterinburg'),
      ('Islamabad', 'Asia/Karachi'),
      ('Karachi', 'Asia/Karachi'),
      ('Tashkent', 'Asia/Tashkent'),
      ('Chennai', 'Asia/Kolkata'),
      ('Kolkata', 'Asia/Kolkata'),
      ('Mumbai', 'Asia/Kolkata'),
      ('New Delhi', 'Asia/Kolkata'),
      ('Kathmandu', 'Asia/Kathmandu'),
      ('Astana', 'Asia/Almaty'),
      ('Dhaka', 'Asia/Dhaka'),
      ('Sri Jayawardenepura', 'Asia/Colombo'),
      ('Almaty', 'Asia/Almaty'),
      ('Novosibirsk', 'Asia/Novosibirsk'),
      ('Rangoon', 'Asia/Rangoon'),
      ('Bangkok', 'Asia/Bangkok'),
      ('Hanoi', 'Asia/Bangkok'),
      ('Jakarta', 'Asia/Jakarta'),
      ('Krasnoyarsk', 'Asia/Krasnoyarsk'),
      ('Beijing', 'Asia/Shanghai'),
      ('Chongqing', 'Asia/Chongqing'),
      ('Hong Kong', 'Asia/Hong_Kong'),
      ('Urumqi', 'Asia/Urumqi'),
      ('Kuala Lumpur', 'Asia/Kuala_Lumpur'),
      ('Singapore', 'Asia/Singapore'),
      ('Taipei', 'Asia/Taipei'),
      ('Perth', 'Australia/Perth'),
      ('Irkutsk', 'Asia/Irkutsk'),
      ('Ulaanbaatar', 'Asia/Ulaanbaatar'),
      ('Seoul', 'Asia/Seoul'),
      ('Osaka', 'Asia/Tokyo'),
      ('Sapporo', 'Asia/Tokyo'),
      ('Tokyo', 'Asia/Tokyo'),
      ('Yakutsk', 'Asia/Yakutsk'),
      ('Darwin', 'Australia/Darwin'),
      ('Adelaide', 'Australia/Adelaide'),
      ('Canberra', 'Australia/Canberra'),
      ('Melbourne', 'Australia/Melbourne'),
      ('Sydney', 'Australia/Sydney'),
      ('Brisbane', 'Australia/Brisbane'),
      ('Hobart', 'Australia/Hobart'),
      ('Vladivostok', 'Asia/Vladivostok'),
      ('Guam', 'Pacific/Guam'),
      ('Port Moresby', 'Pacific/Port_Moresby'),
      ('Magadan', 'Asia/Magadan'),
      ('Srednekolymsk', 'Asia/Srednekolymsk'),
      ('Solomon Is.', 'Pacific/Guadalcanal'),
      ('New Caledonia', 'Pacific/Noumea'),
      ('Fiji', 'Pacific/Fiji'),
      ('Kamchatka', 'Asia/Kamchatka'),
      ('Marshall Is.', 'Pacific/Majuro'),
      ('Auckland', 'Pacific/Auckland'),
      ('Wellington', 'Pacific/Auckland'),
      ('Nuku''alofa', 'Pacific/Tongatapu'),
      ('Tokelau Is.', 'Pacific/Fakaofo'),
      ('Chatham Is.', 'Pacific/Chatham'),
      ('Samoa', 'Pacific/Apia')
    ) as r(rails, iana)
   where r.rails = btrim(p_fuseau);
  v_nom := coalesce(v_nom, btrim(p_fuseau));

  begin
    perform now() at time zone v_nom;
    return v_nom;
  exception when invalid_parameter_value then
    return null;
  end;
end;
$$;

comment on function fuseau_iana is
  'Le fuseau donné, traduit d''un nom Rails s''il en est un, s''il est lisible par la base ; nul sinon.';

/* Le déclencheur l'appelle au nom de qui écrit — la console comme la
   synchronisation — et la traduction ne livre rien : elle reste ouverte. */
revoke all on function fuseau_iana(text) from public;
grant execute on function fuseau_iana(text) to authenticated, service_role;

-- -------------------------------------------------------------- l'écriture
/* Le déclencheur plutôt que la synchronisation : il tient quel que soit celui
   qui écrit, et la règle n'est écrite qu'une fois. */
create or replace function evenement_fuseau_iana() returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.fuseau := fuseau_iana(new.fuseau);
  return new;
end;
$$;

drop trigger if exists fuseau_iana on evenement;
create trigger fuseau_iana
  before insert or update of fuseau on evenement
  for each row execute function evenement_fuseau_iana();

-- ce qui a été synchronisé avant : « Paris » devient « Europe/Paris »
update evenement
   set fuseau = fuseau_iana(fuseau)
 where fuseau is distinct from fuseau_iana(fuseau);

comment on column evenement.fuseau is
  'Fuseau horaire du salon, lisible par la base — traduit d''un nom Rails s''il le faut, nul s''il ne se lit pas. Tenu par le déclencheur fuseau_iana.';

-- ------------------------------------------------------------- la période
/* Réécrite à l'identique, sans le relevé des fuseaux : la colonne ne porte
   plus qu'un fuseau lisible ou rien. */
create or replace function periode_salon(
  p_evenement uuid,
  p_jours     integer default null
) returns table (tz text, depuis date, debut timestamptz)
language sql
stable
security invoker
set search_path = public
as $$
  -- un salon sans fuseau se compte en UTC, comme partout ici
  with z as (
    select coalesce(
      (select e.fuseau from evenement e where e.id = p_evenement),
      'UTC') as tz
  ),
  d as (
    select z.tz,
           case
             when p_jours is null then null
             else (now() at time zone z.tz)::date - (greatest(p_jours, 1) - 1)
           end as depuis
      from z
  )
  select d.tz, d.depuis, (d.depuis::timestamp at time zone d.tz) from d;
$$;

-- ---------------------------------------------------------------- la mesure
/* Réécrite à l'identique, sans le relevé des fuseaux : c'est le chemin de
   chaque paquet, et donc celui où la vérification coûtait le plus. */
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
  -- d'une soirée parisienne tomberaient la veille. La colonne ne porte qu'un
  -- fuseau lisible ou rien — le déclencheur `fuseau_iana` y veille — et un
  -- salon sans fuseau se compte en UTC.
  v_jour := (now() at time zone coalesce(v_tz, 'UTC'))::date;

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
