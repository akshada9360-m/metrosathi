# Metro Saathi

Metro Saathi is a responsive, mobile-first Pune Metro passenger-assistance
prototype. It demonstrates the end-to-end experience using local, clearly
identified sample data. It does **not** connect to official PMPML/Pune Metro
feeds, an AI provider, or an emergency service.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

In PowerShell, from the project folder:

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed in the terminal. Stop the development server with
`Ctrl+C`.

PowerShell may block the `npm.ps1` command shim under its script execution
policy. `npm.cmd` avoids changing that policy.

Check the finished project:

```powershell
npm.cmd run build
npm.cmd run lint
npm.cmd test
npm.cmd audit --audit-level=low
```

## Implemented phases

### Phase 1 — Working foundation

- Responsive desktop dashboard and mobile navigation.
- Manual selection of Civil Court, Deccan Gymkhana, and Vanaz.
- Searchable and filterable nearby sample places, sorted by walking distance.
- Station guide and saved stations.

### Phase 2 — Journey planner

- Destination search and category filters.
- Two sample exits per station, ranked deterministically by estimated distance
  and selected step-free, fewer-stairs, shorter-walk, and lift/ramp preferences.
- Route reasons, sample walking instructions, schematic (not to scale), and an
  estimated time using 75 metres/minute.
- Unknown accessibility and exit status are called out; access is never
  guaranteed.

### Phase 3 — Transport connections

- Sample bus stops and route choices for each included station.
- Transfer budget itemizes station egress, stop walk, boarding allowance, wait,
  and sample bus journey.
- Short-connection warning and no-departure empty state.
- Simulated departures are distinguished from scheduled and live data; no
  real-time feed is connected.

### Phase 4 — AI and languages

- English, Hindi, and Marathi choices for navigation, dashboard, preferences,
  and assistant responses.
- Local retrieval assistant covers exits, accessibility, amenities, station
  lines, bus stops/connections, live-data availability, help-point limitations,
  and unknown questions.
- Ten seeded English questions are covered by unit tests.
- Browser speech input and text-to-speech are used when supported; typed
  questions and visible text answers remain available as fallbacks.
- No external model is called. The assistant is deterministic local retrieval,
  not a generative AI service.

### Phase 5 — Resilience and events

- A web manifest and service worker cache the app shell and same-origin static
  assets for a later offline visit.
- Users can save a station reference pack and its local timestamp in browser
  storage; live data is explicitly unavailable offline.
- Browser online/offline state and a manual offline-demo mode show a visible
  notice.
- Community reports are stored locally on the device, contain no public name,
  show their timestamp and unverified status, and display as expired after four
  hours. Reports are not sent to station staff or used to reroute passengers.
- Festival mode compares at least three candidate stations for each of two
  configurable sample events. Crowd levels are fabricated examples, not live
  reports or predictions. Walking distance, transfer count, accessibility
  uncertainty, and freshness are shown.
- Transfer time budgeting is included with the Phase 3 connection planner.
- Emergency/help-point screen states that verified points and phone numbers
  are unavailable and directs users to station staff or official services.

### Phase 6 — Demo polish

- Responsive layouts, keyboard-focus indicators, labels, status messages,
  empty states, storage errors, stale/unknown data caveats, and reduced-motion
  safe native controls.
- Automated tests cover route ranking, accessibility ranking, transfer budget
  validity/live-data handling, and ten assistant questions.
- Setup, limitations, data sources, and a judge walkthrough are documented
  below.

## Data provenance and limitations

All station exits, amenity names, distances, route directions, accessibility
notes, bus stops, destinations, departures, festival venues, and crowd values
are manually authored **demo values** in `src/data/`. They are not verified
against an official or licensed source and must not be used as real travel
guidance. Bus departures are simulated, not a published schedule. Festival
crowd values are fabricated for demonstrating the comparison UI.

No live metro schedules, disruption alerts, bus predictions, lift/escalator
status, verified help points, emergency contacts, opening hours, or official
advisories are connected. Indoor GPS and exact station-layout navigation are
not implemented. The app does not claim that emergency help has been contacted.
Verify real travel information with official signage and station staff.

Offline packs store a station reference and timestamp in browser storage; the
sample database is bundled with the app. The service worker is enabled for
production builds and caches same-origin static files after they are loaded. It
cannot provide fresh data without a network connection. To preview production
behavior locally, run `npm.cmd run build` followed by `npm.cmd run preview`.

Community reports remain on the device and are not moderated or transmitted.
They are unverified and expire from prominent display after four hours.
Preferences and saved station references are also local to this browser; no
account or server is used.

## Demo walkthrough

1. Open the app and select **Civil Court** from the station selector.
2. Select **Plan a journey**, choose **City Care Clinic**, and compare exits.
3. Turn on **Step-free route** and notice the rank/reason change and the warning
   that demo access information is unverified.
4. Open **Bus connection**, compare sample stops/routes, and review the transfer
   time assumptions. Change arrival time to see the no-departure or tight
   connection state.
5. Open **Ask Metro Saathi** and ask “Where is the nearest bus stop?” or “Is
   Exit A open now?” to see sourced answers and uncertainty handling.
6. Change language under **Settings** and retry a suggested assistant question.
   Use the microphone or read-aloud control only if the browser supports it.
7. Save a station pack in **Settings**, enable offline demo mode, and review the
   visible offline/live-data notice.
8. Open **Festival mode** and compare stations. Point out the simulated crowd
   labels and the absence of predictive claims.
9. Submit a lift or crowd report under **Community reports**; verify that it is
   time-stamped and unverified.
10. Open **Settings → Emergency & help points** and show the honest safe fallback
    instead of a fabricated phone number.

## Project structure

- `src/data/` — versioned local station, bus, and event demo data.
- `src/types/` — typed station, transport, report, event, and preference models.
- `src/components/` — separate screens and reusable UI.
- `src/features/assistant/retrieveAnswer.ts` — deterministic local assistant
  retrieval; no API keys or external service.
- `src/features/journey/rankExits.ts` — route preference ranking.
- `src/features/transport/calculateTransferBudget.ts` — transfer estimate and
  input validation.
- `src/hooks/usePersistentState.ts` — typed local persistence with surfaced
  storage errors.
- `public/service-worker.js` and `public/manifest.webmanifest` — offline shell
  and install metadata.
- `src/**/*.test.ts` — Vitest logic tests.

There are no environment variables or API secrets required for this demo.
