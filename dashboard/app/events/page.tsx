"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { EventsTable } from "@/components/events-table";
import { EventFilters } from "@/components/event-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActivityEvents } from "@/hooks/use-api-data";
import type { EventFilters as EventFiltersType } from "@/types/dashboard";
import type { ActivityEvent } from "@/lib/api-client";

export default function EventsPage() {
  const [isLive, setIsLive] = useState(true);
  const [filters, setFilters] = useState<EventFiltersType>({
    direction: "all",
    method: "",
    timeRange: "24h",
    riskLevel: "all",
  });

  const { events, loading, error, lastRefresh, refresh } = useActivityEvents(
    50,
    isLive ? 5000 : 0
  );
  const [filteredEvents, setFilteredEvents] = useState<ActivityEvent[]>([]);

  // Filter events based on current filters
  useEffect(() => {
    let filtered = events;

    if (filters.direction !== "all") {
      filtered = filtered.filter(
        (event) => event.direction === filters.direction
      );
    }

    if (filters.method) {
      filtered = filtered.filter((event) =>
        event.method?.toLowerCase().includes(filters.method.toLowerCase())
      );
    }

    if (filters.riskLevel !== "all") {
      filtered = filtered.filter((event) => {
        const riskScore = event.riskScore || 0;
        if (filters.riskLevel === "low") return riskScore < 20;
        if (filters.riskLevel === "medium")
          return riskScore >= 20 && riskScore < 50;
        if (filters.riskLevel === "high") return riskScore >= 50;
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [events, filters]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">
              Event Stream
            </h1>
            <p className="text-[rgba(250,250,250,0.7)]">
              Real-time monitoring of MCP events from your AI agents
            </p>
          </div>

          {/* Live Indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? "bg-[#10B981] animate-pulse"
                  : "bg-[rgba(250,250,250,0.3)]"
              }`}
            />
            <span className="text-sm font-medium text-[#FAFAFA]">
              {isLive ? "Live" : "Paused"}
              {lastRefresh &&
                ` • Last update: ${lastRefresh.toLocaleTimeString()}`}
            </span>
            <button
              onClick={() => setIsLive(!isLive)}
              className="ml-2 px-3 py-1 text-xs rounded-md bg-[rgba(14,165,233,0.1)] text-[#0EA5E9] hover:bg-[rgba(14,165,233,0.2)] transition-colors"
            >
              {isLive ? "Pause" : "Resume"}
            </button>
            <button
              onClick={refresh}
              className="ml-2 px-3 py-1 text-xs rounded-md bg-[rgba(34,197,94,0.1)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.2)] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)] mb-6">
          <CardContent className="p-6">
            <EventFilters filters={filters} onFiltersChange={setFilters} />
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#FAFAFA]">
                Events ({filteredEvents.length})
              </CardTitle>
              <Badge
                variant="outline"
                className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)]"
              >
                {loading
                  ? "Loading..."
                  : `Last updated: ${new Date().toLocaleTimeString()}`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <EventsTable
              events={filteredEvents}
              loading={loading}
              error={error}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
