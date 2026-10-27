// Companies that hire remotely (arc.dev) plus remote dev jobs from free public job APIs.
const path = require("path");
const ExcelJS = require("exceljs");
const { wanted, MAX_AGE_DAYS } = require("./daily");

const LIST_URL = "https://api.arc.dev/p/companies/featured?page=";
const PROFILE_URL = "https://arc.dev/company/";

// Remote jobs use the same role filter as the daily feed.
const recent = (posted, now = Date.now()) => now - posted <= MAX_AGE_DAYS * 864e5;

// RemoteOK rejects requests without a User-Agent.
async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (jobfeed)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

const range = (min, max, cur = "") => (max ? `${min || "?"}-${max} ${cur}`.trim() : "");
const sec = (s) => new Date(s * 1000);

const join = (a) => (a || []).join(", ");

// Each source returns [{ title, role, type, company, location, posted: Date, url, salary }].
const SOURCES = {
  Remotive: async () =>
    (await getJson("https://remotive.com/api/remote-jobs?category=software-dev")).jobs.map((j) => ({
      title: j.title, role: j.category, type: j.job_type, company: j.company_name, location: j.candidate_required_location,
      posted: new Date(j.publication_date + "Z"), url: j.url, salary: j.salary,
    })),
  // First element is a legal notice, not a job.
  RemoteOK: async () =>
    (await getJson("https://remoteok.com/api")).slice(1).map((j) => ({
      title: j.position, role: join(j.tags), type: "", company: j.company, location: j.location,
      posted: new Date(j.date), url: j.url, salary: range(j.salary_min, j.salary_max, "USD"),
    })),
  Jobicy: async () =>
    (await getJson("https://jobicy.com/api/v2/remote-jobs?count=100&industry=engineering")).jobs.map((j) => ({
      title: j.jobTitle, role: [...(j.jobIndustry || []), j.jobLevel].filter(Boolean).join(", "), type: join(j.jobType),
      company: j.companyName, location: j.jobGeo,
      posted: new Date(j.pubDate), url: j.url, salary: range(j.salaryMin, j.salaryMax, j.salaryCurrency),
    })),
  // The full feed is ~600 dev jobs/day, so search jobs open to India (incl. worldwide).
  // 20 per page, newest first: page until jobs fall out of the window.
  Himalayas: async () => {
    const out = [];
    for (const q of ["software engineer", "frontend"]) {
      for (let page = 1; page <= 25; page++) {
        const j = await getJson(`https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}&country=India&sort=recent&page=${page}`);
        out.push(...j.jobs.map((x) => ({
          title: x.title, role: [...(x.parentCategories || []), ...(x.seniority || [])].join(", "), type: x.employmentType,
          company: x.companyName, location: join(x.locationRestrictions) || "Worldwide",
          posted: sec(x.pubDate), url: x.applicationLink, salary: range(x.minSalary, x.maxSalary, x.currency),
        })));
        if (!j.jobs.length || !recent(sec(j.jobs.at(-1).pubDate))) break;
      }
    }
    return out;
  },
  // Mostly on-site German jobs; keep only the remote ones.
  Arbeitnow: async () => {
    const out = [];
    for (let page = 1; page <= 5; page++) {
      const j = await getJson(`https://www.arbeitnow.com/api/job-board-api?page=${page}`);
      out.push(...j.data.filter((x) => x.remote).map((x) => ({
        title: x.title, role: join(x.tags), type: join(x.job_types), company: x.company_name, location: x.location,
        posted: sec(x.created_at), url: x.url, salary: "",
      })));
      if (!j.links?.next) break;
    }
    return out;
  },
};

const today = () => new Date().toISOString().slice(0, 10);

function addJobSheet(wb, name, jobs) {
  const sheet = wb.addWorksheet(name);
  sheet.columns = [
    { header: "Platform", key: "platform", width: 12 },
    { header: "Title", key: "title", width: 45 },
    { header: "Role / Category", key: "role", width: 35 },
    { header: "Type", key: "type", width: 14 },
    { header: "Company", key: "company", width: 28 },
    { header: "Location", key: "location", width: 30 },
    { header: "Posted", key: "posted", width: 12, style: { numFmt: "yyyy-mm-dd" } },
    { header: "Salary", key: "salary", width: 22 },
    { header: "Apply", key: "apply", width: 60 },
  ];
  jobs.forEach((j) => sheet.addRow({ ...j, apply: { text: j.url, hyperlink: j.url } }));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "I1" };
}

// Every platform's last-7-day jobs (all roles) go to <outDir>/<platform>_jobs_<date>.xlsx;
// returns only the SDE/frontend matches across platforms for the combined sheet.
// A failing platform only logs a warning, the others still get their files.
async function remoteJobs(outDir, log) {
  const names = Object.keys(SOURCES);
  log(`fetching remote jobs from ${names.join(", ")}`);
  const results = await Promise.allSettled(names.map((n) => SOURCES[n]()));
  const seen = new Set();
  const matched = [];
  for (const [i, r] of results.entries()) {
    const platform = names[i];
    if (r.status === "rejected") {
      log(`${platform}: ${r.reason.message}`);
      continue;
    }
    const urls = new Set();
    const jobs = r.value
      .filter((j) => recent(j.posted) && !urls.has(j.url) && urls.add(j.url))
      .map((j) => ({ ...j, platform }))
      .sort((a, b) => b.posted - a.posted);
    const wb = new ExcelJS.Workbook();
    addJobSheet(wb, platform, jobs);
    const file = path.join(outDir, `${platform.toLowerCase()}_jobs_${today()}.xlsx`);
    await wb.xlsx.writeFile(file);
    const kept = jobs.filter((j) => wanted(j.title) && !seen.has(j.url) && seen.add(j.url));
    log(`${platform}: ${r.value.length} fetched, ${jobs.length} in last ${MAX_AGE_DAYS} days, ${kept.length} SDE/frontend`);
    matched.push(...kept);
  }
  return matched.sort((a, b) => b.posted - a.posted);
}

async function listAll() {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(LIST_URL + page);
    if (!res.ok) throw new Error(`page ${page}: HTTP ${res.status}`);
    const rows = await res.json();
    if (!rows.length) break;
    all.push(...rows);
  }
  return all;
}

// arc.dev has no profile API; the data sits in the page's Next.js __NEXT_DATA__ JSON.
async function profile(slug, log) {
  try {
    const html = await (await fetch(PROFILE_URL + slug)).text();
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    return (m && JSON.parse(m[1]).props.pageProps.companyData) || {};
  } catch (e) {
    log(`profile ${slug}: ${e.message}`);
    return {};
  }
}

const strip = (html) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// Writes the per-platform job files plus <outDir>/remote_companies_<date>.xlsx.
async function remoteCompanies(outDir, log = console.log) {
  // Start the job APIs now so they run alongside the slow arc.dev profile crawl (never rejects).
  const jobsPromise = remoteJobs(outDir, log);
  const companies = await listAll();
  log(`arc.dev: ${companies.length} companies, fetching profiles`);
  const ws = new ExcelJS.Workbook();
  const sheet = ws.addWorksheet("Companies");
  sheet.columns = [
    { header: "Company", key: "name", width: 30 },
    { header: "Remote Level", key: "remote", width: 18 },
    { header: "Size", key: "size", width: 12 },
    { header: "Open Jobs", key: "jobs", width: 10 },
    { header: "Headquarters", key: "hq", width: 25 },
    { header: "Website", key: "site", width: 35 },
    // { header: "Career Page (arc.dev)", key: "career", width: 40 },
    { header: "LinkedIn", key: "linkedin", width: 45 },
    { header: "About", key: "about", width: 80 },
  ];

  const seen = new Set();
  const unique = companies.filter((c) => !seen.has(c.url_string) && seen.add(c.url_string));
  // 5 profile requests at a time to stay polite to arc.dev.
  for (let i = 0; i < unique.length; i += 5) {
    const batch = unique.slice(i, i + 5);
    const profiles = await Promise.all(batch.map((c) => profile(c.url_string, log)));
    batch.forEach((c, j) => {
      const p = profiles[j];
      const link = (url) => (url ? { text: url, hyperlink: url } : "");
      sheet.addRow({
        name: c.name,
        remote: c.remote_level,
        size: (c.company_size || "").replace("_", "-"),
        jobs: p.openedJobCount ?? c.open_job_count,
        hq: p.headquarters?.name || "",
        site: link(p.officialSiteUrl),
        career: link(PROFILE_URL + c.url_string),
        linkedin: link(p.linkedinUrl),
        about: strip(c.headline),
      });
    });
    if ((i + 5) % 100 === 0) log(`profiles ${i + 5}/${unique.length}`);
  }

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "I1" };

  const jobs = await jobsPromise;
  addJobSheet(ws, "Remote Jobs", jobs);

  const file = path.join(outDir, `remote_companies_${today()}.xlsx`);
  await ws.xlsx.writeFile(file);
  return { companies: unique.length, jobs: jobs.length, file };
}

module.exports = { recent, remoteCompanies };
