# 2048 Dash

> A refined, responsive take on the classic 2048 puzzle — built for the web and prepared for YouTube Playables.

Merge matching tiles, protect your streak, and make every move count.

## Highlights

- **Classic mode** — build toward 2048 and chase a new personal best.
- **Daily challenge** — a deterministic board every day, with a saved completion streak.
- **Dash mode** — score as much as possible in two focused minutes.
- **Undo** — take back one move when you spot a better line.
- **Play anywhere** — keyboard, mouse drag, and swipe input with a responsive layout.
- **YouTube Playables ready** — cloud saves, host audio/pause controls, lifecycle signals, score reporting, and relative bundle paths. Ads are intentionally not included.

## Controls

| Action | Control |
| --- | --- |
| Move | Arrow keys, WASD, swipe, or mouse drag |
| Undo | `U` |
| Restart | `R` |
| Fullscreen | `F` |

## Run locally

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:8080`).

## Build

```bash
npm run build
```

The production output uses relative asset paths so the game can be hosted from a Playables package path.

## YouTube Playables validation

After starting the local server, paste `http://localhost:8080` into the [YouTube Playables SDK Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite). Validate loading, audio toggling, pause/resume, resize/orientation, input, and fullscreen behavior before submitting.

See [PLAYABLES.md](PLAYABLES.md) for the integration checklist.

## Stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui

## License

This project is provided as-is for its repository owner.
