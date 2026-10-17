-- Mariekey Expert — schéma principal.
-- Montants en centimes d'euro. Horaires interprétés dans le fuseau du salon (salon_settings.timezone).

create extension if not exists btree_gist;

-- ---------------------------------------------------------------------------
-- Utilitaires
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Paramètres du salon (une seule ligne)
-- ---------------------------------------------------------------------------
create table public.salon_settings (
  id boolean primary key default true check (id),
  name text not null default 'Mariekey Expert',
  timezone text not null default 'Europe/Paris',
  phone text,
  email text,
  whatsapp text, -- numéro WhatsApp dédié aux devis mariage / événements (format national ou international)
  address text,
  social jsonb not null default '{"tiktok":null,"snapchat":null,"instagram":null}'::jsonb,
  hours_note text,
  payment_mode text not null default 'full'
    check (payment_mode in ('full','deposit_fixed','deposit_percent')),
  -- deposit_fixed : centimes ; deposit_percent : pourcentage (1..100)
  deposit_value integer not null default 0 check (deposit_value >= 0),
  slot_step_minutes integer not null default 15 check (slot_step_minutes between 5 and 120),
  min_notice_hours integer not null default 12 check (min_notice_hours >= 0),
  max_advance_days integer not null default 90 check (max_advance_days between 1 and 730),
  cancellation_hours integer not null default 48 check (cancellation_hours >= 0),
  reschedule_hours integer not null default 48 check (reschedule_hours >= 0),
  -- Stripe Checkout impose une expiration minimale de 30 minutes.
  hold_minutes integer not null default 30 check (hold_minutes between 30 and 1440),
  legal jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create trigger trg_salon_settings_updated before update on public.salon_settings
  for each row execute function public.set_updated_at();
insert into public.salon_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- Profils et rôles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client' check (role in ('client','staff','admin')),
  first_name text,
  last_name text,
  email text,
  phone text,
  reminder_opt_in boolean not null default true,
  marketing_opt_in boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id, new.email,
    nullif(new.raw_user_meta_data->>'first_name',''),
    nullif(new.raw_user_meta_data->>'last_name',''),
    nullif(new.raw_user_meta_data->>'phone','')
  )
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin','staff'));
$$;

-- Empêche toute élévation de rôle par un client (seul un admin ou le service_role peut changer un rôle).
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role then
    if coalesce(auth.role(), 'service_role') <> 'service_role' and not public.is_admin() then
      raise exception 'MK_FORBIDDEN_ROLE_CHANGE';
    end if;
  end if;
  if new.internal_notes is distinct from old.internal_notes then
    if coalesce(auth.role(), 'service_role') <> 'service_role' and not public.is_staff() then
      raise exception 'MK_FORBIDDEN_NOTES_CHANGE';
    end if;
  end if;
  return new;
end $$;
create trigger trg_profiles_role_guard before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------------------------------------------------------------------------
-- Professionnelles
-- ---------------------------------------------------------------------------
create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  photo_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_professionals_updated before update on public.professionals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------
create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_categories_updated before update on public.service_categories
  for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short_description text,
  description text,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes <= 720),
  -- temps de préparation / nettoyage bloqué après la prestation
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0 and buffer_minutes <= 240),
  price_cents integer not null check (price_cents > 0),
  price_is_from boolean not null default false,
  preparation_notes text,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_category_idx on public.services(category_id);
create trigger trg_services_updated before update on public.services
  for each row execute function public.set_updated_at();

create table public.service_options (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  name text not null,
  description text,
  price_delta_cents integer not null default 0,
  duration_delta_minutes integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index service_options_service_idx on public.service_options(service_id);
create trigger trg_service_options_updated before update on public.service_options
  for each row execute function public.set_updated_at();

create table public.professional_services (
  professional_id uuid not null references public.professionals(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (professional_id, service_id)
);

-- ---------------------------------------------------------------------------
-- Horaires, exceptions, absences
-- ---------------------------------------------------------------------------
-- Plusieurs lignes par jour = plusieurs plages d'ouverture ; l'espace entre deux plages = pause.
create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7), -- ISO : 1 = lundi … 7 = dimanche
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);
create index business_hours_pro_idx on public.business_hours(professional_id, weekday);

-- Exception pour une date : fermeture (is_closed) ou horaires spécifiques (remplacent les horaires habituels).
-- professional_id NULL = tout le salon.
create table public.schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid references public.professionals(id) on delete cascade,
  on_date date not null,
  is_closed boolean not null default true,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default now(),
  check (
    (is_closed and start_time is null and end_time is null) or
    (not is_closed and start_time is not null and end_time is not null and end_time > start_time)
  )
);
create index schedule_exceptions_date_idx on public.schedule_exceptions(on_date);

-- Absences / créneaux bloqués (ponctuels).
create table public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index time_blocks_pro_idx on public.time_blocks using gist (professional_id, tstzrange(starts_at, ends_at));

-- ---------------------------------------------------------------------------
-- Rendez-vous
-- ---------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  access_token text not null unique,
  client_id uuid references public.profiles(id) on delete set null, -- uniquement si compte vérifié connecté
  professional_id uuid not null references public.professionals(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','confirmed','completed','cancelled','no_show','expired')),
  source text not null default 'online' check (source in ('online','admin')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,        -- fin de la prestation
  blocked_until timestamptz not null,  -- fin de la prestation + temps de préparation
  duration_minutes integer not null check (duration_minutes > 0),
  buffer_minutes integer not null default 0 check (buffer_minutes >= 0),
  total_cents integer not null check (total_cents >= 0),
  deposit_cents integer not null check (deposit_cents >= 0),  -- à régler en ligne
  balance_cents integer not null check (balance_cents >= 0),  -- à régler au salon
  contact_first_name text not null,
  contact_last_name text not null,
  contact_email text not null,
  contact_phone text not null,
  client_notes text,
  internal_notes text,
  expires_at timestamptz,
  cancelled_at timestamptz,
  cancelled_by text check (cancelled_by in ('client','admin','system')),
  cancel_reason text,
  rescheduled_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (blocked_until >= ends_at),
  check (total_cents = deposit_cents + balance_cents),
  check (status <> 'pending_payment' or expires_at is not null),
  -- Garantie anti-chevauchement au niveau PostgreSQL, y compris en cas de réservations simultanées.
  constraint appointments_no_overlap exclude using gist (
    professional_id with =,
    tstzrange(starts_at, blocked_until) with &&
  ) where (status in ('pending_payment','confirmed','completed'))
);
create index appointments_client_idx on public.appointments(client_id, starts_at desc);
create index appointments_start_idx on public.appointments(starts_at);
create index appointments_status_idx on public.appointments(status, expires_at);
create index appointments_email_idx on public.appointments(lower(contact_email));
create trigger trg_appointments_updated before update on public.appointments
  for each row execute function public.set_updated_at();

-- Prestation réservée : prix et durée figés au moment de la réservation.
create table public.appointment_items (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null,
  unit_price_cents integer not null,
  duration_minutes integer not null,
  buffer_minutes integer not null default 0,
  options jsonb not null default '[]'::jsonb, -- [{id,name,price_delta_cents,duration_delta_minutes}]
  line_total_cents integer not null,
  line_duration_minutes integer not null
);
create index appointment_items_appt_idx on public.appointment_items(appointment_id);

-- ---------------------------------------------------------------------------
-- Paiements (statut distinct du statut du rendez-vous)
-- ---------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete restrict,
  kind text not null check (kind in ('full','deposit','balance')),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'eur',
  status text not null default 'unpaid'
    check (status in ('unpaid','processing','paid','failed','expired','refunded','partially_refunded','needs_review')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  refunded_cents integer not null default 0 check (refunded_cents >= 0),
  failure_reason text,
  receipt_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_appt_idx on public.payments(appointment_id);
create index payments_pi_idx on public.payments(stripe_payment_intent_id);
create trigger trg_payments_updated before update on public.payments
  for each row execute function public.set_updated_at();

-- Événements webhook traités (idempotence).
create table public.webhook_events (
  id text primary key,                -- identifiant d'événement Stripe
  type text not null,
  status text not null default 'processing' check (status in ('processing','processed','failed','ignored')),
  attempts integer not null default 1,
  error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Médias, galerie, avant/après
-- ---------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'photo' check (kind in ('photo','video')),
  section text not null check (section in ('hero','salon','gallery','service','category','team','before_after','logo','about')),
  path text not null,         -- chemin /images/… (public) ou URL Storage
  alt text not null default '',
  width integer,
  height integer,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index media_section_idx on public.media(section, sort_order);

create table public.before_after_pairs (
  id uuid primary key default gen_random_uuid(),
  title text,
  before_media_id uuid not null references public.media(id) on delete restrict,
  after_media_id uuid not null references public.media(id) on delete restrict,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (before_media_id <> after_media_id)
);

-- ---------------------------------------------------------------------------
-- Notifications (outbox d'emails), journal, limitation de débit
-- ---------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  kind text not null check (kind in
    ('booking_confirmation','cancellation','reschedule','reminder','salon_notification','refund')),
  recipient text not null,
  dedupe_key text not null unique,  -- ex. reminder:<appointment>:<starts_at>
  status text not null default 'pending' check (status in ('pending','sent','failed','dead')),
  attempts integer not null default 0,
  last_error text,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_due_idx on public.notifications(status, next_attempt_at);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_idx on public.audit_log(created_at desc);

create table public.rate_limits (
  key text not null,
  window_start timestamptz not null,
  hits integer not null default 1,
  primary key (key, window_start)
);
