# Product brief: Daily Standup Wheel Picker

Date: 2026-11-16. Stage: Internal. Owner approval: Reconstructed 2026-11-16 from the code; owner to confirm.

## Problem
A daily standup needs someone to go first, and choosing by hand is slow and repeats the same people. A random wheel picks quickly and fairly and adds a bit of fun.

## User
One small team, every working day.

## Scope
- Spin a wheel of team names plus a Gossip slot, with weighted picks that avoid immediate repeats.
- A second gossip wheel when Gossip comes up.
- Friday mode with a stronger Gossip weight, countdown, confetti and chime.
- Per browser pick statistics and a sound toggle.
- Weekday preview with `?day=N`.

## Not in scope
- Accounts, a server or shared statistics across browsers.
- Editing names from the UI (names are in `index.html`).
- Third party requests of any kind.

## Success
The team uses it at standup. Unknown: any measurable target. Owner to set one if wanted.

## Data
Team first names in the code, and pick statistics and settings in each browser's `localStorage`. Nothing leaves the browser. See handbook chapter 07.

## Where it runs
Vercel, static files from the repo root, private behind Vercel Authentication. No database, no sign in inside the app.

## Risks
- The repo is public, so nothing private may be committed.
- No license file, so it is not open source in practice.
