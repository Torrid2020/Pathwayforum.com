# Torrid Courts

Scholarships, affordable online degrees, and study abroad guides for BYU-Pathway and online students.

Live site: https://torrid2020.github.io/Pathwayforum.com/

## Editing

The whole site is a single self-contained file, `index.html`. Push to `main` and GitHub Pages redeploys automatically (usually within a minute).

To preview locally, open `index.html` in a browser.

## Newsletter

The sign-up form doesn't collect emails yet. To turn it on, create a form endpoint with a service such as Buttondown or Formspree and set `NEWSLETTER_ENDPOINT` near the bottom of `index.html`.

## Scholarship data

Scholarships are listed in the `scholarships` array in `index.html`. Each entry's `closes` is an ISO date (`YYYY-MM-DD`), or `null` with a `deadlineNote` for rolling or varying deadlines. Past deadlines are automatically marked Closed.

Independent education platform. Not officially affiliated with BYU-Pathway Worldwide, Brigham Young University, or BYU-Idaho.
