# Santhosh · Cinematic 2026

A static portfolio with original GTA VI-inspired tropical artwork, oversized editorial type, deep indigo, cream and pink colors, and native-scroll cinematic motion. No liquid-glass or backdrop-blur styling is used in the active design.

## Preview

Run `npm.cmd start` in Windows PowerShell (or `npm start` elsewhere), then open http://127.0.0.1:4173. No build step is needed. The server binds only to your computer. Upload `index.html` and `assets/` together to your existing static host when ready; this update has not been deployed.

## Artwork and composition

The four main chapters have distinct original environments: Home's warm oceanfront, Work's neon district, About's rooftop studio, and Contact's twilight marina. These are sections of the existing single-page portfolio, not separate routes.

The illustrated portrait uses the supplied `assets/San.png` as its identity reference. It appears in the opening hero and the “Big Ideas. No Limits.” section. The original photograph is unchanged. The image-generation skill guided identity preservation and genuine transparent-background output.

Five assets were generated with the built-in image-generation tool. Masters, optimized desktop/mobile WebP variants, provenance, and the complete final prompts are saved in [assets/art/ARTWORK.md](assets/art/ARTWORK.md). Regenerate the WebP encodings with `node scripts/optimize-art.cjs`. The mobile portrait is about 81 KB; the four mobile environments are approximately 69–128 KB each. Below-the-fold images load lazily. No Rockstar game assets, logos, or characters are included.

## Interaction and accessibility

- Skippable opening and overlapping chapter cameras: Home → Big Ideas → Playground → subsequent sections. The name, portrait, and background stay together while zooming; a short end-of-zoom crossfade replaces the whole scene without an empty-background pause.
- Each section retains its full natural reading height before its last viewport pins for the next transition. Big Ideas text and portrait also zoom. Scroll backwards to reverse the sequence; no wheel/touch events are intercepted and no forced page jumps occur.
- Native horizontal project reel with arrows, keyboard controls, filters, and a position counter. All ten original projects retain their links.
- Frame-rate-independent damping, cached section geometry, transform-based motion, and animation frames that stop when settled. Native scrolling is not intercepted.
- Only nearby chapter cameras receive compositor preparation. Unchanged styles and offscreen zoom updates are skipped; images decode ahead of entry during idle time. Navigation and reading progress use cached geometry instead of repeated layout reads during scrolling. Shorter damping reduces the trailing feel after input.
- OS reduced-motion support and a persistent manual motion toggle; paused mode removes the pinned scroll sequence.
- Full-screen navigation, keyboard-accessible cards, Escape dismissal, contained dialog focus, and focus restoration.
- Responsive compositions including separate mobile portrait placement and stacked introduction content.

Existing resume choices, certificates, skills, experience, contact details, and light/dark theme controls are preserved. The 3D viewer and GitHub data load near their sections.

## Code map

- `index.html`: content, responsive image markup, metadata, and preserved external links.
- `assets/base.css`: existing component base styles.
- `assets/cinema.css`: active cinematic design, typography, navigation, reel, and responsive rules.
- `assets/chapters.css`: chapter artwork, portrait compositions, and mobile adaptations.
- `assets/transitions.css`: sticky chapter tracks, overlapping cameras, and reduced-motion fallback.
- `assets/core.js`: navigation, themes, filters, dialogs, GitHub, contact, and clock.
- `assets/edition.js`: project cover art, motion preferences, keyboard accessibility, and deferred viewer loading.
- `assets/cinema.js`: opening, damped scroll choreography, chapter navigation, and project reel.
- `scripts/serve.cjs`: dependency-free local server.
- `scripts/cinema-check.cjs`: current Edge/Playwright regression checks.

The earlier `assets/edition.css` glass stylesheet and `scripts/check.cjs` are retained but are not loaded or used by the current test command.

## Verification

Install development dependencies with `npm.cmd install`, start the server, then run `npm.cmd test`. Tests use installed Microsoft Edge via Playwright. Screenshots are saved to ignored `artifacts/`.

Run `npm.cmd run test:transitions` for desktop/phone scroll-handoff checks, native wheel/reverse scrolling, anchor navigation, keyboard focus into hidden chapters, and checks that the incoming chapter is visible when the outgoing one disappears.

`node scripts/motion-profile.cjs label` records a repeatable scroll trace with 4× CPU throttling in `artifacts/motion-profile-label.json`; append `mobile` to use a phone-sized viewport. These are local browser diagnostics, not a physical-device frame-rate guarantee.

Coverage includes responsive overflow/title checks, opening skip, reversible scroll zoom, header behavior, reduced motion, distinct chapter images and portraits, project filters/reel boundaries, keyboard dialogs, resume menu, theme persistence, mobile navigation, and contact serialization. Email transport is mocked; tests never send a message. An external-request-blocked pass checks graceful failure and preservation of a contact draft.

External fonts/icons, certificate images, the 3D model, GitHub, and EmailJS require connectivity. Live delivery, third-party project availability, and performance on physical devices have not been verified. Project hosts may disallow embedding; direct project/source links remain available.

Design reference: [Rockstar Games / GTA VI](https://www.rockstargames.com/VI). The portfolio uses original generated artwork and open web fonts rather than the game's proprietary assets.
