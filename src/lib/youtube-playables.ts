/**
 * YouTube Playables SDK Integration
 * Provides TypeScript bindings and utility functions for the YouTube Playables API
 */

export interface YTGameAds {
  requestInterstitialAd: () => Promise<void>;
  requestRewardedAd: (rewardId: string) => Promise<void>;
}

export interface YTGameEngagement {
  sendScore: (options: { value: number }) => Promise<void>;
  openYTContent: (options: { id: string }) => Promise<void>;
}

export interface YTGameGame {
  firstFrameReady: () => Promise<void>;
  gameReady: () => Promise<void>;
  loadData: () => Promise<string | null>;
  saveData: (data: string) => Promise<void>;
}

export interface YTGameHealth {
  logError: (message: string, error?: Error) => void;
  logWarning: (message: string) => void;
}

export interface YTGameSystem {
  isAudioEnabled: () => boolean;
  onAudioEnabledChange: (callback: (isAudioEnabled: boolean) => void) => void;
  onPause: (callback: () => void) => void;
  onResume: (callback: () => void) => void;
  getLanguage: () => string;
}

export enum YTGameSdkErrorType {
  API_UNAVAILABLE = "API_UNAVAILABLE",
  INVALID_PARAMS = "INVALID_PARAMS",
  SIZE_LIMIT_EXCEEDED = "SIZE_LIMIT_EXCEEDED",
  UNKNOWN = "UNKNOWN",
}

export interface YTGameSdkError extends Error {
  name: "SdkError";
  message: string;
  type: YTGameSdkErrorType;
}

export interface YTGame {
  ads: YTGameAds;
  engagement: YTGameEngagement;
  game: YTGameGame;
  health: YTGameHealth;
  system: YTGameSystem;
  IN_PLAYABLES_ENV: boolean;
  SDK_VERSION: string;
  SdkErrorType: typeof YTGameSdkErrorType;
  SdkError: YTGameSdkError;
}

declare global {
  interface Window {
    ytgame?: YTGame;
  }
}

/**
 * Check if the game is running in the YouTube Playables environment
 */
export function isInPlayablesEnvironment(): boolean {
  return typeof window.ytgame !== "undefined" && window.ytgame.IN_PLAYABLES_ENV;
}

/**
 * Get the SDK version
 */
export function getSdkVersion(): string | null {
  return window.ytgame?.SDK_VERSION ?? null;
}

/**
 * Initialize YouTube Playables SDK with required callbacks
 */
export function initializePlayablesSDK() {
  if (typeof window.ytgame === "undefined") {
    console.warn(
      "YouTube Playables SDK not loaded. The SDK will be available in YouTube Playables environment."
    );
    return;
  }

  try {
    // Signal that the first frame is ready
    window.ytgame.game.firstFrameReady().catch((error) => {
      console.error("Failed to signal first frame ready:", error);
    });
  } catch (error) {
    console.error("Error initializing Playables SDK:", error);
  }
}

/**
 * Signal that the game is ready to start
 */
export async function signalGameReady(): Promise<void> {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  try {
    await window.ytgame.game.gameReady();
  } catch (error) {
    console.error("Failed to signal game ready:", error);
  }
}

/**
 * Load saved game data from YouTube
 */
export async function loadGameData(): Promise<string | null> {
  if (typeof window.ytgame === "undefined") {
    return null;
  }

  try {
    return await window.ytgame.game.loadData();
  } catch (error) {
    console.error("Failed to load game data:", error);
    return null;
  }
}

/**
 * Save game data to YouTube
 */
export async function saveGameData(data: string): Promise<void> {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  try {
    await window.ytgame.game.saveData(data);
  } catch (error) {
    console.error("Failed to save game data:", error);
  }
}

/**
 * Send score to YouTube for display
 */
export async function sendScore(score: number): Promise<void> {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  try {
    await window.ytgame.engagement.sendScore({ value: score });
  } catch (error) {
    console.error("Failed to send score:", error);
  }
}

/**
 * Check if audio is enabled
 */
export function isAudioEnabled(): boolean {
  return window.ytgame?.system.isAudioEnabled() ?? true;
}

/**
 * Register callback for pause events
 */
export function onGamePause(callback: () => void): void {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  window.ytgame.system.onPause(callback);
}

/**
 * Register callback for resume events
 */
export function onGameResume(callback: () => void): void {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  window.ytgame.system.onResume(callback);
}

/**
 * Register callback for audio enabled/disabled changes
 */
export function onAudioEnabledChange(
  callback: (isAudioEnabled: boolean) => void
): void {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  window.ytgame.system.onAudioEnabledChange(callback);
}

/**
 * Get user's language/locale
 */
export function getPlayerLanguage(): string {
  return window.ytgame?.system.getLanguage() ?? "en";
}

/**
 * Log error to YouTube
 */
export function logError(message: string, error?: Error): void {
  if (typeof window.ytgame === "undefined") {
    console.error(message, error);
    return;
  }

  window.ytgame.health.logError(message, error);
}

/**
 * Log warning to YouTube
 */
export function logWarning(message: string): void {
  if (typeof window.ytgame === "undefined") {
    console.warn(message);
    return;
  }

  window.ytgame.health.logWarning(message);
}

/**
 * Request an interstitial ad
 */
export async function requestInterstitialAd(): Promise<void> {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  try {
    await window.ytgame.ads.requestInterstitialAd();
  } catch (error) {
    console.error("Failed to request interstitial ad:", error);
  }
}

/**
 * Request a rewarded ad
 */
export async function requestRewardedAd(rewardId: string): Promise<void> {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  try {
    await window.ytgame.ads.requestRewardedAd(rewardId);
  } catch (error) {
    console.error("Failed to request rewarded ad:", error);
  }
}

/**
 * Open a YouTube video
 */
export async function openYoutubeContent(videoId: string): Promise<void> {
  if (typeof window.ytgame === "undefined") {
    return;
  }

  try {
    await window.ytgame.engagement.openYTContent({ id: videoId });
  } catch (error) {
    console.error("Failed to open YouTube content:", error);
  }
}
