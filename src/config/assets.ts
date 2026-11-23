import type { FoxState } from "@/components/ui";

// Team-provided artwork in public/assets. Set a value to null to fall back to the neutral placeholder.
export const assetPaths: { mascot: Record<FoxState, string> | null; pins: string | null } = {
  mascot: {
    idle: "/assets/mascot/fox-idle.png",
    walking: "/assets/mascot/fox-walking.png",
    arrived: "/assets/mascot/fox-arrived.png",
    reward: "/assets/mascot/fox-reward.png",
    warning: "/assets/mascot/fox-warning.png",
  },
  pins: null, // Example: "/assets/pins/"
};
