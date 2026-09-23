<div align="center">

# 2048 Dash — Apple Fluid Edition

<p align="center">
  <strong>A modern, fluid, Apple-designed take on the classic 2048 puzzle — engineered with a zero-dependency universal SDK bridge for YouTube Playables, Facebook Instant Games, Poki, CrazyGames, Discord Activities, and beyond.</strong>
</p>

[![YouTube Playables](https://img.shields.io/badge/YouTube-Playables_v1-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://developers.google.com/youtube/gaming/playables)
[![Poki](https://img.shields.io/badge/Poki-SDK_v2-00D2D3?style=for-the-badge)](https://poki.com)
[![CrazyGames](https://img.shields.io/badge/CrazyGames-SDK_v3-8B5CF6?style=for-the-badge)](https://crazygames.com)
[![Facebook Instant](https://img.shields.io/badge/Facebook-Instant_Games-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://developers.facebook.com/docs/games/instant-games)
[![Yandex Games](https://img.shields.io/badge/Yandex-Games-FC3F1D?style=for-the-badge&logo=yandex&logoColor=white)](https://yandex.com/dev/games/)
[![Discord Activities](https://img.shields.io/badge/Discord-Activities-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.com/developers/docs/activities/overview)
[![License: MIT](https://img.shields.io/badge/License-MIT-34D399?style=for-the-badge)](LICENSE)

</div>

---

## ✨ Features & Highlights

- **🍎 Apple Fluid Design System**:
  - **Liquid Glass Materials**: Cupertino-style frosted glass surfaces (`backdrop-filter: blur(32px)`), specular edge lighting, and elevated dark-mode canvases.
  - **SF Typography Hierarchy**: Negative optical tracking on large headings, crisp numbers, and responsive sizing.
  - **Natural Spring Motion**: Interruptible spring physics curves (`cubic-bezier(0.175, 0.885, 0.32, 1.25)`) for tile spawns, merges, and modal transitions.
  - **Web Audio Harmonic Synthesizer**: Pentatonic musical chimes that pitch-scale as tile values ascend (2 $\rightarrow$ 2048), gentle felt taps on moves, and haptic feedback via `navigator.vibrate`.

- **🎮 Three Engaging Game Modes**:
  - **Classic 2048**: Build toward the 2048 tile and chase your all-time high score.
  - **Daily Challenge**: Deterministic seeded board every day with persistent daily streak tracking.
  - **Dash Mode**: 2-minute timed speedrun challenge to maximize points under pressure.

- **🌐 Universal Multi-Platform Engine (Zero-Dependency)**:
  - Built-in standalone adapters without relying on third-party aggregators like Playgama.
  - Runtime environment sniffing + interactive platform switcher modal.
  - Dedicated export script to generate platform-specific standalone bundles with a single command.

- **💰 Monetization & Rewarded Ad Features**:
  - **Revive Perk**: Watch a rewarded ad upon Game Over to clear the two lowest tiles and keep your run alive!
  - **Free Undo Perk**: Watch a rewarded ad to earn an emergency undo even after multiple moves.
  - **Interstitial Ads**: Non-intrusive ad breaks at natural breakpoints with a 60-second cooldown limiter.

---

## 🕹️ Controls & Navigation

| Action | Controls |
|---|---|
| **Move Tiles** | Arrow keys, WASD, touch swipe, or mouse drag |
| **Undo Move** | `U` key or **Undo** button (free / rewarded ad) |
| **New Game** | `R` key or **New** button |
| **Fullscreen** | `F` key |
| **Dismiss Win Modal** | `Escape` key |
| **Switch Platform SDK** | Click the platform pill at the top of the board |

---

## 🚀 Supported Platforms (13 Built-in Adapters)

This game runs out-of-the-box on:

1. **YouTube Playables** — Full SDK v1 compliance (lifecycle, saves, audio, health, ads, scores)
2. **Facebook Instant Games** — `FBInstant` 7.x initialization, cloud player data, and leaderboards
3. **Poki** — `PokiSDK` v2 loading signals, gameplay events, and commercial/rewarded breaks
4. **CrazyGames** — `CrazyGames.SDK` v3 midgame/rewarded ads and happytime celebrations
5. **Yandex Games** — `YaGames` SDK LoadingAPI, player cloud data, and fullscreen/rewarded ads
6. **GameDistribution** — `gdsdk` interstitial and rewarded ad integrations
7. **Discord Activities** — Embedded App SDK bridge and postMessage RPC protocol
8. **JioGames** — JioGames ad caching and interstitial/rewarded callbacks
9. **Y8 Games** — Y8 ID SDK leaderboards and ad displays
10. **Lagged** — LaggedAPI achievements, score submissions, and ad breaks
11. **Microsoft Store (PWA)** — Progressive Web App with offline service worker & window controls
12. **Huawei & Xiaomi Quick Games** — `qg` native runtime storage and ads
13. **Apple Web Edition** — Standalone browser fallback with local simulation

---

## 🛠️ Quick Start & Local Development

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### 3. Build Production Bundle
```bash
npm run build
```
Emits optimized, relative-pathed assets to `dist/`, ready for immediate hosting or iframe embedding.

### 4. Generate All Platform-Specific Packages
```bash
npm run build:platforms
```
Automatically generates tailored standalone bundles for **YouTube Playables**, **Facebook**, **Poki**, **CrazyGames**, **Yandex**, **GameDistribution**, **Discord**, **Y8**, **Lagged**, and **PWA** in `dist-platforms/`.

---

## 📋 YouTube Playables SDK Integration Checklist

This project strictly adheres to the [YouTube Playables Certification Requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements):

- [x] **SDK Script Loaded Synchronously First**: `<script src="https://www.youtube.com/game_api/v1"></script>` placed at the top of `<head>` in `index.html`.
- [x] **First Frame Signal**: `ytgame.game.firstFrameReady()` fired on first animation frame.
- [x] **Game Ready Signal**: `ytgame.game.gameReady()` fired only when the game is interactable and loading screen dismisses.
- [x] **Cloud Save**: `ytgame.game.saveData(data)` with size limit validation (< 3 MiB) and `String.isWellFormed()` UTF-16 check.
- [x] **Cloud Load**: `ytgame.game.loadData()` called during game boot.
- [x] **Audio State Sync**: `ytgame.system.isAudioEnabled()` and `ytgame.system.onAudioEnabledChange()`.
- [x] **Host Pause & Resume**: `ytgame.system.onPause()` (freezes game timer, saves state, halts audio) and `ytgame.system.onResume()`.
- [x] **User Language**: `ytgame.system.getLanguage()` dynamically applied to document locale.
- [x] **Leaderboard Score**: `ytgame.engagement.sendScore({ value })` on new personal best.
- [x] **Health Telemetry**: `ytgame.health.logError()` and `ytgame.health.logWarning()`.
- [x] **Interstitial Ads**: `ytgame.ads.requestInterstitialAd()` at natural breakpoints.
- [x] **Rewarded Ads**: `ytgame.ads.requestRewardedAd(rewardId)` with player opt-in perks (Revive & Undo).
- [x] **Responsive Aspect Ratios**: Scales from portrait `9:32` to landscape `32:9`.

For detailed certification testing instructions, see [PLAYABLES.md](PLAYABLES.md).

---

## 📁 Project Architecture

```
2048_Game/
├── public/
│   ├── manifest.json            # PWA Web App Manifest
│   ├── sw.js                    # Offline Service Worker
│   └── favicon.ico
├── scripts/
│   └── build-platforms.mjs      # Standalone multi-platform exporter
├── src/
│   ├── components/
│   │   ├── GameGrid.tsx         # Apple-styled game board & squircle grid
│   │   ├── GameTile.tsx         # Dynamic tiles with specular reflections & spring curves
│   │   ├── ScoreBoard.tsx       # Segmented control, score cards, and platform pill
│   │   ├── GameOverModal.tsx    # Frosted glass dialog with rewarded ad revive
│   │   ├── PlatformSelectorModal.tsx # 13-platform switcher modal
│   │   └── Instructions.tsx     # Keyboard & touch control hints
│   ├── hooks/
│   │   └── use2048Game.ts       # Core game state, daily RNG, dash timer, undo stack
│   ├── lib/
│   │   ├── platform/
│   │   │   ├── types.ts         # Unified platform adapter interfaces
│   │   │   ├── platformManager.ts # Master detector & platform switcher
│   │   │   └── adapters/        # Zero-dependency adapters (YouTube, Poki, FB, etc.)
│   │   ├── gameAudio.ts         # Apple Web Audio synthesizer & haptics
│   │   └── playables.ts         # High-level bridge maintaining API compatibility
│   ├── pages/
│   │   └── Index.tsx            # Main game canvas & responsive layout
│   └── index.css                # Apple fluid styling & glassmorphism
├── index.html                   # HTML entry with Playables SDK <head> script
├── PLAYABLES.md                 # Complete YouTube certification documentation
└── package.json
```

---

## 📄 License

This project is licensed under the MIT License.
