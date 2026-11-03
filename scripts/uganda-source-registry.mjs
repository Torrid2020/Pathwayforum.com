// Official career pages; being in this directory does not imply endorsement or a current vacancy.
const rows = [
 ['dfcu','dfcu Bank','Banking','https://www.dfcugroup.com/careers/','existing'],
 ['nssf-uganda','NSSF Uganda','Public institution','https://www.nssfug.org/opportunities/careers/','nssf-list'],
 ['mtn-uganda','MTN Uganda','Telecom','https://www.mtn.co.ug/careers/','oracle','ehle.fa.em2.oraclecloud.com/CX_1'],
 ['airtel-uganda','Airtel Uganda','Telecom','https://www.airtel.co.ug/ug/about/careers','structured'],
 ['uganda-airlines','Uganda Airlines','Transport','https://careers.ugandairlines.com/jobs','oracle','fa-eptm-saasfaprod1.fa.ocs.oraclecloud.com/CX_4001'],
 ['ura','Uganda Revenue Authority','Public institution','https://ura.go.ug/en/opportunities/careers/','structured'],
 ['ucaa','Uganda Civil Aviation Authority','Public institution','https://caa.go.ug/available-vacancies/','ucaa'],
 ['totalenergies','TotalEnergies Uganda','Energy','https://totalenergies.ug/opportunities','structured'],
 ['makerere','Makerere University','Education','https://ehrms.mak.ac.ug/recruitment/jobs','makerere'],
 ['stanbic','Stanbic Bank Uganda','Banking','https://careers.standardbank.com/sbg/standard-bank-group/careers/apply/jobs/view-all-jobs','smartrecruiters','StandardBankGroup'],
 ['absa','Absa Bank Uganda','Banking','https://www.absa.africa/careers/','workday','absa.wd3.myworkdayjobs.com/ABSAcareersite'],
 ['finca','FINCA Uganda','Banking','https://finca.ug/career/','finca'],
 ['brac-bank','BRAC Uganda Bank','Banking','https://www.bracugandabankltd.com/careers/','brac-bank'],
 ['equity','Equity Bank Uganda','Banking','https://equitygroupholdings.com/ug/','structured'],
 ['centenary','Centenary Bank','Banking','https://www.centenarybank.co.ug/','structured'],
 ['world-vision','World Vision','NGO & Humanitarian','https://worldvision.wd1.myworkdayjobs.com/WorldVisionInternational','existing'],
 ['givedirectly','GiveDirectly','NGO & Humanitarian','https://www.givedirectly.org/careers/','greenhouse','givedirectly'],
 ['one-acre-fund','One Acre Fund','NGO & Humanitarian','https://oneacrefund.org/careers/locations/uganda','greenhouse','oneacrefund'],
 ['living-goods','Living Goods','NGO & Humanitarian','https://livinggoods.applytojob.com/apply/','structured'],
 ['brac-international','BRAC International','NGO & Humanitarian','https://bracinternational.hire.trakstar.com/jobs/','trakstar'],
 ['irc','International Rescue Committee','NGO & Humanitarian','https://www.rescue.org/careers','structured'],
 ['mercy-corps','Mercy Corps','NGO & Humanitarian','https://jobs.jobvite.com/prosperglobal/jobs','jobvite'],
 ['save-children','Save the Children International','NGO & Humanitarian','https://www.savethechildren.net/careers/','structured'],
 ['drc','Danish Refugee Council','NGO & Humanitarian','https://drc.ngo/jobs/','drc'],
 ['nrc','Norwegian Refugee Council','NGO & Humanitarian','https://www.nrc.no/careers','oracle','ekum.fa.em2.oraclecloud.com/CX_2019'],
 ['plan','Plan International','NGO & Humanitarian','https://jobs.plan-international.org/search/?q=Uganda','successfactors'],
 ['unicef','UNICEF','NGO & Humanitarian','https://jobs.unicef.org/en-us/Search/?location=uganda','pageup'],
 ['wfp','World Food Programme','NGO & Humanitarian','https://www.wfp.org/careers','workday','wd3.myworkdaysite.com/wfp/job_openings'],
 ['unhcr','UNHCR','NGO & Humanitarian','https://www.unhcr.org/careers-unhcr','workday','unhcr.wd3.myworkdayjobs.com/External'],
 ['diageo','Diageo / Uganda Breweries','Manufacturing','https://diageo.wd3.myworkdayjobs.com/Diageo_Careers','workday','diageo.wd3.myworkdayjobs.com/Diageo_Careers'],
 ['path','PATH','NGO & Humanitarian','https://path.wd1.myworkdayjobs.com/External','workday','path.wd1.myworkdayjobs.com/External'],
 ['educate','Educate!','NGO & Humanitarian','https://job-boards.greenhouse.io/educate','greenhouse','educate'],
 ['jumia','Jumia','Retail','https://job-boards.eu.greenhouse.io/jumia','greenhouse','jumia'],
 ['m-kopa','M-KOPA','Energy','https://jobs.ashbyhq.com/m-kopa','ashby','m-kopa'],
 ['wateraid','WaterAid','NGO & Humanitarian','https://apply.workable.com/wateraid/','workable','wateraid'],
 ['chai','Clinton Health Access Initiative','NGO & Humanitarian','https://careers-chai.icims.com/jobs/search?ss=1&searchKeyword=Uganda&in_iframe=1','icims']
];
const additions = [
 [
  "sunking",
  "Sun King",
  "Energy",
  "https://sunking.pinpointhq.com/",
  "pinpoint",
  "https://sunking.pinpointhq.com/postings.json"
 ],
 [
  "laterite",
  "Laterite",
  "Research & M&E",
  "https://apply.workable.com/laterite/",
  "workable",
  "laterite"
 ],
 [
  "vivo-energy",
  "Vivo Energy",
  "Energy",
  "https://apply.workable.com/vivo-energy/",
  "workable",
  "vivo-energy"
 ],
 [
  "tugende",
  "Tugende",
  "Finance",
  "https://gotugende.com/join/",
  "workable",
  "tugende"
 ],
 [
  "kakira",
  "Kakira Sugar",
  "Manufacturing",
  "https://kakirasugar.com/jobs-listing/",
  "kakira"
 ],
 [
  "eadb",
  "East African Development Bank",
  "Banking",
  "https://eadb.org/vacancies/",
  "eadb"
 ],
 [
  "hsc",
  "Health Service Commission",
  "Health",
  "https://hsc.go.ug/jobs.php",
  "pdf-advert"
 ],
 [
  "esc",
  "Education Service Commission",
  "Education",
  "https://esc.go.ug/feed/",
  "rss-advert"
 ],
 [
  "jsc",
  "Judicial Service Commission",
  "Public institution",
  "https://www.jsc.go.ug/feed/",
  "rss-advert"
 ],
 [
  "iom",
  "International Organization for Migration",
  "NGO & Humanitarian",
  "https://fa-evlj-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs",
  "oracle",
  "fa-evlj-saasfaprod1.fa.ocs.oraclecloud.com/CX_1001"
 ],
 [
  "fhi360",
  "FHI 360",
  "NGO & Humanitarian",
  "https://www.fhi360.org/join-our-team/",
  "workday",
  "fhi.wd1.myworkdayjobs.com/FHI_360_External_Career_Portal"
 ],
 [
  "baylor-uganda",
  "Baylor College of Medicine Children’s Foundation Uganda",
  "Health",
  "https://careers.baylor-uganda.org/",
  "official-list"
 ],
 [
  "kcca",
  "Kampala Capital City Authority",
  "Public institution",
  "https://www.kcca.go.ug/employment-opportunities",
  "kcca"
 ],
 [
  "udb",
  "Uganda Development Bank",
  "Banking",
  "https://www.udbl.co.ug/careers/",
  "official-list",
  "https://www.udbl.co.ug/our-latest-vacancies/"
 ],
 [
  "uetcl",
  "Uganda Electricity Transmission Company",
  "Energy",
  "https://uetcl.go.ug/careers/",
  "dated-list"
 ],
 [
  "ucc",
  "Uganda Communications Commission",
  "Telecom",
  "https://www.ucc.co.ug/jobs/",
  "official-list",
  "https://erp.ucc.co.ug/jobs"
 ]
];
const singleIds = new Set(['nssf-uganda',...additions.map(r=>r[0])]);
export const employerSources = [...rows,...additions].map(([id,employer,sector,url,method,adapter])=>({id,name:employer+' Careers',employer,sector,url,method,adapter:adapter||null,trust:'official',...(singleIds.has(id)?{singleFetch:true}:{})}));
