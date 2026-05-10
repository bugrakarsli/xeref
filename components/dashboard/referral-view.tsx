'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Users, Copy, Gift, UserPlus, Star, CheckCircle2, ChevronRight, Twitter, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const steps = [
  { icon: UserPlus, label: 'Share your unique link', desc: 'Invite friends via email, social, or direct link.' },
  { icon: Users, label: 'They sign up', desc: 'Your friend creates an account and builds their first agent.' },
  { icon: Gift, label: 'You both get rewarded', desc: 'Enjoy 1 free month of Xeref Pro automatically.' },
]

export function ReferralView() {
  const [copied, setCopied] = useState(false)
  const referralLink = "https://xeref.ai/ref/xeref-pro"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Referral link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link.')
    }
  }

  return (
    <section aria-label="Referral Program" className="flex flex-col flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto overflow-y-auto">
      {/* Header section with gradient */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-white/10 p-8 sm:p-10">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Star className="w-48 h-48 text-primary animate-pulse" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Gift className="w-3.5 h-3.5" />
            Referral Program
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Give a month. <br className="hidden sm:block"/>Get a month.</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Invite friends to Xeref. When they sign up and build their first agent, you both get 1 free month of Xeref Pro. No limits on how many free months you can earn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Main interactive area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Share Box */}
          <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold mb-2">Share your link</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Send this link to a friend to get started.
            </p>
            
            <div className="flex gap-3 mb-6">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 font-mono text-sm bg-background border-primary/20 focus-visible:ring-primary/30"
              />
              <Button
                variant={copied ? "default" : "secondary"}
                className="shrink-0 w-24 transition-all"
                onClick={handleCopy}
              >
                {copied ? (
                  <><CheckCircle2 className="mr-2 w-4 h-4" /> Copied</>
                ) : (
                  <><Copy className="mr-2 w-4 h-4" /> Copy</>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <span className="text-sm font-medium text-muted-foreground">Share via:</span>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] transition-colors" aria-label="Share on Twitter" onClick={() => toast.info('Social sharing coming soon!')}>
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-colors" aria-label="Share on LinkedIn" onClick={() => toast.info('Social sharing coming soon!')}>
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" aria-label="Share via Email" onClick={() => toast.info('Email sharing coming soon!')}>
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats / Rewards tracking */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Your Rewards</h2>
              <Button variant="link" className="text-sm text-muted-foreground p-0 h-auto">View history <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col p-4 rounded-xl bg-secondary/30 border border-border/50">
                <span className="text-3xl font-bold mb-1">0</span>
                <span className="text-sm text-muted-foreground font-medium">Friends joined</span>
              </div>
              <div className="flex flex-col p-4 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-3xl font-bold text-primary mb-1">0</span>
                <span className="text-sm text-primary/80 font-medium">Months earned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Instructions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border bg-card p-6 shadow-sm h-full">
            <h2 className="text-lg font-semibold mb-6">How it works</h2>
            <div className="flex flex-col gap-6 relative">
              {/* Connecting line */}
              <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-border/50 -z-10" />
              
              {steps.map(({ icon: Icon, label, desc }, i) => (
                <div key={i} className="flex gap-4 relative bg-card">
                  <div className="w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shrink-0 shadow-sm z-10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold mb-1">{label}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border/50 text-xs text-muted-foreground leading-relaxed">
              <strong>Note:</strong> Referrals are only counted when a new user signs up via your link and successfully creates their first agent project. Self-referrals are not permitted.
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
