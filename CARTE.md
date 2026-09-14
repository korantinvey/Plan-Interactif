<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 3797 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.2762 · 10. Mode administration
- l.2849 · La fiche d'une zone organisateur
- l.3543 · Masquer une zone organisateur
- l.3626 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `lueHeure` 355 · `lueDate` 359
`datesSalon` 366 · `horairesSalon` 380 · `salonPartage` 393 · `presseNuanciers` 424
`suitNuancier` 440 · `trio` 468 · `melange` 478 · `themeSombre` 486 · `appliqueAccent` 500
`appliqueFond` 531 · `modeleRetenu` 569 · `policeChoisie` 725 · `policeDuModele` 730
`feuillePolice` 740 · `chargePolice` 762 · `policePrete` 782 · `policeDesNoms` 800
`posePoliceLibelles` 829 · `appliqueModele` 861 · `habilleModale` 902 · `texteCorps` 973
`standApercu` 988 · `lignesApercu` 1012 · `contenuApercu` 1038 · `apercuFiche` 1075
`apercuListe` 1153 · `apercuDuo` 1175 · `glisseFenetre` 1208 · `ouvreReglages` 1219
`voletZones` 1318 · `champsFicheZone` 1420 · `ficheZoneEnPlace` 1490 · `voletPlan` 1508
`blocHoraires` 1694 · `sallesSituees` 1827 · `voletPmr` 1843 · `nomDuTon` 1934
`voletApparence` 1939 · `clesFiche` 2138 · `voletOrdre` 2155 · `enregistreConf` 2711
`rgbHex` 2718 · `hexa` 2725 · `luminance` 2729 · `ecarte` 2743 · `joli` 2758
`retireAdmin` 2775 · `activeAdmin` 2788 · `champZone` 2875 · `champsZone` 2900
`champSalles` 2992 · `nomDeZone` 3044 · `reduitLogo` 3078 · `champLogo` 3119
`editeurRiche` 3216 · `memeFicheZone` 3373 · `suitFicheZone` 3380 · `verseFicheZone` 3388
`ficheZone` 3414 · `enregistreZone` 3439 · `basculeAffichageZone` 3554
`marqueZonesMasquees` 3571 · `ecritColonnesEvenement` 3591 · `ecritColonneEvenement` 3622
`cleLibelle` 3647 · `empreinteLibelle` 3663 · `placementLibelle` 3671 · `posePlacement` 3681
`libelleAutomatique` 3698 · `modePlacementLibelles` 3707 · `majPaletteLibelle` 3724
`choisitLibelle` 3741 · `pousseLibelle` 3748 · `libellePointerDown` 3756
`libellePointerMove` 3772 · `libellePointerUp` 3781

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

### `_auth-plan.html` — 182 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45 · `mailDuJeton` 120 · `initialesDe` 129 · `themeSombreA` 136
`poseCompte` 141

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

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

### `_console-js.html` — 3011 l. → admin-plans.html

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
`renommeChampPerso` 1409 · `retireChampPerso` 1457 · `lignesPerso` 1515 · `ligneOutil` 1535
`ligneReglage` 1551 · `ouvreProvenance` 1563 · `ouvreSources` 1586 · `cadreFiche` 1638
`ouvreFiche` 1668 · `cadreCategories` 1806 · `sousTitre` 1885 · `tableauChamps` 1900
`encode` 2043 · `decode` 2045 · `correspondance` 2050 · `sansPrefixe` 2053 · `courte` 2054
`intitule` 2069 · `intituleSuite` 2081 · `separeValeurs` 2095 · `aplani` 2116
`memeStyle` 2126 · `autreFace` 2144 · `champOrigine` 2160 · `majLiens` 2427
`majIntegration` 2464 · `majMsgSync` 2471 · `etapesPressenties` 2501 · `synchronise` 2515
`dupliquer` 2566 · `litMonProfil` 2666 · `RETOUR_MDP` 2677 · `litComptes` 2679
`ligneMessage` 2688 · `casesSalons` 2698 · `ouvreComptes` 2728 · `ouvreFicheCompte` 2820
`videEcran` 2979 · `dessine` 2984 · `demarre` 2999

Éléments :

`#fuseaux` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 651 l. → console.css

- l.592 · Page de rapport

### `_dessin.html` — 1814 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `notePubliees` 48 · `dejaPubliee` 54 · `marqueAttente` 60 · `mesCalques` 68
`enregistreDessins` 69 · `instantane` 103 · `memorise` 104 · `restaure` 109 · `annule` 118
`refais` 130 · `trouveCalque` 132 · `nouvelId` 133 · `cheminArrondi` 151 · `estCadre` 194
`cheminForme` 196 · `styleTrait` 216 · `longueurFleche` 242 · `cheminFleche` 249
`marqueFleche` 278 · `rafraichitFleches` 289 · `poseTrait` 305 · `dessineDessins` 313
`peintCalque` 359 · `versPlan` 365 · `apercu` 371 · `apercuGuide` 383 · `toleranceTrace` 407
`aimanteContour` 412 · `rayonContour` 415 · `redresseTrace` 434 · `traceGuide` 468
`fermeIci` 475 · `ajouteForme` 480 · `pictoDe` 580 · `nomTypeRepereFr` 631
`nomTypeRepere` 632 · `typeZone` 658 · `pictoForme` 665 · `estPorte` 685
`ouvreEntrant` 686 · `ouvreSortant` 687 · `traceRepere` 701 · `etiquetteSociete` 769
`nomSurLePlan` 773 · `societeDeForme` 784 · `societesDuPlan` 795
`remplitListeSocietes` 806 · `societeSaisie` 814 · `traceStandDessine` 830
`texteStandDessine` 854 · `poseLibellesDessines` 872 · `decoupeStand` 893
`marqueStandsDessines` 905 · `rafraichitStandsDessines` 920 · `oublieReperes` 950
`reperesCherchables` 952 · `vaAuRepere` 996 · `clePoi` 1031 · `cartouchePoi` 1033
`ouvrePoi` 1137 · `mesureCartouche` 1209 · `phareRepere` 1218 · `phareZone` 1220
`eclairePoi` 1226 · `oublieChoixPoi` 1259 · `signale` 1268 · `calquePourImage` 1282
`poseImage` 1299 · `importeImage` 1312 · `dessinPointerDown` 1363 · `dessinPointerMove` 1437
`dessinPointerUp` 1475 · `termineTrace` 1511 · `aide` 1523 · `choisitOutil` 1548
`enchaineStand` 1572 · `activeCalque` 1631 · `cleVerrou` 1687 · `verrouille` 1688
`basculeVerrou` 1690 · `pictoVerrou` 1707 · `montreRoleIti` 1741 · `creeCalque` 1772
`demandeNom` 1785 · `renommeCalque` 1804

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

### `_export.html` — 215 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 106 · `libellePeriode` 138 · `nomFichierExport` 144
`nomFeuilleExport` 154 · `exporteExposants` 170

### `_head.html` — 4071 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#bandeau` · `#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones`
`#btnItineraire` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnLangue` · `#btnTheme` · `#menuCompte` · `#avatarCompte` · `#compteMail`
`#btnThemeCompte` · `#btnSortir` · `#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side`
`#poignee` · `#q` · `#videQ` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#count`
`#countTxt` · `#list` · `#piedSide` · `#btnConfidentialite` · `#stage` · `#plan`
`#couches` · `#zones` · `#stands` · `#labels` · `#calqueLibelles` · `#zIn` · `#zOut`
`#zFit` · `#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#bornePose` · `#bornePoser` · `#outils` · `#outilsCalque` · `#renommeOutils`
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

### `_itineraire.html` — 3025 l. → plan-admin.html, plan-smcl.html, plan.html

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
`fermeSugg` 2515 · `montreSugg` 2522 · `choisitPoint` 2556 · `valideSaisie` 2565
`effaceItineraire` 2577 · `relance` 2604 · `phraseLiaison` 2655 · `montreResultat` 2669
`bandeauVisee` 2811 · `armeVisee` 2829 · `finVisee` 2846 · `viseItineraire` 2862
`visePoi` 2868 · `visePoint` 2874 · `ouvreItineraire` 2903 · `fermeItineraire` 2931
`versItineraire` 2941 · `versItineraireDe` 2944

### `_journee.html` — 1004 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 70
`jourPropose` 83 · `pointConf` 98 · `departsProposes` 117 · `matriceJournee` 145
`rangeJournee` 247 · `calculeJournee` 364 · `rangJournee` 576 · `lienJournee` 588
`arretJournee` 595 · `remplitJournee` 620 · `appliqueVueParcours` 770 · `traceJournee` 800
`montreJournee` 808 · `perimeJournee` 821 · `ouvreOrganisation` 830 · `lanceJournee` 969

### `_js.html` — 3853 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.386 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.496 · 3. Rendu du pavillon courant
- l.577 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.713 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1663 · 6. Vue
- l.2034 · 7. Sélection et fiche
- l.3225 · 8. Interactions du plan
- l.3534 · Le tiroir de la liste — écrans étroits
- l.3691 · Le tiroir de la fiche — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `nomDeLaZone` 69 · `nomsAnglaisDesZones` 71 · `indexe` 79
`chronoConf` 305 · `rangeConferences` 326 · `poseFavicon` 373 · `largeur` 391
`decoupe` 416 · `habille` 429 · `lignesSvg` 440 · `coexComptes` 457 · `coexChoisit` 458
`ligneCode` 474 · `monteHabillage` 502 · `montePlan` 519 · `onglets` 553 · `changePlan` 569
`ancre` 585 · `place` 586 · `libelles` 588 · `decaleLibelle` 669 · `facteurLibelle` 670
`libelleForce` 671 · `libelleZone` 674 · `libelleEmplacement` 693 · `indexeSecteurs` 734
`secteursMontres` 747 · `couleurConf` 751 · `hslHex` 755 · `couleurSecteur` 773
`BANDES` 792 · `majFondus` 800 · `pastilleSecteur` 838 · `coloreSecteurs` 851
`peintSecteur` 902 · `appliqueSecteurs` 915 · `filtreTheme` 932 · `themeFiltrable` 1010
`clesCriteres` 1026 · `libelleCritere` 1033 · `separeValeurs` 1041 · `valeursCritere` 1058
`texteCriteres` 1071 · `indexeCriteres` 1084 · `dansCriteres` 1111 · `critereActif` 1119
`basculeCritere` 1121 · `videCriteres` 1130 · `majVideQ` 1139 · `videRecherche` 1152
`nCriteres` 1167 · `majCriteres` 1176 · `ouvreCriteres` 1234 · `filtre` 1347
`reposeRetrait` 1367 · `critParSociete` 1371 · `cherchable` 1381 · `visible` 1388
`releveHotes` 1404 · `visibleSurPlan` 1412 · `visibleSociete` 1423 · `marqueRetrait` 1439
`appliqueFiltre` 1451 · `oublieRetrait` 1463 · `reprendRecherche` 1472 · `rangSorte` 1485
`codeCase` 1507 · `caseNumero` 1524 · `sousLigne` 1544 · `liste` 1558 · `cadrePlan` 1678
`oublieCadre` 1679 · `figeTextes` 1695 · `rendTextes` 1703 · `cadrage` 1739
`peintLibelles` 1744 · `detacheLibelles` 1750 · `rattacheLibelles` 1762
`etireLibelles` 1780 · `appliqueVue` 1788 · `rafraichitVue` 1826 · `poseVue` 1838
`masque` 1857 · `masqueDroite` 1889 · `fit` 1900 · `stoppeZoom` 1930 · `glisseVersVise` 1936
`glisseVers` 1978 · `rectVisee` 2000 · `zoom` 2020 · `echelle` 2026 · `ETROIT` 2040
`anime` 2042 · `noeud` 2066 · `canalPlan` 2076 · `rangSociete` 2084 · `select` 2093
`centre` 2112 · `centrePoint` 2116 · `montre` 2161 · `libelleCorps` 2193 · `ordreCorps` 2210
`groupesFiche` 2242 · `montreIntitule` 2255 · `valeurCorps` 2275 · `champCorps` 2288
`groupeCorps` 2300 · `corpsRange` 2313 · `momentLocal` 2348 · `programme` 2371
`jourLong` 2404 · `ficheConf` 2415 · `lien` 2509 · `adresseWeb` 2517 · `pictoRS` 2560
`adresseSure` 2578 · `adresseImage` 2605 · `imageSure` 2618 · `assainitRiche` 2647
`enBlocs` 2687 · `rangeRiche` 2700 · `ecarteClicFantome` 2728 · `nomSociete` 2737
`societes` 2750 · `choisitExposant` 2761 · `poseMarque` 2799 · `poseCode` 2849
`rangeMarque` 2890 · `ouvre` 2936 · `ferme` 3199 · `onglet` 3215 · `milieu` 3245
`commencePince` 3251 · `suitPince` 3265 · `cibleElargie` 3345 · `mesureTiroir` 3545
`montreTiroir` 3548

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

### `_pile.html` — 493 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : deux sections, chacune rangée par nom
- l.304 · Repères
- l.356 · Fond du plan

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 75 · `boutonAjout` 82 · `boutonVerrou` 93 · `intertitre` 101
`construitPanneau` 108 · `sectionSelection` 320 · `sectionFond` 376 · `ligneCouleur` 434
`rangSecteur` 454 · `rangSous` 467 · `defautCouleur` 489

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

### `_webgl.html` — 1164 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2, à l'essai

Fonctions :

`monteWebgl` 61 · `vueDeck` 110 · `vueWebgl` 119 · `blocDe` 128 · `enEdition` 158
`majEditionWebgl` 161 · `cleBloc` 173 · `planifieWebgl` 180 · `toutRepeindreWebgl` 183
`blocsDansLOrdre` 190 · `repeintWebgl` 195 · `assembleWebgl` 219 · `constTexte` 253
`couchesTexte` 303 · `mulM` 337 · `appM` 340 · `echelleM` 341 · `lisTransform` 343
`lisTrace` 365 · `lisPoints` 433 · `num` 439 · `anneau` 441 · `rectArrondi` 447
`couleurGl` 461 · `accVide` 476 · `convertitBloc` 477 · `accDe` 489 · `parcoursGl` 496
`avecTrous` 536 · `formeGl` 557 · `texteGl` 593 · `imageGl` 616 · `partage` 648
`couchesDeBloc` 653 · `modelesLibellesHtml` 701 · `poseModelesLibelles` 711
`lisModelesLibelles` 716 · `emplacementWebgl` 745 · `libellesWebgl` 793 · `groupesNoms` 856
`couchesNoms` 872 · `couchesPastilles` 883 · `couchesLibellesWebgl` 898
`couchesDessineesWebgl` 905 · `stage` 926 · `brancheSurvolWebgl` 930 · `poseSurvolWebgl` 950
`poseCurseurWebgl` 959 · `poseFocusWebgl` 968 · `aplatsDe` 975 · `coucheSurvol` 978
`coucheFocus` 987 · `couchesPhare` 1014 · `lueurDe` 1030 · `opacitePhare` 1068
`echellePhare` 1069 · `couchesPhareNoms` 1072 · `animeCouche` 1086
`majAnimationWebgl` 1100 · `animeWebgl` 1108 · `objetSous` 1131 · `cibleWebgl` 1138
`priseWebgl` 1145 · `libelleSousWebgl` 1150 · `rectEcranWebgl` 1155

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

### `supabase/functions/plan-public/index.ts` — 588 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 174 · `ampute` 198 · `masquesDe` 238
`masquesDuPlan` 258

### `supabase/functions/sync-evenement/index.ts` — 1536 l.

`cors` 42 · `bourre` 111 · `client` 121 · `gaia` 128 · `libellesChoix` 139
`retiensAnglais` 166 · `fournisseur` 184 · `raccourci` 192 · `enClair` 229 · `range` 255
`champsKlipso` 276 · `hebergee` 1493 · `nettoieUrl` 1512 · `groupeTextes` 1522

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
