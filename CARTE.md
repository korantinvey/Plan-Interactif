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

### `_console-js.html` — 3019 l. → admin-plans.html

- l.937 · Provenance des données
- l.1064 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 127 · `fonction` 402 · `slugifie` 416
`courant` 420 · `charge` 422 · `chargePlans` 437 · `majEvenement` 442 · `selonAdresse` 462
`majAdresse` 470 · `majBarre` 485 · `dessineChoix` 527 · `champ` 547 · `reduitIcone` 601
`champFavicon` 642 · `fuseauConnu` 738 · `champFuseau` 750 · `dessineFiche` 813
`fournisseurUtilise` 999 · `source` 1003 · `champCle` 1008 · `ligneSource` 1043
`paraitSurFiche` 1173 · `origineConferences` 1179 · `resumeProvenance` 1244
`resumeFiche` 1261 · `caseFiche` 1306 · `champsPersos` 1348 · `criteres` 1354
`ecritFiche` 1357 · `caseCritere` 1372 · `clePerso` 1391 · `ajouteChampPerso` 1399
`renommeChampPerso` 1417 · `retireChampPerso` 1465 · `lignesPerso` 1523 · `ligneOutil` 1543
`ligneReglage` 1559 · `ouvreProvenance` 1571 · `ouvreSources` 1594 · `cadreFiche` 1646
`ouvreFiche` 1676 · `cadreCategories` 1814 · `sousTitre` 1893 · `tableauChamps` 1908
`encode` 2051 · `decode` 2053 · `correspondance` 2058 · `sansPrefixe` 2061 · `courte` 2062
`intitule` 2077 · `intituleSuite` 2089 · `separeValeurs` 2103 · `aplani` 2124
`memeStyle` 2134 · `autreFace` 2152 · `champOrigine` 2168 · `majLiens` 2435
`majIntegration` 2472 · `majMsgSync` 2479 · `etapesPressenties` 2509 · `synchronise` 2523
`dupliquer` 2574 · `litMonProfil` 2674 · `RETOUR_MDP` 2685 · `litComptes` 2687
`ligneMessage` 2696 · `casesSalons` 2706 · `ouvreComptes` 2736 · `ouvreFicheCompte` 2828
`videEcran` 2987 · `dessine` 2992 · `demarre` 3007

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

### `_head.html` — 4267 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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

### `_js.html` — 4185 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.390 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.500 · 3. Rendu du pavillon courant
- l.581 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.717 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1723 · 6. Vue
- l.2104 · 7. Sélection et fiche
- l.3548 · 8. Interactions du plan
- l.3866 · Le tiroir de la liste — écrans étroits
- l.4023 · Le tiroir de la fiche — écrans étroits

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
`nCriteres` 1171 · `majCriteres` 1180 · `ouvreCriteres` 1238 · `filtre` 1351
`reposeRetrait` 1371 · `critParSociete` 1375 · `cherchable` 1385 · `visible` 1392
`releveHotes` 1408 · `visibleSurPlan` 1416 · `visibleSociete` 1427 · `marqueRetrait` 1443
`appliqueFiltre` 1455 · `oublieRetrait` 1467 · `reprendRecherche` 1476 · `rangSorte` 1489
`codeCase` 1511 · `caseNumero` 1528 · `sousLigne` 1548 · `liste` 1562 · `marqueChoisie` 1681
`prechargeMarque` 1707 · `cadrePlan` 1738 · `oublieCadre` 1739 · `figeTextes` 1755
`rendTextes` 1763 · `cadrage` 1799 · `peintLibelles` 1804 · `detacheLibelles` 1810
`rattacheLibelles` 1822 · `etireLibelles` 1840 · `appliqueVue` 1848 · `rafraichitVue` 1890
`poseVue` 1904 · `masque` 1924 · `masqueDroite` 1956 · `fit` 1967 · `stoppeZoom` 1997
`glisseVersVise` 2003 · `glisseVers` 2045 · `rectVisee` 2067 · `zoom` 2087 · `echelle` 2096
`ETROIT` 2110 · `anime` 2126 · `noeud` 2150 · `canalPlan` 2160 · `rangSociete` 2168
`select` 2177 · `centre` 2202 · `centrePoint` 2206 · `montre` 2251 · `libelleCorps` 2283
`ordreCorps` 2300 · `groupesFiche` 2332 · `montreIntitule` 2345 · `valeurCorps` 2365
`champCorps` 2378 · `groupeCorps` 2390 · `corpsRange` 2403 · `momentLocal` 2438
`programme` 2461 · `jourLong` 2494 · `ficheConf` 2505 · `lien` 2599 · `adresseWeb` 2607
`pictoRS` 2650 · `adresseSure` 2668 · `adresseImage` 2695 · `imageSure` 2708
`assainitRiche` 2737 · `enBlocs` 2777 · `rangeRiche` 2790 · `ecarteClicFantome` 2818
`nomSociete` 2827 · `societes` 2840 · `choisitExposant` 2851 · `poseMarque` 2889
`montreMarque` 2936 · `recadreMarque` 2969 · `marqueRecadree` 2992 · `imageChargee` 3021
`vignetteMarque` 3037 · `boiteMarque` 3058 · `toileMarque` 3124 · `poseCode` 3154
`rangeMarque` 3195 · `ouvre` 3257 · `ferme` 3520 · `onglet` 3538 · `milieu` 3568
`commencePince` 3574 · `suitPince` 3588 · `cibleElargie` 3675 · `mesureTiroir` 3877
`montreTiroir` 3880

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

### `_parcours.html` — 402 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 58 · `signetParcours` 87 · `boutonParcours` 93
`rafraichitMarque` 98 · `brancheParcours` 111 · `calqueMarques` 143 · `dessineMarques` 159
`marqueParcours` 189 · `rafraichitParcours` 203 · `instantConf` 231 · `cleTemps` 235
`jourCourt` 241 · `nomDeStand` 248 · `rangParcours` 250 · `groupeParcours` 266
`remplitParcours` 275 · `ouvreParcours` 347 · `fermeParcours` 359 · `videLeParcours` 375

### `_partage.html` — 654 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrSvg` 402
`ouvrePartageParcours` 428 · `boutonsPartage` 477 · `accueilleParcoursPartage` 551
`adoptePartage` 637

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

### `_sw.js` — 205 l. → sw.js

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

### `_webgl.html` — 1229 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`monteWebgl` 77 · `vueDeck` 127 · `vueWebgl` 136 · `blocDe` 145 · `enEdition` 175
`majEditionWebgl` 178 · `cleBloc` 190 · `planifieWebgl` 216 · `toutRepeindreWebgl` 220
`blocsDansLOrdre` 227 · `repeintWebgl` 232 · `assembleWebgl` 256 · `constTexte` 290
`couchesTexte` 348 · `mulM` 382 · `appM` 385 · `echelleM` 386 · `lisTransform` 388
`lisTrace` 410 · `lisPoints` 478 · `num` 484 · `anneau` 486 · `rectArrondi` 492
`couleurGl` 506 · `accVide` 523 · `convertitBloc` 524 · `accDe` 538 · `parcoursGl` 545
`avecTrous` 585 · `formeGl` 606 · `texteGl` 642 · `imageGl` 665 · `partage` 697
`designeGl` 703 · `couchesDeBloc` 705 · `modelesLibellesHtml` 766
`poseModelesLibelles` 776 · `lisModelesLibelles` 781 · `emplacementWebgl` 810
`libellesWebgl` 858 · `groupesNoms` 921 · `couchesNoms` 937 · `couchesPastilles` 948
`couchesLibellesWebgl` 963 · `couchesDessineesWebgl` 970 · `stage` 991
`brancheSurvolWebgl` 995 · `poseSurvolWebgl` 1015 · `poseCurseurWebgl` 1024
`poseFocusWebgl` 1033 · `aplatsDe` 1040 · `coucheSurvol` 1043 · `coucheFocus` 1052
`couchesPhare` 1079 · `lueurDe` 1095 · `opacitePhare` 1133 · `echellePhare` 1134
`couchesPhareNoms` 1137 · `animeCouche` 1151 · `majAnimationWebgl` 1165 · `animeWebgl` 1173
`objetSous` 1196 · `cibleWebgl` 1203 · `priseWebgl` 1210 · `libelleSousWebgl` 1215
`rectEcranWebgl` 1220

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 474 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/eventmaker.ts` — 890 l.

`grapheJson` 159 · `enParallele` 711 · `texteSeul` 731 · `champs` 855

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `distSegment` 55 · `distBord` 64 · `poleInterieur` 83 · `portee` 104

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106

### `supabase/functions/_partage/version.ts` — 77 l.

`condense` 73

### `supabase/functions/mesure/index.ts` — 155 l.

`jeton` 73 · `client` 76

### `supabase/functions/plan-public/index.ts` — 643 l.

`cors` 49 · `db` 83 · `lu` 110 · `salon` 120 · `retraits` 198 · `ampute` 222
`masquesDe` 262 · `masquesDuPlan` 282

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

## Le reste

- `src/index.mjs` — 326 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 64 · `amontPour` 73 · `cleDe` 81 · `meta` 84 · `gardable` 97 · `range` 102 `rafraichit` 109 · `oublie` 136 · `manifeste` 209 · `mesure` 235
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
