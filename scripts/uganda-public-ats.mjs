export function parseAshby(data) {
 if(!Array.isArray(data.jobs))throw Error('Ashby response missing jobs');
 return data.jobs.filter(j=>j.isListed!==false).map(j=>({id:j.id,title:j.title,description:j.descriptionHtml||j.descriptionPlain,
  location:[j.location,...(j.secondaryLocations||[]).map(l=>l.location)].filter(Boolean).join('; '),
  publishedAt:j.publishedAt,employmentType:j.employmentType,workplace:j.isRemote?'Remote':j.workplaceType,
  sourceUrl:j.jobUrl,applicationUrl:j.applyUrl||j.jobUrl}));
}
export function parseWorkable(data) {
 if(!Array.isArray(data.jobs))throw Error('Workable response missing jobs');
 return data.jobs.map(j=>({id:j.shortcode,title:j.title,description:j.description||'',
  location:(j.locations?.length?j.locations.map(l=>[l.city,l.region,l.country].filter(Boolean).join(', ')):[[j.city,j.state,j.country].filter(Boolean).join(', ')]).join('; '),
  publishedAt:j.published_on,employmentType:j.employment_type,experience:j.experience||'',workplace:j.telecommuting?'Remote':'On-site',sourceUrl:j.url||j.shortlink,applicationUrl:j.application_url||j.url}));
}
export function parseLever(data) {
 if(!Array.isArray(data))throw Error('Lever response missing postings');
 return data.map(j=>({id:j.id,title:j.text,description:j.descriptionPlain||j.description,
  location:(j.categories?.allLocations||[j.categories?.location]).filter(Boolean).join('; '),
  publishedAt:Number.isFinite(j.createdAt)?new Date(j.createdAt).toISOString():null,
  employmentType:j.categories?.commitment,workplace:j.workplaceType,sourceUrl:j.hostedUrl,applicationUrl:j.applyUrl||j.hostedUrl}));
}
export async function fetchPublicAts(source,json) {
 const site=encodeURIComponent(source.adapter);
 if(source.method==='ashby')return parseAshby(await json('https://api.ashbyhq.com/posting-api/job-board/'+site));
 if(source.method==='workable')return parseWorkable(await json('https://apply.workable.com/api/v1/widget/accounts/'+site));
 if(source.method==='lever')return parseLever(await json('https://api.lever.co/v0/postings/'+site+'?mode=json'));
 throw Error('Unknown public ATS adapter');
}
