<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 4813 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.3737 · 10. Mode administration
- l.3845 · La fiche d'une zone organisateur
- l.4554 · Masquer une zone organisateur
- l.4640 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 326 · `programmeOffert` 331
`suggestionOfferte` 332 · `appliqueOptions` 334 · `langueOfferte` 358 · `appliqueLangue` 360
`chercheSorte` 424 · `voletRecherche` 427 · `minutesVisite` 484 · `lueHeure` 511
`lueDate` 515 · `datesSalon` 522 · `horairesSalon` 536 · `salonPartage` 549
`presseNuanciers` 580 · `suitNuancier` 596 · `trio` 624 · `melange` 634
`appliqueAccent` 648 · `appliqueFond` 682 · `modeDist` 729 · `couleurDist` 741
`appliqueDists` 763 · `modeBarre` 793 · `appliqueBarre` 795 · `modeleRetenu` 835
`policeChoisie` 991 · `policeDuModele` 996 · `feuillePolice` 1006 · `chargePolice` 1028
`policePrete` 1048 · `policeDesNoms` 1066 · `posePoliceLibelles` 1095
`appliqueModele` 1127 · `habilleModale` 1171 · `texteCorps` 1243 · `clesPortees` 1268
`standApercu` 1288 · `lignesApercu` 1312 · `contenuApercu` 1342 · `apercuFiche` 1379
`apercuListe` 1457 · `apercuDuo` 1479 · `glisseFenetre` 1512 · `ouvreReglages` 1523
`voletZones` 1643 · `champsFicheZone` 1745 · `ficheZoneEnPlace` 1815 · `voletPlan` 1833
`blocRappel` 1881 · `ditEssaiRappel` 1992 · `voletAdmin` 2017 · `blocOptions` 2207
`blocLangues` 2254 · `blocBarre` 2328 · `blocHoraires` 2386 · `sallesSituees` 2519
`voletPmr` 2535 · `nomDuTon` 2626 · `svgVignette` 2635 · `barreVignette` 2637
`vignetteDistPlan` 2641 · `vignetteDistListe` 2654 · `vignetteDistFiche` 2668
`salonDitSes` 2688 · `coinPris` 2695 · `voletDist` 2718 · `voletApparence` 2883
`clesFiche` 3082 · `voletOrdre` 3099 · `enregistreConf` 3686 · `rgbHex` 3693 · `hexa` 3700
`luminance` 3704 · `ecarte` 3718 · `joli` 3733 · `retireAdmin` 3754 · `activeAdmin` 3767
`champZone` 3871 · `champsZone` 3896 · `champSalles` 3988 · `nomDeZone` 4040
`reduitLogo` 4074 · `cadreLogo` 4117 · `champLogo` 4189 · `editeurRiche` 4227
`memeFicheZone` 4384 · `suitFicheZone` 4391 · `verseFicheZone` 4399 · `ficheZone` 4425
`enregistreZone` 4450 · `basculeAffichageZone` 4565 · `marqueZonesMasquees` 4582
`ecritColonnesEvenement` 4602 · `ecritColonneEvenement` 4636 · `cleLibelle` 4661
`empreinteLibelle` 4677 · `placementLibelle` 4685 · `posePlacement` 4695
`libelleAutomatique` 4712 · `modePlacementLibelles` 4721 · `majPaletteLibelle` 4740
`choisitLibelle` 4757 · `pousseLibelle` 4764 · `libellePointerDown` 4772
`libellePointerMove` 4788 · `libellePointerUp` 4797

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

### `_dessin.html` — 2474 l. → plan-admin.html, plan-smcl.html, plan.html

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
`ouvreEntrant` 875 · `ouvreSortant` 876 · `modeDit` 911 · `lettreMode` 912
`estTransport` 916 · `modeTransport` 919 · `glypheRepere` 931 · `cleLigne` 968
`ligneAffichee` 979 · `couleurLigne` 987 · `couleurRepere` 993 · `encreRepere` 999
`nomLigneFr` 1013 · `libelleDoffice` 1021 · `couleurEcrite` 1028 · `traceRepere` 1047
`nomSurLePlan` 1160 · `etiquetteSociete` 1171 · `seRattache` 1199 · `societeDeForme` 1211
`societesDuPlan` 1223 · `poseChampImage` 1243 · `remplitListeSocietes` 1250
`societeSaisie` 1258 · `traceImage` 1285 · `traceStandDessine` 1310
`texteStandDessine` 1334 · `poseLibellesDessines` 1352 · `decoupeStand` 1373
`marqueStandsDessines` 1385 · `rafraichitStandsDessines` 1400 · `oublieReperes` 1430
`reperesCherchables` 1432 · `vaAuRepere` 1476 · `clePoi` 1519 · `pastillePoi` 1528
`cartouchePoi` 1532 · `ouvrePoi` 1651 · `mesureCartouche` 1724 · `pharePoi` 1740
`phareRepere` 1744 · `phareZone` 1746 · `eclairePoi` 1752 · `oublieChoixPoi` 1785
`signale` 1794 · `calquePourImage` 1808 · `lienImageSaisi` 1836 · `formeImage` 1848
`poseImage` 1857 · `ditImagePosee` 1879 · `importeImage` 1887 · `dessinPointerDown` 1938
`dessinPointerMove` 2023 · `dessinPointerUp` 2061 · `termineTrace` 2102 · `aide` 2114
`outilOffert` 2144 · `choisitOutil` 2147 · `enchaineStand` 2178 · `optionsModes` 2208
`proposeCouleurLigne` 2219 · `montreTransport` 2230 · `activeCalque` 2289 · `cleVerrou` 2347
`verrouille` 2348 · `basculeVerrou` 2350 · `pictoVerrou` 2367 · `montreRoleIti` 2401
`creeCalque` 2432 · `demandeNom` 2445 · `renommeCalque` 2464

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

### `_environs.html` — 1638 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`metresParDegre` 43 · `tourneEnvirons` 60 · `versTerre` 66 · `versLePlan` 73 · `reancre` 88
`emprisePavillon` 114 · `centrePavillon` 129 · `styleSobre` 206 · `forceCarte` 300
`calagePose` 318 · `calageCourant` 330 · `fondCourant` 333 · `recul` 338
`pixelsMercator` 343 · `latitudeDePixel` 352 · `metresParPixel` 360 · `echelleDesTuiles` 378
`niveauDesTuiles` 390 · `adresseTuile` 397 · `tuilesDeLaVue` 407 · `chargeMapLibre` 472
`vueGL` 503 · `styleDuFond` 523 · `guetteLaCarte` 551 · `poseCarteGL` 562
`diagnostiqueGL` 648 · `relanceCarteGL` 668 · `videCarteGL` 680 · `dessineFondCarte` 699
`cleMasqueCarte` 795 · `masqueCarte` 796 · `basculeMasqueCarte` 798
`boutonMasqueCarte` 809 · `pictoMasque` 820 · `formesMasquantes` 832 · `contourDuHall` 854
`cheminDuHall` 861 · `poseMasqueCarte` 879 · `carreDeTerrain` 913 · `chercheBatiments` 929
`aireDuContour` 956 · `centreDuContour` 965 · `axeDuContour` 978 · `empriseDesObjets` 995
`batimentsCandidats` 1013 · `caleSurBatiment` 1034 · `retientLeHall` 1060
`manqueCalage` 1082 · `enregistreCalage` 1091 · `calageEnregistre` 1108
`oublieCalageEnCours` 1129 · `litCoordonnees` 1141 · `rafraichitCarte` 1155
`armeCalage` 1197 · `pivotCalage` 1208 · `glisseCarte` 1212 · `cartePointerDown` 1219
`cartePointerMove` 1233 · `cartePointerUp` 1252 · `ditCalage` 1260 · `ditCarte` 1269
`majCalage` 1277 · `appliqueCalage` 1299 · `tourneCalage` 1306 · `construitCalage` 1312
`ouvreCalage` 1477 · `fermeCalage` 1486 · `voletEnvirons` 1514

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

### `_head.html` — 5682 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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
`#closeDetail` · `#dCorne` · `#dKind` · `#dPast` · `#dName` · `#dRen` · `#dLogo`
`#dBadges` · `#dCode` · `#dVis` · `#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg`
`#dOngNb` · `#dOngProd` · `#dOngNbProd` · `#dBody` · `#parcours` · `#poigneeParcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee`
`#btnPartage` · `#jJours` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied`
`#jRefaire` · `#jRetour` · `#itineraire` · `#poigneeItineraire` · `#closeItineraire`
`#iResume` · `#iCorps` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee`
`#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

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

### `_itineraire.html` — 3185 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 104 · `enveloppe` 124 · `oublieGrilles` 167 · `calquesDe` 172 · `reperesDe` 177
`zoneTraversee` 257 · `cleRoleIti` 259 · `roleIti` 260 · `nomRoleIti` 261
`estCirculation` 264 · `formesRole` 289 · `anglePlan` 321 · `dansGrille` 360
`horsGrille` 361 · `grille` 371 · `distanceAuMur` 521 · `cretes` 564 · `nappePrincipale` 582
`celluleDe` 617 · `caseDe` 621 · `centreCase` 626 · `empriseDe` 669 · `accrocheDepuis` 701
`versLeMilieu` 757 · `accroche` 788 · `Tas` 803 · `travail` 847 · `cherche` 870
`distancesDepuis` 937 · `distancesMulti` 951 · `regleFoule` 1023 · `ecarteFoule` 1040
`heureAuSalon` 1044 · `sallesEnMouvement` 1053 · `foule` 1096 · `bilanFoule` 1184
`reduit` 1213 · `guidageAllees` 1276 · `recentre` 1332 · `passable` 1417 · `lisse` 1451
`longueur` 1478 · `longueurDehors` 1494 · `nettoie` 1536 · `oublieFaces` 1583
`facesLibres` 1585 · `amorce` 1658 · `faceDeSortie` 1693 · `accesDe` 1723
`couplesAcces` 1768 · `troncon` 1801 · `pointObjet` 1844 · `pointRepere` 1851
`candidats` 1860 · `pointSaisi` 1894 · `portesDe` 1912 · `versPorte` 1919
`typeLiaison` 1980 · `nomRepere` 1988 · `oublieLiaisons` 2006 · `lienEcrits` 2018
`ecritLiens` 2027 · `annuaireLiaisons` 2032 · `liensDe` 2064 · `coutLiaison` 2084
`passagePraticable` 2091 · `passagesDe` 2099 · `sortiesDe` 2109 · `plansRelies` 2117
`balayage` 2141 · `distanceDepuis` 2155 · `cheminLiaisons` 2182 · `routeParLiaisons` 2266
`routeEntre` 2302 · `calculeRoute` 2341 · `couleurNappe` 2367 · `rafraichitApercu` 2373
`marchesIci` 2416 · `rayonBout` 2421 · `arreteTracage` 2454 · `mesureMarches` 2461
`coupeMarche` 2476 · `distancesDesArrets` 2492 · `peintItineraire` 2504
`lanceTracage` 2555 · `dessineItineraire` 2580 · `rafraichitBouts` 2602
`cadreItineraire` 2625 · `champIti` 2649 · `ecritDistance` 2653 · `ecritDuree` 2661
`fermeSugg` 2666 · `montreSugg` 2673 · `choisitPoint` 2707 · `valideSaisie` 2716
`effaceItineraire` 2728 · `relance` 2755 · `phraseLiaison` 2806 · `montreResultat` 2820
`bandeauVisee` 2962 · `armeVisee` 2985 · `finVisee` 3003 · `viseItineraire` 3019
`visePoi` 3025 · `visePoint` 3031 · `ouvreItineraire` 3063 · `fermeItineraire` 3091
`versItineraire` 3101 · `versItineraireDe` 3104

### `_journee.html` — 2130 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa visite

Fonctions :

`minutesDe` 128 · `finInstant` 129 · `ecritHeure` 131 · `ecritMinutes` 136 · `dateDeCle` 149
`jourBref` 155 · `joursSalon` 165 · `joursAVenir` 194 · `joursDefaut` 212
`confsParJour` 222 · `pointConf` 239 · `departsProposes` 258 · `matriceJournee` 291
`ecartDesJours` 417 · `poidsDesJours` 447 · `chargeDuJour` 470 · `rangeSejour` 479
`derouleJournee` 788 · `prepareSejour` 930 · `calculeSejour` 1077 · `apercuRepartition` 1111
`rangJournee` 1125 · `lienJournee` 1137 · `boutonJour` 1160 · `arretJournee` 1173
`remplitOnglets` 1220 · `jourDuStand` 1249 · `ouvreChoixJour` 1261 · `figeLaVisite` 1318
`placeSurJour` 1327 · `rendAuPlan` 1335 · `retireDuSejour` 1341 · `remplitJournee` 1351
`ecritApercu` 1564 · `appliqueVueParcours` 1594 · `traceJournee` 1632 · `montreLeJour` 1641
`perimeJournee` 1656 · `oublieSejour` 1671 · `ouvreOrganisation` 1686 · `essaieSejour` 2061
`lanceSejour` 2088 · `refaitSejour` 2120

### `_js.html` — 5290 l. → plan-admin.html, plan-smcl.html, plan.html

- l.79 · 1. Index global — la recherche porte sur tous les pavillons
- l.567 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.677 · 3. Rendu du pavillon courant
- l.1019 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.1155 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.2386 · 6. Vue
- l.2817 · 7. Sélection et fiche
- l.4362 · 8. Interactions du plan
- l.4790 · Ce que les tiroirs lisent d'un geste
- l.4836 · Le tiroir de la liste — écrans étroits
- l.5062 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`$` 15 · `esc` 17 · `cheminDuSalon` 35 · `cheminPartageable` 46 · `P` 76 · `nomDeLaZone` 96
`nomsAnglaisDesZones` 98 · `indexe` 106 · `chronoConf` 328 · `confsDuPlan` 333
`indexeConferences` 351 · `rangeConferences` 429 · `poseFavicon` 476 · `poseLogoSalon` 502
`poseTonDeLaBarre` 539 · `largeur` 572 · `decoupe` 597 · `habille` 610 · `lignesSvg` 621
`coexComptes` 638 · `coexChoisit` 639 · `ligneCode` 655 · `monteHabillage` 683
`montePlan` 700 · `onglets` 739 · `changePlan` 761 · `texteDist` 808 · `texteCourtDist` 813
`porteDist` 817 · `standPorte` 821 · `calqueDists` 830 · `traceDist` 861 · `oublieDists` 894
`modesDuPlan` 898 · `releveDists` 900 · `dessineDists` 929 · `marquesListe` 955
`poseDistsFiche` 985 · `refaitDistsFiche` 1017 · `ancre` 1027 · `place` 1028
`libelles` 1030 · `decaleLibelle` 1111 · `facteurLibelle` 1112 · `libelleForce` 1113
`libelleZone` 1116 · `libelleEmplacement` 1135 · `indexeSecteurs` 1176
`secteursMontres` 1189 · `couleurConf` 1193 · `hslHex` 1197 · `couleurSecteur` 1214
`BANDES` 1235 · `majFondus` 1243 · `pastilleSecteur` 1281 · `coloreSecteurs` 1294
`peintSecteur` 1345 · `appliqueSecteurs` 1358 · `filtreTheme` 1375 · `themeFiltrable` 1455
`clesCriteres` 1471 · `libelleCritere` 1478 · `separeValeurs` 1486 · `valeursCritere` 1503
`texteCriteres` 1516 · `texteAnglaisPerso` 1532 · `indexeCriteres` 1546
`dansCriteres` 1573 · `critereActif` 1581 · `basculeCritere` 1583 · `videCriteres` 1592
`majVideQ` 1601 · `videRecherche` 1614 · `nCriteres` 1629 · `majCriteres` 1644
`remplitCriteres` 1711 · `basculeCriteres` 1850 · `ouvreCriteres` 1855
`fermeCriteres` 1871 · `filtre` 1888 · `reposeRetrait` 1908 · `critParSociete` 1912
`cherchable` 1922 · `visible` 1929 · `releveHotes` 1945 · `visibleSurPlan` 1953
`visibleSociete` 1964 · `marqueRetrait` 1980 · `appliqueFiltre` 1995 · `oublieRetrait` 2007
`reprendRecherche` 2016 · `rangSorte` 2029 · `codeCase` 2051 · `caseNumero` 2068
`sousLigne` 2088 · `liste` 2102 · `marqueChoisie` 2229 · `prechargeMarque` 2255
`prechargeLesVignettes` 2312 · `chargeUnLot` 2358 · `cadrePlan` 2401 · `oublieCadre` 2402
`figeTextes` 2418 · `rendTextes` 2426 · `cadrage` 2462 · `peintLibelles` 2467
`detacheLibelles` 2473 · `rattacheLibelles` 2485 · `etireLibelles` 2503 · `appliqueVue` 2511
`rafraichitVue` 2555 · `poseVue` 2569 · `mesureBarre` 2598 · `masqueHaut` 2622
`masque` 2629 · `masqueDroite` 2666 · `fit` 2677 · `stoppeZoom` 2710 · `glisseVersVise` 2716
`glisseVers` 2758 · `rectVisee` 2780 · `zoom` 2800 · `echelle` 2809 · `ETROIT` 2823
`anime` 2839 · `noeud` 2863 · `canalPlan` 2873 · `rangSociete` 2881 · `select` 2890
`centre` 2915 · `brancheActesFiche` 2926 · `centreEtBaisseLaFiche` 2942 · `centrePoint` 2960
`montre` 3005 · `libelleCorps` 3037 · `ordreCorps` 3054 · `groupesFiche` 3086
`montreIntitule` 3099 · `valeurCorps` 3119 · `champCorps` 3132 · `groupeCorps` 3144
`corpsRange` 3157 · `momentLocal` 3192 · `programme` 3215 · `produits` 3264
`ficheProduit` 3292 · `jourLong` 3358 · `ficheConf` 3369 · `lien` 3516 · `adresseWeb` 3524
`pictoRS` 3567 · `adresseSure` 3585 · `adresseVignette` 3616 · `adresseImage` 3634
`imageSure` 3647 · `assainitRiche` 3676 · `enBlocs` 3724 · `rangeRiche` 3737
`ecarteClicFantome` 3765 · `nomSociete` 3774 · `societes` 3787 · `choisitExposant` 3798
`poseMarque` 3836 · `montreMarque` 3896 · `poseCode` 3919 · `rangeMarque` 3960
`ouvre` 4023 · `ferme` 4332 · `onglet` 4350 · `milieu` 4382 · `commencePince` 4388
`suitPince` 4402 · `plieLesBandes` 4455 · `saisitPlan` 4469 · `cibleElargie` 4551
`planifieFiltre` 4746 · `traceurDeGeste` 4814 · `cranVoisin` 4833 · `retraitBas` 4859
`mesureTiroir` 4873 · `montreTiroir` 4876 · `hisseTiroir` 4880 · `tiroirCrante` 5089

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

### `_parcours.html` — 710 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 63 · `casierParcours` 66 · `dansParcours` 67 · `jourParcours` 70
`attenduDepuisTropLongtemps` 75 · `trieParcours` 86 · `chargeParcours` 96
`parcoursAEcrire` 126 · `enregistreParcours` 140 · `tientLeStockage` 169
`basculeParcours` 190 · `verseAuParcours` 235 · `plurielParcours` 261
`contenuParcours` 270 · `retenusPourParcours` 296 · `ajouteToutAuParcours` 321
`poseToutAuParcours` 344 · `signetParcours` 370 · `boutonParcours` 376
`rafraichitMarque` 381 · `brancheParcours` 394 · `calqueMarques` 426 · `dessineMarques` 442
`marqueParcours` 472 · `rafraichitParcours` 486 · `instantConf` 517 · `cleTemps` 521
`jourCourt` 527 · `nomDeStand` 534 · `rangParcours` 536 · `groupeParcours` 556
`remplitParcours` 565 · `ouvreParcours` 654 · `fermeParcours` 666 · `videLeParcours` 682

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

## Le reste

- `src/index.mjs` — 787 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 85 · `amontPour` 94 · `cleDe` 102 · `cleDeLot` 108 · `condense` 115 · `cleVersion` 126 `rangeLaVersion` 129 · `ditVersion` 137 · `meta` 146 · `gardable` 162 · `range` 168 `rafraichit` 175 · `entete` 210 · `oublie` 252 · `rappels` 338 · `cleApp` 383 `cheminDuSalon` 414 · `pageDuSalon` 431 · `appDuSalon` 455 · `iconesDuSalon` 501 `manifeste` 541 · `iconeApp` 630 · `mesure` 651
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
