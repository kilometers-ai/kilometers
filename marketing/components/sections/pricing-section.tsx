import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getAppUrl, getAuthUrl } from "@/lib/app-redirect";

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out Kilometers",
      features: [
        "1K events/month",
        "Basic dashboard",
        "Email alerts",
        "Community support",
      ],
      cta: "Start Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "$49",
      period: "/month",
      description: "For growing teams and projects",
      features: [
        "Unlimited monitoring",
        "Advanced analytics",
        "Slack/Discord alerts",
        "API access",
        "Priority support",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Team",
      price: "$199",
      period: "/month",
      description: "For larger teams and organizations",
      features: [
        "Everything in Pro",
        "5 team members",
        "Custom integrations",
        "Advanced security",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For enterprise-scale deployments",
      features: [
        "Everything in Team",
        "Unlimited team members",
        "Self-hosted option",
        "SLA guarantee",
        "Custom features",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Simple, transparent <span className="text-[#0EA5E9]">pricing</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-lg border transition-all duration-300 hover:transform hover:scale-105 ${
                plan.popular
                  ? "bg-[#0EA5E9]/10 border-[#0EA5E9] shadow-lg shadow-[#0EA5E9]/20"
                  : "bg-[#18181B] border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0EA5E9] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-[#FAFAFA]/70">{plan.period}</span>
                </div>
                <p className="text-[#FAFAFA]/70 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center space-x-3"
                  >
                    <Check className="h-5 w-5 text-[#10B981] flex-shrink-0" />
                    <span className="text-[#FAFAFA]/90">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white"
                      : "bg-[#18181B] border border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <a
                    href={
                      plan.name === "Free"
                        ? getAuthUrl("signup")
                        : plan.name === "Pro"
                        ? getAuthUrl("signup")
                        : "/contact"
                    }
                  >
                    {plan.cta}
                  </a>
                </Button>
              ) : (
                <a
                  href={
                    plan.name === "Free"
                      ? getAuthUrl("signup")
                      : getAuthUrl("signup")
                  }
                  className="w-full"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
