add all sdk requirements - YouTube Playables SDK is a web SDK for connecting web games with the YouTube
environment. The SDK features a robust API to support games in a variety of ways
to create an excellent gaming experience on YouTube.

## Add the Playables SDK to your game

A game should have an `index.html` file in the root directory. Import the
YouTube Playables SDK by adding this line before any of your game code:

    <script src="https://www.youtube.com/game_api/v1"></script>

> [!IMPORTANT]
> **Important:** The SDK **MUST** be loaded before any of your game code. This creates a reproducible, sandboxed environment and make certain functions available to the game immediately. This is validated during publishing and you can follow the [test suite guide](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide) to validate before submitting your game.

The SDK runs as a no-op when your game is served locally. To verify SDK
integration correctness, use the [test suite guide](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide).

## Integrate with Playables SDK

There are several required and optional integrations with the Playables SDK.

### Required integrations

Review the [publishing requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements) overall, with a focus on [integration
requirements](https://developers.google.com/youtube/gaming/playables/certification/requirements_integration). Review the [Playables SDK reference](https://developers.google.com/youtube/gaming/playables/reference/sdk) for implementation details.

Examples include:

- `ytgame.game.firstFrameReady()`
- `ytgame.game.gameReady()`
- `ytgame.IN_PLAYABLES_ENV`
- `ytgame.system.isAudioEnabled()`
- `ytgame.system.onAudioEnabledChange((isAudioEnabled) => {})`
- `ytgame.system.onPause(() => {})`
- `ytgame.system.onResume(() => {})`
- `ytgame.game.loadData()`
- `ytgame.game.saveData(data)`

### Recommended integrations

In addition to the required integrations, several other functions are available
to create a highly engaging experience. Examples include:

- `ytgame.system.getLanguage()` - Use this to retrieve the user's current locale setting. Don't use other functions or store the language in the cloud save, as this may change at any time.
- `ytgame.engagement.sendScore({ value: newScore })` - Send a best score to YouTube to display.
- `ytgame.engagement.openYTContent({ id: videoID })` - Open a YouTube video.
- `ytgame.health.logError()` and `ytgame.health.logWarning()` - Log issues to YouTube.
- `ytgame.ads.requestInterstitialAd()` and `requestRewardedAd(rewardId:
  string)` - Integrate ads features into your game.

Review the [Playables SDK reference](https://developers.google.com/youtube/gaming/playables/reference/sdk) for implementation details and additional
functions.

### TypeScript type definitions

For games using TypeScript, [download type definitions](https://www.youtube.com/playablesportal/static/youtube_ytgame_web_deploy_mpm_files/index.d.ts).

### Sample games

[Samples are available](https://developers.google.com/youtube/gaming/playables/samples/oss_samples) that demonstrate how to integrate with YouTube
Playables SDK, including plain JavaScript, Flutter web, Godot, and Unity.

## Test your game with the test suite

Once you are ready, you can validate your integration using the test suite. To
learn how, follow the [test suite guide](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide). > [!IMPORTANT]
> **Important:** The SDK MUST be loaded before any of your game code. This creates a reproducible, sandboxed environment and to make certain functions available to the game immediately. This is validated during publishing and you can follow the [test suite guide](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide) to validate before submitting your game.

*** ** * ** ***

## ytgame

The top-level namespace for the YouTube Playables SDK.  

This is a globally scoped variable in the current window. You **MUST NOT** override this variable.

| Namespaces ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads` | The functions and properties related to ads. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement` | The functions and properties related to player engagement. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.game` | The functions and properties related to generic game behaviors. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.health` | The functions and properties related to the game health. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.system` | The functions and properties related to the YouTube system. |

| Enumerations ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkErrorType` | The types of errors that the YouTube Playables SDK throws. |

| Classes ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkError` | The error object that the YouTube Playables SDK throws. |

| Variables ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.IN_PLAYABLES_ENV` | Whether or not the game is running within the Playables environment. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SDK_VERSION` | The YouTube Playables SDK version. |

See also
:
    - <https://developers.google.com/youtube/gaming/playables>

### Enumerations

*** ** * ** ***

#### `Const` SdkErrorType

`SdkErrorType` The types of errors that the YouTube Playables SDK throws.

| Enumeration Members ||
|---|---|
| `API_UNAVAILABLE` | The API was temporarily unavailable. Ask players to retry at a later time if they are in a critical flow. |
| `INVALID_PARAMS` | The API was called with invalid parameters. |
| `SIZE_LIMIT_EXCEEDED` | The API was called with parameters exceeding the size limit. |
| `UNKNOWN` | The error type is unknown. |

### Variables

*** ** * ** ***

#### `Const` IN_PLAYABLES_ENV

`IN_PLAYABLES_ENV: boolean` Whether or not the game is running within the Playables environment. You can use this to determine whether to enable or disable features that are only available inside of Playables. Combine this check with checking for `ytgame` to ensure that the SDK is actually loaded.

Example
:

    ```
    const inPlayablesEnv = typeof ytgame !== "undefined" && ytgame.IN_PLAYABLES_ENV;
    ```

    ```
    // An example of where you may want to fork behavior for saving data.
    if (ytgame?.IN_PLAYABLES_ENV) {
      ytgame.game.saveData(dataStr);
    } else {
      window.localStorage.setItem("SAVE_DATA", dataStr);
    }
    ```

*** ** * ** ***

#### `Const` SDK_VERSION

`SDK_VERSION: string` The YouTube Playables SDK version.

Example
:

    ```
    // Prints the SDK version to console. Do not do this in production.
    console.log(ytgame.SDK_VERSION);
    ```

*** ** * ** ***

## ytgame.SdkError

Extends `Error` The error object that the YouTube Playables SDK throws.  

The `SdkError` object is a child of [`Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error) and contains an additional field.

| Constructors ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkError.constructor` |   |

| Properties ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkError.errorType` | The type of the error. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkError.message` |   |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkError.name` |   |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkError.stack` |   |

### Properties

*** ** * ** ***

#### errorType

`errorType:
https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.SdkErrorType` The type of the error.

*** ** * ** ***

## ytgame.ads

The functions and properties related to ads.

| Functions ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads.requestInterstitialAd` | Requests an interstitial ad to be shown. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads.requestRewardedAd` | Requests a rewarded ad to be shown for a particular reward type. |

### Functions

*** ** * ** ***

#### requestInterstitialAd

`requestInterstitialAd(): Promise<void>` Requests an interstitial ad to be shown.  

Makes no guarantees about whether the ad was shown. Do not use this API to reward players for watching an ad.

Example
:

    ```
    try {
      await ytgame.ads.requestInterstitialAd();
      // Ad request successful, do something else.
    } catch (error) {
      // Handle errors, retry logic, etc.
      // Note that error may be undefined.
    }
    ```

| Returns ||
|---|---|
| `Promise<void>` | a promise that resolves on a successful request or rejects/throws on an unsuccessful request. |

*** ** * ** ***

#### requestRewardedAd

`requestRewardedAd(rewardId: string): Promise<boolean>` Requests a rewarded ad to be shown for a particular reward type.  

Makes no guarantees about whether the ad was shown.

Example
:

    ```
    try {
      const isRewardEarned = await ytgame.ads.requestRewardedAd("reward-123");
      // Handle reward being earned or not.
    } catch (error) {
      // Handle errors, retry logic, etc.
      // Note that error may be undefined.
    }
    ```

| Parameters ||
|---|---|
| `rewardId: string` | Required. An identifier which uniquely identifies the claimable reward type. You must use a unique ID for each type of reward, and re-use that same ID each time that specific reward type is offered. For example, you could make the ID readable or a UUID. You can include this as a hard-coded ID in your game code for the specific reward. Our only requirements are that you provide an ID and that it not contain any user data. For example: - 100-coins-reward-12 - "100 coins" - 7defcfa2-4312-4893-a13a-a84e0c47a4df - "3 lives" - 121b001a-0c25-4289-88f6-58e3620d938f - "Skip level" |

| Returns ||
|---|---|
| `Promise<boolean>` | A promise that resolves on a successful request with value true if the user met the conditions to receive a reward, or false if they did not. The promise rejects/throws on an unsuccessful request. |

*** ** * ** ***

## ytgame.engagement

The functions and properties related to player engagement.

| Enumerations ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.ContentType` | The possible types of content. |

| Interfaces ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Content` | The content object the game sends to YouTube. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Score` | The score object the game sends to YouTube. |

| Functions ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.openYTContent` | Requests YouTube to open content corresponding to the provided content ID. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.sendScore` | Sends a score to YouTube. |

### Enumerations

*** ** * ** ***

#### `Const` ContentType

`ContentType` The possible types of content.

| Enumeration Members ||
|---|---|
| `PLAYABLE` | A YouTube Playable. |
| `VIDEO` | A YouTube video. |

### Functions

*** ** * ** ***

#### openYTContent

`openYTContent(content: https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Content): Promise<void>` Requests YouTube to open content corresponding to the provided content ID.  

Generally, this will open the content in a new tab on web. On mobile, a video will open in the mini player and a Playable will replace the currently open Playable.

Example
:

    ```
    // Open a video.
    async function showVideo(videoID: string) {
      try {
        await ytgame.engagement.openYTContent({
          id: videoID,
          contentType: ytgame.engagement.ContentType.VIDEO,
        });
        // Request successful, content may have opened.
      } catch (error) {
        // Handle errors, retry logic, etc.
        // Note that error may be undefined.
      }
    }

    // Open a Playable.
    async function openDifferentPlayable(playableID: string) {
      try {
        await ytgame.engagement.openYTContent({
          id: playableID,
          contentType: ytgame.engagement.ContentType.PLAYABLE,
        });
        // Request successful, content may have opened.
        // On mobile, the new Playable will replace the current one.
      } catch (error) {
        // Handle errors, retry logic, etc.
        // Note that error may be undefined.
      }
    }
    ```

| Parameters ||
|---|---|
| `content: https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Content` | the content to open on YouTube. |

| Returns ||
|---|---|
| `Promise<void>` | a Promise that resolves when succeeded and rejects/throws with an `ytgame.SdkError` when failed. |

*** ** * ** ***

#### sendScore

`sendScore(score: https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Score): Promise<void>` Sends a score to YouTube.  

The score should represent one dimension of progress within the game. If there are multiple dimensions, the developer must choose one dimension to be consistent. Scores will be sorted and the highest score will be displayed in YouTube UI so any in-game high score UI should align with what is being sent through this API.

Example
:

    ```
    async function onScoreAwarded(score: number) {
      try {
        await ytgame.engagement.sendScore({ value: score });
        // Score sent successfully, do something else.
      } catch (error) {
        // Handle errors, retry logic, etc.
        // Note that error may be undefined.
      }
    }
    ```

| Parameters ||
|---|---|
| `score: https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Score` | the score to send to YouTube. |

| Returns ||
|---|---|
| `Promise<void>` | a Promise that resolves when succeeded and rejects/throws with an `ytgame.SdkError` when failed. |

*** ** * ** ***

## ytgame.engagement.Content

The content object the game sends to YouTube.

| Properties ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Content.contentType` | The type of content to open. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Content.id` | The ID of the content we want to open. |

### Properties

*** ** * ** ***

#### `Optional` contentType

`contentType?:
https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.ContentType` The type of content to open. Should be provided, but if not provided, `VIDEO` will be assumed.

*** ** * ** ***

#### id

`id: string` The ID of the content we want to open.

*** ** * ** ***

## ytgame.engagement.Score

The score object the game sends to YouTube.

| Properties ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.engagement.Score.value` | The score value expressed as an integer. |

### Properties

*** ** * ** ***

#### value

`value: number` The score value expressed as an integer. The score must be less than or equal to the [maximum safe integer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER). Otherwise, the score will be rejected.

*** ** * ** ***

## ytgame.game

The functions and properties related to generic game behaviors.

| Functions ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.game.firstFrameReady` | Notifies YouTube that the game has begun showing frames. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.game.gameReady` | Notifies YouTube that the game is ready for players to interact with. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.game.loadData` | Loads game data from YouTube in the form of a serialized string. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.game.saveData` | Saves game data to the YouTube in the form of a serialized string. |

### Functions

*** ** * ** ***

#### firstFrameReady

`firstFrameReady(): void` Notifies YouTube that the game has begun showing frames.  

The game **MUST** call this API. Otherwise, the game is not shown to users. `firstFrameReady()` **MUST** be called before `gameReady()`.

Example
:

    ```
    function onGameInitialized() {
      ytgame.game.firstFrameReady();
    }
    ```

*** ** * ** ***

#### gameReady

`gameReady(): void` Notifies YouTube that the game is ready for players to interact with.  

The game **MUST** call this API when it is interactable. The game **MUST NOT** call this API when a loading screen is still shown. Otherwise, the game fails the YouTube certification process.

Example
:

    ```
    function onGameInteractable() {
      ytgame.game.gameReady();
    }
    ```

*** ** * ** ***

#### loadData

`loadData(): Promise<string>` Loads game data from YouTube in the form of a serialized string.  

The game **must** handle any parsing between the string and an internal format.

Example
:

    ```
    async function gameSetup() {
      try {
        const data = await ytgame.game.loadData();
        // Load succeeded, do something with data.
      } catch (error) {
        // Handle errors, retry logic, etc.
        // Note that error may be undefined.
      }
    }
    ```

| Returns ||
|---|---|
| `Promise<string>` | a Promise that completes when loading succeeded and rejects with an `ytgame.SdkError` when failed. |

*** ** * ** ***

#### saveData

`saveData(data: string): Promise<void>` Saves game data to the YouTube in the form of a serialized string.  

The string **must** be a valid, well-formed UTF-16 string and a maximum of 3 MiB. The game **must** handle any parsing between the string and an internal format. If necessary, use `String.isWellFormed()` to check if the string is well-formed.

Example
:

    ```
    async function saveGame() {
      try {
        ytgame.game.saveData(JSON.stringify(gameSave));
        // Save succeeded.
      } catch (error) {
        // Handle errors, retry logic, etc.
        // Note that error may be undefined.
      }
    }
    ```

| Parameters ||
|---|---|
| `data: string` |   |

| Returns ||
|---|---|
| `Promise<void>` | a Promise that resolves when saving succeeded and rejects with an `ytgame.SdkError` when failed. |

*** ** * ** ***

## ytgame.health

The functions and properties related to the game health.

| Functions ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.health.logError` | Logs an error to YouTube. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.health.logWarning` | Logs a warning to YouTube. |

### Functions

*** ** * ** ***

#### logError

`logError(): void` Logs an error to YouTube.  

**Note:** This API is best-effort and rate-limited which can result in data loss.

Example
:

    ```
    function onError() {
      ytgame.health.logError();
    }
    ```

*** ** * ** ***

#### logWarning

`logWarning(): void` Logs a warning to YouTube.  

**Note:** This API is best-effort and rate-limited which can result in data loss.

Example
:

    ```
    function onWarning() {
      ytgame.health.logWarning();
    }
    ```

*** ** * ** ***

## ytgame.system

The functions and properties related to the YouTube system.

| Functions ||
|---|---|
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.system.getLanguage` | Returns the language that is set in the user's YouTube settings in the form of a [BCP-47 language tag](https://www.rfc-editor.org/info/bcp47). |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.system.isAudioEnabled` | Returns whether the game audio is enabled in the YouTube settings. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.system.onAudioEnabledChange` | Sets a callback to be triggered when the audio settings change event is fired from YouTube. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.system.onPause` | Sets a callback to be triggered when a pause game event is fired from YouTube. |
| `https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.system.onResume` | Sets a callback to be triggered when a resume game event is fired from YouTube. |

### Functions

*** ** * ** ***

#### getLanguage

`getLanguage(): Promise<string>` Returns the language that is set in the user's YouTube settings in the form of a [BCP-47 language tag](https://www.rfc-editor.org/info/bcp47).  

Do not use other functions to determine the user's language or locale, or store their language preference in the cloud save. Instead, use this function to ensure that the user experience is consistent across YouTube.

Example
:

    ```
    const localeTag = await ytgame.system.getLanguage();
    // `localeTag` is now set to something like "en-US" or "es-419".
    ```

| Returns ||
|---|---|
| `Promise<string>` | a Promise that completes when getting the language succeeded and rejects with an `ytgame.SdkError` when failed. |

*** ** * ** ***

#### isAudioEnabled

`isAudioEnabled(): boolean` Returns whether the game audio is enabled in the YouTube settings.  

The game **SHOULD** use this to initialize the game audio state.

Example
:

    ```
    function initGameSound() {
      if (ytgame.system.isAudioEnabled()) {
        // Enable game audio.
      } else {
        // Disable game audio.
      }
    }
    ```

| Returns ||
|---|---|
| `boolean` | a boolean indicating whether the audio is enabled. |

*** ** * ** ***

#### onAudioEnabledChange

`onAudioEnabledChange(callback: ((isAudioEnabled: boolean) => void)): (() => void)` Sets a callback to be triggered when the audio settings change event is fired from YouTube.  

The game **MUST** use this API to update the game audio state.

Example
:

    ```
    ytgame.system.onAudioEnabledChange((isAudioEnabled) => {
      if (isAudioEnabled) {
        // Enable game audio.
      } else {
        // Disable game audio.
      }
    });
    ```

| Parameters ||
|---|---|
| `callback: ((isAudioEnabled: boolean) => void)` | the callback function to be triggered. |

| Returns ||
|---|---|
| `(() => void)` | a function to unset the callback that is usually unused. |

*** ** * ** ***

#### onPause

`onPause(callback: (() => void)): (() => void)` Sets a callback to be triggered when a pause game event is fired from YouTube. The game has a short window to save any state before it is evicted.  

onPause is called for all types of pauses, including when the user exits the game. There is no guarantee that the game will resume.

Example
:

    ```
    ytgame.system.onPause(() => {
      pauseGame();
    });

    function pauseGame() {
      // Logic to pause game state.
    }
    ```

| Parameters ||
|---|---|
| `callback: (() => void)` | the callback function to be triggered. |

| Returns ||
|---|---|
| `(() => void)` | a function to unset the callback that is usually unused. |

*** ** * ** ***

#### onResume

`onResume(callback: (() => void)): (() => void)` Sets a callback to be triggered when a resume game event is fired from YouTube.  

After being paused, the game is not guaranteed to resume.

Example
:

    ```
    ytgame.system.onResume(() => {
      resumeGame();
    });

    function resumeGame() {
      // Logic to resume game state.
    }
    ```

| Parameters ||
|---|---|
| `callback: (() => void)` | the callback function to be triggered. |

| Returns ||
|---|---|
| `(() => void)` | a function to unset the callback that is usually unused. |# Playables SDK Test Suite

[Go to the SDK Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite)

## Test http response headers

When your game is served on YouTube, it includes a [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
response header as an added layer of security.

This limits the kinds of sources Playables can depend on and the kinds of
network requests that can be made from Playables. To minimize issues with
certification and improve the integration process, override the HTTP response
headers for your `index.html` file when testing locally to catch CSP violations
as early as possible.

You can follow this [article](https://developer.chrome.com/docs/devtools/overrides) to set up local overrides in Chrome.
Once you have your overrides setup for your locally served game, use the
following string to override the `Content-Security-Policy` header:

    default-src 'none'; script-src 'report-sample' 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v0 https://www.youtube.com/game_api/v0/ https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' blob: data:; sandbox allow-pointer-lock allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; worker-src 'self' blob:Turn your Playables into revenue with YouTube's built-in monetization.

## Understand ads-based monetization

YouTube offers built-in monetization functions for games, starting with ads. We
support three ad opportunities with your games:

- **Pre-roll ads**: Ads shown while your game is initially loading
- **Interstitial ads**: Ads shown during a natural breakpoint within the game, such as level completion
- **Rewarded ads**: Ads that users opt into viewing in exchange for in-game items or experiences

A subset of users in [Playables-eligible regions](https://support.google.com/youtube/answer/14328604) and platforms see these ad
slots.

We'll keep you updated as we continue to enhance and expand ads-based
monetization.

## Integrate with ads-based monetization

YouTube handles pre-roll ads automatically---no integration work is required on
your end.

While YouTube handles pre-roll ads automatically, you can implement interstitial
and rewarded ads in about 5 minutes using the [Playables SDK ads features](https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads).

> [!TIP]
> **Tip:** **Handle errors gracefully**: Players will engage with your game across a wide range of devices and network conditions. Always implement fallback logic in your code to handle situations where an ad request fails.

### Prerequisites

Before integrating:

- Ensure you have access to the [Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite) to verify your integration.
- If your game uses TypeScript, ensure you have the latest [type definitions](https://www.youtube.com/playablesportal/static/youtube_ytgame_web_deploy_mpm_files/index.d.ts) to make integration easier.
- Check if [code samples](https://developers.google.com/youtube/gaming/playables/samples/oss_samples) are available that demonstrate how to integrate with YouTube Playables SDK.

### Integrate interstitial ads

Interstitial ads take just a minute to implement. Simply call
[`requestInterstitialAd()`](https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads.requestInterstitialAd) at logical pauses in your gameplay, such as
**between levels** , after a "**Game Over** " screen, or during **mid-game
loading** sequences:

    try {
      await ytgame.ads.requestInterstitialAd();
      // Ad request successful
    } catch (error) {
      // Handle errors, retry logic, etc.
    }

### Integrate rewarded ads

Rewarded ads are equally quick to integrate. Call [`requestRewardedAd(id)`](https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads.requestRewardedAd)
whenever a player explicitly requests a rewarded ad.

**You must select and pass a unique reward ID**. You can hard-code these IDs
directly into your game.

When creating your IDs, follow these requirements:

- **Do not** include any user data.
- **Do** use a readable string (e.g., `"100-coins-reward-12"`) or a standard UUID (e.g., `"21403813-2e22-4316-a8b2-7d4f52a6f6fb"`).

    try {
      const rewardEarned =
        await ytgame.ads.requestRewardedAd('reward-id-123');
      if (rewardEarned) {
        // Handle the earned case.
      } else {
        // Handle the not earned case.
      }
    } catch (error) {
      // Handle errors, retry logic, etc.
    }

For more information, review the [Playables SDK ads features](https://developers.google.com/youtube/gaming/playables/reference/sdk#ytgame.ads) for implementation
details and additional examples.

## Test ads-based monetization

Once you are ready, you can validate your integration using the [Playables Test
Suite](https://developers.google.com/youtube/gaming/playables/test_suite). To
learn how, follow the [test suite guide](https://developers.google.com/youtube/gaming/playables/reference/test_suite_guide).

Ads are also enabled for development and staging game releases, though they are
limited to a subset of [Playables-eligible regions](https://support.google.com/youtube/answer/14328604) and platforms.

## Manage ads-based monetization

Once integrated, you can control some of these ad types for your game in the
[Playables Developer Portal](https://www.youtube.com/playables_portal) if you need to toggle them off or on for testing or
validation. These ad types default to "on".

## Next steps

### Revenue sharing pilot

We are in the initial phase of Playables monetization. To get early feedback, we
are piloting revenue sharing with a select number of Playable creators. We aim
to align with the broader YouTube monetization programs over time, enabling us
to scale the number of creators who earn from Playables monetization. We will
share more information as the program expands.

### Join the community

Want to discuss monetization, get help with your integration, or give feedback?
Join our [Discord community](https://discord.gg/eEFBtMswKT).