<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 4238 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.3165 · 10. Mode administration
- l.3273 · La fiche d'une zone organisateur
- l.3982 · Masquer une zone organisateur
- l.4065 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 97
`appliqueCouleursData` 103 · `styleData` 135 · `appliqueApparence` 141
`appliqueCommandes` 203 · `optionActive` 300 · `programmeOffert` 305
`suggestionOfferte` 306 · `appliqueOptions` 308 · `chercheSorte` 376 · `voletRecherche` 379
`minutesVisite` 436 · `lueHeure` 463 · `lueDate` 467 · `datesSalon` 474
`horairesSalon` 488 · `salonPartage` 501 · `presseNuanciers` 532 · `suitNuancier` 548
`trio` 576 · `melange` 586 · `appliqueAccent` 600 · `appliqueFond` 634 · `modeleRetenu` 672
`policeChoisie` 828 · `policeDuModele` 833 · `feuillePolice` 843 · `chargePolice` 865
`policePrete` 885 · `policeDesNoms` 903 · `posePoliceLibelles` 932 · `appliqueModele` 964
`habilleModale` 1008 · `texteCorps` 1080 · `clesPortees` 1105 · `standApercu` 1125
`lignesApercu` 1149 · `contenuApercu` 1179 · `apercuFiche` 1216 · `apercuListe` 1294
`apercuDuo` 1316 · `glisseFenetre` 1349 · `ouvreReglages` 1360 · `voletZones` 1468
`champsFicheZone` 1570 · `ficheZoneEnPlace` 1640 · `voletPlan` 1658 · `blocRappel` 1706
`ditEssaiRappel` 1810 · `voletAdmin` 1835 · `blocOptions` 2018 · `blocHoraires` 2066
`sallesSituees` 2199 · `voletPmr` 2215 · `nomDuTon` 2306 · `voletApparence` 2311
`clesFiche` 2510 · `voletOrdre` 2527 · `enregistreConf` 3114 · `rgbHex` 3121 · `hexa` 3128
`luminance` 3132 · `ecarte` 3146 · `joli` 3161 · `retireAdmin` 3182 · `activeAdmin` 3195
`champZone` 3299 · `champsZone` 3324 · `champSalles` 3416 · `nomDeZone` 3468
`reduitLogo` 3502 · `cadreLogo` 3545 · `champLogo` 3617 · `editeurRiche` 3655
`memeFicheZone` 3812 · `suitFicheZone` 3819 · `verseFicheZone` 3827 · `ficheZone` 3853
`enregistreZone` 3878 · `basculeAffichageZone` 3993 · `marqueZonesMasquees` 4010
`ecritColonnesEvenement` 4030 · `ecritColonneEvenement` 4061 · `cleLibelle` 4086
`empreinteLibelle` 4102 · `placementLibelle` 4110 · `posePlacement` 4120
`libelleAutomatique` 4137 · `modePlacementLibelles` 4146 · `majPaletteLibelle` 4165
`choisitLibelle` 4182 · `pousseLibelle` 4189 · `libellePointerDown` 4197
`libellePointerMove` 4213 · `libellePointerUp` 4222

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

### `_auth-plan.html` — 201 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 128 · `mailDuJeton` 135 · `litProfilA` 146
`initialesDe` 159 · `poseCompte` 166

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

### `_console-js.html` — 3262 l. → admin-plans.html

- l.959 · Provenance des données
- l.1086 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 424 · `slugifie` 438
`courant` 442 · `charge` 444 · `chargePlans` 459 · `majEvenement` 464 · `selonAdresse` 484
`majAdresse` 492 · `majBarre` 507 · `dessineChoix` 549 · `champ` 569 · `reduitIcone` 623
`champFavicon` 664 · `fuseauConnu` 760 · `champFuseau` 772 · `dessineFiche` 835
`fournisseurUtilise` 1021 · `source` 1025 · `champCle` 1030 · `ligneSource` 1065
`paraitSurFiche` 1199 · `origineConferences` 1205 · `resumeProvenance` 1270
`resumeFiche` 1287 · `caseFiche` 1332 · `cibleEn` 1380 · `champsPersos` 1382
`criteres` 1388 · `ecritFiche` 1391 · `caseCritere` 1406 · `clePerso` 1425
`ajouteChampPerso` 1433 · `renommeChampPerso` 1451 · `retireChampPerso` 1499
`lignesPerso` 1560 · `ligneOutil` 1581 · `ligneReglage` 1597 · `ouvreProvenance` 1609
`ouvreSources` 1632 · `cadreFiche` 1684 · `ouvreFiche` 1714 · `cadreCategories` 1854
`sousTitre` 1933 · `tableauChamps` 1948 · `encode` 2108 · `decode` 2110
`correspondance` 2115 · `sansPrefixe` 2118 · `courte` 2119 · `intitule` 2134
`intituleSuite` 2146 · `separeValeurs` 2160 · `aplani` 2181 · `memeStyle` 2191
`autreFace` 2209 · `champOrigine` 2225 · `majLiens` 2493 · `majIntegration` 2530
`majMsgSync` 2537 · `etapesPressenties` 2567 · `suitAuServeur` 2616 · `synchronise` 2658
`fabriqueLesVignettes` 2755 · `envoieVignettes` 2808 · `dupliquer` 2817
`litMonProfil` 2917 · `RETOUR_MDP` 2928 · `litComptes` 2930 · `ligneMessage` 2939
`casesSalons` 2949 · `ouvreComptes` 2979 · `ouvreFicheCompte` 3071 · `videEcran` 3230
`dessine` 3235 · `demarre` 3250

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 714 l. → console.css

- l.655 · Page de rapport

### `_dessin.html` — 2422 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `dejaPubliee` 138 · `marqueAttente` 144 · `mesCalques` 152
`enregistreDessins` 153 · `instantane` 187 · `memorise` 188 · `restaure` 193 · `annule` 202
`refais` 214 · `trouveCalque` 216 · `nouvelId` 217 · `cheminArrondi` 235 · `estCadre` 278
`cheminForme` 280 · `styleTrait` 300 · `longueurFleche` 326 · `cheminFleche` 333
`marqueFleche` 362 · `rafraichitFleches` 373 · `poseTrait` 389 · `traceForme` 399
`dessineDessins` 414 · `redessineForme` 455 · `peintCalque` 479 · `versPlan` 485
`apercu` 491 · `apercuGuide` 503 · `toleranceTrace` 527 · `aimanteContour` 532
`rayonContour` 535 · `redresseTrace` 554 · `traceGuide` 588 · `fermeIci` 595
`ajouteForme` 600 · `pictoDe` 727 · `nomTypeRepereFr` 783 · `nomTypeRepere` 785
`typeZone` 815 · `pictoForme` 822 · `estPorte` 842 · `ouvreEntrant` 843 · `ouvreSortant` 844
`modeDit` 879 · `lettreMode` 880 · `estTransport` 884 · `modeTransport` 887
`glypheRepere` 899 · `cleLigne` 936 · `ligneAffichee` 947 · `couleurLigne` 955
`couleurRepere` 961 · `encreRepere` 967 · `nomLigneFr` 981 · `libelleDoffice` 989
`couleurEcrite` 996 · `traceRepere` 1015 · `nomSurLePlan` 1128 · `etiquetteSociete` 1139
`seRattache` 1167 · `societeDeForme` 1179 · `societesDuPlan` 1191
`remplitListeSocietes` 1206 · `societeSaisie` 1214 · `traceImage` 1241
`traceStandDessine` 1266 · `texteStandDessine` 1290 · `poseLibellesDessines` 1308
`decoupeStand` 1329 · `marqueStandsDessines` 1341 · `rafraichitStandsDessines` 1356
`oublieReperes` 1386 · `reperesCherchables` 1388 · `vaAuRepere` 1432 · `clePoi` 1475
`pastillePoi` 1484 · `cartouchePoi` 1488 · `ouvrePoi` 1607 · `mesureCartouche` 1679
`pharePoi` 1695 · `phareRepere` 1699 · `phareZone` 1701 · `eclairePoi` 1707
`oublieChoixPoi` 1740 · `signale` 1749 · `calquePourImage` 1763 · `lienImageSaisi` 1791
`formeImage` 1802 · `poseImage` 1811 · `ditImagePosee` 1833 · `importeImage` 1841
`dessinPointerDown` 1892 · `dessinPointerMove` 1977 · `dessinPointerUp` 2015
`termineTrace` 2056 · `aide` 2068 · `outilOffert` 2097 · `choisitOutil` 2100
`enchaineStand` 2131 · `optionsModes` 2161 · `proposeCouleurLigne` 2172
`montreTransport` 2183 · `activeCalque` 2237 · `cleVerrou` 2295 · `verrouille` 2296
`basculeVerrou` 2298 · `pictoVerrou` 2315 · `montreRoleIti` 2349 · `creeCalque` 2380
`demandeNom` 2393 · `renommeCalque` 2412

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

### `_environs.html` — 1552 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`metresParDegre` 43 · `tourneEnvirons` 60 · `versTerre` 66 · `versLePlan` 73 · `reancre` 88
`empriseDesPavillons` 97 · `centreDesPavillons` 110 · `styleSobre` 187 · `forceCarte` 281
`calageCourant` 293 · `fondCourant` 296 · `recul` 301 · `pixelsMercator` 306
`latitudeDePixel` 315 · `metresParPixel` 323 · `echelleDesTuiles` 341
`niveauDesTuiles` 353 · `adresseTuile` 360 · `tuilesDeLaVue` 370 · `chargeMapLibre` 435
`vueGL` 466 · `styleDuFond` 486 · `guetteLaCarte` 514 · `poseCarteGL` 525
`diagnostiqueGL` 607 · `relanceCarteGL` 627 · `videCarteGL` 639 · `dessineFondCarte` 655
`cleMasqueCarte` 751 · `masqueCarte` 752 · `basculeMasqueCarte` 754
`boutonMasqueCarte` 765 · `pictoMasque` 776 · `formesMasquantes` 788 · `cheminDuHall` 810
`poseMasqueCarte` 829 · `carreDeTerrain` 863 · `chercheBatiments` 879 · `aireDuContour` 906
`centreDuContour` 915 · `axeDuContour` 928 · `empriseDesObjets` 945
`batimentsCandidats` 963 · `caleSurBatiment` 984 · `retientLeHall` 1010
`manqueCalage` 1032 · `enregistreCalage` 1041 · `calageEnregistre` 1054
`litCoordonnees` 1079 · `rafraichitCarte` 1093 · `armeCalage` 1135 · `pivotCalage` 1146
`glisseCarte` 1150 · `cartePointerDown` 1157 · `cartePointerMove` 1171
`cartePointerUp` 1190 · `ditCalage` 1198 · `ditCarte` 1207 · `majCalage` 1215
`appliqueCalage` 1230 · `tourneCalage` 1237 · `construitCalage` 1243 · `ouvreCalage` 1391
`fermeCalage` 1400 · `voletEnvirons` 1428

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_geometrie.html` — 647 l. → plan-admin.html, plan-smcl.html, plan.html

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
`majPaletteGeo` 438 · `finGesteGeo` 468 · `enregistreGeo` 478 · `geometrieOrigine` 491
`retraceGeo` 506 · `pousseGeometrie` 517 · `appliqueDimensionGeo` 534
`geometriePointerDown` 551 · `accrocheGeo` 581 · `geometriePointerMove` 583
`geometriePointerUp` 633

### `_head.html` — 5167 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands`
`#nExpo` · `#nZones` · `#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers`
`#btnReglages` · `#btnLangue` · `#menuCompte` · `#avatarCompte` · `#compteMail`
`#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q`
`#videQ` · `#btnFiltres` · `#nFiltres` · `#panCrit` · `#critCorps` · `#critPied`
`#critVider` · `#critVoir` · `#actifs` · `#count` · `#countTxt` · `#list` · `#piedSide`
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
`#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur`
`#elemStyle` · `#elemFleche` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg`
`#libNom` · `#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#geoReg` · `#geoNom`
`#geoFerme` · `#geoDim` · `#geoLargeur` · `#geoHauteur` · `#geoOrigine` · `#geoAide`
`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile`
`#detail` · `#poigneeFiche` · `#dMarque` · `#closeDetail` · `#dKind` · `#dNeuf` · `#dName`
`#dRen` · `#dLogo` · `#dBadges` · `#dCode` · `#dVis` · `#dPartage` · `#dOnglets`
`#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours` · `#poigneeParcours`
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

### `_itineraire.html` — 3045 l. → plan-admin.html, plan-smcl.html, plan.html

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
`candidats` 1860 · `pointSaisi` 1886 · `portesDe` 1904 · `versPorte` 1911
`typeLiaison` 1972 · `nomRepere` 1980 · `oublieLiaisons` 1998 · `lienEcrits` 2010
`ecritLiens` 2019 · `annuaireLiaisons` 2024 · `liensDe` 2056 · `coutLiaison` 2076
`passagePraticable` 2083 · `passagesDe` 2091 · `sortiesDe` 2101 · `plansRelies` 2109
`balayage` 2133 · `distanceDepuis` 2147 · `cheminLiaisons` 2174 · `routeParLiaisons` 2258
`routeEntre` 2294 · `calculeRoute` 2333 · `couleurNappe` 2359 · `rafraichitApercu` 2365
`marchesIci` 2408 · `rayonBout` 2413 · `dessineItineraire` 2418 · `rafraichitBouts` 2462
`cadreItineraire` 2485 · `champIti` 2509 · `ecritDistance` 2513 · `ecritDuree` 2521
`fermeSugg` 2526 · `montreSugg` 2533 · `choisitPoint` 2567 · `valideSaisie` 2576
`effaceItineraire` 2588 · `relance` 2615 · `phraseLiaison` 2666 · `montreResultat` 2680
`bandeauVisee` 2822 · `armeVisee` 2845 · `finVisee` 2863 · `viseItineraire` 2879
`visePoi` 2885 · `visePoint` 2891 · `ouvreItineraire` 2923 · `fermeItineraire` 2951
`versItineraire` 2961 · `versItineraireDe` 2964

### `_journee.html` — 2136 l. → plan-admin.html, plan-smcl.html, plan.html

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
`perimeJournee` 1656 · `oublieSejour` 1671 · `ouvreOrganisation` 1686 · `essaieSejour` 2067
`lanceSejour` 2094 · `refaitSejour` 2126

### `_js.html` — 4767 l. → plan-admin.html, plan-smcl.html, plan.html

- l.79 · 1. Index global — la recherche porte sur tous les pavillons
- l.516 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.626 · 3. Rendu du pavillon courant
- l.710 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.846 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.2064 · 6. Vue
- l.2490 · 7. Sélection et fiche
- l.3853 · 8. Interactions du plan
- l.4281 · Ce que les tiroirs lisent d'un geste
- l.4327 · Le tiroir de la liste — écrans étroits
- l.4549 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`$` 15 · `esc` 17 · `cheminDuSalon` 35 · `cheminPartageable` 46 · `P` 76 · `nomDeLaZone` 96
`nomsAnglaisDesZones` 98 · `indexe` 106 · `chronoConf` 303 · `confsDuPlan` 308
`indexeConferences` 326 · `rangeConferences` 404 · `poseFavicon` 451
`poseTonDeLaBarre` 493 · `largeur` 521 · `decoupe` 546 · `habille` 559 · `lignesSvg` 570
`coexComptes` 587 · `coexChoisit` 588 · `ligneCode` 604 · `monteHabillage` 632
`montePlan` 649 · `onglets` 686 · `changePlan` 702 · `ancre` 718 · `place` 719
`libelles` 721 · `decaleLibelle` 802 · `facteurLibelle` 803 · `libelleForce` 804
`libelleZone` 807 · `libelleEmplacement` 826 · `indexeSecteurs` 867 · `secteursMontres` 880
`couleurConf` 884 · `hslHex` 888 · `couleurSecteur` 905 · `BANDES` 926 · `majFondus` 934
`pastilleSecteur` 972 · `coloreSecteurs` 985 · `peintSecteur` 1036 · `appliqueSecteurs` 1049
`filtreTheme` 1066 · `themeFiltrable` 1144 · `clesCriteres` 1160 · `libelleCritere` 1167
`separeValeurs` 1175 · `valeursCritere` 1192 · `texteCriteres` 1205
`texteAnglaisPerso` 1221 · `indexeCriteres` 1235 · `dansCriteres` 1262 · `critereActif` 1270
`basculeCritere` 1272 · `videCriteres` 1281 · `majVideQ` 1290 · `videRecherche` 1303
`nCriteres` 1318 · `majCriteres` 1333 · `remplitCriteres` 1400 · `basculeCriteres` 1539
`ouvreCriteres` 1544 · `fermeCriteres` 1560 · `filtre` 1577 · `reposeRetrait` 1597
`critParSociete` 1601 · `cherchable` 1611 · `visible` 1618 · `releveHotes` 1634
`visibleSurPlan` 1642 · `visibleSociete` 1653 · `marqueRetrait` 1669 · `appliqueFiltre` 1681
`oublieRetrait` 1693 · `reprendRecherche` 1702 · `rangSorte` 1715 · `codeCase` 1737
`caseNumero` 1754 · `sousLigne` 1774 · `liste` 1788 · `marqueChoisie` 1907
`prechargeMarque` 1933 · `prechargeLesVignettes` 1990 · `chargeUnLot` 2036
`cadrePlan` 2079 · `oublieCadre` 2080 · `figeTextes` 2096 · `rendTextes` 2104
`cadrage` 2140 · `peintLibelles` 2145 · `detacheLibelles` 2151 · `rattacheLibelles` 2163
`etireLibelles` 2181 · `appliqueVue` 2189 · `rafraichitVue` 2233 · `poseVue` 2247
`mesureBarre` 2276 · `masqueHaut` 2300 · `masque` 2307 · `masqueDroite` 2339 · `fit` 2350
`stoppeZoom` 2383 · `glisseVersVise` 2389 · `glisseVers` 2431 · `rectVisee` 2453
`zoom` 2473 · `echelle` 2482 · `ETROIT` 2496 · `anime` 2512 · `noeud` 2536
`canalPlan` 2546 · `rangSociete` 2554 · `select` 2563 · `centre` 2588 · `centrePoint` 2592
`montre` 2637 · `libelleCorps` 2669 · `ordreCorps` 2686 · `groupesFiche` 2718
`montreIntitule` 2731 · `valeurCorps` 2751 · `champCorps` 2764 · `groupeCorps` 2776
`corpsRange` 2789 · `momentLocal` 2824 · `programme` 2847 · `jourLong` 2880
`ficheConf` 2891 · `lien` 3038 · `adresseWeb` 3046 · `pictoRS` 3089 · `adresseSure` 3107
`adresseVignette` 3138 · `adresseImage` 3156 · `imageSure` 3169 · `assainitRiche` 3198
`enBlocs` 3238 · `rangeRiche` 3251 · `ecarteClicFantome` 3279 · `nomSociete` 3288
`societes` 3301 · `choisitExposant` 3312 · `poseMarque` 3350 · `montreMarque` 3410
`poseCode` 3433 · `rangeMarque` 3474 · `ouvre` 3537 · `ferme` 3825 · `onglet` 3843
`milieu` 3873 · `commencePince` 3879 · `suitPince` 3893 · `plieLesBandes` 3946
`saisitPlan` 3960 · `cibleElargie` 4042 · `planifieFiltre` 4237 · `traceurDeGeste` 4305
`cranVoisin` 4324 · `retraitBas` 4350 · `mesureTiroir` 4364 · `montreTiroir` 4367
`hisseTiroir` 4371 · `tiroirCrante` 4576

Éléments :

`#data` · `#dGo` · `#dItin`

### `_langue.js` — 712 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_marque.html` — 281 l. → admin-plans.html, plan-admin.html, plan-smcl.html, plan.html

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 55 · `recadreMarque` 59 · `marqueRecadree` 85 · `imageChargee` 114
`vignetteMarque` 130 · `boiteMarque` 156 · `toileMarque` 222 · `vignetteDeLogo` 246

### `_mesure.html` — 622 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 61 · `jetonMesure` 64 · `jourIso` 103 · `echeanceMesure` 104
`jetonRetenu` 128 · `supportMesure` 177 · `renouvelleVisiteur` 228 · `fraisEnFile` 295
`litLaFile` 299 · `ecritLaFile` 312 · `metEnFile` 327 · `retireDeLaFile` 338
`chargeDe` 349 · `envoiePaquet` 362 · `beaconne` 387 · `pousseLaFile` 408
`envoieMesures` 427 · `mesure` 464 · `effaceJetonsVisiteur` 530 · `refuseMesure` 548
`ouvreConfidentialite` 568

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

### `_parcours.html` — 700 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 63 · `casierParcours` 66 · `dansParcours` 67 · `jourParcours` 70
`attenduDepuisTropLongtemps` 75 · `trieParcours` 86 · `chargeParcours` 96
`parcoursAEcrire` 126 · `enregistreParcours` 140 · `tientLeStockage` 169
`basculeParcours` 190 · `verseAuParcours` 235 · `plurielParcours` 254
`contenuParcours` 263 · `retenusPourParcours` 289 · `ajouteToutAuParcours` 314
`poseToutAuParcours` 337 · `signetParcours` 363 · `boutonParcours` 369
`rafraichitMarque` 374 · `brancheParcours` 387 · `calqueMarques` 419 · `dessineMarques` 435
`marqueParcours` 465 · `rafraichitParcours` 479 · `instantConf` 507 · `cleTemps` 511
`jourCourt` 517 · `nomDeStand` 524 · `rangParcours` 526 · `groupeParcours` 546
`remplitParcours` 555 · `ouvreParcours` 644 · `fermeParcours` 656 · `videLeParcours` 672

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

### `_pousse.html` — 631 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration
- l.502 · La sauvegarde emportée

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`compteRescapes` 110 · `ditAlerte` 123 · `ditEtat` 167 · `programmeEnvoi` 174
`programmePublication` 188 · `rattrapeRetard` 195 · `envoie` 200 · `presse` 213
`resteSession` 247 · `renouvelleSession` 263 · `base` 287 · `identifiants` 335
`reglagesSeuls` 350 · `oublieCache` 361 · `pousseConfiguration` 380
`sauvegardeCourante` 522 · `telechargeSauvegarde` 544 · `appliqueSauvegarde` 567
`litSauvegarde` 601 · `brancheSauvegarde` 623

### `_rappels.html` — 644 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 sexies. Le rappel avant une conférence

Fonctions :

`reglageRappel` 63 · `rappelsVoulus` 64 · `minutesRappel` 65 · `cleRappels` 78
`chargeRappels` 81 · `retientRappels` 85 · `poussePossible` 94 · `rappelsOfferts` 100
`iOSsansInstallation` 106 · `instantAbsolu` 135 · `confsARappeler` 151 · `heureVue` 175
`empreinteDebut` 176 · `rappelsDuParcours` 187 · `adresseDuRappel` 210 · `octetsDeCle` 222
`abonnementCourant` 230 · `abonne` 239 · `synchroniseRappels` 265 · `eteintRappels` 288
`allumeRappels` 303 · `aideRappel` 320 · `poseRappels` 336 · `cleInviteRappel` 457
`inviteRappelFaite` 460 · `retientInviteRappel` 465 · `fenetreRappel` 500
`proposeRappels` 533 · `essaieRappelReel` 595 · `reprendRappels` 633

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 443 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`courant` 52 · `chargeEvenements` 57 · `joursPeriode` 75 · `chargeRapport` 77 · `chiffre` 88
`barres` 107 · `portes` 147 · `jours` 198 · `dessineRapport` 219 · `dessineBarre` 371
`rafraichit` 394 · `videEcran` 413 · `demarre` 429

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

### `_tutoriel.html` — 895 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 17. La visite guidée — le tour du plan, geste par geste

Fonctions :

`reglageTuto` 52 · `tutoPropose` 61 · `cleTuto` 65 · `tutoOuvert` 67 · `tutoModale` 68
`tutoFicheOuverte` 74 · `tutoFiche` 77 · `tutoParcours` 79 · `tutoItineraire` 82
`tutoJournee` 86 · `zoneDuTuto` 94 · `insecable` 111 · `phraseTrajetTuto` 117
`chapitresTuto` 373 · `proposeTutoriel` 393 · `lanceTutoriel` 451 · `quitteTutoriel` 537
`chapitreTuto` 548 · `battementTuto` 557 · `finTuto` 575 · `afficheTuto` 592 · `pxTuto` 647
`boiteTuto` 650 · `repereTuto` 664 · `rameneTuto` 697 · `placeTuto` 735 · `voileTuto` 812
`rafaleTuto` 829 · `marqueZoneTuto` 849 · `marqueLibelleTuto` 884

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `_webgl.html` — 1388 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 179 · `guetteContexteWebgl` 185
`contextePerduWebgl` 195 · `verifieContexteWebgl` 202 · `perdContexteWebgl` 211
`remonteWebgl` 232 · `vueDeck` 249 · `vueWebgl` 258 · `blocDe` 267 · `enEdition` 297
`majEditionWebgl` 301 · `cleBloc` 313 · `planifieWebgl` 339 · `toutRepeindreWebgl` 343
`blocsDansLOrdre` 350 · `repeintWebgl` 355 · `assembleWebgl` 379 · `constTexte` 413
`jeuDeCaracteres` 493 · `couchesTexte` 504 · `mulM` 538 · `appM` 541 · `echelleM` 542
`lisTransform` 544 · `lisTrace` 566 · `lisPoints` 634 · `num` 640 · `anneau` 642
`rectArrondi` 648 · `couleurGl` 662 · `accVide` 679 · `convertitBloc` 680 · `accDe` 696
`parcoursGl` 703 · `avecTrous` 743 · `formeGl` 764 · `texteGl` 800 · `imageGl` 823
`partage` 855 · `designeGl` 861 · `couchesDeBloc` 863 · `modelesLibellesHtml` 924
`poseModelesLibelles` 934 · `lisModelesLibelles` 940 · `emplacementWebgl` 969
`libellesWebgl` 1017 · `groupesNoms` 1080 · `couchesNoms` 1096 · `couchesPastilles` 1107
`couchesLibellesWebgl` 1122 · `couchesDessineesWebgl` 1129 · `stage` 1150
`brancheSurvolWebgl` 1154 · `poseSurvolWebgl` 1174 · `poseCurseurWebgl` 1183
`poseFocusWebgl` 1192 · `aplatsDe` 1199 · `coucheSurvol` 1202 · `coucheFocus` 1211
`couchesPhare` 1238 · `lueurDe` 1254 · `opacitePhare` 1292 · `echellePhare` 1293
`couchesPhareNoms` 1296 · `animeCouche` 1310 · `majAnimationWebgl` 1324 · `animeWebgl` 1332
`objetSous` 1355 · `cibleWebgl` 1362 · `priseWebgl` 1369 · `libelleSousWebgl` 1374
`rectEcranWebgl` 1379

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 532 l.

`valeursDe` 327

### `supabase/functions/_partage/eventmaker.ts` — 1093 l.

`grapheJson` 204 · `enParallele` 901 · `texteSeul` 921 · `champs` 1058

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

### `supabase/functions/plan-public/index.ts` — 1027 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 488 · `ampute` 512 · `masquesDe` 555 · `masquesDuPlan` 575

### `supabase/functions/sync-evenement/index.ts` — 1751 l.

`cors` 42 · `bourre` 111 · `client` 121 · `ecrit` 143 · `gaia` 151 · `libellesChoix` 162
`retiensAnglais` 189 · `fournisseur` 207 · `raccourci` 215 · `enClair` 252 · `range` 278
`champsKlipso` 299 · `hebergee` 1707 · `nettoieUrl` 1727 · `groupeTextes` 1737

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
