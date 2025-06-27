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
import { Copy, Check, ChevronRight, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { redirectToApp } from "@/lib/app-redirect";
import { ConnectionVerification } from "@/components/onboarding/connection-verification";

export default function OnboardingClientPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTool, setSelectedTool] = useState("");
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "free";
  const email = searchParams.get("email");

  const tools = [
    {
      id: "cursor",
      name: "Cursor",
      description: "AI-powered code editor",
      logo: "🔮",
      config: `{
  "mcpServers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--cursor"]
    }
  }
}`,
    },
    {
      id: "claude",
      name: "Claude Desktop",
      description: "Anthropic's desktop app",
      logo: "🤖",
      config: `{
  "mcpServers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--claude"]
    }
  }
}`,
    },
    {
      id: "vscode",
      name: "VS Code",
      description: "With AI extensions",
      logo: "💻",
      config: `{
  "ai.mcp.servers": {
    "kilometers": {
      "command": "km",
      "args": ["--monitor", "--vscode"]
    }
  }
}`,
    },
  ];

  const installCommand = "curl -sSL https://get.kilometers.ai | sh";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = () => {
    redirectToApp("/dashboard");
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">K</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to Kilometers</h1>
              <p className="text-[#FAFAFA]/70">
                Let's get your AI monitoring set up
              </p>
            </div>
          </div>
          {email && (
            <div className="text-sm text-[#FAFAFA]/70">
              Signed up as: <span className="text-[#0EA5E9]">{email}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#FAFAFA]/70">
              Step {currentStep} of 3
            </span>
            <span className="text-sm text-[#FAFAFA]/70">
              {Math.round(progress)}% complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Choose Tool */}
        {currentStep === 1 && (
          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader>
              <CardTitle>Choose your AI tool</CardTitle>
              <CardDescription className="text-[#FAFAFA]/70">
                Which AI tool do you want to monitor?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedTool === tool.id
                        ? "border-[#0EA5E9] bg-[#0EA5E9]/10"
                        : "border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40"
                    }`}
                  >
                    <div className="text-3xl mb-3">{tool.logo}</div>
                    <h3 className="font-semibold mb-2">{tool.name}</h3>
                    <p className="text-sm text-[#FAFAFA]/70">
                      {tool.description}
                    </p>
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => router.push("/signup")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedTool}
                  className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Install & Configure */}
        {currentStep === 2 && (
          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader>
              <CardTitle>Install & Configure</CardTitle>
              <CardDescription className="text-[#FAFAFA]/70">
                Follow these steps to set up monitoring for{" "}
                {tools.find((t) => t.id === selectedTool)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 2.1: Install */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-[#0EA5E9] rounded-full flex items-center justify-center text-sm mr-3">
                    1
                  </span>
                  Install Kilometers CLI
                </h3>
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#FAFAFA]/60 font-mono">
                      TERMINAL
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(installCommand)}
                      className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                    >
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <code className="font-mono text-[#0EA5E9] text-sm">
                    {installCommand}
                  </code>
                </div>
              </div>

              {/* Step 2.2: Configure */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <span className="w-6 h-6 bg-[#0EA5E9] rounded-full flex items-center justify-center text-sm mr-3">
                    2
                  </span>
                  Add to your {tools.find((t) => t.id === selectedTool)?.name}{" "}
                  config
                </h3>
                <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#0EA5E9]/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#FAFAFA]/60 font-mono">
                      CONFIG
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copyToClipboard(
                          tools.find((t) => t.id === selectedTool)?.config || ""
                        )
                      }
                      className="text-[#FAFAFA]/60 hover:text-[#0EA5E9] h-6 w-6 p-0"
                    >
                      {copied ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <pre className="font-mono text-[#0EA5E9] text-sm whitespace-pre-wrap">
                    {tools.find((t) => t.id === selectedTool)?.config}
                  </pre>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
                >
                  I've completed the setup
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Verify Connection - Now Feature Flagged */}
        {currentStep === 3 && (
          <ConnectionVerification
            selectedTool={selectedTool}
            tools={tools}
            onBack={() => setCurrentStep(2)}
            onComplete={handleFinish}
          />
        )}
      </div>
    </div>
  );
}
