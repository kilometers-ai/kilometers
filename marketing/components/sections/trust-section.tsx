import { Shield, Award, Lock, Zap } from "lucide-react"

export function TrustSection() {
  const trustItems = [
    {
      icon: Shield,
      title: "SOC2 Compliant",
      description: "Enterprise-grade security standards",
    },
    {
      icon: Lock,
      title: "Privacy First",
      description: "Your data never trains AI models",
    },
    {
      icon: Zap,
      title: "99.9% Uptime",
      description: "Reliable monitoring you can count on",
    },
    {
      icon: Award,
      title: "Built by Miles",
      description: "Former Stripe engineer, AI monitoring expert",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Built for <span className="text-[#0EA5E9]">enterprise trust</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Security, privacy, and reliability at the core of everything we do.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="text-center p-6 bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-colors"
            >
              <div className="w-16 h-16 bg-[#0EA5E9]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <item.icon className="h-8 w-8 text-[#0EA5E9]" />
              </div>
              <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
              <p className="text-[#FAFAFA]/70 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-[#18181B] rounded-lg p-8 border border-[#0EA5E9]/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Meet the Founder</h3>
            <p className="text-[#FAFAFA]/80 text-lg leading-relaxed">
              Built by <span className="text-[#0EA5E9] font-semibold">Miles</span>, former Stripe engineer who got tired
              of surprise AI bills. After seeing teams struggle with AI visibility, he created Kilometers to solve the
              monitoring problem once and for all.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
