import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { XerefLogo } from '@/components/xeref-logo';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
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
            At <strong>xeref.ai</strong>, we take your privacy seriously. The Xeref-Claw project is designed with a **local-first** philosophy. This means that the prompts you generate and the configurations you create are processed primarily in your browser and on your local machine.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold border-b pb-2">2. Data Collection</h2>
          <p className="leading-7 mt-4">
            We do not store your generated prompts, API keys, or personal configurations on our servers. 
            The application is a stateless tool:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>No Database:</strong> We don&apos;t save your agent designs.</li>
            <li><strong>Local Storage:</strong> We may use browser local storage to save your session state (like selected features) so you don&apos;t lose work if you refresh.</li>
            <li><strong>Telemetry:</strong> We may collect anonymous usage data (e.g., which buttons are clicked) to help improve the tool, but we never collect personal content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold border-b pb-2">3. Third-Party Services</h2>
          <p className="leading-7 mt-4">
            Xeref-Claw provides prompts for use in third-party AI IDEs (like Google Antigravity). When you paste a generated prompt into those tools, your data is subject to their respective privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold border-b pb-2">4. Your Control</h2>
          <p className="leading-7 mt-4">
            Because everything is local, you have full control. You can clear your browser data at any time to remove all traces of your session from your machine.
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t text-sm text-muted-foreground italic">
          Last updated: March 20, 2026
        </footer>
      </div>
    </div>
  );
}
