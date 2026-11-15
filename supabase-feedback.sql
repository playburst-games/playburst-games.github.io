-- Feedback box. Paste into Supabase: SQL Editor -> New query -> Run
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  game text not null default 'site',
  rating smallint,
  message text not null default '',
  contact text,
  uid text not null,
  page text
);
alter table public.feedback enable row level security;
-- visitors may only ADD feedback; nobody can read it from the website (no select policy)
drop policy if exists "anyone can send feedback" on public.feedback;
create policy "anyone can send feedback" on public.feedback for insert to anon, authenticated
  with check (char_length(message) <= 1000 and char_length(coalesce(contact,'')) <= 80 and (rating is null or rating between 1 and 4) and char_length(game) <= 40 and char_length(uid) <= 80);
grant insert on public.feedback to anon, authenticated;
create or replace function public.check_feedback() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int; flood int;
begin
  if char_length(btrim(new.message)) < 2 and new.rating is null then raise exception 'empty'; end if;
  select count(*) into recent from public.feedback where uid = new.uid and created_at > now() - interval '1 minute';
  if recent >= 3 then raise exception 'slow down'; end if;
  select count(*) into flood from public.feedback where created_at > now() - interval '1 minute';
  if flood >= 60 then raise exception 'slow down'; end if;
  new.created_at := now();
  return new;
end $$;
drop trigger if exists feedback_check on public.feedback;
create trigger feedback_check before insert on public.feedback for each row execute function public.check_feedback();
