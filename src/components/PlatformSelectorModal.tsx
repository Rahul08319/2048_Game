import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { platformManager } from "@/lib/platform/platformManager";
import type { PlatformId, PlatformMetadata } from "@/lib/platform/types";
import { Check, Cloud, Film, Gift, Trophy, Globe, Layers } from "lucide-react";

interface PlatformSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlatformId: PlatformId;
  onSelectPlatform: (id: PlatformId) => void;
}

export const PlatformSelectorModal = ({
  open,
  onOpenChange,
  currentPlatformId,
  onSelectPlatform,
}: PlatformSelectorModalProps) => {
  const platforms = platformManager.getAllPlatforms();

  const getPlatformIcon = (id: PlatformId) => {
    switch (id) {
      case "youtube":
        return "▶️";
      case "facebook":
        return "💬";
      case "poki":
        return "🦊";
      case "crazygames":
        return "⚡";
      case "yandex":
        return "🎯";
      case "gamedistribution":
        return "🌐";
      case "discord":
        return "🎮";
      case "jiogames":
        return "🇮🇳";
      case "y8":
        return "🎱";
      case "lagged":
        return "🔥";
      case "pwa":
        return "🪟";
      case "quickgame":
        return "📱";
      default:
        return "🍎";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border border-white/10 bg-[#0d0e19]/90 backdrop-blur-2xl text-white rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Layers className="w-4 h-4" /> Zero-Dependency Multi-Platform Engine
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center justify-between">
            Supported Game Platforms
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              13 Built-in Adapters
            </span>
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Switch the active SDK runtime environment in real time for instant local testing, monetization preview, and platform verification.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto space-y-2 pr-1 my-2 flex-1 scrollbar-thin">
          {platforms.map((meta: PlatformMetadata) => {
            const isSelected = meta.id === currentPlatformId;
            return (
              <div
                key={meta.id}
                onClick={() => {
                  onSelectPlatform(meta.id);
                  onOpenChange(false);
                }}
                className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary/15 border-primary/60 shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                    : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-xl shadow-inner">
                    {getPlatformIcon(meta.id)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white tracking-tight text-sm sm:text-base">
                        {meta.name}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                      {meta.supportsCloudSave && (
                        <span className="flex items-center gap-1" title="Cloud Save Supported">
                          <Cloud className="w-3 h-3 text-sky-400" /> Cloud
                        </span>
                      )}
                      {meta.supportsInterstitialAds && (
                        <span className="flex items-center gap-1" title="Interstitial Ads">
                          <Film className="w-3 h-3 text-amber-400" /> Interstitial
                        </span>
                      )}
                      {meta.supportsRewardedAds && (
                        <span className="flex items-center gap-1" title="Rewarded Ads">
                          <Gift className="w-3 h-3 text-pink-400" /> Rewarded
                        </span>
                      )}
                      {meta.supportsLeaderboards && (
                        <span className="flex items-center gap-1" title="Leaderboards">
                          <Trophy className="w-3 h-3 text-yellow-400" /> Scores
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={isSelected ? "default" : "secondary"}
                  className="rounded-xl h-8 px-3 text-xs font-medium"
                >
                  {isSelected ? "Selected" : "Switch"}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-xs text-zinc-400">
          <span>Zero third-party wrapper dependencies (No Playgama)</span>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-xl h-8 text-xs text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
