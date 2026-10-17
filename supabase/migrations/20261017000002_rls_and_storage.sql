-- Mariekey Expert — Row Level Security et stockage.
-- Le site public ne fait que LIRE le contenu actif. Les modifications se font depuis le tableau de bord
-- Supabase (Table Editor / Storage), qui utilise le rôle service_role et contourne RLS.

alter table public.salon_settings enable row level security;
alter table public.opening_hours enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_options enable row level security;
alter table public.media enable row level security;
alter table public.before_after_pairs enable row level security;

create policy settings_read on public.salon_settings for select using (true);
create policy hours_read on public.opening_hours for select using (true);
create policy categories_read on public.service_categories for select using (is_active);
create policy services_read on public.services for select using (is_active);
create policy options_read on public.service_options for select using (is_active);
create policy media_read on public.media for select using (is_active);
create policy pairs_read on public.before_after_pairs for select using (is_active);

revoke all on all tables in schema public from anon, authenticated;
grant select on public.salon_settings, public.opening_hours, public.service_categories, public.services,
  public.service_options, public.media, public.before_after_pairs to anon, authenticated;
grant all on all tables in schema public to service_role;

-- Stockage : bucket public en lecture (images jusqu'à 50 Mo, vidéos mp4) ; l'écriture passe par le tableau de bord.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 52428800, array['image/jpeg','image/png','image/webp','image/avif','video/mp4'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy site_media_read on storage.objects for select using (bucket_id = 'site-media');
