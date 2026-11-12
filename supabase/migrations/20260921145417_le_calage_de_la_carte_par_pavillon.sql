-- Le calage de la carte, par pavillon
--
-- Pourquoi : `le_calage_du_plan_sur_la_terre` a posé le calage sur
-- l'événement, en le justifiant ainsi — « les pavillons d'un salon viennent
-- d'un seul export CAO, donc d'un seul repère […] un parc qui exporterait ses
-- halls dans des repères indépendants demanderait un calage par pavillon ; ce
-- n'est pas ce que Klipso rend ici ». C'était vrai des salons qu'on avait
-- alors, et c'est faux de LUXMC26 : ses cinq espaces du Grimaldi Forum
-- s'étalent sur 265 × 339 m, Diaghilev recouvre Verrière, et le bâtiment
-- entier ne fait que 11 427 m² au sol. Ces halls-là ne sont pas placés les uns
-- par rapport aux autres : chacun a son origine. Un calage de salon ne pouvait
-- donc être juste que pour un hall à la fois, et l'exploitant qui changeait
-- d'onglet retrouvait sa carte à cent mètres de là.
--
-- Le calage descend donc sur le pavillon, où il aurait dû être : c'est le
-- pavillon qui porte un repère, pas le salon. Les salons déjà calés gardent le
-- leur — il est recopié sur chacun de leurs pavillons, ce qui reproduit
-- exactement l'ancien comportement pour un parc dont les halls partagent bien
-- une origine.
--
-- `evenement.calage` n'est pas retiré. Les pages sont servies par Cloudflare
-- et les fonctions par Supabase : entre deux déploiements, une page en cache
-- lit encore l'ancienne colonne, et la lui retirer lui ferait perdre sa carte
-- pour rien. Elle ne sert plus à rien après cette migration ; la retirer sera
-- une migration de plus, quand plus aucune page ne la demandera.

alter table plan add column if not exists calage jsonb;

comment on column plan.calage is
  'Où tombe le repère de ce pavillon sur la Terre : {lon, lat, x, y, angle} — un point en WGS84, le même en mètres-plan, et la rotation en radians de l''axe des X vers l''est. Nul tant que le pavillon n''a pas été calé.';

-- Les salons déjà calés : le calage du salon devient celui de chacun de ses
-- pavillons. Sans écraser un calage de pavillon déjà posé, pour que la
-- migration se rejoue sans rien défaire.
update plan p
   set calage = e.calage
  from evenement e
 where e.id = p.evenement_id
   and e.calage is not null
   and p.calage is null;

comment on column evenement.calage is
  'Remplacé par plan.calage : le calage appartient au pavillon, qui seul porte un repère. Gardé le temps que les pages en cache cessent de le lire. Voir la migration « le calage de la carte, par pavillon ».';
