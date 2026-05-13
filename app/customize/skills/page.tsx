import { getSkills } from '@/app/actions/skills'
import { SkillsSection } from '@/components/customize/SkillsSection'

export const metadata = {
  title: 'Skills | Xeref',
  description: 'Manage reusable prompt templates and tool chains for your agents',
}

export default async function SkillsPage() {
  const skills = await getSkills()
  return <SkillsSection initialSkills={skills} />
}
