-- Mariekey Expert — Row Level Security et stockage.
-- Principe : lecture publique du catalogue actif ; données personnelles limitées à leur propriétaire ;
-- toute écriture sensible passe par le serveur (service_role) après contrôle d'autorisation.

alter table public.salon_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.professionals enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.service_options enable row level security;
alter table public.professional_services enable row level security;
alter table public.business_hours enable row level security;
alter table public.schedule_exceptions enable row level security;
alter table public.time_blocks enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.media enable row level security;
alter table public.before_after_pairs enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;
alter table public.rate_limits enable row level security;

-- Lecture publique ----------------------------------------------------------
create policy salon_settings_public_read on public.salon_settings for select using (true);
create policy categories_public_read on public.service_categories for select using (is_active or public.is_staff());
create policy services_public_read on public.services for select using (is_active or public.is_staff());
create policy options_public_read on public.service_options for select using (is_active or public.is_staff());
create policy professionals_public_read on public.professionals for select using (is_active or public.is_staff());
create policy professional_services_public_read on public.professional_services for select using (true);
create policy business_hours_public_read on public.business_hours for select using (true);
create policy schedule_exceptions_public_read on public.schedule_exceptions for select using (true);
create policy media_public_read on public.media for select using (is_active or public.is_staff());
create policy pairs_public_read on public.before_after_pairs for select using (is_active or public.is_staff());

-- Écriture réservée aux administrateurs (défense en profondeur : le serveur vérifie aussi le rôle).
create policy salon_settings_admin_write on public.salon_settings for all using (public.is_admin()) with check (public.is_admin());
create policy categories_admin_write on public.service_categories for all using (public.is_admin()) with check (public.is_admin());
create policy services_admin_write on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy options_admin_write on public.service_options for all using (public.is_admin()) with check (public.is_admin());
create policy professionals_admin_write on public.professionals for all using (public.is_admin()) with check (public.is_admin());
create policy professional_services_admin_write on public.professional_services for all using (public.is_admin()) with check (public.is_admin());
create policy business_hours_admin_write on public.business_hours for all using (public.is_admin()) with check (public.is_admin());
create policy schedule_exceptions_admin_write on public.schedule_exceptions for all using (public.is_admin()) with check (public.is_admin());
create policy media_admin_write on public.media for all using (public.is_admin()) with check (public.is_admin());
create policy pairs_admin_write on public.before_after_pairs for all using (public.is_admin()) with check (public.is_admin());

-- Absences : visibles et gérées par le personnel uniquement.
create policy time_blocks_staff_read on public.time_blocks for select using (public.is_staff());
create policy time_blocks_admin_write on public.time_blocks for all using (public.is_admin()) with check (public.is_admin());

-- Profils : chacun lit et modifie le sien (le rôle est protégé par trigger) ; le personnel lit tout.
create policy profiles_self_read on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_self_update on public.profiles for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Rendez-vous, prestations réservées, paiements : lecture par la propriétaire, ou par le personnel.
-- Aucune politique d'insertion/modification : tout passe par les fonctions serveur.
create policy appointments_owner_read on public.appointments for select
  using (client_id = auth.uid() or public.is_staff());
create policy appointment_items_owner_read on public.appointment_items for select
  using (exists (select 1 from public.appointments a
                  where a.id = appointment_id and (a.client_id = auth.uid() or public.is_staff())));
create policy payments_owner_read on public.payments for select
  using (exists (select 1 from public.appointments a
                  where a.id = appointment_id and (a.client_id = auth.uid() or public.is_staff())));

-- Journal et notifications : lecture administrateur uniquement. webhook_events et rate_limits : aucun accès client.
create policy audit_admin_read on public.audit_log for select using (public.is_admin());
create policy notifications_admin_read on public.notifications for select using (public.is_admin());

-- Droits de table : on retire tout au rôle anon puis on n'accorde que le nécessaire.
revoke all on all tables in schema public from anon, authenticated;
grant select on
  public.salon_settings, public.service_categories, public.services, public.service_options,
  public.professionals, public.professional_services, public.business_hours,
  public.schedule_exceptions, public.media, public.before_after_pairs
to anon, authenticated;
grant select on public.profiles, public.appointments, public.appointment_items, public.payments,
  public.time_blocks, public.audit_log, public.notifications to authenticated;
grant update (first_name, last_name, phone, reminder_opt_in, marketing_opt_in) on public.profiles to authenticated;
grant insert, update, delete on
  public.salon_settings, public.service_categories, public.services, public.service_options,
  public.professionals, public.professional_services, public.business_hours,
  public.schedule_exceptions, public.media, public.before_after_pairs, public.time_blocks
to authenticated; -- bornées par les politiques admin ci-dessus
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- Stockage : bucket public en lecture, écriture admin, types et tailles contrôlés.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-media', 'site-media', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/avif','video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy site_media_public_read on storage.objects for select using (bucket_id = 'site-media');
create policy site_media_admin_insert on storage.objects for insert with check (bucket_id = 'site-media' and public.is_admin());
create policy site_media_admin_update on storage.objects for update using (bucket_id = 'site-media' and public.is_admin());
create policy site_media_admin_delete on storage.objects for delete using (bucket_id = 'site-media' and public.is_admin());
