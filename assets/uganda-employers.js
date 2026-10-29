(() => {
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let sources=[];
 const render=()=>{
  const q=document.querySelector('#employer-query').value.toLowerCase(),sector=document.querySelector('#employer-sector').value;
  const list=sources.filter(s=>(!sector||s.sector===sector)&&(!q||(s.employer+' '+s.sector).toLowerCase().includes(q)));
  document.querySelector('#employer-count').textContent=list.length+' '+(list.length===1?'employer':'employers');
  document.querySelector('#employer-grid').innerHTML=list.map(s=>`<article class="card"><p class="eyebrow">${esc(s.sector)}</p><h2>${esc(s.employer)}</h2><p>${esc(s.status==='connected'?'Recruitment feed connected':s.status==='manual-review'?'Official page: manual vacancy review':'Connection needs attention')}</p><p class="fine">${esc(s.message)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener">Visit official career source ↗</a></article>`).join('')||'<p>No matching employers. Try another search.</p>';
 };
 fetch('data/uganda-job-sources.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{sources=d.sources||[];render()}).catch(()=>{document.querySelector('#employer-grid').innerHTML='<p>The directory is temporarily unavailable. Please try again shortly.</p>'});
 document.querySelector('#employer-query').addEventListener('input',render);document.querySelector('#employer-sector').addEventListener('change',render);
})();
