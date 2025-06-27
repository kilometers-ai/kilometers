"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export function InstallationSection() {
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null)

  const copyToClipboard = async (text: string, configType: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedConfig(configType)
    setTimeout(() => setCopiedConfig(null), 2000)
  }

  const configs = [
    {
      name: "Cursor",
      description: "Add to your Cursor settings",
      code: `{
  "mcpServers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--cursor"]
    }
  }
}`,
    },
    {
      name: "Claude Desktop",
      description: "Add to claude_desktop_config.json",
      code: `{
  "mcpServers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--claude"]
    }
  }
}`,
    },
    {
      name: "VS Code",
      description: "Add to your VS Code settings",
      code: `{
  "ai.mcp.servers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--vscode"]
    }
  }
}`,
    },
  ]

  return (
    <section className="py-20 bg-[#18181B]/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Works with your <span className="text-[#0EA5E9]">favorite tools</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Drop-in compatibility with any MCP-enabled AI tool. No code changes required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {configs.map((config, index) => (
            <div
              key={index}
              className="bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 overflow-hidden hover:border-[#0EA5E9]/40 transition-colors"
            >
              <div className="p-6 border-b border-[#0EA5E9]/10">
                <h3 className="text-xl font-bold mb-2">{config.name}</h3>
                <p className="text-[#FAFAFA]/70 text-sm">{config.description}</p>
              </div>

              <div className="p-6">
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-[#FAFAFA]/60 font-mono">CONFIG</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(config.code, config.name)}
                      className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                    >
                      {copiedConfig === config.name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <pre className="font-mono text-sm text-[#0EA5E9] whitespace-pre-wrap overflow-x-auto">
                    {config.code}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
