"use client"

import { AlertTriangle, DollarSign, Shield, Eye } from "lucide-react"

export function ProblemSection() {
  const problems = [
    {
      icon: Eye,
      stat: "73%",
      title: "No AI Visibility",
      description: "Teams have no idea what their AI agents are doing",
    },
    {
      icon: DollarSign,
      stat: "$50K",
      title: "Surprise Bills",
      description: "Average unexpected AI cost per month",
    },
    {
      icon: Shield,
      stat: "Daily",
      title: "Security Incidents",
      description: "AI agents accessing unauthorized resources",
    },
  ]

  return (
    <section className="py-20 bg-[#18181B]/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Your AI is traveling <span className="text-[#F59E0B]">without a map</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Most teams deploy AI agents blindly, leading to costly mistakes and security risks.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="text-center p-8 bg-[#18181B] rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors group"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-red-500/20 transition-colors">
                <problem.icon className="h-8 w-8 text-red-500" />
              </div>
              <div className="text-4xl font-bold text-red-500 mb-2">{problem.stat}</div>
              <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
              <p className="text-[#FAFAFA]/70">{problem.description}</p>
            </div>
          ))}
        </div>

        {/* Animated examples */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-[#18181B] rounded-lg p-6 border border-red-500/20">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
              <span className="text-red-500 font-semibold">Live AI Gone Wrong</span>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="text-[#FAFAFA]/60">
                <span className="text-red-500">ERROR:</span> AI agent made 10,000 GitHub API calls in 5 minutes
              </div>
              <div className="text-[#FAFAFA]/60">
                <span className="text-red-500">COST:</span> $2,847.32 and counting...
              </div>
              <div className="text-[#FAFAFA]/60">
                <span className="text-red-500">BREACH:</span> Agent accessed production database without permission
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
