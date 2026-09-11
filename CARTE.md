<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 1765 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.1069 · 10. Mode administration
- l.1139 · La fiche d'une zone organisateur
- l.1512 · Masquer une zone organisateur
- l.1595 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 200 · `minutesVisite` 228
`salonPartage` 235 · `trio` 248 · `melange` 258 · `themeSombre` 266 · `appliqueAccent` 280
`modeleRetenu` 331 · `appliqueModele` 344 · `texteCorps` 413 · `standApercu` 428
`lignesApercu` 448 · `contenuApercu` 474 · `apercuFiche` 507 · `apercuListe` 567
`apercuDuo` 589 · `glisseFenetre` 622 · `ouvreReglages` 633 · `voletZones` 699
`ficheZoneEnPlace` 776 · `voletPlan` 794 · `nomDuTon` 921 · `voletApparence` 925
`enregistreConf` 1019 · `rgbHex` 1025 · `hexa` 1032 · `luminance` 1036 · `ecarte` 1050
`joli` 1065 · `retireAdmin` 1082 · `activeAdmin` 1095 · `champZone` 1165 · `champsZone` 1190
`editeurRiche` 1252 · `memeFicheZone` 1407 · `suitFicheZone` 1411 · `verseFicheZone` 1419
`ficheZone` 1445 · `enregistreZone` 1470 · `basculeAffichageZone` 1523
`marqueZonesMasquees` 1540 · `ecritTablesZones` 1560 · `ecritTableZones` 1591
`cleLibelle` 1616 · `empreinteLibelle` 1632 · `placementLibelle` 1640 · `posePlacement` 1650
`libelleAutomatique` 1667 · `modePlacementLibelles` 1676 · `majPaletteLibelle` 1693
`choisitLibelle` 1710 · `pousseLibelle` 1717 · `libellePointerDown` 1725
`libellePointerMove` 1740 · `libellePointerUp` 1749

Éléments :

`#pousseConf` · `#razConf`

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

### `_auth-plan.html` — 119 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45

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

### `_console-base.html` — 343 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 16 · `esc` 17 · `entetes` 31 · `rest` 38 · `ouvreModale` 65 · `fermeModale` 80
`demande` 90 · `confirme` 112 · `ecranConfig` 123 · `normaliseUrl` 159
`ecranConnexion` 178 · `deconnecte` 241 · `signale` 252 · `bloc` 273 · `grille` 291
`idCompte` 321

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 56 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet` · `#btnExport` · `#btnTheme`
`#fiche`

### `_console-js.html` — 2715 l. → admin-plans.html

- l.372 · Provenance des données
- l.499 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 17 · `barreAvancement` 56 · `fonction` 79 · `slugifie` 95 · `courant` 99
`charge` 101 · `chargePlans` 116 · `majEvenement` 121 · `selonAdresse` 141
`majAdresse` 149 · `majBarre` 164 · `dessineChoix` 206 · `champ` 226 · `dessineFiche` 251
`fournisseurUtilise` 434 · `source` 438 · `champCle` 443 · `ligneSource` 478
`origineConferences` 598 · `resumeProvenance` 663 · `resumeSalles` 680 · `resumeFiche` 691
`caseFiche` 734 · `champsPersos` 777 · `criteres` 783 · `ecritFiche` 786 · `caseCritere` 801
`clePerso` 820 · `ajouteChampPerso` 828 · `renommeChampPerso` 839 · `retireChampPerso` 857
`lignesPerso` 905 · `clesCorps` 940 · `ordreEffectif` 954 · `libelleCorps` 969
`champsLus` 1011 · `exempleCible` 1026 · `valeurApercu` 1048 · `dessineApercu` 1076
`panneauOrdre` 1149 · `ligneOutil` 1331 · `ligneReglage` 1347 · `ouvreProvenance` 1359
`ouvreSources` 1382 · `ouvreSalles` 1438 · `cadreFiche` 1553 · `ouvreFiche` 1582
`sousTitre` 1732 · `tableauChamps` 1747 · `encode` 1890 · `decode` 1892
`correspondance` 1897 · `sansPrefixe` 1900 · `courte` 1901 · `intitule` 1916
`intituleSuite` 1928 · `separeValeurs` 1942 · `champOrigine` 1954 · `majLiens` 2183
`majIntegration` 2210 · `majMsgSync` 2217 · `synchronise` 2232 · `dupliquer` 2275
`litMonProfil` 2373 · `RETOUR_MDP` 2384 · `litComptes` 2386 · `ligneMessage` 2395
`casesSalons` 2405 · `ouvreComptes` 2435 · `ouvreFicheCompte` 2527 · `videEcran` 2686
`dessine` 2691 · `demarre` 2703

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 577 l. → console.css

- l.523 · Page de rapport

### `_dessin.html` — 1418 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 30 · `mesCalques` 38 · `enregistreDessins` 39
`instantane` 68 · `memorise` 69 · `restaure` 74 · `annule` 83 · `refais` 95
`trouveCalque` 97 · `nouvelId` 98 · `cheminArrondi` 116 · `estCadre` 159 · `cheminForme` 161
`dessineDessins` 173 · `versPlan` 215 · `apercu` 221 · `apercuGuide` 233
`toleranceTrace` 257 · `aimanteContour` 262 · `rayonContour` 265 · `redresseTrace` 284
`traceGuide` 318 · `fermeIci` 325 · `ajouteForme` 330 · `pictoDe` 426 · `nomTypeRepere` 464
`typeZone` 490 · `pictoForme` 501 · `traceRepere` 518 · `etiquetteSociete` 586
`nomSurLePlan` 590 · `societeDeForme` 601 · `societesDuPlan` 612
`remplitListeSocietes` 623 · `societeSaisie` 631 · `traceStandDessine` 647
`texteStandDessine` 671 · `poseLibellesDessines` 689 · `decoupeStand` 710
`marqueStandsDessines` 722 · `rafraichitStandsDessines` 737 · `cartouchePoi` 763
`ouvrePoi` 845 · `mesureCartouche` 913 · `phareRepere` 920 · `phareZone` 921
`eclairePoi` 925 · `signale` 943 · `calquePourImage` 957 · `poseImage` 970
`importeImage` 983 · `dessinPointerDown` 1034 · `dessinPointerMove` 1108
`dessinPointerUp` 1146 · `termineTrace` 1182 · `aide` 1192 · `choisitOutil` 1217
`enchaineStand` 1240 · `activeCalque` 1294 · `montreRoleIti` 1345 · `creeCalque` 1376
`demandeNom` 1389 · `renommeCalque` 1408

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

### `_head.html` — 2608 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#side`
`#poignee` · `#q` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#countTxt` · `#list`
`#stage` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#zIn` · `#zOut`
`#zFit` · `#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#texteADessiner` · `#repereType` · `#repereTexte` · `#standSoc`
`#listeSoc` · `#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRayonBloc` · `#elemRayon` · `#elemStand`
`#listeStands` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom`
`#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#modale` · `#mTitre` · `#mFermer`
`#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail` · `#dMarque`
`#closeDetail` · `#dKind` · `#dName` · `#dRen` · `#dCode` · `#dNeuf` · `#dVis` · `#dPartage`
`#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps` · `#jCorps` · `#pPied`
`#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire` · `#jRetour` · `#itineraire`
`#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange`
`#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

### `_index.html` — 30 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 2417 l. → plan-admin.html, plan-smcl.html, plan.html

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
`dessineItineraire` 1875 · `rafraichitBouts` 1919 · `cadreItineraire` 1934 · `champIti` 1957
`ecritDistance` 1961 · `ecritDuree` 1969 · `fermeSugg` 1974 · `montreSugg` 1981
`choisitPoint` 2013 · `valideSaisie` 2022 · `effaceItineraire` 2032 · `relance` 2052
`phraseLiaison` 2103 · `montreResultat` 2117 · `bandeauVisee` 2248 · `armeVisee` 2260
`finVisee` 2268 · `viseItineraire` 2280 · `visePoi` 2286 · `visePoint` 2292
`ouvreItineraire` 2313 · `fermeItineraire` 2330 · `versItineraire` 2340
`versItineraireDe` 2343

### `_journee.html` — 895 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 237 · `calculeJournee` 333 · `rangJournee` 521 · `lienJournee` 533
`arretJournee` 540 · `remplitJournee` 565 · `appliqueVueParcours` 703 · `traceJournee` 729
`montreJournee` 737 · `perimeJournee` 750 · `ouvreOrganisation` 759 · `lanceJournee` 860

### `_js.html` — 2590 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.229 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.333 · 3. Rendu du pavillon courant
- l.400 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.520 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1316 · 6. Vue
- l.1415 · 7. Sélection et fiche
- l.2235 · 8. Interactions du plan
- l.2436 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `indexe` 55 · `largeur` 234 · `decoupe` 253 · `habille` 266
`lignesSvg` 277 · `coexComptes` 294 · `coexChoisit` 295 · `ligneCode` 311
`monteHabillage` 339 · `montePlan` 356 · `onglets` 385 · `changePlan` 392 · `ancre` 408
`place` 409 · `libelles` 411 · `decaleLibelle` 476 · `facteurLibelle` 477
`libelleForce` 478 · `libelleZone` 481 · `libelleEmplacement` 500 · `indexeSecteurs` 541
`secteursMontres` 554 · `couleurConf` 558 · `hslHex` 562 · `couleurSecteur` 580
`BANDES` 599 · `majFondus` 607 · `pastilleSecteur` 645 · `coloreSecteurs` 658
`appliqueSecteurs` 701 · `filtreTheme` 718 · `themeFiltrable` 794 · `clesCriteres` 810
`libelleCritere` 817 · `separeValeurs` 825 · `valeursCritere` 842 · `texteCriteres` 855
`indexeCriteres` 868 · `dansCriteres` 895 · `critereActif` 903 · `basculeCritere` 905
`videCriteres` 913 · `nCriteres` 920 · `majCriteres` 929 · `ouvreCriteres` 987
`filtre` 1100 · `critParSociete` 1104 · `visible` 1112 · `releveHotes` 1123
`visibleSurPlan` 1131 · `visibleSociete` 1141 · `appliqueFiltre` 1147 · `rangSorte` 1166
`codeCase` 1187 · `caseNumero` 1204 · `sousLigne` 1224 · `liste` 1234 · `appliqueVue` 1319
`rafraichitVue` 1340 · `poseVue` 1352 · `masque` 1370 · `fit` 1390 · `zoom` 1402
`echelle` 1407 · `ETROIT` 1421 · `anime` 1423 · `noeud` 1447 · `canalPlan` 1457
`rangSociete` 1465 · `select` 1474 · `centre` 1495 · `centrePoint` 1499 · `montre` 1514
`libelleCorps` 1547 · `ordreCorps` 1559 · `momentLocal` 1596 · `programme` 1619
`jourLong` 1652 · `ficheConf` 1663 · `lien` 1757 · `adresseSure` 1772 · `assainitRiche` 1805
`enBlocs` 1845 · `rangeRiche` 1858 · `ecarteClicFantome` 1886 · `nomSociete` 1895
`societes` 1908 · `choisitExposant` 1919 · `poseCode` 1965 · `ouvre` 1984 · `ferme` 2209
`onglet` 2225 · `milieu` 2255 · `commencePince` 2261 · `suitPince` 2275
`mesureTiroir` 2447 · `montreTiroir` 2450

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

### `_pile.html` — 372 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.259 · Repères

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`nature` 69 · `boutonAjout` 76 · `intertitre` 84 · `construitPanneau` 91
`sectionSelection` 275 · `ligneCouleur` 314 · `rangSecteur` 334 · `rangSous` 346
`defautCouleur` 368

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

### `supabase/functions/_partage/champs.ts` — 406 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/eventmaker.ts` — 729 l.

`grapheJson` 144 · `enParallele` 597 · `texteSeul` 617 · `champs` 694

### `supabase/functions/_partage/gaia.ts` — 224 l.

`aplatit` 195

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `distSegment` 55 · `distBord` 64 · `poleInterieur` 83 · `portee` 104

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106

### `supabase/functions/_partage/version.ts` — 77 l.

`condense` 73

### `supabase/functions/mesure/index.ts` — 125 l.

`cors` 38 · `jeton` 52 · `client` 55

### `supabase/functions/plan-public/index.ts` — 507 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 162 · `ampute` 185 · `masquesDe` 225
`masquesDuPlan` 245

### `supabase/functions/sync-evenement/index.ts` — 1095 l.

`cors` 41 · `client` 79 · `gaia` 86 · `libellesChoix` 97 · `fournisseur` 122 · `range` 158
`champsKlipso` 179 · `hebergee` 1053 · `nettoieUrl` 1071 · `groupeTextes` 1081

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
