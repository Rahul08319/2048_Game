import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

export class PwaAdapter implements PlatformAdapter {
  readonly id = "pwa" as const;
  readonly name = "Microsoft Store / PWA";
  readonly metadata: PlatformMetadata = {
    id: "pwa",
    name: "Windows PWA",
    badge: "Windows / PWA",
    supportsCloudSave: true,
    supportsInterstitialAds: false,
    supportsRewardedAds: false,
    supportsLeaderboards: true,
  };

  private deferredPrompt: any = null;

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {
    if (typeof window === "undefined") return;

    // Register service worker for offline play
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {});
      });
    }

    // Capture install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
    });
  }

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
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[PWA]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[PWA]", message);
  }
}
