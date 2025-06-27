import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Saved us from a $50K GitHub bill",
      author: "Sarah Chen",
      role: "CTO, TechCorp",
      rating: 5,
    },
    {
      quote: "Found a data leak in 10 minutes",
      author: "Marcus Rodriguez",
      role: "Security Lead, DataFlow",
      rating: 5,
    },
    {
      quote: "Finally know what our AI is doing",
      author: "Alex Kim",
      role: "Platform Engineer, StartupXYZ",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 bg-[#18181B]/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Trusted by <span className="text-[#0EA5E9]">AI-first teams</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Join hundreds of teams who've taken control of their AI monitoring.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 hover:border-[#0EA5E9]/40 transition-colors"
            >
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-[#F59E0B] fill-current" />
                ))}
              </div>
              <blockquote className="text-lg font-medium mb-6 text-[#FAFAFA]">"{testimonial.quote}"</blockquote>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-[#FAFAFA]/70 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
