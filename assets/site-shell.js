(() => {
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
