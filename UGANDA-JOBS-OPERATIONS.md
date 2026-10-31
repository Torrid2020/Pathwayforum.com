# Uganda jobs operations

The employer directory contains 36 organisations. It distinguishes a connected feed, an official page requiring manual review, and an unavailable connection. A directory entry is not a claim that we import every vacancy or that the employer endorses Pathway Forum.

## Sources

Run `node scripts/sync-uganda-jobs.mjs`. The three-hour GitHub workflow uses the same script. Collectors include:

- Existing dfcu, NSSF and World Vision adapters.
- GiveDirectly and One Acre Fund through Greenhouse; Stanbic through SmartRecruiters.
- Absa, UNHCR, WFP, Diageo / Uganda Breweries and PATH through Workday. WFP uses its official myworkdaysite tenant, rather than a guessed recruitment hostname.
- MTN Uganda, Uganda Airlines and NRC through their official Oracle Candidate Experience systems, up to three pages per source. Full requisition details supply qualifications and closing dates.
- BRAC International through Trakstar JobPosting records; raw control characters in JSON strings are repaired without executing page scripts.
- Mercy Corps/Prosper Global through Jobvite, CHAI through iCIMS, Plan through SuccessFactors microdata, and UNICEF through PageUp's exact location and closing metadata.
- DRC through server-rendered vacancy records, BRAC Uganda Bank through separate advert sections, and Makerere through its vacancy list and detail endpoint.
- FINCA through its explicit empty state or readable job adverts.
- Remaining sources use structured JobPosting extraction; they stay marked manual review when no parser can verify the listing.

An unexpected page, access block or changed API is reported as unavailable, not treated as zero jobs. Confirmed empty recruitment lists count as connected even when no suitable vacancy exists. The directory message records how many vacancy records were read and how many passed filters. Generic structured pages inspect at most three same-origin links; named listing adapters inspect up to 30 detail links; Oracle lists use at most 75 records. These bounds avoid unbounded crawling and are not a claim of exhaustive coverage. Five source workers and bounded request retries keep each scheduled run manageable. Run `node --test scripts/uganda-sources.test.mjs scripts/uganda-auto-adapters.test.mjs` after parser changes.

Only Uganda locations are imported by the new adapters. Remote-only and expired roles are excluded. All experience levels are imported; suspicious recruitment language is held for review. Every job receives an inferred level from its title, experience requirements and description. Six or more required years is senior; three to five is mid level; zero to two is entry level, with explicit senior and trainee titles taking precedence. Without experience evidence, clear officer, assistant, consultant, associate, representative, worker, operator, clerk and technician titles are entry level; specialist, coordinator, analyst II and supervisor titles are mid level. Genuinely unclear titles remain Not stated. Non-senior roles appear first, then senior roles, each by closing date (undated last). Homepage examples use only entry and mid-level jobs; its count includes all levels. A source outage retains its previously published jobs for at most 72 hours from their original check, and never beyond a known deadline. Data without a deadline is accepted only from a currently active employer feed and must still be confirmed by applicants. The directory reports failures rather than presenting all 36 sources as connected.

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

UCAA uses official vacancy heading links and full HTML advert descriptions. Readable application dates are mandatory to prevent archived adverts being presented as undated current jobs. A parser failure leaves UCAA on manual review with its reason.

## Phase 0 retained safeguards

The 120-day deadline cap, location placeholder cleanup, Uganda review-issue lifecycle, and Diageo/PATH Workday sources remain active. Existing regression tests cover deadline boundaries, placeholder cleanup, alert creation/change/closure/reopening and the two Workday registrations. A deadline beyond 120 days is unknown, not an application closing date.

ReliefWeb uses a single C240 (Uganda) RSS poll per scheduled run unless RELIEFWEB_APPNAME is configured, in which case the API replaces RSS using country.iso3 UGA. RSS stores metadata only; no RSS job description is republished. A blocked feed is recorded as unavailable. URL and employer/title similarity checks favour earlier official employer records over aggregator copies.

Additional public sources: Educate! and Jumia via Greenhouse, M-KOPA via Ashby, and WaterAid via Workable. Existing One Acre Fund, GiveDirectly and Standard Bank sources are reused. Lever is available for future named boards; no unnamed board is polled. Duty-station checks use Ugandan place names, never mentions in job descriptions.

Phase 0 local verification: 32 published Uganda jobs, 6 held, zero persisted deadlines beyond 120 days, and zero placeholder locations. Diageo and PATH each supplied one published job. The existing six review-alert lifecycle and deadline/location test groups passed unchanged.

## Individual owner review decisions

`data/uganda-job-review-decisions.json` records James Ocora’s explicit approval of specific held listings. IDs, titles, source and application URLs, and content fingerprints must match; only the explicitly reviewed flags are cleared. Reviewer, review time and original flags remain in the public verification audit. New listings, changed content or new flags return to review; expired listings are not revived. UNICEF’s approved record uses a factual editorial summary instead of captured page styling.

UNICEF’s owner approval is listing-scoped because its full-page HTML changes independently of the vacancy. It still requires the exact vacancy ID, title, source/application URLs and reviewed flags; new vacancies, destinations and additional flags remain held. Other approvals remain content-bound.

## Employer correction and removal requests

Respond promptly to requests sent to james.torrid1805@gmail.com. Add the exact vacancy ID to data/job-removals.json and run the affected sync; both the listing and its separate description file will be removed and future imports will skip it. Use an ID when an employer hosts several adverts on one URL. Correct source data or reviewed editorial text as appropriate, then commit and push. Detail views carry no ads or aggregated JobPosting markup; jobs.html stays noindex.

## Separate full descriptions

Public list feeds contain summary metadata and an optional descriptionPath, never full description text. Syncs sanitise available feed descriptions into data/jobs/uganda or data/jobs/remote and retain closed-job descriptions for 30 days before pruning. Explicit removal requests delete the page and description immediately. HTML-only/PDF sources and feeds without a description show an official-advert fallback. ReliefWeb remains metadata-only. Files are requested only when a detail view opens; loading times out with a source link rather than blocking Apply. npm ci --ignore-scripts installs the build-time sanitizer; no sanitizer bundle is sent to browsers.

## Static job pages and closed adverts

Both syncs call scripts/job-pages.mjs and commit their board manifest, generated pages and separate descriptions. Slugs remain stable by job ID even when titles change. Disappeared or expired adverts keep their page and existing description for 30 days, with a closed banner and no Apply buttons, then are deleted. data/job-removals.json bypasses this retention immediately. Never delete a manifest to reset a feed: it records stable URLs and closure dates.

Generated jobs/uganda/categories pages use the same public list order. Job pages are noindex, contain no ads or JobPosting markup, and load only their own description. Legacy board ?job= URLs redirect to the permanent page. Similar-job ranking is shared with the Apply follow-up panel.