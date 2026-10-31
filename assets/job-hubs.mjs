export const JOB_HUBS=[
 ['finance','Finance','Explore finance, accounting and audit roles in Uganda. Compare experience requirements before applying.',j=>j.category==='Finance'||/finance|financial|account|audit/i.test(j.title)],
 ['ngo-humanitarian','NGO & Humanitarian','Find roles in community and humanitarian programmes. Check the duty station, contract length and experience requirements.',j=>j.sector==='NGO & Humanitarian'||j.category==='NGO & Humanitarian'],
 ['banking','Banking','Explore opportunities with banks and financial institutions in Uganda. Roles span customer support, technology and specialist work.',j=>j.sector==='Banking'||j.category==='Banking'],
 ['it','IT','Browse technology roles in Uganda. Compare the practical skills and experience each employer asks for.',j=>j.category==='Technology'||/\bIT\b|\bICT\b|software|developer|cyber|information technology/i.test(j.title)],
 ['health','Health','Explore health and public-health opportunities in Uganda. Review professional registration, education and fieldwork requirements.',j=>j.category==='Health'||/health|medical|nurs|nutrition|clinical/i.test(j.title)],
 ['education','Education','Find education, teaching and student-support work. Read the requirements to understand whether a role suits your studies or professional experience.',j=>j.sector==='Education'||/education|teacher|lecturer|teaching/i.test(j.title)],
 ['telecom','Telecom','Explore Uganda’s telecommunications sector. Check whether each role involves technical work, customer operations or business support.',j=>j.sector==='Telecom'||j.category==='Telecom'],
 ['graduate-internship','Graduate & Internship','Find internships, trainee positions and graduate programmes. Check eligibility, required qualifications and whether the advert states an allowance.',j=>j.level==='Internship / trainee'||/\bintern|\btrainee|\bgraduate|\bapprentice/i.test(j.title)]
].map(([slug,name,intro,match])=>({slug,name,intro,match}));
export const hubPath=hub=>'jobs/uganda/categories/'+hub.slug+'/';
export const hubFor=job=>JOB_HUBS.find(h=>h.name===job.category)||JOB_HUBS.find(h=>h.match(job));
