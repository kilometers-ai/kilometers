"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  DollarSign,
  Eye,
  Settings,
  Bell,
  Github,
  Database,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { AppRedirect } from "@/components/app-redirect";
import { featureFlags } from "@/lib/feature-flags";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: { [key: string]: React.ElementType } = {
  "GitHub API": Github,
  "Mock GitHub API": Github,
  Database: Database,
  "Mock Database": Database,
  "Slack API": MessageSquare,
  "Mock Slack API": MessageSquare,
};

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (e) {
        setError("Failed to load dashboard data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  if (featureFlags.USE_EXTERNAL_APP) {
    return <AppRedirect to="/dashboard" />;
  }

  const services = dashboardData?.services || [];
  const recentActivity = dashboardData?.recentActivity || [];

  const renderServiceIcon = (serviceName: string) => {
    const Icon = iconMap[serviceName] || Activity;
    return (
      <Icon
        className={`h-5 w-5 ${
          serviceName.includes("Mock") ? "text-[#F59E0B]" : "text-[#0EA5E9]"
        }`}
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] p-8">
        <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
        <p className="text-[#FAFAFA]/70 mb-8">
          Here's what your AI agents have been up to.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Skeleton className="h-24 bg-[#18181B]" />
          <Skeleton className="h-24 bg-[#18181B]" />
          <Skeleton className="h-24 bg-[#18181B]" />
          <Skeleton className="h-24 bg-[#18181B]" />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 bg-[#18181B]" />
          <Skeleton className="h-96 bg-[#18181B]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-500">An Error Occurred</h2>
        <p className="text-[#FAFAFA]/70">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#18181B] bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-[#FAFAFA]/70">
            Here's what your AI agents have been up to.
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center space-x-2 mb-8">
          <span className="text-sm text-[#FAFAFA]/70">Time range:</span>
          {["1h", "24h", "7d", "30d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={
                timeRange === range ? "bg-[#0EA5E9] hover:bg-[#0EA5E9]/90" : ""
              }
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Distance
              </CardTitle>
              <Activity className="h-4 w-4 text-[#0EA5E9]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0EA5E9]">
                <AnimatedCounter value={457} />
                km
              </div>
              <p className="text-xs text-[#FAFAFA]/60">+12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Eye className="h-4 w-4 text-[#10B981]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#10B981]">
                <AnimatedCounter value={1471} />
              </div>
              <p className="text-xs text-[#FAFAFA]/60">+8% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-[#F59E0B]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#F59E0B]">
                $<AnimatedCounter value={47} />
                .23
              </div>
              <p className="text-xs text-[#FAFAFA]/60">+15% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#EF4444]">
                <AnimatedCounter value={3} />
              </div>
              <p className="text-xs text-[#FAFAFA]/60">2 new since yesterday</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Services */}
          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
              <CardDescription className="text-[#FAFAFA]/70">
                Your AI agents' favorite destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services.map((service: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      service.status === "warning"
                        ? "bg-[#F59E0B]/10 border-[#F59E0B]/30"
                        : "bg-[#0A0A0A] border-[#0EA5E9]/10"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          service.status === "warning"
                            ? "bg-[#F59E0B]/20"
                            : "bg-[#0EA5E9]/20"
                        }`}
                      >
                        {renderServiceIcon(service.name)}
                      </div>
                      <div>
                        <div className="font-semibold">{service.name}</div>
                        <div className="text-sm text-[#FAFAFA]/70">
                          {service.requests} requests
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold">
                        {service.distance} km
                      </div>
                      <div className="text-sm text-[#FAFAFA]/70">
                        ${service.cost}
                      </div>
                      <Badge
                        variant={
                          service.status === "warning"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {service.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#18181B] border-[#0EA5E9]/20">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-[#FAFAFA]/70">
                Latest AI agent requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A]"
                  >
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-[#FAFAFA]/70">
                        {activity.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-[#0EA5E9]">
                        {activity.distance}
                      </div>
                      <div className="text-sm text-[#FAFAFA]/70">
                        {activity.cost}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner */}
        <div className="mt-8">
          <div className="p-4 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-[#EF4444] animate-pulse" />
              <div>
                <div className="font-semibold text-[#EF4444]">
                  Unusual Activity Detected
                </div>
                <div className="text-sm text-[#FAFAFA]/70">
                  Database queries increased 340% in the last hour.
                  <Button
                    variant="link"
                    className="text-[#0EA5E9] p-0 ml-1 h-auto"
                  >
                    Investigate →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
