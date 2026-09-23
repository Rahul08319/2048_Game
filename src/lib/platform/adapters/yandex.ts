import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    YaGames?: {
      init(): Promise<{
        features: {
          LoadingAPI?: { ready(): void };
        };
        adv: {
          showFullscreenAdv(options: {
            callbacks?: {
              onClose?: (wasShown: boolean) => void;
              onError?: (error: unknown) => void;
            };
          }): void;
          showRewardedVideo(options: {
            callbacks?: {
              onOpen?: () => void;
              onRewarded?: () => void;
              onClose?: () => void;
              onError?: (error: unknown) => void;
            };
          }): void;
        };
        getPlayer(options?: { signed?: boolean }): Promise<{
          getData(keys?: string[]): Promise<Record<string, unknown>>;
          setData(data: Record<string, unknown>, flush?: boolean): Promise<void>;
        }>;
        getLeaderboards(): Promise<{
          setLeaderboardScore(leaderboardName: string, score: number): Promise<void>;
        }>;
      }>;
    };
  }
}

export class YandexGamesAdapter implements PlatformAdapter {
  readonly id = "yandex" as const;
  readonly name = "Yandex Games";
  readonly metadata: PlatformMetadata = {
    id: "yandex",
    name: "Yandex Games",
    badge: "Yandex",
    supportsCloudSave: true,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: true,
  };

  private ysdk: Awaited<ReturnType<NonNullable<NonNullable<typeof window.YaGames>["init"]>>> | null = null;
  private player: { getData: (keys?: string[]) => Promise<Record<string, unknown>>; setData: (data: Record<string, unknown>, flush?: boolean) => Promise<void> } | null = null;

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {
    if (typeof window === "undefined" || !window.YaGames) return;
    try {
      this.ysdk = await window.YaGames.init();
      try {
        this.player = await this.ysdk.getPlayer();
      } catch {
        // Player not authenticated
      }
    } catch (e) {
      console.warn("[Yandex] Init error", e);
    }
  }

  notifyFirstFrameReady(): void {
    //
  }

  notifyGameReady(): void {
    if (this.ysdk?.features?.LoadingAPI) {
      try {
        this.ysdk.features.LoadingAPI.ready();
      } catch (e) {
        console.warn("[Yandex] LoadingAPI.ready error", e);
      }
    }
  }

  isAudioEnabled(): boolean {
    return true;
  }

  async getLanguage(): Promise<string> {
    return navigator.language || "ru";
  }

  async loadData(): Promise<string | null> {
    if (this.player) {
      try {
        const data = await this.player.getData(["save_v2"]);
        if (data?.save_v2 && typeof data.save_v2 === "string") return data.save_v2;
      } catch (e) {
        console.warn("[Yandex] loadData error", e);
      }
    }
    return localStorage.getItem("twenty-forty-eight-dash.save.v1");
  }

  async saveData(data: string): Promise<void> {
    if (this.player) {
      try {
        await this.player.setData({ save_v2: data }, true);
        return;
      } catch (e) {
        console.warn("[Yandex] saveData error", e);
      }
    }
    localStorage.setItem("twenty-forty-eight-dash.save.v1", data);
  }

  async sendScore(score: number): Promise<void> {
    if (this.ysdk) {
      try {
        const lb = await this.ysdk.getLeaderboards();
        await lb.setLeaderboardScore("leaderboard", Math.floor(score));
      } catch (e) {
        console.warn("[Yandex] sendScore error", e);
      }
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (this.ysdk) {
      return new Promise<boolean>((resolve) => {
        try {
          this.ysdk?.adv.showFullscreenAdv({
            callbacks: {
              onClose: () => resolve(true),
              onError: () => resolve(false),
            },
          });
        } catch {
          resolve(false);
        }
      });
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    if (this.ysdk) {
      return new Promise<boolean>((resolve) => {
        let earned = false;
        try {
          this.ysdk?.adv.showRewardedVideo({
            callbacks: {
              onRewarded: () => {
                earned = true;
              },
              onClose: () => resolve(earned),
              onError: () => resolve(false),
            },
          });
        } catch {
          resolve(false);
        }
      });
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[Yandex]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[Yandex]", message);
  }
}
