import { platformManager } from "./platform/platformManager";
import type { PlatformLifecycleHandlers } from "./platform/types";

export type PlayablesHandlers = {
  onAudioEnabledChange: (enabled: boolean) => void;
  onPause: () => void;
  onResume: () => void;
  onLanguage: (language: string) => void;
};

export const LOCAL_SAVE_KEY = "twenty-forty-eight-dash.save.v1";

export function getPlayablesSdk() {
  return window.ytgame;
}

export function isInPlayablesEnvironment(): boolean {
  return Boolean(window.ytgame?.IN_PLAYABLES_ENV);
}

export function reportPlayablesHealth(level: "error" | "warning"): void {
  if (level === "error") {
    platformManager.logError();
  } else {
    platformManager.logWarning();
  }
}

export async function loadPlayablesSave(): Promise<string | null> {
  return platformManager.loadData();
}

export function savePlayablesData(data: string): void {
  void platformManager.saveData(data);
}

export async function configurePlayables(handlers: PlayablesHandlers): Promise<() => void> {
  const lifecycleHandlers: PlatformLifecycleHandlers = {
    onAudioEnabledChange: handlers.onAudioEnabledChange,
    onPause: handlers.onPause,
    onResume: handlers.onResume,
    onLanguage: handlers.onLanguage,
  };

  await platformManager.initialize(lifecycleHandlers);
  return () => {};
}

export function notifyPlayableFirstFrameReady(): void {
  platformManager.notifyFirstFrameReady();
}

export function notifyPlayableIsReady(): void {
  platformManager.notifyGameReady();
}

export function reportBestScore(score: number): void {
  void platformManager.sendScore(score);
}

export async function requestInterstitial(): Promise<boolean> {
  return platformManager.requestInterstitialAd();
}

export async function requestRewarded(rewardId: string): Promise<boolean> {
  return platformManager.requestRewardedAd(rewardId);
}

export { platformManager };
