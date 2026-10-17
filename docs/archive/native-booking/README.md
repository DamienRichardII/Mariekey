# Archive — réservation native (non utilisée)

Le salon a choisi **Acuity Scheduling** comme unique canal de réservation. Le moteur de réservation
développé initialement (anti-chevauchement PostgreSQL, réservation provisoire, confirmation de paiement
idempotente, annulation/déplacement, RLS, 38 tests) est conservé ici **sans être appliqué** au projet.

- `supabase/migrations/` : schéma complet (rendez-vous, paiements, webhooks, notifications…) et fonctions SQL.
- `tests/db/` : tests Vitest exécutés sur un PostgreSQL réel (tous passaient au moment de l'archivage).

Pour le réactiver un jour : recopier ces migrations dans `supabase/migrations/`, puis reconstruire
l'interface de réservation, Stripe et les emails (non conservés).
