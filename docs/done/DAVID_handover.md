# Kyoto AI Lab: handover for David

Written 24 November 2026. It covers everything from the first commit on 18 November to today, in plain language. File names appear only where you might want to look something up.

## The short version

Kyoto AI Lab is a phone app (English and Japanese) that encourages people to **walk through Kyoto instead of crowding onto buses**. A fox guide leads you along short, hand-picked walks. At each stop you collect a stamp and earn points. Points unlock vouchers for pretend shops.

In six days it went from an empty folder of planning documents to a working prototype with:

- a real, pannable map of Kyoto
- three curated walks
- GPS and simulated walking
- stamps, points and vouchers
- a fox mascot
- a home screen styled after a fitness app called Macadam

**Everything is a demo.** Nothing runs on a server, there are no accounts, and no real shops or real money are involved. The vouchers say "DEMO — NOT REDEEMABLE" on purpose. All progress is saved only in the phone's browser.

## Timeline: how we got here

### Week 1, Nov 18: planning, scaffolding and the map

- **Starter kit (JKang78).** The project began as a set of planning documents: product spec, design rules, build plan and reference images. There was no app yet. The build plan split the work into phases 0 to 4 and said to do one phase at a time.
- **Phase 0, the shell.** A first app with the bottom tab bar, English/Japanese language switch and a nickname screen. No registration.
- **Phase 1, the map (jnxatemail-ux).**
  - A real Kyoto map was added. **Decision:** use the free MapLibre/OpenFreeMap map instead of Google Maps. It needs no account or billing, and its look can be matched to the pastel reference design. The comparison is in `docs/DECISIONS.md`.
  - GPS was added as opt-in, never automatic.
  - A separate **Demo Mode** places you at a pretend point near Gion-Shijo, so the app can be shown without being in Kyoto.
- **Phase 2, walks and discovery.** Three real walking routes were added, each with sources recorded:
  - Shijō to Yasaka
  - Kamo riverside
  - Yasaka and Maruyama Park

  Typed searches like "short riverside walk" match these routes. They don't use AI, because we didn't want the app to invent paths.

### Week 1, Nov 19: testing and the game loop (David)

- Review and fixes for Phase 2: the app now recovers if the map fails to load.
- **Phase 3, the game loop.** You start a walk, collect a stamp at each stop, finish the walk, earn points and unlock a demo voucher. Simulated and GPS check-ins both work, and progress survives reloading.
- Many review documents were written in `docs/done/`, including a two-minute test script for the Kamo walk.

### Nov 24, a big day: the redesign and several changes of direction

1. **A new spec arrives ("Kyoto Flow").** A new design and engineering document proposed a different look ("Kyoto Ink & Washi"), a draggable bottom sheet on the map, and a bilingual voucher-redemption screen. The app was rebuilt around it.
   - Tabs went from five to four: **Explore, Quests, Wallet, Settings**.
   - Phase 3 coins became "points".
2. **We added Quests, Wallet and a staff redemption screen, plus the fox art.**
3. **An audit, and a pivot back to honesty.**
   - A review found the prototype was making claims it couldn't back up.
   - We removed or changed:
     - The invented "off-peak 6–10am bonus" (there is no real bus or crowd data behind it). It became two clearly labelled **demo scenarios** that a presenter switches on in Me → Demo controls.
     - The voucher screens that said "show this to staff". These are now a "Demo redemption preview", and every voucher carries the label **DEMO — NOT REDEEMABLE**.
     - The transit voucher. We can't claim anything about real transport, so it was replaced by a fictional postcard set.
     - "Crowd: calm" when we had no data. The app now says **Unknown**.
     - "No mapped steps". It now says **Step-free: unknown**, because we haven't surveyed the routes.
   - The tabs were renamed **Explore, Missions, Rewards, Me**, and Settings moved inside Me.
   - **Rule of thumb for later work:** if a nice-looking spec conflicts with honesty about demo data, honesty wins. `docs/DECISIONS.md` records this.
4. **Fox artwork cleaned up.** The team's five fox poses were kept untouched in `design/mascot/originals/`. A script produces smaller, consistently framed copies for the app.
5. **Self-hosted fonts.** The build kept failing because it couldn't download Google Fonts on this network. The fonts are now stored in the project (about 9.5 MB), so it builds offline.
6. **Visual polish pass.** The pass added:
   - real place photos from Wikimedia, with credits shown
   - short draft "stories" for each stop, marked **awaiting local review**
   - a collectible seal for each stop
   - a bike chip and a luggage chip that stay visible but disabled, because we have no data to support them
7. **Release-readiness pass.** Simulation tools (Demo Mode, fake walks, bonus scenarios) now appear only in development or in a deliberate presenter build, and are hidden in a public build. A list view mirrors the map for accessibility, text contrast was improved, and a dismissible "etiquette" notice appears near residential areas.
8. **Another pivot: the Macadam-style Home screen.**
   - We moved from four tabs to **five: Home, Explore, Missions, Rewards, Me**. Home is now the first screen.
   - Home shows a big points number, the fox, a progress track toward the next voucher and one large "what to do next" button.
   - Macadam's step counts, calories and leaderboards were **deliberately not copied**, because they would be fake data.
   - Buttons got a raised, pressable look. The map got a floating bonus pill and a faint ring around the fox showing where you are.
   - The fox poses were also redrawn as small pixel-art images.

## Where things stand today

**Branch:** `prototype-engineering`. Latest commit: "After visual changes" (`fd9c4a6`).

**What works (as of that commit):**

- Home, Explore (map or list), Missions, Rewards and Me tabs
- three walks, with stamps, points and demo vouchers
- English and Japanese throughout
- demo and GPS check-ins
- a presenter build with simulation tools, and a public build without them

I haven't re-run the tests during this handover. The last recorded results, in `docs/done/IMPLEMENTATION_AUDIT.md`, were 22 unit tests, 15 browser tests, build and lint all passing. That was before the later Home and visual changes.

**Uncommitted work in progress.** There are changes in the working folder that are not committed yet. I didn't write them and haven't tested them, so please check them before committing. They appear to be:

- a skippable welcome screen and a "pick a starting landmark" option
- an Illustrated/Standard map-style switch
- Save walks and places, with a saved list in Me
- pause and resume for GPS during a walk, and a checklist of stops during a walk
- voucher expiry dates (the offers expire 31 March 2027) and a "no deadline" note on missions
- offline support (a new `public/sw.js`)
- a Privacy section with "Delete my local data", and links to official disaster information

These line up with the "Prototype Features" list in `TODO.md`. Also uncommitted:

- the README now has an "Open the app on a phone" section
- `next.config.ts` has a one-line fix for phone testing through a tunnel

## Seeing it on a phone

The steps are in the README under "Open the app on a phone". In short:

1. Run `npm run dev` in one terminal.
2. Run `npx cloudflared tunnel --url http://localhost:3000` in another.
3. Open the `https://….trycloudflare.com` address it prints.

The address changes each time you restart the tunnel. GPS only works over this secure address.

## Things to know before you continue

- **Real GPS on a phone has never been tested.** All checks so far were desktop browsers pretending to be phones. This is the biggest unknown.
- **The fox art rights are unconfirmed.** Someone should confirm we may use it publicly (`docs/MASCOT_ASSETS.md`).
- **The place stories are drafts.** A local reviewer and a native Japanese speaker should approve them before the "draft" labels come off.
- **The three routes have not been walked on site.** The paths come from map data and stored pedestrian-router results. No one has walked them, and no residents have been consulted.
- **One documentation mismatch.** `CLAUDE.md` says links like `/?route=kamo-riverside` open that walk directly. A later decision (in `docs/DECISIONS.md`) says that is paused, and every entry opens Home. The code follows the later decision, so `CLAUDE.md` needs updating.
- **There are known small bugs.** `docs/BUGS.md` lists them, such as the check-in button flickering and map overlays overlapping on small phones. It was written on 24 November, so some may already be fixed.
- **Anything real needs approval first.** A backend, sign-in, paid services or live crowd data all need explicit sign-off. Real vouchers would need a server and real shop partners (`docs/ENGINEERING_SPEC.md`).

## What's next

1. Review, test and commit the in-progress work described above.
2. Test on a real iPhone and a real Android phone, including GPS, the bottom sheet and language switching.
3. Get the story review and the fox rights sorted.
4. Walk the three routes in person.
5. Pick items from `TODO.md`. Anything needing real data or partners is parked at the bottom of that file.

## Where to look

| If you want… | Open |
|---|---|
| The plan for what's left to build | `TODO.md`, `docs/visuals.md` |
| Why we changed direction | `docs/DECISIONS.md` |
| The audit that triggered the honesty fixes | `docs/done/IMPLEMENTATION_AUDIT.md` |
| Known bugs | `docs/BUGS.md` |
| The original product vision | `docs/PRODUCT_REQUIREMENTS.md`, `docs/PROJECT_SPEC.md` |
| How to run and test the app | `README.md` |
| Early-phase walkthroughs | `docs/done/` |
