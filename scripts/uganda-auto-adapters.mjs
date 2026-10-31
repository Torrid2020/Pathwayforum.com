import {isUgandaLocation} from '../assets/uganda-locations.mjs';
// Adapters for official public recruitment systems. Unexpected markup is a failure, not an empty feed.
const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
export function humanClosing(text){const m=String(text).match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(20\d{2})\b/i);if(!m)return null;const month=months.findIndex(x=>x.slice(0,3)===m[2].toLowerCase().slice(0,3)),day=+m[1];const date=new Date(Date.UTC(+m[3],month,day,20,59,59));if(date.getUTCMonth()!==month||date.getUTCDate()!==day)return null;return date.toISOString()}
export function linksFrom(html,base){return [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap(m=>{try{const url=new URL(m[1].replace(/&amp;/g,'&'),base);return url.protocol==='https:'?[{url:url.href,label:m[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}]:[]}catch{return[]}})}
export function parseDrcList(html,base){if(!/id=["']jobList["']|class=["'][^"']*jobList__item/i.test(html))throw Error('DRC vacancy list markup not recognised');return [...html.matchAll(/<article\b([^>]*class=["'][^"']*jobList__item[^"']*["'][^>]*)>([\s\S]*?)<\/article>/gi)].map(([,attrs,content])=>{const get=k=>attrs.match(new RegExp('data-'+k+'=["\']([^"\']*)["\']','i'))?.[1]||'';const link=linksFrom(content,base)[0];return {id:link?.url,title:get('title'),location:get('country'),publishedAt:humanClosing(content.match(/jobList__item__published[^>]*>([^<]+)/)?.[1]),deadline:humanClosing(content.match(/jobList__item__deadline[^>]*>([^<]+)/)?.[1]),sourceUrl:link?.url,applicationUrl:link?.url}})}
export function parseBracBank(html,url,strip){const headings=[...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)];const jobs=[];for(let i=0;i<headings.length;i++){const h=headings[i],body=html.slice(h.index,(headings[i+1]?.index||html.length)),clean=strip(body);if(!/Job Tit[tl]le\s*:|Job Title\s*:|PURPOSE OF THE ROLE/i.test(clean))continue;const title=strip(h[1]),deadline=humanClosing(clean.match(/NOT later than([\s\S]{0,100})/i)?.[1]);if(!deadline)throw Error('BRAC vacancy missing a readable closing date');jobs.push({id:title.toLowerCase().replace(/\W+/g,'-'),title,description:clean,location:'Uganda',deadline,sourceUrl:url,applicationUrl:url})}if(!jobs.length&&!/no (?:current )?(?:jobs|vacancies|openings)/i.test(strip(html)))throw Error('BRAC bank advert sections not recognised');return jobs}
export function parseMakerereList(html,url,strip){if(/<h3[^>]*>\s*No Jobs Found\s*<\/h3>/i.test(html))return[];const records=[...html.matchAll(/showJobDetails\(\s*['"]?(\d+)['"]?\s*,\s*(['"])([\s\S]*?)\2\s*,\s*(['"])([\s\S]*?)\4\s*\)/g)].map(m=>({id:m[1],title:strip(m[3]),location:'Kampala, Uganda',sourceUrl:url+'?vacancy='+m[1],applicationUrl:new URL('/recruitment/eliminate/'+m[1],url).href}));if(!records.length)throw Error('Makerere vacancy list markup not recognised');return records}
export function parseUcaaList(html, base, strip) {
 const rows=[...html.matchAll(/<h4\b[^>]*class=["'][^"']*pt-cv-title[^"']*["'][^>]*>([\s\S]*?)<\/h4>/gi)];
 const links=rows.flatMap(row=>linksFrom(row[1],base)).filter(link=>new URL(link.url).origin===new URL(base).origin&&strip(link.label).length>8);
 if(!links.length)throw Error('UCAA vacancy title/link markup not recognised; manual review required');
 return [...new Map(links.map(link=>[link.url,{...link,label:strip(link.label)}])).values()];
}
export function parseUcaaDetail(html, link, strip) {
 const content=html.match(/<div\b[^>]*class=["'][^"']*swm-post-content-block[^"']*["'][^>]*>([\s\S]*?)(?=UCAA Head Office|<footer|$)/i)?.[1];
 if(!content)throw Error('UCAA advert content not recognised; manual review required');
 const description=strip(content);
 const closingText=description.match(/(?:not later than|before close of business|closing date)\s*[\s\S]{0,100}/i)?.[0];
 const deadline=humanClosing(String(closingText||'').replace(/(\d)\s+(st|nd|rd|th)\b/gi,'$1$2').replace(/,/g,' '));
 if(!deadline)throw Error('UCAA advert has no readable application closing date; manual review required');
 const application=linksFrom(content,link.url).find(l=>new URL(l.url).hostname==='recruitment.caa.co.ug');
 return {id:link.url,title:link.label,description,location:'Uganda',deadline,sourceUrl:link.url,applicationUrl:application?.url||link.url};
}
export async function fetchAutomatic(s,io){const {request,json,strip,structuredJobs,fromSchema}=io;
 if(s.method==='oracle'){
  const [host,site]=s.adapter.split('/'),base='https://'+host+'/hcmRestApi/resources/latest',records=[];
  for(let page=0;page<3;page++){
   const d=await json(base+'/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList&finder=findReqs;siteNumber='+site+',keyword=Uganda,limit=25,offset='+(page*25));
   const result=d.items?.[0];if(!result||!Array.isArray(result.requisitionList)||!Number.isFinite(result.TotalJobsCount))throw Error('Oracle recruitment response not recognised');
   for(const j of result.requisitionList){if(j.PrimaryLocationCountry!=='UG')continue;const v=await json(base+'/recruitingCEJobRequisitionDetails/'+encodeURIComponent(j.Id)+'?onlyData=true');const url='https://'+host+'/hcmUI/CandidateExperience/en/sites/'+site+'/job/'+j.Id;records.push({id:j.Id,title:v.Title,description:[v.ExternalDescriptionStr,v.ExternalQualificationsStr,v.ExternalResponsibilitiesStr].filter(Boolean).join(' '),location:v.PrimaryLocationCountry==='UG'?v.PrimaryLocation+', Uganda':v.PrimaryLocation,publishedAt:v.ExternalPostedStartDate,deadline:v.ExternalPostedEndDate,employmentType:v.JobSchedule,workplace:v.WorkplaceType,sourceUrl:url,applicationUrl:url})}
   if((page+1)*25>=result.TotalJobsCount)break;
  }return records;
 }
 const r=await request(s.url),html=await r.text();
 if(s.method==='ucaa'){
  const records=[];
  for(const link of parseUcaaList(html,r.url,strip).slice(0,30))records.push(parseUcaaDetail(await(await request(link.url)).text(),link,strip));
  return records;
 }
 if(s.method==='brac-bank')return parseBracBank(html,r.url,strip);
 if(s.method==='makerere'){
  const records=parseMakerereList(html,r.url,strip);
  for(const j of records){const response=await request(new URL('/recruitment/job-details/'+j.id,r.url).href);let content=await response.text();try{content=JSON.parse(content).html||content}catch{}j.description=strip(content);j.deadline=humanClosing(j.description.match(/(?:deadline|closing date|applications? close)[\s\S]{0,100}/i)?.[0]);if(!j.deadline)throw Error('Makerere advert closing date missing');}
  return records;
 }
 if(s.method==='finca'){
  if(/<div[^>]*>\s*No jobs found\s*<\/div>/i.test(html))return[];
  const records=structuredJobs(html).map(j=>fromSchema(j,r.url));
  const links=linksFrom(html,r.url).filter(l=>new URL(l.url).origin===new URL(r.url).origin&&/\/job(?:s)?\//.test(new URL(l.url).pathname));
  for(const l of links.slice(0,20)){const t=await(await request(l.url)).text();const js=structuredJobs(t);if(!js.length)throw Error('FINCA advert requires parser review');records.push(...js.map(j=>fromSchema(j,l.url)))}
  if(!records.length)throw Error('FINCA vacancy list markup not recognised');return records;
 }
 if(s.method==='drc'){
  const records=parseDrcList(html,r.url).filter(j=>isUgandaLocation(j.location));
  for(const j of records){const detail=await(await request(j.sourceUrl)).text();j.description=strip(detail.match(/<h1[^>]*>[\s\S]*?(?=<h2[^>]*>\s*Info|<footer)/i)?.[0]||detail);j.location=strip(detail.match(/Workplace\s*<[^>]*>([\s\S]*?)<\//i)?.[1]||j.location)+', Uganda'}
  return records;
 }
 const selectors={jobvite:/\/prosperglobal\/job\//,successfactors:/\/job\//,icims:/\/jobs\/\d+\/.+\/job/,pageup:/\/en-us\/job\/\d+\//,trakstar:/\/jobs\/fk[\w]+\//};
 const pattern=selectors[s.method];if(!pattern)throw Error('Unsupported adapter '+s.method);
 const all=[...new Map(linksFrom(html,r.url).filter(l=>pattern.test(new URL(l.url).pathname)).map(l=>[l.url,l])).values()];
 if(!all.length){if(/no (?:matching |current |open )?(?:jobs|vacancies|positions|results)|0 results|there are currently no/i.test(strip(html)))return[];throw Error('Recruitment listing markup not recognised')}
 const selected=s.method==='jobvite'?all.filter(l=>/uganda|kampala|\d+ Locations/i.test(l.label)):all;
 const records=[];for(const l of selected.slice(0,30)){
  const detail=await(await request(l.url)).text(),js=structuredJobs(detail);
  if(js.length){records.push(...js.map(j=>fromSchema(j,l.url)));continue}
  if(s.method==='successfactors'){
   const location=detail.match(/<meta\b[^>]*itemprop=["']streetAddress["'][^>]*content=["']([^"']+)["']/i)?.[1];
   const rawEnd=detail.match(/<meta\b[^>]*itemprop=["']validThrough["'][^>]*content=["']([^"']+)["']/i)?.[1],end=rawEnd?Date.parse(rawEnd):NaN;
   if(!location||!Number.isFinite(end))throw Error('SuccessFactors location or closing metadata missing');
   const fullDescription=detail.match(/<span[^>]*itemprop=["']description["'][\s\S]*?(?=<div class="job)|<span[^>]*itemprop=["']description["'][\s\S]*?(?=<footer)/i)?.[0]||null;
   records.push({id:l.url,title:l.label,description:strip(detail.match(/<span[^>]*itemprop=["']description["'][\s\S]*?(?=<div class="job)|<span[^>]*itemprop=["']description["'][\s\S]*?(?=<footer)/i)?.[0]||detail),fullDescription,location,deadline:new Date(end).toISOString(),sourceUrl:l.url,applicationUrl:l.url});continue;
  }
  // PageUp pages expose location and deadline labels even when JobPosting JSON is absent.
  if(s.method==='pageup'){
   const body=strip(detail),location=strip(detail.match(/<span\b[^>]*class=["']location["'][^>]*>([\s\S]*?)<\/span>/i)?.[1]||'');
   const rawEnd=detail.match(/<span\b[^>]*class=["']close-date["'][^>]*>\s*<time\b[^>]*datetime=["']([^"']+)["']/i)?.[1];
   const deadline=Number.isFinite(Date.parse(rawEnd))?new Date(rawEnd).toISOString():humanClosing(body.match(/(?:deadline|applications? close|closing date)\s*:[\s\S]{0,100}/i)?.[0]);
   if(!location||!deadline)throw Error('PageUp job details changed');records.push({id:l.url,title:l.label,description:body,fullDescription:null,location,deadline,sourceUrl:l.url,applicationUrl:l.url,workplace:/\bremote\b/i.test(l.label)?'Remote':undefined});continue;
  }
  throw Error(s.method+' job details did not expose a readable vacancy');
 }return records;
}
