export const RELIEFWEB_RSS = 'https://reliefweb.int/jobs/rss.xml?advanced-search=%28C240%29';
export const JOB_USER_AGENT = 'PathwayForum Jobs/1.0 (+https://torrid2020.github.io/Pathwayforum.com/)';
const decode = value => String(value || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):+n)).replace(/&amp;/g,'&');
const plain = value => decode(value).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
function field(xml, tag) {return xml.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+tag+'>','i'))?.[1] || '';}

// Only metadata leaves this parser. RSS descriptions are used to read labelled metadata, never stored.
export function parseReliefWebRss(xml) {
  if (!/<rss\b/i.test(xml) || !/<channel\b/i.test(xml) || !/<\/rss>/i.test(xml)) throw Error('ReliefWeb RSS markup not recognised');
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];
  if ((xml.match(/<item\b/gi)||[]).length !== items.length) throw Error('ReliefWeb RSS contains incomplete items');
  return items.map(([,item]) => {
    const metadata = plain(field(item,'description'));
    const label = name => metadata.match(new RegExp('(?:^|\\s)(?:'+name+')\\s*:\\s*(.*?)(?=\\s+(?:Countries?|Organisations?|Organizations?|Sources?|Locations?|Closing date|Posted|Job type|Career category|Years of experience|Themes?)\\s*:|$)','i'))?.[1]?.trim();
    const title = plain(field(item,'title'));
    const link = plain(field(item,'link') || field(item,'guid'));
    const organisation = label('Organisations?|Organizations?|Sources?') || plain(field(item,'dc:creator') || field(item,'author'));
    const location = label('Countries?|Locations?') || 'Uganda';
    if (!title || !organisation || !/^https:\/\//i.test(link)) throw Error('ReliefWeb RSS item missing title, organisation or HTTPS link');
    const published = Date.parse(plain(field(item,'pubDate') || field(item,'dc:date')));
    return {title,organisation,location,publishedAt:Number.isFinite(published)?new Date(published).toISOString():null,link};
  });
}

export async function fetchReliefWeb({appname,fetcher=fetch,now=new Date()}={}) {
  const api = Boolean(appname);
  const url = api ? 'https://api.reliefweb.int/v2/jobs?appname='+encodeURIComponent(appname) : RELIEFWEB_RSS;
  const options = {headers:{'User-Agent':JOB_USER_AGENT,Accept:api?'application/json':'application/rss+xml, application/xml'},signal:AbortSignal.timeout(25000)};
  if (api) {
    options.method='POST';options.headers['content-type']='application/json';
    options.body=JSON.stringify({limit:100,fields:{include:['title','source.name','date.closing','date.created','experience','city.name','url']},filter:{operator:'AND',conditions:[{field:'country.iso3',value:'UGA'},{field:'date.closing',value:{from:now.toISOString()}}]}});
  }
  // Exactly one request per run, with no RSS retry or per-item page fetches.
  const response = await fetcher(url, options);
  if (!response.ok) throw Error('ReliefWeb '+(api?'API':'RSS')+' HTTP '+response.status);
  if (!api) return {mode:'rss',records:parseReliefWebRss(await response.text()).map(j=>({id:j.link,title:j.title,employer:j.organisation,location:j.location,publishedAt:j.publishedAt,sourceUrl:j.link,applicationUrl:j.link,deadline:null}))};
  const data=await response.json();if(!Array.isArray(data.data))throw Error('ReliefWeb API response missing job list');
  return {mode:'api',records:data.data.map(({id,fields:f})=>({id,title:f.title,employer:f.source?.map(s=>s.name).join(', ')||'Humanitarian employer',location:(f.city||[]).map(c=>c.name).concat('Uganda').join(', '),publishedAt:f.date?.created||null,deadline:f.date?.closing||null,experience:(f.experience||[]).map(e=>e.name).join(', '),sourceUrl:f.url,applicationUrl:f.url}))};
}

const canonical = value => {try{const u=new URL(value);u.search='';u.hash='';return u.href.replace(/\/$/,'').toLowerCase();}catch{return '';}};
const words = value => String(value||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w&&!['the','a','an','and','of','for'].includes(w));
export function duplicateJobs(a,b) {
  const urls = [a.sourceUrl,a.applicationUrl].map(canonical).filter(Boolean);
  if ([b.sourceUrl,b.applicationUrl].some(u=>urls.includes(canonical(u)))) return true;
  if (words(a.employer).join('') !== words(b.employer).join('')) return false;
  const left=new Set(words(a.title)),right=new Set(words(b.title));
  if (!left.size || !right.size) return false;
  // Preserve distinct seniority/requisition numbers even if most of the title overlaps.
  const qualifiers=s=>[...s].filter(w=>/^(?:senior|junior|intern|internship|trainee|ii|iii|\d+)$/.test(w)).sort().join('|');
  if (qualifiers(left)!==qualifiers(right)) return false;
  const intersection=[...left].filter(w=>right.has(w)).length;
  return intersection/(left.size+right.size-intersection)>=0.8;
}

export const reliefWebDuplicate = (a,b) => (a.sourceId==='reliefweb'||b.sourceId==='reliefweb') && duplicateJobs(a,b);
