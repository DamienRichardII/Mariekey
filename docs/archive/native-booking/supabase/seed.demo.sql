-- DONNÉES DE DÉMONSTRATION — à n'utiliser qu'en développement / préproduction.
-- Les prix, durées, horaires et noms ci-dessous sont des PLACEHOLDERS, pas des tarifs réels du salon.
-- Ne jamais exécuter ce fichier sur la base de production : renseigner le vrai catalogue via /admin.
-- Idempotent : peut être rejoué sans doublon.

-- Prérequis : seed.content.sql (catégories et médias réels) doit avoir été exécuté avant ce fichier.

insert into public.professionals (id, display_name, sort_order)
values ('00000000-0000-4000-8000-000000000001', 'Marie (démo)', 1)
on conflict (id) do nothing;

insert into public.services
  (slug, category_id, name, short_description, duration_minutes, buffer_minutes, price_cents, price_is_from, preparation_notes, sort_order)
select v.slug, c.id, v.name, v.descr, v.dur, v.buf, v.price, v.from_, v.prep, v.ord
from (values
  ('lissage-demo',       'lissage',         'Lissage (démo)',          'Donnée de démonstration — description à rédiger.', 120, 15,  8000, false, 'Venir les cheveux démêlés. (démo)', 1),
  ('pose-perruque-demo', 'pose-perruque',   'Pose de perruque (démo)', 'Donnée de démonstration — description à rédiger.',  90, 10,  6000, true,  'Apporter la perruque. (démo)',     1),
  ('tresses-demo',       'tresses',         'Tresses (démo)',          'Donnée de démonstration — description à rédiger.', 180, 15, 12000, true,  null,                              1),
  ('coloration-demo',    'coloration',      'Coloration (démo)',       'Donnée de démonstration — description à rédiger.', 150, 15,  9000, true,  null,                              1),
  ('soin-capillaire-demo','soin-capillaire','Soin capillaire (démo)',  'Donnée de démonstration — description à rédiger.',  60, 10,  4500, false, null,                              1)
) as v(slug, cat, name, descr, dur, buf, price, from_, prep, ord)
join public.service_categories c on c.slug = v.cat
on conflict (slug) do nothing;

insert into public.service_options (service_id, name, price_delta_cents, duration_delta_minutes, sort_order)
select s.id, 'Option démo : soin express', 1500, 20, 1
from public.services s
where s.slug = 'lissage-demo'
  and not exists (select 1 from public.service_options o where o.service_id = s.id);

insert into public.professional_services (professional_id, service_id)
select '00000000-0000-4000-8000-000000000001', s.id from public.services s where s.slug like '%-demo'
on conflict do nothing;

-- Horaires du salon (confirmés : mardi → samedi, 10h-19h, sur rendez-vous) rattachés à la professionnelle de démonstration.
-- En production : créer la/les vraies professionnelles dans /admin puis saisir leurs horaires.
insert into public.business_hours (professional_id, weekday, start_time, end_time)
select '00000000-0000-4000-8000-000000000001', d, '10:00'::time, '19:00'::time
from generate_series(2, 6) d
where not exists (
  select 1 from public.business_hours h
  where h.professional_id = '00000000-0000-4000-8000-000000000001' and h.weekday = d
);
