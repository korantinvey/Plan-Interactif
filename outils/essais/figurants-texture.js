/**
 * Les allures des figurants rangées dans une texture, pour une seule couche
 * (`modules/figurants.mjs` `formesEnTexture`) : chaque sommet doit s'y
 * retrouver à son rang, sa partie avec sa forme, et une allure plus courte
 * finir en sommets nuls — des triangles sans surface.
 */
const test = require("node:test");
const assert = require("node:assert");
const F = require("../gabarit/modules/figurants.mjs");

test("chaque allure se lit dans sa rangée, sommet par sommet", () => {
  const reunis = F.maillagesFigurant().modeles.map(F.maillageReuni);
  const { donnees, largeur, hauteur } = F.formesEnTexture(reunis);
  assert.strictEqual(hauteur, reunis.length * 2);
  assert.strictEqual(largeur % 3, 0);
  // la plus petite texture d'un téléphone d'entrée de gamme (`densite-rendu.mjs`)
  assert.ok(largeur <= 4096);
  reunis.forEach((m, k) => {
    const pos = m.attributes.positions.value, nor = m.attributes.normals.value, cou = m.attributes.colors.value;
    const n = pos.length / 3;
    for (const v of [0, Math.floor(n / 2), n - 1]){
      const f = (2 * k * largeur + v) * 4, g = ((2 * k + 1) * largeur + v) * 4;
      assert.deepStrictEqual([...donnees.subarray(f, f + 4)], [...Float32Array.of(pos[3 * v], pos[3 * v + 1], pos[3 * v + 2], cou[3 * v])]);
      assert.deepStrictEqual([...donnees.subarray(g, g + 3)], [...Float32Array.of(nor[3 * v], nor[3 * v + 1], nor[3 * v + 2])]);
    }
    // au-delà de l'allure, rien : des triangles sans surface
    for (let v = n; v < largeur; v++){
      const f = (2 * k * largeur + v) * 4;
      assert.deepStrictEqual([...donnees.subarray(f, f + 4)], [0, 0, 0, 0]);
    }
  });
});
