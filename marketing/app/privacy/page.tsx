import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-[#FAFAFA]/70 mb-8">Last updated: December 26, 2024</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">
                We collect minimal data necessary to provide our monitoring service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>Account information (email, name, company)</li>
                <li>AI request metadata (URLs, response times, costs)</li>
                <li>Usage analytics (dashboard views, feature usage)</li>
                <li>Billing information (for paid plans)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. What We DON'T Collect</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">
                We are committed to privacy and explicitly do NOT collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>Your source code or prompts</li>
                <li>AI responses or generated content</li>
                <li>Personal files or documents</li>
                <li>Sensitive business data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">We use collected information to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>Provide AI monitoring and analytics</li>
                <li>Send security alerts and notifications</li>
                <li>Process billing and payments</li>
                <li>Improve our service and features</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Storage and Security</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                Your data is encrypted in transit and at rest. We use industry-standard security practices and are SOC2
                compliant. Data is stored in secure cloud infrastructure with regular backups and monitoring.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Data Sharing</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">
                We do not sell or share your personal data. We may share data only in these limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>With your explicit consent</li>
                <li>To comply with legal requirements</li>
                <li>With service providers under strict confidentiality agreements</li>
                <li>In case of business transfer (with notice)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-[#FAFAFA]/80">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. AI Training</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                <strong>Your data never trains AI models.</strong> We do not use your monitoring data, metadata, or any
                information for training machine learning models or AI systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Contact Us</h2>
              <p className="text-[#FAFAFA]/80 leading-relaxed">
                For privacy questions or to exercise your rights, contact us at{" "}
                <a href="mailto:privacy@kilometers.ai" className="text-[#0EA5E9] hover:underline">
                  privacy@kilometers.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
