import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";
import { AsciiBackground } from "@/components/effects/AsciiBackground";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sys",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-code",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-zh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ANOMALOUS SPECIMENS",
  description: "ARCHIVE SYSTEM",
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#080807",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hans"
      className={`${ibmPlexMono.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} h-full bg-bg antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-ink">
        <AsciiBackground />
        <div className="archive-root">{children}</div>
        <Script
          src="https://cdn.aidesigner.ai/effects/runtime/v1.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
