<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 5386 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.4238 · 10. Mode administration
- l.4346 · La fiche d'une zone organisateur
- l.5116 · Masquer une zone organisateur
- l.5213 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 326 · `programmeOffert` 331
`suggestionOfferte` 332 · `appliqueOptions` 334 · `langueOfferte` 358 · `appliqueLangue` 360
`catalogueTenu` 365 · `chercheSorte` 435 · `voletRecherche` 438 · `blocOrdreCriteres` 499
`minutesVisite` 670 · `seuilGere` 734 · `seuilImpose` 735 · `seuilParSurface` 736
`regleSeuil` 741 · `aireDuStand` 759 · `seuilConcentration` 795 · `phraseSeuil` 818
`lueHeure` 863 · `lueDate` 867 · `datesSalon` 874 · `horairesSalon` 888 · `salonPartage` 901
`presseNuanciers` 932 · `suitNuancier` 948 · `trio` 976 · `melange` 986
`appliqueAccent` 1000 · `appliqueFond` 1034 · `modeDist` 1081 · `couleurDist` 1093
`appliqueDists` 1115 · `modeBarre` 1145 · `appliqueBarre` 1147 · `modeleRetenu` 1187
`policeChoisie` 1343 · `policeDuModele` 1348 · `feuillePolice` 1358 · `chargePolice` 1380
`policePrete` 1400 · `policeDesNoms` 1418 · `posePoliceLibelles` 1447
`appliqueModele` 1479 · `habilleModale` 1523 · `texteCorps` 1595 · `clesPortees` 1620
`standApercu` 1640 · `lignesApercu` 1664 · `contenuApercu` 1694 · `apercuFiche` 1731
`apercuListe` 1809 · `apercuDuo` 1831 · `glisseFenetre` 1864 · `ouvreReglages` 1875
`voletZones` 2000 · `champsFicheZone` 2102 · `ficheZoneEnPlace` 2172 · `voletPlan` 2190
`blocRappel` 2238 · `ditEssaiRappel` 2349 · `voletAdmin` 2374 · `blocOptions` 2564
`blocLangues` 2611 · `blocBarre` 2685 · `blocHoraires` 2743 · `voletParcours` 2885
`sallesSituees` 3020 · `voletPmr` 3036 · `nomDuTon` 3127 · `svgVignette` 3136
`barreVignette` 3138 · `vignetteDistPlan` 3142 · `vignetteDistListe` 3155
`vignetteDistFiche` 3169 · `salonDitSes` 3189 · `coinPris` 3196 · `voletDist` 3219
`voletApparence` 3384 · `clesFiche` 3583 · `voletOrdre` 3600 · `enregistreConf` 4187
`rgbHex` 4194 · `hexa` 4201 · `luminance` 4205 · `ecarte` 4219 · `joli` 4234
`retireAdmin` 4255 · `activeAdmin` 4268 · `champZone` 4372 · `champsZone` 4397
`champSalles` 4489 · `nomDeZone` 4541 · `reduitLogo` 4575 · `cadreLogo` 4618
`champLogo` 4690 · `editeurRiche` 4728 · `memeFicheZone` 4885 · `suitFicheZone` 4892
`verseFicheZone` 4900 · `ficheZone` 4926 · `enregistreZone` 4951
`enregistreZoneAjoutee` 5064 · `basculeAffichageZone` 5127 · `marqueZonesMasquees` 5155
`ecritColonnesEvenement` 5175 · `ecritColonneEvenement` 5209 · `cleLibelle` 5234
`empreinteLibelle` 5250 · `placementLibelle` 5258 · `posePlacement` 5268
`libelleAutomatique` 5285 · `modePlacementLibelles` 5294 · `majPaletteLibelle` 5313
`choisitLibelle` 5330 · `pousseLibelle` 5337 · `libellePointerDown` 5345
`libellePointerMove` 5361 · `libellePointerUp` 5370

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

### `_console-js.html` — 3374 l. → admin-plans.html

- l.959 · Provenance des données
- l.1096 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 424 · `slugifie` 438
`courant` 442 · `charge` 444 · `chargePlans` 459 · `majEvenement` 464 · `selonAdresse` 484
`majAdresse` 492 · `majBarre` 507 · `dessineChoix` 549 · `champ` 569 · `reduitIcone` 623
`champFavicon` 664 · `fuseauConnu` 760 · `champFuseau` 772 · `dessineFiche` 835
`fournisseurUtilise` 1021 · `sourceNom` 1031 · `source` 1035 · `champCle` 1040
`ligneSource` 1075 · `paraitSurFiche` 1233 · `origineConferences` 1239
`origineProduits` 1246 · `resumeProvenance` 1311 · `resumeFiche` 1332 · `caseFiche` 1377
`cibleEn` 1425 · `champsPersos` 1427 · `criteres` 1433 · `ecritFiche` 1436
`caseCritere` 1451 · `clePerso` 1470 · `ajouteChampPerso` 1478 · `renommeChampPerso` 1496
`retireChampPerso` 1544 · `lignesPerso` 1605 · `ligneOutil` 1626 · `ligneReglage` 1642
`ouvreProvenance` 1654 · `ouvreSources` 1677 · `cadreFiche` 1729 · `ouvreFiche` 1759
`cadreCategories` 1899 · `sousTitre` 1978 · `tableauChamps` 1993 · `encode` 2219
`decode` 2221 · `correspondance` 2226 · `sansPrefixe` 2229 · `courte` 2230 · `intitule` 2245
`intituleSuite` 2257 · `separeValeurs` 2271 · `aplani` 2292 · `memeStyle` 2302
`autreFace` 2320 · `champOrigine` 2336 · `majLiens` 2604 · `majIntegration` 2641
`majMsgSync` 2648 · `etapesPressenties` 2678 · `suitAuServeur` 2728 · `synchronise` 2770
`fabriqueLesVignettes` 2867 · `envoieVignettes` 2920 · `dupliquer` 2929
`litMonProfil` 3029 · `RETOUR_MDP` 3040 · `litComptes` 3042 · `ligneMessage` 3051
`casesSalons` 3061 · `ouvreComptes` 3091 · `ouvreFicheCompte` 3183 · `videEcran` 3342
`dessine` 3347 · `demarre` 3362

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 725 l. → console.css

- l.666 · Page de rapport

### `_dessin.html` — 2521 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 169 · `enregistreDessins` 170 · `instantane` 212 · `clotSalve` 223
`memorise` 224 · `restaure` 235 · `annule` 251 · `refais` 263 · `trouveCalque` 265
`nouvelId` 266 · `cheminArrondi` 284 · `estCadre` 327 · `cheminForme` 329 · `styleTrait` 349
`longueurFleche` 375 · `cheminFleche` 382 · `marqueFleche` 411 · `rafraichitFleches` 422
`poseTrait` 438 · `traceForme` 448 · `dessineDessins` 463 · `redessineForme` 504
`peintCalque` 528 · `versPlan` 534 · `apercu` 540 · `apercuGuide` 552 · `toleranceTrace` 576
`aimanteContour` 581 · `rayonContour` 584 · `redresseTrace` 603 · `traceGuide` 637
`fermeIci` 644 · `ajouteForme` 649 · `pictoDe` 776 · `nomTypeRepereFr` 832
`nomTypeRepere` 834 · `typeZone` 864 · `pictoForme` 871 · `estPorte` 891
`ouvreEntrant` 892 · `ouvreSortant` 893 · `modeDit` 933 · `lettreMode` 934
`estTransport` 938 · `modeTransport` 941 · `glypheRepere` 953 · `cleLigne` 990
`ligneAffichee` 1001 · `couleurLigne` 1009 · `couleurRepere` 1015 · `encreRepere` 1021
`nomLigneFr` 1035 · `libelleDoffice` 1043 · `couleurEcrite` 1050 · `traceRepere` 1069
`nomSurLePlan` 1203 · `etiquetteSociete` 1214 · `seRattache` 1242 · `societeDeForme` 1254
`societesDuPlan` 1266 · `poseChampImage` 1287 · `remplitListeSocietes` 1294
`societeSaisie` 1302 · `traceImage` 1329 · `traceStandDessine` 1354
`texteStandDessine` 1378 · `poseLibellesDessines` 1396 · `decoupeStand` 1417
`marqueStandsDessines` 1432 · `rafraichitStandsDessines` 1447 · `oublieReperes` 1477
`reperesCherchables` 1479 · `vaAuRepere` 1523 · `clePoi` 1566 · `pastillePoi` 1575
`cartouchePoi` 1579 · `ouvrePoi` 1698 · `mesureCartouche` 1771 · `pharePoi` 1787
`phareRepere` 1791 · `phareZone` 1793 · `eclairePoi` 1799 · `oublieChoixPoi` 1832
`signale` 1841 · `calquePourImage` 1855 · `lienImageSaisi` 1883 · `formeImage` 1895
`poseImage` 1904 · `ditImagePosee` 1926 · `importeImage` 1934 · `dessinPointerDown` 1985
`dessinPointerMove` 2070 · `dessinPointerUp` 2108 · `termineTrace` 2149 · `aide` 2161
`outilOffert` 2191 · `choisitOutil` 2194 · `enchaineStand` 2225 · `optionsModes` 2255
`proposeCouleurLigne` 2266 · `montreTransport` 2277 · `activeCalque` 2336 · `cleVerrou` 2394
`verrouille` 2395 · `basculeVerrou` 2397 · `pictoVerrou` 2414 · `montreRoleIti` 2448
`creeCalque` 2479 · `demandeNom` 2492 · `renommeCalque` 2511

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

### `_geometrie.html` — 1067 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 octies. Reprendre à la main la géométrie d'un emplacement

Fonctions :

`cleGeo` 30 · `arrondiGeo` 38 · `empreinteGeo` 49 · `anneauxGeo` 69 · `traceGeo` 82
`boiteAnneaux` 86 · `dansAnneau` 104 · `distSegmentGeo` 115 · `distBordGeo` 124
`poleGeo` 134 · `porteeGeo` 153 · `boiteGeo` 161 · `geometrieSource` 186
`reposeSource` 195 · `poseGeometrie` 204 · `retoucheGeo` 218 · `elargitEmprise` 231
`appliqueGeometries` 252 · `cleVerrouGeo` 279 · `geoVerrouille` 280 · `basculeVerrouGeo` 282
`boutonVerrouGeo` 297 · `modeGeometrie` 308 · `objetGeoSous` 335 · `groupeGeo` 345
`choisitGeo` 353 · `cadreGeo` 368 · `prisesGeo` 388 · `curseurGeo` 400
`dessinePoigneesGeo` 403 · `ecritDimensionsGeo` 431 · `nomSorteGeo` 443
`majPaletteGeo` 445 · `finGesteGeo` 484 · `enregistreGeo` 502 · `geometrieOrigine` 516
`retraceGeo` 531 · `pousseGeometrie` 542 · `appliqueDimensionGeo` 559 · `cleAjout` 597
`anneauxValides` 611 · `rechAjout` 616 · `objetAjoute` 625 · `poseLien` 644
`appliqueAjouts` 671 · `enregistreAjout` 700 · `recompteEmplacements` 709
`ajouteEmplacement` 723 · `renommeAjout` 752 · `lieAjout` 784 · `ecritInfosAjout` 814
`supprimeAjout` 841 · `choisitOutilGeo` 871 · `aideAjout` 878 · `fermeAjout` 888
`ajoutPointerDown` 897 · `ajoutPointerMove` 913 · `ajoutPointerUp` 935
`geometriePointerDown` 955 · `accrocheGeo` 986 · `geometriePointerMove` 988
`geometriePointerUp` 1039

### `_head.html` — 5784 l. → plan-admin.html, plan-smcl.html, plan.html

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
`#geoFerme` · `#geoInfos` · `#geoCodeL` · `#geoCode` · `#geoSocL` · `#geoSoc` · `#geoTitreL`
`#geoTitre` · `#geoDim` · `#geoLargeur` · `#geoHauteur` · `#geoOrigine` · `#geoFiche`
`#geoSupprime` · `#geoAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`
`#panel` · `#pile` · `#voile` · `#detail` · `#poigneeFiche` · `#dRubans` · `#dGoIco`
`#dItinIco` · `#dMarque` · `#closeDetail` · `#dKind` · `#dPast` · `#dName` · `#dRen`
`#dLogo` · `#dBadges` · `#dCode` · `#dVis` · `#dPartage` · `#dCorne` · `#dOnglets`
`#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dOngProd` · `#dOngNbProd` · `#dBody` · `#parcours`
`#poigneeParcours` · `#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pActs`
`#btnJournee` · `#jRefaire` · `#btnPartage` · `#jJours` · `#pCorps` · `#jCorps` · `#pPied`
`#videParcours` · `#jPied` · `#jRetour` · `#itineraire` · `#poigneeItineraire`
`#closeItineraire` · `#iResume` · `#iCorps` · `#iDepart` · `#iViseA` · `#iSugg`
`#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

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

### `_itineraire.html` — 3315 l. → plan-admin.html, plan-smcl.html, plan.html

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
`plansRelies` 2243 · `balayage` 2267 · `distanceDepuis` 2285 · `cheminLiaisons` 2312
`routeParLiaisons` 2396 · `routeEntre` 2432 · `calculeRoute` 2471 · `couleurNappe` 2497
`rafraichitApercu` 2503 · `marchesIci` 2546 · `rayonBout` 2551 · `arreteTracage` 2584
`mesureMarches` 2591 · `coupeMarche` 2606 · `distancesDesArrets` 2622
`peintItineraire` 2634 · `lanceTracage` 2685 · `dessineItineraire` 2710
`rafraichitBouts` 2732 · `cadreItineraire` 2755 · `champIti` 2779 · `ecritDistance` 2783
`ecritDuree` 2791 · `fermeSugg` 2796 · `montreSugg` 2803 · `choisitPoint` 2837
`valideSaisie` 2846 · `effaceItineraire` 2858 · `relance` 2885 · `phraseLiaison` 2936
`montreResultat` 2950 · `bandeauVisee` 3092 · `armeVisee` 3115 · `finVisee` 3133
`viseItineraire` 3149 · `visePoi` 3155 · `visePoint` 3161 · `ouvreItineraire` 3193
`fermeItineraire` 3221 · `versItineraire` 3231 · `versItineraireDe` 3234

### `_journee.html` — 2797 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa visite

Fonctions :

`peineDeCharge` 134 · `minutesDe` 201 · `finInstant` 202 · `ecritHeure` 204
`ecritMinutes` 209 · `dateDeCle` 222 · `jourBref` 228 · `joursSalon` 238 · `joursAVenir` 267
`joursDefaut` 285 · `confsParJour` 295 · `pointConf` 312 · `departsProposes` 331
`matriceJournee` 364 · `ecartDesJours` 497 · `poidsDesJours` 527 · `chargeDuJour` 550
`rangeSejour` 559 · `derouleJournee` 1113 · `prepareSejour` 1255 · `calculeSejour` 1457
`apercuRepartition` 1491 · `rangJournee` 1505 · `lienJournee` 1517 · `boutonJour` 1540
`arretJournee` 1553 · `remplitOnglets` 1600 · `jourDuStand` 1629 · `ouvreChoixJour` 1641
`figeLaVisite` 1698 · `placeSurJour` 1707 · `rendAuPlan` 1715 · `retireDuSejour` 1721
`remplitJournee` 1731 · `ecritApercu` 1944 · `appliqueVueParcours` 1974
`traceJournee` 2016 · `montreLeJour` 2025 · `perimeJournee` 2040 · `oublieSejour` 2055
`ouvreOrganisation` 2070 · `essaieSejour` 2450 · `lanceSejour` 2480 · `refaitSejour` 2519
`trancheDe` 2552 · `chargeSuivie` 2572 · `jourISO` 2578 · `etapesDuSejour` 2586
`annoncePlan` 2613 · `celluleUtile` 2649 · `dilatationPour` 2712 · `dilatationDuJour` 2728
`litLaCharge` 2765 · `chargeCellule` 2785

### `_js.html` — 5456 l. → plan-admin.html, plan-smcl.html, plan.html

- l.79 · 1. Index global — la recherche porte sur tous les pavillons
- l.599 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.709 · 3. Rendu du pavillon courant
- l.1081 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.1223 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.2504 · 6. Vue
- l.2977 · 7. Sélection et fiche
- l.4523 · 8. Interactions du plan
- l.4956 · Ce que les tiroirs lisent d'un geste
- l.5002 · Le tiroir de la liste — écrans étroits
- l.5228 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`$` 15 · `esc` 17 · `cheminDuSalon` 35 · `cheminPartageable` 46 · `P` 76 · `nomDeLaZone` 96
`nomsAnglaisDesZones` 98 · `texteProduits` 111 · `indexe` 115 · `chronoConf` 360
`confsDuPlan` 365 · `indexeConferences` 383 · `rangeConferences` 461 · `poseFavicon` 508
`poseLogoSalon` 534 · `poseTonDeLaBarre` 571 · `largeur` 604 · `decoupe` 629 · `habille` 642
`lignesSvg` 653 · `coexComptes` 670 · `coexChoisit` 671 · `ligneCode` 687
`monteHabillage` 715 · `baliseZone` 739 · `baliseStand` 748 · `montePlan` 755
`onglets` 786 · `changePlan` 808 · `texteDist` 855 · `texteCourtDist` 860 · `porteDist` 864
`standPorte` 868 · `calqueDists` 877 · `traceDist` 908 · `oublieDists` 943
`modesDuPlan` 947 · `releveDists` 949 · `dessineDists` 983 · `marquesListe` 1009
`poseDistsFiche` 1039 · `refaitDistsFiche` 1079 · `ancre` 1089 · `place` 1090
`libelles` 1092 · `decaleLibelle` 1179 · `facteurLibelle` 1180 · `libelleForce` 1181
`libelleZone` 1184 · `libelleEmplacement` 1203 · `indexeSecteurs` 1244
`secteursMontres` 1257 · `couleurConf` 1261 · `hslHex` 1265 · `couleurSecteur` 1282
`BANDES` 1303 · `majFondus` 1311 · `pastilleSecteur` 1349 · `coloreSecteurs` 1362
`peintSecteur` 1413 · `appliqueSecteurs` 1426 · `filtreTheme` 1443 · `themeFiltrable` 1523
`ordreCriteres` 1543 · `clesCriteres` 1566 · `libelleCritere` 1573 · `separeValeurs` 1581
`valeursCritere` 1598 · `texteCriteres` 1611 · `texteAnglaisPerso` 1627
`indexeCriteres` 1641 · `refaitCriteres` 1675 · `dansCriteres` 1682 · `critereActif` 1690
`basculeCritere` 1692 · `videCriteres` 1701 · `majVideQ` 1710 · `videRecherche` 1723
`nCriteres` 1738 · `majCriteres` 1753 · `remplitCriteres` 1820 · `basculeCriteres` 1959
`ouvreCriteres` 1964 · `fermeCriteres` 1980 · `filtre` 1997 · `reposeRetrait` 2017
`critParSociete` 2021 · `cherchable` 2031 · `visible` 2038 · `releveHotes` 2059
`visibleSurPlan` 2067 · `visibleSociete` 2078 · `marqueRetrait` 2094 · `appliqueFiltre` 2112
`oublieRetrait` 2124 · `reprendRecherche` 2133 · `rangSorte` 2146 · `codeCase` 2168
`caseNumero` 2185 · `sousLigne` 2205 · `liste` 2219 · `marqueChoisie` 2347
`prechargeMarque` 2373 · `prechargeLesVignettes` 2430 · `chargeUnLot` 2476
`cadrePlan` 2519 · `oublieCadre` 2520 · `figeTextes` 2536 · `rendTextes` 2544
`cadrage` 2580 · `peintLibelles` 2585 · `detacheLibelles` 2591 · `rattacheLibelles` 2603
`etireLibelles` 2621 · `appliqueVue` 2629 · `libellesDeLaVue` 2693 · `rafraichitVue` 2701
`poseVue` 2715 · `mesureBarre` 2744 · `masqueHaut` 2776 · `masque` 2783
`masqueDroite` 2820 · `fit` 2831 · `stoppeZoom` 2864 · `glisseVersVise` 2870
`glisseVers` 2912 · `rectVisee` 2934 · `zoom` 2954 · `echelle` 2967 · `ETROIT` 2983
`anime` 2999 · `noeud` 3023 · `canalPlan` 3033 · `rangSociete` 3041 · `select` 3050
`centre` 3075 · `brancheActesFiche` 3086 · `centreEtBaisseLaFiche` 3102 · `centrePoint` 3120
`montre` 3165 · `libelleCorps` 3197 · `ordreCorps` 3214 · `groupesFiche` 3246
`montreIntitule` 3259 · `valeurCorps` 3279 · `champCorps` 3292 · `groupeCorps` 3304
`corpsRange` 3317 · `momentLocal` 3352 · `programme` 3375 · `produits` 3424
`ficheProduit` 3452 · `jourLong` 3518 · `ficheConf` 3529 · `lien` 3676 · `adresseWeb` 3684
`pictoRS` 3727 · `adresseSure` 3745 · `adresseVignette` 3776 · `adresseImage` 3794
`imageSure` 3807 · `assainitRiche` 3836 · `enBlocs` 3884 · `rangeRiche` 3897
`ecarteClicFantome` 3925 · `nomSociete` 3934 · `societes` 3947 · `choisitExposant` 3958
`poseMarque` 3996 · `montreMarque` 4056 · `poseCode` 4079 · `rangeMarque` 4120
`ouvre` 4183 · `ferme` 4493 · `onglet` 4511 · `milieu` 4543 · `commencePince` 4549
`suitPince` 4563 · `plieLesBandes` 4616 · `saisitPlan` 4630 · `cibleElargie` 4712
`planifieFiltre` 4912 · `traceurDeGeste` 4980 · `cranVoisin` 4999 · `retraitBas` 5025
`mesureTiroir` 5039 · `montreTiroir` 5042 · `hisseTiroir` 5046 · `tiroirCrante` 5255

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

### `_webgl.html` — 1602 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 179 · `guetteContexteWebgl` 185
`contextePerduWebgl` 195 · `verifieContexteWebgl` 202 · `perdContexteWebgl` 211
`remonteWebgl` 232 · `vueDeck` 249 · `vueWebgl` 258 · `blocDe` 267 · `enEdition` 297
`majEditionWebgl` 301 · `cleBloc` 313 · `planifieWebgl` 339 · `toutRepeindreWebgl` 343
`blocsDansLOrdre` 350 · `repeintWebgl` 355 · `assembleWebgl` 379 · `constTexte` 413
`jeuDeCaracteres` 609 · `sousPixelOffert` 663 · `couchesPetites` 668 · `couchesTexte` 678
`mulM` 712 · `appM` 715 · `echelleM` 716 · `lisTransform` 718 · `lisTrace` 740
`lisPoints` 808 · `num` 814 · `anneau` 816 · `rectArrondi` 822 · `couleurGl` 836
`accVide` 853 · `convertitBloc` 854 · `accDe` 870 · `parcoursGl` 877 · `avecTrous` 917
`formeGl` 938 · `texteGl` 974 · `imageGl` 997 · `partage` 1029 · `designeGl` 1035
`couchesDeBloc` 1037 · `modelesLibellesHtml` 1112 · `poseModelesLibelles` 1122
`lisModelesLibelles` 1128 · `emplacementWebgl` 1157 · `libellesWebgl` 1205
`groupesNoms` 1274 · `couchesNoms` 1291 · `couchesPastilles` 1302
`couchesLibellesWebgl` 1317 · `couchesDessineesWebgl` 1324 · `stage` 1345
`brancheSurvolWebgl` 1349 · `poseSurvolWebgl` 1369 · `poseCurseurWebgl` 1378
`poseFocusWebgl` 1387 · `aplatsDe` 1394 · `coucheSurvol` 1397 · `coucheFocus` 1406
`couchesPhare` 1433 · `lueurDe` 1449 · `opacitePhare` 1487 · `echellePhare` 1488
`couchesPhareNoms` 1491 · `palierDefile` 1516 · `phaseComete` 1518 · `animeCouche` 1521
`majAnimationWebgl` 1538 · `animeWebgl` 1546 · `objetSous` 1569 · `cibleWebgl` 1576
`priseWebgl` 1583 · `libelleSousWebgl` 1588 · `rectEcranWebgl` 1593

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

### `supabase/functions/plan-public/index.ts` — 1079 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 493 · `ampute` 517 · `masquesDe` 560 · `masquesDuPlan` 580

### `supabase/functions/sync-evenement/index.ts` — 1893 l.

`cors` 43 · `bourre` 112 · `client` 122 · `ecrit` 144 · `gaia` 152 · `libellesChoix` 163
`retiensAnglais` 190 · `fournisseur` 208 · `raccourci` 216 · `enClair` 253 · `range` 279
`champsKlipso` 300 · `hebergee` 1841 · `nettoieUrl` 1869 · `groupeTextes` 1879

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
