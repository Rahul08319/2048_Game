import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    FBInstant?: {
      initializeAsync(): Promise<void>;
      startGameAsync(): Promise<void>;
      setLoadingProgress(percentage: number): void;
      getLocale(): string;
      onPause(callback: () => void): void;
      player: {
        getID(): string;
        getName(): string;
        getDataAsync(keys: string[]): Promise<Record<string, unknown>>;
        setDataAsync(data: Record<string, unknown>): Promise<void>;
      };
      getLeaderboardAsync(name: string): Promise<{
        setScoreAsync(score: number, extraData?: string): Promise<void>;
      }>;
      getInterstitialAdAsync(placementId: string): Promise<{
        loadAsync(): Promise<void>;
        showAsync(): Promise<void>;
      }>;
      getRewardedVideoAsync(placementId: string): Promise<{
        loadAsync(): Promise<void>;
        showAsync(): Promise<void>;
      }>;
    };
  }
}

export class FacebookInstantAdapter implements PlatformAdapter {
  readonly id = "facebook" as const;
  readonly name = "Facebook Instant Games";
  readonly metadata: PlatformMetadata = {
    id: "facebook",
    name: "Facebook Instant Games",
    badge: "Facebook",
    supportsCloudSave: true,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: true,
  };

  private isInitialized = false;

  async initialize(handlers: PlatformLifecycleHandlers): Promise<void> {
    if (typeof window === "undefined" || !window.FBInstant) return;
    try {
      await window.FBInstant.initializeAsync();
      window.FBInstant.setLoadingProgress(100);
      if (handlers.onLanguage) {
        handlers.onLanguage(window.FBInstant.getLocale() || "en-US");
      }
      if (handlers.onPause) {
        window.FBInstant.onPause(handlers.onPause);
      }
      this.isInitialized = true;
    } catch (e) {
      console.warn("[FBInstant] Init warning:", e);
    }
  }

  notifyFirstFrameReady(): void {
    // Handled in startGameAsync
  }

  notifyGameReady(): void {
    if (typeof window !== "undefined" && window.FBInstant) {
      window.FBInstant.startGameAsync().catch((e) => console.warn("[FBInstant] startGame error", e));
    }
  }

  isAudioEnabled(): boolean {
    return true;
  }

  async getLanguage(): Promise<string> {
    return window.FBInstant?.getLocale?.() || navigator.language || "en-US";
  }

  async loadData(): Promise<string | null> {
    if (window.FBInstant?.player?.getDataAsync) {
      try {
        const res = await window.FBInstant.player.getDataAsync(["save_v2"]);
        if (res?.save_v2 && typeof res.save_v2 === "string") return res.save_v2;
      } catch (e) {
        console.warn("[FBInstant] loadData error", e);
      }
    }
    return localStorage.getItem("twenty-forty-eight-dash.save.v1");
  }

  async saveData(data: string): Promise<void> {
    if (window.FBInstant?.player?.setDataAsync) {
      try {
        await window.FBInstant.player.setDataAsync({ save_v2: data });
        return;
      } catch (e) {
        console.warn("[FBInstant] saveData error", e);
      }
    }
    localStorage.setItem("twenty-forty-eight-dash.save.v1", data);
  }

  async sendScore(score: number): Promise<void> {
    if (window.FBInstant?.getLeaderboardAsync) {
      try {
        const lb = await window.FBInstant.getLeaderboardAsync("global_best");
        await lb.setScoreAsync(Math.floor(score));
      } catch (e) {
        console.warn("[FBInstant] sendScore error", e);
      }
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (window.FBInstant?.getInterstitialAdAsync) {
      try {
        const ad = await window.FBInstant.getInterstitialAdAsync("YOUR_PLACEMENT_ID");
        await ad.loadAsync();
        await ad.showAsync();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  async requestRewardedAd(rewardId: string): Promise<boolean> {
    if (window.FBInstant?.getRewardedVideoAsync) {
      try {
        const ad = await window.FBInstant.getRewardedVideoAsync("YOUR_REWARDED_ID");
        await ad.loadAsync();
        await ad.showAsync();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[FBInstant]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[FBInstant]", message);
  }
}
