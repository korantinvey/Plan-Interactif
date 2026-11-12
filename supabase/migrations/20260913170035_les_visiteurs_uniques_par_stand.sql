-- Les visiteurs uniques par stand
--
-- Pourquoi : un exposant à qui l'on annonce « 240 » comprend « 240 personnes
-- sont venues me voir ». Ce que le produit lui donnait, c'était 240 ouvertures
-- de fiche — le même visiteur qui rouvre la fiche cinq fois en pesant cinq.
-- L'écart n'est pas un détail de vocabulaire : il change le chiffre d'un
-- facteur qu'on ne connaît même pas, et il part par courriel à l'exposant.
--
-- Cette migration renverse une décision prise le 2026-09-08, et il faut le dire
-- franchement. `20260908000001_compteurs.sql` écrit, en tête de
-- `compteur_cible` : « Ce qu'on y lit, ce sont des consultations, pas des
-- visiteurs uniques : compter les seconds demanderait de retenir les paires
-- (stand, visiteur), soit exactement le volume qu'on vient de supprimer. »
--
-- Cette phrase se trompe d'ordre de grandeur. Le demi-million de lignes qu'elle
-- fuyait était un journal d'UN GESTE PAR LIGNE — vingt-sept par visiteur et par
-- jour, le dépôt donne lui-même ce chiffre. Une table de PRÉSENCE ne retient
-- pas les gestes : une paire déjà vue n'ajoute rien. Rouvrir la même fiche
-- cinquante fois y pèse une ligne, et c'est précisément ce qui rend le chiffre
-- juste. Pour 931 stands et 20 000 visiteurs, on compte 180 000 à 400 000
-- lignes, soit environ 65 Mo index compris : un huitième du journal supprimé, à
-- fréquentation égale.
--
-- Ce que la phrase disait de vrai, en revanche, et qu'il ne faut pas enjoliver :
-- la propriété qui justifiait les compteurs — **ne pas grossir avec le
-- trafic** — est perdue, et perdue entièrement. Cette table est linéaire en
-- fréquentation, et vaut une trentaine de fois l'occupation de
-- `compteur_cible`. C'est le prix exact du chiffre demandé, et il n'existe pas
-- d'alternative exacte moins chère : aucune extension d'esquisse (HyperLogLog)
-- n'est activée par ce dépôt, et un comptage approché à ±3 % n'a rien à faire
-- dans un courriel à un exposant.
--
-- Deux garde-fous, donc, plutôt qu'un renoncement :
--
--   · la table se purge (`purge_presences`, appelée à chaque synchronisation
--     Klipso — le seul rendez-vous régulier du système à tenir la clé de
--     service). Le volume plafonne à une saison de salons au lieu de croître
--     pour toujours : c'est ce qui manquait au journal, dont le premier défaut
--     n'était pas la taille mais que « rien ne les effaçait jamais » ;
--   · `compteur_cible` reste, et reste la source des totaux. On n'a pas
--     remplacé une table par une autre : on en a ajouté une qui répond à une
--     autre question.
--
-- Ce que le chiffre unique corrige au passage, sans qu'on ait rien à réparer
-- ailleurs — et c'est ce qui achève de le justifier. Trois défauts de comptage
-- relevés dans le produit s'effacent d'eux-mêmes dès qu'on compte des visiteurs
-- et non des gestes :
--
--   · la pastille « N exposants ici » d'un stand partagé rejoue le canal de
--     l'ouverture initiale à chaque bascule d'enseigne, et gonflait le total du
--     stand de gestes faits *à l'intérieur* de sa fiche. Même visiteur, même
--     stand, même canal : une seule présence ;
--   · un itinéraire ne se dédoublonne que sur le dernier trajet demandé, si
--     bien qu'une bascule PMR, une inversion ou un retour en arrière comptaient
--     chacun un trajet de plus vers le même stand. Une seule présence ;
--   · un stand ajouté au parcours, retiré, puis rajouté pesait deux ajouts pour
--     son exposant. Une seule présence.
--
-- Enfin, ce que « visiteur unique » désigne ici, sans l'embellir : un jeton de
-- navigateur, donc une **partition de stockage**. Le même humain qui ouvre le
-- plan dans son navigateur puis dans l'application installée compte deux fois ;
-- celui dont le navigateur refuse le stockage — cas ordinaire d'un cadre posé
-- sur un site tiers — compte une fois par ouverture. Le rapport dit déjà ce
-- second point au niveau du salon (`visiteurs_volatils`). Le reconnaître
-- autrement demanderait d'identifier les gens, ce que ce système ne fait pas et
-- ne fera pas.

-- ------------------------------------------------------------- la présence
/*
 * Une ligne par (objet, cible, geste, canal, jour, visiteur) — et rien d'autre.
 *
 * Pas de colonne `n` : c'est tout l'intérêt. Une table de compteurs répond
 * « combien de fois », une table de présence répond « combien de qui », et la
 * seconde ne peut se déduire de la première à aucun prix. Le doublon n'est pas
 * une erreur à éviter ici, c'est l'opération : `on conflict do nothing` est ce
 * qui empêche la table de grossir.
 *
 * Les colonnes et leurs contraintes suivent `compteur_cible` au mot près —
 * `genre` dit le geste, `objet` dit ce que la cible désigne, et la clé
 * étrangère vers `cible` ferme le vocabulaire comme là-bas : sans elle,
 * n'importe qui ferait grossir à volonté ce qu'on garde.
 *
 * L'ordre de la clé met `objet, cible` en tête : « l'audience de ce stand » est
 * alors un balayage contigu, et le palmarès d'un salon un parcours de préfixe.
 * `visiteur` vient en dernier, où il ne sert qu'à distinguer les lignes — on ne
 * cherche jamais par lui, et c'est une propriété qu'on tient à garder.
 */
create table if not exists visiteur_cible (
  evenement_id uuid not null references evenement (id) on delete cascade,
  objet        text not null check (objet in ('fiche_stand', 'fiche_conf')),
  cible        text not null,
  genre        text not null check (genre in (
                 'fiche_stand', 'fiche_conf', 'itineraire', 'parcours')),
  canal        text not null default '',
  jour         date not null,                         -- dans le fuseau du salon
  visiteur     text not null,
  primary key (evenement_id, objet, cible, genre, canal, jour, visiteur),
  foreign key (evenement_id, objet, cible)
    references cible (evenement_id, genre, id) on delete cascade
);

/*
 * Le seul index en plus de la clé, et il ne sert qu'à la purge.
 *
 * `jour` n'est pas un préfixe de la clé primaire — il vient après `objet`,
 * `cible`, `genre` et `canal` —, si bien que « les lignes de plus de quatre
 * cents jours » aurait balayé la table entière à chaque passage. Cet index-là
 * va droit aux lignes à retirer, et n'en trouve aucune la plupart du temps.
 *
 * Il se paie à l'écriture, mais moins qu'il n'y paraît : on n'écrit ici qu'une
 * fois par (visiteur, stand, canal, jour), pas à chaque geste.
 */
create index if not exists visiteur_cible_jour on visiteur_cible (jour);

comment on table visiteur_cible is
  'Qui a touché quoi, une fois. Une paire déjà vue n''ajoute rien : c''est ce qui permet de compter des visiteurs uniques par stand sans retenir les gestes.';
comment on column visiteur_cible.visiteur is
  'Jeton aléatoire tiré par le navigateur, propre à cet événement. Ne désigne personne ; deux portes d''accès ne le partagent pas.';
comment on column visiteur_cible.genre is
  'Le geste porté sur la cible : sa fiche ouverte, un itinéraire vers elle, son ajout à un programme de visite.';
comment on column visiteur_cible.objet is
  'Ce que « cible » désigne : un stand ou une conférence.';

-- ------------------------------------------------------------------ lecture
alter table visiteur_cible enable row level security;

/*
 * Lecture pour les comptes authentifiés, effacement borné par `acces_salon` —
 * le même partage que les trois autres tables de mesure. Aucune politique
 * d'insertion ni de mise à jour : l'écriture reste le monopole de
 * `enregistre_mesures`, qui tient la clé de service. Ouvrir en écriture ce
 * qu'on ouvre en effacement ferait de cette table un formulaire de spam — et
 * d'un spam par paires, que rien ne dédoublonnerait puisque le spammeur
 * choisirait ses jetons.
 */
drop policy if exists "lecture authentifiée des présences" on visiteur_cible;
create policy "lecture authentifiée des présences" on visiteur_cible
  for select to authenticated using (true);
drop policy if exists "effacement des présences accessibles" on visiteur_cible;
create policy "effacement des présences accessibles" on visiteur_cible
  for delete to authenticated using (acces_salon(evenement_id));

-- ----------------------------------------------------------------- écriture
/*
 * Le paquet écrit maintenant quatre tables, et la quatrième ne compte rien.
 *
 * `select distinct` avant l'insertion, puis `on conflict do nothing` : le
 * premier dédoublonne à l'intérieur du paquet — vingt ouvertures de la même
 * fiche en trente secondes arrivent ensemble —, le second contre ce qui est
 * déjà en base. Sans le `distinct`, l'insertion se heurterait à elle-même dans
 * la même commande, ce que `on conflict` ne rattrape pas.
 *
 * Le filtre est exactement celui de `compteur_cible`, et ce n'est pas une
 * recopie paresseuse : les deux tables doivent voir les mêmes gestes, sans quoi
 * le rapport afficherait un nombre de visiteurs uniques supérieur au nombre de
 * consultations, ce qui ne se corrige plus après coup.
 *
 * Le reste de la fonction est inchangé, à la lettre près.
 */
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

comment on function enregistre_mesures is
  'Applique un paquet de gestes aux compteurs et aux présences, en une transaction, sous la porte par laquelle le plan a été atteint. Rend faux si l''événement n''est pas publié.';

revoke all on function enregistre_mesures(text, text, jsonb, text, boolean) from public;
grant execute on function enregistre_mesures(text, text, jsonb, text, boolean) to service_role;

-- ------------------------------------------------------------------ purge
/*
 * Ce que le journal n'avait pas, et qui manquait plus que sa taille.
 *
 * Le premier défaut du journal supprimé n'était pas son volume, c'était que
 * « rien ne les effaçait jamais » : il grossissait d'un salon à l'autre, sans
 * fin, et le jour où le disque est plein le projet passe en lecture seule. Une
 * table linéaire en fréquentation ne peut pas se permettre la même chose.
 *
 * Quatre cents jours et non trois cent soixante-cinq : un salon annuel se
 * compare à l'édition précédente, et la comparaison se fait souvent quelques
 * semaines après. Trancher à l'année pile retirerait l'édition passée la
 * veille du jour où l'on veut la lire.
 *
 * Le plancher à trente et un jours est là contre l'erreur de manipulation : un
 * appel avec `0` ou `-1` viderait la table d'un salon en cours. On ne laisse
 * pas un argument mal tapé effacer ce qui ne se rejoue pas.
 *
 * Seules les présences se purgent. Les compteurs restent : ils sont bornés par
 * construction, et c'est l'historique long d'un salon — ce qui permet de dire
 * « l'an dernier, à la même date ». Un salon purgé garde donc ses
 * consultations et perd ses visiteurs uniques passés : c'est l'ordre des
 * regrets qu'on a choisi.
 *
 * Sans salon en argument : la purge est une hygiène du système, pas un geste
 * d'exploitant. La borner à un salon obligerait l'appelant à les énumérer, et
 * le premier oublié serait justement celui que personne ne synchronise plus.
 */
create or replace function purge_presences(p_jours integer default 400)
returns bigint
language plpgsql
security invoker
set search_path = public
as $$
declare
  n bigint;
begin
  delete from visiteur_cible
   where jour < current_date - greatest(coalesce(p_jours, 400), 31);
  get diagnostics n = row_count;
  return n;
end;
$$;

comment on function purge_presences is
  'Efface les présences de plus de N jours (400 par défaut, jamais moins de 31). Borne le volume de la seule table qui grossisse avec la fréquentation.';

revoke all on function purge_presences(integer) from public;
grant execute on function purge_presences(integer) to service_role;

-- ------------------------------------------------------------ remise à zéro
/*
 * La remise à zéro emporte la présence avec le reste.
 *
 * L'oublier aurait laissé un salon dont les visiteurs uniques survivraient à
 * ses consultations : « 0 ouverture, 43 visiteurs uniques ». Un salon faux est
 * déjà mauvais, un salon incohérent est pire — on ne sait plus lequel des deux
 * chiffres croire.
 *
 * Le reste est inchangé : même transaction, même refus explicite.
 */
create or replace function reinitialise_compteurs(p_evenement uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  n_compteur bigint; n_cible bigint; n_visiteur bigint;
  n_presence bigint; n_journal bigint;
begin
  if not acces_salon(p_evenement) then
    raise exception 'Ce salon ne vous est pas accessible.' using errcode = '42501';
  end if;

  delete from compteur where evenement_id = p_evenement;
  get diagnostics n_compteur = row_count;
  delete from compteur_cible where evenement_id = p_evenement;
  get diagnostics n_cible = row_count;
  delete from visiteur_cible where evenement_id = p_evenement;
  get diagnostics n_presence = row_count;
  delete from visiteur_jour where evenement_id = p_evenement;
  get diagnostics n_visiteur = row_count;
  delete from mesure where evenement_id = p_evenement;
  get diagnostics n_journal = row_count;

  return jsonb_build_object(
    'compteurs', n_compteur,
    'cibles',    n_cible,
    'presences', n_presence,
    'visiteurs', n_visiteur,
    'journal',   n_journal);
end;
$$;

comment on function reinitialise_compteurs is
  'Efface toute la mesure d''un salon — fréquentation, audience par stand, présences, jetons de visiteurs, journal hérité. Irréversible. Ne touche pas à « cible », qui porte les libellés.';

revoke all on function reinitialise_compteurs(uuid) from public;
grant execute on function reinitialise_compteurs(uuid) to authenticated;

-- ---------------------------------------------------------------- audience
/*
 * L'audience d'un stand, désormais en deux nombres et non plus un.
 *
 * Chaque chiffre qui existait garde son nom et sa valeur — `n`, `canaux`,
 * `itineraires`, `parcours`, `suggestions` comptent toujours des gestes, et la
 * carte de chaleur comme le classeur y retrouvent exactement ce qu'ils
 * affichaient. Les nouveaux portent le même nom préfixé de `v_`, et comptent
 * des visiteurs distincts sur la période.
 *
 * Deux nombres et non un remplacement : « 240 ouvertures par 96 visiteurs » dit
 * quelque chose que ni l'un ni l'autre ne dit seul — un stand ouvert 240 fois
 * par 8 personnes et un stand ouvert 240 fois par 200 ne se ressemblent pas.
 *
 * Trois choses à savoir sur ces nouveaux nombres, et la page les dit au lecteur.
 *
 * D'abord ils ne s'additionnent pas. La somme des visiteurs par canal dépasse
 * le total de visiteurs de la fiche : celui qui a ouvert la fiche depuis le
 * plan puis depuis la recherche compte dans les deux, et une fois au total.
 * C'est la même propriété que les portes d'accès, pour la même raison — un
 * cardinal n'est pas une somme.
 *
 * Ensuite ils se comptent sur la période et non par jour, bien que `jour` soit
 * dans la clé de la table : `count(distinct visiteur)` replie les jours de
 * lui-même, et le visiteur revenu trois jours de suite compte pour un. Sommer
 * les lignes, lui, en aurait fait trois.
 *
 * Enfin ils commencent aujourd'hui. `v_depuis` dit à partir de quand la
 * présence est enregistrée : avant cette migration, aucune paire n'existe, et
 * un salon d'avant affiche donc zéro visiteur unique pour des milliers
 * d'ouvertures. Sans cette clé, la page ne saurait pas distinguer « personne »
 * de « on ne comptait pas encore ».
 */
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
                        'v',             coalesce(vs.v, 0),
                        'v_canaux',      coalesce(vk.par, '{}'::jsonb),
                        'v_itineraires', coalesce(vi.v, 0),
                        'v_parcours',    coalesce(vp.v, 0),
                        'v_suggestions', coalesce(vg.v, 0))
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
                 left join v_somme  vs on vs.cible = b.id
                 left join v_canaux vk on vk.cible = b.id
                 left join v_itis   vi on vi.cible = b.id
                 left join v_parcs  vp on vp.cible = b.id
                 left join v_sugg   vg on vg.cible = b.id)
  );
$$;

comment on function audience_cibles is
  'L''audience de chaque stand ou conférence sur la période : en gestes (n, canaux, itineraires, parcours, suggestions) et en visiteurs distincts (les mêmes, préfixés v_).';

revoke all on function audience_cibles(uuid, integer, text, boolean) from public;
grant execute on function audience_cibles(uuid, integer, text, boolean) to authenticated;
