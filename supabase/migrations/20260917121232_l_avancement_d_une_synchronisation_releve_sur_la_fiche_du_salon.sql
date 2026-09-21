-- L'avancement d'une synchronisation, relevé sur la fiche du salon
--
-- Pourquoi : la fenêtre d'avancement se remplit d'un flux — la fonction rend
-- ses lignes au fil de l'eau, la console les lit à mesure. Ce flux ne parvient
-- pas partout. Un antivirus qui inspecte le TLS, un relais d'entreprise, un
-- compresseur qui attend d'avoir de quoi remplir son bloc : tous gardent la
-- réponse entière et ne la rendent qu'à la fin. La fenêtre reste alors sur
-- « Connexion au serveur… » pendant toute la synchronisation, puis affiche le
-- bilan d'un coup — sur un poste, quand le téléphone d'à côté, sur le même
-- salon, déroule les étapes.
--
-- Le flux a déjà tout ce qu'un serveur peut faire pour traverser : le type
-- « événements côté serveur », `no-transform`, `X-Accel-Buffering`, et huit
-- kilo-octets de remplissage incompressible pour forcer le premier tampon. Ce
-- qui retient la réponse est donc chez le visiteur, hors de portée. D'où un
-- second chemin, qui ne doit rien au flux : la synchronisation dépose où elle
-- en est sur la ligne du salon, et la console relit cette ligne quand le flux
-- se tait. Une requête ordinaire, courte, qu'aucun tampon n'a de raison de
-- retenir.
--
-- Le dépôt est espacé — une écriture par seconde et demie au plus — et la
-- colonne est vidée à la fin : elle ne porte que ce qui tourne, jamais un
-- historique. Le relevé rejoue les mêmes lignes que le flux, fondues par
-- étape, si bien que la fenêtre ne sait pas laquelle des deux voies l'a
-- nourrie.

alter table evenement add column if not exists sync_avancement jsonb;

comment on column evenement.sync_avancement is
  'Où en est la synchronisation en cours, pour la console dont le flux est retenu en chemin. Vidée à la fin.';
