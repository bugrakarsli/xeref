'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Artifact, ArtifactType, ArtifactVersion } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToArtifact(row: Record<string, any>): Artifact {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    type: row.type as ArtifactType,
    status: row.status,
    capabilities: row.capabilities ?? [],
    versions: (row.versions ?? []) as ArtifactVersion[],
    currentVersion: row.current_version ?? 0,
    published: row.published ?? false,
    shareUrl: row.share_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    language: row.language ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getUserArtifacts(): Promise<Artifact[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return []
  return (data ?? []).map(mapRowToArtifact)
}

export async function getArtifactById(id: string): Promise<Artifact | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data ? mapRowToArtifact(data) : null
}

export async function createArtifact(input?: {
  title?: string
  type?: ArtifactType
}): Promise<Artifact> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const now = new Date().toISOString()
  const seedVersion: ArtifactVersion = {
    version: 1,
    content: '',
    createdAt: now,
    label: 'Initial draft',
  }

  const { data, error } = await supabase
    .from('artifacts')
    .insert({
      user_id: user.id,
      title: input?.title ?? 'Untitled artifact',
      type: input?.type ?? 'document',
      versions: [seedVersion],
      current_version: 0,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/artifacts/my')
  return mapRowToArtifact(data)
}

export async function updateArtifact(
  id: string,
  patch: Partial<Pick<Artifact, 'title' | 'description' | 'published' | 'shareUrl' | 'tags' | 'versions' | 'currentVersion' | 'status'>>
): Promise<Artifact> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const dbPatch: Record<string, unknown> = {}
  if (patch.title !== undefined)         dbPatch.title = patch.title
  if (patch.description !== undefined)   dbPatch.description = patch.description
  if (patch.published !== undefined)     dbPatch.published = patch.published
  if (patch.shareUrl !== undefined)      dbPatch.share_url = patch.shareUrl
  if (patch.tags !== undefined)          dbPatch.tags = patch.tags
  if (patch.versions !== undefined)      dbPatch.versions = patch.versions
  if (patch.currentVersion !== undefined) dbPatch.current_version = patch.currentVersion
  if (patch.status !== undefined)        dbPatch.status = patch.status

  const { data, error } = await supabase
    .from('artifacts')
    .update(dbPatch)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/artifacts/my')
  return mapRowToArtifact(data)
}

export async function deleteArtifact(id: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('artifacts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/artifacts/my')
}

export async function duplicateArtifact(id: string): Promise<Artifact> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Read source (RLS allows published = true so another user's published artifact is readable)
  const { data: source, error: readErr } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', id)
    .single()

  if (readErr || !source) throw new Error('Artifact not found or not accessible')

  const { data, error } = await supabase
    .from('artifacts')
    .insert({
      user_id: user.id,
      title: `${source.title} (copy)`,
      description: source.description,
      type: source.type,
      capabilities: source.capabilities,
      versions: source.versions,
      current_version: source.current_version,
      language: source.language,
      tags: source.tags,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/artifacts/my')
  return mapRowToArtifact(data)
}
