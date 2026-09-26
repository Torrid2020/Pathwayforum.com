# Pathway Forum

A free scholarship and study-guide site by [Rise & Reasons](https://www.youtube.com/@torridcourts) on YouTube.

Scholarships, affordable online degrees, and study abroad guides for BYU-Pathway and online students.

Live site: https://torrid2020.github.io/Pathwayforum.com/

## Structure

- `index.html` — homepage, scholarship finder, and blog index
- `guides/` — articles, sharing `guides/guide.css`
- `about.html` — about page, editorial policy, and scam warning
- `data/scholarships.js` — scholarship listings
- `scripts/check-deadlines.mjs` — the daily deadline check

Push to `main` and GitHub Pages redeploys automatically (usually within a minute). To preview locally, open `index.html` in a browser.

## Scholarship data

Scholarships live in `data/scholarships.js`. Each entry has:

- `closes` — ISO deadline date (`YYYY-MM-DD`), or `null` with a `deadlineNote` when there's no single date
- `url` — the provider's official page
- `checked` — the date the entry was last verified against that page
- `levels` — study levels, e.g. `["Master's", "PhD"]`
- `watch` — how the daily check verifies it (see below)

Deadlines within 30 days get a "Closes in N days" badge, and past deadlines are marked Closed. The country filter is built from the data automatically.

## Daily deadline check

`.github/workflows/check-deadlines.yml` runs `scripts/check-deadlines.mjs` every day at 06:17 UTC. For each scholarship it reads the official page and:

| `watch.type` | Page matches | Page differs |
|---|---|---|
| `date` | Refreshes `checked` | New future deadline: updates `closes` and tells you. Anything unclear: flags it for review. |
| `text` | Refreshes `checked` | Flags it for review (rewording a listing needs a person). |
| `manual` | — | Flags it once `checked` is more than 45 days old. |

Anything that needs your attention is posted to a GitHub issue labelled `deadline-check`, and GitHub emails you. To resolve a review item: open the official page, update the entry in `data/scholarships.js` (including `watch.expect` or `watch.pattern` if the wording changed), set `checked` to today, and close the issue.

To run the check yourself: `node scripts/check-deadlines.mjs --dry-run` (prints results without saving). You can also trigger the workflow from the repo's **Actions** tab.

## Newsletter and WhatsApp

Near the bottom of `index.html`:

- `NEWSLETTER_ENDPOINT` — a form endpoint that accepts an `email` field (e.g. Buttondown's embed-subscribe URL). Until it's set, the form tells visitors sign-ups aren't open yet.
- `WHATSAPP_URL` — the WhatsApp group (or channel) invite link behind the join button. Clear it to hide the button. If the invite link is ever reset in WhatsApp, update it here.

Pathway Forum by Rise & Reasons. Independent education platform, not officially affiliated with BYU-Pathway Worldwide, Brigham Young University, or BYU-Idaho.
