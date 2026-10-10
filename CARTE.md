<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 31 l.

- l.1 · 9. Apparence des calques — le branchement

### `_admin2.html` — 20 l.

- l.1 · 12. Démarrage — le branchement

### `_auth-plan.html` — 14 l.

- l.2 · Accès à l'administration du plan — le branchement

### `_batiments.html` — 20 l.

- l.2 · 11 quinquies. Bâtiments de la bibliothèque — le branchement

### `_borne.html` — 11 l.

- l.1 · 11 quinquies. La borne interactive — le branchement

### `_branche-mesure.html` — 10 l.

- l.1 · 13. Mesure d'utilisation — le branchement

### `_chaleur.html` — 14 l.

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

### `_console-js.html` — 17 l.

- l.2 · La console multi-événements — le branchement, et le démarrage

### `_console.css` — 725 l. → console.css

- l.666 · Page de rapport

### `_dessin.html` — 31 l.

- l.2 · 11. Calques de dessin — le branchement

### `_entete.html` — 6 l.

### `_environs.html` — 21 l.

- l.1 · 16. Les environs — le branchement

### `_export.html` — 12 l.

- l.1 · Export par exposant — le branchement

### `_fiche.html` — 21 l.

- l.3 · 7. Sélection et fiche

### `_geometrie.html` — 23 l.

- l.1 · 11 octies. Reprendre à la main la géométrie d'un emplacement — le

### `_gestes.html` — 33 l.

- l.4 · 8. Interactions du plan — le branchement

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

### `_ici.html` — 14 l.

- l.1 · 11 septies. « Vous êtes ici » — le branchement

### `_index.html` — 27 l. → index.html

- l.18 · L'aiguillage de la racine — le branchement

Éléments :

`#secours`

### `_installation.html` — 15 l.

- l.1 · 16. L'invitation à installer le plan

### `_itineraire.html` — 22 l.

- l.1 · 11 ter. Itinéraire — le tiroir, la visée et le tracé

### `_journee.html` — 14 l.

- l.1 · 11 ter. Organiser sa visite — le branchement

### `_js.html` — 43 l.

- l.27 · 1. Index global — le branchement

Éléments :

`#data`

### `_langue.js` — 810 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-smcl.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_modales.html` — 16 l.

- l.2 · Fenêtres modales — le branchement

### `_mode-admin.html` — 30 l.

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

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 14 l.

- l.2 · Rapport d'utilisation — le branchement

### `_recherche.html` — 17 l.

- l.3 · 5. Recherche et secteurs — le branchement

### `_rendu.html` — 26 l.

- l.3 · 2 à 4. Le plan à l'écran — le branchement

### `_sponsor.html` — 13 l.

- l.1 · 18. Le sponsor — un logo le temps du chargement

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

### `_vue.html` — 19 l.

- l.3 · 6. Vue — le branchement

### `_webgl.html` — 15 l.

- l.1 · 13 bis. Le plan peint par la carte graphique — le branchement

### `modules/acces-admin.mjs` — 253 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`activeAdmin` 31 · `confieALAcces` 34 · `litLocal` 42 · `configuration` 47
`normaliseUrlA` 51 · `sessionValide` 67 · `ecranAcces` 85 · `contenuDuJeton` 176
`mailDuJeton` 177 · `litProfilA` 188 · `poseCompte` 203 · `brancheAcces` 227

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

### `modules/batiments.mjs` — 594 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`CLE_CALAGE` 63 · `bibliothequeDispo` 64 · `refBatiment` 81 · `refForme` 85
`marqueBatiment` 88 · `batimentsPoses` 91 · `estBatiment` 98 · `hallsPoses` 101
`lieuDuCalque` 107 · `poseCalage` 113 · `ouvreBibliotheque` 122 · `vueDuLieu` 218
`halleGlissee` 258 · `lanceCalage` 260 · `effaceLeTempsDuCalage` 288 · `cadreCalage` 307
`finCalage` 320 · `pivoteCalage` 331 · `degresCalage` 347 · `dessineCalage` 352
`calagePointerDown` 375 · `calagePointerMove` 388 · `calagePointerUp` 404
`reposeBatiment` 417 · `ajouteBatiments` 433 · `brancheBatiments` 485 · `boutonRecale` 527
`pictoRecale` 536 · `calageRelu` 553 · `rouvreCalage` 579

### `modules/borne.mjs` — 350 l. → plan, plan-admin

- l.1 · La borne interactive — un plan qui sait où il est

Fonctions :

`borneRetenue` 88 · `retientBorne` 94 · `oublieBorne` 97 · `lieuBorne` 116 · `lieuNomme` 135
`pointLibre` 140 · `poseDepartImpose` 153 · `poseLaBorne` 164 · `remetLeDepart` 183
`poseBorneIci` 197 · `armeLaPose` 206 · `montreBandeauBorne` 222 · `relanceRepos` 244
`reposeLaBorne` 251 · `demarreBorne` 287 · `brancheBorne` 330

### `modules/calage-carte.mjs` — 824 l. → plan-admin

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
`ouvreCalage` 649 · `fermeCalage` 659 · `brancheCalageCarte` 670 · `voletEnvirons` 695

### `modules/calques-dessin.mjs` — 212 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — ce que le poste en garde

Fonctions :

`majAttente` 27 · `confieAuxCalques` 31 · `enAttente` 67 · `litRange` 94
`ouvreDessins` 106 · `reprendCommun` 131 · `notePubliees` 157 · `rangeDessins` 175
`dejaPubliee` 180 · `marqueAttente` 186 · `mesCalques` 195 · `poseCalqueActif` 204
`poseOutil` 205 · `poseEbauche` 209 · `trouveCalque` 211 · `nouvelId` 212

### `modules/chaleur.mjs` — 684 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.464 · Remise à zéro des compteurs

Fonctions :

`ouvreReglages` 47 · `confieALaChaleur` 50 · `nbChal` 65 · `tonChaleur` 84
`niveauChaleur` 106 · `valeurChaleur` 109 · `chargeChaleur` 122 · `coloreChaleur` 168
`cartoucheChaleur` 203 · `mesureCartoucheChaleur` 267 · `replieChaleur` 273
`ecritEtatChaleur` 284 · `dessineEchelleChaleur` 292 · `dessineTopChaleur` 312
`phraseChaleur` 354 · `rafraichitChaleur` 379 · `montreChaleur` 413 · `rangChaleur` 446
`aplati` 486 · `voletMesure` 491 · `evenementCourant` 517 · `ouvreRemiseAZero` 536
`lanceRemiseAZero` 630 · `brancheChaleur` 674

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

### `modules/configuration.mjs` — 165 l. → plan, plan-admin

- l.1 · La configuration du plan — ce que l'exploitant a réglé

Fonctions :

`secteurs` 30 · `confieALaConfiguration` 38 · `salonRange` 53 · `cleConf` 55
`ouvreConf` 59 · `reglagesDuSalon` 80 · `publie` 105 · `confiePublication` 109
`enregistreConf` 115 · `conf` 122 · `jeton` 123 · `sousCle` 125 · `optionActive` 131
`programmeOffert` 136 · `suggestionOfferte` 137 · `langueOfferte` 157 · `appliqueLangue` 159
`chercheSorte` 164

### `modules/console.mjs` — 41 l. → console

- l.1 · Point d'entrée de la console

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

### `modules/demarrage.mjs` — 355 l. → plan, plan-admin

- l.1 · 12. Démarrage — l'appel du plan, sa version, la panne réseau

Fonctions :

`confieAuDemarrage` 52 · `majAttente` 53 · `rattrapeRetard` 54 · `recadreListePosee` 71
`demarre` 87 · `annonce` 149 · `entetesApi` 172 · `chargeFond` 196 · `panneDuChargement` 243
`CLE_VERSION` 253 · `versionRetenue` 254 · `retientVersion` 257 · `demandePlan` 281
`charge` 305 · `brancheDemarrage` 342

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

### `modules/distinctions.mjs` — 287 l. → plan, plan-admin

- l.1 · Les distinctions d'un exposant — nouveau venu, adhérent d'un syndicat

Fonctions :

`texteDist` 54 · `texteCourtDist` 59 · `porteDist` 63 · `standPorte` 67 · `calqueDists` 76
`traceDist` 107 · `oublieDists` 140 · `modesDuPlan` 144 · `releveDists` 146
`dessineDists` 175 · `marquesListe` 201 · `poseDistsFiche` 231 · `refaitDistsFiche` 271

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

### `modules/ecran-console.mjs` — 294 l. → console

- l.1 · L'écran de la console — la barre du haut, le choix du salon, le démarrage

Fonctions :

`charge` 37 · `selonAdresse` 64 · `majAdresse` 72 · `majBarre` 87 · `dessineChoix` 129
`majLiens` 146 · `videEcran` 187 · `dessine` 192 · `demarre` 207 · `brancheConsole` 225

### `modules/ecran.mjs` — 15 l. → plan, plan-admin

- l.1 · L'écran — étroit ou large, mouvement réduit ou non

Fonctions :

`ETROIT` 15

### `modules/edition-en-cours.mjs` — 42 l. → plan, plan-admin

- l.1 · L'édition en cours — le plan est-il sous un outil de l'exploitant ?

Fonctions :

`enEdition` 36

### `modules/edition.mjs` — 737 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`memorise` 62 · `enregistreDessins` 63 · `optionsModes` 64 · `societeSaisie` 65
`remplitListeSocietes` 66 · `confieAEdition` 70 · `curseurPoignee` 79 · `poignees` 84
`dessinePoignees` 93 · `cadreTexte` 128 · `poigneeRotation` 148 · `angleBorne` 158
`choisitForme` 160 · `replieOutils` 175 · `degageOutils` 190 · `majElement` 199
`candidatsLiaison` 320 · `ecritDesDeuxCotes` 342 · `changeLien` 354 · `changeDureeLien` 370
`majLiens` 387 · `appliqueSociete` 439 · `appliqueTexte` 455 · `appliqueRotation` 467
`appliqueRayon` 481 · `appliqueTrait` 494 · `appliqueTransport` 522 · `appliquePicto` 545
`supprimeForme` 571 · `editionPointerDown` 581 · `editionPointerMove` 641
`tourneTexte` 704 · `editionPointerUp` 720

### `modules/emplacements.mjs` — 282 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`cleGeo` 50 · `poseSorteGeo` 59 · `geometrieSource` 72 · `reposeSource` 81
`poseGeometrie` 90 · `retoucheGeo` 104 · `elargitEmprise` 117 · `appliqueGeometries` 138
`cleAjout` 179 · `anneauxValides` 190 · `rechAjout` 195 · `objetAjoute` 204 · `poseLien` 223
`appliqueAjouts` 250

### `modules/enregistrement.mjs` — 691 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.553 · La sauvegarde emportée

Fonctions :

`confieAEnregistrement` 67 · `gesteEnCours` 89 · `confieGesteEnCours` 93 · `autoDispo` 124
`enRetard` 127 · `etatCourant` 140 · `majAttente` 151 · `compteRescapes` 165
`ditAlerte` 178 · `ditEtat` 221 · `programmeEnvoi` 228 · `programmePublication` 242
`rattrapeRetard` 255 · `envoie` 261 · `apresGeste` 273 · `presse` 283
`brancheEnregistrement` 291 · `identifiants` 314 · `reglagesSeuls` 329
`noteReglagesCharges` 340 · `oublieCache` 354 · `pousseConfiguration` 373
`sauvegardeCourante` 573 · `telechargeSauvegarde` 595 · `appliqueSauvegarde` 618
`litSauvegarde` 652 · `brancheSauvegarde` 674

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

### `modules/fiche-zone.mjs` — 874 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.55 · La fiche d'une zone organisateur
- l.774 · Masquer une zone organisateur

Fonctions :

`majPaletteGeo` 48 · `confieALaFicheZone` 53 · `champZone` 81 · `champsZone` 106
`champSalles` 198 · `nomDeZone` 250 · `cadreLogo` 276 · `champLogo` 348 · `editeurRiche` 386
`memeFicheZone` 543 · `suitFicheZone` 550 · `verseFicheZone` 558 · `ficheZone` 584
`enregistreZone` 609 · `enregistreZoneAjoutee` 722 · `basculeAffichageZone` 785
`marqueZonesMasquees` 813 · `ecritColonnesEvenement` 833 · `ecritColonneEvenement` 867

### `modules/fiche.mjs` — 1200 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.84 · 7. Sélection et fiche

Fonctions :

`confieALaFiche` 76 · `decoupeStand` 77 · `montePlan` 78 · `marqueStandsDessines` 79
`poseDistsFiche` 80 · `fermeParcours` 81 · `brancheParcours` 82 · `anime` 103 · `noeud` 127
`canalPlan` 137 · `rangSociete` 145 · `select` 154 · `centre` 179 · `brancheActesFiche` 190
`centreEtBaisseLaFiche` 206 · `centrePoint` 224 · `programme` 253 · `produits` 302
`ficheProduit` 330 · `ficheConf` 400 · `adresseVignette` 557 · `poseAppuiTactile` 574
`ecarteClicFantome` 577 · `nomSociete` 586 · `societes` 599 · `choisitExposant` 610
`poseMarque` 648 · `montreMarque` 708 · `poseCode` 731 · `rangeMarque` 772 · `ouvre` 828
`ferme` 1144 · `onglet` 1162 · `brancheFiche` 1179

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

### `modules/gestes-admin.mjs` — 177 l. → plan-admin

- l.1 · Les gestes de l'exploitant sur le plan — leur rang dans la chaîne

Fonctions :

`appui` 41 · `suit` 55 · `leve` 64 · `annuleGeste` 75 · `clavier` 81 · `echap` 126
`apresEchap` 144 · `entree` 151 · `gesteEnCours` 162 · `brancheGestesAdmin` 168

### `modules/gestes.mjs` — 473 l. → plan, plan-admin

- l.1 · Les gestes sur le plan — glisser, pincer, la molette, l'appui qui ouvre
- l.70 · 8. Interactions du plan

Fonctions :

`poseGestesAdmin` 68 · `milieu` 94 · `commencePince` 100 · `suitPince` 114
`plieLesBandes` 167 · `saisitPlan` 181 · `cibleElargie` 218 · `planifieFiltre` 261
`brancheGestes` 275 · `brancheLangue` 456

### `modules/habillage.mjs` — 266 l. → plan, plan-admin

- l.1 · L'habillage du plan — couleur principale, fond, distinctions, barre du

Fonctions :

`confieALHabillage` 40 · `brancheHabillage` 50 · `appliqueAccent` 83 · `appliqueFond` 117
`modeDist` 164 · `couleurDist` 176 · `appliqueDists` 198 · `modeBarre` 228
`appliqueBarre` 230 · `appliqueModele` 253

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

### `modules/journee.mjs` — 1266 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`confieALaJournee` 47 · `basculeParcours` 48 · `rangParcours` 49 · `rafraichitParcours` 50
`trace` 52 · `joursSalon` 117 · `joursAVenir` 146 · `joursDefaut` 164 · `confsParJour` 174
`departsProposes` 199 · `rangJournee` 221 · `lienJournee` 233 · `boutonJour` 256
`arretJournee` 269 · `remplitOnglets` 316 · `jourDuStand` 345 · `ouvreChoixJour` 357
`figeLaVisite` 414 · `placeSurJour` 423 · `rendAuPlan` 431 · `retireDuSejour` 437
`remplitJournee` 447 · `ecritApercu` 660 · `appliqueVueParcours` 690 · `traceJournee` 732
`montreLeJour` 741 · `perimeJournee` 756 · `oublieSejour` 771 · `ouvreOrganisation` 786
`essaieSejour` 1166 · `lanceSejour` 1196 · `refaitSejour` 1235 · `brancheJournee` 1250

### `modules/libelle-place.mjs` — 73 l. → plan, plan-admin

- l.1 · Placer un libellé à la main — ce que le plan public en reçoit

Fonctions :

`cleLibelle` 36 · `poseModeLibelles` 45 · `poseLibelleChoisi` 50 · `empreinteLibelle` 62
`placementLibelle` 70

### `modules/libelles.mjs` — 417 l. → plan, plan-admin

- l.1 · Les libellés du plan — le nom de l'exposant prime sur le numéro
- l.143 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`dessineDessins` 58 · `decoupeStand` 59 · `poseLibellesDessines` 60 · `phareZone` 61
`rafraichitFleches` 62 · `societeDeForme` 63 · `nomSurLePlan` 64 · `confieAuxLibelles` 73
`brancheLibelles` 81 · `coexComptes` 104 · `coexChoisit` 105 · `ligneCode` 121
`libelles` 150 · `decaleLibelle` 237 · `facteurLibelle` 238 · `libelleForce` 239
`libelleZone` 242 · `libelleEmplacement` 261 · `emplacementWebgl` 298 · `libellesWebgl` 346

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

### `modules/nappe.mjs` — 81 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`poseNappe` 41 · `couleurNappe` 43 · `rafraichitApercu` 49

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

### `modules/options.mjs` — 138 l. → plan, plan-admin

- l.1 · Les options du plan — ce que le salon a pris

Fonctions :

`appliqueOptions` 116 · `confieApresOption` 130

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

### `modules/outil-dessin.mjs` — 1039 l. → plan-admin

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

### `modules/placement-libelles.mjs` — 189 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`confieAuPlacementLibelles` 46 · `libelleGlisse` 52 · `lacheLibelle` 55 · `posePlacement` 64
`libelleAutomatique` 81 · `modePlacementLibelles` 90 · `majPaletteLibelle` 109
`choisitLibelle` 126 · `pousseLibelle` 133 · `libellePointerDown` 141
`libellePointerMove` 157 · `libellePointerUp` 166 · `branchePlacementLibelles` 179

### `modules/plan-admin.mjs` — 50 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

### `modules/plan.mjs` — 96 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

### `modules/points-interet.mjs` — 416 l. → plan, plan-admin

- l.1 · Les points d'intérêt — le cartouche, la recherche, la fiche d'un repère

Fonctions :

`oublieReperes` 58 · `reperesCherchables` 60 · `vaAuRepere` 104 · `clePoi` 147
`cartouchePoi` 149 · `ouvrePoi` 268 · `mesureCartouche` 341 · `pharePoi` 357
`phareRepere` 361 · `phareZone` 363 · `eclairePoi` 369 · `oublieChoixPoi` 402

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

### `modules/rappels.mjs` — 547 l. → plan, plan-admin

- l.1 · Le rappel avant une conférence

Fonctions :

`confieAuxRappels` 78 · `tuto` 79 · `reglageRappel` 98 · `rappelsVoulus` 99
`minutesRappel` 100 · `cleRappels` 114 · `chargeRappels` 117 · `retientRappels` 121
`rappelsOfferts` 132 · `instantAbsolu` 162 · `confsARappeler` 170 · `rappelsDuParcours` 187
`synchroniseRappels` 225 · `eteintRappels` 248 · `allumeRappels` 263 · `aideRappel` 280
`poseRappels` 296 · `cleInviteRappel` 417 · `inviteRappelFaite` 420
`retientInviteRappel` 425 · `fenetreRappel` 460 · `proposeRappels` 493
`reprendRappels` 536

### `modules/rapport-utilisation.mjs` — 466 l. → rapport

- l.1 · Rapport d'utilisation

Fonctions :

`courant` 69 · `chargeEvenements` 74 · `joursPeriode` 92 · `chargeRapport` 94
`chiffre` 105 · `barres` 124 · `portes` 164 · `jours` 215 · `dessineRapport` 236
`dessineBarre` 389 · `rafraichit` 412 · `videEcran` 431 · `demarre` 437
`brancheRapport` 456

Éléments :

`#lienPublic`

### `modules/rapport.mjs` — 31 l. → rapport

- l.1 · Point d'entrée du rapport

### `modules/recherche.mjs` — 1196 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`confieALaRecherche` 77 · `ferme` 78 · `ficheConf` 81 · `adresseVignette` 82
`poseToutAuParcours` 83 · `dessineDists` 84 · `libelles` 85 · `marquesListe` 86
`porteDist` 87 · `standPorte` 88 · `reperesCherchables` 89 · `vaAuRepere` 90
`appliqueSecteurs` 100 · `filtreTheme` 117 · `themeFiltrable` 200 · `ordreCriteres` 216
`clesCriteres` 239 · `libelleCritere` 246 · `valeursCritere` 265 · `texteCriteres` 278
`texteAnglaisPerso` 294 · `indexeCriteres` 308 · `refaitCriteres` 342 · `dansCriteres` 349
`critereActif` 357 · `basculeCritere` 359 · `videCriteres` 368 · `majVideQ` 377
`videRecherche` 390 · `nCriteres` 405 · `majCriteres` 420 · `remplitCriteres` 487
`basculeCriteres` 626 · `ouvreCriteres` 631 · `fermeCriteres` 647 · `filtre` 664
`reposeRetrait` 684 · `critParSociete` 688 · `cherchable` 698 · `visible` 705
`releveHotes` 726 · `visibleSurPlan` 734 · `visibleSociete` 745 · `marqueRetrait` 761
`appliqueFiltre` 779 · `oublieRetrait` 795 · `reprendRecherche` 804 · `rangSorte` 817
`codeCase` 839 · `caseNumero` 856 · `sousLigne` 876 · `liste` 890 · `marqueChoisie` 1018
`prechargeMarque` 1044 · `prechargeLesVignettes` 1101 · `chargeUnLot` 1147
`brancheRecherche` 1173

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

### `modules/reglages.mjs` — 543 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`glisseFenetre` 95 · `ouvreReglages` 107 · `voletZones` 235 · `champsFicheZone` 337
`ficheZoneEnPlace` 407 · `voletPlan` 425 · `voletCoexposants` 464

### `modules/rendu.mjs` — 192 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`confieAuRendu` 64 · `monteHabillage` 69 · `baliseZone` 98 · `baliseStand` 108
`montePlan` 115 · `onglets` 147 · `changePlan` 169

### `modules/reperes.mjs` — 421 l. → plan, plan-admin

- l.1 · Les repères et les transports en commun — ce qu'ils sont

Fonctions :

`pictoDe` 130 · `nomTypeRepereFr` 186 · `nomTypeRepere` 188 · `typeZone` 218
`pictoForme` 225 · `estPorte` 245 · `ouvreEntrant` 246 · `ouvreSortant` 247 · `modeDit` 287
`lettreMode` 289 · `estTransport` 293 · `modeTransport` 296 · `glypheRepere` 308
`cleLigne` 345 · `ligneAffichee` 356 · `couleurLigne` 364 · `couleurRepere` 370
`encreRepere` 376 · `nomLigneFr` 390 · `libelleDoffice` 398 · `couleurEcrite` 405
`pastillePoi` 419

### `modules/reprise-emplacements.mjs` — 782 l. → plan-admin

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
`geometriePointerUp` 737 · `brancheRepriseEmplacements` 753

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

### `modules/socle-console.mjs` — 404 l. → console, rapport

- l.1 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`poseSession` 41 · `entetes` 64 · `renouvelle` 73 · `appel` 92 · `rest` 107
`ecranConfig` 126 · `ecranConnexion` 158 · `deconnecte` 224 · `signale` 239 · `bloc` 263
`grille` 281 · `idCompte` 298 · `themeSombre` 307 · `premierEcran` 325 · `brancheSocle` 340

### `modules/sponsor.mjs` — 400 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 114 · `secondesSponsor` 117 · `modeSponsor` 130 · `sponsorRetenu` 149
`cleSponsor` 180 · `sponsorEnCache` 183 · `retientSponsor` 198 · `ouvreSponsor` 223
`suitSponsor` 316 · `resteSponsor` 341 · `fermeSponsor` 347 · `accueilleSponsor` 363
`brancheSponsor` 395

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

### `modules/tiroir-parcours.mjs` — 469 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`basculeParcours` 51 · `verseAuParcours` 96 · `retenusPourParcours` 142
`ajouteToutAuParcours` 167 · `poseToutAuParcours` 190 · `brancheParcours` 214
`rafraichitParcours` 227 · `rangParcours` 257 · `remplitParcours` 277 · `ouvreParcours` 366
`fermeParcours` 378 · `videLeParcours` 389 · `brancheTiroirParcours` 419

### `modules/tiroirs.mjs` — 532 l. → plan, plan-admin

- l.1 · Les tiroirs des écrans étroits — la liste, et ceux que la hauteur mène
- l.39 · Ce que les tiroirs lisent d'un geste
- l.85 · Le tiroir de la liste — écrans étroits
- l.311 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`fermeCriteres` 27 · `confieAuxTiroirs` 35 · `traceurDeGeste` 63 · `cranVoisin` 82
`retraitBas` 108 · `mesureTiroir` 121 · `montreTiroir` 124 · `hisseTiroir` 128
`tiroirListe` 135 · `tiroirCrante` 338 · `brancheTiroirs` 518

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

### `modules/vivant.mjs` — 36 l. → console, rapport

- l.1 · Un état de module, lu par le code soudé tel qu'il est à l'instant

Fonctions :

`vivants` 25

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

### `modules/vue.mjs` — 603 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.87 · 6. Vue

Fonctions :

`confieALaVue` 65 · `vue` 71 · `changeVue` 73 · `enEdition` 74 · `libelles` 75
`poseEmprise` 85 · `cadrePlan` 104 · `oublieCadre` 105 · `figeTextes` 119 · `rendTextes` 127
`cadrage` 166 · `peintLibelles` 171 · `repeintLibelles` 179 · `detacheLibelles` 183
`rattacheLibelles` 195 · `etireLibelles` 213 · `appliqueVue` 221 · `libellesDeLaVue` 287
`rafraichitVue` 295 · `poseVue` 309 · `mesureBarre` 338 · `masqueHaut` 366 · `masque` 373
`masqueDroite` 410 · `fit` 421 · `stoppeZoom` 459 · `glisseVersVise` 465 · `glisseVers` 508
`rectVisee` 530 · `zoom` 550 · `echelle` 564 · `versPlan` 576 · `brancheVue` 587

### `modules/webgl.mjs` — 1361 l. → plan, plan-admin

- l.1 · 13 bis. Le plan peint par la carte graphique — WebGL2

Fonctions :

`confieAuWebgl` 66 · `chargeWebgl` 99 · `brancheWebgl` 124 · `monteWebgl` 131
`poseToileWebgl` 232 · `guetteContexteWebgl` 238 · `contextePerduWebgl` 248
`verifieContexteWebgl` 255 · `perdContexteWebgl` 264 · `remonteWebgl` 285 · `vueDeck` 302
`vueWebgl` 311 · `blocDe` 320 · `majEditionWebgl` 333 · `cleBloc` 345 · `planifieWebgl` 371
`toutRepeindreWebgl` 375 · `blocsDansLOrdre` 382 · `repeintWebgl` 387 · `assembleWebgl` 411
`constTexte` 445 · `jeuDeCaracteres` 641 · `sousPixelOffert` 695 · `couchesPetites` 700
`couchesTexte` 710 · `accVide` 745 · `convertitBloc` 746 · `accDe` 762 · `parcoursGl` 769
`formeGl` 805 · `texteGl` 841 · `imageGl` 864 · `partage` 896 · `designeGl` 902
`couchesDeBloc` 904 · `modelesLibellesHtml` 984 · `poseModelesLibelles` 994
`lisModelesLibelles` 1000 · `groupesNoms` 1033 · `couchesNoms` 1050
`couchesPastilles` 1061 · `couchesLibellesWebgl` 1076 · `couchesDessineesWebgl` 1083
`stage` 1104 · `brancheSurvolWebgl` 1108 · `poseSurvolWebgl` 1128 · `poseCurseurWebgl` 1137
`poseFocusWebgl` 1146 · `aplatsDe` 1153 · `coucheSurvol` 1156 · `coucheFocus` 1165
`couchesPhare` 1192 · `lueurDe` 1208 · `opacitePhare` 1246 · `echellePhare` 1247
`couchesPhareNoms` 1250 · `palierDefile` 1275 · `phaseComete` 1277 · `animeCouche` 1280
`majAnimationWebgl` 1297 · `animeWebgl` 1305 · `objetSous` 1328 · `cibleWebgl` 1335
`priseWebgl` 1342 · `libelleSousWebgl` 1347 · `rectEcranWebgl` 1352

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
