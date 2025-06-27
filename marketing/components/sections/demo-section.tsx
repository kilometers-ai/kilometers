"use client"

import { AlertTriangle, Github, Database, MessageSquare } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

export function DemoSection() {
  const services = [
    {
      name: "GitHub",
      icon: Github,
      distance: 234,
      requests: 1337,
      status: "normal",
    },
    {
      name: "Database",
      icon: Database,
      distance: 156,
      requests: 89,
      status: "warning",
    },
    {
      name: "Slack",
      icon: MessageSquare,
      distance: 67,
      requests: 45,
      status: "normal",
    },
  ]

  return (
    <section id="demo" className="py-20 bg-[#18181B]/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            See your AI's journey <span className="text-[#0EA5E9]">in real-time</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Live dashboard showing exactly where your AI agents are going and what they're doing.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Mock Dashboard */}
          <div className="bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 overflow-hidden">
            {/* Dashboard Header */}
            <div className="p-6 border-b border-[#0EA5E9]/10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">AI Journey Dashboard</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[#10B981] rounded-full animate-pulse"></div>
                    <span className="text-sm text-[#FAFAFA]/70">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Stats */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0EA5E9] mb-2">
                    <AnimatedCounter value={457} />
                    km
                  </div>
                  <div className="text-[#FAFAFA]/70">Distance Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#10B981] mb-2">
                    <AnimatedCounter value={1471} />
                  </div>
                  <div className="text-[#FAFAFA]/70">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F59E0B] mb-2">
                    $<AnimatedCounter value={47} />
                    .23
                  </div>
                  <div className="text-[#FAFAFA]/70">Cost Today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#EF4444] mb-2">
                    <AnimatedCounter value={3} />
                  </div>
                  <div className="text-[#FAFAFA]/70">Alerts</div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold mb-4">Active Services</h4>
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      service.status === "warning"
                        ? "bg-[#F59E0B]/10 border-[#F59E0B]/30"
                        : "bg-[#0A0A0A] border-[#0EA5E9]/10"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          service.status === "warning" ? "bg-[#F59E0B]/20" : "bg-[#0EA5E9]/20"
                        }`}
                      >
                        <service.icon
                          className={`h-5 w-5 ${service.status === "warning" ? "text-[#F59E0B]" : "text-[#0EA5E9]"}`}
                        />
                      </div>
                      <div>
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-sm text-[#FAFAFA]/70">{service.requests} requests</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">{service.distance} km</div>
                      {service.status === "warning" && (
                        <div className="flex items-center space-x-1 text-[#F59E0B] text-sm">
                          <AlertTriangle className="h-3 w-3" />
                          <span>High usage</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Alert Banner */}
              <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-[#EF4444] animate-pulse" />
                  <div>
                    <div className="font-semibold text-[#EF4444]">Unusual Activity Detected</div>
                    <div className="text-sm text-[#FAFAFA]/70">Database queries increased 340% in the last hour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
