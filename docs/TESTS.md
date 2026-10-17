# Tests réellement exécutés (17/10/2026, environnement de développement)

| Contrôle | Résultat |
|---|---|
| `npm run typecheck` (TypeScript strict) | OK, 0 erreur |
| `npm run lint` (ESLint) | OK, 0 erreur, 0 avertissement |
| `npm test` (Vitest : formats téléphone, WhatsApp, prix, durées, Maps) | 4 tests OK |
| `npm run build` (production) | OK, 13 routes |
| `npm run test:e2e` (Playwright, Chromium, mobile 390 px + desktop 1440 px) | 26 tests OK : 8 pages sans débordement horizontal, tous les « Réserver » → Acuity (nouvel onglet, `noopener`), aucun lien `/reserver`, `/mon-compte`, `/connexion`, lien WhatsApp `33613424089`, champs légaux « [À compléter] » visibles, modale de galerie ouverte/fermée |
| Contrôle visuel (captures) | accueil, prestations, galerie, à propos, contact en 390 et 1440 px |

**Limites** : testé sur une base PostgreSQL locale exposée via PostgREST (schéma et seeds appliqués sans erreur), pas
sur un vrai projet Supabase ni Vercel. Le parcours Acuity lui-même (page externe) n'est pas testé. Pas de test sur
iPhone/Safari réels. Les 38 tests de base de données du moteur de réservation natif (archivé) ne font plus partie du projet actif.
