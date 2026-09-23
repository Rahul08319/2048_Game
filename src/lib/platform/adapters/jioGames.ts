import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    JioGames?: {
      cacheAd(type: string): void;
      showAd(type: string, callbacks: {
        onAdClosed: () => void;
        onAdFailedToLoad: () => void;
        onAdRewarded?: () => void;
      }): void;
    };
  }
}

export class JioGamesAdapter implements PlatformAdapter {
  readonly id = "jiogames" as const;
  readonly name = "JioGames";
  readonly metadata: PlatformMetadata = {
    id: "jiogames",
    name: "JioGames",
    badge: "JioGames",
    supportsCloudSave: false,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: false,
  };

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {
    if (typeof window !== "undefined" && window.JioGames) {
      window.JioGames.cacheAd("interstitial");
      window.JioGames.cacheAd("rewarded");
    }
  }

  notifyFirstFrameReady(): void {}

  notifyGameReady(): void {}

  isAudioEnabled(): boolean {
    return true;
  }

  async getLanguage(): Promise<string> {
    return "en-IN";
  }

  async loadData(): Promise<string | null> {
    return localStorage.getItem("twenty-forty-eight-dash.save.v1");
  }

  async saveData(data: string): Promise<void> {
    localStorage.setItem("twenty-forty-eight-dash.save.v1", data);
  }

  async sendScore(_score: number): Promise<void> {}

  async requestInterstitialAd(): Promise<boolean> {
    if (window.JioGames?.showAd) {
      return new Promise<boolean>((resolve) => {
        window.JioGames?.showAd("interstitial", {
          onAdClosed: () => resolve(true),
          onAdFailedToLoad: () => resolve(false),
        });
      });
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    if (window.JioGames?.showAd) {
      return new Promise<boolean>((resolve) => {
        let earned = false;
        window.JioGames?.showAd("rewarded", {
          onAdRewarded: () => {
            earned = true;
          },
          onAdClosed: () => resolve(earned),
          onAdFailedToLoad: () => resolve(false),
        });
      });
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[JioGames]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[JioGames]", message);
  }
}
