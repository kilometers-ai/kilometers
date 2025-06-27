"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, BarChart3, Target, Palette, Save, RotateCcw } from "lucide-react"
import { useCookieConsent } from "@/lib/cookie-consent"
import Link from "next/link"

export default function CookiePreferencesPage() {
  const { consent, updateConsent, resetConsent } = useCookieConsent()
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (consent) {
      setPreferences(consent)
    }
  }, [consent])

  const cookieTypes = [
    {
      id: "necessary",
      name: "Necessary Cookies",
      description: "Essential for the website to function properly. These cannot be disabled.",
      icon: Shield,
      required: true,
      details: [
        "Authentication and login functionality",
        "Security features and CSRF protection",
        "Basic website functionality",
        "Session management",
        "Form submission and validation",
      ],
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website to improve user experience.",
      icon: BarChart3,
      required: false,
      details: [
        "Google Analytics for traffic analysis",
        "Performance monitoring and optimization",
        "Error tracking and debugging",
        "User behavior analysis",
        "A/B testing and feature optimization",
      ],
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      description: "Used to track visitors across websites and display relevant advertisements.",
      icon: Target,
      required: false,
      details: [
        "Targeted advertising and retargeting",
        "Social media integration and sharing",
        "Conversion tracking and attribution",
        "Email marketing optimization",
        "Third-party advertising networks",
      ],
    },
    {
      id: "preferences",
      name: "Preference Cookies",
      description: "Remember your settings and preferences for a personalized experience.",
      icon: Palette,
      required: false,
      details: [
        "Theme and appearance preferences",
        "Language and region settings",
        "Dashboard customizations",
        "Notification preferences",
        "UI layout and display options",
      ],
    },
  ]

  const handleTogglePreference = (key: keyof typeof preferences) => {
    if (key === "necessary") return // Can't disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSavePreferences = () => {
    updateConsent(preferences)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleResetToDefaults = () => {
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    })
  }

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    setPreferences(allAccepted)
    updateConsent(allAccepted)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA]">
      {/* Header */}
      <header className="border-b border-[#18181B] bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold">Kilometers</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Cookie <span className="text-[#0EA5E9]">Preferences</span>
            </h1>
            <p className="text-xl text-[#FAFAFA]/80 max-w-2xl mx-auto">
              Manage your cookie preferences and control how we use data to improve your experience.
            </p>
          </div>

          {/* Quick Actions */}
          <Card className="bg-[#18181B] border-[#0EA5E9]/20 mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <h3 className="font-semibold mb-1">Quick Actions</h3>
                  <p className="text-[#FAFAFA]/70 text-sm">Apply common preference settings</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleResetToDefaults}
                    variant="outline"
                    className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/10 bg-transparent"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset to Defaults
                  </Button>
                  <Button onClick={handleAcceptAll} className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
                    Accept All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {cookieTypes.map((type) => (
              <Card key={type.id} className="bg-[#18181B] border-[#0EA5E9]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center">
                        <type.icon className="h-5 w-5 text-[#0EA5E9]" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{type.name}</span>
                          {type.required && (
                            <Badge variant="secondary" className="bg-[#EF4444]/20 text-[#EF4444]">
                              Required
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-[#FAFAFA]/70">{type.description}</CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={preferences[type.id as keyof typeof preferences]}
                      onCheckedChange={() => handleTogglePreference(type.id as keyof typeof preferences)}
                      disabled={type.required}
                      className="data-[state=checked]:bg-[#0EA5E9]"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-[#FAFAFA]/80">What this includes:</h4>
                    <ul className="space-y-2">
                      {type.details.map((detail, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-[#FAFAFA]/70">
                          <div className="w-1.5 h-1.5 bg-[#0EA5E9] rounded-full mt-2 flex-shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Section */}
          <Card className="bg-[#18181B] border-[#0EA5E9]/20 mt-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <h3 className="font-semibold mb-1">Save Your Preferences</h3>
                  <p className="text-[#FAFAFA]/70 text-sm">
                    Your choices will be saved and applied across all pages. You can change them anytime.
                  </p>
                </div>
                <Button
                  onClick={handleSavePreferences}
                  className={`${
                    saved ? "bg-[#10B981] hover:bg-[#10B981]/90" : "bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
                  } transition-colors`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saved ? "Saved!" : "Save Preferences"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="bg-[#18181B] border-[#0EA5E9]/20 mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4 text-sm text-[#FAFAFA]/70">
                <div>
                  <h4 className="font-medium text-[#FAFAFA]/90 mb-2">Data Retention</h4>
                  <p>
                    Cookie preferences are stored locally in your browser and on our servers for up to 12 months. You
                    can delete or modify them at any time.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#FAFAFA]/90 mb-2">Third-Party Cookies</h4>
                  <p>
                    Some cookies are set by third-party services we use. These are governed by their respective privacy
                    policies and terms of service.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-[#FAFAFA]/90 mb-2">Contact Us</h4>
                  <p>
                    If you have questions about our cookie policy or data practices, please{" "}
                    <Link href="/contact" className="text-[#0EA5E9] hover:underline">
                      contact our support team
                    </Link>{" "}
                    or review our{" "}
                    <Link href="/privacy" className="text-[#0EA5E9] hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
