# Contributing to jobfeed

Thanks for helping! Small, focused pull requests are the easiest to review and merge.

## Setup
Needs Node.js 18 or newer.
```bash
git clone https://github.com/Ashukr321/jobfeed && cd jobfeed
npm install
npm start      # run the CLI from source
npm test       # filter checks; must print "ok"
```
`npm link` makes the `jobfeed` command run your local copy, so you can test it like a real install.
Undo it with `npm unlink -g jobfeed`.

## What's where
| File | What it does |
|---|---|
| `bin/jobfeed.js` | The CLI: the two questions, the output folder and colored output |
| `lib/daily.js` | India jobs from Greenhouse / Lever / Ashby boards, plus the role, city and date filters |
| `lib/remote.js` | arc.dev companies hiring remotely and the remote job APIs (one Excel file each) |
| `companies.txt` | Company boards checked by the daily feed |
| `test.js` | Assert-based checks for the filters |

## Common contributions

### Add a company
Add one line to `companies.txt`: `<ats>:<board> | <Display Name>` (ats = `greenhouse`, `lever` or `ashby`).
The board name is in the company's careers URL:

| Careers URL | Line to add |
|---|---|
| `boards.greenhouse.io/groww` | `greenhouse:groww \| Groww` |
| `jobs.lever.co/meesho` | `lever:meesho \| Meesho` |
| `jobs.ashbyhq.com/acme` | `ashby:acme \| Acme` |

The `| Name` part is optional; it's the company name shown in Excel.
Before opening the PR, check that the board answers by running `npm start` and choosing `1`;
it must not show up as `skipped`.

### Add a remote job source
Add an entry to `SOURCES` in `lib/remote.js` that returns
`[{ title, role, type, company, location, posted: Date, url, salary }]`.
Only use **public, documented APIs** that need no login or API key. No HTML scraping of job sites.

### Change a filter
`ROLE`, `TOO_SENIOR`, `CITIES` and `MAX_AGE_DAYS` are at the top of `lib/daily.js`.
Add an assert to `test.js` for the case you're fixing, and make sure `npm test` passes.

## Rules
- Only jobs **posted in the last 7 days** are kept; jobs without a posting date are dropped.
- Greenhouse dates come from `first_published`, not `updated_at`, so edited old jobs don't look new. Keep it that way.
- Keep dependencies minimal: `exceljs` and `chalk` only. Use built-in Node APIs (`fetch`, `readline`, `fs`) where they work.
- `chalk` stays on v4, because v5 is ESM-only and this package is CommonJS.
- Don't commit generated Excel files or `jobfeed_*` folders.

## Pull requests
1. Fork the repo and create a branch: `git checkout -b add-company-xyz`.
2. Make your change, run `npm test`, and run the CLI once for the part you touched.
3. Write a short commit message that says what changed, e.g. `Add Razorpay to companies.txt`.
4. Open a PR describing what you changed and how you tested it.
   CI runs `npm test` on Node 22; the PR needs a green check before it is merged.

## Reporting a bug
Open an issue with: the command you ran, the option you picked, your Node version (`node -v`),
your OS, and the full terminal output.

## Releasing (maintainers)
```bash
npm test
npm version patch        # or minor / major; bumps package.json and creates a git tag
git push --follow-tags
npm publish
```
The first time, log in with `npm login`. Check what will be published with `npm pack --dry-run`.
