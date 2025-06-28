"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import { sampleUser } from "@/lib/sample-data"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    security: true,
    billing: false,
    marketing: false,
  })

  const usagePercentage = (sampleUser.monthlyUsage.events / sampleUser.monthlyUsage.limit) * 100

  const subscriptionPlans = [
    {
      name: "Free",
      price: "$0",
      period: "month",
      features: ["Up to 1,000 events/month", "Basic monitoring", "Email support", "7-day data retention"],
      current: false,
      popular: false,
      icon: User,
    },
    {
      name: "Pro",
      price: "$29",
      period: "month",
      features: [
        "Up to 50,000 events/month",
        "Advanced analytics",
        "Priority support",
        "30-day data retention",
        "Custom alerts",
        "API access",
      ],
      current: true,
      popular: true,
      icon: Zap,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "month",
      features: [
        "Unlimited events",
        "Custom integrations",
        "24/7 phone support",
        "1-year data retention",
        "Advanced security",
        "Dedicated account manager",
        "SLA guarantee",
      ],
      current: false,
      popular: false,
      icon: Building,
    },
  ]

  const billingHistory = [
    {
      date: "2025-06-01",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "paid",
    },
    {
      date: "2025-05-01",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "paid",
    },
    {
      date: "2025-04-01",
      description: "Pro Plan - Monthly",
      amount: "$29.00",
      status: "paid",
    },
    {
      date: "2025-03-01",
      description: "Free Plan Upgrade",
      amount: "$0.00",
      status: "paid",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#FAFAFA] mb-2">Profile & Account</h1>
          <p className="text-[rgba(250,250,250,0.7)]">Manage your account settings, subscription, and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#18181B] border border-[rgba(250,250,250,0.1)]">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="data-[state=active]:bg-[#0EA5E9] data-[state=active]:text-white text-[rgba(250,250,250,0.7)]"
            >
              Subscription
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
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#FAFAFA]">Profile Information</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                      >
                        {isEditing ? <Check className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
                        {isEditing ? "Save" : "Edit"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={sampleUser.avatar || "/placeholder.svg"} alt={sampleUser.name} />
                        <AvatarFallback className="text-lg">JD</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-medium text-[#FAFAFA]">{sampleUser.name}</h3>
                        <p className="text-[rgba(250,250,250,0.7)]">{sampleUser.email}</p>
                        {isEditing && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                          >
                            Change Avatar
                          </Button>
                        )}
                      </div>
                    </div>

                    <Separator className="bg-[rgba(250,250,250,0.1)]" />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-[rgba(250,250,250,0.7)]">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={sampleUser.name}
                          disabled={!isEditing}
                          className="mt-1 bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA] disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-[rgba(250,250,250,0.7)]">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={sampleUser.email}
                          disabled={!isEditing}
                          className="mt-1 bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA] disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-[rgba(250,250,250,0.7)]">
                          Company
                        </Label>
                        <Input
                          id="company"
                          value="Acme Corp"
                          disabled={!isEditing}
                          className="mt-1 bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA] disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone" className="text-[rgba(250,250,250,0.7)]">
                          Timezone
                        </Label>
                        <Input
                          id="timezone"
                          value="UTC-8 (Pacific Time)"
                          disabled={!isEditing}
                          className="mt-1 bg-[#0A0A0A] border-[rgba(250,250,250,0.1)] text-[#FAFAFA] disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Account Stats */}
              <div className="space-y-6">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">Account Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-[#0EA5E9]" />
                      <div>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">Member since</p>
                        <p className="font-medium text-[#FAFAFA]">
                          {new Date(sampleUser.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">Security Score</p>
                        <p className="font-medium text-[#FAFAFA]">98/100</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                      <div>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">Total Spent</p>
                        <p className="font-medium text-[#FAFAFA]">$147.23</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <CardTitle className="text-[#FAFAFA]">Current Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[rgba(250,250,250,0.7)]">Events this month</span>
                        <span className="text-sm font-medium text-[#FAFAFA]">
                          {sampleUser.monthlyUsage.events.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={usagePercentage} className="h-2 bg-[rgba(250,250,250,0.1)]" />
                      <p className="text-xs text-[rgba(250,250,250,0.7)] mt-1">
                        {usagePercentage.toFixed(1)}% of {sampleUser.monthlyUsage.limit.toLocaleString()} limit
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div className="space-y-8">
              {/* Current Plan */}
              <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                <CardHeader>
                  <CardTitle className="text-[#FAFAFA]">Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-6 rounded-lg bg-[rgba(14,165,233,0.1)] border border-[rgba(14,165,233,0.2)]">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-[#0EA5E9] bg-opacity-20">
                        <Zap className="w-6 h-6 text-[#0EA5E9]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#FAFAFA]">Pro Plan</h3>
                        <p className="text-[rgba(250,250,250,0.7)]">$29/month • Renews on July 1, 2025</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#10B981] bg-opacity-20 text-[#10B981] border-[#10B981] border-opacity-20 mb-2">
                        Active
                      </Badge>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                        >
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-white bg-transparent"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <div>
                <h2 className="text-2xl font-bold text-[#FAFAFA] mb-6">Available Plans</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {subscriptionPlans.map((plan) => {
                    const IconComponent = plan.icon
                    return (
                      <Card
                        key={plan.name}
                        className={`bg-[#18181B] border-[rgba(250,250,250,0.1)] relative ${
                          plan.popular ? "ring-2 ring-[#0EA5E9] ring-opacity-50" : ""
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-[#0EA5E9] text-white border-[#0EA5E9]">
                              <Crown className="w-3 h-3 mr-1" />
                              Most Popular
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="text-center">
                          <div className="mx-auto p-3 rounded-lg bg-[rgba(14,165,233,0.1)] w-fit mb-4">
                            <IconComponent className="w-6 h-6 text-[#0EA5E9]" />
                          </div>
                          <CardTitle className="text-[#FAFAFA]">{plan.name}</CardTitle>
                          <div className="text-3xl font-bold text-[#FAFAFA]">
                            {plan.price}
                            <span className="text-lg font-normal text-[rgba(250,250,250,0.7)]">/{plan.period}</span>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm text-[rgba(250,250,250,0.7)]">
                                <Check className="w-4 h-4 text-[#10B981] mr-2 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button
                            className={`w-full ${
                              plan.current
                                ? "bg-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] cursor-not-allowed"
                                : "bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90"
                            }`}
                            disabled={plan.current}
                          >
                            {plan.current ? "Current Plan" : "Upgrade"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[#FAFAFA]">Billing History</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[rgba(250,250,250,0.1)] text-[rgba(250,250,250,0.7)] hover:bg-[rgba(14,165,233,0.1)] bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {billingHistory.map((bill, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-[rgba(250,250,250,0.02)] border border-[rgba(250,250,250,0.1)]"
                        >
                          <div>
                            <p className="font-medium text-[#FAFAFA]">{bill.description}</p>
                            <p className="text-sm text-[rgba(250,250,250,0.7)]">
                              {new Date(bill.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#FAFAFA]">{bill.amount}</p>
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
                    <CardTitle className="text-[#FAFAFA]">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#0EA5E9]" />
                      <div>
                        <p className="font-medium text-[#FAFAFA]">•••• •••• •••• 4242</p>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">Expires 12/27</p>
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
                    <CardTitle className="text-[#FAFAFA]">Next Billing</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[rgba(250,250,250,0.7)]">Amount:</span>
                      <span className="font-medium text-[#FAFAFA]">$29.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgba(250,250,250,0.7)]">Date:</span>
                      <span className="font-medium text-[#FAFAFA]">July 1, 2025</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-[#18181B] border-[rgba(250,250,250,0.1)]">
              <CardHeader>
                <CardTitle className="text-[#FAFAFA]">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-[#0EA5E9]" />
                      <div>
                        <Label htmlFor="email-notifications" className="text-[#FAFAFA] font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">Receive important updates via email</p>
                      </div>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>

                  <Separator className="bg-[rgba(250,250,250,0.1)]" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-[#EF4444]" />
                      <div>
                        <Label htmlFor="security-alerts" className="text-[#FAFAFA] font-medium">
                          Security Alerts
                        </Label>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">Get notified about security incidents</p>
                      </div>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={notifications.security}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, security: checked })}
                    />
                  </div>

                  <Separator className="bg-[rgba(250,250,250,0.1)]" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                      <div>
                        <Label htmlFor="billing-updates" className="text-[#FAFAFA] font-medium">
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
                      onCheckedChange={(checked) => setNotifications({ ...notifications, billing: checked })}
                    />
                  </div>

                  <Separator className="bg-[rgba(250,250,250,0.1)]" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <Label htmlFor="marketing" className="text-[#FAFAFA] font-medium">
                          Marketing Communications
                        </Label>
                        <p className="text-sm text-[rgba(250,250,250,0.7)]">
                          Product updates and feature announcements
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="marketing"
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="bg-[#0EA5E9] text-white hover:bg-[#0EA5E9]/90">Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
