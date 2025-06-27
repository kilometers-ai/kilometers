import { Eye, DollarSign, Shield, Clock, Users, Code } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Eye,
      title: "Real-time Monitoring",
      description: "Watch your AI agents in action with live request tracking and journey visualization.",
    },
    {
      icon: DollarSign,
      title: "Cost Tracking",
      description: "Never get surprised by bills again. Track costs per service, per agent, per day.",
    },
    {
      icon: Shield,
      title: "Security Alerts",
      description: "Get instant notifications when agents access unauthorized resources or behave unusually.",
    },
    {
      icon: Clock,
      title: "Simple Setup",
      description: "30-second installation. No code changes required. Works with any MCP-compatible AI.",
    },
    {
      icon: Users,
      title: "Team Insights",
      description: "See which team members' AI agents are most active and where they're going.",
    },
    {
      icon: Code,
      title: "API Access",
      description: "Full REST API to integrate monitoring data into your existing tools and workflows.",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Everything you need to <span className="text-[#0EA5E9]">monitor AI</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Comprehensive monitoring tools designed for modern AI-powered teams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-all duration-300 hover:transform hover:scale-105 group"
            >
              <div className="w-12 h-12 bg-[#0EA5E9]/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#0EA5E9]/30 transition-colors">
                <feature.icon className="h-6 w-6 text-[#0EA5E9]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-[#FAFAFA]/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
