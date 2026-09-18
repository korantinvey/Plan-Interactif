<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 4194 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.3124 · 10. Mode administration
- l.3229 · La fiche d'une zone organisateur
- l.3938 · Masquer une zone organisateur
- l.4021 · Placer un libellé à la main

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
`habilleModale` 997 · `texteCorps` 1068 · `clesPortees` 1093 · `standApercu` 1113
`lignesApercu` 1137 · `contenuApercu` 1167 · `apercuFiche` 1204 · `apercuListe` 1282
`apercuDuo` 1304 · `glisseFenetre` 1337 · `ouvreReglages` 1348 · `voletZones` 1456
`champsFicheZone` 1558 · `ficheZoneEnPlace` 1628 · `voletPlan` 1646 · `blocRappel` 1694
`ditEssaiRappel` 1798 · `voletAdmin` 1823 · `blocOptions` 2006 · `blocHoraires` 2054
`sallesSituees` 2187 · `voletPmr` 2203 · `nomDuTon` 2294 · `voletApparence` 2299
`clesFiche` 2498 · `voletOrdre` 2515 · `enregistreConf` 3073 · `rgbHex` 3080 · `hexa` 3087
`luminance` 3091 · `ecarte` 3105 · `joli` 3120 · `retireAdmin` 3141 · `activeAdmin` 3154
`champZone` 3255 · `champsZone` 3280 · `champSalles` 3372 · `nomDeZone` 3424
`reduitLogo` 3458 · `cadreLogo` 3501 · `champLogo` 3573 · `editeurRiche` 3611
`memeFicheZone` 3768 · `suitFicheZone` 3775 · `verseFicheZone` 3783 · `ficheZone` 3809
`enregistreZone` 3834 · `basculeAffichageZone` 3949 · `marqueZonesMasquees` 3966
`ecritColonnesEvenement` 3986 · `ecritColonneEvenement` 4017 · `cleLibelle` 4042
`empreinteLibelle` 4058 · `placementLibelle` 4066 · `posePlacement` 4076
`libelleAutomatique` 4093 · `modePlacementLibelles` 4102 · `majPaletteLibelle` 4121
`choisitLibelle` 4138 · `pousseLibelle` 4145 · `libellePointerDown` 4153
`libellePointerMove` 4169 · `libellePointerUp` 4178

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

### `_batiments.html` — 530 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 26 · `bibliothequeDispo` 27 · `batimentsPoses` 34 · `estBatiment` 41
`hallsPoses` 44 · `lieuDuCalque` 50 · `poseCalage` 56 · `ouvreBibliotheque` 65
`vueDuLieu` 161 · `lanceCalage` 201 · `effaceLeTempsDuCalage` 229 · `cadreCalage` 248
`finCalage` 261 · `pivoteCalage` 272 · `degresCalage` 284 · `dessineCalage` 289
`calagePointerDown` 312 · `calagePointerMove` 325 · `calagePointerUp` 341
`reposeBatiment` 354 · `ajouteBatiments` 370 · `boutonRecale` 454 · `pictoRecale` 463
`calageRelu` 480 · `rouvreCalage` 506 · `mentionOsm` 525

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

### `_console-js.html` — 3228 l. → admin-plans.html

- l.959 · Provenance des données
- l.1086 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 424 · `slugifie` 438
`courant` 442 · `charge` 444 · `chargePlans` 459 · `majEvenement` 464 · `selonAdresse` 484
`majAdresse` 492 · `majBarre` 507 · `dessineChoix` 549 · `champ` 569 · `reduitIcone` 623
`champFavicon` 664 · `fuseauConnu` 760 · `champFuseau` 772 · `dessineFiche` 835
`fournisseurUtilise` 1021 · `source` 1025 · `champCle` 1030 · `ligneSource` 1065
`paraitSurFiche` 1197 · `origineConferences` 1203 · `resumeProvenance` 1268
`resumeFiche` 1285 · `caseFiche` 1330 · `champsPersos` 1372 · `criteres` 1378
`ecritFiche` 1381 · `caseCritere` 1396 · `clePerso` 1415 · `ajouteChampPerso` 1423
`renommeChampPerso` 1441 · `retireChampPerso` 1489 · `lignesPerso` 1547 · `ligneOutil` 1567
`ligneReglage` 1583 · `ouvreProvenance` 1595 · `ouvreSources` 1618 · `cadreFiche` 1670
`ouvreFiche` 1700 · `cadreCategories` 1838 · `sousTitre` 1917 · `tableauChamps` 1932
`encode` 2075 · `decode` 2077 · `correspondance` 2082 · `sansPrefixe` 2085 · `courte` 2086
`intitule` 2101 · `intituleSuite` 2113 · `separeValeurs` 2127 · `aplani` 2148
`memeStyle` 2158 · `autreFace` 2176 · `champOrigine` 2192 · `majLiens` 2459
`majIntegration` 2496 · `majMsgSync` 2503 · `etapesPressenties` 2533 · `suitAuServeur` 2582
`synchronise` 2624 · `fabriqueLesVignettes` 2721 · `envoieVignettes` 2774 · `dupliquer` 2783
`litMonProfil` 2883 · `RETOUR_MDP` 2894 · `litComptes` 2896 · `ligneMessage` 2905
`casesSalons` 2915 · `ouvreComptes` 2945 · `ouvreFicheCompte` 3037 · `videEcran` 3196
`dessine` 3201 · `demarre` 3216

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 709 l. → console.css

- l.650 · Page de rapport

### `_dessin.html` — 2096 l. → plan-admin.html, plan-smcl.html, plan.html

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
`ajouteForme` 600 · `pictoDe` 700 · `nomTypeRepereFr` 751 · `nomTypeRepere` 752
`typeZone` 778 · `pictoForme` 785 · `estPorte` 805 · `ouvreEntrant` 806 · `ouvreSortant` 807
`traceRepere` 821 · `nomSurLePlan` 890 · `etiquetteSociete` 901 · `seRattache` 929
`societeDeForme` 941 · `societesDuPlan` 953 · `remplitListeSocietes` 968
`societeSaisie` 976 · `traceImage` 1003 · `traceStandDessine` 1028
`texteStandDessine` 1052 · `poseLibellesDessines` 1070 · `decoupeStand` 1091
`marqueStandsDessines` 1103 · `rafraichitStandsDessines` 1118 · `oublieReperes` 1148
`reperesCherchables` 1150 · `vaAuRepere` 1194 · `clePoi` 1229 · `cartouchePoi` 1231
`ouvrePoi` 1347 · `mesureCartouche` 1419 · `phareRepere` 1435 · `phareZone` 1437
`eclairePoi` 1443 · `oublieChoixPoi` 1476 · `signale` 1485 · `calquePourImage` 1499
`lienImageSaisi` 1527 · `formeImage` 1538 · `poseImage` 1547 · `ditImagePosee` 1569
`importeImage` 1577 · `dessinPointerDown` 1628 · `dessinPointerMove` 1702
`dessinPointerUp` 1740 · `termineTrace` 1781 · `aide` 1793 · `outilOffert` 1822
`choisitOutil` 1825 · `enchaineStand` 1856 · `activeCalque` 1911 · `cleVerrou` 1969
`verrouille` 1970 · `basculeVerrou` 1972 · `pictoVerrou` 1989 · `montreRoleIti` 2023
`creeCalque` 2054 · `demandeNom` 2067 · `renommeCalque` 2086

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 487 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 176 · `ecritDesDeuxCotes` 198
`changeLien` 210 · `changeDureeLien` 226 · `majLiens` 243 · `appliqueSociete` 295
`appliqueTexte` 311 · `appliqueRayon` 321 · `appliqueTrait` 334 · `appliquePicto` 352
`supprimeForme` 367 · `editionPointerDown` 377 · `editionPointerMove` 423
`editionPointerUp` 477

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

### `_head.html` — 4735 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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

### `_installation.html` — 848 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`reglageInstallation` 97 · `invitationVoulue` 98 · `auDoigt` 128 · `nommeApplication` 164
`reponsesInstallation` 182 · `retientInstallation` 187 · `jourInstallation` 196
`invitationEcartee` 199 · `refuseInstallation` 205 · `faconInstallation` 233
`appliInstallee` 256 · `verifieApplication` 278 · `connaitLApplication` 288
`adresseApplication` 301 · `lanceApplication` 321 · `faconRappel` 354 · `rappelEcarte` 362
`refuseRappel` 368 · `relanceInvitation` 386 · `gesteInstallation` 391 · `doigtPose` 395
`doigtLeve` 396 · `vueInstallation` 399 · `accueilleInvitation` 408
`invitationRetenue` 434 · `finInvitation` 452 · `essaieInvitation` 476
`teteInvitation` 603 · `retourAuxReglages` 624 · `remplitInvitation` 632
`ouvreInvitation` 662 · `ouvreRappel` 732 · `ouvreRetrouve` 788 · `caseInstallation` 811

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

### `_js.html` — 4433 l. → plan-admin.html, plan-smcl.html, plan.html

- l.76 · 1. Index global — la recherche porte sur tous les pavillons
- l.454 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.564 · 3. Rendu du pavillon courant
- l.648 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.784 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1985 · 6. Vue
- l.2368 · 7. Sélection et fiche
- l.3711 · 8. Interactions du plan
- l.4104 · Le tiroir de la liste — écrans étroits
- l.4279 · Le tiroir de la fiche — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `cheminDuSalon` 32 · `cheminPartageable` 43 · `P` 73 · `nomDeLaZone` 93
`nomsAnglaisDesZones` 95 · `indexe` 103 · `chronoConf` 293 · `confsDuPlan` 298
`indexeConferences` 316 · `rangeConferences` 394 · `poseFavicon` 441 · `largeur` 459
`decoupe` 484 · `habille` 497 · `lignesSvg` 508 · `coexComptes` 525 · `coexChoisit` 526
`ligneCode` 542 · `monteHabillage` 570 · `montePlan` 587 · `onglets` 624 · `changePlan` 640
`ancre` 656 · `place` 657 · `libelles` 659 · `decaleLibelle` 740 · `facteurLibelle` 741
`libelleForce` 742 · `libelleZone` 745 · `libelleEmplacement` 764 · `indexeSecteurs` 805
`secteursMontres` 818 · `couleurConf` 822 · `hslHex` 826 · `couleurSecteur` 843
`BANDES` 864 · `majFondus` 872 · `pastilleSecteur` 910 · `coloreSecteurs` 923
`peintSecteur` 974 · `appliqueSecteurs` 987 · `filtreTheme` 1004 · `themeFiltrable` 1082
`clesCriteres` 1098 · `libelleCritere` 1105 · `separeValeurs` 1113 · `valeursCritere` 1130
`texteCriteres` 1143 · `indexeCriteres` 1156 · `dansCriteres` 1183 · `critereActif` 1191
`basculeCritere` 1193 · `videCriteres` 1202 · `majVideQ` 1211 · `videRecherche` 1224
`nCriteres` 1239 · `majCriteres` 1254 · `remplitCriteres` 1321 · `basculeCriteres` 1460
`ouvreCriteres` 1465 · `fermeCriteres` 1481 · `filtre` 1498 · `reposeRetrait` 1518
`critParSociete` 1522 · `cherchable` 1532 · `visible` 1539 · `releveHotes` 1555
`visibleSurPlan` 1563 · `visibleSociete` 1574 · `marqueRetrait` 1590 · `appliqueFiltre` 1602
`oublieRetrait` 1614 · `reprendRecherche` 1623 · `rangSorte` 1636 · `codeCase` 1658
`caseNumero` 1675 · `sousLigne` 1695 · `liste` 1709 · `marqueChoisie` 1828
`prechargeMarque` 1854 · `prechargeLesVignettes` 1911 · `chargeUnLot` 1957
`cadrePlan` 2000 · `oublieCadre` 2001 · `figeTextes` 2017 · `rendTextes` 2025
`cadrage` 2061 · `peintLibelles` 2066 · `detacheLibelles` 2072 · `rattacheLibelles` 2084
`etireLibelles` 2102 · `appliqueVue` 2110 · `rafraichitVue` 2154 · `poseVue` 2168
`masque` 2188 · `masqueDroite` 2220 · `fit` 2231 · `stoppeZoom` 2261 · `glisseVersVise` 2267
`glisseVers` 2309 · `rectVisee` 2331 · `zoom` 2351 · `echelle` 2360 · `ETROIT` 2374
`anime` 2390 · `noeud` 2414 · `canalPlan` 2424 · `rangSociete` 2432 · `select` 2441
`centre` 2466 · `centrePoint` 2470 · `montre` 2515 · `libelleCorps` 2547 · `ordreCorps` 2564
`groupesFiche` 2596 · `montreIntitule` 2609 · `valeurCorps` 2629 · `champCorps` 2642
`groupeCorps` 2654 · `corpsRange` 2667 · `momentLocal` 2702 · `programme` 2725
`jourLong` 2758 · `ficheConf` 2769 · `lien` 2916 · `adresseWeb` 2924 · `pictoRS` 2967
`adresseSure` 2985 · `adresseVignette` 3016 · `adresseImage` 3034 · `imageSure` 3047
`assainitRiche` 3076 · `enBlocs` 3116 · `rangeRiche` 3129 · `ecarteClicFantome` 3157
`nomSociete` 3166 · `societes` 3179 · `choisitExposant` 3190 · `poseMarque` 3228
`montreMarque` 3288 · `poseCode` 3311 · `rangeMarque` 3352 · `ouvre` 3415 · `ferme` 3683
`onglet` 3701 · `milieu` 3731 · `commencePince` 3737 · `suitPince` 3751 · `saisitPlan` 3785
`cibleElargie` 3865 · `planifieFiltre` 4060 · `mesureTiroir` 4115 · `montreTiroir` 4118
`hisseTiroir` 4122

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

### `_parcours.html` — 556 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 49 · `basculeParcours` 66 · `verseAuParcours` 107
`plurielParcours` 125 · `contenuParcours` 134 · `retenusPourParcours` 160
`ajouteToutAuParcours` 185 · `poseToutAuParcours` 208 · `signetParcours` 234
`boutonParcours` 240 · `rafraichitMarque` 245 · `brancheParcours` 258 · `calqueMarques` 290
`dessineMarques` 306 · `marqueParcours` 336 · `rafraichitParcours` 350 · `instantConf` 378
`cleTemps` 382 · `jourCourt` 388 · `nomDeStand` 395 · `rangParcours` 397
`groupeParcours` 413 · `remplitParcours` 422 · `ouvreParcours` 501 · `fermeParcours` 513
`videLeParcours` 529

### `_partage.html` — 651 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrChemin` 407
`qrSvg` 429 · `ouvrePartageParcours` 446 · `boutonsPartage` 495
`accueilleParcoursPartage` 569 · `adoptePartage` 647

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

### `supabase/functions/plan-public/index.ts` — 1021 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 485 · `ampute` 509 · `masquesDe` 549 · `masquesDuPlan` 569

### `supabase/functions/sync-evenement/index.ts` — 1724 l.

`cors` 42 · `bourre` 111 · `client` 121 · `ecrit` 143 · `gaia` 151 · `libellesChoix` 162
`retiensAnglais` 189 · `fournisseur` 207 · `raccourci` 215 · `enClair` 252 · `range` 278
`champsKlipso` 299 · `hebergee` 1681 · `nettoieUrl` 1700 · `groupeTextes` 1710

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
