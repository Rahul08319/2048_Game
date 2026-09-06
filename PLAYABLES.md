# YouTube Playables checklist

This project imports `https://www.youtube.com/game_api/v1` in `index.html` before the Vite entry script. The integration includes:

- `firstFrameReady()` before `gameReady()` after the first React frame
- `loadData()` / `saveData()` in Playables and `localStorage` outside it
- audio-state initialization plus `onAudioEnabledChange()` updates
- save-on-pause, paused input, and resume handling
- current YouTube language for the document locale
- high-score submission and best-effort health reporting

Ads, interstitials, and rewarded ads are intentionally excluded.

## Bundle paths and Test Suite

`vite.config.ts` sets `base: "./"` so the production bundle emits relative asset
references. This is required because a Playables package is hosted from an arbitrary
path rather than from the website root.

To run the official SDK Test Suite, first build or start the project locally, then
open the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite)
and enter the local game URL (for this project's Vite server, `http://localhost:8080`).
Use its controls to verify the loading screen, audio toggle, pause/resume, orientation,
and fullscreen behavior.

## Bundle paths and Test Suite

`vite.config.ts` sets `base: "./"` so the production bundle emits relative asset
references. This is required because a Playables package is hosted from an arbitrary
path rather than from the website root.

To run the official SDK Test Suite, first build or start the project locally, then
open the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite)
and enter the local game URL (for this project's Vite server, `http://localhost:8080`).
Use its controls to verify the loading screen, audio toggle, pause/resume, orientation,
and fullscreen behavior.

## Responsive game canvas

There is no single fixed Playables resolution. The game board is responsive for the required aspect-ratio range (including 9:32 through 32:9), scales tile text from the board container, preserves the running game on resize, and offers touch, mouse-drag, and keyboard movement. The compact landscape layout avoids scrollbars and retains legible controls.

Before publishing, run the official YouTube Playables Test Suite. Test with its documented Content-Security-Policy override; the release environment must allow the SDK endpoint and only the final game's required resources.
