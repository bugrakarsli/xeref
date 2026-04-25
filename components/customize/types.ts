import type { ElementType } from 'react'

export interface Skill {
  id: string
  name: string
  description: string
  promptTemplate: string
  tools: string[]
  createdAt: string
}

export interface Connector {
  id: string
  name: string
  service: string
  icon: ElementType
  color: string
  connected: boolean
  description: string
  scopes?: string[]
}
