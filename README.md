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
  SDE-1 / Frontend jobs in Indian cities and companies hiring remotely, posted in the last 7 days.
</p>

---

## Quick start

```bash
npx jobfeed
```

No sign-up, no API keys, no scraping. Jobs come from the public job-board APIs that companies publish themselves.

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
  2. Companies hiring remotely + remote jobs
  3. All of the above (default)
> Choose 1-3 [3]:
> Save Excel files where? [C:\Users\you\Desktop]: D:\jobs

▶ Daily jobs
✔ 24 jobs from 81 companies -> india_jobs_2026-10-27.xlsx (5s)

▶ Companies hiring remotely
✔ 151 companies, 59 SDE/frontend remote jobs -> remote_companies_2026-10-27.xlsx (117s)

Done. Files are in D:\jobs\jobfeed_2026-10-27
```

1. **Pick what to fetch.** Press <kbd>Enter</kbd> for all.
2. **Choose where to save.** Type or paste a folder path, or press <kbd>Enter</kbd> for the current folder.

## Output

Every run creates a dated folder with one Excel file per source:

```
jobfeed_2026-10-27/
├── india_jobs_2026-10-27.xlsx         # option 1
├── remote_companies_2026-10-27.xlsx   # option 2: companies + matched remote jobs
├── remotive_jobs_2026-10-27.xlsx      # option 2: one file per remote job site
├── remoteok_jobs_2026-10-27.xlsx
├── jobicy_jobs_2026-10-27.xlsx
├── himalayas_jobs_2026-10-27.xlsx
└── arbeitnow_jobs_2026-10-27.xlsx
```

| File | Columns |
|---|---|
| `india_jobs` | Company, Job Title, City, Location, Posted, Apply Link |
| `remote_companies` | Company, Remote Level, Size, Open Jobs, Headquarters, Website, LinkedIn, About, plus a **Remote Jobs** sheet |
| `<platform>_jobs` | Platform, Title, Role, Type, Company, Location, Posted, Salary, Apply |

Every sheet has a frozen header, filters and clickable links.

## What you get

| | Daily jobs | Companies hiring remotely |
|---|---|---|
| **Roles** | SDE-1, Software Engineer, Frontend, React, Web, UI | Remote dev jobs (SDE / Frontend matches in the combined sheet) |
| **Where** | Bengaluru, Hyderabad, Pune, Mumbai, Delhi NCR, Chennai, Kolkata, Ahmedabad, Remote India | Remote, open to India or worldwide |
| **Sources** | 80+ company boards on Greenhouse, Lever and Ashby | arc.dev, Remotive, RemoteOK, Jobicy, Himalayas, Arbeitnow |
| **Freshness** | Posted in the last 7 days | Posted in the last 7 days |
| **Time** | ~5 seconds | ~2 minutes |

Senior, Lead, Staff, Principal, Manager, SDE-2/3 and intern roles are filtered out automatically.

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
<summary><b>Can I add companies or change the role and city filters?</b></summary>

Yes, by contributing them to the repo. See [CONTRIBUTING.md](https://github.com/Ashukr321/jobfeed/blob/main/CONTRIBUTING.md).
</details>

## Contributing

Bug reports, new company boards and new job sources are welcome.
See [CONTRIBUTING.md](https://github.com/Ashukr321/jobfeed/blob/main/CONTRIBUTING.md) to get started.

## License

[MIT](https://github.com/Ashukr321/jobfeed/blob/main/LICENSE) © Ashukr321
