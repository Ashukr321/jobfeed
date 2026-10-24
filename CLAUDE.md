# jobfeed

One Python script that pulls SDE-1 / Software Engineer / Frontend jobs in tier-1 Indian cities
from public company job-board APIs (Greenhouse, Lever, Ashby) and writes them to an Excel file.
No login, no scraping. Only dependency: `openpyxl`.

## Files
- `jobfeed.py`: everything. Filters (`ROLE`, `TOO_SENIOR`, `CITIES`, `MAX_AGE_DAYS`) are at the top.
- `companies.txt`: one board per line, `<ats>:<board> | <Display Name>` (ats = greenhouse | lever | ashby).
- `seen.json`: apply URLs already exported, so a normal run only shows new jobs. `--all` ignores and doesn't update it.
- `daily_jobs/`: **every generated Excel file goes here**, named `jobs_<YYYY-MM-DD>_<n>.xlsx`.
  Never write xlsx files to the project root.
- `test_jobfeed.py`: assert-based checks for the filters.

## Rules
- Only jobs **posted in the last 7 days** (`MAX_AGE_DAYS`) are kept; jobs with no posting date are dropped.
- Posting date per ATS: Greenhouse `first_published` (falls back to `updated_at`), Lever `createdAt`, Ashby `publishedAt`.
  Don't switch Greenhouse to `updated_at`: edited old jobs would look new.
- A job is kept only if: city matches `CITIES`, title passes `wanted()`, posted within the window, URL not in `seen.json`.

## Commands
```bash
pip install -r requirements.txt
python jobfeed.py          # new jobs from the last 7 days
python jobfeed.py --all    # all matching jobs from the last 7 days, ignores seen.json
python test_jobfeed.py     # run after changing any filter
```
On Windows, set `PYTHONIOENCODING=utf-8` if printing job titles errors with `UnicodeEncodeError`.
