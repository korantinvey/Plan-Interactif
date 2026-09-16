-- L'icône et le nom de l'application installée
--
-- Pourquoi : le plan s'ajoute à l'écran d'accueil comme une application, et
-- l'icône qui s'y posait était celle du produit — la même pour tous les
-- salons. Le visiteur qui installe le plan de deux salons se retrouvait avec
-- deux icônes jumelles, et aucun organisateur ne reconnaissait la sienne. Le
-- nom, lui, était déjà celui du salon, mais écrit par le relais et par lui
-- seul : « Plan SMCL by Event2Plan », sans qu'on puisse en décider autrement.
--
-- Trois colonnes, et un choix qui se lit dans la première :
--
--   evenement.icone_app        = 'data:image/png;base64,iVBORw0KGgo…'
--   evenement.icone_app_masque = 'data:image/png;base64,iVBORw0KGgo…'
--   evenement.nom_app          = 'Plan du SMCL'
--
-- **Nulles, c'est l'icône et le nom du produit.** Il n'y a donc pas de mode à
-- régler à côté : déposer un logo, c'est choisir le sien, et le retirer, c'est
-- revenir à celui d'Event2Plan. Deux vérités qui se contrediraient — un mode
-- « logo du salon » sans logo, un logo qu'un mode ignore — ne peuvent pas
-- exister.
--
-- Deux images pour un seul dépôt, parce qu'Android ne pose pas l'icône comme
-- les autres : il la rogne à la forme du système, cercle ou goutte selon
-- l'appareil. Une image dessinée pour le carré y perd ses bords, et une image
-- qui ne se déclare pas rognable est posée en timbre-poste dans un carré
-- blanc. `icone_app` porte donc le logo au bord de son carré, `icone_app_masque`
-- le même logo rentré dans la zone sûre — le cercle des quatre cinquièmes —
-- sur un fond opaque. L'administration du plan les fabrique ensemble, d'un
-- seul fichier choisi : l'exploitant ne dépose qu'une image.
--
-- Comme le logo d'une zone et l'icône d'onglet, elles sont enregistrées dans
-- la colonne plutôt que déposées sur un hébergement de fichiers : un lien vers
-- un fichier ailleurs meurt le jour où l'ailleurs change. Le poids, lui, ne se
-- paie pas ici comme il se paie sur l'icône d'onglet : celle-là part avec le
-- plan, à chaque visiteur, quand celles-ci ne sont lues qu'à l'installation —
-- le manifeste les désigne par une adresse, et le relais va les chercher. D'où
-- un carré de 512 pixels, la taille qu'Android demande, et non les 128 de
-- l'onglet.
--
-- Reste à désigner ces images sans les porter. Le manifeste les demande par
-- une adresse, et la page en a besoin aussi — pour l'écran d'accueil d'iOS,
-- qui ne lit pas le manifeste, et pour la fenêtre qui invite à installer. Les
-- servir dans la lecture du plan aurait fait voyager un demi-méga d'images
-- jusqu'à chaque visiteur pour une adresse qu'il ne suit qu'en installant.
--
-- D'où la quatrième colonne, calculée : l'empreinte de l'icône. Elle dit d'un
-- même mot qu'il y en a une et laquelle, et c'est elle qui entre dans
-- l'adresse — `/api/icone?salon=smcl&v=<empreinte>`. Une icône remplacée
-- change donc d'adresse, ce qui est la seule façon qu'un écran d'accueil déjà
-- installé la reprenne : le navigateur relit le manifeste, y trouve une
-- adresse qu'il ne connaît pas, et va la chercher. Et comme l'adresse ne peut
-- plus mentir sur son contenu, tout ce qui la garde peut la garder pour
-- toujours. Calculée et non écrite : un drapeau posé à la main aurait fini par
-- annoncer une image retirée.
--
-- Le format est toujours png : c'est celui que tous les systèmes acceptent
-- pour une icône d'application, et le seul que l'écran d'accueil d'iOS lise.
-- Le svg ne survit pas au passage par l'administration, et c'est voulu — il
-- porte du script, et ces images-là finissent servies à tous les visiteurs.
--
-- Les salons déjà créés reçoivent les colonnes vides : leur plan s'installe
-- sous l'icône et le nom du produit, comme avant cette migration.

alter table evenement add column icone_app text;
alter table evenement add column icone_app_masque text;
alter table evenement add column nom_app text;

/* L'empreinte de l'icône, seule chose que le plan servi porte d'elle : nulle
   s'il n'y en a pas. Seize signes de md5 — ce n'est pas un secret à garder,
   c'est un état à distinguer. */
alter table evenement add column icone_app_version text
  generated always as (left(md5(icone_app), 16)) stored;

comment on column evenement.icone_app is
  'Icône de l''application installée — carré de 512 pixels en data-URI png, déposé depuis l''onglet « Admin » du plan. Lue à l''installation seule, par le manifeste, et jamais servie avec le plan. Nulle : l''écran d''accueil porte l''icône du produit.';
comment on column evenement.icone_app_masque is
  'La même icône, rentrée dans la zone sûre d''Android sur un fond opaque : celle que le système rogne à sa forme (« maskable »). Fabriquée avec la précédente, du même fichier.';
comment on column evenement.nom_app is
  'Nom de l''application installée, écrit sous l''icône de l''écran d''accueil. Nul : le relais écrit « Plan <salon> by Event2Plan ».';
comment on column evenement.icone_app_version is
  'Calculée : l''empreinte de l''icône d''application, nulle s''il n''y en a pas. Servie avec le plan, là où les images ne le sont pas, et posée dans l''adresse qui les sert (« /api/icone?salon=…&v=… ») : une icône remplacée change d''adresse, et celle-ci peut donc être gardée pour toujours.';
