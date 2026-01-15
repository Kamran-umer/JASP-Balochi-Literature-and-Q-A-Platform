'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Share2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/Client'
import { voteOnAnswer } from '@/app/(main)/actions' 

export type AnswerWithProfile = {
  id: string
  created_at: string
  content: string
  user_id: string
  profiles: { username: string | null } | null
  answer_votes: { user_id: string; vote_type: number }[] 
}

type AnswerItemProps = {
  answer: AnswerWithProfile
}

export default function AnswerItem({ answer }: AnswerItemProps) {
  const { t, direction } = useLanguage()
  
  
  const initialUp = answer.answer_votes?.filter(v => v.vote_type === 1).length || 0
  const initialDown = answer.answer_votes?.filter(v => v.vote_type === -1).length || 0
  const [netVotes, setNetVotes] = useState(initialUp - initialDown)
  const [userVote, setUserVote] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
            setCurrentUserId(data.user.id)
            const myVote = answer.answer_votes?.find(v => v.user_id === data.user.id)?.vote_type || 0
            setUserVote(myVote)
        }
    })
  }, [answer])

  const handleVote = async (type: 1 | -1) => {
    if (!currentUserId || answer.user_id === currentUserId) return

    const previousVote = userVote
    let newVote = type === previousVote ? 0 : type
    setNetVotes(netVotes + (newVote - previousVote))
    setUserVote(newVote)

    await voteOnAnswer(answer.id, type)
  }

  const username = answer.profiles?.username || t('Anonymous', 'Bēnām') 
  const avatarLetter = username.charAt(0).toUpperCase()
  const postDate = new Date(answer.created_at).toLocaleDateString()

  return (
    <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm" dir={direction}>
      <div className="flex items-start gap-4 rtl:space-x-reverse">
        
        
        <div className="flex flex-col items-center gap-1">
          <button 
             onClick={() => handleVote(1)}
             disabled={!currentUserId || answer.user_id === currentUserId}
             className={`p-1 rounded-full transition-colors ${userVote === 1 ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            <ArrowBigUp className={`w-8 h-8 ${userVote === 1 ? 'fill-current' : ''}`} />
          </button>
          
          <span className="font-bold text-gray-700 text-lg">{netVotes}</span>
          
          <button 
             onClick={() => handleVote(-1)}
             disabled={!currentUserId || answer.user_id === currentUserId}
             className={`p-1 rounded-full transition-colors ${userVote === -1 ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
          >
            <ArrowBigDown className={`w-8 h-8 ${userVote === -1 ? 'fill-current' : ''}`} />
          </button>
        </div>

        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm ring-2 ring-white shadow-sm">
              {avatarLetter}
            </div>
            <div className="flex flex-col leading-tight text-start">
              <span className="font-semibold text-gray-900 text-sm">{username}</span>
              <span className="text-xs text-gray-500">{postDate}</span> 
            </div>
          </div>

          <div className="text-gray-800 text-base leading-relaxed text-start whitespace-pre-wrap mb-4" dir="auto">
            {answer.content}
          </div>

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