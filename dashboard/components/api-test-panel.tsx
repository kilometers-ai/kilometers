"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Play, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

type TestResult = {
  success: boolean;
  data?: any;
  error?: string;
  duration?: number;
};

export function ApiTestPanel() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [running, setRunning] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);
  const { apiKey, isAuthenticated } = useAuth();

  const tests = [
    {
      name: "serviceInfo",
      label: "GET / (Service Info)",
      requiresAuth: false,
      fn: () => apiClient.getServiceInfo(),
    },
    {
      name: "health",
      label: "GET /health",
      requiresAuth: false,
      fn: () => apiClient.getHealth(),
    },
    {
      name: "customerInfo",
      label: "GET /api/customer (Customer Info)",
      requiresAuth: true,
      fn: () => apiClient.getCustomerInfo(),
    },
    {
      name: "testAuth",
      label: "Test Authentication",
      requiresAuth: true,
      fn: () => apiClient.testAuthentication(),
    },
    {
      name: "activity",
      label: "GET /api/activity",
      requiresAuth: true,
      fn: () => apiClient.getActivity(5),
    },
    {
      name: "stats",
      label: "GET /api/stats",
      requiresAuth: true,
      fn: () => apiClient.getStats(),
    },
    {
      name: "submitEvent",
      label: "POST /api/events",
      requiresAuth: true,
      fn: () => apiClient.submitEvent(apiClient.createTestEvent()),
    },
    {
      name: "submitBatch",
      label: "POST /api/events/batch",
      requiresAuth: true,
      fn: () =>
        apiClient.submitEventBatch({
          events: [apiClient.createTestEvent(), apiClient.createTestEvent()],
          cliVersion: "1.0.0-test",
          batchTimestamp: new Date().toISOString(),
        }),
    },
  ];

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setRunning((prev) => ({ ...prev, [testName]: true }));

    const startTime = Date.now();

    try {
      const test = tests.find((t) => t.name === testName);
      if (test?.requiresAuth && apiKey) {
        apiClient.setApiKey(apiKey);
      }

      const data = await testFn();
      const duration = Date.now() - startTime;

      setResults((prev) => ({
        ...prev,
        [testName]: { success: true, data, duration },
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
        },
      }));
    } finally {
      setRunning((prev) => ({ ...prev, [testName]: false }));
    }
  };

  const clearResults = () => {
    setResults({});
  };

  const runAllTests = async () => {
    clearResults();

    for (const test of tests) {
      if (test.requiresAuth && !isAuthenticated) {
        setResults((prev) => ({
          ...prev,
          [test.name]: {
            success: false,
            error: "Authentication required - please set your API key",
          },
        }));
        continue;
      }

      await runTest(test.name, test.fn);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  };

  const getTestStatusBadge = (testName: string) => {
    const result = results[testName];
    const isRunning = running[testName];

    if (isRunning) {
      return <Badge variant="secondary">Running...</Badge>;
    }

    if (!result) {
      return <Badge variant="outline">Not run</Badge>;
    }

    if (result.success) {
      return (
        <Badge className="bg-green-600 hover:bg-green-700">✓ Success</Badge>
      );
    }

    return <Badge variant="destructive">✗ Failed</Badge>;
  };

  return (
    <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-[rgba(250,250,250,0.02)] transition-colors">
            <CardTitle className="flex items-center justify-between text-[#FAFAFA]">
              <span>API Test Panel</span>
              <div className="flex items-center space-x-2">
                {!isAuthenticated && (
                  <Badge
                    variant="outline"
                    className="text-yellow-400 border-yellow-400"
                  >
                    Auth Required
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
              <div>
                <p className="font-medium text-[#FAFAFA]">
                  Authentication Status
                </p>
                <p className="text-sm text-[rgba(250,250,250,0.7)]">
                  {apiKey
                    ? `API Key: ${apiKey.substring(0, 15)}...`
                    : "No API key set"}
                </p>
              </div>
              <Badge
                className={
                  isAuthenticated
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {isAuthenticated ? "✓ Authenticated" : "✗ Not Authenticated"}
              </Badge>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={runAllTests}
                disabled={Object.values(running).some(Boolean)}
                className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </Button>
              <Button
                onClick={clearResults}
                variant="outline"
                className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear Results
              </Button>
            </div>

            <div className="space-y-2">
              {tests.map((test) => (
                <div
                  key={test.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-[#FAFAFA]">
                        {test.label}
                      </span>
                      {test.requiresAuth && (
                        <Badge variant="outline" className="text-xs">
                          Auth Required
                        </Badge>
                      )}
                    </div>
                    {results[test.name]?.duration && (
                      <p className="text-xs text-[rgba(250,250,250,0.5)]">
                        {results[test.name].duration}ms
                      </p>
                    )}
                    {results[test.name]?.error && (
                      <p className="text-xs text-red-400 mt-1">
                        {results[test.name].error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {getTestStatusBadge(test.name)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runTest(test.name, test.fn)}
                      disabled={
                        running[test.name] ||
                        (test.requiresAuth && !isAuthenticated)
                      }
                      className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(results).length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
                <h4 className="font-medium text-[#FAFAFA] mb-2">
                  Test Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-[rgba(250,250,250,0.7)]">
                      Passed:
                    </span>
                    <span className="ml-2 text-green-400">
                      {Object.values(results).filter((r) => r.success).length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[rgba(250,250,250,0.7)]">
                      Failed:
                    </span>
                    <span className="ml-2 text-red-400">
                      {Object.values(results).filter((r) => !r.success).length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
