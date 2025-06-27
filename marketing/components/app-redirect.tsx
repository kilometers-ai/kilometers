"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAppUrl } from "@/lib/app-redirect";
import { featureFlags } from "@/lib/feature-flags";

interface AppRedirectProps {
  to: string;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AppRedirect({ to, children, fallback }: AppRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    if (featureFlags.USE_EXTERNAL_APP) {
      window.location.href = getAppUrl(to);
    } else {
      router.push(to);
    }
  }, [to, router]);

  if (featureFlags.USE_EXTERNAL_APP) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#FAFAFA]/70">Redirecting to Kilometers app...</p>
        </div>
      </div>
    );
  }

  return fallback || children || null;
}
