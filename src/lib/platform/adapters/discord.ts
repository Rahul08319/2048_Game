import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

export class DiscordActivityAdapter implements PlatformAdapter {
  readonly id = "discord" as const;
  readonly name = "Discord Activities";
  readonly metadata: PlatformMetadata = {
    id: "discord",
    name: "Discord Activities",
    badge: "Discord",
    supportsCloudSave: true,
    supportsInterstitialAds: false,
    supportsRewardedAds: false,
    supportsLeaderboards: true,
  };

  private isConnected = false;

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {
    // Check if running inside Discord iframe
    if (typeof window !== "undefined" && (window.location.search.includes("frame_id") || window.parent !== window)) {
      this.isConnected = true;
      try {
        window.parent.postMessage({ type: "DISCORD_READY" }, "*");
      } catch {
        //
      }
    }
  }

  notifyFirstFrameReady(): void {}

  notifyGameReady(): void {
    if (this.isConnected) {
      try {
        window.parent.postMessage({ type: "GAME_READY" }, "*");
      } catch {
        //
      }
    }
  }

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

  async sendScore(score: number): Promise<void> {
    if (this.isConnected) {
      try {
        window.parent.postMessage({ type: "SET_SCORE", score }, "*");
      } catch {
        //
      }
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[Discord]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[Discord]", message);
  }
}
