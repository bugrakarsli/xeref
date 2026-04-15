import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import AgentGlobalShortcuts from "@/components/dashboard/AgentGlobalShortcuts";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#22d3ee",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://xeref.ai"),
  title: "xeref.ai | AI Agent Builder with Long-Term Memory",
  description: "Xeref is an AI agent platform that remembers everything — build, manage, and deploy agents to Telegram, Discord, and WhatsApp.",
  keywords: ["AI Agent", "Long-Term Memory", "Telegram AI", "Discord AI", "WhatsApp AI", "Autonomous Agents"],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
  icons: {
    icon: "/xeref.svg",
    shortcut: "/xeref.svg",
    apple: "/xeref.svg",
  },
  openGraph: {
    title: "xeref.ai | AI Agent Builder with Long-Term Memory",
    description: "Xeref is an AI agent platform that remembers everything — build, manage, and deploy agents to Telegram, Discord, and WhatsApp.",
    url: "https://xeref.ai",
    siteName: "xeref.ai",
    images: [
      {
        url: "/xeref-ai-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "xeref.ai — AI Agent Builder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "xeref.ai | AI Agent Builder with Long-Term Memory",
    description: "Xeref is an AI agent platform that remembers everything — build, manage, and deploy agents to Telegram, Discord, and WhatsApp.",
    images: ["/xeref-ai-og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${interSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <TooltipProvider delayDuration={200}>
          {children}
          <AgentGlobalShortcuts />
        </TooltipProvider>
      </body>
    </html>
  );
}
