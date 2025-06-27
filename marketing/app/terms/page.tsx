import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-[#FAFAFA]/70 hover:text-[#0EA5E9] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to home</span>
        </Link>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-[#FAFAFA]/70 mb-8">Last updated: December 26, 2024</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                By accessing and using Kilometers ("Service"), you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                Kilometers provides AI agent monitoring services through the Model Context Protocol (MCP). Our service
                tracks AI requests, monitors costs, and provides security alerts for AI-powered applications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Privacy and Data</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                We collect only metadata about your AI requests (URLs, response times, costs). We never access your
                actual code, prompts, or AI responses. See our Privacy Policy for detailed information about data
                handling.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Acceptable Use</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>Use the service for illegal activities</li>
                <li>Attempt to reverse engineer or hack the service</li>
                <li>Share your account credentials with others</li>
                <li>Exceed rate limits or abuse the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Billing and Payments</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                Paid plans are billed monthly or annually. You can cancel at any time. Refunds are provided on a
                case-by-case basis. We reserve the right to change pricing with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                Kilometers is provided "as is" without warranties. We are not liable for any damages arising from use of
                the service, including but not limited to data loss, security breaches, or service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                For questions about these Terms of Service, please contact us at{" "}
                <a href="mailto:legal@kilometers.ai" className="text-[#0EA5E9] hover:underline">
                  legal@kilometers.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
