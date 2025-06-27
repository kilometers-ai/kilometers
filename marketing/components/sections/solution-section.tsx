"use client"

import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"

export function SolutionSection() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = async (text: string, step: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const steps = [
    {
      number: "01",
      title: "Install",
      description: "One command to get started",
      code: "curl -sSL https://get.kilometers.ai | sh",
    },
    {
      number: "02",
      title: "Configure",
      description: "Add 'km' to your AI config",
      code: `{
  "mcpServers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor"]
    }
  }
}`,
    },
    {
      number: "03",
      title: "Monitor",
      description: "See everything in real-time",
      code: "✅ Monitoring 47 AI agents\n📊 Dashboard: https://app.kilometers.ai",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            <span className="text-[#10B981]">30 seconds</span> to total visibility
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Stop flying blind. Get complete AI monitoring in three simple steps.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-[#0EA5E9] to-transparent z-0" />
                )}

                <div className="bg-[#18181B] rounded-lg p-8 border border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-colors relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-[#FAFAFA]/70">{step.description}</p>
                    </div>
                  </div>

                  <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#FAFAFA]/60">STEP {step.number}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(step.code, index)}
                        className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                      >
                        {copiedStep === index ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <pre className="font-mono text-sm text-[#0EA5E9] whitespace-pre-wrap overflow-x-auto">
                      {step.code}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
