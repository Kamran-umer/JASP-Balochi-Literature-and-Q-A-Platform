'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react'
import Link from 'next/link'

// 1. THIS IS THE FIRST FIX
// 'profiles' is now an OBJECT, not an array of objects.
export type QuestionWithProfile = {
  id: string
  created_at: string
  title: string
  body: string | null
  profiles: {
    username: string
  } | null // Changed from '[] | null' to '| null' 
}

type QuestionItemProps = {
  question: QuestionWithProfile
}

export default function QuestionItem({ question }: QuestionItemProps) {
  
  // 2. THIS IS THE MAIN FIX
  // We read 'question.profiles.username' directly (no [0]).
  const username = question.profiles?.username ?? 'Anonymous' // 
  const avatarLetter = username.charAt(0).toUpperCase()

  const postDate = new Date(question.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
            {avatarLetter}
          </div>
          <div>
            <span className="font-semibold text-sm">{username}</span>
            <span className="text-xs text-gray-500"> · {postDate}</span>
          </div>
        </div>
        
        {/* Content */}
        <Link href={`/question/${question.id}`} className="group">
          <h2 className="font-bold text-lg text-gray-800 group-hover:underline cursor-pointer">
            {question.title}
          </h2>
          {question.body && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {question.body}
            </p>
          )}
        </Link>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-2 border-t border-gray-100">
        <div className="flex items-center">
          <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <ArrowBigUp size={20} />
            <span className="text-sm font-medium">0</span>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <ArrowBigDown size={20} className="text-gray-600" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Link 
            href={`/question/${question.id}`} 
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse"
          >
            <MessageSquare size={18} />
            <span className="text-sm">0</span>
          </Link>
        </div>
      </div>
    </div>
  )
}