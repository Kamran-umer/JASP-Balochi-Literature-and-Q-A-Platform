import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import FeedItem, { type Post } from '@/components/FeedItem'
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'
import { Search } from 'lucide-react'

// Translation helper
const t = (en: string, bal: string) => en;

export const revalidate = 0;

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Search Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      id, created_at, title, content, user_id,
      profiles ( username ),
      comments ( id ), 
      post_votes ( user_id, vote_type ),
      reposts ( user_id )
    `)
    .ilike('content', `%${query}%`) // Simple case-insensitive search
    .order('created_at', { ascending: false })
    .limit(10)

  // 2. Search Questions
  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id, created_at, title, body, user_id,
      profiles ( username ),
      question_votes ( user_id, vote_type ),
      reposts ( user_id )
    `)
    .ilike('title', `%${query}%`) // Search title for questions
    .order('created_at', { ascending: false })
    .limit(10)

  const hasResults = (posts && posts.length > 0) || (questions && questions.length > 0)

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* Search Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Search className="text-blue-600" />
          {t('Search Results for', 'Šojīn Pahl')}: <span className="text-blue-600">"{query}"</span>
        </h1>
      </div>

      {/* Results Feed */}
      <div className="space-y-6">
        {!hasResults ? (
           <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
             <p className="text-gray-500">{t('No results found.', 'Hēč pahl na būt.')}</p>
             <p className="text-sm text-gray-400">{t('Try different keywords.', 'Diga labzān kārmaz kan.')}</p>
           </div>
        ) : (
          <>
            {/* Render Questions First */}
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