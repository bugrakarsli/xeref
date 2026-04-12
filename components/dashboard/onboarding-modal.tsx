'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { XerefLogo } from '@/components/xeref-logo'
import { updateProfile } from '@/app/actions/profile'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ChevronRight, CheckCircle } from 'lucide-react'

const ROLES = [
  { value: 'developer', label: 'Developer' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'founder', label: 'Founder' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'other', label: 'Other' },
]

const GOALS = [
  { value: 'build_agents', label: 'Build AI agents' },
  { value: 'automate_tasks', label: 'Automate tasks' },
  { value: 'learn_ai', label: 'Learn AI tools' },
  { value: 'manage_team', label: 'Manage my team' },
]

const MODELS = [
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5', description: 'Fast & free', plan: 'Free' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6', description: 'Best balance', plan: 'Pro' },
  { value: 'claude-opus-4-6', label: 'Opus 4.6', description: 'Most powerful', plan: 'Ultra' },
]

interface OnboardingModalProps {
  userName?: string
  onComplete: () => void
}

export function OnboardingModal({ userName, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState(userName ?? '')
  const [role, setRole] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [preferredModel, setPreferredModel] = useState('claude-haiku-4-5-20251001')
  const [isPending, startTransition] = useTransition()

  const steps = [
    { title: "What's your name?", subtitle: 'How should we call you?' },
    { title: 'What describes you?', subtitle: 'Help us tailor your experience.' },
    { title: 'What brings you here?', subtitle: 'Your primary goal on xeref.ai.' },
    { title: 'Preferred AI model', subtitle: 'You can always change this later.' },
  ]

  const canAdvance = [
    displayName.trim().length > 0,
    role.length > 0,
    primaryGoal.length > 0,
    true, // model always has a default
  ]

  function handleNext() {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  function handleComplete() {
    startTransition(async () => {
      try {
        await updateProfile({
          display_name: displayName.trim() || undefined,
          role,
          primary_goal: primaryGoal,
          preferred_model: preferredModel,
          onboarding_completed: true,
        })
        onComplete()
      } catch {
        toast.error('Failed to save preferences. You can update them in Settings.')
        onComplete() // still dismiss — don't block the user
      }
    })
  }

  const progress = ((step + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border bg-card shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <XerefLogo className="h-6 w-6" />
            <span className="font-semibold text-sm">xeref<span className="text-primary">.ai</span></span>
            <span className="ml-auto text-xs text-muted-foreground">{step + 1} / {steps.length}</span>
          </div>

          {/* Step header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">{steps[step].title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{steps[step].subtitle}</p>
          </div>

          {/* Step content */}
          <div className="mb-8">
            {step === 0 && (
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name or handle…"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canAdvance[step]) handleNext()
                }}
              />
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left',
                      role === r.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/40 hover:bg-accent'
                    )}
                  >
                    {r.label}
                    {role === r.value && <CheckCircle className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setPrimaryGoal(g.value)}
                    className={cn(
                      'flex items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors text-left',
                      primaryGoal === g.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/40 hover:bg-accent'
                    )}
                  >
                    {g.label}
                    {primaryGoal === g.value && <CheckCircle className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-2">
                {MODELS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPreferredModel(m.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors text-left',
                      preferredModel === m.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40 hover:bg-accent'
                    )}
                  >
                    <div className="flex-1">
                      <span className="font-medium">{m.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{m.description}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {m.plan}
                    </span>
                    {preferredModel === m.value && <CheckCircle className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip setup
              </button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canAdvance[step] || isPending}
              className="gap-2"
            >
              {step === steps.length - 1 ? (isPending ? 'Saving…' : 'Get started') : 'Continue'}
              {step < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
