import type { Metadata, Viewport } from "next";
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
  themeColor: "#782459",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
