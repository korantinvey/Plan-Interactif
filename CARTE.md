<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 5454 l. → plan-admin.html

- l.2 · 9. Apparence des calques
- l.4300 · 10. Mode administration
- l.4411 · La fiche d'une zone organisateur
- l.5182 · Masquer une zone organisateur
- l.5279 · Placer un libellé à la main

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
`appliqueModele` 1480 · `habilleModale` 1524 · `texteCorps` 1597 · `clesPortees` 1622
`standApercu` 1642 · `lignesApercu` 1666 · `contenuApercu` 1696 · `apercuFiche` 1733
`apercuListe` 1811 · `apercuDuo` 1833 · `glisseFenetre` 1867 · `ouvreReglages` 1879
`voletZones` 2007 · `champsFicheZone` 2109 · `ficheZoneEnPlace` 2179 · `voletPlan` 2197
`blocRappel` 2245 · `ditEssaiRappel` 2356 · `voletCoexposants` 2390 · `voletAdmin` 2460
`blocOptions` 2625 · `blocLangues` 2672 · `blocBarre` 2746 · `blocHoraires` 2804
`voletParcours` 2946 · `sallesSituees` 3081 · `voletPmr` 3097 · `nomDuTon` 3188
`svgVignette` 3197 · `barreVignette` 3199 · `vignetteDistPlan` 3203
`vignetteDistListe` 3216 · `vignetteDistFiche` 3230 · `salonDitSes` 3250 · `coinPris` 3257
`voletDist` 3280 · `voletApparence` 3445 · `clesFiche` 3644 · `voletOrdre` 3661
`enregistreConf` 4249 · `rgbHex` 4256 · `hexa` 4263 · `luminance` 4267 · `ecarte` 4281
`joli` 4296 · `retireAdmin` 4317 · `activeAdmin` 4331 · `champZone` 4437 · `champsZone` 4462
`champSalles` 4554 · `nomDeZone` 4606 · `reduitLogo` 4640 · `cadreLogo` 4683
`champLogo` 4755 · `editeurRiche` 4793 · `memeFicheZone` 4950 · `suitFicheZone` 4957
`verseFicheZone` 4965 · `ficheZone` 4991 · `enregistreZone` 5016
`enregistreZoneAjoutee` 5129 · `basculeAffichageZone` 5193 · `marqueZonesMasquees` 5221
`ecritColonnesEvenement` 5241 · `ecritColonneEvenement` 5275 · `cleLibelle` 5300
`empreinteLibelle` 5316 · `placementLibelle` 5324 · `posePlacement` 5335
`libelleAutomatique` 5352 · `modePlacementLibelles` 5361 · `majPaletteLibelle` 5380
`choisitLibelle` 5397 · `pousseLibelle` 5404 · `libellePointerDown` 5412
`libellePointerMove` 5428 · `libellePointerUp` 5437

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 271 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 113 · `panneDuChargement` 160
`CLE_VERSION` 170 · `versionRetenue` 171 · `retientVersion` 174 · `demandePlan` 198
`charge` 222

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

### `_application.html` — 457 l. → plan-admin.html

- l.1 · 19. L'application installée — son icône et son nom

Fonctions :

`fondPourIconeApp` 93 · `dessineIconeApp` 125 · `reduitIconeApp` 152 · `adresseIconeApp` 187
`appDuSalon` 195 · `iconeDeLApplication` 198 · `nomAppDefaut` 209 · `ecritApplication` 224
`blocApplication` 265

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

### `_borne.html` — 370 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — un plan qui sait où il est

Fonctions :

`pointBorne` 62 · `borneRetenue` 70 · `retientBorne` 76 · `oublieBorne` 79 · `lieuBorne` 98
`lieuNomme` 117 · `pointLibre` 122 · `poseDepartImpose` 135 · `poseLaBorne` 146
`remetLeDepart` 165 · `poseBorneIci` 179 · `armeLaPose` 188 · `montreBandeauBorne` 204
`ecritDepartBorne` 218 · `rayonBorne` 231 · `dessineBorne` 236 · `rafraichitBorne` 252
`rempliBorne` 257 · `relanceRepos` 286 · `reposeLaBorne` 293 · `demarreBorne` 329

### `_chaleur.html` — 638 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.435 · Remise à zéro des compteurs

Fonctions :

`nbChal` 32 · `tonChaleur` 51 · `niveauChaleur` 73 · `valeurChaleur` 76 · `chargeChaleur` 89
`coloreChaleur` 135 · `cartoucheChaleur` 170 · `mesureCartoucheChaleur` 234
`replieChaleur` 240 · `ecritEtatChaleur` 251 · `dessineEchelleChaleur` 259
`dessineTopChaleur` 279 · `phraseChaleur` 321 · `rafraichitChaleur` 346
`montreChaleur` 380 · `rangChaleur` 416 · `aplati` 457 · `voletMesure` 462
`evenementCourant` 488 · `ouvreRemiseAZero` 507 · `lanceRemiseAZero` 599

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

### `_dessin.html` — 2551 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 169 · `enregistreDessins` 171 · `instantane` 215 · `clotSalve` 226
`memorise` 227 · `restaure` 238 · `annule` 254 · `refais` 266 · `trouveCalque` 269
`nouvelId` 270 · `cheminArrondi` 288 · `estCadre` 331 · `cheminForme` 333 · `styleTrait` 353
`longueurFleche` 379 · `cheminFleche` 386 · `marqueFleche` 415 · `rafraichitFleches` 426
`poseTrait` 443 · `traceForme` 454 · `rotationTexte` 473 · `dessineDessins` 478
`redessineForme` 519 · `peintCalque` 543 · `versPlan` 549 · `apercu` 555 · `apercuGuide` 567
`toleranceTrace` 592 · `aimanteContour` 597 · `rayonContour` 600 · `redresseTrace` 619
`traceGuide` 653 · `fermeIci` 660 · `ajouteForme` 667 · `pictoDe` 795
`nomTypeRepereFr` 851 · `nomTypeRepere` 853 · `typeZone` 883 · `pictoForme` 890
`estPorte` 910 · `ouvreEntrant` 911 · `ouvreSortant` 912 · `modeDit` 952 · `lettreMode` 953
`estTransport` 957 · `modeTransport` 960 · `glypheRepere` 972 · `cleLigne` 1009
`ligneAffichee` 1020 · `couleurLigne` 1028 · `couleurRepere` 1034 · `encreRepere` 1040
`nomLigneFr` 1054 · `libelleDoffice` 1062 · `couleurEcrite` 1069 · `traceRepere` 1088
`nomSurLePlan` 1222 · `etiquetteSociete` 1233 · `seRattache` 1261 · `societeDeForme` 1273
`societesDuPlan` 1285 · `poseChampImage` 1307 · `remplitListeSocietes` 1314
`societeSaisie` 1322 · `traceImage` 1350 · `traceStandDessine` 1375
`texteStandDessine` 1399 · `poseLibellesDessines` 1417 · `decoupeStand` 1438
`marqueStandsDessines` 1453 · `rafraichitStandsDessines` 1468 · `oublieReperes` 1498
`reperesCherchables` 1500 · `vaAuRepere` 1544 · `clePoi` 1587 · `pastillePoi` 1596
`cartouchePoi` 1600 · `ouvrePoi` 1719 · `mesureCartouche` 1792 · `pharePoi` 1808
`phareRepere` 1812 · `phareZone` 1814 · `eclairePoi` 1820 · `oublieChoixPoi` 1853
`signale` 1862 · `calquePourImage` 1877 · `lienImageSaisi` 1905 · `formeImage` 1917
`poseImage` 1926 · `ditImagePosee` 1948 · `importeImage` 1956 · `dessinPointerDown` 2007
`dessinPointerMove` 2092 · `dessinPointerUp` 2130 · `termineTrace` 2171 · `aide` 2183
`outilOffert` 2213 · `choisitOutil` 2216 · `enchaineStand` 2247 · `optionsModes` 2277
`proposeCouleurLigne` 2288 · `montreTransport` 2299 · `activeCalque` 2365 · `cleVerrou` 2423
`verrouille` 2424 · `basculeVerrou` 2426 · `pictoVerrou` 2443 · `montreRoleIti` 2477
`creeCalque` 2508 · `demandeNom` 2521 · `renommeCalque` 2540

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

### `_environs.html` — 1654 l. → plan-admin.html, plan-smcl.html, plan.html

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
`ouvreCalage` 1491 · `fermeCalage` 1502 · `voletEnvirons` 1530

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_geometrie.html` — 1070 l. → plan-admin.html

- l.2 · 11 octies. Reprendre à la main la géométrie d'un emplacement

Fonctions :

`cleGeo` 30 · `arrondiGeo` 38 · `empreinteGeo` 49 · `anneauxGeo` 69 · `traceGeo` 82
`boiteAnneaux` 86 · `dansAnneau` 104 · `distSegmentGeo` 115 · `distBordGeo` 124
`poleGeo` 134 · `porteeGeo` 153 · `boiteGeo` 161 · `geometrieSource` 186
`reposeSource` 195 · `poseGeometrie` 204 · `retoucheGeo` 218 · `elargitEmprise` 231
`appliqueGeometries` 252 · `cleVerrouGeo` 282 · `geoVerrouille` 283 · `basculeVerrouGeo` 285
`boutonVerrouGeo` 300 · `modeGeometrie` 311 · `objetGeoSous` 338 · `groupeGeo` 348
`choisitGeo` 356 · `cadreGeo` 371 · `prisesGeo` 391 · `curseurGeo` 403
`dessinePoigneesGeo` 406 · `ecritDimensionsGeo` 434 · `nomSorteGeo` 446
`majPaletteGeo` 448 · `finGesteGeo` 487 · `enregistreGeo` 505 · `geometrieOrigine` 519
`retraceGeo` 534 · `pousseGeometrie` 545 · `appliqueDimensionGeo` 562 · `cleAjout` 601
`anneauxValides` 615 · `rechAjout` 620 · `objetAjoute` 629 · `poseLien` 648
`appliqueAjouts` 675 · `enregistreAjout` 711 · `ajouteEmplacement` 726 · `renommeAjout` 754
`lieAjout` 786 · `ecritInfosAjout` 815 · `supprimeAjout` 842 · `choisitOutilGeo` 871
`aideAjout` 878 · `fermeAjout` 888 · `ajoutPointerDown` 897 · `ajoutPointerMove` 913
`ajoutPointerUp` 935 · `geometriePointerDown` 955 · `accrocheGeo` 986
`geometriePointerMove` 988 · `geometriePointerUp` 1039

### `_head.html` — 5797 l. → plan-admin.html, plan-smcl.html, plan.html

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

### `_installation.html` — 939 l. → plan-admin.html, plan-smcl.html, plan.html

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
`poseGardeInstallation` 685 · `remplitInvitation` 708 · `ouvreInvitation` 738
`ouvreRappel` 817 · `ouvreRetrouve` 879 · `caseInstallation` 902

### `_itineraire.html` — 3366 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 104 · `enveloppe` 124 · `oublieGrilles` 167 · `calquesDe` 172 · `reperesDe` 177
`zoneTraversee` 257 · `zonesDuTerrain` 266 · `cleRoleIti` 269 · `roleIti` 270
`nomRoleIti` 271 · `estCirculation` 274 · `formesRole` 299 · `anglePlan` 331
`dansGrille` 370 · `horsGrille` 371 · `grille` 381 · `distanceAuMur` 570 · `cretes` 613
`nappePrincipale` 631 · `celluleDe` 666 · `caseDe` 670 · `centreCase` 675 · `empriseDe` 718
`accrocheDepuis` 780 · `versLeMilieu` 853 · `accroche` 888 · `Tas` 903 · `travail` 947
`cherche` 970 · `distancesDepuis` 1037 · `distancesMulti` 1051 · `regleFoule` 1123
`ecarteFoule` 1140 · `heureAuSalon` 1144 · `sallesEnMouvement` 1153 · `foule` 1196
`bilanFoule` 1284 · `reduit` 1313 · `guidageAllees` 1376 · `recentre` 1432 · `passable` 1517
`lisse` 1551 · `longueur` 1578 · `longueurDehors` 1594 · `nettoie` 1636 · `oublieFaces` 1683
`facesLibres` 1685 · `amorce` 1782 · `faceDeSortie` 1817 · `raccordTient` 1863
`accesDe` 1893 · `couplesAcces` 1945 · `troncon` 1978 · `pointObjet` 2021
`pointRepere` 2028 · `candidats` 2037 · `pointSaisi` 2071 · `portesDe` 2089
`versPorte` 2096 · `typeLiaison` 2157 · `nomRepere` 2165 · `oublieLiaisons` 2183
`lienEcrits` 2195 · `ecritLiens` 2204 · `annuaireLiaisons` 2209 · `liensDe` 2241
`coutLiaison` 2261 · `passagePraticable` 2268 · `passagesDe` 2276 · `sortiesDe` 2286
`plansRelies` 2294 · `balayage` 2318 · `distanceDepuis` 2336 · `cheminLiaisons` 2363
`routeParLiaisons` 2447 · `routeEntre` 2483 · `calculeRoute` 2522 · `couleurNappe` 2548
`rafraichitApercu` 2554 · `marchesIci` 2597 · `rayonBout` 2602 · `arreteTracage` 2635
`mesureMarches` 2642 · `coupeMarche` 2657 · `distancesDesArrets` 2673
`peintItineraire` 2685 · `lanceTracage` 2736 · `dessineItineraire` 2761
`rafraichitBouts` 2783 · `cadreItineraire` 2806 · `champIti` 2830 · `ecritDistance` 2834
`ecritDuree` 2842 · `fermeSugg` 2847 · `montreSugg` 2854 · `choisitPoint` 2888
`valideSaisie` 2897 · `effaceItineraire` 2909 · `relance` 2936 · `phraseLiaison` 2987
`montreResultat` 3001 · `bandeauVisee` 3143 · `armeVisee` 3166 · `finVisee` 3184
`viseItineraire` 3200 · `visePoi` 3206 · `visePoint` 3212 · `ouvreItineraire` 3244
`fermeItineraire` 3272 · `versItineraire` 3282 · `versItineraireDe` 3285

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

### `_js.html` — 5478 l. → plan-admin.html, plan-smcl.html, plan.html

- l.79 · 1. Index global — la recherche porte sur tous les pavillons
- l.594 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.704 · 3. Rendu du pavillon courant
- l.1079 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.1221 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.2506 · 6. Vue
- l.2983 · 7. Sélection et fiche
- l.4531 · 8. Interactions du plan
- l.4978 · Ce que les tiroirs lisent d'un geste
- l.5024 · Le tiroir de la liste — écrans étroits
- l.5250 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`$` 15 · `esc` 17 · `cheminDuSalon` 35 · `cheminPartageable` 46 · `P` 76 · `nomDeLaZone` 96
`nomsAnglaisDesZones` 98 · `texteProduits` 111 · `indexe` 115 · `chronoConf` 355
`confsDuPlan` 360 · `indexeConferences` 378 · `rangeConferences` 456 · `poseFavicon` 503
`poseLogoSalon` 529 · `poseTonDeLaBarre` 566 · `largeur` 599 · `decoupe` 624 · `habille` 637
`lignesSvg` 648 · `coexComptes` 665 · `coexChoisit` 666 · `ligneCode` 682
`monteHabillage` 710 · `baliseZone` 739 · `baliseStand` 749 · `montePlan` 756
`onglets` 791 · `changePlan` 813 · `texteDist` 860 · `texteCourtDist` 865 · `porteDist` 869
`standPorte` 873 · `calqueDists` 882 · `traceDist` 913 · `oublieDists` 946
`modesDuPlan` 950 · `releveDists` 952 · `dessineDists` 981 · `marquesListe` 1007
`poseDistsFiche` 1037 · `refaitDistsFiche` 1077 · `ancre` 1087 · `place` 1088
`libelles` 1090 · `decaleLibelle` 1177 · `facteurLibelle` 1178 · `libelleForce` 1179
`libelleZone` 1182 · `libelleEmplacement` 1201 · `indexeSecteurs` 1242
`secteursMontres` 1255 · `couleurConf` 1259 · `hslHex` 1263 · `couleurSecteur` 1280
`BANDES` 1301 · `majFondus` 1309 · `pastilleSecteur` 1347 · `coloreSecteurs` 1360
`peintSecteur` 1411 · `appliqueSecteurs` 1424 · `filtreTheme` 1441 · `themeFiltrable` 1521
`ordreCriteres` 1541 · `clesCriteres` 1564 · `libelleCritere` 1571 · `separeValeurs` 1579
`valeursCritere` 1596 · `texteCriteres` 1609 · `texteAnglaisPerso` 1625
`indexeCriteres` 1639 · `refaitCriteres` 1673 · `dansCriteres` 1680 · `critereActif` 1688
`basculeCritere` 1690 · `videCriteres` 1699 · `majVideQ` 1708 · `videRecherche` 1721
`nCriteres` 1736 · `majCriteres` 1751 · `remplitCriteres` 1818 · `basculeCriteres` 1957
`ouvreCriteres` 1962 · `fermeCriteres` 1978 · `filtre` 1995 · `reposeRetrait` 2015
`critParSociete` 2019 · `cherchable` 2029 · `visible` 2036 · `releveHotes` 2057
`visibleSurPlan` 2065 · `visibleSociete` 2076 · `marqueRetrait` 2092 · `appliqueFiltre` 2110
`oublieRetrait` 2126 · `reprendRecherche` 2135 · `rangSorte` 2148 · `codeCase` 2170
`caseNumero` 2187 · `sousLigne` 2207 · `liste` 2221 · `marqueChoisie` 2349
`prechargeMarque` 2375 · `prechargeLesVignettes` 2432 · `chargeUnLot` 2478
`cadrePlan` 2521 · `oublieCadre` 2522 · `figeTextes` 2538 · `rendTextes` 2546
`cadrage` 2582 · `peintLibelles` 2587 · `detacheLibelles` 2593 · `rattacheLibelles` 2605
`etireLibelles` 2623 · `appliqueVue` 2631 · `libellesDeLaVue` 2695 · `rafraichitVue` 2703
`poseVue` 2719 · `mesureBarre` 2750 · `masqueHaut` 2782 · `masque` 2789
`masqueDroite` 2826 · `fit` 2837 · `stoppeZoom` 2870 · `glisseVersVise` 2876
`glisseVers` 2918 · `rectVisee` 2940 · `zoom` 2960 · `echelle` 2973 · `ETROIT` 2989
`anime` 3005 · `noeud` 3029 · `canalPlan` 3039 · `rangSociete` 3047 · `select` 3056
`centre` 3081 · `brancheActesFiche` 3092 · `centreEtBaisseLaFiche` 3108 · `centrePoint` 3126
`montre` 3171 · `libelleCorps` 3203 · `ordreCorps` 3220 · `groupesFiche` 3252
`montreIntitule` 3265 · `valeurCorps` 3285 · `champCorps` 3298 · `groupeCorps` 3310
`corpsRange` 3323 · `momentLocal` 3358 · `programme` 3381 · `produits` 3430
`ficheProduit` 3458 · `jourLong` 3524 · `ficheConf` 3535 · `lien` 3682 · `adresseWeb` 3690
`pictoRS` 3733 · `adresseSure` 3751 · `adresseVignette` 3782 · `adresseImage` 3800
`imageSure` 3813 · `assainitRiche` 3842 · `enBlocs` 3890 · `rangeRiche` 3903
`ecarteClicFantome` 3931 · `nomSociete` 3940 · `societes` 3953 · `choisitExposant` 3964
`poseMarque` 4002 · `montreMarque` 4062 · `poseCode` 4085 · `rangeMarque` 4126
`ouvre` 4189 · `ferme` 4501 · `onglet` 4519 · `milieu` 4551 · `commencePince` 4557
`suitPince` 4571 · `plieLesBandes` 4624 · `saisitPlan` 4638 · `cibleElargie` 4724
`planifieFiltre` 4934 · `traceurDeGeste` 5002 · `cranVoisin` 5021 · `retraitBas` 5047
`mesureTiroir` 5061 · `montreTiroir` 5064 · `hisseTiroir` 5068 · `tiroirCrante` 5277

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

### `_modales.html` — 191 l. → plan-admin.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 37 · `fermeModale` 57 · `confirme` 72 · `deplaceVers` 91
`versExtremite` 103 · `remplitOrdre` 111 · `ouvreOrdre` 181

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

### `_pile.html` — 544 l. → plan-admin.html

- l.2 · Pile des calques
- l.58 · Panneau : deux sections, chacune rangée par nom
- l.354 · Repères
- l.406 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 76 · `boutonAjout` 83 · `boutonVerrou` 103 · `intertitre` 111
`construitPanneau` 119 · `sectionSelection` 370 · `sectionFond` 426 · `ligneCouleur` 484
`rangSecteur` 504 · `rangSous` 517 · `defautCouleur` 539

### `_pousse.html` — 697 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration
- l.567 · La sauvegarde emportée

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`compteRescapes` 110 · `ditAlerte` 123 · `ditEtat` 167 · `programmeEnvoi` 174
`programmePublication` 188 · `rattrapeRetard` 195 · `envoie` 200 · `presse` 213
`resteSession` 247 · `renouvelleSession` 263 · `base` 287 · `identifiants` 335
`reglagesSeuls` 350 · `noteReglagesCharges` 361 · `oublieCache` 375
`pousseConfiguration` 394 · `sauvegardeCourante` 587 · `telechargeSauvegarde` 609
`appliqueSauvegarde` 632 · `litSauvegarde` 666 · `brancheSauvegarde` 688

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

### `_sponsor.html` — 571 l. → plan-admin.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 96 · `secondesSponsor` 99 · `modeSponsor` 112 · `sponsorRetenu` 131
`cleSponsor` 162 · `sponsorEnCache` 165 · `retientSponsor` 180 · `ouvreSponsor` 205
`suitSponsor` 297 · `resteSponsor` 322 · `fermeSponsor` 328 · `accueilleSponsor` 344
`blocSponsor` 413

### `_suggestion.html` — 685 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationsSugg` 83 · `presenteSugg` 89
`critereSugg` 94 · `indexSugg` 106 · `valeursSugg` 131 · `suggestionCourante` 150
`exposantPropose` 186 · `nomValeurSugg` 204 · `phraseSuggestion` 225 · `carteSuggestion` 253
`poseSuggestion` 302 · `fenetreSuggestion` 316 · `relevePalmares` 356 · `etiquetteSugg` 376
`voletSuggestion` 386

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

## Le reste

- `src/index.mjs` — 893 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 100 · `amontPour` 109 · `cleDe` 117 · `cleDeLot` 123 · `condense` 130 `cleVersion` 154 · `rangeLaVersion` 157 · `ditVersion` 165 · `meta` 174 · `gardable` 190 `range` 196 · `rafraichit` 203 · `entete` 238 · `oublie` 280 · `rappels` 366 · `cleApp` 411 `cheminDuSalon` 442 · `pageDuSalon` 459 · `appDuSalon` 483 · `iconesDuSalon` 529 `manifeste` 569 · `iconeApp` 658 · `mesure` 679 · `planDeVisite` 715 · `chargePrevue` 753
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
