# Guide d'administration

## Espace administration : `/admin`

Page protégée par mot de passe, pour modifier le site sans code. Les changements apparaissent sur le site **immédiatement**.
Les rendez-vous, disponibilités et paiements se gèrent **dans Acuity**, pas ici.

| Onglet | Ce qu'on peut faire |
|---|---|
| Prestations | Créer, modifier, masquer/afficher, supprimer ; prix, « à partir de », durée, textes, lien Acuity direct, ordre |
| Catégories | Renommer, réordonner, masquer |
| Photos | Ajouter / retirer / réordonner les photos du salon et de l'atelier (aucune photo de cliente) |
| Infos du salon | Téléphone, WhatsApp, e-mail, adresse, horaires (note), Instagram / TikTok / Snapchat, mentions légales |

**Première utilisation** : onglet Prestations > « Importer les prestations actuelles » (copie le catalogue Acuity intégré au site dans la base, pour le rendre modifiable). Rejouable sans doublons.

**Photos** : tant qu'aucune photo n'est ajoutée à une section, le site affiche ses photos d'origine ; dès qu'une photo est ajoutée, seules les photos de l'admin s'affichent pour cette section.

### Mise en place (une fois, par la personne qui gère Vercel)

Variables d'environnement Vercel (Production) :

| Variable | Rôle |
|---|---|
| `ADMIN_PASSWORD` | Mot de passe de l'espace admin (long, unique) à transmettre à la cheffe de projet |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur Supabase (déjà présente si l'intégration Supabase est connectée). Ne jamais l'exposer au navigateur |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `ADMIN_SESSION_SECRET` | Facultatif : secret de signature de session (sinon dérivé de la clé serveur) |

Prérequis base : migrations de `supabase/migrations/` appliquées (tables + bucket `site-media`). Session : 12 h, cookie sécurisé, `/admin` exclu des moteurs de recherche.
Changer le mot de passe : modifier `ADMIN_PASSWORD` sur Vercel puis redéployer ; les sessions en cours sont invalidées en changeant `ADMIN_SESSION_SECRET`.

## Alternative : tableau de bord Supabase (Table Editor)

| Pour… | Table | Colonnes utiles |
|---|---|---|
| Prestation | `services` | `name`, `slug`, `category_id`, `short_description`, `description`, `duration_minutes`, `price_cents` (8000 = 80 €), `price_is_from`, `image_path`, `booking_url`, `is_active` |
| Options d'une prestation (affichage) | `service_options` | `service_id`, `name`, `price_delta_cents`, `duration_delta_minutes` |
| Catégories | `service_categories` | `name`, `sort_order`, `is_active` |
| Photos | `media` (+ Storage `site-media`) | `section` : salon, about ; `path`, `alt`, `sort_order` |
| Coordonnées, réseaux, mentions légales | `salon_settings` | `phone`, `email`, `whatsapp`, `address`, `social`, `hours_note`, `legal` |

Lien Acuity global : variable `NEXT_PUBLIC_BOOKING_URL`.
