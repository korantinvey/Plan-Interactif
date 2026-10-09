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

### `_batiments.html` — 43 l. → plan-admin.html

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

### `_dessin.html` — 2555 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 42 · `litRange` 69 · `ouvreDessins` 81 · `reprendCommun` 106
`notePubliees` 132 · `rangeDessins` 150 · `dejaPubliee` 155 · `marqueAttente` 161
`mesCalques` 170 · `enregistreDessins` 172 · `instantane` 216 · `clotSalve` 227
`memorise` 228 · `restaure` 239 · `annule` 255 · `refais` 267 · `trouveCalque` 270
`nouvelId` 271 · `cheminArrondi` 289 · `estCadre` 332 · `cheminForme` 334 · `styleTrait` 354
`longueurFleche` 380 · `cheminFleche` 394 · `marqueFleche` 423 · `rafraichitFleches` 434
`poseTrait` 451 · `traceForme` 462 · `rotationTexte` 481 · `dessineDessins` 486
`redessineForme` 527 · `peintCalque` 551 · `apercu` 558 · `apercuGuide` 570
`toleranceTrace` 595 · `aimanteContour` 600 · `rayonContour` 603 · `redresseTrace` 622
`traceGuide` 656 · `fermeIci` 663 · `ajouteForme` 670 · `pictoDe` 798
`nomTypeRepereFr` 854 · `nomTypeRepere` 856 · `typeZone` 886 · `pictoForme` 893
`estPorte` 913 · `ouvreEntrant` 914 · `ouvreSortant` 915 · `modeDit` 955 · `lettreMode` 957
`estTransport` 961 · `modeTransport` 964 · `glypheRepere` 976 · `cleLigne` 1013
`ligneAffichee` 1024 · `couleurLigne` 1032 · `couleurRepere` 1038 · `encreRepere` 1044
`nomLigneFr` 1058 · `libelleDoffice` 1066 · `couleurEcrite` 1073 · `traceRepere` 1092
`nomSurLePlan` 1226 · `etiquetteSociete` 1237 · `seRattache` 1265 · `societeDeForme` 1277
`societesDuPlan` 1289 · `poseChampImage` 1311 · `remplitListeSocietes` 1318
`societeSaisie` 1326 · `traceImage` 1354 · `traceStandDessine` 1379
`texteStandDessine` 1403 · `poseLibellesDessines` 1421 · `decoupeStand` 1442
`marqueStandsDessines` 1457 · `rafraichitStandsDessines` 1472 · `oublieReperes` 1502
`reperesCherchables` 1504 · `vaAuRepere` 1548 · `clePoi` 1591 · `pastillePoi` 1600
`cartouchePoi` 1604 · `ouvrePoi` 1723 · `mesureCartouche` 1796 · `pharePoi` 1812
`phareRepere` 1816 · `phareZone` 1818 · `eclairePoi` 1824 · `oublieChoixPoi` 1857
`signale` 1866 · `calquePourImage` 1881 · `lienImageSaisi` 1909 · `formeImage` 1921
`poseImage` 1930 · `ditImagePosee` 1952 · `importeImage` 1960 · `dessinPointerDown` 2011
`dessinPointerMove` 2096 · `dessinPointerUp` 2134 · `termineTrace` 2175 · `aide` 2187
`outilOffert` 2217 · `choisitOutil` 2220 · `enchaineStand` 2251 · `optionsModes` 2281
`proposeCouleurLigne` 2292 · `montreTransport` 2303 · `activeCalque` 2369 · `cleVerrou` 2427
`verrouille` 2428 · `basculeVerrou` 2430 · `pictoVerrou` 2447 · `montreRoleIti` 2481
`creeCalque` 2512 · `demandeNom` 2525 · `renommeCalque` 2544

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 44 l. → plan-admin.html

- l.1 · Édition des formes existantes

Fonctions :

`formeParId` 14 · `boite` 22

### `_entete.html` — 6 l.

### `_environs.html` — 26 l.

- l.1 · 16. Les environs — le branchement

### `_export.html` — 12 l.

- l.1 · Export par exposant — le branchement

### `_fiche.html` — 35 l.

- l.3 · 7. Sélection et fiche

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

### `_installation.html` — 40 l. → plan-admin.html

- l.1 · 16. L'invitation à installer le plan

Fonctions :

`retourAuxReglages` 32

### `_itineraire.html` — 37 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — le tiroir, la visée et le tracé

### `_journee.html` — 17 l.

- l.1 · 11 ter. Organiser sa visite — le branchement

### `_js.html` — 546 l. → plan-admin.html, plan-smcl.html, plan.html

- l.30 · 1. Index global — la recherche porte sur tous les pavillons

Fonctions :

`nomDeLaZone` 47 · `nomsAnglaisDesZones` 49 · `texteProduits` 62 · `indexe` 66
`chronoConf` 308 · `confsDuPlan` 313 · `indexeConferences` 331 · `rangeConferences` 409
`poseFavicon` 456 · `poseLogoSalon` 482 · `poseTonDeLaBarre` 519

Éléments :

`#data`

### `_langue.js` — 798 l. → admin-plans.html, hors-ligne.html, index.html, motdepasse.html, plan-admin.html, plan-smcl.html, plan.html, rapport.html

- l.1 · La langue de la page — le français d'origine, l'anglais sur demande

### `_modales.html` — 23 l.

- l.2 · Fenêtres modales — le branchement, et la réorganisation des calques

### `_mode-admin.html` — 53 l. → plan-admin.html

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

### `_pile.html` — 77 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.50 · Le panneau des calques — le branchement

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 24 · `groupe` 36 · `ordonneDom` 44
`construitPanneau` 73

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

### `_recherche.html` — 32 l.

- l.3 · 5. Recherche et secteurs — le branchement

### `_reglages.html` — 18 l.

### `_rendu.html` — 54 l.

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

### `_vue.html` — 35 l. → plan-admin.html, plan-smcl.html, plan.html

- l.3 · 6. Vue — le branchement

### `_webgl.html` — 44 l.

- l.1 · 13 bis. Le plan peint par la carte graphique — le branchement

Fonctions :

`enEdition` 35

### `modules/acces-admin.mjs` — 245 l. → plan-admin

- l.1 · Accès à l'administration du plan

Fonctions :

`litLocal` 34 · `configuration` 39 · `normaliseUrlA` 43 · `sessionValide` 59
`ecranAcces` 77 · `contenuDuJeton` 168 · `mailDuJeton` 169 · `litProfilA` 180
`poseCompte` 195 · `brancheAcces` 221

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

### `modules/batiments.mjs` — 608 l. → plan-admin

- l.1 · 11 quinquies. Bâtiments de la bibliothèque

Fonctions :

`reglages` 61 · `confDe` 62 · `estAdmin` 63 · `mesCalques` 64 · `activeCalque` 65
`memorise` 66 · `nouvelId` 67 · `cleVerrou` 68 · `pile` 69 · `clePile` 70
`enregistreConf` 71 · `enregistreDessins` 72 · `dessineDessins` 73 · `construitPanneau` 74
`CLE_CALAGE` 83 · `bibliothequeDispo` 84 · `refBatiment` 101 · `refForme` 105
`marqueBatiment` 108 · `batimentsPoses` 111 · `estBatiment` 118 · `hallsPoses` 121
`lieuDuCalque` 127 · `poseCalage` 133 · `ouvreBibliotheque` 142 · `vueDuLieu` 238
`lanceCalage` 278 · `effaceLeTempsDuCalage` 306 · `cadreCalage` 325 · `finCalage` 338
`pivoteCalage` 349 · `degresCalage` 365 · `dessineCalage` 370 · `calagePointerDown` 393
`calagePointerMove` 406 · `calagePointerUp` 422 · `reposeBatiment` 435
`ajouteBatiments` 451 · `brancheBatiments` 503 · `boutonRecale` 546 · `pictoRecale` 555
`calageRelu` 572 · `rouvreCalage` 598

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

### `modules/depot-image.mjs` — 73 l. → plan-admin

- l.1 · Une image déposée par l'exploitant, lue puis réduite

Fonctions :

`litImage` 16 · `reduitLogo` 57

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

### `modules/edition.mjs` — 717 l. → plan-admin

- l.1 · Édition des formes existantes

Fonctions :

`formeSel` 42 · `poseFormeSel` 43 · `outil` 44 · `calqueActif` 45 · `formeParId` 46
`boite` 47 · `estCadre` 48 · `memorise` 49 · `enregistreDessins` 50 · `dessineDessins` 51
`redessineForme` 52 · `apercuGuide` 53 · `pictoForme` 54 · `nomTypeRepere` 55
`estTransport` 56 · `modeTransport` 57 · `optionsModes` 58 · `couleurRepere` 59
`couleurLigne` 60 · `couleurEcrite` 61 · `libelleDoffice` 62 · `seRattache` 63
`societeDeForme` 64 · `etiquetteSociete` 65 · `societeSaisie` 66 · `remplitListeSocietes` 67
`brancheEdition` 80 · `curseurPoignee` 94 · `poignees` 99 · `dessinePoignees` 108
`cadreTexte` 143 · `poigneeRotation` 163 · `angleBorne` 173 · `choisitForme` 175
`majElement` 186 · `candidatsLiaison` 307 · `ecritDesDeuxCotes` 329 · `changeLien` 341
`changeDureeLien` 357 · `majLiens` 374 · `appliqueSociete` 426 · `appliqueTexte` 442
`appliqueRotation` 454 · `appliqueRayon` 468 · `appliqueTrait` 481 · `appliqueTransport` 509
`appliquePicto` 532 · `supprimeForme` 558 · `editionPointerDown` 568
`editionPointerMove` 628 · `tourneTexte` 691 · `editionPointerUp` 707

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

### `modules/fiche-zone.mjs` — 881 l. → plan-admin

- l.1 · La fiche d'une zone organisateur — ce que l'exploitant en écrit
- l.68 · La fiche d'une zone organisateur
- l.787 · Masquer une zone organisateur

Fonctions :

`reglages` 47 · `typesZone` 48 · `typeZone` 49 · `annonce` 50 · `enregistreConf` 51
`nomsAnglaisDesZones` 52 · `liste` 53 · `cartouchePoi` 54 · `majPaletteGeo` 55
`rangeConferences` 56 · `brancheFicheZone` 64 · `champZone` 94 · `champsZone` 119
`champSalles` 211 · `nomDeZone` 263 · `cadreLogo` 289 · `champLogo` 361 · `editeurRiche` 399
`memeFicheZone` 556 · `suitFicheZone` 563 · `verseFicheZone` 571 · `ficheZone` 597
`enregistreZone` 622 · `enregistreZoneAjoutee` 735 · `basculeAffichageZone` 798
`marqueZonesMasquees` 826 · `ecritColonnesEvenement` 846 · `ecritColonneEvenement` 880

### `modules/fiche.mjs` — 1166 l. → plan, plan-admin

- l.1 · La sélection et la fiche d'un exposant
- l.60 · 7. Sélection et fiche

Fonctions :

`decoupeStand` 48 · `formeParId` 49 · `montePlan` 50 · `marqueStandsDessines` 51
`typeZone` 52 · `nomDeLaZone` 53 · `poseDistsFiche` 54 · `fermeParcours` 55
`brancheParcours` 56 · `baisseTiroir` 58 · `anime` 79 · `noeud` 103 · `canalPlan` 113
`rangSociete` 121 · `select` 130 · `centre` 155 · `brancheActesFiche` 166
`centreEtBaisseLaFiche` 182 · `centrePoint` 200 · `programme` 229 · `produits` 278
`ficheProduit` 306 · `ficheConf` 376 · `adresseVignette` 533 · `poseAppuiTactile` 550
`ecarteClicFantome` 553 · `nomSociete` 562 · `societes` 575 · `choisitExposant` 586
`poseMarque` 624 · `montreMarque` 684 · `poseCode` 707 · `rangeMarque` 748 · `ouvre` 804
`ferme` 1118 · `onglet` 1136 · `brancheFiche` 1153

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
- l.118 · 4. Libellés — le nom de l'exposant prime sur le numéro

Fonctions :

`vue` 37 · `dessineDessins` 38 · `decoupeStand` 39 · `poseLibellesDessines` 40
`phareZone` 41 · `nomDeLaZone` 42 · `rafraichitFleches` 43 · `mesCalques` 44
`societeDeForme` 45 · `nomSurLePlan` 46 · `boite` 47 · `brancheLibelles` 55
`coexComptes` 79 · `coexChoisit` 80 · `ligneCode` 96 · `libelles` 125 · `decaleLibelle` 213
`facteurLibelle` 214 · `libelleForce` 215 · `libelleZone` 218 · `libelleEmplacement` 237
`emplacementWebgl` 274 · `libellesWebgl` 322

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

### `modules/ordre-calques.mjs` — 150 l. → plan-admin

- l.1 · L'ordre des calques — la fenêtre de l'exploitant

Fonctions :

`pile` 21 · `clePile` 22 · `CONF` 23 · `enregistreConf` 24 · `ordonneDom` 25
`construitPanneau` 26 · `verrouille` 27 · `pictoVerrou` 28 · `renommeCalque` 29
`deplaceVers` 38 · `versExtremite` 50 · `remplitOrdre` 58 · `ouvreOrdre` 128
`brancheOrdreCalques` 150

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

### `modules/pile.mjs` — 578 l. → plan-admin

- l.1 · Le panneau des calques
- l.95 · Panneau : deux sections, chacune rangée par nom
- l.389 · Repères
- l.441 · Fond du plan

Fonctions :

`estAdmin` 68 · `dessins` 69 · `calqueActif` 70 · `placeLibelles` 71 · `secteurs` 73
`entrees` 74 · `enregistreConf` 75 · `joli` 76 · `mesCalques` 77 · `creeCalque` 78
`enregistreDessins` 79 · `dessineDessins` 80 · `peintCalque` 81 · `verrouille` 82
`basculeVerrou` 83 · `pictoVerrou` 84 · `activeCalque` 85 · `memorise` 86
`modePlacementLibelles` 87 · `branchePile` 91 · `nature` 113 · `boutonAjout` 120
`boutonVerrou` 140 · `intertitre` 148 · `remplitPanneau` 157 · `sectionSelection` 405
`sectionFond` 461 · `ligneCouleur` 519 · `rangSecteur` 539 · `rangSous` 552
`defautCouleur` 574

### `modules/placement-libelles.mjs` — 188 l. → plan-admin

- l.1 · Placer un libellé à la main — l'outil de l'exploitant

Fonctions :

`reglages` 42 · `enregistreConf` 43 · `lacheLibelle` 50 · `posePlacement` 59
`libelleAutomatique` 77 · `modePlacementLibelles` 86 · `majPaletteLibelle` 105
`choisitLibelle` 122 · `pousseLibelle` 129 · `libellePointerDown` 137
`libellePointerMove` 153 · `libellePointerUp` 162 · `branchePlacementLibelles` 177

### `modules/plan-admin.mjs` — 110 l. → plan-admin

- l.1 · Point d'entrée de la page d'administration du plan

### `modules/plan.mjs` — 252 l. → plan, plan-admin

- l.1 · Point d'entrée des trois pages du plan — public, démonstration,

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

### `modules/recherche.mjs` — 1171 l. → plan, plan-admin

- l.1 · La recherche, la liste et les critères — sans mot-clé ni critère retenu on

Fonctions :

`ferme` 65 · `ficheConf` 68 · `adresseVignette` 69 · `montreTiroir` 70 · `mesureTiroir` 71
`hisseTiroir` 72 · `poseToutAuParcours` 73 · `dessineDists` 74 · `libelles` 75
`marquesListe` 76 · `porteDist` 77 · `standPorte` 78 · `nomDeLaZone` 79
`reperesCherchables` 80 · `vaAuRepere` 81 · `appliqueSecteurs` 91 · `filtreTheme` 108
`themeFiltrable` 188 · `ordreCriteres` 204 · `clesCriteres` 227 · `libelleCritere` 234
`valeursCritere` 253 · `texteCriteres` 266 · `texteAnglaisPerso` 282 · `indexeCriteres` 296
`refaitCriteres` 330 · `dansCriteres` 337 · `critereActif` 345 · `basculeCritere` 347
`videCriteres` 356 · `majVideQ` 365 · `videRecherche` 378 · `nCriteres` 393
`majCriteres` 408 · `remplitCriteres` 475 · `basculeCriteres` 614 · `ouvreCriteres` 619
`fermeCriteres` 635 · `filtre` 652 · `reposeRetrait` 672 · `critParSociete` 676
`cherchable` 686 · `visible` 693 · `releveHotes` 714 · `visibleSurPlan` 722
`visibleSociete` 733 · `marqueRetrait` 749 · `appliqueFiltre` 767 · `oublieRetrait` 783
`reprendRecherche` 792 · `rangSorte` 805 · `codeCase` 827 · `caseNumero` 844
`sousLigne` 864 · `liste` 878 · `marqueChoisie` 1006 · `prechargeMarque` 1032
`prechargeLesVignettes` 1089 · `chargeUnLot` 1135 · `brancheRecherche` 1162

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

### `modules/rendu.mjs` — 160 l. → plan, plan-admin

- l.1 · 3. Rendu du pavillon courant

Fonctions :

`brancheRendu` 45 · `monteHabillage` 52 · `baliseZone` 81 · `baliseStand` 91
`montePlan` 98 · `onglets` 130 · `changePlan` 152

### `modules/reprise-emplacements.mjs` — 780 l. → plan-admin

- l.1 · Reprendre et ajouter des emplacements — l'outil de l'exploitant

Fonctions :

`reglages` 73 · `conf` 74 · `calqueActif` 75 · `enregistreConf` 76 · `construitPanneau` 77
`nomsAnglaisDesZones` 78 · `optionActive` 79 · `pictoVerrou` 80 · `activeCalque` 81
`remplitListeSocietes` 82 · `societeSaisie` 83 · `etiquetteSociete` 84 · `apercu` 85
`apercuGuide` 86 · `fermeIci` 87 · `cheminForme` 88 · `nouvelId` 89 · `lacheGeo` 100
`cleVerrouGeo` 120 · `geoVerrouille` 121 · `basculeVerrouGeo` 123 · `boutonVerrouGeo` 138
`modeGeometrie` 149 · `objetGeoSous` 176 · `groupeGeo` 186 · `choisitGeo` 194
`cadreGeo` 209 · `prisesGeo` 229 · `curseurGeo` 241 · `dessinePoigneesGeo` 244
`ecritDimensionsGeo` 272 · `nomSorteGeo` 284 · `majPaletteGeo` 286 · `finGesteGeo` 325
`enregistreGeo` 343 · `geometrieOrigine` 357 · `retraceGeo` 372 · `pousseGeometrie` 383
`appliqueDimensionGeo` 400 · `enregistreAjout` 415 · `ajouteEmplacement` 430
`renommeAjout` 458 · `lieAjout` 490 · `ecritInfosAjout` 519 · `supprimeAjout` 546
`choisitOutilGeo` 575 · `aideAjout` 582 · `fermeAjout` 592 · `ajoutPointerDown` 601
`ajoutPointerMove` 617 · `ajoutPointerUp` 639 · `geometriePointerDown` 659
`accrocheGeo` 690 · `geometriePointerMove` 692 · `geometriePointerUp` 743
`brancheRepriseEmplacements` 761

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

### `modules/tiroir-itineraire.mjs` — 808 l. → plan, plan-admin

- l.1 · Itinéraire — le tiroir, la visée et le tracé

Fonctions :

`vue` 38 · `changeVue` 39 · `poseVue` 40 · `cadrePlan` 41 · `masque` 42 · `masqueDroite` 43
`masqueHaut` 44 · `changePlan` 45 · `ferme` 46 · `fermeParcours` 47 · `formeParId` 48
`calculeRoute` 66 · `poseTrace` 89 · `marchesIci` 91 · `rayonBout` 96 · `arreteTracage` 129
`peintItineraire` 135 · `lanceTracage` 186 · `dessineItineraire` 211 · `rafraichitBouts` 233
`cadreItineraire` 256 · `champIti` 280 · `fermeSugg` 284 · `montreSugg` 291
`choisitPoint` 325 · `valideSaisie` 334 · `effaceItineraire` 346 · `relance` 374
`montreResultat` 416 · `poseVisee` 560 · `bandeauVisee` 562 · `armeVisee` 585
`finVisee` 603 · `viseItineraire` 619 · `visePoi` 625 · `visePoint` 631
`ouvreItineraire` 660 · `fermeItineraire` 688 · `versItineraire` 698
`versItineraireDe` 701 · `brancheTiroirItineraire` 733

### `modules/tiroir-parcours.mjs` — 446 l. → plan, plan-admin

- l.1 · Le parcours de visite — le geste et le tiroir

Fonctions :

`conf` 40 · `filtre` 41 · `visible` 42 · `basculeParcours` 53 · `verseAuParcours` 98
`retenusPourParcours` 144 · `ajouteToutAuParcours` 169 · `poseToutAuParcours` 192
`brancheParcours` 216 · `rafraichitParcours` 229 · `rangParcours` 259
`remplitParcours` 279 · `ouvreParcours` 368 · `fermeParcours` 380 · `videLeParcours` 391
`brancheTiroirParcours` 423

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

### `modules/vue.mjs` — 569 l. → plan, plan-admin

- l.1 · La vue du plan — cadrage, zoom, libellés à l'échelle, part du plan que
- l.55 · 6. Vue

Fonctions :

`vue` 38 · `changeVue` 40 · `enEdition` 41 · `libelles` 42 · `ordonneDom` 43
`poseEmprise` 53 · `cadrePlan` 72 · `oublieCadre` 73 · `figeTextes` 87 · `rendTextes` 95
`cadrage` 134 · `peintLibelles` 139 · `repeintLibelles` 147 · `detacheLibelles` 151
`rattacheLibelles` 163 · `etireLibelles` 181 · `appliqueVue` 189 · `libellesDeLaVue` 255
`rafraichitVue` 263 · `poseVue` 277 · `mesureBarre` 306 · `masqueHaut` 334 · `masque` 341
`masqueDroite` 378 · `fit` 389 · `stoppeZoom` 427 · `glisseVersVise` 433 · `glisseVers` 476
`rectVisee` 498 · `zoom` 518 · `echelle` 532 · `versPlan` 544 · `brancheVue` 557

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
