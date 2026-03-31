'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { XerefLogo } from '@/components/xeref-logo'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval)
          router.push('/')
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <XerefLogo className="h-12 w-12 mx-auto" />
        <div className="space-y-2">
          <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto" />
          <h1 className="text-3xl font-extrabold tracking-tight">Payment successful!</h1>
          <p className="text-muted-foreground">
            Your subscription is now active. You have full access to all features in your plan.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/">Go to Dashboard</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Redirecting in {seconds}s…
        </p>
      </div>
    </div>
  )
}
