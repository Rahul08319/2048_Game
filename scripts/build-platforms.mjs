/**
 * Multi-Platform Bundle Generator
 * Generates tailored platform packages from the built `dist` folder.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");
const platformsDir = path.resolve(__dirname, "../dist-platforms");

if (!fs.existsSync(distDir)) {
  console.error("Error: Please run 'npm run build' before running build-platforms.");
  process.exit(1);
}

if (!fs.existsSync(platformsDir)) {
  fs.mkdirSync(platformsDir, { recursive: true });
}

const baseHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

const PLATFORM_CONFIGS = [
  {
    id: "youtube",
    name: "YouTube Playables",
    scriptTag: '<script src="https://www.youtube.com/game_api/v1"></script>',
  },
  {
    id: "facebook",
    name: "Facebook Instant Games",
    scriptTag: '<script src="https://connect.facebook.net/en_US/fbinstant.7.1.js"></script>',
  },
  {
    id: "poki",
    name: "Poki Games",
    scriptTag: '<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>',
  },
  {
    id: "crazygames",
    name: "CrazyGames",
    scriptTag: '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>',
  },
  {
    id: "yandex",
    name: "Yandex Games",
    scriptTag: '<script src="https://yandex.ru/games/sdk/v2"></script>',
  },
  {
    id: "gamedistribution",
    name: "GameDistribution",
    scriptTag: '<script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = "https://html5.api.gamedistribution.com/main.min.js"; fjs.parentNode.insertBefore(js, fjs); }(document, "script", "gamedistribution-jssdk"));</script>',
  },
  {
    id: "discord",
    name: "Discord Activities",
    scriptTag: '<script src="https://cdn.jsdelivr.net/npm/@discord/embedded-app-sdk@1/dist/index.min.js"></script>',
  },
  {
    id: "y8",
    name: "Y8 Games",
    scriptTag: '<script src="https://cdn.y8.com/api/sdk.js"></script>',
  },
  {
    id: "lagged",
    name: "Lagged Games",
    scriptTag: '<script src="https://lagged.com/api/v1/lagged.js"></script>',
  },
  {
    id: "pwa",
    name: "Microsoft Store (PWA)",
    scriptTag: '<link rel="manifest" href="./manifest.json" />',
  },
];

console.log("🚀 Packaging platform distributions...");

for (const p of PLATFORM_CONFIGS) {
  const targetDir = path.join(platformsDir, p.id);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy dist assets recursively
  fs.cpSync(distDir, targetDir, { recursive: true });

  // Inject platform-specific script tag
  let platformHtml = baseHtml;
  // Replace the default youtube script with the platform specific script tag (or add it)
  if (p.id !== "youtube") {
    platformHtml = platformHtml.replace(
      '<script src="https://www.youtube.com/game_api/v1"></script>',
      p.scriptTag
    );
  }

  fs.writeFileSync(path.join(targetDir, "index.html"), platformHtml, "utf-8");
  console.log(`  ✓ Built package for ${p.name} -> dist-platforms/${p.id}/`);
}

console.log("\n🎉 All 10+ platform standalone builds generated successfully!");
