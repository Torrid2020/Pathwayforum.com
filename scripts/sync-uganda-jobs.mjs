import fs from "node:fs/promises";

const OUTPUT = new URL("../data/uganda-jobs.json", import.meta.url);
const REVIEW = new URL("../data/uganda-jobs-review.json", import.meta.url);
const SEARCH_URL = "https://worldvision.wd1.myworkdayjobs.com/wday/cxs/worldvision/WorldVisionInternational/jobs";
const PUBLIC_BASE = "https://worldvision.wd1.myworkdayjobs.com/WorldVisionInternational";
const API_BASE = "https://worldvision.wd1.myworkdayjobs.com/wday/cxs/worldvision/WorldVisionInternational";
const now = new Date();
const unsafe = /\b(application fee|processing fee|training fee|pay to apply|crypto|bitcoin|gift card|telegram only|whatsapp only)\b/i;

function text(value = "") {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#43;/g, "+")
    .replace(/\s+/g, " ")
    .trim();
}

function category(title, body) {
  const value = title.toLowerCase();
  if (/\b(intern(ship)?|graduate|trainee|assistant)\b/i.test(title)) return "Graduate & Internship";
  if (/finance|account|audit|bank/.test(value)) return "Finance";
  if (/health|medical|nurse|clinical|nutrition/.test(value)) return "Health";
  if (/engineer|information technology|software|data|digital|ict/.test(value)) return "Technology";
  if (/logistic|supply|driver|transport|procurement/.test(value)) return "Logistics";
  if (/monitor|evaluation|research|learning|meal/.test(value)) return "Research & M&E";
  if (/sales|marketing|customer|business development/.test(value)) return "Sales & Customer Service";
  if (/\b(project|programme|program)\b/.test(value)) return "Project & Programme";
  if (/\b(admin|administration|operations|office)\b|human resources?/.test(value)) return "Administration";
  return "Project & Programme";
}

function indicators(title, body) {
  const value = (title + " " + body).toLowerCase();
  const list = [];
  if (/\b(intern|internship)\b/.test(value)) list.push("Internship");
  if (/\b(graduate|trainee|entry.level|junior|assistant)\b/.test(value)) list.push("Early-career language");
  if (/0.?2 years|one year|1 year|no experience/.test(value)) list.push("Limited experience requested");
  if (/\b(training provided|mentoring provided|graduate programme|graduate program)\b/.test(value)) list.push("Applicant training stated");
  return list.slice(0, 4);
}

function deadline(value) {
  if (!value) return {value: null, label: "Not published"};
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return {value: null, label: "Check source"};
  const days = Math.ceil((date - now) / 86400000);
  return {value: date.toISOString(), label: days < 0 ? "Expired" : days === 0 ? "Closes today" : "Closes in " + days + " day" + (days === 1 ? "" : "s")};
}

async function getJson(url, options = {}) {
  const response = await fetch(url, {...options, signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(response.status + " from " + url);
  return response.json();
}

async function fetchWorldVision() {
  const search = await getJson(SEARCH_URL, {
    method: "POST",
    headers: {"content-type": "application/json", "User-Agent": "PathwayForum-Uganda-Jobs/1.0"},
    body: JSON.stringify({appliedFacets: {}, limit: 20, offset: 0, searchText: "Uganda"})
  });
  const postings = (search.jobPostings || []).filter(job => /uganda/i.test(job.locationsText || ""));
  return Promise.all(postings.map(async job => {
    const detail = await getJson(API_BASE + job.externalPath, {headers: {"User-Agent": "PathwayForum-Uganda-Jobs/1.0"}});
    return detail.jobPostingInfo;
  }));
}

function normalizeWorldVision(info) {
  const body = text(info.jobDescription);
  const closing = deadline(info.endDate);
  const flags = [];
  if (!info.externalUrl || !info.canApply) flags.push("Application is not currently open");
  if (unsafe.test(info.title + " " + body)) flags.push("Potential payment or messaging-only language");
  if (closing.label === "Expired") flags.push("Expired");
  return {
    id: "world-vision:" + info.jobReqId,
    source: "World Vision Careers",
    sourceType: "official-employer",
    title: info.title,
    employer: "World Vision",
    location: info.location || "Uganda",
    district: String(info.location || "Uganda").split(",")[0],
    workplace: /remote/i.test(info.title + " " + body) ? "Remote or hybrid - confirm" : "On-site or field-based",
    employmentType: info.timeType || "Not stated",
    category: category(info.title, body),
    education: "See official listing",
    experience: "See official listing",
    publishedAt: info.startDate || null,
    deadline: closing.value,
    deadlineStatus: closing.label,
    summary: body.slice(0, 380) || "Open the official employer listing for the complete description.",
    indicators: indicators(info.title, body),
    verification: {status: flags.length ? "review" : "official-source", label: flags.length ? "Needs review" : "Official employer source", checkedAt: now.toISOString(), flags},
    sourceUrl: info.externalUrl || (PUBLIC_BASE + "/job/" + info.jobPostingId),
    applicationUrl: info.externalUrl || (PUBLIC_BASE + "/job/" + info.jobPostingId),
    lastCheckedAt: now.toISOString()
  };
}

async function main() {
  const collected = (await fetchWorldVision()).map(normalizeWorldVision);
  const jobs = collected.filter(job => job.verification.status === "official-source");
  const review = collected.filter(job => job.verification.status === "review");
  const feed = {
    generatedAt: now.toISOString(),
    country: "Uganda",
    jobCount: jobs.length,
    sources: {"World Vision Careers": "ok"},
    methodology: "Jobs come directly from approved official employer sources and are checked for expiry, duplicates and common scam language.",
    jobs
  };
  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({jobCount: jobs.length, reviewCount: review.length, jobs: jobs.map(job => ({title: job.title, location: job.location, deadline: job.deadlineStatus}))}, null, 2));
    return;
  }
  let previous = null;
  try { previous = JSON.parse(await fs.readFile(OUTPUT, "utf8")); } catch {}
  const stable = list => JSON.stringify((list || []).map(({lastCheckedAt, verification, ...job}) => ({...job, verification: {...verification, checkedAt: undefined}})));
  if (!previous || stable(previous.jobs) !== stable(feed.jobs)) {
    await fs.writeFile(OUTPUT, JSON.stringify(feed, null, 2) + "\n");
  }
  await fs.writeFile(REVIEW, JSON.stringify({generatedAt: now.toISOString(), jobCount: review.length, jobs: review}, null, 2) + "\n");
  console.log("Published " + jobs.length + " Uganda jobs; held " + review.length + " for review.");
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, "job_count=" + jobs.length + "\nreview_count=" + review.length + "\n");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
