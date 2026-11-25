import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

// Shown at the bottom of the Me tab so testers can tell exactly which build they have.
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };
function buildCommit() {
  const hosted = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
  if (hosted) return hosted;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || "local";
  } catch {
    return "local";
  }
}

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Dev only: lets a phone load the dev server through a Cloudflare quick tunnel.
  allowedDevOrigins: ["*.trycloudflare.com"],
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_BUILD_COMMIT: buildCommit(),
  },
};

export default nextConfig;
