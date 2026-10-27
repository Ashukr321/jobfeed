# jobfeed

npm CLI package (`jobfeed`) that writes Excel files of fresh jobs. Run `jobfeed`, pick what to fetch
(1 daily, 2 remote, 3 all = default on Enter), then where to save. Files go to `<location>/jobfeed_<YYYY-MM-DD>/`.
No login. Dependencies: `exceljs`, `chalk@4` (CommonJS; chalk 5 is ESM-only).

## Files
- `bin/jobfeed.js`: the interactive CLI (prompts, colored output).
- `lib/daily.js`: SDE-1 / Frontend jobs in tier-1 Indian cities from Greenhouse, Lever, Ashby.
  Filters (`ROLE`, `TOO_SENIOR`, `CITIES`, `MAX_AGE_DAYS`) are at the top; `lib/remote.js` reuses `wanted`.
- `lib/remote.js`: arc.dev companies hiring remotely + remote jobs (Remotive, RemoteOK, Jobicy, Himalayas, Arbeitnow),
  one Excel file per platform.
- `companies.txt`: one board per line, `<ats>:<board> | <Display Name>` (ats = greenhouse | lever | ashby). Shipped in the package.
- `test.js`: assert-based checks for the filters.

## Rules
- Only jobs **posted in the last 7 days** (`MAX_AGE_DAYS`) are kept; jobs with no posting date are dropped.
- Posting date per ATS: Greenhouse `first_published` (falls back to `updated_at`), Lever `createdAt`, Ashby `publishedAt`.
  Don't switch Greenhouse to `updated_at`: edited old jobs would look new.
- A daily job is kept only if: city matches `CITIES`, title passes `wanted()`, posted within the window.

## Commands
```bash
npm install
npm start      # same as running `jobfeed`
npm test       # run after changing any filter
npm publish    # release (bump "version" in package.json first)
```
