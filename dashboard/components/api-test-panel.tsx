"use client";

import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ApiTestPanel() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (name: string, fn: () => Promise<any>) => {
    setLoading((prev) => ({ ...prev, [name]: true }));
    try {
      const result = await fn();
      setResults((prev) => ({
        ...prev,
        [name]: { success: true, data: result },
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [name]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: "serviceInfo",
      label: "GET / (Service Info)",
      fn: () => api.getServiceInfo(),
    },
    {
      name: "health",
      label: "GET /health",
      fn: () => api.getHealth(),
    },
    {
      name: "activity",
      label: "GET /api/activity",
      fn: () => api.getActivity(),
    },
    {
      name: "activityWithParams",
      label: "GET /api/activity (with params)",
      fn: () => api.getActivity("test-customer", 5),
    },
    {
      name: "stats",
      label: "GET /api/stats",
      fn: () => api.getStats(),
    },
    {
      name: "statsWithCustomer",
      label: "GET /api/stats (with customer)",
      fn: () => api.getStats("test-customer"),
    },
    {
      name: "submitEvent",
      label: "POST /api/events",
      fn: () => api.submitEvent(api.createTestEvent()),
    },
    {
      name: "submitBatch",
      label: "POST /api/events/batch",
      fn: () =>
        api.submitEventBatch({
          events: [api.createTestEvent(), api.createTestEvent()],
        }),
    },
  ];

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Endpoint Tests</h2>
        <Button variant="outline" onClick={clearResults}>
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <CardTitle className="text-sm">{test.label}</CardTitle>
              <CardDescription>
                {results[test.name] && (
                  <Badge
                    variant={
                      results[test.name].success ? "default" : "destructive"
                    }
                  >
                    {results[test.name].success ? "Success" : "Failed"}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => testEndpoint(test.name, test.fn)}
                disabled={loading[test.name]}
                className="w-full mb-3"
              >
                {loading[test.name] ? "Testing..." : "Test Endpoint"}
              </Button>

              {results[test.name] && (
                <div className="mt-3">
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(results[test.name], null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
