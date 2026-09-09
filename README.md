# Daily Standup Wheel Picker

A single-page wheel picker for choosing who speaks first in a daily standup.
It runs as static HTML, CSS, and JavaScript with no build step.

Live demo: https://daily-standup-wheel-picker.vercel.app

## Quickstart

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

To run the browser smoke checks:

```bash
npm install
python3 -m http.server 8765 --bind 127.0.0.1
npm test
```

## Features

- Roulette-style team picker with a cryptographically secure random choice.
- Weighted picks that reduce immediate repeats.
- Friday mode with a stronger Gossip weight, countdown, confetti, and chime.
- Team pick statistics stored in the browser.
- Day preview via `?day=N`, where `0=Sunday` through `6=Saturday`.
- Responsive dark UI using hand-written static CSS (no framework, no web fonts).

## How It Works

The app lives in [index.html](./index.html). It uses:

- Hand-written static CSS in [styles.css](./styles.css) for layout and utilities.
- A dependency-free inline SVG for the wheel rendering.
- canvas-confetti (the only external script) for celebration effects.
- The browser's system font stack (no web fonts).
- `localStorage` for user-local stats and settings.

No server or database is required.

## Local Storage

The app stores data only in the current browser:

| Key | Purpose |
| --- | --- |
| `foxesWheelStats` | Current streak and total pick counts. |
| `foxesSound` | Chime toggle preference. |

Clearing browser site data resets these values.

## Customization

To change the wheel entries, edit the `names` array in [index.html](./index.html):

```js
const names = ['Paul', 'Dimitris', 'Vlad', 'Gossip'];
```

If you change the names, keep the `localStorage` schema in mind. Existing users
may already have saved pick totals under the old names.

## Deployment

This project can be deployed by hosting the repository root as static files.
It works on Vercel, GitHub Pages, Netlify, or any static web server.

For Vercel, importing the repository with the default static settings is enough.
There is no install command and no build command.

## Project Structure

```text
.
|-- .gitignore
|-- favicon.svg
|-- index.html
|-- package-lock.json
|-- package.json
|-- smoke.spec.js
|-- styles.css
`-- README.md
```

## Contributing

This is a small static app, so changes should stay focused:

1. Keep behavior changes in `index.html`.
2. Run `npm test` for the browser smoke checks.
3. Avoid changing the existing `localStorage` keys without a migration.
4. Check the Friday preview with `?day=5`.

## License

No license file is included yet. Add a license before accepting outside
contributions or relying on this repository as open source.
