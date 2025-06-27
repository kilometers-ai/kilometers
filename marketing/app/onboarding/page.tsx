import { Suspense } from "react";
import OnboardingClientPage from "./onboarding-client";
import OnboardingLoading from "./loading";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingClientPage />
    </Suspense>
  );
}
