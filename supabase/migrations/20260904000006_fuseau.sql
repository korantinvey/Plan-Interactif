-- Fuseau horaire de l'événement
--
-- Une conférence porte son heure sous deux formes : locale au salon
-- (« 03/14/2026 10:30 ») et ISO avec décalage (« 2026-03-14T09:30:00+00:00 »).
-- La première se lit telle quelle ; la seconde doit être ramenée au fuseau du
-- salon, sans quoi un visiteur consultant le plan d'ailleurs lirait des
-- horaires faux — une heure d'écart à Paris, huit à Los Angeles.
--
-- Le fuseau vient de l'événement Eventmaker, au format IANA (« Europe/Paris »).

alter table evenement
  add column if not exists fuseau text;

comment on column evenement.fuseau is
  'Fuseau horaire du salon, au format IANA. Sert à afficher les horaires de conférence tels qu''ils sont sur place.';
