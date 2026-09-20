import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sys",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500"],
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
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hans"
      className={`${ibmPlexMono.variable} ${notoSansSC.variable} h-full bg-bg antialiased`}
    >
      <body className="min-h-full bg-bg text-ink">{children}</body>
    </html>
  );
}
