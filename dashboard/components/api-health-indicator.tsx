import React from "react";
import { Badge } from "@/components/ui/badge";

interface ApiHealthIndicatorProps {
  isHealthy: boolean | null;
}

export function ApiHealthIndicator({ isHealthy }: ApiHealthIndicatorProps) {
  if (isHealthy === null) {
    return (
      <Badge
        variant="outline"
        className="border-[rgba(250,250,250,0.3)] text-[rgba(250,250,250,0.7)]"
      >
        Checking...
      </Badge>
    );
  }

  return (
    <Badge
      variant={isHealthy ? "default" : "destructive"}
      className={
        isHealthy
          ? "bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20"
          : "bg-[#EF4444] bg-opacity-20 text-[#EF4444] border-[#EF4444] border-opacity-20"
      }
    >
      {isHealthy ? "API Healthy" : "API Down"}
    </Badge>
  );
}
