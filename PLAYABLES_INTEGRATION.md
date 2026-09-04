# YouTube Playables Integration

This document describes the YouTube Playables SDK integration in this game.

## Overview

The YouTube Playables SDK has been integrated into this game to enable:
- Game lifecycle management (pause/resume)
- Player data persistence (save/load)
- Score reporting
- Audio management
- Ad integration
- Error logging
- Language/locale detection

## Files Added

### 1. **index.html**
- Added YouTube Playables SDK script: `<script src="https://www.youtube.com/game_api/v1"></script>`
- **Important:** The SDK script is loaded BEFORE the main.tsx module to ensure proper initialization

### 2. **src/lib/youtube-playables.ts**
TypeScript module providing:
- Type definitions for the YouTube Playables SDK (`YTGame`, `YTGameAds`, `YTGameSystem`, etc.)
- Utility functions for all SDK operations
- Proper error handling and fallbacks for non-Playables environments

**Key functions:**
- `initializePlayablesSDK()` - Initialize SDK and signal first frame ready
- `signalGameReady()` - Notify YouTube when game is ready to start
- `loadGameData()` - Retrieve saved game state
- `saveGameData(data)` - Persist game state
- `sendScore(score)` - Send player score
- `onGamePause(callback)` - Register pause listener
- `onGameResume(callback)` - Register resume listener
- `isAudioEnabled()` - Check audio state
- `requestInterstitialAd()` - Show interstitial ad
- `requestRewardedAd(rewardId)` - Show rewarded ad
- `isInPlayablesEnvironment()` - Detect if running in YouTube Playables

### 3. **src/hooks/usePlayablesInitialization.ts**
React hook that:
- Initializes the SDK once when the app mounts
- Registers pause/resume/audio callbacks
- Signals game ready to YouTube
- Returns `isInPlayables` flag for conditional rendering

### 4. **src/App.tsx**
Modified to:
- Import and use `usePlayablesInitialization` hook
- Wrap router and routes in `AppContent` component

## Usage Examples

### In React Components

```typescript
import { usePlayablesInitialization } from "@/hooks/usePlayablesInitialization";

function GameComponent() {
  const { isInPlayables } = usePlayablesInitialization();

  return (
    <div>
      {isInPlayables && <p>Running on YouTube Playables</p>}
    </div>
  );
}
```

### Save Game Data

```typescript
import { saveGameData } from "@/lib/youtube-playables";

const gameState = {
  level: 5,
  score: 1000,
  inventory: [...],
};

await saveGameData(JSON.stringify(gameState));
```

### Load Game Data

```typescript
import { loadGameData } from "@/lib/youtube-playables";

const savedData = await loadGameData();
if (savedData) {
  const gameState = JSON.parse(savedData);
  // Restore game state
}
```

### Send Score

```typescript
import { sendScore } from "@/lib/youtube-playables";

await sendScore(1000);
```

### Handle Pause/Resume

```typescript
import { onGamePause, onGameResume } from "@/lib/youtube-playables";

onGamePause(() => {
  console.log("Game paused by user");
  // Pause game logic
});

onGameResume(() => {
  console.log("Game resumed by user");
  // Resume game logic
});
```

### Check Audio State

```typescript
import { isAudioEnabled, onAudioEnabledChange } from "@/lib/youtube-playables";

if (!isAudioEnabled()) {
  // Don't play audio
}

onAudioEnabledChange((enabled) => {
  // Update audio state in game
});
```

### Show Ads

```typescript
import { requestInterstitialAd, requestRewardedAd } from "@/lib/youtube-playables";

// Interstitial ad (banner-like)
await requestInterstitialAd();

// Rewarded ad (player gets reward)
await requestRewardedAd("reward_coins_100");
```

## Required Integrations

According to YouTube Playables certification requirements, the following are required:

- ✅ `firstFrameReady()` - Called during initialization
- ✅ `gameReady()` - Called when game is ready
- ✅ `onPause()` - Implemented with callback
- ✅ `onResume()` - Implemented with callback
- ✅ `isAudioEnabled()` - Available
- ✅ `onAudioEnabledChange()` - Implemented with callback
- ✅ `loadData()` - Available for save/load
- ✅ `saveData()` - Available for persistence

## Recommended Integrations

Additional features available:

- `sendScore()` - Report player scores to YouTube
- `getLanguage()` - Detect player's language preference
- `logError()` / `logWarning()` - Send diagnostics to YouTube
- `requestInterstitialAd()` - Show ads for monetization
- `requestRewardedAd()` - Rewarded ad integration
- `openYTContent()` - Link to YouTube videos

## Testing

The SDK runs as a no-op in local development. To verify integration:

1. Use the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide)
2. Check browser console for any SDK errors
3. Verify all SDK functions are accessible via `window.ytgame`

## Environment Detection

The game automatically detects if it's running in YouTube Playables:

```typescript
import { isInPlayablesEnvironment } from "@/lib/youtube-playables";

if (isInPlayablesEnvironment()) {
  // Load YouTube-specific features
}
```

## Error Handling

All SDK functions include error handling:
- Errors are logged to console (and YouTube in production)
- Functions gracefully degrade if SDK is not available
- Falls back to local storage for save/load if needed

## TypeScript Support

Full TypeScript support is provided with type definitions for:
- `YTGame` - Main SDK namespace
- `YTGameGame` - Game lifecycle functions
- `YTGameSystem` - System callbacks
- `YTGameAds` - Ad functions
- `YTGameEngagement` - Player engagement
- `YTGameHealth` - Error logging
- `YTGameSdkError` - Error type
- `YTGameSdkErrorType` - Error enumeration

## Deployment

Before submitting to YouTube Playables:

1. Run the test suite to validate integration
2. Check that all required callbacks are properly implemented
3. Test pause/resume functionality
4. Verify save/load works correctly
5. Test on actual YouTube Playables platform if possible

## References

- [YouTube Playables Documentation](https://developers.google.com/youtube/gaming/playables)
- [SDK Reference](https://developers.google.com/youtube/gaming/playables/reference/sdk)
- [Integration Requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements_integration)
- [Test Suite Guide](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide)
