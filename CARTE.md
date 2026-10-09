<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 34 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 9. Apparence des calques — le branchement

### `_admin2.html` — 23 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage — le branchement

### `_aimants.html` — 23 l. → plan-admin.html

- l.3 · 11 quater. Dessiner juste — le branchement

### `_auth-plan.html` — 14 l.

- l.2 · Accès à l'administration du plan — le branchement

### `_batiments.html` — 20 l.

- l.2 · 11 quinquies. Bâtiments de la bibliothèque — le branchement

### `_borne.html` — 19 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 quinquies. La borne interactive — le branchement

### `_branche-mesure.html` — 10 l.

- l.1 · 13. Mesure d'utilisation — le branchement

### `_chaleur.html` — 13 l.

- l.1 · 14. Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 21 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — le branchement

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 78 l. → admin-plans.html

Éléments :

`#choixEvt` · `#etatEvt` · `#btnRecharger` · `#btnNouveau` · `#statut` · `#lienPublic`
`#lienAdmin` · `#lienBorne` · `#lienRapport` · `#btnExcel` · `#btnSources` · `#btnEtat`
`#btnDupliquer` · `#btnSupprimer` · `#sepActions` · `#btnComptes` · `#btnProjet`
`#btnExport` · `#btnLangue` · `#btnCompte` · `#initiales` · `#compteMail` · `#btnTheme`
`#btnSortir` · `#fiche`

### `_console-js.html` — 19 l.

- l.2 · La console multi-événements — le branchement, et le démarrage

### `_console.css` — 725 l. → console.css

- l.666 · Page de rapport

### `_dessin.html` — 36 l.

- l.2 · 11. Calques de dessin — le branchement

### `_edition.html` — 23 l. → plan-admin.html

- l.1 · Édition des formes existantes

### `_entete.html` — 6 l.

### `_environs.html` — 22 l.

- l.1 · 16. Les environs — le branchement

### `_export.html` — 12 l.

- l.1 · Export par exposant — le branchement

### `_fiche.html` — 35 l.

- l.3 · 7. Sélection et fiche

### `_geometrie.html` — 26 l. → plan-admin.html

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

### `_ici.html` — 15 l.

- l.1 · 11 septies. « Vous êtes ici » — le branchement

### `_index.html` — 27 l. → index.html

- l.18 · L'aiguillage de la racine — le branchement

Éléments :

`#secours`

### `_installation.html` — 15 l.

- l.1 · 16. L'invitation à installer le plan

### `_itineraire.html` — 33 l.

- l.1 · 11 ter. Itinéraire — le tiroir, la visée et le tracé

### `_journee.html` — 12 l.

- l.1 · 11 ter. Organiser sa visite — le branchement

### `_js.html` — 49 l. → plan-admin.html, plan-smcl.html, plan.html

- l.27 · 1. Index global — le branchement

Éléments :

`#data`

### `_langue.js` — 798 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_modales.html` — 16 l.

- l.2 · Fenêtres modales — le branchement

### `_mode-admin.html` — 34 l.

- l.3 · 10. Mode administration — le branchement

### `_motdepasse.html` — 69 l. → motdepasse.html

- l.61 · Poser un mot de passe — le branchement

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 14 l.

- l.2 · 11 bis. Parcours de visite — le branchement

### `_partage.html` — 12 l.

- l.1 · 11 quinquies. Partager son parcours — le branchement

### `_pousse.html` — 20 l.

- l.1 · Enregistrer la configuration — le branchement

### `_rappels.html` — 15 l.

- l.1 · 11 sexies. Le rappel avant une conférence

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 16 l.

- l.2 · Rapport d'utilisation — le branchement

### `_recherche.html` — 32 l.

- l.3 · 5. Recherche et secteurs — le branchement

### `_rendu.html` — 48 l.

- l.3 · 2 à 4. Le plan à l'écran — le branchement

### `_sponsor.html` — 16 l.

- l.1 · 18. Le sponsor — un logo le temps du chargement

### `_styles-divers.css` — 315 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-jetons.css` — 270 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles-parcours.css` — 1556 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles.css` — 830 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-parcours.css` — 601 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-plan.css` — 1600 l. → plan-admin.html, plan-smcl.html, plan.html

### `_suggestion.html` — 19 l.

- l.1 · 15. La suggestion — le branchement

### `_sw.js` — 566 l.

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_vue.html` — 33 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 6. Vue — le branchement

### `_webgl.html` — 23 l.

- l.1 · 13 bis. Le plan peint par la carte graphique — le branchement

### `modules/acces-admin.mjs` — 243 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`litLocal` 33 · `configuration` 38 · `normaliseUrlA` 42 · `sessionValide` 58
`ecranAcces` 76 · `contenuDuJeton` 167 · `mailDuJeton` 168 · `litProfilA` 179
`poseCompte` 194 · `brancheAcces` 220

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `modules/accueil.mjs` — 11 l. → accueil

- l.1 · Point d'entrée de la page d'accueil — la racine

### `modules/affiche-ici.mjs` — 391 l. → plan-admin

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

### `modules/aimants.mjs` — 534 l. → plan-admin

- l.1 · Dessiner juste — cote, aimants, répétition

Fonctions :

`vue` 31 · `imageEnAttente` 32 · `formeSel` 33 · `calqueActif` 34 · `cadrePlan` 35
`mesCalques` 36 · `estCadre` 37 · `boite` 38 · `toleranceTrace` 39 · `apercuGuide` 40
`formeParId` 41 · `ajouteForme` 42 · `choisitForme` 46 · `signale` 47 · `memorise` 48
`enregistreDessins` 49 · `redessineForme` 50 · `dessinePoignees` 51 · `brancheAimants` 56
`ecritMetres` 63 · `coteCadre` 67 · `montreCote` 79 · `aimantsActifs` 107 · `axesDe` 111
`pointsAimants` 116 · `oublieAimantsDuPlan` 136 · `aimantsDuPlan` 138 · `pasAimant` 171
`cale` 179 · `sousLeGeste` 184 · `cranGrille` 195 · `oublieAimants` 212
`aimantsDessines` 214 · `coinsGeste` 240 · `montreAimants` 262 · `meilleurSommet` 327
`croixAimant` 341 · `correction` 365 · `aimante` 406 · `retientTaille` 420
`reprendTaille` 434 · `dupliqueForme` 455 · `pousseForme` 480 · `ecritDimensions` 497
`appliqueDimension` 516

### `modules/apercus.mjs` — 327 l. → plan-admin

- l.1 · Les aperçus de la fenêtre des réglages — l'exploitant seul

Fonctions :

`texteCorps` 85 · `clesPortees` 110 · `standApercu` 130 · `lignesApercu` 154
`contenuApercu` 184 · `apercuFiche` 221 · `apercuListe` 299 · `apercuDuo` 321

### `modules/apparence.mjs` — 191 l. → plan, plan-admin

- l.1 · L'apparence des calques, et les commandes posées sur le plan

Fonctions :

`brancheApparence` 34 · `styleFond` 40 · `sousCalques` 61 · `styleDataGroupe` 68
`appliqueCouleursData` 77 · `styleData` 109 · `appliqueApparence` 115
`appliqueCommandes` 180

### `modules/appel-fonction.mjs` — 121 l. → console

- l.1 · L'appel des fonctions du projet, depuis la console

Fonctions :

`refus` 27 · `fonction` 38 · `fluxFonction` 60

### `modules/application.mjs` — 37 l. → plan, plan-admin

- l.1 · L'application installée — ce que le plan public en sait

Fonctions :

`adresseIconeApp` 26 · `appDuSalon` 34 · `iconeDeLApplication` 37

### `modules/avancement.mjs` — 416 l. → console

- l.1 · L'avancement d'une synchronisation — la fenêtre, et son secours

Fonctions :

`fenetreAvancement` 44 · `suitAuServeur` 376

### `modules/bande-admin.mjs` — 104 l. → plan-admin

- l.1 · 10. Mode administration — son ouverture, et la bande de l'outil

Fonctions :

`activeAdmin` 29

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `modules/bandes.mjs` — 66 l. → plan, plan-admin

- l.1 · Les bandes qui défilent — fondu du bord, flèche qui avance

Fonctions :

`BANDES` 27 · `majFondus` 35 · `brancheBandes` 49

### `modules/batiments.mjs` — 587 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 63 · `bibliothequeDispo` 64 · `refBatiment` 81 · `refForme` 85
`marqueBatiment` 88 · `batimentsPoses` 91 · `estBatiment` 98 · `hallsPoses` 101
`lieuDuCalque` 107 · `poseCalage` 113 · `ouvreBibliotheque` 122 · `vueDuLieu` 218
`lanceCalage` 258 · `effaceLeTempsDuCalage` 286 · `cadreCalage` 305 · `finCalage` 318
`pivoteCalage` 329 · `degresCalage` 345 · `dessineCalage` 350 · `calagePointerDown` 373
`calagePointerMove` 386 · `calagePointerUp` 402 · `reposeBatiment` 415
`ajouteBatiments` 431 · `brancheBatiments` 483 · `boutonRecale` 525 · `pictoRecale` 534
`calageRelu` 551 · `rouvreCalage` 577

### `modules/borne.mjs` — 429 l. → plan, plan-admin

- l.1 · La borne interactive — un plan qui sait où il est

Fonctions :

`visee` 59 · `vise` 60 · `bandeauVisee` 61 · `changePlan` 62 · `fermeItineraire` 63
`effaceItineraire` 64 · `ferme` 65 · `fermeParcours` 66 · `videLeParcours` 67
`pointBorne` 97 · `poseLieuBorne` 102 · `borneRetenue` 110 · `retientBorne` 116
`oublieBorne` 119 · `lieuBorne` 138 · `lieuNomme` 157 · `pointLibre` 162
`poseDepartImpose` 175 · `poseLaBorne` 186 · `remetLeDepart` 205 · `poseBorneIci` 219
`armeLaPose` 228 · `montreBandeauBorne` 244 · `ecritDepartBorne` 258 · `rayonBorne` 268
`dessineBorne` 273 · `rafraichitBorne` 289 · `rempliBorne` 294 · `relanceRepos` 323
`reposeLaBorne` 330 · `demarreBorne` 366 · `brancheBorne` 414

### `modules/calage-carte.mjs` — 825 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 70 · `centrePavillon` 85 · `basculeMasqueCarte` 90
`boutonMasqueCarte` 101 · `pictoMasque` 112 · `carreDeTerrain` 139 · `chercheBatiments` 155
`empriseDesObjets` 183 · `batimentsCandidats` 201 · `caleSurBatiment` 222
`retientLeHall` 248 · `manqueCalage` 270 · `enregistreCalage` 279 · `calageEnregistre` 296
`oublieCalageEnCours` 317 · `litCoordonnees` 329 · `rafraichitCarte` 343 · `armeCalage` 380
`pivotCalage` 391 · `glisseCarte` 395 · `cartePointerDown` 402 · `cartePointerMove` 416
`cartePointerUp` 435 · `ditCalage` 443 · `majCalage` 452 · `appliqueCalage` 474
`tourneCalage` 481 · `construitCalage` 487 · `ouvreCalage` 652 · `fermeCalage` 662
`brancheCalageCarte` 675 · `voletEnvirons` 701

### `modules/calques-dessin.mjs` — 213 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — ce que le poste en garde

Fonctions :

`majAttente` 26 · `brancheCalquesDessin` 30 · `enAttente` 68 · `litRange` 95
`ouvreDessins` 107 · `reprendCommun` 132 · `notePubliees` 158 · `rangeDessins` 176
`dejaPubliee` 181 · `marqueAttente` 187 · `mesCalques` 196 · `poseCalqueActif` 205
`poseOutil` 206 · `poseEbauche` 210 · `trouveCalque` 212 · `nouvelId` 213

### `modules/chaleur.mjs` — 670 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.454 · Remise à zéro des compteurs

Fonctions :

`nbChal` 55 · `tonChaleur` 74 · `niveauChaleur` 96 · `valeurChaleur` 99
`chargeChaleur` 112 · `coloreChaleur` 158 · `cartoucheChaleur` 193
`mesureCartoucheChaleur` 257 · `replieChaleur` 263 · `ecritEtatChaleur` 274
`dessineEchelleChaleur` 282 · `dessineTopChaleur` 302 · `phraseChaleur` 344
`rafraichitChaleur` 369 · `montreChaleur` 403 · `rangChaleur` 436 · `aplati` 476
`voletMesure` 481 · `evenementCourant` 507 · `ouvreRemiseAZero` 526 · `lanceRemiseAZero` 618
`brancheChaleur` 664

Éléments :

`#chalReduit` · `#chalPer` · `#chalEch` · `#chalEtat` · `#chalTop`

### `modules/charge-annoncee.mjs` — 230 l. → plan, plan-admin

- l.1 · La charge annoncée — ce que les autres journées ont déjà posé

Fonctions :

`seuilConcentration` 25 · `identifiantParcours` 27 · `parcours` 29 · `sejour` 31
`brancheCharge` 41 · `chargeSuivie` 81 · `etapesDuSejour` 87 · `annoncePlan` 115
`celluleUtile` 151 · `dilatationDuJour` 168 · `litLaCharge` 205 · `chargeCellule` 225

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

### `modules/configuration.mjs` — 158 l. → plan, plan-admin

- l.1 · La configuration du plan — ce que l'exploitant a réglé

Fonctions :

`secteurs` 24 · `brancheConfiguration` 31 · `salonRange` 46 · `cleConf` 48 · `ouvreConf` 52
`reglagesDuSalon` 73 · `publie` 98 · `confiePublication` 102 · `enregistreConf` 108
`conf` 115 · `jeton` 116 · `sousCle` 118 · `optionActive` 124 · `programmeOffert` 129
`suggestionOfferte` 130 · `langueOfferte` 150 · `appliqueLangue` 152 · `chercheSorte` 157

### `modules/console.mjs` — 47 l. → console

- l.1 · Point d'entrée de la console

### `modules/corps-fiche.mjs` — 271 l. → plan, plan-admin

- l.1 · Le corps de la fiche — ce qu'elle montre, dans quel ordre, sous quels

Fonctions :

`libelleCritere` 22 · `montre` 43 · `libelleCorps` 75 · `ordreCorps` 92 · `groupesFiche` 124
`montreIntitule` 137 · `valeurCorps` 157 · `champCorps` 170 · `groupeCorps` 182
`corpsRange` 195 · `pictoRS` 246 · `brancheCorpsFiche` 268

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

### `modules/demarrage.mjs` — 314 l. → plan, plan-admin

- l.1 · 12. Démarrage — l'appel du plan, sa version, la panne réseau

Fonctions :

`majAttente` 40 · `rattrapeRetard` 41 · `demarre` 47 · `annonce` 108 · `entetesApi` 131
`chargeFond` 155 · `panneDuChargement` 202 · `CLE_VERSION` 212 · `versionRetenue` 213
`retientVersion` 216 · `demandePlan` 240 · `charge` 264 · `brancheDemarrage` 304

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

### `modules/dessin.mjs` — 644 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — le tracé sur le plan

Fonctions :

`mentionOsm` 51 · `longueurFleche` 74 · `cheminFleche` 89 · `marqueFleche` 118
`rafraichitFleches` 129 · `traceForme` 144 · `rotationTexte` 163 · `dessineDessins` 168
`redessineForme` 209 · `peintCalque` 233 · `apercu` 240 · `apercuGuide` 252
`traceRepere` 275 · `nomSurLePlan` 409 · `etiquetteSociete` 420 · `seRattache` 448
`societeDeForme` 460 · `societesDuPlan` 472 · `traceImage` 506 · `traceStandDessine` 531
`texteStandDessine` 555 · `poseLibellesDessines` 574 · `decoupeStand` 595
`marqueStandsDessines` 610 · `rafraichitStandsDessines` 625 · `signale` 639

### `modules/distinctions.mjs` — 269 l. → plan, plan-admin

- l.1 · Les distinctions d'un exposant — nouveau venu, adhérent d'un syndicat

Fonctions :

`texteDist` 52 · `texteCourtDist` 57 · `porteDist` 61 · `standPorte` 65 · `calqueDists` 74
`traceDist` 105 · `oublieDists` 138 · `modesDuPlan` 142 · `releveDists` 144
`dessineDists` 173 · `marquesListe` 199 · `poseDistsFiche` 229 · `refaitDistsFiche` 269

### `modules/dom.mjs` — 10 l. → plan, plan-admin, console, rapport, motdepasse

- l.1 · Le document : ce que tout le code demande à la page

Fonctions :

`$` 10

### `modules/donnees.mjs` — 84 l. → plan, plan-admin

- l.1 · Les données du plan, leurs index, et ce que la vue regarde

Fonctions :

`poseDonnees` 50 · `P` 84

### `modules/duplication.mjs` — 43 l. → console

- l.1 · Dupliquer un salon — l'édition suivante, sans ce qui n'est qu'à celle-ci

Fonctions :

`brancheDuplication` 21 · `dupliquer` 25

### `modules/ecran-console.mjs` — 296 l. → console

- l.1 · L'écran de la console — la barre du haut, le choix du salon, le démarrage

Fonctions :

`charge` 37 · `selonAdresse` 64 · `majAdresse` 72 · `majBarre` 87 · `dessineChoix` 129
`majLiens` 146 · `videEcran` 187 · `dessine` 192 · `demarre` 207 · `brancheConsole` 225

### `modules/ecran.mjs` — 15 l. → plan, plan-admin

- l.1 · L'écran — étroit ou large, mouvement réduit ou non

Fonctions :

`ETROIT` 15

### `modules/edition-en-cours.mjs` — 36 l. → plan, plan-admin

- l.1 · L'édition en cours — le plan est-il sous un outil de l'exploitant ?

Fonctions :

`enEdition` 35

### `modules/edition.mjs` — 692 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`memorise` 49 · `enregistreDessins` 50 · `optionsModes` 51 · `societeSaisie` 52
`remplitListeSocietes` 53 · `brancheEdition` 58 · `curseurPoignee` 69 · `poignees` 74
`dessinePoignees` 83 · `cadreTexte` 118 · `poigneeRotation` 138 · `angleBorne` 148
`choisitForme` 150 · `majElement` 161 · `candidatsLiaison` 282 · `ecritDesDeuxCotes` 304
`changeLien` 316 · `changeDureeLien` 332 · `majLiens` 349 · `appliqueSociete` 401
`appliqueTexte` 417 · `appliqueRotation` 429 · `appliqueRayon` 443 · `appliqueTrait` 456
`appliqueTransport` 484 · `appliquePicto` 507 · `supprimeForme` 533
`editionPointerDown` 543 · `editionPointerMove` 603 · `tourneTexte` 666
`editionPointerUp` 682

### `modules/emplacements.mjs` — 282 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`cleGeo` 50 · `poseSorteGeo` 59 · `geometrieSource` 72 · `reposeSource` 81
`poseGeometrie` 90 · `retoucheGeo` 104 · `elargitEmprise` 117 · `appliqueGeometries` 138
`cleAjout` 179 · `anneauxValides` 190 · `rechAjout` 195 · `objetAjoute` 204 · `poseLien` 223
`appliqueAjouts` 250

### `modules/enregistrement.mjs` — 646 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.517 · La sauvegarde emportée

Fonctions :

`autoDispo` 102 · `enRetard` 105 · `etatCourant` 118 · `majAttente` 129
`compteRescapes` 143 · `ditAlerte` 156 · `ditEtat` 200 · `programmeEnvoi` 207
`programmePublication` 221 · `rattrapeRetard` 234 · `envoie` 239 · `presse` 252
`brancheEnregistrement` 262 · `identifiants` 286 · `reglagesSeuls` 301
`noteReglagesCharges` 312 · `oublieCache` 326 · `pousseConfiguration` 345
`sauvegardeCourante` 537 · `telechargeSauvegarde` 559 · `appliqueSauvegarde` 582
`litSauvegarde` 616 · `brancheSauvegarde` 638

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

### `modules/evenements.mjs` — 70 l. → console

- l.1 · Les salons de la console, celui qu'on regarde, et leurs pavillons

Fonctions :

`poseEvenements` 42 · `slugifie` 53 · `courant` 57 · `chargePlans` 59 · `majEvenement` 64

### `modules/export.mjs` — 232 l. → console, rapport

- l.2 · Export par exposant — une ligne par stand, une colonne par provenance

Fonctions :

`nb` 34 · `colonnesExport` 118 · `libellePeriode` 150 · `nomFichierExport` 156
`nomFeuilleExport` 166 · `exporteExposants` 182 · `brancheExport` 230

### `modules/fenetre-console.mjs` — 144 l. → console, rapport

- l.1 · La fenêtre de la console et du rapport

Fonctions :

`verseModale` 31 · `ouvreModale` 43 · `verrouilleModale` 67 · `fermeModale` 69
`poseFenetre` 77 · `gardeLaPlace` 99 · `demande` 110 · `confirme` 138

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

### `modules/fiche-zone.mjs` — 873 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.60 · La fiche d'une zone organisateur
- l.779 · Masquer une zone organisateur

Fonctions :

`majPaletteGeo` 48 · `brancheFicheZone` 56 · `champZone` 86 · `champsZone` 111
`champSalles` 203 · `nomDeZone` 255 · `cadreLogo` 281 · `champLogo` 353 · `editeurRiche` 391
`memeFicheZone` 548 · `suitFicheZone` 555 · `verseFicheZone` 563 · `ficheZone` 589
`enregistreZone` 614 · `enregistreZoneAjoutee` 727 · `basculeAffichageZone` 790
`marqueZonesMasquees` 818 · `ecritColonnesEvenement` 838 · `ecritColonneEvenement` 872

### `modules/fiche.mjs` — 1168 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.62 · 7. Sélection et fiche

Fonctions :

`decoupeStand` 53 · `montePlan` 54 · `marqueStandsDessines` 55 · `poseDistsFiche` 56
`fermeParcours` 57 · `brancheParcours` 58 · `baisseTiroir` 60 · `anime` 81 · `noeud` 105
`canalPlan` 115 · `rangSociete` 123 · `select` 132 · `centre` 157 · `brancheActesFiche` 168
`centreEtBaisseLaFiche` 184 · `centrePoint` 202 · `programme` 231 · `produits` 280
`ficheProduit` 308 · `ficheConf` 378 · `adresseVignette` 535 · `poseAppuiTactile` 552
`ecarteClicFantome` 555 · `nomSociete` 564 · `societes` 577 · `choisitExposant` 588
`poseMarque` 626 · `montreMarque` 686 · `poseCode` 709 · `rangeMarque` 750 · `ouvre` 806
`ferme` 1120 · `onglet` 1138 · `brancheFiche` 1155

Éléments :

`#dGo` · `#dItin`

### `modules/forme-choisie.mjs` — 40 l. → plan, plan-admin

- l.1 · La forme choisie dans l'éditeur, et ce que le plan public en partage

Fonctions :

`poseFormeSel` 24 · `formeParId` 28 · `boite` 36

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

### `modules/habillage.mjs` — 252 l. → plan, plan-admin

- l.1 · L'habillage du plan — couleur principale, fond, distinctions, barre du

Fonctions :

`brancheHabillage` 34 · `appliqueAccent` 69 · `appliqueFond` 103 · `modeDist` 150
`couleurDist` 162 · `appliqueDists` 184 · `modeBarre` 214 · `appliqueBarre` 216
`appliqueModele` 239

### `modules/horaires.mjs` — 89 l. → plan, plan-admin

- l.1 · La journée du salon — ses dates, ses heures, le temps passé sur un stand

Fonctions :

`minutesVisite` 28 · `lueHeure` 55 · `lueDate` 59 · `datesSalon` 66 · `horairesSalon` 80

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

### `modules/index-salon.mjs` — 485 l. → plan, plan-admin

- l.1 · 1. L'index du salon — la recherche porte sur tous les pavillons

Fonctions :

`compteRescapes` 41 · `noteReglagesCharges` 42 · `texteProduits` 49 · `indexe` 53
`chronoConf` 295 · `confsDuPlan` 300 · `indexeConferences` 318 · `rangeConferences` 396
`poseFavicon` 443 · `poseLogoSalon` 469 · `brancheIndex` 483

### `modules/installation.mjs` — 902 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`reglageInstallation` 120 · `invitationVoulue` 121 · `auDoigt` 151 · `nommeApplication` 187
`reponsesInstallation` 205 · `retientInstallation` 210 · `jourInstallation` 219
`invitationEcartee` 222 · `refuseInstallation` 228 · `faconInstallation` 256
`appliInstallee` 279 · `verifieApplication` 301 · `connaitLApplication` 311
`adresseApplication` 324 · `lanceApplication` 344 · `faconRappel` 377 · `rappelEcarte` 385
`refuseRappel` 391 · `relanceInvitation` 409 · `gesteInstallation` 414 · `doigtPose` 418
`doigtLeve` 419 · `vueInstallation` 422 · `accueilleInvitation` 431
`invitationRetenue` 457 · `suitLesGestes` 478 · `finInvitation` 486 · `rouvreInvitation` 508
`essaieInvitation` 528 · `brancheInstallation` 571 · `teteInvitation` 665
`poseGardeInstallation` 698 · `remplitInvitation` 721 · `ouvreInvitation` 751
`ouvreRappel` 830 · `ouvreRetrouve` 892

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

### `modules/journee.mjs` — 1258 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`basculeParcours` 38 · `rangParcours` 39 · `rafraichitParcours` 40 · `trace` 42
`joursSalon` 107 · `joursAVenir` 136 · `joursDefaut` 154 · `confsParJour` 164
`departsProposes` 189 · `rangJournee` 211 · `lienJournee` 223 · `boutonJour` 246
`arretJournee` 259 · `remplitOnglets` 306 · `jourDuStand` 335 · `ouvreChoixJour` 347
`figeLaVisite` 404 · `placeSurJour` 413 · `rendAuPlan` 421 · `retireDuSejour` 427
`remplitJournee` 437 · `ecritApercu` 650 · `appliqueVueParcours` 680 · `traceJournee` 722
`montreLeJour` 731 · `perimeJournee` 746 · `oublieSejour` 761 · `ouvreOrganisation` 776
`essaieSejour` 1156 · `lanceSejour` 1186 · `refaitSejour` 1225 · `brancheJournee` 1241

### `modules/libelle-place.mjs` — 73 l. → plan, plan-admin

- l.1 · Placer un libellé à la main — ce que le plan public en reçoit

Fonctions :

`cleLibelle` 36 · `poseModeLibelles` 45 · `poseLibelleChoisi` 50 · `empreinteLibelle` 62
`placementLibelle` 70

### `modules/libelles.mjs` — 377 l. → plan, plan-admin

- l.1 · Les libellés du plan — le nom de l'exposant prime sur le numéro
- l.118 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`dessineDessins` 41 · `decoupeStand` 42 · `poseLibellesDessines` 43 · `phareZone` 44
`rafraichitFleches` 45 · `societeDeForme` 46 · `nomSurLePlan` 47 · `brancheLibelles` 55
`coexComptes` 79 · `coexChoisit` 80 · `ligneCode` 96 · `libelles` 125 · `decaleLibelle` 212
`facteurLibelle` 213 · `libelleForce` 214 · `libelleZone` 217 · `libelleEmplacement` 236
`emplacementWebgl` 273 · `libellesWebgl` 321

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

### `modules/modeles.mjs` — 88 l. → plan, plan-admin

- l.1 · Les modèles d'habillage du plan

Fonctions :

`modeleRetenu` 46 · `habilleModale` 80

### `modules/mot-de-passe.mjs` — 208 l. → motdepasse

- l.1 · Poser un mot de passe

Fonctions :

`dit` 29 · `fragment` 35 · `garde` 42 · `lit` 46 · `demandeLien` 58 · `ouvreSaisie` 67
`brancheMotDePasse` 84

### `modules/motdepasse.mjs` — 14 l. → motdepasse

- l.1 · Point d'entrée de la page du mot de passe

### `modules/nappe.mjs` — 76 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`poseNappe` 40 · `couleurNappe` 42 · `rafraichitApercu` 48

### `modules/noms-zones.mjs` — 36 l. → plan, plan-admin

- l.1 · Le nom d'une zone dans la langue de la page

Fonctions :

`nomDeLaZone` 27 · `nomsAnglaisDesZones` 29

### `modules/notifications.mjs` — 89 l. → plan, plan-admin

- l.1 · Les notifications — ce que l'appareil sait recevoir, et l'abonnement

Fonctions :

`poussePossible` 19 · `iOSsansInstallation` 24 · `adresseDuRappel` 30 · `heureVue` 54
`empreinteDebut` 55 · `octetsDeCle` 59 · `abonnementCourant` 67 · `abonne` 76

### `modules/nuancier.mjs` — 72 l. → plan-admin

- l.1 · La rafale du sélecteur de couleur — l'exploitant seul

Fonctions :

`presseNuanciers` 35 · `brancheNuancier` 39 · `suitNuancier` 56

### `modules/options.mjs` — 132 l. → plan, plan-admin

- l.1 · Les options du plan — ce que le salon a pris

Fonctions :

`appliqueOptions` 115 · `confieApresOption` 129

### `modules/ordonnanceur.mjs` — 866 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 84 · `peineDeCharge` 105 · `ecartDesJours` 191 · `poidsDesJours` 221
`chargeDuJour` 244 · `rangeSejour` 253 · `trancheDe` 803 · `dilatationPour` 858

### `modules/ordre-calques.mjs` — 126 l. → plan-admin

- l.1 · L'ordre des calques — la fenêtre de l'exploitant

Fonctions :

`deplaceVers` 27 · `versExtremite` 39 · `remplitOrdre` 47 · `ouvreOrdre` 117

### `modules/ordre-trace.mjs` — 78 l. → plan, plan-admin

- l.1 · Pile des calques — l'ordre de tracé

Fonctions :

`clePile` 22 · `entrees` 24 · `pile` 38 · `groupe` 50 · `ordonneDom` 58 · `remplit` 65
`confiePanneau` 70 · `construitPanneau` 76

### `modules/outil-dessin.mjs` — 989 l. → plan-admin

- l.1 · 11. Calques de dessin — l'outil de l'exploitant

Fonctions :

`enregistreDessins` 58 · `instantane` 96 · `clotSalve` 107 · `memorise` 108 · `restaure` 119
`annule` 135 · `refais` 147 · `poseTrait` 152 · `toleranceTrace` 173 · `aimanteContour` 178
`rayonContour` 181 · `redresseTrace` 200 · `traceGuide` 234 · `fermeIci` 241
`ajouteForme` 246 · `poseChampImage` 263 · `remplitListeSocietes` 270 · `societeSaisie` 278
`calquePourImage` 294 · `lienImageSaisi` 322 · `formeImage` 334 · `poseImage` 343
`ditImagePosee` 366 · `importeImage` 374 · `dessinPointerDown` 403 · `dessinPointerMove` 488
`dessinPointerUp` 526 · `termineTrace` 567 · `aide` 579 · `outilOffert` 609
`choisitOutil` 623 · `enchaineStand` 654 · `optionsModes` 666 · `proposeCouleurLigne` 676
`montreTransport` 687 · `activeCalque` 696 · `cleVerrou` 754 · `verrouille` 755
`basculeVerrou` 757 · `pictoVerrou` 774 · `montreRoleIti` 808 · `creeCalque` 821
`demandeNom` 834 · `renommeCalque` 853 · `brancheOutilDessin` 869

### `modules/parcours-recu.mjs` — 128 l. → plan, plan-admin

- l.1 · Le parcours reçu

Fonctions :

`accueilleParcoursPartage` 48 · `adoptePartage` 126

### `modules/parcours.mjs` — 439 l. → plan, plan-admin

- l.1 · Le parcours de visite : la liste, son stockage, sa marque

Fonctions :

`_rafraichit` 24 · `_reprendRappels` 25 · `_synchroniseRappels` 26 · `poseParcours` 86
`brancheListeParcours` 105 · `cleParcours` 118 · `identifiantParcours` 155
`casierParcours` 163 · `dansParcours` 164 · `jourParcours` 167
`attenduDepuisTropLongtemps` 172 · `trieParcours` 183 · `chargeParcours` 193
`parcoursAEcrire` 227 · `enregistreParcours` 243 · `tientLeStockage` 272
`plurielParcours` 286 · `contenuParcours` 295 · `signetParcours` 306 · `boutonParcours` 312
`rafraichitMarque` 317 · `calqueMarques` 350 · `dessineMarques` 368 · `marqueParcours` 398
`instantConf` 416 · `cleTemps` 420 · `nomDeStand` 430 · `groupeParcours` 432

### `modules/partage.mjs` — 292 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`lienParcours` 49 · `ouvrePartageParcours` 65 · `boutonsPartage` 121 · `parcoursACopier` 208
`ouvreGardeParcours` 223 · `demandeGardeParcours` 253 · `poseGardeParcours` 266
`branchePartage` 290

### `modules/pile.mjs` — 549 l. → plan-admin

- l.1 · Le panneau des calques
- l.65 · Panneau : deux sections, chacune rangée par nom
- l.360 · Repères
- l.412 · Fond du plan

Fonctions :

`secteurs` 53 · `joli` 56 · `nature` 83 · `boutonAjout` 90 · `boutonVerrou` 110
`intertitre` 118 · `remplitPanneau` 128 · `sectionSelection` 376 · `sectionFond` 432
`ligneCouleur` 490 · `rangSecteur` 510 · `rangSous` 523 · `defautCouleur` 545

### `modules/placement-libelles.mjs` — 185 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`lacheLibelle` 48 · `posePlacement` 57 · `libelleAutomatique` 74
`modePlacementLibelles` 83 · `majPaletteLibelle` 102 · `choisitLibelle` 119
`pousseLibelle` 126 · `libellePointerDown` 134 · `libellePointerMove` 150
`libellePointerUp` 159 · `branchePlacementLibelles` 174

### `modules/plan-admin.mjs` — 111 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

### `modules/plan.mjs` — 292 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

### `modules/points-interet.mjs` — 403 l. → plan, plan-admin

- l.1 · Les points d'intérêt — le cartouche, la recherche, la fiche d'un repère

Fonctions :

`oublieReperes` 54 · `reperesCherchables` 56 · `vaAuRepere` 100 · `clePoi` 143
`cartouchePoi` 145 · `ouvrePoi` 264 · `mesureCartouche` 337 · `pharePoi` 353
`phareRepere` 357 · `phareZone` 359 · `eclairePoi` 365 · `oublieChoixPoi` 398

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `modules/polices-plan.mjs` — 317 l. → plan, plan-admin

- l.1 · La police des noms sur le plan — celle du modèle, ou une autre de la liste

Fonctions :

`branchePolices` 32 · `policeChoisie` 198 · `policeDuModele` 203 · `feuillePolice` 213
`chargePolice` 235 · `policePrete` 255 · `policeDesNoms` 273 · `posePoliceLibelles` 302

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

### `modules/rappels.mjs` — 548 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`tuto` 72 · `brancheRappels` 80 · `reglageRappel` 99 · `rappelsVoulus` 100
`minutesRappel` 101 · `cleRappels` 115 · `chargeRappels` 118 · `retientRappels` 122
`rappelsOfferts` 133 · `instantAbsolu` 163 · `confsARappeler` 171 · `rappelsDuParcours` 188
`synchroniseRappels` 226 · `eteintRappels` 249 · `allumeRappels` 264 · `aideRappel` 281
`poseRappels` 297 · `cleInviteRappel` 418 · `inviteRappelFaite` 421
`retientInviteRappel` 426 · `fenetreRappel` 461 · `proposeRappels` 494
`reprendRappels` 537

### `modules/rapport-utilisation.mjs` — 466 l. → rapport

- l.1 · Rapport d'utilisation

Fonctions :

`courant` 69 · `chargeEvenements` 74 · `joursPeriode` 92 · `chargeRapport` 94
`chiffre` 105 · `barres` 124 · `portes` 164 · `jours` 215 · `dessineRapport` 236
`dessineBarre` 389 · `rafraichit` 412 · `videEcran` 431 · `demarre` 437
`brancheRapport` 456

Éléments :

`#lienPublic`

### `modules/rapport.mjs` — 35 l. → rapport

- l.1 · Point d'entrée du rapport

### `modules/recherche.mjs` — 1170 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`ferme` 65 · `ficheConf` 68 · `adresseVignette` 69 · `montreTiroir` 70 · `mesureTiroir` 71
`hisseTiroir` 72 · `poseToutAuParcours` 73 · `dessineDists` 74 · `libelles` 75
`marquesListe` 76 · `porteDist` 77 · `standPorte` 78 · `reperesCherchables` 79
`vaAuRepere` 80 · `appliqueSecteurs` 90 · `filtreTheme` 107 · `themeFiltrable` 187
`ordreCriteres` 203 · `clesCriteres` 226 · `libelleCritere` 233 · `valeursCritere` 252
`texteCriteres` 265 · `texteAnglaisPerso` 281 · `indexeCriteres` 295 · `refaitCriteres` 329
`dansCriteres` 336 · `critereActif` 344 · `basculeCritere` 346 · `videCriteres` 355
`majVideQ` 364 · `videRecherche` 377 · `nCriteres` 392 · `majCriteres` 407
`remplitCriteres` 474 · `basculeCriteres` 613 · `ouvreCriteres` 618 · `fermeCriteres` 634
`filtre` 651 · `reposeRetrait` 671 · `critParSociete` 675 · `cherchable` 685 · `visible` 692
`releveHotes` 713 · `visibleSurPlan` 721 · `visibleSociete` 732 · `marqueRetrait` 748
`appliqueFiltre` 766 · `oublieRetrait` 782 · `reprendRecherche` 791 · `rangSorte` 804
`codeCase` 826 · `caseNumero` 843 · `sousLigne` 863 · `liste` 877 · `marqueChoisie` 1005
`prechargeMarque` 1031 · `prechargeLesVignettes` 1088 · `chargeUnLot` 1134
`brancheRecherche` 1161

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

### `modules/reglage-sponsor.mjs` — 224 l. → plan-admin

- l.1 · Le générique du démarrage, réglé par l'exploitant

Fonctions :

`brancheReglageSponsor` 27 · `blocSponsor` 67

### `modules/reglage-suggestion.mjs` — 427 l. → plan-admin

- l.1 · La suggestion — le volet de l'exploitant

Fonctions :

`glisseFenetre` 31 · `indexSugg` 48 · `valeursSugg` 73 · `relevePalmares` 91
`etiquetteSugg` 111 · `voletSuggestion` 121 · `brancheReglageSuggestion` 427

### `modules/reglages.mjs` — 539 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`glisseFenetre` 93 · `ouvreReglages` 105 · `voletZones` 233 · `champsFicheZone` 335
`ficheZoneEnPlace` 405 · `voletPlan` 423 · `voletCoexposants` 471

### `modules/rendu.mjs` — 166 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`brancheRendu` 51 · `monteHabillage` 58 · `baliseZone` 87 · `baliseStand` 97
`montePlan` 104 · `onglets` 136 · `changePlan` 158

### `modules/reperes.mjs` — 421 l. → plan, plan-admin

- l.1 · Les repères et les transports en commun — ce qu'ils sont

Fonctions :

`pictoDe` 130 · `nomTypeRepereFr` 186 · `nomTypeRepere` 188 · `typeZone` 218
`pictoForme` 225 · `estPorte` 245 · `ouvreEntrant` 246 · `ouvreSortant` 247 · `modeDit` 287
`lettreMode` 289 · `estTransport` 293 · `modeTransport` 296 · `glypheRepere` 308
`cleLigne` 345 · `ligneAffichee` 356 · `couleurLigne` 364 · `couleurRepere` 370
`encreRepere` 376 · `nomLigneFr` 390 · `libelleDoffice` 398 · `couleurEcrite` 405
`pastillePoi` 419

### `modules/reprise-emplacements.mjs` — 762 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`pictoVerrou` 67 · `activeCalque` 68 · `remplitListeSocietes` 69 · `societeSaisie` 70
`fermeIci` 71 · `lacheGeo` 82 · `cleVerrouGeo` 102 · `geoVerrouille` 103
`basculeVerrouGeo` 105 · `boutonVerrouGeo` 120 · `modeGeometrie` 131 · `objetGeoSous` 158
`groupeGeo` 168 · `choisitGeo` 176 · `cadreGeo` 191 · `prisesGeo` 211 · `curseurGeo` 223
`dessinePoigneesGeo` 226 · `ecritDimensionsGeo` 254 · `nomSorteGeo` 266
`majPaletteGeo` 268 · `finGesteGeo` 307 · `enregistreGeo` 325 · `geometrieOrigine` 339
`retraceGeo` 354 · `pousseGeometrie` 365 · `appliqueDimensionGeo` 382
`enregistreAjout` 397 · `ajouteEmplacement` 412 · `renommeAjout` 440 · `lieAjout` 472
`ecritInfosAjout` 501 · `supprimeAjout` 528 · `choisitOutilGeo` 557 · `aideAjout` 564
`fermeAjout` 574 · `ajoutPointerDown` 583 · `ajoutPointerMove` 599 · `ajoutPointerUp` 621
`geometriePointerDown` 641 · `accrocheGeo` 672 · `geometriePointerMove` 674
`geometriePointerUp` 725 · `brancheRepriseEmplacements` 743

### `modules/salon.mjs` — 54 l. → plan, plan-admin

- l.1 · Le salon et la page : ce que l'adresse et la construction disent

Fonctions :

`cheminDuSalon` 33 · `cheminPartageable` 44

### `modules/secteurs.mjs` — 150 l. → plan, plan-admin

- l.1 · Les secteurs du salon, et la teinte de chacun sur le plan

Fonctions :

`coloreChaleur` 21 · `brancheSecteurs` 28 · `indexeSecteurs` 42 · `secteursMontres` 55
`couleurConf` 59 · `couleurSecteur` 68 · `pastilleSecteur` 82 · `coloreSecteurs` 95
`peintSecteur` 140

### `modules/sejour.mjs` — 579 l. → plan, plan-admin

- l.1 · La préparation du séjour — répartir les stands, puis dérouler les jours

Fonctions :

`brancheSejour` 35 · `minutesVisite` 37 · `horairesSalon` 38 · `seuilConcentration` 39
`seuilImpose` 40 · `oublieMatrice` 87 · `finInstant` 92 · `pointConf` 100
`matriceJournee` 119 · `derouleJournee` 190 · `prepareSejour` 334 · `calculeSejour` 536
`apercuRepartition` 570

### `modules/session.mjs` — 147 l. → plan, plan-admin, console, rapport, motdepasse

- l.1 · La session de l'exploitant, et l'appel à la base

Fonctions :

`accesBase` 15 · `contenuJeton` 42 · `resteJeton` 52 · `echangeSession` 68 · `base` 92
`initialesDe` 142

### `modules/seuil.mjs` — 179 l. → plan, plan-admin

- l.1 · Le parcours intelligent — le seuil de concentration

Fonctions :

`seuilGere` 74 · `seuilImpose` 75 · `seuilParSurface` 76 · `regleSeuil` 81
`aireDuStand` 99 · `seuilConcentration` 135 · `phraseSeuil` 158

### `modules/socle-console.mjs` — 382 l. → console, rapport

- l.1 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`poseSession` 41 · `entetes` 64 · `renouvelle` 73 · `appel` 92 · `rest` 107
`ecranConfig` 126 · `ecranConnexion` 155 · `deconnecte` 220 · `signale` 235 · `bloc` 259
`grille` 277 · `idCompte` 294 · `themeSombre` 303 · `brancheSocle` 319

### `modules/sponsor.mjs` — 400 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 114 · `secondesSponsor` 117 · `modeSponsor` 130 · `sponsorRetenu` 149
`cleSponsor` 180 · `sponsorEnCache` 183 · `retientSponsor` 198 · `ouvreSponsor` 223
`suitSponsor` 316 · `resteSponsor` 341 · `fermeSponsor` 347 · `accueilleSponsor` 363
`brancheSponsor` 395

### `modules/suggestion.mjs` — 328 l. → plan, plan-admin

- l.1 · La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`remplitParcours` 46 · `brancheParcours` 47 · `reglageSugg` 76 · `seuilSugg` 78
`presentationsSugg` 102 · `presenteSugg` 108 · `critereSugg` 113 · `suggestionCourante` 130
`exposantPropose` 166 · `nomValeurSugg` 184 · `phraseSuggestion` 205 · `carteSuggestion` 233
`poseSuggestion` 282 · `fenetreSuggestion` 296 · `brancheSuggestion` 328

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

### `modules/texte-plan.mjs` — 110 l. → plan, plan-admin

- l.1 · Le texte sur le plan — sa mesure, sa coupe en lignes, sa place
- l.17 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.101 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`mesureTexte` 25 · `largeur` 30 · `remesureTextes` 55 · `decoupe` 70 · `habille` 83
`lignesSvg` 94 · `ancre` 109 · `place` 110

### `modules/texte.mjs` — 25 l. → plan, plan-admin, console, rapport

- l.1 · Le texte : l'écrire dans la page, le découper, le ranger

Fonctions :

`esc` 6 · `separeValeurs` 17

### `modules/tiroir-itineraire.mjs` — 796 l. → plan, plan-admin

- l.1 · Itinéraire — le tiroir, la visée et le tracé

Fonctions :

`changePlan` 37 · `ferme` 38 · `fermeParcours` 39 · `calculeRoute` 57 · `poseTrace` 80
`marchesIci` 82 · `rayonBout` 87 · `arreteTracage` 120 · `peintItineraire` 126
`lanceTracage` 177 · `dessineItineraire` 202 · `rafraichitBouts` 224 · `cadreItineraire` 247
`champIti` 271 · `fermeSugg` 275 · `montreSugg` 282 · `choisitPoint` 316
`valideSaisie` 325 · `effaceItineraire` 337 · `relance` 365 · `montreResultat` 407
`poseVisee` 551 · `bandeauVisee` 553 · `armeVisee` 576 · `finVisee` 594
`viseItineraire` 610 · `visePoi` 616 · `visePoint` 622 · `ouvreItineraire` 651
`fermeItineraire` 679 · `versItineraire` 689 · `versItineraireDe` 692
`brancheTiroirItineraire` 722

### `modules/tiroir-parcours.mjs` — 437 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`basculeParcours` 47 · `verseAuParcours` 92 · `retenusPourParcours` 138
`ajouteToutAuParcours` 163 · `poseToutAuParcours` 186 · `brancheParcours` 210
`rafraichitParcours` 223 · `rangParcours` 253 · `remplitParcours` 273 · `ouvreParcours` 362
`fermeParcours` 374 · `videLeParcours` 385 · `brancheTiroirParcours` 415

### `modules/ton-barre.mjs` — 76 l. → plan, plan-admin

- l.1 · La couleur de la barre du système

Fonctions :

`poseTonDeLaBarre` 41 · `brancheTonDeLaBarre` 74

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

### `modules/tutoriel.mjs` — 988 l. → plan, plan-admin

- l.1 · La visite guidée — le tour du plan, geste par geste

Fonctions :

`route` 70 · `attente` 71 · `iti` 72 · `visee` 73 · `eteintVisee` 74 · `journee` 76
`vueJournee` 77 · `sejour` 78 · `iciActif` 80 · `dessinEnCours` 83 · `reglageTuto` 111
`tutoPropose` 120 · `cleTuto` 124 · `tutoOuvert` 126 · `tutoModale` 127
`tutoFicheOuverte` 133 · `tutoFiche` 136 · `tutoParcours` 138 · `tutoItineraire` 142
`tutoJournee` 146 · `zoneDuTuto` 154 · `insecable` 171 · `phraseTrajetTuto` 177
`chapitresTuto` 437 · `proposeTutoriel` 457 · `lanceTutoriel` 515 · `quitteTutoriel` 602
`chapitreTuto` 613 · `battementTuto` 622 · `finTuto` 640 · `afficheTuto` 657 · `pxTuto` 712
`boiteTuto` 725 · `repereTuto` 740 · `rameneTuto` 773 · `placeTuto` 811 · `voileTuto` 905
`rafaleTuto` 922 · `marqueZoneTuto` 942 · `marqueLibelleTuto` 977

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `modules/vivant.mjs` — 36 l. → plan, plan-admin, console, rapport

- l.1 · Un état de module, lu par le code soudé tel qu'il est à l'instant

Fonctions :

`vivants` 25

### `modules/volets.mjs` — 1218 l. → plan-admin

- l.1 · Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —

Fonctions :

`secteurs` 55 · `voletAdmin` 57 · `blocOptions` 222 · `blocLangues` 269 · `blocBarre` 343
`blocHoraires` 401 · `voletParcours` 543 · `sallesSituees` 678 · `voletPmr` 694
`nomDuTon` 785 · `svgVignette` 794 · `barreVignette` 796 · `vignetteDistPlan` 800
`vignetteDistListe` 813 · `vignetteDistFiche` 827 · `salonDitSes` 847 · `coinPris` 854
`voletDist` 877 · `voletApparence` 1042

### `modules/vue.mjs` — 573 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.60 · 6. Vue

Fonctions :

`vue` 44 · `changeVue` 46 · `enEdition` 47 · `libelles` 48 · `poseEmprise` 58
`cadrePlan` 77 · `oublieCadre` 78 · `figeTextes` 92 · `rendTextes` 100 · `cadrage` 139
`peintLibelles` 144 · `repeintLibelles` 152 · `detacheLibelles` 156 · `rattacheLibelles` 168
`etireLibelles` 186 · `appliqueVue` 194 · `libellesDeLaVue` 260 · `rafraichitVue` 268
`poseVue` 282 · `mesureBarre` 311 · `masqueHaut` 339 · `masque` 346 · `masqueDroite` 383
`fit` 394 · `stoppeZoom` 432 · `glisseVersVise` 438 · `glisseVers` 481 · `rectVisee` 503
`zoom` 523 · `echelle` 537 · `versPlan` 549 · `brancheVue` 562

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
