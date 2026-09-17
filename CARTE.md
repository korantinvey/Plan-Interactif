<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 4158 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.3088 · 10. Mode administration
- l.3193 · La fiche d'une zone organisateur
- l.3902 · Masquer une zone organisateur
- l.3985 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 97
`appliqueCouleursData` 103 · `styleData` 135 · `appliqueApparence` 141
`appliqueCommandes` 203 · `optionActive` 300 · `programmeOffert` 305
`suggestionOfferte` 306 · `appliqueOptions` 308 · `chercheSorte` 376 · `voletRecherche` 379
`minutesVisite` 436 · `lueHeure` 463 · `lueDate` 467 · `datesSalon` 474
`horairesSalon` 488 · `salonPartage` 501 · `presseNuanciers` 532 · `suitNuancier` 548
`trio` 576 · `melange` 586 · `appliqueAccent` 600 · `appliqueFond` 626 · `modeleRetenu` 664
`policeChoisie` 820 · `policeDuModele` 825 · `feuillePolice` 835 · `chargePolice` 857
`policePrete` 877 · `policeDesNoms` 895 · `posePoliceLibelles` 924 · `appliqueModele` 956
`habilleModale` 997 · `texteCorps` 1068 · `standApercu` 1083 · `lignesApercu` 1107
`contenuApercu` 1133 · `apercuFiche` 1170 · `apercuListe` 1248 · `apercuDuo` 1270
`glisseFenetre` 1303 · `ouvreReglages` 1314 · `voletZones` 1422 · `champsFicheZone` 1524
`ficheZoneEnPlace` 1594 · `voletPlan` 1612 · `blocRappel` 1660 · `ditEssaiRappel` 1764
`voletAdmin` 1789 · `blocOptions` 1972 · `blocHoraires` 2020 · `sallesSituees` 2153
`voletPmr` 2169 · `nomDuTon` 2260 · `voletApparence` 2265 · `clesFiche` 2464
`voletOrdre` 2481 · `enregistreConf` 3037 · `rgbHex` 3044 · `hexa` 3051 · `luminance` 3055
`ecarte` 3069 · `joli` 3084 · `retireAdmin` 3105 · `activeAdmin` 3118 · `champZone` 3219
`champsZone` 3244 · `champSalles` 3336 · `nomDeZone` 3388 · `reduitLogo` 3422
`cadreLogo` 3465 · `champLogo` 3537 · `editeurRiche` 3575 · `memeFicheZone` 3732
`suitFicheZone` 3739 · `verseFicheZone` 3747 · `ficheZone` 3773 · `enregistreZone` 3798
`basculeAffichageZone` 3913 · `marqueZonesMasquees` 3930 · `ecritColonnesEvenement` 3950
`ecritColonneEvenement` 3981 · `cleLibelle` 4006 · `empreinteLibelle` 4022
`placementLibelle` 4030 · `posePlacement` 4040 · `libelleAutomatique` 4057
`modePlacementLibelles` 4066 · `majPaletteLibelle` 4085 · `choisitLibelle` 4102
`pousseLibelle` 4109 · `libellePointerDown` 4117 · `libellePointerMove` 4133
`libellePointerUp` 4142

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 271 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 113 · `panneDuChargement` 160
`CLE_VERSION` 170 · `versionRetenue` 171 · `retientVersion` 174 · `demandePlan` 198
`charge` 222

### `_aimants.html` — 484 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 15 · `coteCadre` 19 · `montreCote` 31 · `aimantsActifs` 59 · `axesDe` 63
`pointsAimants` 68 · `oublieAimantsDuPlan` 88 · `aimantsDuPlan` 90 · `pasAimant` 123
`cale` 131 · `sousLeGeste` 136 · `cranGrille` 147 · `oublieAimants` 164
`aimantsDessines` 166 · `coinsGeste` 192 · `montreAimants` 214 · `meilleurSommet` 279
`croixAimant` 293 · `correction` 317 · `aimante` 358 · `retientTaille` 372
`reprendTaille` 386 · `dupliqueForme` 407 · `pousseForme` 432 · `ecritDimensions` 448
`appliqueDimension` 467

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

### `_batiments.html` — 367 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 25 · `bibliothequeDispo` 26 · `batimentsPoses` 33 · `poseCalage` 40
`ouvreBibliotheque` 49 · `vueDuLieu` 132 · `lanceCalage` 172 · `cadreCalage` 200
`finCalage` 213 · `pivoteCalage` 223 · `degresCalage` 232 · `dessineCalage` 234
`calagePointerDown` 257 · `calagePointerMove` 270 · `calagePointerUp` 286
`ajouteBatiments` 296 · `mentionOsm` 362

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

### `_console-js.html` — 3113 l. → admin-plans.html

- l.937 · Provenance des données
- l.1064 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 402 · `slugifie` 416
`courant` 420 · `charge` 422 · `chargePlans` 437 · `majEvenement` 442 · `selonAdresse` 462
`majAdresse` 470 · `majBarre` 485 · `dessineChoix` 527 · `champ` 547 · `reduitIcone` 601
`champFavicon` 642 · `fuseauConnu` 738 · `champFuseau` 750 · `dessineFiche` 813
`fournisseurUtilise` 999 · `source` 1003 · `champCle` 1008 · `ligneSource` 1043
`paraitSurFiche` 1175 · `origineConferences` 1181 · `resumeProvenance` 1246
`resumeFiche` 1263 · `caseFiche` 1308 · `champsPersos` 1350 · `criteres` 1356
`ecritFiche` 1359 · `caseCritere` 1374 · `clePerso` 1393 · `ajouteChampPerso` 1401
`renommeChampPerso` 1419 · `retireChampPerso` 1467 · `lignesPerso` 1525 · `ligneOutil` 1545
`ligneReglage` 1561 · `ouvreProvenance` 1573 · `ouvreSources` 1596 · `cadreFiche` 1648
`ouvreFiche` 1678 · `cadreCategories` 1816 · `sousTitre` 1895 · `tableauChamps` 1910
`encode` 2053 · `decode` 2055 · `correspondance` 2060 · `sansPrefixe` 2063 · `courte` 2064
`intitule` 2079 · `intituleSuite` 2091 · `separeValeurs` 2105 · `aplani` 2126
`memeStyle` 2136 · `autreFace` 2154 · `champOrigine` 2170 · `majLiens` 2437
`majIntegration` 2474 · `majMsgSync` 2481 · `etapesPressenties` 2511 · `synchronise` 2525
`fabriqueLesVignettes` 2606 · `envoieVignettes` 2659 · `dupliquer` 2668
`litMonProfil` 2768 · `RETOUR_MDP` 2779 · `litComptes` 2781 · `ligneMessage` 2790
`casesSalons` 2800 · `ouvreComptes` 2830 · `ouvreFicheCompte` 2922 · `videEcran` 3081
`dessine` 3086 · `demarre` 3101

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 706 l. → console.css

- l.647 · Page de rapport

### `_dessin.html` — 2044 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `dejaPubliee` 138 · `marqueAttente` 144 · `mesCalques` 152
`enregistreDessins` 153 · `instantane` 187 · `memorise` 188 · `restaure` 193 · `annule` 202
`refais` 214 · `trouveCalque` 216 · `nouvelId` 217 · `cheminArrondi` 235 · `estCadre` 278
`cheminForme` 280 · `styleTrait` 300 · `longueurFleche` 326 · `cheminFleche` 333
`marqueFleche` 362 · `rafraichitFleches` 373 · `poseTrait` 389 · `dessineDessins` 397
`peintCalque` 439 · `versPlan` 445 · `apercu` 451 · `apercuGuide` 463 · `toleranceTrace` 487
`aimanteContour` 492 · `rayonContour` 495 · `redresseTrace` 514 · `traceGuide` 548
`fermeIci` 555 · `ajouteForme` 560 · `pictoDe` 660 · `nomTypeRepereFr` 711
`nomTypeRepere` 712 · `typeZone` 738 · `pictoForme` 745 · `estPorte` 765
`ouvreEntrant` 766 · `ouvreSortant` 767 · `traceRepere` 781 · `nomSurLePlan` 850
`etiquetteSociete` 861 · `seRattache` 889 · `societeDeForme` 901 · `societesDuPlan` 913
`remplitListeSocietes` 928 · `societeSaisie` 936 · `traceImage` 963
`traceStandDessine` 988 · `texteStandDessine` 1012 · `poseLibellesDessines` 1030
`decoupeStand` 1051 · `marqueStandsDessines` 1063 · `rafraichitStandsDessines` 1078
`oublieReperes` 1108 · `reperesCherchables` 1110 · `vaAuRepere` 1154 · `clePoi` 1189
`cartouchePoi` 1191 · `ouvrePoi` 1295 · `mesureCartouche` 1367 · `phareRepere` 1383
`phareZone` 1385 · `eclairePoi` 1391 · `oublieChoixPoi` 1424 · `signale` 1433
`calquePourImage` 1447 · `lienImageSaisi` 1475 · `formeImage` 1486 · `poseImage` 1495
`ditImagePosee` 1517 · `importeImage` 1525 · `dessinPointerDown` 1576
`dessinPointerMove` 1650 · `dessinPointerUp` 1688 · `termineTrace` 1729 · `aide` 1741
`outilOffert` 1770 · `choisitOutil` 1773 · `enchaineStand` 1804 · `activeCalque` 1859
`cleVerrou` 1917 · `verrouille` 1918 · `basculeVerrou` 1920 · `pictoVerrou` 1937
`montreRoleIti` 1971 · `creeCalque` 2002 · `demandeNom` 2015 · `renommeCalque` 2034

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 484 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 176 · `ecritDesDeuxCotes` 198
`changeLien` 210 · `changeDureeLien` 226 · `majLiens` 243 · `appliqueSociete` 295
`appliqueTexte` 311 · `appliqueRayon` 321 · `appliqueTrait` 333 · `appliquePicto` 351
`supprimeForme` 366 · `editionPointerDown` 376 · `editionPointerMove` 422
`editionPointerUp` 474

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

### `_head.html` — 4632 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands`
`#nExpo` · `#nZones` · `#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers`
`#btnReglages` · `#btnLangue` · `#menuCompte` · `#avatarCompte` · `#compteMail`
`#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q`
`#videQ` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#count` · `#countTxt` · `#list`
`#piedSide` · `#btnConfidentialite` · `#stage` · `#fondCarteGL` · `#fondTuiles`
`#fondCarte` · `#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels`
`#calqueLibelles` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#creditCarte`
`#mentionOsm` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#calageBat`
`#calageAngle` · `#calageQuart` · `#calageStop` · `#calageValide` · `#iciRappel`
`#iciRappelTxt` · `#iciStop` · `#bornePose` · `#bornePoser` · `#calage` · `#calageFerme`
`#calageCorps` · `#calageCarte` · `#calageEtat` · `#calageGarde` · `#outils`
`#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#traitFleche`
`#texteADessiner` · `#repereType` · `#repereTexte` · `#imageSoc` · `#standSoc` · `#listeSoc`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg`
`#elemEpaisseur` · `#elemStyle` · `#elemFleche` · `#elemSoc` · `#outilsAide`
`#annuleDernier` · `#libReg` · `#libNom` · `#libFerme` · `#libTaille` · `#libAuto`
`#libAide` · `#geoReg` · `#geoNom` · `#geoFerme` · `#geoDim` · `#geoLargeur` · `#geoHauteur`
`#geoOrigine` · `#geoAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`
`#panel` · `#pile` · `#voile` · `#detail` · `#poigneeFiche` · `#dMarque` · `#closeDetail`
`#dKind` · `#dNeuf` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode` · `#dVis`
`#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee`
`#btnPartage` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied` · `#jRefaire`
`#jRetour` · `#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA`
`#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat`
`#videItineraire`

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

### `_installation.html` — 857 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`reglageInstallation` 82 · `invitationVoulue` 83 · `auDoigt` 113 · `nommeApplication` 149
`reponsesInstallation` 167 · `retientInstallation` 172 · `jourInstallation` 181
`invitationEcartee` 184 · `refuseInstallation` 190 · `faconInstallation` 218
`appliInstallee` 241 · `verifieApplication` 263 · `adresseApplication` 280
`lanceApplication` 301 · `faconRappel` 334 · `rappelEcarte` 342 · `refuseRappel` 348
`relanceInvitation` 366 · `gesteInstallation` 371 · `doigtPose` 375 · `doigtLeve` 376
`vueInstallation` 379 · `accueilleInvitation` 388 · `invitationRetenue` 414
`finInvitation` 432 · `essaieInvitation` 456 · `teteInvitation` 574
`retourAuxReglages` 595 · `remplitInvitation` 603 · `ouvreInvitation` 633
`ouvreInstalle` 690 · `confirmeInstallation` 706 · `ouvreRappel` 739 · `ouvreRetrouve` 795
`caseInstallation` 818

### `_itineraire.html` — 3044 l. → plan-admin.html, plan-smcl.html, plan.html

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
`bandeauVisee` 2822 · `armeVisee` 2845 · `finVisee` 2862 · `viseItineraire` 2878
`visePoi` 2884 · `visePoint` 2890 · `ouvreItineraire` 2922 · `fermeItineraire` 2950
`versItineraire` 2960 · `versItineraireDe` 2963

### `_journee.html` — 1004 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 70
`jourPropose` 83 · `pointConf` 98 · `departsProposes` 117 · `matriceJournee` 145
`rangeJournee` 247 · `calculeJournee` 364 · `rangJournee` 576 · `lienJournee` 588
`arretJournee` 595 · `remplitJournee` 620 · `appliqueVueParcours` 770 · `traceJournee` 800
`montreJournee` 808 · `perimeJournee` 821 · `ouvreOrganisation` 830 · `lanceJournee` 969

### `_js.html` — 4322 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.430 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.540 · 3. Rendu du pavillon courant
- l.624 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.760 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1891 · 6. Vue
- l.2274 · 7. Sélection et fiche
- l.3617 · 8. Interactions du plan
- l.4005 · Le tiroir de la liste — écrans étroits
- l.4168 · Le tiroir de la fiche — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `nomDeLaZone` 69 · `nomsAnglaisDesZones` 71 · `indexe` 79
`chronoConf` 269 · `confsDuPlan` 274 · `indexeConferences` 292 · `rangeConferences` 370
`poseFavicon` 417 · `largeur` 435 · `decoupe` 460 · `habille` 473 · `lignesSvg` 484
`coexComptes` 501 · `coexChoisit` 502 · `ligneCode` 518 · `monteHabillage` 546
`montePlan` 563 · `onglets` 600 · `changePlan` 616 · `ancre` 632 · `place` 633
`libelles` 635 · `decaleLibelle` 716 · `facteurLibelle` 717 · `libelleForce` 718
`libelleZone` 721 · `libelleEmplacement` 740 · `indexeSecteurs` 781 · `secteursMontres` 794
`couleurConf` 798 · `hslHex` 802 · `couleurSecteur` 819 · `BANDES` 838 · `majFondus` 846
`pastilleSecteur` 884 · `coloreSecteurs` 897 · `peintSecteur` 948 · `appliqueSecteurs` 961
`filtreTheme` 978 · `themeFiltrable` 1056 · `clesCriteres` 1072 · `libelleCritere` 1079
`separeValeurs` 1087 · `valeursCritere` 1104 · `texteCriteres` 1117 · `indexeCriteres` 1130
`dansCriteres` 1157 · `critereActif` 1165 · `basculeCritere` 1167 · `videCriteres` 1176
`majVideQ` 1185 · `videRecherche` 1198 · `nCriteres` 1213 · `majCriteres` 1222
`ouvreCriteres` 1280 · `filtre` 1404 · `reposeRetrait` 1424 · `critParSociete` 1428
`cherchable` 1438 · `visible` 1445 · `releveHotes` 1461 · `visibleSurPlan` 1469
`visibleSociete` 1480 · `marqueRetrait` 1496 · `appliqueFiltre` 1508 · `oublieRetrait` 1520
`reprendRecherche` 1529 · `rangSorte` 1542 · `codeCase` 1564 · `caseNumero` 1581
`sousLigne` 1601 · `liste` 1615 · `marqueChoisie` 1734 · `prechargeMarque` 1760
`prechargeLesVignettes` 1817 · `chargeUnLot` 1863 · `cadrePlan` 1906 · `oublieCadre` 1907
`figeTextes` 1923 · `rendTextes` 1931 · `cadrage` 1967 · `peintLibelles` 1972
`detacheLibelles` 1978 · `rattacheLibelles` 1990 · `etireLibelles` 2008 · `appliqueVue` 2016
`rafraichitVue` 2060 · `poseVue` 2074 · `masque` 2094 · `masqueDroite` 2126 · `fit` 2137
`stoppeZoom` 2167 · `glisseVersVise` 2173 · `glisseVers` 2215 · `rectVisee` 2237
`zoom` 2257 · `echelle` 2266 · `ETROIT` 2280 · `anime` 2296 · `noeud` 2320
`canalPlan` 2330 · `rangSociete` 2338 · `select` 2347 · `centre` 2372 · `centrePoint` 2376
`montre` 2421 · `libelleCorps` 2453 · `ordreCorps` 2470 · `groupesFiche` 2502
`montreIntitule` 2515 · `valeurCorps` 2535 · `champCorps` 2548 · `groupeCorps` 2560
`corpsRange` 2573 · `momentLocal` 2608 · `programme` 2631 · `jourLong` 2664
`ficheConf` 2675 · `lien` 2822 · `adresseWeb` 2830 · `pictoRS` 2873 · `adresseSure` 2891
`adresseVignette` 2922 · `adresseImage` 2940 · `imageSure` 2953 · `assainitRiche` 2982
`enBlocs` 3022 · `rangeRiche` 3035 · `ecarteClicFantome` 3063 · `nomSociete` 3072
`societes` 3085 · `choisitExposant` 3096 · `poseMarque` 3134 · `montreMarque` 3194
`poseCode` 3217 · `rangeMarque` 3258 · `ouvre` 3321 · `ferme` 3589 · `onglet` 3607
`milieu` 3637 · `commencePince` 3643 · `suitPince` 3657 · `saisitPlan` 3691
`cibleElargie` 3771 · `planifieFiltre` 3961 · `mesureTiroir` 4016 · `montreTiroir` 4019

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

### `_parcours.html` — 560 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 49 · `basculeParcours` 66 · `verseAuParcours` 107
`plurielParcours` 125 · `contenuParcours` 134 · `retenusPourParcours` 160
`ajouteToutAuParcours` 185 · `poseToutAuParcours` 212 · `signetParcours` 238
`boutonParcours` 244 · `rafraichitMarque` 249 · `brancheParcours` 262 · `calqueMarques` 294
`dessineMarques` 310 · `marqueParcours` 340 · `rafraichitParcours` 354 · `instantConf` 382
`cleTemps` 386 · `jourCourt` 392 · `nomDeStand` 399 · `rangParcours` 401
`groupeParcours` 417 · `remplitParcours` 426 · `ouvreParcours` 505 · `fermeParcours` 517
`videLeParcours` 533

### `_partage.html` — 651 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrChemin` 407
`qrSvg` 429 · `ouvrePartageParcours` 446 · `boutonsPartage` 495
`accueilleParcoursPartage` 569 · `adoptePartage` 647

### `_pile.html` — 532 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : deux sections, chacune rangée par nom
- l.343 · Repères
- l.395 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 75 · `boutonAjout` 82 · `boutonVerrou` 102 · `intertitre` 110
`construitPanneau` 117 · `sectionSelection` 359 · `sectionFond` 415 · `ligneCouleur` 473
`rangSecteur` 493 · `rangSous` 506 · `defautCouleur` 528

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

### `_sw.js` — 556 l. → sw.js

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_tutoriel.html` — 880 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 17. La visite guidée — le tour du plan, geste par geste

Fonctions :

`reglageTuto` 52 · `tutoPropose` 61 · `cleTuto` 65 · `tutoOuvert` 67 · `tutoModale` 68
`tutoFicheOuverte` 74 · `tutoFiche` 77 · `tutoParcours` 79 · `tutoItineraire` 82
`tutoJournee` 86 · `zoneDuTuto` 94 · `insecable` 111 · `phraseTrajetTuto` 117
`chapitresTuto` 362 · `proposeTutoriel` 382 · `lanceTutoriel` 440 · `quitteTutoriel` 526
`chapitreTuto` 537 · `battementTuto` 546 · `finTuto` 564 · `afficheTuto` 581 · `pxTuto` 636
`boiteTuto` 639 · `repereTuto` 653 · `rameneTuto` 686 · `placeTuto` 724 · `voileTuto` 797
`rafaleTuto` 814 · `marqueZoneTuto` 834 · `marqueLibelleTuto` 869

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

### `supabase/functions/_partage/champs.ts` — 510 l.

`valeursDe` 327

### `supabase/functions/_partage/eventmaker.ts` — 1079 l.

`grapheJson` 198 · `enParallele` 887 · `texteSeul` 907 · `champs` 1044

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

### `supabase/functions/plan-public/index.ts` — 1000 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 270 · `lu` 313 · `salon` 323 · `appDuSalon` 349
`rendIconeApp` 380 · `retraits` 473 · `ampute` 497 · `masquesDe` 537 · `masquesDuPlan` 557

### `supabase/functions/sync-evenement/index.ts` — 1627 l.

`cors` 42 · `bourre` 111 · `client` 121 · `ecrit` 143 · `gaia` 151 · `libellesChoix` 162
`retiensAnglais` 189 · `fournisseur` 207 · `raccourci` 215 · `enClair` 252 · `range` 278
`champsKlipso` 299 · `hebergee` 1584 · `nettoieUrl` 1603 · `groupeTextes` 1613

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

## Le reste

- `src/index.mjs` — 710 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 85 · `amontPour` 94 · `cleDe` 102 · `cleDeLot` 108 · `cleVersion` 120 `rangeLaVersion` 123 · `ditVersion` 131 · `meta` 140 · `gardable` 156 · `range` 162 `rafraichit` 169 · `entete` 204 · `oublie` 246 · `rappels` 332 · `cleApp` 375 `appDuSalon` 399 · `iconesDuSalon` 445 · `manifeste` 486 · `iconeApp` 556 · `mesure` 577
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
