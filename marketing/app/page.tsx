import type { Metadata } from "next"
import { HeroSection } from "@/components/sections/hero-section"
import { ProblemSection } from "@/components/sections/problem-section"
import { SolutionSection } from "@/components/sections/solution-section"
import { DemoSection } from "@/components/sections/demo-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { TestimonialsSection } from "@/components/sections/testimonials-section"
import { PricingSection } from "@/components/sections/pricing-section"
import { InstallationSection } from "@/components/sections/installation-section"
import { TrustSection } from "@/components/sections/trust-section"
import { FAQSection } from "@/components/sections/faq-section"
import { FooterCTA } from "@/components/sections/footer-cta"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Kilometers - AI Agent Monitoring | See Where Your AI Goes",
  description:
    "Monitor your AI agents' MCP requests in real-time. 30-second setup. Prevent costly mistakes and security issues. Start free.",
  keywords: "AI monitoring, MCP, Model Context Protocol, AI agents, cost tracking, security",
  openGraph: {
    title: "Kilometers - AI Agent Monitoring",
    description: "Monitor your AI agents' MCP requests in real-time. 30-second setup.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kilometers - AI Agent Monitoring",
    description: "Monitor your AI agents' MCP requests in real-time. 30-second setup.",
    images: ["/og-image.png"],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      <Header />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <DemoSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <InstallationSection />
        <TrustSection />
        <FAQSection />
        <FooterCTA />
      </main>
      <Footer />
    </div>
  )
}
