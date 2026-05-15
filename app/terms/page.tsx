import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';
import { SiteFooter } from '@/components/site-footer';

export default function TermsPage() {
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
            <BookOpen className="text-primary w-10 h-10" /> Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Your rights and responsibilities when using xeref.ai
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8">

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">1. Acceptance of Terms</h2>
            <p className="leading-7 mt-4">
              By accessing or using <strong>xeref.ai</strong> (the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>
            <p className="leading-7 mt-4">
              We reserve the right to update these Terms at any time. Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">2. Description of Service</h2>
            <p className="leading-7 mt-4">
              xeref.ai is an AI agent builder and productivity platform. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>XerefClaw (CLAWS Builder)</strong> — a structured methodology for designing and generating custom AI agent system prompts</li>
              <li><strong>AI Chat</strong> — conversational interface powered by large language models (model access varies by plan)</li>
              <li><strong>Task &amp; Workflow Management</strong> — tools for organizing, automating, and scheduling work</li>
              <li><strong>Memory</strong> — upload documents and semantically search across stored content during AI sessions</li>
              <li><strong>Connectors</strong> — OAuth-based integrations with GitHub, Gmail, Google Calendar, Notion, Slack, Vercel, and Telegram, plus a local Filesystem connector via MCP</li>
              <li><strong>Skills</strong> — reusable instruction sets that extend agent capabilities</li>
              <li><strong>Artifacts</strong> — versioned outputs (code, documents, prompts, data, images, workflows) with optional public share URLs</li>
              <li><strong>Plans</strong> — AI-generated execution plans broken into phases, tasks, and KPIs</li>
              <li><strong>MCP Server</strong> — programmatic access to your xeref workspace for use with external AI agents such as Claude or Antigravity</li>
              <li><strong>Agent Dashboard</strong> — a unified interface for managing your agents and productivity</li>
            </ul>
            <p className="leading-7 mt-4">
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">3. User Accounts</h2>
            <p className="leading-7 mt-4">
              To access most features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your password and promptly notify us of any unauthorized use</li>
              <li>Be responsible for all activity that occurs under your account</li>
              <li>Not share your account credentials with others or create accounts on behalf of third parties without authorization</li>
            </ul>
            <p className="leading-7 mt-4">
              We reserve the right to terminate accounts that violate these Terms or are found to be fraudulent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">4. Subscription Plans &amp; Payments</h2>
            <p className="leading-7 mt-4">
              xeref.ai offers the following subscription tiers:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Basic (Free):</strong> Access to core features with usage limits</li>
              <li><strong>Pro:</strong> $17/month or $170/year — expanded model access and higher usage limits</li>
              <li><strong>Ultra:</strong> $77/month or $770/year — full model access and maximum usage limits</li>
            </ul>
            <p className="leading-7 mt-4">
              Payments are processed by <strong>Creem</strong>. By subscribing, you authorize Creem to charge your payment method on a recurring basis. Subscriptions renew automatically unless cancelled before the renewal date.
            </p>
            <p className="leading-7 mt-4">
              <strong>Refunds:</strong> We do not offer refunds after a billing cycle has started, except where required by applicable law. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">5. Acceptable Use</h2>
            <p className="leading-7 mt-4">
              You agree not to use the Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Design or deploy agents intended to cause harm, spread misinformation, or engage in illegal activity</li>
              <li>Generate malicious code, malware, or content that violates others&apos; rights</li>
              <li>Attempt to reverse-engineer, decompile, or disassemble any part of the platform</li>
              <li>Scrape, crawl, or use automated means to access the Service beyond normal use</li>
              <li>Circumvent rate limits, plan restrictions, or access controls</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Only connect third-party accounts (GitHub, Gmail, Google Calendar, Notion, Slack, Vercel, Telegram) that you own or are explicitly authorized to use; do not connect accounts on behalf of others without their consent</li>
              <li>When enabling the Filesystem connector, only grant access to directories on machines and under accounts you control; you are solely responsible for the files agents can read or modify</li>
              <li>Publish Artifact share URLs only for content you own or have rights to share; do not publish content containing third-party personal data, credentials, or confidential material — share URLs are publicly accessible to anyone with the link</li>
              <li>Violate any applicable local, national, or international law or regulation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">6. Intellectual Property</h2>
            <p className="leading-7 mt-4">
              The xeref.ai platform, brand, design, and underlying technology are the exclusive property of <strong>Bugra Karsli / xeref.ai</strong> and are protected by intellectual property laws.
            </p>
            <p className="leading-7 mt-4">
              <strong>Your content:</strong> You retain ownership of the agent configurations, prompts, and outputs you create using the Service. By using the Service, you grant us a limited, non-exclusive license to store and process your content solely to provide the Service to you.
            </p>
            <p className="leading-7 mt-4">
              You may use your generated prompts and configurations for both personal and commercial projects.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">7. Disclaimer of Warranties</h2>
            <p className="leading-7 mt-4">
              The Service is provided <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong> without any warranty of any kind, express or implied. We do not guarantee that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The Service will be uninterrupted, error-free, or available at any particular time</li>
              <li>AI-generated outputs will be accurate, complete, or suitable for any particular purpose</li>
              <li>The Service will meet your specific requirements</li>
            </ul>
            <p className="leading-7 mt-4">
              You should review all AI-generated content before deploying it in production or sharing it publicly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">8. Limitation of Liability</h2>
            <p className="leading-7 mt-4">
              To the fullest extent permitted by applicable law, xeref.ai and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of or in connection with your use of the Service.
            </p>
            <p className="leading-7 mt-4">
              Our total cumulative liability to you for any claims arising from or relating to the Service shall not exceed the total amount you paid us in the <strong>three (3) months</strong> preceding the event giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">9. Termination</h2>
            <p className="leading-7 mt-4">
              You may cancel your account at any time through the account settings or by contacting us. Upon cancellation, your access to paid features will continue until the end of your current billing period.
            </p>
            <p className="leading-7 mt-4">
              We reserve the right to suspend or terminate your account immediately, without prior notice, if you violate these Terms or engage in conduct we determine, in our sole discretion, to be harmful to the Service or other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">10. Governing Law</h2>
            <p className="leading-7 mt-4">
              These Terms are governed by and construed in accordance with the laws of the <strong>Republic of Turkey</strong>. Any disputes arising out of or in connection with these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of <strong>Istanbul, Turkey</strong>.
            </p>
            <p className="leading-7 mt-4">
              Users in Turkey are also protected by applicable Turkish consumer protection laws and the Personal Data Protection Law (<strong>KVKK No. 6698</strong>).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold border-b pb-2">11. Contact Us</h2>
            <p className="leading-7 mt-4">
              If you have any questions about these Terms or wish to report a violation, please contact us at:
            </p>
            <p className="leading-7 mt-2">
              <a href="mailto:support@xeref.ai" className="text-primary underline underline-offset-4 font-medium">support@xeref.ai</a>
            </p>
          </section>

          <p className="mt-12 pt-8 border-t text-sm text-muted-foreground italic">Last updated: May 15, 2026</p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
