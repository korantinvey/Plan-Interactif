-- Retrouver une vignette par son adresse d'origine
--
-- Pourquoi : l'API publique doit dire, pour chaque stand qu'elle rend, si son
-- logo a déjà une vignette. Elle connaît l'adresse — c'est ce que l'instantané
-- porte — et la table est indexée sur l'empreinte. Calculer cinq cents
-- empreintes à chaque demande du plan coûterait pour rien sur le chemin le
-- plus fréquenté du service ; un index sur l'adresse laisse poser la question
-- telle qu'elle vient.
--
-- La table reste nommée par l'empreinte : c'est elle qui voyage dans l'adresse
-- publique, et qui sert de version. L'adresse d'origine n'est qu'une seconde
-- porte d'entrée.

create index if not exists vignette_de_logo_source on vignette_de_logo (source);

comment on column vignette_de_logo.source is
  'L''adresse d''où le logo a été lu. Indexée : l''API publique s''en sert pour dire quels stands ont déjà une vignette, sans recalculer leurs empreintes.';
