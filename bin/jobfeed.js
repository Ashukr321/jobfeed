#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const readline = require("readline");
const chalk = require("chalk");
const { dailyJobs, MAX_AGE_DAYS } = require("../lib/daily");
const { remoteCompanies } = require("../lib/remote");

const CHOICES = {
  1: { label: "Daily jobs (SDE-1 / Frontend in Indian cities)", daily: true },
  2: { label: "Companies hiring remotely + remote jobs", remote: true },
  3: { label: "All of the above", daily: true, remote: true },
};

// Pasted paths often come wrapped in quotes (Windows "Copy as path") or start with ~.
const cleanPath = (p) => path.resolve(p.trim().replace(/^["']|["']$/g, "").replace(/^~(?=$|[\\/])/, os.homedir()));

async function ask() {
  // Reading lines through the iterator (not rl.question) keeps piped input working; EOF answers "" = default.
  const rl = readline.createInterface({ input: process.stdin });
  const lines = rl[Symbol.asyncIterator]();
  const question = async (q) => (process.stdout.write(q), ((await lines.next()).value ?? "").trim());
  try {
    console.log(chalk.bold("What do you want to fetch?"));
    for (const [n, c] of Object.entries(CHOICES)) console.log(`  ${chalk.cyan(n)}. ${c.label}${n === "3" ? chalk.dim(" (default)") : ""}`);
    let pick;
    while (!(pick = CHOICES[(await question(chalk.green("> Choose 1-3 [3]: "))) || "3"]))
      console.log(chalk.red("  Enter 1, 2 or 3."));
    const where = await question(chalk.green(`> Save Excel files where? [${process.cwd()}]: `));
    return { pick, base: cleanPath(where || process.cwd()) };
  } finally {
    rl.close();
  }
}

async function run(name, task) {
  const t = Date.now();
  console.log(chalk.bold.blue(`\n▶ ${name}`));
  try {
    const summary = await task((msg) => console.log(chalk.dim(`  ${msg}`)));
    console.log(chalk.green(`✔ ${summary}`) + chalk.dim(` (${Math.round((Date.now() - t) / 1000)}s)`));
    return true;
  } catch (e) {
    console.log(chalk.red(`✖ ${name} failed: ${e.message}`));
    return false;
  }
}

async function main() {
  console.log(chalk.bold.magenta("\n  jobfeed") + chalk.dim(` · jobs posted in the last ${MAX_AGE_DAYS} days\n`));
  const { pick, base } = await ask();
  const outDir = path.join(base, `jobfeed_${new Date().toISOString().slice(0, 10)}`);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(chalk.dim(`\nSaving to ${outDir}`));

  const ok = [];
  if (pick.daily)
    ok.push(await run("Daily jobs", async (log) => {
      const r = await dailyJobs(outDir, log);
      return `${r.count} jobs from ${r.companies} companies -> ${path.basename(r.file)}`;
    }));
  if (pick.remote)
    ok.push(await run("Companies hiring remotely", async (log) => {
      const r = await remoteCompanies(outDir, log);
      return `${r.companies} companies, ${r.jobs} SDE/frontend remote jobs -> ${path.basename(r.file)}`;
    }));

  console.log(chalk.bold(`\nDone. Files are in ${chalk.underline(outDir)}`));
  if (ok.includes(false)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(chalk.red(e.stack || e.message));
  process.exit(1);
});
