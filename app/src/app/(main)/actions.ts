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

  if (profile) return profile

  const username = user.user_metadata?.username ?? 'new_user'
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({ id: user.id, username: username })
    .single()

  if (createError) {
    console.error('Error creating profile:', createError)
    return null
  }
  return newProfile
}

// --- UPDATED ADD QUESTION ---
export async function addQuestion(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in.', success: false }

  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) return { message: 'Error validating your user profile.', success: false }

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  // 1. Get selected topics from the form
  const topicsJson = formData.get('topics') as string
  const topicIds = topicsJson ? JSON.parse(topicsJson) : []

  if (!title || title.length < 10) {
    return { message: 'Your question title must be at least 10 characters long.', success: false }
  }

  // 2. Insert Question and return the new ID (select())
  const { data: newQuestion, error } = await supabase
    .from('questions')
    .insert({
      title: title,
      body: body,
      user_id: user.id 
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error adding question:', error)
    return { message: error.message, success: false }
  }

  // 3. Insert Topics (if any)
  if (topicIds.length > 0 && newQuestion) {
    const topicInserts = topicIds.map((topicId: string) => ({
      question_id: newQuestion.id,
      topic_id: topicId
    }))
    const { error: topicError } = await supabase.from('question_topics').insert(topicInserts)
    if (topicError) console.error('Error adding topics to question:', topicError)
  }

  revalidatePath('/questions') 
  return { message: 'Question added successfully!', success: true }
}

// --- UPDATED ADD POST ---
export async function addPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in.', success: false }

  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) return { message: 'Error validating your user profile.', success: false }

  const title = formData.get('title') as string | null
  const content = formData.get('content') as string
  // 1. Get selected topics from the form
  const topicsJson = formData.get('topics') as string
  const topicIds = topicsJson ? JSON.parse(topicsJson) : []

  if (!content || content.length < 1) {
    return { message: 'Your post cannot be empty.', success: false }
  }

  // 2. Insert Post and return ID
  const { data: newPost, error } = await supabase
    .from('posts')
    .insert({
      title: title,
      content: content,
      user_id: user.id 
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error adding post:', error)
    return { message: error.message, success: false }
  }

  // 3. Insert Topics (if any)
  if (topicIds.length > 0 && newPost) {
    const topicInserts = topicIds.map((topicId: string) => ({
      post_id: newPost.id,
      topic_id: topicId
    }))
    const { error: topicError } = await supabase.from('post_topics').insert(topicInserts)
    if (topicError) console.error('Error adding topics to post:', topicError)
  }

  revalidatePath('/') 
  return { message: 'Post added successfully!', success: true }
}

// --- VOTING & REPOSTING & DELETING (Keep these as they were) ---

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