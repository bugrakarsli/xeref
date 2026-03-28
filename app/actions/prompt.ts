'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { features } from '@/lib/features'
import { generateMasterPrompt } from '@/lib/prompt-generator'

export async function activateProjectPrompt(projectId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Fetch the project to get selected_feature_ids
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('id, user_id, selected_feature_ids')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !project) throw new Error('Project not found')

  // Resolve feature objects from IDs
  const selectedFeatures = features.filter((f) =>
    project.selected_feature_ids.includes(f.id)
  )

  // Generate the master prompt
  const prompt = generateMasterPrompt(selectedFeatures)

  // Save prompt back to the project
  const { error: updateError } = await supabase
    .from('projects')
    .update({ prompt })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (updateError) throw updateError

  revalidatePath('/')
}
