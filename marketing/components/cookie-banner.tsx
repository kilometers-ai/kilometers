"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Settings, Shield, BarChart3, Target, Palette } from "lucide-react"
import { useCookieConsent } from "@/lib/cookie-consent"
import Link from "next/link"

export function CookieBanner() {
  const { showBanner, acceptAll, acceptNecessary, updateConsent } = useCookieConsent()
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    preferences: false,
  })

  if (!showBanner) return null

  const cookieTypes = [
    {
      id: "necessary",
      name: "Necessary Cookies",
      description: "Essential for the website to function properly. These cannot be disabled.",
      icon: Shield,
      required: true,
      examples: ["Authentication", "Security", "Basic functionality"],
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website.",
      icon: BarChart3,
      required: false,
      examples: ["Google Analytics", "Performance monitoring", "Error tracking"],
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      description: "Used to track visitors and display relevant advertisements.",
      icon: Target,
      required: false,
      examples: ["Ad targeting", "Social media integration", "Conversion tracking"],
    },
    {
      id: "preferences",
      name: "Preference Cookies",
      description: "Remember your settings and preferences for a better experience.",
      icon: Palette,
      required: false,
      examples: ["Theme preferences", "Language settings", "UI customizations"],
    },
  ]

  const handleSavePreferences = () => {
    updateConsent(preferences)
  }

  const handleTogglePreference = (key: keyof typeof preferences) => {
    if (key === "necessary") return // Can't disable necessary cookies
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card className="w-full max-w-4xl bg-[#18181B] border-[#0EA5E9]/20 shadow-2xl pointer-events-auto">
        <CardContent className="p-0">
          {!showDetails ? (
            // Simple Banner
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">We value your privacy</h3>
                    <Badge variant="secondary" className="bg-[#10B981]/20 text-[#10B981] text-xs">
                      GDPR Compliant
                    </Badge>
                  </div>
                </div>
              </div>

              <p className="text-[#FAFAFA]/80 mb-6 leading-relaxed">
                We use cookies to enhance your experience, analyze site traffic, and personalize content. You can choose
                which cookies to accept or{" "}
                <button onClick={() => setShowDetails(true)} className="text-[#0EA5E9] hover:underline font-medium">
                  customize your preferences
                </button>
                .
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={acceptAll} className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white">
                  Accept All Cookies
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10 bg-transparent"
                >
                  Accept Necessary Only
                </Button>
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="text-[#FAFAFA]/70 hover:text-[#0EA5E9]"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </div>

              <p className="text-xs text-[#FAFAFA]/60 mt-4">
                By continuing to use our site, you agree to our{" "}
                <Link href="/privacy" className="text-[#0EA5E9] hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="text-[#0EA5E9] hover:underline">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          ) : (
            // Detailed Preferences
            <div>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#0EA5E9]/10">
                <div>
                  <h3 className="font-semibold text-xl">Cookie Preferences</h3>
                  <p className="text-[#FAFAFA]/70 text-sm">Choose which cookies you want to accept</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  className="text-[#FAFAFA]/60 hover:text-[#0EA5E9]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Cookie Types */}
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {cookieTypes.map((type) => (
                  <div key={type.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center">
                          <type.icon className="h-4 w-4 text-[#0EA5E9]" />
                        </div>
                        <div>
                          <h4 className="font-semibold flex items-center space-x-2">
                            <span>{type.name}</span>
                            {type.required && (
                              <Badge variant="secondary" className="bg-[#EF4444]/20 text-[#EF4444] text-xs">
                                Required
                              </Badge>
                            )}
                          </h4>
                          <p className="text-[#FAFAFA]/70 text-sm">{type.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={preferences[type.id as keyof typeof preferences]}
                        onCheckedChange={() => handleTogglePreference(type.id as keyof typeof preferences)}
                        disabled={type.required}
                        className="data-[state=checked]:bg-[#0EA5E9]"
                      />
                    </div>

                    {/* Examples */}
                    <div className="ml-11 space-y-1">
                      <p className="text-xs text-[#FAFAFA]/60 font-medium">Examples:</p>
                      <div className="flex flex-wrap gap-1">
                        {type.examples.map((example, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs border-[#0EA5E9]/20 text-[#FAFAFA]/60"
                          >
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#0EA5E9]/10 bg-[#0A0A0A]/50">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="text-xs text-[#FAFAFA]/60">
                    <p>
                      Learn more about our data practices in our{" "}
                      <Link href="/privacy" className="text-[#0EA5E9] hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                    <p className="mt-1">You can change these preferences anytime in your account settings.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={acceptNecessary}
                      variant="outline"
                      className="border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10 bg-transparent"
                    >
                      Necessary Only
                    </Button>
                    <Button onClick={handleSavePreferences} className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white">
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
