'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsRedirect() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('xeref_active_view', 'settings')
    router.replace('/')
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
        <p className="text-sm text-muted-foreground">Redirecting to Settings...</p>
      </div>
    </div>
  )
}
