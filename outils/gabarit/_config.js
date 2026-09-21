/**
 * Configuration livrée avec les pages.
 *
 * La clé « publishable » est faite pour circuler côté navigateur : c'est son
 * rôle. Ce qui protège les données, ce sont les politiques de sécurité de la
 * base, pas le secret de cette clé. La clé de service, elle, ne doit jamais
 * apparaître ici — elle vit dans les secrets des fonctions.
 *
 * Un réglage enregistré sur le poste l'emporte, ce qui permet de pointer une
 * autre instance sans reconstruire les pages.
 */
window.PLAN_CONFIG = {
  url: "https://jylkfskotuafptaxujao.supabase.co",
  anonKey: "sb_publishable_N5rJYe35-Kcaw70ZoTJRaQ_lvVVc_5F",
};
