let jobs = [];
let active = null;
let showSaved = false;
const saved = new Set(JSON.parse(localStorage.getItem("pf-uganda-saved") || "[]"));
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
const initials = (name) => String(name).split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
const age = (value) => {
  if (!value) return "recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value)) / 86400000));
  return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
};

function saveState() {
  localStorage.setItem("pf-uganda-saved", JSON.stringify([...saved]));
  $("#saved-count").textContent = saved.size;
}

function setOptions(id, values) {
  const element = $(id);
  const first = element.firstElementChild.outerHTML;
  element.innerHTML = first + [...new Set(values.filter(Boolean))].sort().map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
}

function filtered() {
  const query = $("#query").value.trim().toLowerCase();
  return jobs.filter((job) =>
    (!showSaved || saved.has(job.id)) &&
    (!query || `${job.title} ${job.employer} ${job.summary}`.toLowerCase().includes(query)) &&
    (!$("#district").value || job.district === $("#district").value) &&
    (!$("#category").value || job.category === $("#category").value) &&
    (!$("#type").value || job.employmentType === $("#type").value)
  );
}

function render() {
  const list = filtered();
  $("#count").textContent = list.length;
  $("#grid").innerHTML = list.length ? list.map((job) => `
    <article class="card">
      <div class="company"><div class="logo">${esc(initials(job.employer))}</div><div><b>${esc(job.employer)}</b><small>✓ ${esc(job.verification.label)}</small></div><button class="save ${saved.has(job.id) ? "on" : ""}" type="button" data-save="${esc(job.id)}" aria-pressed="${saved.has(job.id)}" aria-label="Save ${esc(job.title)}">${saved.has(job.id) ? "Saved" : "Save"}</button></div>
      <h3>${esc(job.title)}</h3>
      <div class="meta"><span class="tag">${esc(job.location)}</span><span class="tag">${esc(job.employmentType)}</span><span class="tag">${esc(job.category)}</span></div>
      <div class="verified">✓ Source checked ${esc(age(job.lastCheckedAt))} · ${esc(job.deadlineStatus)}</div>
      <div class="foot"><span>${esc(job.workplace)}</span><button class="view" type="button" data-open="${esc(job.id)}">View details →</button></div>
    </article>`).join("") : '<div class="empty"><h3>No matching jobs right now.</h3><p>Clear a filter or check again after the next automatic update.</p></div>';
  document.querySelectorAll("[data-save]").forEach((button) => button.addEventListener("click", () => {
    saved.has(button.dataset.save) ? saved.delete(button.dataset.save) : saved.add(button.dataset.save);
    saveState();
    render();
  }));
  document.querySelectorAll("[data-open]").forEach((button) => button.addEventListener("click", () => openJob(button.dataset.open, true)));
}

function openJob(id, push) {
  active = jobs.find((job) => job.id === id);
  if (!active) return;
  $("#listing").hidden = true;
  $("#detail").hidden = false;
  $("#detail-logo").textContent = initials(active.employer);
  $("#detail-employer").textContent = active.employer;
  $("#detail-verified").textContent = active.verification.label;
  $("#detail-title").textContent = active.title;
  $("#detail-tags").innerHTML = [active.location, active.employmentType, active.category].map((value) => `<span class="tag">${esc(value)}</span>`).join("");
  $("#detail-deadline").textContent = active.deadlineStatus;
  $("#detail-check").textContent = `Last checked ${age(active.lastCheckedAt)}`;
  $("#detail-summary").textContent = active.summary;
  const indicators = active.indicators?.length ? active.indicators : ["No specific early-career indicator detected — check the requirements carefully."];
  $("#detail-indicators").innerHTML = indicators.map((value) => `<li>${esc(value)}</li>`).join("");
  $("#side-location").textContent = active.location;
  $("#side-workplace").textContent = active.workplace;
  $("#side-type").textContent = active.employmentType;
  $("#side-category").textContent = active.category;
  $("#side-experience").textContent = active.experience;
  $("#source-copy").textContent = `Imported directly from ${active.source}. Pathway Forum does not handle the hiring decision.`;
  $("#source-link").href = active.sourceUrl;
  $("#apply").href = active.applicationUrl;
  if (push) history.pushState({ job: id }, "", `?job=${encodeURIComponent(id)}`);
  scrollTo(0, 0);
}

function closeDetail(push = true) {
  active = null;
  $("#listing").hidden = false;
  $("#detail").hidden = true;
  if (push) history.pushState({}, "", "uganda-jobs.html");
  scrollTo(0, 0);
}

["query", "district", "category", "type"].forEach((id) => $("#" + id).addEventListener(id === "query" ? "input" : "change", render));
$("#saved-toggle").addEventListener("click", (event) => {
  showSaved = !showSaved;
  event.currentTarget.classList.toggle("active", showSaved);
  event.currentTarget.setAttribute("aria-pressed", String(showSaved));
  render();
});
$("#back").addEventListener("click", () => closeDetail());
$("#ready").addEventListener("click", () => {
  const count = document.querySelectorAll(".check input:checked").length;
  $("#ready-message").textContent = count === 3 ? "You look ready. Confirm the deadline once more, then apply." : `${count}/3 complete — finish the remaining checks first.`;
});
addEventListener("popstate", () => {
  const id = new URLSearchParams(location.search).get("job");
  id ? openJob(id, false) : closeDetail(false);
});

fetch("data/uganda-jobs.json", { cache: "no-store" })
  .then((response) => { if (!response.ok) throw new Error("Feed unavailable"); return response.json(); })
  .then((data) => {
    jobs = data.jobs || [];
    $("#updated").textContent = `Updated ${age(data.generatedAt)}`;
    setOptions("#district", jobs.map((job) => job.district));
    setOptions("#category", jobs.map((job) => job.category));
    setOptions("#type", jobs.map((job) => job.employmentType));
    saveState();
    render();
    const id = new URLSearchParams(location.search).get("job");
    if (id) openJob(id, false);
  })
  .catch(() => {
    $("#grid").innerHTML = '<div class="empty"><h3>The Uganda jobs feed is temporarily unavailable.</h3><p>Please try again later. We do not display unverified fallback listings.</p></div>';
    $("#updated").textContent = "Update unavailable";
  });
