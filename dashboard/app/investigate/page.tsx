"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, Database, Shield, Activity, ArrowLeft, Download, RefreshCw } from "lucide-react"
import Link from "next/link"
import { sampleEvents } from "@/lib/sample-data"

export default function InvestigatePage() {
  const searchParams = useSearchParams()
  const alertId = searchParams.get("alert") || "alert_001"

  // Filter events related to the database anomaly
  const suspiciousEvents = sampleEvents.filter((event) => event.method.includes("resources") || event.riskScore > 50)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  const timelineEvents = [
    {
      time: "20:10:00",
      event: "Anomaly detected",
      description: "Database queries increased 340% above baseline",
      severity: "high",
      icon: AlertTriangle,
    },
    {
      time: "20:09:45",
      event: "Suspicious file access",
      description: "Attempt to read /etc/passwd file",
      severity: "critical",
      icon: Shield,
    },
    {
      time: "20:09:30",
      event: "Query spike begins",
      description: "Database connection count jumps from 12 to 89",
      severity: "medium",
      icon: Database,
    },
    {
      time: "20:09:15",
      event: "Normal activity",
      description: "Standard API calls within normal parameters",
      severity: "low",
      icon: Activity,
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-[#EF4444] bg-[#EF4444] bg-opacity-10 border-[#EF4444] border-opacity-20"
      case "high":
        return "text-[#F59E0B] bg-[#F59E0B] bg-opacity-10 border-[#F59E0B] border-opacity-20"
      case "medium":
        return "text-[#3B82F6] bg-[#3B82F6] bg-opacity-10 border-[#3B82F6] border-opacity-20"
      case "low":
        return "text-[#10B981] bg-[#10B981] bg-opacity-10 border-[#10B981] border-opacity-20"
      default:
        return "text-[rgba(250,250,250,0.7)]"
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Security Investigation</h1>
              <p className="text-[rgba(250,250,250,0.7)]">Analyzing unusual database activity detected at 20:10 UTC</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Alert Summary */}
        <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)] mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-[#F59E0B] bg-opacity-10">
                  <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Unusual Activity Detected</h2>
                  <p className="text-[rgba(250,250,250,0.7)] mb-4">
                    Database queries increased 340% in the last hour, accompanied by suspicious file system access
                    attempts.
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[rgba(250,250,250,0.7)]" />
                      <span className="text-[rgba(250,250,250,0.7)]">Detected:</span>
                      <span className="text-[#FAFAFA] font-medium">June 28, 2025 at 20:10 UTC</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-[rgba(250,250,250,0.7)]" />
                      <span className="text-[rgba(250,250,250,0.7)]">Risk Level:</span>
                      <Badge className="bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20">
                        High
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B] bg-opacity-10">
                Active Investigation
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Investigation Tabs */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#18181B] border border-[rgba(250,250,250,0.1)]">
            <TabsTrigger
              value="timeline"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Suspicious Events
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Analysis
            </TabsTrigger>
            <TabsTrigger
              value="recommendations"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">Event Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => {
                    const IconComponent = event.icon
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          {index < timelineEvents.length - 1 && (
                            <div className="w-px h-8 bg-[rgba(250,250,250,0.1)] mt-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[#FAFAFA]">{event.event}</h3>
                            <span className="text-sm text-[rgba(250,250,250,0.7)] font-mono">{event.time}</span>
                          </div>
                          <p className="text-sm text-[rgba(250,250,250,0.7)] mt-1">{event.description}</p>
                          <Badge variant="outline" className={`mt-2 text-xs ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suspicious Events Tab */}
          <TabsContent value="events">
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">Suspicious Events ({suspiciousEvents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suspiciousEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)] hover:bg-[rgba(250,250,250,0.05)] transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge
                              variant="outline"
                              className={
                                event.direction === "request"
                                  ? "border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6] bg-opacity-10"
                                  : "border-[#10B981] text-[#10B981] bg-[#10B981] bg-opacity-10"
                              }
                            >
                              {event.direction}
                            </Badge>
                            <span className="font-mono text-sm text-[#FAFAFA]">{event.method}</span>
                            <Badge
                              className={
                                event.riskScore >= 50
                                  ? "bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20"
                                  : "bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20"
                              }
                            >
                              Risk: {event.riskScore}
                            </Badge>
                          </div>
                          <p className="text-sm text-[rgba(250,250,250,0.7)] font-mono mb-2">{event.payloadPreview}</p>
                          <div className="flex items-center space-x-4 text-xs text-[rgba(250,250,250,0.7)]">
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                            <span>{event.size} bytes</span>
                            <span>${event.costEstimate.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA]">Impact Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(250,250,250,0.02)]">
                    <span className="text-[rgba(250,250,250,0.7)]">Data Exposure Risk:</span>
                    <Badge className="bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20">
                      High
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(250,250,250,0.02)]">
                    <span className="text-[rgba(250,250,250,0.7)]">System Performance:</span>
                    <Badge className="bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20">
                      Degraded
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(250,250,250,0.02)]">
                    <span className="text-[rgba(250,250,250,0.7)]">Cost Impact:</span>
                    <Badge className="bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20">
                      +$12.34
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-[rgba(250,250,250,0.02)]">
                    <span className="text-[rgba(250,250,250,0.7)]">Compliance Status:</span>
                    <Badge className="bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20">
                      Violation
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA]">Root Cause Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[rgba(250,250,250,0.02)]">
                      <h4 className="font-medium text-[#FAFAFA] mb-1">Potential Causes:</h4>
                      <ul className="text-sm text-[rgba(250,250,250,0.7)] space-y-1">
                        <li>• Compromised API credentials</li>
                        <li>• Malicious AI agent behavior</li>
                        <li>• Configuration misconfiguration</li>
                        <li>• Automated attack pattern</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-[rgba(250,250,250,0.02)]">
                      <h4 className="font-medium text-[#FAFAFA] mb-1">Evidence:</h4>
                      <ul className="text-sm text-[rgba(250,250,250,0.7)] space-y-1">
                        <li>• 340% increase in database queries</li>
                        <li>• Unauthorized file system access</li>
                        <li>• High-risk score events (85+)</li>
                        <li>• Unusual timing patterns</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">Recommended Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#FAFAFA]">Immediate Actions</h3>
                    <div className="space-y-3">
                      {[
                        "Rotate API keys for affected services",
                        "Temporarily disable high-risk AI agents",
                        "Review and restrict file system permissions",
                        "Enable additional monitoring for database access",
                      ].map((action, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]"
                        >
                          <span className="text-[#FAFAFA]">{action}</span>
                          <Button size="sm" className="bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90">
                            Execute
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#FAFAFA]">Long-term Improvements</h3>
                    <div className="space-y-3">
                      {[
                        "Implement rate limiting for database queries",
                        "Add behavioral analysis for AI agents",
                        "Set up automated threat detection rules",
                        "Create incident response playbooks",
                      ].map((improvement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]"
                        >
                          <span className="text-[#FAFAFA]">{improvement}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                          >
                            Plan
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
