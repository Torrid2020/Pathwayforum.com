// Checks each scholarship's official page and keeps data/scholarships.js current.
//
//   node scripts/check-deadlines.mjs [--report report.md] [--dry-run]
//
// Watch types (set per scholarship in data/scholarships.js):
//   date   - pattern captures the deadline. Same date: refresh "checked". New future date:
//            update "closes". Anything else: flag for review.
//   text   - pattern captures a key sentence. Unchanged: refresh "checked". Changed or
//            missing: flag for review (rewording a listing needs a person).
//   manual - page can't be read automatically. Flag once "checked" is STALE_DAYS old.
//
// The report lists only what needs attention; it's empty when everything checks out.

import { readFile, writeFile, appendFile } from "node:fs/promises";

const DATA_FILE = new URL("../data/scholarships.js", import.meta.url);
const STALE_DAYS = 45;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

const args = process.argv.slice(2);
const reportPath = args.includes("--report") ? args[args.indexOf("--report") + 1] : null;
const dryRun = args.includes("--dry-run");
const today = new Date().toISOString().slice(0, 10);

// --- data file -------------------------------------------------------------

async function loadData() {
  const source = await readFile(DATA_FILE, "utf8");
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  return { header: source.slice(0, start), items: JSON.parse(source.slice(start, end + 1)) };
}

async function saveData({ header, items }) {
  await writeFile(DATA_FILE, header + JSON.stringify(items, null, 2) + ";\n");
}

// --- fetching --------------------------------------------------------------

const pageCache = new Map();

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "–")
    .replace(/&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

async function fetchText(url) {
  if (pageCache.has(url)) return pageCache.get(url);
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "text/html", "Accept-Language": "en" },
        signal: AbortSignal.timeout(30000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = htmlToText(await response.text());
      pageCache.set(url, text);
      return text;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

// --- dates -----------------------------------------------------------------

function toISO(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

// Accepts "6 October 2026", "20 October" (year from yearHint), or US-style "6/30/27".
function parseDate(value, yearHint) {
  let m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (m) {
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return toISO(year, Number(m[1]), Number(m[2]));
  }
  m = value.match(/^(\d{1,2}) ([A-Za-z]+)(?: (\d{4}))?$/);
  if (m) {
    const month = MONTHS.indexOf(m[2].toLowerCase()) + 1;
    const year = m[3] ? Number(m[3]) : yearHint;
    if (!month || !year) return null;
    return toISO(year, month, Number(m[1]));
  }
  return null;
}

const ageInDays = (iso) => Math.round((Date.parse(today) - Date.parse(iso)) / 86400000);

// --- checks ----------------------------------------------------------------

async function check(item) {
  const watch = item.watch;
  if (!watch) return { status: "skipped" };

  if (watch.type === "manual") {
    return ageInDays(item.checked) > STALE_DAYS
      ? { status: "review", message: `${watch.reason} Check the official page, then update "checked" to today's date.` }
      : { status: "skipped" };
  }

  const url = watch.url || item.url;
  let page;
  try {
    page = await fetchText(url);
  } catch (error) {
    return { status: "review", message: `Couldn't load the official page (${error.message}).` };
  }

  const match = page.match(new RegExp(watch.pattern));
  if (!match) {
    return { status: "review", message: "The official page no longer contains the wording we watch for. It has probably been updated for a new cycle." };
  }

  if (watch.type === "text") {
    const found = (match.groups?.text ?? match[0]).trim();
    if (found === watch.expect) return { status: "confirmed" };
    return { status: "review", message: `The official page changed. It used to say “${watch.expect}” and now says “${found}”.` };
  }

  const yearHint = match.groups?.year ? Number(match.groups.year) + (watch.yearOffset ?? 0) : null;
  const found = parseDate(match.groups.date.trim(), yearHint);
  if (!found) {
    return { status: "review", message: `Found a deadline (“${match.groups.date}”) but couldn't read it as a date.` };
  }
  if (found === item.closes) return { status: "confirmed" };
  if (found > today) return { status: "updated", previous: item.closes, closes: found };
  return { status: "review", message: `The official page shows ${found}, which is different from our listing (${item.closes}) and already in the past.` };
}

// --- run -------------------------------------------------------------------

const data = await loadData();
const results = [];

for (const item of data.items) {
  const result = await check(item);
  if (result.status === "confirmed") item.checked = today;
  if (result.status === "updated") {
    item.closes = result.closes;
    item.checked = today;
  }
  results.push({ item, ...result });
}

const updated = results.filter((r) => r.status === "updated");
const review = results.filter((r) => r.status === "review");

let report = "";
if (updated.length) {
  report += "## Updated automatically\n\nThe official page published a new deadline, so the site now shows it:\n\n";
  for (const r of updated) report += `- **${r.item.name}**: ${r.previous ?? "no date"} → **${r.closes}** ([official page](${r.item.watch.url || r.item.url}))\n`;
  report += "\n";
}
if (review.length) {
  report += "## Needs your review\n\nThese listings were not changed. Check each official page and update `data/scholarships.js` by hand:\n\n";
  for (const r of review) report += `- **${r.item.name}**: ${r.message} Last confirmed on ${r.item.checked}. ([official page](${r.item.watch?.url || r.item.url}))\n`;
  report += "\n";
}
if (report) report += "_Posted by the daily scholarship deadline check._\n";

for (const r of results) {
  const detail = r.status === "updated" ? ` → ${r.closes}` : r.message ? ` — ${r.message}` : "";
  console.log(`${r.status.padEnd(9)} ${r.item.name}${detail}`);
}

if (!dryRun) await saveData(data);
if (reportPath) await writeFile(reportPath, report);
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `updated=${updated.length > 0}\nattention=${report.length > 0}\n`);
}
