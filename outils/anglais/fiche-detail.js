/* `outils/gabarit/modules/fiche-detail.mjs` — la fiche détail d'un salon :
   ce qu'elle montre, le champ d'origine de chaque ligne et ses valeurs, les
   catégories d'invités, les champs propres au salon. Le modèle
   « {champs}, puis {suite} », qu'affiche aussi la liste des champs, reste
   dans `_console-js.js` : voir la note qui l'y accompagne. */
module.exports = {
  // le titre de la fenêtre, et ce qu'elle cite ; la fiche du salon les dit aussi
  "Provenance des données": "Data sources by domain",
  "Fiche détail": "Record details",
  "Hall": "Hall no.",

  // le contenu de la fiche détail
  "hall de l'emplacement": "hall of the stand",
  "Affiché devant le numéro de stand, sur les seuls stands dont le hall est renseigné. Il se lit sur l'emplacement et non sur le pavillon, un même plan pouvant en couvrir deux. Décoché tant qu'on ne l'a pas voulu.":
    "Shown before the stand number, only on stands whose hall is filled in. It is read from the stand, not the hall on the map, as one map can cover two halls. Unticked until you choose otherwise.",
  "Numéro de stand": "Stand number",
  "allée et numéro de l'emplacement": "aisle and number of the stand",
  "Affiché à côté du pavillon.": "Shown next to the hall.",
  "nombre de niveaux de l'emplacement": "number of levels of the stand",
  "Seulement au-delà d'un niveau.": "Only above one level.",
  "secteur de l'emplacement": "sector of the stand",
  "Le découpage commercial du plan, que Klipso porte sur l'emplacement. Les couleurs et le filtre par secteur se règlent, eux, depuis le plan.":
    "The commercial layout of the map, which Klipso stores on the stand. Sector colours and the sector filter are set from the map.",
  "Enseigne": "Brand",
  "Le titre de la fiche : toujours affiché.": "The record's title: always shown.",
  "Le titre de la fiche, et le nom écrit sur le stand et dans la liste : toujours affiché. Il peut venir d'une autre source que le reste de la fiche ; à défaut de valeur de ce côté, c'est le nom que porte la source des exposants qui paraît.":
    "The record's title, and the name written on the booth and in the list: always shown. It can come from a different source than the rest of the record; when that side has no value, the name held by the exhibitor source is shown.",

  // la source propre au nom des stands
  "Source": "Source",
  "{source} — comme les exposants": "{source} — same as exhibitors",
  "Les champs de {source} seront proposés après la prochaine synchronisation.":
    "{source} fields will be offered after the next sync.",
  "Identifiant Eventmaker manquant : renseignez-le dans « Source des données ».":
    "Eventmaker ID missing: enter it under “Data sources”.",
  "Quand elle diffère de l'enseigne.": "When it differs from the brand.",
  "Le logo de l'enseigne, en tête de fiche. Sur Eventmaker, c'est « avatar » qu'il faut désigner : « avatar_medium » et « avatar_thumb » sont recadrés au carré et coupent les bords d'un logo en largeur — et sur une fiche sans logo, ils rendent les initiales de la personne inscrite.":
    "The brand's logo, at the top of the record. On Eventmaker, choose “avatar”: “avatar_medium” and “avatar_thumb” are cropped square and cut off the edges of a wide logo — and on a record without a logo, they return the registrant's initials.",
  "Code postal": "Postcode",
  "avec la ville": "with the town",
  "Se pose devant la ville, sur la même ligne, comme sur une enveloppe. Il n'entre pas pour autant dans le filtre « Ville », qui fait cocher des villes et non des codes postaux.":
    "Sits before the town, on the same line, as on an envelope. It does not join the “Town” filter, which ticks towns and not postcodes.",
  "Téléphone société": "Company phone",
  "Les rubriques du catalogue. Plusieurs champs se cumulent.": "The catalogue categories. Several fields add up.",
  "Ce que l'exposant vient chercher ou proposer, tel que le salon le range. Un champ à valeurs multiples se sépare tout seul ; fiez-vous à l'exemple, certains salons n'y portent que des codes. Un salon qui les tient dans Eventmaker même, et non dans un champ de fiche, les porte sous « thematic_ids ».":
    "What the exhibitor is looking for or offering, as the show classifies it. A multi-value field is split automatically; check the example, some shows only store codes there. A show that keeps them in Eventmaker itself, rather than in a record field, carries them under \u201cthematic_ids\u201d.",
  "Pose une pastille en tête de fiche. Le champ n'existe que sur les salons qui distinguent leurs nouveaux venus.":
    "Adds a badge at the top of the record. The field only exists on shows that flag their newcomers.",
  "Les conférences tenues par l'exposant, où qu'elles se tiennent.": "The conferences run by the exhibitor, wherever they take place.",
  "programme non synchronisé": "programme not synchronised",
  "catalogue non synchronisé": "catalogue not synchronised",
  "Le catalogue de l'exposant. Il est rangé sous sa fiche d'invité et non dans ses champs : rien à désigner ici, seulement à montrer ou non.":
    "The exhibitor's catalogue. It is filed under their guest record rather than among its fields: nothing to designate here, only to show or not.",
  "programme": "programme",
  "Le stand": "The stand",
  "L'emplacement tel que le plan le décrit. Rien ne s'y règle : ces valeurs ne sont pas des champs de fiche.":
    "The stand as the map describes it. Nothing to set here: these values are not record fields.",
  "L'exposant": "The exhibitor",
  "La société rattachée à l'emplacement, et ce que sa fiche porte.": "The company attached to the stand, and what its record holds.",
  "Exclu de la liste": "Excluded from the list",
  "Une valeur vraie retire l'exposant du plan public, quel que soit le reste.": "A true value removes the exhibitor from the public map, whatever else is set.",
  "Numéro de stand de l'exposant": "Exhibitor's stand number",
  "Le numéro tel que sa fiche le porte, comparé à celui du plan, mise en forme ignorée. Mal réglé, aucun exposant n'apparaît.":
    "The number as the exhibitor's record holds it, compared with the map's, formatting ignored. Set wrongly, no exhibitor appears.",
  "Identifiant de dossier": "Record ID",
  "Le dossier Klipso recopié sur la fiche : le rattachement le plus sûr.": "The Klipso record copied onto the entry: the most reliable link.",
  "Rattachement des co-exposants": "Co-exhibitor link",
  "Le champ où un co-exposant porte le stand de son hôte. Les fiches qui désignent ainsi un stand déjà pris par un dossier sont ses co-exposants, et la fiche du stand les liste tous. « Aucun » les retire du plan.":
    "The field where a co-exhibitor stores its host's stand. Records that point to a stand already taken by another record are its co-exhibitors, and the stand's record lists them all. “None” removes them from the map.",
  "Masqué — {champs}": "Hidden — {champs}",
  "Masqué": "Hidden",
  "Tout affiché": "Everything shown",
  "{n} champs propres au salon": "{n} show-specific fields",
  "{n} champ propre au salon": "{n} show-specific field",
  "{n} critères de recherche": "{n} search filters",
  "{n} critère de recherche": "{n} search filter",
  "aucun critère de recherche": "no search filters",
  "ordre d'affichage remanié": "display order changed",
  "{n} champs de zone masqués": "{n} area fields hidden",
  "{n} champ de zone masqué": "{n} area field hidden",
  "{n} groupes de champs": "{n} field groups",
  "{n} groupe de champs": "{n} field group",
  "{n} champs associés à la main": "{n} fields mapped by hand",
  "{n} champ associé à la main": "{n} field mapped by hand",
  "champs d'origine proposés": "source fields suggested",
  "champs d'origine non relevés": "source fields not collected",
  "Afficher ce champ sur la fiche": "Show this field on the record",
  "Proposer ce champ dans les critères de recherche": "Offer this field as a search filter",
  "Intitulé en français": "Label in French",
  "Intitulé en anglais": "Label in English",
  "Laissé vide, l'intitulé en français s'affiche aussi dans la version anglaise du plan.":
    "Left empty, the French label is also shown in the English version of the map.",
  "Nouveau champ": "New field",
  "Intitulé du champ, tel que la fiche l'affichera": "Field label, as the record will show it",
  "Renommer le champ": "Rename field",
  "Intitulé": "Label",
  "Retirer « {champ} » ?": "Remove “{champ}”?",
  "Le champ, son origine et son réglage de recherche sont effacés. Les valeurs déjà synchronisées disparaîtront de la fiche à la prochaine synchronisation.":
    "The field, its source and its search setting are erased. Values already synchronised will disappear from the record at the next synchronisation.",
  "Renommer {champ}": "Rename {champ}",
  "Retirer {champ}": "Remove {champ}",
  "Aucune source d'exposants : il n'y a pas de champ d'origine à associer. Choisissez-en une dans « Provenance des données ».":
    "No exhibitor source: there is no source field to map. Choose one in “Data sources by domain”.",
  "Ce qui ne s'affiche pas": "What is not shown",
  "Champs propres à ce salon": "Fields specific to this show",
  "Un champ que ce salon est seul à tenir. Il se règle comme les autres — un champ d'origine, une case pour l'afficher, une case pour en faire un critère de recherche — et n'existe que pour cet événement. Un champ à choix multiple se sépare tout seul : la source joint ses valeurs par un point-virgule, et chacune compte pour elle-même. La version anglaise vient d'un second champ de la source, à désigner sous le premier : un champ à choix a déjà l'anglais de ses valeurs, un texte libre n'en a aucun.":
    "A field only this show has. It is set up like the others — a source field, a box to show it, a box to make it a search filter — and only exists for this event. A multiple-choice field is split automatically: the source joins its values with a semicolon, and each one counts on its own. The English version comes from a second source field, to be picked below the first one: a choice field already carries the English of its values, free text carries none.",
  "Version anglaise": "English version",
  "pas de version anglaise": "no English version",
  "Ajouter un champ": "Add a field",
  "Aucun champ propre à ce salon pour le moment.": "No show-specific fields yet.",
  "Les champs proposés viennent du relevé de la dernière synchronisation, le {date}.":
    "The suggested fields come from what the last synchronisation collected, on {date}.",
  "Un champ choisi à la main n'est plus jamais reproposé, et le réglage prend effet à la synchronisation suivante.":
    "A field chosen by hand is never suggested again, and the setting takes effect at the next synchronisation.",
  "Les champs d'origine se relèvent à la synchronisation : lancez-en une pour qu'ils soient proposés ici.":
    "Source fields are collected during synchronisation: run one for them to be suggested here.",
  "Le nom et le pavillon sont toujours affichés : sans eux la fiche ne désigne plus rien.":
    "The name and the hall are always shown: without them the record no longer points to anything.",
  "Décocher un champ le renvoie en réserve sur le plan, où il attend d'être réaffiché. C'est là que se règle le reste de la fiche — l'ordre des champs, les sections qui les réunissent sous un même titre, les intitulés qui paraissent devant les valeurs : engrenage, « Fiche Stand ». Ce qu'une fiche de zone organisateur montre — logo, description, lien, programme — s'y règle aussi : engrenage, « Zones ».":
    "Unticking a field sends it back to the reserve on the map, where it waits to be shown again. The rest of the details is set there — the order of the fields, the sections that gather them under one title, the labels that appear before the values: gear icon, “Stand details”. What an organiser area's details show — logo, description, link, programme — is set there too: gear icon, “Areas”.",
  "Afficher": "Show",
  "Sur la fiche": "On the record",
  "Champ d'origine": "Source field",
  "Critère": "Filter",
  "sans champ à régler": "no field to set",
  "Critère de recherche": "Search filter",
  "toujours": "always",

  // le champ d'origine et ses valeurs
  "Par défaut — {champ}": "Default — {champ}",
  "Par défaut — aucun champ": "Default — no field",
  "Par défaut": "Default",
  "Aucun — laisser vide": "None — leave empty",
  "Champs": "Fields",
  "{champ} (absent du dernier relevé)": "{champ} (missing from the last collection)",
  "sans champ d'origine connu": "no known source field",
  "champ habituel introuvable : à désigner": "usual field not found: to be chosen",
  "laissé vide": "left empty",
  "champ par défaut": "default field",
  "choisi à la main": "chosen by hand",
  "proposé d'après le dernier relevé": "suggested from the last collection",
  "vaut oui quand la valeur est :": "counts as yes when the value is:",
  "aucune valeur retenue : « {valeurs} » valent oui d'office": "no value selected: “{valeurs}” count as yes by default",
  "aucune valeur retenue : « {valeurs} » vaut oui d'office": "no value selected: “{valeurs}” counts as yes by default",
  "aucune valeur retenue : rien ne sera signalé": "no value selected: nothing will be flagged",
  "trop de valeurs différentes pour en proposer la liste : saisissez celle qui compte":
    "too many different values to list them: type the one that matters",
  "valeurs inconnues : la prochaine synchronisation les relèvera, ou saisissez-en une ici":
    "values unknown: the next synchronisation will collect them, or type one here",
  "valeurs inconnues au relevé du {date} : la prochaine synchronisation les relèvera, ou saisissez-en une ici":
    "values unknown at the collection of {date}: the next synchronisation will collect them, or type one here",
  "portée par aucune des fiches relevées": "found on none of the records collected",
  "relevée sur les fiches": "found on the records",
  "autre valeur…": "other value…",

  /* Les catégories d'invités qui portent les exposants. */
  "Catégories d'invités": "Guest categories",
  "Les fiches que la synchronisation lit. Une catégorie Eventmaker mêle souvent les sociétés et les personnes qui les représentent : cochez celles qui portent les exposants, et rien d'autre n'est lu. Tout décocher rend la main à la détection automatique. Le réglage prend effet à la synchronisation suivante.":
    "The records the sync reads. An Eventmaker category often mixes companies with the people representing them: tick the ones holding the exhibitors, and nothing else is read. Unticking them all hands control back to automatic detection. The setting takes effect on the next sync.",
  "{n} catégories désignées : la synchronisation ne lira que leurs fiches.":
    "{n} categories selected: the sync will read only their records.",
  "1 catégorie désignée : la synchronisation ne lira que ses fiches.":
    "1 category selected: the sync will read only its records.",
  "Aucune catégorie désignée : la synchronisation cherche elle-même celles dont les fiches portent un numéro de stand, et la dernière en a retenu {n}.":
    "No category selected: the sync looks for those whose records carry a stand number by itself, and the last one kept {n}.",
  "Aucune catégorie désignée : la synchronisation cherche elle-même celles dont les fiches portent un numéro de stand, et la dernière n'en a retenu aucune.":
    "No category selected: the sync looks for those whose records carry a stand number by itself, and the last one kept none.",
  "Les catégories se relèvent à la synchronisation : lancez-en une pour qu'elles soient proposées ici.":
    "Categories are surveyed during a sync: run one for them to be offered here.",
  "des fiches de cette catégorie portent un numéro de stand":
    "records in this category carry a stand number",
  "aucune fiche de cette catégorie ne portait de numéro de stand":
    "no record in this category carried a stand number",

  // la ligne « Adhérent syndicat » du mapping des champs
  "Adhérent syndicat": "Trade body member",
  "Marque l'exposant membre du syndicat du salon. Le champ porte rarement un oui : cochez sous lui celles de ses valeurs qui comptent pour une adhésion. Ce que le plan en montre se règle depuis l'engrenage du plan, onglet « Adhérents ».":
    "Marks the exhibitor as a member of the show's trade body. The field rarely carries a yes: tick below it whichever of its values count as membership. What the map makes of it is set from the map's gear, \u201cMembers\u201d tab.",
};
