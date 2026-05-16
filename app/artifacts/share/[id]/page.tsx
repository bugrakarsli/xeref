import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ArtifactPublicView } from '@/components/dashboard/artifacts/artifact-public-view'

export const metadata: Metadata = {
  title: 'Shared Artifact — xeref.ai',
  description: 'View a shared artifact from xeref.ai',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ArtifactSharePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  if (!data) {
    return <ArtifactPublicView artifact={null} />
  }

  const artifact = {
    id: data.id,
    title: data.title,
    description: data.description ?? '',
    type: data.type,
    status: data.status,
    capabilities: data.capabilities ?? [],
    versions: data.versions ?? [],
    currentVersion: data.current_version ?? 0,
    published: data.published,
    shareUrl: data.share_url ?? undefined,
    imageUrl: data.image_url ?? undefined,
    language: data.language ?? undefined,
    tags: data.tags ?? [],
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }

  return <ArtifactPublicView artifact={artifact} />
}
