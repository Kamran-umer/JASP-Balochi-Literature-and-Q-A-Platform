//src\app\(main)\profile\[username]\page.tsx

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import FeedItem, { type Post } from '@/components/FeedItem'
import QuestionItem, { type QuestionWithProfile } from '@/components/QuestionItem'
import AnswerItem, { type AnswerWithProfile } from '@/components/AnswerItem'
import ProfileHeader from '@/components/ProfileHeader'
import Link from 'next/link'

export const revalidate = 0

type PageProps = {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ProfilePage(props: PageProps) {
  const { username } = await props.params
  const { tab } = await props.searchParams
  const currentTab = tab || 'posts'

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) return notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  let isFollowing = false
  if (user && !isOwner) {
    const { data: follow } = await supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', profile.id).single()
    isFollowing = !!follow
  }

  const { count: followersCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id)
  const { count: followingCount } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id)
  const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).is('original_post_id', null).is('original_question_id', null)

  let content = null

  if (currentTab === 'posts') {
    const { data: posts } = await supabase.from('posts')
      .select(`*, profiles(username, id), comments(id), post_votes(user_id, vote_type)`)
      .eq('user_id', profile.id)
      .is('original_post_id', null)
      .is('original_question_id', null)
      .order('created_at', { ascending: false })
    
    content = posts?.map(p => <FeedItem key={p.id} post={p as unknown as Post} />)
  } 
  else if (currentTab === 'questions') {
    const { data: questions } = await supabase.from('questions')
      .select(`*, profiles(username), question_votes(user_id, vote_type)`)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    content = questions?.map(q => <QuestionItem key={q.id} question={q as unknown as QuestionWithProfile} />)
  } 
  else if (currentTab === 'answers') {
    const { data: answers } = await supabase.from('answers')
      .select(`*, profiles(username)`)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })

    content = answers?.map(a => <AnswerItem key={a.id} answer={a as unknown as AnswerWithProfile} />)
  }

  const activeClass = "border-b-2 border-blue-600 text-blue-600 font-semibold"
  const inactiveClass = "text-gray-500 hover:text-gray-700 hover:bg-gray-50"

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <ProfileHeader 
        profile={profile} 
        isOwner={isOwner} 
        isFollowing={isFollowing} 
        stats={{ followers: followersCount || 0, following: followingCount || 0, posts: postsCount || 0 }}
      />
      
      {/* TABS - REPOSTS REMOVED */}
      <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-lg">
         <Link href={`/profile/${username}?tab=posts`} className={`flex-1 py-3 text-center text-sm ${currentTab === 'posts' ? activeClass : inactiveClass}`}>
            Posts
         </Link>
         <Link href={`/profile/${username}?tab=questions`} className={`flex-1 py-3 text-center text-sm ${currentTab === 'questions' ? activeClass : inactiveClass}`}>
            Questions
         </Link>
         <Link href={`/profile/${username}?tab=answers`} className={`flex-1 py-3 text-center text-sm ${currentTab === 'answers' ? activeClass : inactiveClass}`}>
            Answers
         </Link>
      </div>

      <div className="space-y-4">
        {content && content.length > 0 ? content : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                No {currentTab} yet.
            </div>
        )}
      </div>
    </div>
  )
}