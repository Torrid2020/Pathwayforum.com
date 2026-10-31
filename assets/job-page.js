import {createDescriptionView} from './job-description-view.mjs';
import {createApplySuggestions} from './job-suggestions.mjs';
import {normalizeDeadline} from './uganda-data.mjs';
import {checkedDate} from './job-trust.mjs';
const data=JSON.parse(document.querySelector('#job-page-data').textContent),job=data.job,root=new URL('../../../',location.href);
createDescriptionView(document.querySelector('#page-description'),{baseUrl:root}).show(job);
const suggestions=createApplySuggestions(document.querySelector('#page-apply-suggestions'),()=>job,()=>data.similar,id=>{const match=data.similar.find(j=>j.id===id);if(match)location.assign(new URL(match.pagePath,root))});
document.querySelectorAll('[data-apply]').forEach(a=>a.addEventListener('click',()=>suggestions.show(document.querySelector('#page-apply-top'))));
const first=document.querySelector('#page-apply-top'),sticky=document.querySelector('#sticky-apply');let closed=Boolean(job.closedAt);
function countdown(){const value=normalizeDeadline(job.deadline||job.expiresAt),end=value?Date.parse(value):NaN;if(Number.isFinite(end)&&end<=Date.now())closed=true;if(closed){document.querySelector('#closed-banner').hidden=false;document.querySelectorAll('[data-apply]').forEach(a=>a.hidden=true);if(sticky)sticky.hidden=true;document.querySelector('#similar-jobs h2').textContent='Similar open jobs'}const label=document.querySelector('#page-deadline');if(!value){label.textContent='Check the official deadline';return}const local=v=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Kampala',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(v)),days=Math.round((Date.parse(local(end))-Date.parse(local(Date.now())))/86400000);label.textContent=(end<=Date.now()?'Closed':days===0?'Closes today':days===1?'Closes tomorrow':'Closes in '+days+' days')+' ('+checkedDate(value)+')'}
countdown();setInterval(countdown,60000);
if(first&&sticky&&'IntersectionObserver'in window)new IntersectionObserver(entries=>{const entry=entries[0];sticky.hidden=closed||entry.isIntersecting||entry.boundingClientRect.bottom>=0},{threshold:0}).observe(first);
document.querySelector('#copy-job-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('link[rel=canonical]').href);document.querySelector('#copy-status').textContent='Link copied.'}catch{document.querySelector('#copy-status').textContent='Copy this page address from your browser.'}});
