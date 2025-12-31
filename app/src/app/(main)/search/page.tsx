import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { User, MessageSquare, FileText, Search } from 'lucide-react'
import FeedItem, { type Post } from '@/components/FeedItem'
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'

export const revalidate = 0

type SearchPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || ''
  // Default to 'all', but can be 'posts', 'questions', or 'people'
  const type = searchParams.type || 'all' 
  
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. SEARCH PEOPLE (Users)
  const { data: people } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(5)

  // 2. SEARCH POSTS (Title OR Content)
  // Only run if there is a query, or return empty if you prefer not to show everything
  const { data: postsRaw } = await supabase
    .from('posts')
    .select(`
        id, created_at, title, content, user_id,
        profiles ( username, id ),
        comments ( id ), 
        post_votes ( user_id, vote_type )
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`) 
    .order('created_at', { ascending: false })
    .limit(20)
  
  // 3. SEARCH QUESTIONS (Title OR Body)
  const { data: questionsRaw } = await supabase
    .from('questions')
    .select(`
        id, created_at, title, body, user_id,
        profiles ( username ),
        question_votes ( user_id, vote_type )
    `)
    .or(`title.ilike.%${query}%,body.ilike.%${query}%`) 
    .order('created_at', { ascending: false })
    .limit(20)

  // Cast types
  const posts = (postsRaw || []) as unknown as Post[]
  const questions = (questionsRaw || []) as unknown as QuestionWithProfile[]

  // Calculate counts for tabs
  const peopleCount = people?.length || 0
  const postsCount = posts.length
  const questionsCount = questions.length

  const hasResults = peopleCount > 0 || postsCount > 0 || questionsCount > 0

  return (
    <div className="max-w-2xl mx-auto pb-20">
      
      {/* Search Header & Tabs */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-16 z-10">
        
        {/* NEW: SEARCH INPUT FORM */}
        <form action="/search" method="get" className="relative mb-4">
            <input 
                type="text" 
                name="q"
                defaultValue={query}
                placeholder="Search JASP..." 
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                autoFocus={!query} // Automatically open keyboard on mobile if query is empty
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input type="hidden" name="type" value={type} />
        </form>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mt-2 text-sm font-medium text-gray-500 overflow-x-auto no-scrollbar">
            <Link 
                href={`/search?q=${query}&type=all`} 
                className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${type === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
            >
                All
            </Link>
            <Link 
                href={`/search?q=${query}&type=posts`} 
                className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${type === 'posts' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
            >
                Posts ({postsCount})
            </Link>
            <Link 
                href={`/search?q=${query}&type=questions`} 
                className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${type === 'questions' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
            >
                Questions ({questionsCount})
            </Link>
            <Link 
                href={`/search?q=${query}&type=people`} 
                className={`pb-2 border-b-2 transition-colors whitespace-nowrap ${type === 'people' ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-gray-700'}`}
            >
                People ({peopleCount})
            </Link>
        </div>
      </div>

      <div className="space-y-6 p-4">
        
        {/* 1. PEOPLE RESULTS */}
        {(type === 'all' || type === 'people') && people && people.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                    <User size={18} /> People
                </div>
                {people.map(person => (
                    <Link key={person.id} href={`/profile/${person.username}`} className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-none transition-colors">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                            {person.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{person.username}</p>
                            <p className="text-xs text-gray-500 truncate w-48">{person.bio || 'No bio yet'}</p>
                        </div>
                    </Link>
                ))}
            </div>
        )}

        {/* 2. POST RESULTS */}
        {(type === 'all' || type === 'posts') && posts.length > 0 && (
            <div className="space-y-4">
                 {type === 'all' && <h3 className="font-bold text-gray-600 flex items-center gap-2 px-1"><FileText size={18} /> Posts</h3>}
                 {posts.map(post => (
                     <FeedItem key={post.id} post={post} />
                 ))}
            </div>
        )}

        {/* 3. QUESTION RESULTS */}
        {(type === 'all' || type === 'questions') && questions.length > 0 && (
            <div className="space-y-4">
                 {type === 'all' && <h3 className="font-bold text-gray-600 flex items-center gap-2 px-1"><MessageSquare size={18} /> Questions</h3>}
                 {questions.map(q => (
                     <QuestionItem key={q.id} question={q} />
                 ))}
            </div>
        )}

        {/* NO RESULTS STATE */}
        {!hasResults && query && (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No results found for "{query}"</p>
                <p className="text-gray-400 text-sm">Try checking your spelling or using different keywords.</p>
            </div>
        )}
        
        {!hasResults && !query && (
            <div className="text-center py-12 text-gray-400">
                Type something above to search.
            </div>
        )}

      </div>
    </div>
  )
}