-- Vignettes lues par leurs adresses en une fois
--
-- Pourquoi : `plan-public` et `vignettes` cherchaient les vignettes d'un salon
-- par l'adresse d'origine de ses logos, avec un filtre `in` qui voyage dans
-- l'adresse de la requête. Un intermédiaire refusant une adresse de quelques
-- dizaines de kilo-octets, les adresses partaient par tranches de six mille
-- signes. Celles d'Eventmaker sont signées et en pèsent six cent soixante : neuf
-- par tranche, et vingt-neuf allers-retours pour les 245 logos de fep27 —
-- quatre à cinq secondes à chaque plan assemblé, relevées par la sonde le
-- 22 octobre 2026.
--
-- Appelée en POST, cette fonction reçoit toutes les adresses dans le corps de
-- la demande, où aucune limite de longueur ne tient : un seul aller-retour,
-- quelle que soit la source des logos.
--
-- Elle ne rend que ce qui sert à reconnaître une vignette — jamais ses octets
-- — et dit si sa grande existe sans la lire : chaque appelant filtre ensuite
-- selon ce qu'il cherche.
--
-- Comme la table, elle n'est ouverte qu'à la clé de service : les deux
-- fonctions l'appellent sous elle, et la page ne lit les vignettes qu'au
-- travers de `plan-public`.
--
-- Rejouable : `create or replace`.

create or replace function vignettes_par_source(p_sources text[])
returns table (
  cle             text,
  source          text,
  format          text,
  a_grande        boolean,
  grande_detouree boolean
)
language sql
stable
set search_path = public, pg_temp
as $$
  select v.cle, v.source, v.format, v.grande is not null, v.grande_detouree
    from vignette_de_logo v
   where v.source = any (p_sources);
$$;

comment on function vignettes_par_source(text[]) is
  'Les vignettes de ces adresses de logo, sans leurs octets : un seul appel, quelle que soit la longueur des adresses. Clé de service seule.';

revoke all on function vignettes_par_source(text[]) from public, anon, authenticated;
grant execute on function vignettes_par_source(text[]) to service_role;
