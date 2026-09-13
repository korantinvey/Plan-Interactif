<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 3268 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.2265 · 10. Mode administration
- l.2352 · La fiche d'une zone organisateur
- l.3015 · Masquer une zone organisateur
- l.3098 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `lueHeure` 355 · `lueDate` 359
`datesSalon` 366 · `horairesSalon` 380 · `salonPartage` 393 · `trio` 406 · `melange` 416
`themeSombre` 424 · `appliqueAccent` 438 · `appliqueFond` 469 · `modeleRetenu` 507
`posePoliceLibelles` 557 · `appliqueModele` 585 · `habilleModale` 626 · `texteCorps` 697
`standApercu` 712 · `lignesApercu` 736 · `contenuApercu` 762 · `apercuFiche` 799
`apercuListe` 876 · `apercuDuo` 898 · `glisseFenetre` 931 · `ouvreReglages` 942
`voletZones` 1045 · `champsFicheZone` 1147 · `ficheZoneEnPlace` 1217 · `voletPlan` 1235
`blocHoraires` 1361 · `sallesSituees` 1494 · `voletPmr` 1510 · `nomDuTon` 1601
`voletApparence` 1606 · `clesFiche` 1719 · `voletOrdre` 1735 · `enregistreConf` 2214
`rgbHex` 2221 · `hexa` 2228 · `luminance` 2232 · `ecarte` 2246 · `joli` 2261
`retireAdmin` 2278 · `activeAdmin` 2291 · `champZone` 2378 · `champsZone` 2403
`champSalles` 2475 · `nomDeZone` 2527 · `reduitLogo` 2561 · `champLogo` 2602
`editeurRiche` 2699 · `memeFicheZone` 2856 · `suitFicheZone` 2862 · `verseFicheZone` 2870
`ficheZone` 2896 · `enregistreZone` 2921 · `basculeAffichageZone` 3026
`marqueZonesMasquees` 3043 · `ecritColonnesEvenement` 3063 · `ecritColonneEvenement` 3094
`cleLibelle` 3119 · `empreinteLibelle` 3135 · `placementLibelle` 3143 · `posePlacement` 3153
`libelleAutomatique` 3170 · `modePlacementLibelles` 3179 · `majPaletteLibelle` 3196
`choisitLibelle` 3213 · `pousseLibelle` 3220 · `libellePointerDown` 3228
`libellePointerMove` 3243 · `libellePointerUp` 3252

Éléments :

`#pousseConf` · `#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 180 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 33 · `entetesApi` 51 · `chargeFond` 74 · `panneDuChargement` 126
`charge` 133

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

### `_chaleur.html` — 633 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.434 · Remise à zéro des compteurs

Fonctions :

`nbChal` 32 · `tonChaleur` 51 · `niveauChaleur` 73 · `valeurChaleur` 76 · `chargeChaleur` 89
`coloreChaleur` 135 · `cartoucheChaleur` 170 · `mesureCartoucheChaleur` 234
`replieChaleur` 240 · `ecritEtatChaleur` 251 · `dessineEchelleChaleur` 259
`dessineTopChaleur` 279 · `phraseChaleur` 321 · `rafraichitChaleur` 346
`montreChaleur` 380 · `rangChaleur` 416 · `aplati` 456 · `voletMesure` 461
`evenementCourant` 487 · `ouvreRemiseAZero` 506 · `lanceRemiseAZero` 595

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

### `_console-js.html` — 2844 l. → admin-plans.html

- l.929 · Provenance des données
- l.1056 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 119 · `fonction` 394 · `slugifie` 408
`courant` 412 · `charge` 414 · `chargePlans` 429 · `majEvenement` 434 · `selonAdresse` 454
`majAdresse` 462 · `majBarre` 477 · `dessineChoix` 519 · `champ` 539 · `reduitIcone` 593
`champFavicon` 634 · `fuseauConnu` 730 · `champFuseau` 742 · `dessineFiche` 805
`fournisseurUtilise` 991 · `source` 995 · `champCle` 1000 · `ligneSource` 1035
`paraitSurFiche` 1165 · `origineConferences` 1171 · `resumeProvenance` 1236
`resumeFiche` 1253 · `caseFiche` 1298 · `champsPersos` 1340 · `criteres` 1346
`ecritFiche` 1349 · `caseCritere` 1364 · `clePerso` 1383 · `ajouteChampPerso` 1391
`renommeChampPerso` 1402 · `retireChampPerso` 1420 · `lignesPerso` 1468 · `ligneOutil` 1488
`ligneReglage` 1504 · `ouvreProvenance` 1516 · `ouvreSources` 1539 · `cadreFiche` 1591
`ouvreFiche` 1621 · `sousTitre` 1731 · `tableauChamps` 1746 · `encode` 1889 · `decode` 1891
`correspondance` 1896 · `sansPrefixe` 1899 · `courte` 1900 · `intitule` 1915
`intituleSuite` 1927 · `separeValeurs` 1941 · `aplani` 1962 · `memeStyle` 1972
`autreFace` 1990 · `champOrigine` 2006 · `majLiens` 2273 · `majIntegration` 2300
`majMsgSync` 2307 · `etapesPressenties` 2337 · `synchronise` 2351 · `dupliquer` 2402
`litMonProfil` 2502 · `RETOUR_MDP` 2513 · `litComptes` 2515 · `ligneMessage` 2524
`casesSalons` 2534 · `ouvreComptes` 2564 · `ouvreFicheCompte` 2656 · `videEcran` 2815
`dessine` 2820 · `demarre` 2832

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 625 l. → console.css

- l.566 · Page de rapport

### `_dessin.html` — 1797 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `notePubliees` 48 · `dejaPubliee` 54 · `marqueAttente` 60 · `mesCalques` 68
`enregistreDessins` 69 · `instantane` 103 · `memorise` 104 · `restaure` 109 · `annule` 118
`refais` 130 · `trouveCalque` 132 · `nouvelId` 133 · `cheminArrondi` 151 · `estCadre` 194
`cheminForme` 196 · `styleTrait` 216 · `longueurFleche` 242 · `cheminFleche` 249
`marqueFleche` 278 · `rafraichitFleches` 289 · `poseTrait` 305 · `dessineDessins` 313
`versPlan` 356 · `apercu` 362 · `apercuGuide` 374 · `toleranceTrace` 398
`aimanteContour` 403 · `rayonContour` 406 · `redresseTrace` 425 · `traceGuide` 459
`fermeIci` 466 · `ajouteForme` 471 · `pictoDe` 571 · `nomTypeRepere` 616 · `typeZone` 642
`pictoForme` 649 · `estPorte` 669 · `ouvreEntrant` 670 · `ouvreSortant` 671
`traceRepere` 685 · `etiquetteSociete` 753 · `nomSurLePlan` 757 · `societeDeForme` 768
`societesDuPlan` 779 · `remplitListeSocietes` 790 · `societeSaisie` 798
`traceStandDessine` 814 · `texteStandDessine` 838 · `poseLibellesDessines` 856
`decoupeStand` 877 · `marqueStandsDessines` 889 · `rafraichitStandsDessines` 904
`oublieReperes` 934 · `reperesCherchables` 936 · `vaAuRepere` 980 · `clePoi` 1015
`cartouchePoi` 1017 · `ouvrePoi` 1121 · `mesureCartouche` 1193 · `phareRepere` 1202
`phareZone` 1204 · `eclairePoi` 1210 · `oublieChoixPoi` 1242 · `signale` 1251
`calquePourImage` 1265 · `poseImage` 1282 · `importeImage` 1295 · `dessinPointerDown` 1346
`dessinPointerMove` 1420 · `dessinPointerUp` 1458 · `termineTrace` 1494 · `aide` 1506
`choisitOutil` 1531 · `enchaineStand` 1555 · `activeCalque` 1614 · `cleVerrou` 1670
`verrouille` 1671 · `basculeVerrou` 1673 · `pictoVerrou` 1690 · `montreRoleIti` 1724
`creeCalque` 1755 · `demandeNom` 1768 · `renommeCalque` 1787

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 526 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 185 · `ecritDesDeuxCotes` 207
`changeLien` 219 · `changeDureeLien` 235 · `majLiens` 252 · `etiquetteStand` 296
`remplitListeStands` 301 · `standSaisi` 310 · `appliqueLiaison` 320 · `appliqueSociete` 338
`appliqueTexte` 354 · `appliqueRayon` 364 · `appliqueTrait` 376 · `appliquePicto` 394
`supprimeForme` 409 · `editionPointerDown` 419 · `editionPointerMove` 464
`editionPointerUp` 516

### `_environs.html` — 1002 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`metresParDegre` 63 · `tourneEnvirons` 80 · `versTerre` 86 · `versLePlan` 93 · `reancre` 108
`empriseDesPavillons` 116 · `centreDesPavillons` 129 · `carreDeTerrain` 143
`largeurVoie` 208 · `sorteEnvirons` 227 · `requeteOverpass` 242 · `chercheEnvirons` 260
`penteDesVoies` 292 · `allegeTrace` 325 · `occupeLeSol` 367 · `pavesDuPlan` 396
`decoupeDuPavillon` 432 · `dessineEnvirons` 448 · `aireDuContour` 515
`centreDuContour` 524 · `axeDuContour` 538 · `empriseDesObjets` 552
`batimentsCandidats` 570 · `caleSurBatiment` 593 · `calqueEnvirons` 610
`rangeEnvironsAuFond` 626 · `montreEnvirons` 645 · `recul` 669 · `manqueCalage` 685
`accesEnvirons` 694 · `enregistreEnvirons` 708 · `effaceEnvirons` 737
`calageEnregistre` 751 · `litCoordonnees` 782 · `retraceEnvirons` 796 · `voletEnvirons` 813

### `_export.html` — 211 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_head.html` — 3762 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones`
`#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnTheme` · `#menuCompte` · `#avatarCompte` · `#compteMail` · `#btnThemeCompte`
`#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q`
`#videQ` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#count` · `#countTxt` · `#list`
`#stage` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#zIn` · `#zOut`
`#zFit` · `#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#traitFleche`
`#texteADessiner` · `#repereType` · `#repereTexte` · `#standSoc` · `#listeSoc`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg`
`#elemEpaisseur` · `#elemStyle` · `#elemFleche` · `#elemStand` · `#listeStands` · `#elemSoc`
`#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom` · `#libFerme` · `#libTaille`
`#libAuto` · `#libAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`
`#panel` · `#pile` · `#voile` · `#detail` · `#dMarque` · `#closeDetail` · `#dKind`
`#dNeuf` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode` · `#dVis` · `#dPartage`
`#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee`
`#btnPartage` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied` · `#jRefaire`
`#jRetour` · `#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA`
`#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat`
`#videItineraire`

### `_hors-ligne.html` — 40 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 3001 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 104 · `bordConvexe` 114 · `enveloppe` 133 · `oublieGrilles` 162 · `calquesDe` 167
`reperesDe` 172 · `zoneTraversee` 252 · `cleRoleIti` 254 · `roleIti` 255 · `nomRoleIti` 256
`estCirculation` 259 · `formesRole` 284 · `anglePlan` 316 · `dansGrille` 355
`horsGrille` 356 · `grille` 366 · `distanceAuMur` 516 · `cretes` 559 · `nappePrincipale` 577
`celluleDe` 612 · `caseDe` 616 · `centreCase` 621 · `empriseDe` 664 · `accrocheDepuis` 696
`versLeMilieu` 752 · `accroche` 783 · `Tas` 798 · `travail` 842 · `cherche` 865
`distancesDepuis` 932 · `distancesMulti` 946 · `regleFoule` 1018 · `ecarteFoule` 1035
`heureAuSalon` 1039 · `sallesEnMouvement` 1048 · `foule` 1091 · `bilanFoule` 1179
`reduit` 1208 · `guidageAllees` 1271 · `recentre` 1327 · `passable` 1412 · `lisse` 1446
`longueur` 1473 · `longueurDehors` 1489 · `nettoie` 1531 · `oublieFaces` 1578
`facesLibres` 1580 · `amorce` 1653 · `faceDeSortie` 1688 · `accesDe` 1718
`couplesAcces` 1763 · `troncon` 1796 · `pointObjet` 1839 · `pointRepere` 1846
`candidats` 1855 · `pointSaisi` 1881 · `portesDe` 1899 · `versPorte` 1906
`typeLiaison` 1967 · `nomRepere` 1973 · `oublieLiaisons` 1991 · `lienEcrits` 2003
`ecritLiens` 2012 · `annuaireLiaisons` 2017 · `liensDe` 2049 · `coutLiaison` 2069
`passagePraticable` 2076 · `passagesDe` 2084 · `sortiesDe` 2094 · `plansRelies` 2102
`balayage` 2126 · `distanceDepuis` 2140 · `cheminLiaisons` 2167 · `routeParLiaisons` 2251
`routeEntre` 2287 · `calculeRoute` 2326 · `couleurNappe` 2352 · `rafraichitApercu` 2358
`marchesIci` 2401 · `rayonBout` 2406 · `dessineItineraire` 2411 · `rafraichitBouts` 2455
`cadreItineraire` 2478 · `champIti` 2502 · `ecritDistance` 2506 · `ecritDuree` 2514
`fermeSugg` 2519 · `montreSugg` 2526 · `choisitPoint` 2558 · `valideSaisie` 2567
`effaceItineraire` 2577 · `relance` 2599 · `phraseLiaison` 2650 · `montreResultat` 2664
`bandeauVisee` 2804 · `armeVisee` 2818 · `finVisee` 2832 · `viseItineraire` 2847
`visePoi` 2853 · `visePoint` 2859 · `ouvreItineraire` 2885 · `fermeItineraire` 2913
`versItineraire` 2923 · `versItineraireDe` 2926

### `_journee.html` — 1000 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 70
`jourPropose` 83 · `pointConf` 98 · `departsProposes` 117 · `matriceJournee` 141
`rangeJournee` 243 · `calculeJournee` 360 · `rangJournee` 572 · `lienJournee` 584
`arretJournee` 591 · `remplitJournee` 616 · `appliqueVueParcours` 766 · `traceJournee` 796
`montreJournee` 804 · `perimeJournee` 817 · `ouvreOrganisation` 826 · `lanceJournee` 965

### `_js.html` — 3459 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.331 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.441 · 3. Rendu du pavillon courant
- l.520 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.640 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1569 · 6. Vue
- l.1844 · 7. Sélection et fiche
- l.2987 · 8. Interactions du plan
- l.3289 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `indexe` 55 · `chronoConf` 250 · `rangeConferences` 271
`poseFavicon` 318 · `largeur` 336 · `decoupe` 361 · `habille` 374 · `lignesSvg` 385
`coexComptes` 402 · `coexChoisit` 403 · `ligneCode` 419 · `monteHabillage` 447
`montePlan` 464 · `onglets` 496 · `changePlan` 512 · `ancre` 528 · `place` 529
`libelles` 531 · `decaleLibelle` 596 · `facteurLibelle` 597 · `libelleForce` 598
`libelleZone` 601 · `libelleEmplacement` 620 · `indexeSecteurs` 661 · `secteursMontres` 674
`couleurConf` 678 · `hslHex` 682 · `couleurSecteur` 700 · `BANDES` 719 · `majFondus` 727
`pastilleSecteur` 765 · `coloreSecteurs` 778 · `appliqueSecteurs` 821 · `filtreTheme` 838
`themeFiltrable` 916 · `clesCriteres` 932 · `libelleCritere` 939 · `separeValeurs` 947
`valeursCritere` 964 · `texteCriteres` 977 · `indexeCriteres` 990 · `dansCriteres` 1017
`critereActif` 1025 · `basculeCritere` 1027 · `videCriteres` 1036 · `majVideQ` 1045
`videRecherche` 1058 · `nCriteres` 1073 · `majCriteres` 1082 · `ouvreCriteres` 1140
`filtre` 1253 · `reposeRetrait` 1273 · `critParSociete` 1277 · `cherchable` 1287
`visible` 1294 · `releveHotes` 1310 · `visibleSurPlan` 1318 · `visibleSociete` 1329
`marqueRetrait` 1345 · `appliqueFiltre` 1357 · `oublieRetrait` 1369
`reprendRecherche` 1378 · `rangSorte` 1391 · `codeCase` 1413 · `caseNumero` 1430
`sousLigne` 1450 · `liste` 1464 · `cadrePlan` 1584 · `oublieCadre` 1585 · `figeTextes` 1601
`rendTextes` 1606 · `appliqueVue` 1611 · `rafraichitVue` 1634 · `poseVue` 1646
`masque` 1665 · `masqueDroite` 1697 · `fit` 1708 · `stoppeZoom` 1738 · `glisseVersVise` 1744
`glisseVers` 1786 · `rectVisee` 1808 · `zoom` 1827 · `echelle` 1836 · `ETROIT` 1850
`anime` 1852 · `noeud` 1876 · `canalPlan` 1886 · `rangSociete` 1894 · `select` 1903
`centre` 1922 · `centrePoint` 1926 · `montre` 1971 · `libelleCorps` 2003 · `ordreCorps` 2015
`groupesFiche` 2047 · `valeurCorps` 2060 · `champCorps` 2065 · `groupeCorps` 2073
`corpsRange` 2086 · `momentLocal` 2121 · `programme` 2144 · `jourLong` 2177
`ficheConf` 2188 · `lien` 2282 · `adresseWeb` 2290 · `pictoRS` 2333 · `adresseSure` 2351
`adresseImage` 2378 · `imageSure` 2391 · `assainitRiche` 2420 · `enBlocs` 2460
`rangeRiche` 2473 · `ecarteClicFantome` 2501 · `nomSociete` 2510 · `societes` 2523
`choisitExposant` 2534 · `poseMarque` 2572 · `poseCode` 2622 · `rangeMarque` 2663
`ouvre` 2709 · `ferme` 2961 · `onglet` 2977 · `milieu` 3007 · `commencePince` 3013
`suitPince` 3027 · `cibleElargie` 3105 · `mesureTiroir` 3300 · `montreTiroir` 3303

Éléments :

`#data` · `#dGo` · `#dItin`

### `_mesure.html` — 223 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13. Mesure d'utilisation

Fonctions :

`jetonMesure` 35 · `jetonRetenu` 63 · `supportMesure` 104 · `envoieMesures` 145
`mesure` 187

### `_modales.html` — 172 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`verseModale` 22 · `ouvreModale` 28 · `fermeModale` 48 · `confirme` 55 · `deplaceVers` 73
`versExtremite` 85 · `remplitOrdre` 93 · `ouvreOrdre` 163

### `_motdepasse.html` — 242 l. → motdepasse.html

- l.54 · Poser un mot de passe

Fonctions :

`$` 70 · `CFG` 72 · `dit` 80 · `fragment` 86 · `garde` 93 · `lit` 97 · `demandeLien` 170
`ouvreSaisie` 179

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 395 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 58 · `signetParcours` 87 · `boutonParcours` 93
`rafraichitMarque` 98 · `brancheParcours` 111 · `calqueMarques` 143 · `dessineMarques` 159
`marqueParcours` 189 · `rafraichitParcours` 203 · `instantConf` 231 · `cleTemps` 235
`jourCourt` 241 · `nomDeStand` 248 · `rangParcours` 250 · `groupeParcours` 266
`remplitParcours` 275 · `ouvreParcours` 347 · `fermeParcours` 359

### `_partage.html` — 650 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrSvg` 402
`ouvrePartageParcours` 428 · `boutonsPartage` 477 · `accueilleParcoursPartage` 547
`adoptePartage` 633

### `_pile.html` — 487 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.59 · Panneau : deux sections, chacune rangée par nom
- l.303 · Repères
- l.355 · Fond du plan

Fonctions :

`clePile` 10 · `entrees` 12 · `pile` 23 · `groupe` 35 · `ordonneDom` 43 · `deplaceCouche` 48
`nature` 77 · `boutonAjout` 84 · `boutonVerrou` 95 · `intertitre` 103
`construitPanneau` 110 · `sectionSelection` 319 · `sectionFond` 375 · `ligneCouleur` 429
`rangSecteur` 449 · `rangSous` 461 · `defautCouleur` 483

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

### `_rapport-head.html` — 30 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnTheme` · `#rapport`

### `_rapport-js.html` — 427 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`courant` 47 · `chargeEvenements` 52 · `joursPeriode` 70 · `chargeRapport` 72 · `chiffre` 83
`barres` 102 · `portes` 142 · `jours` 193 · `dessineRapport` 214 · `dessineBarre` 355
`rafraichit` 378 · `videEcran` 397 · `demarre` 413

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

### `_sw.js` — 165 l. → sw.js

Fonctions :

`range` 72 · `dabordCache` 82 · `dabordReseau` 102 · `navigation` 119

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

### `supabase/functions/mesure/index.ts` — 155 l.

`jeton` 73 · `client` 76

### `supabase/functions/plan-public/index.ts` — 581 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 174 · `ampute` 198 · `masquesDe` 238
`masquesDuPlan` 258

### `supabase/functions/sync-evenement/index.ts` — 1463 l.

`cors` 42 · `bourre` 111 · `client` 121 · `gaia` 128 · `libellesChoix` 139
`fournisseur` 164 · `raccourci` 172 · `enClair` 209 · `range` 235 · `champsKlipso` 256
`hebergee` 1420 · `nettoieUrl` 1439 · `groupeTextes` 1449

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
- `20260913220713_le_calage_du_plan_sur_la_terre.sql` — evenement

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
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
