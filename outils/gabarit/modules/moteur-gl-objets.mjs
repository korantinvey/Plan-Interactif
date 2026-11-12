/* ============================================================
   Le moteur du plan — images et objets (en préparation)
   ============================================================ */
import { Couche, ENTETE_SOMMETS, ENTETE_FRAGMENTS } from "./moteur-gl-couche.mjs";

export class BitmapLayer extends Couche {
  static programme(){ return { nom: "image", vs: ENTETE_SOMMETS + "void main(){ gl_Position = vec4(0.0); }",
    fs: ENTETE_FRAGMENTS + "void main(){ fragColor = vec4(0.0); }", attributs: [] }; }
  prepare(){}
  dessine(){}
  detruit(){}
}
BitmapLayer.layerName = "BitmapLayer";

export class SimpleMeshLayer extends Couche {
  static programme(){ return { nom: "maillage", vs: ENTETE_SOMMETS + "void main(){ gl_Position = vec4(0.0); }",
    fs: ENTETE_FRAGMENTS + "void main(){ fragColor = vec4(0.0); }", attributs: [] }; }
  prepare(){}
  dessine(){}
  detruit(){}
}
SimpleMeshLayer.layerName = "SimpleMeshLayer";
