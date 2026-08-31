# Let's Celebrate

A single-page app that shows every holiday for a given day — federal, religious,
food-related, and deeply made-up. Loads today's holidays automatically; the date
picker jumps to any other day.

Three sections:

- **Today's holidays** — single-day observances
- **Today is part of** — weekly and month-long observances, with date ranges
- **Born today** — notable birthdays, with birth years

## Running locally

```bash
npm install
npm run dev
```

## Deploying to Vercel

Push this directory to a GitHub repo, then import it at vercel.com. Vercel
auto-detects Vite — no configuration needed. Defaults if you're asked:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

## How the data works

Everything is bundled. There are no network calls, no API keys, and no rate
limits.

- `src/data/holidays.js` — daily, monthly, and multi-day observances
- `src/data/birthdays.js` — birthdays keyed by month-day, as `[name, year]`
- `src/lib/dates.js` — the date rules engine and lookup functions

Fixed-date holidays are stored as literal `"month-day"` keys. Everything that
moves is stored as a *rule* and computed at lookup time:

- `nth` / `last` — nth or last given weekday of a month (Thanksgiving, Memorial Day)
- `offset` — a fixed number of days from another rule (Black Friday, Cyber Monday)
- Easter and its dependents (Ash Wednesday, Mardi Gras, Palm Sunday, Good Friday)
  are derived with the anonymous Gregorian algorithm
- Multi-day spans use `range` (fixed dates), `week` (nth full week of a month),
  `weekOf` (the week containing a date), and `lastWeek`

So "first full week of May" resolves correctly every year rather than being
hardcoded.

## Adding holidays

Add a string to the right `"month-day"` array in `holidays.js`. For a new weekly
observance, add a rule object to `SPANS`. For a birthday, add a `[name, year]`
pair to the matching key in `birthdays.js`.

## Accuracy

The dataset was compiled from general knowledge rather than scraped from a
single authoritative source, and these observances genuinely conflict across
publishers — National Pizza Day gets claimed on several different dates
depending on who you ask. Expect some entries to differ from any given list, and
a few to be wrong. Birth dates before 1752 carry Julian/Gregorian ambiguity;
Isaac Newton is listed on January 4, 1643 (Gregorian), though many sources use
December 25, 1642.
