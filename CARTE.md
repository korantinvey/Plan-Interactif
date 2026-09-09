<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 480 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.335 · 10. Mode administration
- l.399 · Renommer une zone organisateur

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 61 · `jeton` 62 · `sousCle` 63
`styleFond` 65 · `sousCalques` 86 · `styleDataGroupe` 95 · `appliqueCouleursData` 97
`styleData` 113 · `appliqueApparence` 119 · `appliqueCommandes` 177 · `minutesVisite` 205
`ouvreReglages` 217 · `enregistreConf` 285 · `rgbHex` 291 · `hexa` 298 · `luminance` 302
`ecarte` 316 · `joli` 331 · `retireAdmin` 348 · `activeAdmin` 361 · `renommeZone` 409
`enregistreNomZone` 433

Éléments :

`#pousseConf` · `#razConf`

### `_admin2.html` — 139 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 22 · `entetesApi` 37 · `chargeFond` 60 · `charge` 92

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

### `_console-js.html` — 1595 l. → admin-plans.html

- l.321 · Provenance des données
- l.448 · Contenu de la fiche détail

Fonctions :

`fluxFonction` 17 · `barreAvancement` 56 · `fonction` 79 · `slugifie` 95 · `courant` 99
`charge` 101 · `chargePlans` 108 · `majEvenement` 113 · `dessineRail` 124 · `champ` 150
`dessineFiche` 175 · `fournisseurUtilise` 383 · `source` 387 · `champCle` 392
`ligneSource` 427 · `origineConferences` 525 · `resumeProvenance` 590 · `resumeSalles` 607
`resumeFiche` 618 · `caseFiche` 651 · `ligneReglage` 683 · `ouvreProvenance` 696
`ouvreSources` 719 · `ouvreSalles` 775 · `cadreFiche` 888 · `ouvreFiche` 917
`sousTitre` 1016 · `tableauChamps` 1031 · `encode` 1135 · `decode` 1137
`correspondance` 1142 · `sansPrefixe` 1145 · `courte` 1146 · `intitule` 1161
`intituleSuite` 1173 · `champOrigine` 1186 · `majLiens` 1403 · `majIntegration` 1430
`majMsgSync` 1437 · `synchronise` 1451 · `dupliquer` 1494 · `videEcran` 1568
`dessine` 1573 · `demarre` 1583

Éléments :

`#lienPublic` · `#lienAdmin` · `#lienRapport` · `#btnSources` · `#btnEtat` · `#btnDupliquer`
`#btnSupprimer` · `#btnSync` · `#msgSync` · `#fragment` · `#btnCopier`

### `_console.css` — 399 l. → console.css

- l.343 · Page de rapport

### `_dessin.html` — 766 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`mesCalques` 14 · `enregistreDessins` 15 · `instantane` 39 · `memorise` 40 · `restaure` 45
`annule` 54 · `refais` 65 · `trouveCalque` 67 · `nouvelId` 68 · `cheminForme` 71
`dessineDessins` 81 · `versPlan` 118 · `apercu` 124 · `ajouteForme` 135 · `pictoDe` 231
`nomTypeRepere` 269 · `pictoForme` 280 · `traceRepere` 297 · `cartouchePoi` 346
`mesureCartouche` 404 · `eclairePoi` 411 · `signale` 422 · `calquePourImage` 436
`poseImage` 449 · `importeImage` 462 · `dessinPointerDown` 510 · `dessinPointerMove` 550
`dessinPointerUp` 566 · `termineTrace` 586 · `aide` 593 · `choisitOutil` 610
`activeCalque` 657 · `montreRoleIti` 693 · `creeCalque` 724 · `demandeNom` 737
`renommeCalque` 756

### `_edition.html` — 376 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `candidatsLiaison` 138 · `changeLien` 160
`majLiens` 183 · `etiquetteStand` 219 · `remplitListeStands` 224 · `standSaisi` 233
`appliqueLiaison` 243 · `appliqueTexte` 254 · `appliquePicto` 265 · `supprimeForme` 283
`editionPointerDown` 293 · `editionPointerMove` 338 · `editionPointerUp` 369

### `_head.html` — 1318 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#side`
`#poignee` · `#q` · `#secteurs` · `#countTxt` · `#list` · `#stage` · `#plan` · `#couches`
`#zones` · `#stands` · `#labels` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt`
`#poi` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#outils` · `#outilsCalque`
`#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide` · `#voirNappe`
`#texteADessiner` · `#repereType` · `#repereTexte` · `#fichierImage` · `#choisirImage`
`#vignette` · `#elemSel` · `#elemType` · `#elemSupprimer` · `#elemPicto` · `#elemTexte`
`#elemLiens` · `#elemLiensListe` · `#elemLienAjout` · `#elemLienAide` · `#elemTailleBloc`
`#elemTaille` · `#elemStand` · `#listeStands` · `#outilsAide` · `#annuleDernier` · `#modale`
`#mTitre` · `#mFermer` · `#mCorps` · `#mPied` · `#panel` · `#pile` · `#voile` · `#detail`
`#dMarque` · `#closeDetail` · `#dKind` · `#dName` · `#dRen` · `#dCode` · `#dNeuf`
`#dPartage` · `#dOnglets` · `#dOngInfo` · `#dOngProg` · `#dOngNb` · `#dBody` · `#parcours`
`#closeParcours` · `#pEyebrow` · `#pTitre` · `#pResume` · `#pCorps` · `#jCorps` · `#pPied`
`#btnJournee` · `#videParcours` · `#jPied` · `#jRefaire` · `#jRetour` · `#itineraire`
`#closeItineraire` · `#iResume` · `#iDepart` · `#iViseA` · `#iSugg` · `#iEchange`
`#iArrivee` · `#iViseB` · `#iPmr` · `#iResultat` · `#videItineraire`

### `_index.html` — 30 l. → index.html

Éléments :

`#secours`

### `_itineraire.html` — 1705 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 80 · `enveloppe` 89 · `oublieGrilles` 132 · `calquesDe` 135 · `reperesDe` 140
`cleRoleIti` 190 · `roleIti` 191 · `nomRoleIti` 192 · `formesRole` 202 · `obstaclesPmr` 226
`grille` 253 · `distanceAuMur` 314 · `nappePrincipale` 356 · `caseDe` 389 · `centreCase` 394
`accroche` 413 · `Tas` 452 · `travail` 496 · `cherche` 514 · `distancesDepuis` 580
`reduit` 613 · `longueur` 624 · `nettoie` 628 · `amorce` 652 · `troncon` 671
`pointObjet` 695 · `pointRepere` 702 · `candidats` 709 · `pointSaisi` 735 · `portesDe` 752
`versPorte` 757 · `typeLiaison` 811 · `nomLiaison` 815 · `oublieLiaisons` 833
`annuaireLiaisons` 835 · `liensDe` 860 · `passagePraticable` 867 · `passagesDe` 875
`sortiesDe` 885 · `plansRelies` 893 · `balayage` 917 · `distanceDepuis` 929
`cheminLiaisons` 956 · `routeParLiaisons` 1032 · `routeEntre` 1068 · `calculeRoute` 1107
`couleurNappe` 1133 · `rafraichitApercu` 1139 · `marchesIci` 1180 · `rayonBout` 1185
`dessineItineraire` 1190 · `rafraichitBouts` 1234 · `cadreItineraire` 1249 · `champIti` 1272
`ecritDistance` 1276 · `ecritDuree` 1284 · `fermeSugg` 1289 · `montreSugg` 1296
`choisitPoint` 1328 · `valideSaisie` 1337 · `effaceItineraire` 1347 · `relance` 1367
`phraseLiaison` 1410 · `montreResultat` 1421 · `bandeauVisee` 1552 · `armeVisee` 1564
`finVisee` 1572 · `viseItineraire` 1584 · `ouvreItineraire` 1607 · `fermeItineraire` 1624
`versItineraire` 1634

### `_journee.html` — 890 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 51 · `finInstant` 52 · `ecritHeure` 54 · `ecritMinutes` 59 · `joursSalon` 67
`jourPropose` 78 · `pointConf` 93 · `departsProposes` 111 · `matriceJournee` 135
`rangeJournee` 236 · `calculeJournee` 332 · `rangJournee` 518 · `lienJournee` 530
`arretJournee` 537 · `remplitJournee` 562 · `appliqueVueParcours` 700 · `traceJournee` 726
`montreJournee` 734 · `perimeJournee` 747 · `ouvreOrganisation` 756 · `lanceJournee` 857

### `_js.html` — 1481 l. → plan-admin.html, plan-smcl.html, plan.html

- l.39 · 1. Index global — la recherche porte sur tous les pavillons
- l.160 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.251 · 3. Rendu du pavillon courant
- l.314 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.370 · 5. Recherche et secteurs — sans mot-clé ni secteur retenu on reste sur le
- l.579 · 6. Vue
- l.678 · 7. Sélection et fiche
- l.1180 · 8. Interactions du plan
- l.1339 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 36 · `indexe` 42 · `largeur` 165 · `decoupe` 184 · `habille` 197
`lignesSvg` 208 · `ligneCode` 229 · `monteHabillage` 257 · `montePlan` 274 · `onglets` 299
`changePlan` 306 · `ancre` 322 · `place` 323 · `libelles` 325 · `indexeSecteurs` 391
`secteursMontres` 404 · `couleurConf` 408 · `hslHex` 412 · `couleurSecteur` 430
`chipsSecteurs` 440 · `coloreSecteurs` 463 · `appliqueSecteurs` 490 · `dansSecteurs` 506
`visible` 508 · `visibleSurPlan` 521 · `appliqueFiltre` 526 · `liste` 534
`appliqueVue` 582 · `rafraichitVue` 603 · `poseVue` 615 · `masque` 633 · `fit` 653
`zoom` 665 · `echelle` 670 · `ETROIT` 684 · `anime` 686 · `noeud` 703 · `canalPlan` 708
`select` 716 · `centre` 735 · `montre` 750 · `momentLocal` 776 · `programme` 799
`jourLong` 829 · `ficheConf` 840 · `lien` 934 · `ecarteClicFantome` 951 · `nomSociete` 960
`societes` 973 · `choisitExposant` 984 · `ouvre` 1020 · `ferme` 1161 · `onglet` 1170
`milieu` 1200 · `commencePince` 1206 · `suitPince` 1220 · `mesureTiroir` 1349

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

### `_parcours.html` — 290 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 50 · `signetParcours` 68 · `boutonParcours` 74
`rafraichitMarque` 79 · `brancheParcours` 91 · `marqueParcours` 107
`rafraichitParcours` 121 · `instantConf` 145 · `cleTemps` 149 · `jourCourt` 155
`rangParcours` 159 · `groupeParcours` 175 · `remplitParcours` 184 · `ouvreParcours` 246
`fermeParcours` 258

### `_pile.html` — 278 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.191 · Élément sélectionné

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`construitPanneau` 60 · `sectionSelection` 202 · `ligneCouleur` 220 · `rangSecteur` 240
`rangSous` 252 · `defautCouleur` 274

### `_pousse.html` — 117 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pousser la configuration

Fonctions :

`accesBase` 15 · `base` 24 · `reglagesSeuls` 42 · `pousseConfiguration` 46

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

### `supabase/functions/_partage/champs.ts` — 265 l.

(aucune fonction de premier niveau)

### `supabase/functions/_partage/eventmaker.ts` — 716 l.

`grapheJson` 136 · `enParallele` 566 · `texteSeul` 586 · `champs` 665 · `separe` 685

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

### `supabase/functions/sync-evenement/index.ts` — 1035 l.

`cors` 34 · `client` 72 · `gaia` 79 · `libellesChoix` 90 · `fournisseur` 115 · `range` 155
`champsKlipso` 176 · `hebergee` 996 · `nettoieUrl` 1011 · `groupeTextes` 1021

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
