"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { featureFlags } from "@/lib/feature-flags";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import api from "@/lib/api";

export enum ConnectionStatus {
  IDLE = "idle",
  CHECKING = "checking",
  CONNECTED = "connected",
  TIMEOUT = "timeout",
  ERROR = "error",
  SKIPPED = "skipped",
}

interface FirstRequestData {
  timestamp: string;
  source: string;
  destination: string;
  distance: number;
  cost: number;
  requestType: string;
}

interface ConnectionVerificationProps {
  selectedTool: string;
  tools: Array<{
    id: string;
    name: string;
    logo: string;
    config: string;
  }>;
  onBack: () => void;
  onComplete: () => void;
}

export function ConnectionVerification({
  selectedTool,
  tools,
  onBack,
  onComplete,
}: ConnectionVerificationProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.IDLE
  );
  const [connectionData, setConnectionData] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [checkingDuration, setCheckingDuration] = useState(0);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const selectedToolData = tools.find((t) => t.id === selectedTool);

  const startVerification = () => {
    setConnectionStatus(ConnectionStatus.CHECKING);
    setCheckingDuration(0);
    setRetryCount(0);

    const check = async () => {
      const startTime = Date.now();
      const timeout = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout")),
          featureFlags.CONNECTION_TIMEOUT_MS
        )
      );

      try {
        const connectionResult = await Promise.race([
          api.checkConnection(selectedToolData?.name || "AI Tool"),
          timeout,
        ]);

        if (connectionResult.connected) {
          setConnectionData(connectionResult.firstRequest);
          setConnectionStatus(ConnectionStatus.CONNECTED);
        } else {
          // This path might not be taken if the promise rejects on failure
          setConnectionStatus(ConnectionStatus.ERROR);
        }
      } catch (error: any) {
        if (error.message === "Timeout") {
          setConnectionStatus(ConnectionStatus.TIMEOUT);
        } else {
          console.error("Connection check failed:", error);
          setConnectionStatus(ConnectionStatus.ERROR);
        }
      } finally {
        const elapsed = Date.now() - startTime;
        setCheckingDuration(elapsed);
      }
    };

    check();
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    startVerification();
  };

  const handleSkip = () => {
    if (featureFlags.ENABLE_MANUAL_VERIFICATION_SKIP) {
      setConnectionStatus(ConnectionStatus.SKIPPED);
    }
  };

  const handleComplete = () => {
    if (featureFlags.ENABLE_CONNECTION_ANALYTICS) {
      // Track completion analytics
      console.log("Connection verification completed", {
        status: connectionStatus,
        tool: selectedTool,
        duration: checkingDuration,
        retries: retryCount,
      });
    }
    onComplete();
  };

  // Auto-start verification when component mounts
  useEffect(() => {
    if (connectionStatus === ConnectionStatus.IDLE) {
      startVerification();
    }
  }, []);

  const getProgressMessage = () => {
    if (checkingDuration < 5000) return "Initializing connection check...";
    if (checkingDuration < 15000) return "Looking for AI activity...";
    if (checkingDuration < 30000) return "Checking MCP server integration...";
    if (checkingDuration < 60000)
      return "Still looking... Try making an AI request";
    return "Taking longer than expected...";
  };

  const isComplete =
    connectionStatus === ConnectionStatus.CONNECTED ||
    connectionStatus === ConnectionStatus.SKIPPED;
  const canRetry =
    connectionStatus === ConnectionStatus.TIMEOUT ||
    connectionStatus === ConnectionStatus.ERROR;

  return (
    <Card className="bg-[#18181B] border-[#0EA5E9]/20">
      <CardHeader>
        <CardTitle>Verifying connection</CardTitle>
        <CardDescription className="text-[#FAFAFA]/70">
          {connectionStatus === ConnectionStatus.SKIPPED
            ? "Connection verification skipped"
            : "We're checking for your AI agent activity..."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Loading State */}
        {connectionStatus === ConnectionStatus.CHECKING && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-[#0EA5E9]/20 border-t-[#0EA5E9] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#FAFAFA]/70">{getProgressMessage()}</p>
            <p className="text-sm text-[#FAFAFA]/50 mt-2">
              Make a request with your AI tool to test the connection
            </p>

            {/* Duration indicator */}
            <div className="mt-4 text-xs text-[#FAFAFA]/40">
              Checking for {Math.round(checkingDuration / 1000)}s...
            </div>

            {/* Manual skip option */}
            {featureFlags.ENABLE_MANUAL_VERIFICATION_SKIP &&
              checkingDuration > 30000 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="mt-4 border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10"
                >
                  Skip verification (I'll test later)
                </Button>
              )}
          </div>
        )}

        {/* Success State */}
        {connectionStatus === ConnectionStatus.CONNECTED && connectionData && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-[#10B981]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#10B981]">
              Connection successful!
            </h3>
            <p className="text-[#FAFAFA]/70 mb-6">
              We detected your first AI request. You're all set up!
            </p>

            {/* First request data */}
            <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#10B981]/20 max-w-md mx-auto">
              <div className="text-sm text-[#FAFAFA]/70 mb-2">
                First request detected:
              </div>
              <div className="font-mono text-[#0EA5E9] text-sm">
                {connectionData.source} → {connectionData.destination}
              </div>
              <div className="text-xs text-[#FAFAFA]/50 mt-1">
                Distance: {connectionData.distance} km • Cost: $
                {connectionData.cost.toFixed(3)} • Just now
              </div>
            </div>
          </div>
        )}

        {/* Skipped State */}
        {connectionStatus === ConnectionStatus.SKIPPED && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#F59E0B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-[#F59E0B]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F59E0B]">
              Verification skipped
            </h3>
            <p className="text-[#FAFAFA]/70 mb-6">
              You can test the connection later from your dashboard.
            </p>
          </div>
        )}

        {/* Timeout State */}
        {connectionStatus === ConnectionStatus.TIMEOUT && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#F59E0B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-[#F59E0B]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#F59E0B]">
              Connection timeout
            </h3>
            <p className="text-[#FAFAFA]/70 mb-6">
              We couldn't detect your AI tool. You can retry or continue to set
              up monitoring later.
            </p>
          </div>
        )}

        {/* Error State */}
        {connectionStatus === ConnectionStatus.ERROR && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#EF4444]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-[#EF4444]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#EF4444]">
              Connection error
            </h3>
            <p className="text-[#FAFAFA]/70 mb-6">
              There was an error checking your connection. Please try again or
              skip for now.
            </p>
          </div>
        )}

        {/* Troubleshooting Section */}
        {featureFlags.ENABLE_CONNECTION_TROUBLESHOOTING &&
          (canRetry || connectionStatus === ConnectionStatus.CHECKING) && (
            <Collapsible
              open={showTroubleshooting}
              onOpenChange={setShowTroubleshooting}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-[#FAFAFA]/60 hover:text-[#0EA5E9]"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Need help troubleshooting?
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                  <h4 className="font-semibold mb-3">
                    Troubleshooting checklist:
                  </h4>
                  <ul className="space-y-2 text-sm text-[#FAFAFA]/70">
                    <li>
                      • Make sure you saved the config file after adding the
                      Kilometers configuration
                    </li>
                    <li>
                      • Restart {selectedToolData?.name} after updating the
                      config
                    </li>
                    <li>
                      • Try making a simple request in your AI tool (ask "Hello"
                      or similar)
                    </li>
                    <li>
                      • Check if the 'km' command is installed and in your PATH
                    </li>
                    <li>
                      • Verify the JSON configuration is valid (no extra commas
                      or brackets)
                    </li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={connectionStatus === ConnectionStatus.CHECKING}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {canRetry && (
              <Button
                variant="outline"
                onClick={handleRetry}
                className="border-[#0EA5E9] text-[#0EA5E9]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}

            {featureFlags.ENABLE_MANUAL_VERIFICATION_SKIP &&
              !isComplete &&
              connectionStatus !== ConnectionStatus.CHECKING && (
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  className="border-[#F59E0B] text-[#F59E0B]"
                >
                  Skip for now
                </Button>
              )}

            <Button
              onClick={handleComplete}
              disabled={!isComplete}
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
            >
              {connectionStatus === ConnectionStatus.SKIPPED
                ? "Continue to Dashboard"
                : "Go to Dashboard"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
