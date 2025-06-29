"use client";

import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export default function AnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Alert */}
        {!authLoading && !isAuthenticated && (
          <Alert className="mb-8 bg-[#EF4444] bg-opacity-10 border-[#EF4444] border-opacity-20">
            <Key className="h-4 w-4 text-[#EF4444]" />
            <AlertDescription className="text-[#FAFAFA]">
              <strong>Authentication Required:</strong> Configure your API key
              in{" "}
              <Link href="/settings" className="text-[#0EA5E9] hover:underline">
                Settings
              </Link>{" "}
              to access analytics features when they become available.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Analytics</h1>
          <p className="text-[rgba(250,250,250,0.7)]">
            Deep insights into your AI agent performance and usage patterns
          </p>
          {!isAuthenticated && !authLoading && (
            <Badge
              variant="outline"
              className="mt-2 border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B] bg-opacity-10"
            >
              Authentication Required
            </Badge>
          )}
        </div>

        <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
          <CardHeader>
            <CardTitle className="text-[#FAFAFA] flex items-center justify-between">
              Analytics Dashboard
              <Badge
                variant="outline"
                className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)]"
              >
                Coming Soon
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium text-[#FAFAFA] mb-2">
                Advanced Analytics Coming Soon
              </h3>
              <p className="text-[rgba(250,250,250,0.7)] max-w-md mx-auto mb-4">
                We're building powerful analytics features including cost
                trends, performance metrics, security insights, and custom
                dashboards.
              </p>
              {isAuthenticated ? (
                <p className="text-sm text-[rgba(250,250,250,0.5)]">
                  You're all set! Analytics will automatically use your
                  authenticated data when available.
                </p>
              ) : (
                <div className="mt-4 p-4 bg-[rgba(14,165,233,0.05)] border border-[rgba(14,165,233,0.1)] rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-[rgba(250,250,250,0.7)]">
                    <strong>Get Ready:</strong> Configure your API key in{" "}
                    <Link
                      href="/settings"
                      className="text-[#0EA5E9] hover:underline"
                    >
                      Settings
                    </Link>{" "}
                    so you'll have instant access to analytics when they launch.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
