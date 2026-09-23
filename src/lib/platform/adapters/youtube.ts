import type { PlatformAdapter, PlatformLifecycleHandlers, PlatformMetadata } from "../types";

export type YtGameSdk = {
  IN_PLAYABLES_ENV?: boolean;
  SDK_VERSION?: string;
  game?: {
    firstFrameReady?: () => void;
    gameReady?: () => void;
    loadData?: () => Promise<string>;
    saveData?: (data: string) => Promise<void>;
  };
  system?: {
    isAudioEnabled?: () => boolean;
    onAudioEnabledChange?: (callback: (enabled: boolean) => void) => () => void;
    onPause?: (callback: () => void) => () => void;
    onResume?: (callback: () => void) => () => void;
    getLanguage?: () => Promise<string>;
  };
  engagement?: {
    sendScore?: (score: { value: number }) => Promise<void>;
    openYTContent?: (content: { id: string; contentType?: "VIDEO" | "PLAYABLE" }) => Promise<void>;
  };
  ads?: {
    requestInterstitialAd?: () => Promise<void>;
    requestRewardedAd?: (rewardId: string) => Promise<boolean>;
  };
  health?: {
    logError?: () => void;
    logWarning?: () => void;
  };
};

declare global {
  interface Window {
    ytgame?: YtGameSdk;
  }
}

const MAX_SAVE_BYTES = 3 * 1024 * 1024;
const LOCAL_SAVE_KEY = "twenty-forty-eight-dash.save.v1";

export class YouTubePlayablesAdapter implements PlatformAdapter {
  readonly id = "youtube" as const;
  readonly name = "YouTube Playables";
  readonly metadata: PlatformMetadata = {
    id: "youtube",
    name: "YouTube Playables",
    badge: "YouTube",
    supportsCloudSave: true,
    supportsInterstitialAds: true,
    supportsRewardedAds: true,
    supportsLeaderboards: true,
  };

  private sdk: YtGameSdk | undefined;
  private firstFrameSent = false;
  private gameReadySent = false;
  private cleanupFns: Array<() => void> = [];
  private saveQueue = Promise.resolve();

  constructor() {
    this.sdk = typeof window !== "undefined" ? window.ytgame : undefined;
  }

  isAvailable(): boolean {
    return Boolean(this.sdk?.IN_PLAYABLES_ENV);
  }

  async initialize(handlers: PlatformLifecycleHandlers): Promise<void> {
    this.sdk = window.ytgame;
    if (!this.sdk?.IN_PLAYABLES_ENV) {
      // Local or fallback mode
      return;
    }

    try {
      // Hook system error handlers to YouTube Health API
      const onUnhandledError = () => this.logError();
      const onUnhandledRejection = () => this.logWarning();
      window.addEventListener("error", onUnhandledError);
      window.addEventListener("unhandledrejection", onUnhandledRejection);
      this.cleanupFns.push(() => window.removeEventListener("error", onUnhandledError));
      this.cleanupFns.push(() => window.removeEventListener("unhandledrejection", onUnhandledRejection));

      // Audio state
      if (this.sdk.system?.isAudioEnabled && handlers.onAudioEnabledChange) {
        handlers.onAudioEnabledChange(Boolean(this.sdk.system.isAudioEnabled()));
      }
      if (this.sdk.system?.onAudioEnabledChange && handlers.onAudioEnabledChange) {
        const unsub = this.sdk.system.onAudioEnabledChange(handlers.onAudioEnabledChange);
        if (unsub) this.cleanupFns.push(unsub);
      }

      // Pause and Resume
      if (this.sdk.system?.onPause && handlers.onPause) {
        const unsub = this.sdk.system.onPause(handlers.onPause);
        if (unsub) this.cleanupFns.push(unsub);
      }
      if (this.sdk.system?.onResume && handlers.onResume) {
        const unsub = this.sdk.system.onResume(handlers.onResume);
        if (unsub) this.cleanupFns.push(unsub);
      }

      // Language
      if (this.sdk.system?.getLanguage && handlers.onLanguage) {
        const lang = await this.sdk.system.getLanguage();
        if (lang) handlers.onLanguage(lang);
      }
    } catch (err) {
      this.logWarning("YouTube SDK initialization warning");
    }
  }

  notifyFirstFrameReady(): void {
    if (this.firstFrameSent) return;
    try {
      this.sdk?.game?.firstFrameReady?.();
      this.firstFrameSent = true;
    } catch {
      this.logError("Failed to notify firstFrameReady");
    }
  }

  notifyGameReady(): void {
    if (this.gameReadySent) return;
    try {
      this.notifyFirstFrameReady();
      this.sdk?.game?.gameReady?.();
      this.gameReadySent = true;
    } catch {
      this.logError("Failed to notify gameReady");
    }
  }

  isAudioEnabled(): boolean {
    if (this.sdk?.IN_PLAYABLES_ENV && this.sdk.system?.isAudioEnabled) {
      return Boolean(this.sdk.system.isAudioEnabled());
    }
    return true;
  }

  async getLanguage(): Promise<string> {
    if (this.sdk?.IN_PLAYABLES_ENV && this.sdk.system?.getLanguage) {
      try {
        return await this.sdk.system.getLanguage();
      } catch {
        // Fallback
      }
    }
    return navigator.language || "en-US";
  }

  async loadData(): Promise<string | null> {
    try {
      if (this.sdk?.IN_PLAYABLES_ENV && this.sdk.game?.loadData) {
        return await this.sdk.game.loadData();
      }
      return localStorage.getItem(LOCAL_SAVE_KEY);
    } catch {
      this.logWarning("Failed to load game data");
      return null;
    }
  }

  async saveData(data: string): Promise<void> {
    const isWellFormed = (String.prototype as { isWellFormed?: () => boolean }).isWellFormed;
    if ((isWellFormed && !isWellFormed.call(data)) || new TextEncoder().encode(data).byteLength > MAX_SAVE_BYTES) {
      this.logWarning("Save data exceeds size limit or is not well-formed UTF-16");
      return;
    }

    try {
      if (this.sdk?.IN_PLAYABLES_ENV && this.sdk.game?.saveData) {
        this.saveQueue = this.saveQueue
          .catch(() => undefined)
          .then(() => this.sdk?.game?.saveData?.(data))
          .catch(() => this.logWarning("SaveData rejected"));
        return;
      }
      localStorage.setItem(LOCAL_SAVE_KEY, data);
    } catch {
      this.logWarning("Failed to save data");
    }
  }

  async sendScore(score: number): Promise<void> {
    if (!this.sdk?.IN_PLAYABLES_ENV || !this.sdk.engagement?.sendScore) return;
    const value = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(score)));
    try {
      await this.sdk.engagement.sendScore({ value });
    } catch {
      this.logWarning("sendScore failed");
    }
  }

  async requestInterstitialAd(): Promise<boolean> {
    if (!this.sdk?.IN_PLAYABLES_ENV || !this.sdk.ads?.requestInterstitialAd) {
      return true; // No ad to show in local environment
    }
    try {
      await this.sdk.ads.requestInterstitialAd();
      return true;
    } catch {
      this.logWarning("Interstitial ad request failed or unavailable");
      return false;
    }
  }

  async requestRewardedAd(rewardId: string): Promise<boolean> {
    if (!this.sdk?.IN_PLAYABLES_ENV || !this.sdk.ads?.requestRewardedAd) {
      // In local/test mode, simulate a successful rewarded view
      return true;
    }
    try {
      return await this.sdk.ads.requestRewardedAd(rewardId);
    } catch {
      this.logWarning("Rewarded ad request failed");
      return false;
    }
  }

  async openContent(contentId: string, type: "VIDEO" | "PLAYABLE" = "VIDEO"): Promise<void> {
    if (!this.sdk?.IN_PLAYABLES_ENV || !this.sdk.engagement?.openYTContent) return;
    try {
      await this.sdk.engagement.openYTContent({ id: contentId, contentType: type });
    } catch {
      this.logWarning("openYTContent failed");
    }
  }

  logWarning(message?: string): void {
    if (this.sdk?.IN_PLAYABLES_ENV && this.sdk.health?.logWarning) {
      try {
        this.sdk.health.logWarning();
      } catch {
        // Best effort
      }
    } else if (message) {
      console.warn("[YouTube Adapter]", message);
    }
  }

  logError(message?: string): void {
    if (this.sdk?.IN_PLAYABLES_ENV && this.sdk.health?.logError) {
      try {
        this.sdk.health.logError();
      } catch {
        // Best effort
      }
    } else if (message) {
      console.error("[YouTube Adapter]", message);
    }
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}
