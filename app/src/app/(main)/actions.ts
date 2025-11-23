'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type FormState = {
  message: string
  success: boolean
}

function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createClient(cookieStore)
}

async function getOrCreateProfile(supabase: any, user: any) {
  let { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching profile:', fetchError)
    return null
  }

  if (profile) {
    return profile
  }

  const username = user.user_metadata?.username ?? 'new_user'

  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: username,
    })
    .single()

  if (createError) {
    console.error('Error creating profile:', createError)
    return null
  }

  return newProfile
}

export async function addQuestion(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'You must be logged in.', success: false }
  }

  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) {
    return { message: 'Error validating your user profile.', success: false }
  }

  const title = formData.get('title') as string
  const body = formData.get('body') as string

  if (!title || title.length < 10) {
    return { message: 'Your question title must be at least 10 characters long.', success: false }
  }

  const { error } = await supabase
    .from('questions')
    .insert({
      title: title,
      body: body,
      user_id: user.id 
    })

  if (error) {
    console.error('Error adding question:', error)
    return { message: error.message, success: false }
  }

  revalidatePath('/questions') 
  return { message: 'Question added successfully!', success: true }
}

export async function addPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'You must be logged in.', success: false }
  }

  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) {
    return { message: 'Error validating your user profile.', success: false }
  }

  const title = formData.get('title') as string | null
  const content = formData.get('content') as string

  if (!content || content.length < 1) {
    return { message: 'Your post cannot be empty.', success: false }
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      title: title,
      content: content,
      user_id: user.id 
    })

  if (error) {
    console.error('Error adding post:', error)
    return { message: error.message, success: false }
  }

  revalidatePath('/') 
  return { message: 'Post added successfully!', success: true }
}

// --- NEW EDIT/DELETE ACTIONS ---

export async function deletePost(postId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting post:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function editPost(postId: string, title: string | null, content: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const { error } = await supabase
    .from('posts')
    .update({ title, content })
    .eq('id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating post:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting question:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/questions')
  return { success: true }
}

export async function editQuestion(questionId: string, title: string, body: string | null) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const { error } = await supabase
    .from('questions')
    .update({ title, body })
    .eq('id', questionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating question:', error)
    return { success: false, message: error.message }
  }

  revalidatePath('/questions')
  revalidatePath(`/questions/${questionId}`)
  return { success: true }
}