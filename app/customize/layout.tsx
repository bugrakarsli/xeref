import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CustomizeNav } from '@/components/customize/CustomizeNav'

export default async function CustomizeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-background text-foreground dark">
      <CustomizeNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
