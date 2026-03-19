"use strict";

/**
 * Modern Navigation + Page UI Script
 * - Mobile menu toggle (with focus/escape handling)
 * - Accessible dropdowns (mobile) + keyboard support
 * - Theme toggle with persistence (light/dark; Shift+Click for auto)
 * - Sticky auto-hide header on scroll + scrolled class
 * - Back-to-top button
 * - Search suggestions with keyboard navigation
 * - Count-up stats on view
 * - Card hover glow following cursor
 * - Scroll spy to highlight active nav link
 * - Scroll reveal animation
 * - Footer year
 */

document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const header = document.querySelector(".header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = Array.from(document.querySelectorAll(".nav-link[href^='#']"));
  const dropdownToggles = Array.from(document.querySelectorAll(".has-dropdown > .dropdown-toggle"));
  const themeToggleBtn = document.querySelector(".theme-toggle");
  const moonIcon = document.querySelector(".moon-icon");
  const sunIcon = document.querySelector(".sun-icon");
  const toTopBtn = document.querySelector(".to-top");
  const yearEl = document.getElementById("year");
  const searchInput = document.querySelector(".search-input");
  const suggestionsList = document.querySelector(".search-suggestions");
  const cards = Array.from(document.querySelectorAll(".cards .card"));
  const statValues = Array.from(document.querySelectorAll(".stat .value"));

  const MOBILE_BREAKPOINT = 800;
  let isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

  /* ── Utilities ─────────────────────────────────────── */
  const prefersReduced = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const throttle = (fn, wait = 100) => {
    let last = 0, t;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) { last = now; fn(...args); }
      else {
        clearTimeout(t);
        t = setTimeout(() => { last = Date.now(); fn(...args); }, wait - (now - last));
      }
    };
  };

  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  const smoothScrollTo = (top) =>
    window.scrollTo({ top, behavior: prefersReduced() ? "auto" : "smooth" });

  /* ── 1) Footer year ────────────────────────────────── */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── 2) Theme ──────────────────────────────────────── */
  const THEME_KEY = "preferred-theme";
  const validTheme = (t) => ["light", "dark", "auto"].includes(t);

  function applyTheme(theme, persist = true) {
    if (!validTheme(theme)) theme = "auto";
    html.setAttribute("data-theme", theme);
    if (persist) try { localStorage.setItem(THEME_KEY, theme); } catch {}

    const effectiveDark =
      theme === "dark" ||
      (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (moonIcon && sunIcon) {
      moonIcon.classList.toggle("hidden", effectiveDark);
      sunIcon.classList.toggle("hidden", !effectiveDark);
      themeToggleBtn?.setAttribute("aria-pressed", String(effectiveDark));
    }
  }

  function initTheme() {
    let stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch {}
    applyTheme(validTheme(stored) ? stored : html.getAttribute("data-theme") || "auto", false);
  }

  initTheme();

  themeToggleBtn?.addEventListener("click", (e) => {
    const current = html.getAttribute("data-theme") || "auto";
    applyTheme(e.shiftKey ? "auto" : current === "dark" ? "light" : "dark");
  });

  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if ((localStorage.getItem(THEME_KEY) || "auto") === "auto") applyTheme("auto", false);
  });

  /* ── 3) Mobile menu ────────────────────────────────── */
  const closeMobileMenu = () => {
    if (!navToggle || navToggle.getAttribute("aria-expanded") !== "true") return;
    navToggle.setAttribute("aria-expanded", "false");
    navMenu?.classList.remove("open");
    document.body.style.removeProperty("overflow");
    dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  };

  navToggle?.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    navMenu?.classList.toggle("open", !expanded);
    document.body.style.overflow = expanded ? "" : "hidden";
    if (expanded) dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  });

  navLinks.forEach((a) => a.addEventListener("click", () => { if (isMobile) closeMobileMenu(); }));

  document.addEventListener("click", (e) => {
    if (!e.target.closest?.(".navbar")) closeMobileMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      suggestionsList?.classList.add("hidden");
    }
  });

  /* ── 4) Dropdowns (mobile) ─────────────────────────── */
  dropdownToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!isMobile) return;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      dropdownToggles.forEach((b) => b !== btn && b.setAttribute("aria-expanded", "false"));
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    });

    btn.addEventListener("keydown", (e) => {
      if (!isMobile) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        btn.setAttribute("aria-expanded", "true");
        const first = btn.nextElementSibling?.querySelector?.("a, button");
        first?.focus?.();
      }
    });
  });

  /* ── 5) Auto-hide header on scroll ─────────────────── */
  if (header?.dataset.autoHide === "true") {
    let lastY = window.scrollY || 0;

    const onScroll = throttle(() => {
      const y = window.scrollY || 0;
      const delta = y - lastY;
      const mobileOpen = navToggle?.getAttribute("aria-expanded") === "true";

      if (!mobileOpen) {
        if (y > 120 && delta > 5) header.classList.add("is-hidden");
        else if (delta < -5) header.classList.remove("is-hidden");
      }

      header.classList.toggle("scrolled", y > 40);
      lastY = y;

      // Back-to-top
      if (toTopBtn) {
        toTopBtn.classList.toggle("visible", y > 300);
        toTopBtn.hidden = false; // keep in DOM, we use opacity/pointer-events
      }
    }, 80);

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ── 6) Back to top ────────────────────────────────── */
  if (toTopBtn) {
    toTopBtn.hidden = false; // manage visibility via CSS class
    toTopBtn.addEventListener("click", () => smoothScrollTo(0));
  }

  /* ── 7) Smooth scroll for nav links ────────────────── */
  document.querySelectorAll("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        smoothScrollTo(top);
        history.replaceState(null, "", id);
      }
    });
  });

  /* ── 8) Search suggestions ─────────────────────────── */
  const SUGGESTIONS = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Products: New Arrivals", href: "#new" },
    { label: "Products: Featured", href: "#featured" },
    { label: "Products: Categories", href: "#categories" },
    { label: "Products: Seasonal", href: "#seasonal" },
    { label: "Services: Consulting", href: "#consulting" },
    { label: "Services: Development", href: "#development" },
    { label: "Services: Support", href: "#support" },
    { label: "Services: Training", href: "#training" },
  ];

  let activeIndex = -1;

  function renderSuggestions(items) {
    if (!suggestionsList) return;
    suggestionsList.innerHTML = "";
    items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = `suggestion-${idx}`;
      li.textContent = item.label;
      li.dataset.href = item.href;
      li.addEventListener("mousedown", (e) => { e.preventDefault(); selectSuggestion(li); });
      suggestionsList.appendChild(li);
    });
    suggestionsList.classList.toggle("hidden", items.length === 0);
    suggestionsList.scrollTop = 0;
    activeIndex = -1;
  }

  function highlightActive(index) {
    if (!suggestionsList) return;
    const children = Array.from(suggestionsList.children);
    children.forEach((child, i) => {
      child.style.background = i === index ? "var(--surface-2)" : "";
      child.style.color = i === index ? "var(--text)" : "";
    });
    activeIndex = index;
    if (searchInput && index >= 0) {
      children[index]?.scrollIntoView({ block: "nearest" });
      searchInput.setAttribute("aria-activedescendant", `suggestion-${index}`);
    } else {
      searchInput?.removeAttribute("aria-activedescendant");
    }
  }

  function selectSuggestion(liEl) {
    const href = liEl.dataset.href;
    if (searchInput) searchInput.value = liEl.textContent;
    suggestionsList?.classList.add("hidden");
    const target = href && document.querySelector(href);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      smoothScrollTo(top);
      history.replaceState(null, "", href);
    }
  }

  if (searchInput && suggestionsList) {
    const updateSuggestions = debounce(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) { suggestionsList.classList.add("hidden"); return; }
      renderSuggestions(SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 7));
    }, 120);

    searchInput.addEventListener("input", updateSuggestions);
    searchInput.addEventListener("focus", () => { if (searchInput.value.trim()) updateSuggestions(); });
    searchInput.addEventListener("blur", () => setTimeout(() => suggestionsList.classList.add("hidden"), 100));
    searchInput.addEventListener("keydown", (e) => {
      const items = Array.from(suggestionsList.children);
      if (!items.length && e.key !== "Escape") return;
      if (e.key === "ArrowDown") { e.preventDefault(); highlightActive((activeIndex + 1) % items.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); highlightActive((activeIndex - 1 + items.length) % items.length); }
      else if (e.key === "Enter" && activeIndex >= 0) { e.preventDefault(); selectSuggestion(items[activeIndex]); }
      else if (e.key === "Escape") suggestionsList.classList.add("hidden");
    });
  }

  /* ── 9) Count-up stats on view ─────────────────────── */
  if ("IntersectionObserver" in window && statValues.length) {
    const seen = new WeakSet();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (seen.has(el)) return;
        seen.add(el);
        const target = parseFloat(el.getAttribute("data-count") || "0");

        if (prefersReduced()) { el.textContent = String(target); io.unobserve(el); return; }

        const duration = 1300;
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.floor(target * eased));
          if (t < 1) requestAnimationFrame(step);
          else { el.textContent = String(target); io.unobserve(el); }
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    statValues.forEach((el) => io.observe(el));
  }

  /* ── 10) Card hover glow ────────────────────────────── */
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  });

  /* ── 11) Scroll spy ─────────────────────────────────── */
  const sections = Array.from(document.querySelectorAll("[data-spy][id]"));
  if ("IntersectionObserver" in window && sections.length) {
    const mapIdToLink = new Map();
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      if (href?.startsWith("#")) mapIdToLink.set(href.slice(1), a);
    });

    let currentId = null;
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) currentId = entry.target.id; });
      if (currentId) {
        navLinks.forEach((a) => a.classList.remove("active"));
        mapIdToLink.get(currentId)?.classList.add("active");
      }
    }, { threshold: 0.35, rootMargin: "-15% 0px -45% 0px" });
    sections.forEach((sec) => spyObserver.observe(sec));
  }

  /* ── 12) Scroll reveal ──────────────────────────────── */
  if ("IntersectionObserver" in window) {
    // Add reveal class to grid items
    document.querySelectorAll(".feature, .stat, .card").forEach((el) => el.classList.add("reveal"));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("in-view"); });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  }

  /* ── 13) Resize handler ─────────────────────────────── */
  window.addEventListener("resize", debounce(() => {
    const m = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    if (m !== isMobile) {
      isMobile = m;
      closeMobileMenu();
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  }, 150));

  /* ── 14) Keyboard nav for top-level items ───────────── */
  const topLevelItems = Array.from(document.querySelectorAll(
    ".nav-list > .nav-item > .nav-link, .nav-list > .nav-item > .dropdown-toggle"
  ));
  topLevelItems.forEach((el, idx) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        topLevelItems[(idx + 1) % topLevelItems.length].focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        topLevelItems[(idx - 1 + topLevelItems.length) % topLevelItems.length].focus();
      } else if (e.key === "ArrowDown") {
        const parent = el.closest(".has-dropdown");
        if (parent && !isMobile) {
          e.preventDefault();
          const toggle = parent.querySelector(".dropdown-toggle");
          toggle?.setAttribute("aria-expanded", "true");
          const first = parent.querySelector(".dropdown a, .dropdown button");
          first?.focus?.();
        }
      }
    });
  });

  /* ── 15) Close dropdown on outside click (mobile) ──── */
  document.addEventListener("click", (e) => {
    if (!isMobile) return;
    if (!e.target.closest?.(".dropdown-toggle") && !e.target.closest?.(".dropdown")) {
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  });
});