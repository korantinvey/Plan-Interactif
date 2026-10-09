<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 1533 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques

Fonctions :

`salonRange` 17 · `cleConf` 19 · `ouvreConf` 23 · `reglagesDuSalon` 42 · `conf` 63
`jeton` 64 · `sousCle` 65 · `styleFond` 67 · `sousCalques` 88 · `styleDataGroupe` 110
`appliqueCouleursData` 119 · `styleData` 151 · `appliqueApparence` 157
`appliqueCommandes` 222 · `optionActive` 332 · `programmeOffert` 337
`suggestionOfferte` 338 · `appliqueOptions` 340 · `langueOfferte` 364 · `appliqueLangue` 366
`catalogueTenu` 371 · `chercheSorte` 441 · `voletRecherche` 444 · `blocOrdreCriteres` 505
`minutesVisite` 676 · `seuilGere` 740 · `seuilImpose` 741 · `seuilParSurface` 742
`regleSeuil` 747 · `aireDuStand` 765 · `seuilConcentration` 801 · `phraseSeuil` 824
`lueHeure` 869 · `lueDate` 873 · `datesSalon` 880 · `horairesSalon` 894
`presseNuanciers` 933 · `suitNuancier` 949 · `trio` 977 · `melange` 987
`appliqueAccent` 1001 · `appliqueFond` 1035 · `modeDist` 1082 · `couleurDist` 1094
`appliqueDists` 1116 · `modeBarre` 1146 · `appliqueBarre` 1148 · `modeleRetenu` 1188
`policeChoisie` 1344 · `policeDuModele` 1349 · `feuillePolice` 1359 · `chargePolice` 1381
`policePrete` 1401 · `policeDesNoms` 1419 · `posePoliceLibelles` 1448
`appliqueModele` 1480 · `habilleModale` 1524

### `_admin2.html` — 268 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 69 · `entetesApi` 92 · `chargeFond` 116 · `panneDuChargement` 163
`CLE_VERSION` 173 · `versionRetenue` 174 · `retientVersion` 177 · `demandePlan` 201
`charge` 225

### `_aimants.html` — 23 l. → plan-admin.html

- l.3 · 11 quater. Dessiner juste — le branchement

### `_application.html` — 13 l.

- l.1 · 19. L'application installée — son icône et son nom

### `_auth-plan.html` — 15 l.

- l.2 · Accès à l'administration du plan — le branchement

### `_batiments.html` — 44 l. → plan-admin.html

- l.2 · 11 quinquies. Bâtiments de la bibliothèque — le branchement

Fonctions :

`mentionOsm` 39

### `_borne.html` — 20 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — le branchement

### `_branche-mesure.html` — 10 l.

- l.1 · 13. Mesure d'utilisation — le branchement

### `_chaleur.html` — 13 l.

- l.1 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 434 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`entetes` 37 · `renouvelle` 46 · `appel` 62 · `rest` 73 · `verseModale` 103
`ouvreModale` 109 · `verrouilleModale` 132 · `fermeModale` 134 · `gardeLaPlace` 157
`demande` 162 · `confirme` 184 · `ecranConfig` 195 · `ecranConnexion` 223 · `deconnecte` 286
`signale` 297 · `bloc` 318 · `grille` 336 · `idCompte` 380 · `themeSombre` 390
`initialesDe` 410

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 78 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console-js.html` — 410 l. → admin-plans.html

Fonctions :

`fluxFonction` 26 · `charge` 100 · `selonAdresse` 127 · `majAdresse` 135 · `majBarre` 150
`dessineChoix` 192 · `majLiens` 245 · `videEcran` 378 · `dessine` 383 · `demarre` 398

### `_console.css` — 725 l. → console.css

- l.666 · Page de rapport

### `_dessin.html` — 2560 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 170 · `enregistreDessins` 172 · `instantane` 216 · `clotSalve` 227
`memorise` 228 · `restaure` 239 · `annule` 255 · `refais` 267 · `trouveCalque` 270
`nouvelId` 271 · `cheminArrondi` 289 · `estCadre` 332 · `cheminForme` 334 · `styleTrait` 354
`longueurFleche` 380 · `cheminFleche` 394 · `marqueFleche` 423 · `rafraichitFleches` 434
`poseTrait` 451 · `traceForme` 462 · `rotationTexte` 481 · `dessineDessins` 486
`redessineForme` 527 · `peintCalque` 551 · `versPlan` 557 · `apercu` 563 · `apercuGuide` 575
`toleranceTrace` 600 · `aimanteContour` 605 · `rayonContour` 608 · `redresseTrace` 627
`traceGuide` 661 · `fermeIci` 668 · `ajouteForme` 675 · `pictoDe` 803
`nomTypeRepereFr` 859 · `nomTypeRepere` 861 · `typeZone` 891 · `pictoForme` 898
`estPorte` 918 · `ouvreEntrant` 919 · `ouvreSortant` 920 · `modeDit` 960 · `lettreMode` 962
`estTransport` 966 · `modeTransport` 969 · `glypheRepere` 981 · `cleLigne` 1018
`ligneAffichee` 1029 · `couleurLigne` 1037 · `couleurRepere` 1043 · `encreRepere` 1049
`nomLigneFr` 1063 · `libelleDoffice` 1071 · `couleurEcrite` 1078 · `traceRepere` 1097
`nomSurLePlan` 1231 · `etiquetteSociete` 1242 · `seRattache` 1270 · `societeDeForme` 1282
`societesDuPlan` 1294 · `poseChampImage` 1316 · `remplitListeSocietes` 1323
`societeSaisie` 1331 · `traceImage` 1359 · `traceStandDessine` 1384
`texteStandDessine` 1408 · `poseLibellesDessines` 1426 · `decoupeStand` 1447
`marqueStandsDessines` 1462 · `rafraichitStandsDessines` 1477 · `oublieReperes` 1507
`reperesCherchables` 1509 · `vaAuRepere` 1553 · `clePoi` 1596 · `pastillePoi` 1605
`cartouchePoi` 1609 · `ouvrePoi` 1728 · `mesureCartouche` 1801 · `pharePoi` 1817
`phareRepere` 1821 · `phareZone` 1823 · `eclairePoi` 1829 · `oublieChoixPoi` 1862
`signale` 1871 · `calquePourImage` 1886 · `lienImageSaisi` 1914 · `formeImage` 1926
`poseImage` 1935 · `ditImagePosee` 1957 · `importeImage` 1965 · `dessinPointerDown` 2016
`dessinPointerMove` 2101 · `dessinPointerUp` 2139 · `termineTrace` 2180 · `aide` 2192
`outilOffert` 2222 · `choisitOutil` 2225 · `enchaineStand` 2256 · `optionsModes` 2286
`proposeCouleurLigne` 2297 · `montreTransport` 2308 · `activeCalque` 2374 · `cleVerrou` 2432
`verrouille` 2433 · `basculeVerrou` 2435 · `pictoVerrou` 2452 · `montreRoleIti` 2486
`creeCalque` 2517 · `demandeNom` 2530 · `renommeCalque` 2549

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 652 l. → plan-admin.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 28 · `poignees` 33 · `dessinePoignees` 42
`cadreTexte` 77 · `poigneeRotation` 97 · `angleBorne` 107 · `choisitForme` 109
`majElement` 120 · `candidatsLiaison` 241 · `ecritDesDeuxCotes` 263 · `changeLien` 275
`changeDureeLien` 291 · `majLiens` 308 · `appliqueSociete` 360 · `appliqueTexte` 376
`appliqueRotation` 388 · `appliqueRayon` 402 · `appliqueTrait` 415 · `appliqueTransport` 443
`appliquePicto` 466 · `supprimeForme` 492 · `editionPointerDown` 502
`editionPointerMove` 562 · `tourneTexte` 625 · `editionPointerUp` 641

### `_entete.html` — 6 l.

### `_environs.html` — 27 l. → plan-admin.html

- l.1 · 16. Les environs — le branchement

### `_export.html` — 12 l. → admin-plans.html, rapport.html

- l.1 · Export par exposant — le branchement

### `_fiche.html` — 1328 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 7. Sélection et fiche

Fonctions :

`ETROIT` 9 · `anime` 25 · `noeud` 49 · `canalPlan` 59 · `rangSociete` 67 · `select` 76
`centre` 101 · `brancheActesFiche` 112 · `centreEtBaisseLaFiche` 128 · `centrePoint` 146
`montre` 191 · `libelleCorps` 223 · `ordreCorps` 240 · `groupesFiche` 272
`montreIntitule` 285 · `valeurCorps` 305 · `champCorps` 318 · `groupeCorps` 330
`corpsRange` 343 · `programme` 358 · `produits` 407 · `ficheProduit` 435 · `ficheConf` 505
`pictoRS` 685 · `adresseVignette` 709 · `ecarteClicFantome` 727 · `nomSociete` 736
`societes` 749 · `choisitExposant` 760 · `poseMarque` 798 · `montreMarque` 858
`poseCode` 881 · `rangeMarque` 922 · `ouvre` 985 · `ferme` 1299 · `onglet` 1317

Éléments :

`#dGo` · `#dItin`

### `_geometrie.html` — 32 l. → plan-admin.html

- l.1 · 11 octies. Reprendre à la main la géométrie d'un emplacement — le

### `_gestes.html` — 954 l. → plan-admin.html, plan-smcl.html, plan.html

- l.4 · 8. Interactions du plan
- l.454 · Ce que les tiroirs lisent d'un geste
- l.500 · Le tiroir de la liste — écrans étroits
- l.726 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`milieu` 24 · `commencePince` 30 · `suitPince` 44 · `plieLesBandes` 97 · `saisitPlan` 111
`cibleElargie` 197 · `planifieFiltre` 410 · `traceurDeGeste` 478 · `cranVoisin` 497
`retraitBas` 523 · `mesureTiroir` 537 · `montreTiroir` 540 · `hisseTiroir` 544
`tiroirCrante` 753

### `_head.html` — 628 l. → plan-admin.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#logoSalon` · `#titre` · `#hallsBande`
`#halls` · `#btnLangue` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnItineraire` · `#menuCompte` · `#avatarCompte` · `#compteMail` · `#btnSortir`
`#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q` · `#videQ`
`#btnFiltres` · `#nFiltres` · `#panCrit` · `#critCorps` · `#critPied` · `#critVider`
`#critVoir` · `#actifs` · `#count` · `#countTxt` · `#list` · `#piedSide`
`#btnConfidentialite` · `#stage` · `#fondCarteGL` · `#fondTuiles` · `#fondCarte`
`#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#calqueLibelles`
`#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#creditCarte` · `#mentionOsm`
`#poi` · `#poiDefile` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#calageBat`
`#calageAngle` · `#calageQuart` · `#calageStop` · `#calageValide` · `#iciRappel`
`#iciRappelTxt` · `#iciStop` · `#bornePose` · `#bornePoser` · `#calage` · `#calageFerme`
`#calageCorps` · `#calageCarte` · `#calageEtat` · `#calageGarde` · `#outils`
`#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
`#contourAimant` · `#traitReg` · `#traitEpaisseur` · `#traitStyle` · `#traitFleche`
`#texteADessiner` · `#repereType` · `#repereTransport` · `#repereMode` · `#repereLigne`
`#repereCouleur` · `#repereTexte` · `#imageSoc` · `#standSoc` · `#listeSoc`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTransport` · `#elemMode` · `#elemLigne`
`#elemCouleur` · `#elemTexte` · `#elemLiens` · `#elemLiensListe` · `#elemLienAjout`
`#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur` · `#elemTailleBloc`
`#elemTaille` · `#elemRotationBloc` · `#elemRotation` · `#elemRotationQuart`
`#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur` · `#elemStyle`
`#elemFleche` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg` · `#libNom`
`#libFerme` · `#libTaille` · `#libAuto` · `#libAide` · `#geoReg` · `#geoNom` · `#geoFerme`
`#geoInfos` · `#geoCodeL` · `#geoCode` · `#geoSocL` · `#geoSoc` · `#geoTitreL` · `#geoTitre`
`#geoDim` · `#geoLargeur` · `#geoHauteur` · `#geoOrigine` · `#geoFiche` · `#geoSupprime`
`#geoAide` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile`
`#voile` · `#detail` · `#poigneeFiche` · `#dRubans` · `#dGoIco` · `#dItinIco` · `#dMarque`
`#closeDetail` · `#dKind` · `#dPast` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode`
`#dVis` · `#dPartage` · `#dCorne` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb`
`#dOngProd` · `#dOngNbProd` · `#dBody` · `#parcours` · `#poigneeParcours` · `#closeParcours`
`#pEyebrow` · `#pTitre` · `#pResume` · `#pActs` · `#btnJournee` · `#jRefaire`
`#btnPartage` · `#jJours` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours` · `#jPied`
`#jRetour` · `#itineraire` · `#poigneeItineraire` · `#closeItineraire` · `#iResume`
`#iCorps` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB`
`#iPmr` · `#iResultat` · `#videItineraire`

### `_hors-ligne.html` — 45 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_ici.html` — 19 l.

- l.1 · 11 septies. « Vous êtes ici » — le branchement

### `_index.html` — 45 l. → index.html

Éléments :

`#secours`

### `_installation.html` — 41 l. → plan-admin.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`retourAuxReglages` 33

### `_itineraire.html` — 37 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — le tiroir, la visée et le tracé

### `_journee.html` — 17 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa visite — le branchement

### `_js.html` — 543 l. → plan-admin.html, plan-smcl.html, plan.html

- l.27 · 1. Index global — la recherche porte sur tous les pavillons

Fonctions :

`nomDeLaZone` 44 · `nomsAnglaisDesZones` 46 · `texteProduits` 59 · `indexe` 63
`chronoConf` 305 · `confsDuPlan` 310 · `indexeConferences` 328 · `rangeConferences` 406
`poseFavicon` 453 · `poseLogoSalon` 479 · `poseTonDeLaBarre` 516

Éléments :

`#data`

### `_langue.js` — 798 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_modales.html` — 119 l. → plan-admin.html

- l.2 · Fenêtres modales — le branchement, et la réorganisation des calques

Fonctions :

`deplaceVers` 19 · `versExtremite` 31 · `remplitOrdre` 39 · `ouvreOrdre` 109

### `_mode-admin.html` — 53 l. → plan-admin.html

- l.3 · 10. Mode administration — le branchement

### `_motdepasse.html` — 254 l. → motdepasse.html

- l.61 · Poser un mot de passe

Fonctions :

`$` 82 · `CFG` 84 · `dit` 92 · `fragment` 98 · `garde` 105 · `lit` 109 · `demandeLien` 182
`ouvreSaisie` 191

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_ordre-fiche.html` — 52 l. → plan-admin.html, plan-smcl.html, plan.html

Fonctions :

`enregistreConf` 19 · `ecarte` 34 · `joli` 49

### `_parcours.html` — 399 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`basculeParcours` 28 · `verseAuParcours` 73 · `retenusPourParcours` 119
`ajouteToutAuParcours` 144 · `poseToutAuParcours` 167 · `brancheParcours` 191
`rafraichitParcours` 204 · `rangParcours` 234 · `remplitParcours` 254 · `ouvreParcours` 343
`fermeParcours` 355 · `videLeParcours` 371

### `_partage.html` — 128 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. Partager son parcours

Fonctions :

`accueilleParcoursPartage` 33 · `adoptePartage` 111 · `parcoursACopier` 127

### `_pile.html` — 80 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.50 · Le panneau des calques — le branchement

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 24 · `groupe` 36 · `ordonneDom` 44
`construitPanneau` 76

### `_pousse.html` — 23 l. → plan-admin.html

- l.1 · Enregistrer la configuration — le branchement

### `_rappels.html` — 17 l.

- l.1 · 11 sexies. Le rappel avant une conférence

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 16 l.

- l.2 · Rapport d'utilisation — le branchement

### `_recherche.html` — 1270 l.

- l.3 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le

Fonctions :

`indexeSecteurs` 24 · `secteursMontres` 37 · `couleurConf` 41 · `couleurSecteur` 50
`BANDES` 71 · `majFondus` 79 · `pastilleSecteur` 117 · `coloreSecteurs` 130
`peintSecteur` 182 · `appliqueSecteurs` 195 · `filtreTheme` 212 · `themeFiltrable` 292
`ordreCriteres` 312 · `clesCriteres` 335 · `libelleCritere` 342 · `valeursCritere` 361
`texteCriteres` 374 · `texteAnglaisPerso` 390 · `indexeCriteres` 404 · `refaitCriteres` 438
`dansCriteres` 445 · `critereActif` 453 · `basculeCritere` 455 · `videCriteres` 464
`majVideQ` 473 · `videRecherche` 486 · `nCriteres` 501 · `majCriteres` 516
`remplitCriteres` 583 · `basculeCriteres` 722 · `ouvreCriteres` 727 · `fermeCriteres` 743
`filtre` 760 · `reposeRetrait` 780 · `critParSociete` 784 · `cherchable` 794 · `visible` 801
`releveHotes` 822 · `visibleSurPlan` 830 · `visibleSociete` 841 · `marqueRetrait` 857
`appliqueFiltre` 875 · `oublieRetrait` 891 · `reprendRecherche` 900 · `rangSorte` 913
`codeCase` 935 · `caseNumero` 952 · `sousLigne` 972 · `liste` 986 · `marqueChoisie` 1114
`prechargeMarque` 1140 · `prechargeLesVignettes` 1197 · `chargeUnLot` 1243

### `_reglages.html` — 23 l. → plan-admin.html

### `_rendu.html` — 663 l.

- l.3 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.146 · 3. Rendu du pavillon courant
- l.522 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`mesureTexte` 11 · `largeur` 16 · `remesureTextes` 40 · `decoupe` 66 · `habille` 79
`lignesSvg` 90 · `coexComptes` 107 · `coexChoisit` 108 · `ligneCode` 124
`monteHabillage` 152 · `baliseZone` 181 · `baliseStand` 191 · `montePlan` 198
`onglets` 234 · `changePlan` 256 · `texteDist` 303 · `texteCourtDist` 308 · `porteDist` 312
`standPorte` 316 · `calqueDists` 325 · `traceDist` 356 · `oublieDists` 389
`modesDuPlan` 393 · `releveDists` 395 · `dessineDists` 424 · `marquesListe` 450
`poseDistsFiche` 480 · `refaitDistsFiche` 520 · `ancre` 530 · `place` 531 · `libelles` 533
`decaleLibelle` 620 · `facteurLibelle` 621 · `libelleForce` 622 · `libelleZone` 625
`libelleEmplacement` 644

### `_sponsor.html` — 14 l. → plan-admin.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

### `_styles-divers.css` — 315 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-jetons.css` — 270 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles-parcours.css` — 1556 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles.css` — 830 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-parcours.css` — 601 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-plan.css` — 1600 l. → plan-admin.html, plan-smcl.html, plan.html

### `_suggestion.html` — 21 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 15. La suggestion — le branchement

### `_sw.js` — 566 l.

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_tutoriel.html` — 17 l.

- l.1 · 17. La visite guidée — le branchement

### `_volets.html` — 29 l. → plan-admin.html

### `_vue.html` — 479 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 6. Vue

Fonctions :

`cadrePlan` 18 · `oublieCadre` 19 · `figeTextes` 35 · `rendTextes` 43 · `cadrage` 79
`peintLibelles` 84 · `detacheLibelles` 90 · `rattacheLibelles` 102 · `etireLibelles` 120
`appliqueVue` 128 · `libellesDeLaVue` 192 · `rafraichitVue` 200 · `poseVue` 216
`mesureBarre` 247 · `masqueHaut` 279 · `masque` 286 · `masqueDroite` 323 · `fit` 334
`stoppeZoom` 367 · `glisseVersVise` 373 · `glisseVers` 415 · `rectVisee` 437 · `zoom` 457
`echelle` 470

### `_webgl.html` — 165 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 13 bis. Le plan peint par la carte graphique — le branchement

Fonctions :

`enEdition` 33 · `emplacementWebgl` 61 · `libellesWebgl` 109

### `modules/acces-admin.mjs` — 250 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`litLocal` 34 · `configuration` 39 · `normaliseUrlA` 43 · `sessionValide` 59
`ecranAcces` 77 · `contenuDuJeton` 168 · `mailDuJeton` 169 · `litProfilA` 180
`initialesDe` 193 · `poseCompte` 200 · `brancheAcces` 226

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `modules/affiche-ici.mjs` — 400 l. → plan-admin

- l.1 · « Vous êtes ici » — l'affiche à coller, côté exploitant

Fonctions :

`visee` 31 · `vise` 32 · `ferme` 33 · `fermeParcours` 34 · `formeParId` 35 · `versPlan` 36
`largeur` 37 · `prefixePlan` 58 · `coteIci` 70 · `nomCodeIci` 86 · `codeIci` 105
`lienIci` 123 · `pointTouche` 150 · `codeIciAuPoint` 162 · `armeCodeIci` 168
`afficheIci` 190 · `ligneAffiche` 230 · `nomFichierIci` 239 · `ouvreCodeIci` 254
`boutonsCodeIci` 306 · `telechargeAfficheIci` 331 · `imprimeAfficheIci` 349
`boutonCodeIci` 378 · `brancheAfficheIci` 400

### `modules/aimants.mjs` — 531 l. → plan-admin

- l.1 · Dessiner juste — cote, aimants, répétition

Fonctions :

`vue` 31 · `imageEnAttente` 32 · `formeSel` 33 · `calqueActif` 34 · `cadrePlan` 35
`mesCalques` 36 · `estCadre` 37 · `boite` 38 · `toleranceTrace` 39 · `apercuGuide` 40
`formeParId` 41 · `ajouteForme` 42 · `choisitForme` 43 · `signale` 44 · `memorise` 45
`enregistreDessins` 46 · `redessineForme` 47 · `dessinePoignees` 48 · `brancheAimants` 53
`ecritMetres` 60 · `coteCadre` 64 · `montreCote` 76 · `aimantsActifs` 104 · `axesDe` 108
`pointsAimants` 113 · `oublieAimantsDuPlan` 133 · `aimantsDuPlan` 135 · `pasAimant` 168
`cale` 176 · `sousLeGeste` 181 · `cranGrille` 192 · `oublieAimants` 209
`aimantsDessines` 211 · `coinsGeste` 237 · `montreAimants` 259 · `meilleurSommet` 324
`croixAimant` 338 · `correction` 362 · `aimante` 403 · `retientTaille` 417
`reprendTaille` 431 · `dupliqueForme` 452 · `pousseForme` 477 · `ecritDimensions` 494
`appliqueDimension` 513

### `modules/apercus.mjs` — 347 l. → plan-admin

- l.1 · Les aperçus de la fenêtre des réglages — l'exploitant seul

Fonctions :

`brancheApercus` 39 · `texteCorps` 105 · `clesPortees` 130 · `standApercu` 150
`lignesApercu` 174 · `contenuApercu` 204 · `apercuFiche` 241 · `apercuListe` 319
`apercuDuo` 341

### `modules/appel-fonction.mjs` — 61 l. → console

- l.1 · L'appel des fonctions du projet, depuis la console

Fonctions :

`brancheFonctions` 30 · `refus` 43 · `fonction` 54

### `modules/application.mjs` — 37 l. → plan, plan-admin

- l.1 · L'application installée — ce que le plan public en sait

Fonctions :

`adresseIconeApp` 26 · `appDuSalon` 34 · `iconeDeLApplication` 37

### `modules/avancement.mjs` — 432 l. → console

- l.1 · L'avancement d'une synchronisation — la fenêtre, et son secours

Fonctions :

`brancheAvancement` 29 · `fenetreAvancement` 60 · `suitAuServeur` 392

### `modules/bande-admin.mjs` — 120 l. → plan-admin

- l.1 · 10. Mode administration — son ouverture, et la bande de l'outil

Fonctions :

`brancheBandeAdmin` 40 · `activeAdmin` 45

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `modules/batiments.mjs` — 624 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`reglages` 68 · `confDe` 69 · `estAdmin` 70 · `vue` 71 · `changeVue` 72 · `poseVue` 73
`cadrePlan` 74 · `masque` 75 · `versPlan` 76 · `mesCalques` 77 · `activeCalque` 78
`memorise` 79 · `nouvelId` 80 · `cleVerrou` 81 · `pile` 82 · `clePile` 83
`enregistreConf` 84 · `enregistreDessins` 85 · `dessineDessins` 86 · `construitPanneau` 87
`CLE_CALAGE` 98 · `bibliothequeDispo` 99 · `refBatiment` 116 · `refForme` 120
`marqueBatiment` 123 · `batimentsPoses` 126 · `estBatiment` 133 · `hallsPoses` 136
`lieuDuCalque` 142 · `poseCalage` 148 · `ouvreBibliotheque` 157 · `vueDuLieu` 253
`lanceCalage` 293 · `effaceLeTempsDuCalage` 321 · `cadreCalage` 340 · `finCalage` 353
`pivoteCalage` 364 · `degresCalage` 380 · `dessineCalage` 385 · `calagePointerDown` 408
`calagePointerMove` 421 · `calagePointerUp` 437 · `reposeBatiment` 450
`ajouteBatiments` 466 · `brancheBatiments` 518 · `boutonRecale` 562 · `pictoRecale` 571
`calageRelu` 588 · `rouvreCalage` 614

### `modules/borne.mjs` — 431 l. → plan, plan-admin

- l.1 · La borne interactive — un plan qui sait où il est

Fonctions :

`visee` 54 · `vise` 55 · `vue` 56 · `bandeauVisee` 57 · `changePlan` 58
`fermeItineraire` 59 · `effaceItineraire` 60 · `ferme` 61 · `fermeParcours` 62
`videLeParcours` 63 · `videRecherche` 64 · `formeParId` 65 · `versPlan` 66 · `cadrePlan` 67
`fit` 68 · `pointBorne` 98 · `poseLieuBorne` 103 · `borneRetenue` 111 · `retientBorne` 117
`oublieBorne` 120 · `lieuBorne` 139 · `lieuNomme` 158 · `pointLibre` 163
`poseDepartImpose` 176 · `poseLaBorne` 187 · `remetLeDepart` 206 · `poseBorneIci` 220
`armeLaPose` 229 · `montreBandeauBorne` 245 · `ecritDepartBorne` 259 · `rayonBorne` 269
`dessineBorne` 274 · `rafraichitBorne` 290 · `rempliBorne` 295 · `relanceRepos` 324
`reposeLaBorne` 331 · `demarreBorne` 367 · `brancheBorne` 416

### `modules/calage-carte.mjs` — 828 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 73 · `centrePavillon` 88 · `basculeMasqueCarte` 93
`boutonMasqueCarte` 104 · `pictoMasque` 115 · `carreDeTerrain` 142 · `chercheBatiments` 158
`empriseDesObjets` 186 · `batimentsCandidats` 204 · `caleSurBatiment` 225
`retientLeHall` 251 · `manqueCalage` 273 · `enregistreCalage` 282 · `calageEnregistre` 299
`oublieCalageEnCours` 320 · `litCoordonnees` 332 · `rafraichitCarte` 346 · `armeCalage` 383
`pivotCalage` 394 · `glisseCarte` 398 · `cartePointerDown` 405 · `cartePointerMove` 419
`cartePointerUp` 438 · `ditCalage` 446 · `majCalage` 455 · `appliqueCalage` 477
`tourneCalage` 484 · `construitCalage` 490 · `ouvreCalage` 655 · `fermeCalage` 665
`brancheCalageCarte` 678 · `voletEnvirons` 704

### `modules/chaleur.mjs` — 675 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.456 · Remise à zéro des compteurs

Fonctions :

`nbChal` 57 · `tonChaleur` 76 · `niveauChaleur` 98 · `valeurChaleur` 101
`chargeChaleur` 114 · `coloreChaleur` 160 · `cartoucheChaleur` 195
`mesureCartoucheChaleur` 259 · `replieChaleur` 265 · `ecritEtatChaleur` 276
`dessineEchelleChaleur` 284 · `dessineTopChaleur` 304 · `phraseChaleur` 346
`rafraichitChaleur` 371 · `montreChaleur` 405 · `rangChaleur` 438 · `aplati` 478
`voletMesure` 483 · `evenementCourant` 509 · `ouvreRemiseAZero` 528 · `lanceRemiseAZero` 620
`brancheChaleur` 667

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `modules/charge-annoncee.mjs` — 230 l. → plan, plan-admin

- l.1 · La charge annoncée — ce que les autres journées ont déjà posé

Fonctions :

`seuilConcentration` 25 · `identifiantParcours` 27 · `parcours` 29 · `sejour` 31
`brancheCharge` 41 · `chargeSuivie` 81 · `etapesDuSejour` 87 · `annoncePlan` 115
`celluleUtile` 151 · `dilatationDuJour` 168 · `litLaCharge` 205 · `chargeCellule` 225

### `modules/classeur.mjs` — 235 l. → console, rapport

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 30 · `crc32` 40 · `archiveZip` 55 · `texteXml` 111 · `colonneXl` 114
`XL_PARTS` 125 · `feuilleXl` 179 · `classeurXl` 215 · `enregistreFichier` 226

### `modules/comptes.mjs` — 374 l. → console

- l.1 · Comptes et accès — l'annuaire, et la fiche d'une personne

Fonctions :

`brancheComptes` 45 · `poseComptes` 55 · `litMonProfil` 69 · `RETOUR_MDP` 80
`litComptes` 82 · `ligneMessage` 91 · `casesSalons` 101 · `ouvreComptes` 131
`ouvreFicheCompte` 223

### `modules/console.mjs` — 75 l. → console

- l.1 · Point d'entrée de la console

### `modules/correspondance.mjs` — 122 l. → console

- l.1 · Correspondance des champs d'origine — le vocabulaire du réglage

Fonctions :

`encode` 27 · `decode` 29 · `correspondance` 34 · `sansPrefixe` 37 · `courte` 38
`intitule` 53 · `intituleSuite` 65 · `aplani` 87 · `memeStyle` 97 · `autreFace` 115

### `modules/couleurs.mjs` — 34 l. → plan, plan-admin

- l.1 · Les couleurs : d'une notation à l'autre, et ce que l'œil en perçoit

Fonctions :

`hslHex` 7 · `rgbHex` 19 · `hexa` 27 · `luminance` 31

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

### `modules/dom.mjs` — 10 l. → plan, plan-admin, console, rapport

- l.1 · Le document : ce que tout le code demande à la page

Fonctions :

`$` 10

### `modules/donnees.mjs` — 84 l. → plan, plan-admin

- l.1 · Les données du plan, leurs index, et ce que la vue regarde

Fonctions :

`poseDonnees` 50 · `P` 84

### `modules/duplication.mjs` — 48 l. → console

- l.1 · Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

Fonctions :

`brancheDuplication` 26 · `dupliquer` 30

### `modules/emplacements.mjs` — 302 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`reglages` 56 · `nomSurLePlan` 57 · `nomsAnglaisDesZones` 58 · `brancheEmplacements` 66
`cleGeo` 70 · `poseSorteGeo` 79 · `geometrieSource` 92 · `reposeSource` 101
`poseGeometrie` 110 · `retoucheGeo` 124 · `elargitEmprise` 137 · `appliqueGeometries` 158
`cleAjout` 199 · `anneauxValides` 210 · `rechAjout` 215 · `objetAjoute` 224 · `poseLien` 243
`appliqueAjouts` 270

### `modules/enregistrement.mjs` — 651 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.522 · La sauvegarde emportée

Fonctions :

`enAttente` 61 · `notePubliees` 63 · `marqueAttente` 65 · `reglagesDuSalon` 67
`annonce` 69 · `autoDispo` 113 · `enRetard` 116 · `etatCourant` 129 · `majAttente` 140
`compteRescapes` 154 · `ditAlerte` 167 · `ditEtat` 211 · `programmeEnvoi` 218
`programmePublication` 232 · `rattrapeRetard` 239 · `envoie` 244 · `presse` 257
`brancheEnregistrement` 267 · `identifiants` 291 · `reglagesSeuls` 306
`noteReglagesCharges` 317 · `oublieCache` 331 · `pousseConfiguration` 350
`sauvegardeCourante` 542 · `telechargeSauvegarde` 564 · `appliqueSauvegarde` 587
`litSauvegarde` 621 · `brancheSauvegarde` 643

### `modules/environs.mjs` — 795 l. → plan, plan-admin

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`brancheEnvirons` 60 · `calageEnCours` 68 · `confieCalageEnCours` 70 · `styleSobre` 143
`forceCarte` 237 · `calagePose` 255 · `calageCourant` 267 · `fondCourant` 270 · `recul` 275
`adresseTuile` 280 · `tuilesDeLaVue` 290 · `chargeMapLibre` 355 · `vueGL` 386
`styleDuFond` 407 · `guetteLaCarte` 435 · `poseCarteGL` 446 · `diagnostiqueGL` 536
`relanceCarteGL` 556 · `videCarteGL` 568 · `dessineFondCarte` 593 · `cleMasqueCarte` 706
`masqueCarte` 707 · `formesMasquantes` 716 · `contourDuHall` 738 · `cheminDuHall` 745
`poseMasqueCarte` 763 · `ditCarte` 778 · `refaitFondCarte` 788

### `modules/essai-rappel.mjs` — 69 l. → plan-admin

- l.1 · L'essai d'un vrai rappel, depuis les réglages

Fonctions :

`essaieRappelReel` 37

### `modules/evenements.mjs` — 79 l. → console

- l.1 · Les salons de la console, celui qu'on regarde, et leurs pavillons

Fonctions :

`poseEvenements` 41 · `brancheEvenements` 58 · `slugifie` 62 · `courant` 66
`chargePlans` 68 · `majEvenement` 73

### `modules/export.mjs` — 232 l. → console, rapport

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 34 · `colonnesExport` 118 · `libellePeriode` 150 · `nomFichierExport` 156
`nomFeuilleExport` 166 · `exporteExposants` 182 · `brancheExport` 230

### `modules/fenetre.mjs` — 110 l. → plan, plan-admin

- l.1 · La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire

Fonctions :

`_habille` 8 · `poseAvantFermeture` 19 · `verseModale` 21 · `poseApresFermeture` 36
`ouvreModale` 46 · `fermeModale` 66 · `confirme` 76 · `brancheFenetre` 94

### `modules/fiche-detail.mjs` — 1311 l. → console

- l.1 · Fiche détail d'un salon — ce qu'elle montre, et d'où vient chaque champ
- l.46 · Contenu de la fiche détail

Fonctions :

`brancheFicheDetail` 42 · `paraitSurFiche` 183 · `origineConferences` 189
`origineProduits` 196 · `resumeFiche` 260 · `caseFiche` 305 · `cibleEn` 353
`champsPersos` 355 · `criteres` 361 · `ecritFiche` 364 · `caseCritere` 379 · `clePerso` 398
`ajouteChampPerso` 406 · `renommeChampPerso` 424 · `retireChampPerso` 472
`lignesPerso` 533 · `cadreFiche` 556 · `ouvreFiche` 586 · `cadreCategories` 726
`sousTitre` 805 · `tableauChamps` 820 · `champOrigine` 1046

### `modules/fiche-evenement.mjs` — 450 l. → console

- l.1 · Fiche d'un salon dans la console — ses champs, ses pavillons, ses sources

Fonctions :

`brancheFiche` 58 · `champ` 69 · `champFavicon` 112 · `dessineFiche` 189 · `ligneOutil` 319
`ligneReglage` 335 · `champCle` 349 · `ouvreSources` 388 · `majIntegration` 433
`majMsgSync` 440

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `modules/fiche-zone.mjs` — 883 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.70 · La fiche d'une zone organisateur
- l.789 · Masquer une zone organisateur

Fonctions :

`reglages` 47 · `typesZone` 48 · `typeZone` 49 · `annonce` 50 · `enregistreConf` 51
`nomsAnglaisDesZones` 52 · `libelles` 53 · `liste` 54 · `cartouchePoi` 55
`majPaletteGeo` 56 · `ouvre` 57 · `rangeConferences` 58 · `brancheFicheZone` 66
`champZone` 96 · `champsZone` 121 · `champSalles` 213 · `nomDeZone` 265 · `cadreLogo` 291
`champLogo` 363 · `editeurRiche` 401 · `memeFicheZone` 558 · `suitFicheZone` 565
`verseFicheZone` 573 · `ficheZone` 599 · `enregistreZone` 624 · `enregistreZoneAjoutee` 737
`basculeAffichageZone` 800 · `marqueZonesMasquees` 828 · `ecritColonnesEvenement` 848
`ecritColonneEvenement` 882

### `modules/forme.mjs` — 154 l. → plan, plan-admin

- l.1 · La forme d'un emplacement — anneaux, tracé, empreinte, ancrage du nom

Fonctions :

`arrondiGeo` 14 · `empreinteGeo` 25 · `anneauxGeo` 45 · `traceGeo` 58 · `boiteAnneaux` 62
`dansAnneau` 80 · `distSegmentGeo` 91 · `distBordGeo` 100 · `poleGeo` 110 · `porteeGeo` 129
`boiteGeo` 137

### `modules/fuseau.mjs` — 115 l. → console

- l.1 · Fuseau horaire du salon — le champ de la console

Fonctions :

`brancheFuseau` 28 · `fuseauConnu` 42 · `champFuseau` 54

Éléments :

`#fuseaux`

### `modules/ici.mjs` — 255 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le code affiché dans le hall, côté visiteur

Fonctions :

`relance` 63 · `litCodeIci` 94 · `poseIci` 117 · `retireIci` 144 · `oublieIciDeLAdresse` 174
`montreBandeauIci` 190 · `demarreIci` 224 · `brancheIci` 246

### `modules/icone-app.mjs` — 126 l. → plan-admin

- l.1 · L'icône de l'application, fabriquée depuis un logo déposé

Fonctions :

`fondPourIconeApp` 56 · `dessineIconeApp` 88 · `reduitIconeApp` 115

### `modules/icone-onglet.mjs` — 58 l. → console

- l.1 · Icône de l'onglet

Fonctions :

`reduitIcone` 30

### `modules/installation.mjs` — 913 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`conf` 105 · `reglageInstallation` 125 · `invitationVoulue` 126 · `auDoigt` 156
`nommeApplication` 192 · `reponsesInstallation` 210 · `retientInstallation` 215
`jourInstallation` 224 · `invitationEcartee` 227 · `refuseInstallation` 233
`faconInstallation` 261 · `appliInstallee` 284 · `verifieApplication` 306
`connaitLApplication` 316 · `adresseApplication` 329 · `lanceApplication` 349
`faconRappel` 382 · `rappelEcarte` 390 · `refuseRappel` 396 · `relanceInvitation` 414
`gesteInstallation` 419 · `doigtPose` 423 · `doigtLeve` 424 · `vueInstallation` 427
`accueilleInvitation` 436 · `invitationRetenue` 462 · `suitLesGestes` 483
`finInvitation` 491 · `rouvreInvitation` 513 · `essaieInvitation` 533
`brancheInstallation` 578 · `teteInvitation` 673 · `retourAuxReglages` 688
`poseGardeInstallation` 709 · `remplitInvitation` 732 · `ouvreInvitation` 762
`ouvreRappel` 841 · `ouvreRetrouve` 903

### `modules/itineraire.mjs` — 2650 l. → plan, plan-admin

- l.1 · L'itinéraire — le calcul d'un trajet d'un point du salon à un autre

Fonctions :

`brancheItineraire` 39 · `conf` 41 · `cheminForme` 42 · `pictoForme` 43 · `nomTypeRepere` 44
`estPorte` 45 · `ouvreEntrant` 46 · `ouvreSortant` 47 · `instantConf` 48 · `finInstant` 49
`sommets` 151 · `enveloppe` 171 · `oublieGrilles` 214 · `calquesDe` 219 · `reperesDe` 227
`zoneTraversee` 307 · `zonesDuTerrain` 316 · `cleRoleIti` 319 · `roleIti` 320
`nomRoleIti` 321 · `estCirculation` 324 · `formesRole` 349 · `anglePlan` 381
`dansGrille` 420 · `horsGrille` 421 · `grille` 431 · `distanceAuMur` 620 · `cretes` 663
`nappePrincipale` 681 · `celluleDe` 716 · `caseDe` 720 · `centreCase` 725 · `empriseDe` 768
`accrocheDepuis` 830 · `versLeMilieu` 903 · `accroche` 938 · `Tas` 953 · `travail` 997
`cherche` 1020 · `distancesDepuis` 1087 · `distancesMulti` 1101 · `regleFoule` 1173
`ecarteFoule` 1190 · `heureAuSalon` 1194 · `sallesEnMouvement` 1203 · `foule` 1246
`bilanFoule` 1334 · `reduit` 1363 · `guidageAllees` 1426 · `recentre` 1482 · `passable` 1567
`lisse` 1601 · `longueur` 1628 · `longueurDehors` 1644 · `nettoie` 1686 · `oublieFaces` 1733
`facesLibres` 1735 · `amorce` 1832 · `faceDeSortie` 1867 · `raccordTient` 1913
`accesDe` 1943 · `couplesAcces` 1995 · `troncon` 2028 · `pointObjet` 2073
`pointRepere` 2080 · `candidats` 2089 · `pointSaisi` 2123 · `portesDe` 2135
`versPorte` 2142 · `typeLiaison` 2203 · `nomRepere` 2211 · `oublieLiaisons` 2229
`lienEcrits` 2241 · `ecritLiens` 2250 · `annuaireLiaisons` 2255 · `liensDe` 2287
`coutLiaison` 2307 · `passagePraticable` 2314 · `passagesDe` 2322 · `sortiesDe` 2332
`plansRelies` 2340 · `balayage` 2364 · `distanceDepuis` 2382 · `cheminLiaisons` 2409
`routeParLiaisons` 2495 · `routeEntre` 2533 · `mesureMarches` 2571 · `coupeMarche` 2586
`distancesDesArrets` 2602 · `ecritDistance` 2616 · `ecritDuree` 2624 · `phraseLiaison` 2638

### `modules/journee.mjs` — 1261 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`datesSalon` 30 · `horairesSalon` 31 · `lueHeure` 32 · `select` 34 · `ficheConf` 35
`basculeParcours` 36 · `rangParcours` 37 · `rafraichitParcours` 38 · `changePlan` 39
`trace` 41 · `joursSalon` 106 · `joursAVenir` 135 · `joursDefaut` 153 · `confsParJour` 163
`departsProposes` 188 · `rangJournee` 210 · `lienJournee` 222 · `boutonJour` 245
`arretJournee` 258 · `remplitOnglets` 305 · `jourDuStand` 334 · `ouvreChoixJour` 346
`figeLaVisite` 403 · `placeSurJour` 412 · `rendAuPlan` 420 · `retireDuSejour` 426
`remplitJournee` 436 · `ecritApercu` 649 · `appliqueVueParcours` 679 · `traceJournee` 721
`montreLeJour` 730 · `perimeJournee` 745 · `oublieSejour` 760 · `ouvreOrganisation` 775
`essaieSejour` 1155 · `lanceSejour` 1185 · `refaitSejour` 1224 · `brancheJournee` 1243

### `modules/libelle-place.mjs` — 91 l. → plan, plan-admin

- l.1 · Placer un libellé à la main — ce que le plan public en reçoit

Fonctions :

`brancheLibellePlace` 50 · `cleLibelle` 54 · `poseModeLibelles` 63 · `poseLibelleChoisi` 68
`empreinteLibelle` 80 · `placementLibelle` 88

### `modules/lien-parcours.mjs` — 97 l. → plan, plan-admin

- l.1 · Le parcours écrit dans un lien, et relu

Fonctions :

`codeIdParcours` 45 · `codeParcours` 63 · `champParcours` 75 · `litCodeParcours` 82

### `modules/marque.mjs` — 282 l. → plan, plan-admin, console

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 55 · `recadreMarque` 59 · `marqueRecadree` 85 · `imageChargee` 114
`vignetteMarque` 130 · `boiteMarque` 157 · `toileMarque` 223 · `vignetteDeLogo` 247

### `modules/mesure.mjs` — 654 l. → plan, plan-admin

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 66 · `jetonMesure` 69 · `jourIso` 108 · `echeanceMesure` 109
`jetonRetenu` 134 · `supportMesure` 183 · `renouvelleVisiteur` 235 · `fraisEnFile` 302
`litLaFile` 306 · `ecritLaFile` 319 · `metEnFile` 334 · `retireDeLaFile` 345
`chargeDe` 356 · `envoiePaquet` 369 · `beaconne` 394 · `pousseLaFile` 415
`envoieMesures` 434 · `mesure` 471 · `brancheLesEnvois` 486 · `effaceJetonsVisiteur` 541
`refuseMesure` 559 · `ouvreConfidentialite` 586 · `brancheLaNotice` 637
`brancheMesure` 651

### `modules/mode-admin.mjs` — 40 l. → plan, plan-admin

- l.1 · 10. Mode administration — ce que le plan public en sait

Fonctions :

`ouvreModeAdmin` 21 · `retireAdmin` 30

### `modules/nappe.mjs` — 92 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`jeton` 25 · `poseNappe` 45 · `couleurNappe` 47 · `rafraichitApercu` 53 · `brancheNappe` 89

### `modules/notifications.mjs` — 89 l. → plan, plan-admin

- l.1 · Les notifications — ce que l'appareil sait recevoir, et l'abonnement

Fonctions :

`poussePossible` 19 · `iOSsansInstallation` 24 · `adresseDuRappel` 30 · `heureVue` 54
`empreinteDebut` 55 · `octetsDeCle` 59 · `abonnementCourant` 67 · `abonne` 76

### `modules/ordonnanceur.mjs` — 866 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 84 · `peineDeCharge` 105 · `ecartDesJours` 191 · `poidsDesJours` 221
`chargeDuJour` 244 · `rangeSejour` 253 · `trancheDe` 803 · `dilatationPour` 858

### `modules/parcours.mjs` — 437 l. → plan, plan-admin

- l.1 · Le parcours de visite : la liste, son stockage, sa marque

Fonctions :

`_rafraichit` 23 · `_reprendRappels` 24 · `_synchroniseRappels` 25 · `poseParcours` 85
`brancheListeParcours` 103 · `cleParcours` 116 · `identifiantParcours` 153
`casierParcours` 161 · `dansParcours` 162 · `jourParcours` 165
`attenduDepuisTropLongtemps` 170 · `trieParcours` 181 · `chargeParcours` 191
`parcoursAEcrire` 225 · `enregistreParcours` 241 · `tientLeStockage` 270
`plurielParcours` 284 · `contenuParcours` 293 · `signetParcours` 304 · `boutonParcours` 310
`rafraichitMarque` 315 · `calqueMarques` 348 · `dessineMarques` 366 · `marqueParcours` 396
`instantConf` 414 · `cleTemps` 418 · `nomDeStand` 428 · `groupeParcours` 430

### `modules/partage.mjs` — 271 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`lienParcours` 45 · `ouvrePartageParcours` 61 · `boutonsPartage` 117
`ouvreGardeParcours` 213 · `demandeGardeParcours` 243 · `poseGardeParcours` 256

### `modules/pile.mjs` — 600 l. → plan-admin

- l.1 · Le panneau des calques
- l.117 · Panneau : deux sections, chacune rangée par nom
- l.411 · Repères
- l.463 · Fond du plan

Fonctions :

`estAdmin` 76 · `dessins` 77 · `calqueActif` 78 · `placeLibelles` 79 · `secteurs` 80
`entrees` 81 · `conf` 82 · `enregistreConf` 83 · `jeton` 84 · `sousCle` 85
`sousCalques` 86 · `joli` 87 · `styleFond` 88 · `styleDataGroupe` 89 · `styleData` 90
`appliqueCouleursData` 91 · `appliqueFond` 92 · `suitNuancier` 93 · `secteursMontres` 95
`couleurSecteur` 96 · `peintSecteur` 97 · `mesCalques` 98 · `creeCalque` 99
`enregistreDessins` 100 · `dessineDessins` 101 · `peintCalque` 102 · `verrouille` 103
`basculeVerrou` 104 · `pictoVerrou` 105 · `activeCalque` 106 · `memorise` 107
`modePlacementLibelles` 108 · `ouvreOrdre` 109 · `branchePile` 113 · `nature` 135
`boutonAjout` 142 · `boutonVerrou` 162 · `intertitre` 170 · `remplitPanneau` 179
`sectionSelection` 427 · `sectionFond` 483 · `ligneCouleur` 541 · `rangSecteur` 561
`rangSous` 574 · `defautCouleur` 596

### `modules/placement-libelles.mjs` — 189 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`reglages` 42 · `enregistreConf` 43 · `libelles` 44 · `lacheLibelle` 51 · `posePlacement` 60
`libelleAutomatique` 78 · `modePlacementLibelles` 87 · `majPaletteLibelle` 106
`choisitLibelle` 123 · `pousseLibelle` 130 · `libellePointerDown` 138
`libellePointerMove` 154 · `libellePointerUp` 163 · `branchePlacementLibelles` 178

### `modules/plan-admin.mjs` — 96 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

### `modules/plan.mjs` — 171 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

### `modules/provenance.mjs` — 178 l. → console

- l.1 · Provenance des données d'un salon — domaines, fournisseurs, réglage
- l.36 · Provenance des données

Fonctions :

`brancheProvenance` 32 · `fournisseurUtilise` 100 · `sourceNom` 110 · `source` 114
`ligneSource` 118 · `resumeProvenance` 141 · `ouvreProvenance` 162

### `modules/qr.mjs` — 315 l. → plan, plan-admin

- l.1 · Le code QR, sans bibliothèque

Fonctions :

`qrMotsBruts` 36 · `qrMotsUtiles` 45 · `qrMul` 56 · `qrGenerateur` 59 · `qrReste` 70
`qrAlignements` 81 · `qrTrame` 97 · `qrChemin` 286 · `qrSvg` 308

### `modules/rappels.mjs` — 548 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`conf` 71 · `tuto` 72 · `brancheRappels` 80 · `reglageRappel` 99 · `rappelsVoulus` 100
`minutesRappel` 101 · `cleRappels` 115 · `chargeRappels` 118 · `retientRappels` 122
`rappelsOfferts` 133 · `instantAbsolu` 163 · `confsARappeler` 171 · `rappelsDuParcours` 188
`synchroniseRappels` 226 · `eteintRappels` 249 · `allumeRappels` 264 · `aideRappel` 281
`poseRappels` 297 · `cleInviteRappel` 418 · `inviteRappelFaite` 421
`retientInviteRappel` 426 · `fenetreRappel` 461 · `proposeRappels` 494
`reprendRappels` 537

### `modules/rapport-utilisation.mjs` — 485 l. → rapport

- l.1 · Rapport d'utilisation

Fonctions :

`courant` 80 · `chargeEvenements` 85 · `joursPeriode` 103 · `chargeRapport` 105
`chiffre` 116 · `barres` 135 · `portes` 175 · `jours` 226 · `dessineRapport` 247
`dessineBarre` 400 · `rafraichit` 423 · `videEcran` 442 · `demarre` 448
`brancheRapport` 470

Éléments :

`#lienPublic`

### `modules/rapport.mjs` — 33 l. → rapport

- l.1 · Point d'entrée du rapport

### `modules/reglage-application.mjs` — 327 l. → plan-admin

- l.1 · L'application installée — son icône et son nom, le réglage de l'exploitant

Fonctions :

`brancheReglageApplication` 59 · `nomAppDefaut` 80 · `ecritApplication` 95
`blocApplication` 136

### `modules/reglage-fiche.mjs` — 668 l. → plan-admin

- l.1 · Le volet « Fiche Stand » des réglages — l'exploitant seul

Fonctions :

`clesFiche` 53 · `voletOrdre` 70 · `brancheReglageFiche` 665

### `modules/reglage-installation.mjs` — 71 l. → plan-admin

- l.1 · La case de l'invitation à installer, dans l'onglet « Admin » des réglages

Fonctions :

`brancheReglageInstallation` 22 · `caseInstallation` 34

### `modules/reglage-rappel.mjs` — 173 l. → plan-admin

- l.1 · Le rappel avant une conférence, dans l'onglet « Admin » des réglages

Fonctions :

`brancheReglageRappel` 26 · `blocRappel` 48 · `ditEssaiRappel` 159

### `modules/reglage-sponsor.mjs` — 232 l. → plan-admin

- l.1 · Le générique du démarrage, réglé par l'exploitant

Fonctions :

`brancheReglageSponsor` 32 · `blocSponsor` 75

### `modules/reglage-suggestion.mjs` — 428 l. → plan-admin

- l.1 · La suggestion — le volet de l'exploitant

Fonctions :

`conf` 23 · `clesCriteres` 24 · `valeursCritere` 25 · `libelleCritere` 26 · `champZone` 27
`enregistreConf` 28 · `glisseFenetre` 29 · `rafraichitParcours` 30 · `indexSugg` 47
`valeursSugg` 72 · `relevePalmares` 90 · `etiquetteSugg` 110 · `voletSuggestion` 120
`brancheReglageSuggestion` 428

### `modules/reglages.mjs` — 542 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`brancheReglages` 66 · `glisseFenetre` 96 · `ouvreReglages` 108 · `voletZones` 236
`champsFicheZone` 338 · `ficheZoneEnPlace` 408 · `voletPlan` 426 · `voletCoexposants` 474

### `modules/reprise-emplacements.mjs` — 800 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`vue` 79 · `reglages` 80 · `conf` 81 · `calqueActif` 82 · `enregistreConf` 83
`construitPanneau` 84 · `cadrePlan` 85 · `libelles` 86 · `oublieDists` 87
`dessineDists` 88 · `baliseZone` 89 · `baliseStand` 90 · `appliqueSecteurs` 91
`marqueRetrait` 92 · `liste` 93 · `nomsAnglaisDesZones` 94 · `ouvre` 95 · `ferme` 96
`optionActive` 97 · `pictoVerrou` 98 · `activeCalque` 99 · `remplitListeSocietes` 100
`societeSaisie` 101 · `etiquetteSociete` 102 · `apercu` 103 · `apercuGuide` 104
`versPlan` 105 · `fermeIci` 106 · `cheminForme` 107 · `nouvelId` 108 · `lacheGeo` 119
`cleVerrouGeo` 139 · `geoVerrouille` 140 · `basculeVerrouGeo` 142 · `boutonVerrouGeo` 157
`modeGeometrie` 168 · `objetGeoSous` 195 · `groupeGeo` 205 · `choisitGeo` 213
`cadreGeo` 228 · `prisesGeo` 248 · `curseurGeo` 260 · `dessinePoigneesGeo` 263
`ecritDimensionsGeo` 291 · `nomSorteGeo` 303 · `majPaletteGeo` 305 · `finGesteGeo` 344
`enregistreGeo` 362 · `geometrieOrigine` 376 · `retraceGeo` 391 · `pousseGeometrie` 402
`appliqueDimensionGeo` 419 · `enregistreAjout` 434 · `ajouteEmplacement` 449
`renommeAjout` 477 · `lieAjout` 509 · `ecritInfosAjout` 538 · `supprimeAjout` 565
`choisitOutilGeo` 594 · `aideAjout` 601 · `fermeAjout` 611 · `ajoutPointerDown` 620
`ajoutPointerMove` 636 · `ajoutPointerUp` 658 · `geometriePointerDown` 678
`accrocheGeo` 709 · `geometriePointerMove` 711 · `geometriePointerUp` 762
`brancheRepriseEmplacements` 780

### `modules/salon.mjs` — 50 l. → plan, plan-admin

- l.1 · Le salon et la page : ce que l'adresse et la construction disent

Fonctions :

`cheminDuSalon` 33 · `cheminPartageable` 44

### `modules/sejour.mjs` — 579 l. → plan, plan-admin

- l.1 · La préparation du séjour — répartir les stands, puis dérouler les jours

Fonctions :

`brancheSejour` 35 · `minutesVisite` 37 · `horairesSalon` 38 · `seuilConcentration` 39
`seuilImpose` 40 · `oublieMatrice` 87 · `finInstant` 92 · `pointConf` 100
`matriceJournee` 119 · `derouleJournee` 190 · `prepareSejour` 334 · `calculeSejour` 536
`apercuRepartition` 570

### `modules/session.mjs` — 133 l. → plan, plan-admin, console, rapport

- l.1 · La session de l'exploitant, et l'appel à la base

Fonctions :

`accesBase` 15 · `contenuJeton` 42 · `resteJeton` 52 · `echangeSession` 68 · `base` 92

### `modules/sponsor.mjs` — 410 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 119 · `secondesSponsor` 122 · `modeSponsor` 135 · `sponsorRetenu` 154
`cleSponsor` 185 · `sponsorEnCache` 188 · `retientSponsor` 203 · `ouvreSponsor` 228
`suitSponsor` 321 · `resteSponsor` 346 · `fermeSponsor` 352 · `accueilleSponsor` 368
`brancheSponsor` 402

### `modules/suggestion.mjs` — 331 l. → plan, plan-admin

- l.1 · La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`conf` 41 · `clesCriteres` 42 · `valeursCritere` 43 · `libelleCritere` 44
`suggestionOfferte` 45 · `select` 46 · `remplitParcours` 47 · `brancheParcours` 48
`reglageSugg` 77 · `seuilSugg` 79 · `presentationsSugg` 103 · `presenteSugg` 109
`critereSugg` 114 · `suggestionCourante` 131 · `exposantPropose` 167 · `nomValeurSugg` 185
`phraseSuggestion` 206 · `carteSuggestion` 234 · `poseSuggestion` 283
`fenetreSuggestion` 297 · `brancheSuggestion` 331

### `modules/sur.mjs` — 190 l. → plan, plan-admin

- l.1 · Ce qui vient d'ailleurs, relu avant d'être affiché

Fonctions :

`lien` 22 · `adresseWeb` 30 · `adresseSure` 43 · `adresseImage` 70 · `imageSure` 83
`assainitRiche` 112 · `enBlocs` 160 · `rangeRiche` 173

### `modules/synchronisation.mjs` — 229 l. → console

- l.1 · Synchronisation d'un salon — lancement, suivi, vignettes des logos

Fonctions :

`brancheSynchronisation` 39 · `etapesPressenties` 57 · `synchronise` 72
`fabriqueLesVignettes` 169 · `envoieVignettes` 222

### `modules/temps.mjs` — 129 l. → plan, plan-admin

- l.1 · Les dates et les heures du salon

Fonctions :

`momentLocal` 32 · `jourLong` 55 · `jourCourt` 62 · `dateDeCle` 69 · `jourBref` 75
`jourISO` 82 · `instantMural` 103 · `minutesDe` 117 · `ecritHeure` 119 · `ecritMinutes` 124

### `modules/terre.mjs` — 173 l. → plan, plan-admin

- l.1 · Le plan sur la Terre — le calcul, sans la carte

Fonctions :

`metresParDegre` 23 · `tourneEnvirons` 40 · `versTerre` 46 · `versLePlan` 53 · `reancre` 68
`pixelsMercator` 87 · `latitudeDePixel` 96 · `echelleDesTuiles` 116 · `niveauDesTuiles` 128
`aireDuContour` 138 · `centreDuContour` 147 · `axeDuContour` 160

### `modules/texte.mjs` — 25 l. → plan, plan-admin, console, rapport

- l.1 · Le texte : l'écrire dans la page, le découper, le ranger

Fonctions :

`esc` 6 · `separeValeurs` 17

### `modules/tiroir-itineraire.mjs` — 810 l. → plan, plan-admin

- l.1 · Itinéraire — le tiroir, la visée et le tracé

Fonctions :

`vue` 38 · `changeVue` 39 · `poseVue` 40 · `cadrePlan` 41 · `masque` 42 · `masqueDroite` 43
`masqueHaut` 44 · `ETROIT` 45 · `changePlan` 46 · `ferme` 47 · `fermeParcours` 48
`formeParId` 49 · `calculeRoute` 67 · `poseTrace` 90 · `marchesIci` 92 · `rayonBout` 97
`arreteTracage` 130 · `peintItineraire` 136 · `lanceTracage` 187 · `dessineItineraire` 212
`rafraichitBouts` 234 · `cadreItineraire` 257 · `champIti` 281 · `fermeSugg` 285
`montreSugg` 292 · `choisitPoint` 326 · `valideSaisie` 335 · `effaceItineraire` 347
`relance` 375 · `montreResultat` 417 · `poseVisee` 561 · `bandeauVisee` 563
`armeVisee` 586 · `finVisee` 604 · `viseItineraire` 620 · `visePoi` 626 · `visePoint` 632
`ouvreItineraire` 661 · `fermeItineraire` 689 · `versItineraire` 699
`versItineraireDe` 702 · `brancheTiroirItineraire` 734

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

### `modules/tutoriel.mjs` — 1014 l. → plan, plan-admin

- l.1 · La visite guidée — le tour du plan, geste par geste

Fonctions :

`brancheTutoriel` 77 · `conf` 84 · `optionActive` 85 · `montre` 86 · `changePlan` 87
`centre` 88 · `ferme` 89 · `fermeParcours` 90 · `ETROIT` 91 · `route` 96 · `attente` 97
`iti` 98 · `visee` 99 · `eteintVisee` 100 · `journee` 102 · `vueJournee` 103 · `sejour` 104
`iciActif` 106 · `dessinEnCours` 109 · `reglageTuto` 137 · `tutoPropose` 146 · `cleTuto` 150
`tutoOuvert` 152 · `tutoModale` 153 · `tutoFicheOuverte` 159 · `tutoFiche` 162
`tutoParcours` 164 · `tutoItineraire` 168 · `tutoJournee` 172 · `zoneDuTuto` 180
`insecable` 197 · `phraseTrajetTuto` 203 · `chapitresTuto` 463 · `proposeTutoriel` 483
`lanceTutoriel` 541 · `quitteTutoriel` 628 · `chapitreTuto` 639 · `battementTuto` 648
`finTuto` 666 · `afficheTuto` 683 · `pxTuto` 738 · `boiteTuto` 751 · `repereTuto` 766
`rameneTuto` 799 · `placeTuto` 837 · `voileTuto` 931 · `rafaleTuto` 948
`marqueZoneTuto` 968 · `marqueLibelleTuto` 1003

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `modules/vivant.mjs` — 36 l. → plan, plan-admin, console, rapport

- l.1 · Un état de module, lu par le code soudé tel qu'il est à l'instant

Fonctions :

`vivants` 25

### `modules/volets.mjs` — 1264 l. → plan-admin

- l.1 · Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —

Fonctions :

`brancheVolets` 93 · `voletAdmin` 103 · `blocOptions` 268 · `blocLangues` 315
`blocBarre` 389 · `blocHoraires` 447 · `voletParcours` 589 · `sallesSituees` 724
`voletPmr` 740 · `nomDuTon` 831 · `svgVignette` 840 · `barreVignette` 842
`vignetteDistPlan` 846 · `vignetteDistListe` 859 · `vignetteDistFiche` 873
`salonDitSes` 893 · `coinPris` 900 · `voletDist` 923 · `voletApparence` 1088

### `modules/webgl.mjs` — 1354 l. → plan, plan-admin

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`chargeWebgl` 87 · `brancheWebgl` 114 · `monteWebgl` 124 · `poseToileWebgl` 225
`guetteContexteWebgl` 231 · `contextePerduWebgl` 241 · `verifieContexteWebgl` 248
`perdContexteWebgl` 257 · `remonteWebgl` 278 · `vueDeck` 295 · `vueWebgl` 304 · `blocDe` 313
`majEditionWebgl` 326 · `cleBloc` 338 · `planifieWebgl` 364 · `toutRepeindreWebgl` 368
`blocsDansLOrdre` 375 · `repeintWebgl` 380 · `assembleWebgl` 404 · `constTexte` 438
`jeuDeCaracteres` 634 · `sousPixelOffert` 688 · `couchesPetites` 693 · `couchesTexte` 703
`accVide` 738 · `convertitBloc` 739 · `accDe` 755 · `parcoursGl` 762 · `formeGl` 798
`texteGl` 834 · `imageGl` 857 · `partage` 889 · `designeGl` 895 · `couchesDeBloc` 897
`modelesLibellesHtml` 977 · `poseModelesLibelles` 987 · `lisModelesLibelles` 993
`groupesNoms` 1026 · `couchesNoms` 1043 · `couchesPastilles` 1054
`couchesLibellesWebgl` 1069 · `couchesDessineesWebgl` 1076 · `stage` 1097
`brancheSurvolWebgl` 1101 · `poseSurvolWebgl` 1121 · `poseCurseurWebgl` 1130
`poseFocusWebgl` 1139 · `aplatsDe` 1146 · `coucheSurvol` 1149 · `coucheFocus` 1158
`couchesPhare` 1185 · `lueurDe` 1201 · `opacitePhare` 1239 · `echellePhare` 1240
`couchesPhareNoms` 1243 · `palierDefile` 1268 · `phaseComete` 1270 · `animeCouche` 1273
`majAnimationWebgl` 1290 · `animeWebgl` 1298 · `objetSous` 1321 · `cibleWebgl` 1328
`priseWebgl` 1335 · `libelleSousWebgl` 1340 · `rectEcranWebgl` 1345

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 542 l.

`champs` 179 · `decoupe` 191 · `valeursOui` 257 · `imageDistante` 292 · `lit` 314
`valeursDe` 337 · `cibleEn` 380 · `champsPerso` 397 · `cibles` 423 · `separeValeurs` 453
`noteValeurs` 491 · `valeursRelevees` 512 · `valeurPerso` 535

### `supabase/functions/_partage/eventmaker.ts` — 1208 l.

`grapheJson` 233 · `enParallele` 1016 · `texteSeul` 1036 · `champs` 1173

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266 · `egal` 300

### `supabase/functions/_partage/geometrie.ts` — 163 l.

`r2` 23 · `versAnneaux` 26 · `versTrace` 44 · `distSegment` 55 · `distBord` 64
`poleInterieur` 83 · `portee` 104 · `boite` 113 · `emprise` 144 · `dedans` 155

### `supabase/functions/_partage/octets.ts` — 18 l.

`octetsDeVignette` 12

### `supabase/functions/_partage/push.ts` — 229 l.

`octets` 49 · `base64url` 57 · `colle` 63 · `texte` 71 · `cleDeSignature` 83
`jetonVapid` 105 · `derive` 131 · `chiffre` 145 · `pousse` 201

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106 · `allege` 118 · `sansMasques` 196
`textes` 207

### `supabase/functions/_partage/version.ts` — 100 l.

`versionFond` 47 · `versionDuPlan` 92 · `condense` 96

### `supabase/functions/_partage/vignette.ts` — 28 l.

`cleDeVignette` 23

### `supabase/functions/mesure/index.ts` — 173 l.

`jeton` 80 · `client` 83

### `supabase/functions/plan-public/index.ts` — 1103 l.

`cors` 52 · `db` 86 · `service` 101 · `vignettesParAdresse` 118 · `avecVignette` 155
`rendVignette` 191 · `rendVignettes` 282 · `lu` 325 · `salon` 335 · `appDuSalon` 361
`rendIconeApp` 392 · `retraits` 493 · `ampute` 517 · `masquesDe` 560 · `masquesDuPlan` 580

### `supabase/functions/sync-evenement/index.ts` — 1894 l.

`cors` 43 · `bourre` 112 · `client` 122 · `ecrit` 144 · `gaia` 152 · `libellesChoix` 163
`retiensAnglais` 190 · `fournisseur` 208 · `raccourci` 216 · `enClair` 253 · `range` 279
`champsKlipso` 300 · `hebergee` 1842 · `nettoieUrl` 1870 · `groupeTextes` 1880

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
- `20260914231027_le_calage_du_plan_sur_la_terre.sql` — evenement
- `20260915103801_vignettes_des_logos_d_exposants.sql` — vignette_de_logo
- `20260915113207_retrouver_une_vignette_par_son_adresse_d_origine.sql` — —
- `20260915115829_le_rappel_avant_une_conference.sql` — rappel_de_conference, fn enregistre_rappels, fn rappels_dus, fn oublie_abonnement, fn purge_rappels
- `20260915131103_programmer_vraiment_la_tache_des_rappels.sql` — —
- `20260916232846_l_icone_et_le_nom_de_l_application_installee.sql` — evenement
- `20260916235956_les_mesures_qui_ont_attendu_le_reseau.sql` — fn enregistre_mesures
- `20260917004611_oublier_un_rappel_que_le_programme_a_dementi.sql` — rappel_de_conference, fn empreinte_debut, fn enregistre_rappels, fn oublie_rappels_perimes
- `20260917121232_l_avancement_d_une_synchronisation_releve_sur_la_fiche_du_salon.sql` — evenement
- `20260921132502_un_seul_nom_de_produit_dans_le_commentaire_du_nom_de_l_application.sql` — —
- `20260921145417_le_calage_de_la_carte_par_pavillon.sql` — plan
- `20260922144359_la_charge_prevue_des_stands.sql` — plan_de_visite, compteur, fn enregistre_mesures, fn pose_plan_de_visite, fn charge_prevue, fn purge_presences, fn reinitialise_compteurs, fn rapport_utilisation
- `20261008172816_la_porte_publique_des_mesures.sql` — fn mesure_publique

## Le reste

- `src/index.mjs` — 965 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 104 · `amontPour` 113 · `cleDe` 121 · `cleDeLot` 127 · `condense` 134 `cleVersion` 158 · `rangeLaVersion` 161 · `ditVersion` 169 · `meta` 178 · `gardable` 194 `range` 200 · `rafraichit` 207 · `entete` 242 · `oublie` 284 · `rappels` 370 · `cleApp` 415 `cheminDuSalon` 446 · `pageDuSalon` 463 · `appDuSalon` 487 · `iconesDuSalon` 533 `manifeste` 573 · `iconeApp` 662 · `mesure` 706 · `planDeVisite` 781 · `chargePrevue` 819
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
