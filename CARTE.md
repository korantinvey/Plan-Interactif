<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 2246 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.1285 · 10. Mode administration
- l.1363 · La fiche d'une zone organisateur
- l.1993 · Masquer une zone organisateur
- l.2076 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `salonPartage` 335 · `trio` 348 · `melange` 358
`themeSombre` 366 · `appliqueAccent` 380 · `appliqueFond` 411 · `modeleRetenu` 449
`posePoliceLibelles` 499 · `appliqueModele` 527 · `texteCorps` 598 · `standApercu` 613
`lignesApercu` 636 · `contenuApercu` 662 · `apercuFiche` 699 · `apercuListe` 764
`apercuDuo` 786 · `glisseFenetre` 819 · `ouvreReglages` 830 · `voletZones` 912
`ficheZoneEnPlace` 989 · `voletPlan` 1007 · `nomDuTon` 1134 · `voletApparence` 1139
`enregistreConf` 1234 · `rgbHex` 1241 · `hexa` 1248 · `luminance` 1252 · `ecarte` 1266
`joli` 1281 · `retireAdmin` 1298 · `activeAdmin` 1311 · `champZone` 1389 · `champsZone` 1414
`champSalles` 1470 · `nomDeZone` 1522 · `reduitLogo` 1556 · `champLogo` 1597
`editeurRiche` 1694 · `memeFicheZone` 1851 · `suitFicheZone` 1856 · `verseFicheZone` 1864
`ficheZone` 1890 · `enregistreZone` 1915 · `basculeAffichageZone` 2004
`marqueZonesMasquees` 2021 · `ecritTablesZones` 2041 · `ecritTableZones` 2072
`cleLibelle` 2097 · `empreinteLibelle` 2113 · `placementLibelle` 2121 · `posePlacement` 2131
`libelleAutomatique` 2148 · `modePlacementLibelles` 2157 · `majPaletteLibelle` 2174
`choisitLibelle` 2191 · `pousseLibelle` 2198 · `libellePointerDown` 2206
`libellePointerMove` 2221 · `libellePointerUp` 2230

Éléments :

`#pousseConf`

### `_admin2.html` — 148 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 28 · `entetesApi` 46 · `chargeFond` 69 · `charge` 101

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

### `_console-js.html` — 3225 l. → admin-plans.html

- l.829 · Provenance des données
- l.956 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 119 · `fonction` 394 · `slugifie` 408
`courant` 412 · `charge` 414 · `chargePlans` 429 · `majEvenement` 434 · `selonAdresse` 454
`majAdresse` 462 · `majBarre` 477 · `dessineChoix` 519 · `champ` 539 · `reduitIcone` 593
`champFavicon` 634 · `dessineFiche` 711 · `fournisseurUtilise` 891 · `source` 895
`champCle` 900 · `ligneSource` 935 · `paraitSurFiche` 1086 · `origineConferences` 1092
`resumeProvenance` 1157 · `resumeFiche` 1174 · `caseFiche` 1217 · `champsPersos` 1259
`criteres` 1265 · `ecritFiche` 1268 · `caseCritere` 1283 · `clePerso` 1302
`ajouteChampPerso` 1310 · `renommeChampPerso` 1321 · `retireChampPerso` 1339
`lignesPerso` 1387 · `clesCorps` 1422 · `ordreEffectif` 1436 · `libelleCorps` 1451
`champsLus` 1494 · `exempleCible` 1509 · `valeurApercu` 1531 · `dessineApercu` 1559
`panneauOrdre` 1650 · `ligneOutil` 1832 · `ligneReglage` 1848 · `ouvreProvenance` 1860
`ouvreSources` 1883 · `cadreFiche` 1935 · `ouvreFiche` 1964 · `sousTitre` 2114
`tableauChamps` 2129 · `encode` 2272 · `decode` 2274 · `correspondance` 2279
`sansPrefixe` 2282 · `courte` 2283 · `intitule` 2298 · `intituleSuite` 2310
`separeValeurs` 2324 · `aplani` 2345 · `memeStyle` 2355 · `autreFace` 2373
`champOrigine` 2389 · `majLiens` 2656 · `majIntegration` 2683 · `majMsgSync` 2690
`etapesPressenties` 2720 · `synchronise` 2734 · `dupliquer` 2785 · `litMonProfil` 2883
`RETOUR_MDP` 2894 · `litComptes` 2896 · `ligneMessage` 2905 · `casesSalons` 2915
`ouvreComptes` 2945 · `ouvreFicheCompte` 3037 · `videEcran` 3196 · `dessine` 3201
`demarre` 3213

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 694 l. → console.css

- l.640 · Page de rapport

### `_dessin.html` — 1620 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 34 · `mesCalques` 42 · `enregistreDessins` 43
`instantane` 77 · `memorise` 78 · `restaure` 83 · `annule` 92 · `refais` 104
`trouveCalque` 106 · `nouvelId` 107 · `cheminArrondi` 125 · `estCadre` 168
`cheminForme` 170 · `styleTrait` 190 · `poseTrait` 203 · `dessineDessins` 210
`versPlan` 252 · `apercu` 258 · `apercuGuide` 270 · `toleranceTrace` 294
`aimanteContour` 299 · `rayonContour` 302 · `redresseTrace` 321 · `traceGuide` 355
`fermeIci` 362 · `ajouteForme` 367 · `pictoDe` 463 · `nomTypeRepere` 501 · `typeZone` 527
`pictoForme` 538 · `traceRepere` 555 · `etiquetteSociete` 623 · `nomSurLePlan` 627
`societeDeForme` 638 · `societesDuPlan` 649 · `remplitListeSocietes` 660
`societeSaisie` 668 · `traceStandDessine` 684 · `texteStandDessine` 708
`poseLibellesDessines` 726 · `decoupeStand` 747 · `marqueStandsDessines` 759
`rafraichitStandsDessines` 774 · `oublieReperes` 804 · `reperesCherchables` 806
`vaAuRepere` 850 · `cartouchePoi` 871 · `ouvrePoi` 956 · `mesureCartouche` 1028
`phareRepere` 1035 · `phareZone` 1036 · `eclairePoi` 1040 · `oublieChoixPoi` 1072
`signale` 1081 · `calquePourImage` 1095 · `poseImage` 1112 · `importeImage` 1125
`dessinPointerDown` 1176 · `dessinPointerMove` 1250 · `dessinPointerUp` 1288
`termineTrace` 1324 · `aide` 1336 · `choisitOutil` 1361 · `enchaineStand` 1385
`activeCalque` 1443 · `cleVerrou` 1499 · `verrouille` 1500 · `basculeVerrou` 1502
`pictoVerrou` 1519 · `montreRoleIti` 1547 · `creeCalque` 1578 · `demandeNom` 1591
`renommeCalque` 1610

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 521 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 183 · `ecritDesDeuxCotes` 205
`changeLien` 217 · `changeDureeLien` 233 · `majLiens` 250 · `etiquetteStand` 294
`remplitListeStands` 299 · `standSaisi` 308 · `appliqueLiaison` 318 · `appliqueSociete` 336
`appliqueTexte` 352 · `appliqueRayon` 362 · `appliqueTrait` 372 · `appliquePicto` 386
`supprimeForme` 404 · `editionPointerDown` 414 · `editionPointerMove` 459
`editionPointerUp` 511

### `_export.html` — 146 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 59 · `libellePeriode` 76 · `nomFichierExport` 82
`nomFeuilleExport` 92 · `exporteExposants` 108

### `_head.html` — 3393 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones`
`#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnTheme` · `#menuCompte` · `#avatarCompte` · `#compteMail` · `#btnThemeCompte`
`#btnSortir` · `#side` · `#poignee` · `#q` · `#videQ` · `#btnFiltres` · `#nFiltres`
`#actifs` · `#count` · `#countTxt` · `#list` · `#stage` · `#plan` · `#couches` · `#zones`
`#stands` · `#labels` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#poi`
`#viseur` · `#viseurTxt` · `#viseurStop` · `#outils` · `#outilsCalque` · `#renommeOutils`
`#fermeOutils` · `#roleIti` · `#roleAide` · `#voirNappe` · `#aimants` · `#aimantPas`
`#contourReg` · `#contourRayon` · `#contourAimant` · `#traitReg` · `#traitEpaisseur`
`#traitStyle` · `#texteADessiner` · `#repereType` · `#repereTexte` · `#standSoc`
`#listeSoc` · `#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg`
`#elemEpaisseur` · `#elemStyle` · `#elemStand` · `#listeStands` · `#elemSoc` · `#outilsAide`
`#annuleDernier` · `#libReg` · `#libNom` · `#libFerme` · `#libTaille` · `#libAuto`
`#libAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile`
`#voile` · `#detail` · `#dMarque` · `#closeDetail` · `#dKind` · `#dNeuf` · `#dName`
`#dRen` · `#dLogo` · `#dBadges` · `#dCode` · `#dVis` · `#dPartage` · `#dOnglets`
`#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours` · `#closeParcours`
`#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps` · `#jCorps` · `#pPied` · `#btnJournee`
`#videParcours` · `#jPied` · `#jRefaire` · `#jRetour` · `#itineraire` · `#closeItineraire`
`#iResume` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB`
`#iPmr` · `#iResultat` · `#videItineraire`

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

### `_js.html` — 3162 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.304 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.414 · 3. Rendu du pavillon courant
- l.490 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.610 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1478 · 6. Vue
- l.1748 · 7. Sélection et fiche
- l.2762 · 8. Interactions du plan
- l.2992 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `indexe` 55 · `chronoConf` 223 · `rangeConferences` 244
`poseFavicon` 291 · `largeur` 309 · `decoupe` 334 · `habille` 347 · `lignesSvg` 358
`coexComptes` 375 · `coexChoisit` 376 · `ligneCode` 392 · `monteHabillage` 420
`montePlan` 437 · `onglets` 466 · `changePlan` 482 · `ancre` 498 · `place` 499
`libelles` 501 · `decaleLibelle` 566 · `facteurLibelle` 567 · `libelleForce` 568
`libelleZone` 571 · `libelleEmplacement` 590 · `indexeSecteurs` 631 · `secteursMontres` 644
`couleurConf` 648 · `hslHex` 652 · `couleurSecteur` 670 · `BANDES` 689 · `majFondus` 697
`pastilleSecteur` 735 · `coloreSecteurs` 748 · `appliqueSecteurs` 791 · `filtreTheme` 808
`themeFiltrable` 885 · `clesCriteres` 901 · `libelleCritere` 908 · `separeValeurs` 916
`valeursCritere` 933 · `texteCriteres` 946 · `indexeCriteres` 959 · `dansCriteres` 986
`critereActif` 994 · `basculeCritere` 996 · `videCriteres` 1004 · `majVideQ` 1012
`videRecherche` 1025 · `nCriteres` 1039 · `majCriteres` 1048 · `ouvreCriteres` 1106
`filtre` 1219 · `critParSociete` 1223 · `cherchable` 1233 · `visible` 1240
`releveHotes` 1256 · `visibleSurPlan` 1264 · `visibleSociete` 1274 · `appliqueFiltre` 1280
`rangSorte` 1300 · `codeCase` 1322 · `caseNumero` 1339 · `sousLigne` 1359 · `liste` 1373
`cadrePlan` 1493 · `oublieCadre` 1494 · `figeTextes` 1510 · `rendTextes` 1515
`appliqueVue` 1520 · `rafraichitVue` 1541 · `poseVue` 1553 · `masque` 1572
`masqueDroite` 1604 · `fit` 1615 · `stoppeZoom` 1645 · `glisseVersVise` 1651
`glisseVers` 1693 · `rectVisee` 1715 · `zoom` 1734 · `echelle` 1740 · `ETROIT` 1754
`anime` 1756 · `noeud` 1780 · `canalPlan` 1790 · `rangSociete` 1798 · `select` 1807
`centre` 1826 · `centrePoint` 1830 · `montre` 1875 · `libelleCorps` 1908 · `ordreCorps` 1920
`momentLocal` 1957 · `programme` 1980 · `jourLong` 2013 · `ficheConf` 2024 · `lien` 2118
`adresseSure` 2133 · `adresseImage` 2160 · `imageSure` 2173 · `assainitRiche` 2202
`enBlocs` 2242 · `rangeRiche` 2255 · `ecarteClicFantome` 2283 · `nomSociete` 2292
`societes` 2305 · `choisitExposant` 2316 · `poseMarque` 2354 · `poseCode` 2404
`rangeMarque` 2443 · `ouvre` 2489 · `ferme` 2736 · `onglet` 2752 · `milieu` 2782
`commencePince` 2788 · `suitPince` 2802 · `mesureTiroir` 3003 · `montreTiroir` 3006

Éléments :

`#data` · `#dGo` · `#dItin`

### `_mesure.html` — 147 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 13. Mesure d'utilisation

Fonctions :

`jetonMesure` 25 · `jetonRetenu` 46 · `envoieMesures` 79 · `mesure` 117

### `_modales.html` — 169 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 28 · `fermeModale` 45 · `confirme` 52 · `deplaceVers` 70
`versExtremite` 82 · `remplitOrdre` 90 · `ouvreOrdre` 160

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

### `_pile.html` — 469 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.285 · Repères
- l.337 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 69 · `boutonAjout` 76 · `boutonVerrou` 87 · `intertitre` 95
`construitPanneau` 102 · `sectionSelection` 301 · `sectionFond` 357 · `ligneCouleur` 411
`rangSecteur` 431 · `rangSous` 443 · `defautCouleur` 465

### `_pousse.html` — 332 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`ditEtat` 106 · `programmeEnvoi` 113 · `programmePublication` 127 · `rattrapeRetard` 134
`envoie` 139 · `presse` 152 · `base` 160 · `identifiants` 180 · `reglagesSeuls` 195
`oublieCache` 206 · `pousseConfiguration` 225

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

### `supabase/functions/plan-public/index.ts` — 557 l.

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
- `20260911130920_icone_d_onglet_du_salon.sql` — evenement

## Le reste

- `src/index.mjs` — 233 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 61 · `amontPour` 70 · `cleDe` 78 · `meta` 81 · `gardable` 94 · `range` 99 `rafraichit` 106 · `oublie` 133 · `mesure` 155
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/controle.js` — analyse le script de chaque page construite, en module
  ES : une redéclaration y est une erreur, là où un `<script>` la tolère.
- `outils/migration.js` — crée une migration horodatée à la seconde.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
