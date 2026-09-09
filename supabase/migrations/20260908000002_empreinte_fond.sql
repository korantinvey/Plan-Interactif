-- Le fond de plan versionné sur son contenu, non sur l'heure de synchronisation
--
-- L'adresse du fond porte une version, et c'est elle qui autorise le navigateur
-- à le garder pour toujours. Cette version était `derniere_sync`, qui change à
-- **chaque** synchronisation — y compris quand le dessin n'a pas bougé d'un
-- trait, ce qui est le cas le plus fréquent : un salon resynchronise pour
-- rafraîchir ses exposants, pas sa géométrie.
--
-- Conséquence, à deux endroits. Chez le visiteur : six cent soixante kilo-octets
-- de fond retéléchargés après chaque synchronisation, pour rien. Dans le cache
-- du relais : une copie neuve de chaque pavillon à chaque fois, gardée trente
-- jours — au rythme horaire, trois pavillons de deux mégaoctets font quatre
-- gigaoctets de copies mortes.
--
-- L'empreinte est tirée de ce que l'API rendra vraiment : la clé et le dessin
-- de chaque calque, dans l'ordre. Elle ne bouge que si le fond bouge.

alter table plan add column if not exists empreinte text;

comment on column plan.empreinte is
  'Empreinte du fond de plan, écrite par la synchronisation. Sert de version dans l''adresse du fond : inchangée, le navigateur ne le retélécharge pas.';
