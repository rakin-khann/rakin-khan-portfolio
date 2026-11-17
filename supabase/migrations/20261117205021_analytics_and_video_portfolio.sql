-- Analytics event collection and multi-quality video portfolio metadata.
create table if not exists public.portfolio_media (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Videography',
  description text,
  poster_url text,
  video_360_url text,
  video_480_url text,
  video_720_url text,
  video_1080_url text,
  video_2160_url text,
  default_quality text not null default 'auto' check (default_quality in ('auto','360','480','720','1080','2160')),
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_media_has_video check (
    video_360_url is not null or video_480_url is not null or video_720_url is not null
    or video_1080_url is not null or video_2160_url is not null
  )
);
create index if not exists portfolio_media_published_sort_idx
  on public.portfolio_media (is_published, sort_order, created_at desc);
alter table public.portfolio_media enable row level security;
create policy "Admins manage portfolio media records" on public.portfolio_media
  for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
create policy "Public can read published portfolio media records" on public.portfolio_media
  for select to anon, authenticated using (is_published = true);
grant select, insert, update, delete on public.portfolio_media to authenticated;
grant select on public.portfolio_media to anon;

create table if not exists public.site_analytics_events (
  id bigint generated always as identity primary key,
  session_id text not null check (char_length(session_id) between 16 and 80),
  event_name text not null check (event_name in ('page_view','click','project_view','video_play','video_complete','engagement')),
  page_path text not null default '/',
  target text,
  referrer_host text,
  country_code text,
  created_at timestamptz not null default now()
);
create index if not exists site_analytics_created_idx on public.site_analytics_events (created_at desc);
create index if not exists site_analytics_session_idx on public.site_analytics_events (session_id, created_at desc);
create index if not exists site_analytics_event_idx on public.site_analytics_events (event_name, created_at desc);
alter table public.site_analytics_events enable row level security;
create policy "Visitors can record minimal analytics events" on public.site_analytics_events
  for insert to anon, authenticated
  with check (
    char_length(session_id) between 16 and 80
    and event_name in ('page_view','click','project_view','video_play','video_complete','engagement')
    and char_length(page_path) <= 300
    and (target is null or char_length(target) <= 160)
    and (referrer_host is null or char_length(referrer_host) <= 160)
  );
create policy "Admins can read analytics events" on public.site_analytics_events
  for select to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));
grant insert on public.site_analytics_events to anon, authenticated;
grant select on public.site_analytics_events to authenticated;
