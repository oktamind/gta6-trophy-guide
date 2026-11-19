# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/oktamind/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/oktamind/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend — the offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every trophy with its official name, description and grade as PlayStation publishes it, a guide in our own words that cites its sources beside each step, a five-stage roadmap to the platinum, the one potentially missable trophy flagged, and a spoiler-safe checklist that saves in your browser.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at run time: `app/` is plain static files, and `app/index.html` opens in desktop Chrome with the network off.

## Run the entry program

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes `output/dossier.json`.

## What is inside

- `app/index.html`, `app/style.css`, `app/app.js` — the guide and tracker.
- `app/data/trophies.json` — the 55 trophies: official name, description and grade, plus kind, missable flag, roadmap stage, guide steps and cited sources for each one.
- `screenshots/` — real renders of the app's own code in a browser; the first by name is the cover.

## How the guides were written

The trophy names, descriptions and grades are the official list as PlayStation publishes it (as reported from Exophase and cross-checked with PSNProfiles on 18 November 2026). Every guide is written in our own words for this entry and names its sources beside it — the launch-week guides at Planet GTA 6, Output Lag, KeenGamer, Press-Start, EGamers and All.gg, plus PowerPyx and the trophy trackers Exophase and PSNProfiles. Where no source confirms a method yet (a few cryptic hidden trophies), the guide says so instead of inventing one. The one trophy reported as potentially missable is Positive Mental Attitude: a Chapter 1 meditation spot disappears after that chapter, and the game has no mission replay, so the guide tells you to keep a manual save at the start of every chapter and never to use cheats on your trophy save.

Made for [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) · Referral code: rrts6br6 · Not affiliated with Rockstar Games or PlayStation.
