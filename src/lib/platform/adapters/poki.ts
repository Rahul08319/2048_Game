import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    PokiSDK?: {
      init(): Promise<void>;
      gameLoadingStart(): void;
      gameLoadingFinished(): void;
      gameplayStart(): void;
      gameplayStop(): void;
      commercialBreak(): Promise<void>;
      rewardedBreak(): Promise<boolean>;
      setDebug(debug: boolean): void;
    };
  }
}

export class PokiAdapter implements PlatformAdapter {
  readonly id = "poki" as const;
  readonly name = "Poki";
  readonly metadata: PlatformMetadata = {
    id: "poki",
    name: "Poki Games",
    badge: "Poki",
    supportsCloudSave: false,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: false,
  };

  private isInitialized = false;

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {
    if (typeof window === "undefined" || !window.PokiSDK) return;
    try {
      window.PokiSDK.gameLoadingStart();
      await window.PokiSDK.init();
      this.isInitialized = true;
    } catch (e) {
      console.warn("[PokiSDK] Init error", e);
    }
  }

  notifyFirstFrameReady(): void {
    // Poki loading sequence
  }

  notifyGameReady(): void {
    if (window.PokiSDK) {
      try {
        window.PokiSDK.gameLoadingFinished();
        window.PokiSDK.gameplayStart();
      } catch (e) {
        console.warn("[PokiSDK] gameLoadingFinished error", e);
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

  async sendScore(_score: number): Promise<void> {
    // Poki uses custom events or backend integration
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (window.PokiSDK) {
      try {
        window.PokiSDK.gameplayStop();
        await window.PokiSDK.commercialBreak();
        window.PokiSDK.gameplayStart();
        return true;
      } catch {
        window.PokiSDK.gameplayStart();
        return false;
      }
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    if (window.PokiSDK) {
      try {
        window.PokiSDK.gameplayStop();
        const success = await window.PokiSDK.rewardedBreak();
        window.PokiSDK.gameplayStart();
        return Boolean(success);
      } catch {
        window.PokiSDK.gameplayStart();
        return false;
      }
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[Poki]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[Poki]", message);
  }
}
