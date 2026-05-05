# Fueld — Asset Usage Guide

A per-screen, per-component map of where every asset belongs. Read this alongside the redesign prompt.

---

## Global

### Tokens
- Import `tokens/colors.css` and `tokens/typography.css` once at the root of your CSS.
- The JSON variant (`tokens/colors.json`) is for design-tool sync (Figma Tokens, Tailwind theme extend, etc).

### Brand
- App icon (iOS): `brand/app-icon-1024.svg` → export PNG.
- App icon (Android adaptive): `brand/app-icon-foreground.svg` + `brand/app-icon-background.svg` + `brand/app-icon-monochrome.svg`.
- Web favicon: `marks/favicon-32.svg` and `marks/favicon-180.svg` (Apple touch).
- In-app top-left header: `brand/logo-header.svg` (compact lockup).
- Splash screen: `marks/splash-1170x2532.svg` (export per-resolution).
- Social share / OG: `marks/og-image-1200x630.svg` (export to PNG, 1200×630).

### Loading
- Initial app load + heavy ops: `marks/loading.svg` (Bolt-F pulses).
- Pull-to-refresh: `marks/refresh-indicator.svg` (rotating lime square — replaces stock spinners everywhere).

### Tab bar (every screen)
| Tab    | Asset |
|--------|-------|
| Today  | `icons/nav/today.svg` |
| Log    | `icons/nav/log.svg` |
| Meals  | `icons/nav/meals.svg` |
| Body   | `icons/nav/body.svg` |
| Stats  | `icons/nav/stats.svg` |

Active state: set `color: var(--accent)`. Inactive: `color: var(--text-low)`.

### Universal FAB
The floating "+" button on Today and Meals uses **`icons/action/plus.svg`** in `color: var(--accent-ink)` on a lime circle.

---

## TODAY screen

| Slot | Asset |
|------|-------|
| Top-left brand | `brand/logo-header.svg` |
| Settings cog (top-right) | `icons/action/settings.svg` (`--text-mid`) |
| Date selector | `icons/action/calendar.svg` (optional, when expanding the week strip) |
| Calorie hero ring background | (drawn in code; no asset — uses SVG arcs) |
| Streak tile icon | `icons/domain/streak.svg` (lime when active) |
| Water tile icon | `icons/domain/water.svg` (`--text-mid`) |
| Steps tile icon | `icons/domain/footprint.svg` (`--text-mid`) |
| Log row · macro tile (left of name) | `placeholders/food-tile.svg` until real food imagery exists |
| Log row · more menu | `icons/action/more.svg` |
| Swipe-reveal · delete | `icons/action/trash.svg` (in `--danger` on red slide) |
| Swipe-reveal · edit | `icons/action/edit.svg` |
| Empty-state hero (no logs yet) | `illustrations/empty-log.svg` (200×200, centered) |
| Empty-state CTA arrow | `icons/action/plus.svg` |
| Streak hit (full-screen celebration on goal met) | `illustrations/streak-hit.svg` |

---

## LOG screen

| Slot | Asset |
|------|-------|
| Search input · left icon | `icons/action/search.svg` (`--text-mid`) |
| Search input · barcode button (right side) | `icons/action/barcode.svg` |
| Filter chip strip · filter glyph (optional, leftmost chip) | `icons/action/filter.svg` |
| Food row · left tile | `placeholders/food-tile.svg` (replace with photo when available) |
| Food row · macro inline dots | `icons/macro/protein.svg` · `icons/macro/carbs.svg` · `icons/macro/fat.svg` |
| Food row · kcal dot (optional, on the kcal label) | `icons/macro/kcal.svg` |
| Food row · quick-add button | `icons/action/plus.svg` (lime circle, ink glyph) |
| Bottom-sheet drag handle | (CSS pill, no asset) |
| Empty search state | `illustrations/empty-log.svg` |

---

## MEALS screen

| Slot | Asset |
|------|-------|
| Empty state illustration | `illustrations/empty-meals.svg` (200×200, centered) |
| Empty state CTA | "Create meal" pill, `icons/action/plus.svg` glyph |
| Meal row · left composite tile | `placeholders/meal-tile.svg` (4-up grid until real ingredients render) |
| Meal row · log-this-meal button | `icons/action/plus.svg` |
| Food Items tab · row layout | same as LOG screen rows |
| Tab indicator | (CSS underline, no asset) |

---

## BODY screen

| Slot | Asset |
|------|-------|
| Background blueprint grid (behind figure) | `decor/body-grid.svg` (tile / repeat) |
| Figure illustration | (drawn in code from outline strokes — see redesign prompt §4) |
| Empty figure fallback | `illustrations/empty-body.svg` |
| Callout dots | (CSS lime circles, no asset) |
| Body fat info button | `icons/action/info.svg` |
| Measurement cell · trend up | `icons/action/chevron-down.svg` rotated 180° (or use a custom 8px arrow inline) |
| Log measurements CTA glyph | `icons/action/plus.svg` |
| Weight tab · scale glyph (header) | `icons/domain/scale.svg` (`--text-mid`) |
| Weight tab · chart line | (drawn in code) |
| Edit weight entry | `icons/action/edit.svg` |
| Delete weight entry | `icons/action/trash.svg` |

---

## STATS screen

| Slot | Asset |
|------|-------|
| Range selector caret | `icons/action/chevron-down.svg` |
| Activity ring strip · day rings | (drawn in code) |
| Macro Split empty state · striped fill | `decor/diagonal-stripe.svg` (background pattern of the placeholder bar) |
| Calorie Trend empty state | `illustrations/empty-stats.svg` |
| Personal Records · trophy glyph | `icons/domain/trophy.svg` (lime, replaces the 🏆 emoji) |
| PR row · streak | `icons/domain/streak.svg` |
| PR row · best lift (future) | `icons/domain/dumbbell.svg` |
| PR row · heart-rate (future) | `icons/domain/heart.svg` |
| Refresh action | `icons/action/refresh.svg` |

---

## Modals & sheets

| Slot | Asset |
|------|-------|
| Bottom sheet · close (top-right) | `icons/action/close.svg` |
| Bottom sheet · drag handle | (CSS, no asset) |
| Confirmation success | `icons/action/check.svg` (in `--success`) |
| Confirmation error | `icons/action/close.svg` (in `--danger`) |
| Share entry to social | `icons/action/share.svg` |

---

## Settings

| Slot | Asset |
|------|-------|
| Account / profile | `icons/nav/body.svg` |
| Notifications | `icons/domain/heart.svg` |
| Targets | `icons/domain/flame.svg` |
| Theme | `icons/action/settings.svg` |
| Data export | `icons/action/share.svg` |
| About / info | `icons/action/info.svg` |
| Back / nav out | `icons/action/chevron-right.svg` rotated 180° |

---

## When to use what — heuristics

1. **Need a glyph in a button or row?** `icons/action/*` — color it via `color` CSS prop; default 16–20px in mobile contexts.
2. **Need a glyph that represents a fitness/nutrition concept?** `icons/domain/*` — same sizing, slightly more decorative.
3. **Need a colored macro indicator?** `icons/macro/*` — use as inline 12–16px dots; do NOT recolor.
4. **Need to fill an empty zone?** `illustrations/*` at 200×200, centered, with a headline + sub below it.
5. **Need a brand expression?** Use `brand/*` lockups; the only place the full logo renders inside the app is the splash. Inside chrome use `brand/logo-header.svg`.
6. **Need a placeholder for missing user content?** `placeholders/*` — these intentionally look like the real components stripped of data.

---

## Don'ts

- Don't recolor macro dots. They are the macro identity.
- Don't import emoji as glyphs. Replace 🔥 / 💧 / 👟 / 🏆 with `icons/domain/*`.
- Don't add drop shadows to icons. They live flat on dark surfaces.
- Don't put illustrations behind data — only inside empty states.
- Don't render the full Bolt-F + FUELD lockup inside the app chrome. Header lockup only.
