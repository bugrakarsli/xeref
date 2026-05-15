import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSkillById } from '@/app/actions/skills'

// In a real implementation, this would interact with a storage bucket or local file system
// For now, we mock a basic file structure for the given skill

type FileNode = { name: string; type: 'file' | 'directory'; path: string; children?: FileNode[] }

const MOCK_FILES: Record<string, FileNode[]> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': [ // skill-creator
    { name: 'README.md', type: 'file', path: 'README.md' },
    { name: 'src', type: 'directory', path: 'src', children: [
      { name: 'index.ts', type: 'file', path: 'src/index.ts' },
      { name: 'utils.ts', type: 'file', path: 'src/utils.ts' }
    ]},
    { name: 'package.json', type: 'file', path: 'package.json' }
  ]
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const skill = await getSkillById(id)
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  }

  // If user is not the owner and it's not a built-in skill, deny access
  if (skill.source !== 'built-in' && skill.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Return mock files or empty array for now
  const files = MOCK_FILES[id] || []
  
  return NextResponse.json({ files })
}
