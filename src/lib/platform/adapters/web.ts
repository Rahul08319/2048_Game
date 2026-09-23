import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

export class WebAdapter implements PlatformAdapter {
  readonly id = "web" as const;
  readonly name = "Apple Web Edition";
  readonly metadata: PlatformMetadata = {
    id: "web",
    name: "Web Edition",
    badge: "Web",
    supportsCloudSave: true,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: true,
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
    // Simulated ad break in web preview
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    // Simulated rewarded ad in web preview
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[Web Adapter]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[Web Adapter]", message);
  }
}
