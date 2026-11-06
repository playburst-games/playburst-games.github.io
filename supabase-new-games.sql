-- Allow the new games (Rocket Aim, Blend In) on the leaderboard. Paste into Supabase: SQL Editor -> New query -> Run
alter table public.scores drop constraint if exists scores_game_check;
alter table public.scores add constraint scores_game_check check (game in ('echo-wars','just-exit','rocket-aim','blend-in'));
create or replace function public.check_score() returns trigger
language plpgsql security definer set search_path = public as $$
declare recent int; flood int;
begin
  new.name := btrim(regexp_replace(new.name, '[^[:alnum:] _.\-!?]', '', 'g'));
  if char_length(new.name) < 1 then raise exception 'bad name'; end if;
  if lower(regexp_replace(new.name, '[^[:alnum:]]', '', 'g')) ~ '(fuck|fuk|shit|bitch|cunt|pussy|whore|slut|asshole|nigg|madarchod|bhenchod|behenchod|chutiya|chutia|bhosd)'
     or lower(new.name) ~ '\m(dick|cock|sex|porn|rape|fag|penis|vagina|bastard|mc|bc|gandu|lund|lauda|loda|randi|harami|kamina)\M'
  then raise exception 'bad name'; end if;
  if new.game = 'just-exit' then
    if new.score < 0 or new.score > 15 then raise exception 'bad score'; end if;
    if new.wave is null or new.wave < 0 or new.wave > 1000000 then raise exception 'bad deaths'; end if;
  elsif new.game = 'echo-wars' then
    if new.score < 0 or new.score > 3000000 then raise exception 'bad score'; end if;
    if new.wave is not null and (new.wave < 1 or new.wave > 2000) then raise exception 'bad wave'; end if;
  elsif new.game = 'rocket-aim' then
    if new.score < 0 or new.score > 2000000 then raise exception 'bad score'; end if;
    if new.wave is not null and (new.wave < 0 or new.wave > 20000) then raise exception 'bad wave'; end if;
  elsif new.game = 'blend-in' then
    if new.score < 0 or new.score > 500000 then raise exception 'bad score'; end if;
    if new.wave is not null and (new.wave < 0 or new.wave > 1000) then raise exception 'bad wave'; end if;
  end if;
  select count(*) into recent from public.scores where uid = new.uid and created_at > now() - interval '1 minute';
  if recent >= 6 then raise exception 'slow down'; end if;
  select count(*) into flood from public.scores where game = new.game and created_at > now() - interval '1 minute';
  if flood >= 300 then raise exception 'busy'; end if;
  new.created_at := now();
  return new;
end $$;
