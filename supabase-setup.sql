-- Paste this into Supabase: SQL Editor -> New query -> Run
create table if not exists public.scores (
  id bigint generated always as identity primary key,
  game text not null check (game in ('echo-wars','just-exit')),
  uid text not null check (char_length(uid) between 8 and 64),
  name text not null check (char_length(name) between 1 and 16),
  score integer not null check (score between 0 and 100000000),
  wave integer,
  created_at timestamptz not null default now()
);
create index if not exists scores_game_score on public.scores (game, score);
alter table public.scores enable row level security;
drop policy if exists "anyone can read scores" on public.scores;
create policy "anyone can read scores" on public.scores for select to anon, authenticated using (true);
drop policy if exists "anyone can add a score" on public.scores;
create policy "anyone can add a score" on public.scores for insert to anon, authenticated with check (true);
grant select, insert on public.scores to anon, authenticated;
