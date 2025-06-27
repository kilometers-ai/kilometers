"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, ChevronRight, ChevronLeft, Home, CheckCircle, Info } from "lucide-react"
import Link from "next/link"

export default function QuickStartPage() {
  const [copied, setCopied] = useState("")

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(""), 2000)
  }

  const codeBlocks = {
    install: "curl -sSL https://get.kilometers.ai | sh",
    verify: "km --version",
    init: "km init --tool cursor",
    cursorConfig: `{
  "mcpServers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--cursor"]
    }
  }
}`,
    start: "km start",
    dashboard: "km dashboard",
  }

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
                <Link href="/docs" className="hover:text-[#0EA5E9]">
                  Documentation
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span>Quick Start</span>
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
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-[#0EA5E9]/20 text-[#0EA5E9]">Getting Started</Badge>
              <span className="text-sm text-[#FAFAFA]/60">5 min read</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Quick Start Guide</h1>
            <p className="text-xl text-[#FAFAFA]/80">
              Get Kilometers monitoring set up in under 5 minutes. This guide will walk you through installation,
              configuration, and your first monitoring session.
            </p>
          </div>

          {/* Table of Contents */}
          <Card className="bg-[#18181B] border-[#0EA5E9]/20 mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Table of Contents</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#prerequisites" className="text-[#0EA5E9] hover:underline">
                    Prerequisites
                  </a>
                </li>
                <li>
                  <a href="#installation" className="text-[#0EA5E9] hover:underline">
                    Installation
                  </a>
                </li>
                <li>
                  <a href="#configuration" className="text-[#0EA5E9] hover:underline">
                    Configuration
                  </a>
                </li>
                <li>
                  <a href="#first-monitoring" className="text-[#0EA5E9] hover:underline">
                    First Monitoring Session
                  </a>
                </li>
                <li>
                  <a href="#next-steps" className="text-[#0EA5E9] hover:underline">
                    Next Steps
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            {/* Prerequisites */}
            <section id="prerequisites">
              <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
              <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-[#0EA5E9] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[#FAFAFA]/90">Before you begin, make sure you have:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-[#FAFAFA]/80">
                      <li>An AI tool that supports MCP (Cursor, Claude Desktop, or VS Code with AI extensions)</li>
                      <li>macOS, Linux, or Windows with WSL2</li>
                      <li>Node.js 18+ (for some integrations)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Installation */}
            <section id="installation">
              <h2 className="text-2xl font-bold mb-4">Installation</h2>
              <p className="text-[#FAFAFA]/80 mb-6">
                Install the Kilometers CLI with a single command. Our installer will automatically detect your system
                and install the appropriate version.
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Install Kilometers</h3>
                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60 font-mono">TERMINAL</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeBlocks.install, "install")}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copied === "install" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="font-mono text-[#0EA5E9] text-sm">{codeBlocks.install}</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Verify Installation</h3>
                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60 font-mono">TERMINAL</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeBlocks.verify, "verify")}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copied === "verify" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="font-mono text-[#0EA5E9] text-sm">{codeBlocks.verify}</code>
                  </div>
                  <p className="text-sm text-[#FAFAFA]/70 mt-2">
                    You should see the version number if installation was successful.
                  </p>
                </div>
              </div>
            </section>

            {/* Configuration */}
            <section id="configuration">
              <h2 className="text-2xl font-bold mb-4">Configuration</h2>
              <p className="text-[#FAFAFA]/80 mb-6">
                Now let's configure Kilometers to work with your AI tool. We'll use Cursor as an example, but the
                process is similar for other tools.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Initialize Kilometers</h3>
                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60 font-mono">TERMINAL</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeBlocks.init, "init")}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copied === "init" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="font-mono text-[#0EA5E9] text-sm">{codeBlocks.init}</code>
                  </div>
                  <p className="text-sm text-[#FAFAFA]/70 mt-2">
                    This will create a configuration file and set up monitoring for Cursor.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Update Cursor Configuration</h3>
                  <p className="text-[#FAFAFA]/80 mb-3">
                    Add the following to your Cursor settings (Cmd/Ctrl + Shift + P → "Preferences: Open Settings
                    (JSON)"):
                  </p>
                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60 font-mono">CURSOR CONFIG</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeBlocks.cursorConfig, "cursorConfig")}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copied === "cursorConfig" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <pre className="font-mono text-[#0EA5E9] text-sm whitespace-pre-wrap">
                      {codeBlocks.cursorConfig}
                    </pre>
                  </div>
                </div>

                <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[#FAFAFA]/90 font-medium">Configuration Complete!</p>
                      <p className="text-[#FAFAFA]/80 mt-1">Restart Cursor for the changes to take effect.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* First Monitoring */}
            <section id="first-monitoring">
              <h2 className="text-2xl font-bold mb-4">First Monitoring Session</h2>
              <p className="text-[#FAFAFA]/80 mb-6">Now let's start monitoring and see your first AI request data.</p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Start Monitoring</h3>
                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60 font-mono">TERMINAL</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeBlocks.start, "start")}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copied === "start" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="font-mono text-[#0EA5E9] text-sm">{codeBlocks.start}</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Make an AI Request</h3>
                  <p className="text-[#FAFAFA]/80 mb-3">
                    Open Cursor and make any AI request (ask a question, generate code, etc.). Kilometers will
                    automatically detect and track the request.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">View Your Dashboard</h3>
                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60 font-mono">TERMINAL</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(codeBlocks.dashboard, "dashboard")}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copied === "dashboard" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <code className="font-mono text-[#0EA5E9] text-sm">{codeBlocks.dashboard}</code>
                  </div>
                  <p className="text-[#FAFAFA]/80">
                    This will open your monitoring dashboard in the browser where you can see all your AI activity.
                  </p>
                </div>
              </div>
            </section>

            {/* Next Steps */}
            <section id="next-steps">
              <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
              <p className="text-[#FAFAFA]/80 mb-6">
                Congratulations! You now have Kilometers monitoring your AI agents. Here's what to explore next:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Set Up Alerts</h3>
                    <p className="text-[#FAFAFA]/70 text-sm mb-4">
                      Get notified when costs spike or unusual activity is detected.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                    >
                      Configure Alerts
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">API Integration</h3>
                    <p className="text-[#FAFAFA]/70 text-sm mb-4">
                      Integrate monitoring data into your existing tools and workflows.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                    >
                      View API Docs
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Team Setup</h3>
                    <p className="text-[#FAFAFA]/70 text-sm mb-4">
                      Add team members and manage permissions for collaborative monitoring.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                    >
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Advanced Config</h3>
                    <p className="text-[#FAFAFA]/70 text-sm mb-4">
                      Customize monitoring rules, filters, and advanced settings.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                    >
                      Advanced Setup
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#18181B]">
            <Button variant="ghost" asChild>
              <Link href="/docs">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Docs
              </Link>
            </Button>
            <Button asChild className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
              <Link href="/docs/configuration">
                Configuration Guide
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
