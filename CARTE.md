<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 4087 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.3012 · 10. Mode administration
- l.3124 · La fiche d'une zone organisateur
- l.3833 · Masquer une zone organisateur
- l.3916 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 97
`appliqueCouleursData` 103 · `styleData` 135 · `appliqueApparence` 141
`appliqueCommandes` 203 · `optionActive` 295 · `programmeOffert` 300
`suggestionOfferte` 301 · `appliqueOptions` 303 · `chercheSorte` 371 · `voletRecherche` 374
`minutesVisite` 431 · `lueHeure` 458 · `lueDate` 462 · `datesSalon` 469
`horairesSalon` 483 · `salonPartage` 496 · `presseNuanciers` 527 · `suitNuancier` 543
`trio` 571 · `melange` 581 · `themeSombre` 589 · `appliqueAccent` 603 · `appliqueFond` 634
`modeleRetenu` 672 · `policeChoisie` 828 · `policeDuModele` 833 · `feuillePolice` 843
`chargePolice` 865 · `policePrete` 885 · `policeDesNoms` 903 · `posePoliceLibelles` 932
`appliqueModele` 964 · `habilleModale` 1005 · `texteCorps` 1076 · `standApercu` 1091
`lignesApercu` 1115 · `contenuApercu` 1141 · `apercuFiche` 1178 · `apercuListe` 1256
`apercuDuo` 1278 · `glisseFenetre` 1311 · `ouvreReglages` 1322 · `voletZones` 1430
`champsFicheZone` 1532 · `ficheZoneEnPlace` 1602 · `voletPlan` 1620 · `blocRappel` 1664
`voletAdmin` 1723 · `blocOptions` 1896 · `blocHoraires` 1944 · `sallesSituees` 2077
`voletPmr` 2093 · `nomDuTon` 2184 · `voletApparence` 2189 · `clesFiche` 2388
`voletOrdre` 2405 · `enregistreConf` 2961 · `rgbHex` 2968 · `hexa` 2975 · `luminance` 2979
`ecarte` 2993 · `joli` 3008 · `retireAdmin` 3029 · `activeAdmin` 3042 · `champZone` 3150
`champsZone` 3175 · `champSalles` 3267 · `nomDeZone` 3319 · `reduitLogo` 3353
`cadreLogo` 3396 · `champLogo` 3468 · `editeurRiche` 3506 · `memeFicheZone` 3663
`suitFicheZone` 3670 · `verseFicheZone` 3678 · `ficheZone` 3704 · `enregistreZone` 3729
`basculeAffichageZone` 3844 · `marqueZonesMasquees` 3861 · `ecritColonnesEvenement` 3881
`ecritColonneEvenement` 3912 · `cleLibelle` 3937 · `empreinteLibelle` 3953
`placementLibelle` 3961 · `posePlacement` 3971 · `libelleAutomatique` 3988
`modePlacementLibelles` 3997 · `majPaletteLibelle` 4014 · `choisitLibelle` 4031
`pousseLibelle` 4038 · `libellePointerDown` 4046 · `libellePointerMove` 4062
`libellePointerUp` 4071

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 271 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 67 · `entetesApi` 90 · `chargeFond` 113 · `panneDuChargement` 160
`CLE_VERSION` 170 · `versionRetenue` 171 · `retientVersion` 174 · `demandePlan` 198
`charge` 222

### `_aimants.html` — 474 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 15 · `coteCadre` 19 · `montreCote` 31 · `aimantsActifs` 59 · `axesDe` 63
`pointsAimants` 68 · `aimantsDuPlan` 83 · `pasAimant` 114 · `cale` 122 · `sousLeGeste` 127
`cranGrille` 138 · `oublieAimants` 155 · `aimantsDessines` 157 · `coinsGeste` 183
`montreAimants` 205 · `meilleurSommet` 270 · `croixAimant` 284 · `correction` 307
`aimante` 348 · `retientTaille` 362 · `reprendTaille` 376 · `dupliqueForme` 397
`pousseForme` 422 · `ecritDimensions` 438 · `appliqueDimension` 457

### `_auth-plan.html` — 215 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 128 · `mailDuJeton` 135 · `litProfilA` 146
`initialesDe` 159 · `themeSombreA` 166 · `poseCompte` 171

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

### `_dessin.html` — 1942 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `dejaPubliee` 138 · `marqueAttente` 144 · `mesCalques` 152
`enregistreDessins` 153 · `instantane` 187 · `memorise` 188 · `restaure` 193 · `annule` 202
`refais` 214 · `trouveCalque` 216 · `nouvelId` 217 · `cheminArrondi` 235 · `estCadre` 278
`cheminForme` 280 · `styleTrait` 300 · `longueurFleche` 326 · `cheminFleche` 333
`marqueFleche` 362 · `rafraichitFleches` 373 · `poseTrait` 389 · `dessineDessins` 397
`peintCalque` 448 · `versPlan` 454 · `apercu` 460 · `apercuGuide` 472 · `toleranceTrace` 496
`aimanteContour` 501 · `rayonContour` 504 · `redresseTrace` 523 · `traceGuide` 557
`fermeIci` 564 · `ajouteForme` 569 · `pictoDe` 669 · `nomTypeRepereFr` 720
`nomTypeRepere` 721 · `typeZone` 747 · `pictoForme` 754 · `estPorte` 774
`ouvreEntrant` 775 · `ouvreSortant` 776 · `traceRepere` 790 · `nomSurLePlan` 859
`etiquetteSociete` 870 · `societeDeForme` 887 · `societesDuPlan` 899
`remplitListeSocietes` 914 · `societeSaisie` 922 · `traceStandDessine` 938
`texteStandDessine` 962 · `poseLibellesDessines` 980 · `decoupeStand` 1001
`marqueStandsDessines` 1013 · `rafraichitStandsDessines` 1028 · `oublieReperes` 1058
`reperesCherchables` 1060 · `vaAuRepere` 1104 · `clePoi` 1139 · `cartouchePoi` 1141
`ouvrePoi` 1245 · `mesureCartouche` 1317 · `phareRepere` 1333 · `phareZone` 1335
`eclairePoi` 1341 · `oublieChoixPoi` 1374 · `signale` 1383 · `calquePourImage` 1397
`poseImage` 1414 · `importeImage` 1427 · `dessinPointerDown` 1481 · `dessinPointerMove` 1555
`dessinPointerUp` 1593 · `termineTrace` 1629 · `aide` 1641 · `outilOffert` 1669
`choisitOutil` 1672 · `enchaineStand` 1700 · `activeCalque` 1759 · `cleVerrou` 1815
`verrouille` 1816 · `basculeVerrou` 1818 · `pictoVerrou` 1835 · `montreRoleIti` 1869
`creeCalque` 1900 · `demandeNom` 1913 · `renommeCalque` 1932

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 527 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 185 · `ecritDesDeuxCotes` 207
`changeLien` 219 · `changeDureeLien` 235 · `majLiens` 252 · `etiquetteStand` 296
`remplitListeStands` 301 · `standSaisi` 310 · `appliqueLiaison` 320 · `appliqueSociete` 338
`appliqueTexte` 354 · `appliqueRayon` 364 · `appliqueTrait` 376 · `appliquePicto` 394
`supprimeForme` 409 · `editionPointerDown` 419 · `editionPointerMove` 465
`editionPointerUp` 517

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

### `_head.html` — 4625 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands`
`#nExpo` · `#nZones` · `#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers`
`#btnReglages` · `#btnLangue` · `#btnTheme` · `#menuCompte` · `#avatarCompte`
`#compteMail` · `#btnThemeCompte` · `#btnSortir` · `#alerteEnr` · `#alerteTxt`
`#alerteAct` · `#side` · `#poignee` · `#q` · `#videQ` · `#btnFiltres` · `#nFiltres`
`#actifs` · `#count` · `#countTxt` · `#list` · `#piedSide` · `#btnConfidentialite`
`#stage` · `#fondCarteGL` · `#fondTuiles` · `#fondCarte` · `#trouDuFond` · `#plan`
`#couches` · `#zones` · `#stands` · `#labels` · `#calqueLibelles` · `#zIn` · `#zOut`
`#zFit` · `#scaleBar` · `#scaleTxt` · `#creditCarte` · `#mentionOsm` · `#poi` · `#viseur`
`#viseurTxt` · `#viseurStop` · `#calageBat` · `#calageAngle` · `#calageQuart`
`#calageStop` · `#calageValide` · `#iciRappel` · `#iciRappelTxt` · `#iciStop` · `#bornePose`
`#bornePoser` · `#calage` · `#calageFerme` · `#calageCorps` · `#calageCarte` · `#calageEtat`
`#calageGarde` · `#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils`
`#roleIti` · `#roleAide` · `#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg`
`#contourRayon` · `#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle`
`#traitFleche` · `#texteADessiner` · `#repereType` · `#repereTexte` · `#standSoc`
`#listeSoc` · `#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg`
`#elemEpaisseur` · `#elemStyle` · `#elemFleche` · `#elemStand` · `#listeStands` · `#elemSoc`
`#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom` · `#libFerme` · `#libTaille`
`#libAuto` · `#libAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`
`#panel` · `#pile` · `#voile` · `#detail` · `#poigneeFiche` · `#dMarque` · `#closeDetail`
`#dKind` · `#dNeuf` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode` · `#dVis`
`#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee`
`#btnPartage` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied` · `#jRefaire`
`#jRetour` · `#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA`
`#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat`
`#videItineraire`

### `_hors-ligne.html` — 47 l. → hors-ligne.html

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

### `_index.html` — 46 l. → index.html

Éléments :

`#secours`

### `_installation.html` — 519 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`reglageInstallation` 50 · `invitationVoulue` 51 · `auDoigt` 76 · `nommeApplication` 104
`reponsesInstallation` 118 · `retientInstallation` 123 · `jourInstallation` 132
`invitationEcartee` 135 · `refuseInstallation` 141 · `faconInstallation` 169
`relanceInvitation` 187 · `gesteInstallation` 192 · `doigtPose` 196 · `doigtLeve` 197
`vueInstallation` 200 · `accueilleInvitation` 209 · `invitationRetenue` 228
`finInvitation` 246 · `essaieInvitation` 265 · `teteInvitation` 355
`retourAuxReglages` 370 · `remplitInvitation` 378 · `ouvreInvitation` 408
`ouvreInstalle` 458 · `confirmeInstallation` 474 · `caseInstallation` 492

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

### `_js.html` — 4304 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.422 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.532 · 3. Rendu du pavillon courant
- l.613 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.749 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1881 · 6. Vue
- l.2262 · 7. Sélection et fiche
- l.3605 · 8. Interactions du plan
- l.3974 · Le tiroir de la liste — écrans étroits
- l.4137 · Le tiroir de la fiche — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `nomDeLaZone` 69 · `nomsAnglaisDesZones` 71 · `indexe` 79
`chronoConf` 261 · `confsDuPlan` 266 · `indexeConferences` 284 · `rangeConferences` 362
`poseFavicon` 409 · `largeur` 427 · `decoupe` 452 · `habille` 465 · `lignesSvg` 476
`coexComptes` 493 · `coexChoisit` 494 · `ligneCode` 510 · `monteHabillage` 538
`montePlan` 555 · `onglets` 589 · `changePlan` 605 · `ancre` 621 · `place` 622
`libelles` 624 · `decaleLibelle` 705 · `facteurLibelle` 706 · `libelleForce` 707
`libelleZone` 710 · `libelleEmplacement` 729 · `indexeSecteurs` 770 · `secteursMontres` 783
`couleurConf` 787 · `hslHex` 791 · `couleurSecteur` 809 · `BANDES` 828 · `majFondus` 836
`pastilleSecteur` 874 · `coloreSecteurs` 887 · `peintSecteur` 938 · `appliqueSecteurs` 951
`filtreTheme` 968 · `themeFiltrable` 1046 · `clesCriteres` 1062 · `libelleCritere` 1069
`separeValeurs` 1077 · `valeursCritere` 1094 · `texteCriteres` 1107 · `indexeCriteres` 1120
`dansCriteres` 1147 · `critereActif` 1155 · `basculeCritere` 1157 · `videCriteres` 1166
`majVideQ` 1175 · `videRecherche` 1188 · `nCriteres` 1203 · `majCriteres` 1212
`ouvreCriteres` 1270 · `filtre` 1394 · `reposeRetrait` 1414 · `critParSociete` 1418
`cherchable` 1428 · `visible` 1435 · `releveHotes` 1451 · `visibleSurPlan` 1459
`visibleSociete` 1470 · `marqueRetrait` 1486 · `appliqueFiltre` 1498 · `oublieRetrait` 1510
`reprendRecherche` 1519 · `rangSorte` 1532 · `codeCase` 1554 · `caseNumero` 1571
`sousLigne` 1591 · `liste` 1605 · `marqueChoisie` 1724 · `prechargeMarque` 1750
`prechargeLesVignettes` 1807 · `chargeUnLot` 1853 · `cadrePlan` 1896 · `oublieCadre` 1897
`figeTextes` 1913 · `rendTextes` 1921 · `cadrage` 1957 · `peintLibelles` 1962
`detacheLibelles` 1968 · `rattacheLibelles` 1980 · `etireLibelles` 1998 · `appliqueVue` 2006
`rafraichitVue` 2048 · `poseVue` 2062 · `masque` 2082 · `masqueDroite` 2114 · `fit` 2125
`stoppeZoom` 2155 · `glisseVersVise` 2161 · `glisseVers` 2203 · `rectVisee` 2225
`zoom` 2245 · `echelle` 2254 · `ETROIT` 2268 · `anime` 2284 · `noeud` 2308
`canalPlan` 2318 · `rangSociete` 2326 · `select` 2335 · `centre` 2360 · `centrePoint` 2364
`montre` 2409 · `libelleCorps` 2441 · `ordreCorps` 2458 · `groupesFiche` 2490
`montreIntitule` 2503 · `valeurCorps` 2523 · `champCorps` 2536 · `groupeCorps` 2548
`corpsRange` 2561 · `momentLocal` 2596 · `programme` 2619 · `jourLong` 2652
`ficheConf` 2663 · `lien` 2810 · `adresseWeb` 2818 · `pictoRS` 2861 · `adresseSure` 2879
`adresseVignette` 2910 · `adresseImage` 2928 · `imageSure` 2941 · `assainitRiche` 2970
`enBlocs` 3010 · `rangeRiche` 3023 · `ecarteClicFantome` 3051 · `nomSociete` 3060
`societes` 3073 · `choisitExposant` 3084 · `poseMarque` 3122 · `montreMarque` 3182
`poseCode` 3205 · `rangeMarque` 3246 · `ouvre` 3309 · `ferme` 3577 · `onglet` 3595
`milieu` 3625 · `commencePince` 3631 · `suitPince` 3645 · `saisitPlan` 3679
`cibleElargie` 3755 · `planifieFiltre` 3930 · `mesureTiroir` 3985 · `montreTiroir` 3988

Éléments :

`#data` · `#dGo` · `#dItin`

### `_langue.js` — 712 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_marque.html` — 281 l. → admin-plans.html, plan-admin.html, plan-smcl.html, plan.html

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 55 · `recadreMarque` 59 · `marqueRecadree` 85 · `imageChargee` 114
`vignetteMarque` 130 · `boiteMarque` 156 · `toileMarque` 222 · `vignetteDeLogo` 246

### `_mesure.html` — 429 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 61 · `jetonMesure` 64 · `jourIso` 103 · `echeanceMesure` 104
`jetonRetenu` 128 · `supportMesure` 177 · `renouvelleVisiteur` 228 · `envoieMesures` 250
`mesure` 292 · `effaceJetonsVisiteur` 346 · `refuseMesure` 364 · `ouvreConfidentialite` 382

### `_modales.html` — 172 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 28 · `fermeModale` 48 · `confirme` 55 · `deplaceVers` 73
`versExtremite` 85 · `remplitOrdre` 93 · `ouvreOrdre` 163

### `_motdepasse.html` — 249 l. → motdepasse.html

- l.61 · Poser un mot de passe

Fonctions :

`$` 77 · `CFG` 79 · `dit` 87 · `fragment` 93 · `garde` 100 · `lit` 104 · `demandeLien` 177
`ouvreSaisie` 186

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 554 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 49 · `basculeParcours` 66 · `verseAuParcours` 101
`plurielParcours` 119 · `contenuParcours` 128 · `retenusPourParcours` 154
`ajouteToutAuParcours` 179 · `poseToutAuParcours` 206 · `signetParcours` 232
`boutonParcours` 238 · `rafraichitMarque` 243 · `brancheParcours` 256 · `calqueMarques` 288
`dessineMarques` 304 · `marqueParcours` 334 · `rafraichitParcours` 348 · `instantConf` 376
`cleTemps` 380 · `jourCourt` 386 · `nomDeStand` 393 · `rangParcours` 395
`groupeParcours` 411 · `remplitParcours` 420 · `ouvreParcours` 499 · `fermeParcours` 511
`videLeParcours` 527

### `_partage.html` — 650 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrChemin` 406
`qrSvg` 428 · `ouvrePartageParcours` 445 · `boutonsPartage` 494
`accueilleParcoursPartage` 568 · `adoptePartage` 646

### `_pile.html` — 505 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : deux sections, chacune rangée par nom
- l.316 · Repères
- l.368 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 75 · `boutonAjout` 82 · `boutonVerrou` 102 · `intertitre` 110
`construitPanneau` 117 · `sectionSelection` 332 · `sectionFond` 388 · `ligneCouleur` 446
`rangSecteur` 466 · `rangSous` 479 · `defautCouleur` 501

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

### `_rappels.html` — 420 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 sexies. Le rappel avant une conférence

Fonctions :

`reglageRappel` 62 · `rappelsVoulus` 63 · `minutesRappel` 64 · `cleRappels` 77
`chargeRappels` 80 · `retientRappels` 84 · `poussePossible` 93 · `rappelsOfferts` 99
`iOSsansInstallation` 105 · `instantAbsolu` 134 · `confsARappeler` 150
`rappelsDuParcours` 166 · `adresseDuRappel` 188 · `octetsDeCle` 200
`abonnementCourant` 208 · `abonne` 213 · `synchroniseRappels` 239 · `eteintRappels` 262
`allumeRappels` 277 · `aideRappel` 294 · `poseRappels` 310 · `reprendRappels` 409

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

### `_sponsor.html` — 570 l. → plan-admin.html, plan-smcl.html, plan.html

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

### `_sw.js` — 340 l. → sw.js

Fonctions :

`range` 101 · `oublieLesVersionsDAvant` 127 · `dabordCache` 148 · `borneLesLots` 184
`dabordReseau` 206 · `navigation` 223

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

### `_webgl.html` — 1386 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 180 · `guetteContexteWebgl` 186
`contextePerduWebgl` 196 · `verifieContexteWebgl` 203 · `perdContexteWebgl` 212
`remonteWebgl` 233 · `vueDeck` 250 · `vueWebgl` 259 · `blocDe` 268 · `enEdition` 298
`majEditionWebgl` 301 · `cleBloc` 313 · `planifieWebgl` 339 · `toutRepeindreWebgl` 343
`blocsDansLOrdre` 350 · `repeintWebgl` 355 · `assembleWebgl` 379 · `constTexte` 413
`jeuDeCaracteres` 493 · `couchesTexte` 504 · `mulM` 538 · `appM` 541 · `echelleM` 542
`lisTransform` 544 · `lisTrace` 566 · `lisPoints` 634 · `num` 640 · `anneau` 642
`rectArrondi` 648 · `couleurGl` 662 · `accVide` 679 · `convertitBloc` 680 · `accDe` 694
`parcoursGl` 701 · `avecTrous` 741 · `formeGl` 762 · `texteGl` 798 · `imageGl` 821
`partage` 853 · `designeGl` 859 · `couchesDeBloc` 861 · `modelesLibellesHtml` 922
`poseModelesLibelles` 932 · `lisModelesLibelles` 938 · `emplacementWebgl` 967
`libellesWebgl` 1015 · `groupesNoms` 1078 · `couchesNoms` 1094 · `couchesPastilles` 1105
`couchesLibellesWebgl` 1120 · `couchesDessineesWebgl` 1127 · `stage` 1148
`brancheSurvolWebgl` 1152 · `poseSurvolWebgl` 1172 · `poseCurseurWebgl` 1181
`poseFocusWebgl` 1190 · `aplatsDe` 1197 · `coucheSurvol` 1200 · `coucheFocus` 1209
`couchesPhare` 1236 · `lueurDe` 1252 · `opacitePhare` 1290 · `echellePhare` 1291
`couchesPhareNoms` 1294 · `animeCouche` 1308 · `majAnimationWebgl` 1322 · `animeWebgl` 1330
`objetSous` 1353 · `cibleWebgl` 1360 · `priseWebgl` 1367 · `libelleSousWebgl` 1372
`rectEcranWebgl` 1377

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

### `supabase/functions/mesure/index.ts` — 155 l.

`jeton` 73 · `client` 76

### `supabase/functions/plan-public/index.ts` — 921 l.

`cors` 51 · `db` 85 · `service` 100 · `vignettesParAdresse` 117 · `avecVignette` 154
`rendVignette` 190 · `rendVignettes` 267 · `lu` 310 · `salon` 320 · `nomDuSalon` 343
`retraits` 416 · `ampute` 440 · `masquesDe` 480 · `masquesDuPlan` 500

### `supabase/functions/sync-evenement/index.ts` — 1606 l.

`cors` 42 · `bourre` 111 · `client` 121 · `ecrit` 143 · `gaia` 151 · `libellesChoix` 162
`retiensAnglais` 189 · `fournisseur` 207 · `raccourci` 215 · `enClair` 252 · `range` 278
`champsKlipso` 299 · `hebergee` 1563 · `nettoieUrl` 1582 · `groupeTextes` 1592

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

## Le reste

- `src/index.mjs` — 597 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 84 · `amontPour` 93 · `cleDe` 101 · `cleDeLot` 107 · `cleVersion` 119 `rangeLaVersion` 122 · `ditVersion` 130 · `meta` 139 · `gardable` 155 · `range` 161 `rafraichit` 168 · `entete` 203 · `oublie` 245 · `rappels` 330 · `nomDuSalon` 383 `manifeste` 430 · `mesure` 467
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
