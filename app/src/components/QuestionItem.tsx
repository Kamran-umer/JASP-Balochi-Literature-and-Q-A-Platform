'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, MoreHorizontal, Trash2, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext' 
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/Client'
import { deleteQuestion, editQuestion, voteOnQuestion } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'

export type QuestionWithProfile = {
  id: string
  created_at: string
  title: string
  body: string | null
  user_id?: string
  profiles: { username: string } | null 
  question_votes: { user_id: string; vote_type: number; }[];
}

type QuestionItemProps = {
  question: QuestionWithProfile
  isDetailView?: boolean
}

export default function QuestionItem({ question, isDetailView = false }: QuestionItemProps) {
  const { t, direction } = useLanguage()
  const router = useRouter()
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(question.title)
  const [editBody, setEditBody] = useState(question.body || '')
  const menuRef = useRef<HTMLDivElement>(null)

  const initialUp = question.question_votes?.filter(v => v.vote_type === 1).length || 0
  const initialDown = question.question_votes?.filter(v => v.vote_type === -1).length || 0
  const [netVotes, setNetVotes] = useState(initialUp - initialDown)
  const [userVote, setUserVote] = useState(0)
  
  const username = question.profiles?.username ?? t('Anonymous', 'Bēnām') 
  const avatarLetter = username.charAt(0).toUpperCase()
  const postDate = new Date(question.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const uid = data.user.id
        setCurrentUserId(uid)
        const myVote = question.question_votes?.find(v => v.user_id === uid)?.vote_type || 0
        setUserVote(myVote)
      }
    })

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [question])

  const isOwner = currentUserId && question.user_id === currentUserId

  const handleVote = async (type: 1 | -1) => {
    if (!currentUserId || isOwner) return; 

    const previousVote = userVote;
    let newVote = type === previousVote ? 0 : type;
    let newNetVotes = netVotes + (newVote - previousVote);

    setUserVote(newVote);
    setNetVotes(newNetVotes);
    await voteOnQuestion(question.id, type)
  }

  const handleDelete = async () => {
    if (confirm(t('Are you sure you want to delete this question?', 'Āyā to sadqa ē sawāl-a hòsh kenay?'))) {
        await deleteQuestion(question.id)
        if (isDetailView) {
            router.push('/questions')
        }
    }
  }

  const handleEditSubmit = async () => {
    await editQuestion(question.id, editTitle, editBody)
    setIsEditing(false)
    setIsMenuOpen(false)
  }

  const viewContent = (
    <>
        <h2 className={`font-bold text-lg text-gray-800 ${!isDetailView ? 'group-hover:underline' : ''} cursor-pointer`}>
            {editTitle || question.title}
        </h2>
        {(question.body || editBody) && (
            <p className={`text-gray-600 text-sm mt-1 ${!isDetailView && !isEditing ? 'line-clamp-2' : ''}`}>
            {editBody || question.body}
            </p>
        )}
    </>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden relative" dir={direction}>
      <div className="p-4">
        
        <div className="flex justify-between items-start mb-2 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
                    {avatarLetter}
                </div>
                <div>
                    <Link href={`/profile/${username}`} className="font-semibold text-sm hover:underline text-gray-900">
                        {username}
                    </Link>
                    <span className="text-xs text-gray-500"> · {postDate}</span>
                </div>
            </div>

            {isOwner && !isEditing && (
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                        <MoreHorizontal size={20} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-8 end-0 bg-white shadow-lg border rounded-md z-20 w-36 py-1">
                            <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Edit2 size={14} /> {t('Edit', 'Rad-o-badal')}</button>
                            <button onClick={handleDelete} className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"><Trash2 size={14} /> {t('Delete', 'Hòsh')}</button>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {isEditing ? (
            <div className="space-y-3 mt-2">
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-2 border rounded font-bold" />
                <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} className="w-full p-2 border rounded" />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 border rounded">Cancel</button>
                    <button onClick={handleEditSubmit} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                </div>
            </div>
        ) : (
            isDetailView ? <div className="block">{viewContent}</div> : <Link href={`/questions/${question.id}`} className="group block">{viewContent}</Link>
        )}

      </div>

      <div className="flex items-center justify-between p-2 border-t border-gray-100">
        <div className="flex items-center">
          <button onClick={() => handleVote(1)} disabled={!!isOwner} className={`flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 ${userVote === 1 ? 'text-blue-600' : 'text-gray-600'}`}>
            <ArrowBigUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
            <span className="text-sm font-medium">{netVotes}</span>
          </button>
          <button onClick={() => handleVote(-1)} disabled={!!isOwner} className={`p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 ${userVote === -1 ? 'text-red-600' : 'text-gray-600'}`}>
            <ArrowBigDown size={20} className={userVote === -1 ? 'fill-current' : ''} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Link href={`/questions/${question.id}`} className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <MessageSquare size={18} />
            <span className="text-sm">0</span>
          </Link>
        </div>
      </div>
    </div>
  )
}