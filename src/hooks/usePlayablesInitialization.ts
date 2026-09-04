import { useEffect, useRef } from "react";
import {
  initializePlayablesSDK,
  signalGameReady,
  onGamePause,
  onGameResume,
  onAudioEnabledChange,
  isInPlayablesEnvironment,
} from "@/lib/youtube-playables";

/**
 * Hook to initialize YouTube Playables SDK and register lifecycle callbacks
 * Should be called once in the main App component
 */
export function usePlayablesInitialization() {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Initialize SDK
    initializePlayablesSDK();

    // Register pause callback
    onGamePause(() => {
      console.log("Game paused by YouTube");
      // Handle pause logic here
      // You might want to dispatch an action or call a context method
    });

    // Register resume callback
    onGameResume(() => {
      console.log("Game resumed by YouTube");
      // Handle resume logic here
    });

    // Register audio enabled change callback
    onAudioEnabledChange((isAudioEnabled) => {
      console.log("Audio enabled state changed:", isAudioEnabled);
      // Handle audio state change here
    });

    // Signal game ready
    signalGameReady().then(() => {
      console.log("Game ready signal sent to YouTube");
    });
  }, []);

  return {
    isInPlayables: isInPlayablesEnvironment(),
  };
}
