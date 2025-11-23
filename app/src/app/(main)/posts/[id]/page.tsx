import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import CommentSection from '@/components/CommentSection'
import FeedItem, { type Post } from '@/components/FeedItem' 

export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PostPage(props: PageProps) {
  
  const params = await props.params;
  const { id } = params;

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch the Post
  const { data: postRaw, error: pError } = await supabase
    .from('posts')
    .select(`
      id, title, content, created_at, user_id,
      profiles ( username ),
      comments ( count )
    `)
    .eq('id', id)
    .single()

  // 2. Improved Error Handling (Ignores "Not Found" errors)
  if (pError || !postRaw) {
    if (pError?.code !== 'PGRST116') {
        console.error("Error fetching post:", pError?.message || pError);
    }
    return notFound()
  }
  
  const post = postRaw as unknown as Post;

  return (
    <div className="max-w-4xl mx-auto pb-20"> 
      
      {/* Use FeedItem in Detail View Mode */}
      <div className="mb-8">
        <FeedItem post={post} isDetailView={true} />
      </div>
      
      {/* Comment Section */}
      <div className="w-full">
         <CommentSection 
            parentId={post.id} 
            parentType='post' 
            initialOpen={true} 
         />
      </div>
    </div>
  )
}