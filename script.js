"use strict";

/**
 * Modern Navigation + Page UI Script
 * - Mobile menu toggle (with focus/escape handling)
 * - Accessible dropdowns (mobile) + keyboard support
 * - Theme toggle with persistence (light/dark; Shift+Click for auto)
 * - Sticky auto-hide header on scroll
 * - Back-to-top button
 * - Search suggestions with keyboard navigation
 * - Count-up stats on view
 * - Card hover glow following cursor
 * - Scroll spy to highlight active nav link
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

  const MOBILE_BREAKPOINT = 800; // should match CSS @media
  let isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

  // Utilities
  const prefersReduced = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const throttle = (fn, wait = 100) => {
    let last = 0;
    let t;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn(...args);
      } else {
        clearTimeout(t);
        t = setTimeout(() => {
          last = Date.now();
          fn(...args);
        }, wait - (now - last));
      }
    };
  };

  const debounce = (fn, wait = 200) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  const smoothScrollTo = (targetTop) => {
    window.scrollTo({
      top: targetTop,
      behavior: prefersReduced() ? "auto" : "smooth",
    });
  };

  // 1) Footer year
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2) Theme toggle with persistence
  const THEME_KEY = "preferred-theme"; // 'light' | 'dark' | 'auto'
  const validTheme = (t) => t === "light" || t === "dark" || t === "auto";

  function applyTheme(theme, persist = true) {
    if (!validTheme(theme)) theme = "auto";
    html.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {}
    }
    // Update button visuals (moon icon implies you can switch to dark)
    const effectiveDark =
      theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // If currently dark, show sun icon (to switch to light). If light, show moon.
    if (moonIcon && sunIcon) {
      if (effectiveDark) {
        sunIcon.classList.remove("hidden");
        moonIcon.classList.add("hidden");
        themeToggleBtn?.setAttribute("aria-pressed", "true");
      } else {
        sunIcon.classList.add("hidden");
        moonIcon.classList.remove("hidden");
        themeToggleBtn?.setAttribute("aria-pressed", "false");
      }
    }
  }

  function initTheme() {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {}
    const initial = validTheme(stored) ? stored : html.getAttribute("data-theme") || "auto";
    applyTheme(initial, false);
  }

  initTheme();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", (e) => {
      const current = html.getAttribute("data-theme") || "auto";
      // Normal click: toggle between light and dark
      // Shift+Click: set to auto (follow system)
      if (e.shiftKey) {
        applyTheme("auto");
        return;
      }
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }

  // Also react to system theme changes when in auto
  const colorSchemeMQ = window.matchMedia("(prefers-color-scheme: dark)");
  colorSchemeMQ.addEventListener?.("change", () => {
    if ((localStorage.getItem(THEME_KEY) || "auto") === "auto") {
      applyTheme("auto", false);
    }
  });

  // 3) Mobile menu toggle + close on outside/escape
  const closeMobileMenu = () => {
    if (!navToggle) return;
    if (navToggle.getAttribute("aria-expanded") === "true") {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu?.classList.remove("open");
      document.body.style.removeProperty("overflow");
      // collapse all mobile dropdowns
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      if (!expanded) {
        // opening
        navMenu?.classList.add("open");
        document.body.style.overflow = "hidden";
      } else {
        // closing
        navMenu?.classList.remove("open");
        document.body.style.removeProperty("overflow");
        dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      }
    });
  }

  // Close mobile menu on link click
  navLinks.forEach((a) =>
    a.addEventListener("click", () => {
      if (isMobile) closeMobileMenu();
    })
  );

  // Click outside to close mobile menu or dropdowns
  document.addEventListener("click", (e) => {
    const target = e.target;
    const clickedInsideNav = target.closest?.(".navbar");
    if (!clickedInsideNav) {
      // Outside nav
      closeMobileMenu();
    }
  });

  // Escape closes mobile menu or open dropdowns
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
      // close any dropdowns (mobile)
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      suggestionsList?.classList.add("hidden");
    }
  });

  // 4) Accessible dropdowns (mobile)
  function initDropdowns() {
    dropdownToggles.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Only toggle on mobile; desktop uses hover CSS
        if (!isMobile) return;
        const expanded = btn.getAttribute("aria-expanded") === "true";
        // close others first
        dropdownToggles.forEach((b) => {
          if (b !== btn) b.setAttribute("aria-expanded", "false");
        });
        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      });

      // Keyboard open/close
      btn.addEventListener("keydown", (e) => {
        if (!isMobile) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          btn.click();
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          btn.setAttribute("aria-expanded", "true");
          // focus first item
          const menu = btn.nextElementSibling;
          const firstItem = menu?.querySelector?.("a, button, [tabindex]:not([tabindex='-1'])");
          firstItem?.focus?.();
        }
      });
    });
  }

  initDropdowns();

  // 5) Sticky auto-hide header on scroll
  if (header && header.dataset.autoHide === "true") {
    let lastY = window.scrollY || 0;
    let locked = false; // don't hide when mobile menu is open

    const onScroll = throttle(() => {
      const y = window.scrollY || 0;
      const delta = y - lastY;

      // Lock when mobile menu open
      locked = navToggle && navToggle.getAttribute("aria-expanded") === "true";

      if (!locked) {
        if (y > 120 && delta > 5) {
          header.classList.add("is-hidden");
        } else if (delta < -5) {
          header.classList.remove("is-hidden");
        }
      }
      lastY = y;
      // Toggle back-to-top
      if (toTopBtn) {
        if (y > 300) {
          toTopBtn.hidden = false;
          toTopBtn.style.opacity = "1";
        } else {
          toTopBtn.style.opacity = "0.9";
          toTopBtn.hidden = true;
        }
      }
    }, 100);

    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // 6) Back-to-top behavior
  if (toTopBtn) {
    toTopBtn.addEventListener("click", () => smoothScrollTo(0));
  }

  // 7) Smooth scroll for in-page links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id && id.startsWith("#")) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 80; // offset for sticky header
          smoothScrollTo(top);
          history.replaceState(null, "", id);
        }
      }
    });
  });

  // 8) Search suggestions
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

  let activeIndex = -1; // keyboard selection index

  function renderSuggestions(items) {
    if (!suggestionsList) return;
    suggestionsList.innerHTML = "";
    items.forEach((item, idx) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = `suggestion-${idx}`;
      li.textContent = item.label;
      li.dataset.href = item.href;
      li.addEventListener("mousedown", (e) => {
        // mousedown so it triggers before input blur
        e.preventDefault();
        selectSuggestion(li);
      });
      suggestionsList.appendChild(li);
    });
    suggestionsList.classList.toggle("hidden", items.length === 0);
    suggestionsList.scrollTop = 0;
    activeIndex = items.length ? 0 : -1;
    highlightActive(items.length ? 0 : -1);
  }

  function highlightActive(index) {
    if (!suggestionsList) return;
    Array.from(suggestionsList.children).forEach((child, i) => {
      child.style.background = i === index ? "var(--surface-2)" : "transparent";
    });
    activeIndex = index;
    if (searchInput && index >= 0) {
      const activeEl = suggestionsList.children[index];
      activeEl && activeEl.scrollIntoView({ block: "nearest" });
      searchInput.setAttribute("aria-activedescendant", activeEl.id);
    } else if (searchInput) {
      searchInput.removeAttribute("aria-activedescendant");
    }
  }

  function selectSuggestion(liEl) {
    const href = liEl.dataset.href;
    const label = liEl.textContent;
    if (searchInput) searchInput.value = label;
    suggestionsList?.classList.add("hidden");
    if (href && href.startsWith("#")) {
      const target = document.querySelector(href);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        smoothScrollTo(top);
        history.replaceState(null, "", href);
      }
    }
  }

  if (searchInput && suggestionsList) {
    const updateSuggestions = debounce(() => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        suggestionsList.classList.add("hidden");
        suggestionsList.innerHTML = "";
        return;
      }
      const items = SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 8);
      renderSuggestions(items);
    }, 120);

    searchInput.addEventListener("input", updateSuggestions);
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim()) updateSuggestions();
    });
    searchInput.addEventListener("blur", () => {
      // Slight delay so click on item registers
      setTimeout(() => suggestionsList.classList.add("hidden"), 80);
    });

    searchInput.addEventListener("keydown", (e) => {
      const items = Array.from(suggestionsList.children);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!items.length) return;
        highlightActive((activeIndex + 1) % items.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        highlightActive((activeIndex - 1 + items.length) % items.length);
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && items[activeIndex]) {
          e.preventDefault();
          selectSuggestion(items[activeIndex]);
        }
      } else if (e.key === "Escape") {
        suggestionsList.classList.add("hidden");
      }
    });
  }

  // 9) Count-up stats on view
  if ("IntersectionObserver" in window && statValues.length) {
    const seen = new WeakSet();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (seen.has(el)) return;
            seen.add(el);
            const target = parseFloat(el.getAttribute("data-count") || "0");
            const duration = 1200; // ms
            const start = prefersReduced() ? duration : performance.now();
            const from = 0;

            if (prefersReduced()) {
              el.textContent = String(target);
              io.unobserve(el);
              return;
            }

            const step = (now) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
              const val = Math.floor(from + (target - from) * eased);
              el.textContent = String(val);
              if (t < 1) {
                requestAnimationFrame(step);
              } else {
                el.textContent = String(target);
                io.unobserve(el);
              }
            };
            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.5 }
    );
    statValues.forEach((el) => io.observe(el));
  }

  // 10) Card hover glow following cursor
  const onCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  };
  const onCardLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty("--mx", `50%`);
    card.style.setProperty("--my", `50%`);
  };
  cards.forEach((card) => {
    card.addEventListener("mousemove", onCardMouseMove);
    card.addEventListener("mouseleave", onCardLeave);
  });

  // 11) Scroll spy: highlight active nav link when section is in view
  const sections = Array.from(document.querySelectorAll("[data-spy][id]"));
  if ("IntersectionObserver" in window && sections.length) {
    const mapIdToLink = new Map();
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        mapIdToLink.set(href.slice(1), a);
      }
    });

    let currentId = null;
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentId = entry.target.id;
          }
        });
        if (currentId) {
          // update active classes
          navLinks.forEach((a) => a.classList.remove("active"));
          const activeLink = mapIdToLink.get(currentId);
          activeLink?.classList.add("active");
        }
      },
      {
        root: null,
        threshold: 0.4,
        rootMargin: "-20% 0px -40% 0px",
      }
    );
    sections.forEach((sec) => spyObserver.observe(sec));
  }

  // 12) Resize handler to update mobile/desktop behavior
  const onResize = () => {
    const m = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
    if (m !== isMobile) {
      isMobile = m;
      // Close menus when transitioning between modes
      closeMobileMenu();
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  };
  window.addEventListener("resize", debounce(onResize, 150));

  // 13) Keyboard navigation between top-level nav items (basic)
  const topLevelItems = Array.from(document.querySelectorAll(".nav-list > .nav-item > .nav-link, .nav-list > .nav-item > .dropdown-toggle"));
  topLevelItems.forEach((el, idx) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = topLevelItems[(idx + 1) % topLevelItems.length];
        next.focus();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = topLevelItems[(idx - 1 + topLevelItems.length) % topLevelItems.length];
        prev.focus();
      } else if (e.key === "ArrowDown") {
        // Open dropdown on desktop and focus first item
        const parent = el.closest(".has-dropdown");
        if (parent) {
          const toggle = parent.querySelector(".dropdown-toggle");
          const menu = parent.querySelector(".dropdown");
          if (!isMobile && toggle && menu) {
            e.preventDefault();
            toggle.setAttribute("aria-expanded", "true");
            const first = menu.querySelector("a, button, [tabindex]:not([tabindex='-1'])");
            first?.focus?.();
          }
        }
      }
    });
  });

  // Close dropdown when clicking outside of it (mobile only)
  document.addEventListener("click", (e) => {
    if (!isMobile) return;
    const target = e.target;
    const isToggle = target.closest?.(".dropdown-toggle");
    const isDropdown = target.closest?.(".dropdown");
    if (!isToggle && !isDropdown) {
      dropdownToggles.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  });
});