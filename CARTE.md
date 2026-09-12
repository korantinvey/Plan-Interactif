<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 2825 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.1864 · 10. Mode administration
- l.1942 · La fiche d'une zone organisateur
- l.2572 · Masquer une zone organisateur
- l.2655 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `salonPartage` 335 · `trio` 348 · `melange` 358
`themeSombre` 366 · `appliqueAccent` 380 · `appliqueFond` 411 · `modeleRetenu` 449
`posePoliceLibelles` 499 · `appliqueModele` 527 · `habilleModale` 568 · `texteCorps` 639
`standApercu` 654 · `lignesApercu` 678 · `contenuApercu` 704 · `apercuFiche` 741
`apercuListe` 818 · `apercuDuo` 840 · `glisseFenetre` 873 · `ouvreReglages` 884
`voletZones` 978 · `ficheZoneEnPlace` 1055 · `voletPlan` 1073 · `nomDuTon` 1200
`voletApparence` 1205 · `clesFiche` 1318 · `voletOrdre` 1334 · `enregistreConf` 1813
`rgbHex` 1820 · `hexa` 1827 · `luminance` 1831 · `ecarte` 1845 · `joli` 1860
`retireAdmin` 1877 · `activeAdmin` 1890 · `champZone` 1968 · `champsZone` 1993
`champSalles` 2049 · `nomDeZone` 2101 · `reduitLogo` 2135 · `champLogo` 2176
`editeurRiche` 2273 · `memeFicheZone` 2430 · `suitFicheZone` 2435 · `verseFicheZone` 2443
`ficheZone` 2469 · `enregistreZone` 2494 · `basculeAffichageZone` 2583
`marqueZonesMasquees` 2600 · `ecritColonnesEvenement` 2620 · `ecritColonneEvenement` 2651
`cleLibelle` 2676 · `empreinteLibelle` 2692 · `placementLibelle` 2700 · `posePlacement` 2710
`libelleAutomatique` 2727 · `modePlacementLibelles` 2736 · `majPaletteLibelle` 2753
`choisitLibelle` 2770 · `pousseLibelle` 2777 · `libellePointerDown` 2785
`libellePointerMove` 2800 · `libellePointerUp` 2809

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

### `_console-js.html` — 2804 l. → admin-plans.html

- l.829 · Provenance des données
- l.956 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 119 · `fonction` 394 · `slugifie` 408
`courant` 412 · `charge` 414 · `chargePlans` 429 · `majEvenement` 434 · `selonAdresse` 454
`majAdresse` 462 · `majBarre` 477 · `dessineChoix` 519 · `champ` 539 · `reduitIcone` 593
`champFavicon` 634 · `dessineFiche` 711 · `fournisseurUtilise` 891 · `source` 895
`champCle` 900 · `ligneSource` 935 · `paraitSurFiche` 1087 · `origineConferences` 1093
`resumeProvenance` 1158 · `resumeFiche` 1175 · `caseFiche` 1221 · `champsPersos` 1263
`criteres` 1269 · `ecritFiche` 1272 · `caseCritere` 1287 · `clePerso` 1306
`ajouteChampPerso` 1314 · `renommeChampPerso` 1325 · `retireChampPerso` 1343
`lignesPerso` 1391 · `ligneOutil` 1411 · `ligneReglage` 1427 · `ouvreProvenance` 1439
`ouvreSources` 1462 · `cadreFiche` 1514 · `ouvreFiche` 1543 · `sousTitre` 1693
`tableauChamps` 1708 · `encode` 1851 · `decode` 1853 · `correspondance` 1858
`sansPrefixe` 1861 · `courte` 1862 · `intitule` 1877 · `intituleSuite` 1889
`separeValeurs` 1903 · `aplani` 1924 · `memeStyle` 1934 · `autreFace` 1952
`champOrigine` 1968 · `majLiens` 2235 · `majIntegration` 2262 · `majMsgSync` 2269
`etapesPressenties` 2299 · `synchronise` 2313 · `dupliquer` 2364 · `litMonProfil` 2462
`RETOUR_MDP` 2473 · `litComptes` 2475 · `ligneMessage` 2484 · `casesSalons` 2494
`ouvreComptes` 2524 · `ouvreFicheCompte` 2616 · `videEcran` 2775 · `dessine` 2780
`demarre` 2792

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 620 l. → console.css

- l.566 · Page de rapport

### `_dessin.html` — 1691 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 34 · `mesCalques` 42 · `enregistreDessins` 43
`instantane` 77 · `memorise` 78 · `restaure` 83 · `annule` 92 · `refais` 104
`trouveCalque` 106 · `nouvelId` 107 · `cheminArrondi` 125 · `estCadre` 168
`cheminForme` 170 · `styleTrait` 190 · `poseTrait` 203 · `dessineDessins` 210
`versPlan` 252 · `apercu` 258 · `apercuGuide` 270 · `toleranceTrace` 294
`aimanteContour` 299 · `rayonContour` 302 · `redresseTrace` 321 · `traceGuide` 355
`fermeIci` 362 · `ajouteForme` 367 · `pictoDe` 467 · `nomTypeRepere` 512 · `typeZone` 538
`pictoForme` 545 · `estPorte` 565 · `ouvreEntrant` 566 · `ouvreSortant` 567
`traceRepere` 581 · `etiquetteSociete` 649 · `nomSurLePlan` 653 · `societeDeForme` 664
`societesDuPlan` 675 · `remplitListeSocietes` 686 · `societeSaisie` 694
`traceStandDessine` 710 · `texteStandDessine` 734 · `poseLibellesDessines` 752
`decoupeStand` 773 · `marqueStandsDessines` 785 · `rafraichitStandsDessines` 800
`oublieReperes` 830 · `reperesCherchables` 832 · `vaAuRepere` 876 · `clePoi` 911
`cartouchePoi` 913 · `ouvrePoi` 1017 · `mesureCartouche` 1089 · `phareRepere` 1098
`phareZone` 1100 · `eclairePoi` 1106 · `oublieChoixPoi` 1138 · `signale` 1147
`calquePourImage` 1161 · `poseImage` 1178 · `importeImage` 1191 · `dessinPointerDown` 1242
`dessinPointerMove` 1316 · `dessinPointerUp` 1354 · `termineTrace` 1390 · `aide` 1402
`choisitOutil` 1427 · `enchaineStand` 1451 · `activeCalque` 1509 · `cleVerrou` 1565
`verrouille` 1566 · `basculeVerrou` 1568 · `pictoVerrou` 1585 · `montreRoleIti` 1618
`creeCalque` 1649 · `demandeNom` 1662 · `renommeCalque` 1681

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

### `_export.html` — 153 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 66 · `libellePeriode` 83 · `nomFichierExport` 89
`nomFeuilleExport` 99 · `exporteExposants` 115

### `_head.html` — 3552 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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

### `_itineraire.html` — 2497 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 86 · `enveloppe` 95 · `oublieGrilles` 138 · `calquesDe` 141 · `reperesDe` 146
`cleRoleIti` 205 · `roleIti` 206 · `nomRoleIti` 207 · `estCirculation` 210
`formesRole` 226 · `obstaclesPmr` 251 · `anglePlan` 288 · `dansGrille` 327
`horsGrille` 328 · `grille` 338 · `distanceAuMur` 462 · `nappePrincipale` 504
`celluleDe` 539 · `caseDe` 543 · `centreCase` 548 · `empriseDe` 570 · `accrocheDepuis` 602
`versLeMilieu` 658 · `accroche` 685 · `Tas` 700 · `travail` 744 · `cherche` 762
`distancesDepuis` 828 · `distancesMulti` 842 · `reduit` 877 · `guidageAllees` 913
`recentre` 942 · `passable` 990 · `lisse` 1023 · `longueur` 1048 · `longueurDehors` 1064
`nettoie` 1106 · `oublieFaces` 1141 · `facesLibres` 1143 · `amorce` 1216
`faceDeSortie` 1251 · `accesDe` 1281 · `couplesAcces` 1316 · `troncon` 1336
`pointObjet` 1369 · `pointRepere` 1376 · `candidats` 1385 · `pointSaisi` 1411
`portesDe` 1429 · `versPorte` 1436 · `typeLiaison` 1497 · `nomRepere` 1503
`oublieLiaisons` 1521 · `lienEcrits` 1533 · `ecritLiens` 1542 · `annuaireLiaisons` 1547
`liensDe` 1579 · `coutLiaison` 1599 · `passagePraticable` 1606 · `passagesDe` 1614
`sortiesDe` 1624 · `plansRelies` 1632 · `balayage` 1656 · `distanceDepuis` 1670
`cheminLiaisons` 1697 · `routeParLiaisons` 1781 · `routeEntre` 1817 · `calculeRoute` 1856
`couleurNappe` 1882 · `rafraichitApercu` 1888 · `marchesIci` 1931 · `rayonBout` 1936
`dessineItineraire` 1941 · `rafraichitBouts` 1985 · `cadreItineraire` 2008 · `champIti` 2032
`ecritDistance` 2036 · `ecritDuree` 2044 · `fermeSugg` 2049 · `montreSugg` 2056
`choisitPoint` 2088 · `valideSaisie` 2097 · `effaceItineraire` 2107 · `relance` 2129
`phraseLiaison` 2180 · `montreResultat` 2194 · `bandeauVisee` 2316 · `armeVisee` 2330
`finVisee` 2338 · `viseItineraire` 2350 · `visePoi` 2356 · `visePoint` 2362
`ouvreItineraire` 2383 · `fermeItineraire` 2409 · `versItineraire` 2419
`versItineraireDe` 2422

### `_journee.html` — 912 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 112 · `matriceJournee` 136
`rangeJournee` 238 · `calculeJournee` 334 · `rangJournee` 522 · `lienJournee` 534
`arretJournee` 541 · `remplitJournee` 566 · `appliqueVueParcours` 704 · `traceJournee` 730
`montreJournee` 738 · `perimeJournee` 751 · `ouvreOrganisation` 760 · `lanceJournee` 877

### `_js.html` — 3427 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.304 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.414 · 3. Rendu du pavillon courant
- l.493 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.613 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1542 · 6. Vue
- l.1812 · 7. Sélection et fiche
- l.2955 · 8. Interactions du plan
- l.3257 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `indexe` 55 · `chronoConf` 223 · `rangeConferences` 244
`poseFavicon` 291 · `largeur` 309 · `decoupe` 334 · `habille` 347 · `lignesSvg` 358
`coexComptes` 375 · `coexChoisit` 376 · `ligneCode` 392 · `monteHabillage` 420
`montePlan` 437 · `onglets` 469 · `changePlan` 485 · `ancre` 501 · `place` 502
`libelles` 504 · `decaleLibelle` 569 · `facteurLibelle` 570 · `libelleForce` 571
`libelleZone` 574 · `libelleEmplacement` 593 · `indexeSecteurs` 634 · `secteursMontres` 647
`couleurConf` 651 · `hslHex` 655 · `couleurSecteur` 673 · `BANDES` 692 · `majFondus` 700
`pastilleSecteur` 738 · `coloreSecteurs` 751 · `appliqueSecteurs` 794 · `filtreTheme` 811
`themeFiltrable` 889 · `clesCriteres` 905 · `libelleCritere` 912 · `separeValeurs` 920
`valeursCritere` 937 · `texteCriteres` 950 · `indexeCriteres` 963 · `dansCriteres` 990
`critereActif` 998 · `basculeCritere` 1000 · `videCriteres` 1009 · `majVideQ` 1018
`videRecherche` 1031 · `nCriteres` 1046 · `majCriteres` 1055 · `ouvreCriteres` 1113
`filtre` 1226 · `reposeRetrait` 1246 · `critParSociete` 1250 · `cherchable` 1260
`visible` 1267 · `releveHotes` 1283 · `visibleSurPlan` 1291 · `visibleSociete` 1302
`marqueRetrait` 1318 · `appliqueFiltre` 1330 · `oublieRetrait` 1342
`reprendRecherche` 1351 · `rangSorte` 1364 · `codeCase` 1386 · `caseNumero` 1403
`sousLigne` 1423 · `liste` 1437 · `cadrePlan` 1557 · `oublieCadre` 1558 · `figeTextes` 1574
`rendTextes` 1579 · `appliqueVue` 1584 · `rafraichitVue` 1605 · `poseVue` 1617
`masque` 1636 · `masqueDroite` 1668 · `fit` 1679 · `stoppeZoom` 1709 · `glisseVersVise` 1715
`glisseVers` 1757 · `rectVisee` 1779 · `zoom` 1798 · `echelle` 1804 · `ETROIT` 1818
`anime` 1820 · `noeud` 1844 · `canalPlan` 1854 · `rangSociete` 1862 · `select` 1871
`centre` 1890 · `centrePoint` 1894 · `montre` 1939 · `libelleCorps` 1971 · `ordreCorps` 1983
`groupesFiche` 2015 · `valeurCorps` 2028 · `champCorps` 2033 · `groupeCorps` 2041
`corpsRange` 2054 · `momentLocal` 2089 · `programme` 2112 · `jourLong` 2145
`ficheConf` 2156 · `lien` 2250 · `adresseWeb` 2258 · `pictoRS` 2301 · `adresseSure` 2319
`adresseImage` 2346 · `imageSure` 2359 · `assainitRiche` 2388 · `enBlocs` 2428
`rangeRiche` 2441 · `ecarteClicFantome` 2469 · `nomSociete` 2478 · `societes` 2491
`choisitExposant` 2502 · `poseMarque` 2540 · `poseCode` 2590 · `rangeMarque` 2631
`ouvre` 2677 · `ferme` 2929 · `onglet` 2945 · `milieu` 2975 · `commencePince` 2981
`suitPince` 2995 · `cibleElargie` 3073 · `mesureTiroir` 3268 · `montreTiroir` 3271

Éléments :

`#data` · `#dGo` · `#dItin`

### `_mesure.html` — 147 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 13. Mesure d'utilisation

Fonctions :

`jetonMesure` 25 · `jetonRetenu` 46 · `envoieMesures` 79 · `mesure` 117

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

### `_parcours.html` — 386 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 58 · `signetParcours` 87 · `boutonParcours` 93
`rafraichitMarque` 98 · `brancheParcours` 111 · `calqueMarques` 143 · `dessineMarques` 159
`marqueParcours` 189 · `rafraichitParcours` 203 · `instantConf` 227 · `cleTemps` 231
`jourCourt` 237 · `rangParcours` 241 · `groupeParcours` 257 · `remplitParcours` 266
`ouvreParcours` 338 · `fermeParcours` 350

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

### `_pousse.html` — 411 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · Enregistrer la configuration

Fonctions :

`accesBase` 57 · `autoDispo` 69 · `enRetard` 72 · `etatCourant` 85 · `majAttente` 96
`ditEtat` 106 · `programmeEnvoi` 113 · `programmePublication` 127 · `rattrapeRetard` 134
`envoie` 139 · `presse` 152 · `resteSession` 178 · `renouvelleSession` 194 · `base` 218
`identifiants` 259 · `reglagesSeuls` 274 · `oublieCache` 285 · `pousseConfiguration` 304

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

### `_suggestion.html` — 612 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 57 · `seuilSugg` 59 · `presentationSugg` 74 · `critereSugg` 80
`indexSugg` 92 · `valeursSugg` 117 · `suggestionCourante` 136 · `exposantPropose` 168
`nomValeurSugg` 186 · `phraseSuggestion` 207 · `carteSuggestion` 228 · `poseSuggestion` 263
`fenetreSuggestion` 276 · `relevePalmares` 310 · `etiquetteSugg` 330 · `voletSuggestion` 340

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

### `supabase/functions/plan-public/index.ts` — 569 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 174 · `ampute` 198 · `masquesDe` 238
`masquesDuPlan` 258

### `supabase/functions/sync-evenement/index.ts` — 1373 l.

`cors` 42 · `bourre` 111 · `client` 121 · `gaia` 128 · `libellesChoix` 139
`fournisseur` 164 · `range` 200 · `champsKlipso` 221 · `hebergee` 1330 · `nettoieUrl` 1349
`groupeTextes` 1359

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
