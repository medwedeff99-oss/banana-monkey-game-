# Banana Monkey Love Quest

A twelve-page illustrated romantic comedy about Milo, Luna, an extremely confident gorilla, and one unexpected small monkey.

## The book

- A textured, forest-green hardcover and warm, illustrated interior pages.
- Twelve distinct gouache-style scenes, with consistent characters and specific physical comedy.
- Two facing pages on desktop; one page at a time on phones (700px breakpoint).
- Animated page turns, horizontal swipe gestures, keyboard arrows, and a cover/restart control.
- Short narration and sarcastic dialogue; no mini-games or choices interrupting the story.
- A fake ending with credits and a delayed cry. Page twelve stays concealed until the reader turns again, even on desktop.
- A baby reveal and a banana thrown toward the reader.
- Optional generated page-turn and comic sound effects. Sound starts off.
- Device-local reading progress, resilient to blocked storage; reduced-motion support and accessible illustration descriptions.

## Review without enabling GitHub Pages

Use the **commit-pinned preview URL supplied with the review handoff**. It serves these static files through raw.githack.com; it does not enable GitHub Pages or change repository settings. CDN availability and caching are outside this repository's control.

You can also download this repository and open `index.html` directly in a modern browser. There is no build step or runtime dependency. All illustrations are local; the optional Google Fonts stylesheet falls back to Georgia and Arial without network access.

**Publishing is intentionally not configured.** No GitHub Pages workflow, deployment action, or Sites publication is included. The owner must approve publication separately.

## Compatibility

`index.html`, `style.css`, `game.js`, and every asset use relative paths. They work from a repository subdirectory such as `/banana-monkey-game-/`, so the book remains compatible with GitHub Pages when the owner decides to enable it. `.nojekyll` is included. Node is only used for development tests.

## Tests

```sh
npm ci
npm test
```

The tests exercise the rendered DOM with jsdom and controlled timers: all twelve pages, desktop/mobile navigation, the concealed reveal, swipe thresholds, keyboard controls, rapid-click guards, saved progress, resizing, replay, cancelled timers, unavailable audio, blocked storage, reduced motion, and asset/subpath validity.

These tests do not verify browser rendering, physical-device gestures, or perceived animation smoothness. Browser visual review remains a separate check.

## Files

- `index.html` — book shell, navigation, and about dialog
- `style.css` — hardcover, spread layouts, typography, and animations
- `game.js` — twelve-page story, page turns, timing, sound, and progress
- `assets/chapters-*.png` — three illustrated sheets, each containing four unique scenes; CSS displays one quadrant per page
- `assets/banana.svg` and `assets/flying-banana.svg` — favicon and final banana animation
- `tests/storybook.test.cjs` — automated interaction checks

Illustrations were generated for this story with OpenAI image generation. The story is family-friendly, with dating and marriage humor written for adults. No bananas were harmed. Emotionally? Maybe.
