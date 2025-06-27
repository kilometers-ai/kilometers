type FeatureFlags = {
  USE_REAL_API_DATA: boolean
  USE_EXTERNAL_APP: boolean
  EXTERNAL_APP_URL: string
  ENABLE_ANALYTICS: boolean
  SHOW_COOKIE_BANNER: boolean
  ENABLE_CONTACT_FORM: boolean
  ENABLE_GITHUB_OAUTH: boolean
  // Connection Verification Features
  ENABLE_REAL_CONNECTION_CHECK: boolean
  CONNECTION_CHECK_METHOD: string
  CONNECTION_TIMEOUT_MS: number
  ENABLE_CONNECTION_TROUBLESHOOTING: boolean
  ENABLE_MANUAL_VERIFICATION_SKIP: boolean
  ENABLE_CONFIG_VALIDATION: boolean
  CONNECTION_CHECK_POLL_INTERVAL_MS: number
  ENABLE_CONNECTION_ANALYTICS: boolean
}

const defaultFlags: FeatureFlags = {
  USE_REAL_API_DATA: false, // Set to true to use real API data
  USE_EXTERNAL_APP: false, // Set to true when ready to redirect to app.kilometers.ai
  EXTERNAL_APP_URL: "https://app.kilometers.ai",
  ENABLE_ANALYTICS: true,
  SHOW_COOKIE_BANNER: true,
  ENABLE_CONTACT_FORM: false, // Disable by default
  ENABLE_GITHUB_OAUTH: false, // Disable by default
  // Connection Verification - Start with mock behavior (safe defaults)
  ENABLE_REAL_CONNECTION_CHECK: false, // Keep mock verification by default
  CONNECTION_CHECK_METHOD: "polling", // polling | websocket | sse
  CONNECTION_TIMEOUT_MS: 120000, // 2 minutes
  ENABLE_CONNECTION_TROUBLESHOOTING: false, // Disable advanced troubleshooting
  ENABLE_MANUAL_VERIFICATION_SKIP: true, // Allow users to skip if needed
  ENABLE_CONFIG_VALIDATION: false, // Disable config validation initially
  CONNECTION_CHECK_POLL_INTERVAL_MS: 2000, // 2 seconds
  ENABLE_CONNECTION_ANALYTICS: false, // Disable analytics tracking initially
}

// In production, these could come from environment variables or a feature flag service
const getFeatureFlags = (): FeatureFlags => {
  if (typeof window === "undefined") {
    // Server-side: use environment variables
    return {
      USE_REAL_API_DATA: process.env.NEXT_PUBLIC_USE_REAL_API_DATA === "true",
      USE_EXTERNAL_APP: process.env.NEXT_PUBLIC_USE_EXTERNAL_APP === "true",
      EXTERNAL_APP_URL: process.env.NEXT_PUBLIC_EXTERNAL_APP_URL || defaultFlags.EXTERNAL_APP_URL,
      ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false",
      SHOW_COOKIE_BANNER: process.env.NEXT_PUBLIC_SHOW_COOKIE_BANNER !== "false",
      ENABLE_CONTACT_FORM: process.env.NEXT_PUBLIC_ENABLE_CONTACT_FORM === "true",
      ENABLE_GITHUB_OAUTH: process.env.NEXT_PUBLIC_ENABLE_GITHUB_OAUTH === "true",
      // Connection Verification Environment Variables
      ENABLE_REAL_CONNECTION_CHECK: process.env.NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK === "true",
      CONNECTION_CHECK_METHOD: process.env.NEXT_PUBLIC_CONNECTION_CHECK_METHOD || defaultFlags.CONNECTION_CHECK_METHOD,
      CONNECTION_TIMEOUT_MS: parseInt(process.env.NEXT_PUBLIC_CONNECTION_TIMEOUT_MS || String(defaultFlags.CONNECTION_TIMEOUT_MS)),
      ENABLE_CONNECTION_TROUBLESHOOTING: process.env.NEXT_PUBLIC_ENABLE_CONNECTION_TROUBLESHOOTING === "true",
      ENABLE_MANUAL_VERIFICATION_SKIP: process.env.NEXT_PUBLIC_ENABLE_MANUAL_VERIFICATION_SKIP !== "false",
      ENABLE_CONFIG_VALIDATION: process.env.NEXT_PUBLIC_ENABLE_CONFIG_VALIDATION === "true",
      CONNECTION_CHECK_POLL_INTERVAL_MS: parseInt(process.env.NEXT_PUBLIC_CONNECTION_CHECK_POLL_INTERVAL_MS || String(defaultFlags.CONNECTION_CHECK_POLL_INTERVAL_MS)),
      ENABLE_CONNECTION_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_CONNECTION_ANALYTICS === "true",
    }
  }

  // Client-side: use default flags (could be enhanced with remote config)
  return defaultFlags
}

export const featureFlags = getFeatureFlags()

export const useFeatureFlag = (flag: keyof FeatureFlags) => {
  return featureFlags[flag]
}
