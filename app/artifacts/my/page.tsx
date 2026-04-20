// TODO: Internal prototype — not linked from the UI yet.
// When the public sharing feature ships, replace MOCK_ARTIFACTS with a real
// server action (e.g. getPublishedArtifact(id)) and remove this mock import.

import type { Metadata } from 'next'
import { MOCK_ARTIFACTS } from '@/components/dashboard/artifacts/mock-artifacts'
import { ArtifactPublicView } from '@/components/dashboard/artifacts/artifact-public-view'

export const metadata: Metadata = {
  title: 'Shared Artifact — xeref.ai',
  description: 'View a shared artifact from xeref.ai',
}

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function ArtifactPublicPage({ searchParams }: Props) {
  const { id } = await searchParams
  const artifact = id
    ? (MOCK_ARTIFACTS.find((a) => a.id === id && a.published) ?? null)
    : null
  return <ArtifactPublicView artifact={artifact} />
}
