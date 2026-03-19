"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const html       = document.documentElement;
  const header     = document.getElementById("header");
  const navToggle  = document.getElementById("nav-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const themeBtn   = document.querySelector(".theme-toggle");
  const moonIcon   = document.querySelector(".moon-icon");
  const sunIcon    = document.querySelector(".sun-icon");
  const searchInput = document.querySelector(".search-input");
  const suggestions = document.querySelector(".search-suggestions");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  const mobileGroupToggles = document.querySelectorAll(".mobile-group-toggle");

  /* ── Utilities ──────────────────────────────── */
  const throttle = (fn, ms) => {
    let last = 0;
    return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } };
  };
  const debounce = (fn, ms) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  /* ── 1. Theme ───────────────────────────────── */
  const THEME_KEY = "nav-theme";
  const applyTheme = (theme, save = true) => {
    html.setAttribute("data-theme", theme);
    if (save) try { localStorage.setItem(THEME_KEY, theme); } catch {}
    const dark = theme === "dark" ||
      (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
    moonIcon?.classList.toggle("hidden", dark);
    sunIcon?.classList.toggle("hidden", !dark);
    themeBtn?.setAttribute("aria-pressed", String(dark));
  };

  // Init from storage or html attribute
  let stored; try { stored = localStorage.getItem(THEME_KEY); } catch {}
  applyTheme(stored || html.getAttribute("data-theme") || "dark", false);

  themeBtn?.addEventListener("click", (e) => {
    const cur = html.getAttribute("data-theme") || "dark";
    applyTheme(e.shiftKey ? "auto" : cur === "dark" ? "light" : "dark");
  });

  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if ((localStorage.getItem(THEME_KEY) || "auto") === "auto") applyTheme("auto", false);
  });

  /* ── 2. Auto-hide header on scroll ──────────── */
  let lastY = scrollY;
  window.addEventListener("scroll", throttle(() => {
    const y = scrollY;
    const mobileOpen = navToggle?.getAttribute("aria-expanded") === "true";
    if (!mobileOpen) {
      header?.classList.toggle("hide", y > 80 && y - lastY > 4);
      if (y - lastY < -4) header?.classList.remove("hide");
    }
    header?.classList.toggle("scrolled", y > 10);
    lastY = y;
  }, 80), { passive: true });

  /* ── 3. Mobile menu ─────────────────────────── */
  const closeMobile = () => {
    navToggle?.setAttribute("aria-expanded", "false");
    mobileMenu?.classList.remove("open");
    mobileMenu?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    mobileGroupToggles.forEach(b => b.setAttribute("aria-expanded", "false"));
  };

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", open ? "false" : "true");
    mobileMenu?.classList.toggle("open", !open);
    mobileMenu?.setAttribute("aria-hidden", open ? "true" : "false");
    document.body.style.overflow = open ? "" : "hidden";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#header")) closeMobile();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobile();
      suggestions?.classList.add("hidden");
      dropdownToggles.forEach(b => b.setAttribute("aria-expanded", "false"));
    }
  });

  /* ── 4. Mobile accordion groups ─────────────── */
  mobileGroupToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      mobileGroupToggles.forEach(b => b !== btn && b.setAttribute("aria-expanded", "false"));
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  /* ── 5. Desktop dropdown (keyboard) ─────────── */
  dropdownToggles.forEach((btn) => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        btn.setAttribute("aria-expanded", "true");
        btn.nextElementSibling?.querySelector("a")?.focus();
      }
    });
  });

  // Arrow key nav inside dropdown
  document.querySelectorAll(".dropdown").forEach((menu) => {
    menu.addEventListener("keydown", (e) => {
      const items = Array.from(menu.querySelectorAll(".drop-item"));
      const idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      if (e.key === "ArrowUp")   { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
    });
  });

  /* ── 6. Search suggestions ───────────────────── */
  const PAGES = [
    { label: "Home",                   href: "#" },
    { label: "Portfolio",              href: "#" },
    { label: "About",                  href: "#" },
    { label: "Contact",                href: "#" },
    { label: "Products › New Arrivals",href: "#" },
    { label: "Products › Featured",    href: "#" },
    { label: "Products › Categories",  href: "#" },
    { label: "Products › Seasonal",    href: "#" },
    { label: "Services › Consulting",  href: "#" },
    { label: "Services › Development", href: "#" },
    { label: "Services › Support",     href: "#" },
    { label: "Services › Training",    href: "#" },
  ];

  let activeIdx = -1;

  const renderSuggestions = (items) => {
    if (!suggestions) return;
    suggestions.innerHTML = "";
    items.forEach((item, i) => {
      const li = document.createElement("li");
      li.textContent = item.label;
      li.setAttribute("role", "option");
      li.addEventListener("mousedown", (e) => { e.preventDefault(); pick(item, li); });
      suggestions.appendChild(li);
    });
    suggestions.classList.toggle("hidden", !items.length);
    activeIdx = -1;
  };

  const highlight = (idx) => {
    const items = suggestions?.querySelectorAll("li");
    items?.forEach((li, i) => li.classList.toggle("active", i === idx));
    activeIdx = idx;
  };

  const pick = (item) => {
    if (searchInput) searchInput.value = item.label;
    suggestions?.classList.add("hidden");
  };

  if (searchInput && suggestions) {
    searchInput.addEventListener("input", debounce(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { suggestions.classList.add("hidden"); return; }
      renderSuggestions(PAGES.filter(p => p.label.toLowerCase().includes(q)).slice(0, 6));
    }, 130));

    searchInput.addEventListener("blur", () =>
      setTimeout(() => suggestions.classList.add("hidden"), 120)
    );

    searchInput.addEventListener("keydown", (e) => {
      const items = Array.from(suggestions.querySelectorAll("li"));
      if (!items.length) return;
      if (e.key === "ArrowDown")  { e.preventDefault(); highlight((activeIdx + 1) % items.length); }
      if (e.key === "ArrowUp")    { e.preventDefault(); highlight((activeIdx - 1 + items.length) % items.length); }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        pick(PAGES.find(p => p.label === items[activeIdx].textContent));
      }
      if (e.key === "Escape") suggestions.classList.add("hidden");
    });
  }

  /* ── 7. Window resize: close mobile if > breakpoint ── */
  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth > 860) closeMobile();
  }, 150));
});