# DESIGN.md — Soul Collection Styling Guide

> **Purpose.** This is the single source of truth for the *visual* design of the Soul Collection frontend. It exists so that anything added later — a new button, an image card, a modal — looks like it belongs. It is written to be read by both humans and AI coding agents: **hard token tables** (use these exact values) plus **design-philosophy prose** (use this judgement when the tables don't cover your case).
>
> **How to use it.** Before adding or restyling any UI, (1) reuse an existing utility class or component if one fits, (2) otherwise pull values from the token tables below, (3) never hardcode a one-off color, radius, or shadow that isn't in here. If you genuinely need a new token, add it here first, then use it.
>
> Values below were extracted from the real CSS in `src/`. Where the codebase is currently inconsistent, this guide picks the **canonical** choice and flags the rest under [Known inconsistencies](#known-inconsistencies).

---

## Design philosophy

Soul Collection is a **cute, playful, hand-made** personal site for showing off original characters. The vibe is *sparkly scrapbook*, not corporate SaaS. Concretely that means:

- **Purple is the brand.** One deep, saturated purple (`#864edb`) anchors everything, with a near-black purple (`rgb(52,11,86)`) used for the signature "3D" drop-shadows. Mint green and candy pinks are **accents**, never the primary surface.
- **Chunky, tactile, "3D" affordances.** Interactive things have a black outline and a double-offset purple shadow so they look like physical stickers/buttons you can press. Hover *rises*, active *presses down*. This is the site's most recognizable trait — lean into it.
- **Rounded, soft, friendly.** Small radii (4px / 8px) on tiles and frames; full circles for avatars. Nothing sharp.
- **Handwritten headings.** Display font is bubbly (`Rowdies`); body is a comic/marker font (`Comic Relief`). Never introduce a neutral system font into the public site — that reads as "AI default" and breaks the vibe.
- **Legible over decorative.** Text on busy sparkle backgrounds gets a white outline or hard shadow so it stays readable. Content warnings blur rather than hide.

**Do:** reuse the utility classes, keep the purple 3D shadow language, use the playful fonts, keep radii small and consistent.
**Don't:** introduce Bootstrap-blue links, gradients-for-the-sake-of-it, sharp corners, drop-shadows in a *new* random color, or a plain sans-serif into public pages.

---

## Colors

Global tokens live in `src/index.css` (`:root`). **Always prefer the CSS variable over a raw hex.**

### Core tokens (defined in `src/index.css`)

| Token | Value | Usage |
|---|---|---|
| `--color-purple` | `#864edb` | **Primary brand.** Body background, focus rings, primary fills, accents. |
| `--color-green` | `#9acfb0` | Muted mint accent; "active"/selected toggle state. |
| `--color-white-sparkle` | `#f3e9ff` | Lightest lilac-white; soft surfaces, sparkle text. |

### Extended palette (recurring raw values — treat these as the intended palette)

| Role | Value(s) | Usage |
|---|---|---|
| Shadow purple | `rgb(52,11,86)` / `#340b56` | **The 3D drop-shadow color.** Use for every `box-shadow` offset stack. Do not substitute another dark color. |
| Purple glow | `rgba(134,78,219, .15–.6)` | Focus glows, soft borders (this is `#864edb` with alpha). |
| Deep purples | `#4a148c`, `#6a1b9a` | Darker purple gradients / emphasis. |
| Overlay purples | `#2e1a48`, `#240f3d`, `rgba(42,18,66,.85)` | Near-black purple modal/overlay backgrounds. |
| Sparkle green | `rgb(106,255,168)` (often `.6` alpha) | Bright green for `.div-3d-*` borders/fills. |
| Text green | `#d2ec9b` | Big decorative text shadow (see `.big-text-shadow`). |
| Candy pinks | `#ff99cc`, `#ffb3d9` | Pink text-shadow glows / cute accents. |
| Pastel lilacs | `#e8d5ff`, `#d4c5e8`, `#d4b8f0`, `#c89fff` | Soft tints, hovers, backgrounds. |
| Text neutral | `#333` (primary), `#666` (secondary), `#999` (muted) | Body/label/muted text. |
| White | `#fff` | Cards, outlines, focus ring. |
| Borders | `#ddd` (default), `#e0e0e0`, `#ccc`, `#eee` | Light dividers/inputs. |
| Overlay black | `rgba(0,0,0, .2–.9)` | Scrims, soft shadows, content-warning cards. |

### Semantic colors (dialogs / destructive actions only)

| Role | Value | Usage |
|---|---|---|
| Danger | `#dc3545` | Delete/destructive buttons and error text. |
| Success | `#2ecc71` / `#27ae60` | Confirmation states (editor). |

> ⚠️ **Off-brand, do not spread further:** the editor and some dialogs use Bootstrap-ish `#007bff` (blue links), `#6c757d` (grey), `#e74c3c`/`#c0392b`. These are legacy. For **new public-facing UI**, use brand purple/green instead of blue/grey. Danger red is acceptable for genuinely destructive actions.

---

## Typography

Fonts are loaded via Google Fonts in `index.html` (no `@font-face`, no self-hosting). Tokens in `src/index.css`.

| Token | Stack | Usage |
|---|---|---|
| `--font-primary` | `"Comic Relief", "Comic Sans MS", "Chalkboard SE", cursive` | **Body & all UI text.** The default everywhere. |
| `--font-secondary` | `"Arial", sans-serif` | Rare fallback / neutral text. |
| *(headings)* | `"Rowdies", cursive` | **`h1`–`h6` only.** Applied globally in `index.css`. |
| *(mono)* | `"SF Mono","Monaco","Inconsolata","Roboto Mono", monospace` | Slugs, hex codes, code. |

**Rules**
- Public UI text = `var(--font-primary)`. Headings = `Rowdies` (already set on `h1`–`h6`; you rarely set it manually). Form controls should `font-family: inherit` so they pick up the cursive font.
- Do **not** use the editor's `-apple-system / Segoe UI / Roboto` stack anywhere in the public site — it's intentionally scoped to the admin editor only.

**Base sizing (`src/index.css`)**
- Root font-size: `0.7rem` on mobile → `1rem` at `@media (min-width: 768px)`. Size type in `em`/`rem` so it scales with this.
- `line-height: 1.5`, base weight `400`. Links `font-weight: 500`.

**Heading scale (already defined globally, bold):** `h1 3.8em` · `h2 2em` · `h3 1.6em` · `h4 1.8em` · `h5 1.4em` · `h6 1.2em`.
*(Note: `h4` is intentionally larger than `h3` in this codebase — keep it that way unless deliberately changing the scale.)*

---

## Spacing, radius & shadows

### Border-radius scale
Use only these. **`4px` and `8px` are the defaults.**

| Radius | Use for |
|---|---|
| `4px` | Small controls, tags, subtle rounding (most common). |
| `8px` | **Cards, image tiles, avatars-as-squares, buttons.** The standard tile radius. |
| `6px` | Editor inputs/buttons. |
| `12px` | Large overlays / content-warning cards. |
| `50%` | Circular avatars / round icon buttons. |
| `999px` | Pills. |

Avoid inventing `10px`, `16px`, `20px` radii for new work — round to the scale above.

### Spacing scale
Prefer these values for `gap`, `padding`, `margin`: **`4px · 8px · 12px · 16px · 20px · 24px · 32px`** (the editor tokenizes these as `--editor-spacing-xs…xl`). `10px` also appears in legacy code but prefer `8`/`12`.

Layout: pages use `.page-padded` (`padding: 1vw 1vw 0; width: 96%`). **No bottom padding on page containers** — the global footer owns the bottom gap (`40px margin-top`). Follow this convention.

### The signature 3D shadow
This is the house style. Reuse it verbatim (or via a utility class) for anything that should feel raised/tactile:

```css
box-shadow:
  0px 4px 0px rgb(52, 11, 86),
  4px 4px 0px rgb(52, 11, 86),
  0 0 20px rgba(52, 11, 86, 0.6);
```

Softer, generic depth uses `rgba(0,0,0, .2–.3)`. Don't introduce shadows in other colors for brand UI.

### Text-shadow idioms
- `.text-outline` / `.text-outline-thick` — white multi-directional outline for legibility over busy backgrounds.
- `.big-text-shadow` / `.small-text-shadow` — green (`#d2ec9b`) + hard black offset for big decorative text.

---

## Responsive breakpoints

Documented in `src/index.css`: `xs 320 · sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. **In practice the two that matter are `768px` and `1024px`.**

- The JS `useIsMobile` hook uses **`max-width: 1023px`** — keep CSS breakpoints aligned to `1024px` (desktop) / `1023px` (mobile) so CSS and JS agree.
- Canonical three-tier grid (see `OcSlot.css`): `320–767px` = 2/row · `768–1023px` = 3/row · `≥1024px` = 5/row.
- Prefer `min-width: 768px` and `min-width: 1024px` (or `max-width: 1023px`). Avoid new `767/769/480/1200` breakpoints — they're legacy drift.

---

## Buttons

There is no single `<Button>` component; buttons are styled by context. **Pick the closest existing pattern rather than inventing a new look.** All buttons share one interaction idiom: **hover rises, active presses down**, transitions `0.15s`–`0.2s ease`.

### A. Chunky 3D button — the house style (public UI)
Use for primary/playful actions. Apply the utility class from `src/index.css`:

```css
.button-with-underline {
  border: 2px solid black;
  box-shadow: 0px 4px 0px rgb(52,11,86), 4px 4px 0px rgb(52,11,86), 0 0 20px rgba(52,11,86,.6);
  padding: 0.5rem 1rem;
  transition: all 0.2s ease-in-out;
}
```
Companions: `.button-3d-with-shadow`, `.shadow-3d`, `.div-3d-with-shadow`. On `:active`, drop the offset (press down).

### B. Chromeless icon/nav button
For arrows, close buttons, icon toggles. See `common-components/ArrowButton.css`:

```css
background: none; border: none; padding: 0;   /* min 32×32 hit area */
:hover  { transform: scale(1.2); }
:active { transform: scale(0.95); }
```

### C. Editor button (admin editor only)
The most complete button system, `editor/EditorCommon.css` — `.editor-button` + `-primary/-success/-danger/-secondary/-small/-large`. Uses `border-radius: 6px`, tokenized 3D shadow, `translateY(-1px)` hover / `translateY(2px)` active, `opacity: 0.4` disabled. **Use this for editor UI, not public pages.**

### D. Overlay button (on top of images)
For controls sitting over imagery (uncensor / zoom / recensor). Semi-transparent fill + `backdrop-filter: blur(10px)`, `border-radius: 4–8px`. Green fill = positive action, `rgba(255,0,0,.8)` = re-censor. See `ZoomPanPinchImage.css`.

**Choosing:** public action → A. Icon/arrow → B. Editor → C. Floating over an image → D.

---

## Image display

### Frames & rounding
- **Tiles / avatars / gallery thumbs:** `border-radius: 8px`, `object-fit: cover`, often `aspect-ratio: 1`. (`OcSlot.css`, `GalleryBlock.css`)
- **Circular avatars:** `border-radius: 50%`.
- **Group cover cards:** `border: 4px solid <group color>` (color injected inline per-group from data), `border-radius: 8px`, `overflow: hidden`, `aspect-ratio: 7 / 3`, `object-fit: cover`. (`OcGroupCover.css`)
- There is **no arched/top-rounded frame** in the CSS despite older docs mentioning "arched windows" — real frames are square with `8px` corners. Don't add arched shapes unless intentionally introducing a new pattern (and document it here if you do).

### `object-fit` convention (important for consistency)
- **`cover`** → thumbnails, avatars, grid tiles (fill + crop to square).
- **`contain`** → full-size / zoomable / slideshow / lightbox views (show whole image, never crop). (`Lightbox.css`, `AdSlideshow.css`, `ImageSlide.css`)

### Zoom / pan
Full-size interactive images use `react-zoom-pan-pinch` via `common-components/ZoomPanPinchImage.tsx`. The viewport is `overflow: hidden`, so its focus ring is **inset** (`outline-offset: -3px`) — keep that, an outward ring would be clipped.

### Content-warning / censorship
The standard treatment is a **frosted blur overlay**, click-to-reveal:
- Card: `rgba(0,0,0,.9)` bg, `border-radius: 12px`, `backdrop-filter: blur(15px)`, `box-shadow: 0 8px 32px rgba(0,0,0,.3)`, with an uncensor button (pattern D) and a re-censor button.
- `backdrop-filter: blur(4–15px)` (always paired with `-webkit-backdrop-filter`) is the site-wide frosted-glass idiom. Reuse it; don't swap in a solid box.

---

## Focus & accessibility

Defined globally in `src/index.css` — do not remove focus indicators.

- Default: `:focus-visible { outline: 3px solid #fff; outline-offset: 2px; }`
- Form controls: purple outline `#864edb` + `box-shadow: 0 0 0 4px rgba(134,78,219,.45)` (box-shadow is used because component CSS sets `outline: none`).
- When you set `outline: none` on a custom control, you **must** add an equivalent visible focus style (purple glow above), and an inset ring if the container clips overflow.
- Custom cursor (`huge_cursor.png`) applies only on `min-width:768px and hover:hover and pointer:fine` — don't apply cursor images on touch devices.

---

## Naming & file conventions

- **CSS files are co-located per component** — every `Foo.tsx` has a sibling `Foo.css` in the same folder. Follow this for new components.
- **Class names are kebab-case, component-prefixed:** `.oc-slot-wrapper`, `.gallery-content-warning-icon`, `.zoom-pan-pinch-container`. Prefix classes with the component name to avoid collisions (there are no CSS modules / no scoping).
- **Do not use BEM** (`__` / `--`). Exactly one component (the doodle canvas, `.doodle__swatch--active`) uses BEM and it's the outlier — match the kebab-case majority instead.
- **CSS custom properties are namespaced by scope:** global `--color-*` / `--font-*`; editor `--editor-*`; height-chart `--hc-*`. Add new global tokens to `src/index.css` `:root`.

---

## Adding a new element — checklist

1. **Reuse first.** Does a utility class (`.button-with-underline`, `.div-3d-with-shadow`, `.text-outline`, `.glass-effect`) or existing component already do this? Use it.
2. **Colors** from the [Colors](#colors) table via CSS variables. No new raw hexes.
3. **Font** = `var(--font-primary)` (or inherit); headings use `Rowdies` automatically.
4. **Radius** = `4px` or `8px` (`50%` for circles). **Spacing** from the `4/8/12/16/24/32` scale.
5. **Interactive?** Give it the 3D purple shadow + black border, hover-rise / active-press, `0.15–0.2s ease`. Pick a button pattern (A–D) by context.
6. **Image?** `cover` for thumbnails, `contain` for full views; `8px` frame; frosted-blur for content warnings.
7. **Focus:** keep a visible focus-visible style; never leave `outline: none` without a replacement.
8. **Co-locate** the `.css` file, use kebab-case component-prefixed classes.
9. **Responsive:** align to `768px` / `1024px`.
10. If you truly need a new token/pattern, **add it to this file first**, then use it.

---

## Known inconsistencies

These exist in the codebase today. Don't propagate them; prefer the canonical choice, and fix opportunistically.

1. **Three separate token systems re-declare the same purple.** `--color-purple` (global), `--editor-primary` (editor), `--hc-primary*` (height chart) all encode `#864edb` independently. New global work should use `--color-purple`.
2. **`--color-green-dark` is referenced but never defined** (e.g. `ZoomPanPinchImage.css` hover) — that style silently no-ops. Define it in `:root` if you touch that area.
3. **Off-brand Bootstrap colors** (`#007bff` blue, `#6c757d` grey, `#e74c3c`) leaked in via the editor/dialogs. Keep public UI on the purple/green/pink palette.
4. **"Arched frame" is documentation drift** — no arched image frames actually exist; frames are `8px`-rounded squares.
