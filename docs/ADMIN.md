# Guide d'administration

L'espace d'administration est sur **`/admin`** (ex. https://votre-site.fr/admin). Il est protégé par un mot de passe.
Tout ce qui est modifié apparaît sur le site immédiatement. Les **rendez-vous, disponibilités et paiements restent gérés dans Acuity** : le calendrier de l'admin les affiche en lecture seule.

## Mise en route (une seule fois, par le développeur)

1. **Base de données** : dans Supabase > SQL Editor, exécuter dans l'ordre `supabase/migrations/20261017000001_…`, `…000002_…` puis **`…000003_admin_content.sql`** (textes, avis, articles). Ne pas rejouer une migration déjà appliquée.
2. **Variables Vercel** (Settings > Environment Variables), puis redéployer :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lecture du site |
| `SUPABASE_SERVICE_ROLE_KEY` | écriture depuis l'admin (secrète, jamais `NEXT_PUBLIC_`) |
| `ADMIN_PASSWORD` | mot de passe de connexion (long, unique) |
| `ACUITY_USER_ID`, `ACUITY_API_KEY` | calendrier : Acuity > Integrations > API |
| `ADMIN_OPEN` | **à supprimer** : si `true`, l'admin s'ouvre sans mot de passe (dépannage uniquement) |

3. Se connecter sur `/admin`, puis cliquer « Importer les prestations actuelles » (Prestations) et « Importer les avis actuels » (Avis) pour pouvoir les modifier.

## Ce que Marie peut faire

| Écran | Contenu |
|---|---|
| **Tableau de bord** | rendez-vous du jour et de la semaine, compteurs, raccourcis, alertes de configuration |
| **Calendrier** | mois complet avec le nombre de rendez-vous par jour ; clic sur un jour = détail (heure, cliente, prestation, durée, prix, téléphone, e-mail, notes). Les annulés sont grisés. Bouton « Ouvrir Acuity » pour toute modification de rendez-vous |
| **Prestations** | nom, catégorie, prix (« à partir de »), durée, descriptions, lien Acuity direct, afficher/masquer, supprimer |
| **Catégories** | nom, ordre, visibilité |
| **Textes** | titres et paragraphes : accueil (bienvenue, bloc mariées, titre des avis), chiffre clé « 12 ans », À propos, Équipe, Formation, Boutique, Ebook. Champ vidé = texte d'origine |
| **Articles** | blog : titre, résumé, texte (paragraphes séparés par une ligne vide, `## ` pour un intertitre), image, date, publié/brouillon. Le lien « Blog » du pied de page apparaît dès le premier article publié |
| **Avis** | ajouter, modifier, masquer, supprimer les avis de l'accueil. La note globale (« 5/5 · 2 avis Google ») se change dans Textes |
| **Photos** | photos du salon et des outils (aucune photo de cliente) |
| **Infos du salon** | téléphone, e-mail, WhatsApp, adresse, réseaux, mentions légales |

## Points d'attention

- Les photos et textes d'**avis** doivent être de vrais avis, publiés avec l'accord de leurs auteurs.
- La clé API Acuity donne accès aux données des clientes : ne jamais la mettre dans le code ni la partager.
- Les rendez-vous sont lus à chaque ouverture de page (pas de copie dans la base du site).
- Les listes d'attente et paiements restent dans Acuity.
- Pour les textes non listés dans « Textes » (ex. menu du bar de la page À propos, mentions légales), voir `src/config/` ou demander une évolution.

## Créer son compte administrateur (mot de passe oublié)

1. Dans Vercel, ajouter `ADMIN_EMAILS` avec l'adresse e-mail de la personne (plusieurs adresses : séparées par des virgules), puis Redeploy.
2. Dans Supabase > Authentication > URL Configuration, ajouter dans « Redirect URLs » : `https://VOTRE-SITE/admin/nouveau-mot-de-passe`.
3. La personne ouvre `/admin/login` > « Mot de passe oublié ? / Créer mon compte », saisit son adresse, clique sur le lien reçu par e-mail et choisit son mot de passe (10 caractères minimum, bouton œil pour le vérifier). Elle est ensuite connectée.
4. Les connexions suivantes se font avec l'adresse e-mail et ce mot de passe. Seules les adresses de `ADMIN_EMAILS` sont acceptées.

L'ancien mot de passe unique (`ADMIN_PASSWORD`) fonctionne toujours : laisser le champ e-mail vide.

### E-mails via Resend
Ajouter dans Vercel `RESEND_API_KEY` et `RESEND_FROM` (adresse d'un domaine vérifié dans Resend, par exemple `Mariekey Expert <contact@votre-domaine.fr>`), puis Redeploy. Le lien « mot de passe oublié » part alors par Resend (plus fiable que l'e-mail par défaut de Supabase). Sans ces deux variables, Supabase envoie l'e-mail lui-même.
