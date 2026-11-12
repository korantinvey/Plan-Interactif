-- Vignettes de logos en AVIF
--
-- Pourquoi : sur les logos de FUNEXPO 2026, l'AVIF pèse moitié moins que le
-- WebP pour les petites vignettes et trois fois moins pour les grandes, sans
-- écart visible. Le lot des petites part chez chaque visiteur au démarrage :
-- 5,4 Mo compressés pour les 564 logos de Franchise Expo.
--
-- Une vignette AVIF ne remplace pas la WebP sous la même clé. La clé sert de
-- version : le lot qui la porte se garde un an chez le visiteur et au relais,
-- et un contenu changé sous elle n'y arriverait jamais. L'AVIF a donc sa
-- propre clé (`_partage/vignette.ts` `cleDeVignette`), et la WebP reste à
-- côté : le plan déjà gardé la cite encore, et les navigateurs qui ne lisent
-- pas l'AVIF s'en servent (`vignetteWebp`, posé par l'API publique).
--
-- Les lignes d'avant sont toutes en WebP : c'est la valeur par défaut.

alter table vignette_de_logo add column if not exists format text not null default 'webp';

do $$ begin
  alter table vignette_de_logo add constraint vignette_de_logo_format
    check (format in ('webp', 'avif'));
exception when duplicate_object then null;
end $$;

comment on column vignette_de_logo.format is
  'Le format de l''image et de la grande : webp, ou avif. Un même logo peut avoir les deux, sous deux clés.';
comment on column vignette_de_logo.image is
  'La vignette recadrée, en base64, au format de la colonne format — l''API publique la rend en octets.';
