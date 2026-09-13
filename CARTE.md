<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 3500 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.2466 · 10. Mode administration
- l.2553 · La fiche d'une zone organisateur
- l.3247 · Masquer une zone organisateur
- l.3330 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `lueHeure` 355 · `lueDate` 359
`datesSalon` 366 · `horairesSalon` 380 · `salonPartage` 393 · `trio` 406 · `melange` 416
`themeSombre` 424 · `appliqueAccent` 438 · `appliqueFond` 469 · `modeleRetenu` 507
`policeChoisie` 593 · `policeDuModele` 598 · `feuillePolice` 608 · `chargePolice` 630
`policePrete` 650 · `policeDesNoms` 668 · `posePoliceLibelles` 697 · `appliqueModele` 729
`habilleModale` 770 · `texteCorps` 841 · `standApercu` 856 · `lignesApercu` 880
`contenuApercu` 906 · `apercuFiche` 943 · `apercuListe` 1020 · `apercuDuo` 1042
`glisseFenetre` 1075 · `ouvreReglages` 1086 · `voletZones` 1185 · `champsFicheZone` 1287
`ficheZoneEnPlace` 1357 · `voletPlan` 1375 · `blocHoraires` 1501 · `sallesSituees` 1634
`voletPmr` 1650 · `nomDuTon` 1741 · `voletApparence` 1746 · `clesFiche` 1920
`voletOrdre` 1936 · `enregistreConf` 2415 · `rgbHex` 2422 · `hexa` 2429 · `luminance` 2433
`ecarte` 2447 · `joli` 2462 · `retireAdmin` 2479 · `activeAdmin` 2492 · `champZone` 2579
`champsZone` 2604 · `champSalles` 2696 · `nomDeZone` 2748 · `reduitLogo` 2782
`champLogo` 2823 · `editeurRiche` 2920 · `memeFicheZone` 3077 · `suitFicheZone` 3084
`verseFicheZone` 3092 · `ficheZone` 3118 · `enregistreZone` 3143
`basculeAffichageZone` 3258 · `marqueZonesMasquees` 3275 · `ecritColonnesEvenement` 3295
`ecritColonneEvenement` 3326 · `cleLibelle` 3351 · `empreinteLibelle` 3367
`placementLibelle` 3375 · `posePlacement` 3385 · `libelleAutomatique` 3402
`modePlacementLibelles` 3411 · `majPaletteLibelle` 3428 · `choisitLibelle` 3445
`pousseLibelle` 3452 · `libellePointerDown` 3460 · `libellePointerMove` 3475
`libellePointerUp` 3484

Éléments :

`#pousseConf` · `#sauveConf` · `#restaureConf` · `#fichierConf`

### `_admin2.html` — 175 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 33 · `entetesApi` 51 · `chargeFond` 74 · `panneDuChargement` 121
`charge` 128

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

### `_console-head.html` — 70 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet` · `#btnExport` · `#btnLangue`
`#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme` · `#btnSortir` · `#fiche`

### `_console-js.html` — 2884 l. → admin-plans.html

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
`renommeChampPerso` 1409 · `retireChampPerso` 1457 · `lignesPerso` 1505 · `ligneOutil` 1525
`ligneReglage` 1541 · `ouvreProvenance` 1553 · `ouvreSources` 1576 · `cadreFiche` 1628
`ouvreFiche` 1658 · `sousTitre` 1768 · `tableauChamps` 1783 · `encode` 1926 · `decode` 1928
`correspondance` 1933 · `sansPrefixe` 1936 · `courte` 1937 · `intitule` 1952
`intituleSuite` 1964 · `separeValeurs` 1978 · `aplani` 1999 · `memeStyle` 2009
`autreFace` 2027 · `champOrigine` 2043 · `majLiens` 2310 · `majIntegration` 2337
`majMsgSync` 2344 · `etapesPressenties` 2374 · `synchronise` 2388 · `dupliquer` 2439
`litMonProfil` 2539 · `RETOUR_MDP` 2550 · `litComptes` 2552 · `ligneMessage` 2561
`casesSalons` 2571 · `ouvreComptes` 2601 · `ouvreFicheCompte` 2693 · `videEcran` 2852
`dessine` 2857 · `demarre` 2872

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 625 l. → console.css

- l.566 · Page de rapport

### `_dessin.html` — 1804 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `notePubliees` 48 · `dejaPubliee` 54 · `marqueAttente` 60 · `mesCalques` 68
`enregistreDessins` 69 · `instantane` 103 · `memorise` 104 · `restaure` 109 · `annule` 118
`refais` 130 · `trouveCalque` 132 · `nouvelId` 133 · `cheminArrondi` 151 · `estCadre` 194
`cheminForme` 196 · `styleTrait` 216 · `longueurFleche` 242 · `cheminFleche` 249
`marqueFleche` 278 · `rafraichitFleches` 289 · `poseTrait` 305 · `dessineDessins` 313
`versPlan` 356 · `apercu` 362 · `apercuGuide` 374 · `toleranceTrace` 398
`aimanteContour` 403 · `rayonContour` 406 · `redresseTrace` 425 · `traceGuide` 459
`fermeIci` 466 · `ajouteForme` 471 · `pictoDe` 571 · `nomTypeRepereFr` 622
`nomTypeRepere` 623 · `typeZone` 649 · `pictoForme` 656 · `estPorte` 676
`ouvreEntrant` 677 · `ouvreSortant` 678 · `traceRepere` 692 · `etiquetteSociete` 760
`nomSurLePlan` 764 · `societeDeForme` 775 · `societesDuPlan` 786
`remplitListeSocietes` 797 · `societeSaisie` 805 · `traceStandDessine` 821
`texteStandDessine` 845 · `poseLibellesDessines` 863 · `decoupeStand` 884
`marqueStandsDessines` 896 · `rafraichitStandsDessines` 911 · `oublieReperes` 941
`reperesCherchables` 943 · `vaAuRepere` 987 · `clePoi` 1022 · `cartouchePoi` 1024
`ouvrePoi` 1128 · `mesureCartouche` 1200 · `phareRepere` 1209 · `phareZone` 1211
`eclairePoi` 1217 · `oublieChoixPoi` 1249 · `signale` 1258 · `calquePourImage` 1272
`poseImage` 1289 · `importeImage` 1302 · `dessinPointerDown` 1353 · `dessinPointerMove` 1427
`dessinPointerUp` 1465 · `termineTrace` 1501 · `aide` 1513 · `choisitOutil` 1538
`enchaineStand` 1562 · `activeCalque` 1621 · `cleVerrou` 1677 · `verrouille` 1678
`basculeVerrou` 1680 · `pictoVerrou` 1697 · `montreRoleIti` 1731 · `creeCalque` 1762
`demandeNom` 1775 · `renommeCalque` 1794

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

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_head.html` — 3771 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones`
`#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnLangue` · `#btnTheme` · `#menuCompte` · `#avatarCompte` · `#compteMail`
`#btnThemeCompte` · `#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side`
`#poignee` · `#q` · `#videQ` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#count`
`#countTxt` · `#list` · `#piedSide` · `#btnConfidentialite` · `#stage` · `#plan`
`#couches` · `#zones` · `#stands` · `#labels` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar`
`#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#outils`
`#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
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

### `_hors-ligne.html` — 47 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_index.html` — 46 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 2997 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 104 · `enveloppe` 113 · `oublieGrilles` 156 · `calquesDe` 161 · `reperesDe` 166
`zoneTraversee` 246 · `cleRoleIti` 248 · `roleIti` 249 · `nomRoleIti` 250
`estCirculation` 253 · `formesRole` 278 · `anglePlan` 310 · `dansGrille` 349
`horsGrille` 350 · `grille` 360 · `distanceAuMur` 510 · `cretes` 553 · `nappePrincipale` 571
`celluleDe` 606 · `caseDe` 610 · `centreCase` 615 · `empriseDe` 658 · `accrocheDepuis` 690
`versLeMilieu` 746 · `accroche` 777 · `Tas` 792 · `travail` 836 · `cherche` 859
`distancesDepuis` 926 · `distancesMulti` 940 · `regleFoule` 1012 · `ecarteFoule` 1029
`heureAuSalon` 1033 · `sallesEnMouvement` 1042 · `foule` 1085 · `bilanFoule` 1173
`reduit` 1202 · `guidageAllees` 1265 · `recentre` 1321 · `passable` 1406 · `lisse` 1440
`longueur` 1467 · `longueurDehors` 1483 · `nettoie` 1525 · `oublieFaces` 1572
`facesLibres` 1574 · `amorce` 1647 · `faceDeSortie` 1682 · `accesDe` 1712
`couplesAcces` 1757 · `troncon` 1790 · `pointObjet` 1833 · `pointRepere` 1840
`candidats` 1849 · `pointSaisi` 1875 · `portesDe` 1893 · `versPorte` 1900
`typeLiaison` 1961 · `nomRepere` 1969 · `oublieLiaisons` 1987 · `lienEcrits` 1999
`ecritLiens` 2008 · `annuaireLiaisons` 2013 · `liensDe` 2045 · `coutLiaison` 2065
`passagePraticable` 2072 · `passagesDe` 2080 · `sortiesDe` 2090 · `plansRelies` 2098
`balayage` 2122 · `distanceDepuis` 2136 · `cheminLiaisons` 2163 · `routeParLiaisons` 2247
`routeEntre` 2283 · `calculeRoute` 2322 · `couleurNappe` 2348 · `rafraichitApercu` 2354
`marchesIci` 2397 · `rayonBout` 2402 · `dessineItineraire` 2407 · `rafraichitBouts` 2451
`cadreItineraire` 2474 · `champIti` 2498 · `ecritDistance` 2502 · `ecritDuree` 2510
`fermeSugg` 2515 · `montreSugg` 2522 · `choisitPoint` 2554 · `valideSaisie` 2563
`effaceItineraire` 2573 · `relance` 2595 · `phraseLiaison` 2646 · `montreResultat` 2660
`bandeauVisee` 2800 · `armeVisee` 2814 · `finVisee` 2828 · `viseItineraire` 2843
`visePoi` 2849 · `visePoint` 2855 · `ouvreItineraire` 2881 · `fermeItineraire` 2909
`versItineraire` 2919 · `versItineraireDe` 2922

### `_journee.html` — 1000 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 70
`jourPropose` 83 · `pointConf` 98 · `departsProposes` 117 · `matriceJournee` 141
`rangeJournee` 243 · `calculeJournee` 360 · `rangJournee` 572 · `lienJournee` 584
`arretJournee` 591 · `remplitJournee` 616 · `appliqueVueParcours` 766 · `traceJournee` 796
`montreJournee` 804 · `perimeJournee` 817 · `ouvreOrganisation` 826 · `lanceJournee` 965

### `_js.html` — 3535 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.386 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.496 · 3. Rendu du pavillon courant
- l.575 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.695 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1624 · 6. Vue
- l.1896 · 7. Sélection et fiche
- l.3047 · 8. Interactions du plan
- l.3349 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `nomDeLaZone` 69 · `nomsAnglaisDesZones` 71 · `indexe` 79
`chronoConf` 305 · `rangeConferences` 326 · `poseFavicon` 373 · `largeur` 391
`decoupe` 416 · `habille` 429 · `lignesSvg` 440 · `coexComptes` 457 · `coexChoisit` 458
`ligneCode` 474 · `monteHabillage` 502 · `montePlan` 519 · `onglets` 551 · `changePlan` 567
`ancre` 583 · `place` 584 · `libelles` 586 · `decaleLibelle` 651 · `facteurLibelle` 652
`libelleForce` 653 · `libelleZone` 656 · `libelleEmplacement` 675 · `indexeSecteurs` 716
`secteursMontres` 729 · `couleurConf` 733 · `hslHex` 737 · `couleurSecteur` 755
`BANDES` 774 · `majFondus` 782 · `pastilleSecteur` 820 · `coloreSecteurs` 833
`appliqueSecteurs` 876 · `filtreTheme` 893 · `themeFiltrable` 971 · `clesCriteres` 987
`libelleCritere` 994 · `separeValeurs` 1002 · `valeursCritere` 1019 · `texteCriteres` 1032
`indexeCriteres` 1045 · `dansCriteres` 1072 · `critereActif` 1080 · `basculeCritere` 1082
`videCriteres` 1091 · `majVideQ` 1100 · `videRecherche` 1113 · `nCriteres` 1128
`majCriteres` 1137 · `ouvreCriteres` 1195 · `filtre` 1308 · `reposeRetrait` 1328
`critParSociete` 1332 · `cherchable` 1342 · `visible` 1349 · `releveHotes` 1365
`visibleSurPlan` 1373 · `visibleSociete` 1384 · `marqueRetrait` 1400 · `appliqueFiltre` 1412
`oublieRetrait` 1424 · `reprendRecherche` 1433 · `rangSorte` 1446 · `codeCase` 1468
`caseNumero` 1485 · `sousLigne` 1505 · `liste` 1519 · `cadrePlan` 1639 · `oublieCadre` 1640
`figeTextes` 1656 · `rendTextes` 1661 · `appliqueVue` 1666 · `rafraichitVue` 1689
`poseVue` 1701 · `masque` 1720 · `masqueDroite` 1752 · `fit` 1763 · `stoppeZoom` 1793
`glisseVersVise` 1799 · `glisseVers` 1841 · `rectVisee` 1863 · `zoom` 1882 · `echelle` 1888
`ETROIT` 1902 · `anime` 1904 · `noeud` 1928 · `canalPlan` 1938 · `rangSociete` 1946
`select` 1955 · `centre` 1974 · `centrePoint` 1978 · `montre` 2023 · `libelleCorps` 2055
`ordreCorps` 2067 · `groupesFiche` 2099 · `valeurCorps` 2112 · `champCorps` 2117
`groupeCorps` 2125 · `corpsRange` 2138 · `momentLocal` 2173 · `programme` 2196
`jourLong` 2229 · `ficheConf` 2240 · `lien` 2334 · `adresseWeb` 2342 · `pictoRS` 2385
`adresseSure` 2403 · `adresseImage` 2430 · `imageSure` 2443 · `assainitRiche` 2472
`enBlocs` 2512 · `rangeRiche` 2525 · `ecarteClicFantome` 2553 · `nomSociete` 2562
`societes` 2575 · `choisitExposant` 2586 · `poseMarque` 2624 · `poseCode` 2674
`rangeMarque` 2715 · `ouvre` 2761 · `ferme` 3021 · `onglet` 3037 · `milieu` 3067
`commencePince` 3073 · `suitPince` 3087 · `cibleElargie` 3165 · `mesureTiroir` 3360
`montreTiroir` 3363

Éléments :

`#data` · `#dGo` · `#dItin`

### `_langue.js` — 712 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_mesure.html` — 400 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 61 · `jetonMesure` 64 · `jourIso` 103 · `echeanceMesure` 104
`jetonRetenu` 128 · `supportMesure` 177 · `envoieMesures` 221 · `mesure` 263
`effaceJetonsVisiteur` 317 · `refuseMesure` 335 · `ouvreConfidentialite` 353

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

### `_parcours.html` — 395 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 58 · `signetParcours` 87 · `boutonParcours` 93
`rafraichitMarque` 98 · `brancheParcours` 111 · `calqueMarques` 143 · `dessineMarques` 159
`marqueParcours` 189 · `rafraichitParcours` 203 · `instantConf` 231 · `cleTemps` 235
`jourCourt` 241 · `nomDeStand` 248 · `rangParcours` 250 · `groupeParcours` 266
`remplitParcours` 275 · `ouvreParcours` 347 · `fermeParcours` 359

### `_partage.html` — 654 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`codeIdParcours` 54 · `codeParcours` 72 · `champParcours` 84 · `litCodeParcours` 91
`lienParcours` 117 · `qrMotsBruts` 157 · `qrMotsUtiles` 166 · `qrMul` 177
`qrGenerateur` 180 · `qrReste` 191 · `qrAlignements` 202 · `qrTrame` 218 · `qrSvg` 402
`ouvrePartageParcours` 428 · `boutonsPartage` 477 · `accueilleParcoursPartage` 551
`adoptePartage` 637

### `_pile.html` — 485 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : deux sections, chacune rangée par nom
- l.301 · Repères
- l.353 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 75 · `boutonAjout` 82 · `boutonVerrou` 93 · `intertitre` 101
`construitPanneau` 108 · `sectionSelection` 317 · `sectionFond` 373 · `ligneCouleur` 427
`rangSecteur` 447 · `rangSous` 459 · `defautCouleur` 481

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

### `_sw.js` — 165 l. → sw.js

Fonctions :

`range` 74 · `dabordCache` 84 · `dabordReseau` 102 · `navigation` 119

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 474 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/eventmaker.ts` — 800 l.

`grapheJson` 147 · `enParallele` 662 · `texteSeul` 682 · `champs` 765

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

### `supabase/functions/plan-public/index.ts` — 588 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 174 · `ampute` 198 · `masquesDe` 238
`masquesDuPlan` 258

### `supabase/functions/sync-evenement/index.ts` — 1513 l.

`cors` 42 · `bourre` 111 · `client` 121 · `gaia` 128 · `libellesChoix` 139
`retiensAnglais` 166 · `fournisseur` 184 · `raccourci` 192 · `enClair` 229 · `range` 255
`champsKlipso` 276 · `hebergee` 1470 · `nettoieUrl` 1489 · `groupeTextes` 1499

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
