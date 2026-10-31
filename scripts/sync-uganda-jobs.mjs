import {storeDescriptions,listJob} from './job-description-store.mjs';
import {applyReviewDecision} from './uganda-review-decisions.mjs';
import {isUgandaLocation} from '../assets/uganda-locations.mjs';
import {reliefWebDuplicate,JOB_USER_AGENT} from './uganda-reliefweb.mjs';
import {normalizeDeadline,cleanLocation} from '../assets/uganda-data.mjs';
import {inferLevel,compareUgandaJobs} from '../assets/uganda-levels.mjs';
import fs from "node:fs/promises";
import {employerSources} from './uganda-source-registry.mjs';
import {collectExtraSources,collectReliefWeb} from './uganda-extra-sources.mjs';

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
  value = normalizeDeadline(value, now);
  if (!value) return {value: null, label: "Check the official deadline"};
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

async function getHtml(url) {
  const response = await fetch(url, {headers: {"User-Agent": JOB_USER_AGENT}, signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(response.status + " from " + url);
  return response.text();
}

function endOfUgandaDay(value) {
  const match = String(value || "").trim().match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (!match) return value || null;
  const months = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const month = months[match[2]];
  if (month === undefined) return value;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 20, 59, 59)).toISOString();
}
function endOfUgandaHumanDay(value) {
  const match = text(value).match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!match) return null;
  const months = {january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11};
  const month = months[match[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1]), 20, 59, 59)).toISOString();
}

function officialJob({id, source, title, employer, location, employmentType, experience, publishedAt, closesAt, summary, description, sourceUrl, applicationUrl}) {
  const body = text(summary);
  const closing = deadline(closesAt);
  const flags = [];
  if (!sourceUrl || !applicationUrl) flags.push("Missing official source or application link");
  if (unsafe.test(title + " " + body)) flags.push("Potential payment or messaging-only language");
  if (closing.label === "Expired") flags.push("Expired");
  return {
    id,
    _description:description||null,
    source,
    sourceType: "official-employer",
    title: text(title),
    level: inferLevel({title:text(title),experience,description:body}),
    employer,
    location: text(location || "Uganda"),
    district: text(location || "Uganda").split(",")[0],
    workplace: /remote/i.test(title + " " + body) ? "Remote or hybrid - confirm" : "On-site or field-based",
    employmentType: employmentType || "Not stated",
    category: category(text(title), body),
    education: "See official listing",
    experience: experience || "See official listing",
    publishedAt: publishedAt || null,
    deadline: closing.value,
    deadlineStatus: closing.label,
    summary: body.slice(0, 380) || "Open the official employer listing for the complete description.",
    indicators: indicators(text(title), body),
    verification: {status: flags.length ? "review" : "official-source", label: flags.length ? "Needs review" : "Official employer source", checkedAt: now.toISOString(), flags},
    sourceUrl,
    applicationUrl,
    lastCheckedAt: now.toISOString()
  };
}

async function fetchDfcu() {
  const home = "https://careers.dfcugroup.com/";
  const html = await getHtml(home);
  const articles = [...html.matchAll(/<article>([\s\S]*?)<\/article>/gi)].map(match => match[1]);
  const jobs = [];
  for (const article of articles) {
    const titleMatch = article.match(/<h2 class="title">[\s\S]*?<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;
    const posted = article.match(/Posted:\s*([^<]+)/i)?.[1]?.trim() || null;
    const closes = article.match(/Deadline:\s*([^<]+)/i)?.[1]?.trim() || null;
    const detailUrl = titleMatch[1];
    const detailHtml = await getHtml(detailUrl);
    const description = detailHtml.match(/<meta property="og:description" content="([^"]*)"/i)?.[1] || "";
    const detailCloses = detailHtml.match(/<strong>Deadline:<\/strong>\s*<strong>([\s\S]*?)<\/strong>/i)?.[1] || null;
    jobs.push(officialJob({
      id: "dfcu:" + new URL(detailUrl).pathname.replace(/\W+/g, "-"),
      source: "dfcu Bank Careers",
      title: titleMatch[2],
      employer: "dfcu Bank",
      location: /all regions/i.test(titleMatch[2] + " " + description) ? "All regions, Uganda" : (description.match(/Duty Station:\s*([^.<]+)/i)?.[1] || "Uganda"),
      employmentType: "See official listing",
      publishedAt: endOfUgandaDay(posted),
      closesAt: endOfUgandaHumanDay(detailCloses) || endOfUgandaDay(closes),
      summary: description,
      sourceUrl: detailUrl,
      applicationUrl: home
    }));
  }
  return jobs;
}

async function fetchNssf() {
  const home = "https://www.nssfug.org/opportunities/careers/";
  const html = await getHtml(home);
  const links = [...html.matchAll(/href="(\/specials\/featured-jobs\/[^"]+)"[\s\S]{0,350}?>([\s\S]*?)<\/a>/gi)];
  const unique = new Map();
  for (const match of links) unique.set(match[1], text(match[2]));
  const jobs = [];
  for (const [path, listedTitle] of unique) {
    const detailUrl = new URL(path, home).href;
    const detailHtml = await getHtml(detailUrl);
    const title = text(detailHtml.match(/<strong>JOB TITLE:<\/strong>([\s\S]*?)<\/p>/i)?.[1] || listedTitle);
    const location = text(detailHtml.match(/<strong>DUTY STATION:<\/strong>([\s\S]*?)<\/p>/i)?.[1] || "Uganda");
    const purpose = detailHtml.match(/<strong>Job Purpose:<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)?.[1] || "";
    jobs.push(officialJob({
      id: "nssf:" + path.replace(/\W+/g, "-"),
      source: "NSSF Uganda Careers",
      title,
      employer: "NSSF Uganda",
      location: /headquarters/i.test(location) ? "Kampala, Uganda" : location,
      employmentType: "See official listing",
      publishedAt: null,
      closesAt: null,
      summary: purpose,
      sourceUrl: detailUrl,
      applicationUrl: detailUrl
    }));
  }
  return jobs;
}
async function fetchWorldVision() {
  const search = await getJson(SEARCH_URL, {
    method: "POST",
    headers: {"content-type": "application/json", "User-Agent": JOB_USER_AGENT},
    body: JSON.stringify({appliedFacets: {}, limit: 20, offset: 0, searchText: "Uganda"})
  });
  const postings = (search.jobPostings || []).filter(job => isUgandaLocation(job.locationsText));
  return Promise.all(postings.map(async job => {
    const detail = await getJson(API_BASE + job.externalPath, {headers: {"User-Agent": JOB_USER_AGENT}});
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
    _description:info.jobDescription||null,
    source: "World Vision Careers",
    sourceType: "official-employer",
    title: info.title,
    level: inferLevel({title:info.title,description:body}),
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
  const sources = [
    {name: "World Vision Careers", run: async () => (await fetchWorldVision()).map(normalizeWorldVision)},
    {name: "dfcu Bank Careers", run: fetchDfcu},
    {name: "NSSF Uganda Careers", run: fetchNssf}
  ];
  const [results,extra,relief] = await Promise.all([
    Promise.allSettled(sources.map(source => source.run())),
    collectExtraSources(),
    collectReliefWeb().catch(error=>({jobs:[],status:'unavailable',message:error.message}))
  ]);
  const sourceStatus = Object.fromEntries(results.map((result, index) => [sources[index].name, result.status === "fulfilled" ? "ok" : String(result.reason)]));
  const failed = results.map((result, index) => result.status === "rejected" ? sources[index].name + ": " + result.reason : null).filter(Boolean);
  if(failed.length)console.warn('Source update warnings: '+failed.join(' | '));
  let decisions=[];try{decisions=JSON.parse(await fs.readFile(new URL('../data/uganda-job-review-decisions.json',import.meta.url),'utf8')).decisions||[]}catch{}
  let previousFeed={jobs:[]};try{previousFeed=JSON.parse(await fs.readFile(OUTPUT,'utf8'))}catch{}
  const collected = results.flatMap((result,index) => {
    const source=employerSources.find(s=>s.name===sources[index].name);
    return result.status==='fulfilled'?result.value.map(job=>({...job,sourceId:source?.id,sector:source?.sector||'Other'})):[];
  });
  for(const item of extra){sourceStatus[item.source.name]=item.status;collected.push(...item.jobs)}
  sourceStatus.ReliefWeb=relief.status;collected.push(...relief.jobs);
  let previousReviewFeed={jobs:[]};try{previousReviewFeed=JSON.parse(await fs.readFile(REVIEW,'utf8'))}catch{}
  // Short outages retain only recently checked, unexpired records, with the original check date.
  const failedNames=new Set([...failed.map(x=>x.split(':')[0]),...extra.filter(x=>x.status==='unavailable').map(x=>x.source.name)]);
  collected.push(...[...(previousFeed.jobs||[]),...(previousReviewFeed.jobs||[])].filter(job=>failedNames.has(job.source)&&Date.now()-Date.parse(job.lastCheckedAt)<72*3600000&&(!job.deadline||Date.parse(job.deadline)>Date.now())));
  let approved=[];try{approved=JSON.parse(await fs.readFile(new URL('../data/employer-jobs-approved.json',import.meta.url),'utf8')).jobs||[]}catch{}
  for(const entry of approved){
    if(entry.status!=='approved'||!entry.approvedBy||!Number.isFinite(Date.parse(entry.approvedAt))||!entry.closesAt||Date.parse(entry.closesAt)<Date.now())continue;
    if(!/^https:\/\//.test(entry.sourceUrl||'')||!/^https:\/\//.test(entry.applicationUrl||''))continue;
    const job=officialJob({...entry,id:'employer:'+entry.id,source:'Employer submission reviewed by Pathway Forum'});
    collected.push({...job,sourceId:'employer-reviewed',sector:entry.sector||'Other',sourceType:'employer-reviewed',verification:{...job.verification,label:'Employer listing reviewed'}});
  }
  const unique = new Map();
  for (const raw of collected) {
    const deadline=normalizeDeadline(raw.deadline, now);
    const location=cleanLocation(raw.location);
    if(!isUgandaLocation(location))continue;
    const job={...raw,location,district:location.split(',')[0],deadline,deadlineStatus:deadline?raw.deadlineStatus:"Check the official deadline"};
    const key = (job.employer + "|" + job.title + "|" + job.location).toLowerCase().replace(/\W/g, "");
    if (!unique.has(key) && ![...unique.values()].some(existing=>reliefWebDuplicate(existing,job))) unique.set(key, job);
  }
  const deduped = [...unique.values()].map(job=>({...job,level:!job.level||job.level==='Not stated'?inferLevel(job):job.level}));
  const decided=deduped.map(job=>applyReviewDecision(job,decisions));
  let jobs = decided.filter(job => job.verification.status === "official-source" && (!job.deadline||Date.parse(job.deadline)>Date.now())).sort(compareUgandaJobs);
  const review = decided.filter(job => job.verification.status === "review").map(listJob);
  if(!process.argv.includes("--dry-run"))jobs=await storeDescriptions("uganda",jobs);
  const feed = {
    generatedAt: now.toISOString(),
    country: "Uganda",
    jobCount: jobs.length,
    sources: sourceStatus,
    methodology: "Official employer feeds, reviewed employer submissions and configured humanitarian APIs. Expired vacancies are excluded. Levels are inferred from titles, experience and descriptions, with entry and mid-level roles shown before senior positions; confirm requirements with the employer. Source checks do not guarantee suitability or hiring.",
    jobs
  };
  if (process.argv.includes("--dry-run")) {
    console.log(JSON.stringify({jobCount: jobs.length, reviewCount: review.length, jobs: jobs.map(job => ({title: job.title, location: job.location, deadline: job.deadlineStatus}))}, null, 2));
    return;
  }
  const directory={updatedAt:now.toISOString(),policy:'Official career directory. Connected means a recruitment adapter responded; it does not imply a current suitable vacancy. Manual review sources are not automatically imported without structured data.',sources:employerSources.map(source=>{
    const result=extra.find(x=>x.source.id===source.id),existing=sourceStatus[source.name];
    return {...source,recordsRead:result?.recordsRead??collected.filter(j=>j.sourceId===source.id).length,publishedCount:jobs.filter(j=>j.sourceId===source.id).length,reviewCount:review.filter(j=>j.sourceId===source.id).length,status:result?.status||(existing==='ok'?'connected':'unavailable'),message:result?.message||(existing==='ok'?'Official employer source checked.':existing||'Check required'),checkedAt:now.toISOString()};
  }),aggregators:[{id:'reliefweb',name:'ReliefWeb (OCHA)',url:'https://reliefweb.int/jobs',status:relief.status,message:relief.message,recordsRead:relief.recordsRead||0,publishedCount:jobs.filter(j=>j.sourceId==='reliefweb').length,reviewCount:review.filter(j=>j.sourceId==='reliefweb').length}]};
  await fs.writeFile(new URL('../data/uganda-job-sources.json',import.meta.url),JSON.stringify(directory,null,2)+'\n');
  let previous = null;
  let previousReview = null;
  try { previous = JSON.parse(await fs.readFile(OUTPUT, "utf8")); } catch {}
  try { previousReview = JSON.parse(await fs.readFile(REVIEW, "utf8")); } catch {}
  const stable = list => JSON.stringify((list || []).map(({lastCheckedAt, verification, ...job}) => ({...job, verification: {...verification, checkedAt: undefined}})));
  if (!previous || stable(previous.jobs) !== stable(feed.jobs)) {
    await fs.writeFile(OUTPUT, JSON.stringify(feed, null, 2) + "\n");
  }
  if (!previousReview || stable(previousReview.jobs) !== stable(review)) {
    await fs.writeFile(REVIEW, JSON.stringify({generatedAt: now.toISOString(), jobCount: review.length, jobs: review}, null, 2) + "\n");
  }
  console.table(directory.sources.map(({employer,status,recordsRead,publishedCount,reviewCount})=>({employer,status,read:recordsRead,published:publishedCount,held:reviewCount})));
  console.log("Published " + jobs.length + " Uganda jobs; held " + review.length + " for review.");
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, "job_count=" + jobs.length + "\nreview_count=" + review.length + "\n");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
