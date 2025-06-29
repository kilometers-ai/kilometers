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
  Key,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { StatsCard } from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiHealthIndicator } from "@/components/api-health-indicator";
import {
  useActivityEvents,
  useActivityStats,
  useApiHealth,
} from "@/hooks/use-api-data";
import { useAuth } from "@/hooks/use-auth";
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
    isAuthenticated,
    apiKey,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useActivityEvents(apiKey || undefined, 10);
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useActivityStats(apiKey || undefined);
  const { isHealthy } = useApiHealth(apiKey || undefined);

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
        {/* Authentication Alert */}
        {!authLoading && !isAuthenticated && (
          <Alert className="mb-8 bg-[#EF4444] bg-opacity-10 border-[#EF4444] border-opacity-20">
            <Key className="h-4 w-4 text-[#EF4444]" />
            <AlertDescription className="text-[#FAFAFA]">
              <strong>Authentication Required:</strong> Please configure your
              API key in{" "}
              <Link href="/settings" className="text-[#0EA5E9] hover:underline">
                Settings
              </Link>{" "}
              to view real-time data. Currently showing sample data.
            </AlertDescription>
          </Alert>
        )}

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
              {!isAuthenticated && !authLoading && (
                <Badge
                  variant="outline"
                  className="mt-2 border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B] bg-opacity-10"
                >
                  Sample Data Mode
                </Badge>
              )}
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
          {statsLoading || authLoading ? (
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
          ) : statsError && isAuthenticated ? (
            // Error state for authenticated users
            <div className="col-span-full">
              <Alert className="bg-[#EF4444] bg-opacity-10 border-[#EF4444] border-opacity-20">
                <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                <AlertDescription className="text-[#FAFAFA]">
                  Failed to load statistics: {statsError}
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <StatsCard
                title="Total Requests"
                value={isAuthenticated ? stats?.totalEvents || 0 : 1247}
                trend="+8% from yesterday"
                icon={Eye}
                color="text-[#10B981]"
              />
              <StatsCard
                title="Total Cost"
                value={
                  isAuthenticated
                    ? `$${stats?.totalCost?.toFixed(2) || "0.00"}`
                    : "$4.32"
                }
                trend="+15% from yesterday"
                icon={DollarSign}
                color="text-[#F59E0B]"
              />
              <StatsCard
                title="Unique Methods"
                value={isAuthenticated ? stats?.uniqueMethods || 0 : 12}
                trend="2 new since yesterday"
                icon={AlertTriangle}
                color="text-[#EF4444]"
              />
              <StatsCard
                title="Avg Response Time"
                value={
                  isAuthenticated
                    ? `${stats?.averageResponseTime?.toFixed(0) || 0}ms`
                    : "156ms"
                }
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
                      className="flex items-center justify-between p-3 rounded-lg bg-[rgba(250,250,250,0.03)] border border-[rgba(250,250,250,0.05)]"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-[rgba(14,165,233,0.1)]">
                          <IconComponent className="w-4 h-4 text-[#0EA5E9]" />
                        </div>
                        <div>
                          <h4 className="font-medium text-[#FAFAFA]">
                            {service.name}
                          </h4>
                          <p className="text-sm text-[rgba(250,250,250,0.7)]">
                            {service.requests} requests • {service.distance} km
                            • ${service.cost}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          service.status === "normal"
                            ? "border-[#10B981] text-[#10B981] bg-[#10B981] bg-opacity-10"
                            : "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B] bg-opacity-10"
                        }`}
                      >
                        {service.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#FAFAFA]">
                  Recent Activity
                </CardTitle>
                {!isAuthenticated && (
                  <Badge
                    variant="outline"
                    className="border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B] bg-opacity-10"
                  >
                    Sample Data
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading || authLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : eventsError && isAuthenticated ? (
                <Alert className="bg-[#EF4444] bg-opacity-10 border-[#EF4444] border-opacity-20">
                  <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                  <AlertDescription className="text-[#FAFAFA]">
                    Failed to load recent events: {eventsError}
                  </AlertDescription>
                </Alert>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[rgba(250,250,250,0.7)] mb-2">
                    No recent events
                  </p>
                  <p className="text-sm text-[rgba(250,250,250,0.5)]">
                    Run your CLI to start generating events
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.slice(0, 5).map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-[rgba(250,250,250,0.03)] border border-[rgba(250,250,250,0.05)]"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            event.direction === "request"
                              ? "bg-[#3B82F6]"
                              : "bg-[#10B981]"
                          }`}
                        />
                        <div>
                          <h4 className="font-medium text-[#FAFAFA] text-sm">
                            {event.method || "Response"}
                          </h4>
                          <p className="text-xs text-[rgba(250,250,250,0.7)]">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          event.direction === "request"
                            ? "border-[#3B82F6] text-[#3B82F6] bg-[#3B82F6] bg-opacity-10"
                            : "border-[#10B981] text-[#10B981] bg-[#10B981] bg-opacity-10"
                        }
                      >
                        {event.direction}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* View All Button */}
              <div className="mt-6 text-center">
                <Link href="/events">
                  <Button
                    variant="outline"
                    className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] hover:text-[#FAFAFA] bg-transparent"
                  >
                    View All Events <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Chart */}
        <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)] mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#FAFAFA]">Usage Growth</CardTitle>
              <TrendingUp className="w-5 h-5 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <h3 className="text-xl font-medium text-[#FAFAFA] mb-2">
                Growth Charts Coming Soon
              </h3>
              <p className="text-[rgba(250,250,250,0.7)] max-w-md mx-auto">
                {isAuthenticated
                  ? "We're building beautiful charts to visualize your AI agent usage patterns over time."
                  : "Connect your API key to see real usage trends and growth patterns."}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
