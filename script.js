"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const header   = document.getElementById("header");
  const hamBtn   = document.getElementById("ham-btn");
  const mobMenu  = document.getElementById("mob-menu");
  const themeBtn = document.getElementById("theme-btn");
  const moonI    = document.querySelector(".moon-icon");
  const sunI     = document.querySelector(".sun-icon");
  const sInput   = document.querySelector(".s-input");
  const sList    = document.querySelector(".s-list");
  const totop    = document.getElementById("totop");
  const yrEl     = document.getElementById("yr");
  const html     = document.documentElement;

  if (yrEl) yrEl.textContent = new Date().getFullYear();

  const throttle = (fn, ms) => { let t=0; return (...a)=>{ const n=Date.now(); if(n-t>=ms){t=n;fn(...a)} }; };
  const debounce = (fn, ms) => { let t; return (...a)=>{ clearTimeout(t);t=setTimeout(()=>fn(...a),ms) }; };

  const applyTheme = (theme, save=true) => {
    html.setAttribute("data-theme", theme);
    if (save) try { localStorage.setItem("nx-theme", theme); } catch {}
    const dark = theme === "dark" || (theme === "auto" && matchMedia("(prefers-color-scheme:dark)").matches);
    moonI?.classList.toggle("hidden", dark);
    sunI?.classList.toggle("hidden", !dark);
    themeBtn?.setAttribute("aria-pressed", String(dark));
  };
  let saved; try { saved = localStorage.getItem("nx-theme"); } catch {}
  applyTheme(saved || "dark", false);
  themeBtn?.addEventListener("click", e => {
    const cur = html.getAttribute("data-theme") || "dark";
    applyTheme(e.shiftKey ? "auto" : cur === "dark" ? "light" : "dark");
  });

  let lastY = 0;
  window.addEventListener("scroll", throttle(() => {
    const y = scrollY;
    const mOpen = hamBtn?.getAttribute("aria-expanded") === "true";
    if (!mOpen) {
      header?.classList.toggle("hide", y > 80 && y - lastY > 4);
      if (y - lastY < -4) header?.classList.remove("hide");
    }
    header?.classList.toggle("scrolled", y > 10);
    totop?.classList.toggle("show", y > 400);
    lastY = y;
  }, 80), { passive: true });

  totop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const closeMob = () => {
    hamBtn?.setAttribute("aria-expanded","false");
    mobMenu?.classList.remove("open");
    mobMenu?.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
    document.querySelectorAll(".mob-grp-btn").forEach(b => b.setAttribute("aria-expanded","false"));
  };
  hamBtn?.addEventListener("click", () => {
    const open = hamBtn.getAttribute("aria-expanded") === "true";
    hamBtn.setAttribute("aria-expanded", open ? "false" : "true");
    mobMenu?.classList.toggle("open", !open);
    mobMenu?.setAttribute("aria-hidden", open ? "true" : "false");
    document.body.style.overflow = open ? "" : "hidden";
  });
  mobMenu?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMob));
  document.addEventListener("click", e => { if (!e.target.closest("#header")) closeMob(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeMob(); sList?.classList.add("hidden"); }
  });

  document.querySelectorAll(".mob-grp-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".mob-grp-btn").forEach(b => b !== btn && b.setAttribute("aria-expanded","false"));
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
  });

  document.querySelectorAll(".dd-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".dd-toggle").forEach(b => {
        if (b !== btn) b.setAttribute("aria-expanded","false");
      });
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
    btn.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        btn.setAttribute("aria-expanded","true");
        btn.nextElementSibling?.querySelector("a")?.focus();
      }
      if (e.key === "Escape") btn.setAttribute("aria-expanded","false");
    });
  });
  document.addEventListener("click", e => {
    if (!e.target.closest(".has-dd")) {
      document.querySelectorAll(".dd-toggle").forEach(b => b.setAttribute("aria-expanded","false"));
    }
  });

  const PAGES = [
    "Home","Features","About","Contact",
    "Products › New Arrivals","Products › Featured","Products › Categories","Products › Seasonal",
    "Services › Consulting","Services › Development","Services › Support","Services › Training"
  ];
  let selIdx = -1;
  const renderList = items => {
    if (!sList) return;
    sList.innerHTML = "";
    items.forEach(label => {
      const li = document.createElement("li");
      li.textContent = label; li.setAttribute("role","option");
      li.addEventListener("mousedown", e => { e.preventDefault(); sInput.value = label; sList.classList.add("hidden"); });
      sList.appendChild(li);
    });
    sList.classList.toggle("hidden", !items.length);
    selIdx = -1;
  };
  const hlItem = idx => {
    sList?.querySelectorAll("li").forEach((li,i) => li.classList.toggle("sel", i===idx));
    selIdx = idx;
  };
  if (sInput && sList) {
    sInput.addEventListener("input", debounce(() => {
      const q = sInput.value.trim().toLowerCase();
      if (!q) { sList.classList.add("hidden"); return; }
      renderList(PAGES.filter(p => p.toLowerCase().includes(q)).slice(0,6));
    }, 130));
    sInput.addEventListener("blur", () => setTimeout(() => sList.classList.add("hidden"), 120));
    sInput.addEventListener("keydown", e => {
      const items = Array.from(sList.querySelectorAll("li"));
      if (!items.length) return;
      if (e.key==="ArrowDown"){e.preventDefault();hlItem((selIdx+1)%items.length)}
      if (e.key==="ArrowUp"){e.preventDefault();hlItem((selIdx-1+items.length)%items.length)}
      if (e.key==="Enter"&&selIdx>=0){e.preventDefault();sInput.value=items[selIdx].textContent;sList.classList.add("hidden")}
      if (e.key==="Escape") sList.classList.add("hidden");
    });
  }

  const statEls = document.querySelectorAll(".stat-num[data-count]");
  if ("IntersectionObserver" in window && statEls.length) {
    const seen = new WeakSet();
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (seen.has(el)) return; seen.add(el);
        const target = +el.dataset.count;
        const dur = 1400, start = performance.now();
        const tick = now => {
          const t = Math.min(1,(now-start)/dur);
          el.textContent = Math.floor(target*(1-Math.pow(1-t,3)));
          if (t<1) requestAnimationFrame(tick);
          else { el.textContent = target; io.unobserve(el); }
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    statEls.forEach(el => io.observe(el));
  }

  window.addEventListener("resize", debounce(() => { if (innerWidth > 860) closeMob(); }, 150));
});