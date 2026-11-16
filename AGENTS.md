# Agent rules: daily-standup-wheel-picker

The LudeHQ handbook applies here: `~/Desktop/Builds/handbook/` (read `00-principles.md` and `10-agents.md` first). This file adds rules for this repo only.

## This repo is public
Anyone can read it. Never commit internal hostnames, IP addresses, account or team names, tokens, private URLs, or notes about other studio projects. Keep `HANDOFF.md` and similar working notes out of git (it is already in `.gitignore`).

## What it is
A static standup speaker picker: `index.html`, `styles.css` and a vendored confetti script. No framework, no build, no server. It is internal: the deployed site sits behind Vercel Authentication and must stay private unless the owner says otherwise.

## Commands
```bash
python3 -m http.server 8000   # serve locally, then open http://localhost:8000
npm install                   # installs Playwright, the only dependency
npm test                      # Playwright smoke checks on seven viewports
```
There is no build, lint or CI workflow. `npm test` must pass before you merge. Deploy is a merge to `main`; Vercel serves the root as static files.

## Traps
- `playwright.config.js` uses `channel: 'chrome'`, so the tests need Google Chrome installed, not only Playwright's bundled Chromium.
- The test server is `python3 -m http.server 8765`. If something else holds port 8765, the tests reuse it and may test the wrong thing.
- The smoke test seeds broken JSON into `foxesWheelStats` on purpose; the app must recover from it.
- Every `<button>` needs `type="button"`; the test checks this.
- The tests check that nothing scrolls sideways and the spin button stays on screen at every viewport. Layout changes must keep that true.
- `localStorage` keys (`foxesWheelStats`, `foxesSound`, `foxesLastGossip`) are live in users' browsers. Do not rename them without a migration. The old `foxesExpedites` key is removed on load on purpose.
- Keep the app free of third party requests: no CDNs, web fonts or analytics.

## Design and copy
There is no `DESIGN.md`, so run `~/Desktop/Builds/ludehq-kit/scripts/design-source.sh <repo path> -v` before any design or copy change and follow the system it names. Copy rules hold either way: no hyphen or dash as punctuation, no arrows, no emoji, plain sentences, every control a word or an SVG with an aria-label, nothing short wraps.

## Do not touch
- `package.json`, the lockfile, `.github/dependabot.yml`, workflows and `security.txt` belong to other sessions unless the owner asks.
- `vendor/` holds a pinned third party file and its license. Update it only on purpose, with the license.
- Do not change Vercel protection or make the site public.
