import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

declare global {
  interface Window {
    qg?: {
      getStorage(options: { key: string; success: (res: { data: string }) => void; fail?: () => void }): void;
      setStorage(options: { key: string; data: string; success?: () => void; fail?: () => void }): void;
      createInterstitialAd(options: { adUnitId: string }): {
        load(): Promise<void>;
        show(): Promise<void>;
      };
      createRewardedVideoAd(options: { adUnitId: string }): {
        load(): Promise<void>;
        show(): Promise<void>;
        onClose(callback: (res: { isEnded: boolean }) => void): void;
      };
    };
  }
}

export class QuickGameAdapter implements PlatformAdapter {
  readonly id = "quickgame" as const;
  readonly name = "Huawei & Xiaomi Quick Games";
  readonly metadata: PlatformMetadata = {
    id: "quickgame",
    name: "Quick Games",
    badge: "QuickGame",
    supportsCloudSave: true,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: false,
  };

  async initialize(_handlers: PlatformLifecycleHandlers): Promise<void> {}

  notifyFirstFrameReady(): void {}

  notifyGameReady(): void {}

  isAudioEnabled(): boolean {
    return true;
  }

  async getLanguage(): Promise<string> {
    return navigator.language || "zh-CN";
  }

  async loadData(): Promise<string | null> {
    if (typeof window !== "undefined" && window.qg?.getStorage) {
      return new Promise<string | null>((resolve) => {
        window.qg?.getStorage({
          key: "save_v2",
          success: (res) => resolve(res.data),
          fail: () => resolve(localStorage.getItem("twenty-forty-eight-dash.save.v1")),
        });
      });
    }
    return localStorage.getItem("twenty-forty-eight-dash.save.v1");
  }

  async saveData(data: string): Promise<void> {
    if (typeof window !== "undefined" && window.qg?.setStorage) {
      window.qg.setStorage({ key: "save_v2", data });
      return;
    }
    localStorage.setItem("twenty-forty-eight-dash.save.v1", data);
  }

  async sendScore(_score: number): Promise<void> {}

  async requestInterstitialAd(): Promise<boolean> {
    if (typeof window !== "undefined" && window.qg?.createInterstitialAd) {
      try {
        const ad = window.qg.createInterstitialAd({ adUnitId: "test" });
        await ad.load();
        await ad.show();
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  async requestRewardedAd(_rewardId: string): Promise<boolean> {
    if (typeof window !== "undefined" && window.qg?.createRewardedVideoAd) {
      return new Promise<boolean>((resolve) => {
        try {
          const ad = window.qg?.createRewardedVideoAd({ adUnitId: "test" });
          ad?.onClose((res) => resolve(Boolean(res?.isEnded)));
          ad?.load().then(() => ad.show()).catch(() => resolve(false));
        } catch {
          resolve(false);
        }
      });
    }
    return true;
  }

  logWarning(message?: string): void {
    if (message) console.warn("[QuickGame]", message);
  }

  logError(message?: string): void {
    if (message) console.error("[QuickGame]", message);
  }
}
