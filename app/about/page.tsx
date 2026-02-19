import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Rocket, Github, Youtube, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="mb-8">
        <Button variant="ghost" className="pl-0 gap-2 mb-4" asChild>
          <Link href="/">
            <ArrowLeft size={16} /> Back
          </Link>
        </Button>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">About Xeref-Claw</h1>
        <p className="text-xl text-muted-foreground">
          The easiest way to build complex, local-first AI agents.
        </p>
      </div>

      <div className="space-y-12">
        <section className="prose dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">The Vision</h2>
          <p className="leading-7">
            Xeref-Claw is part of the <strong>XerefAI</strong> ecosystem, designed to democratize access to powerful, autonomous AI agents. 
            Inspired by the <em>OpenClaw</em> project and Jack Roberts' <em>Gravity Claw</em> concept, this tool bridges the gap between 
            complex code and simple Lego-like building blocks.
          </p>
          <p className="leading-7 mt-4">
            Instead of writing thousands of lines of boilerplate code, you simply browse our catalog of capabilities—from 
            Telegram integration to Memory systems—and we generate the exact prompts you need to build them instantly 
            inside an AI-powered IDE like Google Antigravity.
          </p>
        </section>

        <section className="bg-muted p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Rocket className="text-primary" /> How It Works
          </h2>
          <ol className="list-decimal pl-5 space-y-2 marker:text-primary marker:font-bold">
            <li className="pl-2">Visit the <Link href="/builder" className="underline font-medium text-primary">Builder</Link> page.</li>
            <li className="pl-2">Select the "Lego bricks" (features) you want for your agent.</li>
            <li className="pl-2">Click <strong>Generate Prompt</strong>.</li>
            <li className="pl-2">Paste the prompt into Antigravity or your AI code editor.</li>
            <li className="pl-2">Watch your custom agent come to life in minutes!</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Connect with the Community</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="https://github.com/BugraKarsli1" target="_blank" className="flex items-center justify-center p-6 border rounded-lg hover:bg-accent hover:border-primary transition-all group">
               <Github className="w-8 h-8 mb-2 group-hover:text-primary transition-colors" />
               <span className="font-semibold ml-3">GitHub</span>
            </Link>
            <Link href="https://youtube.com/@BugraKarsli1" target="_blank" className="flex items-center justify-center p-6 border rounded-lg hover:bg-accent hover:border-red-500 transition-all group">
               <Youtube className="w-8 h-8 mb-2 group-hover:text-red-500 transition-colors" />
               <span className="font-semibold ml-3">YouTube</span>
            </Link>
            <Link href="#" className="flex items-center justify-center p-6 border rounded-lg hover:bg-accent hover:border-blue-500 transition-all group">
               <Globe className="w-8 h-8 mb-2 group-hover:text-blue-500 transition-colors" />
               <span className="font-semibold ml-3">XerefAI</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
