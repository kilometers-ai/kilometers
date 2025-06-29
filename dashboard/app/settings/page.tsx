"use client";

import { useState, useEffect } from "react";
import { Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useCustomerInfo } from "@/hooks/use-api-data";
import { sampleUser } from "@/lib/sample-data";
import Link from "next/link";

export default function SettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedOS, setSelectedOS] = useState<"macos" | "windows" | "linux">(
    "macos"
  );
  const [newApiKey, setNewApiKey] = useState("");
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);

  // ✅ Real authentication state
  const {
    apiKey,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    setApiKey: updateApiKey,
    clearError,
  } = useAuth();

  // ✅ Real customer info from API
  const {
    customerInfo,
    loading: customerLoading,
    error: customerError,
    refresh: refreshCustomerInfo,
  } = useCustomerInfo(apiKey || undefined);

  // Generate API key preview
  const apiKeyPreview = apiKey
    ? `${apiKey.substring(0, 15)}...${apiKey.slice(-6)}`
    : "No API key set";

  const cliInstructions = {
    macos: `# Install Kilometers CLI
curl -sSL https://get.kilometers.ai | sh

# Set your API key
export KILOMETERS_API_KEY="${apiKey || "YOUR_API_KEY"}"

# Wrap any MCP server
km npx @modelcontextprotocol/server-github`,

    windows: `# Install via PowerShell
iwr https://get.kilometers.ai/install.ps1 | iex

# Set your API key
$env:KILOMETERS_API_KEY="${apiKey || "YOUR_API_KEY"}"

# Wrap any MCP server
km npx @modelcontextprotocol/server-github`,

    linux: `# Install Kilometers CLI
curl -sSL https://get.kilometers.ai | sh

# Set your API key
export KILOMETERS_API_KEY="${apiKey || "YOUR_API_KEY"}"

# Wrap any MCP server  
km npx @modelcontextprotocol/server-github`,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleApiKeyUpdate = async () => {
    if (!newApiKey.trim()) return;

    setIsUpdatingKey(true);
    clearError();

    try {
      const success = await updateApiKey(newApiKey.trim());
      if (success) {
        setNewApiKey("");
        refreshCustomerInfo(); // Refresh customer data with new key
      }
    } catch (error) {
      console.error("Failed to update API key:", error);
    } finally {
      setIsUpdatingKey(false);
    }
  };

  // Calculate usage percentage (fallback to sample data if no real data)
  const usagePercentage = customerInfo
    ? 75 // TODO: Add usage data to CustomerInfo interface
    : (sampleUser.monthlyUsage.events / sampleUser.monthlyUsage.limit) * 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Settings</h1>
          <p className="text-[rgba(250,250,250,0.7)]">
            Manage your API keys, CLI setup, and technical configuration.
            <Link
              href="/profile"
              className="text-[#0EA5E9] hover:underline ml-1"
            >
              Visit your profile
            </Link>{" "}
            for account and subscription management.
          </p>
        </div>

        {/* Authentication Error Alert */}
        {authError && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              {authError}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Key Management */}
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA] flex items-center justify-between">
                  API Key Management
                  <Badge
                    className={
                      isAuthenticated
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }
                  >
                    {authLoading
                      ? "Checking..."
                      : isAuthenticated
                      ? "✓ Valid"
                      : "✗ Invalid"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current API Key */}
                <div>
                  <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">
                    Current API Key
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={
                        showApiKey ? apiKey || "No API key set" : apiKeyPreview
                      }
                      readOnly
                      className="font-mono bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    {apiKey && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey)}
                        className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Update API Key */}
                <div>
                  <label className="block text-sm font-medium text-[rgba(250,250,250,0.7)] mb-2">
                    Update API Key
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      type="password"
                      placeholder="Enter new API key..."
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]"
                    />
                    <Button
                      onClick={handleApiKeyUpdate}
                      disabled={!newApiKey.trim() || isUpdatingKey}
                      className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
                    >
                      {isUpdatingKey ? "Updating..." : "Update"}
                    </Button>
                  </div>
                </div>

                {/* API Key Stats */}
                {customerInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-[rgba(250,250,250,0.7)]">
                        Key Prefix:
                      </span>
                      <p className="font-medium text-[#FAFAFA]">
                        {customerInfo.apiKeyPrefix}
                      </p>
                    </div>
                    <div>
                      <span className="text-[rgba(250,250,250,0.7)]">
                        Authenticated:
                      </span>
                      <p className="font-medium text-[#FAFAFA]">
                        {new Date(
                          customerInfo.authenticatedAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[rgba(250,250,250,0.7)]">
                        Organization:
                      </span>
                      <p className="font-medium text-[#FAFAFA]">
                        {customerInfo.organization || "Personal"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-[rgba(250,250,250,0.5)]">
                      {customerLoading
                        ? "Loading API key information..."
                        : "Set a valid API key to view details"}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate Key (Coming Soon)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* CLI Setup */}
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">
                  CLI Setup Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={selectedOS}
                  onValueChange={(value) => setSelectedOS(value as any)}
                >
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
                <CardTitle className="text-[#FAFAFA]">
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={sampleUser.avatar || "/placeholder.svg"}
                      alt={customerInfo?.email || sampleUser.name}
                    />
                    <AvatarFallback>
                      {customerInfo?.email
                        ? customerInfo.email[0].toUpperCase()
                        : "JD"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-[#FAFAFA]">
                      {customerInfo?.organization || sampleUser.name}
                    </h3>
                    <p className="text-sm text-[rgba(250,250,250,0.7)]">
                      {customerInfo?.email || sampleUser.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">
                      Subscription:
                    </span>
                    <Badge className="bg-[#0EA5E9] bg-opacity-20 text-[#0EA5E9] border-[#0EA5E9] border-opacity-20">
                      {sampleUser.subscription.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[rgba(250,250,250,0.7)]">
                      Member since:
                    </span>
                    <span className="text-sm font-medium text-[#FAFAFA]">
                      {customerInfo?.authenticatedAt
                        ? new Date(
                            customerInfo.authenticatedAt
                          ).toLocaleDateString()
                        : new Date(sampleUser.joinedAt).toLocaleDateString()}
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgba(250,250,250,0.7)]">
                      Events Processed
                    </span>
                    <span className="font-medium text-[#FAFAFA]">
                      {sampleUser.monthlyUsage.events.toLocaleString()} /{" "}
                      {sampleUser.monthlyUsage.limit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className="h-2" />
                  <p className="text-xs text-[rgba(250,250,250,0.5)]">
                    {Math.round(usagePercentage)}% of monthly limit used
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[rgba(250,250,250,0.7)]">
                      Monthly Cost:
                    </span>
                    <span className="font-medium text-[#FAFAFA]">
                      ${sampleUser.monthlyUsage.cost}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(250,250,250,0.7)]">
                      API Calls:
                    </span>
                    <span className="font-medium text-[#FAFAFA]">
                      {customerInfo ? "Connected" : "Not connected"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
