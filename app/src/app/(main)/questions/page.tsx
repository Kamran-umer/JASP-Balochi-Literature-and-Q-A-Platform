import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export const revalidate = 0

export default async function QuestionsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id, created_at, title, body, user_id,
      profiles ( username ),
      question_votes ( user_id, vote_type ),
      reposts ( user_id )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  if (questionsError) return <div className="p-10 text-center text-red-600">Error</div>
  const questions = questionsData as unknown as QuestionWithProfile[]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6"><h1 className="text-2xl font-bold text-gray-800">All Questions</h1></div>
      <div className="space-y-4">
        {questions.length > 0 ? questions.map((q) => <QuestionItem key={q.id} question={q} />) : <div className="bg-white p-6 text-center text-gray-500">No questions yet.</div>}
      </div>
    </div>
  )
}