"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Code,
  Zap,
  Shield,
  Settings,
  Users,
  ArrowRight,
  Copy,
  Check,
  ChevronRight,
  Home,
  Terminal,
  Globe,
  Lock,
} from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [copied, setCopied] = useState("")

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const quickStartSteps = [
    {
      title: "Install Kilometers CLI",
      description: "Get the monitoring tool installed on your system",
      code: "curl -sSL https://get.kilometers.ai | sh",
      id: "install",
    },
    {
      title: "Initialize your project",
      description: "Set up monitoring for your AI tool",
      code: "km init --tool cursor",
      id: "init",
    },
    {
      title: "Start monitoring",
      description: "Begin tracking your AI agent activity",
      code: "km start",
      id: "start",
    },
  ]

  const navigationSections = [
    {
      title: "Getting Started",
      icon: Zap,
      items: [
        { title: "Quick Start", href: "/docs/quick-start", badge: "Popular" },
        { title: "Installation", href: "/docs/installation" },
        { title: "Configuration", href: "/docs/configuration" },
        { title: "First Steps", href: "/docs/first-steps" },
      ],
    },
    {
      title: "AI Tools",
      icon: Code,
      items: [
        { title: "Cursor Setup", href: "/docs/tools/cursor", badge: "New" },
        { title: "Claude Desktop", href: "/docs/tools/claude" },
        { title: "VS Code", href: "/docs/tools/vscode" },
        { title: "Custom Tools", href: "/docs/tools/custom" },
      ],
    },
    {
      title: "API Reference",
      icon: Terminal,
      items: [
        { title: "Authentication", href: "/docs/api/auth" },
        { title: "Monitoring API", href: "/docs/api/monitoring" },
        { title: "Webhooks", href: "/docs/api/webhooks" },
        { title: "Rate Limits", href: "/docs/api/limits" },
      ],
    },
    {
      title: "Security",
      icon: Shield,
      items: [
        { title: "Data Privacy", href: "/docs/security/privacy" },
        { title: "Encryption", href: "/docs/security/encryption" },
        { title: "Compliance", href: "/docs/security/compliance" },
        { title: "Best Practices", href: "/docs/security/best-practices" },
      ],
    },
    {
      title: "Integrations",
      icon: Globe,
      items: [
        { title: "Slack Alerts", href: "/docs/integrations/slack" },
        { title: "Discord Notifications", href: "/docs/integrations/discord" },
        { title: "Email Alerts", href: "/docs/integrations/email" },
        { title: "Custom Webhooks", href: "/docs/integrations/webhooks" },
      ],
    },
    {
      title: "Team Management",
      icon: Users,
      items: [
        { title: "Adding Members", href: "/docs/team/members" },
        { title: "Permissions", href: "/docs/team/permissions" },
        { title: "Organizations", href: "/docs/team/organizations" },
        { title: "Billing", href: "/docs/team/billing" },
      ],
    },
  ]

  const popularArticles = [
    {
      title: "Setting up Cursor monitoring",
      description: "Complete guide to monitoring AI requests in Cursor",
      readTime: "5 min read",
      category: "Setup",
    },
    {
      title: "Understanding cost tracking",
      description: "How Kilometers calculates and tracks AI costs",
      readTime: "3 min read",
      category: "Billing",
    },
    {
      title: "Security best practices",
      description: "Keep your AI monitoring secure and compliant",
      readTime: "7 min read",
      category: "Security",
    },
    {
      title: "API authentication guide",
      description: "Authenticate with the Kilometers API",
      readTime: "4 min read",
      category: "API",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#18181B] bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-bold">Kilometers</span>
              </Link>
              <div className="hidden md:flex items-center space-x-1 text-sm text-[#FAFAFA]/60">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Documentation</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                <Link href="/signup">Start Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#FAFAFA]/50" />
                <Input
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#18181B] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9]"
                />
              </div>

              {/* Navigation */}
              <nav className="space-y-6">
                {navigationSections.map((section, index) => (
                  <div key={index}>
                    <div className="flex items-center space-x-2 mb-3">
                      <section.icon className="h-4 w-4 text-[#0EA5E9]" />
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-[#FAFAFA]/80">
                        {section.title}
                      </h3>
                    </div>
                    <ul className="space-y-2 ml-6">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link
                            href={item.href}
                            className="flex items-center justify-between text-sm text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors py-1"
                          >
                            <span>{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs bg-[#0EA5E9]/20 text-[#0EA5E9]">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Hero Section */}
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Kilometers <span className="text-[#0EA5E9]">Documentation</span>
              </h1>
              <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto mb-8">
                Everything you need to monitor your AI agents effectively. From quick setup to advanced configurations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90" asChild>
                  <Link href="/docs/quick-start">
                    Quick Start Guide
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                  asChild
                >
                  <Link href="/docs/api">API Reference</Link>
                </Button>
              </div>
            </div>

            {/* Quick Start */}
            <Card className="bg-[#18181B] border-[#0EA5E9]/20">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Quick Start</CardTitle>
                    <CardDescription className="text-[#FAFAFA]/70">
                      Get monitoring set up in under 2 minutes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {quickStartSteps.map((step, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-[#0EA5E9] rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <p className="text-[#FAFAFA]/70">{step.description}</p>
                      </div>
                      <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-[#FAFAFA]/60 font-mono">TERMINAL</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(step.code, step.id)}
                            className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                          >
                            {copied === step.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <code className="font-mono text-[#0EA5E9] text-sm">{step.code}</code>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-[#0EA5E9]/10">
                  <Button asChild className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                    <Link href="/docs/quick-start">
                      View Complete Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {popularArticles.map((article, index) => (
                  <Card
                    key={index}
                    className="bg-[#18181B] border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="bg-[#0EA5E9]/20 text-[#0EA5E9] text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-[#FAFAFA]/60">{article.readTime}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 hover:text-[#0EA5E9] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-[#FAFAFA]/70 text-sm">{article.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Code className="h-6 w-6 text-[#0EA5E9]" />
                  </div>
                  <h3 className="font-semibold mb-2">API Reference</h3>
                  <p className="text-[#FAFAFA]/70 text-sm mb-4">Complete API documentation with examples and SDKs</p>
                  <Button variant="outline" size="sm" className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                    Explore API
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#10B981]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Settings className="h-6 w-6 text-[#10B981]" />
                  </div>
                  <h3 className="font-semibold mb-2">Configuration</h3>
                  <p className="text-[#FAFAFA]/70 text-sm mb-4">Advanced setup options and customization guides</p>
                  <Button variant="outline" size="sm" className="border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10">
                    Learn More
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#F59E0B]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                  <h3 className="font-semibold mb-2">Security</h3>
                  <p className="text-[#FAFAFA]/70 text-sm mb-4">Best practices for secure AI monitoring</p>
                  <Button variant="outline" size="sm" className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10">
                    Security Guide
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Support Section */}
            <Card className="bg-[#18181B] border-[#0EA5E9]/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
                <p className="text-[#FAFAFA]/70 mb-6 max-w-2xl mx-auto">
                  Can't find what you're looking for? Our team is here to help you get the most out of Kilometers.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="outline" className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button asChild className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                    <Link href="https://discord.gg/kilometers" target="_blank">
                      Join Discord Community
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
