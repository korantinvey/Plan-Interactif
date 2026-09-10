<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 936 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.754 · 10. Mode administration
- l.819 · Renommer une zone organisateur
- l.871 · Masquer une zone organisateur

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 123 · `appliqueApparence` 129 · `appliqueCommandes` 189 · `minutesVisite` 217
`trio` 232 · `melange` 242 · `themeSombre` 250 · `appliqueAccent` 264 · `modeleFiche` 312
`appliqueFiche` 319 · `texteCorps` 376 · `standApercu` 391 · `contenuApercu` 409
`apercuFiche` 432 · `ouvreReglages` 494 · `voletPlan` 525 · `nomDuTon` 607
`voletApparence` 611 · `enregistreConf` 704 · `rgbHex` 710 · `hexa` 717 · `luminance` 721
`ecarte` 735 · `joli` 750 · `retireAdmin` 767 · `activeAdmin` 780 · `renommeZone` 829
`enregistreNomZone` 853 · `basculeAffichageZone` 882 · `marqueZonesMasquees` 899
`ecritTableZones` 914

Éléments :

`#pousseConf` · `#razConf`

### `_admin2.html` — 141 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 24 · `entetesApi` 39 · `chargeFond` 62 · `charge` 94

### `_auth-plan.html` — 119 l. → plan-admin.html

- l.2 · Accès à l'administration du plan

Fonctions :

`litLocal` 10 · `configuration` 15 · `normaliseUrlA` 19 · `sessionValide` 35
`ecranAcces` 45

Éléments :

`#accesMsg` · `#aUrl` · `#aCle` · `#aMail` · `#aMdp` · `#aPublic` · `#aOubli` · `#aOk`

### `_config.js` — 15 l. → config.js

### `_console-base.html` — 317 l. → admin-plans.html, rapport.html

- l.10 · Socle commun de la console et du rapport — accès au projet

Fonctions :

`$` 16 · `esc` 17 · `entetes` 31 · `rest` 38 · `ouvreModale` 65 · `fermeModale` 80
`demande` 90 · `confirme` 112 · `ecranConfig` 123 · `normaliseUrl` 159
`ecranConnexion` 178 · `deconnecte` 241 · `signale` 252 · `bloc` 268 · `grille` 277
`idCompte` 295

Éléments :

`#modale` · `#mTitre` · `#mFermer` · `#mCorps` · `#mPied`

### `_console-head.html` — 38 l. → admin-plans.html

Éléments :

`#sousTitre` · `#statut` · `#btnComptes` · `#btnImport` · `#btnExport` · `#btnTheme`
`#btnRecharger` · `#btnNouveau` · `#listeEvts` · `#fiche`

### `_console-js.html` — 2611 l. → admin-plans.html

- l.328 · Provenance des données
- l.455 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 17 · `barreAvancement` 56 · `fonction` 79 · `slugifie` 95 · `courant` 99
`charge` 101 · `chargePlans` 111 · `majEvenement` 116 · `dessineRail` 127 · `champ` 153
`dessineFiche` 178 · `fournisseurUtilise` 390 · `source` 394 · `champCle` 399
`ligneSource` 434 · `origineConferences` 543 · `resumeProvenance` 608 · `resumeSalles` 625
`resumeFiche` 636 · `caseFiche` 679 · `champsPersos` 722 · `criteres` 728 · `ecritFiche` 731
`caseCritere` 746 · `clePerso` 765 · `ajouteChampPerso` 773 · `renommeChampPerso` 784
`retireChampPerso` 802 · `lignesPerso` 850 · `clesCorps` 885 · `ordreEffectif` 899
`libelleCorps` 914 · `champsLus` 956 · `exempleCible` 971 · `valeurApercu` 993
`dessineApercu` 1021 · `panneauOrdre` 1094 · `ligneReglage` 1276 · `ouvreProvenance` 1289
`ouvreSources` 1312 · `ouvreSalles` 1368 · `cadreFiche` 1483 · `ouvreFiche` 1512
`sousTitre` 1662 · `tableauChamps` 1677 · `encode` 1820 · `decode` 1822
`correspondance` 1827 · `sansPrefixe` 1830 · `courte` 1831 · `intitule` 1846
`intituleSuite` 1858 · `separeValeurs` 1872 · `champOrigine` 1884 · `majLiens` 2113
`majIntegration` 2140 · `majMsgSync` 2147 · `synchronise` 2161 · `dupliquer` 2204
`litMonProfil` 2289 · `RETOUR_MDP` 2300 · `ouvreComptes` 2302 · `videEcran` 2579
`dessine` 2584 · `demarre` 2599

Éléments :

`#lienPublic` · `#lienAdmin` · `#lienRapport` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#btnSync` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 499 l. → console.css

- l.443 · Page de rapport

### `_dessin.html` — 1062 l. → plan-admin.html, plan-smcl.html, plan.html

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
`activeCalque` 947 · `montreRoleIti` 989 · `creeCalque` 1020 · `demandeNom` 1033
`renommeCalque` 1052

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

### `_head.html` — 1861 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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
`#dCode` · `#dNeuf` · `#dVis` · `#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg`
`#dOngNb` · `#dBody` · `#parcours` · `#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume`
`#pCorps` · `#jCorps` · `#pPied` · `#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire`
`#jRetour` · `#itineraire` · `#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA`
`#iSugg` · `#iEchange` · `#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat`
`#videItineraire`

### `_index.html` — 30 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 2124 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 86 · `enveloppe` 95 · `oublieGrilles` 138 · `calquesDe` 141 · `reperesDe` 146
`cleRoleIti` 196 · `roleIti` 197 · `nomRoleIti` 198 · `formesRole` 212 · `obstaclesPmr` 236
`grille` 263 · `distanceAuMur` 324 · `nappePrincipale` 366 · `caseDe` 399 · `centreCase` 404
`empriseDe` 426 · `accrocheDepuis` 458 · `versLeMilieu` 513 · `accroche` 540 · `Tas` 555
`travail` 599 · `cherche` 617 · `distancesDepuis` 683 · `distancesMulti` 697 · `reduit` 732
`longueur` 743 · `longueurDehors` 759 · `nettoie` 789 · `oublieFaces` 812
`facesLibres` 814 · `amorce` 888 · `faceDeSortie` 915 · `accesDe` 945 · `couplesAcces` 980
`troncon` 1000 · `pointObjet` 1032 · `pointRepere` 1039 · `candidats` 1048
`pointSaisi` 1074 · `portesDe` 1091 · `versPorte` 1096 · `typeLiaison` 1151
`nomRepere` 1157 · `oublieLiaisons` 1175 · `lienEcrits` 1187 · `ecritLiens` 1196
`annuaireLiaisons` 1201 · `liensDe` 1233 · `coutLiaison` 1253 · `passagePraticable` 1260
`passagesDe` 1268 · `sortiesDe` 1278 · `plansRelies` 1286 · `balayage` 1310
`distanceDepuis` 1324 · `cheminLiaisons` 1351 · `routeParLiaisons` 1435 · `routeEntre` 1471
`calculeRoute` 1510 · `couleurNappe` 1536 · `rafraichitApercu` 1542 · `marchesIci` 1583
`rayonBout` 1588 · `dessineItineraire` 1593 · `rafraichitBouts` 1637
`cadreItineraire` 1652 · `champIti` 1675 · `ecritDistance` 1679 · `ecritDuree` 1687
`fermeSugg` 1692 · `montreSugg` 1699 · `choisitPoint` 1731 · `valideSaisie` 1740
`effaceItineraire` 1750 · `relance` 1770 · `phraseLiaison` 1813 · `montreResultat` 1827
`bandeauVisee` 1958 · `armeVisee` 1970 · `finVisee` 1978 · `viseItineraire` 1990
`visePoi` 1996 · `visePoint` 2002 · `ouvreItineraire` 2023 · `fermeItineraire` 2040
`versItineraire` 2050 · `versItineraireDe` 2053

### `_journee.html` — 893 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 237 · `calculeJournee` 333 · `rangJournee` 521 · `lienJournee` 533
`arretJournee` 540 · `remplitJournee` 565 · `appliqueVueParcours` 703 · `traceJournee` 729
`montreJournee` 737 · `perimeJournee` 750 · `ouvreOrganisation` 759 · `lanceJournee` 860

### `_js.html` — 2104 l. → plan-admin.html, plan-smcl.html, plan.html

- l.44 · 1. Index global — la recherche porte sur tous les pavillons
- l.184 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.275 · 3. Rendu du pavillon courant
- l.342 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.399 · 5. Recherche et secteurs — sans mot-clé ni critère retenu on reste sur le
- l.1057 · 6. Vue
- l.1156 · 7. Sélection et fiche
- l.1779 · 8. Interactions du plan
- l.1950 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 41 · `indexe` 47 · `largeur` 189 · `decoupe` 208 · `habille` 221
`lignesSvg` 232 · `ligneCode` 253 · `monteHabillage` 281 · `montePlan` 298 · `onglets` 327
`changePlan` 334 · `ancre` 350 · `place` 351 · `libelles` 353 · `indexeSecteurs` 420
`secteursMontres` 433 · `couleurConf` 437 · `hslHex` 441 · `couleurSecteur` 459
`BANDES` 478 · `majFondus` 486 · `pastilleSecteur` 524 · `coloreSecteurs` 537
`appliqueSecteurs` 570 · `filtreTheme` 587 · `themeFiltrable` 663 · `clesCriteres` 679
`libelleCritere` 686 · `separeValeurs` 694 · `valeursCritere` 711 · `texteCriteres` 724
`indexeCriteres` 737 · `dansCriteres` 764 · `critereActif` 772 · `basculeCritere` 774
`videCriteres` 782 · `nCriteres` 789 · `majCriteres` 798 · `ouvreCriteres` 856
`filtre` 969 · `critParSociete` 973 · `visible` 976 · `releveHotes` 988
`visibleSurPlan` 996 · `appliqueFiltre` 1000 · `liste` 1009 · `appliqueVue` 1060
`rafraichitVue` 1081 · `poseVue` 1093 · `masque` 1111 · `fit` 1131 · `zoom` 1143
`echelle` 1148 · `ETROIT` 1162 · `anime` 1164 · `noeud` 1181 · `canalPlan` 1186
`select` 1194 · `centre` 1214 · `centrePoint` 1218 · `montre` 1233 · `libelleCorps` 1262
`ordreCorps` 1274 · `momentLocal` 1311 · `programme` 1334 · `jourLong` 1367
`ficheConf` 1378 · `lien` 1472 · `ecarteClicFantome` 1489 · `nomSociete` 1498
`societes` 1511 · `choisitExposant` 1522 · `ouvre` 1558 · `ferme` 1759 · `onglet` 1769
`milieu` 1799 · `commencePince` 1805 · `suitPince` 1819 · `mesureTiroir` 1961
`montreTiroir` 1964

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

### `_motdepasse.html` — 242 l. → motdepasse.html

- l.54 · Poser un mot de passe

Fonctions :

`$` 70 · `CFG` 72 · `dit` 80 · `fragment` 86 · `garde` 93 · `lit` 97 · `demandeLien` 170
`ouvreSaisie` 179

Éléments :

`#titre` · `#intro` · `#formMdp` · `#mdp1` · `#mdp2` · `#poser` · `#formMail` · `#mail`
`#envoyer` · `#msg` · `#apres` · `#versConsole`

### `_parcours.html` — 352 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 50 · `signetParcours` 68 · `boutonParcours` 74
`rafraichitMarque` 79 · `brancheParcours` 91 · `calqueMarques` 123 · `dessineMarques` 139
`marqueParcours` 169 · `rafraichitParcours` 183 · `instantConf` 207 · `cleTemps` 211
`jourCourt` 217 · `rangParcours` 221 · `groupeParcours` 237 · `remplitParcours` 246
`ouvreParcours` 308 · `fermeParcours` 320

### `_pile.html` — 291 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.194 · Repères

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`construitPanneau` 60 · `sectionSelection` 208 · `ligneCouleur` 233 · `rangSecteur` 253
`rangSous` 265 · `defautCouleur` 287

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

### `supabase/functions/plan-public/index.ts` — 331 l.

`cors` 48 · `db` 65 · `masquesDe` 84 · `masquesDuPlan` 93

### `supabase/functions/sync-evenement/index.ts` — 1102 l.

`cors` 35 · `client` 73 · `gaia` 80 · `libellesChoix` 91 · `fournisseur` 116 · `range` 152
`champsKlipso` 173 · `hebergee` 1060 · `nettoieUrl` 1078 · `groupeTextes` 1088

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
