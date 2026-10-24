<p align="center">
  <img src="assets/banner.svg" alt="jobfeed: fresh SDE-1 and Frontend jobs in India, every morning, in one Excel file" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.9%2B-3776AB?logo=python&logoColor=white" alt="Python 3.9+">
  <img src="https://img.shields.io/badge/dependencies-1-34d399" alt="1 dependency">
  <img src="https://img.shields.io/badge/no%20login-no%20scraping-818cf8" alt="No login, no scraping">
</p>

# jobfeed

Run one command and get an Excel file of **SDE-1 / Software Engineer / Frontend jobs posted in the last 7 days**
in tier-1 Indian cities, each with a direct **Apply** link.

**Cities covered:** Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, Chennai, Kolkata, Ahmedabad and remote roles in India.

Jobs come from the public job boards that companies publish themselves (Greenhouse, Lever, Ashby).
There's no LinkedIn login and no scraping, so your accounts are never at risk.

## Features
- **Fresh jobs only:** anything posted more than 7 days ago is dropped.
- **No repeats:** each run shows only jobs you haven't seen before.
- **Entry-level filter:** Senior, Lead, Staff, SDE-2/3 and intern roles are removed automatically.
- **Excel output:** one tidy sheet with company, title, city, posting date and a clickable Apply link.
- **Fast:** 80+ companies are checked in parallel in a few seconds.

## Setup (one time)
1. Install Python 3.9 or newer from [python.org](https://www.python.org/downloads/).
2. In this folder, run:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
```bash
python jobfeed.py
```
This writes `daily_jobs/jobs_<date>_1.xlsx`, containing jobs from the last 7 days that are new since your last run.

To see every matching job from the last 7 days, including ones you've already seen:
```bash
python jobfeed.py --all
```

## Add more companies
Each line of `companies.txt` is one company. Take the board name from the company's careers page URL:

| Careers URL | Line to add |
|---|---|
| `boards.greenhouse.io/groww` | `greenhouse:groww \| Groww` |
| `jobs.lever.co/meesho` | `lever:meesho \| Meesho` |
| `jobs.ashbyhq.com/acme` | `ashby:acme \| Acme` |

The `| Name` part is optional; it's the company name shown in Excel. More companies means more jobs.

## Customize
These settings are at the top of `jobfeed.py`:
- `ROLE`: job titles to include.
- `TOO_SENIOR`: job titles to exclude.
- `CITIES`: cities to include.
- `MAX_AGE_DAYS`: how many days back to look (default 7).

After changing any of them, run `python test_jobfeed.py` to check the filters still work.

## Run it automatically every morning
- **Windows:** open Task Scheduler and choose Create Basic Task → Daily → Start a program. Set the program to `python`, the argument to `jobfeed.py`, and "Start in" to this folder.
- **Mac/Linux:** run `crontab -e` and add `0 9 * * * cd /path/to/jobfeed && python3 jobfeed.py`

## Project layout
```
jobfeed.py        the script
companies.txt     companies to check
test_jobfeed.py   filter checks
daily_jobs/       generated Excel files (git-ignored)
seen.json         jobs you've already seen (git-ignored)
assets/           README banner
```
