import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsentProvider } from "@/lib/cookie-consent"
import { CookieBanner } from "@/components/cookie-banner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Kilometers - AI Agent Monitoring | See Where Your AI Goes",
  description:
    "Monitor your AI agents' MCP requests in real-time. 30-second setup. Prevent costly mistakes and security issues. Start free.",
  keywords: [
    "AI monitoring",
    "AI agent tracking",
    "MCP monitoring",
    "Model Context Protocol",
    "AI cost tracking",
    "Cursor monitoring",
    "Claude monitoring",
    "AI security",
    "AI analytics",
    "developer tools",
  ],
  authors: [{ name: "Miles Chen", url: "https://kilometers.ai" }],
  creator: "Kilometers Team",
  publisher: "Kilometers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://kilometers.ai"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Kilometers - AI Agent Monitoring",
    description: "Monitor your AI agents' MCP requests in real-time. 30-second setup. Prevent costly mistakes.",
    url: "https://kilometers.ai",
    siteName: "Kilometers",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kilometers AI Monitoring Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kilometers - AI Agent Monitoring",
    description: "Monitor your AI agents' MCP requests in real-time. 30-second setup.",
    images: ["/og-image.png"],
    creator: "@kilometers_ai",
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
    generator: 'v0.dev'
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kilometers",
  description: "AI agent monitoring platform for tracking MCP requests and preventing costly mistakes",
  url: "https://kilometers.ai",
  logo: "https://kilometers.ai/logo.png",
  sameAs: ["https://twitter.com/kilometers_ai", "https://github.com/kilometers-ai", "https://discord.gg/kilometers"],
  applicationCategory: "DeveloperApplication",
  operatingSystem: ["macOS", "Linux", "Windows"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    priceValidUntil: "2025-12-31",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "147",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CookieConsentProvider>
            {children}
            <CookieBanner />
          </CookieConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
