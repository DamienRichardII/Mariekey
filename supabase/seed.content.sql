-- CONTENU RÉEL du site (utilisable en production) : catégories issues de la maquette et médias fournis par le salon.
-- Contient les coordonnées confirmées par le salon. Le catalogue est dans seed.catalog.sql.
-- Idempotent : peut être rejoué sans doublon.

insert into public.media (kind, section, path, alt, sort_order)
select v.kind, v.section, v.path, v.alt, v.ord
from (values
  ('photo','hero',   '/images/hero/hero.jpg',                       'Cliente aux cheveux longs et lisses devant l''enseigne Mariekey Expert', 1),
  ('photo','salon',  '/images/salon/salon-reception.jpg',           'Accueil du salon : comptoir noir, canapé beige et enseigne Mariekey Expert', 1),
  ('photo','salon',  '/images/salon/salon-miroir.jpg',              'Poste de coiffure avec grand miroir arrondi et fauteuil noir', 2),
  ('photo','salon',  '/images/salon/salon-lavage.jpg',              'Espace lavage du salon : bac, fauteuil noir et enseigne MKy', 3),
  ('photo','salon',  '/images/salon/salon-entree.jpg',              'Entrée du salon, fauteuil crème et parquet foncé', 4),
  ('photo','gallery','/images/gallery/lisse-noir.jpg',              'Lissage brillant, cheveux noirs longs', 1),
  ('photo','gallery','/images/gallery/blond-ombre.jpg',             'Blond ombré et ondulations', 2),
  ('photo','gallery','/images/gallery/queue-lisse.jpg',             'Cheveux lissés, raie centrale, longueur mi-dos', 3),
  ('photo','gallery','/images/gallery/ondulations-noires.jpg',      'Ondulations noires brillantes', 4),
  ('photo','gallery','/images/gallery/queue-haute-cardigan.jpg',    'Queue de cheval haute lissée', 5),
  ('photo','gallery','/images/gallery/coiffure-bordeaux.jpg',       'Coiffure bordeaux plaquée sur le côté', 6),
  ('photo','gallery','/images/gallery/queue-cote-peignoir.jpg',     'Queue de cheval sur le côté, boucles souples', 7),
  ('photo','gallery','/images/gallery/cliente-lunettes.jpg',        'Cheveux longs lissés avec raie sur le côté, de profil', 7),
  ('video','gallery','/videos/video-3-lissage-dos-2s.mp4',          'Vidéo : cheveux lissés vus de dos', 8),
  ('video','gallery','/videos/video-2-chemise-blanche-12s.mp4',     'Vidéo : cliente et queue de cheval haute', 9),
  ('video','gallery','/videos/video-1-cardigan-2s.mp4',             'Vidéo : cliente au salon', 10),
  ('photo','about',  '/images/about/outils.jpg',                    'Outils de coiffure : lisseur, ciseaux, peignes et pinces', 1)
) as v(kind, section, path, alt, ord)
where not exists (select 1 from public.media m where m.path = v.path);

-- Coordonnées confirmées par le salon (ne remplace pas une valeur déjà saisie dans /admin).
update public.salon_settings set
  phone     = coalesce(phone,     '06 16 22 51 65'),
  email     = coalesce(email,     'mariekeytouch@gmail.com'),
  whatsapp  = coalesce(whatsapp,  '06 13 42 40 89'), -- devis mariage & événements
  address   = coalesce(address,   '27 avenue Jean Jaurès, Gentilly (94)'),
  hours_note= coalesce(hours_note,'Uniquement sur rendez-vous.');

-- Horaires confirmés : mardi → samedi, 10h-19h (sur rendez-vous).
update public.opening_hours set is_open = true, open_time = '10:00', close_time = '19:00'
where weekday between 2 and 6 and open_time is null;
