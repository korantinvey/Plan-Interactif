<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 3027 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.2057 · 10. Mode administration
- l.2144 · La fiche d'une zone organisateur
- l.2774 · Masquer une zone organisateur
- l.2857 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 134 · `appliqueApparence` 140 · `appliqueCommandes` 201 · `chercheSorte` 271
`voletRecherche` 274 · `minutesVisite` 328 · `salonPartage` 335 · `trio` 348 · `melange` 358
`themeSombre` 366 · `appliqueAccent` 380 · `appliqueFond` 411 · `modeleRetenu` 449
`posePoliceLibelles` 499 · `appliqueModele` 527 · `habilleModale` 568 · `texteCorps` 639
`standApercu` 654 · `lignesApercu` 678 · `contenuApercu` 704 · `apercuFiche` 741
`apercuListe` 818 · `apercuDuo` 840 · `glisseFenetre` 873 · `ouvreReglages` 884
`voletZones` 983 · `champsFicheZone` 1084 · `ficheZoneEnPlace` 1154 · `voletPlan` 1172
`sallesSituees` 1286 · `voletPmr` 1302 · `nomDuTon` 1393 · `voletApparence` 1398
`clesFiche` 1511 · `voletOrdre` 1527 · `enregistreConf` 2006 · `rgbHex` 2013 · `hexa` 2020
`luminance` 2024 · `ecarte` 2038 · `joli` 2053 · `retireAdmin` 2070 · `activeAdmin` 2083
`champZone` 2170 · `champsZone` 2195 · `champSalles` 2251 · `nomDeZone` 2303
`reduitLogo` 2337 · `champLogo` 2378 · `editeurRiche` 2475 · `memeFicheZone` 2632
`suitFicheZone` 2637 · `verseFicheZone` 2645 · `ficheZone` 2671 · `enregistreZone` 2696
`basculeAffichageZone` 2785 · `marqueZonesMasquees` 2802 · `ecritColonnesEvenement` 2822
`ecritColonneEvenement` 2853 · `cleLibelle` 2878 · `empreinteLibelle` 2894
`placementLibelle` 2902 · `posePlacement` 2912 · `libelleAutomatique` 2929
`modePlacementLibelles` 2938 · `majPaletteLibelle` 2955 · `choisitLibelle` 2972
`pousseLibelle` 2979 · `libellePointerDown` 2987 · `libellePointerMove` 3002
`libellePointerUp` 3011

Éléments :

`#pousseConf` · `#sauveConf` · `#restaureConf` · `#fichierConf`

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

### `_console-js.html` — 2742 l. → admin-plans.html

- l.829 · Provenance des données
- l.956 · Contenu de la fiche détail

Fonctions :

`refus` 18 · `fluxFonction` 37 · `fenetreAvancement` 119 · `fonction` 394 · `slugifie` 408
`courant` 412 · `charge` 414 · `chargePlans` 429 · `majEvenement` 434 · `selonAdresse` 454
`majAdresse` 462 · `majBarre` 477 · `dessineChoix` 519 · `champ` 539 · `reduitIcone` 593
`champFavicon` 634 · `dessineFiche` 711 · `fournisseurUtilise` 891 · `source` 895
`champCle` 900 · `ligneSource` 935 · `paraitSurFiche` 1065 · `origineConferences` 1071
`resumeProvenance` 1136 · `resumeFiche` 1153 · `caseFiche` 1198 · `champsPersos` 1240
`criteres` 1246 · `ecritFiche` 1249 · `caseCritere` 1264 · `clePerso` 1283
`ajouteChampPerso` 1291 · `renommeChampPerso` 1302 · `retireChampPerso` 1320
`lignesPerso` 1368 · `ligneOutil` 1388 · `ligneReglage` 1404 · `ouvreProvenance` 1416
`ouvreSources` 1439 · `cadreFiche` 1491 · `ouvreFiche` 1521 · `sousTitre` 1631
`tableauChamps` 1646 · `encode` 1789 · `decode` 1791 · `correspondance` 1796
`sansPrefixe` 1799 · `courte` 1800 · `intitule` 1815 · `intituleSuite` 1827
`separeValeurs` 1841 · `aplani` 1862 · `memeStyle` 1872 · `autreFace` 1890
`champOrigine` 1906 · `majLiens` 2173 · `majIntegration` 2200 · `majMsgSync` 2207
`etapesPressenties` 2237 · `synchronise` 2251 · `dupliquer` 2302 · `litMonProfil` 2400
`RETOUR_MDP` 2411 · `litComptes` 2413 · `ligneMessage` 2422 · `casesSalons` 2432
`ouvreComptes` 2462 · `ouvreFicheCompte` 2554 · `videEcran` 2713 · `dessine` 2718
`demarre` 2730

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 620 l. → console.css

- l.566 · Page de rapport

### `_dessin.html` — 1718 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `notePubliees` 48 · `dejaPubliee` 54 · `marqueAttente` 60 · `mesCalques` 68
`enregistreDessins` 69 · `instantane` 103 · `memorise` 104 · `restaure` 109 · `annule` 118
`refais` 130 · `trouveCalque` 132 · `nouvelId` 133 · `cheminArrondi` 151 · `estCadre` 194
`cheminForme` 196 · `styleTrait` 216 · `poseTrait` 229 · `dessineDessins` 236
`versPlan` 278 · `apercu` 284 · `apercuGuide` 296 · `toleranceTrace` 320
`aimanteContour` 325 · `rayonContour` 328 · `redresseTrace` 347 · `traceGuide` 381
`fermeIci` 388 · `ajouteForme` 393 · `pictoDe` 493 · `nomTypeRepere` 538 · `typeZone` 564
`pictoForme` 571 · `estPorte` 591 · `ouvreEntrant` 592 · `ouvreSortant` 593
`traceRepere` 607 · `etiquetteSociete` 675 · `nomSurLePlan` 679 · `societeDeForme` 690
`societesDuPlan` 701 · `remplitListeSocietes` 712 · `societeSaisie` 720
`traceStandDessine` 736 · `texteStandDessine` 760 · `poseLibellesDessines` 778
`decoupeStand` 799 · `marqueStandsDessines` 811 · `rafraichitStandsDessines` 826
`oublieReperes` 856 · `reperesCherchables` 858 · `vaAuRepere` 902 · `clePoi` 937
`cartouchePoi` 939 · `ouvrePoi` 1043 · `mesureCartouche` 1115 · `phareRepere` 1124
`phareZone` 1126 · `eclairePoi` 1132 · `oublieChoixPoi` 1164 · `signale` 1173
`calquePourImage` 1187 · `poseImage` 1204 · `importeImage` 1217 · `dessinPointerDown` 1268
`dessinPointerMove` 1342 · `dessinPointerUp` 1380 · `termineTrace` 1416 · `aide` 1428
`choisitOutil` 1453 · `enchaineStand` 1477 · `activeCalque` 1535 · `cleVerrou` 1591
`verrouille` 1592 · `basculeVerrou` 1594 · `pictoVerrou` 1611 · `montreRoleIti` 1645
`creeCalque` 1676 · `demandeNom` 1689 · `renommeCalque` 1708

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 519 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 183 · `ecritDesDeuxCotes` 205
`changeLien` 217 · `changeDureeLien` 233 · `majLiens` 250 · `etiquetteStand` 294
`remplitListeStands` 299 · `standSaisi` 308 · `appliqueLiaison` 318 · `appliqueSociete` 336
`appliqueTexte` 352 · `appliqueRayon` 362 · `appliqueTrait` 372 · `appliquePicto` 387
`supprimeForme` 402 · `editionPointerDown` 412 · `editionPointerMove` 457
`editionPointerUp` 509

### `_export.html` — 153 l. → admin-plans.html, rapport.html

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 22 · `colonnesExport` 66 · `libellePeriode` 83 · `nomFichierExport` 89
`nomFeuilleExport` 99 · `exporteExposants` 115

### `_head.html` — 3576 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#texteADessiner`
`#repereType` · `#repereTexte` · `#standSoc` · `#listeSoc` · `#fichierImage`
`#choisirImage` · `#vignette` · `#elemSel` · `#elemType` · `#elemSupprimer` · `#elemPicto`
`#elemTexte` · `#elemLiens` · `#elemLiensListe` · `#elemLienAjout` · `#elemLienAide`
`#elemDim` · `#elemLargeur` · `#elemHauteur` · `#elemTailleBloc` · `#elemTaille`
`#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur` · `#elemStyle`
`#elemStand` · `#listeStands` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg`
`#libNom` · `#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#modale` · `#mTitre`
`#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail` · `#dMarque`
`#closeDetail` · `#dKind` · `#dNeuf` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode`
`#dVis` · `#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody`
`#parcours` · `#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps`
`#jCorps` · `#pPied` · `#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire` · `#jRetour`
`#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA` · `#iSugg`
`#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 2766 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 86 · `enveloppe` 95 · `oublieGrilles` 138 · `calquesDe` 143 · `reperesDe` 148
`cleRoleIti` 215 · `roleIti` 216 · `nomRoleIti` 217 · `estCirculation` 220
`formesRole` 245 · `anglePlan` 277 · `dansGrille` 316 · `horsGrille` 317 · `grille` 327
`distanceAuMur` 451 · `nappePrincipale` 493 · `celluleDe` 528 · `caseDe` 532
`centreCase` 537 · `empriseDe` 580 · `accrocheDepuis` 612 · `versLeMilieu` 668
`accroche` 699 · `Tas` 714 · `travail` 758 · `cherche` 781 · `distancesDepuis` 847
`distancesMulti` 861 · `regleFoule` 933 · `ecarteFoule` 950 · `heureAuSalon` 954
`sallesEnMouvement` 963 · `foule` 1006 · `bilanFoule` 1094 · `reduit` 1123
`guidageAllees` 1159 · `recentre` 1188 · `passable` 1236 · `lisse` 1269 · `longueur` 1294
`longueurDehors` 1310 · `nettoie` 1352 · `oublieFaces` 1387 · `facesLibres` 1389
`amorce` 1462 · `faceDeSortie` 1497 · `accesDe` 1527 · `couplesAcces` 1562 · `troncon` 1582
`pointObjet` 1623 · `pointRepere` 1630 · `candidats` 1639 · `pointSaisi` 1665
`portesDe` 1683 · `versPorte` 1690 · `typeLiaison` 1751 · `nomRepere` 1757
`oublieLiaisons` 1775 · `lienEcrits` 1787 · `ecritLiens` 1796 · `annuaireLiaisons` 1801
`liensDe` 1833 · `coutLiaison` 1853 · `passagePraticable` 1860 · `passagesDe` 1868
`sortiesDe` 1878 · `plansRelies` 1886 · `balayage` 1910 · `distanceDepuis` 1924
`cheminLiaisons` 1951 · `routeParLiaisons` 2035 · `routeEntre` 2071 · `calculeRoute` 2110
`couleurNappe` 2136 · `rafraichitApercu` 2142 · `marchesIci` 2185 · `rayonBout` 2190
`dessineItineraire` 2195 · `rafraichitBouts` 2239 · `cadreItineraire` 2262 · `champIti` 2286
`ecritDistance` 2290 · `ecritDuree` 2298 · `fermeSugg` 2303 · `montreSugg` 2310
`choisitPoint` 2342 · `valideSaisie` 2351 · `effaceItineraire` 2361 · `relance` 2383
`phraseLiaison` 2434 · `montreResultat` 2448 · `bandeauVisee` 2585 · `armeVisee` 2599
`finVisee` 2607 · `viseItineraire` 2619 · `visePoi` 2625 · `visePoint` 2631
`ouvreItineraire` 2652 · `fermeItineraire` 2678 · `versItineraire` 2688
`versItineraireDe` 2691

### `_journee.html` — 912 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 112 · `matriceJournee` 136
`rangeJournee` 238 · `calculeJournee` 334 · `rangJournee` 522 · `lienJournee` 534
`arretJournee` 541 · `remplitJournee` 566 · `appliqueVueParcours` 704 · `traceJournee` 730
`montreJournee` 738 · `perimeJournee` 751 · `ouvreOrganisation` 760 · `lanceJournee` 877

### `_js.html` — 3454 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.331 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.441 · 3. Rendu du pavillon courant
- l.520 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.640 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1569 · 6. Vue
- l.1839 · 7. Sélection et fiche
- l.2982 · 8. Interactions du plan
- l.3284 · Le tiroir de la liste — écrans étroits

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
`rendTextes` 1606 · `appliqueVue` 1611 · `rafraichitVue` 1632 · `poseVue` 1644
`masque` 1663 · `masqueDroite` 1695 · `fit` 1706 · `stoppeZoom` 1736 · `glisseVersVise` 1742
`glisseVers` 1784 · `rectVisee` 1806 · `zoom` 1825 · `echelle` 1831 · `ETROIT` 1845
`anime` 1847 · `noeud` 1871 · `canalPlan` 1881 · `rangSociete` 1889 · `select` 1898
`centre` 1917 · `centrePoint` 1921 · `montre` 1966 · `libelleCorps` 1998 · `ordreCorps` 2010
`groupesFiche` 2042 · `valeurCorps` 2055 · `champCorps` 2060 · `groupeCorps` 2068
`corpsRange` 2081 · `momentLocal` 2116 · `programme` 2139 · `jourLong` 2172
`ficheConf` 2183 · `lien` 2277 · `adresseWeb` 2285 · `pictoRS` 2328 · `adresseSure` 2346
`adresseImage` 2373 · `imageSure` 2386 · `assainitRiche` 2415 · `enBlocs` 2455
`rangeRiche` 2468 · `ecarteClicFantome` 2496 · `nomSociete` 2505 · `societes` 2518
`choisitExposant` 2529 · `poseMarque` 2567 · `poseCode` 2617 · `rangeMarque` 2658
`ouvre` 2704 · `ferme` 2956 · `onglet` 2972 · `milieu` 3002 · `commencePince` 3008
`suitPince` 3022 · `cibleElargie` 3100 · `mesureTiroir` 3295 · `montreTiroir` 3298

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
