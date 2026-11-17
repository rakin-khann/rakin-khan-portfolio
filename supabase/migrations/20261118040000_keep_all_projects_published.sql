-- Keep portfolio projects published by default and prevent accidental unpublishing.
update public.projects set is_published = true where is_published is distinct from true;
alter table public.projects drop constraint if exists projects_always_published_check;
alter table public.projects add constraint projects_always_published_check check (is_published = true);
