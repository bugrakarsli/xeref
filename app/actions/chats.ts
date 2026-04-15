'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Chat, Message } from '@/lib/types'

export async function createChat(projectId: string | null, title?: string): Promise<Chat> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: user.id,
      project_id: projectId,
      title: title ?? 'New Chat',
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  return data as Chat
}

export async function getUserChats(): Promise<Chat[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Chat[]
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Message[]
}

export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function deleteChat(chatId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('chats')
    .delete()
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function addChatToProject(chatId: string, projectId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('chats')
    .update({ project_id: projectId, updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function removeChatFromProject(chatId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('chats')
    .update({ project_id: null, updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/')
}

export async function saveMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('messages').insert({
    chat_id: chatId,
    role,
    content,
    citations: [],
  })

  if (error) throw error

  // Update chat's updated_at so it surfaces first in the list
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', user.id)
}
