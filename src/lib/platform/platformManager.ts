import type { PlatformAdapter, PlatformId, PlatformLifecycleHandlers, PlatformMetadata } from "./types";
import { YouTubePlayablesAdapter } from "./adapters/youtube";
import { FacebookInstantAdapter } from "./adapters/facebook";
import { PokiAdapter } from "./adapters/poki";
import { CrazyGamesAdapter } from "./adapters/crazygames";
import { YandexGamesAdapter } from "./adapters/yandex";
import { GameDistributionAdapter } from "./adapters/gameDistribution";
import { DiscordActivityAdapter } from "./adapters/discord";
import { JioGamesAdapter } from "./adapters/jioGames";
import { Y8Adapter } from "./adapters/y8";
import { LaggedAdapter } from "./adapters/lagged";
import { PwaAdapter } from "./adapters/pwa";
import { QuickGameAdapter } from "./adapters/quickGame";
import { WebAdapter } from "./adapters/web";

class PlatformManager {
  private adapters: Map<PlatformId, PlatformAdapter> = new Map();
  private currentAdapter: PlatformAdapter;
  private handlers: PlatformLifecycleHandlers = {};
  private listeners: Set<(adapter: PlatformAdapter) => void> = new Set();

  constructor() {
    // Register all platform adapters
    const yt = new YouTubePlayablesAdapter();
    const fb = new FacebookInstantAdapter();
    const poki = new PokiAdapter();
    const crazy = new CrazyGamesAdapter();
    const yandex = new YandexGamesAdapter();
    const gd = new GameDistributionAdapter();
    const discord = new DiscordActivityAdapter();
    const jio = new JioGamesAdapter();
    const y8 = new Y8Adapter();
    const lagged = new LaggedAdapter();
    const pwa = new PwaAdapter();
    const qg = new QuickGameAdapter();
    const web = new WebAdapter();

    this.adapters.set("youtube", yt);
    this.adapters.set("facebook", fb);
    this.adapters.set("poki", poki);
    this.adapters.set("crazygames", crazy);
    this.adapters.set("yandex", yandex);
    this.adapters.set("gamedistribution", gd);
    this.adapters.set("discord", discord);
    this.adapters.set("jiogames", jio);
    this.adapters.set("y8", y8);
    this.adapters.set("lagged", lagged);
    this.adapters.set("pwa", pwa);
    this.adapters.set("quickgame", qg);
    this.adapters.set("web", web);

    // Initial detection
    const detectedId = this.detectPlatform();
    this.currentAdapter = this.adapters.get(detectedId) || yt;
  }

  private detectPlatform(): PlatformId {
    if (typeof window === "undefined") return "youtube";

    // 1. Check URL override ?platform=xyz
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("platform")?.toLowerCase() as PlatformId | undefined;
    if (requested && this.adapters.has(requested)) {
      return requested;
    }

    // 2. Runtime environment sniffing
    if (window.ytgame?.IN_PLAYABLES_ENV) return "youtube";
    if (typeof window.FBInstant !== "undefined") return "facebook";
    if (typeof window.PokiSDK !== "undefined") return "poki";
    if (typeof window.CrazyGames !== "undefined") return "crazygames";
    if (typeof window.YaGames !== "undefined") return "yandex";
    if (typeof window.gdsdk !== "undefined") return "gamedistribution";
    if (typeof window.JioGames !== "undefined") return "jiogames";
    if (typeof window.ID !== "undefined") return "y8";
    if (typeof window.LaggedAPI !== "undefined") return "lagged";
    if (typeof window.qg !== "undefined") return "quickgame";
    if (window.location.search.includes("frame_id")) return "discord";
    if (window.matchMedia("(display-mode: standalone)").matches) return "pwa";

    // Default to YouTube Playables (as it's the primary SDK loaded in index.html)
    return "youtube";
  }

  get current(): PlatformAdapter {
    return this.currentAdapter;
  }

  get metadata(): PlatformMetadata {
    return this.currentAdapter.metadata;
  }

  getAllPlatforms(): PlatformMetadata[] {
    return Array.from(this.adapters.values()).map((a) => a.metadata);
  }

  subscribe(listener: (adapter: PlatformAdapter) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async switchPlatform(id: PlatformId): Promise<void> {
    const next = this.adapters.get(id);
    if (!next || next.id === this.currentAdapter.id) return;

    this.currentAdapter = next;
    await this.currentAdapter.initialize(this.handlers);
    this.listeners.forEach((listener) => listener(this.currentAdapter));
  }

  async initialize(handlers: PlatformLifecycleHandlers): Promise<void> {
    this.handlers = handlers;
    await this.currentAdapter.initialize(handlers);
  }

  notifyFirstFrameReady(): void {
    this.currentAdapter.notifyFirstFrameReady();
  }

  notifyGameReady(): void {
    this.currentAdapter.notifyGameReady();
  }

  isAudioEnabled(): boolean {
    return this.currentAdapter.isAudioEnabled();
  }

  async getLanguage(): Promise<string> {
    return this.currentAdapter.getLanguage();
  }

  async loadData(): Promise<string | null> {
    return this.currentAdapter.loadData();
  }

  async saveData(data: string): Promise<void> {
    return this.currentAdapter.saveData(data);
  }

  async sendScore(score: number): Promise<void> {
    return this.currentAdapter.sendScore(score);
  }

  async requestInterstitialAd(): Promise<boolean> {
    return this.currentAdapter.requestInterstitialAd();
  }

  async requestRewardedAd(rewardId: string): Promise<boolean> {
    return this.currentAdapter.requestRewardedAd(rewardId);
  }

  logWarning(msg?: string): void {
    this.currentAdapter.logWarning(msg);
  }

  logError(msg?: string): void {
    this.currentAdapter.logError(msg);
  }
}

export const platformManager = new PlatformManager();
