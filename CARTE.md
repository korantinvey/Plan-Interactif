<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 1533 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 332 · `programmeOffert` 337
`suggestionOfferte` 338 · `appliqueOptions` 340 · `langueOfferte` 364 · `appliqueLangue` 366
`catalogueTenu` 371 · `chercheSorte` 441 · `voletRecherche` 444 · `blocOrdreCriteres` 505
`minutesVisite` 676 · `seuilGere` 740 · `seuilImpose` 741 · `seuilParSurface` 742
`regleSeuil` 747 · `aireDuStand` 765 · `seuilConcentration` 801 · `phraseSeuil` 824
`lueHeure` 869 · `lueDate` 873 · `datesSalon` 880 · `horairesSalon` 894
`presseNuanciers` 933 · `suitNuancier` 949 · `trio` 977 · `melange` 987
`appliqueAccent` 1001 · `appliqueFond` 1035 · `modeDist` 1082 · `couleurDist` 1094
`appliqueDists` 1116 · `modeBarre` 1146 · `appliqueBarre` 1148 · `modeleRetenu` 1188
`policeChoisie` 1344 · `policeDuModele` 1349 · `feuillePolice` 1359 · `chargePolice` 1381
`policePrete` 1401 · `policeDesNoms` 1419 · `posePoliceLibelles` 1448
`appliqueModele` 1480 · `habilleModale` 1524

### `_admin2.html` — 272 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 114 · `panneDuChargement` 161
`CLE_VERSION` 171 · `versionRetenue` 172 · `retientVersion` 175 · `demandePlan` 199
`charge` 223

### `_aimants.html` — 488 l. → plan-admin.html

- l.3 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 16 · `coteCadre` 20 · `montreCote` 32 · `aimantsActifs` 60 · `axesDe` 64
`pointsAimants` 69 · `oublieAimantsDuPlan` 89 · `aimantsDuPlan` 91 · `pasAimant` 124
`cale` 132 · `sousLeGeste` 137 · `cranGrille` 148 · `oublieAimants` 165
`aimantsDessines` 167 · `coinsGeste` 193 · `montreAimants` 215 · `meilleurSommet` 280
`croixAimant` 294 · `correction` 318 · `aimante` 359 · `retientTaille` 373
`reprendTaille` 387 · `dupliqueForme` 408 · `pousseForme` 433 · `ecritDimensions` 450
`appliqueDimension` 469

### `_application.html` — 13 l.

- l.1 · 19. L'application installée — son icône et son nom

### `_auth-plan.html` — 204 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 131 · `mailDuJeton` 138 · `litProfilA` 149
`initialesDe` 162 · `poseCompte` 169

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `_batiments.html` — 560 l. → plan-admin.html

- l.2 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 27 · `bibliothequeDispo` 28 · `refBatiment` 45 · `refForme` 49
`marqueBatiment` 52 · `batimentsPoses` 55 · `estBatiment` 62 · `hallsPoses` 65
`lieuDuCalque` 71 · `poseCalage` 77 · `ouvreBibliotheque` 86 · `vueDuLieu` 182
`lanceCalage` 222 · `effaceLeTempsDuCalage` 250 · `cadreCalage` 269 · `finCalage` 282
`pivoteCalage` 293 · `degresCalage` 309 · `dessineCalage` 314 · `calagePointerDown` 337
`calagePointerMove` 350 · `calagePointerUp` 366 · `reposeBatiment` 379
`ajouteBatiments` 395 · `boutonRecale` 479 · `pictoRecale` 488 · `calageRelu` 505
`rouvreCalage` 531 · `mentionOsm` 555

### `_borne.html` — 371 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — un plan qui sait où il est

Fonctions :

`pointBorne` 62 · `borneRetenue` 70 · `retientBorne` 76 · `oublieBorne` 79 · `lieuBorne` 98
`lieuNomme` 117 · `pointLibre` 122 · `poseDepartImpose` 135 · `poseLaBorne` 146
`remetLeDepart` 165 · `poseBorneIci` 179 · `armeLaPose` 188 · `montreBandeauBorne` 204
`ecritDepartBorne` 218 · `rayonBorne` 232 · `dessineBorne` 237 · `rafraichitBorne` 253
`rempliBorne` 258 · `relanceRepos` 287 · `reposeLaBorne` 294 · `demarreBorne` 330

### `_branche-mesure.html` — 10 l.

- l.1 · 13. Mesure d'utilisation — le branchement

### `_chaleur.html` — 13 l.

- l.1 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 434 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`entetes` 37 · `renouvelle` 46 · `appel` 62 · `rest` 73 · `verseModale` 103
`ouvreModale` 109 · `verrouilleModale` 132 · `fermeModale` 134 · `gardeLaPlace` 157
`demande` 162 · `confirme` 184 · `ecranConfig` 195 · `ecranConnexion` 223 · `deconnecte` 286
`signale` 297 · `bloc` 318 · `grille` 336 · `idCompte` 380 · `themeSombre` 390
`initialesDe` 410

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 78 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console-js.html` — 2212 l. → admin-plans.html

- l.483 · Provenance des données
- l.622 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 25 · `slugifie` 99 · `courant` 103 · `charge` 105 · `chargePlans` 120
`majEvenement` 125 · `selonAdresse` 145 · `majAdresse` 153 · `majBarre` 168
`dessineChoix` 210 · `champ` 230 · `champFavicon` 273 · `dessineFiche` 359
`fournisseurUtilise` 547 · `sourceNom` 557 · `source` 561 · `champCle` 566
`ligneSource` 601 · `paraitSurFiche` 759 · `origineConferences` 765 · `origineProduits` 772
`resumeProvenance` 837 · `resumeFiche` 858 · `caseFiche` 903 · `cibleEn` 951
`champsPersos` 953 · `criteres` 959 · `ecritFiche` 962 · `caseCritere` 977 · `clePerso` 996
`ajouteChampPerso` 1004 · `renommeChampPerso` 1022 · `retireChampPerso` 1070
`lignesPerso` 1131 · `ligneOutil` 1152 · `ligneReglage` 1168 · `ouvreProvenance` 1180
`ouvreSources` 1203 · `cadreFiche` 1255 · `ouvreFiche` 1285 · `cadreCategories` 1425
`sousTitre` 1504 · `tableauChamps` 1519 · `champOrigine` 1745 · `majLiens` 2013
`majIntegration` 2050 · `majMsgSync` 2057 · `dupliquer` 2081 · `videEcran` 2180
`dessine` 2185 · `demarre` 2200

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 725 l. → console.css

- l.666 · Page de rapport

### `_dessin.html` — 2559 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 169 · `enregistreDessins` 171 · `instantane` 215 · `clotSalve` 226
`memorise` 227 · `restaure` 238 · `annule` 254 · `refais` 266 · `trouveCalque` 269
`nouvelId` 270 · `cheminArrondi` 288 · `estCadre` 331 · `cheminForme` 333 · `styleTrait` 353
`longueurFleche` 379 · `cheminFleche` 393 · `marqueFleche` 422 · `rafraichitFleches` 433
`poseTrait` 450 · `traceForme` 461 · `rotationTexte` 480 · `dessineDessins` 485
`redessineForme` 526 · `peintCalque` 550 · `versPlan` 556 · `apercu` 562 · `apercuGuide` 574
`toleranceTrace` 599 · `aimanteContour` 604 · `rayonContour` 607 · `redresseTrace` 626
`traceGuide` 660 · `fermeIci` 667 · `ajouteForme` 674 · `pictoDe` 802
`nomTypeRepereFr` 858 · `nomTypeRepere` 860 · `typeZone` 890 · `pictoForme` 897
`estPorte` 917 · `ouvreEntrant` 918 · `ouvreSortant` 919 · `modeDit` 959 · `lettreMode` 961
`estTransport` 965 · `modeTransport` 968 · `glypheRepere` 980 · `cleLigne` 1017
`ligneAffichee` 1028 · `couleurLigne` 1036 · `couleurRepere` 1042 · `encreRepere` 1048
`nomLigneFr` 1062 · `libelleDoffice` 1070 · `couleurEcrite` 1077 · `traceRepere` 1096
`nomSurLePlan` 1230 · `etiquetteSociete` 1241 · `seRattache` 1269 · `societeDeForme` 1281
`societesDuPlan` 1293 · `poseChampImage` 1315 · `remplitListeSocietes` 1322
`societeSaisie` 1330 · `traceImage` 1358 · `traceStandDessine` 1383
`texteStandDessine` 1407 · `poseLibellesDessines` 1425 · `decoupeStand` 1446
`marqueStandsDessines` 1461 · `rafraichitStandsDessines` 1476 · `oublieReperes` 1506
`reperesCherchables` 1508 · `vaAuRepere` 1552 · `clePoi` 1595 · `pastillePoi` 1604
`cartouchePoi` 1608 · `ouvrePoi` 1727 · `mesureCartouche` 1800 · `pharePoi` 1816
`phareRepere` 1820 · `phareZone` 1822 · `eclairePoi` 1828 · `oublieChoixPoi` 1861
`signale` 1870 · `calquePourImage` 1885 · `lienImageSaisi` 1913 · `formeImage` 1925
`poseImage` 1934 · `ditImagePosee` 1956 · `importeImage` 1964 · `dessinPointerDown` 2015
`dessinPointerMove` 2100 · `dessinPointerUp` 2138 · `termineTrace` 2179 · `aide` 2191
`outilOffert` 2221 · `choisitOutil` 2224 · `enchaineStand` 2255 · `optionsModes` 2285
`proposeCouleurLigne` 2296 · `montreTransport` 2307 · `activeCalque` 2373 · `cleVerrou` 2431
`verrouille` 2432 · `basculeVerrou` 2434 · `pictoVerrou` 2451 · `montreRoleIti` 2485
`creeCalque` 2516 · `demandeNom` 2529 · `renommeCalque` 2548

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 652 l. → plan-admin.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 28 · `poignees` 33 · `dessinePoignees` 42
`cadreTexte` 77 · `poigneeRotation` 97 · `angleBorne` 107 · `choisitForme` 109
`majElement` 120 · `candidatsLiaison` 241 · `ecritDesDeuxCotes` 263 · `changeLien` 275
`changeDureeLien` 291 · `majLiens` 308 · `appliqueSociete` 360 · `appliqueTexte` 376
`appliqueRotation` 388 · `appliqueRayon` 402 · `appliqueTrait` 415 · `appliqueTransport` 443
`appliquePicto` 466 · `supprimeForme` 492 · `editionPointerDown` 502
`editionPointerMove` 562 · `tourneTexte` 625 · `editionPointerUp` 641

### `_entete.html` — 6 l.

### `_environs.html` — 27 l. → plan-admin.html

- l.1 · 16. Les environs — le branchement

### `_export.html` — 12 l. → admin-plans.html, rapport.html

- l.1 · Export par exposant — le branchement

### `_fiche.html` — 1326 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 7. Sélection et fiche

Fonctions :

`ETROIT` 9 · `anime` 25 · `noeud` 49 · `canalPlan` 59 · `rangSociete` 67 · `select` 76
`centre` 101 · `brancheActesFiche` 112 · `centreEtBaisseLaFiche` 128 · `centrePoint` 146
`montre` 191 · `libelleCorps` 223 · `ordreCorps` 240 · `groupesFiche` 272
`montreIntitule` 285 · `valeurCorps` 305 · `champCorps` 318 · `groupeCorps` 330
`corpsRange` 343 · `programme` 358 · `produits` 407 · `ficheProduit` 435 · `ficheConf` 505
`pictoRS` 685 · `adresseVignette` 709 · `ecarteClicFantome` 727 · `nomSociete` 736
`societes` 749 · `choisitExposant` 760 · `poseMarque` 798 · `montreMarque` 858
`poseCode` 881 · `rangeMarque` 922 · `ouvre` 985 · `ferme` 1297 · `onglet` 1315

Éléments :

`#dGo` · `#dItin`

### `_geometrie.html` — 933 l. → plan-admin.html

- l.2 · 11 octies. Reprendre à la main la géométrie d'un emplacement

Fonctions :

`cleGeo` 30 · `geometrieSource` 49 · `reposeSource` 58 · `poseGeometrie` 67
`retoucheGeo` 81 · `elargitEmprise` 94 · `appliqueGeometries` 115 · `cleVerrouGeo` 145
`geoVerrouille` 146 · `basculeVerrouGeo` 148 · `boutonVerrouGeo` 163 · `modeGeometrie` 174
`objetGeoSous` 201 · `groupeGeo` 211 · `choisitGeo` 219 · `cadreGeo` 234 · `prisesGeo` 254
`curseurGeo` 266 · `dessinePoigneesGeo` 269 · `ecritDimensionsGeo` 297 · `nomSorteGeo` 309
`majPaletteGeo` 311 · `finGesteGeo` 350 · `enregistreGeo` 368 · `geometrieOrigine` 382
`retraceGeo` 397 · `pousseGeometrie` 408 · `appliqueDimensionGeo` 425 · `cleAjout` 464
`anneauxValides` 478 · `rechAjout` 483 · `objetAjoute` 492 · `poseLien` 511
`appliqueAjouts` 538 · `enregistreAjout` 574 · `ajouteEmplacement` 589 · `renommeAjout` 617
`lieAjout` 649 · `ecritInfosAjout` 678 · `supprimeAjout` 705 · `choisitOutilGeo` 734
`aideAjout` 741 · `fermeAjout` 751 · `ajoutPointerDown` 760 · `ajoutPointerMove` 776
`ajoutPointerUp` 798 · `geometriePointerDown` 818 · `accrocheGeo` 849
`geometriePointerMove` 851 · `geometriePointerUp` 902

### `_gestes.html` — 951 l. → plan-admin.html, plan-smcl.html, plan.html

- l.4 · 8. Interactions du plan
- l.451 · Ce que les tiroirs lisent d'un geste
- l.497 · Le tiroir de la liste — écrans étroits
- l.723 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`milieu` 24 · `commencePince` 30 · `suitPince` 44 · `plieLesBandes` 97 · `saisitPlan` 111
`cibleElargie` 197 · `planifieFiltre` 407 · `traceurDeGeste` 475 · `cranVoisin` 494
`retraitBas` 520 · `mesureTiroir` 534 · `montreTiroir` 537 · `hisseTiroir` 541
`tiroirCrante` 750

### `_head.html` — 628 l. → plan-admin.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#logoSalon` · `#titre` · `#hallsBande`
`#halls` · `#btnLangue` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnItineraire` · `#menuCompte` · `#avatarCompte` · `#compteMail` · `#btnSortir`
`#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q` · `#videQ`
`#btnFiltres` · `#nFiltres` · `#panCrit` · `#critCorps` · `#critPied` · `#critVider`
`#critVoir` · `#actifs` · `#count` · `#countTxt` · `#list` · `#piedSide`
`#btnConfidentialite` · `#stage` · `#fondCarteGL` · `#fondTuiles` · `#fondCarte`
`#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#calqueLibelles`
`#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#creditCarte` · `#mentionOsm`
`#poi` · `#poiDefile` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#calageBat`
`#calageAngle` · `#calageQuart` · `#calageStop` · `#calageValide` · `#iciRappel`
`#iciRappelTxt` · `#iciStop` · `#bornePose` · `#bornePoser` · `#calage` · `#calageFerme`
`#calageCorps` · `#calageCarte` · `#calageEtat` · `#calageGarde` · `#outils`
`#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#traitFleche`
`#texteADessiner` · `#repereType` · `#repereTransport` · `#repereMode` · `#repereLigne`
`#repereCouleur` · `#repereTexte` · `#imageSoc` · `#standSoc` · `#listeSoc`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTransport` · `#elemMode` · `#elemLigne`
`#elemCouleur` · `#elemTexte` · `#elemLiens` · `#elemLiensListe` · `#elemLienAjout`
`#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur` · `#elemTailleBloc`
`#elemTaille` · `#elemRotationBloc` · `#elemRotation` · `#elemRotationQuart`
`#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur` · `#elemStyle`
`#elemFleche` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom`
`#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#geoReg` · `#geoNom` · `#geoFerme`
`#geoInfos` · `#geoCodeL` · `#geoCode` · `#geoSocL` · `#geoSoc` · `#geoTitreL` · `#geoTitre`
`#geoDim` · `#geoLargeur` · `#geoHauteur` · `#geoOrigine` · `#geoFiche` · `#geoSupprime`
`#geoAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile`
`#voile` · `#detail` · `#poigneeFiche` · `#dRubans` · `#dGoIco` · `#dItinIco` · `#dMarque`
`#closeDetail` · `#dKind` · `#dPast` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode`
`#dVis` · `#dPartage` · `#dCorne` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb`
`#dOngProd` · `#dOngNbProd` · `#dBody` · `#parcours` · `#poigneeParcours` · `#closeParcours`
`#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee` · `#jRefaire`
`#btnPartage` · `#jJours` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied`
`#jRetour` · `#itineraire` · `#poigneeItineraire` · `#closeItineraire` · `#iResume`
`#iCorps` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB`
`#iPmr` · `#iResultat` · `#videItineraire`

### `_hors-ligne.html` — 45 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_ici.html` — 573 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 septies. « Vous êtes ici » — le code affiché dans le hall

Fonctions :

`prefixePlan` 83 · `coteIci` 95 · `nomCodeIci` 111 · `codeIci` 130 · `litCodeIci` 145
`lienIci` 165 · `poseIci` 191 · `retireIci` 218 · `oublieIciDeLAdresse` 248
`montreBandeauIci` 264 · `demarreIci` 298 · `pointTouche` 324 · `codeIciAuPoint` 336
`armeCodeIci` 342 · `afficheIci` 364 · `ligneAffiche` 404 · `nomFichierIci` 413
`ouvreCodeIci` 428 · `boutonsCodeIci` 480 · `telechargeAfficheIci` 505
`imprimeAfficheIci` 523 · `boutonCodeIci` 552

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_installation.html` — 41 l. → plan-admin.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`retourAuxReglages` 33

### `_itineraire.html` — 800 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — le tiroir, la visée et le tracé

Fonctions :

`calculeRoute` 36 · `couleurNappe` 62 · `rafraichitApercu` 68 · `marchesIci` 111
`rayonBout` 116 · `arreteTracage` 149 · `peintItineraire` 155 · `lanceTracage` 206
`dessineItineraire` 231 · `rafraichitBouts` 253 · `cadreItineraire` 276 · `champIti` 300
`fermeSugg` 304 · `montreSugg` 311 · `choisitPoint` 345 · `valideSaisie` 354
`effaceItineraire` 366 · `relance` 393 · `montreResultat` 435 · `bandeauVisee` 577
`armeVisee` 600 · `finVisee` 618 · `viseItineraire` 634 · `visePoi` 640 · `visePoint` 646
`ouvreItineraire` 678 · `fermeItineraire` 706 · `versItineraire` 716
`versItineraireDe` 719

### `_journee.html` — 1741 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa visite

Fonctions :

`finInstant` 107 · `joursSalon` 116 · `joursAVenir` 145 · `joursDefaut` 163
`confsParJour` 173 · `pointConf` 190 · `departsProposes` 209 · `matriceJournee` 242
`derouleJournee` 313 · `prepareSejour` 457 · `calculeSejour` 659 · `apercuRepartition` 693
`rangJournee` 707 · `lienJournee` 719 · `boutonJour` 742 · `arretJournee` 755
`remplitOnglets` 802 · `jourDuStand` 831 · `ouvreChoixJour` 843 · `figeLaVisite` 900
`placeSurJour` 909 · `rendAuPlan` 917 · `retireDuSejour` 923 · `remplitJournee` 933
`ecritApercu` 1146 · `appliqueVueParcours` 1176 · `traceJournee` 1218 · `montreLeJour` 1227
`perimeJournee` 1242 · `oublieSejour` 1257 · `ouvreOrganisation` 1272 · `essaieSejour` 1652
`lanceSejour` 1682 · `refaitSejour` 1721

### `_js.html` — 540 l. → plan-admin.html, plan-smcl.html, plan.html

- l.27 · 1. Index global — la recherche porte sur tous les pavillons

Fonctions :

`nomDeLaZone` 44 · `nomsAnglaisDesZones` 46 · `texteProduits` 59 · `indexe` 63
`chronoConf` 302 · `confsDuPlan` 307 · `indexeConferences` 325 · `rangeConferences` 403
`poseFavicon` 450 · `poseLogoSalon` 476 · `poseTonDeLaBarre` 513

Éléments :

`#data`

### `_langue.js` — 794 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_modales.html` — 119 l. → plan-admin.html

- l.2 · Fenêtres modales — le branchement, et la réorganisation des calques

Fonctions :

`deplaceVers` 19 · `versExtremite` 31 · `remplitOrdre` 39 · `ouvreOrdre` 109

### `_mode-admin.html` — 1106 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 10. Mode administration
- l.114 · La fiche d'une zone organisateur
- l.834 · Masquer une zone organisateur
- l.931 · Placer un libellé à la main

Fonctions :

`retireAdmin` 20 · `activeAdmin` 34 · `champZone` 140 · `champsZone` 165 · `champSalles` 257
`nomDeZone` 309 · `cadreLogo` 335 · `champLogo` 407 · `editeurRiche` 445
`memeFicheZone` 602 · `suitFicheZone` 609 · `verseFicheZone` 617 · `ficheZone` 643
`enregistreZone` 668 · `enregistreZoneAjoutee` 781 · `basculeAffichageZone` 845
`marqueZonesMasquees` 873 · `ecritColonnesEvenement` 893 · `ecritColonneEvenement` 927
`cleLibelle` 952 · `empreinteLibelle` 968 · `placementLibelle` 976 · `posePlacement` 987
`libelleAutomatique` 1004 · `modePlacementLibelles` 1013 · `majPaletteLibelle` 1032
`choisitLibelle` 1049 · `pousseLibelle` 1056 · `libellePointerDown` 1064
`libellePointerMove` 1080 · `libellePointerUp` 1089

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_motdepasse.html` — 254 l. → motdepasse.html

- l.61 · Poser un mot de passe

Fonctions :

`$` 82 · `CFG` 84 · `dit` 92 · `fragment` 98 · `garde` 105 · `lit` 109 · `demandeLien` 182
`ouvreSaisie` 191

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_ordre-fiche.html` — 662 l. → plan-admin.html, plan-smcl.html, plan.html

Fonctions :

`clesFiche` 25 · `voletOrdre` 42 · `enregistreConf` 630 · `ecarte` 644 · `joli` 659

### `_parcours.html` — 399 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`basculeParcours` 28 · `verseAuParcours` 73 · `retenusPourParcours` 119
`ajouteToutAuParcours` 144 · `poseToutAuParcours` 167 · `brancheParcours` 191
`rafraichitParcours` 204 · `rangParcours` 234 · `remplitParcours` 254 · `ouvreParcours` 343
`fermeParcours` 355 · `videLeParcours` 371

### `_partage.html` — 128 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`accueilleParcoursPartage` 33 · `adoptePartage` 111 · `parcoursACopier` 127

### `_pile.html` — 536 l. → plan-admin.html

- l.2 · Pile des calques
- l.50 · Panneau : deux sections, chacune rangée par nom
- l.346 · Repères
- l.398 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 24 · `groupe` 36 · `ordonneDom` 44 · `nature` 68
`boutonAjout` 75 · `boutonVerrou` 95 · `intertitre` 103 · `construitPanneau` 111
`sectionSelection` 362 · `sectionFond` 418 · `ligneCouleur` 476 · `rangSecteur` 496
`rangSous` 509 · `defautCouleur` 531

### `_pousse.html` — 591 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration
- l.461 · La sauvegarde emportée

Fonctions :

`autoDispo` 63 · `enRetard` 66 · `etatCourant` 79 · `majAttente` 90 · `compteRescapes` 104
`ditAlerte` 117 · `ditEtat` 161 · `programmeEnvoi` 168 · `programmePublication` 182
`rattrapeRetard` 189 · `envoie` 194 · `presse` 207 · `identifiants` 229
`reglagesSeuls` 244 · `noteReglagesCharges` 255 · `oublieCache` 269
`pousseConfiguration` 288 · `sauvegardeCourante` 481 · `telechargeSauvegarde` 503
`appliqueSauvegarde` 526 · `litSauvegarde` 560 · `brancheSauvegarde` 582

### `_rappels.html` — 17 l.

- l.1 · 11 sexies. Le rappel avant une conférence

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 444 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`courant` 52 · `chargeEvenements` 57 · `joursPeriode` 75 · `chargeRapport` 77 · `chiffre` 88
`barres` 107 · `portes` 147 · `jours` 198 · `dessineRapport` 219 · `dessineBarre` 372
`rafraichit` 395 · `videEcran` 414 · `demarre` 430

Éléments :

`#lienPublic`

### `_recherche.html` — 1270 l.

- l.3 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le

Fonctions :

`indexeSecteurs` 24 · `secteursMontres` 37 · `couleurConf` 41 · `couleurSecteur` 50
`BANDES` 71 · `majFondus` 79 · `pastilleSecteur` 117 · `coloreSecteurs` 130
`peintSecteur` 182 · `appliqueSecteurs` 195 · `filtreTheme` 212 · `themeFiltrable` 292
`ordreCriteres` 312 · `clesCriteres` 335 · `libelleCritere` 342 · `valeursCritere` 361
`texteCriteres` 374 · `texteAnglaisPerso` 390 · `indexeCriteres` 404 · `refaitCriteres` 438
`dansCriteres` 445 · `critereActif` 453 · `basculeCritere` 455 · `videCriteres` 464
`majVideQ` 473 · `videRecherche` 486 · `nCriteres` 501 · `majCriteres` 516
`remplitCriteres` 583 · `basculeCriteres` 722 · `ouvreCriteres` 727 · `fermeCriteres` 743
`filtre` 760 · `reposeRetrait` 780 · `critParSociete` 784 · `cherchable` 794 · `visible` 801
`releveHotes` 822 · `visibleSurPlan` 830 · `visibleSociete` 841 · `marqueRetrait` 857
`appliqueFiltre` 875 · `oublieRetrait` 891 · `reprendRecherche` 900 · `rangSorte` 913
`codeCase` 935 · `caseNumero` 952 · `sousLigne` 972 · `liste` 986 · `marqueChoisie` 1114
`prechargeMarque` 1140 · `prechargeLesVignettes` 1197 · `chargeUnLot` 1243

### `_reglages.html` — 927 l. → plan-admin.html

Fonctions :

`texteCorps` 66 · `clesPortees` 91 · `standApercu` 111 · `lignesApercu` 135
`contenuApercu` 165 · `apercuFiche` 202 · `apercuListe` 280 · `apercuDuo` 302
`glisseFenetre` 336 · `ouvreReglages` 348 · `voletZones` 476 · `champsFicheZone` 578
`ficheZoneEnPlace` 648 · `voletPlan` 666 · `blocRappel` 714 · `ditEssaiRappel` 825
`voletCoexposants` 859

### `_rendu.html` — 625 l.

- l.3 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.109 · 3. Rendu du pavillon courant
- l.484 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`largeur` 8 · `decoupe` 29 · `habille` 42 · `lignesSvg` 53 · `coexComptes` 70
`coexChoisit` 71 · `ligneCode` 87 · `monteHabillage` 115 · `baliseZone` 144
`baliseStand` 154 · `montePlan` 161 · `onglets` 196 · `changePlan` 218 · `texteDist` 265
`texteCourtDist` 270 · `porteDist` 274 · `standPorte` 278 · `calqueDists` 287
`traceDist` 318 · `oublieDists` 351 · `modesDuPlan` 355 · `releveDists` 357
`dessineDists` 386 · `marquesListe` 412 · `poseDistsFiche` 442 · `refaitDistsFiche` 482
`ancre` 492 · `place` 493 · `libelles` 495 · `decaleLibelle` 582 · `facteurLibelle` 583
`libelleForce` 584 · `libelleZone` 587 · `libelleEmplacement` 606

### `_sponsor.html` — 14 l. → plan-admin.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

### `_styles-divers.css` — 315 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-jetons.css` — 270 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles-parcours.css` — 1556 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles.css` — 830 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-parcours.css` — 601 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-plan.css` — 1600 l. → plan-admin.html, plan-smcl.html, plan.html

### `_suggestion.html` — 685 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationsSugg` 83 · `presenteSugg` 89
`critereSugg` 94 · `indexSugg` 106 · `valeursSugg` 131 · `suggestionCourante` 150
`exposantPropose` 186 · `nomValeurSugg` 204 · `phraseSuggestion` 225 · `carteSuggestion` 253
`poseSuggestion` 302 · `fenetreSuggestion` 316 · `relevePalmares` 356 · `etiquetteSugg` 376
`voletSuggestion` 386

### `_sw.js` — 562 l.

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_tutoriel.html` — 905 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 17. La visite guidée — le tour du plan, geste par geste

Fonctions :

`reglageTuto` 52 · `tutoPropose` 61 · `cleTuto` 65 · `tutoOuvert` 67 · `tutoModale` 68
`tutoFicheOuverte` 74 · `tutoFiche` 77 · `tutoParcours` 79 · `tutoItineraire` 82
`tutoJournee` 86 · `zoneDuTuto` 94 · `insecable` 111 · `phraseTrajetTuto` 117
`chapitresTuto` 377 · `proposeTutoriel` 397 · `lanceTutoriel` 455 · `quitteTutoriel` 542
`chapitreTuto` 553 · `battementTuto` 562 · `finTuto` 580 · `afficheTuto` 597 · `pxTuto` 652
`boiteTuto` 655 · `repereTuto` 669 · `rameneTuto` 702 · `placeTuto` 740 · `voileTuto` 822
`rafaleTuto` 839 · `marqueZoneTuto` 859 · `marqueLibelleTuto` 894

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `_volets.html` — 1165 l. → plan-admin.html

Fonctions :

`voletAdmin` 4 · `blocOptions` 169 · `blocLangues` 216 · `blocBarre` 290
`blocHoraires` 348 · `voletParcours` 490 · `sallesSituees` 625 · `voletPmr` 641
`nomDuTon` 732 · `svgVignette` 741 · `barreVignette` 743 · `vignetteDistPlan` 747
`vignetteDistListe` 760 · `vignetteDistFiche` 774 · `salonDitSes` 794 · `coinPris` 801
`voletDist` 824 · `voletApparence` 989

### `_vue.html` — 479 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 6. Vue

Fonctions :

`cadrePlan` 18 · `oublieCadre` 19 · `figeTextes` 35 · `rendTextes` 43 · `cadrage` 79
`peintLibelles` 84 · `detacheLibelles` 90 · `rattacheLibelles` 102 · `etireLibelles` 120
`appliqueVue` 128 · `libellesDeLaVue` 192 · `rafraichitVue` 200 · `poseVue` 216
`mesureBarre` 247 · `masqueHaut` 279 · `masque` 286 · `masqueDroite` 323 · `fit` 334
`stoppeZoom` 367 · `glisseVersVise` 373 · `glisseVers` 415 · `rectVisee` 437 · `zoom` 457
`echelle` 470

### `_webgl.html` — 165 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — le branchement

Fonctions :

`enEdition` 33 · `emplacementWebgl` 61 · `libellesWebgl` 109

### `modules/appel-fonction.mjs` — 61 l. → console

- l.1 · L'appel des fonctions du projet, depuis la console

Fonctions :

`brancheFonctions` 30 · `refus` 43 · `fonction` 54

### `modules/application.mjs` — 37 l. → plan, plan-admin

- l.1 · L'application installée — ce que le plan public en sait

Fonctions :

`adresseIconeApp` 26 · `appDuSalon` 34 · `iconeDeLApplication` 37

### `modules/avancement.mjs` — 432 l. → console

- l.1 · L'avancement d'une synchronisation — la fenêtre, et son secours

Fonctions :

`brancheAvancement` 29 · `fenetreAvancement` 60 · `suitAuServeur` 392

### `modules/calage-carte.mjs` — 828 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 73 · `centrePavillon` 88 · `basculeMasqueCarte` 93
`boutonMasqueCarte` 104 · `pictoMasque` 115 · `carreDeTerrain` 142 · `chercheBatiments` 158
`empriseDesObjets` 186 · `batimentsCandidats` 204 · `caleSurBatiment` 225
`retientLeHall` 251 · `manqueCalage` 273 · `enregistreCalage` 282 · `calageEnregistre` 299
`oublieCalageEnCours` 320 · `litCoordonnees` 332 · `rafraichitCarte` 346 · `armeCalage` 383
`pivotCalage` 394 · `glisseCarte` 398 · `cartePointerDown` 405 · `cartePointerMove` 419
`cartePointerUp` 438 · `ditCalage` 446 · `majCalage` 455 · `appliqueCalage` 477
`tourneCalage` 484 · `construitCalage` 490 · `ouvreCalage` 655 · `fermeCalage` 665
`brancheCalageCarte` 678 · `voletEnvirons` 704

### `modules/chaleur.mjs` — 674 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.455 · Remise à zéro des compteurs

Fonctions :

`nbChal` 56 · `tonChaleur` 75 · `niveauChaleur` 97 · `valeurChaleur` 100
`chargeChaleur` 113 · `coloreChaleur` 159 · `cartoucheChaleur` 194
`mesureCartoucheChaleur` 258 · `replieChaleur` 264 · `ecritEtatChaleur` 275
`dessineEchelleChaleur` 283 · `dessineTopChaleur` 303 · `phraseChaleur` 345
`rafraichitChaleur` 370 · `montreChaleur` 404 · `rangChaleur` 437 · `aplati` 477
`voletMesure` 482 · `evenementCourant` 508 · `ouvreRemiseAZero` 527 · `lanceRemiseAZero` 619
`brancheChaleur` 666

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `modules/charge-annoncee.mjs` — 228 l. → plan, plan-admin

- l.1 · La charge annoncée — ce que les autres journées ont déjà posé

Fonctions :

`seuilConcentration` 24 · `identifiantParcours` 26 · `parcours` 28 · `sejour` 30
`brancheCharge` 39 · `chargeSuivie` 79 · `etapesDuSejour` 85 · `annoncePlan` 113
`celluleUtile` 149 · `dilatationDuJour` 166 · `litLaCharge` 203 · `chargeCellule` 223

### `modules/classeur.mjs` — 235 l. → console, rapport

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 30 · `crc32` 40 · `archiveZip` 55 · `texteXml` 111 · `colonneXl` 114
`XL_PARTS` 125 · `feuilleXl` 179 · `classeurXl` 215 · `enregistreFichier` 226

### `modules/comptes.mjs` — 374 l. → console

- l.1 · Comptes et accès — l'annuaire, et la fiche d'une personne

Fonctions :

`brancheComptes` 45 · `poseComptes` 55 · `litMonProfil` 69 · `RETOUR_MDP` 80
`litComptes` 82 · `ligneMessage` 91 · `casesSalons` 101 · `ouvreComptes` 131
`ouvreFicheCompte` 223

### `modules/console.mjs` — 52 l. → console

- l.1 · Point d'entrée de la console

### `modules/correspondance.mjs` — 122 l. → console

- l.1 · Correspondance des champs d'origine — le vocabulaire du réglage

Fonctions :

`encode` 27 · `decode` 29 · `correspondance` 34 · `sansPrefixe` 37 · `courte` 38
`intitule` 53 · `intituleSuite` 65 · `aplani` 87 · `memeStyle` 97 · `autreFace` 115

### `modules/couleurs.mjs` — 34 l. → plan, plan-admin

- l.1 · Les couleurs : d'une notation à l'autre, et ce que l'œil en perçoit

Fonctions :

`hslHex` 7 · `rgbHex` 19 · `hexa` 27 · `luminance` 31

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

### `modules/dom.mjs` — 10 l. → plan, plan-admin, console, rapport

- l.1 · Le document : ce que tout le code demande à la page

Fonctions :

`$` 10

### `modules/donnees.mjs` — 84 l. → plan, plan-admin

- l.1 · Les données du plan, leurs index, et ce que la vue regarde

Fonctions :

`poseDonnees` 50 · `P` 84

### `modules/environs.mjs` — 783 l. → plan, plan-admin

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`brancheEnvirons` 60 · `calageEnCours` 68 · `confieCalageEnCours` 70 · `styleSobre` 143
`forceCarte` 237 · `calagePose` 255 · `calageCourant` 267 · `fondCourant` 270 · `recul` 275
`adresseTuile` 280 · `tuilesDeLaVue` 290 · `chargeMapLibre` 355 · `vueGL` 386
`styleDuFond` 407 · `guetteLaCarte` 435 · `poseCarteGL` 446 · `diagnostiqueGL` 532
`relanceCarteGL` 552 · `videCarteGL` 564 · `dessineFondCarte` 589 · `cleMasqueCarte` 694
`masqueCarte` 695 · `formesMasquantes` 704 · `contourDuHall` 726 · `cheminDuHall` 733
`poseMasqueCarte` 751 · `ditCarte` 766 · `refaitFondCarte` 776

### `modules/essai-rappel.mjs` — 69 l. → plan-admin

- l.1 · L'essai d'un vrai rappel, depuis les réglages

Fonctions :

`essaieRappelReel` 37

### `modules/export.mjs` — 232 l. → console, rapport

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 34 · `colonnesExport` 118 · `libellePeriode` 150 · `nomFichierExport` 156
`nomFeuilleExport` 166 · `exporteExposants` 182 · `brancheExport` 230

### `modules/fenetre.mjs` — 100 l. → plan, plan-admin

- l.1 · La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire

Fonctions :

`_habille` 8 · `poseAvantFermeture` 19 · `verseModale` 21 · `poseApresFermeture` 36
`ouvreModale` 46 · `fermeModale` 66 · `confirme` 76 · `brancheFenetre` 93

### `modules/forme.mjs` — 154 l. → plan, plan-admin

- l.1 · La forme d'un emplacement — anneaux, tracé, empreinte, ancrage du nom

Fonctions :

`arrondiGeo` 14 · `empreinteGeo` 25 · `anneauxGeo` 45 · `traceGeo` 58 · `boiteAnneaux` 62
`dansAnneau` 80 · `distSegmentGeo` 91 · `distBordGeo` 100 · `poleGeo` 110 · `porteeGeo` 129
`boiteGeo` 137

### `modules/fuseau.mjs` — 115 l. → console

- l.1 · Fuseau horaire du salon — le champ de la console

Fonctions :

`brancheFuseau` 28 · `fuseauConnu` 42 · `champFuseau` 54

Éléments :

`#fuseaux`

### `modules/icone-app.mjs` — 126 l. → plan-admin

- l.1 · L'icône de l'application, fabriquée depuis un logo déposé

Fonctions :

`fondPourIconeApp` 56 · `dessineIconeApp` 88 · `reduitIconeApp` 115

### `modules/icone-onglet.mjs` — 58 l. → console

- l.1 · Icône de l'onglet

Fonctions :

`reduitIcone` 30

### `modules/installation.mjs` — 913 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`conf` 105 · `reglageInstallation` 125 · `invitationVoulue` 126 · `auDoigt` 156
`nommeApplication` 192 · `reponsesInstallation` 210 · `retientInstallation` 215
`jourInstallation` 224 · `invitationEcartee` 227 · `refuseInstallation` 233
`faconInstallation` 261 · `appliInstallee` 284 · `verifieApplication` 306
`connaitLApplication` 316 · `adresseApplication` 329 · `lanceApplication` 349
`faconRappel` 382 · `rappelEcarte` 390 · `refuseRappel` 396 · `relanceInvitation` 414
`gesteInstallation` 419 · `doigtPose` 423 · `doigtLeve` 424 · `vueInstallation` 427
`accueilleInvitation` 436 · `invitationRetenue` 462 · `suitLesGestes` 483
`finInvitation` 491 · `rouvreInvitation` 513 · `essaieInvitation` 533
`brancheInstallation` 578 · `teteInvitation` 673 · `retourAuxReglages` 688
`poseGardeInstallation` 709 · `remplitInvitation` 732 · `ouvreInvitation` 762
`ouvreRappel` 841 · `ouvreRetrouve` 903

### `modules/itineraire.mjs` — 2650 l. → plan, plan-admin

- l.1 · L'itinéraire — le calcul d'un trajet d'un point du salon à un autre

Fonctions :

`brancheItineraire` 39 · `conf` 41 · `cheminForme` 42 · `pictoForme` 43 · `nomTypeRepere` 44
`estPorte` 45 · `ouvreEntrant` 46 · `ouvreSortant` 47 · `instantConf` 48 · `finInstant` 49
`sommets` 151 · `enveloppe` 171 · `oublieGrilles` 214 · `calquesDe` 219 · `reperesDe` 227
`zoneTraversee` 307 · `zonesDuTerrain` 316 · `cleRoleIti` 319 · `roleIti` 320
`nomRoleIti` 321 · `estCirculation` 324 · `formesRole` 349 · `anglePlan` 381
`dansGrille` 420 · `horsGrille` 421 · `grille` 431 · `distanceAuMur` 620 · `cretes` 663
`nappePrincipale` 681 · `celluleDe` 716 · `caseDe` 720 · `centreCase` 725 · `empriseDe` 768
`accrocheDepuis` 830 · `versLeMilieu` 903 · `accroche` 938 · `Tas` 953 · `travail` 997
`cherche` 1020 · `distancesDepuis` 1087 · `distancesMulti` 1101 · `regleFoule` 1173
`ecarteFoule` 1190 · `heureAuSalon` 1194 · `sallesEnMouvement` 1203 · `foule` 1246
`bilanFoule` 1334 · `reduit` 1363 · `guidageAllees` 1426 · `recentre` 1482 · `passable` 1567
`lisse` 1601 · `longueur` 1628 · `longueurDehors` 1644 · `nettoie` 1686 · `oublieFaces` 1733
`facesLibres` 1735 · `amorce` 1832 · `faceDeSortie` 1867 · `raccordTient` 1913
`accesDe` 1943 · `couplesAcces` 1995 · `troncon` 2028 · `pointObjet` 2073
`pointRepere` 2080 · `candidats` 2089 · `pointSaisi` 2123 · `portesDe` 2135
`versPorte` 2142 · `typeLiaison` 2203 · `nomRepere` 2211 · `oublieLiaisons` 2229
`lienEcrits` 2241 · `ecritLiens` 2250 · `annuaireLiaisons` 2255 · `liensDe` 2287
`coutLiaison` 2307 · `passagePraticable` 2314 · `passagesDe` 2322 · `sortiesDe` 2332
`plansRelies` 2340 · `balayage` 2364 · `distanceDepuis` 2382 · `cheminLiaisons` 2409
`routeParLiaisons` 2495 · `routeEntre` 2533 · `mesureMarches` 2571 · `coupeMarche` 2586
`distancesDesArrets` 2602 · `ecritDistance` 2616 · `ecritDuree` 2624 · `phraseLiaison` 2638

### `modules/lien-parcours.mjs` — 92 l. → plan, plan-admin

- l.1 · Le parcours écrit dans un lien, et relu

Fonctions :

`codeIdParcours` 40 · `codeParcours` 58 · `champParcours` 70 · `litCodeParcours` 77

### `modules/marque.mjs` — 282 l. → plan, plan-admin, console

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 55 · `recadreMarque` 59 · `marqueRecadree` 85 · `imageChargee` 114
`vignetteMarque` 130 · `boiteMarque` 157 · `toileMarque` 223 · `vignetteDeLogo` 247

### `modules/mesure.mjs` — 654 l. → plan, plan-admin

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 66 · `jetonMesure` 69 · `jourIso` 108 · `echeanceMesure` 109
`jetonRetenu` 134 · `supportMesure` 183 · `renouvelleVisiteur` 235 · `fraisEnFile` 302
`litLaFile` 306 · `ecritLaFile` 319 · `metEnFile` 334 · `retireDeLaFile` 345
`chargeDe` 356 · `envoiePaquet` 369 · `beaconne` 394 · `pousseLaFile` 415
`envoieMesures` 434 · `mesure` 471 · `brancheLesEnvois` 486 · `effaceJetonsVisiteur` 541
`refuseMesure` 559 · `ouvreConfidentialite` 586 · `brancheLaNotice` 637
`brancheMesure` 651

### `modules/notifications.mjs` — 89 l. → plan, plan-admin

- l.1 · Les notifications — ce que l'appareil sait recevoir, et l'abonnement

Fonctions :

`poussePossible` 19 · `iOSsansInstallation` 24 · `adresseDuRappel` 30 · `heureVue` 54
`empreinteDebut` 55 · `octetsDeCle` 59 · `abonnementCourant` 67 · `abonne` 76

### `modules/ordonnanceur.mjs` — 866 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 84 · `peineDeCharge` 105 · `ecartDesJours` 191 · `poidsDesJours` 221
`chargeDuJour` 244 · `rangeSejour` 253 · `trancheDe` 803 · `dilatationPour` 858

### `modules/parcours.mjs` — 437 l. → plan, plan-admin

- l.1 · Le parcours de visite : la liste, son stockage, sa marque

Fonctions :

`_rafraichit` 23 · `_reprendRappels` 24 · `_synchroniseRappels` 25 · `poseParcours` 85
`brancheListeParcours` 103 · `cleParcours` 116 · `identifiantParcours` 153
`casierParcours` 161 · `dansParcours` 162 · `jourParcours` 165
`attenduDepuisTropLongtemps` 170 · `trieParcours` 181 · `chargeParcours` 191
`parcoursAEcrire` 225 · `enregistreParcours` 241 · `tientLeStockage` 270
`plurielParcours` 284 · `contenuParcours` 293 · `signetParcours` 304 · `boutonParcours` 310
`rafraichitMarque` 315 · `calqueMarques` 348 · `dessineMarques` 366 · `marqueParcours` 396
`instantConf` 414 · `cleTemps` 418 · `nomDeStand` 428 · `groupeParcours` 430

### `modules/partage.mjs` — 271 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`lienParcours` 45 · `ouvrePartageParcours` 61 · `boutonsPartage` 117
`ouvreGardeParcours` 213 · `demandeGardeParcours` 243 · `poseGardeParcours` 256

### `modules/plan-admin.mjs` — 41 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

### `modules/plan.mjs` — 121 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

### `modules/qr.mjs` — 315 l. → plan, plan-admin

- l.1 · Le code QR, sans bibliothèque

Fonctions :

`qrMotsBruts` 36 · `qrMotsUtiles` 45 · `qrMul` 56 · `qrGenerateur` 59 · `qrReste` 70
`qrAlignements` 81 · `qrTrame` 97 · `qrChemin` 286 · `qrSvg` 308

### `modules/rappels.mjs` — 548 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`conf` 71 · `tuto` 72 · `brancheRappels` 80 · `reglageRappel` 99 · `rappelsVoulus` 100
`minutesRappel` 101 · `cleRappels` 115 · `chargeRappels` 118 · `retientRappels` 122
`rappelsOfferts` 133 · `instantAbsolu` 163 · `confsARappeler` 171 · `rappelsDuParcours` 188
`synchroniseRappels` 226 · `eteintRappels` 249 · `allumeRappels` 264 · `aideRappel` 281
`poseRappels` 297 · `cleInviteRappel` 418 · `inviteRappelFaite` 421
`retientInviteRappel` 426 · `fenetreRappel` 461 · `proposeRappels` 494
`reprendRappels` 537

### `modules/rapport.mjs` — 20 l. → rapport

- l.1 · Point d'entrée du rapport

### `modules/reglage-application.mjs` — 331 l. → plan-admin

- l.1 · L'application installée — son icône et son nom, le réglage de l'exploitant

Fonctions :

`brancheReglageApplication` 61 · `nomAppDefaut` 84 · `ecritApplication` 99
`blocApplication` 140

### `modules/reglage-installation.mjs` — 71 l. → plan-admin

- l.1 · La case de l'invitation à installer, dans l'onglet « Admin » des réglages

Fonctions :

`brancheReglageInstallation` 22 · `caseInstallation` 34

### `modules/reglage-sponsor.mjs` — 232 l. → plan-admin

- l.1 · Le générique du démarrage, réglé par l'exploitant

Fonctions :

`brancheReglageSponsor` 32 · `blocSponsor` 75

### `modules/salon.mjs` — 43 l. → plan, plan-admin

- l.1 · Le salon et la page : ce que l'adresse et la construction disent

Fonctions :

`cheminDuSalon` 26 · `cheminPartageable` 37

### `modules/session.mjs` — 133 l. → plan, plan-admin, console, rapport

- l.1 · La session de l'exploitant, et l'appel à la base

Fonctions :

`accesBase` 15 · `contenuJeton` 42 · `resteJeton` 52 · `echangeSession` 68 · `base` 92

### `modules/sponsor.mjs` — 410 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 119 · `secondesSponsor` 122 · `modeSponsor` 135 · `sponsorRetenu` 154
`cleSponsor` 185 · `sponsorEnCache` 188 · `retientSponsor` 203 · `ouvreSponsor` 228
`suitSponsor` 321 · `resteSponsor` 346 · `fermeSponsor` 352 · `accueilleSponsor` 368
`brancheSponsor` 402

### `modules/sur.mjs` — 190 l. → plan, plan-admin

- l.1 · Ce qui vient d'ailleurs, relu avant d'être affiché

Fonctions :

`lien` 22 · `adresseWeb` 30 · `adresseSure` 43 · `adresseImage` 70 · `imageSure` 83
`assainitRiche` 112 · `enBlocs` 160 · `rangeRiche` 173

### `modules/synchronisation.mjs` — 230 l. → console

- l.1 · Synchronisation d'un salon — lancement, suivi, vignettes des logos

Fonctions :

`brancheSynchronisation` 40 · `etapesPressenties` 58 · `synchronise` 73
`fabriqueLesVignettes` 170 · `envoieVignettes` 223

### `modules/temps.mjs` — 129 l. → plan, plan-admin

- l.1 · Les dates et les heures du salon

Fonctions :

`momentLocal` 32 · `jourLong` 55 · `jourCourt` 62 · `dateDeCle` 69 · `jourBref` 75
`jourISO` 82 · `instantMural` 103 · `minutesDe` 117 · `ecritHeure` 119 · `ecritMinutes` 124

### `modules/terre.mjs` — 173 l. → plan, plan-admin

- l.1 · Le plan sur la Terre — le calcul, sans la carte

Fonctions :

`metresParDegre` 23 · `tourneEnvirons` 40 · `versTerre` 46 · `versLePlan` 53 · `reancre` 68
`pixelsMercator` 87 · `latitudeDePixel` 96 · `echelleDesTuiles` 116 · `niveauDesTuiles` 128
`aireDuContour` 138 · `centreDuContour` 147 · `axeDuContour` 160

### `modules/texte.mjs` — 25 l. → plan, plan-admin, console, rapport

- l.1 · Le texte : l'écrire dans la page, le découper, le ranger

Fonctions :

`esc` 6 · `separeValeurs` 17

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

### `modules/vivant.mjs` — 36 l. → plan, plan-admin, console

- l.1 · Un état de module, lu par le code soudé tel qu'il est à l'instant

Fonctions :

`vivants` 25

### `modules/webgl.mjs` — 1354 l. → plan, plan-admin

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`chargeWebgl` 87 · `brancheWebgl` 114 · `monteWebgl` 124 · `poseToileWebgl` 225
`guetteContexteWebgl` 231 · `contextePerduWebgl` 241 · `verifieContexteWebgl` 248
`perdContexteWebgl` 257 · `remonteWebgl` 278 · `vueDeck` 295 · `vueWebgl` 304 · `blocDe` 313
`majEditionWebgl` 326 · `cleBloc` 338 · `planifieWebgl` 364 · `toutRepeindreWebgl` 368
`blocsDansLOrdre` 375 · `repeintWebgl` 380 · `assembleWebgl` 404 · `constTexte` 438
`jeuDeCaracteres` 634 · `sousPixelOffert` 688 · `couchesPetites` 693 · `couchesTexte` 703
`accVide` 738 · `convertitBloc` 739 · `accDe` 755 · `parcoursGl` 762 · `formeGl` 798
`texteGl` 834 · `imageGl` 857 · `partage` 889 · `designeGl` 895 · `couchesDeBloc` 897
`modelesLibellesHtml` 977 · `poseModelesLibelles` 987 · `lisModelesLibelles` 993
`groupesNoms` 1026 · `couchesNoms` 1043 · `couchesPastilles` 1054
`couchesLibellesWebgl` 1069 · `couchesDessineesWebgl` 1076 · `stage` 1097
`brancheSurvolWebgl` 1101 · `poseSurvolWebgl` 1121 · `poseCurseurWebgl` 1130
`poseFocusWebgl` 1139 · `aplatsDe` 1146 · `coucheSurvol` 1149 · `coucheFocus` 1158
`couchesPhare` 1185 · `lueurDe` 1201 · `opacitePhare` 1239 · `echellePhare` 1240
`couchesPhareNoms` 1243 · `palierDefile` 1268 · `phaseComete` 1270 · `animeCouche` 1273
`majAnimationWebgl` 1290 · `animeWebgl` 1298 · `objetSous` 1321 · `cibleWebgl` 1328
`priseWebgl` 1335 · `libelleSousWebgl` 1340 · `rectEcranWebgl` 1345

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 542 l.

`champs` 179 · `decoupe` 191 · `valeursOui` 257 · `imageDistante` 292 · `lit` 314
`valeursDe` 337 · `cibleEn` 380 · `champsPerso` 397 · `cibles` 423 · `separeValeurs` 453
`noteValeurs` 491 · `valeursRelevees` 512 · `valeurPerso` 535

### `supabase/functions/_partage/eventmaker.ts` — 1208 l.

`grapheJson` 233 · `enParallele` 1016 · `texteSeul` 1036 · `champs` 1173

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266 · `egal` 300

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `versAnneaux` 26 · `versTrace` 44 · `distSegment` 55 · `distBord` 64
`poleInterieur` 83 · `portee` 104 · `boite` 113 · `emprise` 144 · `dedans` 155

### `supabase/functions/_partage/octets.ts` — 18 l.

`octetsDeVignette` 12

### `supabase/functions/_partage/push.ts` — 229 l.

`octets` 49 · `base64url` 57 · `colle` 63 · `texte` 71 · `cleDeSignature` 83
`jetonVapid` 105 · `derive` 131 · `chiffre` 145 · `pousse` 201

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106 · `allege` 118 · `sansMasques` 196
`textes` 207

### `supabase/functions/_partage/version.ts` — 100 l.

`versionFond` 47 · `versionDuPlan` 92 · `condense` 96

### `supabase/functions/_partage/vignette.ts` — 28 l.

`cleDeVignette` 23

### `supabase/functions/mesure/index.ts` — 173 l.

`jeton` 80 · `client` 83

### `supabase/functions/plan-public/index.ts` — 1103 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 493 · `ampute` 517 · `masquesDe` 560 · `masquesDuPlan` 580

### `supabase/functions/sync-evenement/index.ts` — 1894 l.

`cors` 43 · `bourre` 112 · `client` 122 · `ecrit` 144 · `gaia` 152 · `libellesChoix` 163
`retiensAnglais` 190 · `fournisseur` 208 · `raccourci` 216 · `enClair` 253 · `range` 279
`champsKlipso` 300 · `hebergee` 1842 · `nettoieUrl` 1870 · `groupeTextes` 1880

## `supabase/migrations/` — schéma, numéroté et rejouable

- `20260904000001_init.sql` — evenement, plan, calque, apparence, calque_dessin, instantane
- `20260904000002_sources.sql` — evenement
- `20260904000003_fiche.sql` — evenement
- `20260904000004_cles_fournisseur.sql` — evenement
- `20260904000005_salles.sql` — evenement
- `20260904000006_fuseau.sql` — evenement
- `20260904000007_noms_zones.sql` — evenement
- `20260904000008_cle_dessin.sql` — calque_dessin
- `20260904000009_cle_dessin_index.sql` — —
- `20260904000010_correspondances.sql` — evenement
- `20260904000011_mesures.sql` — mesure, fn rapport_utilisation
- `20260908000001_compteurs.sql` — cible, compteur, compteur_cible, visiteur_jour, fn enregistre_mesures, fn rapport_utilisation
- `20260908000002_empreinte_fond.sql` — plan
- `20260909000001_empreinte_calque.sql` — calque
- `20260909000002_retire_empreinte_plan.sql` — plan
- `20260910000001_champs_perso.sql` — —
- `20260910000002_ordre_fiche.sql` — —
- `20260910000003_zones_masquees.sql` — evenement
- `20260910000004_comptes.sql` — profil, acces, fn est_admin, fn acces_salon, fn profil_a_la_creation, fn profil_suit_adresse
- `20260910000005_prenom.sql` — profil, fn profil_a_la_creation
- `20260910000006_ferme_lecture_anon.sql` — —
- `20260910000007_role_non_declare.sql` — fn profil_a_la_creation
- `20260910000008_audience.sql` — fn audience_cibles
- `20260910000009_fiches_zones.sql` — evenement
- `20260910000010_remise_a_zero.sql` — fn reinitialise_compteurs
- `20260910000011_gestes_par_stand.sql` — compteur_cible, fn enregistre_mesures, fn audience_cibles
- `20260910000012_periode_du_salon.sql` — fn periode_salon, fn rapport_utilisation, fn audience_cibles
- `20260911080023_logo_des_zones_organisateur.sql` — —
- `20260911130920_icone_d_onglet_du_salon.sql` — evenement
- `20260912053447_groupes_de_champs_de_la_fiche.sql` — —
- `20260912055309_suggestion_un_canal_de_mesure_a_elle.sql` — fn enregistre_mesures, fn audience_cibles
- `20260912140943_zones_traversables.sql` — evenement
- `20260913122346_le_support_d_acces_au_plan.sql` — compteur, visiteur_jour, fn enregistre_mesures, fn rapport_utilisation
- `20260913170035_les_visiteurs_uniques_par_stand.sql` — visiteur_cible, fn enregistre_mesures, fn purge_presences, fn reinitialise_compteurs, fn audience_cibles
- `20260913182428_le_partage_d_un_parcours_compte.sql` — compteur, fn enregistre_mesures, fn audience_cibles, fn rapport_utilisation
- `20260913200617_le_fuseau_d_un_salon_au_format_iana.sql` — fn fuseau_iana, fn evenement_fuseau_iana, fn periode_salon, fn enregistre_mesures
- `20260913205218_le_fuseau_d_un_salon_choisi_sinon_eventmaker_sinon_paris.sql` — evenement, fn evenement_fuseau_iana
- `20260913223216_la_conservation_des_jetons_de_visiteur.sql` — fn purge_presences, fn reinitialise_compteurs
- `20260913234328_libelles_anglais_des_listes_de_valeurs.sql` — evenement
- `20260914112229_intitules_des_champs_de_la_fiche.sql` — —
- `20260914231027_le_calage_du_plan_sur_la_terre.sql` — evenement
- `20260915103801_vignettes_des_logos_d_exposants.sql` — vignette_de_logo
- `20260915113207_retrouver_une_vignette_par_son_adresse_d_origine.sql` — —
- `20260915115829_le_rappel_avant_une_conference.sql` — rappel_de_conference, fn enregistre_rappels, fn rappels_dus, fn oublie_abonnement, fn purge_rappels
- `20260915131103_programmer_vraiment_la_tache_des_rappels.sql` — —
- `20260916232846_l_icone_et_le_nom_de_l_application_installee.sql` — evenement
- `20260916235956_les_mesures_qui_ont_attendu_le_reseau.sql` — fn enregistre_mesures
- `20260917004611_oublier_un_rappel_que_le_programme_a_dementi.sql` — rappel_de_conference, fn empreinte_debut, fn enregistre_rappels, fn oublie_rappels_perimes
- `20260917121232_l_avancement_d_une_synchronisation_releve_sur_la_fiche_du_salon.sql` — evenement
- `20260921132502_un_seul_nom_de_produit_dans_le_commentaire_du_nom_de_l_application.sql` — —
- `20260921145417_le_calage_de_la_carte_par_pavillon.sql` — plan
- `20260922144359_la_charge_prevue_des_stands.sql` — plan_de_visite, compteur, fn enregistre_mesures, fn pose_plan_de_visite, fn charge_prevue, fn purge_presences, fn reinitialise_compteurs, fn rapport_utilisation
- `20261008172816_la_porte_publique_des_mesures.sql` — fn mesure_publique

## Le reste

- `src/index.mjs` — 965 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 104 · `amontPour` 113 · `cleDe` 121 · `cleDeLot` 127 · `condense` 134 `cleVersion` 158 · `rangeLaVersion` 161 · `ditVersion` 169 · `meta` 178 · `gardable` 194 `range` 200 · `rafraichit` 207 · `entete` 242 · `oublie` 284 · `rappels` 370 · `cleApp` 415 `cheminDuSalon` 446 · `pageDuSalon` 463 · `appDuSalon` 487 · `iconesDuSalon` 533 `manifeste` 573 · `iconeApp` 662 · `mesure` 706 · `planDeVisite` 781 · `chargePrevue` 819
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/pwa.js` — le manifeste et l'en-tête qui rendent les pages installables.
- `outils/icones.js` — dessine l'icône de l'application, et l'encode en PNG.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/controle.js` — analyse le script de chaque page construite, en module
  ES : une redéclaration y est une erreur, là où un `<script>` la tolère.
- `outils/migration.js` — crée une migration horodatée à la seconde.
- `outils/polices.js` — rapatrie les polices de Google dans `web/polices/`, hors
  construction (réseau requis) ; écrit `outils/polices.json`, relu par `genere.js`.
- `outils/gabarit/_langue.js` — la version anglaise : posé en tête de chaque page, il
  traduit ce qu'elle affiche d'après le dictionnaire, et tient la bascule FR/EN.
- `outils/anglais/` — le dictionnaire anglais, un fichier par module ; `serveur.js` et
  `donnees.js` pour ce qui arrive du serveur, `invisibles.js` pour les faux positifs.
- `outils/traductions.js` — relève les chaînes visibles du gabarit, échoue sur celles
  qui n'ont pas de traduction ; choisit aussi ce que chaque page emporte du dictionnaire.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
