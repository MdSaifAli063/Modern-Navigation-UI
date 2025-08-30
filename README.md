# 🧭 Modern Navigation UI

A responsive, accessible, and animated navigation layout with dropdowns, theme toggle, search suggestions, sticky auto-hide header, and smooth section scrolling. Designed for a futuristic look with glassmorphism and neon touches.

- Live feel: animated background layers (gradient, grid, blobs, noise)
- Semantic HTML with ARIA roles
- Desktop-first polish with scalable typography and spacing

---

## ✨ Features

- 🔽 Accessible dropdown menus (keyboard and ARIA friendly)
- 🌓 Light/Dark theme toggle (auto theme detection via data-theme="auto")
- 🔍 Search input with suggestions listbox
- 📌 Sticky header with auto-hide on scroll down/show on scroll up
- 🧭 Scroll spy highlights active section in nav
- 📈 Animated counters for stats
- ⬆️ Back-to-top button
- 🧊 Modern animated background layers
- 📱 Fully responsive: mobile → desktop

---

## 📁 Project Structure

. ├─ index.html # Main markup (navigation, sections, footer) ├─ style.css # Styling (themes, layout, animations) └─ script.js # Interactivity (dropdowns, spy, counters, theme, search)


---

## 🚀 Getting Started

1) Clone or download this repo  
2) Open index.html directly in a browser, or serve it locally:

- Using VS Code Live Server: Right-click index.html → “Open with Live Server”
- Using Node http-server:
  - npm i -g http-server
  - http-server -p 8080
  - Visit http://localhost:8080

No build step required.

---

## 🖥️ Desktop Polish

This project is tuned for a desktop website layout. To adjust container width, typography, and grid columns for large screens, tweak the desktop media queries in style.css.

Key variables to adjust:
- --container-max: overall content width
- font-size scale: --fs-md, --fs-lg, --fs-xl, etc.
- Grid columns: .features-grid, .cards, .stats-grid

Tip: For 4-column layouts on large screens:
- .features-grid { grid-template-columns: repeat(4, 1fr); }
- .cards { grid-template-columns: repeat(4, 1fr); }
- .stats-grid { grid-template-columns: repeat(4, 1fr); }

---

## ⚙️ Usage

- Navigation
  - Click “Products” or “Services” to open dropdowns
  - On mobile, the hamburger toggles the menu
- Theme
  - Click the theme toggle button to switch light/dark
  - data-theme="auto" enables automatic theme following user OS preference
- Search
  - Type in the search field; suggestions render in the listbox beneath
- Scroll
  - The header hides on scroll down and reappears on scroll up
  - Active section link is highlighted as you scroll
- Back to Top
  - The ↑ button appears after you scroll; click to jump to top

---

## ♿ Accessibility

- ARIA:
  - Primary nav uses role="menubar" and role="menuitem"
  - Dropdowns use aria-haspopup, aria-expanded, role="menu"
  - Search suggestions use role="listbox"
- Keyboard:
  - Tab/Shift+Tab to navigate focus
  - Enter/Space to open dropdowns
  - Escape to close open menus
- Color contrast and focus outlines preserved
- Semantic landmarks: header, nav, main, section, footer

---

## 🧩 Customization

- Colors, spacing, and typography are controlled via CSS custom properties in style.css
- Update the logo text in index.html: .logo
- Replace icons:
  - Theme toggle icons: .moon-icon and .sun-icon (inline SVG in index.html)
  - You can swap them with your SVGs while preserving the same class names
- Sections:
  - Add/remove features/cards simply by duplicating article blocks in their respective sections

---

## 🔧 Scripts Overview (script.js)

- Responsive menu toggle with aria-expanded state
- Dropdown open/close logic with click and keyboard support
- Scroll spy that adds .active to the currently viewed section link
- Auto-hide header based on scroll direction (data-auto-hide="true")
- Stat counters animate numbers into view
- Theme detection and toggle with persistence
- Back-to-top button visibility and smooth scroll
- Search suggestions list update and navigation

Note: If you extend behavior, keep ARIA attributes and focus management in sync.

---

## 🧪 Browser Support

- Latest Chrome, Firefox, Safari, and Edge
- Graceful fallbacks where color-mix and some newer CSS features aren’t supported

---

## 🖼️ Preview

You can add a screenshot or animation here:
- docs/preview.png ([recommended 1200×630 for social preview](https://github.com/MdSaifAli063/Modern-Navigation-UI/blob/2be33bbf764335b0d02b1bde8bd5893f758c8688/Screenshot%202025-08-31%20003550.png))

---

## 📄 License

MIT License – feel free to use, modify, and distribute.

---

## 🙌 Credits

- Icons: Inline SVG paths
- Inspiration: Modern glassmorphism + neon UI trends

If you ship this, consider replacing “LOGO” with your brand, customizing colors, and setting an Open Graph image for better link previews. Enjoy!
