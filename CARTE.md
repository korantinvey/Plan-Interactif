<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 2231 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.1273 · 10. Mode administration
- l.1348 · La fiche d'une zone organisateur
- l.1978 · Masquer une zone organisateur
- l.2061 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `salonPartage` 335 · `trio` 348 · `melange` 358
`themeSombre` 366 · `appliqueAccent` 380 · `appliqueFond` 411 · `modeleRetenu` 449
`posePoliceLibelles` 499 · `appliqueModele` 526 · `texteCorps` 596 · `standApercu` 611
`lignesApercu` 631 · `contenuApercu` 657 · `apercuFiche` 690 · `apercuListe` 754
`apercuDuo` 776 · `glisseFenetre` 809 · `ouvreReglages` 820 · `voletZones` 902
`ficheZoneEnPlace` 979 · `voletPlan` 997 · `nomDuTon` 1124 · `voletApparence` 1129
`enregistreConf` 1223 · `rgbHex` 1229 · `hexa` 1236 · `luminance` 1240 · `ecarte` 1254
`joli` 1269 · `retireAdmin` 1286 · `activeAdmin` 1299 · `champZone` 1374 · `champsZone` 1399
`champSalles` 1455 · `nomDeZone` 1507 · `reduitLogo` 1541 · `champLogo` 1582
`editeurRiche` 1679 · `memeFicheZone` 1836 · `suitFicheZone` 1841 · `verseFicheZone` 1849
`ficheZone` 1875 · `enregistreZone` 1900 · `basculeAffichageZone` 1989
`marqueZonesMasquees` 2006 · `ecritTablesZones` 2026 · `ecritTableZones` 2057
`cleLibelle` 2082 · `empreinteLibelle` 2098 · `placementLibelle` 2106 · `posePlacement` 2116
`libelleAutomatique` 2133 · `modePlacementLibelles` 2142 · `majPaletteLibelle` 2159
`choisitLibelle` 2176 · `pousseLibelle` 2183 · `libellePointerDown` 2191
`libellePointerMove` 2206 · `libellePointerUp` 2215

Éléments :

`#pousseConf`

### `_admin2.html` — 141 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 24 · `entetesApi` 39 · `chargeFond` 62 · `charge` 94

### `_aimants.html` — 474 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 quater. Dessiner juste — cote, aimants, répétition

Fonctions :

`ecritMetres` 15 · `coteCadre` 19 · `montreCote` 31 · `aimantsActifs` 59 · `axesDe` 63
`pointsAimants` 68 · `aimantsDuPlan` 83 · `pasAimant` 114 · `cale` 122 · `sousLeGeste` 127
`cranGrille` 138 · `oublieAimants` 155 · `aimantsDessines` 157 · `coinsGeste` 183
`montreAimants` 205 · `meilleurSommet` 270 · `croixAimant` 284 · `correction` 307
`aimante` 348 · `retientTaille` 362 · `reprendTaille` 376 · `dupliqueForme` 397
`pousseForme` 422 · `ecritDimensions` 438 · `appliqueDimension` 457

### `_auth-plan.html` — 182 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `mailDuJeton` 120 · `initialesDe` 129 · `themeSombreA` 136
`poseCompte` 141

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `_chaleur.html` — 609 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.410 · Remise à zéro des compteurs

Fonctions :

`nbChal` 32 · `tonChaleur` 51 · `niveauChaleur` 73 · `valeurChaleur` 76 · `chargeChaleur` 89
`coloreChaleur` 130 · `cartoucheChaleur` 165 · `mesureCartoucheChaleur` 229
`replieChaleur` 235 · `ecritEtatChaleur` 246 · `dessineEchelleChaleur` 254
`dessineTopChaleur` 274 · `phraseChaleur` 305 · `rafraichitChaleur` 322
`montreChaleur` 356 · `rangChaleur` 392 · `aplati` 432 · `voletMesure` 437
`evenementCourant` 463 · `ouvreRemiseAZero` 482 · `lanceRemiseAZero` 571

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `_classeur.html` — 234 l. → admin-plans.html, rapport.html

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 29 · `crc32` 39 · `archiveZip` 54 · `texteXml` 110 · `colonneXl` 113
`XL_PARTS` 124 · `feuilleXl` 178 · `classeurXl` 214 · `enregistreFichier` 225

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 484 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 16 · `esc` 17 · `entetes` 38 · `contenuJeton` 47 · `resteJeton` 57 · `renouvelle` 67
`appel` 101 · `rest` 112 · `verseModale` 142 · `ouvreModale` 148 · `verrouilleModale` 171
`fermeModale` 173 · `demande` 186 · `confirme` 208 · `ecranConfig` 219 · `normaliseUrl` 255
`ecranConnexion` 274 · `deconnecte` 337 · `signale` 348 · `bloc` 369 · `grille` 387
`idCompte` 430 · `themeSombre` 440 · `initialesDe` 460

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 69 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet` · `#btnExport` · `#btnCompte`
`#initiales` · `#compteMail` · `#btnTheme` · `#btnSortir` · `#fiche`

### `_console-js.html` — 3048 l. → admin-plans.html

- l.681 · Provenance des données
- l.808 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 119 · `fonction` 394 · `slugifie` 408
`courant` 412 · `charge` 414 · `chargePlans` 429 · `majEvenement` 434 · `selonAdresse` 454
`majAdresse` 462 · `majBarre` 477 · `dessineChoix` 519 · `champ` 539 · `dessineFiche` 564
`fournisseurUtilise` 743 · `source` 747 · `champCle` 752 · `ligneSource` 787
`origineConferences` 922 · `resumeProvenance` 987 · `resumeFiche` 1004 · `caseFiche` 1047
`champsPersos` 1090 · `criteres` 1096 · `ecritFiche` 1099 · `caseCritere` 1114
`clePerso` 1133 · `ajouteChampPerso` 1141 · `renommeChampPerso` 1152
`retireChampPerso` 1170 · `lignesPerso` 1218 · `clesCorps` 1253 · `ordreEffectif` 1267
`libelleCorps` 1282 · `champsLus` 1324 · `exempleCible` 1339 · `valeurApercu` 1361
`dessineApercu` 1389 · `panneauOrdre` 1473 · `ligneOutil` 1655 · `ligneReglage` 1671
`ouvreProvenance` 1683 · `ouvreSources` 1706 · `cadreFiche` 1758 · `ouvreFiche` 1787
`sousTitre` 1937 · `tableauChamps` 1952 · `encode` 2095 · `decode` 2097
`correspondance` 2102 · `sansPrefixe` 2105 · `courte` 2106 · `intitule` 2121
`intituleSuite` 2133 · `separeValeurs` 2147 · `aplani` 2168 · `memeStyle` 2178
`autreFace` 2196 · `champOrigine` 2212 · `majLiens` 2479 · `majIntegration` 2506
`majMsgSync` 2513 · `etapesPressenties` 2543 · `synchronise` 2557 · `dupliquer` 2608
`litMonProfil` 2706 · `RETOUR_MDP` 2717 · `litComptes` 2719 · `ligneMessage` 2728
`casesSalons` 2738 · `ouvreComptes` 2768 · `ouvreFicheCompte` 2860 · `videEcran` 3019
`dessine` 3024 · `demarre` 3036

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 672 l. → console.css

- l.618 · Page de rapport

### `_dessin.html` — 1498 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 30 · `mesCalques` 38 · `enregistreDessins` 39
`instantane` 70 · `memorise` 71 · `restaure` 76 · `annule` 85 · `refais` 97
`trouveCalque` 99 · `nouvelId` 100 · `cheminArrondi` 118 · `estCadre` 161
`cheminForme` 163 · `dessineDessins` 175 · `versPlan` 217 · `apercu` 223 · `apercuGuide` 235
`toleranceTrace` 259 · `aimanteContour` 264 · `rayonContour` 267 · `redresseTrace` 286
`traceGuide` 320 · `fermeIci` 327 · `ajouteForme` 332 · `pictoDe` 428 · `nomTypeRepere` 466
`typeZone` 492 · `pictoForme` 503 · `traceRepere` 520 · `etiquetteSociete` 588
`nomSurLePlan` 592 · `societeDeForme` 603 · `societesDuPlan` 614
`remplitListeSocietes` 625 · `societeSaisie` 633 · `traceStandDessine` 649
`texteStandDessine` 673 · `poseLibellesDessines` 691 · `decoupeStand` 712
`marqueStandsDessines` 724 · `rafraichitStandsDessines` 739 · `oublieReperes` 769
`reperesCherchables` 771 · `vaAuRepere` 815 · `cartouchePoi` 836 · `ouvrePoi` 921
`mesureCartouche` 993 · `phareRepere` 1000 · `phareZone` 1001 · `eclairePoi` 1005
`signale` 1023 · `calquePourImage` 1037 · `poseImage` 1050 · `importeImage` 1063
`dessinPointerDown` 1114 · `dessinPointerMove` 1188 · `dessinPointerUp` 1226
`termineTrace` 1262 · `aide` 1272 · `choisitOutil` 1297 · `enchaineStand` 1320
`activeCalque` 1374 · `montreRoleIti` 1425 · `creeCalque` 1456 · `demandeNom` 1469
`renommeCalque` 1488

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 495 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 171 · `ecritDesDeuxCotes` 193
`changeLien` 205 · `changeDureeLien` 221 · `majLiens` 238 · `etiquetteStand` 282
`remplitListeStands` 287 · `standSaisi` 296 · `appliqueLiaison` 306 · `appliqueSociete` 324
`appliqueTexte` 340 · `appliqueRayon` 350 · `appliquePicto` 360 · `supprimeForme` 378
`editionPointerDown` 388 · `editionPointerMove` 433 · `editionPointerUp` 485

### `_export.html` — 146 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 59 · `libellePeriode` 76 · `nomFichierExport` 82
`nomFeuilleExport` 92 · `exporteExposants` 108

### `_head.html` — 3072 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#menuCompte`
`#avatarCompte` · `#compteMail` · `#btnThemeCompte` · `#btnSortir` · `#side` · `#poignee`
`#q` · `#videQ` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#countTxt` · `#list` · `#stage`
`#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#zIn` · `#zOut` · `#zFit`
`#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#outils`
`#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#texteADessiner` · `#repereType` · `#repereTexte` · `#standSoc`
`#listeSoc` · `#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemStand`
`#listeStands` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom`
`#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#modale` · `#mTitre` · `#mFermer`
`#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail` · `#dMarque`
`#closeDetail` · `#dKind` · `#dNeuf` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode`
`#dVis` · `#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody`
`#parcours` · `#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps`
`#jCorps` · `#pPied` · `#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire` · `#jRetour`
`#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA` · `#iSugg`
`#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 2431 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 86 · `enveloppe` 95 · `oublieGrilles` 138 · `calquesDe` 141 · `reperesDe` 146
`cleRoleIti` 196 · `roleIti` 197 · `nomRoleIti` 198 · `formesRole` 214 · `obstaclesPmr` 239
`anglePlan` 276 · `dansGrille` 315 · `horsGrille` 316 · `grille` 326 · `distanceAuMur` 405
`nappePrincipale` 447 · `celluleDe` 482 · `caseDe` 486 · `centreCase` 491 · `empriseDe` 513
`accrocheDepuis` 545 · `versLeMilieu` 601 · `accroche` 628 · `Tas` 643 · `travail` 687
`cherche` 705 · `distancesDepuis` 771 · `distancesMulti` 785 · `reduit` 820
`guidageAllees` 856 · `recentre` 885 · `passable` 933 · `lisse` 966 · `longueur` 991
`longueurDehors` 1007 · `nettoie` 1049 · `oublieFaces` 1084 · `facesLibres` 1086
`amorce` 1159 · `faceDeSortie` 1194 · `accesDe` 1224 · `couplesAcces` 1259 · `troncon` 1279
`pointObjet` 1312 · `pointRepere` 1319 · `candidats` 1328 · `pointSaisi` 1354
`portesDe` 1371 · `versPorte` 1376 · `typeLiaison` 1431 · `nomRepere` 1437
`oublieLiaisons` 1455 · `lienEcrits` 1467 · `ecritLiens` 1476 · `annuaireLiaisons` 1481
`liensDe` 1513 · `coutLiaison` 1533 · `passagePraticable` 1540 · `passagesDe` 1548
`sortiesDe` 1558 · `plansRelies` 1566 · `balayage` 1590 · `distanceDepuis` 1604
`cheminLiaisons` 1631 · `routeParLiaisons` 1715 · `routeEntre` 1751 · `calculeRoute` 1790
`couleurNappe` 1816 · `rafraichitApercu` 1822 · `marchesIci` 1865 · `rayonBout` 1870
`dessineItineraire` 1875 · `rafraichitBouts` 1919 · `cadreItineraire` 1942 · `champIti` 1966
`ecritDistance` 1970 · `ecritDuree` 1978 · `fermeSugg` 1983 · `montreSugg` 1990
`choisitPoint` 2022 · `valideSaisie` 2031 · `effaceItineraire` 2041 · `relance` 2063
`phraseLiaison` 2114 · `montreResultat` 2128 · `bandeauVisee` 2250 · `armeVisee` 2264
`finVisee` 2272 · `viseItineraire` 2284 · `visePoi` 2290 · `visePoint` 2296
`ouvreItineraire` 2317 · `fermeItineraire` 2343 · `versItineraire` 2353
`versItineraireDe` 2356

### `_journee.html` — 895 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 237 · `calculeJournee` 333 · `rangJournee` 521 · `lienJournee` 533
`arretJournee` 540 · `remplitJournee` 565 · `appliqueVueParcours` 703 · `traceJournee` 729
`montreJournee` 737 · `perimeJournee` 750 · `ouvreOrganisation` 759 · `lanceJournee` 860

### `_js.html` — 3069 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.276 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.386 · 3. Rendu du pavillon courant
- l.453 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.573 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1429 · 6. Vue
- l.1699 · 7. Sélection et fiche
- l.2693 · 8. Interactions du plan
- l.2915 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `indexe` 55 · `chronoConf` 222 · `rangeConferences` 243
`largeur` 281 · `decoupe` 306 · `habille` 319 · `lignesSvg` 330 · `coexComptes` 347
`coexChoisit` 348 · `ligneCode` 364 · `monteHabillage` 392 · `montePlan` 409 · `onglets` 438
`changePlan` 445 · `ancre` 461 · `place` 462 · `libelles` 464 · `decaleLibelle` 529
`facteurLibelle` 530 · `libelleForce` 531 · `libelleZone` 534 · `libelleEmplacement` 553
`indexeSecteurs` 594 · `secteursMontres` 607 · `couleurConf` 611 · `hslHex` 615
`couleurSecteur` 633 · `BANDES` 652 · `majFondus` 660 · `pastilleSecteur` 698
`coloreSecteurs` 711 · `appliqueSecteurs` 754 · `filtreTheme` 771 · `themeFiltrable` 848
`clesCriteres` 864 · `libelleCritere` 871 · `separeValeurs` 879 · `valeursCritere` 896
`texteCriteres` 909 · `indexeCriteres` 922 · `dansCriteres` 949 · `critereActif` 957
`basculeCritere` 959 · `videCriteres` 967 · `majVideQ` 975 · `videRecherche` 988
`nCriteres` 1002 · `majCriteres` 1011 · `ouvreCriteres` 1069 · `filtre` 1182
`critParSociete` 1186 · `cherchable` 1196 · `visible` 1203 · `releveHotes` 1219
`visibleSurPlan` 1227 · `visibleSociete` 1237 · `appliqueFiltre` 1243 · `rangSorte` 1263
`codeCase` 1285 · `caseNumero` 1302 · `sousLigne` 1322 · `liste` 1336 · `cadrePlan` 1444
`oublieCadre` 1445 · `figeTextes` 1461 · `rendTextes` 1466 · `appliqueVue` 1471
`rafraichitVue` 1492 · `poseVue` 1504 · `masque` 1523 · `masqueDroite` 1555 · `fit` 1566
`stoppeZoom` 1596 · `glisseVersVise` 1602 · `glisseVers` 1644 · `rectVisee` 1666
`zoom` 1685 · `echelle` 1691 · `ETROIT` 1705 · `anime` 1707 · `noeud` 1731
`canalPlan` 1741 · `rangSociete` 1749 · `select` 1758 · `centre` 1777 · `centrePoint` 1781
`montre` 1814 · `libelleCorps` 1847 · `ordreCorps` 1859 · `momentLocal` 1896
`programme` 1919 · `jourLong` 1952 · `ficheConf` 1963 · `lien` 2057 · `adresseSure` 2072
`adresseImage` 2099 · `imageSure` 2112 · `assainitRiche` 2141 · `enBlocs` 2181
`rangeRiche` 2194 · `ecarteClicFantome` 2222 · `nomSociete` 2231 · `societes` 2244
`choisitExposant` 2255 · `poseMarque` 2293 · `poseCode` 2343 · `rangeMarque` 2374
`ouvre` 2420 · `ferme` 2667 · `onglet` 2683 · `milieu` 2713 · `commencePince` 2719
`suitPince` 2733 · `mesureTiroir` 2926 · `montreTiroir` 2929

Éléments :

`#data` · `#dGo` · `#dItin`

### `_mesure.html` — 147 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 13. Mesure d'utilisation

Fonctions :

`jetonMesure` 25 · `jetonRetenu` 46 · `envoieMesures` 79 · `mesure` 117

### `_modales.html` — 161 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 28 · `fermeModale` 45 · `confirme` 52 · `deplaceVers` 70
`versExtremite` 82 · `remplitOrdre` 90 · `ouvreOrdre` 152

### `_motdepasse.html` — 242 l. → motdepasse.html

- l.54 · Poser un mot de passe

Fonctions :

`$` 70 · `CFG` 72 · `dit` 80 · `fragment` 86 · `garde` 93 · `lit` 97 · `demandeLien` 170
`ouvreSaisie` 179

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 358 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 50 · `signetParcours` 74 · `boutonParcours` 80
`rafraichitMarque` 85 · `brancheParcours` 97 · `calqueMarques` 129 · `dessineMarques` 145
`marqueParcours` 175 · `rafraichitParcours` 189 · `instantConf` 213 · `cleTemps` 217
`jourCourt` 223 · `rangParcours` 227 · `groupeParcours` 243 · `remplitParcours` 252
`ouvreParcours` 314 · `fermeParcours` 326

### `_pile.html` — 444 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.260 · Repères
- l.312 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 69 · `boutonAjout` 76 · `intertitre` 84 · `construitPanneau` 91
`sectionSelection` 276 · `sectionFond` 332 · `ligneCouleur` 386 · `rangSecteur` 406
`rangSous` 418 · `defautCouleur` 440

### `_pousse.html` — 145 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pousser la configuration

Fonctions :

`majAttente` 25 · `accesBase` 36 · `base` 45 · `reglagesSeuls` 63 · `pousseConfiguration` 67

### `_rapport-head.html` — 30 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnTheme` · `#rapport`

### `_rapport-js.html` — 308 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`courant` 35 · `chargeEvenements` 40 · `joursPeriode` 58 · `chargeRapport` 60 · `chiffre` 71
`barres` 90 · `jours` 117 · `dessineRapport` 138 · `dessineBarre` 236 · `rafraichit` 259
`videEcran` 278 · `demarre` 294

Éléments :

`#lienPublic`

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 474 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/eventmaker.ts` — 753 l.

`grapheJson` 147 · `enParallele` 615 · `texteSeul` 635 · `champs` 718

### `supabase/functions/_partage/gaia.ts` — 286 l.

`aplatit` 247

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `distSegment` 55 · `distBord` 64 · `poleInterieur` 83 · `portee` 104

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106

### `supabase/functions/_partage/version.ts` — 77 l.

`condense` 73

### `supabase/functions/mesure/index.ts` — 125 l.

`cors` 38 · `jeton` 52 · `client` 55

### `supabase/functions/plan-public/index.ts` — 549 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 163 · `ampute` 186 · `masquesDe` 226
`masquesDuPlan` 246

### `supabase/functions/sync-evenement/index.ts` — 1330 l.

`cors` 42 · `bourre` 100 · `client` 110 · `gaia` 117 · `libellesChoix` 128
`fournisseur` 153 · `range` 189 · `champsKlipso` 210 · `hebergee` 1287 · `nettoieUrl` 1306
`groupeTextes` 1316

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/controle.js` — analyse le script de chaque page construite, en module
  ES : une redéclaration y est une erreur, là où un `<script>` la tolère.
- `outils/migration.js` — crée une migration horodatée à la seconde.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
