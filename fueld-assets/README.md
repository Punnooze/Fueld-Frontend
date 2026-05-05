# Fueld — Asset Pack

Drop the entire `fueld-assets/` folder into your project (recommended path: `src/assets/` or `public/assets/`).

## Folder map

```
fueld-assets/
├─ tokens/                  Design tokens (CSS + JSON)
├─ icons/
│  ├─ nav/                  Bottom-tab icons (5)
│  ├─ action/               Buttons & controls (16)
│  ├─ domain/               Fitness/nutrition glyphs (10)
│  └─ macro/                Macro letter-dots (4)
├─ illustrations/           Empty states & celebrations (5)
├─ marks/                   Splash, OG, favicons, loaders (6)
├─ decor/                   Background patterns (2)
├─ placeholders/            Tile fallbacks for missing imagery (2)
├─ brand/                   (Already shipped — Bolt-F + wordmark + lockups)
└─ USAGE.md                 Where to use what — read this!
```

## Conventions

- **All icons are 24×24, 1.5px stroke, `stroke="currentColor"`.** Color them via CSS `color:` on the parent. No need to edit the SVGs.
- **Macro dots** are 16×16 colored fills — they don't follow currentColor.
- **Illustrations** are 200×200 with semi-transparent strokes. Drop them at native size.
- **Marks** (splash, OG) are at their final pixel dimensions — don't scale up.

## Quick install (React)

```tsx
// Import as URL
import todayIcon from './assets/icons/nav/today.svg';

// Or inline as a React component (Vite/CRA with svgr)
import { ReactComponent as TodayIcon } from './assets/icons/nav/today.svg';
```

For the cleanest setup, configure your bundler to import SVGs as React components, then strip the explicit `stroke="currentColor"` is unnecessary — it's already there.
