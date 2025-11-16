import QuestionItem from '@/components/QuestionItem'
import type { QuestionWithProfile } from '@/components/QuestionItem'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// This tells Next.js to always re-fetch this page
export const revalidate = 0

export default async function QuestionsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch all questions and their author's username
  const { data: questions, error } = await supabase
    .from('questions')
    .select(`
      id,
      created_at,
      title,
      body,
      profiles ( username ) 
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching questions:', error)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Questions</h1>
      </div>

      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <QuestionItem key={question.id} question={question as QuestionWithProfile} />
          ))
        ) : (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
            No questions have been asked yet.
          </div>
        )}
      </div>
    </div>
  )
}