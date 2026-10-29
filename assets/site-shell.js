(() => {
  const markCards = () => document.querySelectorAll('.job-card[data-id]').forEach(card => {
    if(card.hasAttribute('tabindex')) return;
    card.tabIndex = 0;
    card.setAttribute('role','group');
    card.setAttribute('aria-label',card.querySelector('h3')?.textContent || 'Job details');
    card.addEventListener('keydown',event=>{if(event.target===card && (event.key==='Enter'||event.key===' ')){event.preventDefault();card.click();}});
  });
  new MutationObserver(markCards).observe(document.body,{childList:true,subtree:true});
  markCards();
  const menu = document.querySelector("[data-pf-menu]");
  const nav = document.querySelector("[data-pf-nav]");
  if (!menu || !nav) return;
  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
  };
  menu.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.addEventListener("click", (event) => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setOpen(false);
      menu.focus();
    }
  });
})();
