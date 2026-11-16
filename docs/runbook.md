# Runbook: Daily Standup Wheel Picker

## At a glance
- What it is: static standup speaker picker.
- Where it runs: Vercel project `daily-standup-wheel-picker`, private behind Vercel Authentication. No database.
- Monitors: none known. Errors: no error tracking (static site).
- Owner contact for incidents: the owner's usual alert channel.

## Deploy
Merge to `main`. Vercel serves the repository root as static files with no build step. Run the smoke checks first:
```bash
npm install
npm test
```
Check it worked: the Vercel status on the commit is green, and the deployed page loads after sign in.

## Roll back
In the Vercel dashboard for the project, open Deployments, pick the last good production deployment and use Instant Rollback. This takes under a minute. Then revert the bad commit on `main`.

## Common alerts
| Alert | What it means | What to do |
|---|---|---|
| Page blank or broken after a deploy | A script error in `index.html` | Roll back, then reproduce locally with `npm test`. |

## Scheduled jobs
None.

## Data
Only in each user's browser (`localStorage`). There is nothing to back up or restore.

## Secrets
None.
