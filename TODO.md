# Kyoto Flow — Remaining TODOs

## 1. Next Up

- [ ] **Implement [docs/fox_chatbot.md](docs/fox_chatbot.md):** Build the grounded "Ask the Fox" Guided Q&A feature on the Explore tab (tappable fox marker, Gemini API Route Handler + deterministic offline fallback, and 3 rough pop-up prototypes for `?foxUi=modal | rpg | bubble`).
- [ ] **Pixelate characters from file GIFs (implement [docs/gif_ideas.md](docs/gif_ideas.md)):** Pixelate character sprites from the source GIF files (`public/assets/mascot/pixel/animated/`) to match the app's pixel-art mascot style.
- [ ] **Implement [docs/refinement.md](docs/refinement.md)Get rid of "demo", "double check", etc. components:** Since this is a demo, we're just going to get rid of the components that take away from the experience. Get rid of japanese underneath rewards in "Available", ex: Hanami Tea Stand (はなみ茶房（架空）), get rid of the japanese, but keep it for the japanese language switch option. So for english language setting, only show english name of the stores & products, and on japanese language setting, show the japanese name
- [ ] i think the previews for after tapping "redeem at store", "stamp book", "reset demo progress", "end this walk", "how this demo works", etc. has the pop up appear on the top left side of the screen. Make it centered. I'm sure there are multiple others that have the same problem as well, so conduct an audit to check if what i'm mentioning is real, and if there are other occurances.
- [ ] in map, get rid of toggling standard/illustrated (keep at standard at all times), get rid of list, bike - pilot planned, luggage - not surveyed
- [ ] **Implement [docs/music.md](docs/music.md):** Add looping background music across all tabs (`public/audio/kyoto-bgm.mp3`) with a persisted **Mute background music** switch under the **Me** tab.
- [ ] **Finish [docs/routes.md](docs/routes.md):** The six new walks, their stops, stories and seals are already in. Still to do: rerun the photo download (Wikimedia rate-limited it), wire the new walks into `DEMO_SCENARIOS`, update the route-discovery tests for 9 walks, update `ROUTE_DATA.md` and `DECISIONS.md`, then run the checks and the browser review.


## 2. Visual and Content Review (Human / Device QA)

- [ ] **Map label & bubble collision QA:** Check route-label and fox-bubble collisions with stop pins while panning and zooming at phone widths in both English and Japanese (including long place names).
- [ ] **Interaction polish decisions:** add swipe dismissal alongside buttons/Escape on Celebration ([src/components/celebration.tsx](src/components/celebration.tsx)), show the completion bonus separately from the walk total, and resolve the duplicate active walk card in Missions ([src/components/missions-screen.tsx](src/components/missions-screen.tsx)).
- [ ] **iOS & Android real-device accessibility QA:** Finish EN/JA coverage for loading and install metadata; test the full map/list and check-in journey on physical iPhones and Android phones with screen readers, reduced motion, weak GPS (including heading + display smoothing), weak connectivity, and check touch targets for route labels and the receipt's *Read story* button ([docs/TEST_CHECKLIST.md](docs/TEST_CHECKLIST.md)).
