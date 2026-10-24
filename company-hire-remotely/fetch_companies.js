// Fetch all arc.dev "featured" companies (page 1 until an empty page) and write them to Excel,
// with each company's website, career page and LinkedIn taken from its arc.dev profile.
// Usage: npm install && node fetch_companies.js
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");

const LIST_URL = "https://api.arc.dev/p/companies/featured?page=";
const PROFILE_URL = "https://arc.dev/company/";
const OUT_DIR = path.join(__dirname, "output");

async function listAll() {
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(LIST_URL + page);
    if (!res.ok) throw new Error(`page ${page}: HTTP ${res.status}`);
    const rows = await res.json();
    if (!rows.length) break;
    all.push(...rows);
    console.log(`page ${page}: ${rows.length} companies`);
  }
  return all;
}

// arc.dev has no profile API; the data sits in the page's Next.js __NEXT_DATA__ JSON.
async function profile(slug) {
  try {
    const html = await (await fetch(PROFILE_URL + slug)).text();
    const m = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    return (m && JSON.parse(m[1]).props.pageProps.companyData) || {};
  } catch (e) {
    console.warn(`profile ${slug}: ${e.message}`);
    return {};
  }
}

const strip = (html) => (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function main() {
  const companies = await listAll();
  const ws = new ExcelJS.Workbook();
  const sheet = ws.addWorksheet("Companies");
  sheet.columns = [
    { header: "Company", key: "name", width: 30 },
    { header: "Remote Level", key: "remote", width: 18 },
    { header: "Size", key: "size", width: 12 },
    { header: "Open Jobs", key: "jobs", width: 10 },
    { header: "Headquarters", key: "hq", width: 25 },
    { header: "Website", key: "site", width: 35 },
    { header: "Career Page (arc.dev)", key: "career", width: 40 },
    { header: "LinkedIn", key: "linkedin", width: 45 },
    { header: "About", key: "about", width: 80 },
  ];

  const seen = new Set();
  const unique = companies.filter((c) => !seen.has(c.url_string) && seen.add(c.url_string));
  // 5 profile requests at a time to stay polite to arc.dev.
  for (let i = 0; i < unique.length; i += 5) {
    const batch = unique.slice(i, i + 5);
    const profiles = await Promise.all(batch.map((c) => profile(c.url_string)));
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
    console.log(`profiles ${Math.min(i + 5, unique.length)}/${unique.length}`);
  }

  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: "A1", to: "I1" };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `remote_companies_${new Date().toISOString().slice(0, 10)}.xlsx`);
  await ws.xlsx.writeFile(file);
  console.log(`Wrote ${unique.length} companies -> ${file}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
