<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 1162 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.804 · 10. Mode administration
- l.870 · Renommer une zone organisateur
- l.922 · Masquer une zone organisateur
- l.990 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 123 · `appliqueApparence` 129 · `appliqueCommandes` 189 · `minutesVisite` 217
`salonPartage` 224 · `trio` 237 · `melange` 247 · `themeSombre` 255 · `appliqueAccent` 269
`modeleFiche` 317 · `appliqueFiche` 324 · `texteCorps` 381 · `standApercu` 396
`contenuApercu` 414 · `apercuFiche` 437 · `ouvreReglages` 499 · `voletPlan` 530
`nomDuTon` 657 · `voletApparence` 661 · `enregistreConf` 754 · `rgbHex` 760 · `hexa` 767
`luminance` 771 · `ecarte` 785 · `joli` 800 · `retireAdmin` 817 · `activeAdmin` 830
`renommeZone` 880 · `enregistreNomZone` 904 · `basculeAffichageZone` 933
`marqueZonesMasquees` 950 · `ecritTableZones` 965 · `cleLibelle` 1011
`empreinteLibelle` 1027 · `placementLibelle` 1035 · `posePlacement` 1045
`libelleAutomatique` 1062 · `modePlacementLibelles` 1071 · `majPaletteLibelle` 1083
`choisitLibelle` 1100 · `pousseLibelle` 1107 · `libellePointerDown` 1115
`libellePointerMove` 1130 · `libellePointerUp` 1139

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

### `_console-head.html` — 55 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienRapport` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet` · `#btnExport` · `#btnTheme`
`#fiche`

### `_console-js.html` — 2700 l. → admin-plans.html

- l.372 · Provenance des données
- l.499 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 17 · `barreAvancement` 56 · `fonction` 79 · `slugifie` 95 · `courant` 99
`charge` 101 · `chargePlans` 116 · `majEvenement` 121 · `selonAdresse` 141
`majAdresse` 149 · `majBarre` 164 · `dessineChoix` 206 · `champ` 226 · `dessineFiche` 251
`fournisseurUtilise` 434 · `source` 438 · `champCle` 443 · `ligneSource` 478
`origineConferences` 587 · `resumeProvenance` 652 · `resumeSalles` 669 · `resumeFiche` 680
`caseFiche` 723 · `champsPersos` 766 · `criteres` 772 · `ecritFiche` 775 · `caseCritere` 790
`clePerso` 809 · `ajouteChampPerso` 817 · `renommeChampPerso` 828 · `retireChampPerso` 846
`lignesPerso` 894 · `clesCorps` 929 · `ordreEffectif` 943 · `libelleCorps` 958
`champsLus` 1000 · `exempleCible` 1015 · `valeurApercu` 1037 · `dessineApercu` 1065
`panneauOrdre` 1138 · `ligneOutil` 1320 · `ligneReglage` 1336 · `ouvreProvenance` 1348
`ouvreSources` 1371 · `ouvreSalles` 1427 · `cadreFiche` 1542 · `ouvreFiche` 1571
`sousTitre` 1721 · `tableauChamps` 1736 · `encode` 1879 · `decode` 1881
`correspondance` 1886 · `sansPrefixe` 1889 · `courte` 1890 · `intitule` 1905
`intituleSuite` 1917 · `separeValeurs` 1931 · `champOrigine` 1943 · `majLiens` 2172
`majIntegration` 2199 · `majMsgSync` 2206 · `synchronise` 2221 · `dupliquer` 2264
`litMonProfil` 2358 · `RETOUR_MDP` 2369 · `litComptes` 2371 · `ligneMessage` 2380
`casesSalons` 2390 · `ouvreComptes` 2420 · `ouvreFicheCompte` 2512 · `videEcran` 2671
`dessine` 2676 · `demarre` 2688

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 577 l. → console.css

- l.523 · Page de rapport

### `_dessin.html` — 1340 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 30 · `mesCalques` 38 · `enregistreDessins` 39
`instantane` 68 · `memorise` 69 · `restaure` 74 · `annule` 83 · `refais` 95
`trouveCalque` 97 · `nouvelId` 98 · `cheminArrondi` 116 · `estCadre` 159 · `cheminForme` 161
`dessineDessins` 173 · `versPlan` 215 · `apercu` 221 · `apercuGuide` 233
`toleranceTrace` 257 · `aimanteContour` 262 · `rayonContour` 265 · `redresseTrace` 284
`traceGuide` 318 · `fermeIci` 325 · `ajouteForme` 330 · `pictoDe` 426 · `nomTypeRepere` 464
`pictoForme` 475 · `traceRepere` 492 · `etiquetteSociete` 560 · `nomSurLePlan` 564
`societeDeForme` 575 · `societesDuPlan` 586 · `remplitListeSocietes` 597
`societeSaisie` 605 · `traceStandDessine` 621 · `texteStandDessine` 645
`poseLibellesDessines` 663 · `decoupeStand` 684 · `marqueStandsDessines` 696
`rafraichitStandsDessines` 711 · `cartouchePoi` 731 · `ouvrePoi` 792 · `mesureCartouche` 855
`eclairePoi` 862 · `signale` 873 · `calquePourImage` 887 · `poseImage` 900
`importeImage` 913 · `dessinPointerDown` 964 · `dessinPointerMove` 1038
`dessinPointerUp` 1076 · `termineTrace` 1112 · `aide` 1122 · `choisitOutil` 1147
`enchaineStand` 1170 · `activeCalque` 1224 · `montreRoleIti` 1267 · `creeCalque` 1298
`demandeNom` 1311 · `renommeCalque` 1330

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

### `_head.html` — 1999 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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

### `_itineraire.html` — 2406 l. → plan-admin.html, plan-smcl.html, plan.html

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
`phraseLiaison` 2095 · `montreResultat` 2109 · `bandeauVisee` 2240 · `armeVisee` 2252
`finVisee` 2260 · `viseItineraire` 2272 · `visePoi` 2278 · `visePoint` 2284
`ouvreItineraire` 2305 · `fermeItineraire` 2322 · `versItineraire` 2332
`versItineraireDe` 2335

### `_journee.html` — 893 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 237 · `calculeJournee` 333 · `rangJournee` 521 · `lienJournee` 533
`arretJournee` 540 · `remplitJournee` 565 · `appliqueVueParcours` 703 · `traceJournee` 729
`montreJournee` 737 · `perimeJournee` 750 · `ouvreOrganisation` 759 · `lanceJournee` 860

### `_js.html` — 2376 l. → plan-admin.html, plan-smcl.html, plan.html

- l.52 · 1. Index global — la recherche porte sur tous les pavillons
- l.229 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.333 · 3. Rendu du pavillon courant
- l.400 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.518 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1266 · 6. Vue
- l.1365 · 7. Sélection et fiche
- l.2021 · 8. Interactions du plan
- l.2222 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 49 · `indexe` 55 · `largeur` 234 · `decoupe` 253 · `habille` 266
`lignesSvg` 277 · `coexComptes` 294 · `coexChoisit` 295 · `ligneCode` 311
`monteHabillage` 339 · `montePlan` 356 · `onglets` 385 · `changePlan` 392 · `ancre` 408
`place` 409 · `libelles` 411 · `decaleLibelle` 474 · `facteurLibelle` 475
`libelleForce` 476 · `libelleZone` 479 · `libelleEmplacement` 498 · `indexeSecteurs` 539
`secteursMontres` 552 · `couleurConf` 556 · `hslHex` 560 · `couleurSecteur` 578
`BANDES` 597 · `majFondus` 605 · `pastilleSecteur` 643 · `coloreSecteurs` 656
`appliqueSecteurs` 693 · `filtreTheme` 710 · `themeFiltrable` 786 · `clesCriteres` 802
`libelleCritere` 809 · `separeValeurs` 817 · `valeursCritere` 834 · `texteCriteres` 847
`indexeCriteres` 860 · `dansCriteres` 887 · `critereActif` 895 · `basculeCritere` 897
`videCriteres` 905 · `nCriteres` 912 · `majCriteres` 921 · `ouvreCriteres` 979
`filtre` 1092 · `critParSociete` 1096 · `visible` 1104 · `releveHotes` 1115
`visibleSurPlan` 1123 · `visibleSociete` 1133 · `appliqueFiltre` 1139 · `rangSorte` 1158
`sousLigne` 1178 · `liste` 1188 · `appliqueVue` 1269 · `rafraichitVue` 1290 · `poseVue` 1302
`masque` 1320 · `fit` 1340 · `zoom` 1352 · `echelle` 1357 · `ETROIT` 1371 · `anime` 1373
`noeud` 1397 · `canalPlan` 1407 · `rangSociete` 1415 · `select` 1424 · `centre` 1445
`centrePoint` 1449 · `montre` 1464 · `libelleCorps` 1493 · `ordreCorps` 1505
`momentLocal` 1542 · `programme` 1565 · `jourLong` 1598 · `ficheConf` 1609 · `lien` 1703
`ecarteClicFantome` 1720 · `nomSociete` 1729 · `societes` 1742 · `choisitExposant` 1753
`ouvre` 1789 · `ferme` 1995 · `onglet` 2011 · `milieu` 2041 · `commencePince` 2047
`suitPince` 2061 · `mesureTiroir` 2233 · `montreTiroir` 2236

Éléments :

`#data` · `#dGo` · `#dItin`

### `_mesure.html` — 140 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 13. Mesure d'utilisation

Fonctions :

`jetonMesure` 25 · `jetonRetenu` 46 · `envoieMesures` 79 · `mesure` 111

### `_modales.html` — 145 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`ouvreModale` 13 · `fermeModale` 29 · `confirme` 36 · `deplaceVers` 54 · `versExtremite` 66
`remplitOrdre` 74 · `ouvreOrdre` 136

### `_motdepasse.html` — 242 l. → motdepasse.html

- l.54 · Poser un mot de passe

Fonctions :

`$` 70 · `CFG` 72 · `dit` 80 · `fragment` 86 · `garde` 93 · `lit` 97 · `demandeLien` 170
`ouvreSaisie` 179

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 352 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 50 · `signetParcours` 68 · `boutonParcours` 74
`rafraichitMarque` 79 · `brancheParcours` 91 · `calqueMarques` 123 · `dessineMarques` 139
`marqueParcours` 169 · `rafraichitParcours` 183 · `instantConf` 207 · `cleTemps` 211
`jourCourt` 217 · `rangParcours` 221 · `groupeParcours` 237 · `remplitParcours` 246
`ouvreParcours` 308 · `fermeParcours` 320

### `_pile.html` — 312 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.196 · Repères

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`construitPanneau` 60 · `sectionSelection` 210 · `ligneCouleur` 235 · `rangSecteur` 255
`rangSous` 267 · `rangPlacement` 297 · `defautCouleur` 308

### `_pousse.html` — 145 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pousser la configuration

Fonctions :

`majAttente` 25 · `accesBase` 36 · `base` 45 · `reglagesSeuls` 63 · `pousseConfiguration` 67

### `_rapport-head.html` — 29 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnRecharger` · `#btnTheme`
`#rapport`

### `_rapport-js.html` — 314 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`nb` 45 · `courant` 46 · `chargeEvenements` 51 · `debutPeriode` 61 · `chargeRapport` 69
`chiffre` 80 · `barres` 99 · `jours` 126 · `dessineRapport` 147 · `dessineBarre` 245
`rafraichit` 267 · `videEcran` 286 · `demarre` 300

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

### `supabase/functions/mesure/index.ts` — 120 l.

`cors` 38 · `jeton` 52 · `client` 55

### `supabase/functions/plan-public/index.ts` — 466 l.

`cors` 49 · `db` 83 · `salon` 96 · `retraits` 160 · `ampute` 183 · `masquesDe` 212
`masquesDuPlan` 221

### `supabase/functions/sync-evenement/index.ts` — 1102 l.

`cors` 35 · `client` 73 · `gaia` 80 · `libellesChoix` 91 · `fournisseur` 116 · `range` 152
`champsKlipso` 173 · `hebergee` 1060 · `nettoieUrl` 1078 · `groupeTextes` 1088

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
