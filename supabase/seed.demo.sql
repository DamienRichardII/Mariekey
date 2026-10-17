-- DONNÉES DE DÉMONSTRATION — développement / préproduction uniquement.
-- Prix et durées = PLACEHOLDERS, pas les tarifs réels du salon. Ne jamais exécuter en production.
-- Prérequis : seed.content.sql. Idempotent.
insert into public.services (slug, category_id, name, short_description, duration_minutes, price_cents, price_is_from, preparation_notes, sort_order)
select v.slug, c.id, v.name, v.descr, v.dur, v.price, v.from_, v.prep, 1
from (values
  ('lissage-demo','lissage','Lissage (démo)','Donnée de démonstration — description à rédiger.',120,8000,false,'Venir les cheveux démêlés. (démo)'),
  ('pose-perruque-demo','pose-perruque','Pose de perruque (démo)','Donnée de démonstration — description à rédiger.',90,6000,true,'Apporter la perruque. (démo)'),
  ('tresses-demo','tresses','Tresses (démo)','Donnée de démonstration — description à rédiger.',180,12000,true,null),
  ('coloration-demo','coloration','Coloration (démo)','Donnée de démonstration — description à rédiger.',150,9000,true,null),
  ('soin-capillaire-demo','soin-capillaire','Soin capillaire (démo)','Donnée de démonstration — description à rédiger.',60,4500,false,null)
) as v(slug, cat, name, descr, dur, price, from_, prep)
join public.service_categories c on c.slug = v.cat
on conflict (slug) do nothing;

insert into public.service_options (service_id, name, price_delta_cents, duration_delta_minutes, sort_order)
select s.id, 'Option démo : soin express', 1500, 20, 1 from public.services s
where s.slug = 'lissage-demo' and not exists (select 1 from public.service_options o where o.service_id = s.id);
