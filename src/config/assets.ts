import type { FoxState } from "@/components/ui";

// Team-provided artwork in public/assets. Set a value to null to fall back to the neutral placeholder.
export const assetPaths: { mascot: Record<FoxState, string> | null; pins: string | null } = {
  mascot: {
    idle: "/assets/mascot/pixel/idle.png",
    walking: "/assets/mascot/pixel/walking.png",
    arrived: "/assets/mascot/pixel/arrived.png",
    reward: "/assets/mascot/pixel/reward.png",
    warning: "/assets/mascot/pixel/warning.png",
  },
  pins: null, // Example: "/assets/pins/"
};
