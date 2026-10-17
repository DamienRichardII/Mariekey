-- Mariekey Expert — schéma du contenu du site.
-- La réservation et le paiement sont gérés par Acuity Scheduling : aucune donnée de rendez-vous ici.
-- Montants en centimes d'euro.

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
  phone text,
  email text,
  whatsapp text,      -- numéro WhatsApp dédié aux devis mariage / événements
  address text,
  social jsonb not null default '{"tiktok":null,"snapchat":null,"instagram":null}'::jsonb,
  hours_note text,
  legal jsonb not null default '{}'::jsonb, -- mentions légales (raison sociale, SIRET…) à compléter
  updated_at timestamptz not null default now()
);
create trigger trg_salon_settings_updated before update on public.salon_settings
  for each row execute function public.set_updated_at();
insert into public.salon_settings (id) values (true);

-- Horaires d'ouverture affichés sur le site (1 ligne par jour ISO : 1 = lundi … 7 = dimanche).
create table public.opening_hours (
  weekday smallint primary key check (weekday between 1 and 7),
  is_open boolean not null default false,
  open_time time,
  close_time time,
  check ((not is_open) or (open_time is not null and close_time is not null and close_time > open_time))
);
insert into public.opening_hours (weekday) select generate_series(1, 7);

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
  duration_minutes integer check (duration_minutes is null or (duration_minutes > 0 and duration_minutes <= 720)),
  price_cents integer not null check (price_cents > 0),
  price_is_from boolean not null default false,
  preparation_notes text,
  image_path text,
  -- Lien direct Acuity vers ce type de rendez-vous (facultatif ; sinon le lien global est utilisé).
  booking_url text check (booking_url is null or booking_url ~ '^https://'),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_category_idx on public.services(category_id);
create trigger trg_services_updated before update on public.services
  for each row execute function public.set_updated_at();

-- Options (affichage d'information : le choix réel se fait dans Acuity).
create table public.service_options (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  name text not null,
  description text,
  price_delta_cents integer not null default 0,
  duration_delta_minutes integer not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0
);
create index service_options_service_idx on public.service_options(service_id);

-- ---------------------------------------------------------------------------
-- Médias, galerie, avant/après
-- ---------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'photo' check (kind in ('photo','video')),
  section text not null check (section in ('hero','salon','gallery','before_after','about')),
  path text not null,   -- chemin /images/… (public) ou URL Storage
  alt text not null default '',
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
