export function similarJobs(active,jobs,now=Date.now(),limit=3) {
 const same=(a,b)=>Boolean(a&&b&&a===b);
 const rank=job=>[same(active.level,job.level),same(active.category,job.category),same(active.district,job.district)];
 const candidates=jobs.filter(job=>job.id!==active.id&&(!(job.deadline||job.expiresAt)||!Number.isFinite(Date.parse(job.deadline||job.expiresAt))||Date.parse(job.deadline||job.expiresAt)>now))
;
 const protect=["Internship / trainee","Entry level","Mid level"].includes(active.level);
 const nonSenior=candidates.filter(job=>job.level!=="Senior / management");
 return (protect&&nonSenior.length>=3?nonSenior:candidates)
  .map((job,index)=>({job,index,rank:rank(job)})).sort((a,b)=>Number(b.rank[0])-Number(a.rank[0])||Number(b.rank[1])-Number(a.rank[1])||Number(b.rank[2])-Number(a.rank[2])||a.index-b.index).slice(0,limit).map(item=>item.job);
}

export function createApplySuggestions(panel,getActive,getJobs,openJob) {
 return {
  reset(){panel.hidden=true;panel.replaceChildren();},
  show(anchor){
   if(anchor)anchor.after(panel);
   const active=getActive();if(!active)return;
   panel.replaceChildren();panel.hidden=false;
   const heading=document.createElement('h3');heading.textContent='Good luck! Similar jobs you may like';panel.append(heading);
   const list=document.createElement('div');list.className='similar-job-links';
   for(const job of similarJobs(active,getJobs())){
    const button=document.createElement('button');button.type='button';button.textContent=job.title+' · '+(job.employer||job.company);button.addEventListener('click',()=>openJob(job.id));list.append(button);
   }
   if(!list.childElementCount)list.textContent='Check the job list for more opportunities.';
   panel.append(list);
  }
 };
}
