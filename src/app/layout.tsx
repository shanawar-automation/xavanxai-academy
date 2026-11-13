import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AssistantLoader } from "@/components/layout/AssistantLoader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "XavanXAI — Autonomous AI Headquarters & Enterprise AI Systems",
    template: "%s | XavanXAI",
  },
  description:
    "XavanXAI builds intelligent AI systems, autonomous agents, and advanced automation solutions that help global businesses operate smarter, faster, and more efficiently.",
  applicationName: "XavanXAI",
  openGraph: {
    title: "XavanXAI — Building the Intelligence Behind Tomorrow",
    description:
      "An intelligent AI company operating through a connected ecosystem of 12 autonomous agent departments and XavanXAI Talent Intelligence.",
    type: "website",
    siteName: "XavanXAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "XavanXAI — Autonomous AI Headquarters",
    description:
      "Multi-agent enterprise automation, custom AI SaaS and ethical AI recruitment.",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-[#080808] font-sans text-white">
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-1 pt-20 outline-none">
          {children}
        </main>
        <Footer />
        <AssistantLoader />
      </body>
    </html>
  );
}
