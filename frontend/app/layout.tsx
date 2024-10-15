import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Provider as ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
  openGraph: {
    title: `${siteConfig.title}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: `${siteConfig.name}`,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: `${siteConfig.title}`,
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "prefers-color-scheme: dark", color: "black" },
    { media: "prefers-color-scheme: light", color: "white" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider>
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
