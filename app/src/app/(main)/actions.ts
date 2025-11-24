'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type FormState = {
  message: string
  success: boolean
}

function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createClient(cookieStore)
}

// ... (getOrCreateProfile, addQuestion, addPost remain same) ...
// Re-including them for context, or just appending the new actions below existing ones.
// Assuming standard imports and existing functions are present.

// --- VOTE & REPOST ACTIONS ---

export async function voteOnPost(postId: string, voteType: 1 | -1) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existingVote } = await supabase
    .from('post_votes')
    .select('id, vote_type')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase.from('post_votes').delete().eq('id', existingVote.id)
    } else {
      await supabase.from('post_votes').update({ vote_type: voteType }).eq('id', existingVote.id)
    }
  } else {
    await supabase.from('post_votes').insert({ user_id: user.id, post_id: postId, vote_type: voteType })
  }
  revalidatePath('/')
}

export async function voteOnQuestion(questionId: string, voteType: 1 | -1) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existingVote } = await supabase
    .from('question_votes')
    .select('id, vote_type')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase.from('question_votes').delete().eq('id', existingVote.id)
    } else {
      await supabase.from('question_votes').update({ vote_type: voteType }).eq('id', existingVote.id)
    }
  } else {
    await supabase.from('question_votes').insert({ user_id: user.id, question_id: questionId, vote_type: voteType })
  }
  revalidatePath('/questions')
}

export async function repostPost(postId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('reposts')
    .select('id')
    .eq('user_id', user.id)
    .eq('post_id', postId)
    .single()

  if (existing) {
    await supabase.from('reposts').delete().eq('id', existing.id)
  } else {
    await supabase.from('reposts').insert({ user_id: user.id, post_id: postId })
  }
  revalidatePath('/')
}

export async function repostQuestion(questionId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('reposts')
    .select('id')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .single()

  if (existing) {
    await supabase.from('reposts').delete().eq('id', existing.id)
  } else {
    await supabase.from('reposts').insert({ user_id: user.id, question_id: questionId })
  }
  revalidatePath('/questions')
}

// ... (Existing edit/delete actions: deletePost, editPost, deleteQuestion, editQuestion) ...
export async function deletePost(postId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }
  const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function editPost(postId: string, title: string | null, content: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }
  const { error } = await supabase.from('posts').update({ title, content }).eq('id', postId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }
  const { error } = await supabase.from('questions').delete().eq('id', questionId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/questions')
  return { success: true }
}

export async function editQuestion(questionId: string, title: string, body: string | null) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }
  const { error } = await supabase.from('questions').update({ title, body }).eq('id', questionId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/questions')
  revalidatePath(`/questions/${questionId}`)
  return { success: true }
}

// (Include addQuestion and addPost from your existing file here if rewriting full file)
// For brevity, I focused on the new/modified exports above.
// PLEASE ENSURE addQuestion and addPost ARE ALSO IN THE FILE.
export async function addQuestion(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in.', success: false }
  
  // ... (rest of your addQuestion logic)
  const title = formData.get('title') as string
  const body = formData.get('body') as string
  if (!title || title.length < 10) return { message: 'Title too short.', success: false }
  
  const { error } = await supabase.from('questions').insert({ title, body, user_id: user.id })
  if (error) return { message: error.message, success: false }
  revalidatePath('/questions')
  return { message: 'Question added!', success: true }
}

export async function addPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in.', success: false }

  // ... (rest of your addPost logic)
  const title = formData.get('title') as string | null
  const content = formData.get('content') as string
  if (!content) return { message: 'Content empty.', success: false }

  const { error } = await supabase.from('posts').insert({ title, content, user_id: user.id })
  if (error) return { message: error.message, success: false }
  revalidatePath('/')
  return { message: 'Post added!', success: true }
}