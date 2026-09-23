import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    gdsdk?: {
      showAd(adType?: string): Promise<void>;
    };
  }
}

export class GameDistributionAdapter implements PlatformAdapter {
  readonly id = "gamedistribution" as const;
  readonly name = "GameDistribution";
  readonly metadata: PlatformMetadata = {
    id: "gamedistribution",
    name: "GameDistribution",
    badge: "GD",
    supportsCloudSave: false,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: false,
  };

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {}

  notifyFirstFrameReady(): void {}

  notifyGameReady(): void {}

  isAudioEnabled(): boolean {
    return true;
  }

  async getLanguage(): Promise<string> {
    return navigator.language || "en-US";
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem("twenty-forty-eight-dash.save.v1");
  }

  async saveData(data: string): Promise<void> {
    localStorage.setItem("twenty-forty-eight-dash.save.v1", data);
  }

  async sendScore(_score: number): Promise<void> {}

  async requestInterstitialAd(): Promise<boolean> {
    if (window.gdsdk?.showAd) {
      try {
        await window.gdsdk.showAd();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    if (window.gdsdk?.showAd) {
      try {
        await window.gdsdk.showAd("rewarded");
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[GameDistribution]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[GameDistribution]", message);
  }
}
