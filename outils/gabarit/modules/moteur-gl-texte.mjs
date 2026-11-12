/* ============================================================
   Le moteur du plan — les textes (en préparation)
   ============================================================ */
import { Couche, ENTETE_SOMMETS, ENTETE_FRAGMENTS } from "./moteur-gl-couche.mjs";

export class TextLayer extends Couche {
  static programme(){ return { nom: "texte", vs: ENTETE_SOMMETS + "void main(){ gl_Position = vec4(0.0); }",
    fs: ENTETE_FRAGMENTS + "void main(){ fragColor = vec4(0.0); }", attributs: [] }; }
  prepare(){}
  dessine(){}
  detruit(){}
}
TextLayer.layerName = "TextLayer";
/** @type {number} */
TextLayer.fontAtlasCacheLimit = 24;
