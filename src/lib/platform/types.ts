/**
 * Unified Multi-Platform SDK Types
 * Zero-dependency universal adapter interface for web game platforms.
 */

export type PlatformId =
  | "youtube"
  | "facebook"
  | "poki"
  | "crazygames"
  | "yandex"
  | "gamedistribution"
  | "discord"
  | "jiogames"
  | "y8"
  | "lagged"
  | "pwa"
  | "quickgame"
  | "web";

export interface PlatformMetadata {
  id: PlatformId;
  name: string;
  badge: string;
  supportsCloudSave: boolean;
  supportsInterstitialAds: boolean;
  supportsRewardedAds: boolean;
  supportsLeaderboards: boolean;
}

export interface PlatformLifecycleHandlers {
  onAudioEnabledChange?: (enabled: boolean) => void;
  onPause?: () => void;
  onResume?: () => void;
  onLanguage?: (lang: string) => void;
}

export interface PlatformAdapter {
  readonly id: PlatformId;
  readonly name: string;
  readonly metadata: PlatformMetadata;

  /** Initialize the platform SDK */
  initialize(handlers: PlatformLifecycleHandlers): Promise<void>;

  /** Signal that the first rendering frame is ready */
  notifyFirstFrameReady(): void;

  /** Signal that the game is fully loaded and ready for user interaction */
  notifyGameReady(): void;

  /** Check if audio is currently enabled by the host */
  isAudioEnabled(): boolean;

  /** Get the current user language (BCP-47 tag) */
  getLanguage(): Promise<string>;

  /** Load persistent game data */
  loadData(): Promise<string | null>;

  /** Save persistent game data */
  saveData(data: string): Promise<void>;

  /** Submit player's best score to platform leaderboard */
  sendScore(score: number): Promise<void>;

  /** Request an interstitial ad (between games / natural breaks) */
  requestInterstitialAd(): Promise<boolean>;

  /** Request a rewarded ad (player opts in for reward) */
  requestRewardedAd(rewardId: string): Promise<boolean>;

  /** Log health warning to host environment */
  logWarning(message?: string): void;

  /** Log health error to host environment */
  logError(message?: string): void;

  /** Open linked content if supported (e.g. YouTube video or another game) */
  openContent?(contentId: string, type?: string): Promise<void>;
}
