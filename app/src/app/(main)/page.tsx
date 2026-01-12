'use client' 

import FeedItem, { type Post } from '@/components/FeedItem' 
import { createClient } from '@/lib/supabase/Client' 
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react' 
import { useModal } from '@/context/ModalContext'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import Image from 'next/image' 

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { openModal } = useModal()

  async function getPageData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id, created_at, title, content, user_id,
        profiles ( username, avatar_url ), 
        comments ( id ), 
        post_votes ( user_id, vote_type )
      `) 
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Error fetching posts:', JSON.stringify(error, null, 2))
    } else if (data) {
      setPosts(data as unknown as Post[])
    }
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    getPageData()

    const postChannel = supabase.channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => getPageData())
      .subscribe()

    return () => {
      supabase.removeChannel(postChannel)
    }
  }, []) 

  // Helper to get avatar letter or Image
  const avatarUrl = user?.user_metadata?.avatar_url
  const getAvatarLetter = () => {
    if (user?.user_metadata?.username) return user.user_metadata.username.charAt(0).toUpperCase()
    if (user?.email) return user.email.charAt(0).toUpperCase()
    return '?'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Balochi Adab!</h1>
          <p className="text-gray-600 mt-2">
            Your hub for Balochi literature insights, discussions, and community.
          </p>
        </div>

        {/* --- FIX: Only show Input Box if User is Logged In --- */}
        {user && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                
                {avatarUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                        <Image 
                            src={avatarUrl} 
                            alt="User" 
                            fill 
                            className="object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {getAvatarLetter()}
                    </div>
                )}
                
                <input 
                  type="text" 
                  placeholder="What do you want to ask or share?"
                  className="flex-1 min-w-0 bg-gray-100 border border-gray-200 rounded-full py-3 px-4 focus:outline-none cursor-pointer hover:bg-gray-200"
                  onClick={() => openModal('post')}
                  readOnly
                />
              </div>
              
              <div className="flex justify-around mt-4 pt-3 border-t">
                <button onClick={() => openModal('question')} className="font-medium text-gray-600 hover:text-blue-600">Ask</button>
                <Link href="/questions" className="font-medium text-gray-600 hover:text-blue-600">Answer</Link>
                <button onClick={() => openModal('post')} className="font-medium text-gray-600 hover:text-blue-600">Post</button>
              </div>
            </div>
        )}
        
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
              Loading posts...
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <FeedItem key={post.id} post={post} />
            ))
          ) : (
            <div className="bg-white p-6 text-center text-gray-500">No posts yet. Be the first!</div>
          )}
        </div>
      </div>

      <aside className="hidden md:block">
        <div className="sticky top-20">
           <Sidebar />
        </div>
      </aside>
    </div>
  )
}