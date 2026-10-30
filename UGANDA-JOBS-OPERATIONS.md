# Uganda jobs operations

The employer directory contains 30 organisations. It distinguishes a connected feed, an official page requiring manual review, and an unavailable connection. A directory entry is not a claim that we import every vacancy or that the employer endorses Pathway Forum.

## Sources

Run `node scripts/sync-uganda-jobs.mjs`. The three-hour GitHub workflow uses the same script. Collectors include:

- Existing dfcu, NSSF and World Vision adapters.
- GiveDirectly and One Acre Fund through Greenhouse; Stanbic through SmartRecruiters.
- Absa, UNHCR and WFP through Workday. WFP uses its official myworkdaysite tenant, rather than a guessed recruitment hostname.
- MTN Uganda, Uganda Airlines and NRC through their official Oracle Candidate Experience systems, up to three pages per source. Full requisition details supply qualifications and closing dates.
- BRAC International through Trakstar JobPosting records; raw control characters in JSON strings are repaired without executing page scripts.
- Mercy Corps/Prosper Global through Jobvite, CHAI through iCIMS, Plan through SuccessFactors microdata, and UNICEF through PageUp's exact location and closing metadata.
- DRC through server-rendered vacancy records, BRAC Uganda Bank through separate advert sections, and Makerere through its vacancy list and detail endpoint.
- FINCA through its explicit empty state or readable job adverts.
- Remaining sources use structured JobPosting extraction; they stay marked manual review when no parser can verify the listing.

An unexpected page, access block or changed API is reported as unavailable, not treated as zero jobs. Confirmed empty recruitment lists count as connected even when no suitable vacancy exists. The directory message records how many vacancy records were read and how many passed filters. Generic structured pages inspect at most three same-origin links; named listing adapters inspect up to 30 detail links; Oracle lists use at most 75 records. These bounds avoid unbounded crawling and are not a claim of exhaustive coverage. Five source workers and bounded request retries keep each scheduled run manageable. Run `node --test scripts/uganda-sources.test.mjs scripts/uganda-auto-adapters.test.mjs` after parser changes.

Only Uganda locations are imported by the new adapters. Senior titles, explicit experience requirements above two years, remote-only and expired roles are excluded. Ambiguous suitability is held in `data/uganda-jobs-review.json`. A source outage retains its previously published jobs for at most 72 hours from their original check, and never beyond a known deadline. Data without a deadline is accepted only from a currently active employer feed and must still be confirmed by applicants. The directory reports failures rather than presenting all 30 sources as connected.

## NGO jobs and ReliefWeb

NGO and humanitarian records carry a separate sector, selectable on the Uganda board. Official NGO feeds work without ReliefWeb. ReliefWeb requires an approved appname: request one at https://apidoc.reliefweb.int/ and, after approval, set the repository Actions variable `RELIEFWEB_APPNAME`. Do not use another application's appname. The script reports `setup-required` until configured. ReliefWeb records link back to ReliefWeb and are labelled separately from official employer adverts.

## Employer submissions

`post-job.html` prepares an email addressed to James. The employer must open and SEND that email; the site does not claim to receive or store it. Copying the summary supports people without a configured email app. There is no public recruiter database, instant posting or fee collection.

Check the sender's work email against the organisation, open the official advert independently, confirm application URL, Uganda duty station, closing date, experience and absence of applicant fees. Private contact information must not be copied into the public repository.

After verification, create a local JSON file with only public fields:

```json
{"id":"employer-reference","employer":"Employer name","title":"Graduate Trainee","location":"Kampala, Uganda","sector":"Other","employmentType":"Full-time","closesAt":"2030-01-31T20:59:59Z","summary":"Public duties and requirements from the verified advert.","sourceUrl":"https://employer.example/careers/reference","applicationUrl":"https://employer.example/apply/reference"}
```

Replace all example details with the verified vacancy. Run `node scripts/approve-employer-job.mjs --input PATH_TO_REVIEWED_JSON --approve`, then rerun the collector, inspect the public feed and commit/push only the approved public record and feed changes. `--approve` records James's explicit editorial decision; it is not a verification service. The emailed original remains private. To withdraw a vacancy, remove its approved record and regenerate the feed. Expiry is automatic.
