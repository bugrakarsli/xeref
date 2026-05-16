import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserArtifacts, getArtifactById } from '@/app/actions/artifacts'
import { ArtifactsView } from '@/components/dashboard/artifacts-view'

export const metadata: Metadata = {
  title: 'Artifacts — xeref.ai',
}

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function ArtifactsMyPage({ searchParams }: Props) {
  const { id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (id) redirect(`/artifacts/share/${id}`)
    redirect('/login')
  }

  const userArtifacts = await getUserArtifacts()

  // If ?id= is set but the artifact isn't in the user's list, try to load it as a preview
  const isOwned = id ? userArtifacts.some((a) => a.id === id) : false
  const previewArtifact = id && !isOwned ? await getArtifactById(id) : null

  return (
    <div className="flex h-screen bg-background text-foreground">
      <ArtifactsView
        initialArtifacts={userArtifacts}
        initialSelectedId={id}
        previewArtifact={previewArtifact}
      />
    </div>
  )
}
