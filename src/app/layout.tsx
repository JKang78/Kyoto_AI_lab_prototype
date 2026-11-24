import type { Metadata, Viewport } from "next";
import { FontPreview } from "@/components/font-preview";
// Self-hosted fonts (scripts/fetch_fonts.py): builds and offline use never depend on Google Fonts.
import "./fonts.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kyoto AI Lab prototype",
  description: "A Kyoto walking exploration prototype.",
  applicationName: "Kyoto AI Lab prototype",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Kyoto Walk", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><FontPreview />{children}</body></html>;
}
