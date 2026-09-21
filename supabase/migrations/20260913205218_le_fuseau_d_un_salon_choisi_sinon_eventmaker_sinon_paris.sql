-- Le fuseau d'un salon : choisi, sinon Eventmaker, sinon Paris
--
-- Pourquoi : la synchronisation ne demandait le fuseau à Eventmaker qu'en
-- lisant les conférences, et seulement quand elles venaient de lui. Un salon
-- dont le programme vient d'ailleurs — ou qui n'en a pas, comme Franchise Expo
-- Paris 2027 — n'en avait donc aucun. Ses compteurs et son rapport se dataient
-- en UTC, et la page ne savait pas l'heure qu'il est au salon. Et quand aucune
-- source n'en donne, personne ne pouvait le dire à sa place.
--
-- Le fuseau a donc désormais deux origines, rangées chacune dans sa colonne :
--
--   · `fuseau_source`, ce qu'Eventmaker dit de l'événement, écrit à chaque
--     synchronisation dès que le salon a un identifiant Eventmaker ;
--   · `fuseau_choisi`, ce que l'exploitant règle dans la console. Il l'emporte
--     sur la source — c'est la règle des champs choisis à la main ailleurs dans
--     la console — et le vider rend la main à la source.
--
-- `fuseau` reste la seule colonne que lisent le plan, la mesure et le rapport.
-- Le déclencheur la calcule depuis les deux autres, et Europe/Paris quand
-- aucune ne dit rien : c'est juste pour tous les salons d'aujourd'hui, et le
-- jour où l'un se tient ailleurs, il se règle. Elle ne s'écrit plus
-- directement — ce qu'on y écrit est recalculé — et n'est plus jamais nulle.
-- Les replis sur UTC de `enregistre_mesures` et de `periode_salon` restent en
-- place mais ne jouent plus ; elles n'ont pas été réécrites pour si peu.
--
-- Les compteurs déjà datés au jour ne sont pas repris, pour la raison donnée
-- par la migration précédente.

-- ------------------------------------------------------- les deux origines
/* Ajoutées et remplies d'un même geste, une seule fois : rejouer la reprise
   rangerait dans la source un fuseau qui peut venir d'ailleurs — d'un choix,
   ou du défaut. Le fuseau en place ne peut venir que d'Eventmaker. */
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'evenement'
       and column_name = 'fuseau_source'
  ) then
    alter table evenement
      add column fuseau_source text,
      add column fuseau_choisi text;
    update evenement set fuseau_source = fuseau;
  end if;
end $$;

comment on column evenement.fuseau_source is
  'Fuseau donné par Eventmaker à la synchronisation, traduit par fuseau_iana ; nul si aucune source n''en donne.';
comment on column evenement.fuseau_choisi is
  'Fuseau réglé dans la console ; il l''emporte sur fuseau_source. Nul pour laisser faire la source.';

-- ------------------------------------------------------------- le calcul
create or replace function evenement_fuseau_iana() returns trigger
language plpgsql
set search_path = public
as $$
begin
  /* Les deux origines sont traduites avant d'être rangées : un nom Rails ou
     illisible n'y reste pas davantage que dans `fuseau`. */
  new.fuseau_choisi := fuseau_iana(new.fuseau_choisi);
  new.fuseau_source := fuseau_iana(new.fuseau_source);
  new.fuseau := coalesce(new.fuseau_choisi, new.fuseau_source, 'Europe/Paris');
  return new;
end;
$$;

/* `fuseau` reste dans la liste : une écriture directe — une synchronisation
   d'avant ce déploiement — est recalculée au lieu d'être rangée telle quelle. */
drop trigger if exists fuseau_iana on evenement;
create trigger fuseau_iana
  before insert or update of fuseau, fuseau_source, fuseau_choisi on evenement
  for each row execute function evenement_fuseau_iana();

-- chaque salon passe par le calcul : Franchise Expo Paris 2027 prend Paris
update evenement set fuseau_source = fuseau_source;

alter table evenement
  alter column fuseau set default 'Europe/Paris',
  alter column fuseau set not null;

comment on column evenement.fuseau is
  'Fuseau horaire du salon : fuseau_choisi, sinon fuseau_source, sinon Europe/Paris. Calculé par le déclencheur fuseau_iana, jamais nul.';
