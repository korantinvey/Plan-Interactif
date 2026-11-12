-- Grande vignette des logos
--
-- Pourquoi : en vue immersive, le logo d'un stand se pose sur son toit, et de
-- très près il occupe huit cents pixels d'écran dense. La vignette — six cents
-- pixels, faite pour la fiche — s'y étalait floue. La grossir pour tous
-- aurait alourdi le lot que chaque visite précharge pour ses fiches : sur un
-- salon de cinq cents logos, quelques mégaoctets de plus, payés par ceux qui
-- ne zooment jamais. La grande vignette vit donc à côté de la petite, sous la
-- même clé, et seuls les toits vus de près la demandent, un logo à la fois.
--
-- Elle se fabrique avec la petite, dans le navigateur de l'exploitant, depuis
-- le même original. Trois états :
--   nul   — pas encore fabriquée : la préparation des logos la refera ;
--   ''    — inutile : l'original ne tient pas plus que la petite ;
--   sinon — le webp, en base64, comme la petite.

alter table vignette_de_logo add column if not exists grande text;

comment on column vignette_de_logo.grande is
  'Le webp recadré en grand, en base64, pour les toits vus de près — vide quand l''original n''en tient pas plus que la petite, nul tant qu''il n''est pas fait.';
