<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 3826 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.2787 · 10. Mode administration
- l.2878 · La fiche d'une zone organisateur
- l.3572 · Masquer une zone organisateur
- l.3655 · Placer un libellé à la main

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 97
`appliqueCouleursData` 103 · `styleData` 135 · `appliqueApparence` 141
`appliqueCommandes` 202 · `chercheSorte` 272 · `voletRecherche` 275 · `minutesVisite` 329
`lueHeure` 356 · `lueDate` 360 · `datesSalon` 367 · `horairesSalon` 381 · `salonPartage` 394
`presseNuanciers` 425 · `suitNuancier` 441 · `trio` 469 · `melange` 479 · `themeSombre` 487
`appliqueAccent` 501 · `appliqueFond` 532 · `modeleRetenu` 570 · `policeChoisie` 726
`policeDuModele` 731 · `feuillePolice` 741 · `chargePolice` 763 · `policePrete` 783
`policeDesNoms` 801 · `posePoliceLibelles` 830 · `appliqueModele` 862 · `habilleModale` 903
`texteCorps` 974 · `standApercu` 989 · `lignesApercu` 1013 · `contenuApercu` 1039
`apercuFiche` 1076 · `apercuListe` 1154 · `apercuDuo` 1176 · `glisseFenetre` 1209
`ouvreReglages` 1220 · `voletZones` 1327 · `champsFicheZone` 1429 · `ficheZoneEnPlace` 1499
`voletPlan` 1517 · `voletAdmin` 1556 · `blocHoraires` 1719 · `sallesSituees` 1852
`voletPmr` 1868 · `nomDuTon` 1959 · `voletApparence` 1964 · `clesFiche` 2163
`voletOrdre` 2180 · `enregistreConf` 2736 · `rgbHex` 2743 · `hexa` 2750 · `luminance` 2754
`ecarte` 2768 · `joli` 2783 · `retireAdmin` 2804 · `activeAdmin` 2817 · `champZone` 2904
`champsZone` 2929 · `champSalles` 3021 · `nomDeZone` 3073 · `reduitLogo` 3107
`champLogo` 3148 · `editeurRiche` 3245 · `memeFicheZone` 3402 · `suitFicheZone` 3409
`verseFicheZone` 3417 · `ficheZone` 3443 · `enregistreZone` 3468
`basculeAffichageZone` 3583 · `marqueZonesMasquees` 3600 · `ecritColonnesEvenement` 3620
`ecritColonneEvenement` 3651 · `cleLibelle` 3676 · `empreinteLibelle` 3692
`placementLibelle` 3700 · `posePlacement` 3710 · `libelleAutomatique` 3727
`modePlacementLibelles` 3736 · `majPaletteLibelle` 3753 · `choisitLibelle` 3770
`pousseLibelle` 3777 · `libellePointerDown` 3785 · `libellePointerMove` 3801
`libellePointerUp` 3810

Éléments :

`#pousseConf` · `#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 186 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 44 · `entetesApi` 62 · `chargeFond` 85 · `panneDuChargement` 132
`charge` 139

### `_aimants.html` — 474 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 15 · `coteCadre` 19 · `montreCote` 31 · `aimantsActifs` 59 · `axesDe` 63
`pointsAimants` 68 · `aimantsDuPlan` 83 · `pasAimant` 114 · `cale` 122 · `sousLeGeste` 127
`cranGrille` 138 · `oublieAimants` 155 · `aimantsDessines` 157 · `coinsGeste` 183
`montreAimants` 205 · `meilleurSommet` 270 · `croixAimant` 284 · `correction` 307
`aimante` 348 · `retientTaille` 362 · `reprendTaille` 376 · `dupliqueForme` 397
`pousseForme` 422 · `ecritDimensions` 438 · `appliqueDimension` 457

### `_auth-plan.html` — 209 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `contenuDuJeton` 122 · `mailDuJeton` 129 · `litProfilA` 140
`initialesDe` 153 · `themeSombreA` 160 · `poseCompte` 165

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

### `_borne.html` — 355 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — un plan qui sait où il est

Fonctions :

`pointBorne` 62 · `borneRetenue` 70 · `retientBorne` 76 · `oublieBorne` 79 · `lieuBorne` 98
`lieuNomme` 117 · `pointLibre` 122 · `poseLaBorne` 130 · `remetLeDepart` 155
`poseBorneIci` 169 · `armeLaPose` 178 · `montreBandeauBorne` 194 · `ecritDepartBorne` 208
`rayonBorne` 221 · `dessineBorne` 226 · `rafraichitBorne` 242 · `rempliBorne` 247
`relanceRepos` 276 · `reposeLaBorne` 283 · `demarreBorne` 314

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

### `_console-head.html` — 74 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console-js.html` — 3095 l. → admin-plans.html

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
`fabriqueLesVignettes` 2603 · `dupliquer` 2650 · `litMonProfil` 2750 · `RETOUR_MDP` 2761
`litComptes` 2763 · `ligneMessage` 2772 · `casesSalons` 2782 · `ouvreComptes` 2812
`ouvreFicheCompte` 2904 · `videEcran` 3063 · `dessine` 3068 · `demarre` 3083

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 651 l. → console.css

- l.592 · Page de rapport

### `_dessin.html` — 1922 l. → plan-admin.html, plan-smcl.html, plan.html

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
`ouvrePoi` 1245 · `mesureCartouche` 1317 · `phareRepere` 1326 · `phareZone` 1328
`eclairePoi` 1334 · `oublieChoixPoi` 1367 · `signale` 1376 · `calquePourImage` 1390
`poseImage` 1407 · `importeImage` 1420 · `dessinPointerDown` 1471 · `dessinPointerMove` 1545
`dessinPointerUp` 1583 · `termineTrace` 1619 · `aide` 1631 · `choisitOutil` 1656
`enchaineStand` 1680 · `activeCalque` 1739 · `cleVerrou` 1795 · `verrouille` 1796
`basculeVerrou` 1798 · `pictoVerrou` 1815 · `montreRoleIti` 1849 · `creeCalque` 1880
`demandeNom` 1893 · `renommeCalque` 1912

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

### `_head.html` — 4290 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones`
`#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnLangue` · `#btnTheme` · `#menuCompte` · `#avatarCompte` · `#compteMail`
`#btnThemeCompte` · `#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side`
`#poignee` · `#q` · `#videQ` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#count`
`#countTxt` · `#list` · `#piedSide` · `#btnConfidentialite` · `#stage` · `#fondCarteGL`
`#fondTuiles` · `#fondCarte` · `#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands`
`#labels` · `#calqueLibelles` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt`
`#creditCarte` · `#mentionOsm` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#calageBat` · `#calageAngle` · `#calageQuart` · `#calageStop` · `#calageValide`
`#bornePose` · `#bornePoser` · `#calage` · `#calageFerme` · `#calageCorps` · `#calageCarte`
`#calageEtat` · `#calageGarde` · `#outils` · `#outilsCalque` · `#renommeOutils`
`#fermeOutils` · `#roleIti` · `#roleAide` · `#voirNappe` · `#aimants` · `#aimantPas`
`#contourReg` · `#contourRayon` · `#contourAimant` · `#traitReg` · `#traitEpaisseur`
`#traitStyle` · `#traitFleche` · `#texteADessiner` · `#repereType` · `#repereTexte`
`#standSoc` · `#listeSoc` · `#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel`
`#elemType` · `#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens`
`#elemLiensListe` · `#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur`
`#elemHauteur` · `#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon`
`#elemTraitReg` · `#elemEpaisseur` · `#elemStyle` · `#elemFleche` · `#elemStand`
`#listeStands` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom`
`#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#modale` · `#mTitre` · `#mFermer`
`#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail` · `#poigneeFiche`
`#dMarque` · `#closeDetail` · `#dKind` · `#dNeuf` · `#dName` · `#dRen` · `#dLogo`
`#dBadges` · `#dCode` · `#dVis` · `#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg`
`#dOngNb` · `#dBody` · `#parcours` · `#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume`
`#pActs` · `#btnJournee` · `#btnPartage` · `#pCorps` · `#jCorps` · `#pPied`
`#videParcours` · `#jPied` · `#jRefaire` · `#jRetour` · `#itineraire` · `#closeItineraire`
`#iResume` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB`
`#iPmr` · `#iResultat` · `#videItineraire`

### `_hors-ligne.html` — 47 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_index.html` — 46 l. → index.html

Éléments :

`#secours`

### `_installation.html` — 491 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`reglageInstallation` 50 · `invitationVoulue` 51 · `auDoigt` 76 · `reponsesInstallation` 96
`retientInstallation` 101 · `jourInstallation` 110 · `invitationEcartee` 113
`refuseInstallation` 119 · `faconInstallation` 147 · `relanceInvitation` 165
`gesteInstallation` 170 · `doigtPose` 174 · `doigtLeve` 175 · `vueInstallation` 178
`accueilleInvitation` 187 · `invitationRetenue` 204 · `finInvitation` 218
`essaieInvitation` 237 · `teteInvitation` 327 · `retourAuxReglages` 342
`remplitInvitation` 350 · `ouvreInvitation` 380 · `ouvreInstalle` 430
`confirmeInstallation` 446 · `caseInstallation` 464

### `_itineraire.html` — 3036 l. → plan-admin.html, plan-smcl.html, plan.html

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
`bandeauVisee` 2822 · `armeVisee` 2840 · `finVisee` 2857 · `viseItineraire` 2873
`visePoi` 2879 · `visePoint` 2885 · `ouvreItineraire` 2914 · `fermeItineraire` 2942
`versItineraire` 2952 · `versItineraireDe` 2955

### `_journee.html` — 1004 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 70
`jourPropose` 83 · `pointConf` 98 · `departsProposes` 117 · `matriceJournee` 145
`rangeJournee` 247 · `calculeJournee` 364 · `rangJournee` 576 · `lienJournee` 588
`arretJournee` 595 · `remplitJournee` 620 · `appliqueVueParcours` 770 · `traceJournee` 800
`montreJournee` 808 · `perimeJournee` 821 · `ouvreOrganisation` 830 · `lanceJournee` 969

### `_js.html` — 4269 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.390 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.500 · 3. Rendu du pavillon courant
- l.581 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.717 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1739 · 6. Vue
- l.2120 · 7. Sélection et fiche
- l.3604 · 8. Interactions du plan
- l.3945 · Le tiroir de la liste — écrans étroits
- l.4102 · Le tiroir de la fiche — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `nomDeLaZone` 69 · `nomsAnglaisDesZones` 71 · `indexe` 79
`chronoConf` 309 · `rangeConferences` 330 · `poseFavicon` 377 · `largeur` 395
`decoupe` 420 · `habille` 433 · `lignesSvg` 444 · `coexComptes` 461 · `coexChoisit` 462
`ligneCode` 478 · `monteHabillage` 506 · `montePlan` 523 · `onglets` 557 · `changePlan` 573
`ancre` 589 · `place` 590 · `libelles` 592 · `decaleLibelle` 673 · `facteurLibelle` 674
`libelleForce` 675 · `libelleZone` 678 · `libelleEmplacement` 697 · `indexeSecteurs` 738
`secteursMontres` 751 · `couleurConf` 755 · `hslHex` 759 · `couleurSecteur` 777
`BANDES` 796 · `majFondus` 804 · `pastilleSecteur` 842 · `coloreSecteurs` 855
`peintSecteur` 906 · `appliqueSecteurs` 919 · `filtreTheme` 936 · `themeFiltrable` 1014
`clesCriteres` 1030 · `libelleCritere` 1037 · `separeValeurs` 1045 · `valeursCritere` 1062
`texteCriteres` 1075 · `indexeCriteres` 1088 · `dansCriteres` 1115 · `critereActif` 1123
`basculeCritere` 1125 · `videCriteres` 1134 · `majVideQ` 1143 · `videRecherche` 1156
`nCriteres` 1171 · `majCriteres` 1180 · `ouvreCriteres` 1238 · `filtre` 1362
`reposeRetrait` 1382 · `critParSociete` 1386 · `cherchable` 1396 · `visible` 1403
`releveHotes` 1419 · `visibleSurPlan` 1427 · `visibleSociete` 1438 · `marqueRetrait` 1454
`appliqueFiltre` 1466 · `oublieRetrait` 1478 · `reprendRecherche` 1487 · `rangSorte` 1500
`codeCase` 1522 · `caseNumero` 1539 · `sousLigne` 1559 · `liste` 1573 · `marqueChoisie` 1692
`prechargeMarque` 1718 · `cadrePlan` 1754 · `oublieCadre` 1755 · `figeTextes` 1771
`rendTextes` 1779 · `cadrage` 1815 · `peintLibelles` 1820 · `detacheLibelles` 1826
`rattacheLibelles` 1838 · `etireLibelles` 1856 · `appliqueVue` 1864 · `rafraichitVue` 1906
`poseVue` 1920 · `masque` 1940 · `masqueDroite` 1972 · `fit` 1983 · `stoppeZoom` 2013
`glisseVersVise` 2019 · `glisseVers` 2061 · `rectVisee` 2083 · `zoom` 2103 · `echelle` 2112
`ETROIT` 2126 · `anime` 2142 · `noeud` 2166 · `canalPlan` 2176 · `rangSociete` 2184
`select` 2193 · `centre` 2218 · `centrePoint` 2222 · `montre` 2267 · `libelleCorps` 2299
`ordreCorps` 2316 · `groupesFiche` 2348 · `montreIntitule` 2361 · `valeurCorps` 2381
`champCorps` 2394 · `groupeCorps` 2406 · `corpsRange` 2419 · `momentLocal` 2454
`programme` 2477 · `jourLong` 2510 · `ficheConf` 2521 · `lien` 2615 · `adresseWeb` 2623
`pictoRS` 2666 · `adresseSure` 2684 · `adresseVignette` 2714 · `adresseImage` 2728
`imageSure` 2741 · `assainitRiche` 2770 · `enBlocs` 2810 · `rangeRiche` 2823
`ecarteClicFantome` 2851 · `nomSociete` 2860 · `societes` 2873 · `choisitExposant` 2884
`poseMarque` 2922 · `montreMarque` 2982 · `recadreMarque` 3016 · `marqueRecadree` 3042
`imageChargee` 3071 · `vignetteMarque` 3087 · `boiteMarque` 3108 · `toileMarque` 3174
`poseCode` 3204 · `rangeMarque` 3245 · `ouvre` 3308 · `ferme` 3576 · `onglet` 3594
`milieu` 3624 · `commencePince` 3630 · `suitPince` 3644 · `saisitPlan` 3678
`cibleElargie` 3754 · `mesureTiroir` 3956 · `montreTiroir` 3959

Éléments :

`#data` · `#dGo` · `#dItin`

### `_langue.js` — 712 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

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

### `_motdepasse.html` — 245 l. → motdepasse.html

- l.57 · Poser un mot de passe

Fonctions :

`$` 73 · `CFG` 75 · `dit` 83 · `fragment` 89 · `garde` 96 · `lit` 100 · `demandeLien` 173
`ouvreSaisie` 182

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 541 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 58 · `verseAuParcours` 93
`plurielParcours` 111 · `contenuParcours` 120 · `retenusPourParcours` 146
`ajouteToutAuParcours` 171 · `poseToutAuParcours` 198 · `signetParcours` 224
`boutonParcours` 230 · `rafraichitMarque` 235 · `brancheParcours` 248 · `calqueMarques` 280
`dessineMarques` 296 · `marqueParcours` 326 · `rafraichitParcours` 340 · `instantConf` 368
`cleTemps` 372 · `jourCourt` 378 · `nomDeStand` 385 · `rangParcours` 387
`groupeParcours` 403 · `remplitParcours` 412 · `ouvreParcours` 486 · `fermeParcours` 498
`videLeParcours` 514

### `_partage.html` — 633 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrSvg` 402
`ouvrePartageParcours` 428 · `boutonsPartage` 477 · `accueilleParcoursPartage` 551
`adoptePartage` 629

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

### `_rapport-head.html` — 29 l. → rapport.html

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

### `_suggestion.html` — 679 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationsSugg` 83 · `presenteSugg` 89
`critereSugg` 94 · `indexSugg` 106 · `valeursSugg` 131 · `suggestionCourante` 150
`exposantPropose` 182 · `nomValeurSugg` 200 · `phraseSuggestion` 221 · `carteSuggestion` 249
`poseSuggestion` 298 · `fenetreSuggestion` 312 · `relevePalmares` 351 · `etiquetteSugg` 371
`voletSuggestion` 381

### `_sw.js` — 208 l. → sw.js

Fonctions :

`range` 76 · `oublieLesFondsDAvant` 99 · `dabordCache` 113 · `dabordReseau` 142
`navigation` 159

### `_tutoriel.html` — 854 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 17. La visite guidée — le tour du plan, geste par geste

Fonctions :

`reglageTuto` 52 · `tutoPropose` 61 · `cleTuto` 65 · `tutoOuvert` 67 · `tutoModale` 68
`tutoFicheOuverte` 74 · `tutoFiche` 77 · `tutoParcours` 79 · `tutoItineraire` 82
`zoneDuTuto` 91 · `insecable` 108 · `phraseTrajetTuto` 114 · `chapitresTuto` 358
`proposeTutoriel` 378 · `lanceTutoriel` 426 · `quitteTutoriel` 512 · `chapitreTuto` 523
`battementTuto` 532 · `finTuto` 550 · `afficheTuto` 567 · `boiteTuto` 613 · `repereTuto` 627
`rameneTuto` 660 · `placeTuto` 698 · `voileTuto` 771 · `rafaleTuto` 788
`marqueZoneTuto` 808 · `marqueLibelleTuto` 843

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `_webgl.html` — 1337 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 78 · `poseToileWebgl` 164 · `guetteContexteWebgl` 170
`contextePerduWebgl` 180 · `verifieContexteWebgl` 187 · `perdContexteWebgl` 196
`remonteWebgl` 217 · `vueDeck` 234 · `vueWebgl` 243 · `blocDe` 252 · `enEdition` 282
`majEditionWebgl` 285 · `cleBloc` 297 · `planifieWebgl` 323 · `toutRepeindreWebgl` 327
`blocsDansLOrdre` 334 · `repeintWebgl` 339 · `assembleWebgl` 363 · `constTexte` 397
`couchesTexte` 455 · `mulM` 489 · `appM` 492 · `echelleM` 493 · `lisTransform` 495
`lisTrace` 517 · `lisPoints` 585 · `num` 591 · `anneau` 593 · `rectArrondi` 599
`couleurGl` 613 · `accVide` 630 · `convertitBloc` 631 · `accDe` 645 · `parcoursGl` 652
`avecTrous` 692 · `formeGl` 713 · `texteGl` 749 · `imageGl` 772 · `partage` 804
`designeGl` 810 · `couchesDeBloc` 812 · `modelesLibellesHtml` 873
`poseModelesLibelles` 883 · `lisModelesLibelles` 889 · `emplacementWebgl` 918
`libellesWebgl` 966 · `groupesNoms` 1029 · `couchesNoms` 1045 · `couchesPastilles` 1056
`couchesLibellesWebgl` 1071 · `couchesDessineesWebgl` 1078 · `stage` 1099
`brancheSurvolWebgl` 1103 · `poseSurvolWebgl` 1123 · `poseCurseurWebgl` 1132
`poseFocusWebgl` 1141 · `aplatsDe` 1148 · `coucheSurvol` 1151 · `coucheFocus` 1160
`couchesPhare` 1187 · `lueurDe` 1203 · `opacitePhare` 1241 · `echellePhare` 1242
`couchesPhareNoms` 1245 · `animeCouche` 1259 · `majAnimationWebgl` 1273 · `animeWebgl` 1281
`objetSous` 1304 · `cibleWebgl` 1311 · `priseWebgl` 1318 · `libelleSousWebgl` 1323
`rectEcranWebgl` 1328

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 510 l.

`valeursDe` 327

### `supabase/functions/_partage/eventmaker.ts` — 1015 l.

`grapheJson` 178 · `enParallele` 823 · `texteSeul` 843 · `champs` 980

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `distSegment` 55 · `distBord` 64 · `poleInterieur` 83 · `portee` 104

### `supabase/functions/_partage/octets.ts` — 18 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106

### `supabase/functions/_partage/version.ts` — 77 l.

`condense` 73

### `supabase/functions/_partage/vignette.ts` — 186 l.

`cadre` 69 · `decoupe` 111

### `supabase/functions/mesure/index.ts` — 155 l.

`jeton` 73 · `client` 76

### `supabase/functions/plan-public/index.ts` — 763 l.

`cors` 50 · `db` 84 · `service` 99 · `vignettesParAdresse` 116 · `avecVignette` 153
`rendVignette` 189 · `lu` 222 · `salon` 232 · `retraits` 310 · `ampute` 334
`masquesDe` 374 · `masquesDuPlan` 394

### `supabase/functions/sync-evenement/index.ts` — 1591 l.

`cors` 42 · `bourre` 111 · `client` 121 · `ecrit` 143 · `gaia` 151 · `libellesChoix` 162
`retiensAnglais` 189 · `fournisseur` 207 · `raccourci` 215 · `enClair` 252 · `range` 278
`champsKlipso` 299 · `hebergee` 1548 · `nettoieUrl` 1567 · `groupeTextes` 1577

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

## Le reste

- `src/index.mjs` — 334 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 66 · `amontPour` 75 · `cleDe` 83 · `meta` 86 · `gardable` 99 · `range` 105 `rafraichit` 112 · `oublie` 139 · `manifeste` 212 · `mesure` 238
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
