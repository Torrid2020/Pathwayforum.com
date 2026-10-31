import {generateJobPages} from './job-pages.mjs';
import {loadRemovals,isRemoved} from './job-removals.mjs';
import {storeDescriptions} from './job-description-store.mjs';
import {pathToFileURL} from 'node:url';
import fs from "node:fs/promises";
const OUTPUT = new URL("../data/remote-jobs.json", import.meta.url);
const now = new Date();
const TARGET = {
  africa: ["DZ","AO","BJ","BW","BF","BI","CV","CM","CF","TD","KM","CD","CG","CI","DJ","EG","GQ","ER","SZ","ET","GA","GM","GH","GN","GW","KE","LS","LR","LY","MG","MW","ML","MR","MU","MA","MZ","NA","NE","NG","RW","ST","SN","SC","SL","SO","ZA","SS","SD","TZ","TG","TN","UG","ZM","ZW"],
  southAmerica: ["AR","BO","BR","CL","CO","EC","GY","PY","PE","SR","UY","VE"],
  asia: ["AF","AM","AZ","BH","BD","BT","BN","KH","CN","CY","GE","IN","ID","IR","IQ","IL","JP","JO","KZ","KW","KG","LA","LB","MY","MV","MN","MM","NP","KP","KR","OM","PK","PS","PH","QA","SA","SG","LK","SY","TW","TJ","TH","TL","TR","TM","AE","UZ","VN","YE"]
};
const ALL_CODES = new Set(Object.values(TARGET).flat());
const senior = /\b(senior|sr\.?|lead|principal|staff|manager|director|head|chief|vp|vice president)\b/i;
const positive = /\b(intern(ship)?|student|graduate|entry[- ]level|junior|jr\.?|trainee|apprentice|assistant|no experience|0[-– ]?2 years|part[- ]time)\b/i;
const dangerous = /\b(pay(?:ment)? to apply|application fee|training fee|crypto(?:currency)?|bitcoin|usdt|gift card|deposit a check|cheque processing|reship(?:ping)?|package forwarding|optimization tasks?|telegram only|whatsapp only)\b/i;
const irrelevant = /\b(fighter pilot|physician|surgeon|registered nurse|truck driver|warehouse operative)\b/i;
function text(html=""){return String(html).replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&(?:nbsp|amp|quot|#39|hellip);/g," ").replace(/\s+/g," ").trim()}
function slug(s){return String(s||"job").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)}
function scoreJob(title, body, type, level){
  const signal=[title,type,level].join(" ");
  const hay=[signal,body].join(" ");
  let score=35, reasons=[];
  if(positive.test(signal)){score+=30;reasons.push("Student or entry-level language")}
  if(/\bintern(ship)?\b/i.test(hay)){score+=18;reasons.push("Internship")}
  if(/\bpart[- ]time\b/i.test(hay)){score+=12;reasons.push("Part-time")}
  if(/\b(training provided|trainee|apprentice)\b/i.test(hay)){score+=10;reasons.push("Training opportunity")}
  if(senior.test(title+" "+level)){score-=65}
  const years=[...hay.matchAll(/(\d+)\s*\+?\s*(?:-|to)?\s*(\d+)?\s*years?/gi)].map(m=>Number(m[2]||m[1]));
  const maxYears=years.length?Math.max(...years):null;
  if(maxYears!==null&&maxYears<=2){score+=8;reasons.push(maxYears+" years or less")}
  if(maxYears!==null&&maxYears>2)score-=35;
  const evidence=positive.test(signal)||(maxYears!==null&&maxYears<=2);
  return {score:Math.max(0,Math.min(100,score)),reasons:[...new Set(reasons)].slice(0,4),maxYears,evidence};
}
async function get(url){
  const response=await fetch(url,{headers:{Accept:"application/json","User-Agent":"PathwayForum Jobs/1.0 (+https://torrid2020.github.io/Pathwayforum.com/)"},signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw new Error(response.status+" "+url);
  return response.json();
}
function targetRegions(codes){
  const set=new Set(codes.map(x=>String(x).toUpperCase()));
  return Object.entries(TARGET).filter(([,values])=>values.some(v=>set.has(v))).map(([name])=>name);
}
function normalizeJobicy(j){
  const body=text(j.jobDescription||j.jobExcerpt), title=j.jobTitle||"Untitled role", geo=String(j.jobGeo||"").toLowerCase();
  const regions=geo.includes("anywhere")?["africa","southAmerica","asia"]:geo.includes("latam")?["southAmerica"]:geo.includes("apac")?["asia"]:geo.includes("emea")?["africa"]:[];
  const fit=scoreJob(title,body,(j.jobType||[]).join(" "),j.jobLevel);
  const flags=dangerous.test(title+" "+body)?["Suspicious payment or recruitment language"]:regions.length?[]:["Location outside target regions"];
  return {id:"jobicy:"+j.id,source:"Jobicy",sourceId:String(j.id),title,company:j.companyName||"Employer",logo:j.companyLogo||null,summary:text(j.jobExcerpt||body).slice(0,280),_description:j.jobDescription||null,employmentType:(j.jobType||[]).join(", ")||"Not stated",level:j.jobLevel||"Not stated",salary:j.annualSalaryMin?{min:j.annualSalaryMin,max:j.annualSalaryMax||null,currency:j.salaryCurrency||"USD",period:"year"}:null,eligibility:{label:j.jobGeo||"Check listing",regions,countries:[],confidence:geo.includes("emea")?"review":"verified"},publishedAt:j.pubDate||j.jobPublished||null,expiresAt:j.jobExpires||null,applicationUrl:j.url,sourceUrl:j.url,studentFit:fit,safety:{status:flags.length?"review":"passed",flags},lastSeenAt:now.toISOString()};
}
export function normalizeHimalayas(j){
  if(typeof j.applicationLink!=="string"||!/^https:\/\//i.test(j.applicationLink))return null;
  const body=text(j.description||j.excerpt), title=j.title||"Untitled role", restrictions=(j.locationRestrictions||[]).map(String), codes=restrictions.filter(x=>/^[A-Za-z]{2}$/.test(x)).map(x=>x.toUpperCase()), worldwide=restrictions.length===0;
  const regions=worldwide?["africa","southAmerica","asia"]:targetRegions(codes);
  const fit=scoreJob(title,body,j.employmentType,(j.seniority||[]).join(" "));
  const flags=dangerous.test(title+" "+body)?["Suspicious payment or recruitment language"]:regions.length?[]:["Location outside target regions"];
  const identity=j.guid||j.jobSlug||j.slug||slug(title);
  return {id:"himalayas:"+(j.companySlug||slug(j.companyName))+":"+identity,source:"Himalayas",sourceId:String(identity),title,company:j.companyName||"Employer",logo:j.companyLogo||null,summary:text(j.excerpt||body).slice(0,280),_description:j.description||null,employmentType:j.employmentType||"Not stated",level:(j.seniority||[]).join(", ")||"Not stated",salary:j.minSalary?{min:j.minSalary,max:j.maxSalary||null,currency:j.currency||"USD",period:j.salaryPeriod||"year"}:null,eligibility:{label:worldwide?"Worldwide":restrictions.join(", "),regions,countries:codes,confidence:worldwide||codes.length?"verified":"review"},timezoneRestrictions:j.timezoneRestrictions||[],publishedAt:j.pubDate?(typeof j.pubDate==="number"?new Date(j.pubDate*1000).toISOString():j.pubDate):null,expiresAt:j.expiryDate?(typeof j.expiryDate==="number"?new Date(j.expiryDate*1000).toISOString():j.expiryDate):null,applicationUrl:j.applicationLink,sourceUrl:j.guid||j.applicationLink||"https://himalayas.app",studentFit:fit,safety:{status:flags.length?"review":"passed",flags},lastSeenAt:now.toISOString()};
}
async function main(){
  const sourceStatus={}, collected=[];
  const jobicyGeos=["anywhere","apac","latam","emea"];
  const jobicyRequests=jobicyGeos.flatMap(geo=>[{geo,tag:null},...["intern","junior","graduate"].map(tag=>({geo,tag}))]);
  const jobicy=await Promise.allSettled(jobicyRequests.map(({geo,tag})=>get("https://jobicy.com/api/v2/remote-jobs?count=200&geo="+geo+(tag?"&tag="+encodeURIComponent(tag):""))));
  jobicy.forEach((result,i)=>{const request=jobicyRequests[i],name="Jobicy "+request.geo+(request.tag?" "+request.tag:"");sourceStatus[name]=result.status==="fulfilled"?"ok":String(result.reason);if(result.status==="fulfilled")collected.push(...(result.value.jobs||[]).map(normalizeJobicy))});
  const himQueries=["worldwide=true&sort=recent&page=1","worldwide=true&type=intern&sort=recent&page=1","worldwide=true&type=part-time&sort=recent&page=1","worldwide=true&experience=entry-level&sort=recent&page=1"];
  himQueries.push(...[1,2,3].map(page=>"country=UG&seniority=Entry-level&page="+page));
  const him=await Promise.allSettled(himQueries.map(q=>get("https://himalayas.app/jobs/api/search?"+q)));
  him.forEach((result,i)=>{sourceStatus["Himalayas "+(i+1)]=result.status==="fulfilled"?"ok":String(result.reason);if(result.status==="fulfilled")collected.push(...(result.value.jobs||[]).map(normalizeHimalayas).filter(Boolean))});
  const unique=new Map();
  for(const job of collected){
    const key=(job.company+"|"+job.title).toLowerCase().replace(/\W/g,"");
    const old=unique.get(key);
    if(!old||job.studentFit.score>old.studentFit.score)unique.set(key,job);
  }
  let jobs=[...unique.values()].filter(j=>j.eligibility.regions.length&&j.studentFit.evidence&&j.studentFit.score>=45&&j.safety.status!=="review"&&!senior.test(j.title)&&!/\b(?:mid[- ]level|senior|manager|director|executive)\b/i.test(j.level)&&!irrelevant.test(j.title)).sort((a,b)=>b.studentFit.score-a.studentFit.score||String(b.publishedAt||"").localeCompare(String(a.publishedAt||""))).slice(0,180);
  const removals=await loadRemovals();
  jobs=jobs.filter(job=>!isRemoved(job,removals));
  if(!jobs.length&&!Object.values(sourceStatus).some(status=>status==="ok"))throw new Error("All sources failed; existing feed left untouched.");
  if(!process.argv.includes("--dry-run"))jobs=await generateJobPages("remote",await storeDescriptions("remote",jobs));
  const payload={generatedAt:now.toISOString(),targetRegions:["Africa","South America","Asia"],jobCount:jobs.length,sources:sourceStatus,methodology:"Automated source, location, student-fit and safety screening. Applicants must confirm all details on the official listing.",jobs};
  if(process.argv.includes("--dry-run")){console.log(JSON.stringify({generatedAt:payload.generatedAt,jobCount:jobs.length,sources:sourceStatus},null,2));return}
  let previous=null;
  try{previous=JSON.parse(await fs.readFile(OUTPUT,"utf8"))}catch{}
  const stable=list=>JSON.stringify((list||[]).map(({lastSeenAt,...job})=>job));
  if(previous&&stable(previous.jobs)===stable(payload.jobs)){
    console.log("No job content changes; existing public feed retained.");
    if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,"job_count="+jobs.length+"\n");
    return;
  }
  await fs.writeFile(OUTPUT,JSON.stringify(payload,null,2)+"\n");
  console.log("Saved "+jobs.length+" jobs to data/remote-jobs.json");
  if(process.env.GITHUB_OUTPUT)await fs.appendFile(process.env.GITHUB_OUTPUT,"job_count="+jobs.length+"\n");
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)main().catch(error=>{console.error(error);process.exitCode=1});
