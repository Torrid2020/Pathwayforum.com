import * as he from 'he';
import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {humanClosing} from './uganda-auto-adapters.mjs';
import {isUgandaLocation} from '../assets/uganda-locations.mjs';

const cleanHtml=value=>String(value||'').replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi,' ');
const plain=value=>he.decode(cleanHtml(value).replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
const list=(records,count=records.length,note='')=>Object.assign(records,{recordsRead:count,note});
function href(value,base){
 try{const url=new URL(he.decode(value),base);if(url.protocol==='http:'&&url.hostname.replace(/^www\./,'')===new URL(base).hostname.replace(/^www\./,''))url.protocol='https:';return url.protocol==='https:'?url.href:null}catch{return null}
}
function anchors(html,base){return [...cleanHtml(html).matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].flatMap(m=>{const url=href(m[1],base);return url?[{url,label:plain(m[2]),index:m.index}]:[]})}
const isoDay=value=>/^20\d{2}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(Date.parse(value))?value+'T20:59:59.000Z':null;
function closing(text){for(const match of plain(text).matchAll(/(?:closing(?: date)?|deadline(?: for submission)?|applications? (?:close|by)|expires)\b\s*:?\s*([\s\S]{0,130})/gi)){const fragment=match[1],date=isoDay(fragment.match(/^20\d{2}-\d{2}-\d{2}/)?.[0])||humanClosing(fragment.replace(/,/g,' '));if(date)return date}return null}
const isOpen=(deadline,now)=>!deadline||Date.parse(deadline)>now;

export function parsePinpoint(data){
 if(!Array.isArray(data.data))throw Error('Pinpoint response missing data postings array');
 const records=data.data.flatMap(j=>{
  const locations=[j.location,...(j.locations||[])].filter(Boolean).map(l=>[l.city,l.province,l.name,l.country?.name||l.country].filter(Boolean).join(', '));
  const location=locations.filter(isUgandaLocation).join('; ');
  if(!location)return[];
  const url=href(j.url,'https://sunking.pinpointhq.com/');if(!url)return[];
  const sections=[j.description,...[['key_responsibilities','key_responsibilities_header'],['skills_knowledge_expertise','skills_knowledge_expertise_header'],['benefits','benefits_header']].flatMap(([body,title])=>j[body]?[j[title]?'<h3>'+he.escape(j[title])+'</h3>':'',j[body]]:[])];
  return [{id:j.id,title:j.title,location,description:sections.filter(Boolean).join('\n'),publishedAt:j.published_at||null,deadline:j.deadline_at||null,employmentType:/part.time/i.test(j.employment_type_text||'')?'Part-time':/full.time/i.test(j.employment_type_text||'')?'Full-time':j.employment_type_text,workplace:j.workplace_type==='remote'?'Remote':'On-site',sourceUrl:url,applicationUrl:url}];
 });return list(records,data.data.length);
}

export function parseRssAdverts(xml,source,{now=Date.now()}={}){
 if(/<!DOCTYPE|<!ENTITY/i.test(xml)||XMLValidator.validate(xml)!==true)throw Error('RSS advert XML invalid or contains a forbidden document type');
 const parsed=new XMLParser({ignoreAttributes:false,processEntities:true,trimValues:true}).parse(xml);
 if(!parsed.rss?.channel)throw Error('RSS advert channel not recognised');
 const items=[parsed.rss.channel.item||[]].flat();
 const records=items.flatMap(item=>{
  const title=plain(item.title),url=href(item.link,source.url),date=Date.parse(item.pubDate),body=plain(item['content:encoded']||item.description);
  if(!/advert|vacanc/i.test(title)||/fraud|fake|shortlist|interview|appointed|appointment list|results|procurement|tender/i.test(title))return[];
  if(!url||new URL(url).hostname.replace(/^www\./,'')!==new URL(source.url).hostname.replace(/^www\./,''))return[];
  // An undated legacy notice is not evidence of a current recruitment round.
  if(!Number.isFinite(date)||date<now-30*86400000||date>now+86400000)return[];
  const deadline=closing(body);if(!isOpen(deadline,now))return[];
  return [{id:url,title,location:'Uganda',publishedAt:new Date(date).toISOString(),deadline,description:body.slice(0,1200),fullDescription:null,sourceUrl:url,applicationUrl:url}];
 });return list([...new Map(records.map(r=>[r.id,r])).values()],items.length,'Only recent recruitment adverts are eligible; warnings, interviews, shortlists and expired notices are excluded.');
}

export function parsePdfAdverts(html,source,{now=Date.now()}={}){
 html=cleanHtml(html);if(!/Recruitment|Job|Advert/i.test(plain(html)))throw Error('PDF recruitment listing not recognised');
 const records=[],all=[];
 for(const row of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)){
  for(const link of anchors(row[1],source.url).filter(l=>/\.pdf(?:[?#]|$)/i.test(l.url)&&/advert/i.test(l.label))){
   all.push(link);const deadline=closing(row[1]);if(!deadline||!isOpen(deadline,now))continue;
   const label=plain(link.label).replace(/_/g,' ').replace(/\s+/g,' '),match=label.match(/\b(EXTERNAL|INTERNAL)\s+ADVERT\s+NO\.?\s*(\d+)\s+OF\s+([A-Z]+)\s+(20\d{2})/i);
   if(!match)continue;
   const key=[source.id,...match.slice(1).map(s=>s.toLowerCase())].join(':'),title='HSC '+match[1].toLowerCase().replace(/^./,c=>c.toUpperCase())+' Advert No. '+match[2]+' of '+match[3].toLowerCase().replace(/^./,c=>c.toUpperCase())+' '+match[4]+' – multiple posts';
   const job={id:key,title,location:'Uganda',deadline,description:'Official Health Service Commission recruitment advert covering multiple posts. '+(match[1].toUpperCase()==='INTERNAL'?'Internal recruitment: check eligibility carefully. ':'')+'Read the official PDF for individual roles, qualifications and application instructions.',fullDescription:null,sourceUrl:link.url,applicationUrl:link.url};
   const existing=records.findIndex(r=>r.id===key);if(existing<0)records.push(job);else if(/complete/i.test(label))records[existing]=job;
  }
 }return list(records,new Set(all.map(l=>l.url)).size,'One entry per advert; summary/complete copies are grouped. Only adverts with an unexpired date on the official list are published.');
}

export function parseNssfList(html,source){
 if(!/Featured Jobs/i.test(html))throw Error('NSSF Featured Jobs section not recognised');
 const links=[...new Map(anchors(html,source.url).filter(l=>new URL(l.url).origin===new URL(source.url).origin&&/\/specials\/featured-jobs\//.test(l.url)&&l.label.length>5).map(l=>[l.url,l])).values()];
 // The listing does not expose application deadlines. Under the single-request
 // limit we report the listing honestly instead of reviving an undated advert.
 return Object.assign(list([],links.length),{manualReview:links.length>0,note:links.length?'Careers URL is unchanged and reachable. Featured titles are readable, but deadlines require a separate advert request; manual review under the one-request limit.':'Official Featured Jobs section reached; no current linked adverts.'});
}

export function parseKakira(html,source,{now=Date.now()}={}){
 html=cleanHtml(html);if(!/Jobs Listing/i.test(plain(html)))throw Error('Kakira job listing not recognised');
 const headings=[...html.matchAll(/<h5\b[^>]*class=["'][^"']*card-title[^"']*["'][^>]*>([\s\S]*?)<\/h5>/gi)],records=[];let count=0;
 for(let i=0;i<headings.length;i++){
  const block=html.slice(headings[i].index,headings[i+1]?.index||html.length),body=plain(block);
  if(!/Location\s*:\s*Uganda/i.test(body))continue;
  const link=anchors(block,source.url).find(l=>/\.pdf(?:[?#]|$)/i.test(l.url)&&/job description/i.test(l.label));if(!link)continue;count++;
  const deadline=closing(body);if(!deadline)throw Error('Kakira advert closing date missing; manual review required');if(!isOpen(deadline,now))continue;
  records.push({id:link.url,title:plain(headings[i][1]),location:'Uganda',deadline,description:body.slice(0,1200),fullDescription:null,sourceUrl:link.url,applicationUrl:source.url});
 }if(!count&&!/no (?:current |open )?(?:jobs|vacancies)/i.test(plain(html)))throw Error('Kakira vacancy cards not recognised');return list(records,count);
}

export function parseEadb(html,source,{now=Date.now()}={}){
 html=cleanHtml(html);if(!/job-list-table/i.test(html))throw Error('EADB vacancy table not recognised');
 const rows=[...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)],records=[];let count=0;
 for(const [,row]of rows){const field=name=>row.match(new RegExp('<td\\b[^>]*class=["\'][^"\']*'+name+'[^"\']*["\'][^>]*>([\\s\\S]*?)</td>','i'))?.[1];const title=plain(field('job-role')),location=plain(field('location'));if(!title)continue;count++;
  if(!isUgandaLocation(location))continue;const date=humanClosing(plain(field('last-date')).replace(/,/g,' ')),link=anchors(row,source.url).find(l=>/\.pdf(?:[?#]|$)/i.test(l.url));if(!date||!link)throw Error('EADB Uganda advert lacks closing date or official PDF');if(!isOpen(date,now))continue;
  records.push({id:link.url,title,location,deadline:date,description:'Official East African Development Bank vacancy. Read the attached official advert for requirements and how to apply.',fullDescription:null,sourceUrl:link.url,applicationUrl:link.url});
 }return list(records,count);
}

export function parseKcca(html,source,{now=Date.now()}={}){
 const body=plain(html),title=body.match(/\bPOST\s*:\s*(.*?)(?=\s+REF\s*:)/i)?.[1],location=body.match(/DUTY STATION\s*:\s*(.*?)(?=\s+TERM\s*:)/i)?.[1];
 if(!title||!location){if(/no (?:current |open )?(?:vacancies|positions|jobs)/i.test(body))return list([]);throw Error('KCCA advert title/location not recognised')}
 const deadline=closing(body);if(!deadline)throw Error('KCCA advert closing date missing; manual review required');
 return list(isOpen(deadline,now)&&isUgandaLocation(location)?[{id:title,title,location,deadline,description:body.slice(body.indexOf('POST :'),body.indexOf('Vision To')),fullDescription:null,sourceUrl:source.url,applicationUrl:source.url}]:[],1,'Only adverts with a readable, future closing date are published; old adverts are excluded.');
}

export function parseOfficialList(html,source){
 const body=plain(html);
 if(/no open positions|no (?:open |current )?(?:job )?(?:opportunities|positions|vacancies)|no jobs found/i.test(body))return list([],0,'Official recruitment page explicitly reports no open positions.');
 throw Error('Vacancy titles/locations/deadlines are not reliably available in one response; review the official careers page manually.');
}
export function parseDatedList(html,source){
 const links=anchors(html,source.url).filter(l=>/job.advert|position for|position of/i.test(l.label));
 if(!links.length)throw Error('Official dated vacancy list not recognised');
 return Object.assign(list([],new Set(links.map(l=>l.url)).size),{manualReview:true,note:'Vacancy titles are readable, but closing dates are inside separate adverts. Manual review is required under the one-request limit; no undated archived jobs are imported.'});
}
export async function fetchOfficial(source,io){
 const url=source.method==='pinpoint'?source.adapter:source.method==='official-list'&&source.adapter?source.adapter:source.url;
 if(source.method==='pinpoint')return parsePinpoint(await io.json(url));
 const response=await io.request(url),html=await response.text();
 const parsers={'rss-advert':parseRssAdverts,'pdf-advert':parsePdfAdverts,'nssf-list':parseNssfList,kakira:parseKakira,eadb:parseEadb,kcca:parseKcca,'official-list':parseOfficialList,'dated-list':parseDatedList};
 if(!parsers[source.method])throw Error('Unsupported official source adapter');return parsers[source.method](html,source);
}
