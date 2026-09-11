-- Icône d'onglet du salon
--
-- Pourquoi : le plan d'un salon s'ouvre dans un onglet, et souvent à côté du
-- site de l'événement, de la billetterie et de la console. Les quatre y
-- portaient la même page blanche, faute d'icône : on retrouvait le plan en
-- lisant les titres, un par un. L'exploitant dépose donc son icône depuis la
-- console, et les deux pages du plan — celle du visiteur comme celle de
-- l'administration — la posent au chargement, avec le nom du salon.
--
--   evenement.favicon = 'data:image/png;base64,iVBORw0KGgo…'
--
-- L'image est enregistrée dans la colonne, et non déposée sur un hébergement
-- de fichiers : c'est déjà ainsi que voyagent le logo d'une zone et les images
-- du dessin, et pour la même raison — une page publiée n'appelle rien au
-- dehors, et un lien vers un fichier ailleurs meurt le jour où l'ailleurs
-- change. Le prix est le poids, payé par chaque visiteur puisque l'icône part
-- avec le plan : d'où une réduction avant l'enregistrement, à cent vingt-huit
-- pixels et seize kilo-octets au plus, au-delà desquels la console refuse le
-- fichier. Une icône se lit dans un carré de seize pixels ; ce qu'elle pèse de
-- plus ne se voit nulle part.
--
-- Le format est toujours png, quel que soit celui du fichier choisi : la
-- console le redessine. Le webp, retenu pour les logos parce qu'il pèse moins,
-- n'a pas ici le même avantage — une icône est petite, et le png est le seul
-- format que tous les navigateurs acceptent dans « link rel=icon ». Le svg,
-- lui, ne survit pas au passage, et c'est voulu : il porte du script, et les
-- pages ne reconnaissent à l'affichage que les formats matriciels.
--
-- La colonne est nulle tant que rien n'a été déposé, et les salons déjà créés
-- la reçoivent vide : l'onglet reste alors ce qu'il était.

alter table evenement add column favicon text;

comment on column evenement.favicon is
  'Icône d''onglet du salon — image réduite en data-URI png, déposée depuis la console. Servie aux deux pages du plan, qui la posent au chargement. Nulle : l''onglet garde l''icône par défaut du navigateur.';
