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


async function sendContentNotifications(
  supabase: any,
  actorId: string,
  contentId: string,
  contentType: 'new_post' | 'new_question',
  topicIds: string[] = []
) {
  const recipients = new Set<string>();

  
  const { data: userFollowers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', actorId);

  if (userFollowers) {
    userFollowers.forEach((f: any) => recipients.add(f.follower_id));
  }

  
  if (topicIds.length > 0) {
    const { data: topicFollowers } = await supabase
      .from('topic_follows')
      .select('user_id')
      .in('topic_id', topicIds);

    if (topicFollowers) {
      topicFollowers.forEach((t: any) => recipients.add(t.user_id));
    }
  }

  recipients.delete(actorId);

  if (recipients.size > 0) {
    const notifications = Array.from(recipients).map(recipientId => ({
      recipient_id: recipientId,
      sender_id: actorId,
      type: contentType,
      reference_id: contentId,
      is_read: false
    }));

    await supabase.from('notifications').insert(notifications);
  }
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

  if (newQuestion) {
    await sendContentNotifications(supabase, user.id, newQuestion.id, 'new_question', topicIds);
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

  if (newPost) {
    await sendContentNotifications(supabase, user.id, newPost.id, 'new_post', topicIds);
  }

  revalidatePath('/') 
  return { message: 'Post added successfully!', success: true }
}



export async function addAnswer(formData: FormData) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized' }

  const content = formData.get('content') as string
  const questionId = formData.get('question_id') as string

  if (!content) return

  await supabase.from('answers').insert({
    content,
    question_id: questionId,
    user_id: user.id
  })

  revalidatePath(`/questions/${questionId}`)
}

export async function voteOnAnswer(answerId: string, voteType: 1 | -1) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: answer } = await supabase.from('answers').select('user_id, question_id').eq('id', answerId).single()
  if (answer && answer.user_id === user.id) return

  const { data: existingVote } = await supabase
    .from('answer_votes')
    .select('id, vote_type')
    .eq('user_id', user.id)
    .eq('answer_id', answerId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase.from('answer_votes').delete().eq('id', existingVote.id)
    } else {
      await supabase.from('answer_votes').update({ vote_type: voteType }).eq('id', existingVote.id)
    }
  } else {
    await supabase.from('answer_votes').insert({ user_id: user.id, answer_id: answerId, vote_type: voteType })
  }
  
  revalidatePath(`/questions/${answer?.question_id}`)
}


export async function followUser(targetUserId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

  await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId })
  
  await supabase.from('notifications').insert({
      recipient_id: targetUserId,
      sender_id: user.id,
      type: 'follow',
      reference_id: user.id,
      is_read: false
  })

  revalidatePath('/')
}

export async function unfollowUser(targetUserId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId)
  revalidatePath('/')
}



export async function followTopic(topicId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not logged in' }

  const { error } = await supabase
    .from('topic_follows')
    .insert({ user_id: user.id, topic_id: topicId })

  if (error) return { success: false, message: error.message }
  
  revalidatePath(`/topic/[slug]`, 'page') 
  return { success: true }
}

export async function unfollowTopic(topicId: string) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Not logged in' }

  const { error } = await supabase
    .from('topic_follows')
    .delete()
    .eq('user_id', user.id)
    .eq('topic_id', topicId)

  if (error) return { success: false, message: error.message }

  revalidatePath(`/topic/[slug]`, 'page')
  return { success: true }
}



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



export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', success: false }

  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const website = formData.get('website') as string
  const avatarFile = formData.get('avatar') as File

  let avatarUrl = null

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile)

    if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        return { message: 'Failed to upload image.', success: false }
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
    avatarUrl = urlData.publicUrl
  }

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


  if (avatarUrl) {
    await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    })
  }

  revalidatePath('/', 'layout')
  return { message: 'Profile updated successfully!', success: true }
}



export async function markNotificationsAsRead() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)
  
  revalidatePath('/notifications')
  revalidatePath('/', 'layout') 
}