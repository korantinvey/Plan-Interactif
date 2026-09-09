<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 430 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.285 · 10. Mode administration
- l.349 · Renommer une zone organisateur

Fonctions :

`conf` 11 · `jeton` 12 · `sousCle` 13 · `styleFond` 15 · `sousCalques` 36
`styleDataGroupe` 45 · `appliqueCouleursData` 47 · `styleData` 63 · `appliqueApparence` 69
`appliqueCommandes` 127 · `minutesVisite` 155 · `ouvreReglages` 167 · `enregistreConf` 235
`rgbHex` 241 · `hexa` 248 · `luminance` 252 · `ecarte` 266 · `joli` 281 · `retireAdmin` 298
`activeAdmin` 311 · `renommeZone` 359 · `enregistreNomZone` 383

Éléments :

`#pousseConf` · `#razConf`

### `_admin2.html` — 136 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 12. Démarrage

Fonctions :

`demarre` 8 · `annonce` 22 · `entetesApi` 37 · `chargeFond` 60 · `charge` 89

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

### `_dessin.html` — 757 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11. Calques de dessin

Fonctions :

`mesCalques` 14 · `enregistreDessins` 15 · `instantane` 37 · `memorise` 38 · `restaure` 43
`annule` 52 · `refais` 63 · `trouveCalque` 65 · `nouvelId` 66 · `cheminForme` 69
`dessineDessins` 79 · `versPlan` 116 · `apercu` 122 · `ajouteForme` 133 · `pictoDe` 229
`nomTypeRepere` 267 · `pictoForme` 278 · `traceRepere` 295 · `cartouchePoi` 344
`mesureCartouche` 402 · `eclairePoi` 409 · `signale` 420 · `calquePourImage` 434
`poseImage` 447 · `importeImage` 460 · `dessinPointerDown` 508 · `dessinPointerMove` 548
`dessinPointerUp` 564 · `termineTrace` 584 · `aide` 591 · `choisitOutil` 608
`activeCalque` 648 · `montreRoleIti` 684 · `creeCalque` 715 · `demandeNom` 728
`renommeCalque` 747

### `_edition.html` — 277 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Édition des formes existantes

Fonctions :

`formeParId` 11 · `boite` 19 · `curseurPoignee` 27 · `poignees` 32 · `dessinePoignees` 41
`choisitForme` 64 · `majElement` 75 · `etiquetteStand` 126 · `remplitListeStands` 131
`standSaisi` 140 · `appliqueLiaison` 150 · `appliqueTexte` 161 · `appliquePicto` 172
`supprimeForme` 184 · `editionPointerDown` 194 · `editionPointerMove` 239
`editionPointerUp` 270

### `_head.html` — 1291 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

Éléments :

`#titre` · `#sub` · `#halls` · `#nStands` · `#nExpo` · `#nZones` · `#btnItineraire`
`#btnParcours` · `#nParcours` · `#btnLayers` · `#btnReglages` · `#btnTheme` · `#side`
`#poignee` · `#q` · `#secteurs` · `#countTxt` · `#list` · `#stage` · `#plan` · `#couches`
`#zones` · `#stands` · `#labels` · `#zIn` · `#zOut` · `#zFit` · `#scaleBar` · `#scaleTxt`
`#poi` · `#viseur` · `#viseurTxt` · `#viseurStop` · `#outils` · `#outilsCalque`
`#renommeOutils` · `#fermeOutils` · `#roleIti` · `#roleAide` · `#voirNappe`
`#texteADessiner` · `#repereType` · `#repereTexte` · `#fichierImage` · `#choisirImage`
`#vignette` · `#elemSel` · `#elemType` · `#elemSupprimer` · `#elemPicto` · `#elemTexte`
`#elemTailleBloc` · `#elemTaille` · `#elemStand` · `#listeStands` · `#outilsAide`
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

### `_itineraire.html` — 1346 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Itinéraire — d'un point du salon à un autre

Fonctions :

`sommets` 80 · `enveloppe` 89 · `oublieGrilles` 130 · `calquesDe` 133 · `reperesDe` 138
`cleRoleIti` 188 · `roleIti` 189 · `nomRoleIti` 190 · `formesRole` 200 · `obstaclesPmr` 224
`grille` 251 · `distanceAuMur` 312 · `nappePrincipale` 354 · `caseDe` 387 · `centreCase` 392
`accroche` 411 · `Tas` 450 · `travail` 494 · `cherche` 512 · `distancesDepuis` 578
`reduit` 611 · `longueur` 622 · `nettoie` 626 · `amorce` 650 · `troncon` 669
`pointObjet` 693 · `pointRepere` 700 · `candidats` 707 · `pointSaisi` 733 · `portesDe` 750
`versPorte` 755 · `calculeRoute` 781 · `couleurNappe` 828 · `rafraichitApercu` 834
`marchesIci` 875 · `rayonBout` 880 · `dessineItineraire` 885 · `rafraichitBouts` 929
`cadreItineraire` 944 · `champIti` 967 · `ecritDistance` 971 · `ecritDuree` 975
`fermeSugg` 980 · `montreSugg` 987 · `choisitPoint` 1019 · `valideSaisie` 1028
`effaceItineraire` 1038 · `relance` 1058 · `montreResultat` 1092 · `bandeauVisee` 1193
`armeVisee` 1205 · `finVisee` 1213 · `viseItineraire` 1225 · `ouvreItineraire` 1248
`fermeItineraire` 1265 · `versItineraire` 1275

### `_journee.html` — 861 l. → plan-admin.html, plan-smcl.html, plan.html

- l.1 · 11 ter. Organiser sa journée

Fonctions :

`minutesDe` 50 · `finInstant` 51 · `ecritHeure` 53 · `ecritMinutes` 58 · `joursSalon` 66
`jourPropose` 77 · `pointConf` 92 · `departsProposes` 110 · `matriceJournee` 134
`rangeJournee` 228 · `calculeJournee` 324 · `rangJournee` 491 · `lienJournee` 503
`arretJournee` 510 · `remplitJournee` 535 · `appliqueVueParcours` 671 · `traceJournee` 697
`montreJournee` 705 · `perimeJournee` 718 · `ouvreOrganisation` 727 · `lanceJournee` 828

### `_js.html` — 1468 l. → plan-admin.html, plan-smcl.html, plan.html

- l.39 · 1. Index global — la recherche porte sur tous les pavillons
- l.147 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.238 · 3. Rendu du pavillon courant
- l.301 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.357 · 5. Recherche et secteurs — sans mot-clé ni secteur retenu on reste sur le
- l.566 · 6. Vue
- l.665 · 7. Sélection et fiche
- l.1167 · 8. Interactions du plan
- l.1326 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 36 · `indexe` 42 · `largeur` 152 · `decoupe` 171 · `habille` 184
`lignesSvg` 195 · `ligneCode` 216 · `monteHabillage` 244 · `montePlan` 261 · `onglets` 286
`changePlan` 293 · `ancre` 309 · `place` 310 · `libelles` 312 · `indexeSecteurs` 378
`secteursMontres` 391 · `couleurConf` 395 · `hslHex` 399 · `couleurSecteur` 417
`chipsSecteurs` 427 · `coloreSecteurs` 450 · `appliqueSecteurs` 477 · `dansSecteurs` 493
`visible` 495 · `visibleSurPlan` 508 · `appliqueFiltre` 513 · `liste` 521
`appliqueVue` 569 · `rafraichitVue` 590 · `poseVue` 602 · `masque` 620 · `fit` 640
`zoom` 652 · `echelle` 657 · `ETROIT` 671 · `anime` 673 · `noeud` 690 · `canalPlan` 695
`select` 703 · `centre` 722 · `montre` 737 · `momentLocal` 763 · `programme` 786
`jourLong` 816 · `ficheConf` 827 · `lien` 921 · `ecarteClicFantome` 938 · `nomSociete` 947
`societes` 960 · `choisitExposant` 971 · `ouvre` 1007 · `ferme` 1148 · `onglet` 1157
`milieu` 1187 · `commencePince` 1193 · `suitPince` 1207 · `mesureTiroir` 1336

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

`accesBase` 15 · `base` 24 · `reglagesSeuls` 40 · `pousseConfiguration` 46

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

### `supabase/functions/_partage/svg.ts` — 94 l.

`r2` 21

### `supabase/functions/mesure/index.ts` — 120 l.

`cors` 38 · `jeton` 52 · `client` 55

### `supabase/functions/plan-public/index.ts` — 243 l.

`cors` 37 · `db` 54

### `supabase/functions/sync-evenement/index.ts` — 1055 l.

`cors` 34 · `condense` 81 · `client` 87 · `gaia` 94 · `libellesChoix` 105
`fournisseur` 130 · `range` 170 · `champsKlipso` 191 · `hebergee` 1016 · `nettoieUrl` 1031
`groupeTextes` 1041

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

## Le reste

- `src/index.mjs` — 168 l. · Worker Cloudflare : relais et cache de `/api/plan`.
  `meta` 49 · `gardable` 62 · `range` 67 · `rafraichit` 74 · `mesure` 85
- `outils/assemble.js` — assemble `gabarit/` en `tpl-multi.html`.
- `outils/genere.js` — écrit les pages de `web/` depuis `tpl-multi.html`.
- `outils/carte.js` — produit ce fichier.
- `outils/verifie.js` — reconstruit, et échoue si le versionné était en retard.
- `outils/fetch-all.js`, `outils/build-all.js`, `outils/optim.js`, `outils/lire-pdf.js` —
  outils hors ligne de récupération et de préparation des plans (clé Klipso requise).
