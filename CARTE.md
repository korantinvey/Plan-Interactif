<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 5267 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.4191 · 10. Mode administration
- l.4299 · La fiche d'une zone organisateur
- l.5008 · Masquer une zone organisateur
- l.5094 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 326 · `programmeOffert` 331
`suggestionOfferte` 332 · `appliqueOptions` 334 · `langueOfferte` 358 · `appliqueLangue` 360
`catalogueTenu` 365 · `chercheSorte` 435 · `voletRecherche` 438 · `blocOrdreCriteres` 499
`minutesVisite` 670 · `capaciteGeree` 719 · `capaciteFixee` 720 · `capaciteParSurface` 721
`regleCapacite` 726 · `aireDuStand` 744 · `capaciteStand` 769 · `phraseCapacite` 788
`lueHeure` 833 · `lueDate` 837 · `datesSalon` 844 · `horairesSalon` 858 · `salonPartage` 871
`presseNuanciers` 902 · `suitNuancier` 918 · `trio` 946 · `melange` 956
`appliqueAccent` 970 · `appliqueFond` 1004 · `modeDist` 1051 · `couleurDist` 1063
`appliqueDists` 1085 · `modeBarre` 1115 · `appliqueBarre` 1117 · `modeleRetenu` 1157
`policeChoisie` 1313 · `policeDuModele` 1318 · `feuillePolice` 1328 · `chargePolice` 1350
`policePrete` 1370 · `policeDesNoms` 1388 · `posePoliceLibelles` 1417
`appliqueModele` 1449 · `habilleModale` 1493 · `texteCorps` 1565 · `clesPortees` 1590
`standApercu` 1610 · `lignesApercu` 1634 · `contenuApercu` 1664 · `apercuFiche` 1701
`apercuListe` 1779 · `apercuDuo` 1801 · `glisseFenetre` 1834 · `ouvreReglages` 1845
`voletZones` 1970 · `champsFicheZone` 2072 · `ficheZoneEnPlace` 2142 · `voletPlan` 2160
`blocRappel` 2208 · `ditEssaiRappel` 2319 · `voletAdmin` 2344 · `blocOptions` 2534
`blocLangues` 2581 · `blocBarre` 2655 · `blocHoraires` 2713 · `voletParcours` 2855
`sallesSituees` 2973 · `voletPmr` 2989 · `nomDuTon` 3080 · `svgVignette` 3089
`barreVignette` 3091 · `vignetteDistPlan` 3095 · `vignetteDistListe` 3108
`vignetteDistFiche` 3122 · `salonDitSes` 3142 · `coinPris` 3149 · `voletDist` 3172
`voletApparence` 3337 · `clesFiche` 3536 · `voletOrdre` 3553 · `enregistreConf` 4140
`rgbHex` 4147 · `hexa` 4154 · `luminance` 4158 · `ecarte` 4172 · `joli` 4187
`retireAdmin` 4208 · `activeAdmin` 4221 · `champZone` 4325 · `champsZone` 4350
`champSalles` 4442 · `nomDeZone` 4494 · `reduitLogo` 4528 · `cadreLogo` 4571
`champLogo` 4643 · `editeurRiche` 4681 · `memeFicheZone` 4838 · `suitFicheZone` 4845
`verseFicheZone` 4853 · `ficheZone` 4879 · `enregistreZone` 4904
`basculeAffichageZone` 5019 · `marqueZonesMasquees` 5036 · `ecritColonnesEvenement` 5056
`ecritColonneEvenement` 5090 · `cleLibelle` 5115 · `empreinteLibelle` 5131
`placementLibelle` 5139 · `posePlacement` 5149 · `libelleAutomatique` 5166
`modePlacementLibelles` 5175 · `majPaletteLibelle` 5194 · `choisitLibelle` 5211
`pousseLibelle` 5218 · `libellePointerDown` 5226 · `libellePointerMove` 5242
`libellePointerUp` 5251

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 271 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 113 · `panneDuChargement` 160
`CLE_VERSION` 170 · `versionRetenue` 171 · `retientVersion` 174 · `demandePlan` 198
`charge` 222

### `_aimants.html` — 486 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 15 · `coteCadre` 19 · `montreCote` 31 · `aimantsActifs` 59 · `axesDe` 63
`pointsAimants` 68 · `oublieAimantsDuPlan` 88 · `aimantsDuPlan` 90 · `pasAimant` 123
`cale` 131 · `sousLeGeste` 136 · `cranGrille` 147 · `oublieAimants` 164
`aimantsDessines` 166 · `coinsGeste` 192 · `montreAimants` 214 · `meilleurSommet` 279
`croixAimant` 293 · `correction` 317 · `aimante` 358 · `retientTaille` 372
`reprendTaille` 386 · `dupliqueForme` 407 · `pousseForme` 432 · `ecritDimensions` 449
`appliqueDimension` 468

### `_application.html` — 453 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 19. L'application installée — son icône et son nom

Fonctions :

`fondPourIconeApp` 92 · `dessineIconeApp` 124 · `reduitIconeApp` 151 · `adresseIconeApp` 185
`appDuSalon` 193 · `iconeDeLApplication` 196 · `nomAppDefaut` 206 · `ecritApplication` 221
`blocApplication` 262

### `_auth-plan.html` — 204 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 131 · `mailDuJeton` 138 · `litProfilA` 149
`initialesDe` 162 · `poseCompte` 169

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `_batiments.html` — 558 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 26 · `bibliothequeDispo` 27 · `refBatiment` 44 · `refForme` 48
`marqueBatiment` 51 · `batimentsPoses` 54 · `estBatiment` 61 · `hallsPoses` 64
`lieuDuCalque` 70 · `poseCalage` 76 · `ouvreBibliotheque` 85 · `vueDuLieu` 181
`lanceCalage` 221 · `effaceLeTempsDuCalage` 249 · `cadreCalage` 268 · `finCalage` 281
`pivoteCalage` 292 · `degresCalage` 308 · `dessineCalage` 313 · `calagePointerDown` 336
`calagePointerMove` 349 · `calagePointerUp` 365 · `reposeBatiment` 378
`ajouteBatiments` 394 · `boutonRecale` 478 · `pictoRecale` 487 · `calageRelu` 504
`rouvreCalage` 530 · `mentionOsm` 553

### `_borne.html` — 370 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — un plan qui sait où il est

Fonctions :

`pointBorne` 62 · `borneRetenue` 70 · `retientBorne` 76 · `oublieBorne` 79 · `lieuBorne` 98
`lieuNomme` 117 · `pointLibre` 122 · `poseDepartImpose` 135 · `poseLaBorne` 146
`remetLeDepart` 165 · `poseBorneIci` 179 · `armeLaPose` 188 · `montreBandeauBorne` 204
`ecritDepartBorne` 218 · `rayonBorne` 231 · `dessineBorne` 236 · `rafraichitBorne` 252
`rempliBorne` 257 · `relanceRepos` 286 · `reposeLaBorne` 293 · `demarreBorne` 329

### `_chaleur.html` — 636 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.434 · Remise à zéro des compteurs

Fonctions :

`nbChal` 32 · `tonChaleur` 51 · `niveauChaleur` 73 · `valeurChaleur` 76 · `chargeChaleur` 89
`coloreChaleur` 135 · `cartoucheChaleur` 170 · `mesureCartoucheChaleur` 234
`replieChaleur` 240 · `ecritEtatChaleur` 251 · `dessineEchelleChaleur` 259
`dessineTopChaleur` 279 · `phraseChaleur` 321 · `rafraichitChaleur` 346
`montreChaleur` 380 · `rangChaleur` 416 · `aplati` 456 · `voletMesure` 461
`evenementCourant` 487 · `ouvreRemiseAZero` 506 · `lanceRemiseAZero` 598

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `_classeur.html` — 234 l. → admin-plans.html, rapport.html

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 29 · `crc32` 39 · `archiveZip` 54 · `texteXml` 110 · `colonneXl` 113
`XL_PARTS` 124 · `feuilleXl` 178 · `classeurXl` 214 · `enregistreFichier` 225

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 499 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 16 · `esc` 17 · `entetes` 38 · `contenuJeton` 47 · `resteJeton` 57 · `renouvelle` 67
`appel` 101 · `rest` 112 · `verseModale` 142 · `ouvreModale` 148 · `verrouilleModale` 171
`fermeModale` 173 · `gardeLaPlace` 196 · `demande` 201 · `confirme` 223 · `ecranConfig` 234
`normaliseUrl` 270 · `ecranConnexion` 289 · `deconnecte` 352 · `signale` 363 · `bloc` 384
`grille` 402 · `idCompte` 445 · `themeSombre` 455 · `initialesDe` 475

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 78 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console-js.html` — 3287 l. → admin-plans.html

- l.959 · Provenance des données
- l.1086 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 424 · `slugifie` 438
`courant` 442 · `charge` 444 · `chargePlans` 459 · `majEvenement` 464 · `selonAdresse` 484
`majAdresse` 492 · `majBarre` 507 · `dessineChoix` 549 · `champ` 569 · `reduitIcone` 623
`champFavicon` 664 · `fuseauConnu` 760 · `champFuseau` 772 · `dessineFiche` 835
`fournisseurUtilise` 1021 · `source` 1025 · `champCle` 1030 · `ligneSource` 1065
`paraitSurFiche` 1216 · `origineConferences` 1222 · `origineProduits` 1229
`resumeProvenance` 1294 · `resumeFiche` 1311 · `caseFiche` 1356 · `cibleEn` 1404
`champsPersos` 1406 · `criteres` 1412 · `ecritFiche` 1415 · `caseCritere` 1430
`clePerso` 1449 · `ajouteChampPerso` 1457 · `renommeChampPerso` 1475
`retireChampPerso` 1523 · `lignesPerso` 1584 · `ligneOutil` 1605 · `ligneReglage` 1621
`ouvreProvenance` 1633 · `ouvreSources` 1656 · `cadreFiche` 1708 · `ouvreFiche` 1738
`cadreCategories` 1878 · `sousTitre` 1957 · `tableauChamps` 1972 · `encode` 2132
`decode` 2134 · `correspondance` 2139 · `sansPrefixe` 2142 · `courte` 2143 · `intitule` 2158
`intituleSuite` 2170 · `separeValeurs` 2184 · `aplani` 2205 · `memeStyle` 2215
`autreFace` 2233 · `champOrigine` 2249 · `majLiens` 2517 · `majIntegration` 2554
`majMsgSync` 2561 · `etapesPressenties` 2591 · `suitAuServeur` 2641 · `synchronise` 2683
`fabriqueLesVignettes` 2780 · `envoieVignettes` 2833 · `dupliquer` 2842
`litMonProfil` 2942 · `RETOUR_MDP` 2953 · `litComptes` 2955 · `ligneMessage` 2964
`casesSalons` 2974 · `ouvreComptes` 3004 · `ouvreFicheCompte` 3096 · `videEcran` 3255
`dessine` 3260 · `demarre` 3275

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 719 l. → console.css

- l.660 · Page de rapport

### `_dessin.html` — 2500 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `dejaPubliee` 138 · `marqueAttente` 144 · `mesCalques` 152
`enregistreDessins` 153 · `instantane` 195 · `clotSalve` 206 · `memorise` 207
`restaure` 218 · `annule` 234 · `refais` 246 · `trouveCalque` 248 · `nouvelId` 249
`cheminArrondi` 267 · `estCadre` 310 · `cheminForme` 312 · `styleTrait` 332
`longueurFleche` 358 · `cheminFleche` 365 · `marqueFleche` 394 · `rafraichitFleches` 405
`poseTrait` 421 · `traceForme` 431 · `dessineDessins` 446 · `redessineForme` 487
`peintCalque` 511 · `versPlan` 517 · `apercu` 523 · `apercuGuide` 535 · `toleranceTrace` 559
`aimanteContour` 564 · `rayonContour` 567 · `redresseTrace` 586 · `traceGuide` 620
`fermeIci` 627 · `ajouteForme` 632 · `pictoDe` 759 · `nomTypeRepereFr` 815
`nomTypeRepere` 817 · `typeZone` 847 · `pictoForme` 854 · `estPorte` 874
`ouvreEntrant` 875 · `ouvreSortant` 876 · `modeDit` 916 · `lettreMode` 917
`estTransport` 921 · `modeTransport` 924 · `glypheRepere` 936 · `cleLigne` 973
`ligneAffichee` 984 · `couleurLigne` 992 · `couleurRepere` 998 · `encreRepere` 1004
`nomLigneFr` 1018 · `libelleDoffice` 1026 · `couleurEcrite` 1033 · `traceRepere` 1052
`nomSurLePlan` 1186 · `etiquetteSociete` 1197 · `seRattache` 1225 · `societeDeForme` 1237
`societesDuPlan` 1249 · `poseChampImage` 1269 · `remplitListeSocietes` 1276
`societeSaisie` 1284 · `traceImage` 1311 · `traceStandDessine` 1336
`texteStandDessine` 1360 · `poseLibellesDessines` 1378 · `decoupeStand` 1399
`marqueStandsDessines` 1411 · `rafraichitStandsDessines` 1426 · `oublieReperes` 1456
`reperesCherchables` 1458 · `vaAuRepere` 1502 · `clePoi` 1545 · `pastillePoi` 1554
`cartouchePoi` 1558 · `ouvrePoi` 1677 · `mesureCartouche` 1750 · `pharePoi` 1766
`phareRepere` 1770 · `phareZone` 1772 · `eclairePoi` 1778 · `oublieChoixPoi` 1811
`signale` 1820 · `calquePourImage` 1834 · `lienImageSaisi` 1862 · `formeImage` 1874
`poseImage` 1883 · `ditImagePosee` 1905 · `importeImage` 1913 · `dessinPointerDown` 1964
`dessinPointerMove` 2049 · `dessinPointerUp` 2087 · `termineTrace` 2128 · `aide` 2140
`outilOffert` 2170 · `choisitOutil` 2173 · `enchaineStand` 2204 · `optionsModes` 2234
`proposeCouleurLigne` 2245 · `montreTransport` 2256 · `activeCalque` 2315 · `cleVerrou` 2373
`verrouille` 2374 · `basculeVerrou` 2376 · `pictoVerrou` 2393 · `montreRoleIti` 2427
`creeCalque` 2458 · `demandeNom` 2471 · `renommeCalque` 2490

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 547 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 192 · `ecritDesDeuxCotes` 214
`changeLien` 226 · `changeDureeLien` 242 · `majLiens` 259 · `appliqueSociete` 311
`appliqueTexte` 327 · `appliqueRayon` 337 · `appliqueTrait` 350 · `appliqueTransport` 378
`appliquePicto` 401 · `supprimeForme` 427 · `editionPointerDown` 437
`editionPointerMove` 483 · `editionPointerUp` 537

### `_environs.html` — 1652 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`metresParDegre` 43 · `tourneEnvirons` 60 · `versTerre` 66 · `versLePlan` 73 · `reancre` 88
`emprisePavillon` 114 · `centrePavillon` 129 · `styleSobre` 206 · `forceCarte` 300
`calagePose` 318 · `calageCourant` 330 · `fondCourant` 333 · `recul` 338
`pixelsMercator` 343 · `latitudeDePixel` 352 · `metresParPixel` 360 · `echelleDesTuiles` 378
`niveauDesTuiles` 390 · `adresseTuile` 397 · `tuilesDeLaVue` 407 · `chargeMapLibre` 472
`vueGL` 503 · `styleDuFond` 523 · `guetteLaCarte` 551 · `poseCarteGL` 562
`diagnostiqueGL` 648 · `relanceCarteGL` 668 · `videCarteGL` 680 · `dessineFondCarte` 705
`cleMasqueCarte` 809 · `masqueCarte` 810 · `basculeMasqueCarte` 812
`boutonMasqueCarte` 823 · `pictoMasque` 834 · `formesMasquantes` 846 · `contourDuHall` 868
`cheminDuHall` 875 · `poseMasqueCarte` 893 · `carreDeTerrain` 927 · `chercheBatiments` 943
`aireDuContour` 970 · `centreDuContour` 979 · `axeDuContour` 992 · `empriseDesObjets` 1009
`batimentsCandidats` 1027 · `caleSurBatiment` 1048 · `retientLeHall` 1074
`manqueCalage` 1096 · `enregistreCalage` 1105 · `calageEnregistre` 1122
`oublieCalageEnCours` 1143 · `litCoordonnees` 1155 · `rafraichitCarte` 1169
`armeCalage` 1211 · `pivotCalage` 1222 · `glisseCarte` 1226 · `cartePointerDown` 1233
`cartePointerMove` 1247 · `cartePointerUp` 1266 · `ditCalage` 1274 · `ditCarte` 1283
`majCalage` 1291 · `appliqueCalage` 1313 · `tourneCalage` 1320 · `construitCalage` 1326
`ouvreCalage` 1491 · `fermeCalage` 1500 · `voletEnvirons` 1528

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_geometrie.html` — 655 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 octies. Reprendre à la main la géométrie d'un emplacement

Fonctions :

`cleGeo` 30 · `arrondiGeo` 38 · `empreinteGeo` 49 · `anneauxGeo` 69 · `traceGeo` 82
`boiteAnneaux` 86 · `dansAnneau` 104 · `distSegmentGeo` 115 · `distBordGeo` 124
`poleGeo` 134 · `porteeGeo` 153 · `boiteGeo` 161 · `geometrieSource` 186
`reposeSource` 195 · `poseGeometrie` 204 · `retoucheGeo` 217 · `elargitEmprise` 230
`appliqueGeometries` 251 · `cleVerrouGeo` 278 · `geoVerrouille` 279 · `basculeVerrouGeo` 281
`boutonVerrouGeo` 296 · `modeGeometrie` 307 · `objetGeoSous` 333 · `groupeGeo` 342
`choisitGeo` 347 · `cadreGeo` 361 · `prisesGeo` 381 · `curseurGeo` 393
`dessinePoigneesGeo` 396 · `ecritDimensionsGeo` 424 · `nomSorteGeo` 436
`majPaletteGeo` 438 · `finGesteGeo` 468 · `enregistreGeo` 486 · `geometrieOrigine` 499
`retraceGeo` 514 · `pousseGeometrie` 525 · `appliqueDimensionGeo` 542
`geometriePointerDown` 559 · `accrocheGeo` 589 · `geometriePointerMove` 591
`geometriePointerUp` 641

### `_head.html` — 5759 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#logoSalon` · `#titre` · `#sub` · `#hallsBande`
`#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnLangue` · `#btnParcours` · `#nParcours`
`#btnLayers` · `#btnReglages` · `#btnItineraire` · `#menuCompte` · `#avatarCompte`
`#compteMail` · `#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side`
`#poignee` · `#q` · `#videQ` · `#btnFiltres` · `#nFiltres` · `#panCrit` · `#critCorps`
`#critPied` · `#critVider` · `#critVoir` · `#actifs` · `#count` · `#countTxt` · `#list`
`#piedSide` · `#btnConfidentialite` · `#stage` · `#fondCarteGL` · `#fondTuiles`
`#fondCarte` · `#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels`
`#calqueLibelles` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#creditCarte`
`#mentionOsm` · `#poi` · `#poiDefile` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#calageBat` · `#calageAngle` · `#calageQuart` · `#calageStop` · `#calageValide`
`#iciRappel` · `#iciRappelTxt` · `#iciStop` · `#bornePose` · `#bornePoser` · `#calage`
`#calageFerme` · `#calageCorps` · `#calageCarte` · `#calageEtat` · `#calageGarde`
`#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#traitFleche`
`#texteADessiner` · `#repereType` · `#repereTransport` · `#repereMode` · `#repereLigne`
`#repereCouleur` · `#repereTexte` · `#imageSoc` · `#standSoc` · `#listeSoc`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTransport` · `#elemMode` · `#elemLigne`
`#elemCouleur` · `#elemTexte` · `#elemLiens` · `#elemLiensListe` · `#elemLienAjout`
`#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur` · `#elemTailleBloc`
`#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur`
`#elemStyle` · `#elemFleche` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg`
`#libNom` · `#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#geoReg` · `#geoNom`
`#geoFerme` · `#geoDim` · `#geoLargeur` · `#geoHauteur` · `#geoOrigine` · `#geoAide`
`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile`
`#detail` · `#poigneeFiche` · `#dRubans` · `#dGoIco` · `#dItinIco` · `#dMarque`
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

### `_ici.html` — 572 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 septies. « Vous êtes ici » — le code affiché dans le hall

Fonctions :

`prefixePlan` 83 · `coteIci` 95 · `nomCodeIci` 111 · `codeIci` 130 · `litCodeIci` 145
`lienIci` 165 · `poseIci` 191 · `retireIci` 218 · `oublieIciDeLAdresse` 248
`montreBandeauIci` 264 · `demarreIci` 298 · `pointTouche` 324 · `codeIciAuPoint` 336
`armeCodeIci` 342 · `afficheIci` 364 · `ligneAffiche` 404 · `nomFichierIci` 413
`ouvreCodeIci` 428 · `boutonsCodeIci` 480 · `telechargeAfficheIci` 504
`imprimeAfficheIci` 522 · `boutonCodeIci` 551

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_installation.html` — 937 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`reglageInstallation` 98 · `invitationVoulue` 99 · `auDoigt` 129 · `nommeApplication` 165
`reponsesInstallation` 183 · `retientInstallation` 188 · `jourInstallation` 197
`invitationEcartee` 200 · `refuseInstallation` 206 · `faconInstallation` 234
`appliInstallee` 257 · `verifieApplication` 279 · `connaitLApplication` 289
`adresseApplication` 302 · `lanceApplication` 322 · `faconRappel` 355 · `rappelEcarte` 363
`refuseRappel` 369 · `relanceInvitation` 387 · `gesteInstallation` 392 · `doigtPose` 396
`doigtLeve` 397 · `vueInstallation` 400 · `accueilleInvitation` 409
`invitationRetenue` 435 · `suitLesGestes` 456 · `finInvitation` 464 · `rouvreInvitation` 486
`essaieInvitation` 506 · `teteInvitation` 635 · `retourAuxReglages` 656
`poseGardeInstallation` 683 · `remplitInvitation` 706 · `ouvreInvitation` 736
`ouvreRappel` 815 · `ouvreRetrouve` 877 · `caseInstallation` 900

### `_itineraire.html` — 3311 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 104 · `enveloppe` 124 · `oublieGrilles` 167 · `calquesDe` 172 · `reperesDe` 177
`zoneTraversee` 257 · `cleRoleIti` 259 · `roleIti` 260 · `nomRoleIti` 261
`estCirculation` 264 · `formesRole` 289 · `anglePlan` 321 · `dansGrille` 360
`horsGrille` 361 · `grille` 371 · `distanceAuMur` 545 · `cretes` 588 · `nappePrincipale` 606
`celluleDe` 641 · `caseDe` 645 · `centreCase` 650 · `empriseDe` 693 · `accrocheDepuis` 750
`versLeMilieu` 806 · `accroche` 837 · `Tas` 852 · `travail` 896 · `cherche` 919
`distancesDepuis` 986 · `distancesMulti` 1000 · `regleFoule` 1072 · `ecarteFoule` 1089
`heureAuSalon` 1093 · `sallesEnMouvement` 1102 · `foule` 1145 · `bilanFoule` 1233
`reduit` 1262 · `guidageAllees` 1325 · `recentre` 1381 · `passable` 1466 · `lisse` 1500
`longueur` 1527 · `longueurDehors` 1543 · `nettoie` 1585 · `oublieFaces` 1632
`facesLibres` 1634 · `amorce` 1731 · `faceDeSortie` 1766 · `raccordTient` 1812
`accesDe` 1842 · `couplesAcces` 1894 · `troncon` 1927 · `pointObjet` 1970
`pointRepere` 1977 · `candidats` 1986 · `pointSaisi` 2020 · `portesDe` 2038
`versPorte` 2045 · `typeLiaison` 2106 · `nomRepere` 2114 · `oublieLiaisons` 2132
`lienEcrits` 2144 · `ecritLiens` 2153 · `annuaireLiaisons` 2158 · `liensDe` 2190
`coutLiaison` 2210 · `passagePraticable` 2217 · `passagesDe` 2225 · `sortiesDe` 2235
`plansRelies` 2243 · `balayage` 2267 · `distanceDepuis` 2281 · `cheminLiaisons` 2308
`routeParLiaisons` 2392 · `routeEntre` 2428 · `calculeRoute` 2467 · `couleurNappe` 2493
`rafraichitApercu` 2499 · `marchesIci` 2542 · `rayonBout` 2547 · `arreteTracage` 2580
`mesureMarches` 2587 · `coupeMarche` 2602 · `distancesDesArrets` 2618
`peintItineraire` 2630 · `lanceTracage` 2681 · `dessineItineraire` 2706
`rafraichitBouts` 2728 · `cadreItineraire` 2751 · `champIti` 2775 · `ecritDistance` 2779
`ecritDuree` 2787 · `fermeSugg` 2792 · `montreSugg` 2799 · `choisitPoint` 2833
`valideSaisie` 2842 · `effaceItineraire` 2854 · `relance` 2881 · `phraseLiaison` 2932
`montreResultat` 2946 · `bandeauVisee` 3088 · `armeVisee` 3111 · `finVisee` 3129
`viseItineraire` 3145 · `visePoi` 3151 · `visePoint` 3157 · `ouvreItineraire` 3189
`fermeItineraire` 3217 · `versItineraire` 3227 · `versItineraireDe` 3230

### `_journee.html` — 2432 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa visite

Fonctions :

`minutesDe` 128 · `finInstant` 129 · `ecritHeure` 131 · `ecritMinutes` 136 · `dateDeCle` 149
`jourBref` 155 · `joursSalon` 165 · `joursAVenir` 194 · `joursDefaut` 212
`confsParJour` 222 · `pointConf` 239 · `departsProposes` 258 · `matriceJournee` 291
`ecartDesJours` 417 · `poidsDesJours` 447 · `chargeDuJour` 470 · `rangeSejour` 479
`derouleJournee` 885 · `prepareSejour` 1027 · `calculeSejour` 1195
`apercuRepartition` 1229 · `rangJournee` 1243 · `lienJournee` 1255 · `boutonJour` 1278
`arretJournee` 1291 · `remplitOnglets` 1338 · `jourDuStand` 1367 · `ouvreChoixJour` 1379
`figeLaVisite` 1436 · `placeSurJour` 1445 · `rendAuPlan` 1453 · `retireDuSejour` 1459
`remplitJournee` 1469 · `ecritApercu` 1682 · `appliqueVueParcours` 1712
`traceJournee` 1754 · `montreLeJour` 1763 · `perimeJournee` 1778 · `oublieSejour` 1793
`ouvreOrganisation` 1808 · `essaieSejour` 2188 · `lanceSejour` 2218 · `refaitSejour` 2257
`trancheDe` 2289 · `chargeSuivie` 2309 · `jourISO` 2315 · `etapesDuSejour` 2323
`annoncePlan` 2350 · `plafondMinimal` 2381 · `litLaCharge` 2400 · `chargeCellule` 2420

### `_js.html` — 5402 l. → plan-admin.html, plan-smcl.html, plan.html

- l.79 · 1. Index global — la recherche porte sur tous les pavillons
- l.582 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.692 · 3. Rendu du pavillon courant
- l.1042 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.1178 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.2455 · 6. Vue
- l.2928 · 7. Sélection et fiche
- l.4474 · 8. Interactions du plan
- l.4902 · Ce que les tiroirs lisent d'un geste
- l.4948 · Le tiroir de la liste — écrans étroits
- l.5174 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`$` 15 · `esc` 17 · `cheminDuSalon` 35 · `cheminPartageable` 46 · `P` 76 · `nomDeLaZone` 96
`nomsAnglaisDesZones` 98 · `texteProduits` 111 · `indexe` 115 · `chronoConf` 343
`confsDuPlan` 348 · `indexeConferences` 366 · `rangeConferences` 444 · `poseFavicon` 491
`poseLogoSalon` 517 · `poseTonDeLaBarre` 554 · `largeur` 587 · `decoupe` 612 · `habille` 625
`lignesSvg` 636 · `coexComptes` 653 · `coexChoisit` 654 · `ligneCode` 670
`monteHabillage` 698 · `montePlan` 715 · `onglets` 754 · `changePlan` 776 · `texteDist` 823
`texteCourtDist` 828 · `porteDist` 832 · `standPorte` 836 · `calqueDists` 845
`traceDist` 876 · `oublieDists` 909 · `modesDuPlan` 913 · `releveDists` 915
`dessineDists` 944 · `marquesListe` 970 · `poseDistsFiche` 1000 · `refaitDistsFiche` 1040
`ancre` 1050 · `place` 1051 · `libelles` 1053 · `decaleLibelle` 1134 · `facteurLibelle` 1135
`libelleForce` 1136 · `libelleZone` 1139 · `libelleEmplacement` 1158 · `indexeSecteurs` 1199
`secteursMontres` 1212 · `couleurConf` 1216 · `hslHex` 1220 · `couleurSecteur` 1237
`BANDES` 1258 · `majFondus` 1266 · `pastilleSecteur` 1304 · `coloreSecteurs` 1317
`peintSecteur` 1368 · `appliqueSecteurs` 1381 · `filtreTheme` 1398 · `themeFiltrable` 1478
`ordreCriteres` 1498 · `clesCriteres` 1521 · `libelleCritere` 1528 · `separeValeurs` 1536
`valeursCritere` 1553 · `texteCriteres` 1566 · `texteAnglaisPerso` 1582
`indexeCriteres` 1596 · `refaitCriteres` 1630 · `dansCriteres` 1637 · `critereActif` 1645
`basculeCritere` 1647 · `videCriteres` 1656 · `majVideQ` 1665 · `videRecherche` 1678
`nCriteres` 1693 · `majCriteres` 1708 · `remplitCriteres` 1775 · `basculeCriteres` 1914
`ouvreCriteres` 1919 · `fermeCriteres` 1935 · `filtre` 1952 · `reposeRetrait` 1972
`critParSociete` 1976 · `cherchable` 1986 · `visible` 1993 · `releveHotes` 2014
`visibleSurPlan` 2022 · `visibleSociete` 2033 · `marqueRetrait` 2049 · `appliqueFiltre` 2064
`oublieRetrait` 2076 · `reprendRecherche` 2085 · `rangSorte` 2098 · `codeCase` 2120
`caseNumero` 2137 · `sousLigne` 2157 · `liste` 2171 · `marqueChoisie` 2298
`prechargeMarque` 2324 · `prechargeLesVignettes` 2381 · `chargeUnLot` 2427
`cadrePlan` 2470 · `oublieCadre` 2471 · `figeTextes` 2487 · `rendTextes` 2495
`cadrage` 2531 · `peintLibelles` 2536 · `detacheLibelles` 2542 · `rattacheLibelles` 2554
`etireLibelles` 2572 · `appliqueVue` 2580 · `libellesDeLaVue` 2644 · `rafraichitVue` 2652
`poseVue` 2666 · `mesureBarre` 2695 · `masqueHaut` 2727 · `masque` 2734
`masqueDroite` 2771 · `fit` 2782 · `stoppeZoom` 2815 · `glisseVersVise` 2821
`glisseVers` 2863 · `rectVisee` 2885 · `zoom` 2905 · `echelle` 2918 · `ETROIT` 2934
`anime` 2950 · `noeud` 2974 · `canalPlan` 2984 · `rangSociete` 2992 · `select` 3001
`centre` 3026 · `brancheActesFiche` 3037 · `centreEtBaisseLaFiche` 3053 · `centrePoint` 3071
`montre` 3116 · `libelleCorps` 3148 · `ordreCorps` 3165 · `groupesFiche` 3197
`montreIntitule` 3210 · `valeurCorps` 3230 · `champCorps` 3243 · `groupeCorps` 3255
`corpsRange` 3268 · `momentLocal` 3303 · `programme` 3326 · `produits` 3375
`ficheProduit` 3403 · `jourLong` 3469 · `ficheConf` 3480 · `lien` 3627 · `adresseWeb` 3635
`pictoRS` 3678 · `adresseSure` 3696 · `adresseVignette` 3727 · `adresseImage` 3745
`imageSure` 3758 · `assainitRiche` 3787 · `enBlocs` 3835 · `rangeRiche` 3848
`ecarteClicFantome` 3876 · `nomSociete` 3885 · `societes` 3898 · `choisitExposant` 3909
`poseMarque` 3947 · `montreMarque` 4007 · `poseCode` 4030 · `rangeMarque` 4071
`ouvre` 4134 · `ferme` 4444 · `onglet` 4462 · `milieu` 4494 · `commencePince` 4500
`suitPince` 4514 · `plieLesBandes` 4567 · `saisitPlan` 4581 · `cibleElargie` 4663
`planifieFiltre` 4858 · `traceurDeGeste` 4926 · `cranVoisin` 4945 · `retraitBas` 4971
`mesureTiroir` 4985 · `montreTiroir` 4988 · `hisseTiroir` 4992 · `tiroirCrante` 5201

Éléments :

`#data` · `#dGo` · `#dItin`

### `_langue.js` — 792 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_marque.html` — 281 l. → admin-plans.html, plan-admin.html, plan-smcl.html, plan.html

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 55 · `recadreMarque` 59 · `marqueRecadree` 85 · `imageChargee` 114
`vignetteMarque` 130 · `boiteMarque` 156 · `toileMarque` 222 · `vignetteDeLogo` 246

### `_mesure.html` — 629 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 61 · `jetonMesure` 64 · `jourIso` 103 · `echeanceMesure` 104
`jetonRetenu` 128 · `supportMesure` 177 · `renouvelleVisiteur` 228 · `fraisEnFile` 295
`litLaFile` 299 · `ecritLaFile` 312 · `metEnFile` 327 · `retireDeLaFile` 338
`chargeDe` 349 · `envoiePaquet` 362 · `beaconne` 387 · `pousseLaFile` 408
`envoieMesures` 427 · `mesure` 464 · `effaceJetonsVisiteur` 530 · `refuseMesure` 548
`ouvreConfidentialite` 575

### `_modales.html` — 189 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 37 · `fermeModale` 57 · `confirme` 72 · `deplaceVers` 90
`versExtremite` 102 · `remplitOrdre` 110 · `ouvreOrdre` 180

### `_motdepasse.html` — 249 l. → motdepasse.html

- l.61 · Poser un mot de passe

Fonctions :

`$` 77 · `CFG` 79 · `dit` 87 · `fragment` 93 · `garde` 100 · `lit` 104 · `demandeLien` 177
`ouvreSaisie` 186

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 758 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 63 · `identifiantParcours` 100 · `casierParcours` 108 · `dansParcours` 109
`jourParcours` 112 · `attenduDepuisTropLongtemps` 117 · `trieParcours` 128
`chargeParcours` 138 · `parcoursAEcrire` 172 · `enregistreParcours` 188
`tientLeStockage` 217 · `basculeParcours` 238 · `verseAuParcours` 283
`plurielParcours` 309 · `contenuParcours` 318 · `retenusPourParcours` 344
`ajouteToutAuParcours` 369 · `poseToutAuParcours` 392 · `signetParcours` 418
`boutonParcours` 424 · `rafraichitMarque` 429 · `brancheParcours` 442 · `calqueMarques` 474
`dessineMarques` 490 · `marqueParcours` 520 · `rafraichitParcours` 534 · `instantConf` 565
`cleTemps` 569 · `jourCourt` 575 · `nomDeStand` 582 · `rangParcours` 584
`groupeParcours` 604 · `remplitParcours` 613 · `ouvreParcours` 702 · `fermeParcours` 714
`videLeParcours` 730

### `_partage.html` — 766 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrChemin` 407
`qrSvg` 429 · `ouvrePartageParcours` 446 · `boutonsPartage` 502
`accueilleParcoursPartage` 580 · `adoptePartage` 658 · `parcoursACopier` 693
`ouvreGardeParcours` 708 · `demandeGardeParcours` 738 · `poseGardeParcours` 751

### `_pile.html` — 538 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : deux sections, chacune rangée par nom
- l.349 · Repères
- l.401 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 75 · `boutonAjout` 82 · `boutonVerrou` 102 · `intertitre` 110
`construitPanneau` 117 · `sectionSelection` 365 · `sectionFond` 421 · `ligneCouleur` 479
`rangSecteur` 499 · `rangSous` 512 · `defautCouleur` 534

### `_pousse.html` — 695 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration
- l.566 · La sauvegarde emportée

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`compteRescapes` 110 · `ditAlerte` 123 · `ditEtat` 167 · `programmeEnvoi` 174
`programmePublication` 188 · `rattrapeRetard` 195 · `envoie` 200 · `presse` 213
`resteSession` 247 · `renouvelleSession` 263 · `base` 287 · `identifiants` 335
`reglagesSeuls` 350 · `noteReglagesCharges` 361 · `oublieCache` 375
`pousseConfiguration` 394 · `sauvegardeCourante` 586 · `telechargeSauvegarde` 608
`appliqueSauvegarde` 631 · `litSauvegarde` 665 · `brancheSauvegarde` 687

### `_rappels.html` — 648 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 sexies. Le rappel avant une conférence

Fonctions :

`reglageRappel` 63 · `rappelsVoulus` 64 · `minutesRappel` 65 · `cleRappels` 78
`chargeRappels` 81 · `retientRappels` 85 · `poussePossible` 94 · `rappelsOfferts` 100
`iOSsansInstallation` 106 · `instantAbsolu` 135 · `confsARappeler` 151 · `heureVue` 175
`empreinteDebut` 176 · `rappelsDuParcours` 187 · `adresseDuRappel` 210 · `octetsDeCle` 222
`abonnementCourant` 230 · `abonne` 239 · `synchroniseRappels` 265 · `eteintRappels` 288
`allumeRappels` 303 · `aideRappel` 320 · `poseRappels` 336 · `cleInviteRappel` 457
`inviteRappelFaite` 460 · `retientInviteRappel` 465 · `fenetreRappel` 500
`proposeRappels` 533 · `essaieRappelReel` 595 · `reprendRappels` 637

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

### `_sponsor.html` — 569 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 96 · `secondesSponsor` 99 · `modeSponsor` 112 · `sponsorRetenu` 131
`cleSponsor` 162 · `sponsorEnCache` 165 · `retientSponsor` 180 · `ouvreSponsor` 205
`suitSponsor` 297 · `resteSponsor` 322 · `fermeSponsor` 328 · `accueilleSponsor` 344
`blocSponsor` 412

### `_suggestion.html` — 683 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationsSugg` 83 · `presenteSugg` 89
`critereSugg` 94 · `indexSugg` 106 · `valeursSugg` 131 · `suggestionCourante` 150
`exposantPropose` 186 · `nomValeurSugg` 204 · `phraseSuggestion` 225 · `carteSuggestion` 253
`poseSuggestion` 302 · `fenetreSuggestion` 316 · `relevePalmares` 355 · `etiquetteSugg` 375
`voletSuggestion` 385

### `_sw.js` — 562 l. → sw.js

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_tutoriel.html` — 903 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 17. La visite guidée — le tour du plan, geste par geste

Fonctions :

`reglageTuto` 52 · `tutoPropose` 61 · `cleTuto` 65 · `tutoOuvert` 67 · `tutoModale` 68
`tutoFicheOuverte` 74 · `tutoFiche` 77 · `tutoParcours` 79 · `tutoItineraire` 82
`tutoJournee` 86 · `zoneDuTuto` 94 · `insecable` 111 · `phraseTrajetTuto` 117
`chapitresTuto` 377 · `proposeTutoriel` 397 · `lanceTutoriel` 455 · `quitteTutoriel` 541
`chapitreTuto` 552 · `battementTuto` 561 · `finTuto` 579 · `afficheTuto` 596 · `pxTuto` 651
`boiteTuto` 654 · `repereTuto` 668 · `rameneTuto` 701 · `placeTuto` 739 · `voileTuto` 820
`rafaleTuto` 837 · `marqueZoneTuto` 857 · `marqueLibelleTuto` 892

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `_webgl.html` — 1490 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 179 · `guetteContexteWebgl` 185
`contextePerduWebgl` 195 · `verifieContexteWebgl` 202 · `perdContexteWebgl` 211
`remonteWebgl` 232 · `vueDeck` 249 · `vueWebgl` 258 · `blocDe` 267 · `enEdition` 297
`majEditionWebgl` 301 · `cleBloc` 313 · `planifieWebgl` 339 · `toutRepeindreWebgl` 343
`blocsDansLOrdre` 350 · `repeintWebgl` 355 · `assembleWebgl` 379 · `constTexte` 413
`jeuDeCaracteres` 562 · `couchesTexte` 573 · `mulM` 607 · `appM` 610 · `echelleM` 611
`lisTransform` 613 · `lisTrace` 635 · `lisPoints` 703 · `num` 709 · `anneau` 711
`rectArrondi` 717 · `couleurGl` 731 · `accVide` 748 · `convertitBloc` 749 · `accDe` 765
`parcoursGl` 772 · `avecTrous` 812 · `formeGl` 833 · `texteGl` 869 · `imageGl` 892
`partage` 924 · `designeGl` 930 · `couchesDeBloc` 932 · `modelesLibellesHtml` 1007
`poseModelesLibelles` 1017 · `lisModelesLibelles` 1023 · `emplacementWebgl` 1052
`libellesWebgl` 1100 · `groupesNoms` 1163 · `couchesNoms` 1179 · `couchesPastilles` 1190
`couchesLibellesWebgl` 1205 · `couchesDessineesWebgl` 1212 · `stage` 1233
`brancheSurvolWebgl` 1237 · `poseSurvolWebgl` 1257 · `poseCurseurWebgl` 1266
`poseFocusWebgl` 1275 · `aplatsDe` 1282 · `coucheSurvol` 1285 · `coucheFocus` 1294
`couchesPhare` 1321 · `lueurDe` 1337 · `opacitePhare` 1375 · `echellePhare` 1376
`couchesPhareNoms` 1379 · `palierDefile` 1404 · `phaseComete` 1406 · `animeCouche` 1409
`majAnimationWebgl` 1426 · `animeWebgl` 1434 · `objetSous` 1457 · `cibleWebgl` 1464
`priseWebgl` 1471 · `libelleSousWebgl` 1476 · `rectEcranWebgl` 1481

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 542 l.

`valeursDe` 337

### `supabase/functions/_partage/eventmaker.ts` — 1208 l.

`grapheJson` 233 · `enParallele` 1016 · `texteSeul` 1036 · `champs` 1173

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `distSegment` 55 · `distBord` 64 · `poleInterieur` 83 · `portee` 104

### `supabase/functions/_partage/octets.ts` — 18 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/push.ts` — 229 l.

`colle` 63 · `texte` 71 · `cleDeSignature` 83 · `jetonVapid` 105 · `derive` 131
`chiffre` 145

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106

### `supabase/functions/_partage/version.ts` — 100 l.

`condense` 96

### `supabase/functions/_partage/vignette.ts` — 28 l.

(aucune fonction de premier niveau)

### `supabase/functions/mesure/index.ts` — 173 l.

`jeton` 80 · `client` 83

### `supabase/functions/plan-public/index.ts` — 1065 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 493 · `ampute` 517 · `masquesDe` 560 · `masquesDuPlan` 580

### `supabase/functions/sync-evenement/index.ts` — 1852 l.

`cors` 43 · `bourre` 112 · `client` 122 · `ecrit` 144 · `gaia` 152 · `libellesChoix` 163
`retiensAnglais` 190 · `fournisseur` 208 · `raccourci` 216 · `enClair` 253 · `range` 279
`champsKlipso` 300 · `hebergee` 1800 · `nettoieUrl` 1828 · `groupeTextes` 1838

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

## Le reste

- `src/index.mjs` — 880 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 100 · `amontPour` 109 · `cleDe` 117 · `cleDeLot` 123 · `condense` 130 `cleVersion` 141 · `rangeLaVersion` 144 · `ditVersion` 152 · `meta` 161 · `gardable` 177 `range` 183 · `rafraichit` 190 · `entete` 225 · `oublie` 267 · `rappels` 353 · `cleApp` 398 `cheminDuSalon` 429 · `pageDuSalon` 446 · `appDuSalon` 470 · `iconesDuSalon` 516 `manifeste` 556 · `iconeApp` 645 · `mesure` 666 · `planDeVisite` 702 · `chargePrevue` 740
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
