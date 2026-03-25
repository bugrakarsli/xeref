import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://xeref.ai"),
  title: "xeref.ai | AI Agent Manager",
  description: "Build and manage custom autonomous agents for the xeref.ai ecosystem.",
  icons: {
    icon: "/xeref-ai-favicon-transparent.jpg",
    shortcut: "/xeref-ai-favicon-transparent.jpg",
  },
  openGraph: {
    title: "xeref.ai | AI Agent Builder",
    description: "Build custom autonomous agents for the xeref.ai ecosystem.",
    url: "https://xeref.ai",
    siteName: "xeref.ai",
    images: [
      {
        url: "/xeref-ogimage.png",
        width: 1200,
        height: 630,
        alt: "xeref.ai — AI Agent Builder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "xeref.ai | AI Agent Builder",
    description: "Build custom autonomous agents for the xeref.ai ecosystem.",
    images: ["/xeref-ogimage.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
