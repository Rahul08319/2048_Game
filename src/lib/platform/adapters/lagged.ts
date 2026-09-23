import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    LaggedAPI?: {
      init(devId: string, pubId: string): void;
      Achievements?: {
        save(achievement: { achievement: string }, callback?: (response: unknown) => void): void;
      };
      Scores?: {
        save(scoreObj: { score: number; board: string }, callback?: (response: unknown) => void): void;
      };
      showAd(): void;
    };
  }
}

export class LaggedAdapter implements PlatformAdapter {
  readonly id = "lagged" as const;
  readonly name = "Lagged";
  readonly metadata: PlatformMetadata = {
    id: "lagged",
    name: "Lagged Games",
    badge: "Lagged",
    supportsCloudSave: false,
    supportsInterstitialAds: true,
    supportsRewardedAds: false,
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

  async sendScore(score: number): Promise<void> {
    if (window.LaggedAPI?.Scores) {
      try {
        window.LaggedAPI.Scores.save({ score: Math.floor(score), board: "high_scores" });
      } catch {
        //
      }
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (window.LaggedAPI?.showAd) {
      try {
        window.LaggedAPI.showAd();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[Lagged]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[Lagged]", message);
  }
}
