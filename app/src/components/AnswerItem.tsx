import { ArrowBigDown, ArrowBigUp, MessageSquare, User as UserIcon } from 'lucide-react'

// Define the type for the answer data after joining with profiles
export type AnswerWithProfile = {
  id: string
  created_at: string
  content: string
  profiles: {
    username: string
  } | null
}

type AnswerItemProps = {
  answer: AnswerWithProfile
}

export default function AnswerItem({ answer }: AnswerItemProps) {
  const username = answer.profiles?.username ?? 'Anonymous'
  const avatarLetter = username.charAt(0).toUpperCase()

  const postDate = new Date(answer.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start space-x-4 rtl:space-x-reverse">
        {/* Upvote/Downvote Column (Left) */}
        <div className="flex flex-col items-center pt-2">
          <button className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100">
            <ArrowBigUp size={24} />
          </button>
          <span className="font-semibold text-gray-800 text-lg">0</span>
          <button className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100">
            <ArrowBigDown size={24} />
          </button>
        </div>

        {/* Content Column (Right) */}
        <div className="flex-1">
          {/* Answer Content */}
          <p className="text-gray-800 whitespace-pre-wrap mb-4">
            {answer.content}
          </p>

          {/* Footer Bar */}
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-2">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                {avatarLetter}
              </div>
              <span>Answered by **{username}** on {postDate}</span>
            </div>
            
            <button className="flex items-center space-x-1 hover:text-gray-700">
              <MessageSquare size={16} />
              <span>Comment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}