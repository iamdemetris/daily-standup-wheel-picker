# Daily Standup Wheel Picker

A single page wheel picker for choosing who speaks first in a daily standup. It is for one small team. It runs as static HTML, CSS and JavaScript with no build step.

Stage: Internal. URL: https://daily-standup-wheel-picker.vercel.app (private, sign in required). Runs on: Vercel project `daily-standup-wheel-picker`, static files with no build.

## Run it locally
Open `index.html` in a browser, or serve the folder:
```bash
python3 -m http.server 8000
```
Then visit http://localhost:8000. Add `?day=N` to preview a weekday, where `0` is Sunday and `6` is Saturday. `?day=5` shows Friday mode.

## Test
The smoke checks run Playwright against seven viewport sizes:
```bash
npm install
npm test
```
The tests start a local server on port 8765 (or reuse one already running there). The Playwright config uses the installed Google Chrome (`channel: 'chrome'`), so Chrome must be installed.

## Deploy
Merge to `main`. Vercel deploys the repository root as static files; there is no install or build command. Other branches get preview deployments.

## Features
- Roulette style team picker with a cryptographically secure random choice.
- Weighted picks that reduce immediate repeats.
- Gossip wheel: when the main wheel lands on Gossip, a second wheel opens, spins on its own and picks which team member brings the gossip. The last gossip speaker is less likely to be picked again.
- Friday mode with a stronger Gossip weight, countdown, confetti and chime.
- Team pick statistics stored in the browser.
- Responsive dark UI in hand written CSS, no framework and no web fonts.

## Layout
```text
.
|-- index.html            the whole app: markup, wheel rendering, logic
|-- styles.css            hand written styles
|-- favicon.svg
|-- vendor/
|   |-- confetti.browser.js   canvas-confetti 1.9.3, vendored
|   `-- confetti.LICENSE      ISC license
|-- smoke.spec.js         Playwright smoke checks
|-- playwright.config.js
|-- package.json          test dependency only
`-- docs/                 brief, runbook, decisions
```
The wheel is a dependency free inline SVG. canvas-confetti is vendored so the app makes no third party requests and never waits on a CDN.

## Customization
To change the wheel entries, edit the `names` array in `index.html`:
```js
const names = ['Paul', 'Dimitris', 'Vlad', 'Gossip'];
```
Existing browsers may already hold pick totals under the old names, so keep the stats schema in mind.

## Data
No server and no database. The app stores data only in the current browser's `localStorage`:

| Key | Purpose |
| --- | --- |
| `foxesWheelStats` | Current streak and total pick counts per name. |
| `foxesSound` | Chime toggle preference. |
| `foxesLastGossip` | Last person picked by the gossip wheel. |

The only personal data is the team members' first names, which are in the code. Clearing browser site data resets the stored values.

## Contributing
1. Keep behavior changes in `index.html`.
2. Run `npm test`.
3. Do not change the `localStorage` keys without a migration.
4. Check the Friday preview with `?day=5`.

## License
No license file is included yet. Add one before accepting outside contributions or relying on this repository as open source.

## Docs
- Brief: `docs/brief.md`
- Decisions: `docs/adr/`
- Runbook: `docs/runbook.md`
- Agent rules: `AGENTS.md`

Built by LudeHQ (ludehq.com).
