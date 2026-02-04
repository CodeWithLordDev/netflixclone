# Netflix Clone — JavaScript Files Summary

Project root: d:\Sigma web\Project\Websites\Netflix_Clone\Frontend\my-app\src\app

## Files covered
- page.js
- components/TrendingNow.js
- components/Hero.js

---

## page.js
Path: src/app/page.js
- Next.js page component exporting default Home().
- Imports: Image (unused in this file), Navbar from "./components/Navabr" (note: import name/path typo), Hero, TrendingNow, FeatureSection (commented out).
- Renders a full-screen main container with:
  - Hero component
  - TrendingNow component
  - a bottom gradient overlay
- Some components (Navbar, FeatureSection) are commented out.

Notes:
- Minor issues: unused import (Image) and possible typo in Navbar import path.

---

## components/TrendingNow.js
Path: src/app/components/TrendingNow.js
- Client component (uses `"use client";`) — intended for browser-only interactions.
- React hooks used: useRef, useState, useEffect.
- Icons: react-icons (FaChevronLeft, FaChevronRight) and lucide-react (Plus, X, ChevronDown).
- Main responsibilities:
  - Horizontal scrollable "Trending Now" carousel with left/right arrow controls.
  - Tracks scroll position to toggle arrow visibility (canScrollLeft / canScrollRight).
  - Smooth scroll functions (scrollLeft / scrollRight).
  - Renders numbered poster cards (static `trending` array with image paths).
  - "More reasons to join" grid (static `reasons` array).
  - FAQ accordion driven by `faqData` with controlled open index (openIndex).
  - Footer-like section with email input, links, language dropdown and disclaimers.
- Data:
  - Arrays embed static content and local asset paths under /Assets/...
- Behavior notes:
  - Adds/removes scroll event listener on mount/unmount.
  - Uses tailwind classes and some conditional classes for accordion transitions.

---

## components/Hero.js
Path: src/app/components/Hero.js
- Client component (uses `"use client";`) and imports Next/Image.
- Full-screen hero section with:
  - Background image via next/image (src: /Assets/Images/bg.png) and an overlay.
  - Top navbar inside header with a custom SVG logo, language select, and "Sign In" button.
  - Main hero text, subscription pitch and email CTA (input + "Get Started" button).
  - Visual effects: top blur, dark overlay, bottom fade gradient.
- Styling: Tailwind utilities, responsive font sizes, focus rings, and transitions.

---

## Assets referenced
- /Assets/Trending_images/* (multiple poster PNGs)
- /Assets/Images/bg.png

---

## Quick recommendations / TODOs
- Fix Navbar import path (Navabr -> Navbar) or confirm filename.
- Remove unused imports (e.g., Image in page.js) to clean console warnings.
- Consider extracting repeated UI pieces (footer links, email CTA) to components.
- Replace hardcoded arrays with external data source or props for scalability.
- Add alt attributes to img tags (TrendingNow uses <img src=...> without alt).

---