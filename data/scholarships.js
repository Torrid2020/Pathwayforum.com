// Scholarship data for the finder on index.html.
// Checked daily by scripts/check-deadlines.mjs, which refreshes "checked" dates and
// updates "closes" when an official page publishes a new deadline. Keep the array valid JSON.
window.SCHOLARSHIPS = [
  {
    "name": "Chevening Scholarships",
    "country": "United Kingdom",
    "closes": "2026-10-06",
    "funding": "Fully Funded",
    "levels": ["Master's"],
    "checked": "2026-09-26",
    "summary": "UK government awards for a one-year master's. Requires two years' work experience after your degree.",
    "url": "https://www.chevening.org/scholarships/",
    "watch": {
      "type": "date",
      "url": "https://www.chevening.org/scholarships/application-timeline/",
      "pattern": "The deadline for applications is (?<date>\\d{1,2} [A-Z][a-z]+ \\d{4})"
    }
  },
  {
    "name": "Commonwealth Master's Scholarships",
    "country": "United Kingdom",
    "closes": "2026-10-20",
    "funding": "Fully Funded",
    "levels": ["Master's"],
    "checked": "2026-09-26",
    "summary": "For citizens of eligible Commonwealth countries. Apply through a national nominating body, not directly.",
    "url": "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/",
    "watch": {
      "type": "date",
      "pattern": "for the (?<year>\\d{4})/\\d{2} academic year[^.]*\\.\\s*The closing date for applications is [^.]*?(?<date>\\d{1,2} [A-Z][a-z]+)\\s*\\.",
      "yearOffset": -1
    }
  },
  {
    "name": "Erasmus Mundus Joint Masters",
    "country": "European Union",
    "closes": null,
    "deadlineNote": "Varies by programme (mostly Oct–Jan)",
    "funding": "Fully Funded",
    "levels": ["Master's"],
    "checked": "2026-09-26",
    "summary": "Study in multiple European countries. Each programme sets its own deadline and selects its own scholars.",
    "url": "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters",
    "watch": {
      "type": "text",
      "pattern": "Students apply directly to the institution running their chosen programme",
      "expect": "Students apply directly to the institution running their chosen programme"
    }
  },
  {
    "name": "DAAD Development-Related Postgraduate Courses (EPOS)",
    "country": "Germany",
    "closes": null,
    "deadlineNote": "Varies by course (mostly Aug–Nov)",
    "funding": "Fully Funded",
    "levels": ["Master's", "PhD"],
    "checked": "2026-09-26",
    "summary": "For applicants from developing countries. Apply directly to your chosen course, not to DAAD.",
    "url": "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50076777",
    "watch": {
      "type": "manual",
      "reason": "DAAD blocks automated requests, so this one needs checking by hand."
    }
  },
  {
    "name": "Swedish Institute Scholarships for Global Professionals",
    "country": "Sweden",
    "closes": null,
    "deadlineNote": "Expected Jan–Feb 2027 (two steps)",
    "funding": "Fully Funded",
    "levels": ["Master's"],
    "checked": "2026-09-26",
    "summary": "Apply to an eligible Swedish master's programme first, then to the Swedish Institute.",
    "url": "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
    "watch": {
      "type": "text",
      "pattern": "Key dates: (?<text>.+?): Apply to Swedish master",
      "expect": "16 October 2025 – 15 January 2026"
    }
  },
  {
    "name": "VLIR-UOS Scholarships",
    "country": "Belgium",
    "closes": null,
    "deadlineNote": "2027–28 call opens mid-Nov 2026",
    "funding": "Fully Funded",
    "levels": ["Bachelor's", "Master's"],
    "checked": "2026-09-26",
    "summary": "Study in Flanders for applicants from 29 eligible countries in Africa, Asia and Latin America.",
    "url": "https://www.vliruos.be/en/scholarships",
    "watch": {
      "type": "text",
      "pattern": "The call for the (?<text>\\d{4}.\\d{4} academic year is expected to open in [^.]+)\\.",
      "expect": "2027–2028 academic year is expected to open in mid-November 2026"
    }
  },
  {
    "name": "Fulbright Foreign Student Program",
    "country": "United States",
    "closes": null,
    "deadlineNote": "Varies by country",
    "funding": "Varies by country",
    "levels": ["Master's", "PhD"],
    "checked": "2026-09-26",
    "summary": "Graduate study in the US. Apply through the Fulbright commission or US embassy in your country.",
    "url": "https://foreign.fulbrightonline.org/",
    "watch": {
      "type": "text",
      "pattern": "apply to the Fulbright Commissions/Foundations or U\\.S\\. Embassy in your home country",
      "expect": "apply to the Fulbright Commissions/Foundations or U.S. Embassy in your home country"
    }
  },
  {
    "name": "Australia Awards Scholarships",
    "country": "Australia",
    "closes": null,
    "deadlineNote": "Next round expected Feb 2027; varies by country",
    "funding": "Fully Funded",
    "levels": ["Master's"],
    "checked": "2026-09-26",
    "summary": "Long-term awards for study and leadership in developing countries.",
    "url": "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    "watch": {
      "type": "text",
      "url": "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships-opening-and-closing-dates",
      "pattern": "Dates for study commencing in (?<text>\\d{4})",
      "expect": "2027"
    }
  },
  {
    "name": "MEXT Scholarship (Research Students)",
    "country": "Japan",
    "closes": null,
    "deadlineNote": "Embassy round usually Apr–May; varies by country",
    "funding": "Fully Funded",
    "levels": ["Master's", "PhD"],
    "checked": "2026-09-26",
    "summary": "Japanese government funding for graduate study. Apply through the Japanese embassy in your country.",
    "url": "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
    "watch": {
      "type": "text",
      "url": "https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html",
      "pattern": "MEXT Scholarship for (?<text>\\d{4}) Embassy Recommendation",
      "expect": "2027"
    }
  },
  {
    "name": "BYU Pathway to WGU Scholarship",
    "country": "United States",
    "closes": "2027-06-30",
    "funding": "Partial Funding",
    "levels": ["Bachelor's", "Master's"],
    "checked": "2026-09-26",
    "summary": "Up to $4,000 toward an online WGU degree for PathwayConnect graduates. US citizens and eligible noncitizens only.",
    "url": "https://www.wgu.edu/financial-aid-tuition/scholarships/partner/byu-pw.html",
    "watch": {
      "type": "date",
      "pattern": "Deadline \\(per \\d{4}-\\d{2} aid year\\):\\s*(?<date>\\d{1,2}/\\d{1,2}/\\d{2,4})"
    }
  }
];
