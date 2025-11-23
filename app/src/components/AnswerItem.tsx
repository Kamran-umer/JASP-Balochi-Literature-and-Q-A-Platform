'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2, User } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext' // Import language hook

// Define the exact shape of data we will fetch (now only fetching username)
export type AnswerWithProfile = {
  id: string
  created_at: string
  content: string
  profiles: {
    username: string | null
    // full_name?: string | null // REMOVED
    // avatar_url?: string | null // REMOVED
  } | null
}

type AnswerItemProps = {
  answer: AnswerWithProfile
}

export default function AnswerItem({ answer }: AnswerItemProps) {
  const { t, direction } = useLanguage() // Get translation and direction
  
  // Now relies solely on username
  const username = answer.profiles?.username || t('Anonymous', 'Bēnām') 
  const avatarLetter = username.charAt(0).toUpperCase()
  
  // Format date nicely
  const postDate = new Date(answer.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow" dir={direction}>
      <div className="flex items-start gap-4 rtl:space-x-reverse">
        
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1">
          <button className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <ArrowBigUp className="w-8 h-8" />
          </button>
          <span className="font-bold text-gray-700 text-lg">0</span>
          <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
            <ArrowBigDown className="w-8 h-8" />
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Header: Author Info */}
          <div className="flex items-center gap-2 mb-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
              {/* Avatar rendering now uses only the initial letter */}
              {avatarLetter}
            </div>
            <div className="flex flex-col leading-tight text-start">
              <span className="font-semibold text-gray-900 text-sm">{username}</span>
              <span className="text-xs text-gray-500">{t('Answered on', 'Jawāb Dād Āhārā')} {postDate}</span> 
            </div>
          </div>

          {/* Body Content */}
          <div className="text-gray-800 text-base leading-relaxed text-start whitespace-pre-wrap mb-4" dir="auto">
            {answer.content}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
              <span>{t('Reply', 'Jawāb')}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>{t('Share', 'Šarīk Kan')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}