import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    ID?: {
      init(options: { appId: string }): void;
      GameAPI?: {
        Leaderboards?: {
          save(options: { table: string; points: number }): void;
        };
      };
      ads?: {
        display(callback: () => void): void;
      };
    };
  }
}

export class Y8Adapter implements PlatformAdapter {
  readonly id = "y8" as const;
  readonly name = "Y8 Games";
  readonly metadata: PlatformMetadata = {
    id: "y8",
    name: "Y8 Games",
    badge: "Y8",
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
    if (window.ID?.GameAPI?.Leaderboards) {
      try {
        window.ID.GameAPI.Leaderboards.save({ table: "HighScores", points: Math.floor(score) });
      } catch {
        //
      }
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (window.ID?.ads?.display) {
      return new Promise<boolean>((resolve) => {
        try {
          window.ID?.ads?.display(() => resolve(true));
        } catch {
          resolve(false);
        }
      });
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[Y8]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[Y8]", message);
  }
}
