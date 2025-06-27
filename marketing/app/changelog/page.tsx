import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Plus, Bug, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function ChangelogPage() {
  const releases = [
    {
      version: "v1.2.0",
      date: "Dec 25, 2024",
      type: "major",
      changes: [
        {
          type: "feature",
          title: "Team Management",
          description: "Added support for team members and role-based permissions",
        },
        {
          type: "feature",
          title: "Slack Integration",
          description: "Real-time alerts and notifications in Slack channels",
        },
        {
          type: "improvement",
          title: "Enhanced Dashboard",
          description: "New visualizations and improved performance metrics",
        },
        {
          type: "fix",
          title: "Cost Calculation Fix",
          description: "Fixed issue with OpenAI cost calculations for large requests",
        },
      ],
    },
    {
      version: "v1.1.5",
      date: "Dec 20, 2024",
      type: "minor",
      changes: [
        {
          type: "feature",
          title: "Claude Desktop Support",
          description: "Native support for monitoring Claude Desktop applications",
        },
        {
          type: "improvement",
          title: "Faster Setup",
          description: "Reduced setup time from 5 minutes to 30 seconds",
        },
        {
          type: "security",
          title: "Enhanced Encryption",
          description: "Upgraded to AES-256 encryption for all data at rest",
        },
      ],
    },
    {
      version: "v1.1.0",
      date: "Dec 15, 2024",
      type: "major",
      changes: [
        {
          type: "feature",
          title: "API Access",
          description: "Full REST API for integrating with external tools",
        },
        {
          type: "feature",
          title: "Custom Alerts",
          description: "Set custom thresholds for cost and usage alerts",
        },
        {
          type: "improvement",
          title: "Better Error Handling",
          description: "Improved error messages and recovery mechanisms",
        },
        {
          type: "fix",
          title: "VS Code Extension Fix",
          description: "Resolved compatibility issues with VS Code AI extensions",
        },
      ],
    },
    {
      version: "v1.0.0",
      date: "Dec 1, 2024",
      type: "major",
      changes: [
        {
          type: "feature",
          title: "Initial Release",
          description: "First stable release of Kilometers AI monitoring platform",
        },
        {
          type: "feature",
          title: "Cursor Integration",
          description: "Native support for monitoring Cursor AI requests",
        },
        {
          type: "feature",
          title: "Real-time Monitoring",
          description: "Live dashboard with real-time AI activity tracking",
        },
        {
          type: "feature",
          title: "Cost Tracking",
          description: "Automatic cost calculation for all major AI providers",
        },
      ],
    },
  ]

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Plus className="h-4 w-4 text-[#10B981]" />
      case "improvement":
        return <Zap className="h-4 w-4 text-[#0EA5E9]" />
      case "fix":
        return <Bug className="h-4 w-4 text-[#F59E0B]" />
      case "security":
        return <Shield className="h-4 w-4 text-[#EF4444]" />
      default:
        return <Plus className="h-4 w-4 text-[#10B981]" />
    }
  }

  const getChangeBadge = (type: string) => {
    switch (type) {
      case "feature":
        return <Badge className="bg-[#10B981]/20 text-[#10B981]">New</Badge>
      case "improvement":
        return <Badge className="bg-[#0EA5E9]/20 text-[#0EA5E9]">Improved</Badge>
      case "fix":
        return <Badge className="bg-[#F59E0B]/20 text-[#F59E0B]">Fixed</Badge>
      case "security":
        return <Badge className="bg-[#EF4444]/20 text-[#EF4444]">Security</Badge>
      default:
        return <Badge className="bg-[#10B981]/20 text-[#10B981]">New</Badge>
    }
  }

  const getVersionBadge = (type: string) => {
    switch (type) {
      case "major":
        return <Badge className="bg-[#0EA5E9]/20 text-[#0EA5E9]">Major Release</Badge>
      case "minor":
        return <Badge className="bg-[#10B981]/20 text-[#10B981]">Minor Release</Badge>
      case "patch":
        return <Badge className="bg-[#F59E0B]/20 text-[#F59E0B]">Patch</Badge>
      default:
        return <Badge className="bg-[#0EA5E9]/20 text-[#0EA5E9]">Release</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#18181B] bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold">Kilometers</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-[#FAFAFA]/80 hover:text-[#0EA5E9] transition-colors">
                Docs
              </Link>
              <Link href="/blog" className="text-[#FAFAFA]/80 hover:text-[#0EA5E9] transition-colors">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            <span className="text-[#0EA5E9]">Changelog</span>
          </h1>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Track all updates, new features, and improvements to the Kilometers platform.
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {releases.map((release, index) => (
              <div key={index} className="relative">
                {/* Timeline line */}
                {index < releases.length - 1 && (
                  <div className="absolute left-6 top-20 w-0.5 h-full bg-[#18181B]"></div>
                )}

                {/* Timeline dot */}
                <div className="absolute left-4 top-8 w-4 h-4 bg-[#0EA5E9] rounded-full border-4 border-[#0A0A0A]"></div>

                {/* Content */}
                <div className="ml-16">
                  <Card className="bg-[#18181B] border-[#0EA5E9]/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-2xl">{release.version}</CardTitle>
                          {getVersionBadge(release.type)}
                        </div>
                        <div className="flex items-center space-x-2 text-[#FAFAFA]/60">
                          <Calendar className="h-4 w-4" />
                          <span>{release.date}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {release.changes.map((change, changeIndex) => (
                          <div key={changeIndex} className="flex space-x-3 p-4 bg-[#0A0A0A] rounded-lg">
                            <div className="flex-shrink-0 mt-0.5">{getChangeIcon(change.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold">{change.title}</h4>
                                {getChangeBadge(change.type)}
                              </div>
                              <p className="text-[#FAFAFA]/70 text-sm">{change.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe for updates */}
        <Card className="bg-[#18181B] border-[#0EA5E9]/20 mt-16 max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-[#FAFAFA]/70 mb-6">Get notified when we ship new features and improvements.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-[#0EA5E9]/20 rounded-lg text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9] focus:outline-none"
              />
              <button className="px-6 py-3 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
