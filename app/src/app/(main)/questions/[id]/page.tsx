import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2 } from 'lucide-react'
import AnswerItem, { type AnswerWithProfile } from '@/components/AnswerItem'
import AddAnswerForm from '@/components/AddAnswerForm' 
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'

const t = (en: string, bal: string) => en; 

export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function QuestionPage(props: PageProps) {
  
  const params = await props.params;
  const { id } = params;

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch the Question
  const { data: questionRaw, error: qError } = await supabase
    .from('questions')
    .select(`
      id, title, body, created_at, user_id,
      profiles ( username )
    `)
    .eq('id', id)
    .single()

  // Improved Error Handling
  if (qError || !questionRaw) {
    // PGRST116 is the code for "No rows found" (404)
    if (qError?.code !== 'PGRST116') {
        console.error("Error fetching question:", qError?.message || qError);
    }
    return notFound()
  }
  
  const question = questionRaw as unknown as QuestionWithProfile;

  // 2. Fetch the Answers
  const { data: answersRaw, error: aError } = await supabase
    .from('answers')
    .select(`
      id, content, created_at,
      profiles ( username )
    `)
    .eq('question_id', id)
    .order('created_at', { ascending: true })

  const answers = (answersRaw || []) as unknown as AnswerWithProfile[]

  return (
    <div className="max-w-4xl mx-auto pb-20" dir="rtl"> 
      
      {/* Use QuestionItem in Detail View Mode */}
      <div className="mb-8">
        <QuestionItem question={question} isDetailView={true} />
      </div>

      {/* --- ANSWERS SECTION --- */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-1 text-start">
          {answers.length} {t('Answers', 'Jawāb')}
        </h2>

        <div className="mb-8">
          <AddAnswerForm questionId={question.id} />
        </div>

        <div className="space-y-4">
          {answers.length > 0 ? (
            answers.map((answer) => (
              <AnswerItem key={answer.id} answer={answer} /> 
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">{t('No answers yet.', 'Hēč Jawāb-ē Nēst.')}</p>
              <p className="text-gray-400 text-sm">{t('Be the first to answer this question!', 'Yakemē Bēw ke pah ē pōrsā Jawāb Dēw!')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}