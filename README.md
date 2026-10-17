# Mariekey Expert — site vitrine

Site vitrine (Next.js 16, React 19, TypeScript strict, Tailwind v4, Supabase pour le contenu).
**La réservation est gérée par Acuity Scheduling** : tous les boutons « Réserver » ouvrent
`https://app.acuityscheduling.com/schedule.php?owner=32171214` (nouvel onglet). Il n'y a ni paiement,
ni compte client, ni planning sur ce site. Le premier moteur de réservation natif est archivé dans
`docs/archive/native-booking/` (non utilisé).

Pages : `/`, `/prestations`, `/prestations/[slug]`, `/galerie`, `/a-propos`, `/contact`,
`/mentions-legales`, `/confidentialite`, `/conditions-de-reservation`.

## Installation

```bash
npm install
cp .env.example .env.local        # renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                       # http://localhost:3000
```

## Base de données (Supabase)

1. Créer un projet Supabase.
2. Exécuter dans l'éditeur SQL (ou `supabase db push`) les fichiers de `supabase/migrations/` dans l'ordre.
3. Exécuter `supabase/seed.content.sql` : médias fournis, coordonnées confirmées. Rejouable.
4. Exécuter `supabase/seed.catalog.sql` : les 20 prestations et 6 catégories relevées sur Acuity (rejouable ; met à jour
   par `slug`). **Facultatif** : sans base, le site affiche déjà ce même catalogue depuis `src/config/catalog.ts`.
   Pour modifier le catalogue : Table Editor > `services` (voir `docs/ADMIN.md`) ou `scripts/acuity-services.json`.

Le site lit uniquement le contenu actif (RLS : lecture publique, aucune écriture depuis le navigateur).
L'espace `/admin` (mot de passe) permet à la cliente de gérer prestations, textes, articles, avis, photos et de consulter
son calendrier Acuity : voir `docs/ADMIN.md` (migration `…000003_admin_content.sql` et variables `ACUITY_*` à ajouter).

## Déploiement (Vercel)

1. Importer le dépôt dans Vercel (preset Next.js détecté).
2. Variables d'environnement : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (et `NEXT_PUBLIC_BOOKING_URL` si le lien Acuity change).
3. Déployer. Le contenu se rafraîchit seul (revalidation 60 s) : pas de redéploiement pour changer un prix ou une photo.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run lint` / `npm run typecheck` | ESLint, TypeScript strict |
| `npm test` | tests unitaires (Vitest) |
| `npm run build && npm start` puis `npm run test:e2e` | tests navigateur (Playwright, mobile 390 px et desktop 1440 px) |

Images : déposer les fichiers dans `public/images/…` ; `scripts/assets-manifest.mjs` (lancé par `dev` et `build`)
liste les fichiers réels. Un visuel absent affiche un emplacement sobre, jamais une image inventée.
Logo : déposer `public/images/logo/logo.svg` (ou `.png`/`.webp`) ; sans fichier, un logotype provisoire est affiché.

Voir aussi : `docs/ADMIN.md` (guide), `docs/A-FOURNIR.md` (informations nécessaires à la mise en ligne),
`docs/TESTS.md` (tests réellement exécutés).
