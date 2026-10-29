(() => {
  const form=document.querySelector('#employer-form'),status=document.querySelector('#submission-status'),summary=document.querySelector('#submission-summary');
  const today=new Date().toLocaleDateString('en-CA',{timeZone:'Africa/Kampala'});
  form.elements.deadline.min=today;
  form.addEventListener('input',()=>{document.querySelector('#summary-panel').hidden=true;status.textContent='';});
  form.addEventListener('submit',event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form));
    if(/\b(?:senior|manager|director|head\s+of|chief|lead|principal)\b/i.test(data.title)){status.textContent='This board is for student and graduate roles. Please submit an internship, trainee, assistant or other early-career vacancy.';return;}
    for(const field of ['website','sourceUrl','applicationUrl']){let url;try{url=new URL(data[field])}catch{}if(!url||url.protocol!=='https:'||url.username||url.password){status.textContent='Use a public HTTPS address for the employer website, advert and application link.';return;}}
    if(data.deadline<today){status.textContent='Choose a deadline that has not passed.';return;}
    const body=[
      'PATHWAY FORUM — EMPLOYER VACANCY FOR REVIEW',
      'This is a submission for review, not a request to publish without verification.',
      '',
      ...[['employer','Employer'],['website','Employer website'],['title','Job title'],['location','Uganda district / location'],['workplace','Work arrangement'],['employmentType','Employment type'],['sector','Sector'],['experience','Maximum experience required'],['deadline','Closing date'],['salary','Salary'],['sourceUrl','Official employer advert'],['applicationUrl','Application link'],['description','Role and requirements'],['contact','Recruiter work email (private)']].map(([key,label])=>label+': '+(data[key]||'Not provided')),
      '',
      'I am authorised to submit this vacancy. Applicants will not be charged any fees.',
      'Please keep my recruiter contact details private.'
    ].join('\n');
    summary.value=body;document.querySelector('#summary-panel').hidden=false;
    document.querySelector('#email-draft').href='mailto:james.torrid1805@gmail.com?subject='+encodeURIComponent('Uganda vacancy review: '+data.title+' — '+data.employer)+'&body='+encodeURIComponent(body);
    status.textContent='Your vacancy summary is ready. Open the email draft below and send it to complete your submission. Nothing has been sent or stored by this website.';
    document.querySelector('#email-draft').focus();
  });
  document.querySelector('#copy-summary').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(summary.value);status.textContent='Summary copied. Paste it into an email to james.torrid1805@gmail.com and send it for review.'}catch{summary.focus();summary.select();status.textContent='Select and copy the summary, then email it to james.torrid1805@gmail.com.'}});
})();
