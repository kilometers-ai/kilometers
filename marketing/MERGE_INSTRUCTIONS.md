# Guide to Merging the Landing Page into a Monorepo

This document provides a comprehensive strategy for migrating this standalone landing page project into your main monorepo. The goal is to preserve not just the code, but also the critical context stored in the memory bank, environment variables, and external service configurations.

---

## Part 1: Merging the Memory Bank

**Core Principle:** Do not simply copy and paste this directory. A memory bank merge is a process of integrating knowledge. Review each file from this project and thoughtfully transfer its contents into the corresponding file in your monorepo.

### 1. `projectbrief.md`
*   **Action:** Open both the landing page's `projectbrief.md` and your monorepo's `projectbrief.md`.
*   **Guidance:** Integrate the landing page's core requirements as a new sub-section within your monorepo's brief, likely under "Marketing & User Acquisition" or "Kilometers Landing Page Component."

### 2. `productContext.md`
*   **Action:** Open both `productContext.md` files.
*   **Guidance:** Transfer the landing page's narrative (the "why") into your main product context. This is valuable for understanding the user's journey from visitor to authenticated user.

### 3. `systemPatterns.md`
*   **Action:** This is the most critical file to merge carefully. Open both `systemPatterns.md` files.
*   **Guidance:** Ensure these two important patterns from the landing page are added to your monorepo's system patterns:
    *   **User Authentication Pattern:** The pattern where the landing page *initiates* OAuth but the main application *handles* it.
    *   **Client-Side Data Fetching with Suspense:** The pattern for using `<Suspense>` to wrap components that use client-side hooks like `useSearchParams`.

### 4. `techContext.md`
*   **Action:** Open both `techContext.md` files.
*   **Guidance:** Create a new section in your monorepo's tech context named "Landing Page Tech Stack." Copy the relevant details (Next.js 15, Tailwind, Azure Static Web Apps, etc.). Don't forget to document the `dev` script's port configuration (`--port 3001`).

### 5. `activeContext.md` & `progress.md`
*   **Action:** Review the landing page's `activeContext.md` and `progress.md`.
*   **Guidance:** These files are snapshots in time. Manually transfer any still-relevant tasks or accomplishments to your monorepo's versions. The landing page versions can then be discarded.

---

## Part 2: Migrating Configuration and Secrets

This context lives outside the memory bank but is equally important.

### 1. Environment Variables & Feature Flags
*   **Action:** Review the environment variables used by this project and integrate them into your monorepo's environment management system (e.g., Vercel, Netlify, Azure App Settings).
*   **Guidance:** The landing page uses the `NEXT_PUBLIC_` prefix for all variables. Below is a list of all flags and their purpose, sourced from `lib/feature-flags.ts`:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_USE_EXTERNAL_APP` | `false` | **Crucial for auth.** Must be `true` for OAuth redirect to work. |
| `NEXT_PUBLIC_EXTERNAL_APP_URL` | `https://app.kilometers.ai` | Target URL for the main application. |
| `NEXT_PUBLIC_ENABLE_ANALYTICS`| `true` | Enables analytics scripts. |
| `NEXT_PUBLIC_SHOW_COOKIE_BANNER`| `true` | Controls visibility of the cookie consent banner. |
| `NEXT_PUBLIC_ENABLE_CONTACT_FORM`| `false` | Enables the contact form functionality. |
| `NEXT_PUBLIC_ENABLE_GITHUB_OAUTH`| `false` | Enables the GitHub sign-in buttons. |
| `NEXT_PUBLIC_ENABLE_REAL_CONNECTION_CHECK`| `false` | Switches the onboarding verification from mock to a real API call. |
| `NEXT_PUBLIC_CONNECTION_CHECK_METHOD` | `polling` | Method for connection check (`polling`, `websocket`, etc.). |
| `NEXT_PUBLIC_CONNECTION_TIMEOUT_MS` | `120000` | Timeout in ms for the connection check. |
| `NEXT_PUBLIC_ENABLE_CONNECTION_TROUBLESHOOTING` | `false` | Shows the troubleshooting wizard in onboarding. |
| `NEXT_PUBLIC_ENABLE_MANUAL_VERIFICATION_SKIP` | `true` | Allows users to skip the connection verification step. |
| `NEXT_PUBLIC_ENABLE_CONFIG_VALIDATION` | `false` | Enables configuration validation during onboarding. |
| `NEXT_PUBLIC_CONNECTION_CHECK_POLL_INTERVAL_MS` | `2000` | Poll interval in ms for the connection check. |
| `NEXT_PUBLIC_ENABLE_CONNECTION_ANALYTICS` | `false` | Enables analytics specific to the connection check. |

### 2. GitHub OAuth Application Settings
*   **Action:** Ensure the configuration of the GitHub OAuth App itself is understood and managed. The secrets belong to your main application's backend, not the landing page.
*   **Guidance:** Refer to `deployment/credentials.md` (which should NOT be in git) for the master list of secrets. The key settings in the GitHub UI are:
    *   **Client ID:** `Iv23liy2cst8AolhHxNf`
    *   **Client Secret:** (Managed in your backend's secret store)
    *   **Private Key:** (Managed in your backend's secret store)
    *   **Homepage URL:** `https://kilometers.ai` (or your final domain)
    *   **Production Callback URL:** `https://app.kilometers.ai/api/auth/callback`
    *   **Development Callback URL:** `http://localhost:3001/api/auth/callback` (or as needed)
    *   **Expire user authorization tokens:** This should be **enabled** for security.

---

## Final Checklist

- [ ] I have manually reviewed and merged the content from each memory bank file.
- [ ] I have migrated all `NEXT_PUBLIC_` environment variables and feature flags to my monorepo's build system.
- [ ] I understand that the GitHub OAuth secrets are managed by the main application, not the landing page.
- [ ] After merging, I have deleted the standalone `memory-bank/` and `deployment/` directories from the landing page's subdirectory within the monorepo to avoid confusion. 