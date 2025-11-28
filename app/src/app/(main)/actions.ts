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

  if (fetchError && fetchError.code !== 'PGRST116') return null
  if (profile) return profile

  const username = user.user_metadata?.username ?? 'new_user'
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({ id: user.id, username: username })
    .single()

  if (createError) return null
  return newProfile
}

export async function addQuestion(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in.', success: false }

  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) return { message: 'Error validating your user profile.', success: false }

  const title = formData.get('title') as string
  const body = formData.get('body') as string
  const topicsJson = formData.get('topics') as string
  const topicIds = topicsJson ? JSON.parse(topicsJson) : []

  if (!title || title.length < 10) return { message: 'Title too short.', success: false }

  const { data: newQuestion, error } = await supabase
    .from('questions')
    .insert({ title, body, user_id: user.id })
    .select('id')
    .single()

  if (error) return { message: error.message, success: false }

  if (topicIds.length > 0 && newQuestion) {
    const topicInserts = topicIds.map((topicId: string) => ({ question_id: newQuestion.id, topic_id: topicId }))
    await supabase.from('question_topics').insert(topicInserts)
  }

  revalidatePath('/questions') 
  return { message: 'Question added successfully!', success: true }
}

export async function addPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'You must be logged in.', success: false }

  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) return { message: 'Error validating your user profile.', success: false }

  const title = formData.get('title') as string | null
  const content = formData.get('content') as string
  const topicsJson = formData.get('topics') as string
  const topicIds = topicsJson ? JSON.parse(topicsJson) : []

  if (!content) return { message: 'Content empty.', success: false }

  const { data: newPost, error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id })
    .select('id')
    .single()

  if (error) return { message: error.message, success: false }

  if (topicIds.length > 0 && newPost) {
    const topicInserts = topicIds.map((topicId: string) => ({ post_id: newPost.id, topic_id: topicId }))
    await supabase.from('post_topics').insert(topicInserts)
  }

  revalidatePath('/') 
  return { message: 'Post added successfully!', success: true }
}

// --- FOLLOW ACTIONS ---

export async function followUser(targetUserId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

  await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  revalidatePath('/')
}

export async function unfollowUser(targetUserId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
  revalidatePath('/')
}

// --- VOTE ACTIONS ---

export async function voteOnPost(postId: string, voteType: 1 | -1) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: post } = await supabase.from('posts').select('user_id').eq('id', postId).single()
  if (post && post.user_id === user.id) return 

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

  const { data: question } = await supabase.from('questions').select('user_id').eq('id', questionId).single()
  if (question && question.user_id === user.id) return 

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

// --- REPOST ACTIONS ---

export async function repostPost(targetPostId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: original } = await supabase.from('posts').select('user_id').eq('id', targetPostId).single()
  if (original && original.user_id === user.id) return { error: 'Cannot repost own post' }

  const { data: existing } = await supabase.from('posts')
    .select('id')
    .eq('user_id', user.id)
    .eq('original_post_id', targetPostId)
    .single()

  if (existing) {
      await supabase.from('posts').delete().eq('id', existing.id)
  } else {
      await supabase.from('posts').insert({
        user_id: user.id,
        original_post_id: targetPostId,
        content: '' 
      })
  }
  revalidatePath('/')
}

export async function repostQuestion(targetQuestionId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: original } = await supabase.from('questions').select('user_id').eq('id', targetQuestionId).single()
  if (original && original.user_id === user.id) return { error: 'Cannot repost own question' }

  const { data: existing } = await supabase.from('posts')
    .select('id')
    .eq('user_id', user.id)
    .eq('original_question_id', targetQuestionId)
    .single()

  if (existing) {
      await supabase.from('posts').delete().eq('id', existing.id)
  } else {
      await supabase.from('posts').insert({
        user_id: user.id,
        original_question_id: targetQuestionId,
        content: ''
      })
  }
  revalidatePath('/questions')
}

export async function removeRepostPost(postId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: wrapper } = await supabase.from('posts').select('id').eq('user_id', user.id).eq('original_post_id', postId).single()
  if(wrapper) await supabase.from('posts').delete().eq('id', wrapper.id)
  revalidatePath('/')
}

export async function removeRepostQuestion(questionId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const { data: wrapper } = await supabase.from('posts').select('id').eq('user_id', user.id).eq('original_question_id', questionId).single()
  if(wrapper) await supabase.from('posts').delete().eq('id', wrapper.id)
  revalidatePath('/questions')
}

// --- EDIT/DELETE ACTIONS ---
export async function deletePost(postId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase.from('posts').delete().eq('id', postId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/')
  return { success: true }
}

export async function editPost(postId: string, title: string | null, content: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase.from('posts').update({ title, content }).eq('id', postId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/')
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase.from('questions').delete().eq('id', questionId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/questions')
  return { success: true }
}

export async function editQuestion(questionId: string, title: string, body: string | null) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }
  const { error } = await supabase.from('questions').update({ title, body }).eq('id', questionId).eq('user_id', user.id)
  if (error) return { success: false, message: error.message }
  revalidatePath('/questions')
  revalidatePath(`/questions/${questionId}`)
  return { success: true }
}

// --- NEW PROFILE ACTION (With Avatar Support) ---
export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', success: false }

  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const website = formData.get('website') as string
  const avatarFile = formData.get('avatar') as File

  let avatarUrl = null

  // Handle Avatar Upload if a new file is provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

    if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        return { message: 'Failed to upload image.', success: false }
    }

    // Get Public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    avatarUrl = urlData.publicUrl
  }

  // Prepare update object
  const updates: any = { full_name: fullName, bio, website }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
      console.error("Update profile error:", error)
      return { message: error.message, success: false }
  }

  // Revalidate all pages to show new avatar
  revalidatePath('/', 'layout')
  return { message: 'Profile updated successfully!', success: true }
}