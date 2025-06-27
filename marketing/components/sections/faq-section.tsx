"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

export function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const faqs = [
    {
      question: "Does this slow down my AI?",
      answer:
        "No, Kilometers adds less than 50ms latency to your AI requests. Our monitoring runs asynchronously and doesn't block your AI operations.",
    },
    {
      question: "Which AI tools work with Kilometers?",
      answer:
        "Any MCP-compatible AI tool works with Kilometers, including Cursor, Claude Desktop, VS Code with AI extensions, and custom implementations.",
    },
    {
      question: "Is my code safe?",
      answer:
        "Yes, we only see metadata about your AI requests (URLs, response times, costs). We never see your actual code, prompts, or responses.",
    },
    {
      question: "Can I self-host Kilometers?",
      answer:
        "Self-hosting is available for Enterprise customers. This gives you complete control over your monitoring data and infrastructure.",
    },
    {
      question: "How accurate is the cost tracking?",
      answer:
        "Our cost tracking is accurate to within 1% for major providers like OpenAI, Anthropic, and Google. We update pricing in real-time.",
    },
    {
      question: "What happens if I exceed my plan limits?",
      answer:
        "We'll notify you before you hit limits. On the Free plan, monitoring pauses until next month. Paid plans have overage protection.",
    },
  ]

  return (
    <section className="py-20 bg-[#18181B]/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold mb-6">
            Frequently asked <span className="text-[#0EA5E9]">questions</span>
          </h2>
          <p className="text-xl text-[#FAFAFA]/80 max-w-3xl mx-auto">
            Everything you need to know about AI monitoring with Kilometers.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-[#18181B] rounded-lg border border-[#0EA5E9]/20 overflow-hidden">
                <button
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-[#0EA5E9]/5 transition-colors"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-[#0EA5E9] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#0EA5E9] flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-[#FAFAFA]/80 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
