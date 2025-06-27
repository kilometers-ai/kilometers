import { featureFlags } from "./feature-flags"

export const getAppUrl = (path = "") => {
  if (featureFlags.USE_EXTERNAL_APP) {
    const baseUrl = featureFlags.EXTERNAL_APP_URL
    return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
  }
  return path.startsWith("/") ? path : `/${path}`
}

export const getAuthUrl = (type: "login" | "signup"): string => {
  if (featureFlags.ENABLE_GITHUB_OAUTH) {
    // When OAuth is enabled, all auth actions go to the main app's GitHub handler
    return getAppUrl("/login/github")
  }
  // Fallback to the local login/signup pages
  return type === "login" ? "/login" : "/signup"
}

export const redirectToApp = (path = "/dashboard") => {
  const url = getAppUrl(path)

  if (featureFlags.USE_EXTERNAL_APP) {
    // External redirect
    window.location.href = url
  } else {
    // Internal navigation
    window.location.href = url
  }
}

// For Next.js router usage
export const getAppRedirect = (path = "/dashboard") => {
  if (featureFlags.USE_EXTERNAL_APP) {
    return {
      redirect: {
        destination: getAppUrl(path),
        permanent: false,
      },
    }
  }
  return null
}
