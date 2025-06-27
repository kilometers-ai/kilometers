"use client"

import { useEffect } from "react"
import { useCookieConsent } from "./cookie-consent"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function useAnalytics() {
  const { consent } = useCookieConsent()

  useEffect(() => {
    if (consent?.analytics && typeof window !== "undefined") {
      // Initialize Google Analytics
      const script = document.createElement("script")
      script.src = "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
      script.async = true
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag("js", new Date())
      window.gtag("config", "GA_MEASUREMENT_ID", {
        anonymize_ip: true,
        cookie_flags: "SameSite=None;Secure",
      })

      console.log("Analytics initialized with consent")
    }
  }, [consent?.analytics])

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (consent?.analytics && typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, parameters)
    }
  }

  const trackPageView = (url: string) => {
    if (consent?.analytics && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: url,
      })
    }
  }

  return {
    trackEvent,
    trackPageView,
    analyticsEnabled: consent?.analytics || false,
  }
}
