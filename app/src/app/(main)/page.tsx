'use client' 

import FeedItem, { type Post } from '@/components/FeedItem' 
import { createClient } from '@/lib/supabase/Client' 
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react' 
import { useModal } from '@/context/ModalContext'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { Repeat2 } from 'lucide-react'

type FeedEntry = {
  type: 'original' | 'repost'
  sortDate: string
  reposterName?: string
  postData: Post
}

type RawProfile = { username: string } | null | Array<{ username: string }>

export default function HomePage() {
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { openModal } = useModal()

  // Extracted fetch logic so it can be reused
  async function getPageData() {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    // 1. Fetch Original Posts
    const { data: postsData } = await supabase
      .from('posts')
      .select(`
        id, created_at, title, content, user_id,
        profiles ( username ),
        comments ( id ), 
        post_votes ( user_id, vote_type ),
        reposts ( user_id )
      `) 
      .order('created_at', { ascending: false })
      .limit(20)

    // 2. Fetch Reposts
    const { data: repostsData } = await supabase
      .from('reposts')
      .select(`
        id, created_at, user_id,
        profiles ( username ),
        posts (
          id, created_at, title, content, user_id,
          profiles ( username ),
          comments ( id ), 
          post_votes ( user_id, vote_type ),
          reposts ( user_id )
        )
      `)
      .not('post_id', 'is', null) 
      .order('created_at', { ascending: false })
      .limit(20)

    // 3. Merge & Transform Data
    const originalFeed: FeedEntry[] = (postsData || []).map(p => ({
      type: 'original' as const,
      sortDate: p.created_at,
      postData: p as unknown as Post
    }))

    const repostFeed: FeedEntry[] = (repostsData || []).map(r => {
      const profileData = r.profiles as unknown as RawProfile
      let reposterName = 'Unknown'
      
      if (Array.isArray(profileData)) {
          reposterName = profileData[0]?.username || 'Unknown'
      } else if (profileData) {
          reposterName = profileData.username
      }

      return {
          type: 'repost' as const,
          sortDate: r.created_at,
          reposterName: reposterName,
          postData: r.posts as unknown as Post
      }
    }).filter(item => item.postData !== null)

    const combinedFeed = [...originalFeed, ...repostFeed].sort((a, b) => 
      new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    )

    setFeed(combinedFeed)
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    getPageData()

    const postChannel = supabase.channel('public:posts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => getPageData()).subscribe()
    const repostChannel = supabase.channel('public:reposts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reposts' }, () => getPageData()).subscribe()

    return () => {
      supabase.removeChannel(postChannel)
      supabase.removeChannel(repostChannel)
    }
  }, []) 

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

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
              {getAvatarLetter()}
            </div>
            <input 
              type="text" 
              placeholder="What do you want to ask or share?"
              className="flex-1 bg-gray-100 border border-gray-200 rounded-full py-3 px-4 focus:outline-none cursor-pointer hover:bg-gray-200"
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
        
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
              Loading posts...
            </div>
          ) : feed.length > 0 ? (
            feed.map((entry) => (
              <div key={`${entry.type}-${entry.postData.id}-${entry.sortDate}`}>
                {entry.type === 'repost' && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1 px-2">
                    <Repeat2 size={12} className="text-green-600" />
                    <span className="font-semibold">{entry.reposterName}</span> reposted
                  </div>
                )}
                
                <FeedItem 
                  post={entry.postData} 
                  onRepostSuccess={getPageData} // FIX: Pass refresh function here
                />
              </div>
            ))
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
              No posts yet. Be the first!
            </div>
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