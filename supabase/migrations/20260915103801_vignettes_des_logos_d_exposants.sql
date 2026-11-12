-- Vignettes des logos d'exposants
--
-- Pourquoi : le logo en tête de fiche était chargé chez la source, tel qu'elle
-- le tient — un avatar Eventmaker de mille neuf cents pixels de côté, cent
-- cinquante kilo-octets, pour une vignette qui s'affiche en trois cents pixels
-- sur soixante-douze. Le visiteur payait donc le trajet, puis son téléphone
-- payait le décodage et le recadrage, au moment précis où la fiche s'ouvre.
-- Quatre-vingt-six millisecondes de fil principal rien que pour réduire
-- l'image assez pour l'analyser, et quelques dixièmes de seconde en tout : le
-- logo arrivait après sa fiche, et la mise en page bougeait à son arrivée.
--
-- Rien de tout cela n'a besoin d'être refait chez chaque visiteur. La
-- synchronisation voit ces logos une fois, a tout le temps qu'il faut, et le
-- travail donne le même résultat pour tout le monde : elle le fait donc une
-- fois pour toutes. Recadré et réduit à six cents pixels, un logo pèse trois
-- kilo-octets au lieu de cent cinquante — cinquante fois moins à transporter,
-- et plus rien à calculer sur le téléphone.
--
-- La table est commune à tous les salons, et sa clé est l'empreinte de
-- l'adresse d'origine : deux salons du même organisateur partagent leurs
-- enseignes, et le même logo n'est fabriqué qu'une fois. C'est aussi ce qui
-- rend la fabrication reprenable — une synchronisation n'en fait qu'un lot, et
-- la suivante retrouve ce qui est déjà là.
--
-- L'image est rangée en base64, comme le logo d'une zone et l'icône d'onglet :
-- c'est ce que l'interface de la base sait transporter sans détour, le `bytea`
-- demandant un échappement hexadécimal qui double le poids du trajet. Le tiers
-- que le base64 ajoute ne coûte qu'en base — l'API publique rend des octets.
--
-- Ce que la table ne garde pas : l'original. On ne le réduit pas pour le
-- conserver — la source le tient, et la page sait encore s'en servir quand la
-- vignette manque.

create table if not exists vignette_de_logo (
  /* L'empreinte de l'adresse d'origine, en hexadécimal. Elle nomme la
     vignette dans l'adresse publique, où elle sert aussi de version : le
     contenu ne peut pas changer sans que la clé change, et le relais comme le
     navigateur peuvent donc la garder indéfiniment. */
  cle text primary key,
  /* L'adresse d'où elle vient. Elle ne sert pas à la retrouver — la clé le
     fait — mais à comprendre, le jour où une vignette est fausse, de quel
     dépôt elle sortait. */
  source text not null,
  /* Le webp, en base64. */
  image text not null,
  largeur integer not null,
  hauteur integer not null,
  /* Quand elle a été fabriquée. Une source qui change d'image sans changer
     d'adresse — cela arrive — se rattrape en effaçant les plus vieilles. */
  pose timestamptz not null default now()
);

comment on table vignette_de_logo is
  'Logos d''exposants recadrés et réduits une fois pour toutes à la synchronisation, servis à la place de l''original. Communs à tous les salons : la clé est l''empreinte de l''adresse d''origine.';
comment on column vignette_de_logo.cle is
  'Empreinte de l''adresse d''origine. Nomme la vignette dans l''adresse publique et lui sert de version : le contenu ne peut changer sans elle.';
comment on column vignette_de_logo.source is
  'L''adresse d''où le logo a été lu, gardée pour le diagnostic et non pour la recherche.';
comment on column vignette_de_logo.image is
  'Le webp recadré, en base64 — l''API publique le rend en octets.';
comment on column vignette_de_logo.pose is
  'Date de fabrication. Une source qui change d''image sans changer d''adresse se rattrape en effaçant les plus anciennes.';

/*
 * Rien ne lit ni n'écrit cette table sans la clé de service : la
 * synchronisation la remplit, l'API publique en sert une à la fois. Aucune
 * politique n'est donc posée — la sécurité au niveau des lignes reste active,
 * et refuse tout le reste.
 */
alter table vignette_de_logo enable row level security;
