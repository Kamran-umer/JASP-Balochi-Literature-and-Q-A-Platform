'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function addAnswer(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)


  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 
  }

  const content = formData.get('content') as string
  const questionId = formData.get('question_id') as string

  if (!content || content.trim().length === 0) return

  const { error } = await supabase
    .from('answers')
    .insert({
      content: content,
      question_id: questionId,
      user_id: user.id
    })

  if (error) {
    console.error('Error adding answer:', error)
  } else {
    revalidatePath(`/questions/${questionId}`)
  }
}