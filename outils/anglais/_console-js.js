/* Une seule entrée, gardée sous ce nom pour son rang. Le reste de la console
   est passé dans `modules/ecran-console.mjs`, et son dictionnaire dans
   `ecran-console.js`.

   Composé par `modules/correspondance.mjs` `intituleSuite`, mais rangé ici :
   un modèle sans attache fixe à ses bords est essayé dans l'ordre du
   dictionnaire — l'ordre des fichiers, puis des entrées —, et le déplacer
   changerait son rang dans chaque page. */
module.exports = {
  "{champs}, puis {suite}": "{champs}, then {suite}",
};
