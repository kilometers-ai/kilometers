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
import { useRouter } from "next/navigation";
import { redirectToApp, getAuthUrl } from "@/lib/app-redirect";
import { featureFlags } from "@/lib/feature-flags";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (featureFlags.ENABLE_GITHUB_OAUTH) {
    router.replace(getAuthUrl("login"));
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#FAFAFA]/70">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Redirect to dashboard
    redirectToApp("/dashboard");
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    // Simulate GitHub OAuth
    await new Promise((resolve) => setTimeout(resolve, 1000));
    redirectToApp("/dashboard");
  };

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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription className="text-[#FAFAFA]/70">
              Sign in to your Kilometers account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* GitHub login */}
            <Button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full bg-[#24292e] hover:bg-[#24292e]/90 text-white"
            >
              <Github className="h-4 w-4 mr-2" />
              {isLoading ? "Signing in..." : "Continue with GitHub"}
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

            {/* Email login form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
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
                  placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-[#0EA5E9] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-[#FAFAFA]/60">Don't have an account? </span>
              <Link href="/signup" className="text-[#0EA5E9] hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-sm text-[#FAFAFA]/60">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span>Secure login</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
              <span>2FA supported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
