<!-- Produit par `node outils/carte.js` (via `npm run construire`).
     Ne pas modifier à la main : la prochaine construction l'écrase. -->

# Carte des sources

Index des sources, relu dans les fichiers à chaque construction. Il sert à
ouvrir la bonne portion du bon fichier plutôt que le dépôt entier.

Rappel : `web/` est **fabriqué** depuis `outils/gabarit/`, et n'est donc pas
l'endroit où l'on corrige quoi que ce soit.

## `outils/gabarit/` — la source des pages

### `_admin1.html` — 492 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 9. Apparence des calques
- l.347 · 10. Mode administration
- l.411 · Renommer une zone organisateur

Fonctions :

`cleConf` 17 · `ouvreConf` 22 · `reglagesDuSalon` 41 · `conf` 62 · `jeton` 63 · `sousCle` 64
`styleFond` 66 · `sousCalques` 87 · `styleDataGroupe` 96 · `appliqueCouleursData` 102
`styleData` 123 · `appliqueApparence` 129 · `appliqueCommandes` 187 · `minutesVisite` 215
`ouvreReglages` 227 · `enregistreConf` 297 · `rgbHex` 303 · `hexa` 310 · `luminance` 314
`ecarte` 328 · `joli` 343 · `retireAdmin` 360 · `activeAdmin` 373 · `renommeZone` 421
`enregistreNomZone` 445

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

### `_head.html` — 1299 l. → plan-admin.html, plan-salon.html, plan-smcl.html, plan.html

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

### `_js.html` — 1476 l. → plan-admin.html, plan-smcl.html, plan.html

- l.39 · 1. Index global — la recherche porte sur tous les pavillons
- l.155 · 2. Mesure de texte — largeur réelle dans la police de rendu
- l.246 · 3. Rendu du pavillon courant
- l.309 · 4. Libellés — le nom de l'exposant prime sur le numéro
- l.365 · 5. Recherche et secteurs — sans mot-clé ni secteur retenu on reste sur le
- l.574 · 6. Vue
- l.673 · 7. Sélection et fiche
- l.1175 · 8. Interactions du plan
- l.1334 · Le tiroir de la liste — écrans étroits

Fonctions :

`$` 12 · `esc` 14 · `P` 36 · `indexe` 42 · `largeur` 160 · `decoupe` 179 · `habille` 192
`lignesSvg` 203 · `ligneCode` 224 · `monteHabillage` 252 · `montePlan` 269 · `onglets` 294
`changePlan` 301 · `ancre` 317 · `place` 318 · `libelles` 320 · `indexeSecteurs` 386
`secteursMontres` 399 · `couleurConf` 403 · `hslHex` 407 · `couleurSecteur` 425
`chipsSecteurs` 435 · `coloreSecteurs` 458 · `appliqueSecteurs` 485 · `dansSecteurs` 501
`visible` 503 · `visibleSurPlan` 516 · `appliqueFiltre` 521 · `liste` 529
`appliqueVue` 577 · `rafraichitVue` 598 · `poseVue` 610 · `masque` 628 · `fit` 648
`zoom` 660 · `echelle` 665 · `ETROIT` 679 · `anime` 681 · `noeud` 698 · `canalPlan` 703
`select` 711 · `centre` 730 · `montre` 745 · `momentLocal` 771 · `programme` 794
`jourLong` 824 · `ficheConf` 835 · `lien` 929 · `ecarteClicFantome` 946 · `nomSociete` 955
`societes` 968 · `choisitExposant` 979 · `ouvre` 1015 · `ferme` 1156 · `onglet` 1165
`milieu` 1195 · `commencePince` 1201 · `suitPince` 1215 · `mesureTiroir` 1344

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

### `_parcours.html` — 322 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · 11 bis. Parcours de visite

Fonctions :

`cleParcours` 21 · `casierParcours` 24 · `dansParcours` 25 · `chargeParcours` 27
`enregistreParcours` 45 · `basculeParcours` 50 · `signetParcours` 68 · `boutonParcours` 74
`rafraichitMarque` 79 · `brancheParcours` 91 · `calqueMarques` 118 · `marqueParcours` 129
`rafraichitParcours` 153 · `instantConf` 177 · `cleTemps` 181 · `jourCourt` 187
`rangParcours` 191 · `groupeParcours` 207 · `remplitParcours` 216 · `ouvreParcours` 278
`fermeParcours` 290

### `_pile.html` — 288 l. → plan-admin.html, plan-smcl.html, plan.html

- l.2 · Pile des calques
- l.57 · Panneau : une seule liste, tous types confondus
- l.191 · Repères

Fonctions :

`clePile` 8 · `entrees` 10 · `pile` 21 · `groupe` 33 · `ordonneDom` 41 · `deplaceCouche` 46
`construitPanneau` 60 · `sectionSelection` 205 · `ligneCouleur` 230 · `rangSecteur` 250
`rangSous` 262 · `defautCouleur` 284

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
