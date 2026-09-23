import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    CrazyGames?: {
      SDK: {
        init(): Promise<void>;
        ad: {
          requestAd(type: "midgame" | "rewarded", callbacks?: {
            adStarted?: () => void;
            adFinished?: () => void;
            adError?: (error: unknown) => void;
          }): Promise<void>;
        };
        game: {
          gameplayStart(): void;
          gameplayStop(): void;
          happytime(): void;
        };
        data?: {
          setItem(key: string, value: string): void;
          getItem(key: string): string | null;
        };
      };
    };
  }
}

export class CrazyGamesAdapter implements PlatformAdapter {
  readonly id = "crazygames" as const;
  readonly name = "CrazyGames";
  readonly metadata: PlatformMetadata = {
    id: "crazygames",
    name: "CrazyGames",
    badge: "CrazyGames",
    supportsCloudSave: true,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: true,
  };

  private isInitialized = false;

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {
    if (typeof window === "undefined" || !window.CrazyGames?.SDK) return;
    try {
      await window.CrazyGames.SDK.init();
      this.isInitialized = true;
    } catch (e) {
      console.warn("[CrazyGames] Init error", e);
    }
  }

  notifyFirstFrameReady(): void {
    //
  }

  notifyGameReady(): void {
    if (window.CrazyGames?.SDK?.game) {
      try {
        window.CrazyGames.SDK.game.gameplayStart();
      } catch (e) {
        console.warn("[CrazyGames] gameplayStart error", e);
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
    if (window.CrazyGames?.SDK?.data) {
      try {
        return window.CrazyGames.SDK.data.getItem("twenty-forty-eight-dash.save.v1");
      } catch {
        // Fallback
      }
    }
    return localStorage.getItem("twenty-forty-eight-dash.save.v1");
  }

  async saveData(data: string): Promise<void> {
    if (window.CrazyGames?.SDK?.data) {
      try {
        window.CrazyGames.SDK.data.setItem("twenty-forty-eight-dash.save.v1", data);
        return;
      } catch {
        // Fallback
      }
    }
    localStorage.setItem("twenty-forty-eight-dash.save.v1", data);
  }

  async sendScore(score: number): Promise<void> {
    if (window.CrazyGames?.SDK?.game && score >= 2048) {
      try {
        window.CrazyGames.SDK.game.happytime();
      } catch {
        //
      }
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (window.CrazyGames?.SDK?.ad) {
      return new Promise<boolean>((resolve) => {
        try {
          window.CrazyGames?.SDK?.game.gameplayStop();
          window.CrazyGames?.SDK?.ad.requestAd("midgame", {
            adStarted: () => {},
            adFinished: () => {
              window.CrazyGames?.SDK?.game.gameplayStart();
              resolve(true);
            },
            adError: () => {
              window.CrazyGames?.SDK?.game.gameplayStart();
              resolve(false);
            },
          });
        } catch {
          window.CrazyGames?.SDK?.game.gameplayStart();
          resolve(false);
        }
      });
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    if (window.CrazyGames?.SDK?.ad) {
      return new Promise<boolean>((resolve) => {
        try {
          window.CrazyGames?.SDK?.game.gameplayStop();
          window.CrazyGames?.SDK?.ad.requestAd("rewarded", {
            adStarted: () => {},
            adFinished: () => {
              window.CrazyGames?.SDK?.game.gameplayStart();
              resolve(true);
            },
            adError: () => {
              window.CrazyGames?.SDK?.game.gameplayStart();
              resolve(false);
            },
          });
        } catch {
          window.CrazyGames?.SDK?.game.gameplayStart();
          resolve(false);
        }
      });
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[CrazyGames]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[CrazyGames]", message);
  }
}
