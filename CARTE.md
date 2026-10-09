<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 143 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 9. Apparence des calques — le branchement

Fonctions :

`appliqueOptions` 130

### `_admin2.html` — 25 l.

- l.1 · 12. Démarrage — le branchement

### `_aimants.html` — 23 l. → plan-admin.html

- l.3 · 11 quater. Dessiner juste — le branchement

### `_application.html` — 13 l.

- l.1 · 19. L'application installée — son icône et son nom

### `_auth-plan.html` — 14 l.

- l.2 · Accès à l'administration du plan — le branchement

### `_batiments.html` — 43 l.

- l.2 · 11 quinquies. Bâtiments de la bibliothèque — le branchement

Fonctions :

`mentionOsm` 38

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

### `_dessin.html` — 52 l.

- l.2 · 11. Calques de dessin — le branchement

### `_edition.html` — 40 l. → plan-admin.html

- l.1 · Édition des formes existantes

Fonctions :

`formeParId` 14 · `boite` 22

### `_entete.html` — 6 l.

### `_environs.html` — 26 l.

- l.1 · 16. Les environs — le branchement

### `_export.html` — 12 l.

- l.1 · Export par exposant — le branchement

### `_fiche.html` — 33 l.

- l.3 · 7. Sélection et fiche

### `_geometrie.html` — 31 l. → plan-admin.html

- l.1 · 11 octies. Reprendre à la main la géométrie d'un emplacement — le

### `_gestes.html` — 32 l.

- l.4 · 8. Interactions du plan — le branchement

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

### `_installation.html` — 40 l. → plan-admin.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`retourAuxReglages` 32

### `_itineraire.html` — 34 l.

- l.1 · 11 ter. Itinéraire — le tiroir, la visée et le tracé

### `_journee.html` — 17 l.

- l.1 · 11 ter. Organiser sa visite — le branchement

### `_js.html` — 49 l. → plan-admin.html, plan-smcl.html, plan.html

- l.27 · 1. Index global — le branchement

Éléments :

`#data`

### `_langue.js` — 798 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_modales.html` — 24 l.

- l.2 · Fenêtres modales — le branchement, et la réorganisation des calques

### `_mode-admin.html` — 50 l. → plan-admin.html

- l.3 · 10. Mode administration — le branchement

### `_motdepasse.html` — 69 l. → motdepasse.html

- l.61 · Poser un mot de passe — le branchement

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_ordre-fiche.html` — 29 l.

Fonctions :

`enregistreConf` 19 · `joli` 26

### `_parcours.html` — 20 l.

- l.2 · 11 bis. Parcours de visite — le branchement

### `_partage.html` — 13 l.

- l.1 · 11 quinquies. Partager son parcours — le branchement

### `_pile.html` — 76 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.50 · Le panneau des calques — le branchement

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 24 · `groupe` 36 · `ordonneDom` 44
`construitPanneau` 72

### `_pousse.html` — 22 l.

- l.1 · Enregistrer la configuration — le branchement

### `_rappels.html` — 17 l.

- l.1 · 11 sexies. Le rappel avant une conférence

### `_rapport-head.html` — 32 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnExcel` · `#btnRecharger`
`#btnLangue` · `#btnTheme` · `#rapport`

### `_rapport-js.html` — 16 l.

- l.2 · Rapport d'utilisation — le branchement

### `_recherche.html` — 30 l.

- l.3 · 5. Recherche et secteurs — le branchement

### `_reglages.html` — 18 l.

### `_rendu.html` — 50 l.

- l.3 · 2 à 4. Le plan à l'écran — le branchement

### `_sponsor.html` — 14 l. → plan-admin.html

- l.1 · 18. Le sponsor — un logo le temps du chargement

### `_styles-divers.css` — 315 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-jetons.css` — 270 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles-parcours.css` — 1556 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-modeles.css` — 830 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-parcours.css` — 601 l. → plan-admin.html, plan-smcl.html, plan.html

### `_styles-plan.css` — 1600 l. → plan-admin.html, plan-smcl.html, plan.html

### `_suggestion.html` — 25 l.

- l.1 · 15. La suggestion — le branchement

### `_sw.js` — 566 l.

Fonctions :

`estUneTuile` 121 · `range` 147 · `oublieLesVersionsDAvant` 173 · `dabordCache` 194
`borneLesLots` 230 · `borneLesTuiles` 268 · `demandeTiers` 323 · `commePosee` 331
`tuileDeCarte` 348 · `fondDeCarte` 384 · `dabordReseau` 411 · `navigation` 428

### `_tutoriel.html` — 16 l.

- l.1 · 17. La visite guidée — le branchement

### `_volets.html` — 19 l.

### `_vue.html` — 31 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 6. Vue — le branchement

### `_webgl.html` — 44 l.

- l.1 · 13 bis. Le plan peint par la carte graphique — le branchement

Fonctions :

`enEdition` 35

### `modules/acces-admin.mjs` — 243 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`litLocal` 33 · `configuration` 38 · `normaliseUrlA` 42 · `sessionValide` 58
`ecranAcces` 76 · `contenuDuJeton` 167 · `mailDuJeton` 168 · `litProfilA` 179
`poseCompte` 194 · `brancheAcces` 220

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `modules/affiche-ici.mjs` — 401 l. → plan-admin

- l.1 · « Vous êtes ici » — l'affiche à coller, côté exploitant

Fonctions :

`visee` 37 · `vise` 38 · `formeParId` 39 · `prefixePlan` 60 · `coteIci` 72 · `nomCodeIci` 88
`codeIci` 107 · `lienIci` 125 · `pointTouche` 152 · `codeIciAuPoint` 164 · `armeCodeIci` 170
`afficheIci` 192 · `ligneAffiche` 232 · `nomFichierIci` 241 · `ouvreCodeIci` 256
`boutonsCodeIci` 308 · `telechargeAfficheIci` 333 · `imprimeAfficheIci` 351
`boutonCodeIci` 380 · `brancheAfficheIci` 401

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

### `modules/bande-admin.mjs` — 121 l. → plan-admin

- l.1 · 10. Mode administration — son ouverture, et la bande de l'outil

Fonctions :

`brancheBandeAdmin` 41 · `activeAdmin` 46

Éléments :

`#sauveConf` · `#restaureConf` · `#fichierConf`

### `modules/bandes.mjs` — 66 l. → plan, plan-admin

- l.1 · Les bandes qui défilent — fondu du bord, flèche qui avance

Fonctions :

`BANDES` 27 · `majFondus` 35 · `brancheBandes` 49

### `modules/batiments.mjs` — 598 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`reglages` 58 · `confDe` 59 · `estAdmin` 60 · `pile` 61 · `clePile` 62 · `enregistreConf` 63
`construitPanneau` 64 · `CLE_CALAGE` 73 · `bibliothequeDispo` 74 · `refBatiment` 91
`refForme` 95 · `marqueBatiment` 98 · `batimentsPoses` 101 · `estBatiment` 108
`hallsPoses` 111 · `lieuDuCalque` 117 · `poseCalage` 123 · `ouvreBibliotheque` 132
`vueDuLieu` 228 · `lanceCalage` 268 · `effaceLeTempsDuCalage` 296 · `cadreCalage` 315
`finCalage` 328 · `pivoteCalage` 339 · `degresCalage` 355 · `dessineCalage` 360
`calagePointerDown` 383 · `calagePointerMove` 396 · `calagePointerUp` 412
`reposeBatiment` 425 · `ajouteBatiments` 441 · `brancheBatiments` 493 · `boutonRecale` 536
`pictoRecale` 545 · `calageRelu` 562 · `rouvreCalage` 588

### `modules/borne.mjs` — 429 l. → plan, plan-admin

- l.1 · La borne interactive — un plan qui sait où il est

Fonctions :

`visee` 58 · `vise` 59 · `bandeauVisee` 60 · `changePlan` 61 · `fermeItineraire` 62
`effaceItineraire` 63 · `ferme` 64 · `fermeParcours` 65 · `videLeParcours` 66
`formeParId` 67 · `pointBorne` 97 · `poseLieuBorne` 102 · `borneRetenue` 110
`retientBorne` 116 · `oublieBorne` 119 · `lieuBorne` 138 · `lieuNomme` 157
`pointLibre` 162 · `poseDepartImpose` 175 · `poseLaBorne` 186 · `remetLeDepart` 205
`poseBorneIci` 219 · `armeLaPose` 228 · `montreBandeauBorne` 244 · `ecritDepartBorne` 258
`rayonBorne` 268 · `dessineBorne` 273 · `rafraichitBorne` 289 · `rempliBorne` 294
`relanceRepos` 323 · `reposeLaBorne` 330 · `demarreBorne` 366 · `brancheBorne` 414

### `modules/calage-carte.mjs` — 826 l. → plan-admin

- l.1 · 16 bis. Les environs — le calage de la carte sous le pavillon

Fonctions :

`emprisePavillon` 71 · `centrePavillon` 86 · `basculeMasqueCarte` 91
`boutonMasqueCarte` 102 · `pictoMasque` 113 · `carreDeTerrain` 140 · `chercheBatiments` 156
`empriseDesObjets` 184 · `batimentsCandidats` 202 · `caleSurBatiment` 223
`retientLeHall` 249 · `manqueCalage` 271 · `enregistreCalage` 280 · `calageEnregistre` 297
`oublieCalageEnCours` 318 · `litCoordonnees` 330 · `rafraichitCarte` 344 · `armeCalage` 381
`pivotCalage` 392 · `glisseCarte` 396 · `cartePointerDown` 403 · `cartePointerMove` 417
`cartePointerUp` 436 · `ditCalage` 444 · `majCalage` 453 · `appliqueCalage` 475
`tourneCalage` 482 · `construitCalage` 488 · `ouvreCalage` 653 · `fermeCalage` 663
`brancheCalageCarte` 676 · `voletEnvirons` 702

### `modules/calques-dessin.mjs` — 213 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — ce que le poste en garde

Fonctions :

`majAttente` 26 · `brancheCalquesDessin` 30 · `enAttente` 68 · `litRange` 95
`ouvreDessins` 107 · `reprendCommun` 132 · `notePubliees` 158 · `rangeDessins` 176
`dejaPubliee` 181 · `marqueAttente` 187 · `mesCalques` 196 · `poseCalqueActif` 205
`poseOutil` 206 · `poseEbauche` 210 · `trouveCalque` 212 · `nouvelId` 213

### `modules/chaleur.mjs` — 672 l. → plan-admin

- l.2 · Les compteurs d'usage, vus du plan — carte de chaleur, remise à zéro
- l.455 · Remise à zéro des compteurs

Fonctions :

`nbChal` 56 · `tonChaleur` 75 · `niveauChaleur` 97 · `valeurChaleur` 100
`chargeChaleur` 113 · `coloreChaleur` 159 · `cartoucheChaleur` 194
`mesureCartoucheChaleur` 258 · `replieChaleur` 264 · `ecritEtatChaleur` 275
`dessineEchelleChaleur` 283 · `dessineTopChaleur` 303 · `phraseChaleur` 345
`rafraichitChaleur` 370 · `montreChaleur` 404 · `rangChaleur` 437 · `aplati` 477
`voletMesure` 482 · `evenementCourant` 508 · `ouvreRemiseAZero` 527 · `lanceRemiseAZero` 619
`brancheChaleur` 665

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

### `modules/configuration.mjs` — 137 l. → plan, plan-admin

- l.1 · La configuration du plan — ce que l'exploitant a réglé

Fonctions :

`secteurs` 22 · `brancheConfiguration` 29 · `salonRange` 44 · `cleConf` 46 · `ouvreConf` 50
`reglagesDuSalon` 71 · `conf` 94 · `jeton` 95 · `sousCle` 97 · `optionActive` 103
`programmeOffert` 108 · `suggestionOfferte` 109 · `langueOfferte` 129 · `appliqueLangue` 131
`chercheSorte` 136

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

### `modules/demarrage.mjs` — 316 l. → plan, plan-admin

- l.1 · 12. Démarrage — l'appel du plan, sa version, la panne réseau

Fonctions :

`ordonneDom` 39 · `majAttente` 41 · `rattrapeRetard` 42 · `demarre` 48 · `annonce` 109
`entetesApi` 132 · `chargeFond` 156 · `panneDuChargement` 203 · `CLE_VERSION` 213
`versionRetenue` 214 · `retientVersion` 217 · `demandePlan` 241 · `charge` 265
`brancheDemarrage` 306

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

### `modules/dessin.mjs` — 648 l. → plan, plan-admin

- l.1 · 11. Calques de dessin — le tracé sur le plan

Fonctions :

`formeSel` 51 · `boite` 52 · `ordonneDom` 53 · `mentionOsm` 54 · `brancheDessin` 58
`longueurFleche` 78 · `cheminFleche` 93 · `marqueFleche` 122 · `rafraichitFleches` 133
`traceForme` 148 · `rotationTexte` 167 · `dessineDessins` 172 · `redessineForme` 213
`peintCalque` 237 · `apercu` 244 · `apercuGuide` 256 · `traceRepere` 279
`nomSurLePlan` 413 · `etiquetteSociete` 424 · `seRattache` 452 · `societeDeForme` 464
`societesDuPlan` 476 · `traceImage` 510 · `traceStandDessine` 535 · `texteStandDessine` 559
`poseLibellesDessines` 578 · `decoupeStand` 599 · `marqueStandsDessines` 614
`rafraichitStandsDessines` 629 · `signale` 643

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

### `modules/edition.mjs` — 696 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`formeSel` 49 · `poseFormeSel` 50 · `formeParId` 51 · `boite` 52 · `memorise` 53
`enregistreDessins` 54 · `optionsModes` 55 · `societeSaisie` 56 · `remplitListeSocietes` 57
`brancheEdition` 62 · `curseurPoignee` 73 · `poignees` 78 · `dessinePoignees` 87
`cadreTexte` 122 · `poigneeRotation` 142 · `angleBorne` 152 · `choisitForme` 154
`majElement` 165 · `candidatsLiaison` 286 · `ecritDesDeuxCotes` 308 · `changeLien` 320
`changeDureeLien` 336 · `majLiens` 353 · `appliqueSociete` 405 · `appliqueTexte` 421
`appliqueRotation` 433 · `appliqueRayon` 447 · `appliqueTrait` 460 · `appliqueTransport` 488
`appliquePicto` 511 · `supprimeForme` 537 · `editionPointerDown` 547
`editionPointerMove` 607 · `tourneTexte` 670 · `editionPointerUp` 686

### `modules/emplacements.mjs` — 299 l. → plan, plan-admin

- l.1 · Reprendre à la main la géométrie d'un emplacement — ce que le plan

Fonctions :

`reglages` 55 · `brancheEmplacements` 63 · `cleGeo` 67 · `poseSorteGeo` 76
`geometrieSource` 89 · `reposeSource` 98 · `poseGeometrie` 107 · `retoucheGeo` 121
`elargitEmprise` 134 · `appliqueGeometries` 155 · `cleAjout` 196 · `anneauxValides` 207
`rechAjout` 212 · `objetAjoute` 221 · `poseLien` 240 · `appliqueAjouts` 267

### `modules/enregistrement.mjs` — 642 l. → plan-admin

- l.1 · Enregistrer la configuration
- l.513 · La sauvegarde emportée

Fonctions :

`reglagesDuSalon` 59 · `autoDispo` 104 · `enRetard` 107 · `etatCourant` 120
`majAttente` 131 · `compteRescapes` 145 · `ditAlerte` 158 · `ditEtat` 202
`programmeEnvoi` 209 · `programmePublication` 223 · `rattrapeRetard` 230 · `envoie` 235
`presse` 248 · `brancheEnregistrement` 258 · `identifiants` 282 · `reglagesSeuls` 297
`noteReglagesCharges` 308 · `oublieCache` 322 · `pousseConfiguration` 341
`sauvegardeCourante` 533 · `telechargeSauvegarde` 555 · `appliqueSauvegarde` 578
`litSauvegarde` 612 · `brancheSauvegarde` 634

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

### `modules/fenetre.mjs` — 110 l. → plan, plan-admin

- l.1 · La fenêtre commune : par-dessus le plan, pour confirmer, régler, lire

Fonctions :

`_habille` 8 · `poseAvantFermeture` 19 · `verseModale` 21 · `poseApresFermeture` 36
`ouvreModale` 46 · `fermeModale` 66 · `confirme` 76 · `brancheFenetre` 94

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
- l.61 · La fiche d'une zone organisateur
- l.780 · Masquer une zone organisateur

Fonctions :

`reglages` 46 · `enregistreConf` 47 · `liste` 48 · `majPaletteGeo` 49
`brancheFicheZone` 57 · `champZone` 87 · `champsZone` 112 · `champSalles` 204
`nomDeZone` 256 · `cadreLogo` 282 · `champLogo` 354 · `editeurRiche` 392
`memeFicheZone` 549 · `suitFicheZone` 556 · `verseFicheZone` 564 · `ficheZone` 590
`enregistreZone` 615 · `enregistreZoneAjoutee` 728 · `basculeAffichageZone` 791
`marqueZonesMasquees` 819 · `ecritColonnesEvenement` 839 · `ecritColonneEvenement` 873

### `modules/fiche.mjs` — 1166 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.60 · 7. Sélection et fiche

Fonctions :

`decoupeStand` 51 · `formeParId` 52 · `montePlan` 53 · `marqueStandsDessines` 54
`nomDeLaZone` 55 · `poseDistsFiche` 56 · `fermeParcours` 57 · `brancheParcours` 58
`anime` 79 · `noeud` 103 · `canalPlan` 113 · `rangSociete` 121 · `select` 130 · `centre` 155
`brancheActesFiche` 166 · `centreEtBaisseLaFiche` 182 · `centrePoint` 200 · `programme` 229
`produits` 278 · `ficheProduit` 306 · `ficheConf` 376 · `adresseVignette` 533
`poseAppuiTactile` 550 · `ecarteClicFantome` 553 · `nomSociete` 562 · `societes` 575
`choisitExposant` 586 · `poseMarque` 624 · `montreMarque` 684 · `poseCode` 707
`rangeMarque` 748 · `ouvre` 804 · `ferme` 1118 · `onglet` 1136 · `brancheFiche` 1153

Éléments :

`#dGo` · `#dItin`

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

`formeSel` 44 · `appui` 49 · `suit` 63 · `leve` 72 · `annuleGeste` 83 · `clavier` 89
`echap` 134 · `apresEchap` 152 · `entree` 159 · `brancheGestesAdmin` 169

### `modules/gestes.mjs` — 468 l. → plan, plan-admin

- l.1 · Les gestes sur le plan — glisser, pincer, la molette, l'appui qui ouvre
- l.70 · 8. Interactions du plan

Fonctions :

`poseGestesAdmin` 68 · `milieu` 94 · `commencePince` 100 · `suitPince` 114
`plieLesBandes` 167 · `saisitPlan` 181 · `cibleElargie` 218 · `planifieFiltre` 261
`brancheGestes` 275 · `brancheLangue` 456

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

### `modules/installation.mjs` — 914 l. → plan, plan-admin

- l.1 · L'invitation à installer le plan

Fonctions :

`conf` 106 · `reglageInstallation` 126 · `invitationVoulue` 127 · `auDoigt` 157
`nommeApplication` 193 · `reponsesInstallation` 211 · `retientInstallation` 216
`jourInstallation` 225 · `invitationEcartee` 228 · `refuseInstallation` 234
`faconInstallation` 262 · `appliInstallee` 285 · `verifieApplication` 307
`connaitLApplication` 317 · `adresseApplication` 330 · `lanceApplication` 350
`faconRappel` 383 · `rappelEcarte` 391 · `refuseRappel` 397 · `relanceInvitation` 415
`gesteInstallation` 420 · `doigtPose` 424 · `doigtLeve` 425 · `vueInstallation` 428
`accueilleInvitation` 437 · `invitationRetenue` 463 · `suitLesGestes` 484
`finInvitation` 492 · `rouvreInvitation` 514 · `essaieInvitation` 534
`brancheInstallation` 579 · `teteInvitation` 674 · `retourAuxReglages` 689
`poseGardeInstallation` 710 · `remplitInvitation` 733 · `ouvreInvitation` 763
`ouvreRappel` 842 · `ouvreRetrouve` 904

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

### `modules/journee.mjs` — 1263 l. → plan, plan-admin

- l.1 · 11 ter. Organiser sa visite — la question posée, et le tiroir

Fonctions :

`datesSalon` 34 · `horairesSalon` 35 · `lueHeure` 36 · `basculeParcours` 39
`rangParcours` 40 · `rafraichitParcours` 41 · `trace` 43 · `joursSalon` 108
`joursAVenir` 137 · `joursDefaut` 155 · `confsParJour` 165 · `departsProposes` 190
`rangJournee` 212 · `lienJournee` 224 · `boutonJour` 247 · `arretJournee` 260
`remplitOnglets` 307 · `jourDuStand` 336 · `ouvreChoixJour` 348 · `figeLaVisite` 405
`placeSurJour` 414 · `rendAuPlan` 422 · `retireDuSejour` 428 · `remplitJournee` 438
`ecritApercu` 651 · `appliqueVueParcours` 681 · `traceJournee` 723 · `montreLeJour` 732
`perimeJournee` 747 · `oublieSejour` 762 · `ouvreOrganisation` 777 · `essaieSejour` 1157
`lanceSejour` 1187 · `refaitSejour` 1226 · `brancheJournee` 1245

### `modules/libelle-place.mjs` — 89 l. → plan, plan-admin

- l.1 · Placer un libellé à la main — ce que le plan public en reçoit

Fonctions :

`brancheLibellePlace` 48 · `cleLibelle` 52 · `poseModeLibelles` 61 · `poseLibelleChoisi` 66
`empreinteLibelle` 78 · `placementLibelle` 86

### `modules/libelles.mjs` — 378 l. → plan, plan-admin

- l.1 · Les libellés du plan — le nom de l'exposant prime sur le numéro
- l.119 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`dessineDessins` 41 · `decoupeStand` 42 · `poseLibellesDessines` 43 · `phareZone` 44
`rafraichitFleches` 45 · `societeDeForme` 46 · `nomSurLePlan` 47 · `boite` 48
`brancheLibelles` 56 · `coexComptes` 80 · `coexChoisit` 81 · `ligneCode` 97 · `libelles` 126
`decaleLibelle` 213 · `facteurLibelle` 214 · `libelleForce` 215 · `libelleZone` 218
`libelleEmplacement` 237 · `emplacementWebgl` 274 · `libellesWebgl` 322

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

### `modules/nappe.mjs` — 92 l. → plan-admin

- l.1 · Itinéraire — la nappe de la grille de marche

Fonctions :

`jeton` 25 · `poseNappe` 45 · `couleurNappe` 47 · `rafraichitApercu` 53 · `brancheNappe` 89

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

### `modules/ordonnanceur.mjs` — 866 l. → plan, plan-admin

- l.1 · L'ordonnanceur de la journée organisée

Fonctions :

`poseLissage` 84 · `peineDeCharge` 105 · `ecartDesJours` 191 · `poidsDesJours` 221
`chargeDuJour` 244 · `rangeSejour` 253 · `trancheDe` 803 · `dilatationPour` 858

### `modules/ordre-calques.mjs` — 146 l. → plan-admin

- l.1 · L'ordre des calques — la fenêtre de l'exploitant

Fonctions :

`pile` 22 · `clePile` 23 · `CONF` 24 · `enregistreConf` 25 · `ordonneDom` 26
`construitPanneau` 27 · `deplaceVers` 36 · `versExtremite` 48 · `remplitOrdre` 56
`ouvreOrdre` 126 · `brancheOrdreCalques` 146

### `modules/outil-dessin.mjs` — 992 l. → plan-admin

- l.1 · 11. Calques de dessin — l'outil de l'exploitant

Fonctions :

`formeSel` 64 · `poseFormeSel` 65 · `formeParId` 66 · `construitPanneau` 67
`enregistreConf` 68 · `enregistreDessins` 70 · `instantane` 108 · `clotSalve` 119
`memorise` 120 · `restaure` 131 · `annule` 147 · `refais` 159 · `poseTrait` 164
`toleranceTrace` 185 · `aimanteContour` 190 · `rayonContour` 193 · `redresseTrace` 212
`traceGuide` 246 · `fermeIci` 253 · `ajouteForme` 258 · `poseChampImage` 275
`remplitListeSocietes` 282 · `societeSaisie` 290 · `calquePourImage` 306
`lienImageSaisi` 334 · `formeImage` 346 · `poseImage` 355 · `ditImagePosee` 378
`importeImage` 386 · `dessinPointerDown` 415 · `dessinPointerMove` 500
`dessinPointerUp` 538 · `termineTrace` 579 · `aide` 591 · `outilOffert` 621
`choisitOutil` 624 · `enchaineStand` 655 · `optionsModes` 667 · `proposeCouleurLigne` 677
`montreTransport` 688 · `activeCalque` 697 · `cleVerrou` 755 · `verrouille` 756
`basculeVerrou` 758 · `pictoVerrou` 775 · `montreRoleIti` 809 · `creeCalque` 822
`demandeNom` 835 · `renommeCalque` 854 · `brancheOutilDessin` 871

### `modules/parcours-recu.mjs` — 143 l. → plan, plan-admin

- l.1 · Le parcours reçu

Fonctions :

`conf` 28 · `accueilleParcoursPartage` 53 · `adoptePartage` 131 · `brancheParcoursRecu` 143

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

### `modules/partage.mjs` — 301 l. → plan, plan-admin

- l.1 · Partager son parcours, et en garder une copie

Fonctions :

`conf` 44 · `lienParcours` 55 · `ouvrePartageParcours` 71 · `boutonsPartage` 127
`parcoursACopier` 214 · `ouvreGardeParcours` 229 · `demandeGardeParcours` 259
`poseGardeParcours` 272 · `branchePartage` 298

### `modules/pile.mjs` — 556 l. → plan-admin

- l.1 · Le panneau des calques
- l.73 · Panneau : deux sections, chacune rangée par nom
- l.367 · Repères
- l.419 · Fond du plan

Fonctions :

`estAdmin` 58 · `placeLibelles` 59 · `secteurs` 61 · `entrees` 62 · `enregistreConf` 63
`joli` 64 · `modePlacementLibelles` 65 · `branchePile` 69 · `nature` 91 · `boutonAjout` 98
`boutonVerrou` 118 · `intertitre` 126 · `remplitPanneau` 135 · `sectionSelection` 383
`sectionFond` 439 · `ligneCouleur` 497 · `rangSecteur` 517 · `rangSous` 530
`defautCouleur` 552

### `modules/placement-libelles.mjs` — 188 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`reglages` 42 · `enregistreConf` 43 · `lacheLibelle` 50 · `posePlacement` 59
`libelleAutomatique` 77 · `modePlacementLibelles` 86 · `majPaletteLibelle` 105
`choisitLibelle` 122 · `pousseLibelle` 129 · `libellePointerDown` 137
`libellePointerMove` 153 · `libellePointerUp` 162 · `branchePlacementLibelles` 177

### `modules/plan-admin.mjs` — 122 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

### `modules/plan.mjs` — 302 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

### `modules/points-interet.mjs` — 418 l. → plan, plan-admin

- l.1 · Les points d'intérêt — le cartouche, la recherche, la fiche d'un repère

Fonctions :

`formeParId` 42 · `branchePointsInteret` 46 · `oublieReperes` 69 · `reperesCherchables` 71
`vaAuRepere` 115 · `clePoi` 158 · `cartouchePoi` 160 · `ouvrePoi` 279
`mesureCartouche` 352 · `pharePoi` 368 · `phareRepere` 372 · `phareZone` 374
`eclairePoi` 380 · `oublieChoixPoi` 413

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

`conf` 71 · `tuto` 72 · `brancheRappels` 80 · `reglageRappel` 99 · `rappelsVoulus` 100
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

### `modules/recherche.mjs` — 1166 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`ferme` 64 · `ficheConf` 67 · `adresseVignette` 68 · `poseToutAuParcours` 69
`dessineDists` 70 · `libelles` 71 · `marquesListe` 72 · `porteDist` 73 · `standPorte` 74
`reperesCherchables` 75 · `vaAuRepere` 76 · `appliqueSecteurs` 86 · `filtreTheme` 103
`themeFiltrable` 183 · `ordreCriteres` 199 · `clesCriteres` 222 · `libelleCritere` 229
`valeursCritere` 248 · `texteCriteres` 261 · `texteAnglaisPerso` 277 · `indexeCriteres` 291
`refaitCriteres` 325 · `dansCriteres` 332 · `critereActif` 340 · `basculeCritere` 342
`videCriteres` 351 · `majVideQ` 360 · `videRecherche` 373 · `nCriteres` 388
`majCriteres` 403 · `remplitCriteres` 470 · `basculeCriteres` 609 · `ouvreCriteres` 614
`fermeCriteres` 630 · `filtre` 647 · `reposeRetrait` 667 · `critParSociete` 671
`cherchable` 681 · `visible` 688 · `releveHotes` 709 · `visibleSurPlan` 717
`visibleSociete` 728 · `marqueRetrait` 744 · `appliqueFiltre` 762 · `oublieRetrait` 778
`reprendRecherche` 787 · `rangSorte` 800 · `codeCase` 822 · `caseNumero` 839
`sousLigne` 859 · `liste` 873 · `marqueChoisie` 1001 · `prechargeMarque` 1027
`prechargeLesVignettes` 1084 · `chargeUnLot` 1130 · `brancheRecherche` 1157

### `modules/reglage-application.mjs` — 327 l. → plan-admin

- l.1 · L'application installée — son icône et son nom, le réglage de l'exploitant

Fonctions :

`brancheReglageApplication` 59 · `nomAppDefaut` 80 · `ecritApplication` 95
`blocApplication` 136

### `modules/reglage-fiche.mjs` — 661 l. → plan-admin

- l.1 · Le volet « Fiche Stand » des réglages — l'exploitant seul

Fonctions :

`clesFiche` 51 · `voletOrdre` 68 · `brancheReglageFiche` 659

### `modules/reglage-installation.mjs` — 71 l. → plan-admin

- l.1 · La case de l'invitation à installer, dans l'onglet « Admin » des réglages

Fonctions :

`brancheReglageInstallation` 22 · `caseInstallation` 34

### `modules/reglage-rappel.mjs` — 172 l. → plan-admin

- l.1 · Le rappel avant une conférence, dans l'onglet « Admin » des réglages

Fonctions :

`brancheReglageRappel` 25 · `blocRappel` 47 · `ditEssaiRappel` 158

### `modules/reglage-recherche.mjs` — 327 l. → plan-admin

- l.1 · L'onglet « Recherche » des réglages — l'exploitant seul

Fonctions :

`brancheReglageRecherche` 33 · `reperesCherchables` 37 · `enregistreConf` 38
`catalogueTenu` 43 · `voletRecherche` 112 · `blocOrdreCriteres` 173

### `modules/reglage-sponsor.mjs` — 232 l. → plan-admin

- l.1 · Le générique du démarrage, réglé par l'exploitant

Fonctions :

`brancheReglageSponsor` 32 · `blocSponsor` 75

### `modules/reglage-suggestion.mjs` — 426 l. → plan-admin

- l.1 · La suggestion — le volet de l'exploitant

Fonctions :

`conf` 26 · `champZone` 27 · `enregistreConf` 28 · `glisseFenetre` 29 · `indexSugg` 46
`valeursSugg` 71 · `relevePalmares` 89 · `etiquetteSugg` 109 · `voletSuggestion` 119
`brancheReglageSuggestion` 426

### `modules/reglages.mjs` — 536 l. → plan-admin

- l.1 · La fenêtre des réglages du plan — l'exploitant seul

Fonctions :

`brancheReglages` 61 · `glisseFenetre` 90 · `ouvreReglages` 102 · `voletZones` 230
`champsFicheZone` 332 · `ficheZoneEnPlace` 402 · `voletPlan` 420 · `voletCoexposants` 468

### `modules/rendu.mjs` — 163 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`brancheRendu` 48 · `monteHabillage` 55 · `baliseZone` 84 · `baliseStand` 94
`montePlan` 101 · `onglets` 133 · `changePlan` 155

### `modules/reperes.mjs` — 421 l. → plan, plan-admin

- l.1 · Les repères et les transports en commun — ce qu'ils sont

Fonctions :

`pictoDe` 130 · `nomTypeRepereFr` 186 · `nomTypeRepere` 188 · `typeZone` 218
`pictoForme` 225 · `estPorte` 245 · `ouvreEntrant` 246 · `ouvreSortant` 247 · `modeDit` 287
`lettreMode` 289 · `estTransport` 293 · `modeTransport` 296 · `glypheRepere` 308
`cleLigne` 345 · `ligneAffichee` 356 · `couleurLigne` 364 · `couleurRepere` 370
`encreRepere` 376 · `nomLigneFr` 390 · `libelleDoffice` 398 · `couleurEcrite` 405
`pastillePoi` 419

### `modules/reprise-emplacements.mjs` — 772 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`reglages` 72 · `conf` 73 · `enregistreConf` 74 · `construitPanneau` 75 · `optionActive` 76
`pictoVerrou` 77 · `activeCalque` 78 · `remplitListeSocietes` 79 · `societeSaisie` 80
`fermeIci` 81 · `lacheGeo` 92 · `cleVerrouGeo` 112 · `geoVerrouille` 113
`basculeVerrouGeo` 115 · `boutonVerrouGeo` 130 · `modeGeometrie` 141 · `objetGeoSous` 168
`groupeGeo` 178 · `choisitGeo` 186 · `cadreGeo` 201 · `prisesGeo` 221 · `curseurGeo` 233
`dessinePoigneesGeo` 236 · `ecritDimensionsGeo` 264 · `nomSorteGeo` 276
`majPaletteGeo` 278 · `finGesteGeo` 317 · `enregistreGeo` 335 · `geometrieOrigine` 349
`retraceGeo` 364 · `pousseGeometrie` 375 · `appliqueDimensionGeo` 392
`enregistreAjout` 407 · `ajouteEmplacement` 422 · `renommeAjout` 450 · `lieAjout` 482
`ecritInfosAjout` 511 · `supprimeAjout` 538 · `choisitOutilGeo` 567 · `aideAjout` 574
`fermeAjout` 584 · `ajoutPointerDown` 593 · `ajoutPointerMove` 609 · `ajoutPointerUp` 631
`geometriePointerDown` 651 · `accrocheGeo` 682 · `geometriePointerMove` 684
`geometriePointerUp` 735 · `brancheRepriseEmplacements` 753

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

### `modules/sponsor.mjs` — 406 l. → plan, plan-admin

- l.1 · Le sponsor — un logo le temps du chargement

Fonctions :

`reglageSponsor` 117 · `secondesSponsor` 120 · `modeSponsor` 133 · `sponsorRetenu` 152
`cleSponsor` 183 · `sponsorEnCache` 186 · `retientSponsor` 201 · `ouvreSponsor` 226
`suitSponsor` 319 · `resteSponsor` 344 · `fermeSponsor` 350 · `accueilleSponsor` 366
`brancheSponsor` 400

### `modules/suggestion.mjs` — 331 l. → plan, plan-admin

- l.1 · La suggestion — un exposant de plus, pour compléter la visite

Fonctions :

`conf` 46 · `suggestionOfferte` 47 · `remplitParcours` 48 · `brancheParcours` 49
`reglageSugg` 78 · `seuilSugg` 80 · `presentationsSugg` 104 · `presenteSugg` 110
`critereSugg` 115 · `suggestionCourante` 132 · `exposantPropose` 168 · `nomValeurSugg` 186
`phraseSuggestion` 207 · `carteSuggestion` 235 · `poseSuggestion` 284
`fenetreSuggestion` 298 · `brancheSuggestion` 331

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

`changePlan` 36 · `ferme` 37 · `fermeParcours` 38 · `formeParId` 39 · `calculeRoute` 57
`poseTrace` 80 · `marchesIci` 82 · `rayonBout` 87 · `arreteTracage` 120
`peintItineraire` 126 · `lanceTracage` 177 · `dessineItineraire` 202 · `rafraichitBouts` 224
`cadreItineraire` 247 · `champIti` 271 · `fermeSugg` 275 · `montreSugg` 282
`choisitPoint` 316 · `valideSaisie` 325 · `effaceItineraire` 337 · `relance` 365
`montreResultat` 407 · `poseVisee` 551 · `bandeauVisee` 553 · `armeVisee` 576
`finVisee` 594 · `viseItineraire` 610 · `visePoi` 616 · `visePoint` 622
`ouvreItineraire` 651 · `fermeItineraire` 679 · `versItineraire` 689
`versItineraireDe` 692 · `brancheTiroirItineraire` 722

### `modules/tiroir-parcours.mjs` — 446 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`conf` 40 · `filtre` 41 · `visible` 42 · `basculeParcours` 53 · `verseAuParcours` 98
`retenusPourParcours` 144 · `ajouteToutAuParcours` 169 · `poseToutAuParcours` 192
`brancheParcours` 216 · `rafraichitParcours` 229 · `rangParcours` 259
`remplitParcours` 279 · `ouvreParcours` 368 · `fermeParcours` 380 · `videLeParcours` 391
`brancheTiroirParcours` 423

### `modules/tiroirs.mjs` — 524 l. → plan, plan-admin

- l.1 · Les tiroirs des écrans étroits — la liste, et ceux que la hauteur mène
- l.28 · Ce que les tiroirs lisent d'un geste
- l.74 · Le tiroir de la liste — écrans étroits
- l.300 · Les tiroirs menés par la hauteur — écrans étroits

Fonctions :

`fermeCriteres` 26 · `traceurDeGeste` 52 · `cranVoisin` 71 · `retraitBas` 97
`mesureTiroir` 110 · `montreTiroir` 113 · `hisseTiroir` 117 · `tiroirListe` 124
`tiroirCrante` 327 · `brancheTiroirs` 509

### `modules/ton-barre.mjs` — 76 l. → plan, plan-admin

- l.1 · La couleur de la barre du système

Fonctions :

`poseTonDeLaBarre` 41 · `brancheTonDeLaBarre` 74

### `modules/trace.mjs` — 178 l. → plan, plan-admin

- l.1 · Le SVG relu en nombres : transformations, tracés, couleurs

Fonctions :

`mulM` 14 · `appM` 17 · `echelleM` 18 · `lisTransform` 20 · `lisTrace` 42 · `lisPoints` 112
`num` 118 · `anneau` 120 · `rectArrondi` 126 · `avecTrous` 139 · `couleurGl` 165

### `modules/tutoriel.mjs` — 1004 l. → plan, plan-admin

- l.1 · La visite guidée — le tour du plan, geste par geste

Fonctions :

`brancheTutoriel` 76 · `conf` 80 · `optionActive` 81 · `route` 86 · `attente` 87 · `iti` 88
`visee` 89 · `eteintVisee` 90 · `journee` 92 · `vueJournee` 93 · `sejour` 94 · `iciActif` 96
`dessinEnCours` 99 · `reglageTuto` 127 · `tutoPropose` 136 · `cleTuto` 140
`tutoOuvert` 142 · `tutoModale` 143 · `tutoFicheOuverte` 149 · `tutoFiche` 152
`tutoParcours` 154 · `tutoItineraire` 158 · `tutoJournee` 162 · `zoneDuTuto` 170
`insecable` 187 · `phraseTrajetTuto` 193 · `chapitresTuto` 453 · `proposeTutoriel` 473
`lanceTutoriel` 531 · `quitteTutoriel` 618 · `chapitreTuto` 629 · `battementTuto` 638
`finTuto` 656 · `afficheTuto` 673 · `pxTuto` 728 · `boiteTuto` 741 · `repereTuto` 756
`rameneTuto` 789 · `placeTuto` 827 · `voileTuto` 921 · `rafaleTuto` 938
`marqueZoneTuto` 958 · `marqueLibelleTuto` 993

Éléments :

`#tutoPoints` · `#tutoAvance` · `#tutoQuitte` · `#tutoTitre` · `#tutoTexte` · `#tutoPied`
`#tutoSuite`

### `modules/vivant.mjs` — 36 l. → plan, plan-admin, console, rapport

- l.1 · Un état de module, lu par le code soudé tel qu'il est à l'instant

Fonctions :

`vivants` 25

### `modules/volets.mjs` — 1234 l. → plan-admin

- l.1 · Les volets Admin, Parcours intelligent, PMR, Distinctions et Apparence —

Fonctions :

`secteurs` 55 · `brancheVolets` 68 · `voletAdmin` 73 · `blocOptions` 238 · `blocLangues` 285
`blocBarre` 359 · `blocHoraires` 417 · `voletParcours` 559 · `sallesSituees` 694
`voletPmr` 710 · `nomDuTon` 801 · `svgVignette` 810 · `barreVignette` 812
`vignetteDistPlan` 816 · `vignetteDistListe` 829 · `vignetteDistFiche` 843
`salonDitSes` 863 · `coinPris` 870 · `voletDist` 893 · `voletApparence` 1058

### `modules/vue.mjs` — 572 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.59 · 6. Vue

Fonctions :

`vue` 42 · `changeVue` 44 · `enEdition` 45 · `libelles` 46 · `ordonneDom` 47
`poseEmprise` 57 · `cadrePlan` 76 · `oublieCadre` 77 · `figeTextes` 91 · `rendTextes` 99
`cadrage` 138 · `peintLibelles` 143 · `repeintLibelles` 151 · `detacheLibelles` 155
`rattacheLibelles` 167 · `etireLibelles` 185 · `appliqueVue` 193 · `libellesDeLaVue` 259
`rafraichitVue` 267 · `poseVue` 281 · `mesureBarre` 310 · `masqueHaut` 338 · `masque` 345
`masqueDroite` 382 · `fit` 393 · `stoppeZoom` 431 · `glisseVersVise` 437 · `glisseVers` 480
`rectVisee` 502 · `zoom` 522 · `echelle` 536 · `versPlan` 548 · `brancheVue` 561

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
