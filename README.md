<p align="center">
  <img src="https://raw.githubusercontent.com/Ashukr321/jobfeed/main/assets/banner.svg?sanitize=true" alt="jobfeed" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/jobfeed"><img src="https://img.shields.io/npm/v/jobfeed?color=CB3837&logo=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/jobfeed"><img src="https://img.shields.io/npm/dm/jobfeed?color=CB3837" alt="npm downloads"></a>
  <a href="https://github.com/Ashukr321/jobfeed/actions/workflows/ci.yml"><img src="https://github.com/Ashukr321/jobfeed/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/node/v/jobfeed?logo=node.js&logoColor=white&color=339933" alt="node version">
  <a href="https://github.com/Ashukr321/jobfeed/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/jobfeed?color=blue" alt="license"></a>
</p>

<p align="center">
  <b>One command. Fresh jobs. Excel files with a direct Apply link.</b><br>
  SDE-1 / Frontend jobs in Indian cities, companies hiring remotely, and jobs from YC, Wellfound, Cutshort
  and remote job boards, all posted in the last 7 days.
</p>

---

## Quick start

```bash
npx jobfeed
```

No sign-up, no login, no API keys. Jobs come from the public job-board APIs that companies publish themselves
(Greenhouse, Lever, Ashby, Workday), public job APIs, and the public job pages of YC, Wellfound and Cutshort.

## Install

```bash
npm install -g jobfeed
```

Then run `jobfeed` from any folder. Requires [Node.js](https://nodejs.org) 18 or newer.

> Installed without `-g` (`npm install jobfeed`)? Run it with `npx jobfeed`. Only a global install adds the `jobfeed` command to your terminal.

## Usage

```bash
jobfeed
```

```
  jobfeed · jobs posted in the last 7 days

What do you want to fetch?
  1. Daily jobs (SDE-1 / Frontend in Indian cities)
  2. Companies hiring remotely + jobs from job platforms (remote boards, YC, Wellfound, Cutshort)
  3. All of the above (default)
> Choose 1-3 [3]:
> Save Excel files where? [C:\Users\you\Desktop]: D:\jobs

▶ Daily jobs
✔ 12 jobs from 95 companies -> india_jobs_2026-10-31.xlsx (20s)

▶ Companies hiring remotely
  Wellfound: 184 fetched, 18 in last 7 days, 7 SDE/frontend
  Cutshort: 200 fetched, 23 in last 7 days, 3 SDE/frontend
  ...
✔ 151 companies, 69 SDE/frontend remote jobs -> remote_companies_2026-10-31.xlsx (117s)

Done. Files are in D:\jobs\jobfeed_2026-10-31
```

1. **Pick what to fetch.** Press <kbd>Enter</kbd> for all.
2. **Choose where to save.** Type or paste a folder path, or press <kbd>Enter</kbd> for the current folder.

## Output

Every run creates a dated folder with one Excel file per source:

```
jobfeed_2026-10-31/
├── india_jobs_2026-10-31.xlsx         # option 1
├── remote_companies_2026-10-31.xlsx   # option 2: companies + SDE/frontend matches from every platform
├── remotive_jobs_2026-10-31.xlsx      # option 2: one file per job platform, all roles
├── remoteok_jobs_2026-10-31.xlsx
├── jobicy_jobs_2026-10-31.xlsx
├── himalayas_jobs_2026-10-31.xlsx
├── arbeitnow_jobs_2026-10-31.xlsx
├── yc_jobs_2026-10-31.xlsx
├── wellfound_jobs_2026-10-31.xlsx
└── cutshort_jobs_2026-10-31.xlsx
```

| File | Columns |
|---|---|
| `india_jobs` | Company, Job Title, City, Location, Posted, Apply Link |
| `remote_companies` | Company, Remote Level, Size, Open Jobs, Headquarters, Website, LinkedIn, About, plus a **Remote Jobs** sheet |
| `<platform>_jobs` | Platform, Title, Role, Type, Company, Location, Posted, Salary, Apply |

Every sheet has a frozen header, filters and clickable links.

## What you get

| | 1. Daily jobs | 2. Remote companies + job platforms |
|---|---|---|
| **Roles** | SDE-1, Software Engineer, Frontend, React, Web, UI | All dev jobs per platform file; SDE / Frontend matches in the combined sheet |
| **Where** | Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, Chennai, Kolkata, Ahmedabad, Remote India | Remote boards: open to India or worldwide. YC: all, India, remote. Wellfound, Cutshort: India |
| **Sources** | 90+ company boards on Greenhouse, Lever, Ashby and Workday | arc.dev, Remotive, RemoteOK, Jobicy, Himalayas, Arbeitnow, YC (Work at a Startup), Wellfound, Cutshort |
| **Freshness** | Posted in the last 7 days | Posted in the last 7 days |
| **Time** | ~20 seconds | ~2 minutes |

Senior, Lead, Staff, Principal, Manager, SDE-2/3 and intern roles are filtered out automatically.

### Sources

| Platform | Option | What's fetched |
|---|---|---|
| Greenhouse, Lever, Ashby | 1 | Startups and product companies listed in [`companies.txt`](https://github.com/Ashukr321/jobfeed/blob/main/companies.txt) |
| Workday | 1 | Big companies hiring in India: NVIDIA, PayPal, Citi, Salesforce, Intel, Adobe, Mastercard, HP and more |
| YC (Work at a Startup) | 2 | Software engineer jobs at Y Combinator startups (all, India, remote) |
| Wellfound | 2 | Software and frontend engineer jobs in India, with salary and equity |
| Cutshort | 2 | React, JavaScript, frontend and Node.js jobs in India, with salary and experience range |
| Remotive, RemoteOK, Jobicy, Himalayas, Arbeitnow | 2 | Remote dev jobs |
| arc.dev | 2 | Companies hiring remotely, with website and LinkedIn |

## FAQ

<details>
<summary><b><code>jobfeed</code> is not recognized after <code>npm install jobfeed</code></b></summary>

That was a local install. Run `npx jobfeed`, or install globally with `npm install -g jobfeed`.
</details>

<details>
<summary><b><code>npm install jobfeed</code> fails with <code>404 Not Found</code> for a different package</b></summary>

When the current folder has no `package.json`, npm installs into the nearest parent folder that has one
(often your home folder) and tries to install all of its dependencies too. If one of those no longer exists,
the install fails. Run `npm prefix` to see which folder npm is using. Install globally (`npm install -g jobfeed`),
or run `npm init -y` in the current folder first.
</details>

<details>
<summary><b><code>jobfeed</code> is not recognized after <code>npm install -g jobfeed</code></b></summary>

npm's global folder isn't on your PATH. Run `npm prefix -g`, add that folder (Windows) or its `bin` subfolder
(macOS/Linux) to PATH, and open a new terminal.
</details>

<details>
<summary><b>A company shows <code>skipped ... timeout</code></b></summary>

That company's job board answered too slowly. All other results are still saved. Run again later.
</details>

<details>
<summary><b>YC, Wellfound or Cutshort shows an HTTP error or 0 jobs</b></summary>

These sites have no public API, so jobfeed reads the job data from their public pages. If a site blocks the
request or changes its page layout, that platform fails with a warning and every other file is still saved.
Run again later, or [open an issue](https://github.com/Ashukr321/jobfeed/issues) if it keeps failing.
</details>

<details>
<summary><b>Why are there only a few Workday jobs?</b></summary>

Big companies post many jobs in India, but most are senior or use titles like "Software Engineer II" or "MTS",
which the SDE-1 filter skips. Expect a handful a day.
</details>

<details>
<summary><b>Can I add companies or change the role and city filters?</b></summary>

Yes, by contributing them to the repo. See [CONTRIBUTING.md](https://github.com/Ashukr321/jobfeed/blob/main/CONTRIBUTING.md).
</details>

## Contributing

Bug reports, new company boards and new job sources are welcome.
See [CONTRIBUTING.md](https://github.com/Ashukr321/jobfeed/blob/main/CONTRIBUTING.md) to get started.

## License

[MIT](https://github.com/Ashukr321/jobfeed/blob/main/LICENSE) © Ashukr321
