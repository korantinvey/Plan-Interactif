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

### `_console.css` — 754 l. → console.css

- l.673 · Page de rapport

### `_entete.html` — 6 l.

### `_head.html` — 669 l. → demo.html, plan-admin.html, plan-smcl.html, plan.html

Éléments :

`#bandeAdmin` · `#bandeActs` · `#bandeau` · `#logoSalon` · `#titre` · `#hallsBande`
`#halls` · `#btnLangue` · `#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages`
`#btnItineraire` · `#menuCompte` · `#avatarCompte` · `#compteMail` · `#btnSortir`
`#alerteEnr` · `#alerteTxt` · `#alerteAct` · `#side` · `#poignee` · `#q` · `#videQ`
`#btnFiltres` · `#nFiltres` · `#panCrit` · `#critCorps` · `#critPied` · `#critVider`
`#critVoir` · `#actifs` · `#count` · `#countTxt` · `#list` · `#piedSide`
`#btnConfidentialite` · `#stage` · `#fondCarteGL` · `#fondFige` · `#fondTuiles`
`#fondCarte` · `#trouDuFond` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels`
`#calqueLibelles` · `#zIn` · `#zOut` · `#zFit` · `#choixAmbiance` · `#scaleBar`
`#scaleTxt` · `#creditCarte` · `#mentionOsm` · `#poi` · `#poiDefile` · `#viseur`
`#viseurTxt` · `#viseurStop` · `#routeRappel` · `#routeVoir` · `#routeResume`
`#routeEfface` · `#calageBat` · `#calageAngle` · `#calageQuart` · `#calageStop`
`#calageValide` · `#iciRappel` · `#iciRappelTxt` · `#iciStop` · `#bornePose` · `#bornePoser`
`#calage` · `#calageFerme` · `#calageCorps` · `#calageCarte` · `#calageEtat`
`#calageGarde` · `#outils` · `#outilsCalque` · `#renommeOutils` · `#replieOutils`
`#fermeOutils` · `#roleIti` · `#roleAide` · `#voirNappe` · `#aimants` · `#aimantPas`
`#contourReg` · `#contourRayon` · `#contourAimant` · `#traitReg` · `#traitEpaisseur`
`#traitStyle` · `#traitFleche` · `#texteADessiner` · `#repereType` · `#repereTransport`
`#repereMode` · `#repereLigne` · `#repereCouleur` · `#repereTexte` · `#imageSoc`
`#standSoc` · `#listeSoc` · `#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel`
`#elemType` · `#elemSupprimer` · `#elemPicto` · `#elemTransport` · `#elemMode`
`#elemLigne` · `#elemCouleur` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemDim` · `#elemLargeur` · `#elemHauteur`
`#elemTailleBloc` · `#elemTaille` · `#elemRotationBloc` · `#elemRotation`
`#elemRotationQuart` · `#elemRayonBloc` · `#elemRayon` · `#elemTraitReg` · `#elemEpaisseur`
`#elemStyle` · `#elemFleche` · `#elemSoc` · `#outilsAide` · `#annuleDernier` · `#libReg`
`#libNom` · `#libFerme` · `#libTaille` · `#libAngleChamp` · `#libAngle` · `#libAngleVal`
`#libAuto` · `#libAide` · `#geoReg` · `#geoNom` · `#geoFerme` · `#geoInfos` · `#geoCodeL`
`#geoCode` · `#geoSocL` · `#geoSoc` · `#geoTitreL` · `#geoTitre` · `#geoDim` · `#geoLargeur`
`#geoHauteur` · `#geoOrigine` · `#geoFiche` · `#geoSupprime` · `#geoAide` · `#modale`
`#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail`
`#poigneeFiche` · `#dRubans` · `#dGoIco` · `#dItinIco` · `#dMarque` · `#closeDetail`
`#dPast` · `#dName` · `#dRen` · `#dLogo` · `#dBadges` · `#dCode` · `#dVis` · `#dPartage`
`#dCorne` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dOngProd`
`#dOngNbProd` · `#dBody` · `#parcours` · `#poigneeParcours` · `#closeParcours` · `#pEyebrow`
`#pTitre` · `#pResume` · `#pActs` · `#btnJournee` · `#jRefaire` · `#btnPartage`
`#btnScanParcours` · `#jJours` · `#pCorps` · `#jCorps` · `#pPied` · `#videParcours`
`#jPied` · `#jRetour` · `#itineraire` · `#poigneeItineraire` · `#closeItineraire`
`#iResume` · `#iCorps` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange` · `#iArrivee`
`#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

### `_hors-ligne.html` — 45 l. → hors-ligne.html

Éléments :

`#reessaie`

### `_index.html` — 17 l. → index.html

Éléments :

`#secours`

### `_js.html` — 6 l.

Éléments :

`#data`

### `_langue.js` — 888 l. → admin-plans.html, demo.html, hors-ligne.html, index.html, motdepasse.html, plan-smcl.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_motdepasse.html` — 59 l. → motdepasse.html

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_styles-divers.css` — 314 l. → demo.html, plan-smcl.html

### `_styles-jetons.css` — 297 l. → demo.html, plan-smcl.html

### `_styles-modeles-parcours.css` — 1680 l. → demo.html, plan-smcl.html

### `_styles-modeles.css` — 836 l. → demo.html, plan-smcl.html

### `_styles-parcours.css` — 659 l. → demo.html, plan-smcl.html

### `_styles-plan.css` — 1738 l. → demo.html, plan-smcl.html

### `_styles-vitrine.css` — 199 l. → demo.html, plan-smcl.html

### `_sw.js` — 646 l. → sw.js

Fonctions :

`estUneTuile` 130 · `gardee` 188 · `range` 196 · `oublieLesVersionsDAvant` 222
`dabordCache` 243 · `seLit` 280 · `borneLesLots` 302 · `borneLesTuiles` 340
`demandeTiers` 395 · `commePosee` 403 · `tuileDeCarte` 420 · `fondDeCarte` 456
`dabordReseau` 483 · `navigation` 503

### `modules/abords-salles.mjs` — 244 l. → plan, plan-admin

- l.1 · Les abords d'une salle qui se vide

Fonctions :

`regleFoule` 66 · `ecarteFoule` 83 · `heureAuSalon` 87 · `sallesEnMouvement` 96
`oublieFoules` 128 · `foule` 140 · `bilanFoule` 228

Importe :

donnees · grille-marche · recherche-chemin · temps

Importé par :

itineraire · itineraire · troncon

### `modules/acces-admin.mjs` — 282 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`litLocal` 34 · `configuration` 39 · `normaliseUrlA` 43 · `sessionValide` 59
`ecranAcces` 77 · `contenuDuJeton` 186 · `mailDuJeton` 187 · `litProfilA` 198
`poseCompte` 213 · `brancheAcces` 238

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

Importe :

demarrage · dom · evenement · session

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

demarrage · environs · releve · sonde · webgl

### `modules/affiche-ici.mjs` — 407 l. → plan-admin

- l.1 · « Vous êtes ici » — l'affiche à coller, côté exploitant

Fonctions :

`visee` 35 · `vise` 36 · `prefixePlan` 57 · `coteIci` 69 · `nomCodeIci` 85 · `codeIci` 104
`lienIci` 125 · `pointTouche` 152 · `codeIciAuPoint` 164 · `armeCodeIci` 170
`lieuAffiche` 195 · `afficheIci` 198 · `ligneAffiche` 239 · `nomFichierIci` 248
`ouvreCodeIci` 263 · `boutonsCodeIci` 315 · `telechargeAfficheIci` 340
`imprimeAfficheIci` 358 · `boutonCodeIci` 387

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

### `modules/ambiance.mjs` — 225 l. → plan, plan-admin

- l.1 · L'ambiance du plan — Classique, Tuiles, Immersif

Fonctions :

`figurantsRetenus` 61 · `nomsAPlatRetenus` 68 · `logosRetenus` 74 · `capRetenu` 79
`ambianceRetenue` 86 · `anneaux` 92 · `f3` 104 · `rayonTuile` 131 · `retire` 136
`arrondi` 151 · `traceStand` 178 · `tuilesPosees` 183 · `essaieAmbiance` 188
`appliqueAmbiance` 193

Importe :

camera · configuration · donnees · figurants · logos-stands · salon

Importé par :

apparence · choix-ambiance · dessin · distinctions · outil-comptoir · outil-foodtruck
rendu · volets

### `modules/apercus.mjs` — 329 l. → plan-admin

- l.1 · Les aperçus de la fenêtre des réglages — l'exploitant seul

Fonctions :

`texteCorps` 85 · `clesPortees` 110 · `standApercu` 130 · `lignesApercu` 157
`contenuApercu` 187 · `apercuFiche` 224 · `apercuListe` 301 · `apercuDuo` 323

Importe :

corps-fiche · donnees · recherche · texte

Importé par :

reglage-fiche · volets

### `modules/apparence.mjs` — 260 l. → plan, plan-admin

- l.1 · L'apparence des calques, et les commandes posées sur le plan

Fonctions :

`fondDe` 42 · `remplitCalque` 43 · `styleFond` 62 · `lisSous` 101 · `sousCalques` 103
`styleDataGroupe` 119 · `appliqueCouleursData` 128 · `styleData` 167
`appliqueApparence` 173 · `appliqueCommandes` 249

Importe :

ambiance · calque-detache · configuration · couleurs · distinctions · dom · donnees
habillage · habillage-svg · options · parcours · recherche · tiroirs-exclusifs

Importé par :

enregistrement · pile · rendu · volets

### `modules/appel-fonction.mjs` — 130 l. → console

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

### `modules/avancement.mjs` — 431 l. → console

- l.1 · L'avancement d'une synchronisation — la fenêtre, et son secours

Fonctions :

`fenetreAvancement` 44 · `suitAuServeur` 387

Importe :

fenetre-console · socle-console

Importé par :

synchronisation

### `modules/bande-admin.mjs` — 124 l. → plan-admin

- l.1 · 10. Mode administration — son ouverture, et la bande de l'outil

Fonctions :

`activeAdmin` 33

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

Importe :

acces-admin · affiche-ici · demarrage · dessin · dom · donnees · enregistrement · mode-admin
ordre-trace · reglages · rendu · ton-barre

Importé par :

plan-admin

### `modules/bandes.mjs` — 85 l. → plan, plan-admin

- l.1 · Les bandes qui défilent — fondu du bord, flèche qui avance

Fonctions :

`BANDES` 27 · `majFondus` 45 · `marqueFondus` 54 · `brancheBandes` 68

Importé par :

cartouche-poi · lancement · recherche · rendu

### `modules/bases-klipso.mjs` — 250 l. → console

- l.1 · Bases Klipso — le menu des bases connues, et la saisie d'une base neuve

Fonctions :

`chargeBases` 32 · `enregistreBase` 37 · `date` 44 · `choixBase` 61

Importe :

socle-console

Importé par :

ecran-console · fiche-evenement

### `modules/batiments.mjs` — 611 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 66 · `bibliothequeDispo` 67 · `refBatiment` 84 · `refForme` 88
`marqueBatiment` 91 · `batimentsPoses` 94 · `estBatiment` 101 · `hallsPoses` 104
`lieuDuCalque` 110 · `poseCalage` 116 · `ouvreBibliotheque` 125 · `vueDuLieu` 227
`lanceCalage` 269 · `effaceLeTempsDuCalage` 297 · `cadreCalage` 316 · `finCalage` 329
`pivoteCalage` 342 · `degresCalage` 358 · `dessineCalage` 363 · `calagePointerDown` 386
`calagePointerMove` 399 · `calagePointerUp` 415 · `reposeBatiment` 428
`ajouteBatiments` 444 · `brancheBatiments` 497 · `boutonRecale` 539 · `pictoRecale` 548
`calageRelu` 565 · `rouvreCalage` 591

Importe :

calques-dessin · configuration · dessin · dom · donnees · fenetre · geste-tenu · mode-admin
ordre-trace · outil-dessin · rendu · vue · webgl

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

### `modules/cadre-visible.mjs` — 79 l. → plan, plan-admin

- l.1 · La part du cadre que le visiteur voit

Fonctions :

`INTEGRE` 28 · `hauteurVue` 46 · `suisLeCadre` 54

Importé par :

fenetre · tiroirs

### `modules/calage-carte.mjs` — 926 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 68 · `centrePavillon` 83 · `basculeMasqueCarte` 88
`boutonMasqueCarte` 99 · `pictoMasque` 110 · `carreDeTerrain` 137 · `chercheBatiments` 153
`empriseDesObjets` 181 · `batimentsCandidats` 199 · `caleSurBatiment` 220
`retientLeHall` 246 · `manqueCalage` 268 · `enregistreCalage` 277 · `figeEtEnregistre` 305
`calageEnregistre` 334 · `oublieCalageEnCours` 362 · `litCoordonnees` 376
`rafraichitCarte` 390 · `armeCalage` 429 · `pivotCalage` 440 · `glisseCarte` 444
`cartePointerDown` 451 · `cartePointerMove` 465 · `cartePointerUp` 484 · `ditCalage` 492
`majCalage` 501 · `appliqueCalage` 523 · `tourneCalage` 530 · `construitCalage` 536
`ouvreCalage` 708 · `fermeCalage` 718 · `brancheCalageCarte` 730 · `voletEnvirons` 755

Importe :

configuration · dom · donnees · enregistrement · environs · fenetre · fige-carte
geste-tenu · gestes · itineraire · lot-fige · mode-admin · ordre-trace · rendu · session
terre · vue

Importé par :

gestes-admin · pile · plan-admin · reglages

### `modules/calque-detache.mjs` — 37 l. → plan, plan-admin

- l.1 · La copie détachée d'un calque de Klipso

Fonctions :

`copieDuCalque` 29

Importé par :

apparence · webgl

### `modules/calques-dessin.mjs` — 258 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — ce que le poste en garde

Fonctions :

`enAttente` 63 · `litRange` 90 · `ouvreDessins` 102 · `reprendCommun` 127
`notePubliees` 153 · `rangeDessins` 171 · `dejaPubliee` 176 · `marqueAttente` 182
`mesCalques` 197 · `calquesSurs` 210 · `poseCalqueActif` 250 · `poseOutil` 251
`poseEbauche` 255 · `trouveCalque` 257 · `nouvelId` 258

Importe :

configuration · donnees · evenement · geste-tenu

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

evenement

Importé par :

ambiance · environs · libelles · logos-stands · outil-comptoir · outil-escalier
outil-foodtruck · trace-itineraire · vue · vue-etat · webgl

### `modules/cartouche-poi.mjs` — 349 l. → plan, plan-admin

- l.1 · Les points d'intérêt sur le plan — le cartouche, la mise en avant, le

Fonctions :

`oublieReperes` 52 · `reperesCherchables` 54 · `clePoi` 131 · `cartouchePoi` 133
`mesureCartouche` 247 · `pharePoi` 263 · `phareRepere` 267 · `phareZone` 269
`eclairePoi` 275 · `poiActif` 302 · `libellePoiChoisi` 303 · `retenusParPoi` 318
`oublieChoixPoi` 344

Importe :

bandes · calques-dessin · configuration · dom · donnees · etat-emplacements · evenement
forme-choisie · itineraire · reperes · texte · vue

Importé par :

dessin · enregistrement · fiche-zone · index-salon · libelles · points-interet · recherche
reglage-recherche

### `modules/chaleur.mjs` — 829 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.576 · Remise à zéro des compteurs

Fonctions :

`nbChal` 60 · `tonChaleur` 79 · `niveauChaleur` 101 · `valeurChaleur` 104
`chargeChaleur` 117 · `coloreChaleur` 163 · `dessineHalos` 254 · `cartoucheChaleur` 294
`mesureCartoucheChaleur` 371 · `replieChaleur` 377 · `ecritEtatChaleur` 388
`dessineEchelleChaleur` 396 · `dessineTopChaleur` 416 · `phraseChaleur` 458
`rafraichitChaleur` 487 · `montreChaleur` 525 · `rangChaleur` 558 · `aplati` 598
`voletMesure` 607 · `evenementCourant` 633 · `relitRaz` 659 · `ouvreRemiseAZero` 662
`lanceRemiseAZero` 760 · `brancheChaleur` 819

Éléments :

`#chalReduit` · `#chalPer` · `#chalRendu` · `#chalEch` · `#chalEtat` · `#chalTop`

Importe :

dom · donnees · etat-emplacements · fenetre · fiche · mode-admin · secteurs · session
trace · vue

Importé par :

pile · plan-admin · reglage-suggestion · reglages

### `modules/charge-annoncee.mjs` — 242 l. → plan, plan-admin

- l.1 · La charge annoncée — ce que les autres journées ont déjà posé

Fonctions :

`seuilConcentration` 24 · `identifiantParcours` 26 · `parcours` 28 · `sejour` 30
`brancheCharge` 39 · `chargeSuivie` 84 · `etapesDuSejour` 90 · `annoncePlan` 118
`celluleUtile` 163 · `dilatationDuJour` 180 · `litLaCharge` 217 · `chargeCellule` 237

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

dessin · edition · environs · gestes-admin · grille-marche · outil-dessin
reprise-emplacements · vue · webgl

### `modules/choix-ambiance.mjs` — 45 l. → plan, plan-admin

- l.1 · Le choix de l'ambiance, offert au visiteur

Importe :

ambiance · demarrage · dom · salon

Importé par :

plan

### `modules/classeur.mjs` — 236 l. → console, rapport

- l.2 · Classeur — écrire un vrai fichier Excel, sans bibliothèque

Fonctions :

`CRC_TABLE` 30 · `crc32` 40 · `archiveZip` 55 · `texteXml` 112 · `colonneXl` 115
`XL_PARTS` 126 · `feuilleXl` 180 · `classeurXl` 216 · `enregistreFichier` 227

Importe :

texte

Importé par :

export

### `modules/comptes.mjs` — 379 l. → console

- l.1 · Comptes et accès — l'annuaire, et la fiche d'une personne

Fonctions :

`poseComptes` 37 · `litMonProfil` 58 · `RETOUR_MDP` 71 · `litComptes` 73 · `ligneMessage` 86
`casesSalons` 96 · `ouvreComptes` 126 · `ouvreFicheCompte` 228

Importe :

appel-fonction · dom · evenements · fenetre-console · focus-fenetre · socle-console

Importé par :

ecran-console · fiche-evenement

### `modules/configuration.mjs` — 185 l. → plan, plan-admin

- l.1 · La configuration du plan — ce que l'exploitant a réglé

Fonctions :

`salonRange` 30 · `cleConf` 32 · `cleAttenteConf` 43 · `poseReglagesEnAttente` 49
`reposeReglagesEnAttente` 59 · `ouvreConf` 67 · `reglagesDuSalon` 95 · `enregistreConf` 128
`copieLocaleTient` 139 · `conf` 142 · `jeton` 143 · `sousCle` 145 · `optionActive` 151
`programmeOffert` 156 · `suggestionOfferte` 157 · `langueOfferte` 177 · `appliqueLangue` 179
`chercheSorte` 184

Importe :

donnees · evenement · salon

Importé par :

ambiance · apparence · batiments · calage-carte · calques-dessin · cartouche-poi · dessin
distinctions · emplacements · enregistrement · environs · fiche-zone · filtre · habillage
horaires · index-salon · installation · libelle-place · modeles · nappe · nom-emplacement
options · ordre-calques · ordre-trace · outil-comptoir · outil-dessin · outil-foodtruck
parcours-recu · partage · pile · pile · placement-libelles · polices-plan · rappels
recherche · reglage-comptoir · reglage-foodtrucks · reglage-installation · reglage-rappel
reglage-recherche · reglage-sponsor · reglage-suggestion · reglages · rendu
reprise-emplacements · secteurs · seuil · sponsor · style-habillage · suggestion
tiroir-itineraire · tout-au-parcours · tutoriel · volets · webgl

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

### `modules/correspondance.mjs` — 127 l. → console

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

### `modules/debord-allees.mjs` — 116 l. → plan, plan-admin

- l.1 · Le débord des noms sur les allées — la place libre autour d'un stand

Fonctions :

`boiteDe` 21 · `contient` 22 · `croise` 23 · `debordsAuxAllees` 62

Importé par :

nom-emplacement

### `modules/decor.mjs` — 788 l. → plan, plan-admin

- l.1 · Le décor du plan — le mobilier des zones de l'organisateur

Fonctions :

`dedans` 44 · `repere` 57 · `reglageComptoirValide` 79 · `comptoir` 102
`comptoirTient` 128 · `rapprocheComptoir` 149 · `poigneeComptoir` 185
`reglageCamionsValide` 222 · `coinsCamion` 226 · `dansCamion` 233 · `camionTient` 245
`camionsSeGenent` 253 · `camionsDOffice` 262 · `echelleCamions` 294 · `camionDe` 297
`camions` 312 · `figeCamions` 325 · `ajouteCamion` 341 · `poigneeCamion` 374
`enseignesCamions` 399 · `fondSalle` 445 · `meuble` 477 · `objetRepere` 715 · `tourneur` 732
`etendueObjet` 738 · `rayonPoigneeObjet` 742 · `poigneeObjet` 759 · `objetDroit` 764

Importé par :

edition · fiche-zone · libelles · outil-comptoir · outil-escalier · outil-foodtruck
reglage-comptoir · reglage-foodtrucks · rendu · webgl

### `modules/demarrage.mjs` — 501 l. → plan, plan-admin

- l.1 · 12. Démarrage — l'appel du plan, sa version, la panne réseau

Fonctions :

`recadreListePosee` 86 · `demarre` 107 · `annonce` 176 · `panneDuChargement` 211
`panne` 221 · `echec` 234 · `proposeDeReessayer` 255 · `lis` 279 · `oublieLaCopie` 300
`litLePlan` 324 · `CLE_VERSION` 345 · `versionRetenue` 346 · `retientVersion` 349
`demandePlan` 375 · `adresseAdmin` 403 · `demandeAdmin` 404 · `prechargeAdmin` 420
`planAdmin` 433 · `charge` 442 · `brancheDemarrage` 483

Importe :

affichage · borne · dom · donnees · erreurs · evenement · fiche · ici · index-salon
installation · mode-admin · parcours-recu · recherche · rendu · salon · sponsor · tutoriel
vignettes · vue

Importé par :

acces-admin · bande-admin · choix-ambiance · enregistrement · fiche-zone · lancement
releve · sonde

### `modules/densite-rendu.mjs` — 90 l. → plan, plan-admin

- l.1 · La densité du rendu — moins de pixels pour les téléphones modestes

Fonctions :

`estModeste` 49 · `plafonne` 59 · `appareilModeste` 68 · `densiteRendu` 82
`pixelsDuDessin` 88

Importe :

mesures-page

Importé par :

logos-stands · webgl

### `modules/depot-image.mjs` — 73 l. → plan-admin, console

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

Importé par :

fiche-zone · icone-app · icone-onglet · reglage-foodtrucks

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

### `modules/detourage.mjs` — 221 l. → plan, plan-admin, console

- l.1 · Le détourage d'un logo — son fond blanc retiré, pixel par pixel

Fonctions :

`detoure` 46 · `creux` 136 · `largeur` 191 · `longueur` 211

Importé par :

detourage-travail · logos-stands · marque · reglage-foodtrucks

### `modules/distinctions.mjs` — 471 l. → plan, plan-admin

- l.1 · Les distinctions d'un exposant — nouveau venu, adhérent d'un syndicat

Fonctions :

`texteDist` 54 · `texteCourtDist` 59 · `porteDist` 63 · `standPorte` 67 · `calqueDists` 79
`traceDist` 110 · `coinDuTrace` 174 · `coinDeBoite` 215 · `oublieDists` 226
`teinteDist` 233 · `modesDuPlan` 235 · `releveDists` 239 · `dessineDists` 268
`marquesListe` 305 · `poseDistsFiche` 335 · `refaitDistsFiche` 375 · `modeDist` 421
`couleurDist` 433 · `appliqueDists` 455

Importe :

ambiance · configuration · corps-fiche · couleurs · dom · donnees · jetons-racine · texte

Importé par :

apparence · fiche · points-interet · recherche · reglages · rendu · reprise-emplacements
volets

### `modules/dom.mjs` — 23 l. → plan, plan-admin, console, rapport, motdepasse

- l.1 · Le document : ce que tout le code demande à la page

Fonctions :

`$` 10 · `auDoigt` 21

Importé par :

acces-admin · affiche-ici · aimants · apparence · bande-admin · batiments · borne
calage-carte · cartouche-poi · chaleur · choix-ambiance · comptes · demarrage · dessin
distinctions · ecran-console · edition · enregistrement · environs · fenetre
fenetre-console · fiche · fiche-evenement · fiche-zone · gestes · gestes-admin
glisse-fenetre · habillage · ici · index-salon · installation · journee · libelles
ligne-liste · logos-stands · mesure · mode-admin · modeles · mot-de-passe · nappe
ordre-calques · ordre-trace · outil-dessin · panneau-criteres · parcours · partage · pile
placement-libelles · points-interet · rappels · rapport-utilisation · recherche · reglages
rendu · reprise-emplacements · scan-parcours · socle-console · socle-dessin · sponsor
suggestion · synchronisation · tiroir-itineraire · tiroir-parcours · tiroirs · ton-barre
trace-itineraire · tutoriel · vous-etes-ici · vue · vue-etat · webgl

### `modules/donnees.mjs` — 105 l. → plan, plan-admin

- l.1 · Les données du plan, leurs index, et ce que la vue regarde

Fonctions :

`poseDonnees` 54 · `societes` 83 · `P` 105

Importé par :

abords-salles · affiche-ici · aimants · ambiance · apercus · apparence · appels
application · bande-admin · batiments · borne · calage-carte · calques-dessin
cartouche-poi · chaleur · charge-annoncee · configuration · corps-fiche · demarrage · dessin
distinctions · edition · emplacements · enregistrement · environs · etat-emplacements
fiche · fiche-zone · fige-carte · filtre · gestes · ici · index-salon · installation
journee · libelles · logos-stands · mesure · mini-carte · nappe · noms-zones · ordre-trace
outil-dessin · parcours · parcours-recu · partage · pile · placement-libelles
points-interet · rappels · recherche · reglage-application · reglage-fiche
reglage-recherche · reglage-suggestion · reglages · releve · rendu · reprise-emplacements
secteurs · sejour · seuil · socle-dessin · sonde · sponsor · suggestion · tiroir-itineraire
tiroir-parcours · tout-au-parcours · trace-itineraire · trajet · tutoriel · volets
vous-etes-ici · webgl

### `modules/duplication.mjs` — 51 l. → console

- l.1 · Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

Fonctions :

`brancheDuplication` 21 · `dupliquer` 25

Importe :

evenements · fenetre-console · socle-console

Importé par :

ecran-console

### `modules/ecran-console.mjs` — 395 l. → console

- l.1 · L'écran de la console — la barre du haut, le choix du salon, le démarrage

Fonctions :

`charge` 43 · `selonAdresse` 81 · `majAdresse` 89 · `majBarre` 104 · `dessineChoix` 160
`majLiens` 200 · `videEcran` 241 · `dessine` 252 · `demarre` 268 · `brancheConsole` 286

Importe :

bases-klipso · comptes · dom · duplication · evenements · export · fenetre-console
fiche-evenement · socle-console · synchronisation · texte

Importé par :

console

### `modules/ecran.mjs` — 15 l. → plan, plan-admin

- l.1 · L'écran — étroit ou large, mouvement réduit ou non

Fonctions :

`ETROIT` 15

Importé par :

dessin · fiche · gestes · glisse-fenetre · logos-stands · mini-carte · recherche
tiroir-itineraire · tiroirs · trace-itineraire · tutoriel · vue

### `modules/ecritures-en-file.mjs` — 95 l. → plan, plan-admin, console

- l.1 · Les écritures en file — l'écran change au clic, la base dit le dernier mot

Fonctions :

`creeFileEcritures` 50

Importé par :

fiche-detail · fiche-evenement · provenance · rappels · reglage-application · reglage-fiche
reglages

### `modules/edition-en-cours.mjs` — 43 l. → plan, plan-admin

- l.1 · L'édition en cours — le plan est-il sous un outil de l'exploitant ?

Fonctions :

`enEdition` 37

Importe :

calques-dessin · emplacements · libelle-place · mode-admin · vue · webgl

Importé par :

plan

### `modules/edition.mjs` — 739 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`curseurPoignee` 57 · `poignees` 62 · `dessinePoignees` 71 · `cadreTexte` 106
`poigneeRotation` 126 · `angleBorne` 136 · `choisitForme` 138 · `replieOutils` 153
`degageOutils` 168 · `majElement` 177 · `candidatsLiaison` 300 · `ecritDesDeuxCotes` 322
`changeLien` 337 · `changeDureeLien` 353 · `majLiens` 370 · `appliqueSociete` 422
`appliqueTexte` 438 · `repereAObjet` 448 · `appliqueRotation` 453 · `appliqueRayon` 467
`appliqueTrait` 480 · `appliqueTransport` 508 · `appliquePicto` 531 · `supprimeForme` 557
`editionPointerDown` 567 · `editionPointerMove` 632 · `tourneTexte` 702
`editionPointerUp` 718

Importe :

aimants · calques-dessin · chemin-forme · decor · dessin · dom · donnees · forme-choisie
geste-tenu · itineraire · mode-admin · reperes · socle-dessin · temps · texte · vue · webgl

Importé par :

gestes-admin · outil-dessin

### `modules/emplacements.mjs` — 293 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`cleGeo` 51 · `poseSorteGeo` 60 · `geometrieSource` 73 · `reposeSource` 82
`poseGeometrie` 91 · `retoucheGeo` 105 · `elargitEmprise` 121 · `appliqueGeometries` 142
`cleAjout` 183 · `estLie` 196 · `anneauxValides` 200 · `rechAjout` 205 · `objetAjoute` 214
`poseLien` 233 · `appliqueAjouts` 261

Importe :

configuration · dessin · donnees · forme · mode-admin · noms-zones · texte

Importé par :

edition-en-cours · fiche-zone · gestes-admin · index-salon · outil-dessin · pile
reprise-emplacements

### `modules/encodeur-avif.mjs` — 94 l. → console

- l.1 · L'encodeur AVIF des vignettes de logos — console seulement

Fonctions :

`script` 40 · `encodeurAvif` 55 · `avif64` 78

Importé par :

synchronisation

### `modules/enregistrement.mjs` — 868 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.696 · La sauvegarde emportée

Fonctions :

`posteTient` 75 · `enregistreDessins` 77 · `autoDispo` 160 · `enRetard` 163
`etatCourant` 178 · `majAttente` 189 · `compteRescapes` 203 · `ditAlerte` 216
`ditEtat` 267 · `programmeEnvoi` 274 · `programmePublication` 288 · `rattrapeRetard` 302
`envoie` 308 · `apresGeste` 320 · `presse` 330 · `brancheEnregistrement` 338
`identifiants` 361 · `reglagesSeuls` 376 · `noteReglagesCharges` 391
`noteAttenteReglages` 439 · `oublieCache` 469 · `pousseConfiguration` 488
`sauvegardeCourante` 716 · `telechargeSauvegarde` 738 · `appliqueSauvegarde` 772
`litSauvegarde` 828 · `brancheSauvegarde` 850

Importe :

acces-admin · aimants · apparence · calques-dessin · cartouche-poi · configuration
demarrage · dessin · dom · donnees · evenement · fenetre · geste-tenu · index-salon
itineraire · mode-admin · nappe · ordre-trace · salon · secteurs · session

Importé par :

bande-admin · calage-carte · fige-carte · outil-dessin · plan-admin · reglage-application
socle-dessin

### `modules/environs.mjs` — 1343 l. → plan, plan-admin

- l.1 · 16. Les environs — le pavillon dans son quartier

Fonctions :

`poseCalageEnCours` 56 · `styleSobre` 129 · `forceCarte` 223 · `vueLibre` 230
`calagePose` 240 · `calageCourant` 252 · `fondCourant` 255 · `recul` 260 · `zoneDuFond` 278
`bornesDuFond` 287 · `borneLeStyle` 300 · `adresseTuile` 312 · `tuilesDeLaVue` 322
`figeCourant` 398 · `figeAJour` 407 · `recaleFige` 446 · `videFige` 459 · `poseFige` 468
`placeFigee` 567 · `chargeMapLibre` 626 · `vueGL` 660 · `vueGLValable` 683
`styleDuFond` 699 · `styleDeLaCarte` 706 · `guetteLaCarte` 733 · `recaleCarteGL` 767
`redessineCarteGL` 787 · `poseCarteGL` 817 · `diagnostiqueGL` 941 · `relanceCarteGL` 961
`retireCarteGL` 975 · `guetteRetourGL` 1002 · `carteGLPerdue` 1009 · `verifieCarteGL` 1019
`videCarteGL` 1037 · `inclineFond` 1071 · `dessineFondCarte` 1120 · `cleMasqueCarte` 1254
`masqueCarte` 1255 · `formesMasquantes` 1264 · `contourDuHall` 1286 · `cheminDuHall` 1293
`poseMasqueCarte` 1311 · `ditCarte` 1326 · `refaitFondCarte` 1336

Importe :

affichage · calques-dessin · camera · chemin-forme · configuration · dom · donnees
evenement · lot-fige · terre · texte · vue-etat

Importé par :

calage-carte · dessin · fige-carte · gestes · sonde · vue

### `modules/erreurs.mjs` — 142 l. → plan, plan-admin

- l.1 · Les erreurs de la page, signalées

Fonctions :

`denous` 46 · `lieuDansLaPile` 54 · `envoie` 60 · `signale` 72 · `retiens` 86
`bilanErreurs` 102 · `signaleErreur` 117 · `brancheErreurs` 126

Importe :

mesure · salon

Importé par :

demarrage · lancement · sonde · vue · webgl

### `modules/essai-rappel.mjs` — 75 l. → plan-admin

- l.1 · L'essai d'un vrai rappel, depuis les réglages

Fonctions :

`essaieRappelReel` 41

Importe :

notifications · rappels · salon

Importé par :

reglage-rappel

### `modules/etat-emplacements.mjs` — 164 l. → plan, plan-admin

- l.1 · L'état des stands et des zones, tel que le dessin le lit

Fonctions :

`emplacements` 61 · `groupeEmplacement` 91 · `cleEmplacement` 107 · `poseChoisi` 127
`poseRetires` 128 · `posePhares` 129 · `poseSecteurs` 130 · `poseChaleurs` 131
`poseRepris` 132 · `poseCibleTuto` 133 · `cleDuGroupe` 136 · `etatEmplacement` 150

Importe :

donnees

Importé par :

cartouche-poi · chaleur · fiche · fiche-zone · outil-comptoir · outil-foodtruck · plan
points-interet · recherche · reprise-emplacements · secteurs · tutoriel · webgl

### `modules/evenement.mjs` — 45 l. → plan, plan-admin, console

- l.1 · Un événement — dire ce qui vient de se passer, sans savoir qui écoute

Fonctions :

`creeEvenement` 37

Importé par :

acces-admin · calques-dessin · camera · cartouche-poi · configuration · demarrage
enregistrement · environs · fenetre · fiche-zone · habillage-svg · index-salon
logos-stands · ordre-trace · parcours · rendu · tiroir-itineraire · trace-itineraire
traduction · vignettes · webgl

### `modules/evenements.mjs` — 142 l. → console

- l.1 · Les salons de la console, celui qu'on regarde, et leurs pavillons

Fonctions :

`poseEvenements` 42 · `slugifie` 53 · `evenementParId` 59 · `courant` 61 · `poseSurSalon` 73
`chargePlans` 78 · `confirmeEcriture` 106 · `rangDesEcritures` 117 · `gardeEcrits` 126
`majEvenement` 135

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

### `modules/fenetre-console.mjs` — 151 l. → console, rapport

- l.1 · La fenêtre de la console et du rapport

Fonctions :

`verseModale` 31 · `ouvreModale` 43 · `verrouilleModale` 68 · `fermeModale` 70
`poseFenetre` 79 · `gardeLaPlace` 106 · `demande` 117 · `confirme` 145

Importe :

dom · focus-fenetre

Importé par :

avancement · comptes · duplication · ecran-console · fiche-detail · fiche-evenement
provenance · socle-console

### `modules/fenetre.mjs` — 167 l. → plan, plan-admin

- l.1 · La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire

Fonctions :

`poseAvantFermeture` 21 · `retourAuxReglages` 36 · `verseModale` 38
`poseApresFermeture` 53 · `suisLaPartVisible` 64 · `ouvreModale` 88 · `fermeModale` 116
`confirme` 128 · `brancheFenetre` 146

Importe :

cadre-visible · dom · evenement · focus-fenetre · modeles

Importé par :

affiche-ici · batiments · borne · calage-carte · chaleur · enregistrement · fiche
fiche-zone · installation · journee · lancement · mesure · ordre-calques · outil-dessin
parcours-recu · partage · pile · rappels · reglage-sponsor · reglages · reprise-emplacements
scan-parcours · suggestion · tiroir-parcours · tout-au-parcours · tutoriel · volets

### `modules/fiche-detail.mjs` — 1408 l. → console

- l.1 · Fiche détail d'un salon — ce qu'elle montre, et d'où vient chaque champ
- l.27 · Contenu de la fiche détail

Fonctions :

`paraitSurFiche` 164 · `origineConferences` 170 · `origineProduits` 177 · `resumeFiche` 247
`caseFiche` 292 · `cibleEn` 348 · `champsPersos` 350 · `criteres` 356 · `ecritFiche` 375
`caseCritere` 398 · `clePerso` 423 · `ajouteChampPerso` 431 · `renommeChampPerso` 448
`retireChampPerso` 496 · `lignesPerso` 569 · `cadreFiche` 592 · `ouvreFiche` 622
`cadreCategories` 762 · `sousTitre` 871 · `tableauChamps` 886 · `champOrigine` 1115

Importe :

correspondance · ecritures-en-file · evenements · fenetre-console · provenance
socle-console · texte

Importé par :

fiche-evenement

### `modules/fiche-evenement.mjs` — 593 l. → console

- l.1 · Fiche d'un salon dans la console — ses champs, ses pavillons, ses sources

Fonctions :

`brancheFiche` 47 · `caseDuPavillon` 58 · `champ` 72 · `champFavicon` 138
`dessineFiche` 215 · `ligneOutil` 375 · `ligneReglage` 391 · `champCle` 409
`champInstance` 460 · `ouvreSources` 518 · `majIntegration` 576 · `majMsgSync` 583

Éléments :

`#msgSync` · `#fragment` · `#btnCopier`

Importe :

bases-klipso · comptes · dom · ecritures-en-file · evenements · fenetre-console
fiche-detail · fuseau · icone-onglet · provenance · socle-console · synchronisation

Importé par :

ecran-console

### `modules/fiche-zone.mjs` — 991 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.52 · La fiche d'une zone organisateur
- l.888 · Masquer une zone organisateur

Fonctions :

`champZone` 78 · `champsZone` 103 · `champEstrade` 223 · `champSalles` 265 · `nomDeZone` 317
`cadreLogo` 343 · `champLogo` 415 · `editeurRiche` 453 · `memeFicheZone` 610
`suitFicheZone` 617 · `verseFicheZone` 628 · `ficheZone` 660 · `marqueType` 689
`rattacheSallesA` 701 · `champsFicheZone` 716 · `enregistreZone` 727
`enregistreZoneAjoutee` 841 · `basculeAffichageZone` 899 · `marqueZonesMasquees` 927
`ecritColonnesEvenement` 950 · `ecritColonneEvenement` 984

Importe :

cartouche-poi · configuration · decor · demarrage · depot-image · dom · donnees
emplacements · etat-emplacements · evenement · fenetre · fiche · index-salon · itineraire
libelles · noms-zones · recherche · reglage-comptoir · reglage-foodtrucks · reperes
session · sur · texte

Importé par :

reglage-application · reglage-fiche · reglage-sponsor · reglage-suggestion · reglages
reprise-emplacements · volets

### `modules/fiche.mjs` — 1212 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.75 · 7. Sélection et fiche

Fonctions :

`injecteALaFiche` 73 · `anime` 107 · `noeud` 145 · `canalPlan` 155 · `rangSociete` 163
`select` 172 · `choisitLeStand` 176 · `centre` 209 · `brancheActesFiche` 220
`centreEtBaisseLaFiche` 236 · `centrePoint` 254 · `programme` 286 · `produits` 335
`ficheProduit` 363 · `ficheConf` 433 · `poseAppuiTactile` 586 · `ecarteClicFantome` 589
`nomSociete` 598 · `choisitExposant` 612 · `poseMarque` 650 · `montreMarque` 710
`poseCode` 733 · `rangeMarque` 774 · `ouvre` 830 · `ouvreLaFiche` 833 · `ferme` 1158
`fermeLaFiche` 1159 · `onglet` 1178 · `brancheFiche` 1196

Éléments :

`#dGo` · `#dItin`

Importe :

corps-fiche · dessin · distinctions · dom · donnees · ecran · etat-emplacements · fenetre
forme-choisie · journal-travaux · libelles · marque · mesure · mode-admin · noms-zones
parcours · recherche · rendu · sur · temps · texte · tiroir-itineraire · tiroirs
tiroirs-exclusifs · vignettes · vue · webgl

Importé par :

affiche-ici · borne · chaleur · demarrage · fiche-zone · gestes · journee · lancement
ligne-liste · points-interet · reglage-fiche · reglages · reprise-emplacements · suggestion
tiroir-parcours · tutoriel

Injections :

- `injecteALaFiche` (partition) — la fiche, publique, porte le crayon et la pastille d'une zone, dont les gestes sont d'administration

### `modules/fige-carte.mjs` — 263 l. → plan-admin

- l.1 · 16 ter. Les environs — le fond figé, photographié par l'exploitant

Fonctions :

`toileMax` 45 · `styleEnImages` 61 · `auRepos` 71 · `decoupe` 81 · `contenu` 93
`retireLesLots` 115 · `figeLeFond` 142 · `ditLot` 250

Importe :

donnees · enregistrement · environs · lot-fige · session

Importé par :

calage-carte

### `modules/figurants.mjs` — 521 l. → plan, plan-admin

- l.1 · Les figurants — du monde dans les allées

Fonctions :

`hasard` 55 · `graineDe` 67 · `placeFigurants` 115 · `presDesStands` 189 · `tronc` 308
`membre` 332 · `boule` 341 · `disque` 358 · `maillage` 371 · `pose` 380 · `maillagesDe` 396
`maillageReuni` 457 · `formesEnTexture` 496 · `maillagesFigurant` 515

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

### `modules/focus-fenetre.mjs` — 59 l. → plan, plan-admin, console, rapport

- l.1 · Le focus d'une fenêtre — où il va quand elle s'ouvre, et d'où il revient

Fonctions :

`prendLeFocus` 31 · `rendLeFocus` 40 · `gardeLeFocus` 51

Importé par :

comptes · fenetre · fenetre-console

### `modules/forme-choisie.mjs` — 39 l. → plan, plan-admin

- l.1 · La forme choisie dans l'éditeur, et ce que le plan public en partage

Fonctions :

`poseFormeSel` 23 · `formeParId` 27 · `boite` 35

Importe :

calques-dessin

Importé par :

affiche-ici · borne · cartouche-poi · dessin · edition · fiche · gestes-admin · libelles
outil-dessin · outil-escalier · points-interet · tiroir-itineraire · tutoriel

### `modules/forme.mjs` — 211 l. → plan, plan-admin

- l.1 · La forme d'un emplacement — anneaux, tracé, empreinte, ancrage du nom

Fonctions :

`arrondiGeo` 14 · `empreinteGeo` 25 · `anneauxGeo` 45 · `traceGeo` 58 · `boiteAnneaux` 62
`dansAnneau` 80 · `distSegmentGeo` 91 · `dansForme` 104 · `distBordGeo` 111 · `poleGeo` 121
`porteeGeo` 140 · `reduitDedansGeo` 154 · `boiteGeo` 171

Importé par :

emplacements · reprise-emplacements

### `modules/fuseau.mjs` — 119 l. → console

- l.1 · Fuseau horaire du salon — le champ de la console

Fonctions :

`fuseauConnu` 31 · `champFuseau` 43

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
outil-comptoir · outil-escalier · outil-foodtruck · placement-libelles
reprise-emplacements

### `modules/gestes-admin.mjs` — 218 l. → plan-admin

- l.1 · Les gestes de l'exploitant sur le plan — leur rang dans la chaîne

Fonctions :

`appui` 48 · `suit` 75 · `leve` 87 · `annuleGeste` 101 · `clavier` 120 · `echap` 172
`apresEchap` 193 · `entree` 202 · `brancheGestesAdmin` 210

Importe :

affiche-ici · aimants · batiments · calage-carte · calques-dessin · chemin-forme · dom
edition · emplacements · forme-choisie · gestes · libelle-place · mode-admin
outil-comptoir · outil-dessin · outil-escalier · outil-foodtruck · placement-libelles
reprise-emplacements

Importé par :

plan-admin

### `modules/gestes.mjs` — 655 l. → plan, plan-admin

- l.1 · Les gestes sur le plan — glisser, pincer, la molette, l'appui qui ouvre
- l.74 · 8. Interactions du plan

Fonctions :

`poseGestesAdmin` 72 · `milieu` 104 · `commencePince` 110 · `suitPince` 124
`noteGlisser` 208 · `stoppeElan` 214 · `lanceElan` 220 · `plieLesBandes` 252
`rendLesBandes` 275 · `saisitPlan` 281 · `cibleElargie` 318 · `planifieFiltre` 361
`brancheGestes` 375 · `brancheLangue` 638

Importe :

borne · dessin · dom · donnees · ecran · environs · fiche · geste-tenu · libelles · mesure
noms-zones · points-interet · recherche · texte · texte-plan · tiroir-itineraire · toucher
vue · webgl

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

### `modules/grille-marche.mjs` — 938 l. → plan, plan-admin

- l.1 · La grille de marche — le sol d'un pavillon, case par case

Fonctions :

`brancheItineraire` 35 · `conf` 37 · `instantConf` 38 · `finInstant` 39 · `sommets` 140
`enveloppe` 160 · `oublieGrillesDeMarche` 202 · `calquesDe` 205 · `reperesDe` 213
`zoneTraversee` 293 · `zonesDuTerrain` 302 · `cleRoleIti` 305 · `roleIti` 306
`nomRoleIti` 307 · `estCirculation` 310 · `formesRole` 335 · `anglePlan` 367
`dansGrille` 406 · `horsGrille` 407 · `grille` 417 · `distanceAuMur` 606 · `cretes` 649
`nappePrincipale` 667 · `celluleDe` 705 · `caseDe` 709 · `centreCase` 714 · `empriseDe` 757
`accrocheDepuis` 819 · `versLeMilieu` 892 · `accroche` 927

Importe :

chemin-forme

Importé par :

abords-salles · itineraire · itineraire · recherche-chemin · trait-chemin · trajet · troncon

### `modules/habillage-svg.mjs` — 31 l. → plan, plan-admin

- l.1 · Le SVG porte-t-il l'habillage ?

Fonctions :

`habillageDansLeSvg` 25 · `poseHabillageDansLeSvg` 27

Importe :

evenement

Importé par :

apparence · webgl

### `modules/habillage.mjs` — 157 l. → plan, plan-admin

- l.1 · L'habillage du plan — couleur principale, fond, barre du salon, modèle

Fonctions :

`brancheHabillage` 27 · `appliqueAccent` 60 · `appliqueFond` 94 · `modeBarre` 114
`appliqueBarre` 116 · `appliqueModele` 139

Importe :

configuration · couleurs · dom · modeles · polices-plan · ton-barre

Importé par :

apparence · lancement · pile · volets

### `modules/horaires.mjs` — 94 l. → plan, plan-admin

- l.1 · La journée du salon — ses dates, ses heures, le temps passé sur un stand

Fonctions :

`minutesVisite` 28 · `lueHeure` 55 · `lueDate` 59 · `datesSalon` 71 · `horairesSalon` 85

Importe :

configuration · temps

Importé par :

journee · reglages · volets

### `modules/ici.mjs` — 286 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le code affiché dans le hall, côté visiteur

Fonctions :

`lieuExact` 93 · `litCodeIci` 117 · `poseIci` 147 · `retireIci` 174
`oublieIciDeLAdresse` 204 · `montreBandeauIci` 220 · `demarreIci` 254 · `brancheIci` 274

Importe :

borne · dom · donnees · salon · texte · tiroir-itineraire · trajet · vous-etes-ici

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

### `modules/icone-onglet.mjs` — 46 l. → console

- l.1 · Icône de l'onglet

Fonctions :

`reduitIcone` 31

Importe :

depot-image

Importé par :

fiche-evenement

### `modules/index-salon.mjs` — 515 l. → plan, plan-admin

- l.1 · 1. L'index du salon — la recherche porte sur tous les pavillons

Fonctions :

`texteProduits` 55 · `indexe` 59 · `chronoConf` 328 · `confsDuPlan` 333
`indexeConferences` 351 · `rangeConferences` 428 · `poseFavicon` 475 · `poseLogoSalon` 501

Importe :

calques-dessin · cartouche-poi · configuration · dom · donnees · emplacements · evenement
installation · itineraire · mode-admin · modeles · noms-zones · options · parcours
polices-plan · recherche · secteurs · sur · texte · tiroir-parcours

Importé par :

demarrage · enregistrement · fiche-zone

### `modules/installation.mjs` — 812 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`reglageInstallation` 117 · `invitationVoulue` 118 · `nommeApplication` 173
`reponsesInstallation` 191 · `retientInstallation` 196 · `jourInstallation` 205
`invitationEcartee` 208 · `refuseInstallation` 214 · `faconInstallation` 242
`appliInstallee` 271 · `verifieApplication` 293 · `connaitLApplication` 303
`faconRappel` 323 · `rappelEcarte` 331 · `refuseRappel` 337 · `relanceInvitation` 355
`gesteInstallation` 360 · `doigtPose` 364 · `doigtLeve` 365 · `vueInstallation` 368
`accueilleInvitation` 377 · `invitationRetenue` 403 · `suitLesGestes` 424
`finInvitation` 432 · `rouvreInvitation` 454 · `essaieInvitation` 474
`brancheInstallation` 519 · `teteInvitation` 612 · `poseGardeInstallation` 645
`remplitInvitation` 668 · `ouvreInvitation` 698 · `ouvreRappel` 773

Importe :

application · configuration · dom · donnees · fenetre · mesure · partage · salon · sponsor
tutoriel · visite-guidee

Importé par :

demarrage · index-salon · lancement · reglage-installation

### `modules/itineraire.mjs` — 136 l. → plan, plan-admin

- l.1 · L'itinéraire — le calcul d'un trajet d'un point du salon à un autre

Fonctions :

`oublieGrilles` 48 · `mesureMarches` 57 · `coupeMarche` 72 · `distancesDesArrets` 88
`ecritDistance` 102 · `ecritDuree` 110 · `phraseLiaison` 124

Importe :

abords-salles · abords-salles · grille-marche · grille-marche · recherche-chemin · reperes
temps · trait-chemin · trajet · trajet · troncon

Importé par :

affiche-ici · aimants · borne · calage-carte · cartouche-poi · dessin · edition
enregistrement · fiche-zone · index-salon · journee · nappe · outil-dessin · pile
points-interet · reprise-emplacements · sejour · seuil · tiroir-itineraire
trace-itineraire · tutoriel · volets · webgl

### `modules/jetons-racine.mjs` — 57 l. → plan, plan-admin

- l.1 · Les surcouches qui suivent les jetons de la racine

Fonctions :

`relit` 28 · `suitLaRacine` 46 · `jetons` 56

Importé par :

distinctions · parcours · trace-itineraire · tutoriel

### `modules/journal-travaux.mjs` — 61 l. → plan, plan-admin

- l.1 · Le journal des travaux — ce que la page a fait, et quand

Fonctions :

`noteTravail` 37 · `chronometre` 51 · `travauxEntre` 61

Importé par :

fiche · libelles · logos-stands · recherche · sonde · tiroirs

### `modules/journee.mjs` — 1282 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`trace` 38 · `joursSalon` 103 · `joursAVenir` 132 · `joursDefaut` 150 · `confsParJour` 160
`departsProposes` 185 · `rangJournee` 207 · `lienJournee` 219 · `boutonJour` 242
`arretJournee` 255 · `remplitOnglets` 302 · `jourDuStand` 331 · `ouvreChoixJour` 343
`figeLaVisite` 400 · `placeSurJour` 409 · `rendAuPlan` 417 · `retireDuSejour` 423
`remplitJournee` 433 · `ecritApercu` 646 · `appliqueVueParcours` 676 · `traceJournee` 718
`retireTraceJournee` 735 · `montreLeJour` 743 · `perimeJournee` 758 · `montreLaListe` 774
`oublieSejour` 779 · `ouvreOrganisation` 796 · `essaieSejour` 1176 · `lanceSejour` 1207
`refaitSejour` 1248 · `brancheJournee` 1263

Importe :

charge-annoncee · dom · donnees · fenetre · fiche · horaires · itineraire · mesure
parcours · rendu · sejour · seuil · temps · tiroir-itineraire · trace-itineraire
vous-etes-ici

Importé par :

lancement · tiroir-parcours · tutoriel

### `modules/lancement.mjs` — 134 l. → plan, plan-admin

- l.1 · Le lancement du plan — ce que le script soudé faisait encore

Fonctions :

`injecteLancementAdmin` 73 · `lancePlan` 76

Importe :

bandes · borne · demarrage · erreurs · fenetre · fiche · gestes · habillage · ici
installation · journee · ligne-liste · mesure · partage · recherche · retour · scan-parcours
sonde · sponsor · tiroir-itineraire · tiroir-parcours · tiroirs · ton-barre · vue · webgl

Importé par :

plan · plan-admin

Injections :

- `injecteLancementAdmin` (partition) — les branchements de l'exploitant prennent leur rang dans le lancement public, dont l'ordre est le comportement

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

### `modules/libelles.mjs` — 419 l. → plan, plan-admin

- l.1 · Les libellés du plan — le nom de l'exposant prime sur le numéro
- l.55 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`partsLibres` 78 · `libelles` 114 · `ecritLibelles` 115 · `libelleZone` 198
`emplacementWebgl` 226 · `tassementImmersif` 296 · `libellesWebgl` 301
`prepareLibellesWebgl` 302

Importe :

calques-dessin · camera · cartouche-poi · decor · dessin · dom · donnees · filtre
forme-choisie · journal-travaux · libelle-place · logos-stands · nom-emplacement
noms-zones · place-libre · polices-plan · texte · texte-plan · trace-itineraire
vous-etes-ici · vue · webgl

Importé par :

fiche · fiche-zone · gestes · placement-libelles · plan · recherche · reglage-fiche
reglages · reprise-emplacements · volets

### `modules/lien-parcours.mjs` — 97 l. → plan, plan-admin

- l.1 · Le parcours écrit dans un lien, et relu

Fonctions :

`codeIdParcours` 45 · `codeParcours` 63 · `champParcours` 75 · `litCodeParcours` 82

Importé par :

parcours-recu · partage · scan-parcours

### `modules/ligne-liste.mjs` — 37 l. → plan, plan-admin

- l.1 · Ce qu'ouvre une ligne de la liste

Fonctions :

`brancheLignesListe` 19

Importe :

dom · fiche · points-interet

Importé par :

lancement

### `modules/logos-stands.mjs` — 1406 l. → plan, plan-admin

- l.1 · Les logos sur les stands, vus de près

Fonctions :

`finesse` 94 · `palier` 108 · `tassement` 119 · `annoncePret` 175 · `pret` 181
`geleLogos` 188 · `arriveeSansFond` 241 · `grande` 257 · `pompeGrandes` 274
`demandeGrande` 278 · `image` 318 · `sansFond` 338 · `detoureIci` 342
`lanceTravailleur` 381 · `demandeDetourage` 402 · `pompe` 409 · `parLaPageSeule` 429
`detoureRevenu` 438 · `largeurDeToile` 455 · `cleDeToile` 458 · `toileDejaRangee` 464
`toileProche` 485 · `toile` 506 · `logoPose` 543 · `nomTu` 551 · `sourceDuToit` 560
`cedeAuLogo` 573 · `CARRE` 602 · `filtrage` 635 · `plancheDe` 652 · `extensionPlanche` 688
`bilanLogos` 801 · `rendPlanche` 820 · `taillesDe` 832 · `rangPour` 841
`nouvellePlanche` 850 · `vaA` 868 · `videE` 869 · `place` 874 · `libere` 913
`liberable` 935 · `envoie` 945 · `cedeLaPlace` 967 · `recopie` 998 · `range` 1013
`plancheGardee` 1066 · `oubliePlancheBientot` 1111 · `pres` 1123 · `solVu` 1134
`logosARevoir` 1151 · `groupe` 1167 · `oublie` 1178 · `annoncePoses` 1221
`matriceDuToit` 1243 · `coucheDeChauffe` 1259 · `couchesLogos` 1269 · `poseLogos` 1290

Importe :

camera · densite-rendu · detourage · dom · donnees · ecran · evenement · journal-travaux
libelle-place · vignettes · vue-etat

Importé par :

ambiance · libelles · plan · releve · sonde · webgl

### `modules/lot-fige.mjs` — 154 l. → plan, plan-admin

- l.1 · Le lot du fond figé — la règle, sans la page

Fonctions :

`carreDuFond` 48 · `sourceDuFige` 68 · `imagesFigees` 83 · `niveauxDuLot` 117
`blocsDeCapture` 132

Importé par :

calage-carte · environs · fige-carte · vue

### `modules/marque.mjs` — 342 l. → plan, plan-admin, console

- l.1 · La marque sans le vide qui l'entoure

Fonctions :

`marquePrete` 56 · `recadreMarque` 60 · `marqueRecadree` 86 · `imageChargee` 122
`vignetteMarque` 138 · `webp64` 178 · `boiteMarque` 196 · `toileMarque` 262 · `sansFond` 278
`vignetteDeLogo` 305

Importe :

detourage

Importé par :

fiche · recherche · synchronisation · vignettes

### `modules/mesure.mjs` — 714 l. → plan, plan-admin

- l.1 · 13. Mesure d'utilisation

Fonctions :

`mesureOuverte` 66 · `jetonMesure` 69 · `jourIso` 108 · `echeanceMesure` 109
`jetonRetenu` 134 · `supportMesure` 183 · `renouvelleVisiteur` 235 · `fraisEnFile` 302
`litLaFile` 306 · `ecritLaFile` 319 · `metEnFile` 334 · `retireDeLaFile` 345 · `enVol` 356
`marqueEnVol` 357 · `chargeDe` 375 · `envoiePaquet` 388 · `beaconne` 413
`pousseLaFile` 436 · `envoieMesures` 463 · `mesure` 500 · `brancheLesEnvois` 515
`effaceJetonsVisiteur` 570 · `refuseMesure` 588 · `appliqueRefus` 600
`ouvreConfidentialite` 623 · `brancheLaNotice` 697 · `brancheMesure` 711

Importe :

dom · donnees · fenetre · salon

Importé par :

borne · charge-annoncee · erreurs · fiche · gestes · installation · journee · lancement
notifications · parcours · partage · sonde · tiroir-itineraire

### `modules/mesures-page.mjs` — 314 l. → plan, plan-admin

- l.1 · Les mesures de la page, partagées

Fonctions :

`centile` 31 · `fichier` 37 · `observe` 42 · `carteGraphique` 56 · `navigateur` 84
`mobileDeRepli` 102 · `systemeDeRepli` 115 · `appareil` 133 · `trajet` 179 · `minutage` 195
`minutageRejoue` 236 · `trajetDecoupe` 259 · `chargement` 285

Importé par :

densite-rendu · releve · sonde

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
nappe · outil-comptoir · outil-dessin · outil-escalier · outil-foodtruck · pile
placement-libelles · rendu · reprise-emplacements · volets

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

### `modules/mot-de-passe.mjs` — 211 l. → motdepasse

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

### `modules/moteur-gl-couche.mjs` — 364 l. → plan, plan-admin

- l.1 · Le moteur du plan — la couche, ses attributs et ses programmes

Fonctions :

`composantes` 142 · `remplis` 157 · `tampon` 181 · `nomExtension` 214 · `valeurDefaut` 221
`egalProfondeur1` 310 · `memeValeur` 321 · `aRefaire` 337

Importé par :

moteur-gl · moteur-gl-formes · moteur-gl-objets · moteur-gl-texte

### `modules/moteur-gl-formes.mjs` — 492 l. → plan, plan-admin

- l.1 · Le moteur du plan — les aplats et les traits

Fonctions :

`coins` 84 · `remplisAttributs` 93 · `numerote` 104 · `reglageFiltre` 124
`poseLumiere` 159 · `aire` 211 · `anneauxDe` 218

Importe :

moteur-gl-couche

Importé par :

moteur-gl · moteur-gl-objets · moteur-gl-texte

### `modules/moteur-gl-matrices.mjs` — 152 l. → plan, plan-admin

- l.1 · Le moteur du plan — les matrices et les vues

Fonctions :

`mul4` 25 · `translation4` 34 · `applique4` 38 · `rapporte` 52

Importé par :

moteur-gl

### `modules/moteur-gl-objets.mjs` — 475 l. → plan, plan-admin

- l.1 · Le moteur du plan — les images, les objets, les textures

Fonctions :

`reglePrise` 61 · `compteCree` 80 · `appareil` 87 · `textureDe` 128 · `imageDe` 148
`coinsImage` 189 · `ATTR_MAILLAGE` 242 · `matriceExemplaire` 321 · `textureFormes` 346
`attributsMaillage` 361

Importe :

moteur-gl-couche · moteur-gl-formes

Importé par :

moteur-gl · moteur-gl-texte

### `modules/moteur-gl-texte.mjs` — 395 l. → plan, plan-admin

- l.1 · Le moteur du plan — les textes

Fonctions :

`cleAtlas` 39 · `stylePolice` 47 · `mesure` 53 · `atlasDe` 71 · `textureDe` 132
`metsEnPage` 161 · `attributsTexte` 193 · `jeuDe` 285

Importe :

moteur-gl-couche · moteur-gl-formes · moteur-gl-objets

Importé par :

moteur-gl

### `modules/moteur-gl.mjs` — 664 l. → plan, plan-admin

- l.1 · Le moteur du plan — WebGL2, écrit pour lui

Fonctions :

`lumieresDe` 65 · `couchesDeChauffe` 597 · `objetDe` 621 · `retourne` 627

Importe :

moteur-gl-couche · moteur-gl-formes · moteur-gl-matrices · moteur-gl-objets
moteur-gl-texte

Importé par :

webgl

### `modules/nappe.mjs` — 84 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`poseNappe` 43 · `couleurNappe` 45 · `rafraichitApercu` 51

Importe :

configuration · dom · donnees · itineraire · mode-admin · rendu · tiroir-itineraire · vue

Importé par :

enregistrement · outil-dessin

### `modules/nom-emplacement.mjs` — 340 l. → plan, plan-admin

- l.1 · Le nom d'un emplacement sur le plan — l'enseigne, son numéro, ses hébergés

Fonctions :

`coexComptes` 36 · `coexChoisit` 37 · `ligneCode` 53 · `decaleLibelle` 87
`facteurLibelle` 88 · `libelleForce` 89 · `libelleEmplacement` 100 · `nomsPivotes` 124
`nomCouche` 126 · `nomsUniformes` 170 · `posePaliers` 214 · `placesDuNom` 249
`tailleMax` 263 · `cibleDe` 278 · `habilleNom` 305 · `libelleDroit` 319

Importe :

configuration · debord-allees · libelle-place · paliers-noms · polices-plan · texte
texte-plan

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

### `modules/notifications.mjs` — 93 l. → plan, plan-admin

- l.1 · Les notifications — ce que l'appareil sait recevoir, et l'abonnement

Fonctions :

`poussePossible` 19 · `iOSsansInstallation` 24 · `adresseDuRappel` 30 · `heureVue` 58
`empreinteDebut` 59 · `octetsDeCle` 63 · `abonnementCourant` 71 · `abonne` 80

Importe :

mesure · salon

Importé par :

essai-rappel · rappels

### `modules/nuancier.mjs` — 95 l. → plan-admin

- l.1 · La rafale du sélecteur de couleur — l'exploitant seul

Fonctions :

`presseNuanciers` 34 · `brancheNuancier` 40 · `suitNuancier` 57 · `suitRepos` 76

Importé par :

outil-dessin · pile · plan-admin · volets

### `modules/options.mjs` — 117 l. → plan, plan-admin

- l.1 · Les options du plan — ce que le salon a pris

Fonctions :

`appliqueOptions` 100 · `injecteApresOption` 114

Importe :

configuration

Importé par :

apparence · index-salon · outil-dessin · tiroir-parcours · volets

Injections :

- `injecteApresOption` (registre) — chaque module que touche une option vendue à part y inscrit ce qu'il refait quand elle change

### `modules/ordonnanceur.mjs` — 865 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 83 · `peineDeCharge` 104 · `ecartDesJours` 190 · `poidsDesJours` 220
`chargeDuJour` 243 · `rangeSejour` 252 · `trancheDe` 802 · `dilatationPour` 857

Importé par :

charge-annoncee · sejour

### `modules/ordre-calques.mjs` — 132 l. → plan-admin

- l.1 · L'ordre des calques — la fenêtre de l'exploitant

Fonctions :

`deplaceVers` 27 · `versExtremite` 39 · `remplitOrdre` 53 · `ouvreOrdre` 123

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

calques-dessin · configuration · dom · donnees · evenement

Importé par :

bande-admin · batiments · calage-carte · dessin · enregistrement · ordre-calques
outil-dessin · pile · rendu · reprise-emplacements · volets · vue

### `modules/outil-comptoir.mjs` — 230 l. → plan-admin

- l.1 · Le comptoir d'un accueil, attrapé sur le plan — l'outil de l'exploitant

Fonctions :

`aire` 51 · `anneauDe` 55 · `emprise` 61 · `reglageDe` 68 · `accueils` 84 · `zoneDe` 85
`groupeDe` 86 · `masquee` 87 · `lis` 91 · `metresParPixel` 98 · `vise` 101
`choisitComptoir` 122 · `pose` 134 · `reglageCourant` 146 · `comptoirPointerDown` 158
`comptoirPointerMove` 172 · `comptoirPointerUp` 192 · `lacheComptoir` 202
`comptoirClavier` 208 · `relacheComptoir` 226

Importe :

ambiance · camera · configuration · decor · etat-emplacements · geste-tenu · mode-admin
trace · vue

Importé par :

gestes-admin · outil-foodtruck · reglage-comptoir · reglage-foodtrucks

### `modules/outil-dessin.mjs` — 963 l. → plan-admin

- l.1 · 11. Calques de dessin — l'outil de l'exploitant

Fonctions :

`restaure` 74 · `annule` 101 · `refais` 114 · `poseTrait` 119 · `aimanteContour` 140
`rayonContour` 143 · `redresseTrace` 162 · `traceGuide` 196 · `ajouteForme` 203
`poseChampImage` 220 · `calquePourImage` 235 · `lienImageSaisi` 263 · `formeImage` 275
`poseImage` 284 · `ditImagePosee` 307 · `importeImage` 315 · `dessinPointerDown` 348
`dessinPointerMove` 433 · `dessinPointerUp` 471 · `termineTrace` 512 · `aide` 524
`outilOffert` 554 · `choisitOutil` 568 · `enchaineStand` 599 · `proposeCouleurLigne` 617
`montreTransport` 628 · `activeCalque` 637 · `cleVerrou` 691 · `verrouille` 692
`basculeVerrou` 694 · `montreRoleIti` 737 · `creeCalque` 750 · `demandeNom` 763
`renommeCalque` 788 · `brancheOutilDessin` 804

Importe :

aimants · calques-dessin · chemin-forme · configuration · dessin · dom · donnees · edition
emplacements · enregistrement · fenetre · forme-choisie · itineraire · mode-admin
modes-edition · nappe · nuancier · options · ordre-trace · rendu · reperes
reprise-emplacements · socle-dessin · texte · tiroir-itineraire · vue

Importé par :

batiments · gestes-admin · ordre-calques · outil-escalier · pile · plan-admin

### `modules/outil-escalier.mjs` — 229 l. → plan-admin

- l.1 · L'escalier d'un repère, attrapé sur le plan — l'outil de l'exploitant

Fonctions :

`noeudDe` 55 · `metresParPixel` 59 · `lis` 62 · `dedans` 78 · `distance` 88 · `vise` 102
`choisitEscalier` 120 · `refais` 131 · `angleBorne` 137 · `escalierPointerDown` 144
`escalierPointerMove` 157 · `escalierPointerUp` 184 · `lacheEscalier` 194
`escalierClavier` 200 · `relacheEscalier` 225

Importe :

camera · decor · dessin · forme-choisie · geste-tenu · mode-admin · outil-dessin
socle-dessin · vue

Importé par :

gestes-admin

### `modules/outil-foodtruck.mjs` — 201 l. → plan-admin

- l.1 · Les camions d'un foodtruck, attrapés sur le plan — l'outil de l'exploitant

Fonctions :

`foodtrucks` 57 · `zoneDe` 58 · `groupeDe` 59 · `reglageDe` 62 · `lis` 69
`metresParPixel` 75 · `vise` 79 · `choisitFoodtruck` 102 · `pose` 113
`foodtruckPointerDown` 126 · `foodtruckPointerMove` 142 · `foodtruckPointerUp` 163
`lacheFoodtruck` 173 · `foodtruckClavier` 179 · `relacheFoodtruck` 197

Importe :

ambiance · camera · configuration · decor · etat-emplacements · geste-tenu · mode-admin
outil-comptoir · reglage-foodtrucks · vue

Importé par :

gestes-admin

### `modules/paliers-noms.mjs` — 59 l. → plan, plan-admin

- l.1 · Les paliers des noms — trois tailles pour tout un pavillon

Fonctions :

`paliersDe` 40 · `palierDe` 55

Importé par :

nom-emplacement

### `modules/panneau-criteres.mjs` — 41 l. → plan, plan-admin

- l.1 · Le panneau des critères déplié — sa relecture, et le replier

Fonctions :

`poseRelecturePanneau` 20 · `relisPanneauCrit` 23 · `fermeCriteres` 28

Importe :

dom

Importé par :

recherche · tiroirs

### `modules/parcours-recu.mjs` — 159 l. → plan, plan-admin

- l.1 · Le parcours reçu

Fonctions :

`accueilleParcoursPartage` 46 · `proposeParcoursRecu` 69 · `adoptePartage` 157

Importe :

configuration · donnees · fenetre · lien-parcours · parcours

Importé par :

demarrage · scan-parcours

### `modules/parcours.mjs` — 649 l. → plan, plan-admin

- l.1 · Le parcours de visite : la liste, son stockage, sa marque

Fonctions :

`_rafraichit` 28 · `_reprendRappels` 29 · `_synchroniseRappels` 30 · `poseParcours` 91
`brancheListeParcours` 109 · `cleParcours` 122 · `identifiantParcours` 159
`casierParcours` 167 · `dansParcours` 168 · `jourParcours` 171
`attenduDepuisTropLongtemps` 176 · `trieParcours` 187 · `chargeParcours` 197
`parcoursAEcrire` 232 · `enregistreParcours` 248 · `tientLeStockage` 277
`plurielParcours` 291 · `contenuParcours` 300 · `signetParcours` 311 · `boutonParcours` 317
`rafraichitMarque` 322 · `calqueMarques` 355 · `traitTuile` 389 · `jetonsMarques` 402
`dessineMarques` 424 · `marqueParcours` 469 · `instantConf` 487 · `cleTemps` 491
`nomDeStand` 501 · `groupeParcours` 503 · `fermeParcours` 517 · `basculeParcours` 550
`brancheParcours` 574 · `verseAuParcours` 597 · `rangParcours` 626 · `refaitParcours` 649

Importe :

couleurs · dom · donnees · evenement · jetons-racine · mesure · salon · temps · texte
tiroirs-exclusifs

Importé par :

apparence · fiche · index-salon · journee · parcours-recu · partage · rappels · rendu
reprise-emplacements · sejour · suggestion · tiroir-itineraire · tiroir-parcours
tout-au-parcours · tutoriel

### `modules/partage.mjs` — 294 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`lienParcours` 50 · `ouvrePartageParcours` 66 · `boutonsPartage` 122 · `parcoursACopier` 210
`ouvreGardeParcours` 225 · `demandeGardeParcours` 255 · `poseGardeParcours` 268
`branchePartage` 292

Importe :

configuration · dom · donnees · fenetre · lien-parcours · mesure · parcours · qr · salon

Importé par :

installation · lancement · tiroir-parcours

### `modules/pile.mjs` — 560 l. → plan-admin

- l.1 · Le panneau des calques
- l.65 · Panneau : deux sections, chacune rangée par nom
- l.362 · Repères
- l.421 · Fond du plan

Fonctions :

`secteurs` 53 · `joli` 56 · `nature` 83 · `boutonAjout` 90 · `boutonVerrou` 110
`intertitre` 118 · `remplitPanneau` 128 · `sectionSelection` 378 · `sectionFond` 441
`ligneCouleur` 499 · `rangSecteur` 520 · `rangSous` 533 · `defautCouleur` 556

Importe :

apparence · batiments · calage-carte · calques-dessin · chaleur · configuration
configuration · couleurs · dessin · dom · donnees · emplacements · fenetre · habillage
itineraire · libelle-place · mode-admin · nuancier · ordre-calques · ordre-trace
outil-dessin · placement-libelles · reprise-emplacements · secteurs · texte

Importé par :

plan-admin

### `modules/place-libre.mjs` — 68 l. → plan, plan-admin

- l.1 · La place libre d'un emplacement découpé — où son nom peut encore s'écrire

Fonctions :

`rectangleLibre` 38

Importé par :

libelles

### `modules/placement-libelles.mjs` — 248 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`lacheLibelle` 43 · `choisi` 57 · `repeint` 70 · `posePlacement` 80
`libelleAutomatique` 102 · `modePlacementLibelles` 111 · `majPaletteLibelle` 132
`choisitLibelle` 157 · `pousseLibelle` 164 · `libellePointerDown` 172
`libellePointerMove` 195 · `libellePointerUp` 205 · `branchePlacementLibelles` 218

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

### `modules/plan.mjs` — 77 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

Importe :

appels · choix-ambiance · edition-en-cours · etat-emplacements · lancement · libelles
logos-stands · mini-carte · polices-plan · qr · releve · salon · scan-parcours
style-emplacements · sur · texte-plan · trace · tutoriel · vue · webgl · webgl

Importé par :

plan-admin

### `modules/points-interet.mjs` — 141 l. → plan, plan-admin

- l.1 · Les points d'intérêt — la fiche d'un repère, et le chemin vers lui

Fonctions :

`vaAuRepere` 50 · `ouvrePoi` 73

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

Importe :

cartouche-poi · distinctions · dom · donnees · etat-emplacements · fiche · forme-choisie
itineraire · rendu · reperes · temps · texte · tiroir-itineraire · tiroirs-exclusifs · vue

Importé par :

gestes · ligne-liste

### `modules/polices-plan.mjs` — 329 l. → plan, plan-admin

- l.1 · La police des noms sur le plan — celle du modèle, ou une autre de la liste

Fonctions :

`injecteAuxPolices` 43 · `policeChoisie` 210 · `policeDuModele` 215 · `feuillePolice` 225
`chargePolice` 247 · `policePrete` 267 · `policeDesNoms` 285 · `posePoliceLibelles` 314

Importe :

configuration · modeles

Importé par :

appels · dessin · habillage · index-salon · libelles · nom-emplacement · plan · recherche
rendu · volets

Injections :

- `injecteAuxPolices` (rendu) — une police arrivée fait retracer le plan, les calques, les noms et la liste, qui tous importent les polices

### `modules/provenance.mjs` — 206 l. → console

- l.1 · Provenance des données d'un salon — domaines, fournisseurs, réglage
- l.20 · Provenance des données

Fonctions :

`ecritSources` 45 · `fournisseurUtilise` 119 · `sourceNom` 129 · `source` 133
`ligneSource` 137 · `resumeProvenance` 169 · `ouvreProvenance` 190

Importe :

ecritures-en-file · evenements · fenetre-console · socle-console

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

affiche-ici · partage · plan

### `modules/rappels.mjs` — 596 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`reglageRappel` 88 · `rappelsVoulus` 89 · `minutesRappel` 90 · `cleRappels` 104
`chargeRappels` 107 · `retientRappels` 111 · `cleEffacement` 123 · `effacementDu` 124
`marqueEffacement` 127 · `rappelsOfferts` 138 · `instantAbsolu` 168 · `confsARappeler` 176
`rappelsDuParcours` 193 · `envoieListe` 239 · `synchroniseRappels` 247 · `effaceRappels` 268
`eteintRappels` 285 · `allumeRappels` 295 · `aideRappel` 314 · `poseRappels` 330
`cleInviteRappel` 454 · `inviteRappelFaite` 457 · `retientInviteRappel` 462
`fenetreRappel` 498 · `proposeRappels` 534 · `reprendRappels` 577

Importe :

configuration · dom · donnees · ecritures-en-file · fenetre · notifications · parcours
salon · temps · visite-guidee

Importé par :

essai-rappel · reglage-rappel · tiroir-parcours

### `modules/rapport-utilisation.mjs` — 730 l. → rapport

- l.1 · Rapport d'utilisation

Fonctions :

`courant` 70 · `chargeEvenements` 75 · `joursPeriode` 93 · `chargeRapport` 95
`secondes` 127 · `fini` 128 · `lentes` 129 · `pese` 140 · `reunit` 150 · `ligne` 164
`sousTitre` 174 · `jourDuSalon` 184 · `performances` 198 · `erreurs` 295 · `chiffre` 318
`barres` 337 · `portes` 377 · `jours` 428 · `dessineRapport` 454 · `blocPerformances` 624
`dessineBarre` 636 · `rafraichit` 663 · `videEcran` 683 · `demarre` 689
`brancheRapport` 708

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

### `modules/recherche-chemin.mjs` — 184 l. → plan, plan-admin

- l.1 · La recherche du chemin — A* sur la grille de marche

Fonctions :

`Tas` 18 · `travail` 58 · `cherche` 81 · `distancesDepuis` 148 · `distancesMulti` 162

Importe :

grille-marche

Importé par :

abords-salles · itineraire · trajet · troncon

### `modules/recherche.mjs` — 1089 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`appliqueSecteurs` 74 · `filtreTheme` 92 · `themeFiltrable` 149 · `ordreCriteres` 165
`clesCriteres` 192 · `texteCriteres` 206 · `texteAnglaisPerso` 222 · `indexeCriteres` 236
`refaitCriteres` 270 · `critereActif` 277 · `basculeCritere` 279 · `videCriteres` 288
`majVideQ` 297 · `videRecherche` 310 · `nCriteres` 325 · `majCriteres` 334
`remplitCriteres` 401 · `basculeCriteres` 540 · `ouvreCriteres` 545 · `marqueRetrait` 579
`appliqueFiltre` 602 · `oublieRetrait` 618 · `reprendRecherche` 627 · `rangSorte` 640
`codeCase` 677 · `caseNumero` 694 · `sousLigne` 714 · `liste` 729 · `ecritLaListe` 730
`marqueChoisie` 873 · `prechargeMarque` 899 · `prechargeLesVignettes` 950
`chargeUnLot` 996 · `policesArrivees` 1038 · `brancheRecherche` 1061

Importe :

bandes · cartouche-poi · configuration · corps-fiche · dessin · distinctions · dom · donnees
ecran · etat-emplacements · filtre · journal-travaux · libelles · marque · noms-zones
panneau-criteres · polices-plan · salon · secteurs · sur · temps · texte · texte-plan
tiroirs · tout-au-parcours · vignettes · vue

Importé par :

apercus · apparence · borne · demarrage · fiche · fiche-zone · gestes · index-salon
lancement · reglage-fiche · reglage-recherche · reglage-suggestion · rendu
reprise-emplacements · suggestion · volets

### `modules/reglage-application.mjs` — 333 l. → plan-admin

- l.1 · L'application installée — son icône et son nom, le réglage de l'exploitant

Fonctions :

`nomAppDefaut` 69 · `ecritApplication` 84 · `fileNomDuSalon` 130 · `blocApplication` 136

Importe :

application · donnees · ecritures-en-file · enregistrement · fiche-zone · icone-app
session

Importé par :

volets

### `modules/reglage-comptoir.mjs` — 195 l. → plan-admin

- l.1 · Le comptoir d'un accueil — où l'exploitant le pose, dans quel sens

Fonctions :

`el` 35 · `champComptoir` 47

Importe :

configuration · decor · outil-comptoir

Importé par :

fiche-zone

### `modules/reglage-fiche.mjs` — 727 l. → plan-admin

- l.1 · Le volet « Fiche Stand » des réglages — l'exploitant seul

Fonctions :

`clesFiche` 49 · `presseTitres` 58 · `voletOrdre` 85

Importe :

apercus · corps-fiche · donnees · ecritures-en-file · fiche · fiche-zone · libelles
modeles · recherche · texte

Importé par :

reglages

### `modules/reglage-foodtrucks.mjs` — 363 l. → plan-admin

- l.1 · Les camions d'un foodtruck — combien, où, dans quel sens

Fonctions :

`el` 41 · `bouton` 46 · `ecritCamions` 59 · `sansFond` 84 · `champFoodtrucks` 128

Importe :

configuration · decor · depot-image · detourage · outil-comptoir · rendu · sur

Importé par :

fiche-zone · outil-foodtruck

### `modules/reglage-installation.mjs` — 58 l. → plan-admin

- l.1 · La case de l'invitation à installer, dans l'onglet « Admin » des réglages

Fonctions :

`caseInstallation` 21

Importe :

configuration · installation

Importé par :

volets

### `modules/reglage-rappel.mjs` — 185 l. → plan-admin

- l.1 · Le rappel avant une conférence, dans l'onglet « Admin » des réglages

Fonctions :

`blocRappel` 48 · `remplitRappel` 57 · `ditEssaiRappel` 169

Importe :

configuration · essai-rappel · rappels

Importé par :

volets

### `modules/reglage-recherche.mjs` — 314 l. → plan-admin

- l.1 · L'onglet « Recherche » des réglages — l'exploitant seul

Fonctions :

`catalogueTenu` 25 · `voletRecherche` 94 · `blocOrdreCriteres` 156

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

### `modules/reglage-suggestion.mjs` — 437 l. → plan-admin

- l.1 · La suggestion — le volet de l'exploitant

Fonctions :

`indexSugg` 44 · `valeursSugg` 69 · `relevePalmares` 87 · `etiquetteSugg` 107
`voletSuggestion` 117

Importe :

chaleur · configuration · donnees · fiche-zone · glisse-fenetre · recherche · session
suggestion · texte · tiroir-parcours

Importé par :

reglages

### `modules/reglages.mjs` — 546 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`ouvreReglages` 96 · `voletZones` 225 · `champsFicheZone` 327 · `ficheZoneEnPlace` 421
`voletPlan` 439 · `voletCoexposants` 478

Importe :

acces-admin · calage-carte · chaleur · configuration · corps-fiche · distinctions · dom
donnees · ecritures-en-file · fenetre · fiche · fiche-zone · glisse-fenetre · horaires
libelles · reglage-fiche · reglage-recherche · reglage-suggestion · seuil · volets

Importé par :

bande-admin

### `modules/releve.mjs` — 459 l. → plan, plan-admin

- l.1 · Le relevé des performances — `?perf`

Fonctions :

`ms` 66 · `garde` 68 · `decrit` 76 · `dansLeReleve` 92 · `commence` 96 · `sorte` 109
`clos` 113 · `ecouteGestes` 132 · `image` 164 · `fenetre` 219 · `tiroir` 228
`lisTiroirs` 238 · `lisTiroirsApresImage` 249 · `ecouteFenetre` 255 · `ecouteNavigateur` 278
`echantillonne` 310 · `laPage` 331 · `synthese` 336 · `releve` 350 · `affiche` 389
`partage` 398 · `posePastille` 415

Importe :

affichage · demarrage · donnees · logos-stands · mesures-page · salon · webgl

Importé par :

plan

### `modules/rendu.mjs` — 263 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`monteHabillage` 65 · `attributComptoir` 82 · `texteCamions` 91 · `attributCamions` 94
`attributEstrade` 100 · `baliseZone` 117 · `baliseStand` 138 · `montePlan` 148
`onglets` 184 · `chargeFond` 218 · `changePlan` 250

Importe :

ambiance · apparence · bandes · calques-dessin · configuration · decor · dessin
distinctions · dom · donnees · evenement · mode-admin · ordre-trace · parcours
polices-plan · recherche · salon · texte · tiroirs-exclusifs · trace-itineraire
vous-etes-ici · vue

Importé par :

bande-admin · batiments · borne · calage-carte · demarrage · fiche · journee · nappe
outil-dessin · points-interet · reglage-foodtrucks · reprise-emplacements
tiroir-itineraire · tutoriel

### `modules/reperes.mjs` — 447 l. → plan, plan-admin

- l.1 · Les repères et les transports en commun — ce qu'ils sont

Fonctions :

`pictoDe` 141 · `nomTypeRepereFr` 198 · `nomTypeRepere` 200 · `typeZone` 240
`pictoForme` 247 · `estPorte` 267 · `ouvreEntrant` 268 · `ouvreSortant` 269 · `modeDit` 309
`lettreMode` 311 · `estTransport` 315 · `modeTransport` 318 · `glypheRepere` 330
`cleLigne` 367 · `ligneAffichee` 378 · `couleurLigne` 386 · `couleurRepere` 392
`encreRepere` 398 · `nomLigneFr` 412 · `libelleDoffice` 420 · `couleurEcrite` 427
`pastillePoi` 444

Importe :

couleurs

Importé par :

cartouche-poi · dessin · edition · fiche-zone · itineraire · outil-dessin · points-interet
socle-dessin · trajet · webgl

### `modules/reprise-emplacements.mjs` — 777 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`lacheGeo` 76 · `cleVerrouGeo` 100 · `geoVerrouille` 101 · `basculeVerrouGeo` 103
`boutonVerrouGeo` 118 · `modeGeometrie` 129 · `objetGeoSous` 153 · `groupeGeo` 163
`choisitGeo` 171 · `cadreGeo` 188 · `prisesGeo` 208 · `curseurGeo` 220
`dessinePoigneesGeo` 223 · `ecritDimensionsGeo` 251 · `nomSorteGeo` 263
`majPaletteGeo` 265 · `finGesteGeo` 304 · `enregistreGeo` 322 · `geometrieOrigine` 336
`retraceGeo` 351 · `pousseGeometrie` 362 · `appliqueDimensionGeo` 379
`enregistreAjout` 394 · `ajouteEmplacement` 409 · `renommeAjout` 437 · `lieAjout` 469
`ecritInfosAjout` 500 · `supprimeAjout` 532 · `choisitOutilGeo` 561 · `aideAjout` 568
`fermeAjout` 578 · `ajoutPointerDown` 587 · `ajoutPointerMove` 603 · `ajoutPointerUp` 625
`geometriePointerDown` 645 · `accrocheGeo` 676 · `geometriePointerMove` 678
`geometriePointerUp` 729 · `brancheRepriseEmplacements` 746

Importe :

aimants · calques-dessin · chemin-forme · configuration · dessin · distinctions · dom
donnees · emplacements · etat-emplacements · fenetre · fiche · fiche-zone · forme
geste-tenu · itineraire · libelles · mode-admin · modes-edition · noms-zones · ordre-trace
parcours · recherche · rendu · socle-dessin · vue · webgl

Importé par :

gestes-admin · outil-dessin · pile · plan-admin

### `modules/ressources-langue.mjs` — 91 l. → console

- l.1 · Le dictionnaire, dans la forme qu'i18next lit

Fonctions :

`normalise` 31 · `sansPluriel` 38 · `ressources` 54

Importé par :

traduction

### `modules/retour.mjs` — 63 l. → plan, plan-admin

- l.1 · Le retour sur une page restée ouverte

Fonctions :

`verifieAuRetour` 37 · `brancheRetour` 60

Importe :

salon

Importé par :

lancement

### `modules/salon.mjs` — 84 l. → plan, plan-admin

- l.1 · Le salon et la page : ce que l'adresse et la construction disent

Fonctions :

`cheminDuSalon` 33 · `cheminPartageable` 44 · `entetesApi` 61 · `configProjet` 80

Importé par :

affiche-ici · ambiance · application · borne · charge-annoncee · choix-ambiance
configuration · demarrage · enregistrement · erreurs · essai-rappel · ici · installation
mesure · notifications · parcours · partage · plan · rappels · recherche · releve · rendu
retour · scan-parcours · sonde · sponsor · tutoriel · vignettes

### `modules/scan-parcours.mjs` — 340 l. → plan, plan-admin

- l.1 · Lire le code QR d'un parcours, depuis le plan

Fonctions :

`chargeJsQr` 66 · `decodeur` 84 · `surToile` 121 · `fragmentDuCode` 150
`ouvreScanParcours` 173 · `brancheScanParcours` 335

Importe :

dom · fenetre · lien-parcours · parcours-recu · salon

Importé par :

lancement · plan

### `modules/secteurs.mjs` — 240 l. → plan, plan-admin

- l.1 · Les secteurs du salon, et la teinte de chacun sur le plan

Fonctions :

`coloreChaleur` 30 · `injecteChaleur` 34 · `champDecoupage` 37 · `premiere` 41
`valeurDecoupage` 52 · `confTeinte` 64 · `champsDecoupables` 85 · `indexeSecteurs` 104
`secteursMontres` 121 · `couleurConf` 125 · `couleurSecteur` 134 · `pastilleSecteur` 148
`coloreSecteurs` 167 · `peintSecteur` 229

Importe :

configuration · corps-fiche · couleurs · donnees · etat-emplacements · filtre · texte

Importé par :

chaleur · dessin · enregistrement · index-salon · pile · recherche · volets

Injections :

- `injecteChaleur` (partition) — la teinte des secteurs, publique, laisse la place à la carte de chaleur, d'administration

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

### `modules/session.mjs` — 193 l. → plan-admin, console, rapport, motdepasse

- l.1 · La session de l'exploitant, et l'appel à la base

Fonctions :

`accesBase` 15 · `contenuJeton` 42 · `resteJeton` 52 · `casierTient` 69
`echangeSession` 74 · `base` 121 · `stockage` 131 · `appelle` 135 · `initialesDe` 188

Importé par :

acces-admin · calage-carte · chaleur · enregistrement · fiche-zone · fige-carte
mot-de-passe · reglage-application · reglage-suggestion · socle-console

### `modules/seuil.mjs` — 179 l. → plan, plan-admin

- l.1 · Le parcours intelligent — le seuil de concentration

Fonctions :

`seuilGere` 74 · `seuilImpose` 75 · `seuilParSurface` 76 · `regleSeuil` 81
`aireDuStand` 99 · `seuilConcentration` 135 · `phraseSeuil` 158

Importe :

configuration · donnees · itineraire · terre

Importé par :

journee · reglages · volets

### `modules/socle-console.mjs` — 472 l. → console, rapport

- l.1 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`poseSession` 40 · `entetes` 63 · `adresseSure` 72 · `memeCompte` 76 · `renouvelle` 83
`appel` 109 · `rest` 142 · `ecranConfig` 167 · `ecranConnexion` 216 · `deconnecte` 286
`signale` 301 · `bloc` 325 · `grille` 343 · `idCompte` 360 · `themeSombre` 369
`premierEcran` 387 · `brancheSocle` 402

Importe :

dom · fenetre-console · session

Importé par :

appel-fonction · avancement · bases-klipso · comptes · console · duplication · ecran-console
evenements · export · fiche-detail · fiche-evenement · fuseau · provenance · rapport
rapport-utilisation · synchronisation

### `modules/socle-dessin.mjs` — 120 l. → plan-admin

- l.1 · Le socle de l'outil de dessin — ce que l'outil, l'éditeur et la reprise

Fonctions :

`copieCalques` 44 · `instantane` 52 · `clotSalve` 66 · `memorise` 67 · `toleranceTrace` 80
`fermeIci` 86 · `remplitListeSocietes` 91 · `societeSaisie` 99 · `optionsModes` 110
`pictoVerrou` 116

Importe :

calques-dessin · dessin · dom · donnees · enregistrement · reperes · texte · vue-etat

Importé par :

edition · outil-dessin · outil-escalier · reprise-emplacements

### `modules/sonde.mjs` — 1618 l. → plan, plan-admin

- l.1 · La sonde silencieuse — chaque visite dépose son résumé de performance

Fonctions :

`sur` 131 · `ms` 132 · `enCreux` 133 · `uuid` 136 · `echantillonne` 152 · `vue0` 173
`nouvelleVisite` 188 · `cumuleVu` 231 · `poseVu` 243 · `invisibleAvantAffichage` 256
`lcpVu` 263 · `boucleTue` 282 · `retiensPointeur` 296 · `vueDuMoment` 303 · `surLePlan` 310
`commence` 315 · `sorte` 326 · `clos` 329 · `relance` 345 · `image` 351 · `ecouteGestes` 384
`nomDuScript` 430 · `lu` 449 · `cumulDeck` 459 · `travauxDeck` 464 · `releveInstant` 490
`travauxPendant` 500 · `cleAttente` 588 · `lesAttentes` 600 · `guetteCompilation` 608
`imageDOuverture` 641 · `decoupe` 664 · `gel` 683 · `doitBattre` 740 · `bat` 749
`battu` 762 · `ecouteBattement` 784 · `dansLaCarte` 827 · `gelPendantLaCarte` 833
`etapeDeLaCarte` 839 · `laCarteDesEnvirons` 869 · `ecouteNavigateur` 885
`recoisEntree` 926 · `couvert` 968 · `pendantLAttente` 992 · `revoisLaPire` 1023
`pointeurDe` 1030 · `partsDeLInteraction` 1064 · `memoire` 1098 · `contexteDuPlan` 1111
`lisAppareil` 1123 · `handicapDeclare` 1159 · `finDesDonnees` 1173 · `trajetDesDonnees` 1188
`dureeDuContexte` 1200 · `appelsEnEchec` 1214 · `leChargement` 1236 · `lesTrajets` 1272
`fluidite` 1277 · `laCarte` 1286 · `resumeSonde` 1309 · `leBattement` 1343 · `octets` 1349
`coupe` 1352 · `tronque` 1363 · `fraiche` 1400 · `litLaFile` 1403 · `ecritLaFile` 1411
`retire` 1423 · `corps` 1426 · `versionDesPages` 1434 · `envoieUne` 1445 · `pousse` 1471
`actif` 1496 · `envoie` 1500 · `envoieLeResume` 1504 · `brancheSonde` 1529 · `demarre` 1542

Importe :

affichage · demarrage · donnees · environs · erreurs · journal-travaux · logos-stands
mesure · mesures-page · salon · webgl

Importé par :

lancement

### `modules/sponsor.mjs` — 413 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 112 · `secondesSponsor` 115 · `modeSponsor` 128 · `sponsorRetenu` 147
`cleSponsor` 178 · `sponsorEnCache` 181 · `retientSponsor` 196 · `ouvreSponsor` 221
`suitSponsor` 318 · `resteSponsor` 343 · `fermeSponsor` 349 · `accueilleSponsor` 365
`brancheSponsor` 404

Importe :

configuration · dom · donnees · salon · sur · vue

Importé par :

borne · demarrage · installation · lancement · reglage-sponsor · tutoriel

### `modules/style-attributs.mjs` — 54 l. → plan, plan-admin

- l.1 · Le style d'une surcouche, lu dans ses attributs

Fonctions :

`herite` 23 · `styleParAttributs` 39

Importé par :

webgl

### `modules/style-emplacements.mjs` — 130 l. → plan, plan-admin

- l.1 · Le style d'un stand et d'une zone, résolu sans la feuille de style

Fonctions :

`jetonsEmplacements` 40 · `fonce` 62 · `styleEmplacement` 80

Importe :

trace

Importé par :

plan · webgl

### `modules/style-habillage.mjs` — 209 l. → plan, plan-admin

- l.1 · Le style de l'habillage de Klipso, résolu sans la feuille de style

Fonctions :

`famillePlan` 39 · `jetonsHabillage` 54 · `styleSousCalque` 70 · `styleSansSousCalque` 85
`herite` 93 · `opacite` 107 · `opaciteElement` 123 · `motsCorps` 145 · `corpsDe` 155
`corps` 167 · `couleur` 178 · `styleElementHabillage` 191

Importe :

configuration

Importé par :

webgl

### `modules/suggestion.mjs` — 336 l. → plan, plan-admin

- l.1 · La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`reglageSugg` 80 · `seuilSugg` 82 · `presentationsSugg` 106 · `presenteSugg` 112
`critereSugg` 117 · `suggestionCourante` 134 · `exposantPropose` 170 · `nomValeurSugg` 195
`phraseSuggestion` 216 · `carteSuggestion` 245 · `poseSuggestion` 295
`fenetreSuggestion` 310

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

corps-fiche · fiche · fiche-zone · index-salon · plan · recherche · reglage-foodtrucks
sponsor · vignettes · webgl

### `modules/synchronisation.mjs` — 324 l. → console

- l.1 · Synchronisation d'un salon — lancement, suivi, vignettes des logos

Fonctions :

`brancheSynchronisation` 44 · `etapesPressenties` 62 · `synchronise` 83
`fabriqueLesVignettes` 199 · `oublieLePlan` 318

Importe :

appel-fonction · avancement · dom · encodeur-avif · evenements · marque · provenance
socle-console · traduction

Importé par :

ecran-console · fiche-evenement

### `modules/temps.mjs` — 146 l. → plan, plan-admin

- l.1 · Les dates et les heures du salon

Fonctions :

`possible` 26 · `momentLocal` 41 · `jourLong` 72 · `jourCourt` 79 · `dateDeCle` 86
`jourBref` 92 · `jourISO` 99 · `instantMural` 120 · `minutesDe` 134 · `ecritHeure` 136
`ecritMinutes` 141

Importé par :

abords-salles · charge-annoncee · edition · fiche · horaires · itineraire · journee
parcours · points-interet · rappels · recherche · sejour · tiroir-parcours

### `modules/terre.mjs` — 173 l. → plan, plan-admin

- l.1 · Le plan sur la Terre — le calcul, sans la carte

Fonctions :

`metresParDegre` 23 · `tourneEnvirons` 40 · `versTerre` 46 · `versLePlan` 53 · `reancre` 68
`pixelsMercator` 87 · `latitudeDePixel` 96 · `echelleDesTuiles` 116 · `niveauDesTuiles` 128
`aireDuContour` 138 · `centreDuContour` 147 · `axeDuContour` 160

Importé par :

calage-carte · environs · seuil

### `modules/texte-plan.mjs` — 157 l. → plan, plan-admin

- l.1 · Le texte sur le plan — sa mesure, sa coupe en lignes, sa place
- l.18 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.148 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`mesureTexte` 26 · `mesureIci` 31 · `largeur` 35 · `remesureTextes` 68 · `decoupe` 99
`habille` 116 · `coupes` 133 · `lignesSvg` 141 · `ancre` 156 · `place` 157

Importe :

texte

Importé par :

affiche-ici · appels · dessin · gestes · libelle-place · libelles · nom-emplacement · plan
recherche

### `modules/texte.mjs` — 44 l. → plan, plan-admin, console, rapport

- l.1 · Le texte : l'écrire dans la page, le découper, le ranger

Fonctions :

`esc` 11 · `separeValeurs` 22 · `pourRecherche` 42

Importé par :

affiche-ici · apercus · cartouche-poi · classeur · corps-fiche · dessin · distinctions
ecran-console · edition · emplacements · environs · fiche · fiche-detail · fiche-zone
filtre · fuseau · gestes · ici · index-salon · libelles · nom-emplacement · outil-dessin
parcours · pile · points-interet · qr · rapport-utilisation · recherche · reglage-fiche
reglage-suggestion · rendu · secteurs · socle-dessin · suggestion · sur · texte-plan
trace-itineraire · trajet

### `modules/tiroir-itineraire.mjs` — 721 l. → plan, plan-admin

- l.1 · Itinéraire — le tiroir et la visée

Fonctions :

`calculeRoute` 74 · `champIti` 92 · `fermeSugg` 96 · `montreSugg` 106 · `choisitPoint` 144
`valideSaisie` 153 · `effaceItineraire` 165 · `relance` 203 · `montreResultat` 249
`majRappelRoute` 267 · `ecritResultat` 278 · `poseVisee` 422 · `injecteVisee` 435
`suitLaVisee` 437 · `bandeauVisee` 439 · `armeVisee` 462 · `finVisee` 480
`viseItineraire` 496 · `visePoi` 502 · `visePoint` 508 · `ouvreItineraire` 536
`fermeItineraire` 571 · `quitteItineraire` 588 · `versItineraire` 595
`versItineraireDe` 598 · `brancheTiroirItineraire` 625

Importe :

calques-dessin · configuration · dom · donnees · ecran · evenement · forme-choisie
itineraire · mesure · parcours · rendu · sejour · tiroirs-exclusifs · trace-itineraire
vous-etes-ici

Importé par :

affiche-ici · borne · fiche · gestes · ici · journee · lancement · nappe · outil-dessin
points-interet · tutoriel · volets

Injections :

- `injecteVisee` (registre) — la borne et le code « Vous êtes ici » y inscrivent leur propre visée ; la page publique n'a pas la seconde

### `modules/tiroir-parcours.mjs` — 300 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`rafraichitParcours` 50 · `remplitParcours` 80 · `quitteParcours` 175 · `ouvreParcours` 181
`videLeParcours` 197 · `brancheTiroirParcours` 227

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

### `modules/tiroirs.mjs` — 734 l. → plan, plan-admin

- l.1 · Les tiroirs des écrans étroits — la liste, et ceux que la hauteur mène
- l.26 · Ce que les tiroirs lisent d'un geste
- l.166 · Le tiroir de la liste — écrans étroits
- l.415 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`traceurDeGeste` 50 · `cranVoisin` 69 · `enHaut` 87 · `aSonGeste` 94 · `meneParLeCorps` 121
`retraitBas` 189 · `mesureTiroir` 202 · `montreTiroir` 205 · `hisseTiroir` 209
`tiroirListe` 216 · `tiroirCrante` 443 · `rangeDansLaPartVue` 702 · `brancheTiroirs` 714

Importe :

cadre-visible · dom · ecran · journal-travaux · panneau-criteres

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

### `modules/toucher.mjs` — 61 l. → plan, plan-admin

- l.1 · Un toucher qui se sent — la vibration brève du téléphone

Fonctions :

`vibre` 38 · `interrupteur` 51

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

### `modules/trace-itineraire.mjs` — 439 l. → plan, plan-admin

- l.1 · Le tracé d'un itinéraire sur le plan

Fonctions :

`poseTrace` 42 · `marchesIci` 44 · `rayonBout` 49 · `arreteTracage` 82 · `tronconsDe` 103
`traceDe` 121 · `couleursItin` 135 · `styleBout` 152 · `peintItineraire` 176
`lanceEtincelle` 261 · `pointA` 282 · `courtEtincelle` 290 · `placePouls` 318
`lanceTracage` 333 · `dessineItineraire` 358 · `rafraichitBouts` 384 · `cadreItineraire` 414

Importe :

camera · dom · donnees · ecran · evenement · itineraire · jetons-racine · texte · vue

Importé par :

journee · libelles · rendu · tiroir-itineraire

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

Importé par :

chaleur · outil-comptoir · plan · style-emplacements · webgl

### `modules/traduction.mjs` — 150 l. → console

- l.1 · La traduction par i18next — `t()`, pour les modules migrés

Fonctions :

`moteur` 49 · `langueDeT` 90 · `t` 102 · `verseAnglais` 122 · `suis` 134

Importe :

evenement · ressources-langue

Importé par :

synchronisation

### `modules/trait-chemin.mjs` — 377 l. → plan, plan-admin

- l.1 · Du chemin en cases au trait qu'on suit

Fonctions :

`reduit` 23 · `guidageAllees` 86 · `recentre` 142 · `passable` 227 · `lisse` 261
`longueur` 288 · `longueurDehors` 304 · `nettoie` 346

Importe :

grille-marche

Importé par :

itineraire · troncon

### `modules/trajet.mjs` — 539 l. → plan, plan-admin

- l.1 · Le trajet complet — points désignables, liaisons, passage d'un plan à l'autre

Fonctions :

`pointObjet` 27 · `pointRepere` 34 · `repondants` 48 · `candidats` 82 · `pointSaisi` 89
`portesDe` 109 · `versPorte` 116 · `typeLiaison` 177 · `nomRepere` 185
`oublieLiaisons` 203 · `lienEcrits` 215 · `ecritLiens` 224 · `annuaireLiaisons` 229
`liensDe` 261 · `coutLiaison` 281 · `passagePraticable` 288 · `passagesDe` 296
`sortiesDe` 306 · `plansRelies` 314 · `oublieBalayages` 338 · `balayage` 339
`distanceDepuis` 357 · `cheminLiaisons` 384 · `routeParLiaisons` 470 · `routeEntre` 508

Importe :

donnees · grille-marche · recherche-chemin · reperes · texte · troncon

Importé par :

ici · itineraire · itineraire

### `modules/troncon.mjs` — 363 l. → plan, plan-admin

- l.1 · Le tronçon — d'un point à un autre dans un même pavillon

Fonctions :

`oublieFaces` 32 · `facesLibres` 34 · `amorce` 135 · `faceDeSortie` 170 · `raccordTient` 216
`accesDe` 246 · `couplesAcces` 298 · `troncon` 331

Importe :

abords-salles · grille-marche · recherche-chemin · trait-chemin

Importé par :

itineraire · trajet

### `modules/tutoriel.mjs` — 1083 l. → plan, plan-admin

- l.1 · La visite guidée — le tour du plan, geste par geste

Fonctions :

`route` 73 · `attente` 74 · `iti` 75 · `visee` 76 · `eteintVisee` 77 · `journee` 79
`vueJournee` 80 · `sejour` 81 · `iciActif` 83 · `dessinEnCours` 86 · `glissements` 115
`reglageTuto` 127 · `tutoPropose` 136 · `cleTuto` 140 · `tutoOuvert` 142 · `tutoModale` 143
`tutoVisible` 146 · `tutoFicheOuverte` 152 · `tutoFiche` 155 · `tutoParcours` 157
`tutoItineraire` 161 · `tutoJournee` 165 · `zoneDuTuto` 173 · `insecable` 190
`phraseTrajetTuto` 196 · `chapitresTuto` 472 · `proposeTutoriel` 492 · `lanceTutoriel` 550
`quitteTutoriel` 637 · `chapitreTuto` 649 · `battementTuto` 658 · `finTuto` 676
`afficheTuto` 693 · `attendsTiroirs` 743 · `pxTuto` 768 · `boiteTuto` 781 · `repereTuto` 796
`rameneTuto` 829 · `placeTuto` 867 · `voileTuto` 961 · `rafaleTuto` 978
`traitsZoneTuto` 991 · `marqueZoneTuto` 1015 · `marqueLibelleTuto` 1066

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

Importe :

calques-dessin · configuration · corps-fiche · dom · donnees · ecran · etat-emplacements
fenetre · fiche · forme-choisie · ici · itineraire · jetons-racine · journee · libelle-place
parcours · rendu · salon · sponsor · tiroir-itineraire · tiroir-parcours · visite-guidee
vue · webgl

Importé par :

demarrage · installation · plan · volets

### `modules/vignettes.mjs` — 112 l. → plan, plan-admin

- l.1 · Les vignettes des logos — ce qui est arrivé, et où le demander

Fonctions :

`sansAvif` 45 · `vignettesLisibles` 59 · `adresseVignette` 90 · `adresseGrande` 111

Importe :

evenement · marque · salon · sur

Importé par :

demarrage · fiche · logos-stands · recherche

### `modules/visite-guidee.mjs` — 17 l. → plan, plan-admin

- l.1 · La visite guidée en cours — ou rien

Fonctions :

`poseTuto` 17

Importé par :

installation · rappels · tutoriel

### `modules/volets.mjs` — 1486 l. → plan-admin

- l.1 · Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —

Fonctions :

`secteurs` 61 · `voletAdmin` 72 · `blocOptions` 274 · `blocLangues` 321 · `blocBarre` 395
`blocHoraires` 453 · `voletParcours` 600 · `sallesSituees` 735 · `voletPmr` 751
`nomDuTon` 842 · `svgVignette` 851 · `barreVignette` 853 · `vignetteDistPlan` 857
`vignetteDistListe` 870 · `vignetteDistFiche` 884 · `salonDitSes` 904 · `coinPris` 911
`voletDist` 934 · `blocDecoupage` 1104 · `voletApparence` 1152

Importe :

ambiance · apercus · apparence · configuration · corps-fiche · distinctions · donnees
fenetre · fiche-zone · filtre · habillage · horaires · itineraire · libelles · mode-admin
modeles · nom-emplacement · nuancier · options · ordre-trace · polices-plan · recherche
reglage-application · reglage-installation · reglage-rappel · reglage-sponsor · secteurs
seuil · tiroir-itineraire · tutoriel · webgl

Importé par :

reglages

### `modules/vous-etes-ici.mjs` — 144 l. → plan, plan-admin

- l.1 · « Vous êtes ici » — le départ imposé, et son point sur le plan

Fonctions :

`pointBorne` 27 · `poseLieuBorne` 32 · `ecritDepartBorne` 42 · `rayonBorne` 54
`dessineBorne` 59 · `placePouls` 89 · `rafraichitBorne` 122 · `rempliBorne` 127

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

### `modules/vue.mjs` — 753 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.85 · 6. Vue

Fonctions :

`injecteALaVue` 70 · `enEdition` 76 · `libelles` 77 · `poseEmprise` 83 · `figeTextes` 107
`rendTextes` 115 · `cadrage` 154 · `peintLibelles` 159 · `repeintLibelles` 167
`detacheLibelles` 171 · `rattacheLibelles` 183 · `etireLibelles` 201
`poseFacteurTrait` 216 · `suitLaVue` 232 · `versScene` 241 · `retiensVue` 260
`appliqueVue` 270 · `libellesDeLaVue` 344 · `rafraichitVue` 352 · `poseVue` 366
`mesureBarre` 395 · `masqueHaut` 429 · `masque` 436 · `masqueDroite` 473 · `fit` 484
`recadreIncline` 518 · `stoppeZoom` 561 · `glisseVersVise` 579 · `glisseVers` 632
`rectVisee` 659 · `zoom` 679 · `echelle` 697 · `versPlan` 709 · `brancheVue` 721

Importe :

camera · chemin-forme · dom · ecran · environs · erreurs · lot-fige · ordre-trace · vue-etat
vue-etat · webgl

Importé par :

affiche-ici · appels · batiments · borne · calage-carte · cartouche-poi · chaleur
demarrage · dessin · edition · edition-en-cours · fiche · gestes · lancement · libelles
mini-carte · nappe · outil-comptoir · outil-dessin · outil-escalier · outil-foodtruck
placement-libelles · plan · points-interet · recherche · rendu · reprise-emplacements
sponsor · trace-itineraire · tutoriel · vous-etes-ici

Injections :

- `injecteALaVue` (rendu) — chaque image d'un geste rappelle, dans un ordre fixe, ce qui suit la vue : noms, poignées, pastilles, flèches, borne, calage

### `modules/webgl.mjs` — 4394 l. → plan, plan-admin

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`injecteAuWebgl` 89 · `moteurVoulu` 109 · `jetteContexte` 137 · `carteDuWebgl` 144
`sansCarteGraphique` 165 · `chargeWebgl` 271 · `chargeDeck` 322 · `signaleRate` 335
`circonstancesDuRefus` 355 · `sortesDeChauffe` 402 · `chauffeAvantLesDonnees` 412
`finisChauffe` 445 · `brancheWebgl` 457 · `monteWebgl` 477 · `poseToileWebgl` 665
`guetteContexteWebgl` 671 · `contextePerduWebgl` 681 · `verifieContexteWebgl` 688
`guetteBoucleWebgl` 730 · `perdContexteWebgl` 751 · `renonceAuDessin` 795
`remonteWebgl` 801 · `vueDeck` 819 · `enCamera` 839 · `vuesGl` 843 · `effetsGl` 867
`basculeCamera` 877 · `vueWebgl` 890 · `blocDe` 907 · `majEditionWebgl` 920 · `cleBloc` 932
`planifieWebgl` 958 · `toutRepeindreWebgl` 962 · `blocsDansLOrdre` 973 · `repeintWebgl` 978
`pointsParMetre` 1014 · `assembleWebgl` 1040 · `assembleCouches` 1043 · `memesElements` 1086
`cleReunion` 1094 · `reunisCalques` 1119 · `reunisVolumes` 1174 · `sorteDe` 1209
`cleChauffe` 1271 · `chauffe` 1279 · `copiesQuiDessinent` 1327 · `guetteChauffe` 1345
`finisLaChauffe` 1386 · `parEtapes` 1398 · `demandeChauffeLogos` 1422 · `auCreux` 1438
`largeurLisere` 1470 · `constTexte` 1473 · `jeuDeCaracteres` 1639 · `sousPixelOffert` 1695
`couchesPetites` 1703 · `filtreCouches` 1738 · `poseGeste` 1750 · `positionTexte` 1770
`cleChoisi` 1810 · `versEcran` 1813 · `enveloppe` 1820 · `nomsCaches` 1831
`parametresTexte` 1860 · `nomsAPlat` 1869 · `couchesTexte` 1871 · `accVide` 1921
`prisesDuBloc` 1924 · `convertitBloc` 1927 · `tracesDe` 1972 · `estEmplacement` 1981
`etatDe` 1986 · `emplacementGl` 1991 · `emplacementDe` 2044 · `contexteEmplacements` 2052
`poseContexte` 2066 · `signeEtat` 2076 · `memesNombres` 2081 · `emplacementGarde` 2088
`enRoute` 2114 · `verse` 2122 · `compareConversions` 2146 · `accDe` 2179 · `parcoursGl` 2196
`tracesDeForme` 2227 · `estHabillage` 2255 · `habillageGl` 2257 · `parcoursHabillage` 2275
`parcoursAttributs` 2304 · `compareLectures` 2328 · `resteDebout` 2362 · `dedansAnneau` 2370
`auDessusDuSol` 2395 · `surSonStand` 2404 · `standDeLaMarque` 2410
`marquesSurLesToits` 2422 · `hauteurVolume` 2439 · `zoneMeublee` 2471 · `poseJeton` 2523
`mul4` 2547 · `enColonnes` 2556 · `translation` 2557 · `homothetie` 2559 · `autourDuZ` 2560
`matriceJeton` 2569 · `corpsDansLeJeton` 2585 · `couchesJeton` 2593 · `couchesJetons` 2641
`meubleZone` 2683 · `dansLeHall` 2760 · `teinteDesFigurants` 2783 · `coucheFigurants` 2831
`penchee` 2883 · `couchesFigurants` 2894 · `eclatant` 2944 · `opaque` 2950 · `formeGl` 2957
`corpsDeclare` 3028 · `texteGl` 3042 · `imageGl` 3066 · `imageDressee` 3108
`socleImage` 3122 · `partage` 3134 · `designeGl` 3140 · `sortie` 3154 · `noteHauteur` 3160
`anticipeHausses` 3190 · `monteALAppui` 3216 · `rendLAppui` 3228 · `detacheVolume` 3238
`hauteurEnCours` 3272 · `hauteurHausse` 3278 · `echelleHausse` 3283 · `haussesParId` 3286
`memesFormes` 3305 · `memesPoints` 3315 · `memesTraits` 3333 · `signeTraits` 3343
`signeCouleurs` 3353 · `masqueVolumes` 3361 · `aPlat` 3381 · `ombresAuRepos` 3393
`couchesDeBloc` 3418 · `modelesLibellesHtml` 3539 · `poseModelesLibelles` 3549
`lisModelesLibelles` 3555 · `groupesNoms` 3588 · `couchesNoms` 3614
`couchesPastilles` 3630 · `couchesLibellesWebgl` 3647 · `couchesDessineesWebgl` 3700
`stage` 3721 · `lectureDifferee` 3754 · `survolTrouve` 3794 · `demandeSurvolWebgl` 3800
`survoleWebgl` 3806 · `brancheSurvolWebgl` 3834 · `poseSurvolWebgl` 3847 · `enTuiles` 3884
`hauteurTuile` 3897 · `visePour` 3903 · `suisChoisies` 3913 · `gonfleSurvol` 3921
`coucheTuileSoulevee` 3944 · `couchesTuiles` 3975 · `poseCurseurWebgl` 3988
`poseFocusWebgl` 3997 · `aplatsDe` 4004 · `coucheSurvol` 4007 · `coucheSurvolVolume` 4032
`coucheFocus` 4068 · `couchesPhare` 4098 · `lueurDe` 4115 · `opacitePhare` 4153
`echellePhare` 4154 · `couchesPhareNoms` 4157 · `instant` 4183 · `aUnInstant` 4185
`animeCouche` 4190 · `majAnimationWebgl` 4210 · `animeWebgl` 4218 · `reanime` 4254
`logosSurLesToits` 4263 · `objetSous` 4293 · `sansProfondeurDeDesignation` 4314
`peutDesigner` 4334 · `objetSousDiffere` 4336 · `viseEnAvance` 4352 · `lisObjet` 4360
`cibleWebgl` 4365 · `priseWebgl` 4375 · `libelleSousWebgl` 4380 · `rectEcranWebgl` 4385

Importe :

affichage · calque-detache · camera · chemin-forme · configuration · couleurs · decor
densite-rendu · dom · donnees · erreurs · etat-emplacements · evenement · figurants
habillage-svg · itineraire · libelle-place · logos-stands · moteur-gl · reperes
style-attributs · style-emplacements · style-habillage · sur · trace · vue-etat

Importé par :

batiments · edition · edition-en-cours · fiche · gestes · lancement · libelles
placement-libelles · plan · plan · releve · reprise-emplacements · sonde · tutoriel · volets
vue

Injections :

- `injecteAuWebgl` (rendu) — la carte graphique lit la vue, les gestes et les noms de modules qui l'importent pour la monter

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 551 l.

`champs` 179 · `decoupe` 191 · `valeursOui` 266 · `imageDistante` 301 · `lit` 323
`valeursDe` 346 · `cibleEn` 389 · `champsPerso` 406 · `cibles` 432 · `separeValeurs` 462
`noteValeurs` 500 · `valeursRelevees` 521 · `valeurPerso` 544

### `supabase/functions/_partage/eventmaker.ts` — 1217 l.

`grapheJson` 233 · `enParallele` 1025 · `texteSeul` 1045 · `champs` 1182

### `supabase/functions/_partage/gaia.ts` — 305 l.

`aplatit` 266 · `egal` 300

### `supabase/functions/_partage/geometrie.ts` — 219 l.

`r2` 23 · `versAnneaux` 26 · `versTrace` 44 · `distSegment` 55 · `dansForme` 68
`distBord` 75 · `poleInterieur` 94 · `portee` 115 · `reduitDedans` 131 · `boite` 147
`emprise` 200 · `dedans` 211

### `supabase/functions/_partage/octets.ts` — 31 l.

`octetsDeVignette` 12 · `typeDeVignette` 27

### `supabase/functions/_partage/png.ts` — 22 l.

`largeurPng` 14

### `supabase/functions/_partage/programme-saisi.ts` — 89 l.

`programmeSaisi` 52

### `supabase/functions/_partage/push.ts` — 260 l.

`octets` 49 · `base64url` 57 · `colle` 63 · `texte` 71 · `cleDeSignature` 83
`jetonVapid` 105 · `derive` 131 · `chiffre` 145 · `destinationPermise` 199 · `pousse` 223

### `supabase/functions/_partage/refus.ts` — 39 l.

`sessionRefusee` 23 · `identifiantDePavillon` 36

### `supabase/functions/_partage/svg.ts` — 307 l.

`attributsDeDessin` 75 · `r2` 92 · `points` 112 · `boite` 167 · `neDessineRien` 190
`allege` 202 · `sansMasques` 287 · `textes` 298

### `supabase/functions/_partage/version.ts` — 100 l.

`versionFond` 47 · `versionDuPlan` 92 · `condense` 96

### `supabase/functions/_partage/vignette.ts` — 41 l.

`cleDeVignette` 31

### `supabase/functions/comptes/index.ts` — 291 l.

`cors` 39 · `service` 49 · `retourValide` 68

### `supabase/functions/mesure/index.ts` — 173 l.

`jeton` 80 · `client` 83

### `supabase/functions/plan-de-visite/index.ts` — 146 l.

`jeton` 57 · `client` 60 · `json` 67

### `supabase/functions/plan-public/index.ts` — 1206 l.

`cors` 54 · `db` 88 · `service` 103 · `vignettesParAdresse` 125 · `avecVignette` 179
`rendVignette` 223 · `rendGrande` 250 · `rendVignettes` 342 · `lu` 385 · `salon` 395
`appDuSalon` 421 · `rendIconeApp` 456 · `retraits` 573 · `ampute` 600 · `masquesDe` 643
`masquesDuPlan` 663

### `supabase/functions/rappels/index.ts` — 257 l.

`client` 68 · `cles` 75 · `json` 81 · `refus` 87 · `enregistre` 92 · `envoie` 153
`poidsCharge` 218 · `borneCharge` 220

### `supabase/functions/sync-evenement/index.ts` — 1963 l.

`cors` 45 · `bourre` 118 · `client` 128 · `ecrit` 150 · `gaia` 158 · `cleKlipso` 169
`libellesChoix` 188 · `retiensAnglais` 215 · `fournisseur` 233 · `raccourci` 241
`enClair` 278 · `range` 304 · `champsKlipso` 325 · `hebergee` 1911 · `nettoieUrl` 1939
`groupeTextes` 1949

### `supabase/functions/vignettes/index.ts` — 272 l.

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
- `20261014082348_grandes_vignettes_a_redetourer.sql` — —
- `20261020224043_le_programme_de_conferences_saisi_a_la_main.sql` — evenement
- `20261021115942_sonde_de_performance.sql` — releve_perf, perf_jour, perf_bilan, fn sonde_nombre, fn sonde_enregistre, fn sonde_publique, fn sonde_admin, fn sonde_detail, fn bilan_perf, fn purge_perf, fn performances_du_salon
- `20261021193740_lecture_des_performances.sql` — lecteur_perf, fn lecteur_perf_nouveau, fn lecteur_perf_retire, fn lecture_perf
- `20261022082549_une_cle_par_base_klipso.sql` — base_klipso, prive.cle_klipso, fn enregistre_base_klipso, fn cle_klipso
- `20261022110142_vignettes_lues_par_leurs_adresses_en_une_fois.sql` — fn vignettes_par_source
- `20261022135740_les_erreurs_des_pages_lues_par_jeton.sql` — fn lecture_perf
- `20261106112458_funexpo_2026_la_conference_de_requiem_memory.sql` — —
- `20261110160353_funexpo_2026_les_visites_d_avant_le_10_novembre_16_h_retirees.sql` — —
- `20261111120704_le_fond_de_carte_fige.sql` — fn environs_accessible
- `20261112170643_la_lecture_des_presences_bornee_au_salon.sql` — —
- `20261112182349_les_droits_et_les_bornes_que_la_revue_a_releves.sql` — fn source_du_salon_reservee, fn bilan_perf, fn rappels_dus, fn pose_plan_de_visite
- `20261112192358_les_droits_d_un_compte_remplaces_d_un_seul_geste.sql` — fn remplace_acces
- `20261112212202_la_seconde_revue_de_securite_bornes_droits_et_purges_verifiees.sql` — fn enregistre_rappels, fn erreur_publique
- `20261112214003_la_seconde_revue_suite_droits_du_service_bilans_et_remise_a_zero.sql` — fn enregistre_mesures, fn reinitialise_compteurs, fn bilan_perf, fn sonde_detail
- `20261113150934_les_reglages_d_apparence_fusionnes_cle_par_cle_en_base.sql` — fn fusionne_apparence
- `20261113184112_les_rappels_ne_s_oublient_pas_sur_un_programme_tronque.sql` — evenement, fn oublie_rappels_perimes
- `20261113184247_le_jour_d_un_plan_de_visite_dans_le_fuseau_du_salon.sql` — fn pose_plan_de_visite
- `20261113184353_les_mesures_d_avant_une_remise_a_zero_ne_reviennent_pas.sql` — evenement, fn enregistre_mesures, fn reinitialise_compteurs
- `20261114113307_les_compteurs_d_usage_lus_par_jeton.sql` — fn lecture_perf

## Le reste

- `src/index.mjs` — 156 l. · Worker Cloudflare : sert les pages, relaie les lectures du plan et les mesures d'utilisation.
  `surete` 67 · `minute` 94 · `aiguille` 115
- `src/application.mjs` — 302 l. · L'application installée d'un salon : son adresse propre (`/plan-<salon>`), son manifeste et son icône.
  `cleApp` 26 · `cheminDuSalon` 57 · `pageDuSalon` 74 · `appDuSalon` 98 · `iconesDuSalon` 148 `manifeste` 188 · `iconeApp` 278
- `src/carte.mjs` — 82 l. · Ramener une position du script minifié à sa source.
  `nombres` 23 · `lisCarte` 43 · `source` 68
- `src/commun.mjs` — 112 l. · Ce que tous les chemins du Worker partagent : l'adresse du projet, la distinction entre production et prévisualisation, le contrôle d'un slug, la réponse de service et les en-têtes CORS des relais ouverts.
  `enApercu` 39 · `cacheDe` 49 · `ecritEnProduction` 56 · `ecartee` 59 · `dit` 69 `condense` 78
- `src/mesures.mjs` — 314 l. · Ce que les pages font remonter : mesures d'usage (`/api/mesure`), erreurs (`/api/erreur`) et relevés de performance (`/api/sonde`).
  `mesure` 44 · `carteDuScript` 138 · `lieuDe` 151 · `erreur` 165 · `texteDuScript` 217 `geleResolu` 230 · `sonde` 277
- `src/plan.mjs` — 413 l. · Le plan d'un salon : relais de `/api/plan` vers la fonction `plan-public`, gardé dans le stockage KV, et ce qui le fait oublier (`/api/oublie`).
  `amontPour` 57 · `cleDe` 65 · `cleDeLot` 71 · `cleVersion` 100 · `versionGardee` 103 `rangeLaVersion` 107 · `ditVersion` 121 · `meta` 130 · `gardable` 146 · `range` 152 `rangeLePlan` 161 · `rafraichit` 177 · `entete` 206 · `oublie` 268 · `relaiePlan` 319
- `src/visite.mjs` — 164 l. · Ce que le visiteur prépare : ses rappels de conférence (`/api/rappels`), son plan de visite annoncé (`/api/plan-de-visite`) et la charge qu'annoncent ceux des autres (`/api/charge`).
  `rappels` 60 · `planDeVisite` 102 · `chargePrevue` 141
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/pwa.js` — le manifeste et l'en-tête qui rendent les pages installables.
- `outils/icones.js` — dessine l'icône de l'application, et l'encode en PNG.
- `outils/carte.js` — produit ce fichier.
- `outils/controles/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/controles/controle.js` — analyse le script de chaque page construite, en module
  ES : une redéclaration y est une erreur, là où un `<script>` la tolère.
- `outils/scripts/migration.js` — crée une migration horodatée à la seconde.
- `outils/polices.js` — rapatrie les polices de Google dans `web/polices/`, hors
  construction (réseau requis) ; écrit `outils/donnees/polices.json`, relu par `genere.js`.
- `outils/gabarit/_langue.js` — la version anglaise : posé en tête de chaque page, il
  traduit ce qu'elle affiche d'après le dictionnaire, et tient la bascule FR/EN.
- `outils/anglais/` — le dictionnaire anglais, un fichier par module ; `serveur.js` et
  `donnees.js` pour ce qui arrive du serveur, `invisibles.js` pour les faux positifs.
- `outils/traductions.js` — relève les chaînes visibles du gabarit, échoue sur celles
  qui n'ont pas de traduction ; choisit aussi ce que chaque page emporte du dictionnaire.
- `outils/scripts/klipso/fetch-all.js`, `outils/scripts/klipso/build-all.js`, `outils/scripts/klipso/optim.js`, `outils/scripts/klipso/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
