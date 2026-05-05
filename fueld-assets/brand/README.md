# Fueld brand assets

Drop this folder into your project (recommended path: `assets/brand/`).

## Files

| File | Purpose |
|---|---|
| `logo-mark.svg` | Bolt-F brandmark, lime (`#C8F135`) on transparent. Default. |
| `logo-mark-ink.svg` | Bolt-F in ink (`#0A1400`) — use on lime surfaces. |
| `logo-mark-mono.svg` | Bolt-F in off-white (`#F2F4EE`) — use on photos / unknown surfaces. |
| `logo-wordmark.svg` | FUELD wordmark, two-tone (FUEL light / D lime). |
| `logo-wordmark-mono.svg` | FUELD wordmark, single-color off-white (for stamps, embroidery, reversed). |
| `logo-horizontal.svg` | Primary horizontal lockup with vertical hairline divider. |
| `logo-stacked.svg` | Stacked lockup with the `FUEL · TRAIN · MEASURE` tagline (splash / marketing). |
| `logo-header.svg` | Compact in-app header treatment (18px brandmark + 13px wordmark). |
| `app-icon-1024.svg` | iOS app icon — lime squircle, ink Bolt-F, inset highlight. Render to 1024×1024 PNG for App Store. |
| `app-icon-foreground.svg` | Android adaptive icon foreground (Bolt-F on transparent in 432×432 safe zone). |
| `app-icon-background.svg` | Android adaptive icon background (flat lime 432×432). |
| `app-icon-monochrome.svg` | Android themed icon (Bolt-F in pure black on transparent). |

## Notes on the wordmark SVGs

The wordmark SVGs reference **JetBrains Mono** via Google Fonts `@import`. They render correctly in any modern browser. For environments without internet (PowerPoint, Figma, native iOS export pipelines):

- Install **JetBrains Mono 700** locally before opening, OR
- Outline the text to paths in your design tool: open in Figma / Illustrator → select the text → `Object → Path → Outline Stroke` (or `Type → Create Outlines` in Illustrator) → re-export.

## Color tokens

```
--accent      #C8F135    /* lime */
--accent-ink  #0A1400    /* ink on lime */
--text-hi     #F2F4EE    /* off-white */
--text-mid    #9BA199    /* secondary */
--bg-0        #0A0B0A    /* app background */
```

## Quick rules

- Brandmark fills allowed: `#C8F135`, `#0A1400`, `#F2F4EE`. No others.
- Never stroke, gradient, glow, or rotate the brandmark.
- The wordmark's trailing **D is always lime** in the primary lockup. Single-color reversed allowed for stamps only.
- Minimum sizes: brandmark 16px · wordmark 64px wide · horizontal lockup 140px wide · app icon 40px.
- Clear space ≥ 1× wordmark cap-height around any lockup.
