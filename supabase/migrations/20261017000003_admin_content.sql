-- Mariekey Expert — contenus modifiables depuis /admin : textes des pages, avis, articles.
-- Lecture publique du contenu publié ; écriture réservée à service_role (actions serveur de /admin).

create table if not exists public.site_content (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  author      text not null,
  body        text not null,
  rating      smallint not null default 5 check (rating between 1 and 5),
  source      text not null default 'Google',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  excerpt       text,
  body          text not null default '',
  image_path    text,
  image_alt     text,
  is_published  boolean not null default false,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.reviews enable row level security;
alter table public.articles enable row level security;

create policy site_content_read on public.site_content for select using (true);
create policy reviews_read on public.reviews for select using (true);
create policy articles_read on public.articles for select using (is_published and published_at <= now());

revoke all on public.site_content, public.reviews, public.articles from anon, authenticated;
grant select on public.site_content, public.reviews, public.articles to anon, authenticated;
grant all on public.site_content, public.reviews, public.articles to service_role;
