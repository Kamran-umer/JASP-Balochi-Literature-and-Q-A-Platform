'use client'

import Link from 'next/link'
import { User, MessageSquare, Heart } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

type Notification = {
  id: string
  created_at: string
  type: 'follow' | 'comment' | 'post_vote' | 'question_vote'
  actor: {
    username: string
  }
  reference_id?: string
  is_read: boolean
}

export default function NotificationItem({ notification }: { notification: Notification }) {
  const { t } = useLanguage()
  const { type, actor, created_at, reference_id, is_read } = notification
  const time = new Date(created_at).toLocaleDateString()

  let icon = <User size={20} className="text-blue-500" />
  let message = ''
  let href = '#'

  
  switch (type) {
    case 'follow':
      icon = <User size={20} className="text-blue-500" />
      message = `${actor.username} ${t('started following you', 'tara pērawi kanagā int')}`
      href = `/profile/${actor.username}`
      break
    case 'comment':
      icon = <MessageSquare size={20} className="text-green-500" />
      message = `${actor.username} ${t('commented on your post', 'tai post-ay sarā nōt dāt')}`
      href = `/posts/${reference_id}`
      break
    case 'post_vote':
    case 'question_vote':
      icon = <Heart size={20} className="text-red-500" />
      message = `${actor.username} ${t('liked your post', 'tai post-a pasand kut')}`
      href = `/posts/${reference_id}`
      break
  }

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition-colors ${!is_read ? 'bg-blue-50' : 'bg-white'}`}
    >
      <div className="p-2 bg-white rounded-full border shadow-sm shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-bold">{actor.username}</span> {message.replace(actor.username, '')}
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      {!is_read && (
        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" title="Unread"></div>
      )}
    </Link>
  )
}