# Talent Track Technologies — Design System (Phase 2)

Everything visual is driven from `frontend/src/styles/tokens.css`. No
component should hard-code a color, spacing value, radius or shadow —
reference a CSS custom property instead, so a brand tweak is a one-file
change.

## Logo

The real Talent Track Technologies logo (supplied by the client) is in use
as of this update, replacing the Phase 2 placeholder mark described below.
Three PNG files, all in `frontend/src/assets/` unless noted:

- `logo.png` — the full lockup (icon + "Talent Track Technologies"
  wordmark), tightly cropped from the client's source artwork. Used
  wherever there's room for the full logo: `Header`, `Footer`,
  `pages/admin/LoginPage`, and as the `logo` field of the sitewide
  `Organization` JSON-LD in `layouts/PublicLayout` (schema.org prefers a
  raster image here, so PNG over the old placeholder's SVG is also the
  more correct choice, not just a like-for-like swap).
- `logo-mark.png` — an icon-only crop (just the "TT" mark + swoosh,
  without the arrow/climbing-figure flourish or the wordmark, which don't
  hold up at small sizes) for tight spaces: `layouts/AdminLayout`'s
  sidebar brand.
- `public/favicon.png` — the same icon-only mark, padded onto a square
  canvas, for the browser tab icon (`index.html`'s `<link rel="icon">`).

**The footer is the one place the logo isn't used exactly as supplied.**
The source artwork's wordmark text is dark navy/gray, which disappears
against the footer's dark navy background (`--navy-900`) — rather than
asking for a separate light/inverse variant, `Footer`'s
`.site-footer__logo` gets a small white, rounded backing card
(`layout.css`) behind the unmodified logo image, which keeps the exact
supplied artwork intact while staying legible on dark. Every other
placement uses the logo directly on a light background, no card needed.

If a new/updated logo file arrives in the future, replacing these three
PNGs (matching filenames) is a drop-in swap — every component only ever
imports them by path, so no component code needs to change, same as the
placeholder-swap plan this replaces. If the new asset's internal layout
differs a lot from the current one (e.g. the icon and wordmark aren't
separable the same way), `logo-mark.png`/`favicon.png` may need to be
re-cropped from it by hand rather than just dropped in — there's no
automated crop step.

<details>
<summary>Original Phase 2 placeholder (superseded)</summary>

No logo file had been supplied yet. `src/assets/logo.svg` (primary),
`logo-inverse.svg` (light variant, used on the navy footer) and
`logo-mark.svg` (icon-only, also used as the favicon) were a simple
placeholder mark — a navy-to-green gradient square with an "ascending
track" glyph, plus an Inter wordmark.

</details>

## Color

| Token | Value | Use |
|---|---|---|
| `--navy-900` / `--navy-800` | `#0a1c37` / `#102a52` | Header/hero/footer dark surfaces, headings |
| `--blue-600` / `--blue-700` | `#2159d1` / `#1948b3` | Primary buttons, links, active nav state |
| `--green-500` / `--lime-400` | `#2bbf62` / `#8fe23f` | Accent CTA, success states, growth motifs |
| `--white`, `--bg-app`, `--bg-subtle` | `#fff`, `#f6f8fc`, `#eef2f9` | Page and section backgrounds |
| `--text-heading` / `--text-body` / `--text-muted` | `#0f1524` / `#444d61` / `#6b7286` | Dark-charcoal text family |

Two brand gradients (`--gradient-navy`, `--gradient-navy-green`) are used for
the header/hero/footer/CTA surfaces called for in the brief; a third
(`--gradient-green`) is used for the accent button.

## Typography

**Inter** (400/500/600/700/800), loaded via Google Fonts in `index.html`,
with a system-font fallback stack. Heading sizes (`--fs-xl` … `--fs-3xl`) and
body sizes (`--fs-xs` … `--fs-md`) are all tokens — see `tokens.css`.

## Spacing, radius, shadow, breakpoints

- Spacing scale: `--space-1` (4px) through `--space-24` (96px).
- Radius scale: `--radius-sm` 8px, `--radius-md` 14px, `--radius-lg` 22px,
  `--radius-full` (pill/circle).
- Shadows are tinted with brand navy (`--shadow-sm/md/lg`) rather than pure
  black, so elevation reads as "branded" rather than generic.
- Breakpoints (documented in `tokens.css`, applied as literal values since
  CSS variables can't drive `@media` queries): 640 / 768 / 1024 / 1280 /
  1536px — covering the phone/tablet/desktop widths in the brief.

## Stylesheet organization

```
src/styles/
  tokens.css       CSS custom properties only — the single source of truth
  base.css         Reset, base element styles, .container, .section
  layout.css       Header, Footer, Hero
  cards.css        ServiceCard, CourseCard, PlacementCard, JobCard,
                    TestimonialCard, StatsCard
  components.css   Button, SectionTitle, Alert, Loader, EmptyState,
                    Pagination, Breadcrumb, Modal, CTASection
  forms.css        FormInput, Select, Textarea shared field styles
```
`src/index.css` just `@import`s these in order.

## Reusable components (`src/components/`)

- `layout/` — `Header` (sticky, active-link highlighting, mobile hamburger
  panel), `Footer` (services/company links, contact block, social
  placeholders, privacy/terms links)
- `marketing/` — `Hero`, `CTASection`
- `cards/` — `ServiceCard`, `CourseCard`, `PlacementCard`, `JobCard`,
  `TestimonialCard`, `StatsCard`
- `ui/` — `Button`, `SectionTitle`, `FormInput`, `Select`, `Textarea`,
  `Alert`, `Loader`, `EmptyState`, `Pagination`, `Breadcrumb`, `Modal`,
  `SocialIcons` (lucide-react dropped brand icons in the installed version,
  so Facebook/Instagram/LinkedIn/YouTube are small hand-drawn outlines in
  the same stroke style), `ImageSlider` (auto-playing carousel — see below)

All 21 components named in the original brief's "Reusable Components" list
are implemented. Icons are from `lucide-react`.

## Hero — synchronized content + image carousel

`Hero` (`src/components/marketing/Hero.jsx`) is a single carousel where the
**text and the image rotate together as one unit** — each slide supplies its
own eyebrow, headline, description, CTA buttons *and* image, so the whole
hero (not just the picture) auto-advances. Fully automatic by design: no
prev/next arrows (removed per client feedback — they read as dated), just a
600ms crossfade on both the text and the image, small dot indicators for a
manual jump, and touch swipe on mobile. Pauses on hover/focus/
`prefers-reduced-motion`, and the text column carries an aria-live region so
screen readers announce each new slide.

The auto-rotation logic (index state, autoplay timer, pause handlers, swipe
handlers) lives in a shared hook, `src/hooks/useCarousel.js`, used by both
`Hero` and the standalone `ImageSlider` component
(`src/components/ui/ImageSlider.jsx` — kept as a reusable, image-only
carousel for anywhere else a content-managed slider is needed later, e.g. a
testimonials strip) so the two never drift out of sync in behavior.

`Hero`'s `slides` prop is `[{ id, eyebrow?, title, description, primaryCta?,
secondaryCta?, image, alt? }]` — deliberately close to the `banners` table
already planned in the database schema, so this becomes `GET /api/banners`
instead of the static `HERO_SLIDES` array in `HomePage.jsx` once the admin
Content → Banners module exists (Phase 9), with minimal changes to `Hero`
itself.

The four slides in `HERO_SLIDES` (`HomePage.jsx`) map one-to-one to the four
core services — Training / Placement / Recruitment / Consulting — each with
its own headline, description and service-relevant CTA. The images in
`src/assets/hero-slides/` are flat, abstract illustrations — **not real
photography**, since none has been supplied and stock imagery can't be used
without a license. Swap in real photos any time by pointing `HERO_SLIDES` at
new image files (or, later, real banner records) — the component doesn't
care what the images are.

## What's live vs. what's still a placeholder

The Home page (`pages/public/HomePage.jsx`) now uses the real design system:
Hero, the four fixed services (Training/Placement/Recruitment/Consulting),
a "Why Talent Track" grid, the six-step process timeline, and a final CTA —
all static content, no backend dependency.

**Not built yet, on purpose** — these need data that doesn't exist until
their own phases: Featured Training courses (Phase 6, needs `GET
/api/courses`), Placement categories (Phase 7), Statistics and Testimonials
(admin-managed, Phase 9/10). Insertion points are marked with a comment in
`HomePage.jsx`. Every other public page (`About`, `Training`, `Placement`,
job/course detail, `Recruitment`, `Consulting`, `Contact`) still renders the
Phase 1 placeholder — they get real content in Phase 5 onward — but they
already inherit the branded `Header`/`Footer` via `PublicLayout`.

Footer contact details (address/phone/email) are realistic placeholders
pending the client's actual office address and numbers; social links point
to `#` pending Phase 9's Settings module wiring them up.

## Verification performed

- `npm run build` — clean
- `npm run lint` (oxlint) — clean (one pre-existing, harmless fast-refresh
  warning in `AuthContext.jsx`, unrelated to Phase 2)
- Visually screenshotted the Home page at 1440×1000 (desktop), 768×1100
  (tablet) and 390×900 (mobile), plus the mobile nav panel open, via a
  headless Chromium `vite preview` smoke test — confirmed the hero
  gradient/cards/layout render correctly and reflow properly at each width,
  and fixed two issues found this way: the hero visual was displacing the
  h1 above the fold on tablet/mobile (now the headline always leads), and
  the active nav link had no visible highlight in the mobile menu.
- Re-verified after replacing the static hero cards with `ImageSlider`:
  clicking "Next slide" advances the image, caption and active dot
  correctly; the slider still renders below the headline (not above) on
  tablet and mobile, per the client's request.
- Re-verified after unifying the hero into one text+image carousel: confirmed
  via automated browser checks that the headline, description, CTA and image
  all change together on autoplay (not the image alone), that clicking a dot
  jumps text and image to the same matching slide, that no arrow buttons are
  present, and that the visual format/layout is pixel-identical to the
  previous version at desktop, tablet and mobile widths (text still leads,
  image still follows, on mobile).
