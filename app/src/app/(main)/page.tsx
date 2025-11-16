'use client' 

import FeedItem, { type Post } from '@/components/FeedItem' 
import { createClient } from '@/lib/supabase/Client' 
import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react' 
import { useModal } from '@/context/ModalContext'
import Link from 'next/link'

type HomePageProps = {}

export default function HomePage({}: HomePageProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { openModal } = useModal()

  useEffect(() => {
    const supabase = createClient()
    
    async function getPageData() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          created_at,
          title,     
          content, 
          profiles ( username ) 
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching posts:', error)
      } else if (data) {
        setPosts(data as Post[])
      }
      setLoading(false)
    }

    getPageData()

    const channel = supabase
      .channel('realtime_posts') 
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' }, 
        (payload) => {
          getPageData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }

  }, []) 

  const getAvatarLetter = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return '?'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main Feed Content (Left/Center) */}
      <div className="md:col-span-2">
        {/* Welcome Box */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Balochi Adab!</h1>
          <p className="text-gray-600 mt-2">
            Your hub for Balochi literature insights, discussions, and community.
            Discover, share, and connect with fellow enthusiasts.
          </p>
        </div>

        {/* Ask/Share Box */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
              {getAvatarLetter()}
            </div>
            {/* 1. THIS IS THE UPGRADE */}
            <input 
              type="text" 
              placeholder="What do you want to ask or share?"
              className="flex-1 bg-gray-100 border border-gray-200 rounded-full py-3 px-4 focus:outline-none cursor-pointer hover:bg-gray-200"
              // This input will default to opening the 'post' tab
              onClick={() => openModal('post')}
              readOnly
            />
          </div>
          
          {/* 2. THIS IS THE UPGRADE */}
          <div className="flex justify-around mt-4 pt-3 border-t">
            {/* "Ask" opens the 'question' tab */}
            <button onClick={() => openModal('question')} className="font-medium text-gray-600 hover:text-blue-600">
              Ask
            </button>
            
            {/* "Answer" is a Link */}
            <Link href="/questions" className="font-medium text-gray-600 hover:text-blue-600">
              Answer
            </Link>
            
            {/* "Post" opens the 'post' tab */}
            <button onClick={() => openModal('post')} className="font-medium text-gray-600 hover:text-blue-600">
              Post
            </button>
          </div>
        </div>
        
        {/* === THE REAL POSTS FEED === */}
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
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center text-gray-500">
              No posts yet. Be the first!
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (Placeholder) */}
      <aside className="hidden md:block">
        <div className="sticky top-20 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="font-semibold">Topics to follow</h3>
        </div>
      </aside>
    </div>
  )
}