---
name: modern-frontend-engineering
description: Comprehensive open-source guide and standard for crafting world-class, human-designed web applications using Next.js, React, Tailwind CSS, and Shadcn/Radix design principles. Eliminates generic AI aesthetic cliches.
---

# Modern Frontend Engineering Standard

This skill codifies the design principles, architectural patterns, and execution standards required to build modern, production-grade web applications that feel distinctly human-crafted, responsive, accessible, and elegant.

---

## 1. Core Anti-Patterns to Eliminate ("Zero AI Slop")

Avoid these common AI-generated frontend mistakes:
1. **Garish Neon/Cyberpunk Palettes**: Do not use pitch-black backgrounds (`#06090f` or `#000000`) covered in saturated neon cyan, magenta, or lime green glows.
2. **Cramped "Terminal-in-a-Box" Clutter**: Do not squash 30+ items into tiny 300px unpadded scrollboxes with misaligned monospace fonts.
3. **Gratuitous Gradients**: Do not slap loud gradient borders or backgrounds on every single card. Use neutral, subtle borders (`border-zinc-200 dark:border-zinc-800`).
4. **Cards-of-Cards Nesting**: Avoid 4-deep nested card containers that rob the screen of breathing room.
5. **Fake Gimmicks**: Replace fake animated progress bars or mock terminal windows with genuine, interactive, functional components (real search, real sort, real sliders, live API calls).

---

## 2. Color Palette & Theming (Neutral Slate & Zinc Foundations)

- **Dark Mode Palette**:
  - Background Canvas: `bg-zinc-950` (`#09090b`) or `bg-slate-950` (`#020617`).
  - Card & Surface: `bg-zinc-900/60` or `bg-zinc-900` with `backdrop-blur-md`.
  - Borders: `border-zinc-800` or `border-zinc-800/80` (1px crisp hairline).
  - Hover States: `hover:bg-zinc-800/50` or `hover:border-zinc-700`.
- **Light Mode Palette**:
  - Background Canvas: `bg-zinc-50` (`#fafafa`) or `bg-slate-50` (`#f8fafc`).
  - Card & Surface: `bg-white` with subtle elevation `shadow-sm`.
  - Borders: `border-zinc-200` (`#e4e4e7`).
  - Hover States: `hover:bg-zinc-100/80`.
- **Purposeful Semantic Accents**:
  - **Emerald / Green**: Success, optimal soil health, recovery (`text-emerald-500`, `bg-emerald-500/10`).
  - **Amber / Orange**: Moderate risk, caution, attention (`text-amber-500`, `bg-amber-500/10`).
  - **Rose / Red**: Critical deficit, urgent tier-1 intervention (`text-rose-500`, `bg-rose-500/10`).
  - **Indigo / Sky**: Primary action, satellite observation, telemetry (`bg-indigo-600 hover:bg-indigo-500`, `text-sky-400`).

---

## 3. Typography & Hierarchy

- **Font Families**:
  - Body & UI: `Inter`, `Geist`, or clean `system-ui` sans-serif.
  - Metrics & Numbers: Tabular numbers `tabular-nums` with `font-medium` or `font-semibold`.
  - Code & Latency: Monospace (`JetBrains Mono`, `font-mono`) reserved strictly for technical data, coordinates, and code snippets.
- **Hierarchy Rules**:
  - Eyebrows: `text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400`.
  - Primary Titles: `text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100`.
  - Metric Values: `text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums`.
  - Body / Subtext: `text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed`.

---

## 4. Spacing & Layout Architecture

- **Page Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8`.
- **Bento Metric Grid**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`.
- **Card Padding**: Never less than `p-5` or `p-6` on desktop.
- **Master-Detail Layout**:
  - Left pane: Clean, filterable list or table with clear rows and generous row heights (`py-3.5`).
  - Right pane or Slide-Over: Rich inspection panel with visual charts, tabs, and clear action buttons.

---

## 5. Interactive Components & Micro-Interactions

- **Filter Pills**:
  - Active: `bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm`.
  - Inactive: `text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800`.
- **Input Fields**:
  - `h-10 px-3.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition`.
- **Action Buttons**:
  - Primary: `inline-flex items-center justify-center font-medium text-sm rounded-lg px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition active:scale-[0.98]`.
  - Secondary: `inline-flex items-center justify-center font-medium text-sm rounded-lg px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 transition`.

---

## 6. Verification Checklist

Before considering a frontend task complete:
- [ ] No hardcoded glowing neon cyan or arbitrary high-saturation hex codes.
- [ ] Generous padding and breathing room on all cards (`p-5` minimum).
- [ ] Data tables and lists have clean search, filter, and pagination or smooth scrolling.
- [ ] Sliders and controls dynamically update visualizations without lag.
- [ ] Zero TypeScript compilation errors (`npm run build`).
- [ ] Both light and dark palettes are legible and balanced.
