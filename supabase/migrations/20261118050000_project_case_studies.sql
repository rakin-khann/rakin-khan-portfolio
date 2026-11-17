-- Extended project case studies with client, process and outcome information.
alter table public.projects
  add column if not exists client_name text,
  add column if not exists role_description text,
  add column if not exists tools_used text,
  add column if not exists project_goal text,
  add column if not exists challenge text,
  add column if not exists solution text,
  add column if not exists outcome text,
  add column if not exists project_duration text;
