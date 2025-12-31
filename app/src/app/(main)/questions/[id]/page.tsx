import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import AnswerItem, { type AnswerWithProfile } from '@/components/AnswerItem'
import AddAnswerForm from '@/components/AddAnswerForm' 
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'

const t = (en: string, bal: string) => en; 
export const revalidate = 0;
type PageProps = { params: Promise<{ id: string }> }

export default async function QuestionPage(props: PageProps) {
  const { id } = await props.params;
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch Question
  const { data: questionRaw, error: qError } = await supabase
    .from('questions')
    .select(`
      id, title, body, created_at, user_id,
      profiles ( username ),
      question_votes ( user_id, vote_type )
    `)
    .eq('id', id)
    .single()

  if (qError || !questionRaw) return notFound()
  const question = questionRaw as unknown as QuestionWithProfile;

  // 2. Fetch Answers (UPDATED QUERY)
  const { data: answersRaw } = await supabase
    .from('answers')
    .select(`
        id, content, created_at, user_id,
        profiles ( username ),
        answer_votes ( user_id, vote_type ) 
    `)
    .eq('question_id', id)
    .order('created_at', { ascending: true })

  const answers = (answersRaw || []) as unknown as AnswerWithProfile[]

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === question.user_id

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4" dir="rtl"> 
      <div className="mb-8 mt-6">
         <QuestionItem question={question} isDetailView={true} />
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-1 text-start">
            {answers.length} {t('Answers', 'Jawāb')}
        </h2>
        
        {/* Add Answer Form */}
        <div className="mb-8">
          {user ? (
              isOwner ? (
                <div className="p-4 bg-gray-50 text-gray-500 text-center italic rounded-lg border">
                    {t("You cannot answer your own question.", "To wati sawāl-a jawāb dāth na kanay.")}
                </div>
              ) : (
                <AddAnswerForm questionId={question.id} />
              )
          ) : (
             <div className="p-4 bg-blue-50 text-center rounded-lg">
                Please log in to answer.
             </div>
          )}
        </div>

        {/* Answer List */}
        <div className="space-y-4">
          {answers.length > 0 ? (
              answers.map((ans) => <AnswerItem key={ans.id} answer={ans} />)
          ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-500">No answers yet. Be the first!</p>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}