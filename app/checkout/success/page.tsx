import Link from 'next/link'
import { XerefLogo } from '@/components/xeref-logo'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
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
      </div>
    </div>
  )
}
