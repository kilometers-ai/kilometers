"use client";

import { useState } from "react";
import {
  Activity,
  Eye,
  DollarSign,
  AlertTriangle,
  Database,
  Github,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiHealthIndicator } from "@/components/api-health-indicator";
import {
  useActivityEvents,
  useActivityStats,
  useApiHealth,
} from "@/hooks/use-api-data";
import { services, alerts } from "@/lib/sample-data";
import Link from "next/link";

const timeRanges = ["1h", "24h", "7d", "30d"];

const iconMap = {
  github: Github,
  database: Database,
  slack: MessageSquare,
};

export default function DashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("24h");
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useActivityEvents(10);
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useActivityStats();
  const { isHealthy } = useApiHealth();

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Activity":
        return Activity;
      case "Eye":
        return Eye;
      case "DollarSign":
        return DollarSign;
      case "AlertTriangle":
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-[rgba(250,250,250,0.7)]">
                {"Here's what your AI agents have been up to."}
              </p>
            </div>
            <ApiHealthIndicator isHealthy={isHealthy} />
          </div>
        </div>

        {/* Alert Banner */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <div className="bg-[#EF4444] bg-opacity-10 border border-[#EF4444] border-opacity-20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444] mr-3" />
                  <div>
                    <h3 className="font-medium text-[#FAFAFA]">
                      {alerts[0].title}
                    </h3>
                    <p className="text-sm text-[rgba(250,250,250,0.7)]">
                      {alerts[0].message}
                    </p>
                  </div>
                </div>
                <Link href="/investigate?alert=alert_001">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white bg-transparent"
                  >
                    Investigate <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <Button
                key={range}
                variant={selectedTimeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeRange(range)}
                className={
                  selectedTimeRange === range
                    ? "bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90"
                    : "border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] hover:text-[#FAFAFA]"
                }
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-[#18181B] border-[rgba(250,250,250,0.1)] rounded-lg p-6 border"
              >
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Requests"
                value={stats?.totalEvents || 0}
                trend="+8% from yesterday"
                icon={Eye}
                color="text-[#10B981]"
              />
              <StatsCard
                title="Total Cost"
                value={`$${stats?.totalCost?.toFixed(2) || "0.00"}`}
                trend="+15% from yesterday"
                icon={DollarSign}
                color="text-[#F59E0B]"
              />
              <StatsCard
                title="Unique Methods"
                value={stats?.uniqueMethods || 0}
                trend="2 new since yesterday"
                icon={AlertTriangle}
                color="text-[#EF4444]"
              />
              <StatsCard
                title="Avg Response Time"
                value={`${stats?.averageResponseTime?.toFixed(0) || 0}ms`}
                trend="+12% from yesterday"
                icon={Activity}
                color="text-[#0EA5E9]"
              />
            </>
          )}
        </div>

        {/* Services and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Services */}
          <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA]">Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service, index) => {
                  const IconComponent =
                    iconMap[service.icon as keyof typeof iconMap] || Database;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-[rgba(250,250,250,0.02)] hover:bg-[rgba(250,250,250,0.05)] transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-[rgba(14,165,233,0.1)]">
                          <IconComponent className="w-5 h-5 text-[#0EA5E9]" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-[#FAFAFA]">
                              {service.name}
                            </h3>
                            <Badge
                              variant={
                                service.status === "normal"
                                  ? "default"
                                  : "destructive"
                              }
                              className={
                                service.status === "normal"
                                  ? "bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20"
                                  : "bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20"
                              }
                            >
                              {service.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-[rgba(250,250,250,0.7)]">
                            <span>{service.requests} requests</span>
                            <span>{service.distance} km</span>
                            <span>${service.cost}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-[#10B981]" />
                        <span className="text-sm font-medium text-[#10B981]">
                          {service.trend}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
            <CardHeader>
              <CardTitle className="text-[#FAFAFA]">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)]"
                    >
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))
                ) : eventsError ? (
                  <div className="text-center py-8">
                    <p className="text-[#EF4444] mb-2">Failed to load events</p>
                    <p className="text-sm text-[rgba(250,250,250,0.7)]">
                      {eventsError}
                    </p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[rgba(250,250,250,0.7)] mb-2">
                      No recent activity
                    </p>
                    <p className="text-sm text-[rgba(250,250,250,0.5)]">
                      Run your CLI to start generating events
                    </p>
                  </div>
                ) : (
                  events.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[rgba(250,250,250,0.02)] hover:bg-[rgba(250,250,250,0.05)] transition-colors"
                    >
                      <div>
                        <p className="font-medium text-[#FAFAFA]">
                          {event.method || "Unknown method"}
                        </p>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#FAFAFA]">
                          {event.size} bytes
                        </p>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          ${event.costEstimate?.toFixed(3) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
