import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { SiteFooter } from '@/components/site-footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto max-w-4xl py-12 px-4 flex-1">
        <div className="mb-8">
          <Button variant="ghost" className="pl-0 gap-2 mb-4 hover:bg-transparent" asChild>
            <Link href="/">
              <ArrowLeft size={16} /> <XerefLogo className="h-6 w-6 ml-1" /> <span className="font-bold">xeref.ai</span>
            </Link>
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 flex items-center gap-3">
            <Shield className="text-primary w-10 h-10" /> Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            How we handle your data at xeref.ai
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">1. Overview</h2>
            <p className="leading-7 mt-4">
              <strong>xeref.ai</strong> is operated by Bugra Karsli, based in Turkey. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information when you use our platform.
            </p>
            <p className="leading-7 mt-4">
              By using xeref.ai, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">2. Information We Collect</h2>
            <p className="leading-7 mt-4">We collect the following categories of data:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>
                <strong>Account Data:</strong> Your email address and, if you sign in via Google OAuth, your name and profile picture provided by Google.
              </li>
              <li>
                <strong>Usage Data:</strong> Feature interactions, model selections, agent configurations, and chat history generated while using the platform.
              </li>
              <li>
                <strong>Connected Account Tokens:</strong> When you connect a third-party service (GitHub, Gmail, Google Calendar, Notion, Slack, Vercel, or Telegram), we receive and store an OAuth access token or bot token issued by that provider. Tokens are encrypted at rest using AES-256-GCM and are used only to call the provider&apos;s API on your behalf. You can revoke any token at any time by disconnecting the service in /customize/connectors.
              </li>
              <li>
                <strong>Uploaded Content &amp; Memory:</strong> Files you upload to the Memory view (PDFs, text, images — up to 50 MB per file) are stored in Supabase Storage. Their text content is chunked, embedded, and stored as vectors in Pinecone to enable semantic search during AI Chat. Manual memory entries are stored in the same index.
              </li>
              <li>
                <strong>Payment Data:</strong> Subscription and billing transactions are handled entirely by <strong>Creem</strong>. We never store your credit card or payment card details on our servers.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser type, device information, and page visit logs collected automatically by our hosting infrastructure (Vercel) to maintain service reliability.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">3. How We Use Your Information</h2>
            <p className="leading-7 mt-4">We use the data we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide, operate, and maintain the xeref.ai platform and its features</li>
              <li>Process your subscription and manage billing through Creem</li>
              <li>Authenticate your identity and secure your account</li>
              <li>Connect to and interact with third-party services you have explicitly authorized (GitHub, Gmail, Google Calendar, Notion, Slack, Vercel, Telegram)</li>
              <li>Enable semantic memory search by embedding your uploaded content into a personal vector index</li>
              <li>Respond to support requests and communicate service-related updates</li>
              <li>Analyze aggregate usage patterns to improve product features</li>
              <li>Comply with our legal obligations under Turkish law</li>
            </ul>
            <p className="leading-7 mt-4">
              We do not sell, rent, or trade your personal data to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">4. Data Storage &amp; Security</h2>
            <p className="leading-7 mt-4">
              Your data is stored on <strong>Supabase</strong> (database and authentication) and served via <strong>Vercel</strong> (hosting and edge infrastructure). Both providers implement industry-standard security measures including encryption in transit (TLS) and encryption at rest.
            </p>
            <p className="leading-7 mt-4">
              While we take reasonable steps to protect your data, no method of electronic storage or transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to using best practices to safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">5. Third-Party Services</h2>
            <p className="leading-7 mt-4">
              xeref.ai integrates with the following third-party services to deliver its functionality. Each is subject to their own privacy policies:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Supabase</strong> — authentication, database storage, and file storage for uploaded documents</li>
              <li><strong>Creem</strong> — subscription billing and payment processing</li>
              <li><strong>OpenRouter</strong> — routing of AI chat messages to underlying model providers (Anthropic, OpenAI, Google, DeepSeek). Your chat messages are transmitted to these providers when you use AI Chat.</li>
              <li><strong>Pinecone</strong> — vector storage for semantic memory and document embeddings</li>
              <li><strong>Vercel</strong> — hosting, CDN, and edge functions</li>
              <li><strong>GitHub, Google (Gmail / Calendar), Notion, Slack, Vercel API, Telegram</strong> — only when you explicitly connect them via /customize/connectors. We store only the access token needed to act on your behalf; we do not mirror or retain the content from those services beyond what is required to fulfill your request.</li>
            </ul>
            <p className="leading-7 mt-4">
              When you use AI features, the content of your messages is transmitted to AI model providers (Anthropic, OpenAI, Google, DeepSeek) through OpenRouter. Do not send sensitive personal information in AI chat sessions.
            </p>
            <p className="leading-7 mt-4">
              When you enable the Filesystem connector, agents can read and write files in directories you explicitly allow on your local machine. File contents are not uploaded to xeref.ai servers unless you choose to copy them into a chat or upload them to Memory.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">6. Cookies</h2>
            <p className="leading-7 mt-4">
              We use cookies solely for authentication session management — to keep you logged in across page navigations. We do not use advertising, tracking, or analytics cookies from third parties. You can disable cookies in your browser settings, but doing so will prevent you from staying logged in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">7. Your Rights (KVKK)</h2>
            <p className="leading-7 mt-4">
              Under the Turkish Personal Data Protection Law (<strong>KVKK — Kişisel Verilerin Korunması Kanunu No. 6698</strong>), you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Correction:</strong> Request that inaccurate data be corrected</li>
              <li><strong>Right to Deletion:</strong> Request erasure of your personal data where there is no legitimate reason for us to continue processing it</li>
              <li><strong>Right to Restriction:</strong> Request that we restrict processing of your data in certain circumstances</li>
              <li><strong>Right to Data Portability:</strong> Request transfer of your data in a structured, machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing of your data where we rely on legitimate interests</li>
            </ul>
            <p className="leading-7 mt-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@xeref.ai" className="text-primary underline underline-offset-4">support@xeref.ai</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">8. Data Retention</h2>
            <p className="leading-7 mt-4">
              We retain your personal data for as long as your account is active. If you delete your account, we will delete or anonymize your personal data within <strong>30 days</strong>, except where we are required to retain it for legal or financial compliance purposes (e.g., transaction records).
            </p>
            <p className="leading-7 mt-4">
              Disconnecting a third-party connector immediately revokes the stored token and deletes it from our database. Deleting a memory item removes its record from Supabase and its corresponding vector chunks from Pinecone.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">9. Children&apos;s Privacy</h2>
            <p className="leading-7 mt-4">
              xeref.ai is not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected data from a minor, please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">10. Changes to This Policy</h2>
            <p className="leading-7 mt-4">
              We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or an in-app banner at least 7 days before the changes take effect. Continued use of the service after the effective date constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">11. Contact Us</h2>
            <p className="leading-7 mt-4">
              For any privacy-related questions, data requests, or concerns, please contact us at:
            </p>
            <p className="leading-7 mt-2">
              <a href="mailto:support@xeref.ai" className="text-primary underline underline-offset-4 font-medium">support@xeref.ai</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">12. Governing Law</h2>
            <p className="leading-7 mt-4">
              This Privacy Policy is governed by and construed in accordance with the laws of the <strong>Republic of Turkey</strong>, including the Personal Data Protection Law (<strong>KVKK No. 6698</strong>). Any disputes arising in connection with this policy shall be subject to the exclusive jurisdiction of the courts of <strong>Istanbul, Turkey</strong>.
            </p>
          </section>

          <p className="mt-12 pt-8 border-t text-sm text-muted-foreground italic">Last updated: May 15, 2026</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
