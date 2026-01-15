import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import FeedItem, { type Post } from '@/components/FeedItem'
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'
import { Hash } from 'lucide-react'
import TopicFollowButton from '@/components/TopicFollowButton' 


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

  
  const { data: { user } } = await supabase.auth.getUser()

  
  const { data: topic } = await supabase
    .from('topics')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!topic) {
    return notFound()
  }

  
  let isFollowing = false
  if (user) {
    const { data: followData } = await supabase
        .from('topic_follows')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic_id', topic.id)
        .single()
    
    isFollowing = !!followData
  }

  
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, created_at, title, content, user_id,
      profiles ( username, avatar_url ), 
      comments ( id ), 
      post_votes ( user_id, vote_type ),
      reposts ( user_id ),
      post_topics!inner ( topic_id )
    `)
    .eq('post_topics.topic_id', topic.id)
    .order('created_at', { ascending: false })

  
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id, created_at, title, body, user_id,
      profiles ( username, avatar_url ),
      question_votes ( user_id, vote_type ),
      reposts ( user_id ),
      question_topics!inner ( topic_id )
    `)
    .eq('question_topics.topic_id', topic.id)
    .order('created_at', { ascending: false })

  const hasResults = (posts && posts.length > 0) || (questions && questions.length > 0)

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm mb-6 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {topic.name}
        </h1>
        
        
        <div className="mt-4">
            <TopicFollowButton topicId={topic.id} initialIsFollowing={isFollowing} />
        </div>
      </div>

      
      <div className="space-y-6">
        {!hasResults ? (
           <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">{t('No posts in this topic yet.', 'Angat hēč post nēst.')}</p>
           </div>
        ) : (
          <>
            {questions && questions.map((q) => (
                <QuestionItem key={q.id} question={q as unknown as QuestionWithProfile} />
            ))}

            {posts && posts.map((p) => (
                <FeedItem key={p.id} post={p as unknown as Post} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}