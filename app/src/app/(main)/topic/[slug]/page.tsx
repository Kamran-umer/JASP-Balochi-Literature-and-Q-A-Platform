import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import FeedItem, { type Post } from '@/components/FeedItem'
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'
import { Hash } from 'lucide-react'

// Translation helper
const t = (en: string, bal: string) => en;

export const revalidate = 0;

type TopicPageProps = {
  params: Promise<{ slug: string }>
}

export default async function TopicPage(props: TopicPageProps) {
  const params = await props.params;
  const { slug } = params;
  
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Get the Topic ID from the slug
  const { data: topic } = await supabase
    .from('topics')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!topic) {
    return notFound()
  }

  // 2. Get Posts linked to this topic
  // We use !inner to filter posts that HAVE an entry in post_topics for this topic_id
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, created_at, title, content, user_id,
      profiles ( username ),
      comments ( id ), 
      post_votes ( user_id, vote_type ),
      reposts ( user_id ),
      post_topics!inner ( topic_id )
    `)
    .eq('post_topics.topic_id', topic.id)
    .order('created_at', { ascending: false })

  // 3. Get Questions linked to this topic
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id, created_at, title, body, user_id,
      profiles ( username ),
      question_votes ( user_id, vote_type ),
      reposts ( user_id ),
      question_topics!inner ( topic_id )
    `)
    .eq('question_topics.topic_id', topic.id)
    .order('created_at', { ascending: false })

  const hasResults = (posts && posts.length > 0) || (questions && questions.length > 0)

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* Topic Header */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm mb-6 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {topic.name}
        </h1>
        <button className="text-sm font-medium text-white bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700 transition-colors">
            {t('Follow Topic', 'Topik Pēraw Kan')}
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {!hasResults ? (
           <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">{t('No posts in this topic yet.', 'Angat hēč post nēst.')}</p>
           </div>
        ) : (
          <>
            {/* Render Questions */}
            {questions && questions.map((q) => (
                <QuestionItem key={q.id} question={q as unknown as QuestionWithProfile} />
            ))}

            {/* Render Posts */}
            {posts && posts.map((p) => (
                <FeedItem key={p.id} post={p as unknown as Post} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}