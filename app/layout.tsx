import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

function getMetadataBase(): URL {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!envUrl) return new URL("http://localhost:3000");

  try {
    return new URL(envUrl);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "FormCraft — Dynamic Form Dashboard",
    template: "%s | FormCraft",
  },
  description: "Build, manage, and analyze dynamic forms with ease. Create beautiful forms, collect submissions, and gain insights with our powerful form builder.",
  keywords: ["form builder", "dynamic forms", "online forms", "form submissions", "data collection", "web forms"],
  authors: [{ name: "FormCraft Team" }],
  creator: "FormCraft",
  publisher: "FormCraft",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "FormCraft",
    title: "FormCraft — Dynamic Form Dashboard",
    description: "Build, manage, and analyze dynamic forms with ease",
    images: [
      {
        url: "/Solo-Logo.png",
        width: 512,
        height: 512,
        alt: "FormCraft Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormCraft — Dynamic Form Dashboard",
    description: "Build, manage, and analyze dynamic forms with ease",
    images: ["/Solo-Logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "apple-touch-icon-precomposed",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/site.webmanifest",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
