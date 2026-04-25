import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArtifactsView } from '@/components/dashboard/artifacts-view'

export const metadata = {
  title: 'Artifacts — xeref.ai',
}

export default async function ArtifactsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ArtifactsView />
    </div>
  )
}
