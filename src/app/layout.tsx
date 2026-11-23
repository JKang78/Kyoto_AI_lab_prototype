import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, Plus_Jakarta_Sans, Shippori_Mincho } from "next/font/google";
import "./globals.css";

const display = Shippori_Mincho({ weight: ["500", "700"], subsets: ["latin"], variable: "--font-display", display: "swap" });
const ui = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-ui", display: "swap" });
const uiJa = Noto_Sans_JP({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-ui-ja", display: "swap", preload: false });

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
  return <html lang="en" className={`${display.variable} ${ui.variable} ${uiJa.variable}`}><body>{children}</body></html>;
}
