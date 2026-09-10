<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 1142 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.784 · 10. Mode administration
- l.850 · Renommer une zone organisateur
- l.902 · Masquer une zone organisateur
- l.970 · Placer un libellé à la main

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 123 · `appliqueApparence` 129 · `appliqueCommandes` 189 · `minutesVisite` 217
`salonPartage` 224 · `trio` 237 · `melange` 247 · `themeSombre` 255 · `appliqueAccent` 269
`modeleFiche` 317 · `appliqueFiche` 324 · `texteCorps` 381 · `standApercu` 396
`contenuApercu` 414 · `apercuFiche` 437 · `ouvreReglages` 499 · `voletPlan` 530
`nomDuTon` 637 · `voletApparence` 641 · `enregistreConf` 734 · `rgbHex` 740 · `hexa` 747
`luminance` 751 · `ecarte` 765 · `joli` 780 · `retireAdmin` 797 · `activeAdmin` 810
`renommeZone` 860 · `enregistreNomZone` 884 · `basculeAffichageZone` 913
`marqueZonesMasquees` 930 · `ecritTableZones` 945 · `cleLibelle` 991
`empreinteLibelle` 1007 · `placementLibelle` 1015 · `posePlacement` 1025
`libelleAutomatique` 1042 · `modePlacementLibelles` 1051 · `majPaletteLibelle` 1063
`choisitLibelle` 1080 · `pousseLibelle` 1087 · `libellePointerDown` 1095
`libellePointerMove` 1110 · `libellePointerUp` 1119

Éléments :

`#pousseConf` · `#razConf`

### `_admin2.html` — 141 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 24 · `entetesApi` 39 · `chargeFond` 62 · `charge` 94

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

### `_dessin.html` — 1272 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 30 · `mesCalques` 38 · `enregistreDessins` 39
`instantane` 66 · `memorise` 67 · `restaure` 72 · `annule` 81 · `refais` 93
`trouveCalque` 95 · `nouvelId` 96 · `cheminArrondi` 114 · `estCadre` 157 · `cheminForme` 159
`dessineDessins` 171 · `versPlan` 213 · `apercu` 219 · `apercuGuide` 231
`toleranceTrace` 255 · `aimanteContour` 260 · `rayonContour` 263 · `redresseTrace` 282
`traceGuide` 316 · `fermeIci` 323 · `ajouteForme` 328 · `pictoDe` 424 · `nomTypeRepere` 462
`pictoForme` 473 · `traceRepere` 490 · `etiquetteSociete` 558 · `nomSurLePlan` 562
`societeDeForme` 573 · `societesDuPlan` 584 · `remplitListeSocietes` 595
`societeSaisie` 603 · `traceStandDessine` 619 · `texteStandDessine` 643
`poseLibellesDessines` 661 · `marqueStandsDessines` 678 · `rafraichitStandsDessines` 693
`cartouchePoi` 713 · `ouvrePoi` 774 · `mesureCartouche` 837 · `eclairePoi` 844
`signale` 855 · `calquePourImage` 869 · `poseImage` 882 · `importeImage` 895
`dessinPointerDown` 943 · `dessinPointerMove` 1013 · `dessinPointerUp` 1038
`termineTrace` 1061 · `aide` 1070 · `choisitOutil` 1090 · `enchaineStand` 1111
`activeCalque` 1157 · `montreRoleIti` 1199 · `creeCalque` 1230 · `demandeNom` 1243
`renommeCalque` 1262

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 468 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 168 · `ecritDesDeuxCotes` 190
`changeLien` 202 · `changeDureeLien` 218 · `majLiens` 235 · `etiquetteStand` 279
`remplitListeStands` 284 · `standSaisi` 293 · `appliqueLiaison` 303 · `appliqueSociete` 321
`appliqueTexte` 337 · `appliqueRayon` 347 · `appliquePicto` 357 · `supprimeForme` 375
`editionPointerDown` 385 · `editionPointerMove` 430 · `editionPointerUp` 461

### `_head.html` — 1932 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#side`
`#poignee` · `#q` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#countTxt` · `#list`
`#stage` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#zIn` · `#zOut`
`#zFit` · `#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#contourReg` · `#contourRayon` · `#contourAimant` · `#texteADessiner`
`#repereType` · `#repereTexte` · `#standSoc` · `#listeSoc` · `#fichierImage`
`#choisirImage` · `#vignette` · `#elemSel` · `#elemType` · `#elemSupprimer` · `#elemPicto`
`#elemTexte` · `#elemLiens` · `#elemLiensListe` · `#elemLienAjout` · `#elemLienAide`
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

### `_itineraire.html` — 2127 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 86 · `enveloppe` 95 · `oublieGrilles` 138 · `calquesDe` 141 · `reperesDe` 146
`cleRoleIti` 196 · `roleIti` 197 · `nomRoleIti` 198 · `formesRole` 214 · `obstaclesPmr` 239
`grille` 266 · `distanceAuMur` 327 · `nappePrincipale` 369 · `caseDe` 402 · `centreCase` 407
`empriseDe` 429 · `accrocheDepuis` 461 · `versLeMilieu` 516 · `accroche` 543 · `Tas` 558
`travail` 602 · `cherche` 620 · `distancesDepuis` 686 · `distancesMulti` 700 · `reduit` 735
`longueur` 746 · `longueurDehors` 762 · `nettoie` 792 · `oublieFaces` 815
`facesLibres` 817 · `amorce` 891 · `faceDeSortie` 918 · `accesDe` 948 · `couplesAcces` 983
`troncon` 1003 · `pointObjet` 1035 · `pointRepere` 1042 · `candidats` 1051
`pointSaisi` 1077 · `portesDe` 1094 · `versPorte` 1099 · `typeLiaison` 1154
`nomRepere` 1160 · `oublieLiaisons` 1178 · `lienEcrits` 1190 · `ecritLiens` 1199
`annuaireLiaisons` 1204 · `liensDe` 1236 · `coutLiaison` 1256 · `passagePraticable` 1263
`passagesDe` 1271 · `sortiesDe` 1281 · `plansRelies` 1289 · `balayage` 1313
`distanceDepuis` 1327 · `cheminLiaisons` 1354 · `routeParLiaisons` 1438 · `routeEntre` 1474
`calculeRoute` 1513 · `couleurNappe` 1539 · `rafraichitApercu` 1545 · `marchesIci` 1586
`rayonBout` 1591 · `dessineItineraire` 1596 · `rafraichitBouts` 1640
`cadreItineraire` 1655 · `champIti` 1678 · `ecritDistance` 1682 · `ecritDuree` 1690
`fermeSugg` 1695 · `montreSugg` 1702 · `choisitPoint` 1734 · `valideSaisie` 1743
`effaceItineraire` 1753 · `relance` 1773 · `phraseLiaison` 1816 · `montreResultat` 1830
`bandeauVisee` 1961 · `armeVisee` 1973 · `finVisee` 1981 · `viseItineraire` 1993
`visePoi` 1999 · `visePoint` 2005 · `ouvreItineraire` 2026 · `fermeItineraire` 2043
`versItineraire` 2053 · `versItineraireDe` 2056

### `_journee.html` — 893 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 237 · `calculeJournee` 333 · `rangJournee` 521 · `lienJournee` 533
`arretJournee` 540 · `remplitJournee` 565 · `appliqueVueParcours` 703 · `traceJournee` 729
`montreJournee` 737 · `perimeJournee` 750 · `ouvreOrganisation` 759 · `lanceJournee` 860

### `_js.html` — 2238 l. → plan-admin.html, plan-smcl.html, plan.html

- l.48 · 1. Index global — la recherche porte sur tous les pavillons
- l.189 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.293 · 3. Rendu du pavillon courant
- l.360 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.473 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1151 · 6. Vue
- l.1250 · 7. Sélection et fiche
- l.1895 · 8. Interactions du plan
- l.2084 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 45 · `indexe` 51 · `largeur` 194 · `decoupe` 213 · `habille` 226
`lignesSvg` 237 · `coexComptes` 254 · `coexChoisit` 255 · `ligneCode` 271
`monteHabillage` 299 · `montePlan` 316 · `onglets` 345 · `changePlan` 352 · `ancre` 368
`place` 369 · `libelles` 371 · `decaleLibelle` 429 · `facteurLibelle` 430
`libelleForce` 431 · `libelleZone` 434 · `libelleEmplacement` 453 · `indexeSecteurs` 494
`secteursMontres` 507 · `couleurConf` 511 · `hslHex` 515 · `couleurSecteur` 533
`BANDES` 552 · `majFondus` 560 · `pastilleSecteur` 598 · `coloreSecteurs` 611
`appliqueSecteurs` 648 · `filtreTheme` 665 · `themeFiltrable` 741 · `clesCriteres` 757
`libelleCritere` 764 · `separeValeurs` 772 · `valeursCritere` 789 · `texteCriteres` 802
`indexeCriteres` 815 · `dansCriteres` 842 · `critereActif` 850 · `basculeCritere` 852
`videCriteres` 860 · `nCriteres` 867 · `majCriteres` 876 · `ouvreCriteres` 934
`filtre` 1047 · `critParSociete` 1051 · `visible` 1054 · `releveHotes` 1066
`visibleSurPlan` 1074 · `visibleSociete` 1084 · `appliqueFiltre` 1090 · `liste` 1103
`appliqueVue` 1154 · `rafraichitVue` 1175 · `poseVue` 1187 · `masque` 1205 · `fit` 1225
`zoom` 1237 · `echelle` 1242 · `ETROIT` 1256 · `anime` 1258 · `noeud` 1278
`canalPlan` 1286 · `rangSociete` 1294 · `select` 1303 · `centre` 1324 · `centrePoint` 1328
`montre` 1343 · `libelleCorps` 1372 · `ordreCorps` 1384 · `momentLocal` 1421
`programme` 1444 · `jourLong` 1477 · `ficheConf` 1488 · `lien` 1582
`ecarteClicFantome` 1599 · `nomSociete` 1608 · `societes` 1621 · `choisitExposant` 1632
`ouvre` 1668 · `ferme` 1874 · `onglet` 1885 · `milieu` 1915 · `commencePince` 1921
`suitPince` 1935 · `mesureTiroir` 2095 · `montreTiroir` 2098

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

### `supabase/functions/plan-public/index.ts` — 331 l.

`cors` 48 · `db` 65 · `masquesDe` 84 · `masquesDuPlan` 93

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
