import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowBigUp, ArrowBigDown, MessageSquare, Share2 } from 'lucide-react'
import AnswerItem, { type AnswerWithProfile } from '@/components/AnswerItem'

// Note: useLanguage hook cannot be used directly in Server Components,
// so we'll use a simplified translation function that defaults to English (as required by current context).
// The client-side AnswerItem handles dynamic translation.
const t = (en: string, bal: string) => en; 

// Force dynamic rendering so we always see new answers
export const revalidate = 0;

// Internal type for the Question fetched from DB - UPDATED to remove full_name/avatar_url
interface Question {
  id: string;
  title: string;
  body: string | null;
  created_at: string;
  profiles: {
    username: string | null;
    // full_name: string | null; // REMOVED
    // avatar_url: string | null; // REMOVED
  } | null;
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function QuestionPage(props: PageProps) {
  
  // 1. Get the ID from params
  const params = await props.params;
  const { id } = params;

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 2. Fetch the Question with profile details - UPDATED QUERY
  const { data: questionRaw, error: qError } = await supabase
    .from('questions')
    .select(`
      id, title, body, created_at,
      profiles ( username )
    `)
    .eq('id', id)
    .single()

  if (qError || !questionRaw) {
    // If the question is not found or fails to load, show 404
    console.error("Error fetching question:", qError);
    return notFound()
  }
  const question = questionRaw as unknown as Question;

  // 3. Fetch the Answers related to this question - UPDATED QUERY
  const { data: answersRaw, error: aError } = await supabase
    .from('answers')
    .select(`
      id, content, created_at,
      profiles ( username )
    `)
    .eq('question_id', id)
    .order('created_at', { ascending: true }) // Sort oldest first

  const answers = (answersRaw || []) as unknown as AnswerWithProfile[]

  // Formatting helpers
  const authorName = question.profiles?.username || t('Anonymous', 'Bēnām') 
  const avatarLetter = authorName.charAt(0).toUpperCase()
  const postDate = new Date(question.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });


  return (
    // Set base direction to RTL to accommodate Balochi primary usage
    <div className="max-w-4xl mx-auto pb-20" dir="rtl"> 
      
      {/* --- QUESTION CARD --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-8">
        
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-4 rtl:space-x-reverse">
           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
             {avatarLetter}
           </div>
           <div className="flex flex-col text-start">
             <span className="font-bold text-gray-900">{authorName}</span>
             <span className="text-xs text-gray-500">
               {/* Note: Server component translations will always default to English for now */}
               {t('Asked on', 'Pah Tārīx-e pōrsīt')} {postDate} 
             </span>
           </div>
        </div>

        {/* Question Title */}
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 text-start leading-tight" dir="auto">
          {question.title}
        </h1>

        {/* Question Body */}
        {question.body && (
          <div className="text-lg text-gray-700 leading-relaxed text-start whitespace-pre-wrap mb-6" dir="auto">
            {question.body}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
           {/* Upvote */}
           <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium">
             <ArrowBigUp className="w-6 h-6" />
             <span>{t('Upvote', 'Dōst Dār')}</span>
           </button>
           {/* Downvote */}
           <button className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors">
             <ArrowBigDown className="w-6 h-6" />
           </button>
           
           <div className="flex-1"></div>
           
           {/* Answers Count */}
           <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">
             <MessageSquare className="w-5 h-5" />
             <span className="text-sm font-medium">{answers.length} {t('Answers', 'Jawāb')}</span>
           </button>
           
           {/* Share */}
           <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">
             <Share2 className="w-5 h-5" />
             <span className="text-sm font-medium">{t('Share', 'Šarīk Kan')}</span>
           </button>
        </div>
      </div>

      {/* --- ANSWERS SECTION --- */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 px-1 text-start">
          {answers.length} {t('Answers', 'Jawāb')}
        </h2>

        {/* Placeholder for "Add Answer" Form - We should create AddAnswerForm.tsx next */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-center text-sm">
            {t("AddAnswerForm Component goes here", "Jawāb-e Navīst Kan")}
          </p>
        </div>

        {/* Answer List */}
        <div className="space-y-4">
          {answers.length > 0 ? (
            answers.map((answer) => (
              // AnswerItem is a Client Component and handles dynamic language/direction switching
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