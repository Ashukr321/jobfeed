// SDE-1 / Frontend jobs in tier-1 Indian cities from public company job-board APIs
// (Greenhouse, Lever, Ashby). No login, no scraping. Only jobs posted in the last 7 days.
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const MAX_AGE_DAYS = 7;
const ROLE = /\b(sde|software (development )?engineer|software developer|front[- ]?end|frontend|react|web developer|ui engineer)\b/i;
const TOO_SENIOR = /\b(senior|sr\.?|lead|staff|principal|manager|head|director|architect|ii|iii|iv|sde[- ]?[23]|[23])\b|intern/i;
const CITIES = {
  Bengaluru: /bengaluru|bangalore/i, Hyderabad: /hyderabad/i, Pune: /pune/i, Mumbai: /mumbai/i,
  "Delhi NCR": /delhi|gurgaon|gurugram|noida/i, Chennai: /chennai/i, Kolkata: /kolkata/i, Ahmedabad: /ahmedabad/i,
  "Remote (India)": /remote.*india|india.*remote/i,
};

const cityOf = (loc) => Object.keys(CITIES).find((c) => CITIES[c].test(loc || "")) || null;
const wanted = (title) => ROLE.test(title || "") && !TOO_SENIOR.test(title);
const isoDay = (d) => d.toISOString().slice(0, 10);
// posted is an ISO date string (YYYY-MM-DD...); missing dates are dropped.
const recent = (posted, today = new Date()) =>
  Boolean(posted) && posted.slice(0, 10) >= isoDay(new Date(today - MAX_AGE_DAYS * 864e5));

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": "jobfeed/1.0" }, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Posting date: Greenhouse first_published (not updated_at: edited old jobs would look new), Lever createdAt, Ashby publishedAt.
async function fetchBoard(ats, board) {
  if (ats === "greenhouse")
    return (await get(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs`)).jobs.map((j) =>
      [j.title, j.location.name, j.absolute_url, (j.first_published || j.updated_at || "").slice(0, 10)]);
  if (ats === "lever")
    return (await get(`https://api.lever.co/v0/postings/${board}?mode=json`)).map((j) =>
      [j.text, j.categories.location || "", j.hostedUrl, isoDay(new Date(j.createdAt))]);
  if (ats === "ashby")
    return (await get(`https://api.ashbyhq.com/posting-api/job-board/${board}`)).jobs.map((j) =>
      [j.title, j.location || "", j.jobUrl, (j.publishedAt || "").slice(0, 10)]);
  throw new Error(`unknown ATS '${ats}'`);
}

// Writes <outDir>/india_jobs_<date>.xlsx and returns the number of jobs written.
async function dailyJobs(outDir, log = console.log) {
  const lines = fs.readFileSync(path.join(__dirname, "..", "companies.txt"), "utf8")
    .split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
  const results = await Promise.allSettled(lines.map((line) => {
    const [ats, rest] = line.split(/:(.*)/s);
    const [board, name] = rest.split("|").map((p) => p.trim());
    return fetchBoard(ats, board).then((jobs) => jobs.map((j) => [name || board, ...j]));
  }));
  const rows = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") return log(`skipped ${lines[i]}: ${r.reason.message}`);
    for (const [company, title, loc, url, posted] of r.value) {
      const city = cityOf(loc);
      if (city && wanted(title) && recent(posted)) rows.push([company, title, city, loc, posted, url]);
    }
  });
  rows.sort((a, b) => b[4].localeCompare(a[4]));

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Jobs", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [["Company", 16], ["Job Title", 50], ["City", 16], ["Location (as posted)", 34], ["Posted", 15], ["Apply Link", 60]]
    .map(([header, width]) => ({ header, width }));
  ws.getRow(1).eachCell((c) => {
    c.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A66C2" } };
  });
  for (const r of rows) {
    const row = ws.addRow([...r.slice(0, 5), { text: r[5], hyperlink: r[5] }]);
    row.getCell(6).font = { name: "Arial", color: { argb: "FF0563C1" }, underline: true };
  }
  ws.autoFilter = `A1:F${Math.max(ws.rowCount, 2)}`;
  const file = path.join(outDir, `india_jobs_${isoDay(new Date())}.xlsx`);
  await wb.xlsx.writeFile(file);
  return { count: rows.length, companies: lines.length, file };
}

module.exports = { cityOf, wanted, recent, dailyJobs, MAX_AGE_DAYS };
