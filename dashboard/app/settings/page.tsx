"use client"

import { useState } from "react"
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { sampleUser } from "@/lib/sample-data"
import Link from "next/link"

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const [selectedOS, setSelectedOS] = useState<"macos" | "windows" | "linux">("macos")

  const apiKey = "km_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yzab567cd890"
  const apiKeyPreview = "km_live_abc123...cd890"

  const cliInstructions = {
    macos: `# Install Kilometers CLI
curl -sSL https://get.kilometers.ai | sh

# Set your API key
export KILOMETERS_API_KEY="${apiKey}"

# Wrap any MCP server
km npx @modelcontextprotocol/server-github`,

    windows: `# Install via PowerShell
iwr https://get.kilometers.ai/install.ps1 | iex

# Set your API key
$env:KILOMETERS_API_KEY="${apiKey}"

# Wrap any MCP server
km npx @modelcontextprotocol/server-github`,

    linux: `# Install Kilometers CLI
curl -sSL https://get.kilometers.ai | sh

# Set your API key
export KILOMETERS_API_KEY="${apiKey}"

# Wrap any MCP server  
km npx @modelcontextprotocol/server-github`,
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const usagePercentage = (sampleUser.monthlyUsage.events / sampleUser.monthlyUsage.limit) * 100

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Settings</h1>
          <p className="text-[rgba(250,250,250,0.7)]">
            Manage your API keys, CLI setup, and technical configuration.
            <Link href="/profile" className="text-[#0EA5E9] hover:underline ml-1">
              Visit your profile
            </Link>{" "}
            for account and subscription management.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Key Management */}
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">API Key Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">Your API Key</label>
                  <div className="flex space-x-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={showApiKey ? apiKey : apiKeyPreview}
                      readOnly
                      className="font-mono bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiKey)}
                      className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-[rgba(250,250,250,0.7)]">Created:</span>
                    <p className="font-medium text-[#FAFAFA]">June 20, 2025</p>
                  </div>
                  <div>
                    <span className="text-[rgba(250,250,250,0.7)]">Last Used:</span>
                    <p className="font-medium text-[#FAFAFA]">2 minutes ago</p>
                  </div>
                  <div>
                    <span className="text-[rgba(250,250,250,0.7)]">Usage Count:</span>
                    <p className="font-medium text-[#FAFAFA]">1,471 requests</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Key
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CLI Setup */}
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">CLI Setup Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedOS} onValueChange={(value) => setSelectedOS(value as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-[#0A0A0A] border border-[rgba(250,250,250,0.1)]">
                    <TabsTrigger
                      value="macos"
                      className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
                    >
                      macOS
                    </TabsTrigger>
                    <TabsTrigger
                      value="windows"
                      className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
                    >
                      Windows
                    </TabsTrigger>
                    <TabsTrigger
                      value="linux"
                      className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
                    >
                      Linux
                    </TabsTrigger>
                  </TabsList>

                  {Object.entries(cliInstructions).map(([os, instructions]) => (
                    <TabsContent key={os} value={os} className="mt-4">
                      <div className="relative">
                        <pre className="bg-[#0A0A0A] border border-[rgba(250,250,250,0.1)] rounded-lg p-4 text-sm text-[#FAFAFA] overflow-x-auto">
                          {instructions}
                        </pre>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(instructions)}
                          className="absolute top-2 right-2 border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Account Information Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={sampleUser.avatar || "/placeholder.svg"} alt={sampleUser.name} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-[#FAFAFA]">{sampleUser.name}</h3>
                    <p className="text-sm text-[rgba(250,250,250,0.7)]">{sampleUser.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">Subscription:</span>
                    <Badge className="bg-[#0EA5E9] bg-opacity-20 text-[#0EA5E9] border-[#0EA5E9] border-opacity-20">
                      {sampleUser.subscription.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">Member since:</span>
                    <span className="text-sm font-medium text-[#FAFAFA]">
                      {new Date(sampleUser.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">Monthly Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">Events</span>
                    <span className="text-sm font-medium text-[#FAFAFA]">
                      {sampleUser.monthlyUsage.events.toLocaleString()} /{" "}
                      {sampleUser.monthlyUsage.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2 bg-[rgba(250,250,250,0.1)]" />
                  <p className="text-xs text-[rgba(250,250,250,0.7)] mt-1">
                    {usagePercentage.toFixed(1)}% of monthly limit
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">Total Cost:</span>
                    <span className="text-sm font-medium text-[#FAFAFA]">
                      ${sampleUser.monthlyUsage.cost.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">Avg. per event:</span>
                    <span className="text-sm font-medium text-[#FAFAFA]">
                      ${(sampleUser.monthlyUsage.cost / sampleUser.monthlyUsage.events).toFixed(4)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                >
                  View Billing Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
