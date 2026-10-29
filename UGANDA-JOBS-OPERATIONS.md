# Uganda jobs operations

The employer directory contains 30 organisations. It distinguishes a connected feed, an official page requiring manual review, and an unavailable connection. A directory entry is not a claim that we import every vacancy or that the employer endorses Pathway Forum.

## Sources

Run `node scripts/sync-uganda-jobs.mjs`. The three-hour GitHub workflow uses the same script. Existing dfcu, NSSF and World Vision collectors are joined by GiveDirectly and One Acre Fund (Greenhouse), Stanbic (SmartRecruiters), Absa and UNHCR (Workday), and structured JobPosting extraction from the remaining official pages. A page with no readable JobPosting data stays marked manual review; never infer that it has no vacancies. Each structured page checks at most three same-origin detail links, with five workers and bounded timeouts.

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
