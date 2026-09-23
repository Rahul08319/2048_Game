# YouTube Playables SDK Integration & Certification Guide

This game is fully compliant with the official **YouTube Playables SDK (v1)** specification, certified against the YouTube gaming requirements.

---

## 1. SDK Script Loading

In `index.html`, the YouTube Playables SDK script is loaded **first in `<head>`** before any application bundle:

```html
<script src="https://www.youtube.com/game_api/v1"></script>
```

> [!IMPORTANT]
> The SDK **MUST** be loaded synchronously before any game code to ensure sandbox isolation and immediate API availability.

---

## 2. Implemented SDK Requirements

| Feature | Method | Implementation Details |
|---|---|---|
| **Environment Check** | `ytgame.IN_PLAYABLES_ENV` | Guards all calls; gracefully falls back to standalone web outside YouTube. |
| **First Frame** | `ytgame.game.firstFrameReady()` | Dispatched on the initial `requestAnimationFrame` before user interaction. |
| **Game Ready** | `ytgame.game.gameReady()` | Called only after the React tree renders and loading screen is dismissed. |
| **Cloud Save** | `ytgame.game.saveData(data)` | Persists game state as a UTF-16 well-formed JSON string (capped at 3 MiB with sequential queue). |
| **Cloud Load** | `ytgame.game.loadData()` | Loads game state, score, streaks, and board layout on game launch. |
| **Audio Detection** | `ytgame.system.isAudioEnabled()` | Checks initial audio state from user's YouTube settings. |
| **Audio Listener** | `ytgame.system.onAudioEnabledChange(cb)` | Dynamically toggles audio synthesis and sound effects in real-time. |
| **Pause Lifecycle** | `ytgame.system.onPause(cb)` | Freezes timer, suspends Web Audio context, stops input, and flushes save data. |
| **Resume Lifecycle** | `ytgame.system.onResume(cb)` | Resumes timer, re-enables board input, and resumes audio. |
| **User Language** | `ytgame.system.getLanguage()` | Reads user's BCP-47 language tag and applies to `<html lang="...">`. |
| **Leaderboard Score** | `ytgame.engagement.sendScore({ value })` | Submits integer score (capped at `MAX_SAFE_INTEGER`) to YouTube leaderboard. |
| **Linked Content** | `ytgame.engagement.openYTContent({ id })` | Allows launching YouTube videos or other Playables. |
| **Health Monitoring** | `ytgame.health.logError()` / `logWarning()` | Logs runtime issues directly to YouTube telemetry. |
| **Interstitial Ads** | `ytgame.ads.requestInterstitialAd()` | Triggered on natural breakpoints (after Game Over / restart) with rate-limiting. |
| **Rewarded Ads** | `ytgame.ads.requestRewardedAd(rewardId)` | Player opt-in reward: Revive on Game Over (clears 2 tiles) and Free Undo Bonus. |

---

## 3. Monetization & Ad Integration

### Rewarded Ads
- **Revive Game**: When the player reaches Game Over, they can watch a rewarded ad (`rewardId: "revive-game-save"`) to clear the 2 lowest-value tiles and continue their run.
- **Bonus Undo**: Players can watch a rewarded ad (`rewardId: "free-undo-perk"`) to gain an emergency undo move.

### Interstitial Ads
- Triggered on natural breaks (e.g. after Game Over or between game mode resets) with a built-in 60-second cooldown to guarantee a smooth, non-disruptive user experience.

---

## 4. Testing with the Official SDK Test Suite

1. Start the game locally:
   ```bash
   npm run dev
   ```
2. Open the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite).
3. Enter your local URL (e.g., `http://localhost:8080`).
4. Validate each check:
   - **First Frame Ready**: Confirm signal is received.
   - **Game Ready**: Confirm signal is received after loading completes.
   - **Audio Toggle**: Verify mute/unmute functions cleanly.
   - **Pause / Resume**: Test host-initiated pause and resume state.
   - **Data Save / Load**: Verify board persistence.
   - **Send Score**: Confirm high score transmission.
   - **Ads**: Verify interstitial and rewarded ad callbacks.

### Content Security Policy (CSP) Override for Testing

When testing with Chrome DevTools local overrides, use the required Playables CSP header:

```http
Content-Security-Policy: default-src 'none'; script-src 'report-sample' 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v0 https://www.youtube.com/game_api/v0/ https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' blob: data:; sandbox allow-pointer-lock allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; worker-src 'self' blob:
```

---

## 5. Responsive Aspect Ratios

The game layout dynamically accommodates all Playables viewport ratios:
- **Portrait**: `9:16` through `9:32`
- **Square**: `1:1`
- **Landscape**: `16:9` through `32:9` (automatically adjusts to a dual-column layout with compact controls).
