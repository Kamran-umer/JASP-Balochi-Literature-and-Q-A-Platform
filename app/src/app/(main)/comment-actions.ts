'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function addComment(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const content = formData.get('content') as string
  const postId = formData.get('postId') as string

  if (!content || content.trim() === '') return

  const { error } = await supabase.from('comments').insert({ content, post_id: postId, user_id: user.id })
  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function voteOnComment(commentId: string, voteType: 1 | -1) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  
  const { data: comment } = await supabase.from('comments').select('user_id').eq('id', commentId).single()
  if (comment && comment.user_id === user.id) return

  const { data: existingVote } = await supabase
    .from('comment_votes')
    .select('id, vote_type')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      await supabase.from('comment_votes').delete().eq('id', existingVote.id)
    } else {
      await supabase.from('comment_votes').update({ vote_type: voteType }).eq('id', existingVote.id)
    }
  } else {
    await supabase.from('comment_votes').insert({ user_id: user.id, comment_id: commentId, vote_type: voteType })
  }
  
  revalidatePath('/')
}

export async function deleteComment(commentId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id)
  revalidatePath('/')
}

export async function editComment(commentId: string, newContent: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  await supabase.from('comments').update({ content: newContent }).eq('id', commentId).eq('user_id', user.id)
  revalidatePath('/')
}