# Uganda employer expansion — 3 November 2026

Directory: **52** official employer/government sources, up from 36. **43 connected**, **8 manual-review**, **1 unavailable**. Published jobs: **40**; held for review: **1**. The 16 additions supplied **10 published jobs** in this sync. All 16 were registered; no backup sources were necessary.

## Polling and safety

By James's clarified instruction, existing collectors keep their list/detail behavior. Every new source and the NSSF repair has at most one vacancy-data request per run, with no retries or unchecked redirects. A per-host robots.txt policy is fetched separately and shared within the run; disallowed or uncertain access is reported rather than bypassed. All 17 constrained sources made one vacancy request in the recorded sync. The existing three-hour cron, review decisions, removals, scam screening, location filter, deadline cap, level inference/order, permanent pages, archives, hubs, descriptions, trust lines and tests remain in place.

Pinpoint supplies Sun King's full description in its list response. Workable widgets and the new list-only Workday/Oracle paths do not fetch individual descriptions. PDF-advert records link to the official PDF without downloading or splitting the PDF into invented positions. HSC summary/complete duplicates are grouped by advert number and round, keeping internal and external adverts separate. Commission RSS keeps only recent recruitment adverts; warnings, results, interviews, shortlists and expired notices are excluded. Undated RSS notices older than 30 days are not treated as current recruitment.

## NSSF investigation

The careers URL is unchanged. Both the careers page and its currently linked advert returned HTTP 200 during diagnosis; the earlier fetch failure could not be reproduced. The old collector depended on fetching both the list and each detail page. The list exposes the featured title but no deadline. Under the agreed one-request limit, NSSF is now honestly **manual-review**, rather than unavailable or publishing an undated listing. Automatic deadline-verified NSSF publication is **NOT DONE** under this limit. UETCL similarly exposes titles but requires separate advert requests for closing dates, so it remains manual-review.

## Per-source sync results

Records read are response records examined, before Uganda/deadline/review filtering and de-duplication. Connected with zero published jobs is valid and does not imply the employer is hiring in Uganda. Existing collectors retain their previous count semantics. Counts describe this sync, not a promise of future availability.

| Official source | Status | Records read | Published | Reason / result |
|---|---|---:|---:|---|
| [dfcu Bank](https://www.dfcugroup.com/careers/) | connected | 1 | 0 | Official collector responded; existing parsing retained. |
| [NSSF Uganda](https://www.nssfug.org/opportunities/careers/) | manual-review | 1 | 0 | Careers URL is unchanged and reachable. Featured titles are readable, but deadlines require a separate advert request; manual review under the one-request limit. |
| [MTN Uganda](https://www.mtn.co.ug/careers/) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [Airtel Uganda](https://www.airtel.co.ug/ug/about/careers) | manual-review | 0 | 0 | Career page reached; no structured vacancies available. Review the official page manually. |
| [Uganda Airlines](https://careers.ugandairlines.com/jobs) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [Uganda Revenue Authority](https://ura.go.ug/en/opportunities/careers/) | manual-review | 0 | 0 | Career page reached; no structured vacancies available. Review the official page manually. |
| [Uganda Civil Aviation Authority](https://caa.go.ug/available-vacancies/) | connected | 6 | 0 | Official collector responded; existing parsing retained. |
| [TotalEnergies Uganda](https://totalenergies.ug/opportunities) | manual-review | 0 | 0 | Career page reached; no structured vacancies available. Review the official page manually. |
| [Makerere University](https://ehrms.mak.ac.ug/recruitment/jobs) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [Stanbic Bank Uganda](https://careers.standardbank.com/sbg/standard-bank-group/careers/apply/jobs/view-all-jobs) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [Absa Bank Uganda](https://www.absa.africa/careers/) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [FINCA Uganda](https://finca.ug/career/) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [BRAC Uganda Bank](https://www.bracugandabankltd.com/careers/) | connected | 3 | 3 | Official collector responded; existing parsing retained. |
| [Equity Bank Uganda](https://equitygroupholdings.com/ug/) | manual-review | 0 | 0 | Career page reached; no structured vacancies available. Review the official page manually. |
| [Centenary Bank](https://www.centenarybank.co.ug/) | manual-review | 0 | 0 | Career page reached; no structured vacancies available. Review the official page manually. |
| [World Vision](https://worldvision.wd1.myworkdayjobs.com/WorldVisionInternational) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [GiveDirectly](https://www.givedirectly.org/careers/) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [One Acre Fund](https://oneacrefund.org/careers/locations/uganda) | connected | 3 | 3 | Official collector responded; existing parsing retained. |
| [Living Goods](https://livinggoods.applytojob.com/apply/) | connected | 2 | 0 | Official collector responded; existing parsing retained. |
| [BRAC International](https://bracinternational.hire.trakstar.com/jobs/) | connected | 15 | 4 | Official collector responded; existing parsing retained. |
| [International Rescue Committee](https://www.rescue.org/careers) | manual-review | 0 | 0 | Career page reached; no structured vacancies available. Review the official page manually. |
| [Mercy Corps](https://jobs.jobvite.com/prosperglobal/jobs) | connected | 6 | 0 | Official collector responded; existing parsing retained. |
| [Save the Children International](https://www.savethechildren.net/careers/) | unavailable | 0 | 0 | HTTP 403 |
| [Danish Refugee Council](https://drc.ngo/jobs/) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [Norwegian Refugee Council](https://www.nrc.no/careers) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [Plan International](https://jobs.plan-international.org/search/?q=Uganda) | connected | 10 | 0 | Official collector responded; existing parsing retained. |
| [UNICEF](https://jobs.unicef.org/en-us/Search/?location=uganda) | connected | 1 | 0 | Official collector responded; existing parsing retained. |
| [World Food Programme](https://www.wfp.org/careers) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [UNHCR](https://www.unhcr.org/careers-unhcr) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [Diageo / Uganda Breweries](https://diageo.wd3.myworkdayjobs.com/Diageo_Careers) | connected | 0 | 0 | Official collector responded; existing parsing retained. |
| [PATH](https://path.wd1.myworkdayjobs.com/External) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [Educate!](https://job-boards.greenhouse.io/educate) | connected | 3 | 3 | Official collector responded; existing parsing retained. |
| [Jumia](https://job-boards.eu.greenhouse.io/jumia) | connected | 1 | 1 | Official collector responded; existing parsing retained. |
| [M-KOPA](https://jobs.ashbyhq.com/m-kopa) | connected | 66 | 4 | Official collector responded; existing parsing retained. |
| [WaterAid](https://apply.workable.com/wateraid/) | connected | 9 | 3 | Official collector responded; existing parsing retained. |
| [Clinton Health Access Initiative](https://careers-chai.icims.com/jobs/search?ss=1&searchKeyword=Uganda&in_iframe=1) | connected | 3 | 3 | Official collector responded; existing parsing retained. |
| [Sun King](https://sunking.pinpointhq.com/) | connected | 181 | 1 | Automatic collector checked the recruitment source. 181 vacancy records read; 1 passed publication filters. |
| [Laterite](https://apply.workable.com/laterite/) | connected | 4 | 1 | Automatic collector checked the recruitment source. 4 vacancy records read; 1 passed publication filters. |
| [Vivo Energy](https://apply.workable.com/vivo-energy/) | connected | 21 | 0 | Automatic collector checked the recruitment source. 21 vacancy records read; 0 passed publication filters. |
| [Tugende](https://gotugende.com/join/) | connected | 0 | 0 | Automatic collector checked the recruitment source. 0 vacancy records read; 0 passed publication filters. |
| [Kakira Sugar](https://kakirasugar.com/jobs-listing/) | connected | 5 | 5 | Automatic collector checked the recruitment source. 5 vacancy records read; 5 passed publication filters. |
| [East African Development Bank](https://eadb.org/vacancies/) | connected | 2 | 1 | Automatic collector checked the recruitment source. 2 vacancy records read; 1 passed publication filters. |
| [Health Service Commission](https://hsc.go.ug/jobs.php) | connected | 4 | 2 | One entry per advert; summary/complete copies are grouped. Only adverts with an unexpired date on the official list are published. |
| [Education Service Commission](https://esc.go.ug/feed/) | connected | 10 | 0 | Only recent recruitment adverts are eligible; warnings, interviews, shortlists and expired notices are excluded. |
| [Judicial Service Commission](https://www.jsc.go.ug/feed/) | connected | 4 | 0 | Only recent recruitment adverts are eligible; warnings, interviews, shortlists and expired notices are excluded. |
| [International Organization for Migration](https://fa-evlj-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs) | connected | 0 | 0 | Automatic collector checked the recruitment source. 0 vacancy records read; 0 passed publication filters. |
| [FHI 360](https://www.fhi360.org/join-our-team/) | connected | 0 | 0 | One Uganda-filtered Workday list request; descriptions and any dates not supplied by the list remain on the official advert. |
| [Baylor College of Medicine Children’s Foundation Uganda](https://careers.baylor-uganda.org/) | connected | 0 | 0 | Official recruitment page explicitly reports no open positions. |
| [Kampala Capital City Authority](https://www.kcca.go.ug/employment-opportunities) | connected | 1 | 0 | Only adverts with a readable, future closing date are published; old adverts are excluded. |
| [Uganda Development Bank](https://www.udbl.co.ug/careers/) | connected | 0 | 0 | Official recruitment page explicitly reports no open positions. |
| [Uganda Electricity Transmission Company](https://uetcl.go.ug/careers/) | manual-review | 6 | 0 | Vacancy titles are readable, but closing dates are inside separate adverts. Manual review is required under the one-request limit; no undated archived jobs are imported. |
| [Uganda Communications Commission](https://www.ucc.co.ug/jobs/) | connected | 0 | 0 | Official recruitment page explicitly reports no open positions. |

## Verification

89/89 automated tests pass, including saved official Pinpoint, RSS-advert, HSC PDF-list, Kakira and EADB samples; robots rules, one-request limits, Oracle reuse, expiry and non-Uganda filtering. Browser verification uses local Playwright because the Browser plugin is not available. Checked uganda-jobs.html and uganda-employers.html at 375px and 1280px: all 52 directory entries, official links and new sectors; search and level filter; generated Sun King job link; Privacy footer; no overflow or console/runtime errors.
