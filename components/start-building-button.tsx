'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  size?: 'sm' | 'lg' | 'default'
  showArrow?: boolean
}

export function StartBuildingButton({ size = 'default', showArrow = false }: Props) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(!!data.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleClick = () => {
    if (isAuthenticated) {
      router.push('/builder')
    } else {
      setOpen(true)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (oauthError) {
      setGoogleLoading(false)
      setError(oauthError.message)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    setLoading(false)
    if (otpError) {
      setError(otpError.message)
    } else {
      setSent(true)
    }
  }

  const resetDialog = () => {
    setSent(false)
    setEmail('')
    setError('')
  }

  return (
    <>
      <Button
        size={size}
        onClick={handleClick}
        className={size === 'lg' ? 'h-12 px-8' : ''}
      >
        Start Building {showArrow && <ArrowRight className="ml-2 h-4 w-4" />}
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetDialog() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to xeref.ai</DialogTitle>
            <DialogDescription>
              Save your agent configurations and access them anywhere.
            </DialogDescription>
          </DialogHeader>

          {sent ? (
            <div className="bg-muted/40 border rounded-xl p-6 text-center space-y-2">
              <p className="font-medium">Check your email</p>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to{' '}
                <span className="font-mono text-foreground">{email}</span>.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={resetDialog}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogle}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex-1 border-t" />
                <span>or</span>
                <div className="flex-1 border-t" />
              </div>

              <form onSubmit={handleMagicLink} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="dialog-email">Email address</Label>
                  <Input
                    id="dialog-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send magic link
                </Button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Terms
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
