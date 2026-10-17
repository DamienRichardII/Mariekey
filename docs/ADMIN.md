# Guide d'administration (sans code)

Tout se modifie dans le tableau de bord Supabase (**Table Editor**) ; le site se met à jour en ~1 minute.
Les rendez-vous, disponibilités et paiements se gèrent **dans Acuity**, pas ici.

| Pour… | Table | Colonnes utiles |
|---|---|---|
| Ajouter / modifier une prestation | `services` | `name`, `slug` (minuscules-avec-tirets), `category_id`, `short_description`, `description`, `duration_minutes`, `price_cents` (8000 = 80 €), `price_is_from` (« à partir de »), `image_path`, `booking_url` (lien Acuity direct de la prestation, facultatif), `is_active` |
| Masquer une prestation | `services` | `is_active` = false |
| Options d'une prestation (affichage) | `service_options` | `service_id`, `name`, `price_delta_cents`, `duration_delta_minutes` |
| Catégories (accueil) | `service_categories` | `name`, `image_path`, `sort_order`, `is_active` |
| Photos / vidéos | `media` (+ Storage `site-media`) | `section` : salon, about (aucune photo de cliente) ; `path`, `alt`, `sort_order` |
| Coordonnées, WhatsApp, réseaux | `salon_settings` | `phone`, `email`, `whatsapp`, `address`, `social` (`{"instagram":"https://…"}`), `hours_note` |
| Mentions légales | `salon_settings.legal` | clés : `raison_sociale`, `siret`, `code_postal`, `directeur_publication`, `hebergeur` |
| Horaires affichés | `opening_hours` | `is_open`, `open_time`, `close_time` (1 = lundi … 7 = dimanche) |

Ajouter une photo : Storage > `site-media` > envoyer le fichier, puis ajouter une ligne `media` avec son URL publique comme `path`.
Réseaux sociaux : une icône n'apparaît que si l'URL est renseignée. Lien Acuity global : variable `NEXT_PUBLIC_BOOKING_URL`.
