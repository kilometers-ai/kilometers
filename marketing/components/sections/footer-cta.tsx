"use client";

import React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAppUrl, getAuthUrl } from "@/lib/app-redirect";

export function FooterCTA() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleGetStartedClick = () => {
    // Handle get started click
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Start monitoring in{" "}
            <span className="text-[#0EA5E9]">30 seconds</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who've taken control of their AI
            monitoring. No credit card required.
          </p>

          <div className="max-w-md mx-auto">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#18181B] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9]"
                required
              />
              <Button
                type="submit"
                className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white px-8"
                disabled={isSubmitted}
                asChild={!isSubmitted}
              >
                {isSubmitted ? (
                  "Sent!"
                ) : (
                  <a href={getAuthUrl("signup")}>Get Started</a>
                )}
              </Button>
            </form>

            <p className="text-sm text-[#FAFAFA]/60 mt-4">
              Free forever. No spam. Unsubscribe anytime.
            </p>
          </div>

          <div className="mt-12 p-6 bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-[#10B981] rounded-full animate-pulse"></div>
              <span className="text-sm text-[#FAFAFA]/70">
                Live Install Command
              </span>
            </div>
            <code className="font-mono text-[#0EA5E9] text-sm sm:text-base">
              curl -sSL https://get.kilometers.ai | sh
            </code>
          </div>

          <p className="text-lg text-center text-[#FAFAFA]/70">
            Join developers who are monitoring their AI's every move.
          </p>
        </div>
      </div>
    </section>
  );
}
