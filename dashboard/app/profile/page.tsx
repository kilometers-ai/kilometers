"use client";

import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Mail,
  Calendar,
  CreditCard,
  Bell,
  Shield,
  Download,
  Edit,
  Check,
  Crown,
  Zap,
  Building,
  AlertTriangle,
  Key,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCustomerInfo } from "@/hooks/use-api-data";
import { sampleUser } from "@/lib/sample-data";
import Link from "next/link";

export default function ProfilePage() {
  const [editingProfile, setEditingProfile] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    security: true,
    billing: true,
    marketing: false,
  });

  // ✅ Real authentication and customer data
  const {
    apiKey,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  const {
    customerInfo,
    loading: customerLoading,
    error: customerError,
  } = useCustomerInfo(apiKey || undefined);

  // Sample billing history (TODO: Add to API)
  const billingHistory = [
    {
      date: "2025-06-01",
      description: "Monthly subscription - Pro Plan",
      amount: "$29.00",
      status: "Paid",
    },
    {
      date: "2025-05-01",
      description: "Monthly subscription - Pro Plan",
      amount: "$29.00",
      status: "Paid",
    },
    {
      date: "2025-04-01",
      description: "Monthly subscription - Pro Plan",
      amount: "$29.00",
      status: "Paid",
    },
  ];

  // Use real customer data when available, fallback to sample
  const displayData = {
    name: customerInfo?.organization || sampleUser.name,
    email: customerInfo?.email || sampleUser.email,
    avatar: sampleUser.avatar, // TODO: Add avatar to customer info
    subscription: sampleUser.subscription, // TODO: Add subscription to customer info
    joinedAt: customerInfo?.authenticatedAt || sampleUser.joinedAt,
    apiKeyPrefix: customerInfo?.apiKeyPrefix,
    monthlyUsage: sampleUser.monthlyUsage, // TODO: Add usage data to customer info
  };

  const usagePercentage =
    (displayData.monthlyUsage.events / displayData.monthlyUsage.limit) * 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Profile</h1>
          <p className="text-[rgba(250,250,250,0.7)]">
            Manage your account settings, billing information, and preferences.
            <Link
              href="/settings"
              className="text-[#0EA5E9] hover:underline ml-1"
            >
              Visit settings
            </Link>{" "}
            for API keys and technical configuration.
          </p>
        </div>

        {/* Authentication Status Alert */}
        {!isAuthenticated && !authLoading && (
          <Alert className="mb-6 border-yellow-500/20 bg-yellow-500/10">
            <Key className="h-4 w-4" />
            <AlertDescription className="text-yellow-400">
              You're viewing sample data. Set your API key in{" "}
              <Link href="/settings" className="underline">
                Settings
              </Link>{" "}
              to see your real account information.
            </AlertDescription>
          </Alert>
        )}

        {/* API Errors */}
        {(authError || customerError) && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-400">
              {authError || customerError}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#18181B] border border-[rgba(250,250,250,0.1)]">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Security
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-[#FAFAFA]">
                      Profile Information
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProfile(!editingProfile)}
                        className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                      >
                        {editingProfile ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={displayData.avatar || "/placeholder.svg"}
                          alt={displayData.name}
                        />
                        <AvatarFallback className="text-lg">
                          {displayData.name
                            ? displayData.name[0].toUpperCase()
                            : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        {editingProfile ? (
                          <>
                            <Input
                              defaultValue={displayData.name}
                              className="bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]"
                              placeholder="Full Name"
                            />
                            <Input
                              defaultValue={displayData.email}
                              className="bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA]"
                              placeholder="Email Address"
                              disabled={Boolean(isAuthenticated)} // Fix: Convert null to boolean
                            />
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold text-[#FAFAFA]">
                              {displayData.name}
                            </h3>
                            <p className="text-[rgba(250,250,250,0.7)] flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              {displayData.email}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[rgba(250,250,250,0.7)]">
                          Subscription Plan
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Crown className="w-5 h-5 text-[#F59E0B]" />
                          <Badge className="bg-[#F59E0B] bg-opacity-20 text-[#F59E0B] border-[#F59E0B] border-opacity-20">
                            {displayData.subscription.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[rgba(250,250,250,0.7)]">
                          Member Since
                        </Label>
                        <p className="text-[#FAFAFA] flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(displayData.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* API Key Info */}
                    {displayData.apiKeyPrefix && (
                      <div className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-[#FAFAFA]">
                              API Key
                            </h4>
                            <p className="text-sm text-[rgba(250,250,250,0.7)]">
                              Active key: {displayData.apiKeyPrefix}...
                            </p>
                          </div>
                          <Badge className="bg-green-600 hover:bg-green-700">
                            Connected
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Usage Statistics */}
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">
                      Usage Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[rgba(250,250,250,0.7)]">
                              Events This Month
                            </p>
                            <p className="text-2xl font-bold text-[#FAFAFA]">
                              {displayData.monthlyUsage.events.toLocaleString()}
                            </p>
                          </div>
                          <Zap className="w-8 h-8 text-[#0EA5E9]" />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[rgba(250,250,250,0.7)]">
                              Monthly Cost
                            </p>
                            <p className="text-2xl font-bold text-[#FAFAFA]">
                              ${displayData.monthlyUsage.cost}
                            </p>
                          </div>
                          <CreditCard className="w-8 h-8 text-[#10B981]" />
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[rgba(250,250,250,0.7)]">
                              Plan Limit
                            </p>
                            <p className="text-2xl font-bold text-[#FAFAFA]">
                              {displayData.monthlyUsage.limit.toLocaleString()}
                            </p>
                          </div>
                          <Shield className="w-8 h-8 text-[#8B5CF6]" />
                        </div>
                      </div>
                    </div>

                    {/* Usage Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[rgba(250,250,250,0.7)]">
                          Monthly Usage
                        </span>
                        <span className="text-[#FAFAFA]">
                          {Math.round(usagePercentage)}% used
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                      <p className="text-xs text-[rgba(250,250,250,0.5)]">
                        {displayData.monthlyUsage.events.toLocaleString()} of{" "}
                        {displayData.monthlyUsage.limit.toLocaleString()} events
                        used
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Account Stats */}
              <div className="space-y-6">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#0EA5E9]" />
                      <div>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          Member since
                        </p>
                        <p className="font-medium text-[#FAFAFA]">
                          {new Date(displayData.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          Authentication
                        </p>
                        <p className="font-medium text-[#FAFAFA]">
                          {isAuthenticated ? "✓ API Connected" : "Sample Data"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                      <div>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          Total Spent
                        </p>
                        <p className="font-medium text-[#FAFAFA]">$147.23</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full justify-start bg-[rgba(14,165,233,0.1)] hover:bg-[rgba(14,165,233,0.2)] text-[#0EA5E9] border-[#0EA5E9] border-opacity-20"
                      variant="outline"
                      asChild
                    >
                      <Link href="/settings">
                        <Key className="w-4 h-4 mr-2" />
                        Manage API Keys
                      </Link>
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download CLI
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Building className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">
                      Billing History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {billingHistory.map((bill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]"
                        >
                          <div>
                            <p className="font-medium text-[#FAFAFA]">
                              {bill.description}
                            </p>
                            <p className="text-sm text-[rgba(250,250,250,0.7)]">
                              {new Date(bill.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#FAFAFA]">
                              {bill.amount}
                            </p>
                            <Badge className="bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20">
                              {bill.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#0EA5E9]" />
                      <div>
                        <p className="font-medium text-[#FAFAFA]">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          Expires 12/27
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                    >
                      Update Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">
                      Next Billing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[rgba(250,250,250,0.7)]">
                        Amount:
                      </span>
                      <span className="font-medium text-[#FAFAFA]">$29.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgba(250,250,250,0.7)]">
                        Date:
                      </span>
                      <span className="font-medium text-[#FAFAFA]">
                        July 1, 2025
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[#0EA5E9]" />
                    <div>
                      <Label
                        htmlFor="email-notifications"
                        className="text-[#FAFAFA] font-medium"
                      >
                        Email Notifications
                      </Label>
                      <p className="text-sm text-[rgba(250,250,250,0.7)]">
                        Receive updates via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <Separator className="bg-[rgba(250,250,250,0.1)]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-[#10B981]" />
                    <div>
                      <Label
                        htmlFor="push-notifications"
                        className="text-[#FAFAFA] font-medium"
                      >
                        Push Notifications
                      </Label>
                      <p className="text-sm text-[rgba(250,250,250,0.7)]">
                        Browser and mobile notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <Separator className="bg-[rgba(250,250,250,0.1)]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-[#EF4444]" />
                    <div>
                      <Label
                        htmlFor="security-alerts"
                        className="text-[#FAFAFA] font-medium"
                      >
                        Security Alerts
                      </Label>
                      <p className="text-sm text-[rgba(250,250,250,0.7)]">
                        Get notified about security incidents
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="security-alerts"
                    checked={notifications.security}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, security: checked })
                    }
                  />
                </div>

                <Separator className="bg-[rgba(250,250,250,0.1)]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                    <div>
                      <Label
                        htmlFor="billing-updates"
                        className="text-[#FAFAFA] font-medium"
                      >
                        Billing Updates
                      </Label>
                      <p className="text-sm text-[rgba(250,250,250,0.7)]">
                        Notifications about payments and invoices
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="billing-updates"
                    checked={notifications.billing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, billing: checked })
                    }
                  />
                </div>

                <Separator className="bg-[rgba(250,250,250,0.1)]" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-[#8B5CF6]" />
                    <div>
                      <Label
                        htmlFor="marketing"
                        className="text-[#FAFAFA] font-medium"
                      >
                        Product Updates
                      </Label>
                      <p className="text-sm text-[rgba(250,250,250,0.7)]">
                        New features and product announcements
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="marketing"
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA]">
                    API Key Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[#FAFAFA]">
                          Current API Key
                        </h4>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          {displayData.apiKeyPrefix
                            ? `${displayData.apiKeyPrefix}...`
                            : "No API key set"}
                        </p>
                      </div>
                      <Badge
                        className={
                          isAuthenticated
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {isAuthenticated ? "Active" : "Not Set"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)]"
                    asChild
                  >
                    <Link href="/settings">Manage API Keys</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA]">
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[#FAFAFA]">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-[rgba(250,250,250,0.7)]">
                      Coming soon - secure your account with 2FA
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled
                    className="w-full border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)]"
                  >
                    Enable 2FA (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
