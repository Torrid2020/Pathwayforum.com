# Torrid Courts

Scholarships, affordable online degrees, and study abroad guides for BYU-Pathway and online students.

Live site: https://torrid2020.github.io/Pathwayforum.com/

## Structure

- `index.html` — homepage, scholarship finder, and blog index
- `guides/` — articles, sharing `guides/guide.css`
- `about.html` — about page, editorial policy, and scam warning

Push to `main` and GitHub Pages redeploys automatically (usually within a minute). To preview locally, open `index.html` in a browser.

## Scholarship data

Scholarships are listed in the `scholarships` array near the bottom of `index.html`. Each entry has:

- `closes` — ISO deadline date (`YYYY-MM-DD`), or `null` with a `deadlineNote` when there's no single date
- `url` — the provider's official page
- `checked` — the date the entry was last verified against that page
- `levels` — study levels, e.g. `["Master's", "PhD"]`

Deadlines within 30 days get a "Closes in N days" badge, and past deadlines are marked Closed. The country filter is built from the data automatically.

When you update an entry, check it against the official page and update `checked`. Only use dates the provider has published.

## Newsletter

The sign-up form doesn't collect emails yet. To turn it on, create a form endpoint with a service such as Buttondown or Formspree and set `NEWSLETTER_ENDPOINT` near the bottom of `index.html`.

Independent education platform. Not officially affiliated with BYU-Pathway Worldwide, Brigham Young University, or BYU-Idaho.
