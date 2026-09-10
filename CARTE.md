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

### `_console-js.html` — 2097 l. → admin-plans.html

- l.321 · Provenance des données
- l.448 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 17 · `barreAvancement` 56 · `fonction` 79 · `slugifie` 95 · `courant` 99
`charge` 101 · `chargePlans` 108 · `majEvenement` 113 · `dessineRail` 124 · `champ` 150
`dessineFiche` 175 · `fournisseurUtilise` 383 · `source` 387 · `champCle` 392
`ligneSource` 427 · `origineConferences` 532 · `resumeProvenance` 597 · `resumeSalles` 614
`resumeFiche` 625 · `caseFiche` 668 · `champsPersos` 711 · `criteres` 717 · `ecritFiche` 720
`caseCritere` 735 · `clePerso` 754 · `ajouteChampPerso` 762 · `renommeChampPerso` 773
`retireChampPerso` 791 · `lignesPerso` 839 · `clesCorps` 874 · `ordreEffectif` 888
`libelleCorps` 903 · `panneauOrdre` 926 · `ligneReglage` 1075 · `ouvreProvenance` 1088
`ouvreSources` 1111 · `ouvreSalles` 1167 · `cadreFiche` 1280 · `ouvreFiche` 1309
`sousTitre` 1454 · `tableauChamps` 1469 · `encode` 1612 · `decode` 1614
`correspondance` 1619 · `sansPrefixe` 1622 · `courte` 1623 · `intitule` 1638
`intituleSuite` 1650 · `separeValeurs` 1664 · `champOrigine` 1676 · `majLiens` 1905
`majIntegration` 1932 · `majMsgSync` 1939 · `synchronise` 1953 · `dupliquer` 1996
`videEcran` 2070 · `dessine` 2075 · `demarre` 2085

Éléments :

`#lienPublic` · `#lienAdmin` · `#lienRapport` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#btnSync` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 451 l. → console.css

- l.395 · Page de rapport

### `_dessin.html` — 1056 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`enAttente` 28 · `marqueAttente` 30 · `mesCalques` 38 · `enregistreDessins` 39
`instantane` 66 · `memorise` 67 · `restaure` 72 · `annule` 81 · `refais` 93
`trouveCalque` 95 · `nouvelId` 96 · `cheminArrondi` 114 · `cheminForme` 154
`dessineDessins` 165 · `versPlan` 202 · `apercu` 208 · `apercuGuide` 220
`toleranceTrace` 244 · `aimanteContour` 249 · `rayonContour` 252 · `redresseTrace` 271
`traceGuide` 305 · `fermeIci` 312 · `ajouteForme` 317 · `pictoDe` 413 · `nomTypeRepere` 451
`pictoForme` 462 · `traceRepere` 479 · `cartouchePoi` 539 · `ouvrePoi` 600
`mesureCartouche` 663 · `eclairePoi` 670 · `signale` 681 · `calquePourImage` 695
`poseImage` 708 · `importeImage` 721 · `dessinPointerDown` 769 · `dessinPointerMove` 825
`dessinPointerUp` 850 · `termineTrace` 870 · `aide` 879 · `choisitOutil` 898
`activeCalque` 947 · `montreRoleIti` 983 · `creeCalque` 1014 · `demandeNom` 1027
`renommeCalque` 1046

Éléments :

`#dPaneInfos` · `#dGo` · `#dItin`

### `_edition.html` — 430 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 153 · `ecritDesDeuxCotes` 175
`changeLien` 187 · `changeDureeLien` 203 · `majLiens` 220 · `etiquetteStand` 264
`remplitListeStands` 269 · `standSaisi` 278 · `appliqueLiaison` 288 · `appliqueTexte` 299
`appliqueRayon` 309 · `appliquePicto` 319 · `supprimeForme` 337 · `editionPointerDown` 347
`editionPointerMove` 392 · `editionPointerUp` 423

### `_head.html` — 1510 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#side`
`#poignee` · `#q` · `#btnFiltres` · `#nFiltres` · `#actifs` · `#countTxt` · `#list`
`#stage` · `#plan` · `#couches` · `#zones` · `#stands` · `#labels` · `#zIn` · `#zOut`
`#zFit` · `#scaleBar` · `#scaleTxt` · `#poi` · `#viseur` · `#viseurTxt` · `#viseurStop`
`#outils` · `#outilsCalque` · `#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide`
`#voirNappe` · `#contourReg` · `#contourRayon` · `#contourAimant` · `#texteADessiner`
`#repereType` · `#repereTexte` · `#fichierImage` · `#choisirImage` · `#vignette`
`#elemSel` · `#elemType` · `#elemSupprimer` · `#elemPicto` · `#elemTexte` · `#elemLiens`
`#elemLiensListe` · `#elemLienAjout` · `#elemLienAide` · `#elemTailleBloc` · `#elemTaille`
`#elemRayonBloc` · `#elemRayon` · `#elemStand` · `#listeStands` · `#outilsAide`
`#annuleDernier` · `#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel`
`#pile` · `#voile` · `#detail` · `#dMarque` · `#closeDetail` · `#dKind` · `#dName` · `#dRen`
`#dCode` · `#dNeuf` · `#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb`
`#dBody` · `#parcours` · `#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps`
`#jCorps` · `#pPied` · `#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire` · `#jRetour`
`#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA` · `#iSugg`
`#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

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

### `_js.html` — 2059 l. → plan-admin.html, plan-smcl.html, plan.html

- l.44 · 1. Index global — la recherche porte sur tous les pavillons
- l.184 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.275 · 3. Rendu du pavillon courant
- l.338 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.394 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1054 · 6. Vue
- l.1153 · 7. Sélection et fiche
- l.1737 · 8. Interactions du plan
- l.1908 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 41 · `indexe` 47 · `largeur` 189 · `decoupe` 208 · `habille` 221
`lignesSvg` 232 · `ligneCode` 253 · `monteHabillage` 281 · `montePlan` 298 · `onglets` 323
`changePlan` 330 · `ancre` 346 · `place` 347 · `libelles` 349 · `indexeSecteurs` 415
`secteursMontres` 428 · `couleurConf` 432 · `hslHex` 436 · `couleurSecteur` 454
`BANDES` 473 · `majFondus` 481 · `pastilleSecteur` 519 · `coloreSecteurs` 532
`appliqueSecteurs` 565 · `filtreTheme` 582 · `themeFiltrable` 658 · `clesCriteres` 674
`libelleCritere` 681 · `separeValeurs` 689 · `valeursCritere` 706 · `texteCriteres` 719
`indexeCriteres` 732 · `dansCriteres` 759 · `critereActif` 767 · `basculeCritere` 769
`videCriteres` 777 · `nCriteres` 784 · `majCriteres` 793 · `ouvreCriteres` 851
`filtre` 964 · `critParSociete` 968 · `visible` 971 · `releveHotes` 983
`visibleSurPlan` 991 · `appliqueFiltre` 995 · `liste` 1004 · `appliqueVue` 1057
`rafraichitVue` 1078 · `poseVue` 1090 · `masque` 1108 · `fit` 1128 · `zoom` 1140
`echelle` 1145 · `ETROIT` 1159 · `anime` 1161 · `noeud` 1178 · `canalPlan` 1183
`select` 1191 · `centre` 1211 · `centrePoint` 1215 · `montre` 1230 · `ordreCorps` 1256
`momentLocal` 1293 · `programme` 1316 · `jourLong` 1346 · `ficheConf` 1357 · `lien` 1451
`ecarteClicFantome` 1468 · `nomSociete` 1477 · `societes` 1490 · `choisitExposant` 1501
`ouvre` 1537 · `ferme` 1717 · `onglet` 1727 · `milieu` 1757 · `commencePince` 1763
`suitPince` 1777 · `mesureTiroir` 1919 · `montreTiroir` 1922

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

### `supabase/functions/plan-public/index.ts` — 315 l.

`cors` 48 · `db` 65 · `masquesDe` 84 · `masquesDuPlan` 93

### `supabase/functions/sync-evenement/index.ts` — 1091 l.

`cors` 35 · `client` 73 · `gaia` 80 · `libellesChoix` 91 · `fournisseur` 116 · `range` 152
`champsKlipso` 173 · `hebergee` 1049 · `nettoieUrl` 1067 · `groupeTextes` 1077

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
