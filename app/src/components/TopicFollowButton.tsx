'use client'

import { useState } from 'react'
import { followTopic, unfollowTopic } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'

export default function TopicFollowButton({ topicId, initialIsFollowing }: { topicId: string, initialIsFollowing: boolean }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    if (isFollowing) {
        await unfollowTopic(topicId)
        setIsFollowing(false)
    } else {
        await followTopic(topicId)
        setIsFollowing(true)
    }
    setLoading(false)
    router.refresh() 
  }

  return (
    <button 
        onClick={handleToggle}
        disabled={loading}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
            isFollowing 
            ? 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
    >
        {loading ? '...' : (isFollowing ? 'Following' : 'Follow Topic')}
    </button>
  )
}