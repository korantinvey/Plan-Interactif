<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 493 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.347 · 10. Mode administration
- l.412 · Renommer une zone organisateur

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 123 · `appliqueApparence` 129 · `appliqueCommandes` 187 · `minutesVisite` 215
`ouvreReglages` 227 · `enregistreConf` 297 · `rgbHex` 303 · `hexa` 310 · `luminance` 314
`ecarte` 328 · `joli` 343 · `retireAdmin` 360 · `activeAdmin` 373 · `renommeZone` 422
`enregistreNomZone` 446

Éléments :

`#pousseConf` · `#razConf`

### `_admin2.html` — 141 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 24 · `entetesApi` 39 · `chargeFond` 62 · `charge` 94

### `_auth-plan.html` — 118 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOk`

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 292 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 16 · `esc` 17 · `entetes` 31 · `rest` 38 · `ouvreModale` 65 · `fermeModale` 80
`demande` 90 · `confirme` 112 · `ecranConfig` 123 · `normaliseUrl` 159
`ecranConnexion` 178 · `deconnecte` 240 · `signale` 251 · `bloc` 267 · `grille` 276

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 37 l. → admin-plans.html

Éléments :

`#sousTitre` · `#statut` · `#btnImport` · `#btnExport` · `#btnTheme` · `#btnRecharger`
`#btnNouveau` · `#listeEvts` · `#fiche`

### `_console-js.html` — 1836 l. → admin-plans.html

- l.321 · Provenance des données
- l.448 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 17 · `barreAvancement` 56 · `fonction` 79 · `slugifie` 95 · `courant` 99
`charge` 101 · `chargePlans` 108 · `majEvenement` 113 · `dessineRail` 124 · `champ` 150
`dessineFiche` 175 · `fournisseurUtilise` 383 · `source` 387 · `champCle` 392
`ligneSource` 427 · `origineConferences` 531 · `resumeProvenance` 596 · `resumeSalles` 613
`resumeFiche` 624 · `caseFiche` 665 · `champsPersos` 708 · `criteres` 714 · `ecritFiche` 717
`caseCritere` 732 · `clePerso` 751 · `ajouteChampPerso` 759 · `renommeChampPerso` 770
`retireChampPerso` 788 · `lignesPerso` 833 · `ligneReglage` 853 · `ouvreProvenance` 866
`ouvreSources` 889 · `ouvreSalles` 945 · `cadreFiche` 1058 · `ouvreFiche` 1087
`sousTitre` 1218 · `tableauChamps` 1233 · `encode` 1376 · `decode` 1378
`correspondance` 1383 · `sansPrefixe` 1386 · `courte` 1387 · `intitule` 1402
`intituleSuite` 1414 · `champOrigine` 1427 · `majLiens` 1644 · `majIntegration` 1671
`majMsgSync` 1678 · `synchronise` 1692 · `dupliquer` 1735 · `videEcran` 1809
`dessine` 1814 · `demarre` 1824

Éléments :

`#lienPublic` · `#lienAdmin` · `#lienRapport` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#btnSync` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 424 l. → console.css

- l.368 · Page de rapport

### `_dessin.html` — 870 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 30 · `mesCalques` 38 · `enregistreDessins` 39
`instantane` 66 · `memorise` 67 · `restaure` 72 · `annule` 81 · `refais` 92
`trouveCalque` 94 · `nouvelId` 95 · `cheminForme` 98 · `dessineDessins` 108 · `versPlan` 145
`apercu` 151 · `ajouteForme` 162 · `pictoDe` 258 · `nomTypeRepere` 296 · `pictoForme` 307
`traceRepere` 324 · `cartouchePoi` 384 · `ouvrePoi` 445 · `mesureCartouche` 508
`eclairePoi` 515 · `signale` 526 · `calquePourImage` 540 · `poseImage` 553
`importeImage` 566 · `dessinPointerDown` 614 · `dessinPointerMove` 654
`dessinPointerUp` 670 · `termineTrace` 690 · `aide` 697 · `choisitOutil` 714
`activeCalque` 761 · `montreRoleIti` 797 · `creeCalque` 828 · `demandeNom` 841
`renommeCalque` 860

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 410 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 142 · `ecritDesDeuxCotes` 164
`changeLien` 176 · `changeDureeLien` 192 · `majLiens` 209 · `etiquetteStand` 253
`remplitListeStands` 258 · `standSaisi` 267 · `appliqueLiaison` 277 · `appliqueTexte` 288
`appliquePicto` 299 · `supprimeForme` 317 · `editionPointerDown` 327
`editionPointerMove` 372 · `editionPointerUp` 403

### `_head.html` — 1433 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#side`
`#poignee` · `#q` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#secteurs` · `#countTxt`
`#list` · `#stage` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#zIn`
`#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt`
`#viseurStop` · `#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti`
`#roleAide` · `#voirNappe` · `#texteADessiner` · `#repereType` · `#repereTexte`
`#fichierImage` · `#choisirImage` · `#vignette` · `#elemSel` · `#elemType`
`#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens` · `#elemLiensListe`
`#elemLienAjout` · `#elemLienAide` · `#elemTailleBloc` · `#elemTaille` · `#elemStand`
`#listeStands` · `#outilsAide` · `#annuleDernier` · `#modale` · `#mTitre` · `#mFermer`
`#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail` · `#dMarque`
`#closeDetail` · `#dKind` · `#dName` · `#dRen` · `#dCode` · `#dNeuf` · `#dPartage`
`#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps` · `#jCorps` · `#pPied`
`#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire` · `#jRetour` · `#itineraire`
`#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange`
`#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

### `_index.html` — 30 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 2120 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 86 · `enveloppe` 95 · `oublieGrilles` 138 · `calquesDe` 141 · `reperesDe` 146
`cleRoleIti` 196 · `roleIti` 197 · `nomRoleIti` 198 · `formesRole` 208 · `obstaclesPmr` 232
`grille` 259 · `distanceAuMur` 320 · `nappePrincipale` 362 · `caseDe` 395 · `centreCase` 400
`empriseDe` 422 · `accrocheDepuis` 454 · `versLeMilieu` 509 · `accroche` 536 · `Tas` 551
`travail` 595 · `cherche` 613 · `distancesDepuis` 679 · `distancesMulti` 693 · `reduit` 728
`longueur` 739 · `longueurDehors` 755 · `nettoie` 785 · `oublieFaces` 808
`facesLibres` 810 · `amorce` 884 · `faceDeSortie` 911 · `accesDe` 941 · `couplesAcces` 976
`troncon` 996 · `pointObjet` 1028 · `pointRepere` 1035 · `candidats` 1044
`pointSaisi` 1070 · `portesDe` 1087 · `versPorte` 1092 · `typeLiaison` 1147
`nomRepere` 1153 · `oublieLiaisons` 1171 · `lienEcrits` 1183 · `ecritLiens` 1192
`annuaireLiaisons` 1197 · `liensDe` 1229 · `coutLiaison` 1249 · `passagePraticable` 1256
`passagesDe` 1264 · `sortiesDe` 1274 · `plansRelies` 1282 · `balayage` 1306
`distanceDepuis` 1320 · `cheminLiaisons` 1347 · `routeParLiaisons` 1431 · `routeEntre` 1467
`calculeRoute` 1506 · `couleurNappe` 1532 · `rafraichitApercu` 1538 · `marchesIci` 1579
`rayonBout` 1584 · `dessineItineraire` 1589 · `rafraichitBouts` 1633
`cadreItineraire` 1648 · `champIti` 1671 · `ecritDistance` 1675 · `ecritDuree` 1683
`fermeSugg` 1688 · `montreSugg` 1695 · `choisitPoint` 1727 · `valideSaisie` 1736
`effaceItineraire` 1746 · `relance` 1766 · `phraseLiaison` 1809 · `montreResultat` 1823
`bandeauVisee` 1954 · `armeVisee` 1966 · `finVisee` 1974 · `viseItineraire` 1986
`visePoi` 1992 · `visePoint` 1998 · `ouvreItineraire` 2019 · `fermeItineraire` 2036
`versItineraire` 2046 · `versItineraireDe` 2049

### `_journee.html` — 893 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 237 · `calculeJournee` 333 · `rangJournee` 521 · `lienJournee` 533
`arretJournee` 540 · `remplitJournee` 565 · `appliqueVueParcours` 703 · `traceJournee` 729
`montreJournee` 737 · `perimeJournee` 750 · `ouvreOrganisation` 759 · `lanceJournee` 860

### `_js.html` — 1811 l. → plan-admin.html, plan-smcl.html, plan.html

- l.44 · 1. Index global — la recherche porte sur tous les pavillons
- l.176 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.267 · 3. Rendu du pavillon courant
- l.330 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.386 · 5. Recherche et secteurs — sans mot-clé ni secteur retenu on reste sur le
- l.877 · 6. Vue
- l.976 · 7. Sélection et fiche
- l.1496 · 8. Interactions du plan
- l.1667 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 41 · `indexe` 47 · `largeur` 181 · `decoupe` 200 · `habille` 213
`lignesSvg` 224 · `ligneCode` 245 · `monteHabillage` 273 · `montePlan` 290 · `onglets` 315
`changePlan` 322 · `ancre` 338 · `place` 339 · `libelles` 341 · `indexeSecteurs` 407
`secteursMontres` 420 · `couleurConf` 424 · `hslHex` 428 · `couleurSecteur` 446
`chipsSecteurs` 456 · `coloreSecteurs` 479 · `appliqueSecteurs` 506 · `clesCriteres` 556
`libelleCritere` 562 · `valeursCritere` 570 · `texteCriteres` 583 · `indexeCriteres` 596
`dansCriteres` 619 · `critereActif` 627 · `basculeCritere` 629 · `videCriteres` 637
`nCriteres` 644 · `majCriteres` 653 · `ouvreCriteres` 706 · `dansSecteurs` 795
`filtre` 797 · `visible` 799 · `releveHotes` 811 · `visibleSurPlan` 819
`appliqueFiltre` 823 · `liste` 832 · `appliqueVue` 880 · `rafraichitVue` 901 · `poseVue` 913
`masque` 931 · `fit` 951 · `zoom` 963 · `echelle` 968 · `ETROIT` 982 · `anime` 984
`noeud` 1001 · `canalPlan` 1006 · `select` 1014 · `centre` 1034 · `centrePoint` 1038
`montre` 1053 · `momentLocal` 1079 · `programme` 1102 · `jourLong` 1132 · `ficheConf` 1143
`lien` 1237 · `ecarteClicFantome` 1254 · `nomSociete` 1263 · `societes` 1276
`choisitExposant` 1287 · `ouvre` 1323 · `ferme` 1476 · `onglet` 1486 · `milieu` 1516
`commencePince` 1522 · `suitPince` 1536 · `mesureTiroir` 1678

Éléments :

`#data` · `#dGo` · `#dItin`

### `_mesure.html` — 140 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 13. Mesure d'utilisation

Fonctions :

`jetonMesure` 25 · `jetonRetenu` 46 · `envoieMesures` 79 · `mesure` 111

### `_modales.html` — 135 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Fenêtres modales : confirmation et réorganisation des calques

Fonctions :

`ouvreModale` 5 · `fermeModale` 19 · `confirme` 26 · `deplaceVers` 44 · `versExtremite` 56
`remplitOrdre` 64 · `ouvreOrdre` 126

### `_parcours.html` — 352 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 50 · `signetParcours` 68 · `boutonParcours` 74
`rafraichitMarque` 79 · `brancheParcours` 91 · `calqueMarques` 123 · `dessineMarques` 139
`marqueParcours` 169 · `rafraichitParcours` 183 · `instantConf` 207 · `cleTemps` 211
`jourCourt` 217 · `rangParcours` 221 · `groupeParcours` 237 · `remplitParcours` 246
`ouvreParcours` 308 · `fermeParcours` 320

### `_pile.html` — 288 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.191 · Repères

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`construitPanneau` 60 · `sectionSelection` 205 · `ligneCouleur` 230 · `rangSecteur` 250
`rangSous` 262 · `defautCouleur` 284

### `_pousse.html` — 145 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pousser la configuration

Fonctions :

`majAttente` 25 · `accesBase` 36 · `base` 45 · `reglagesSeuls` 63 · `pousseConfiguration` 67

### `_rapport-head.html` — 27 l. → rapport.html

Éléments :

`#choixEvt` · `#choixPeriode` · `#statut` · `#lienConsole` · `#btnRecharger` · `#btnTheme`
`#rapport`

### `_rapport-js.html` — 310 l. → rapport.html

- l.2 · Rapport d'utilisation

Fonctions :

`nb` 45 · `courant` 46 · `chargeEvenements` 51 · `debutPeriode` 61 · `chargeRapport` 69
`chiffre` 80 · `barres` 99 · `jours` 126 · `dessineRapport` 147 · `dessineBarre` 245
`rafraichit` 263 · `videEcran` 282 · `demarre` 296

Éléments :

`#lienPublic`

## Dans `web/`, mais que la construction ne produit pas

Ces fichiers sont servis sans qu'aucune source ne les regénère : les
corriger dans `outils/gabarit/` ne les changera pas.

- `web/plan-salon.html`

## `supabase/functions/` — synchronisation Klipso et API publique

### `supabase/functions/_partage/champs.ts` — 356 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/eventmaker.ts` — 745 l.

`grapheJson` 145 · `enParallele` 595 · `texteSeul` 615 · `champs` 694 · `separe` 714

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

### `supabase/functions/plan-public/index.ts` — 315 l.

`cors` 48 · `db` 65 · `masquesDe` 84 · `masquesDuPlan` 93

### `supabase/functions/sync-evenement/index.ts` — 1094 l.

`cors` 35 · `client` 73 · `gaia` 80 · `libellesChoix` 91 · `fournisseur` 116 · `range` 156
`champsKlipso` 177 · `hebergee` 1052 · `nettoieUrl` 1070 · `groupeTextes` 1080

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
