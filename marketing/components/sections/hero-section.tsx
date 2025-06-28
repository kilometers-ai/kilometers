"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { getAppUrl, getAuthUrl } from "@/lib/app-redirect";

export function HeroSection() {
  const [copied, setCopied] = useState(false);
  const installCommand =
    "curl -sSL https://raw.githubusercontent.com/kilometers-ai/kilometers/main/scripts/install.sh | sh";

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Animated background paths */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 800">
          <defs>
            <pattern
              id="dots"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="#0EA5E9" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
          <path
            d="M100,400 Q300,200 500,400 T900,400"
            stroke="#0EA5E9"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Your AI travels far.{" "}
            <span className="text-[#0EA5E9]">See where it goes.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-[#FAFAFA]/80 mb-8 max-w-3xl mx-auto">
            Monitor every request your AI agents make. 30-second setup. Stop
            costly surprises.
          </p>

          {/* Live counter */}
          <div className="mb-12 p-6 bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 max-w-md mx-auto">
            <p className="text-sm text-[#FAFAFA]/60 mb-2">
              AI agents monitored:
            </p>
            <div className="flex items-center justify-center space-x-2">
              <AnimatedCounter value={1247332} />
              <span className="text-2xl font-mono font-bold text-[#0EA5E9]">
                km
              </span>
              <span className="text-[#FAFAFA]/60">today</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white px-8 py-4 text-lg"
              asChild
            >
              <a href={getAuthUrl("signup")}>Start Monitoring Free</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10 px-8 py-4 text-lg bg-transparent"
              asChild
            >
              <a href="#demo">View Demo</a>
            </Button>
          </div>

          {/* Code snippet */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#18181B] rounded-lg p-6 border border-[#0EA5E9]/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#FAFAFA]/60">Quick Install</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="text-[#FAFAFA]/60 hover:text-[#0EA5E9]"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <code className="font-mono text-[#0EA5E9] text-sm sm:text-base break-all">
                {installCommand}
              </code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
