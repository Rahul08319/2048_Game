export type PlayablesHandlers = {
  onAudioEnabledChange: (enabled: boolean) => void;
  onPause: () => void;
  onResume: () => void;
  onLanguage: (language: string) => void;
};

type YtGameSdk = {
  IN_PLAYABLES_ENV?: boolean;
  game?: {
    firstFrameReady?: () => void;
    gameReady?: () => void;
    loadData?: () => Promise<string>;
    saveData?: (data: string) => Promise<void>;
  };
  system?: {
    isAudioEnabled?: () => boolean;
    onAudioEnabledChange?: (callback: (enabled: boolean) => void) => (() => void);
    onPause?: (callback: () => void) => (() => void);
    onResume?: (callback: () => void) => (() => void);
    getLanguage?: () => Promise<string>;
  };
  engagement?: {
    sendScore?: (score: { value: number }) => Promise<void>;
  };
  health?: {
    logError?: () => void;
    logWarning?: () => void;
  };
};

declare global {
  interface Window {
    ytgame?: YtGameSdk;
    render_game_to_text?: () => string;
    advanceTime?: (milliseconds: number) => void;
  }
}

export const LOCAL_SAVE_KEY = "twenty-forty-eight-dash.save.v1";

export function getPlayablesSdk(): YtGameSdk | undefined {
  return window.ytgame;
}

export function isInPlayablesEnvironment(): boolean {
  return Boolean(getPlayablesSdk()?.IN_PLAYABLES_ENV);
}

export function reportPlayablesHealth(level: "error" | "warning"): void {
  const sdk = getPlayablesSdk();
  if (!sdk?.IN_PLAYABLES_ENV) return;
  try {
    if (level === "error") sdk.health?.logError?.();
    else sdk.health?.logWarning?.();
  } catch {
    // Health reporting is best-effort and must never interrupt gameplay.
  }
}

export async function loadPlayablesSave(): Promise<string | null> {
  try {
    const sdk = getPlayablesSdk();
    if (sdk?.IN_PLAYABLES_ENV && sdk.game?.loadData) {
      return await sdk.game.loadData();
    }
    return window.localStorage.getItem(LOCAL_SAVE_KEY);
  } catch {
    reportPlayablesHealth("warning");
    return null;
  }
}

export function savePlayablesData(data: string): void {
  const isWellFormed = (String.prototype as { isWellFormed?: () => boolean }).isWellFormed;
  if (isWellFormed && !isWellFormed.call(data)) {
    reportPlayablesHealth("warning");
    return;
  }

  try {
    const sdk = getPlayablesSdk();
    if (sdk?.IN_PLAYABLES_ENV && sdk.game?.saveData) {
      void sdk.game.saveData(data).catch(() => reportPlayablesHealth("warning"));
      return;
    }
    window.localStorage.setItem(LOCAL_SAVE_KEY, data);
  } catch {
    reportPlayablesHealth("warning");
  }
}

export async function configurePlayables(handlers: PlayablesHandlers): Promise<() => void> {
  const sdk = getPlayablesSdk();
  if (!sdk?.IN_PLAYABLES_ENV) return () => undefined;

  const removeListeners: Array<() => void> = [];
  const onUnhandledError = () => reportPlayablesHealth("error");
  window.addEventListener("error", onUnhandledError);
  window.addEventListener("unhandledrejection", onUnhandledError);
  removeListeners.push(() => window.removeEventListener("error", onUnhandledError));
  removeListeners.push(() => window.removeEventListener("unhandledrejection", onUnhandledError));
  try {
    handlers.onAudioEnabledChange(Boolean(sdk.system?.isAudioEnabled?.()));
    const removeAudio = sdk.system?.onAudioEnabledChange?.(handlers.onAudioEnabledChange);
    const removePause = sdk.system?.onPause?.(handlers.onPause);
    const removeResume = sdk.system?.onResume?.(handlers.onResume);
    if (removeAudio) removeListeners.push(removeAudio);
    if (removePause) removeListeners.push(removePause);
    if (removeResume) removeListeners.push(removeResume);

    if (sdk.system?.getLanguage) {
      const language = await sdk.system.getLanguage();
      if (language) handlers.onLanguage(language);
    }
  } catch {
    reportPlayablesHealth("warning");
  }

  return () => removeListeners.forEach((remove) => remove());
}

export function notifyPlayableIsReady(): void {
  try {
    // Ordering is required by the Playables certification checks.
    getPlayablesSdk()?.game?.firstFrameReady?.();
    getPlayablesSdk()?.game?.gameReady?.();
  } catch {
    reportPlayablesHealth("error");
  }
}

export function reportBestScore(score: number): void {
  const sdk = getPlayablesSdk();
  if (!sdk?.IN_PLAYABLES_ENV || !sdk.engagement?.sendScore) return;
  const value = Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(score)));
  void sdk.engagement.sendScore({ value }).catch(() => reportPlayablesHealth("warning"));
}
