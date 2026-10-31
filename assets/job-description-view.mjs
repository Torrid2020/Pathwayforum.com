import {checkedDate} from './job-trust.mjs';

export function createDescriptionView(container) {
 let pending=null,sequence=0;
 const originalLink=(job,label)=>{const a=document.createElement('a');a.href=job.sourceUrl;a.target='_blank';a.rel='nofollow noopener';a.textContent=label;return a;};
 return {
  close(){sequence++;pending?.abort();},
  async show(job){
   const current=++sequence;pending?.abort();pending=new AbortController();
   container.replaceChildren();
   const credit=document.createElement('p');credit.className='description-credit';
   if(['Himalayas','Jobicy'].includes(job.source)||job.sourceType?.startsWith('humanitarian-'))credit.append(originalLink(job,'via '+job.source));
   else credit.textContent='From '+(job.employer||job.company)+"'s official careers page";
   credit.append(' · Last checked '+checkedDate(job.lastCheckedAt||job.lastSeenAt));
   const content=document.createElement('div');content.className='job-description-content';container.append(credit,content);
   const fallback=message=>{content.replaceChildren();if(message){const p=document.createElement('p');p.textContent=message;content.append(p)}content.append(originalLink(job,'Read the full advert on the official site ↗'));};
   if(!/^data\/jobs\/(?:uganda|remote)\/[a-f0-9]{32}\.json$/.test(job.descriptionPath||'')){fallback();return;}
   content.textContent='Loading full job description…';
   try{
    const response=await fetch(job.descriptionPath,{signal:pending.signal,cache:'no-store'});
    if(!response.ok)throw Error('Description unavailable');
    const data=await response.json();
    if(data.id!==job.id||typeof data.html!=='string'||!data.html.trim())throw Error('Invalid description');
    if(current!==sequence)return;
    // Only build-time allow-listed HTML from our own per-job JSON files reaches this element.
    content.innerHTML=data.html;
   }catch(error){if(current===sequence&&error.name!=='AbortError')fallback('The full description could not be loaded.');}
  }
 };
}
