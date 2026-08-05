# Final Project - Barrett Curry

Two apps in one repo. `express-app` is a Node/Express API, `expo-app` is an
Expo/React Native client.

**Live API docs:** https://final-project-barrett-curry.onrender.com/docs

That page lists all 30 endpoints and every one has a "Try it" button that runs
against the live server. The API is deployed on Render and the hero data is in
Supabase Postgres.

## Running it

```bash
cd express-app && npm install && npm start   # http://localhost:3000
cd expo-app    && npm install && npm run web

cd express-app && npm test   # 100 tests
cd expo-app    && npm test   # 40 tests
```

The API runs with no config. Without Supabase credentials it falls back to an
in-memory copy of the same data, which is what the tests use. `GET /health`
tells you which one answered.

## Things that are not obvious from the repo

- **The Supabase migration has been run.** The schema is in
  `express-app/db/schema.sql` and the loader is
  `express-app/scripts/migrate-to-supabase.mjs`. It put 18 heroes, 70 powers, 8
  stat blocks, 64 relationships and 1400 archive rows into five tables.
- **Credentials are not in the repo.** Copy `express-app/.env.example` to
  `.env` and fill it in from your own Supabase project. Render has the same
  values set as environment variables.
- **Only the heroes moved to Postgres.** The Pokemon data is still in memory on
  purpose, so the migration was one resource at a time instead of a big
  rewrite where nothing works until everything is done.
- **The repo is mirrored.** Render deploys from the mirror, not the classroom
  repo, so pushes go to both remotes.

---

## commit #1 - clean up app.js

- this was a mess of a file. There were endpoints and data all jumbled, needed to be cleaned up
- split it into three layers. the data sits in `src/data`, the rules sit in
  `src/domain`, and the HTTP handlers sit in `src/routes`. app.js went from 917
  lines to 85 and now only wires things together
- once the logic was in one place the duplication was obvious. the "count how
  many pokemon have each type" loop had been written out three separate times.
  the type matchup endpoint was ten near identical if blocks and is now two
  lookup tables
- all 73 existing tests passed without being touched, which is the proof it
  changed no behavior

## commit #2 - add /heroes

- give the /heroes service its own backing code to run
- the two apps in this repo did not talk to each other at all. the API served
  pokemon and the client hardcoded superheroes
- worse, the client held the same roster twice. an 18 entry list in index.tsx
  and a separate 8 entry detail object in detail.tsx. they had already drifted
  so ten heroes had no detail record
- adding a whole second resource took one connector, one service, one router and
  a single line in app.js. no pokemon code changed. that is the payoff from
  commit #1

## commit #3 - database migration

- pull out the data for the superheroes endpoint to pull from and migrate it into supabase
- five tables with real foreign keys. powers, stats and relationships each get
  their own table instead of being crammed into columns
- the archive seed repeated each hero's team on all 1400 rows. all 1400 agreed
  with the roster, so it was pure duplication. dropped the column and get it
  back with a join
- the store has two implementations behind one interface. supabase when
  credentials exist, in memory otherwise. tests use the in memory one so they
  need no network and no credentials
- everything above the connector had to become async, but the rules themselves
  did not change. only how the rows arrive

## commit #4 - client fetches instead of hardcoding

- the expo app now asks the API for heroes instead of shipping them
- index.tsx went from 2354 lines to about 870. the 1400 row archive was a giant
  string literal inside a react component that got re-split on every render
- added loading and error states, and a fetch layer so the base URL lives in one
  place
- the screen tests mock the hook rather than the network, so they stay fast and
  do not need a server

## commit #5 - CI

- github actions runs both test suites on every push and PR
- a matrix of node 20 and 22 across both packages, so four jobs. `npm ci`
  instead of `npm install` so it installs exactly what the lockfile pins
- `fail-fast: false` so one red job does not hide the other three

## commit #6 - semantic versioning

- both packages got real version numbers and a CHANGELOG that argues which
  number moves and why
- express-app went to 2.0.0 as MAJOR even though almost everything was additive.
  two changes were breaking. malformed ids now answer 400 where they used to
  answer 404, and unknown routes return JSON instead of an HTML page
- the point being that semver does not grade on whether a change is good, only
  on whether it can break someone

## commit #7 - dedupe the tests

- 73 tests became 54 with no loss of endpoint coverage
- there were six near identical "top stat" tests and five "compare" tests all
  hitting the same code path
- a test that duplicates another one costs time on every run and gives no extra
  signal when it fails

## commit #8 - archive into postgres and filter server side

- `GET /archive` takes `?search=` and `?team=` so only matching rows cross the
  network. before this the client pulled all 1400 and filtered them in
  javascript on every keystroke
- the team filter becomes an indexed `hero_id IN (...)` lookup, which is what
  the index on that column was for
- search is a union across hero name, note and city. those live in two tables,
  so the hero half resolves against the 18 row roster first and the halves merge
- requests are debounced 250ms and matched against the response that answered
  them, so a slow "Aqua" cannot land after a fast "Aquaman" and overwrite it
- sorting stays on the client on purpose. it reorders what came back rather than
  choosing what comes back, so it saves a round trip

## commit #9 - fix the detail screen

- the directory listed 18 heroes but detail.tsx read from a hardcoded object
  holding 8. tapping any of the other ten said "Hero not found" for a hero you
  could see on the previous screen
- that is what two copies of one dataset eventually does. they drift, and the
  drift shows up as a bug that looks like missing data
- detail.tsx went from 604 lines to about 380

## commit #10 - fix ally links

- the client mapped ally names to ids with a hardcoded 25 entry table and five
  entries were wrong. each pointed at the hero whose page it appeared on rather
  than at itself, so clicking "Thor" on Iron Man's page went back to Iron Man.
  Captain America went to Spider-Man
- the server derives it from the roster now, so that mistake is not possible
- supporting characters who are not heroes, like Alfred and Aunt May, resolve to
  null and render as plain text instead of links to some arbitrary hero

## commit #11 - search and team filters cancelled each other out

- `?search=Gotham&team=Justice League` returned 0 instead of 78
- the two filters are an OR nested inside an AND. rows on this team where the
  term appears in the note, the city, OR the hero name. I had collapsed that
  into one filter and it dropped every row whose city matched but whose hero
  name did not
- underneath was a worse one. the in memory store searched hero names and the
  supabase store did not, so the test suite was green against behavior that
  never ran in production. both mean the same thing now

## commit #12 - a trainer with no pokemon crashed the server

- `reduce` on an empty array with no starting value throws, so `/trainers/:id/ace`
  and `/team-summary` returned a 500 for any trainer without a team
- unreachable with the seeded data since both trainers have full teams, which is
  exactly why it lasted. a team naming pokemon that no longer exist hits it too
- empty teams report null for ace, average power and strongest pokemon. null
  because 0/0 is not a number, and because inventing an ace is worse than saying
  there is not one
- tested against the domain directly, since no request can produce a teamless
  trainer with the current data

## commit #13 - remove the dead /bug endpoint

- it returned a hardcoded string about Venomoth and had no caller
- it only survived the refactor because a test guarded it, which is a test doing
  the opposite of its job. it was pinning dead code in place
- removing a public route is breaking, so it got its own commit and a bump to
  3.0.0

## commit #14 - generate the endpoint index

- `GET /` advertised 7 endpoints. there are 30. it never mentioned /heroes,
  /archive or /health. it went stale inside a single working session
- the mount table in app.js is now the one source of truth for prefixes and the
  paths inside each router are read from the router
- a test walks every advertised path and requests it, so a route that is listed
  but not mounted fails the build

## commit #15 - docs page

- live at https://final-project-barrett-curry.onrender.com/docs
- rendered from the same catalog `GET /` serves, so it cannot describe a route
  that does not exist or miss one that does
- plain server rendered HTML, no build step and no dependencies. a docs page
  that needs its own toolchain is a docs page that stops working
- every endpoint has a "Try it" button that runs against the same origin, so the
  examples are real rather than decorative
- the prose lives in `descriptions.js` rather than next to each route, which can
  drift. four tests hold it shut. every route must be documented, every
  description must map to a real route, every entry needs a summary, and every
  example is requested during the test run and must return 200

## commit #16 - theme the navigator

- `_layout.tsx` was five lines. unconfigured, expo-router uses react-navigation's
  light theme, so there was a white header with the literal route filename
  "index" in it sitting on top of a near black app
- that bar was the most visible thing on screen and no amount of color work
  fixes it
- both screens already draw their own title and back button, so the header is
  hidden rather than restyled
- also fixed the status bar, the white flash on every navigation, and the safe
  area

## commit #17 - component layer and palette

- there was no components folder. index.tsx was 800 lines with the same pill
  button written out inline eight times and the same panel wrapper six times
- added Screen, Pill, Button, Section, TeamBadge and HeroCard. every one passes
  testID through since the tests pin 21 of them
- the surface colors were about 4 points of lightness apart, which is at the
  edge of what you can see. a card and the page under it looked the same and
  only a hairline separated them, so 18 cards read as a wireframe
- the gold was nearly as bright as the body text and was being spent on filter
  chips. five solid gold blocks were on screen before you touched anything
- stat bars were reusing the two team colors as a size scale, so on Iron Man's
  page the badge was red and his strong stats were red. same colors, two
  meanings, one screen

## commit #18 - rebuild the directory around the heroes

- there were 31 controls above the first hero card and 20 of them worked on a
  different dataset. the first card was about 1700pt down the page
- reordered so it goes search, one control rail, one line of counts, then the
  heroes. featured hero, team breakdown and the archive all moved below. 9
  controls before the first hero now
- cards listed every power as its own bullet plus a "tap for more details" line.
  powers collapse to one line and the hint is gone since the whole card is
  tappable
- the roster is a grid on wide screens, 3 columns over 1100px. content caps at
  1040px. nothing capped it before, so in a 1400px browser a card was 1368px
  wide to hold twenty characters
- fixed some real bugs while in there. no pressable in either file read its
  pressed state so the app had no press or hover feedback at all. the favourite
  button click bubbled on web so tapping the heart also opened the hero. the
  heart overlapped long hero names. and the detail screen printed
  "Power score: /60" for the ten heroes with no stats

---

## Where it ended up

| | before | after |
|---|---|---|
| express-app/app.js | 917 lines | 85 |
| expo-app/app/index.tsx | 2354 lines | ~870 |
| expo-app/app/detail.tsx | 604 lines | ~380 |
| tests | 106 | 140 |
| copies of the hero roster | 2 hardcoded | 1 postgres table |
| endpoints advertised by GET / | 7 of 30 | 30 of 30 |

## Known gaps

- descriptions for the docs page sit in their own file rather than next to each
  route. the tests catch drift but adjacency would prevent it
- the hero half of an archive search is matched in javascript against the 18 row
  roster before postgres does the rest. fine at this size, but the app is
  deciding something the database could
- the archive is still on the main screen. it should be its own route, which
  means moving ten tests
