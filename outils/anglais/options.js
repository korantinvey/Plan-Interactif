/* `outils/gabarit/modules/options.mjs` — les options vendues à part, que
   l'onglet « Admin » ouvre et ferme : ce que le salon a pris, et ce que fermer
   une option retire. */
module.exports = {
  "Dessin des stands": "Drawing stands",
  "L'outil qui matérialise un exposant, ou l'une des enseignes qu'il héberge, sur sa part d'un emplacement. Fermée, l'outil reste dans la boîte à outils, grisé ; les découpages déjà tracés restent sur le plan.":
    "The tool that marks out an exhibitor, or one of the brands it hosts, on its share of a stand. Closed, the tool stays in the toolbox, greyed out; the shapes already drawn stay on the map.",
  "Ajout d'images liées à un stand": "Adding images tied to a stand",
  "Le rattachement d'une image du dessin à un exposant : le logo posé sur son emplacement ouvre sa fiche au toucher, celle de l'enseigne désignée même sur un stand partagé. C'est le lien qui se prend, non l'image : fermée, l'outil image reste et les images se posent comme n'importe quel dessin, mais le champ qui nomme l'exposant est grisé et plus aucune ne se relie. Celles qui l'étaient gardent leur lien.":
    "Tying a drawing's image to an exhibitor: a logo placed on their stand opens their details when touched, the named brand's even on a shared stand. It is the link that is bought, not the image: closed, the image tool stays and images are placed like any other drawing, but the field that names the exhibitor is greyed out, and none can be tied any more. Those already tied keep their link.",
  "Le bouton du tiroir du parcours, qui met en heures les stands et les conférences retenus et trace le trajet d'un bout à l'autre. Fermée, le bouton vous reste, grisé, et le visiteur ne l'a plus : son parcours reste une liste. Elle se calcule avec le moteur de l'itinéraire : la commande retirée plus haut emporte le bouton avec elle.":
    "The button in the visit plan drawer, which puts the stands and conferences picked into a timetable and traces the route from end to end. Closed, the button stays for you, greyed out, and the visitor no longer has it: their visit plan stays a list. It is worked out with the directions engine: unticking that command above takes the button with it.",
  "Programme de conférences": "Conference programme",
  "Les conférences du salon : le programme d'une zone, celles qu'un exposant anime sur sa fiche, la recherche par titre, les horaires que le parcours retient et les rappels qui vont avec. Fermée, le plan se comporte comme un salon qui n'a pas de programme — la synchronisation continue pourtant de le rapporter. Un visiteur qui rouvre le plan entre-temps perd de son parcours les conférences qu'il avait retenues : il ne garde que ce que le plan connaît encore.":
    "The show's conferences: an area's programme, the ones an exhibitor runs on their details, searching by title, the times the visit plan keeps and the reminders that go with them. Closed, the map behaves like a show that has no programme \u2014 the synchronisation keeps bringing it back all the same. A visitor who reopens the map meanwhile loses the conferences they had picked from their visit plan: it keeps only what the map still knows about.",
  "Recommandations sponsorisées": "Sponsored recommendations",
  "L'exposant de plus, proposé au visiteur quand plusieurs de ceux qu'il a retenus se ressemblent — le plus consulté du salon sur ce critère, ou celui que l'organisateur a désigné. Fermée, l'onglet « Suggestion » reste ici, grisé, et plus rien n'est proposé ; ce qui y était réglé est gardé.":
    "One more exhibitor, offered to a visitor when several of the ones they have picked look alike \u2014 the most viewed of the show on that criterion, or the one the organiser has named. Closed, the \u201cSuggestion\u201d tab stays here, greyed out, and nothing is offered any more; what was set there is kept.",

  /* Les deux endroits qui disent que l'option est fermée : la sorte
     « Conférences » de la recherche, et le rappel qui n'a plus d'heure. */
  "Le programme de conférences n'est pas pris sur ce salon.": "The conference programme is not taken on this show.",
};
