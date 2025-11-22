import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ArrowBigUp, ArrowBigDown, Share2, MessageSquare } from 'lucide-react'

// Force dynamic rendering 
export const revalidate = 0;

// Internal type for the Post fetched from DB
interface Post {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
}

type PageProps = {
  params: Promise<{ id: string }>
}

// Simple placeholder translation function for Server Components
const t = (en: string, bal: string) => en; 

export default async function PostPage(props: PageProps) {
  
  // 1. Get the ID from params
  const params = await props.params;
  const { id } = params;

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 2. Fetch the Post with profile details
  const { data: postRaw, error: pError } = await supabase
    .from('posts')
    .select(`
      id, title, content, created_at,
      profiles ( username )
    `)
    .eq('id', id)
    .single()

  if (pError || !postRaw) {
    console.error("Error fetching post:", pError);
    return notFound()
  }
  const post = postRaw as unknown as Post;

  // Formatting helpers
  const authorName = post.profiles?.username || t('Anonymous', 'Bēnām') 
  const avatarLetter = authorName.charAt(0).toUpperCase()
  const postDate = new Date(post.created_at).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric' 
  });


  return (
    // Set base direction to RTL to accommodate Balochi primary usage
    <div className="max-w-4xl mx-auto pb-20" dir="rtl"> 
      
      {/* --- POST CARD --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-8">
        
        {/* Author Header */}
        <div className="flex items-center gap-3 mb-4 rtl:space-x-reverse">
           <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
             {avatarLetter}
           </div>
           <div className="flex flex-col text-start">
             <span className="font-bold text-gray-900">{authorName}</span>
             <span className="text-xs text-gray-500">
               {t('Posted on', 'Pah Tārīx-e Navīšt')} {postDate} 
             </span>
           </div>
        </div>

        {/* Post Title (optional) */}
        {post.title && (
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4 text-start leading-tight" dir="auto">
                {post.title}
            </h1>
        )}

        {/* Post Body/Content */}
        <div className={`text-lg text-gray-700 leading-relaxed text-start whitespace-pre-wrap mb-6 ${!post.title ? 'mt-4' : ''}`} dir="auto">
          {post.content}
        </div>

        {/* Action Bar (Simplified for posts) */}
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
           
           {/* Share */}
           <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">
             <Share2 className="w-5 h-5" />
             <span className="text-sm font-medium">{t('Share', 'Šarīk Kan')}</span>
           </button>
           
           {/* Placeholder for Comments (Future feature) */}
           <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">
             <MessageSquare className="w-5 h-5" />
             <span className="text-sm font-medium">{t('Comment', 'Nōt')}</span>
           </button>
        </div>
      </div>
      
      {/* Since posts don't have answers, we stop here */}
      <div className="text-center py-8 text-gray-500">
        <p>*** {t('End of post content', 'Pāyān-e Navīšta')} ***</p>
      </div>

    </div>
  )
}