<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_config.js` — 19 l. → config.js, plan-admin.html, plan.html

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

### `_console.css` — 738 l. → console.css

- l.670 · Page de rapport

### `_entete.html` — 6 l.

### `_head.html` — 640 l. → plan-admin.html, plan-smcl.html, plan.html

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
`#poi` · `#poiDefile` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#routeRappel`
`#routeVoir` · `#routeResume` · `#routeEfface` · `#calageBat` · `#calageAngle`
`#calageQuart` · `#calageStop` · `#calageValide` · `#iciRappel` · `#iciRappelTxt`
`#iciStop` · `#bornePose` · `#bornePoser` · `#calage` · `#calageFerme` · `#calageCorps`
`#calageCarte` · `#calageEtat` · `#calageGarde` · `#outils` · `#outilsCalque`
`#renommeOutils` · `#replieOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
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

### `_index.html` — 17 l. → index.html

Éléments :

`#secours`

### `_js.html` — 6 l.

Éléments :

`#data`

### `_langue.js` — 864 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-smcl.html, rapport.html

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

### `_styles-jetons.css` — 293 l. → plan-smcl.html

### `_styles-modeles-parcours.css` — 1623 l. → plan-smcl.html

### `_styles-modeles.css` — 830 l. → plan-smcl.html

### `_styles-parcours.css` — 665 l. → plan-smcl.html

### `_styles-plan.css` — 1693 l. → plan-smcl.html

### `_styles-vitrine.css` — 187 l. → plan-smcl.html

### `_sw.js` — 568 l.

Fonctions :

`estUneTuile` 122 · `range` 148 · `oublieLesVersionsDAvant` 174 · `dabordCache` 195
`borneLesLots` 231 · `borneLesTuiles` 269 · `demandeTiers` 324 · `commePosee` 332
`tuileDeCarte` 349 · `fondDeCarte` 385 · `dabordReseau` 412 · `navigation` 429

### `modules/acces-admin.mjs` — 244 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`litLocal` 34 · `configuration` 39 · `normaliseUrlA` 43 · `sessionValide` 59
`ecranAcces` 77 · `contenuDuJeton` 166 · `mailDuJeton` 167 · `litProfilA` 178
`poseCompte` 193 · `brancheAcces` 218

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

Importe :

annonce · demarrage · dom · session

Importé par :

bande-admin · enregistrement · plan-admin · reglages

### `modules/accueil.mjs` — 11 l. → accueil

- l.1 · Point d'entrée de la page d'accueil — la racine

Importe :

aiguillage

### `modules/affichage.mjs` — 54 l. → plan, plan-admin

- l.1 · Le plan est affiché — ce qui attendait peut venir

Fonctions :

`estAffiche` 28 · `quandAffiche` 31 · `apresAffichage` 36 · `planAffiche` 41

Importé par :

demarrage · environs · releve · webgl

### `modules/affiche-ici.mjs` — 397 l. → plan-admin

- l.1 · « Vous êtes ici » — l'affiche à coller, côté exploitant

Fonctions :

`visee` 35 · `vise` 36 · `prefixePlan` 57 · `coteIci` 69 · `nomCodeIci` 85 · `codeIci` 104
`lienIci` 122 · `pointTouche` 149 · `codeIciAuPoint` 161 · `armeCodeIci` 167
`afficheIci` 189 · `ligneAffiche` 229 · `nomFichierIci` 238 · `ouvreCodeIci` 253
`boutonsCodeIci` 305 · `telechargeAfficheIci` 330 · `imprimeAfficheIci` 348
`boutonCodeIci` 377

Importe :

borne · dom · donnees · fenetre · fiche · forme-choisie · ici · itineraire · qr · salon
texte · texte-plan · tiroir-itineraire · tiroir-parcours · vue

Importé par :

bande-admin · gestes-admin · plan-admin

### `modules/aiguillage.mjs` — 38 l. → accueil

- l.1 · L'aiguillage de la racine — où mène l'adresse nue

Fonctions :

`brancheAiguillage` 21

Importé par :

accueil

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

Importe :

dom · donnees · itineraire

Importé par :

edition · enregistrement · gestes-admin · outil-dessin · reprise-emplacements

### `modules/ambiance.mjs` — 216 l. → plan, plan-admin

- l.1 · L'ambiance du plan — Classique, Tuiles, Immersif

Fonctions :

`figurantsRetenus` 61 · `nomsAPlatRetenus` 68 · `logosRetenus` 74 · `capRetenu` 79
`ambianceRetenue` 86 · `anneaux` 92 · `f3` 104 · `rayonTuile` 131 · `retire` 136
`arrondi` 151 · `traceStand` 177 · `tuilesPosees` 182 · `appliqueAmbiance` 184

Importe :

camera · configuration · donnees · figurants · logos-stands · salon

Importé par :

apparence · dessin · distinctions · rendu · volets

### `modules/annonce.mjs` — 45 l. → plan, plan-admin

- l.1 · Une annonce — dire ce qui vient de se passer, sans savoir qui écoute

Fonctions :

`creeAnnonce` 37

Importé par :

acces-admin · calques-dessin · camera · configuration · demarrage · fenetre · fiche-zone
index-salon · logos-stands · ordre-trace · rendu · trace-itineraire · vignettes · webgl

### `modules/apercus.mjs` — 327 l. → plan-admin

- l.1 · Les aperçus de la fenêtre des réglages — l'exploitant seul

Fonctions :

`texteCorps` 85 · `clesPortees` 110 · `standApercu` 130 · `lignesApercu` 154
`contenuApercu` 184 · `apercuFiche` 221 · `apercuListe` 299 · `apercuDuo` 321

Importe :

corps-fiche · donnees · recherche · texte

Importé par :

reglage-fiche · volets

### `modules/apparence.mjs` — 182 l. → plan, plan-admin

- l.1 · L'apparence des calques, et les commandes posées sur le plan

Fonctions :

`styleFond` 28 · `sousCalques` 49 · `styleDataGroupe` 56 · `appliqueCouleursData` 65
`styleData` 97 · `appliqueApparence` 103 · `appliqueCommandes` 171

Importe :

ambiance · configuration · couleurs · distinctions · dom · donnees · habillage · options
parcours · recherche · tiroirs-exclusifs

Importé par :

enregistrement · pile · rendu · volets

### `modules/appel-fonction.mjs` — 120 l. → console

- l.1 · L'appel des fonctions du projet, depuis la console

Fonctions :

`refus` 26 · `fonction` 37 · `fluxFonction` 59

Importe :

socle-console

Importé par :

comptes · synchronisation

### `modules/appels.mjs` — 198 l. → plan, plan-admin

- l.1 · Les noms en appel — ce qui ne tient pas dans son stand sort dans la marge

Fonctions :

`monteCalque` 61 · `appeles` 72 · `illisible` 85 · `chevauche` 91 · `boiteA` 95
`auBord` 103 · `pose` 105 · `planifie` 180

Importe :

donnees · filtre · geste-tenu · polices-plan · texte-plan · vue

Importé par :

plan

### `modules/application.mjs` — 37 l. → plan, plan-admin

- l.1 · L'application installée — ce que le plan public en sait

Fonctions :

`adresseIconeApp` 26 · `appDuSalon` 34 · `iconeDeLApplication` 37

Importe :

donnees · salon

Importé par :

installation · reglage-application

### `modules/avancement.mjs` — 416 l. → console

- l.1 · L'avancement d'une synchronisation — la fenêtre, et son secours

Fonctions :

`fenetreAvancement` 44 · `suitAuServeur` 376

Importe :

fenetre-console · socle-console

Importé par :

synchronisation

### `modules/bande-admin.mjs` — 113 l. → plan-admin

- l.1 · 10. Mode administration — son ouverture, et la bande de l'outil

Fonctions :

`activeAdmin` 31

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

Importe :

acces-admin · affiche-ici · dessin · dom · enregistrement · mode-admin · ordre-trace
reglages · rendu · ton-barre

Importé par :

plan-admin

### `modules/bandes.mjs` — 66 l. → plan, plan-admin

- l.1 · Les bandes qui défilent — fondu du bord, flèche qui avance

Fonctions :

`BANDES` 27 · `majFondus` 35 · `brancheBandes` 49

Importé par :

cartouche-poi · lancement · recherche · rendu

### `modules/batiments.mjs` — 597 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 65 · `bibliothequeDispo` 66 · `refBatiment` 83 · `refForme` 87
`marqueBatiment` 90 · `batimentsPoses` 93 · `estBatiment` 100 · `hallsPoses` 103
`lieuDuCalque` 109 · `poseCalage` 115 · `ouvreBibliotheque` 124 · `vueDuLieu` 220
`lanceCalage` 262 · `effaceLeTempsDuCalage` 290 · `cadreCalage` 309 · `finCalage` 322
`pivoteCalage` 333 · `degresCalage` 349 · `dessineCalage` 354 · `calagePointerDown` 377
`calagePointerMove` 390 · `calagePointerUp` 406 · `reposeBatiment` 419
`ajouteBatiments` 435 · `brancheBatiments` 488 · `boutonRecale` 530 · `pictoRecale` 539
`calageRelu` 556 · `rouvreCalage` 582

Importe :

calques-dessin · configuration · dessin · dom · donnees · fenetre · geste-tenu · mode-admin
ordre-trace · outil-dessin · vue · webgl

Importé par :

gestes-admin · pile · plan-admin

### `modules/borne.mjs` — 351 l. → plan, plan-admin

- l.1 · La borne interactive — un plan qui sait où il est

Fonctions :

`borneRetenue` 89 · `retientBorne` 95 · `oublieBorne` 98 · `lieuBorne` 117 · `lieuNomme` 136
`pointLibre` 141 · `poseDepartImpose` 154 · `poseLaBorne` 165 · `remetLeDepart` 184
`poseBorneIci` 198 · `armeLaPose` 207 · `montreBandeauBorne` 223 · `relanceRepos` 245
`reposeLaBorne` 252 · `demarreBorne` 288 · `brancheBorne` 331

Importe :

dom · donnees · fenetre · fiche · forme-choisie · itineraire · mesure · recherche · rendu
salon · sponsor · tiroir-itineraire · tiroir-parcours · vous-etes-ici · vue

Importé par :

affiche-ici · demarrage · gestes · ici · lancement

### `modules/calage-carte.mjs` — 823 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 66 · `centrePavillon` 81 · `basculeMasqueCarte` 86
`boutonMasqueCarte` 97 · `pictoMasque` 108 · `carreDeTerrain` 135 · `chercheBatiments` 151
`empriseDesObjets` 179 · `batimentsCandidats` 197 · `caleSurBatiment` 218
`retientLeHall` 244 · `manqueCalage` 266 · `enregistreCalage` 275 · `calageEnregistre` 292
`oublieCalageEnCours` 313 · `litCoordonnees` 325 · `rafraichitCarte` 339 · `armeCalage` 378
`pivotCalage` 389 · `glisseCarte` 393 · `cartePointerDown` 400 · `cartePointerMove` 414
`cartePointerUp` 433 · `ditCalage` 441 · `majCalage` 450 · `appliqueCalage` 472
`tourneCalage` 479 · `construitCalage` 485 · `ouvreCalage` 650 · `fermeCalage` 660
`brancheCalageCarte` 672 · `voletEnvirons` 694

Importe :

configuration · dom · donnees · enregistrement · environs · fenetre · geste-tenu · gestes
itineraire · mode-admin · ordre-trace · rendu · session · terre · vue

Importé par :

gestes-admin · pile · plan-admin · reglages

### `modules/calques-dessin.mjs` — 209 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — ce que le poste en garde

Fonctions :

`enAttente` 63 · `litRange` 90 · `ouvreDessins` 102 · `reprendCommun` 127
`notePubliees` 153 · `rangeDessins` 171 · `dejaPubliee` 176 · `marqueAttente` 182
`mesCalques` 190 · `poseCalqueActif` 201 · `poseOutil` 202 · `poseEbauche` 206
`trouveCalque` 208 · `nouvelId` 209

Importe :

annonce · configuration · donnees · geste-tenu

Importé par :

batiments · cartouche-poi · dessin · edition · edition-en-cours · enregistrement · environs
forme-choisie · gestes-admin · index-salon · libelles · ordre-trace · outil-dessin · pile
rendu · reprise-emplacements · socle-dessin · tiroir-itineraire · tutoriel

### `modules/camera.mjs` — 223 l. → plan, plan-admin

- l.1 · La caméra du plan immersif — le hall vu de biais

Fonctions :

`demandeCamera` 55 · `cameraVoulue` 62 · `capCamera` 64 · `cleCamera` 66 · `poseTrajet` 97
`boutsDuTrajet` 102 · `metsEnJeu` 107 · `cameraEnJeu` 113 · `grandeurs` 116
`platVersEcran` 126 · `ecranVersPlat` 144 · `solIncline` 168 · `matricesCamera` 206

Importe :

annonce

Importé par :

ambiance · environs · logos-stands · outil-comptoir · outil-escalier · trace-itineraire
vue · vue-etat · webgl

### `modules/cartouche-poi.mjs` — 294 l. → plan, plan-admin

- l.1 · Les points d'intérêt sur le plan — le cartouche, la mise en avant, le

Fonctions :

`oublieReperes` 45 · `reperesCherchables` 47 · `clePoi` 113 · `cartouchePoi` 115
`mesureCartouche` 228 · `pharePoi` 244 · `phareRepere` 248 · `phareZone` 250
`eclairePoi` 256 · `oublieChoixPoi` 289

Importe :

bandes · calques-dessin · configuration · dom · donnees · forme-choisie · itineraire
reperes · vue

Importé par :

dessin · enregistrement · fiche-zone · index-salon · libelles · points-interet · recherche
reglage-recherche

### `modules/chaleur.mjs` — 762 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.536 · Remise à zéro des compteurs

Fonctions :

`nbChal` 58 · `tonChaleur` 77 · `niveauChaleur` 99 · `valeurChaleur` 102
`chargeChaleur` 115 · `coloreChaleur` 161 · `dessineHalos` 222 · `cartoucheChaleur` 262
`mesureCartoucheChaleur` 339 · `replieChaleur` 345 · `ecritEtatChaleur` 356
`dessineEchelleChaleur` 364 · `dessineTopChaleur` 384 · `phraseChaleur` 426
`rafraichitChaleur` 451 · `montreChaleur` 485 · `rangChaleur` 518 · `aplati` 558
`voletMesure` 567 · `evenementCourant` 593 · `ouvreRemiseAZero` 613 · `lanceRemiseAZero` 707
`brancheChaleur` 752

Éléments :

`#chalReduit` · `#chalPer` · `#chalRendu` · `#chalEch` · `#chalEtat` · `#chalTop`

Importe :

dom · donnees · fenetre · fiche · mode-admin · secteurs · session · vue

Importé par :

pile · plan-admin · reglage-suggestion · reglages

### `modules/charge-annoncee.mjs` — 228 l. → plan, plan-admin

- l.1 · La charge annoncée — ce que les autres journées ont déjà posé

Fonctions :

`seuilConcentration` 24 · `identifiantParcours` 26 · `parcours` 28 · `sejour` 30
`brancheCharge` 39 · `chargeSuivie` 79 · `etapesDuSejour` 85 · `annoncePlan` 113
`celluleUtile` 149 · `dilatationDuJour` 166 · `litLaCharge` 203 · `chargeCellule` 223

Importe :

donnees · mesure · ordonnanceur · salon · temps

Importé par :

journee · sejour

### `modules/chemin-forme.mjs` — 124 l. → plan, plan-admin

- l.1 · Le tracé d'une forme dessinée

Fonctions :

`cheminArrondi` 26 · `estCadre` 69 · `cheminForme` 71 · `facteurTrait` 105 · `pxTrait` 111
`styleTrait` 116

Importé par :

dessin · edition · environs · itineraire · outil-dessin · reprise-emplacements · vue · webgl

### `modules/classeur.mjs` — 235 l. → console, rapport

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 30 · `crc32` 40 · `archiveZip` 55 · `texteXml` 111 · `colonneXl` 114
`XL_PARTS` 125 · `feuilleXl` 179 · `classeurXl` 215 · `enregistreFichier` 226

Importe :

texte

Importé par :

export

### `modules/comptes.mjs` — 354 l. → console

- l.1 · Comptes et accès — l'annuaire, et la fiche d'une personne

Fonctions :

`poseComptes` 35 · `litMonProfil` 49 · `RETOUR_MDP` 60 · `litComptes` 62 · `ligneMessage` 71
`casesSalons` 81 · `ouvreComptes` 111 · `ouvreFicheCompte` 203

Importe :

appel-fonction · dom · evenements · fenetre-console · socle-console

Importé par :

ecran-console · fiche-evenement

### `modules/configuration.mjs` — 139 l. → plan, plan-admin

- l.1 · La configuration du plan — ce que l'exploitant a réglé

Fonctions :

`salonRange` 30 · `cleConf` 32 · `ouvreConf` 36 · `reglagesDuSalon` 57 · `enregistreConf` 90
`conf` 96 · `jeton` 97 · `sousCle` 99 · `optionActive` 105 · `programmeOffert` 110
`suggestionOfferte` 111 · `langueOfferte` 131 · `appliqueLangue` 133 · `chercheSorte` 138

Importe :

annonce · donnees · salon

Importé par :

ambiance · apparence · batiments · calage-carte · calques-dessin · cartouche-poi · dessin
distinctions · emplacements · enregistrement · environs · fiche-zone · filtre · habillage
horaires · index-salon · installation · libelle-place · modeles · nappe · nom-emplacement
options · ordre-calques · ordre-trace · outil-comptoir · outil-dessin · parcours-recu
partage · pile · pile · placement-libelles · polices-plan · rappels · recherche
reglage-comptoir · reglage-installation · reglage-rappel · reglage-recherche
reglage-sponsor · reglage-suggestion · reglages · rendu · reprise-emplacements · secteurs
seuil · sponsor · suggestion · tiroir-itineraire · tout-au-parcours · tutoriel · volets

### `modules/console.mjs` — 42 l. → console

- l.1 · Point d'entrée de la console — et son démarrage

Importe :

ecran-console · evenements · export · socle-console

### `modules/corps-fiche.mjs` — 271 l. → plan, plan-admin

- l.1 · Le corps de la fiche — ce qu'elle montre, dans quel ordre, sous quels

Fonctions :

`libelleCritere` 34 · `montre` 58 · `libelleCorps` 90 · `ordreCorps` 107
`groupesFiche` 139 · `montreIntitule` 152 · `valeurCorps` 172 · `champCorps` 185
`groupeCorps` 197 · `corpsRange` 210 · `pictoRS` 261

Importe :

donnees · sur · texte

Importé par :

apercus · distinctions · fiche · filtre · recherche · reglage-fiche · reglage-recherche
reglages · secteurs · tutoriel · volets

### `modules/correspondance.mjs` — 122 l. → console

- l.1 · Correspondance des champs d'origine — le vocabulaire du réglage

Fonctions :

`encode` 27 · `decode` 29 · `correspondance` 34 · `sansPrefixe` 37 · `courte` 38
`intitule` 53 · `intituleSuite` 65 · `aplani` 87 · `memeStyle` 97 · `autreFace` 115

Importé par :

fiche-detail

### `modules/couleurs.mjs` — 117 l. → plan, plan-admin

- l.1 · Les couleurs : d'une notation à l'autre, et ce que l'œil en perçoit

Fonctions :

`hslHex` 7 · `rgbHex` 19 · `hexa` 27 · `luminance` 31 · `trio` 37 · `melange` 47
`ecarte` 61 · `avive` 83 · `eclate` 98 · `teinte` 104 · `rvb` 112

Importé par :

apparence · distinctions · habillage · parcours · pile · reperes · secteurs · webgl

### `modules/decor.mjs` — 417 l. → plan, plan-admin

- l.1 · Le décor de la vue immersive — le mobilier des zones de l'organisateur

Fonctions :

`dedans` 42 · `repere` 55 · `reglageComptoirValide` 77 · `comptoir` 100
`comptoirTient` 126 · `rapprocheComptoir` 147 · `poigneeComptoir` 183 · `meuble` 196
`objetRepere` 344 · `tourneur` 361 · `etendueObjet` 367 · `rayonPoigneeObjet` 371
`poigneeObjet` 388 · `objetDroit` 393

Importé par :

edition · outil-comptoir · outil-escalier · reglage-comptoir · rendu · webgl

### `modules/demarrage.mjs` — 300 l. → plan, plan-admin

- l.1 · 12. Démarrage — l'appel du plan, sa version, la panne réseau

Fonctions :

`recadreListePosee` 66 · `demarre` 82 · `annonce` 146 · `panneDuChargement` 181
`CLE_VERSION` 191 · `versionRetenue` 192 · `retientVersion` 195 · `demandePlan` 221
`charge` 245 · `brancheDemarrage` 282

Importe :

affichage · annonce · borne · dom · donnees · fiche · ici · index-salon · installation
mode-admin · parcours-recu · recherche · rendu · salon · sponsor · tutoriel · vignettes
vue

Importé par :

acces-admin · enregistrement · fiche-zone · lancement · releve

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

Importé par :

fiche-zone · icone-app

### `modules/dessin.mjs` — 682 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — le tracé sur le plan

Fonctions :

`mentionOsm` 53 · `longueurFleche` 76 · `cheminFleche` 91 · `marqueFleche` 120
`rafraichitFleches` 131 · `traceForme` 146 · `rotationTexte` 165 · `dessineDessins` 170
`redessineForme` 211 · `peintCalque` 235 · `apercu` 242 · `apercuGuide` 254
`traceRepere` 277 · `nomSurLePlan` 417 · `etiquetteSociete` 428 · `seRattache` 456
`societeDeForme` 468 · `societesDuPlan` 480 · `traceImage` 514 · `traceStandDessine` 539
`cheminStandDessine` 561 · `texteStandDessine` 583 · `poseLibellesDessines` 602
`decoupeStand` 623 · `marqueStandsDessines` 638 · `rafraichitStandsDessines` 653
`signale` 667

Importe :

ambiance · calques-dessin · cartouche-poi · chemin-forme · configuration · dom · donnees
ecran · environs · filtre · forme-choisie · itineraire · mode-admin · nom-emplacement
ordre-trace · polices-plan · reperes · secteurs · texte · texte-plan · vue

Importé par :

bande-admin · batiments · edition · emplacements · enregistrement · fiche · gestes
libelles · outil-dessin · outil-escalier · pile · recherche · rendu · reprise-emplacements
socle-dessin

### `modules/detourage-travail.mjs` — 42 l.

- l.1 · Le détourage, hors de la page — le script du travailleur

Importe :

detourage

### `modules/detourage.mjs` — 157 l. → plan, plan-admin, console

- l.1 · Le détourage d'un logo — son fond blanc retiré, pixel par pixel

Fonctions :

`detoure` 34 · `creux` 117

Importé par :

detourage-travail · logos-stands · marque

### `modules/distinctions.mjs` — 450 l. → plan, plan-admin

- l.1 · Les distinctions d'un exposant — nouveau venu, adhérent d'un syndicat

Fonctions :

`texteDist` 53 · `texteCourtDist` 58 · `porteDist` 62 · `standPorte` 66 · `calqueDists` 78
`traceDist` 109 · `coinDuTrace` 166 · `coinDeBoite` 207 · `oublieDists` 218
`modesDuPlan` 222 · `releveDists` 226 · `dessineDists` 255 · `marquesListe` 284
`poseDistsFiche` 314 · `refaitDistsFiche` 354 · `modeDist` 400 · `couleurDist` 412
`appliqueDists` 434

Importe :

ambiance · configuration · corps-fiche · couleurs · dom · donnees · texte

Importé par :

apparence · fiche · points-interet · recherche · reglages · rendu · reprise-emplacements
volets

### `modules/dom.mjs` — 10 l. → plan, plan-admin, console, rapport, motdepasse

- l.1 · Le document : ce que tout le code demande à la page

Fonctions :

`$` 10

Importé par :

acces-admin · affiche-ici · aimants · apparence · bande-admin · batiments · borne
calage-carte · cartouche-poi · chaleur · comptes · demarrage · dessin · distinctions
ecran-console · edition · enregistrement · environs · fenetre · fenetre-console · fiche
fiche-evenement · fiche-zone · gestes · gestes-admin · glisse-fenetre · habillage · ici
index-salon · installation · journee · libelles · ligne-liste · logos-stands · mesure
mode-admin · modeles · mot-de-passe · nappe · ordre-calques · ordre-trace · outil-dessin
panneau-criteres · parcours · partage · pile · placement-libelles · points-interet · rappels
rapport-utilisation · recherche · reglages · rendu · reprise-emplacements · socle-console
socle-dessin · sponsor · suggestion · synchronisation · tiroir-itineraire · tiroir-parcours
tiroirs · ton-barre · trace-itineraire · tutoriel · vous-etes-ici · vue · vue-etat · webgl

### `modules/donnees.mjs` — 105 l. → plan, plan-admin

- l.1 · Les données du plan, leurs index, et ce que la vue regarde

Fonctions :

`poseDonnees` 54 · `societes` 83 · `P` 105

Importé par :

affiche-ici · aimants · ambiance · apercus · apparence · appels · application · batiments
borne · calage-carte · calques-dessin · cartouche-poi · chaleur · charge-annoncee
configuration · corps-fiche · demarrage · dessin · distinctions · edition · emplacements
enregistrement · environs · fiche · fiche-zone · filtre · gestes · ici · index-salon
installation · itineraire · journee · libelles · logos-stands · mesure · mini-carte · nappe
noms-zones · ordre-trace · outil-dessin · parcours · parcours-recu · partage · pile
placement-libelles · points-interet · rappels · recherche · reglage-application
reglage-fiche · reglage-recherche · reglage-suggestion · reglages · releve · rendu
reprise-emplacements · secteurs · sejour · seuil · sponsor · suggestion · tiroir-itineraire
tiroir-parcours · tout-au-parcours · trace-itineraire · tutoriel · volets · vous-etes-ici
webgl

### `modules/duplication.mjs` — 43 l. → console

- l.1 · Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

Fonctions :

`brancheDuplication` 21 · `dupliquer` 25

Importe :

evenements · fenetre-console · socle-console

Importé par :

ecran-console

### `modules/ecran-console.mjs` — 293 l. → console

- l.1 · L'écran de la console — la barre du haut, le choix du salon, le démarrage

Fonctions :

`charge` 36 · `selonAdresse` 63 · `majAdresse` 71 · `majBarre` 86 · `dessineChoix` 128
`majLiens` 145 · `videEcran` 186 · `dessine` 191 · `demarre` 206 · `brancheConsole` 224

Importe :

comptes · dom · duplication · evenements · export · fenetre-console · fiche-evenement
socle-console · synchronisation · texte

Importé par :

console

### `modules/ecran.mjs` — 15 l. → plan, plan-admin

- l.1 · L'écran — étroit ou large, mouvement réduit ou non

Fonctions :

`ETROIT` 15

Importé par :

dessin · fiche · gestes · glisse-fenetre · logos-stands · mini-carte · recherche
tiroir-itineraire · tiroirs · trace-itineraire · tutoriel · vue

### `modules/edition-en-cours.mjs` — 43 l. → plan, plan-admin

- l.1 · L'édition en cours — le plan est-il sous un outil de l'exploitant ?

Fonctions :

`enEdition` 37

Importe :

calques-dessin · emplacements · libelle-place · mode-admin · vue · webgl

Importé par :

plan

### `modules/edition.mjs` — 720 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`curseurPoignee` 57 · `poignees` 62 · `dessinePoignees` 71 · `cadreTexte` 106
`poigneeRotation` 126 · `angleBorne` 136 · `choisitForme` 138 · `replieOutils` 153
`degageOutils` 168 · `majElement` 177 · `candidatsLiaison` 300 · `ecritDesDeuxCotes` 322
`changeLien` 334 · `changeDureeLien` 350 · `majLiens` 367 · `appliqueSociete` 419
`appliqueTexte` 435 · `repereAObjet` 445 · `appliqueRotation` 450 · `appliqueRayon` 464
`appliqueTrait` 477 · `appliqueTransport` 505 · `appliquePicto` 528 · `supprimeForme` 554
`editionPointerDown` 564 · `editionPointerMove` 624 · `tourneTexte` 687
`editionPointerUp` 703

Importe :

aimants · calques-dessin · chemin-forme · decor · dessin · dom · donnees · forme-choisie
geste-tenu · itineraire · mode-admin · reperes · socle-dessin · temps · texte · vue · webgl

Importé par :

gestes-admin · outil-dessin

### `modules/emplacements.mjs` — 282 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`cleGeo` 50 · `poseSorteGeo` 59 · `geometrieSource` 72 · `reposeSource` 81
`poseGeometrie` 90 · `retoucheGeo` 104 · `elargitEmprise` 117 · `appliqueGeometries` 138
`cleAjout` 179 · `anneauxValides` 190 · `rechAjout` 195 · `objetAjoute` 204 · `poseLien` 223
`appliqueAjouts` 250

Importe :

configuration · dessin · donnees · forme · mode-admin · noms-zones

Importé par :

edition-en-cours · fiche-zone · gestes-admin · index-salon · outil-dessin · pile
reprise-emplacements

### `modules/encodeur-avif.mjs` — 94 l. → console

- l.1 · L'encodeur AVIF des vignettes de logos — console seulement

Fonctions :

`script` 40 · `encodeurAvif` 55 · `avif64` 78

Importé par :

synchronisation

### `modules/enregistrement.mjs` — 716 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.575 · La sauvegarde emportée

Fonctions :

`enregistreDessins` 69 · `autoDispo` 146 · `enRetard` 149 · `etatCourant` 162
`majAttente` 173 · `compteRescapes` 187 · `ditAlerte` 200 · `ditEtat` 243
`programmeEnvoi` 250 · `programmePublication` 264 · `rattrapeRetard` 277 · `envoie` 283
`apresGeste` 295 · `presse` 305 · `brancheEnregistrement` 313 · `identifiants` 336
`reglagesSeuls` 351 · `noteReglagesCharges` 362 · `oublieCache` 376
`pousseConfiguration` 395 · `sauvegardeCourante` 595 · `telechargeSauvegarde` 617
`appliqueSauvegarde` 640 · `litSauvegarde` 676 · `brancheSauvegarde` 698

Importe :

acces-admin · aimants · apparence · calques-dessin · cartouche-poi · configuration
demarrage · dessin · dom · donnees · fenetre · geste-tenu · index-salon · itineraire
mode-admin · nappe · ordre-trace · salon · secteurs · session

Importé par :

bande-admin · calage-carte · plan-admin · reglage-application · socle-dessin

### `modules/environs.mjs` — 1003 l. → plan, plan-admin

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`poseCalageEnCours` 54 · `styleSobre` 127 · `forceCarte` 221 · `vueLibre` 245
`calagePose` 255 · `calageCourant` 267 · `fondCourant` 270 · `recul` 275 · `zoneDuFond` 293
`bornesDuFond` 310 · `borneLeStyle` 324 · `adresseTuile` 336 · `tuilesDeLaVue` 346
`chargeMapLibre` 419 · `vueGL` 451 · `styleDuFond` 469 · `guetteLaCarte` 497
`recaleCarteGL` 531 · `redessineCarteGL` 551 · `poseCarteGL` 565 · `diagnostiqueGL` 679
`relanceCarteGL` 699 · `videCarteGL` 712 · `inclineFond` 746 · `dessineFondCarte` 794
`cleMasqueCarte` 914 · `masqueCarte` 915 · `formesMasquantes` 924 · `contourDuHall` 946
`cheminDuHall` 953 · `poseMasqueCarte` 971 · `ditCarte` 986 · `refaitFondCarte` 996

Importe :

affichage · calques-dessin · camera · chemin-forme · configuration · dom · donnees · terre
texte · vue-etat

Importé par :

calage-carte · dessin · gestes · vue

### `modules/erreurs.mjs` — 95 l. → plan, plan-admin

- l.1 · Les erreurs de la page, signalées

Fonctions :

`denous` 38 · `lieuDansLaPile` 46 · `envoie` 52 · `signale` 64 · `brancheErreurs` 79

Importe :

mesure · salon

Importé par :

lancement

### `modules/essai-rappel.mjs` — 69 l. → plan-admin

- l.1 · L'essai d'un vrai rappel, depuis les réglages

Fonctions :

`essaieRappelReel` 37

Importe :

notifications · rappels · salon

Importé par :

reglage-rappel

### `modules/evenements.mjs` — 70 l. → console

- l.1 · Les salons de la console, celui qu'on regarde, et leurs pavillons

Fonctions :

`poseEvenements` 42 · `slugifie` 53 · `courant` 57 · `chargePlans` 59 · `majEvenement` 64

Importe :

socle-console

Importé par :

comptes · console · duplication · ecran-console · fiche-detail · fiche-evenement · fuseau
provenance · synchronisation

### `modules/export.mjs` — 233 l. → console, rapport

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 35 · `colonnesExport` 119 · `libellePeriode` 151 · `nomFichierExport` 157
`nomFeuilleExport` 167 · `exporteExposants` 183 · `brancheExport` 231

Importe :

classeur · socle-console

Importé par :

console · ecran-console · rapport · rapport-utilisation

### `modules/fenetre-console.mjs` — 143 l. → console, rapport

- l.1 · La fenêtre de la console et du rapport

Fonctions :

`verseModale` 30 · `ouvreModale` 42 · `verrouilleModale` 66 · `fermeModale` 68
`poseFenetre` 76 · `gardeLaPlace` 98 · `demande` 109 · `confirme` 137

Importe :

dom

Importé par :

avancement · comptes · duplication · ecran-console · fiche-detail · fiche-evenement
provenance · socle-console

### `modules/fenetre.mjs` — 124 l. → plan, plan-admin

- l.1 · La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire

Fonctions :

`poseAvantFermeture` 19 · `retourAuxReglages` 34 · `verseModale` 36
`poseApresFermeture` 51 · `ouvreModale` 61 · `fermeModale` 81 · `confirme` 91
`brancheFenetre` 109

Importe :

annonce · dom · modeles

Importé par :

affiche-ici · batiments · borne · calage-carte · chaleur · enregistrement · fiche
fiche-zone · installation · journee · lancement · mesure · ordre-calques · outil-dessin
parcours-recu · partage · pile · rappels · reglage-sponsor · reglages · reprise-emplacements
suggestion · tiroir-parcours · tout-au-parcours · tutoriel · volets

### `modules/fiche-detail.mjs` — 1291 l. → console

- l.1 · Fiche détail d'un salon — ce qu'elle montre, et d'où vient chaque champ
- l.26 · Contenu de la fiche détail

Fonctions :

`paraitSurFiche` 163 · `origineConferences` 169 · `origineProduits` 176 · `resumeFiche` 240
`caseFiche` 285 · `cibleEn` 333 · `champsPersos` 335 · `criteres` 341 · `ecritFiche` 344
`caseCritere` 359 · `clePerso` 378 · `ajouteChampPerso` 386 · `renommeChampPerso` 404
`retireChampPerso` 452 · `lignesPerso` 513 · `cadreFiche` 536 · `ouvreFiche` 566
`cadreCategories` 706 · `sousTitre` 785 · `tableauChamps` 800 · `champOrigine` 1026

Importe :

correspondance · evenements · fenetre-console · provenance · socle-console · texte

Importé par :

fiche-evenement

### `modules/fiche-evenement.mjs` — 437 l. → console

- l.1 · Fiche d'un salon dans la console — ses champs, ses pavillons, ses sources

Fonctions :

`brancheFiche` 45 · `champ` 56 · `champFavicon` 99 · `dessineFiche` 176 · `ligneOutil` 306
`ligneReglage` 322 · `champCle` 336 · `ouvreSources` 375 · `majIntegration` 420
`majMsgSync` 427

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

Importe :

comptes · dom · evenements · fenetre-console · fiche-detail · fuseau · icone-onglet
provenance · socle-console · synchronisation

Importé par :

ecran-console

### `modules/fiche-zone.mjs` — 882 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.49 · La fiche d'une zone organisateur
- l.782 · Masquer une zone organisateur

Fonctions :

`champZone` 75 · `champsZone` 100 · `champSalles` 206 · `nomDeZone` 258 · `cadreLogo` 284
`champLogo` 356 · `editeurRiche` 394 · `memeFicheZone` 551 · `suitFicheZone` 558
`verseFicheZone` 566 · `ficheZone` 592 · `enregistreZone` 617 · `enregistreZoneAjoutee` 730
`basculeAffichageZone` 793 · `marqueZonesMasquees` 821 · `ecritColonnesEvenement` 841
`ecritColonneEvenement` 875

Importe :

annonce · cartouche-poi · configuration · demarrage · depot-image · dom · donnees
emplacements · fenetre · fiche · index-salon · itineraire · libelles · noms-zones
recherche · reglage-comptoir · reperes · session · sur · texte

Importé par :

reglage-application · reglage-fiche · reglage-sponsor · reglage-suggestion · reglages
reprise-emplacements · volets

### `modules/fiche.mjs` — 1197 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.74 · 7. Sélection et fiche

Fonctions :

`confieALaFiche` 72 · `anime` 106 · `noeud` 144 · `canalPlan` 154 · `rangSociete` 162
`select` 171 · `centre` 196 · `brancheActesFiche` 207 · `centreEtBaisseLaFiche` 223
`centrePoint` 241 · `programme` 273 · `produits` 322 · `ficheProduit` 350 · `ficheConf` 420
`poseAppuiTactile` 573 · `ecarteClicFantome` 576 · `nomSociete` 585 · `choisitExposant` 599
`poseMarque` 637 · `montreMarque` 697 · `poseCode` 720 · `rangeMarque` 761 · `ouvre` 817
`ferme` 1145 · `onglet` 1163 · `brancheFiche` 1181

Éléments :

`#dGo` · `#dItin`

Importe :

corps-fiche · dessin · distinctions · dom · donnees · ecran · fenetre · forme-choisie
libelles · marque · mesure · mode-admin · noms-zones · parcours · recherche · rendu
reperes · sur · temps · texte · tiroir-itineraire · tiroirs · tiroirs-exclusifs · vignettes
vue · webgl

Importé par :

affiche-ici · borne · chaleur · demarrage · fiche-zone · gestes · journee · lancement
ligne-liste · points-interet · reglage-fiche · reglages · reprise-emplacements · suggestion
tiroir-parcours · tutoriel

Portes :

- `confieALaFiche` (partition) — la fiche, publique, porte le crayon et la pastille d'une zone, dont les gestes sont d'administration

### `modules/figurants.mjs` — 481 l. → plan, plan-admin

- l.1 · Les figurants — du monde dans les allées

Fonctions :

`hasard` 55 · `graineDe` 67 · `placeFigurants` 115 · `presDesStands` 189 · `tronc` 308
`membre` 332 · `boule` 341 · `disque` 358 · `maillage` 371 · `pose` 380 · `maillagesDe` 396
`maillageReuni` 457 · `maillagesFigurant` 475

Importé par :

ambiance · webgl

### `modules/filtre.mjs` — 171 l. → plan, plan-admin

- l.1 · Le filtre — la question posée, et ce qu'elle retient

Fonctions :

`valeursCritere` 58 · `dansCriteres` 70 · `filtre` 80 · `reposeRetrait` 101
`leveRetrait` 105 · `critParSociete` 109 · `cherchable` 119 · `visible` 126
`releveHotes` 147 · `visibleSurPlan` 155 · `visibleSociete` 166

Importe :

configuration · corps-fiche · donnees · texte

Importé par :

appels · dessin · libelles · recherche · secteurs · tout-au-parcours · volets

### `modules/forme-choisie.mjs` — 39 l. → plan, plan-admin

- l.1 · La forme choisie dans l'éditeur, et ce que le plan public en partage

Fonctions :

`poseFormeSel` 23 · `formeParId` 27 · `boite` 35

Importe :

calques-dessin

Importé par :

affiche-ici · borne · cartouche-poi · dessin · edition · fiche · gestes-admin · libelles
outil-dessin · outil-escalier · points-interet · tiroir-itineraire · tutoriel

### `modules/forme.mjs` — 154 l. → plan, plan-admin

- l.1 · La forme d'un emplacement — anneaux, tracé, empreinte, ancrage du nom

Fonctions :

`arrondiGeo` 14 · `empreinteGeo` 25 · `anneauxGeo` 45 · `traceGeo` 58 · `boiteAnneaux` 62
`dansAnneau` 80 · `distSegmentGeo` 91 · `distBordGeo` 100 · `poleGeo` 110 · `porteeGeo` 129
`boiteGeo` 137

Importé par :

emplacements · reprise-emplacements

### `modules/fuseau.mjs` — 101 l. → console

- l.1 · Fuseau horaire du salon — le champ de la console

Fonctions :

`fuseauConnu` 28 · `champFuseau` 40

Éléments :

`#fuseaux`

Importe :

evenements · socle-console · texte

Importé par :

fiche-evenement

### `modules/geste-tenu.mjs` — 28 l. → plan, plan-admin

- l.1 · Un geste tenu — ce qui retient l'envoi au repos

Fonctions :

`inscritGesteTenu` 25 · `unGesteTenu` 28

Importé par :

appels · batiments · calage-carte · calques-dessin · edition · enregistrement · gestes
outil-comptoir · outil-escalier · placement-libelles · reprise-emplacements

### `modules/gestes-admin.mjs` — 190 l. → plan-admin

- l.1 · Les gestes de l'exploitant sur le plan — leur rang dans la chaîne

Fonctions :

`appui` 45 · `suit` 67 · `leve` 78 · `annuleGeste` 91 · `clavier` 99 · `echap` 147
`apresEchap` 167 · `entree` 174 · `brancheGestesAdmin` 182

Importe :

affiche-ici · aimants · batiments · calage-carte · calques-dessin · dom · edition
emplacements · forme-choisie · gestes · libelle-place · mode-admin · outil-comptoir
outil-dessin · outil-escalier · placement-libelles · reprise-emplacements

Importé par :

plan-admin

### `modules/gestes.mjs` — 543 l. → plan, plan-admin

- l.1 · Les gestes sur le plan — glisser, pincer, la molette, l'appui qui ouvre
- l.73 · 8. Interactions du plan

Fonctions :

`poseGestesAdmin` 71 · `milieu` 103 · `commencePince` 109 · `suitPince` 123
`plieLesBandes` 184 · `saisitPlan` 198 · `cibleElargie` 235 · `planifieFiltre` 278
`brancheGestes` 292 · `brancheLangue` 526

Importe :

borne · dessin · dom · donnees · ecran · environs · fiche · geste-tenu · libelles · mesure
noms-zones · points-interet · recherche · texte-plan · tiroir-itineraire · toucher · vue
webgl

Importé par :

calage-carte · gestes-admin · lancement

### `modules/glisse-fenetre.mjs` — 36 l. → plan-admin

- l.1 · Le pas d'une hauteur à l'autre, dans la fenêtre des réglages

Fonctions :

`glisseFenetre` 27

Importe :

dom · ecran

Importé par :

reglage-sponsor · reglage-suggestion · reglages

### `modules/habillage.mjs` — 157 l. → plan, plan-admin

- l.1 · L'habillage du plan — couleur principale, fond, barre du salon, modèle

Fonctions :

`brancheHabillage` 27 · `appliqueAccent` 60 · `appliqueFond` 94 · `modeBarre` 114
`appliqueBarre` 116 · `appliqueModele` 139

Importe :

configuration · couleurs · dom · modeles · polices-plan · ton-barre

Importé par :

apparence · lancement · pile · volets

### `modules/horaires.mjs` — 89 l. → plan, plan-admin

- l.1 · La journée du salon — ses dates, ses heures, le temps passé sur un stand

Fonctions :

`minutesVisite` 28 · `lueHeure` 55 · `lueDate` 59 · `datesSalon` 66 · `horairesSalon` 80

Importe :

configuration · temps

Importé par :

journee · reglages · volets

### `modules/ici.mjs` — 252 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le code affiché dans le hall, côté visiteur

Fonctions :

`litCodeIci` 90 · `poseIci` 113 · `retireIci` 140 · `oublieIciDeLAdresse` 170
`montreBandeauIci` 186 · `demarreIci` 220 · `brancheIci` 240

Importe :

borne · dom · donnees · salon · tiroir-itineraire · vous-etes-ici

Importé par :

affiche-ici · demarrage · lancement · tutoriel

### `modules/icone-app.mjs` — 126 l. → plan-admin

- l.1 · L'icône de l'application, fabriquée depuis un logo déposé

Fonctions :

`fondPourIconeApp` 56 · `dessineIconeApp` 88 · `reduitIconeApp` 115

Importe :

depot-image

Importé par :

reglage-application

### `modules/icone-onglet.mjs` — 58 l. → console

- l.1 · Icône de l'onglet

Fonctions :

`reduitIcone` 30

Importé par :

fiche-evenement

### `modules/index-salon.mjs` — 486 l. → plan, plan-admin

- l.1 · 1. L'index du salon — la recherche porte sur tous les pavillons

Fonctions :

`texteProduits` 53 · `indexe` 57 · `chronoConf` 298 · `confsDuPlan` 303
`indexeConferences` 321 · `rangeConferences` 399 · `poseFavicon` 446 · `poseLogoSalon` 472

Importe :

annonce · calques-dessin · cartouche-poi · configuration · dom · donnees · emplacements
installation · itineraire · mode-admin · modeles · noms-zones · options · parcours
polices-plan · recherche · secteurs · sur · tiroir-parcours

Importé par :

demarrage · enregistrement · fiche-zone

### `modules/installation.mjs` — 821 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`reglageInstallation` 117 · `invitationVoulue` 118 · `auDoigt` 148 · `nommeApplication` 184
`reponsesInstallation` 202 · `retientInstallation` 207 · `jourInstallation` 216
`invitationEcartee` 219 · `refuseInstallation` 225 · `faconInstallation` 253
`appliInstallee` 282 · `verifieApplication` 304 · `connaitLApplication` 314
`faconRappel` 334 · `rappelEcarte` 342 · `refuseRappel` 348 · `relanceInvitation` 366
`gesteInstallation` 371 · `doigtPose` 375 · `doigtLeve` 376 · `vueInstallation` 379
`accueilleInvitation` 388 · `invitationRetenue` 414 · `suitLesGestes` 435
`finInvitation` 443 · `rouvreInvitation` 465 · `essaieInvitation` 485
`brancheInstallation` 528 · `teteInvitation` 621 · `poseGardeInstallation` 654
`remplitInvitation` 677 · `ouvreInvitation` 707 · `ouvreRappel` 782

Importe :

application · configuration · dom · donnees · fenetre · mesure · partage · salon · sponsor
tutoriel · visite-guidee

Importé par :

demarrage · index-salon · lancement · reglage-installation

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

Importe :

chemin-forme · donnees · reperes · temps · texte

Importé par :

affiche-ici · aimants · borne · calage-carte · cartouche-poi · dessin · edition
enregistrement · fiche-zone · index-salon · journee · nappe · outil-dessin · pile
points-interet · reprise-emplacements · sejour · seuil · tiroir-itineraire
trace-itineraire · tutoriel · volets · webgl

### `modules/journee.mjs` — 1252 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`trace` 38 · `joursSalon` 103 · `joursAVenir` 132 · `joursDefaut` 150 · `confsParJour` 160
`departsProposes` 185 · `rangJournee` 207 · `lienJournee` 219 · `boutonJour` 242
`arretJournee` 255 · `remplitOnglets` 302 · `jourDuStand` 331 · `ouvreChoixJour` 343
`figeLaVisite` 400 · `placeSurJour` 409 · `rendAuPlan` 417 · `retireDuSejour` 423
`remplitJournee` 433 · `ecritApercu` 646 · `appliqueVueParcours` 676 · `traceJournee` 718
`montreLeJour` 727 · `perimeJournee` 742 · `oublieSejour` 757 · `ouvreOrganisation` 772
`essaieSejour` 1152 · `lanceSejour` 1182 · `refaitSejour` 1221 · `brancheJournee` 1236

Importe :

charge-annoncee · dom · donnees · fenetre · fiche · horaires · itineraire · mesure
parcours · rendu · sejour · seuil · temps · tiroir-itineraire · trace-itineraire
vous-etes-ici

Importé par :

lancement · tiroir-parcours · tutoriel

### `modules/lancement.mjs` — 126 l. → plan, plan-admin

- l.1 · Le lancement du plan — ce que le script soudé faisait encore

Fonctions :

`confieLancementAdmin` 70 · `lancePlan` 73

Importe :

bandes · borne · demarrage · erreurs · fenetre · fiche · gestes · habillage · ici
installation · journee · ligne-liste · mesure · partage · recherche · sponsor
tiroir-itineraire · tiroir-parcours · tiroirs · ton-barre · vue · webgl

Importé par :

plan · plan-admin

Portes :

- `confieLancementAdmin` (partition) — les branchements de l'exploitant prennent leur rang dans le lancement public, dont l'ordre est le comportement

### `modules/libelle-place.mjs` — 104 l. → plan, plan-admin

- l.1 · Placer un libellé à la main — ce que le plan public en reçoit

Fonctions :

`cleLibelle` 36 · `poseModeLibelles` 45 · `poseLibelleChoisi` 50 · `empreinteLibelle` 62
`placementLibelle` 70 · `cleLogo` 89 · `empreinteLogo` 95 · `placementLogo` 101

Importe :

configuration · texte-plan

Importé par :

edition-en-cours · gestes-admin · libelles · logos-stands · nom-emplacement · pile
placement-libelles · tutoriel · webgl

### `modules/libelles.mjs` — 293 l. → plan, plan-admin

- l.1 · Les libellés du plan — le nom de l'exposant prime sur le numéro
- l.50 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`libelles` 57 · `libelleZone` 134 · `emplacementWebgl` 162 · `libellesWebgl` 223

Importe :

calques-dessin · cartouche-poi · dessin · dom · donnees · filtre · forme-choisie
libelle-place · logos-stands · nom-emplacement · noms-zones · polices-plan · texte
texte-plan · trace-itineraire · vous-etes-ici · vue · webgl

Importé par :

fiche · fiche-zone · gestes · placement-libelles · plan · recherche · reglage-fiche
reglages · reprise-emplacements · volets

### `modules/lien-parcours.mjs` — 97 l. → plan, plan-admin

- l.1 · Le parcours écrit dans un lien, et relu

Fonctions :

`codeIdParcours` 45 · `codeParcours` 63 · `champParcours` 75 · `litCodeParcours` 82

Importé par :

parcours-recu · partage

### `modules/ligne-liste.mjs` — 37 l. → plan, plan-admin

- l.1 · Ce qu'ouvre une ligne de la liste

Fonctions :

`brancheLignesListe` 19

Importe :

dom · fiche · points-interet

Importé par :

lancement

### `modules/logos-stands.mjs` — 1089 l. → plan, plan-admin

- l.1 · Les logos sur les stands, vus de près

Fonctions :

`finesse` 81 · `palier` 95 · `tassement` 106 · `annoncePret` 162 · `pret` 168
`geleLogos` 175 · `arriveeSansFond` 219 · `grande` 235 · `pompeGrandes` 249
`demandeGrande` 253 · `image` 292 · `sansFond` 312 · `lanceTravailleur` 351
`demandeDetourage` 372 · `pompe` 379 · `parLaPageSeule` 399 · `detoureRevenu` 408
`largeurDeToile` 425 · `cleDeToile` 428 · `toileDejaRangee` 434 · `toile` 453
`logoPose` 488 · `sourceDuToit` 498 · `cedeAuLogo` 511 · `CARRE` 540 · `filtrage` 573
`plancheDe` 590 · `extensionPlanche` 626 · `rendPlanche` 722 · `taillesDe` 731
`rangPour` 740 · `nouvellePlanche` 749 · `place` 767 · `envoie` 786 · `range` 801
`plancheGardee` 835 · `oubliePlancheBientot` 865 · `pres` 877 · `solVu` 888
`logosARevoir` 905 · `groupe` 920 · `oublie` 931 · `annoncePoses` 965 · `couchesLogos` 983

Importe :

annonce · camera · detourage · dom · donnees · ecran · libelle-place · vignettes · vue-etat

Importé par :

ambiance · libelles · releve · webgl

### `modules/marque.mjs` — 335 l. → plan, plan-admin, console

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 56 · `recadreMarque` 60 · `marqueRecadree` 86 · `imageChargee` 115
`vignetteMarque` 131 · `webp64` 171 · `boiteMarque` 189 · `toileMarque` 255 · `sansFond` 271
`vignetteDeLogo` 298

Importe :

detourage

Importé par :

fiche · recherche · synchronisation

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

Importe :

dom · donnees · fenetre · salon

Importé par :

borne · charge-annoncee · erreurs · fiche · gestes · installation · journee · lancement
notifications · parcours · partage · tiroir-itineraire

### `modules/mini-carte.mjs` — 104 l. → plan, plan-admin

- l.1 · La mini-carte de situation

Fonctions :

`monte` 33 · `dessine` 46 · `suit` 61 · `brancheGeste` 81

Importe :

donnees · ecran · vue

Importé par :

plan

### `modules/mode-admin.mjs` — 41 l. → plan, plan-admin

- l.1 · 10. Mode administration — ce que le plan public en sait

Fonctions :

`ouvreModeAdmin` 22 · `retireAdmin` 31

Importe :

dom

Importé par :

bande-admin · batiments · calage-carte · chaleur · demarrage · dessin · edition
edition-en-cours · emplacements · enregistrement · fiche · gestes-admin · index-salon
nappe · outil-comptoir · outil-dessin · outil-escalier · pile · placement-libelles · rendu
reprise-emplacements · volets

### `modules/modeles.mjs` — 90 l. → plan, plan-admin

- l.1 · Les modèles d'habillage du plan

Fonctions :

`modeleRetenu` 48 · `habilleModale` 82

Importe :

configuration · dom

Importé par :

fenetre · habillage · index-salon · polices-plan · reglage-fiche · volets

### `modules/modes-edition.mjs` — 46 l. → plan-admin

- l.1 · Les trois modes d'édition — un seul à la fois

Fonctions :

`inscritMode` 35 · `quitteLesAutres` 41

Importé par :

outil-dessin · placement-libelles · reprise-emplacements

### `modules/mot-de-passe.mjs` — 210 l. → motdepasse

- l.1 · Poser un mot de passe

Fonctions :

`dit` 30 · `fragment` 36 · `garde` 43 · `lit` 47 · `demandeLien` 59 · `ouvreSaisie` 68
`brancheMotDePasse` 86

Importe :

dom · session

Importé par :

motdepasse

### `modules/motdepasse.mjs` — 15 l. → motdepasse

- l.1 · Point d'entrée de la page du mot de passe — et son démarrage

Importe :

mot-de-passe

### `modules/nappe.mjs` — 82 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`poseNappe` 43 · `couleurNappe` 45 · `rafraichitApercu` 51

Importe :

configuration · dom · donnees · itineraire · mode-admin · rendu · tiroir-itineraire · vue

Importé par :

enregistrement · outil-dessin

### `modules/nom-emplacement.mjs` — 152 l. → plan, plan-admin

- l.1 · Le nom d'un emplacement sur le plan — l'enseigne, son numéro, ses hébergés

Fonctions :

`coexComptes` 32 · `coexChoisit` 33 · `ligneCode` 49 · `decaleLibelle` 83
`facteurLibelle` 84 · `libelleForce` 85 · `libelleEmplacement` 96 · `nomsPivotes` 120
`nomCouche` 122 · `libelleDroit` 134

Importe :

configuration · libelle-place · polices-plan · texte · texte-plan

Importé par :

dessin · libelles · volets

### `modules/noms-zones.mjs` — 36 l. → plan, plan-admin

- l.1 · Le nom d'une zone dans la langue de la page

Fonctions :

`nomDeLaZone` 27 · `nomsAnglaisDesZones` 29

Importe :

donnees

Importé par :

emplacements · fiche · fiche-zone · gestes · index-salon · libelles · recherche
reprise-emplacements

### `modules/notifications.mjs` — 89 l. → plan, plan-admin

- l.1 · Les notifications — ce que l'appareil sait recevoir, et l'abonnement

Fonctions :

`poussePossible` 19 · `iOSsansInstallation` 24 · `adresseDuRappel` 30 · `heureVue` 54
`empreinteDebut` 55 · `octetsDeCle` 59 · `abonnementCourant` 67 · `abonne` 76

Importe :

mesure · salon

Importé par :

essai-rappel · rappels

### `modules/nuancier.mjs` — 73 l. → plan-admin

- l.1 · La rafale du sélecteur de couleur — l'exploitant seul

Fonctions :

`presseNuanciers` 34 · `brancheNuancier` 40 · `suitNuancier` 57

Importé par :

outil-dessin · pile · plan-admin · volets

### `modules/options.mjs` — 117 l. → plan, plan-admin

- l.1 · Les options du plan — ce que le salon a pris

Fonctions :

`appliqueOptions` 100 · `confieApresOption` 114

Importe :

configuration

Importé par :

apparence · index-salon · outil-dessin · tiroir-parcours · volets

Portes :

- `confieApresOption` (registre) — chaque module que touche une option vendue à part y inscrit ce qu'il refait quand elle change

### `modules/ordonnanceur.mjs` — 865 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 83 · `peineDeCharge` 104 · `ecartDesJours` 190 · `poidsDesJours` 220
`chargeDuJour` 243 · `rangeSejour` 252 · `trancheDe` 802 · `dilatationPour` 857

Importé par :

charge-annoncee · sejour

### `modules/ordre-calques.mjs` — 126 l. → plan-admin

- l.1 · L'ordre des calques — la fenêtre de l'exploitant

Fonctions :

`deplaceVers` 27 · `versExtremite` 39 · `remplitOrdre` 47 · `ouvreOrdre` 117

Importe :

configuration · dom · fenetre · ordre-trace · outil-dessin

Importé par :

pile

### `modules/ordre-trace.mjs` — 77 l. → plan, plan-admin

- l.1 · Pile des calques — l'ordre de tracé

Fonctions :

`clePile` 23 · `entrees` 25 · `pile` 39 · `groupe` 51 · `ordonneDom` 59
`construitPanneau` 75

Importe :

annonce · calques-dessin · configuration · dom · donnees

Importé par :

bande-admin · batiments · calage-carte · dessin · enregistrement · ordre-calques
outil-dessin · pile · rendu · reprise-emplacements · volets · vue

### `modules/outil-comptoir.mjs` — 208 l. → plan-admin

- l.1 · Le comptoir d'un accueil, attrapé sur le plan — l'outil de l'exploitant

Fonctions :

`aire` 42 · `anneauDe` 46 · `emprise` 52 · `reglageDe` 59 · `zoneDe` 71 · `lis` 75
`metresParPixel` 84 · `vise` 87 · `choisitComptoir` 108 · `pose` 120 · `reglageCourant` 132
`comptoirPointerDown` 139 · `comptoirPointerMove` 151 · `comptoirPointerUp` 170
`lacheComptoir` 180 · `comptoirClavier` 186 · `relacheComptoir` 204

Importe :

camera · configuration · decor · geste-tenu · mode-admin · trace · vue

Importé par :

gestes-admin · reglage-comptoir

### `modules/outil-dessin.mjs` — 938 l. → plan-admin

- l.1 · 11. Calques de dessin — l'outil de l'exploitant

Fonctions :

`restaure` 73 · `annule` 89 · `refais` 101 · `poseTrait` 106 · `aimanteContour` 127
`rayonContour` 130 · `redresseTrace` 149 · `traceGuide` 183 · `ajouteForme` 190
`poseChampImage` 207 · `calquePourImage` 222 · `lienImageSaisi` 250 · `formeImage` 262
`poseImage` 271 · `ditImagePosee` 294 · `importeImage` 302 · `dessinPointerDown` 331
`dessinPointerMove` 416 · `dessinPointerUp` 454 · `termineTrace` 495 · `aide` 507
`outilOffert` 537 · `choisitOutil` 551 · `enchaineStand` 582 · `proposeCouleurLigne` 600
`montreTransport` 611 · `activeCalque` 620 · `cleVerrou` 674 · `verrouille` 675
`basculeVerrou` 677 · `montreRoleIti` 720 · `creeCalque` 733 · `demandeNom` 746
`renommeCalque` 771 · `brancheOutilDessin` 787

Importe :

aimants · calques-dessin · chemin-forme · configuration · dessin · dom · donnees · edition
emplacements · fenetre · forme-choisie · itineraire · mode-admin · modes-edition · nappe
nuancier · options · ordre-trace · rendu · reperes · reprise-emplacements · socle-dessin
texte · tiroir-itineraire · vue

Importé par :

batiments · gestes-admin · ordre-calques · pile · plan-admin

### `modules/outil-escalier.mjs` — 213 l. → plan-admin

- l.1 · L'escalier d'un repère, attrapé sur le plan — l'outil de l'exploitant

Fonctions :

`noeudDe` 49 · `metresParPixel` 53 · `lis` 56 · `dedans` 71 · `distance` 81 · `vise` 95
`choisitEscalier` 113 · `refais` 124 · `angleBorne` 130 · `escalierPointerDown` 135
`escalierPointerMove` 147 · `escalierPointerUp` 170 · `lacheEscalier` 180
`escalierClavier` 186 · `relacheEscalier` 209

Importe :

camera · decor · dessin · forme-choisie · geste-tenu · mode-admin · socle-dessin · vue

Importé par :

gestes-admin

### `modules/panneau-criteres.mjs` — 41 l. → plan, plan-admin

- l.1 · Le panneau des critères déplié — sa relecture, et le replier

Fonctions :

`poseRelecturePanneau` 20 · `relisPanneauCrit` 23 · `fermeCriteres` 28

Importe :

dom

Importé par :

recherche · tiroirs

### `modules/parcours-recu.mjs` — 125 l. → plan, plan-admin

- l.1 · Le parcours reçu

Fonctions :

`accueilleParcoursPartage` 45 · `adoptePartage` 123

Importe :

configuration · donnees · fenetre · lien-parcours · parcours

Importé par :

demarrage

### `modules/parcours.mjs` — 595 l. → plan, plan-admin

- l.1 · Le parcours de visite : la liste, son stockage, sa marque

Fonctions :

`_rafraichit` 26 · `_reprendRappels` 27 · `_synchroniseRappels` 28 · `poseParcours` 89
`brancheListeParcours` 107 · `cleParcours` 120 · `identifiantParcours` 157
`casierParcours` 165 · `dansParcours` 166 · `jourParcours` 169
`attenduDepuisTropLongtemps` 174 · `trieParcours` 185 · `chargeParcours` 195
`parcoursAEcrire` 229 · `enregistreParcours` 245 · `tientLeStockage` 274
`plurielParcours` 288 · `contenuParcours` 297 · `signetParcours` 308 · `boutonParcours` 314
`rafraichitMarque` 319 · `calqueMarques` 352 · `traitTuile` 379 · `dessineMarques` 386
`marqueParcours` 416 · `instantConf` 434 · `cleTemps` 438 · `nomDeStand` 448
`groupeParcours` 450 · `fermeParcours` 464 · `apresBascule` 484 · `suitLeParcours` 486
`basculeParcours` 496 · `brancheParcours` 520 · `verseAuParcours` 543 · `rangParcours` 572
`refaitParcours` 595

Importe :

couleurs · dom · donnees · mesure · salon · temps · texte · tiroirs-exclusifs

Importé par :

apparence · fiche · index-salon · journee · parcours-recu · partage · rappels · rendu
reprise-emplacements · sejour · suggestion · tiroir-itineraire · tiroir-parcours
tout-au-parcours · tutoriel

### `modules/partage.mjs` — 293 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`lienParcours` 50 · `ouvrePartageParcours` 66 · `boutonsPartage` 122 · `parcoursACopier` 209
`ouvreGardeParcours` 224 · `demandeGardeParcours` 254 · `poseGardeParcours` 267
`branchePartage` 291

Importe :

configuration · dom · donnees · fenetre · lien-parcours · mesure · parcours · qr · salon

Importé par :

installation · lancement · tiroir-parcours

### `modules/pile.mjs` — 549 l. → plan-admin

- l.1 · Le panneau des calques
- l.65 · Panneau : deux sections, chacune rangée par nom
- l.360 · Repères
- l.412 · Fond du plan

Fonctions :

`secteurs` 53 · `joli` 56 · `nature` 83 · `boutonAjout` 90 · `boutonVerrou` 110
`intertitre` 118 · `remplitPanneau` 128 · `sectionSelection` 376 · `sectionFond` 432
`ligneCouleur` 490 · `rangSecteur` 510 · `rangSous` 523 · `defautCouleur` 545

Importe :

apparence · batiments · calage-carte · calques-dessin · chaleur · configuration
configuration · couleurs · dessin · dom · donnees · emplacements · fenetre · habillage
itineraire · libelle-place · mode-admin · nuancier · ordre-calques · ordre-trace
outil-dessin · placement-libelles · reprise-emplacements · secteurs · texte

Importé par :

plan-admin

### `modules/placement-libelles.mjs` — 212 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`lacheLibelle` 43 · `choisi` 52 · `repeint` 65 · `posePlacement` 75
`libelleAutomatique` 92 · `modePlacementLibelles` 101 · `majPaletteLibelle` 120
`choisitLibelle` 139 · `pousseLibelle` 146 · `libellePointerDown` 154
`libellePointerMove` 176 · `libellePointerUp` 185 · `branchePlacementLibelles` 198

Importe :

configuration · dom · donnees · geste-tenu · libelle-place · libelles · mode-admin
modes-edition · vue · webgl

Importé par :

gestes-admin · pile · plan-admin

### `modules/plan-admin.mjs` — 69 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

Fonctions :

`lieux` 42

Importe :

acces-admin · affiche-ici · bande-admin · batiments · calage-carte · chaleur
enregistrement · gestes-admin · lancement · nuancier · outil-dessin · pile
placement-libelles · plan · reprise-emplacements

### `modules/plan.mjs` — 58 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

Importe :

appels · edition-en-cours · lancement · libelles · mini-carte · polices-plan · releve
salon · sur · texte-plan · tutoriel · vue · webgl

Importé par :

plan-admin

### `modules/points-interet.mjs` — 140 l. → plan, plan-admin

- l.1 · Les points d'intérêt — la fiche d'un repère, et le chemin vers lui

Fonctions :

`vaAuRepere` 49 · `ouvrePoi` 72

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

Importe :

cartouche-poi · distinctions · dom · donnees · fiche · forme-choisie · itineraire · rendu
reperes · temps · texte · tiroir-itineraire · tiroirs-exclusifs · vue

Importé par :

gestes · ligne-liste

### `modules/polices-plan.mjs` — 329 l. → plan, plan-admin

- l.1 · La police des noms sur le plan — celle du modèle, ou une autre de la liste

Fonctions :

`confieAuxPolices` 43 · `policeChoisie` 210 · `policeDuModele` 215 · `feuillePolice` 225
`chargePolice` 247 · `policePrete` 267 · `policeDesNoms` 285 · `posePoliceLibelles` 314

Importe :

configuration · modeles

Importé par :

appels · dessin · habillage · index-salon · libelles · nom-emplacement · plan · recherche
rendu · volets

Portes :

- `confieAuxPolices` (rendu) — une police arrivée fait retracer le plan, les calques, les noms et la liste, qui tous importent les polices

### `modules/provenance.mjs` — 161 l. → console

- l.1 · Provenance des données d'un salon — domaines, fournisseurs, réglage
- l.19 · Provenance des données

Fonctions :

`fournisseurUtilise` 83 · `sourceNom` 93 · `source` 97 · `ligneSource` 101
`resumeProvenance` 124 · `ouvreProvenance` 145

Importe :

evenements · fenetre-console · socle-console

Importé par :

fiche-detail · fiche-evenement · synchronisation

### `modules/qr.mjs` — 315 l. → plan, plan-admin

- l.1 · Le code QR, sans bibliothèque

Fonctions :

`qrMotsBruts` 36 · `qrMotsUtiles` 45 · `qrMul` 56 · `qrGenerateur` 59 · `qrReste` 70
`qrAlignements` 81 · `qrTrame` 97 · `qrChemin` 286 · `qrSvg` 308

Importe :

texte

Importé par :

affiche-ici · partage

### `modules/rappels.mjs` — 540 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`reglageRappel` 87 · `rappelsVoulus` 88 · `minutesRappel` 89 · `cleRappels` 103
`chargeRappels` 106 · `retientRappels` 110 · `rappelsOfferts` 121 · `instantAbsolu` 151
`confsARappeler` 159 · `rappelsDuParcours` 176 · `synchroniseRappels` 214
`eteintRappels` 237 · `allumeRappels` 252 · `aideRappel` 269 · `poseRappels` 285
`cleInviteRappel` 406 · `inviteRappelFaite` 409 · `retientInviteRappel` 414
`fenetreRappel` 450 · `proposeRappels` 486 · `reprendRappels` 529

Importe :

configuration · dom · donnees · fenetre · notifications · parcours · salon · temps
visite-guidee

Importé par :

essai-rappel · reglage-rappel · tiroir-parcours

### `modules/rapport-utilisation.mjs` — 504 l. → rapport

- l.1 · Rapport d'utilisation

Fonctions :

`courant` 70 · `chargeEvenements` 75 · `joursPeriode` 93 · `chargeRapport` 95
`erreurs` 108 · `chiffre` 131 · `barres` 150 · `portes` 190 · `jours` 241
`dessineRapport` 262 · `dessineBarre` 427 · `rafraichit` 450 · `videEcran` 469
`demarre` 475 · `brancheRapport` 494

Éléments :

`#lienPublic`

Importe :

dom · export · socle-console · texte

Importé par :

rapport

### `modules/rapport.mjs` — 33 l. → rapport

- l.1 · Point d'entrée du rapport — et son démarrage

Importe :

export · rapport-utilisation · socle-console

### `modules/recherche.mjs` — 1026 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`appliqueSecteurs` 69 · `filtreTheme` 87 · `themeFiltrable` 144 · `ordreCriteres` 160
`clesCriteres` 187 · `texteCriteres` 201 · `texteAnglaisPerso` 217 · `indexeCriteres` 231
`refaitCriteres` 265 · `critereActif` 272 · `basculeCritere` 274 · `videCriteres` 283
`majVideQ` 292 · `videRecherche` 305 · `nCriteres` 320 · `majCriteres` 329
`remplitCriteres` 396 · `basculeCriteres` 535 · `ouvreCriteres` 540 · `marqueRetrait` 574
`appliqueFiltre` 592 · `oublieRetrait` 608 · `reprendRecherche` 617 · `rangSorte` 630
`codeCase` 659 · `caseNumero` 676 · `sousLigne` 696 · `liste` 710 · `marqueChoisie` 847
`prechargeMarque` 873 · `prechargeLesVignettes` 924 · `chargeUnLot` 970
`brancheRecherche` 1001

Importe :

bandes · cartouche-poi · configuration · corps-fiche · dessin · distinctions · dom · donnees
ecran · filtre · libelles · marque · noms-zones · panneau-criteres · polices-plan · salon
secteurs · sur · temps · texte · texte-plan · tiroirs · tout-au-parcours · vignettes · vue

Importé par :

apercus · apparence · borne · demarrage · fiche · fiche-zone · gestes · index-salon
lancement · reglage-fiche · reglage-recherche · reglage-suggestion · rendu
reprise-emplacements · suggestion · volets

### `modules/reglage-application.mjs` — 315 l. → plan-admin

- l.1 · L'application installée — son icône et son nom, le réglage de l'exploitant

Fonctions :

`nomAppDefaut` 68 · `ecritApplication` 83 · `blocApplication` 124

Importe :

application · donnees · enregistrement · fiche-zone · icone-app · session

Importé par :

volets

### `modules/reglage-comptoir.mjs` — 196 l. → plan-admin

- l.1 · Le comptoir d'un accueil — où l'exploitant le pose, dans quel sens

Fonctions :

`el` 35 · `champComptoir` 47

Importe :

configuration · decor · outil-comptoir

Importé par :

fiche-zone

### `modules/reglage-fiche.mjs` — 648 l. → plan-admin

- l.1 · Le volet « Fiche Stand » des réglages — l'exploitant seul

Fonctions :

`clesFiche` 48 · `voletOrdre` 65

Importe :

apercus · corps-fiche · donnees · fiche · fiche-zone · libelles · modeles · recherche
texte

Importé par :

reglages

### `modules/reglage-installation.mjs` — 58 l. → plan-admin

- l.1 · La case de l'invitation à installer, dans l'onglet « Admin » des réglages

Fonctions :

`caseInstallation` 21

Importe :

configuration · installation

Importé par :

volets

### `modules/reglage-rappel.mjs` — 159 l. → plan-admin

- l.1 · Le rappel avant une conférence, dans l'onglet « Admin » des réglages

Fonctions :

`blocRappel` 34 · `ditEssaiRappel` 145

Importe :

configuration · essai-rappel · rappels

Importé par :

volets

### `modules/reglage-recherche.mjs` — 309 l. → plan-admin

- l.1 · L'onglet « Recherche » des réglages — l'exploitant seul

Fonctions :

`catalogueTenu` 25 · `voletRecherche` 94 · `blocOrdreCriteres` 155

Importe :

cartouche-poi · configuration · corps-fiche · donnees · recherche

Importé par :

reglages

### `modules/reglage-sponsor.mjs` — 208 l. → plan-admin

- l.1 · Le générique du démarrage, réglé par l'exploitant

Fonctions :

`blocSponsor` 51

Importe :

configuration · fenetre · fiche-zone · glisse-fenetre · sponsor

Importé par :

volets

### `modules/reglage-suggestion.mjs` — 413 l. → plan-admin

- l.1 · La suggestion — le volet de l'exploitant

Fonctions :

`indexSugg` 42 · `valeursSugg` 67 · `relevePalmares` 85 · `etiquetteSugg` 105
`voletSuggestion` 115

Importe :

chaleur · configuration · donnees · fiche-zone · glisse-fenetre · recherche · session
suggestion · texte · tiroir-parcours

Importé par :

reglages

### `modules/reglages.mjs` — 508 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`ouvreReglages` 83 · `voletZones` 211 · `champsFicheZone` 313 · `ficheZoneEnPlace` 383
`voletPlan` 401 · `voletCoexposants` 440

Importe :

acces-admin · calage-carte · chaleur · configuration · corps-fiche · distinctions · dom
donnees · fenetre · fiche · fiche-zone · glisse-fenetre · horaires · libelles
reglage-fiche · reglage-recherche · reglage-suggestion · seuil · volets

Importé par :

bande-admin

### `modules/releve.mjs` — 415 l. → plan, plan-admin

- l.1 · Le relevé des performances — `?perf`

Fonctions :

`ms` 69 · `garde` 71 · `decrit` 79 · `dansLeReleve` 95 · `commence` 99 · `centile` 110
`sorte` 116 · `clos` 120 · `ecouteGestes` 139 · `image` 171 · `observe` 203 · `fichier` 211
`ecouteNavigateur` 213 · `echantillonne` 245 · `carteGraphique` 264 · `appareil` 282
`chargement` 299 · `synthese` 316 · `releve` 330 · `affiche` 360 · `partage` 367
`posePastille` 384

Importe :

affichage · demarrage · donnees · logos-stands · salon · webgl

Importé par :

plan

### `modules/rendu.mjs` — 229 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`monteHabillage` 60 · `attributComptoir` 78 · `baliseZone` 95 · `baliseStand` 112
`montePlan` 122 · `onglets` 154 · `chargeFond` 184 · `changePlan` 216

Importe :

ambiance · annonce · apparence · bandes · calques-dessin · configuration · decor · dessin
distinctions · dom · donnees · mode-admin · ordre-trace · parcours · polices-plan
recherche · salon · texte · tiroirs-exclusifs · trace-itineraire · vous-etes-ici · vue

Importé par :

bande-admin · borne · calage-carte · demarrage · fiche · journee · nappe · outil-dessin
points-interet · reprise-emplacements · tiroir-itineraire · tutoriel

### `modules/reperes.mjs` — 421 l. → plan, plan-admin

- l.1 · Les repères et les transports en commun — ce qu'ils sont

Fonctions :

`pictoDe` 130 · `nomTypeRepereFr` 186 · `nomTypeRepere` 188 · `typeZone` 218
`pictoForme` 225 · `estPorte` 245 · `ouvreEntrant` 246 · `ouvreSortant` 247 · `modeDit` 287
`lettreMode` 289 · `estTransport` 293 · `modeTransport` 296 · `glypheRepere` 308
`cleLigne` 345 · `ligneAffichee` 356 · `couleurLigne` 364 · `couleurRepere` 370
`encreRepere` 376 · `nomLigneFr` 390 · `libelleDoffice` 398 · `couleurEcrite` 405
`pastillePoi` 419

Importe :

couleurs

Importé par :

cartouche-poi · dessin · edition · fiche · fiche-zone · itineraire · outil-dessin
points-interet · socle-dessin · webgl

### `modules/reprise-emplacements.mjs` — 763 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`lacheGeo` 75 · `cleVerrouGeo` 95 · `geoVerrouille` 96 · `basculeVerrouGeo` 98
`boutonVerrouGeo` 113 · `modeGeometrie` 124 · `objetGeoSous` 148 · `groupeGeo` 158
`choisitGeo` 166 · `cadreGeo` 181 · `prisesGeo` 201 · `curseurGeo` 213
`dessinePoigneesGeo` 216 · `ecritDimensionsGeo` 244 · `nomSorteGeo` 256
`majPaletteGeo` 258 · `finGesteGeo` 297 · `enregistreGeo` 315 · `geometrieOrigine` 329
`retraceGeo` 344 · `pousseGeometrie` 355 · `appliqueDimensionGeo` 372
`enregistreAjout` 387 · `ajouteEmplacement` 402 · `renommeAjout` 430 · `lieAjout` 462
`ecritInfosAjout` 491 · `supprimeAjout` 518 · `choisitOutilGeo` 547 · `aideAjout` 554
`fermeAjout` 564 · `ajoutPointerDown` 573 · `ajoutPointerMove` 589 · `ajoutPointerUp` 611
`geometriePointerDown` 631 · `accrocheGeo` 662 · `geometriePointerMove` 664
`geometriePointerUp` 715 · `brancheRepriseEmplacements` 732

Importe :

aimants · calques-dessin · chemin-forme · configuration · dessin · distinctions · dom
donnees · emplacements · fenetre · fiche · fiche-zone · forme · geste-tenu · itineraire
libelles · mode-admin · modes-edition · noms-zones · ordre-trace · parcours · recherche
rendu · socle-dessin · vue · webgl

Importé par :

gestes-admin · outil-dessin · pile · plan-admin

### `modules/salon.mjs` — 75 l. → plan, plan-admin

- l.1 · Le salon et la page : ce que l'adresse et la construction disent

Fonctions :

`cheminDuSalon` 33 · `cheminPartageable` 44 · `entetesApi` 61

Importé par :

affiche-ici · ambiance · application · borne · charge-annoncee · configuration · demarrage
enregistrement · erreurs · essai-rappel · ici · installation · mesure · notifications
parcours · partage · plan · rappels · recherche · releve · rendu · sponsor · tutoriel
vignettes

### `modules/secteurs.mjs` — 215 l. → plan, plan-admin

- l.1 · Les secteurs du salon, et la teinte de chacun sur le plan

Fonctions :

`coloreChaleur` 29 · `confieChaleur` 33 · `champDecoupage` 36 · `premiere` 40
`valeurDecoupage` 51 · `confTeinte` 63 · `champsDecoupables` 84 · `indexeSecteurs` 103
`secteursMontres` 120 · `couleurConf` 124 · `couleurSecteur` 133 · `pastilleSecteur` 147
`coloreSecteurs` 160 · `peintSecteur` 205

Importe :

configuration · corps-fiche · couleurs · donnees · filtre · texte

Importé par :

chaleur · dessin · enregistrement · index-salon · pile · recherche · volets

Portes :

- `confieChaleur` (partition) — la teinte des secteurs, publique, laisse la place à la carte de chaleur, d'administration

### `modules/sejour.mjs` — 579 l. → plan, plan-admin

- l.1 · La préparation du séjour — répartir les stands, puis dérouler les jours

Fonctions :

`brancheSejour` 35 · `minutesVisite` 37 · `horairesSalon` 38 · `seuilConcentration` 39
`seuilImpose` 40 · `oublieMatrice` 87 · `finInstant` 92 · `pointConf` 100
`matriceJournee` 119 · `derouleJournee` 190 · `prepareSejour` 334 · `calculeSejour` 536
`apercuRepartition` 570

Importe :

charge-annoncee · donnees · itineraire · ordonnanceur · parcours · temps

Importé par :

journee · tiroir-itineraire

### `modules/session.mjs` — 147 l. → plan-admin, console, rapport, motdepasse

- l.1 · La session de l'exploitant, et l'appel à la base

Fonctions :

`accesBase` 15 · `contenuJeton` 42 · `resteJeton` 52 · `echangeSession` 68 · `base` 92
`initialesDe` 142

Importé par :

acces-admin · calage-carte · chaleur · enregistrement · fiche-zone · mot-de-passe
reglage-application · reglage-suggestion · socle-console

### `modules/seuil.mjs` — 179 l. → plan, plan-admin

- l.1 · Le parcours intelligent — le seuil de concentration

Fonctions :

`seuilGere` 74 · `seuilImpose` 75 · `seuilParSurface` 76 · `regleSeuil` 81
`aireDuStand` 99 · `seuilConcentration` 135 · `phraseSeuil` 158

Importe :

configuration · donnees · itineraire · terre

Importé par :

journee · reglages · volets

### `modules/socle-console.mjs` — 403 l. → console, rapport

- l.1 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`poseSession` 40 · `entetes` 63 · `renouvelle` 72 · `appel` 91 · `rest` 106
`ecranConfig` 125 · `ecranConnexion` 157 · `deconnecte` 223 · `signale` 238 · `bloc` 262
`grille` 280 · `idCompte` 297 · `themeSombre` 306 · `premierEcran` 324 · `brancheSocle` 339

Importe :

dom · fenetre-console · session

Importé par :

appel-fonction · avancement · comptes · console · duplication · ecran-console · evenements
export · fiche-detail · fiche-evenement · fuseau · provenance · rapport
rapport-utilisation · synchronisation

### `modules/socle-dessin.mjs` — 108 l. → plan-admin

- l.1 · Le socle de l'outil de dessin — ce que l'outil, l'éditeur et la reprise

Fonctions :

`instantane` 43 · `clotSalve` 54 · `memorise` 55 · `toleranceTrace` 68 · `fermeIci` 74
`remplitListeSocietes` 79 · `societeSaisie` 87 · `optionsModes` 98 · `pictoVerrou` 104

Importe :

calques-dessin · dessin · dom · enregistrement · reperes · texte · vue-etat

Importé par :

edition · outil-dessin · outil-escalier · reprise-emplacements

### `modules/sponsor.mjs` — 398 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 112 · `secondesSponsor` 115 · `modeSponsor` 128 · `sponsorRetenu` 147
`cleSponsor` 178 · `sponsorEnCache` 181 · `retientSponsor` 196 · `ouvreSponsor` 221
`suitSponsor` 314 · `resteSponsor` 339 · `fermeSponsor` 345 · `accueilleSponsor` 361
`brancheSponsor` 393

Importe :

configuration · dom · donnees · salon · sur · vue

Importé par :

borne · demarrage · installation · lancement · reglage-sponsor · tutoriel

### `modules/suggestion.mjs` — 329 l. → plan, plan-admin

- l.1 · La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 80 · `seuilSugg` 82 · `presentationsSugg` 106 · `presenteSugg` 112
`critereSugg` 117 · `suggestionCourante` 134 · `exposantPropose` 170 · `nomValeurSugg` 188
`phraseSuggestion` 209 · `carteSuggestion` 238 · `poseSuggestion` 288
`fenetreSuggestion` 303

Importe :

configuration · dom · donnees · fenetre · fiche · parcours · recherche · texte

Importé par :

reglage-suggestion · tiroir-parcours

### `modules/sur.mjs` — 191 l. → plan, plan-admin

- l.1 · Ce qui vient d'ailleurs, relu avant d'être affiché

Fonctions :

`lien` 22 · `adresseWeb` 30 · `adresseSure` 43 · `adresseImage` 71 · `imageSure` 84
`assainitRiche` 113 · `enBlocs` 161 · `rangeRiche` 174

Importe :

texte

Importé par :

corps-fiche · fiche · fiche-zone · index-salon · plan · recherche · sponsor

### `modules/synchronisation.mjs` — 280 l. → console

- l.1 · Synchronisation d'un salon — lancement, suivi, vignettes des logos

Fonctions :

`brancheSynchronisation` 35 · `etapesPressenties` 53 · `synchronise` 68
`fabriqueLesVignettes` 167 · `oublieLePlan` 265 · `envoieVignettes` 273

Importe :

appel-fonction · avancement · dom · encodeur-avif · evenements · marque · provenance
socle-console

Importé par :

ecran-console · fiche-evenement

### `modules/temps.mjs` — 129 l. → plan, plan-admin

- l.1 · Les dates et les heures du salon

Fonctions :

`momentLocal` 32 · `jourLong` 55 · `jourCourt` 62 · `dateDeCle` 69 · `jourBref` 75
`jourISO` 82 · `instantMural` 103 · `minutesDe` 117 · `ecritHeure` 119 · `ecritMinutes` 124

Importé par :

charge-annoncee · edition · fiche · horaires · itineraire · journee · parcours
points-interet · rappels · recherche · sejour · tiroir-parcours

### `modules/terre.mjs` — 173 l. → plan, plan-admin

- l.1 · Le plan sur la Terre — le calcul, sans la carte

Fonctions :

`metresParDegre` 23 · `tourneEnvirons` 40 · `versTerre` 46 · `versLePlan` 53 · `reancre` 68
`pixelsMercator` 87 · `latitudeDePixel` 96 · `echelleDesTuiles` 116 · `niveauDesTuiles` 128
`aireDuContour` 138 · `centreDuContour` 147 · `axeDuContour` 160

Importé par :

calage-carte · environs · seuil

### `modules/texte-plan.mjs` — 111 l. → plan, plan-admin

- l.1 · Le texte sur le plan — sa mesure, sa coupe en lignes, sa place
- l.18 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.102 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`mesureTexte` 26 · `largeur` 31 · `remesureTextes` 56 · `decoupe` 71 · `habille` 84
`lignesSvg` 95 · `ancre` 110 · `place` 111

Importe :

texte

Importé par :

affiche-ici · appels · dessin · gestes · libelle-place · libelles · nom-emplacement · plan
recherche

### `modules/texte.mjs` — 25 l. → plan, plan-admin, console, rapport

- l.1 · Le texte : l'écrire dans la page, le découper, le ranger

Fonctions :

`esc` 6 · `separeValeurs` 17

Importé par :

affiche-ici · apercus · classeur · corps-fiche · dessin · distinctions · ecran-console
edition · environs · fiche · fiche-detail · fiche-zone · filtre · fuseau · itineraire
libelles · nom-emplacement · outil-dessin · parcours · pile · points-interet · qr
rapport-utilisation · recherche · reglage-fiche · reglage-suggestion · rendu · secteurs
socle-dessin · suggestion · sur · texte-plan

### `modules/tiroir-itineraire.mjs` — 695 l. → plan, plan-admin

- l.1 · Itinéraire — le tiroir et la visée

Fonctions :

`calculeRoute` 73 · `champIti` 91 · `fermeSugg` 95 · `montreSugg` 102 · `choisitPoint` 136
`valideSaisie` 145 · `effaceItineraire` 157 · `relance` 186 · `montreResultat` 230
`majRappelRoute` 248 · `ecritResultat` 259 · `poseVisee` 403 · `confieVisee` 416
`suitLaVisee` 418 · `bandeauVisee` 420 · `armeVisee` 443 · `finVisee` 461
`viseItineraire` 477 · `visePoi` 483 · `visePoint` 489 · `ouvreItineraire` 517
`fermeItineraire` 552 · `quitteItineraire` 569 · `versItineraire` 576
`versItineraireDe` 579 · `brancheTiroirItineraire` 606

Importe :

calques-dessin · configuration · dom · donnees · ecran · forme-choisie · itineraire · mesure
parcours · rendu · sejour · tiroirs-exclusifs · trace-itineraire · vous-etes-ici

Importé par :

affiche-ici · borne · fiche · gestes · ici · journee · lancement · nappe · outil-dessin
points-interet · tutoriel · volets

Portes :

- `confieVisee` (registre) — la borne et le code « Vous êtes ici » y inscrivent leur propre visée ; la page publique n'a pas la seconde

### `modules/tiroir-parcours.mjs` — 286 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`rafraichitParcours` 50 · `remplitParcours` 80 · `ouvreParcours` 169 · `videLeParcours` 185
`brancheTiroirParcours` 215

Importe :

dom · donnees · fenetre · fiche · journee · options · parcours · partage · rappels
suggestion · temps · tiroirs-exclusifs

Importé par :

affiche-ici · borne · index-salon · lancement · reglage-suggestion · tutoriel

### `modules/tiroirs-exclusifs.mjs` — 49 l. → plan, plan-admin

- l.1 · Un seul des trois à la fois — la fiche, le parcours, l'itinéraire

Fonctions :

`inscritTiroirExclusif` 30 · `fermeTiroir` 37 · `fermeLesAutresTiroirs` 44

Importé par :

apparence · fiche · parcours · points-interet · rendu · tiroir-itineraire · tiroir-parcours

### `modules/tiroirs.mjs` — 514 l. → plan, plan-admin

- l.1 · Les tiroirs des écrans étroits — la liste, et ceux que la hauteur mène
- l.21 · Ce que les tiroirs lisent d'un geste
- l.67 · Le tiroir de la liste — écrans étroits
- l.293 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`traceurDeGeste` 45 · `cranVoisin` 64 · `retraitBas` 90 · `mesureTiroir` 103
`montreTiroir` 106 · `hisseTiroir` 110 · `tiroirListe` 117 · `tiroirCrante` 320
`brancheTiroirs` 500

Importe :

dom · ecran · panneau-criteres

Importé par :

fiche · lancement · recherche

### `modules/ton-barre.mjs` — 76 l. → plan, plan-admin

- l.1 · La couleur de la barre du système

Fonctions :

`poseTonDeLaBarre` 41 · `brancheTonDeLaBarre` 74

Importe :

dom

Importé par :

bande-admin · habillage · lancement

### `modules/toucher.mjs` — 57 l. → plan, plan-admin

- l.1 · Un toucher qui se sent — la vibration brève du téléphone

Fonctions :

`vibre` 34 · `interrupteur` 47

Importé par :

gestes

### `modules/tout-au-parcours.mjs` — 100 l. → plan, plan-admin

- l.1 · Tout ce que la recherche a retenu, versé d'un coup au parcours

Fonctions :

`retenusPourParcours` 35 · `ajouteToutAuParcours` 60 · `poseToutAuParcours` 83

Importe :

configuration · donnees · fenetre · filtre · parcours

Importé par :

recherche

### `modules/trace-itineraire.mjs` — 374 l. → plan, plan-admin

- l.1 · Le tracé d'un itinéraire sur le plan

Fonctions :

`poseTrace` 40 · `marchesIci` 42 · `rayonBout` 47 · `arreteTracage` 80 · `tronconsDe` 101
`traceDe` 119 · `peintItineraire` 122 · `lanceEtincelle` 203 · `pointA` 224
`courtEtincelle` 232 · `placePouls` 260 · `lanceTracage` 275 · `dessineItineraire` 300
`rafraichitBouts` 326 · `cadreItineraire` 349

Importe :

annonce · camera · dom · donnees · ecran · itineraire · vue

Importé par :

journee · libelles · rendu · tiroir-itineraire

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

Importé par :

outil-comptoir · webgl

### `modules/tutoriel.mjs` — 1032 l. → plan, plan-admin

- l.1 · La visite guidée — le tour du plan, geste par geste

Fonctions :

`route` 71 · `attente` 72 · `iti` 73 · `visee` 74 · `eteintVisee` 75 · `journee` 77
`vueJournee` 78 · `sejour` 79 · `iciActif` 81 · `dessinEnCours` 84 · `glissements` 113
`reglageTuto` 125 · `tutoPropose` 134 · `cleTuto` 138 · `tutoOuvert` 140 · `tutoModale` 141
`tutoFicheOuverte` 147 · `tutoFiche` 150 · `tutoParcours` 152 · `tutoItineraire` 156
`tutoJournee` 160 · `zoneDuTuto` 168 · `insecable` 185 · `phraseTrajetTuto` 191
`chapitresTuto` 451 · `proposeTutoriel` 471 · `lanceTutoriel` 529 · `quitteTutoriel` 616
`chapitreTuto` 627 · `battementTuto` 636 · `finTuto` 654 · `afficheTuto` 671
`attendsTiroirs` 721 · `pxTuto` 746 · `boiteTuto` 759 · `repereTuto` 774 · `rameneTuto` 807
`placeTuto` 845 · `voileTuto` 939 · `rafaleTuto` 956 · `marqueZoneTuto` 976
`marqueLibelleTuto` 1015

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

Importe :

calques-dessin · configuration · corps-fiche · dom · donnees · ecran · fenetre · fiche
forme-choisie · ici · itineraire · journee · libelle-place · parcours · rendu · salon
sponsor · tiroir-itineraire · tiroir-parcours · visite-guidee · vue · webgl

Importé par :

demarrage · installation · plan · volets

### `modules/vignettes.mjs` — 97 l. → plan, plan-admin

- l.1 · Les vignettes des logos — ce qui est arrivé, et où le demander

Fonctions :

`sansAvif` 40 · `vignettesLisibles` 54 · `adresseVignette` 75 · `adresseGrande` 96

Importe :

annonce · salon

Importé par :

demarrage · fiche · logos-stands · recherche

### `modules/visite-guidee.mjs` — 17 l. → plan, plan-admin

- l.1 · La visite guidée en cours — ou rien

Fonctions :

`poseTuto` 17

Importé par :

installation · rappels · tutoriel

### `modules/volets.mjs` — 1427 l. → plan-admin

- l.1 · Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —

Fonctions :

`secteurs` 60 · `voletAdmin` 71 · `blocOptions` 255 · `blocLangues` 302 · `blocBarre` 376
`blocHoraires` 434 · `voletParcours` 576 · `sallesSituees` 711 · `voletPmr` 727
`nomDuTon` 818 · `svgVignette` 827 · `barreVignette` 829 · `vignetteDistPlan` 833
`vignetteDistListe` 846 · `vignetteDistFiche` 860 · `salonDitSes` 880 · `coinPris` 887
`voletDist` 910 · `blocDecoupage` 1082 · `voletApparence` 1130

Importe :

ambiance · apercus · apparence · configuration · corps-fiche · distinctions · donnees
fenetre · fiche-zone · filtre · habillage · horaires · itineraire · libelles · mode-admin
modeles · nom-emplacement · nuancier · options · ordre-trace · polices-plan · recherche
reglage-application · reglage-installation · reglage-rappel · reglage-sponsor · secteurs
seuil · tiroir-itineraire · tutoriel

Importé par :

reglages

### `modules/vous-etes-ici.mjs` — 124 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le départ imposé, et son point sur le plan

Fonctions :

`pointBorne` 27 · `poseLieuBorne` 32 · `ecritDepartBorne` 42 · `rayonBorne` 52
`dessineBorne` 57 · `placePouls` 87 · `rafraichitBorne` 104 · `rempliBorne` 109

Importe :

dom · donnees · vue

Importé par :

borne · ici · journee · libelles · rendu · tiroir-itineraire

### `modules/vue-etat.mjs` — 58 l. → plan, plan-admin

- l.1 · L'état de la vue — la vue du moment, le SVG du plan, son cadre à l'écran

Fonctions :

`vue` 17 · `changeVue` 19 · `cadrePlan` 36 · `oublieCadre` 37 · `redresse` 48 · `incline` 55

Importe :

camera · dom

Importé par :

environs · logos-stands · socle-dessin · vue · vue · webgl

### `modules/vue.mjs` — 710 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.83 · 6. Vue

Fonctions :

`confieALaVue` 68 · `enEdition` 74 · `libelles` 75 · `poseEmprise` 81 · `figeTextes` 105
`rendTextes` 113 · `cadrage` 152 · `peintLibelles` 157 · `repeintLibelles` 165
`detacheLibelles` 169 · `rattacheLibelles` 181 · `etireLibelles` 199
`poseFacteurTrait` 214 · `suitLaVue` 230 · `versScene` 239 · `retiensVue` 258
`appliqueVue` 268 · `libellesDeLaVue` 337 · `rafraichitVue` 345 · `poseVue` 359
`mesureBarre` 388 · `masqueHaut` 416 · `masque` 423 · `masqueDroite` 460 · `fit` 471
`recadreIncline` 498 · `stoppeZoom` 540 · `glisseVersVise` 558 · `glisseVers` 604
`rectVisee` 631 · `zoom` 651 · `echelle` 665 · `versPlan` 677 · `brancheVue` 689

Importe :

camera · chemin-forme · dom · ecran · environs · ordre-trace · vue-etat · vue-etat · webgl

Importé par :

affiche-ici · appels · batiments · borne · calage-carte · cartouche-poi · chaleur
demarrage · dessin · edition · edition-en-cours · fiche · gestes · lancement · libelles
mini-carte · nappe · outil-comptoir · outil-dessin · outil-escalier · placement-libelles
plan · points-interet · recherche · rendu · reprise-emplacements · sponsor
trace-itineraire · tutoriel · vous-etes-ici

Portes :

- `confieALaVue` (rendu) — chaque image d'un geste rappelle, dans un ordre fixe, ce qui suit la vue : noms, poignées, pastilles, flèches, borne, calage

### `modules/webgl.mjs` — 3013 l. → plan, plan-admin

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`confieAuWebgl` 75 · `chargeWebgl` 119 · `brancheWebgl` 146 · `monteWebgl` 166
`poseToileWebgl` 300 · `guetteContexteWebgl` 306 · `contextePerduWebgl` 316
`verifieContexteWebgl` 323 · `perdContexteWebgl` 332 · `remonteWebgl` 355 · `vueDeck` 372
`enCamera` 392 · `vuesGl` 396 · `effetsGl` 420 · `basculeCamera` 430 · `vueWebgl` 443
`blocDe` 459 · `majEditionWebgl` 472 · `cleBloc` 484 · `planifieWebgl` 510
`toutRepeindreWebgl` 514 · `blocsDansLOrdre` 525 · `repeintWebgl` 530 · `pointsParMetre` 560
`assembleWebgl` 586 · `constTexte` 637 · `jeuDeCaracteres` 840 · `sousPixelOffert` 894
`couchesPetites` 902 · `filtreCouches` 937 · `poseGeste` 949 · `positionTexte` 965
`cleChoisi` 1005 · `versEcran` 1008 · `enveloppe` 1015 · `nomsCaches` 1026
`parametresTexte` 1055 · `nomsAPlat` 1064 · `couchesTexte` 1066 · `accVide` 1108
`convertitBloc` 1110 · `accDe` 1132 · `parcoursGl` 1149 · `resteDebout` 1199
`dedansAnneau` 1207 · `auDessusDuSol` 1232 · `surSonStand` 1241 · `standDeLaMarque` 1247
`marquesSurLesToits` 1259 · `hauteurVolume` 1276 · `zoneMeublee` 1306 · `poseJeton` 1354
`mul4` 1378 · `enColonnes` 1387 · `translation` 1388 · `homothetie` 1390 · `autourDuZ` 1391
`matriceJeton` 1400 · `corpsDansLeJeton` 1416 · `couchesJeton` 1424 · `couchesJetons` 1472
`meubleZone` 1514 · `dansLeHall` 1559 · `teinteDesFigurants` 1581 · `penchee` 1625
`couchesFigurants` 1636 · `eclatant` 1684 · `opaque` 1690 · `formeGl` 1697
`corpsDeclare` 1768 · `texteGl` 1777 · `imageGl` 1801 · `imageDressee` 1843
`socleImage` 1857 · `partage` 1869 · `designeGl` 1875 · `sortie` 1889 · `noteHauteur` 1895
`anticipeHausses` 1925 · `monteALAppui` 1951 · `rendLAppui` 1963 · `detacheVolume` 1973
`hauteurEnCours` 2010 · `hauteurHausse` 2016 · `echelleHausse` 2021 · `haussesParId` 2024
`arete` 2040 · `contourDe` 2042 · `ecraseContour` 2046 · `coucheContours` 2055
`formeDe` 2077 · `memesFormes` 2079 · `memesPoints` 2089 · `signeCouleurs` 2096
`masqueVolumes` 2105 · `aPlat` 2132 · `couchesDeBloc` 2134 · `modelesLibellesHtml` 2262
`poseModelesLibelles` 2272 · `lisModelesLibelles` 2278 · `groupesNoms` 2311
`couchesNoms` 2328 · `couchesPastilles` 2342 · `couchesLibellesWebgl` 2357
`couchesDessineesWebgl` 2393 · `stage` 2414 · `lectureDifferee` 2447 · `survolTrouve` 2483
`demandeSurvolWebgl` 2489 · `survoleWebgl` 2495 · `brancheSurvolWebgl` 2523
`poseSurvolWebgl` 2536 · `enTuiles` 2567 · `hauteurTuile` 2575 · `visePour` 2581
`gonfleSurvol` 2586 · `coucheTuileSoulevee` 2608 · `couchesTuiles` 2638
`poseCurseurWebgl` 2656 · `poseFocusWebgl` 2665 · `aplatsDe` 2672 · `coucheSurvol` 2675
`coucheSurvolVolume` 2691 · `coucheFocus` 2727 · `couchesPhare` 2757 · `lueurDe` 2774
`opacitePhare` 2812 · `echellePhare` 2813 · `couchesPhareNoms` 2816 · `palierDefile` 2841
`periodeDe` 2846 · `phaseDe` 2848 · `instant` 2858 · `animeCouche` 2859
`majAnimationWebgl` 2886 · `animeWebgl` 2894 · `reanime` 2931 · `logosSurLesToits` 2940
`objetSous` 2970 · `objetSousDiffere` 2975 · `lisObjet` 2979 · `cibleWebgl` 2984
`priseWebgl` 2994 · `libelleSousWebgl` 2999 · `rectEcranWebgl` 3004

Importe :

affichage · annonce · camera · chemin-forme · couleurs · decor · dom · donnees · figurants
itineraire · libelle-place · logos-stands · reperes · trace · vue-etat

Importé par :

batiments · edition · edition-en-cours · fiche · gestes · lancement · libelles
placement-libelles · plan · releve · reprise-emplacements · tutoriel · vue

Portes :

- `confieAuWebgl` (rendu) — la carte graphique lit la vue, les gestes et les noms de modules qui l'importent pour la monter

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

### `supabase/functions/_partage/octets.ts` — 31 l.

`octetsDeVignette` 12 · `typeDeVignette` 27

### `supabase/functions/_partage/push.ts` — 229 l.

`octets` 49 · `base64url` 57 · `colle` 63 · `texte` 71 · `cleDeSignature` 83
`jetonVapid` 105 · `derive` 131 · `chiffre` 145 · `pousse` 201

### `supabase/functions/_partage/svg.ts` — 216 l.

`r2` 24 · `points` 44 · `boite` 83 · `neDessineRien` 106 · `allege` 118 · `sansMasques` 196
`textes` 207

### `supabase/functions/_partage/version.ts` — 100 l.

`versionFond` 47 · `versionDuPlan` 92 · `condense` 96

### `supabase/functions/_partage/vignette.ts` — 67 l.

`cleDeVignette` 28 · `tranchesDAdresses` 52

### `supabase/functions/comptes/index.ts` — 263 l.

`cors` 39 · `service` 49 · `retourValide` 68

### `supabase/functions/mesure/index.ts` — 173 l.

`jeton` 80 · `client` 83

### `supabase/functions/plan-de-visite/index.ts` — 146 l.

`jeton` 57 · `client` 60 · `json` 67

### `supabase/functions/plan-public/index.ts` — 1170 l.

`cors` 53 · `db` 87 · `service` 102 · `vignettesParAdresse` 124 · `avecVignette` 170
`rendVignette` 211 · `rendGrande` 238 · `rendVignettes` 330 · `lu` 373 · `salon` 383
`appDuSalon` 409 · `rendIconeApp` 440 · `retraits` 545 · `ampute` 572 · `masquesDe` 615
`masquesDuPlan` 635

### `supabase/functions/rappels/index.ts` — 239 l.

`client` 68 · `cles` 75 · `json` 81 · `refus` 87 · `enregistre` 92 · `envoie` 149

### `supabase/functions/sync-evenement/index.ts` — 1894 l.

`cors` 43 · `bourre` 112 · `client` 122 · `ecrit` 144 · `gaia` 152 · `libellesChoix` 163
`retiensAnglais` 190 · `fournisseur` 208 · `raccourci` 216 · `enClair` 253 · `range` 279
`champsKlipso` 300 · `hebergee` 1842 · `nettoieUrl` 1870 · `groupeTextes` 1880

### `supabase/functions/vignettes/index.ts` — 253 l.

`cors` 27 · `service` 43 · `adressesDeLogos` 52 · `adressesDuSalon` 77

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
- `20261013091043_grande_vignette_des_logos.sql` — vignette_de_logo
- `20261013121249_vignettes_de_logos_en_avif.sql` — vignette_de_logo
- `20261013132628_grande_vignette_detouree.sql` — vignette_de_logo

## Le reste

- `src/index.mjs` — 1140 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `enApercu` 71 · `cacheDe` 81 · `ecritEnProduction` 88 · `ecartee` 91 · `dit` 152 `amontPour` 161 · `cleDe` 169 · `cleDeLot` 175 · `condense` 182 · `cleVersion` 206 `rangeLaVersion` 209 · `ditVersion` 217 · `meta` 226 · `gardable` 242 · `range` 248 `rafraichit` 255 · `entete` 290 · `oublie` 333 · `rappels` 423 · `cleApp` 468 `cheminDuSalon` 499 · `pageDuSalon` 516 · `appDuSalon` 540 · `iconesDuSalon` 586 `manifeste` 626 · `iconeApp` 716 · `mesure` 760 · `carteDuScript` 849 · `lieuDe` 862 `erreur` 876 · `planDeVisite` 917 · `chargePrevue` 956 · `surete` 992 · `aiguille` 1010
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
