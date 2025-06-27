"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Github, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAppUrl, getAuthUrl } from "@/lib/app-redirect";
import { featureFlags } from "@/lib/feature-flags";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";

  if (featureFlags.ENABLE_GITHUB_OAUTH) {
    router.replace(getAuthUrl("signup"));
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#FAFAFA]/70">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to onboarding with plan info
    const onboardingUrl = getAppUrl(
      `/onboarding?plan=${plan}&email=${encodeURIComponent(email)}`
    );
    window.location.href = onboardingUrl;
  };

  const handleGithubSignup = async () => {
    setIsLoading(true);
    // Simulate GitHub OAuth
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const onboardingUrl = getAppUrl(`/onboarding?plan=${plan}&provider=github`);
    window.location.href = onboardingUrl;
  };

  const planDetails = {
    free: { name: "Free Plan", price: "$0/month", features: "1K events/month" },
    pro: {
      name: "Pro Plan",
      price: "$49/month",
      features: "Unlimited monitoring",
    },
  };

  const currentPlan =
    planDetails[plan as keyof typeof planDetails] || planDetails.free;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        <Card className="bg-[#18181B] border-[#0EA5E9]/20">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-[#0EA5E9] rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <CardTitle className="text-2xl">Start monitoring your AI</CardTitle>
            <CardDescription className="text-[#FAFAFA]/70">
              Join thousands of developers tracking their AI agents
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Plan info */}
            <div className="p-4 bg-[#0EA5E9]/10 rounded-lg border border-[#0EA5E9]/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#0EA5E9]">
                    {currentPlan.name}
                  </div>
                  <div className="text-sm text-[#FAFAFA]/70">
                    {currentPlan.features}
                  </div>
                </div>
                <div className="text-lg font-bold">{currentPlan.price}</div>
              </div>
            </div>

            {/* GitHub signup */}
            <Button
              onClick={handleGithubSignup}
              disabled={isLoading}
              className="w-full bg-[#24292e] hover:bg-[#24292e]/90 text-white"
            >
              <Github className="h-4 w-4 mr-2" />
              {isLoading ? "Connecting..." : "Continue with GitHub"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#0EA5E9]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#18181B] px-2 text-[#FAFAFA]/60">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email signup form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0A0A0A] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9]"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0A0A0A] border-[#0EA5E9]/20 text-[#FAFAFA] placeholder:text-[#FAFAFA]/50 focus:border-[#0EA5E9] pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-[#FAFAFA]/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-[#FAFAFA]/50" />
                  )}
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-xs text-[#FAFAFA]/60 text-center">
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-[#0EA5E9] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#0EA5E9] hover:underline">
                Privacy Policy
              </Link>
            </p>

            <div className="text-center">
              <span className="text-[#FAFAFA]/60">
                Already have an account?{" "}
              </span>
              <Link href="/login" className="text-[#0EA5E9] hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-[#FAFAFA]/60">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span>30-day free trial</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span>No credit card</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
