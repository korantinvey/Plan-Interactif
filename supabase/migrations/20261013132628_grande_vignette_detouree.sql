-- Grande vignette détourée
--
-- Pourquoi : le logo d'un stand se pose sur son toit sans son fond blanc, et
-- ce fond se retirait chez chaque visiteur, pixel par pixel, deux logos à la
-- fois. Sur un écran de bureau, Franchise Expo en met plus d'une centaine
-- autour de la vue : ils paraissaient un à un, pendant de longues secondes.
-- Le détourage se fait désormais une fois, à la synchronisation, dans le
-- navigateur de l'exploitant, sur la grande vignette — que seuls les toits
-- lisent. La petite, celle des fiches, garde son fond : certains modèles de
-- fiche ont un en-tête coloré, où le logo se montre tel que l'exposant l'a
-- donné.
--
-- La grande devient donc le logo du toit, et se fabrique pour chaque logo,
-- même quand l'original n'en tient pas plus que la petite. Celles d'avant ne
-- sont pas détourées, ou manquent : la préparation des logos les refait une
-- fois, la petite avec. Faux par défaut, pour qu'elles le soient.

alter table vignette_de_logo add column if not exists grande_detouree boolean not null default false;

comment on column vignette_de_logo.grande_detouree is
  'La grande vignette a-t-elle déjà son fond blanc retiré ? Vraie pour celles qu''une console récente fabrique : le toit d''un stand la pose telle quelle.';
comment on column vignette_de_logo.grande is
  'Le logo du toit, recadré en grand, en base64, au format de la colonne format — détouré si grande_detouree, nul tant qu''il n''est pas fait, vide quand une console d''avant le jugeait inutile.';
