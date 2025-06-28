"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Analytics</h1>
          <p className="text-[rgba(250,250,250,0.7)]">
            Deep insights into your AI agent performance and usage patterns
          </p>
        </div>

        <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
          <CardHeader>
            <CardTitle className="text-[#FAFAFA] flex items-center justify-between">
              Analytics Dashboard
              <Badge variant="outline" className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)]">
                Coming Soon
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-medium text-[#FAFAFA] mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-[rgba(250,250,250,0.7)] max-w-md mx-auto">
                We're building powerful analytics features including cost trends, performance metrics, security
                insights, and custom dashboards. Stay tuned!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
