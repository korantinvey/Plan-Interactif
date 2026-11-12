-- Le programme de conférences saisi à la main
--
-- Pourquoi : certains salons ne publient leur programme dans aucun outil que
-- la synchronisation sache lire. Funexpo 2026 tient ses conférences et ses
-- temps forts sur une page de son site (funexpo-expo.com, « Conférences et
-- animations »), et nulle part dans Eventmaker. Sans place pour les recopier,
-- le plan n’en montrait aucune.
--
-- Une source de plus pour le domaine « conferences » : « saisie ». La
-- synchronisation relit alors cette colonne comme elle lirait Eventmaker
-- (`_partage/programme-saisi.ts`) — salles situées, stands rattachés,
-- rappels ouverts, rien ne la distingue plus ensuite d’un programme importé.
--
-- Le programme de Funexpo 2026 y est recopié tel que le site le donne, en
-- français et en anglais, sans rien y ajouter : ce que le site tait reste
-- vide. L’atelier de sculpture n’a ni horaire ni lieu (« n° stand à venir ») ;
-- les conférences n’ont pas d’heure de fin. Seul le titre de la conférence du
-- vendredi, que la page anglaise n’a pas encore, est traduit du français.

alter table evenement
  add column if not exists conferences_saisies jsonb not null default '[]'::jsonb;

comment on column evenement.conferences_saisies is
  'Programme recopié à la main, lu par la synchronisation quand la source des conférences est « saisie ». Voir _partage/programme-saisi.ts.';

update evenement
set conferences_saisies = $programme$[
  {
    "id": "funexpo26-atelier-sculpture",
    "nom": "L’atelier de sculpture",
    "texte": "Initiation à la reconstruction faciale avec Ugo Panico.\n\nEn essayant de réaliser tout ou partie d’une main, découvrez ce que peut être le travail d’un thanatoplasticien. Cet atelier vous propose une première approche pratique de la représentation anatomique, guidée par Ugo Panico.\n\nRencontrez Ugo Panico\nIllustrateur, sculpteur et enseignant. Ugo Panico a été formé à l'école Emile Cohl et y est resté en tant que professeur de sculpture depuis 12 ans.\nIl a enseigné l'illustration et l'anatomie à l'école Brassart, première école de design graphique et de création digitale, créée il y a 75 ans et implantée dans 15 régions en France\nAujourd'hui, Ugo intervient auprès d'AFITT pour des cours de représentation anatomique.\nPar ailleurs, Prestataire dans l'image et le volume, il a réalisé de nombreux décors pour des opéras, des théâtres et des parcs d'attraction.\n\nDates des ateliers : mercredi 18 et jeudi 19 novembre\nInscription gratuite sur place (n° stand à venir)",
    "debut": null,
    "fin": null,
    "salle": null,
    "type": null,
    "intervenants": [
      {
        "nom": "Ugo Panico",
        "societe": null,
        "fonction": "Illustrateur, sculpteur et enseignant"
      }
    ],
    "en": {
      "nom": "The sculpture workshop",
      "texte": "Introduction to facial reconstruction with Ugo Panico.\n\nBy attempting to create all or part of a hand, discover what the work of a thanatoplastic artist entails. This workshop offers a first practical approach to anatomical representation, guided by Ugo Panico.\n\nMeet Ugo Panico\nIllustrator, sculptor and teacher. Ugo Panico trained at the Emile Cohl school and has remained there as a sculpture teacher for 12 years.\nHe taught illustration and anatomy at the Brassart school, the first school of graphic design and digital creation, created 75 years ago and located in 15 regions in France.\nToday, Ugo is working with AFITT to teach anatomical representation courses.\nFurthermore, as a service provider in image and volume, he has created numerous sets for operas, theatres and amusement parks.\n\nWorkshop dates: Wednesday 18th and Thursday 19th November\nFree registration on site (stand number to be announced)"
    }
  },
  {
    "id": "funexpo26-funeraire-animalier",
    "nom": "Funéraire animalier : un nouveau rôle pour les pompes funèbres ?",
    "texte": "L’animal de compagnie prend une place de plus en plus importante dans la vie des français au point d’être considéré comme un membre de la famille. Leur mort laisse de nombreuses familles démunies : elles connaissent mal leurs droits, les solutions existantes et les professionnels vers lesquels se tourner.\n\nAprès un point clair et accessible sur la réglementation aujourd’hui, cette conférence explorera la place que les pompes funèbres peuvent prendre face à ce besoin émergent : informer, orienter et imaginer de nouveaux services.\n\nUne invitation à regarder au-delà des pratiques actuelles et à réfléchir, très concrètement, à ce que pourrait devenir le funéraire animalier de demain.",
    "debut": "2026-11-18T14:00:00+01:00",
    "fin": null,
    "salle": "Salle de conférences",
    "type": "Conférence",
    "intervenants": [
      {
        "nom": "Caroline de Rauglaudre",
        "societe": "La neuvième planète",
        "fonction": "conseillère funéraire et juriste en droit animalier, co-fondatrice de l'association La neuvième planète"
      }
    ],
    "en": {
      "nom": "Pet Funeral",
      "texte": "A meeting dedicated to pet funerals, to shed light on this activity and its place in the profession.",
      "salle": "Conference room",
      "type": "Conference"
    }
  },
  {
    "id": "funexpo26-cocktail-ffpf",
    "nom": "Cocktail FFPF",
    "texte": "La FFPF joue les prolongations de 18h30 à 20h30. Au programme : cocktail et animation musicale sur son stand.",
    "debut": "2026-11-18T18:30:00+01:00",
    "fin": "2026-11-18T20:30:00+01:00",
    "salle": "Stand C99",
    "type": null,
    "stands": [
      "C99"
    ],
    "en": {
      "nom": "FFPF Cocktail",
      "texte": "The FFPF is extending its hours from 6:30pm to 8:30pm. On the program: cocktails and musical entertainment at its stand."
    }
  },
  {
    "id": "funexpo26-corps-montrables",
    "nom": "Tous les corps sont-ils montrables",
    "texte": "La présentation du défunt occupe une place essentielle dans l’accompagnement des familles. À travers son expérience de l’embaumement, Alain Koninckx apporte un éclairage sur les possibilités de présentation du corps, l’apparence apaisée du défunt et leur rôle dans le travail de deuil.\n\nPassionné par l’embaumement depuis sa découverte du milieu funéraire en 2003, il s’est formé au collège international des sciences mortuaires de Liège, avec des stages en Angleterre. Certifié en 2007 par l’European & International Examinations Board of Mortuary Science et membre du British Institute of Embalmers, il a travaillé neuf ans au laboratoire d’anatomie des facultés universitaires Notre-Dame de la Paix, autour du don de corps à la science. Depuis 2008, il exerce comme embaumeur indépendant, avec pour objectif la réconciliation des vivants et des morts.",
    "debut": "2026-11-19T10:30:00+01:00",
    "fin": null,
    "salle": "Salle de conférences",
    "type": "Conférence",
    "intervenants": [
      {
        "nom": "Alain Koninckx",
        "societe": "EUROPEAN SCHOOL OF EMBALMING SKILLS LIMITED",
        "fonction": "formateur restauration faciale"
      }
    ],
    "en": {
      "nom": "Are all bodies presentable?",
      "texte": "The presentation of the deceased plays a crucial role in supporting families. Through his experience with embalming, Alain Koninckx sheds light on the possibilities of presenting the body, the peaceful appearance of the deceased, and their role in the grieving process.\n\nPassionate about embalming since his discovery of the funeral industry in 2003, he trained at the International College of Mortuary Sciences in Liège, with internships in England. Certified in 2007 by the European & International Examinations Board of Mortuary Science and a member of the British Institute of Embalmers, he worked for nine years in the anatomy laboratory of the Notre-Dame de la Paix University Faculties, focusing on body donation to science. Since 2008, he has worked as an independent embalmer, dedicated to the reconciliation of the living and the dead.",
      "salle": "Conference room",
      "type": "Conference"
    }
  },
  {
    "id": "funexpo26-histoire-104",
    "nom": "Histoire des pompes funèbres et du \"104\"",
    "texte": "Explorez l’histoire des pompes funèbres et du « 104 » avec Bruno Bertherat, maître de conférences à l’université d’Avignon. Auteur d’une thèse sur la Morgue à Paris au XIXe siècle, il est spécialiste de l’histoire des pratiques funéraires à l’époque contemporaine.",
    "debut": "2026-11-19T14:00:00+01:00",
    "fin": null,
    "salle": "Salle de conférences",
    "type": "Conférence",
    "intervenants": [
      {
        "nom": "Bruno Bertherat",
        "societe": "Université d'Avignon",
        "fonction": "Maître de conférences à l'Université d'Avignon"
      }
    ],
    "en": {
      "nom": "History of funeral homes and the \"104\"",
      "texte": "Explore the history of funeral homes and the \"104\" with Bruno Bertherat, lecturer at the University of Avignon. Author of a thesis on the Morgue in 19th-century Paris, he is a specialist in the history of funeral practices in the contemporary era.",
      "salle": "Conference room",
      "type": "Conference"
    }
  },
  {
    "id": "funexpo26-thanatopraxie-environnement",
    "nom": "Thanatopraxie et l'environnement",
    "texte": null,
    "debut": "2026-11-20T14:00:00+01:00",
    "fin": null,
    "salle": "Salle de conférences",
    "type": "Conférence",
    "intervenants": [
      {
        "nom": "Alain Koninckx",
        "societe": "EUROPEAN SCHOOL OF EMBALMING SKILLS LIMITED",
        "fonction": "formateur restauration faciale"
      }
    ],
    "en": {
      "nom": "Embalming and the environment"
    }
  },
  {
    "id": "funexpo26-remise-diplomes-enamef",
    "nom": "Remise diplômes – ENAMEF",
    "texte": "Un rendez-vous pour saluer les parcours de formation et mettre à l’honneur les diplômés.",
    "debut": "2026-11-20T15:00:00+01:00",
    "fin": null,
    "salle": "Stand C99",
    "type": null,
    "stands": [
      "C99"
    ],
    "en": {
      "nom": "Graduation Ceremony – ENAMEF",
      "texte": "An event to celebrate training paths and honor graduates."
    }
  }
]$programme$::jsonb,
    sources = coalesce(sources, '{}'::jsonb) || jsonb_build_object(
      'conferences', jsonb_build_object('fournisseur', 'saisie', 'cle', null))
where slug = 'funexpo-2026';
