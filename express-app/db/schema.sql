-- Schema for the hero data. Run this once in the Supabase SQL editor, then run
-- `npm run migrate` to load the seed.
--
-- Only heroes moved to Postgres. The Pokédex is deliberately still in memory —
-- see the README. Migrating one resource at a time means the API keeps working
-- throughout instead of having a big-bang cutover where nothing runs until
-- everything is done.

-- Order matters on drop: children before parents, or the foreign keys complain.
drop table if exists archive_entries;
drop table if exists hero_relationships;
drop table if exists hero_stats;
drop table if exists hero_powers;
drop table if exists heroes;

-- The roster. Only the fields every hero has; the optional ones are nullable
-- because ten of the eighteen have no detail record.
create table heroes (
  id                integer primary key,
  name              text not null unique,
  real_name         text not null,
  team              text not null,
  origin            text,
  first_appearance  text,
  creator           text,
  location          text,
  quote             text
);

-- Powers are a list. A comma-joined text column would make "which heroes can
-- fly" a LIKE '%Flight%' scan, which also matches a power called "Flightless".
create table hero_powers (
  hero_id  integer not null references heroes(id) on delete cascade,
  power    text not null,
  primary key (hero_id, power)
);

-- Stats are 1:1 but only exist for eight heroes. A separate table states
-- "this may not exist" more honestly than six nullable columns on `heroes`,
-- and it keeps the roster table meaningful for every row in it.
create table hero_stats (
  hero_id       integer primary key references heroes(id) on delete cascade,
  strength      integer not null,
  speed         integer not null,
  intelligence  integer not null,
  durability    integer not null,
  energy        integer not null,
  fighting      integer not null
);

-- Allies and enemies are the same shape of fact with opposite sign, so one
-- table with a `kind` column rather than two near-identical tables. The CHECK
-- is what stops 'freind' from ever getting in.
create table hero_relationships (
  hero_id       integer not null references heroes(id) on delete cascade,
  related_name  text not null,
  kind          text not null check (kind in ('ally', 'enemy')),
  primary key (hero_id, related_name, kind)
);

-- The 1,400-row archive. This is the table that most deserved a database: it
-- was a 1,400-line string literal inside a React component, re-parsed on every
-- render.
--
-- The seed carried a `team` column on every row, but a hero's team is a
-- property of the hero, not of an archive entry — and all 1,400 rows agreed
-- with the roster, confirming it was pure duplication. It is dropped here and
-- recovered with a join. Likewise the seed's `hero` was a name string; it
-- becomes a foreign key, which turns "Batman" appearing 78 times from 78
-- chances to misspell it into one.
create table archive_entries (
  id        integer primary key,
  hero_id   integer not null references heroes(id) on delete cascade,
  note      text not null,
  location  text not null,
  year      integer not null
);

-- The two ways the app actually queries this table.
create index idx_archive_hero on archive_entries (hero_id);
create index idx_archive_year on archive_entries (year);

-- Supabase enables row-level security by default and denies everything until a
-- policy says otherwise. This data is a public catalogue with nothing
-- user-owned in it, so read-only public access is correct — but it has to be
-- said explicitly, because the safe default is to deny.
alter table heroes              enable row level security;
alter table hero_powers         enable row level security;
alter table hero_stats          enable row level security;
alter table hero_relationships  enable row level security;
alter table archive_entries     enable row level security;

create policy "public read" on heroes             for select using (true);
create policy "public read" on hero_powers        for select using (true);
create policy "public read" on hero_stats         for select using (true);
create policy "public read" on hero_relationships for select using (true);
create policy "public read" on archive_entries    for select using (true);
