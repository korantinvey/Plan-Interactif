<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 11 l. → admin-plans.html, rapport.html

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 78 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console.css` — 734 l. → console.css

- l.666 · Page de rapport

### `_entete.html` — 6 l.

### `_head.html` — 629 l. → plan-admin.html, plan-smcl.html, plan.html

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
`#outilsCalque` · `#renommeOutils` · `#replieOutils` · `#fermeOutils` · `#roleIti`
`#roleAide` · `#voirNappe` · `#aimants` · `#aimantPas` · `#contourReg` · `#contourRayon`
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

### `_index.html` — 17 l. → index.html

Éléments :

`#secours`

### `_js.html` — 6 l.

Éléments :

`#data`

### `_langue.js` — 810 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-smcl.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_motdepasse.html` — 59 l. → motdepasse.html

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_styles-divers.css` — 315 l. → plan-smcl.html

### `_styles-jetons.css` — 270 l. → plan-smcl.html

### `_styles-modeles-parcours.css` — 1556 l. → plan-smcl.html

### `_styles-modeles.css` — 830 l. → plan-smcl.html

### `_styles-parcours.css` — 601 l. → plan-smcl.html

### `_styles-plan.css` — 1605 l. → plan-smcl.html

### `_sw.js` — 567 l.

Fonctions :

`estUneTuile` 122 · `range` 148 · `oublieLesVersionsDAvant` 174 · `dabordCache` 195
`borneLesLots` 231 · `borneLesTuiles` 269 · `demandeTiers` 324 · `commePosee` 332
`tuileDeCarte` 349 · `fondDeCarte` 385 · `dabordReseau` 412 · `navigation` 429

### `modules/acces-admin.mjs` — 252 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`activeAdmin` 31 · `confieALAcces` 34 · `litLocal` 42 · `configuration` 47
`normaliseUrlA` 51 · `sessionValide` 67 · `ecranAcces` 85 · `contenuDuJeton` 174
`mailDuJeton` 175 · `litProfilA` 186 · `poseCompte` 201 · `brancheAcces` 226

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `modules/accueil.mjs` — 11 l. → accueil

- l.1 · Point d'entrée de la page d'accueil — la racine

### `modules/affiche-ici.mjs` — 397 l. → plan-admin

- l.1 · « Vous êtes ici » — l'affiche à coller, côté exploitant

Fonctions :

`visee` 35 · `vise` 36 · `prefixePlan` 57 · `coteIci` 69 · `nomCodeIci` 85 · `codeIci` 104
`lienIci` 122 · `pointTouche` 149 · `codeIciAuPoint` 161 · `armeCodeIci` 167
`afficheIci` 189 · `ligneAffiche` 229 · `nomFichierIci` 238 · `ouvreCodeIci` 253
`boutonsCodeIci` 305 · `telechargeAfficheIci` 330 · `imprimeAfficheIci` 348
`boutonCodeIci` 377

### `modules/aiguillage.mjs` — 38 l. → accueil

- l.1 · L'aiguillage de la racine — où mène l'adresse nue

Fonctions :

`brancheAiguillage` 21

### `modules/aimants.mjs` — 535 l. → plan-admin

- l.1 · Dessiner juste — cote, aimants, répétition

Fonctions :

`vue` 32 · `imageEnAttente` 33 · `formeSel` 34 · `calqueActif` 35 · `cadrePlan` 36
`mesCalques` 37 · `estCadre` 38 · `boite` 39 · `toleranceTrace` 40 · `apercuGuide` 41
`formeParId` 42 · `ajouteForme` 43 · `choisitForme` 47 · `signale` 48 · `memorise` 49
`enregistreDessins` 50 · `redessineForme` 51 · `dessinePoignees` 52 · `brancheAimants` 57
`ecritMetres` 64 · `coteCadre` 68 · `montreCote` 80 · `aimantsActifs` 108 · `axesDe` 112
`pointsAimants` 117 · `oublieAimantsDuPlan` 137 · `aimantsDuPlan` 139 · `pasAimant` 172
`cale` 180 · `sousLeGeste` 185 · `cranGrille` 196 · `oublieAimants` 213
`aimantsDessines` 215 · `coinsGeste` 241 · `montreAimants` 263 · `meilleurSommet` 328
`croixAimant` 342 · `correction` 366 · `aimante` 407 · `retientTaille` 421
`reprendTaille` 435 · `dupliqueForme` 456 · `pousseForme` 481 · `ecritDimensions` 498
`appliqueDimension` 517

### `modules/apercus.mjs` — 327 l. → plan-admin

- l.1 · Les aperçus de la fenêtre des réglages — l'exploitant seul

Fonctions :

`texteCorps` 85 · `clesPortees` 110 · `standApercu` 130 · `lignesApercu` 154
`contenuApercu` 184 · `apercuFiche` 221 · `apercuListe` 299 · `apercuDuo` 321

### `modules/apparence.mjs` — 199 l. → plan, plan-admin

- l.1 · L'apparence des calques, et les commandes posées sur le plan

Fonctions :

`confieALApparence` 42 · `styleFond` 48 · `sousCalques` 69 · `styleDataGroupe` 76
`appliqueCouleursData` 85 · `styleData` 117 · `appliqueApparence` 123
`appliqueCommandes` 188

### `modules/appel-fonction.mjs` — 120 l. → console

- l.1 · L'appel des fonctions du projet, depuis la console

Fonctions :

`refus` 26 · `fonction` 37 · `fluxFonction` 59

### `modules/application.mjs` — 37 l. → plan, plan-admin

- l.1 · L'application installée — ce que le plan public en sait

Fonctions :

`adresseIconeApp` 26 · `appDuSalon` 34 · `iconeDeLApplication` 37

### `modules/avancement.mjs` — 416 l. → console

- l.1 · L'avancement d'une synchronisation — la fenêtre, et son secours

Fonctions :

`fenetreAvancement` 44 · `suitAuServeur` 376

### `modules/bande-admin.mjs` — 112 l. → plan-admin

- l.1 · 10. Mode administration — son ouverture, et la bande de l'outil

Fonctions :

`activeAdmin` 31

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `modules/bandes.mjs` — 66 l. → plan, plan-admin

- l.1 · Les bandes qui défilent — fondu du bord, flèche qui avance

Fonctions :

`BANDES` 27 · `majFondus` 35 · `brancheBandes` 49

### `modules/batiments.mjs` — 596 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 64 · `bibliothequeDispo` 65 · `refBatiment` 82 · `refForme` 86
`marqueBatiment` 89 · `batimentsPoses` 92 · `estBatiment` 99 · `hallsPoses` 102
`lieuDuCalque` 108 · `poseCalage` 114 · `ouvreBibliotheque` 123 · `vueDuLieu` 219
`halleGlissee` 259 · `lanceCalage` 261 · `effaceLeTempsDuCalage` 289 · `cadreCalage` 308
`finCalage` 321 · `pivoteCalage` 332 · `degresCalage` 348 · `dessineCalage` 353
`calagePointerDown` 376 · `calagePointerMove` 389 · `calagePointerUp` 405
`reposeBatiment` 418 · `ajouteBatiments` 434 · `brancheBatiments` 487 · `boutonRecale` 529
`pictoRecale` 538 · `calageRelu` 555 · `rouvreCalage` 581

### `modules/borne.mjs` — 351 l. → plan, plan-admin

- l.1 · La borne interactive — un plan qui sait où il est

Fonctions :

`borneRetenue` 89 · `retientBorne` 95 · `oublieBorne` 98 · `lieuBorne` 117 · `lieuNomme` 136
`pointLibre` 141 · `poseDepartImpose` 154 · `poseLaBorne` 165 · `remetLeDepart` 184
`poseBorneIci` 198 · `armeLaPose` 207 · `montreBandeauBorne` 223 · `relanceRepos` 245
`reposeLaBorne` 252 · `demarreBorne` 288 · `brancheBorne` 331

### `modules/calage-carte.mjs` — 825 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 65 · `centrePavillon` 80 · `basculeMasqueCarte` 85
`boutonMasqueCarte` 96 · `pictoMasque` 107 · `carreDeTerrain` 134 · `chercheBatiments` 150
`empriseDesObjets` 178 · `batimentsCandidats` 196 · `caleSurBatiment` 217
`retientLeHall` 243 · `manqueCalage` 265 · `enregistreCalage` 274 · `calageEnregistre` 291
`oublieCalageEnCours` 312 · `litCoordonnees` 324 · `rafraichitCarte` 338
`carteGlissee` 373 · `armeCalage` 377 · `pivotCalage` 388 · `glisseCarte` 392
`cartePointerDown` 399 · `cartePointerMove` 413 · `cartePointerUp` 432 · `ditCalage` 440
`majCalage` 449 · `appliqueCalage` 471 · `tourneCalage` 478 · `construitCalage` 484
`ouvreCalage` 649 · `fermeCalage` 659 · `brancheCalageCarte` 671 · `voletEnvirons` 696

### `modules/calques-dessin.mjs` — 212 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — ce que le poste en garde

Fonctions :

`majAttente` 27 · `confieAuxCalques` 31 · `enAttente` 67 · `litRange` 94
`ouvreDessins` 106 · `reprendCommun` 131 · `notePubliees` 157 · `rangeDessins` 175
`dejaPubliee` 180 · `marqueAttente` 186 · `mesCalques` 195 · `poseCalqueActif` 204
`poseOutil` 205 · `poseEbauche` 209 · `trouveCalque` 211 · `nouvelId` 212

### `modules/chaleur.mjs` — 685 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.464 · Remise à zéro des compteurs

Fonctions :

`ouvreReglages` 47 · `confieALaChaleur` 50 · `nbChal` 65 · `tonChaleur` 84
`niveauChaleur` 106 · `valeurChaleur` 109 · `chargeChaleur` 122 · `coloreChaleur` 168
`cartoucheChaleur` 203 · `mesureCartoucheChaleur` 267 · `replieChaleur` 273
`ecritEtatChaleur` 284 · `dessineEchelleChaleur` 292 · `dessineTopChaleur` 312
`phraseChaleur` 354 · `rafraichitChaleur` 379 · `montreChaleur` 413 · `rangChaleur` 446
`aplati` 486 · `voletMesure` 491 · `evenementCourant` 517 · `ouvreRemiseAZero` 536
`lanceRemiseAZero` 630 · `brancheChaleur` 675

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `modules/charge-annoncee.mjs` — 228 l. → plan, plan-admin

- l.1 · La charge annoncée — ce que les autres journées ont déjà posé

Fonctions :

`seuilConcentration` 24 · `identifiantParcours` 26 · `parcours` 28 · `sejour` 30
`brancheCharge` 39 · `chargeSuivie` 79 · `etapesDuSejour` 85 · `annoncePlan` 113
`celluleUtile` 149 · `dilatationDuJour` 166 · `litLaCharge` 203 · `chargeCellule` 223

### `modules/chemin-forme.mjs` — 99 l. → plan, plan-admin

- l.1 · Le tracé d'une forme dessinée

Fonctions :

`cheminArrondi` 26 · `estCadre` 69 · `cheminForme` 71 · `styleTrait` 91

### `modules/classeur.mjs` — 235 l. → console, rapport

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 30 · `crc32` 40 · `archiveZip` 55 · `texteXml` 111 · `colonneXl` 114
`XL_PARTS` 125 · `feuilleXl` 179 · `classeurXl` 215 · `enregistreFichier` 226

### `modules/comptes.mjs` — 354 l. → console

- l.1 · Comptes et accès — l'annuaire, et la fiche d'une personne

Fonctions :

`poseComptes` 35 · `litMonProfil` 49 · `RETOUR_MDP` 60 · `litComptes` 62 · `ligneMessage` 71
`casesSalons` 81 · `ouvreComptes` 111 · `ouvreFicheCompte` 203

### `modules/configuration.mjs` — 165 l. → plan, plan-admin

- l.1 · La configuration du plan — ce que l'exploitant a réglé

Fonctions :

`secteurs` 30 · `confieALaConfiguration` 38 · `salonRange` 53 · `cleConf` 55
`ouvreConf` 59 · `reglagesDuSalon` 80 · `publie` 105 · `confiePublication` 109
`enregistreConf` 115 · `conf` 122 · `jeton` 123 · `sousCle` 125 · `optionActive` 131
`programmeOffert` 136 · `suggestionOfferte` 137 · `langueOfferte` 157 · `appliqueLangue` 159
`chercheSorte` 164

### `modules/console.mjs` — 42 l. → console

- l.1 · Point d'entrée de la console — et son démarrage

### `modules/corps-fiche.mjs` — 267 l. → plan, plan-admin

- l.1 · Le corps de la fiche — ce qu'elle montre, dans quel ordre, sous quels

Fonctions :

`confieAuCorpsDeFiche` 32 · `libelleCritere` 33 · `montre` 54 · `libelleCorps` 86
`ordreCorps` 103 · `groupesFiche` 135 · `montreIntitule` 148 · `valeurCorps` 168
`champCorps` 181 · `groupeCorps` 193 · `corpsRange` 206 · `pictoRS` 257

### `modules/correspondance.mjs` — 122 l. → console

- l.1 · Correspondance des champs d'origine — le vocabulaire du réglage

Fonctions :

`encode` 27 · `decode` 29 · `correspondance` 34 · `sansPrefixe` 37 · `courte` 38
`intitule` 53 · `intituleSuite` 65 · `aplani` 87 · `memeStyle` 97 · `autreFace` 115

### `modules/couleurs.mjs` — 73 l. → plan, plan-admin

- l.1 · Les couleurs : d'une notation à l'autre, et ce que l'œil en perçoit

Fonctions :

`hslHex` 7 · `rgbHex` 19 · `hexa` 27 · `luminance` 31 · `trio` 37 · `melange` 47
`ecarte` 61

### `modules/demarrage.mjs` — 367 l. → plan, plan-admin

- l.1 · 12. Démarrage — l'appel du plan, sa version, la panne réseau

Fonctions :

`confieAuDemarrage` 56 · `majAttente` 57 · `rattrapeRetard` 58 · `recadreListePosee` 75
`demarre` 91 · `annonce` 153 · `entetesApi` 176 · `chargeFond` 200 · `panneDuChargement` 247
`CLE_VERSION` 257 · `versionRetenue` 258 · `retientVersion` 261 · `demandePlan` 285
`charge` 309 · `brancheDemarrage` 346

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

### `modules/dessin.mjs` — 670 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — le tracé sur le plan

Fonctions :

`mentionOsm` 54 · `longueurFleche` 77 · `cheminFleche` 92 · `marqueFleche` 121
`rafraichitFleches` 132 · `traceForme` 147 · `rotationTexte` 166 · `dessineDessins` 171
`redessineForme` 212 · `peintCalque` 236 · `apercu` 243 · `apercuGuide` 255
`traceRepere` 278 · `nomSurLePlan` 412 · `etiquetteSociete` 423 · `seRattache` 451
`societeDeForme` 463 · `societesDuPlan` 475 · `traceImage` 509 · `traceStandDessine` 534
`texteStandDessine` 558 · `poseLibellesDessines` 577 · `decoupeStand` 598
`marqueStandsDessines` 613 · `rafraichitStandsDessines` 628 · `signale` 642

### `modules/distinctions.mjs` — 293 l. → plan, plan-admin

- l.1 · Les distinctions d'un exposant — nouveau venu, adhérent d'un syndicat

Fonctions :

`texteDist` 55 · `texteCourtDist` 60 · `porteDist` 64 · `standPorte` 68 · `calqueDists` 77
`traceDist` 108 · `oublieDists` 141 · `modesDuPlan` 145 · `releveDists` 147
`dessineDists` 181 · `marquesListe` 207 · `poseDistsFiche` 237 · `refaitDistsFiche` 277

### `modules/dom.mjs` — 10 l. → plan, plan-admin, console, rapport, motdepasse

- l.1 · Le document : ce que tout le code demande à la page

Fonctions :

`$` 10

### `modules/donnees.mjs` — 82 l. → plan, plan-admin

- l.1 · Les données du plan, leurs index, et ce que la vue regarde

Fonctions :

`poseDonnees` 48 · `P` 82

### `modules/duplication.mjs` — 43 l. → console

- l.1 · Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

Fonctions :

`brancheDuplication` 21 · `dupliquer` 25

### `modules/ecran-console.mjs` — 293 l. → console

- l.1 · L'écran de la console — la barre du haut, le choix du salon, le démarrage

Fonctions :

`charge` 36 · `selonAdresse` 63 · `majAdresse` 71 · `majBarre` 86 · `dessineChoix` 128
`majLiens` 145 · `videEcran` 186 · `dessine` 191 · `demarre` 206 · `brancheConsole` 224

### `modules/ecran.mjs` — 15 l. → plan, plan-admin

- l.1 · L'écran — étroit ou large, mouvement réduit ou non

Fonctions :

`ETROIT` 15

### `modules/edition-en-cours.mjs` — 43 l. → plan, plan-admin

- l.1 · L'édition en cours — le plan est-il sous un outil de l'exploitant ?

Fonctions :

`enEdition` 37

### `modules/edition.mjs` — 738 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`memorise` 62 · `enregistreDessins` 63 · `optionsModes` 64 · `societeSaisie` 65
`remplitListeSocietes` 66 · `confieAEdition` 70 · `curseurPoignee` 80 · `poignees` 85
`dessinePoignees` 94 · `cadreTexte` 129 · `poigneeRotation` 149 · `angleBorne` 159
`choisitForme` 161 · `replieOutils` 176 · `degageOutils` 191 · `majElement` 200
`candidatsLiaison` 321 · `ecritDesDeuxCotes` 343 · `changeLien` 355 · `changeDureeLien` 371
`majLiens` 388 · `appliqueSociete` 440 · `appliqueTexte` 456 · `appliqueRotation` 468
`appliqueRayon` 482 · `appliqueTrait` 495 · `appliqueTransport` 523 · `appliquePicto` 546
`supprimeForme` 572 · `editionPointerDown` 582 · `editionPointerMove` 642
`tourneTexte` 705 · `editionPointerUp` 721

### `modules/emplacements.mjs` — 282 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`cleGeo` 50 · `poseSorteGeo` 59 · `geometrieSource` 72 · `reposeSource` 81
`poseGeometrie` 90 · `retoucheGeo` 104 · `elargitEmprise` 117 · `appliqueGeometries` 138
`cleAjout` 179 · `anneauxValides` 190 · `rechAjout` 195 · `objetAjoute` 204 · `poseLien` 223
`appliqueAjouts` 250

### `modules/enregistrement.mjs` — 693 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.555 · La sauvegarde emportée

Fonctions :

`confieAEnregistrement` 69 · `gesteEnCours` 91 · `confieGesteEnCours` 95 · `autoDispo` 126
`enRetard` 129 · `etatCourant` 142 · `majAttente` 153 · `compteRescapes` 167
`ditAlerte` 180 · `ditEtat` 223 · `programmeEnvoi` 230 · `programmePublication` 244
`rattrapeRetard` 257 · `envoie` 263 · `apresGeste` 275 · `presse` 285
`brancheEnregistrement` 293 · `identifiants` 316 · `reglagesSeuls` 331
`noteReglagesCharges` 342 · `oublieCache` 356 · `pousseConfiguration` 375
`sauvegardeCourante` 575 · `telechargeSauvegarde` 597 · `appliqueSauvegarde` 620
`litSauvegarde` 654 · `brancheSauvegarde` 676

### `modules/environs.mjs` — 796 l. → plan, plan-admin

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`confieAuxEnvirons` 61 · `calageEnCours` 69 · `confieCalageEnCours` 71 · `styleSobre` 144
`forceCarte` 238 · `calagePose` 256 · `calageCourant` 268 · `fondCourant` 271 · `recul` 276
`adresseTuile` 281 · `tuilesDeLaVue` 291 · `chargeMapLibre` 356 · `vueGL` 387
`styleDuFond` 408 · `guetteLaCarte` 436 · `poseCarteGL` 447 · `diagnostiqueGL` 537
`relanceCarteGL` 557 · `videCarteGL` 569 · `dessineFondCarte` 594 · `cleMasqueCarte` 707
`masqueCarte` 708 · `formesMasquantes` 717 · `contourDuHall` 739 · `cheminDuHall` 746
`poseMasqueCarte` 764 · `ditCarte` 779 · `refaitFondCarte` 789

### `modules/erreurs.mjs` — 95 l. → plan, plan-admin

- l.1 · Les erreurs de la page, signalées

Fonctions :

`denous` 38 · `lieuDansLaPile` 46 · `envoie` 52 · `signale` 64 · `brancheErreurs` 79

### `modules/essai-rappel.mjs` — 69 l. → plan-admin

- l.1 · L'essai d'un vrai rappel, depuis les réglages

Fonctions :

`essaieRappelReel` 37

### `modules/evenements.mjs` — 70 l. → console

- l.1 · Les salons de la console, celui qu'on regarde, et leurs pavillons

Fonctions :

`poseEvenements` 42 · `slugifie` 53 · `courant` 57 · `chargePlans` 59 · `majEvenement` 64

### `modules/export.mjs` — 233 l. → console, rapport

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 35 · `colonnesExport` 119 · `libellePeriode` 151 · `nomFichierExport` 157
`nomFeuilleExport` 167 · `exporteExposants` 183 · `brancheExport` 231

### `modules/fenetre-console.mjs` — 143 l. → console, rapport

- l.1 · La fenêtre de la console et du rapport

Fonctions :

`verseModale` 30 · `ouvreModale` 42 · `verrouilleModale` 66 · `fermeModale` 68
`poseFenetre` 76 · `gardeLaPlace` 98 · `demande` 109 · `confirme` 137

### `modules/fenetre.mjs` — 128 l. → plan, plan-admin

- l.1 · La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire

Fonctions :

`poseAvantFermeture` 18 · `retour` 27 · `confieRetourAuxReglages` 31
`retourAuxReglages` 38 · `verseModale` 40 · `poseApresFermeture` 55 · `ouvreModale` 65
`fermeModale` 85 · `confirme` 95 · `brancheFenetre` 113

### `modules/fiche-detail.mjs` — 1291 l. → console

- l.1 · Fiche détail d'un salon — ce qu'elle montre, et d'où vient chaque champ
- l.26 · Contenu de la fiche détail

Fonctions :

`paraitSurFiche` 163 · `origineConferences` 169 · `origineProduits` 176 · `resumeFiche` 240
`caseFiche` 285 · `cibleEn` 333 · `champsPersos` 335 · `criteres` 341 · `ecritFiche` 344
`caseCritere` 359 · `clePerso` 378 · `ajouteChampPerso` 386 · `renommeChampPerso` 404
`retireChampPerso` 452 · `lignesPerso` 513 · `cadreFiche` 536 · `ouvreFiche` 566
`cadreCategories` 706 · `sousTitre` 785 · `tableauChamps` 800 · `champOrigine` 1026

### `modules/fiche-evenement.mjs` — 437 l. → console

- l.1 · Fiche d'un salon dans la console — ses champs, ses pavillons, ses sources

Fonctions :

`brancheFiche` 45 · `champ` 56 · `champFavicon` 99 · `dessineFiche` 176 · `ligneOutil` 306
`ligneReglage` 322 · `champCle` 336 · `ouvreSources` 375 · `majIntegration` 420
`majMsgSync` 427

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

### `modules/fiche-zone.mjs` — 875 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.56 · La fiche d'une zone organisateur
- l.775 · Masquer une zone organisateur

Fonctions :

`majPaletteGeo` 49 · `confieALaFicheZone` 54 · `champZone` 82 · `champsZone` 107
`champSalles` 199 · `nomDeZone` 251 · `cadreLogo` 277 · `champLogo` 349 · `editeurRiche` 387
`memeFicheZone` 544 · `suitFicheZone` 551 · `verseFicheZone` 559 · `ficheZone` 585
`enregistreZone` 610 · `enregistreZoneAjoutee` 723 · `basculeAffichageZone` 786
`marqueZonesMasquees` 814 · `ecritColonnesEvenement` 834 · `ecritColonneEvenement` 868

### `modules/fiche.mjs` — 1202 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.85 · 7. Sélection et fiche

Fonctions :

`confieALaFiche` 77 · `decoupeStand` 78 · `montePlan` 79 · `marqueStandsDessines` 80
`poseDistsFiche` 81 · `fermeParcours` 82 · `brancheParcours` 83 · `anime` 104 · `noeud` 128
`canalPlan` 138 · `rangSociete` 146 · `select` 155 · `centre` 180 · `brancheActesFiche` 191
`centreEtBaisseLaFiche` 207 · `centrePoint` 225 · `programme` 254 · `produits` 303
`ficheProduit` 331 · `ficheConf` 401 · `adresseVignette` 558 · `poseAppuiTactile` 575
`ecarteClicFantome` 578 · `nomSociete` 587 · `societes` 600 · `choisitExposant` 611
`poseMarque` 649 · `montreMarque` 709 · `poseCode` 732 · `rangeMarque` 773 · `ouvre` 829
`ferme` 1145 · `onglet` 1163 · `brancheFiche` 1181

Éléments :

`#dGo` · `#dItin`

### `modules/forme-choisie.mjs` — 39 l. → plan, plan-admin

- l.1 · La forme choisie dans l'éditeur, et ce que le plan public en partage

Fonctions :

`poseFormeSel` 23 · `formeParId` 27 · `boite` 35

### `modules/forme.mjs` — 154 l. → plan, plan-admin

- l.1 · La forme d'un emplacement — anneaux, tracé, empreinte, ancrage du nom

Fonctions :

`arrondiGeo` 14 · `empreinteGeo` 25 · `anneauxGeo` 45 · `traceGeo` 58 · `boiteAnneaux` 62
`dansAnneau` 80 · `distSegmentGeo` 91 · `distBordGeo` 100 · `poleGeo` 110 · `porteeGeo` 129
`boiteGeo` 137

### `modules/fuseau.mjs` — 101 l. → console

- l.1 · Fuseau horaire du salon — le champ de la console

Fonctions :

`fuseauConnu` 28 · `champFuseau` 40

Éléments :

`#fuseaux`

### `modules/gestes-admin.mjs` — 178 l. → plan-admin

- l.1 · Les gestes de l'exploitant sur le plan — leur rang dans la chaîne

Fonctions :

`appui` 42 · `suit` 56 · `leve` 65 · `annuleGeste` 76 · `clavier` 82 · `echap` 127
`apresEchap` 145 · `entree` 152 · `gesteEnCours` 163 · `brancheGestesAdmin` 169

### `modules/gestes.mjs` — 474 l. → plan, plan-admin

- l.1 · Les gestes sur le plan — glisser, pincer, la molette, l'appui qui ouvre
- l.71 · 8. Interactions du plan

Fonctions :

`poseGestesAdmin` 69 · `milieu` 95 · `commencePince` 101 · `suitPince` 115
`plieLesBandes` 168 · `saisitPlan` 182 · `cibleElargie` 219 · `planifieFiltre` 262
`brancheGestes` 276 · `brancheLangue` 457

### `modules/habillage.mjs` — 267 l. → plan, plan-admin

- l.1 · L'habillage du plan — couleur principale, fond, distinctions, barre du

Fonctions :

`confieALHabillage` 41 · `brancheHabillage` 51 · `appliqueAccent` 84 · `appliqueFond` 118
`modeDist` 165 · `couleurDist` 177 · `appliqueDists` 199 · `modeBarre` 229
`appliqueBarre` 231 · `appliqueModele` 254

### `modules/horaires.mjs` — 89 l. → plan, plan-admin

- l.1 · La journée du salon — ses dates, ses heures, le temps passé sur un stand

Fonctions :

`minutesVisite` 28 · `lueHeure` 55 · `lueDate` 59 · `datesSalon` 66 · `horairesSalon` 80

### `modules/ici.mjs` — 252 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le code affiché dans le hall, côté visiteur

Fonctions :

`litCodeIci` 90 · `poseIci` 113 · `retireIci` 140 · `oublieIciDeLAdresse` 170
`montreBandeauIci` 186 · `demarreIci` 220 · `brancheIci` 240

### `modules/icone-app.mjs` — 126 l. → plan-admin

- l.1 · L'icône de l'application, fabriquée depuis un logo déposé

Fonctions :

`fondPourIconeApp` 56 · `dessineIconeApp` 88 · `reduitIconeApp` 115

### `modules/icone-onglet.mjs` — 58 l. → console

- l.1 · Icône de l'onglet

Fonctions :

`reduitIcone` 30

### `modules/index-salon.mjs` — 484 l. → plan, plan-admin

- l.1 · 1. L'index du salon — la recherche porte sur tous les pavillons

Fonctions :

`confieALIndex` 49 · `compteRescapes` 50 · `noteReglagesCharges` 51 · `texteProduits` 58
`indexe` 62 · `chronoConf` 304 · `confsDuPlan` 309 · `indexeConferences` 327
`rangeConferences` 405 · `poseFavicon` 452 · `poseLogoSalon` 478

### `modules/installation.mjs` — 901 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`reglageInstallation` 119 · `invitationVoulue` 120 · `auDoigt` 150 · `nommeApplication` 186
`reponsesInstallation` 204 · `retientInstallation` 209 · `jourInstallation` 218
`invitationEcartee` 221 · `refuseInstallation` 227 · `faconInstallation` 255
`appliInstallee` 278 · `verifieApplication` 300 · `connaitLApplication` 310
`adresseApplication` 323 · `lanceApplication` 343 · `faconRappel` 376 · `rappelEcarte` 384
`refuseRappel` 390 · `relanceInvitation` 408 · `gesteInstallation` 413 · `doigtPose` 417
`doigtLeve` 418 · `vueInstallation` 421 · `accueilleInvitation` 430
`invitationRetenue` 456 · `suitLesGestes` 477 · `finInvitation` 485 · `rouvreInvitation` 507
`essaieInvitation` 527 · `brancheInstallation` 570 · `teteInvitation` 664
`poseGardeInstallation` 697 · `remplitInvitation` 720 · `ouvreInvitation` 750
`ouvreRappel` 829 · `ouvreRetrouve` 891

### `modules/itineraire.mjs` — 2647 l. → plan, plan-admin

- l.1 · L'itinéraire — le calcul d'un trajet d'un point du salon à un autre

Fonctions :

`brancheItineraire` 42 · `conf` 44 · `instantConf` 45 · `finInstant` 46 · `sommets` 148
`enveloppe` 168 · `oublieGrilles` 211 · `calquesDe` 216 · `reperesDe` 224
`zoneTraversee` 304 · `zonesDuTerrain` 313 · `cleRoleIti` 316 · `roleIti` 317
`nomRoleIti` 318 · `estCirculation` 321 · `formesRole` 346 · `anglePlan` 378
`dansGrille` 417 · `horsGrille` 418 · `grille` 428 · `distanceAuMur` 617 · `cretes` 660
`nappePrincipale` 678 · `celluleDe` 713 · `caseDe` 717 · `centreCase` 722 · `empriseDe` 765
`accrocheDepuis` 827 · `versLeMilieu` 900 · `accroche` 935 · `Tas` 950 · `travail` 994
`cherche` 1017 · `distancesDepuis` 1084 · `distancesMulti` 1098 · `regleFoule` 1170
`ecarteFoule` 1187 · `heureAuSalon` 1191 · `sallesEnMouvement` 1200 · `foule` 1243
`bilanFoule` 1331 · `reduit` 1360 · `guidageAllees` 1423 · `recentre` 1479 · `passable` 1564
`lisse` 1598 · `longueur` 1625 · `longueurDehors` 1641 · `nettoie` 1683 · `oublieFaces` 1730
`facesLibres` 1732 · `amorce` 1829 · `faceDeSortie` 1864 · `raccordTient` 1910
`accesDe` 1940 · `couplesAcces` 1992 · `troncon` 2025 · `pointObjet` 2070
`pointRepere` 2077 · `candidats` 2086 · `pointSaisi` 2120 · `portesDe` 2132
`versPorte` 2139 · `typeLiaison` 2200 · `nomRepere` 2208 · `oublieLiaisons` 2226
`lienEcrits` 2238 · `ecritLiens` 2247 · `annuaireLiaisons` 2252 · `liensDe` 2284
`coutLiaison` 2304 · `passagePraticable` 2311 · `passagesDe` 2319 · `sortiesDe` 2329
`plansRelies` 2337 · `balayage` 2361 · `distanceDepuis` 2379 · `cheminLiaisons` 2406
`routeParLiaisons` 2492 · `routeEntre` 2530 · `mesureMarches` 2568 · `coupeMarche` 2583
`distancesDesArrets` 2599 · `ecritDistance` 2613 · `ecritDuree` 2621 · `phraseLiaison` 2635

### `modules/journee.mjs` — 1268 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`confieALaJournee` 48 · `basculeParcours` 49 · `rangParcours` 50 · `rafraichitParcours` 51
`trace` 53 · `joursSalon` 118 · `joursAVenir` 147 · `joursDefaut` 165 · `confsParJour` 175
`departsProposes` 200 · `rangJournee` 222 · `lienJournee` 234 · `boutonJour` 257
`arretJournee` 270 · `remplitOnglets` 317 · `jourDuStand` 346 · `ouvreChoixJour` 358
`figeLaVisite` 415 · `placeSurJour` 424 · `rendAuPlan` 432 · `retireDuSejour` 438
`remplitJournee` 448 · `ecritApercu` 661 · `appliqueVueParcours` 691 · `traceJournee` 733
`montreLeJour` 742 · `perimeJournee` 757 · `oublieSejour` 772 · `ouvreOrganisation` 787
`essaieSejour` 1167 · `lanceSejour` 1197 · `refaitSejour` 1236 · `brancheJournee` 1252

### `modules/lancement.mjs` — 126 l. → plan, plan-admin

- l.1 · Le lancement du plan — ce que le script soudé faisait encore

Fonctions :

`confieLancementAdmin` 70 · `lancePlan` 73

### `modules/libelle-place.mjs` — 73 l. → plan, plan-admin

- l.1 · Placer un libellé à la main — ce que le plan public en reçoit

Fonctions :

`cleLibelle` 36 · `poseModeLibelles` 45 · `poseLibelleChoisi` 50 · `empreinteLibelle` 62
`placementLibelle` 70

### `modules/libelles.mjs` — 416 l. → plan, plan-admin

- l.1 · Les libellés du plan — le nom de l'exposant prime sur le numéro
- l.142 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`dessineDessins` 57 · `decoupeStand` 58 · `poseLibellesDessines` 59 · `phareZone` 60
`rafraichitFleches` 61 · `societeDeForme` 62 · `nomSurLePlan` 63 · `confieAuxLibelles` 72
`brancheLibelles` 80 · `coexComptes` 103 · `coexChoisit` 104 · `ligneCode` 120
`libelles` 149 · `decaleLibelle` 236 · `facteurLibelle` 237 · `libelleForce` 238
`libelleZone` 241 · `libelleEmplacement` 260 · `emplacementWebgl` 297 · `libellesWebgl` 345

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

### `modules/mode-admin.mjs` — 41 l. → plan, plan-admin

- l.1 · 10. Mode administration — ce que le plan public en sait

Fonctions :

`ouvreModeAdmin` 22 · `retireAdmin` 31

### `modules/modeles.mjs` — 88 l. → plan, plan-admin

- l.1 · Les modèles d'habillage du plan

Fonctions :

`modeleRetenu` 46 · `habilleModale` 80

### `modules/mot-de-passe.mjs` — 210 l. → motdepasse

- l.1 · Poser un mot de passe

Fonctions :

`dit` 30 · `fragment` 36 · `garde` 43 · `lit` 47 · `demandeLien` 59 · `ouvreSaisie` 68
`brancheMotDePasse` 86

### `modules/motdepasse.mjs` — 15 l. → motdepasse

- l.1 · Point d'entrée de la page du mot de passe — et son démarrage

### `modules/nappe.mjs` — 83 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`poseNappe` 43 · `couleurNappe` 45 · `rafraichitApercu` 51

### `modules/noms-zones.mjs` — 36 l. → plan, plan-admin

- l.1 · Le nom d'une zone dans la langue de la page

Fonctions :

`nomDeLaZone` 27 · `nomsAnglaisDesZones` 29

### `modules/notifications.mjs` — 89 l. → plan, plan-admin

- l.1 · Les notifications — ce que l'appareil sait recevoir, et l'abonnement

Fonctions :

`poussePossible` 19 · `iOSsansInstallation` 24 · `adresseDuRappel` 30 · `heureVue` 54
`empreinteDebut` 55 · `octetsDeCle` 59 · `abonnementCourant` 67 · `abonne` 76

### `modules/nuancier.mjs` — 73 l. → plan-admin

- l.1 · La rafale du sélecteur de couleur — l'exploitant seul

Fonctions :

`presseNuanciers` 34 · `brancheNuancier` 40 · `suitNuancier` 57

### `modules/options.mjs` — 138 l. → plan, plan-admin

- l.1 · Les options du plan — ce que le salon a pris

Fonctions :

`appliqueOptions` 116 · `confieApresOption` 130

### `modules/ordonnanceur.mjs` — 865 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 83 · `peineDeCharge` 104 · `ecartDesJours` 190 · `poidsDesJours` 220
`chargeDuJour` 243 · `rangeSejour` 252 · `trancheDe` 802 · `dilatationPour` 857

### `modules/ordre-calques.mjs` — 126 l. → plan-admin

- l.1 · L'ordre des calques — la fenêtre de l'exploitant

Fonctions :

`deplaceVers` 27 · `versExtremite` 39 · `remplitOrdre` 47 · `ouvreOrdre` 117

### `modules/ordre-trace.mjs` — 78 l. → plan, plan-admin

- l.1 · Pile des calques — l'ordre de tracé

Fonctions :

`clePile` 22 · `entrees` 24 · `pile` 38 · `groupe` 50 · `ordonneDom` 58 · `remplit` 65
`confiePanneau` 70 · `construitPanneau` 76

### `modules/outil-dessin.mjs` — 1038 l. → plan-admin

- l.1 · 11. Calques de dessin — l'outil de l'exploitant

Fonctions :

`enregistreDessins` 65 · `instantane` 103 · `clotSalve` 114 · `memorise` 115
`restaure` 126 · `annule` 142 · `refais` 154 · `poseTrait` 159 · `toleranceTrace` 180
`aimanteContour` 185 · `rayonContour` 188 · `redresseTrace` 207 · `traceGuide` 241
`fermeIci` 248 · `ajouteForme` 253 · `poseChampImage` 270 · `remplitListeSocietes` 277
`societeSaisie` 285 · `calquePourImage` 301 · `lienImageSaisi` 329 · `formeImage` 341
`poseImage` 350 · `ditImagePosee` 373 · `importeImage` 381 · `dessinPointerDown` 410
`dessinPointerMove` 495 · `dessinPointerUp` 533 · `termineTrace` 574 · `aide` 586
`outilOffert` 616 · `choisitOutil` 630 · `enchaineStand` 661 · `optionsModes` 673
`proposeCouleurLigne` 683 · `montreTransport` 694 · `activeCalque` 703 · `cleVerrou` 761
`verrouille` 762 · `basculeVerrou` 764 · `pictoVerrou` 781 · `montreRoleIti` 815
`creeCalque` 828 · `demandeNom` 841 · `renommeCalque` 866 · `brancheOutilDessin` 882

### `modules/parcours-recu.mjs` — 128 l. → plan, plan-admin

- l.1 · Le parcours reçu

Fonctions :

`accueilleParcoursPartage` 48 · `adoptePartage` 126

### `modules/parcours.mjs` — 439 l. → plan, plan-admin

- l.1 · Le parcours de visite : la liste, son stockage, sa marque

Fonctions :

`_rafraichit` 24 · `_reprendRappels` 25 · `_synchroniseRappels` 26 · `poseParcours` 87
`brancheListeParcours` 105 · `cleParcours` 118 · `identifiantParcours` 155
`casierParcours` 163 · `dansParcours` 164 · `jourParcours` 167
`attenduDepuisTropLongtemps` 172 · `trieParcours` 183 · `chargeParcours` 193
`parcoursAEcrire` 227 · `enregistreParcours` 243 · `tientLeStockage` 272
`plurielParcours` 286 · `contenuParcours` 295 · `signetParcours` 306 · `boutonParcours` 312
`rafraichitMarque` 317 · `calqueMarques` 350 · `dessineMarques` 368 · `marqueParcours` 398
`instantConf` 416 · `cleTemps` 420 · `nomDeStand` 430 · `groupeParcours` 432

### `modules/partage.mjs` — 293 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`lienParcours` 50 · `ouvrePartageParcours` 66 · `boutonsPartage` 122 · `parcoursACopier` 209
`ouvreGardeParcours` 224 · `demandeGardeParcours` 254 · `poseGardeParcours` 267
`branchePartage` 291

### `modules/pile.mjs` — 549 l. → plan-admin

- l.1 · Le panneau des calques
- l.65 · Panneau : deux sections, chacune rangée par nom
- l.360 · Repères
- l.412 · Fond du plan

Fonctions :

`secteurs` 53 · `joli` 56 · `nature` 83 · `boutonAjout` 90 · `boutonVerrou` 110
`intertitre` 118 · `remplitPanneau` 128 · `sectionSelection` 376 · `sectionFond` 432
`ligneCouleur` 490 · `rangSecteur` 510 · `rangSous` 523 · `defautCouleur` 545

### `modules/placement-libelles.mjs` — 190 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`confieAuPlacementLibelles` 47 · `libelleGlisse` 53 · `lacheLibelle` 56 · `posePlacement` 65
`libelleAutomatique` 82 · `modePlacementLibelles` 91 · `majPaletteLibelle` 110
`choisitLibelle` 127 · `pousseLibelle` 134 · `libellePointerDown` 142
`libellePointerMove` 158 · `libellePointerUp` 167 · `branchePlacementLibelles` 180

### `modules/plan-admin.mjs` — 69 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

Fonctions :

`lieux` 42

### `modules/plan.mjs` — 54 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

### `modules/points-interet.mjs` — 417 l. → plan, plan-admin

- l.1 · Les points d'intérêt — le cartouche, la recherche, la fiche d'un repère

Fonctions :

`oublieReperes` 59 · `reperesCherchables` 61 · `vaAuRepere` 105 · `clePoi` 148
`cartouchePoi` 150 · `ouvrePoi` 269 · `mesureCartouche` 342 · `pharePoi` 358
`phareRepere` 362 · `phareZone` 364 · `eclairePoi` 370 · `oublieChoixPoi` 403

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `modules/polices-plan.mjs` — 328 l. → plan, plan-admin

- l.1 · La police des noms sur le plan — celle du modèle, ou une autre de la liste

Fonctions :

`confieAuxPolices` 43 · `policeChoisie` 209 · `policeDuModele` 214 · `feuillePolice` 224
`chargePolice` 246 · `policePrete` 266 · `policeDesNoms` 284 · `posePoliceLibelles` 313

### `modules/provenance.mjs` — 161 l. → console

- l.1 · Provenance des données d'un salon — domaines, fournisseurs, réglage
- l.19 · Provenance des données

Fonctions :

`fournisseurUtilise` 83 · `sourceNom` 93 · `source` 97 · `ligneSource` 101
`resumeProvenance` 124 · `ouvreProvenance` 145

### `modules/qr.mjs` — 315 l. → plan, plan-admin

- l.1 · Le code QR, sans bibliothèque

Fonctions :

`qrMotsBruts` 36 · `qrMotsUtiles` 45 · `qrMul` 56 · `qrGenerateur` 59 · `qrReste` 70
`qrAlignements` 81 · `qrTrame` 97 · `qrChemin` 286 · `qrSvg` 308

### `modules/rappels.mjs` — 546 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`confieAuxRappels` 77 · `tuto` 78 · `reglageRappel` 97 · `rappelsVoulus` 98
`minutesRappel` 99 · `cleRappels` 113 · `chargeRappels` 116 · `retientRappels` 120
`rappelsOfferts` 131 · `instantAbsolu` 161 · `confsARappeler` 169 · `rappelsDuParcours` 186
`synchroniseRappels` 224 · `eteintRappels` 247 · `allumeRappels` 262 · `aideRappel` 279
`poseRappels` 295 · `cleInviteRappel` 416 · `inviteRappelFaite` 419
`retientInviteRappel` 424 · `fenetreRappel` 459 · `proposeRappels` 492
`reprendRappels` 535

### `modules/rapport-utilisation.mjs` — 504 l. → rapport

- l.1 · Rapport d'utilisation

Fonctions :

`courant` 70 · `chargeEvenements` 75 · `joursPeriode` 93 · `chargeRapport` 95
`erreurs` 108 · `chiffre` 131 · `barres` 150 · `portes` 190 · `jours` 241
`dessineRapport` 262 · `dessineBarre` 427 · `rafraichit` 450 · `videEcran` 469
`demarre` 475 · `brancheRapport` 494

Éléments :

`#lienPublic`

### `modules/rapport.mjs` — 33 l. → rapport

- l.1 · Point d'entrée du rapport — et son démarrage

### `modules/recherche.mjs` — 1195 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`confieALaRecherche` 76 · `ferme` 77 · `ficheConf` 80 · `adresseVignette` 81
`poseToutAuParcours` 82 · `dessineDists` 83 · `libelles` 84 · `marquesListe` 85
`porteDist` 86 · `standPorte` 87 · `reperesCherchables` 88 · `vaAuRepere` 89
`appliqueSecteurs` 99 · `filtreTheme` 116 · `themeFiltrable` 199 · `ordreCriteres` 215
`clesCriteres` 238 · `libelleCritere` 245 · `valeursCritere` 264 · `texteCriteres` 277
`texteAnglaisPerso` 293 · `indexeCriteres` 307 · `refaitCriteres` 341 · `dansCriteres` 348
`critereActif` 356 · `basculeCritere` 358 · `videCriteres` 367 · `majVideQ` 376
`videRecherche` 389 · `nCriteres` 404 · `majCriteres` 419 · `remplitCriteres` 486
`basculeCriteres` 625 · `ouvreCriteres` 630 · `fermeCriteres` 646 · `filtre` 663
`reposeRetrait` 683 · `critParSociete` 687 · `cherchable` 697 · `visible` 704
`releveHotes` 725 · `visibleSurPlan` 733 · `visibleSociete` 744 · `marqueRetrait` 760
`appliqueFiltre` 778 · `oublieRetrait` 794 · `reprendRecherche` 803 · `rangSorte` 816
`codeCase` 838 · `caseNumero` 855 · `sousLigne` 875 · `liste` 889 · `marqueChoisie` 1017
`prechargeMarque` 1043 · `prechargeLesVignettes` 1100 · `chargeUnLot` 1146
`brancheRecherche` 1172

### `modules/reglage-application.mjs` — 315 l. → plan-admin

- l.1 · L'application installée — son icône et son nom, le réglage de l'exploitant

Fonctions :

`nomAppDefaut` 68 · `ecritApplication` 83 · `blocApplication` 124

### `modules/reglage-fiche.mjs` — 648 l. → plan-admin

- l.1 · Le volet « Fiche Stand » des réglages — l'exploitant seul

Fonctions :

`clesFiche` 48 · `voletOrdre` 65

### `modules/reglage-installation.mjs` — 58 l. → plan-admin

- l.1 · La case de l'invitation à installer, dans l'onglet « Admin » des réglages

Fonctions :

`caseInstallation` 21

### `modules/reglage-rappel.mjs` — 159 l. → plan-admin

- l.1 · Le rappel avant une conférence, dans l'onglet « Admin » des réglages

Fonctions :

`blocRappel` 34 · `ditEssaiRappel` 145

### `modules/reglage-recherche.mjs` — 309 l. → plan-admin

- l.1 · L'onglet « Recherche » des réglages — l'exploitant seul

Fonctions :

`catalogueTenu` 25 · `voletRecherche` 94 · `blocOrdreCriteres` 155

### `modules/reglage-sponsor.mjs` — 223 l. → plan-admin

- l.1 · Le générique du démarrage, réglé par l'exploitant

Fonctions :

`glisseFenetre` 24 · `confieAuReglageSponsor` 28 · `blocSponsor` 66

### `modules/reglage-suggestion.mjs` — 428 l. → plan-admin

- l.1 · La suggestion — le volet de l'exploitant

Fonctions :

`confieAuReglageSuggestion` 39 · `glisseFenetre` 40 · `indexSugg` 57 · `valeursSugg` 82
`relevePalmares` 100 · `etiquetteSugg` 120 · `voletSuggestion` 130

### `modules/reglages.mjs` — 544 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`glisseFenetre` 96 · `ouvreReglages` 108 · `voletZones` 236 · `champsFicheZone` 338
`ficheZoneEnPlace` 408 · `voletPlan` 426 · `voletCoexposants` 465

### `modules/rendu.mjs` — 190 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`confieAuRendu` 62 · `monteHabillage` 67 · `baliseZone` 96 · `baliseStand` 106
`montePlan` 113 · `onglets` 145 · `changePlan` 167

### `modules/reperes.mjs` — 421 l. → plan, plan-admin

- l.1 · Les repères et les transports en commun — ce qu'ils sont

Fonctions :

`pictoDe` 130 · `nomTypeRepereFr` 186 · `nomTypeRepere` 188 · `typeZone` 218
`pictoForme` 225 · `estPorte` 245 · `ouvreEntrant` 246 · `ouvreSortant` 247 · `modeDit` 287
`lettreMode` 289 · `estTransport` 293 · `modeTransport` 296 · `glypheRepere` 308
`cleLigne` 345 · `ligneAffichee` 356 · `couleurLigne` 364 · `couleurRepere` 370
`encreRepere` 376 · `nomLigneFr` 390 · `libelleDoffice` 398 · `couleurEcrite` 405
`pastillePoi` 419

### `modules/reprise-emplacements.mjs` — 783 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`confieALaReprise` 76 · `pictoVerrou` 77 · `activeCalque` 78 · `remplitListeSocietes` 79
`societeSaisie` 80 · `fermeIci` 81 · `geoGlisse` 91 · `lacheGeo` 94 · `cleVerrouGeo` 114
`geoVerrouille` 115 · `basculeVerrouGeo` 117 · `boutonVerrouGeo` 132 · `modeGeometrie` 143
`objetGeoSous` 170 · `groupeGeo` 180 · `choisitGeo` 188 · `cadreGeo` 203 · `prisesGeo` 223
`curseurGeo` 235 · `dessinePoigneesGeo` 238 · `ecritDimensionsGeo` 266 · `nomSorteGeo` 278
`majPaletteGeo` 280 · `finGesteGeo` 319 · `enregistreGeo` 337 · `geometrieOrigine` 351
`retraceGeo` 366 · `pousseGeometrie` 377 · `appliqueDimensionGeo` 394
`enregistreAjout` 409 · `ajouteEmplacement` 424 · `renommeAjout` 452 · `lieAjout` 484
`ecritInfosAjout` 513 · `supprimeAjout` 540 · `choisitOutilGeo` 569 · `aideAjout` 576
`fermeAjout` 586 · `ajoutPointerDown` 595 · `ajoutPointerMove` 611 · `ajoutPointerUp` 633
`geometriePointerDown` 653 · `accrocheGeo` 684 · `geometriePointerMove` 686
`geometriePointerUp` 737 · `brancheRepriseEmplacements` 754

### `modules/salon.mjs` — 54 l. → plan, plan-admin

- l.1 · Le salon et la page : ce que l'adresse et la construction disent

Fonctions :

`cheminDuSalon` 33 · `cheminPartageable` 44

### `modules/secteurs.mjs` — 152 l. → plan, plan-admin

- l.1 · Les secteurs du salon, et la teinte de chacun sur le plan

Fonctions :

`coloreChaleur` 22 · `confieChaleur` 26 · `indexeSecteurs` 38 · `secteursMontres` 51
`couleurConf` 55 · `couleurSecteur` 64 · `pastilleSecteur` 78 · `coloreSecteurs` 91
`peintSecteur` 136

### `modules/sejour.mjs` — 579 l. → plan, plan-admin

- l.1 · La préparation du séjour — répartir les stands, puis dérouler les jours

Fonctions :

`brancheSejour` 35 · `minutesVisite` 37 · `horairesSalon` 38 · `seuilConcentration` 39
`seuilImpose` 40 · `oublieMatrice` 87 · `finInstant` 92 · `pointConf` 100
`matriceJournee` 119 · `derouleJournee` 190 · `prepareSejour` 334 · `calculeSejour` 536
`apercuRepartition` 570

### `modules/session.mjs` — 147 l. → plan-admin, console, rapport, motdepasse

- l.1 · La session de l'exploitant, et l'appel à la base

Fonctions :

`accesBase` 15 · `contenuJeton` 42 · `resteJeton` 52 · `echangeSession` 68 · `base` 92
`initialesDe` 142

### `modules/seuil.mjs` — 179 l. → plan, plan-admin

- l.1 · Le parcours intelligent — le seuil de concentration

Fonctions :

`seuilGere` 74 · `seuilImpose` 75 · `seuilParSurface` 76 · `regleSeuil` 81
`aireDuStand` 99 · `seuilConcentration` 135 · `phraseSeuil` 158

### `modules/socle-console.mjs` — 403 l. → console, rapport

- l.1 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`poseSession` 40 · `entetes` 63 · `renouvelle` 72 · `appel` 91 · `rest` 106
`ecranConfig` 125 · `ecranConnexion` 157 · `deconnecte` 223 · `signale` 238 · `bloc` 262
`grille` 280 · `idCompte` 297 · `themeSombre` 306 · `premierEcran` 324 · `brancheSocle` 339

### `modules/sponsor.mjs` — 398 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 112 · `secondesSponsor` 115 · `modeSponsor` 128 · `sponsorRetenu` 147
`cleSponsor` 178 · `sponsorEnCache` 181 · `retientSponsor` 196 · `ouvreSponsor` 221
`suitSponsor` 314 · `resteSponsor` 339 · `fermeSponsor` 345 · `accueilleSponsor` 361
`brancheSponsor` 393

### `modules/suggestion.mjs` — 334 l. → plan, plan-admin

- l.1 · La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`confieALaSuggestion` 57 · `remplitParcours` 58 · `brancheParcours` 59 · `reglageSugg` 88
`seuilSugg` 90 · `presentationsSugg` 114 · `presenteSugg` 120 · `critereSugg` 125
`suggestionCourante` 142 · `exposantPropose` 178 · `nomValeurSugg` 196
`phraseSuggestion` 217 · `carteSuggestion` 245 · `poseSuggestion` 294
`fenetreSuggestion` 308

### `modules/sur.mjs` — 190 l. → plan, plan-admin

- l.1 · Ce qui vient d'ailleurs, relu avant d'être affiché

Fonctions :

`lien` 22 · `adresseWeb` 30 · `adresseSure` 43 · `adresseImage` 70 · `imageSure` 83
`assainitRiche` 112 · `enBlocs` 160 · `rangeRiche` 173

### `modules/synchronisation.mjs` — 224 l. → console

- l.1 · Synchronisation d'un salon — lancement, suivi, vignettes des logos

Fonctions :

`brancheSynchronisation` 34 · `etapesPressenties` 52 · `synchronise` 67
`fabriqueLesVignettes` 164 · `envoieVignettes` 217

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

### `modules/texte-plan.mjs` — 111 l. → plan, plan-admin

- l.1 · Le texte sur le plan — sa mesure, sa coupe en lignes, sa place
- l.18 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.102 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`mesureTexte` 26 · `largeur` 31 · `remesureTextes` 56 · `decoupe` 71 · `habille` 84
`lignesSvg` 95 · `ancre` 110 · `place` 111

### `modules/texte.mjs` — 25 l. → plan, plan-admin, console, rapport

- l.1 · Le texte : l'écrire dans la page, le découper, le ranger

Fonctions :

`esc` 6 · `separeValeurs` 17

### `modules/tiroir-itineraire.mjs` — 849 l. → plan, plan-admin

- l.1 · Itinéraire — le tiroir, la visée et le tracé

Fonctions :

`confieAuTiroirItineraire` 66 · `changePlan` 67 · `ferme` 68 · `fermeParcours` 69
`calculeRoute` 87 · `poseTrace` 110 · `marchesIci` 112 · `rayonBout` 117
`arreteTracage` 150 · `peintItineraire` 156 · `lanceTracage` 207 · `dessineItineraire` 232
`rafraichitBouts` 254 · `cadreItineraire` 277 · `champIti` 301 · `fermeSugg` 305
`montreSugg` 312 · `choisitPoint` 346 · `valideSaisie` 355 · `effaceItineraire` 367
`relance` 395 · `montreResultat` 437 · `poseVisee` 581 · `confieVisee` 594
`suitLaVisee` 596 · `bandeauVisee` 598 · `armeVisee` 620 · `finVisee` 638
`viseItineraire` 654 · `visePoi` 660 · `visePoint` 666 · `ouvreItineraire` 694
`fermeItineraire` 722 · `versItineraire` 732 · `versItineraireDe` 735
`brancheTiroirItineraire` 763

### `modules/tiroir-parcours.mjs` — 470 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`basculeParcours` 52 · `verseAuParcours` 97 · `retenusPourParcours` 143
`ajouteToutAuParcours` 168 · `poseToutAuParcours` 191 · `brancheParcours` 215
`rafraichitParcours` 228 · `rangParcours` 258 · `remplitParcours` 278 · `ouvreParcours` 367
`fermeParcours` 379 · `videLeParcours` 390 · `brancheTiroirParcours` 420

### `modules/tiroirs.mjs` — 533 l. → plan, plan-admin

- l.1 · Les tiroirs des écrans étroits — la liste, et ceux que la hauteur mène
- l.40 · Ce que les tiroirs lisent d'un geste
- l.86 · Le tiroir de la liste — écrans étroits
- l.312 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`fermeCriteres` 28 · `confieAuxTiroirs` 36 · `traceurDeGeste` 64 · `cranVoisin` 83
`retraitBas` 109 · `mesureTiroir` 122 · `montreTiroir` 125 · `hisseTiroir` 129
`tiroirListe` 136 · `tiroirCrante` 339 · `brancheTiroirs` 519

### `modules/ton-barre.mjs` — 76 l. → plan, plan-admin

- l.1 · La couleur de la barre du système

Fonctions :

`poseTonDeLaBarre` 41 · `brancheTonDeLaBarre` 74

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

### `modules/tutoriel.mjs` — 1031 l. → plan, plan-admin

- l.1 · La visite guidée — le tour du plan, geste par geste

Fonctions :

`route` 71 · `attente` 72 · `iti` 73 · `visee` 74 · `eteintVisee` 75 · `journee` 77
`vueJournee` 78 · `sejour` 79 · `iciActif` 81 · `dessinEnCours` 84 · `glissements` 113
`reglageTuto` 124 · `tutoPropose` 133 · `cleTuto` 137 · `tutoOuvert` 139 · `tutoModale` 140
`tutoFicheOuverte` 146 · `tutoFiche` 149 · `tutoParcours` 151 · `tutoItineraire` 155
`tutoJournee` 159 · `zoneDuTuto` 167 · `insecable` 184 · `phraseTrajetTuto` 190
`chapitresTuto` 450 · `proposeTutoriel` 470 · `lanceTutoriel` 528 · `quitteTutoriel` 615
`chapitreTuto` 626 · `battementTuto` 635 · `finTuto` 653 · `afficheTuto` 670
`attendsTiroirs` 720 · `pxTuto` 745 · `boiteTuto` 758 · `repereTuto` 773 · `rameneTuto` 806
`placeTuto` 844 · `voileTuto` 938 · `rafaleTuto` 955 · `marqueZoneTuto` 975
`marqueLibelleTuto` 1014

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `modules/volets.mjs` — 1227 l. → plan-admin

- l.1 · Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —

Fonctions :

`secteurs` 55 · `voletAdmin` 66 · `blocOptions` 231 · `blocLangues` 278 · `blocBarre` 352
`blocHoraires` 410 · `voletParcours` 552 · `sallesSituees` 687 · `voletPmr` 703
`nomDuTon` 794 · `svgVignette` 803 · `barreVignette` 805 · `vignetteDistPlan` 809
`vignetteDistListe` 822 · `vignetteDistFiche` 836 · `salonDitSes` 856 · `coinPris` 863
`voletDist` 886 · `voletApparence` 1051

### `modules/vous-etes-ici.mjs` — 93 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le départ imposé, et son point sur le plan

Fonctions :

`pointBorne` 27 · `poseLieuBorne` 32 · `ecritDepartBorne` 42 · `rayonBorne` 52
`dessineBorne` 57 · `rafraichitBorne` 73 · `rempliBorne` 78

### `modules/vue.mjs` — 602 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.86 · 6. Vue

Fonctions :

`confieALaVue` 64 · `vue` 70 · `changeVue` 72 · `enEdition` 73 · `libelles` 74
`poseEmprise` 84 · `cadrePlan` 103 · `oublieCadre` 104 · `figeTextes` 118 · `rendTextes` 126
`cadrage` 165 · `peintLibelles` 170 · `repeintLibelles` 178 · `detacheLibelles` 182
`rattacheLibelles` 194 · `etireLibelles` 212 · `appliqueVue` 220 · `libellesDeLaVue` 286
`rafraichitVue` 294 · `poseVue` 308 · `mesureBarre` 337 · `masqueHaut` 365 · `masque` 372
`masqueDroite` 409 · `fit` 420 · `stoppeZoom` 458 · `glisseVersVise` 464 · `glisseVers` 507
`rectVisee` 529 · `zoom` 549 · `echelle` 563 · `versPlan` 575 · `brancheVue` 586

### `modules/webgl.mjs` — 1360 l. → plan, plan-admin

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`confieAuWebgl` 65 · `chargeWebgl` 98 · `brancheWebgl` 123 · `monteWebgl` 130
`poseToileWebgl` 231 · `guetteContexteWebgl` 237 · `contextePerduWebgl` 247
`verifieContexteWebgl` 254 · `perdContexteWebgl` 263 · `remonteWebgl` 284 · `vueDeck` 301
`vueWebgl` 310 · `blocDe` 319 · `majEditionWebgl` 332 · `cleBloc` 344 · `planifieWebgl` 370
`toutRepeindreWebgl` 374 · `blocsDansLOrdre` 381 · `repeintWebgl` 386 · `assembleWebgl` 410
`constTexte` 444 · `jeuDeCaracteres` 640 · `sousPixelOffert` 694 · `couchesPetites` 699
`couchesTexte` 709 · `accVide` 744 · `convertitBloc` 745 · `accDe` 761 · `parcoursGl` 768
`formeGl` 804 · `texteGl` 840 · `imageGl` 863 · `partage` 895 · `designeGl` 901
`couchesDeBloc` 903 · `modelesLibellesHtml` 983 · `poseModelesLibelles` 993
`lisModelesLibelles` 999 · `groupesNoms` 1032 · `couchesNoms` 1049 · `couchesPastilles` 1060
`couchesLibellesWebgl` 1075 · `couchesDessineesWebgl` 1082 · `stage` 1103
`brancheSurvolWebgl` 1107 · `poseSurvolWebgl` 1127 · `poseCurseurWebgl` 1136
`poseFocusWebgl` 1145 · `aplatsDe` 1152 · `coucheSurvol` 1155 · `coucheFocus` 1164
`couchesPhare` 1191 · `lueurDe` 1207 · `opacitePhare` 1245 · `echellePhare` 1246
`couchesPhareNoms` 1249 · `palierDefile` 1274 · `phaseComete` 1276 · `animeCouche` 1279
`majAnimationWebgl` 1296 · `animeWebgl` 1304 · `objetSous` 1327 · `cibleWebgl` 1334
`priseWebgl` 1341 · `libelleSousWebgl` 1346 · `rectEcranWebgl` 1351

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
- `20261010121534_les_erreurs_des_pages_du_plan.sql` — erreur_page, fn erreur_publique, fn erreurs_du_salon, fn purge_erreurs

## Le reste

- `src/index.mjs` — 1049 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `dit` 106 · `amontPour` 115 · `cleDe` 123 · `cleDeLot` 129 · `condense` 136 `cleVersion` 160 · `rangeLaVersion` 163 · `ditVersion` 171 · `meta` 180 · `gardable` 196 `range` 202 · `rafraichit` 209 · `entete` 244 · `oublie` 286 · `rappels` 372 · `cleApp` 417 `cheminDuSalon` 448 · `pageDuSalon` 465 · `appDuSalon` 489 · `iconesDuSalon` 535 `manifeste` 575 · `iconeApp` 664 · `mesure` 708 · `carteDuScript` 796 · `lieuDe` 809 `erreur` 823 · `planDeVisite` 863 · `chargePrevue` 901
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
