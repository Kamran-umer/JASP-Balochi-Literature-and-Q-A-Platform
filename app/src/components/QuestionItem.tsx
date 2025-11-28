'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Repeat2, MoreHorizontal, Trash2, Edit2, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext' 
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/Client'
import { deleteQuestion, editQuestion, voteOnQuestion, repostQuestion, removeRepostQuestion } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'

export type QuestionWithProfile = {
  id: string
  created_at: string
  title: string
  body: string | null
  user_id?: string
  profiles: { username: string } | null 
  question_votes: { user_id: string; vote_type: number; }[];
  reposts: { user_id: string; }[];
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
  
  const [repostCount, setRepostCount] = useState(question.reposts?.length || 0)
  const [isReposted, setIsReposted] = useState(false)

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
        const myRepost = question.reposts?.some(r => r.user_id === uid) || false
        setIsReposted(myRepost)
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
    if (!currentUserId || isOwner || isReposted) return;

    const previousVote = userVote;
    let newVote: number = type;
    let newNetVotes = netVotes;

    if (previousVote === type) {
        newVote = 0;
        newNetVotes -= type;
    } else if (previousVote === 0) {
        newVote = type;
        newNetVotes += type;
    } else {
        newVote = type;
        newNetVotes += (type * 2);
    }

    setUserVote(newVote);
    setNetVotes(newNetVotes);
    await voteOnQuestion(question.id, type)
  }

  const handleRepost = async () => {
    if (!currentUserId || isOwner) return;
    const newIsReposted = !isReposted;
    setIsReposted(newIsReposted);
    setRepostCount(prev => newIsReposted ? prev + 1 : prev - 1);
    await repostQuestion(question.id)
  }

  const handleDeleteRepost = async () => {
    if (confirm(t('Remove your repost?', 'Wārtā hòsh?'))) {
        setIsReposted(false);
        setRepostCount(prev => prev - 1);
        await removeRepostQuestion(question.id);
        setIsMenuOpen(false);
    }
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
                    {/* LINKED TO PROFILE */}
                    <Link href={`/profile/${username}`} className="font-semibold text-sm hover:underline text-gray-900">
                        {username}
                    </Link>
                    <span className="text-xs text-gray-500"> · {postDate}</span>
                </div>
            </div>

            {(isOwner || isReposted) && !isEditing && (
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-8 end-0 bg-white shadow-lg border rounded-md z-20 w-36 py-1">
                            {isOwner ? (
                                <>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }}
                                        className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Edit2 size={14} /> {t('Edit', 'Rad-o-badal')}
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(); }}
                                        className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                    >
                                        <Trash2 size={14} /> {t('Delete', 'Hòsh')}
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteRepost(); }}
                                    className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                >
                                    <RotateCcw size={14} /> {t('Undo Repost', 'Wārtā Hòsh')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {isEditing ? (
            <div className="space-y-3 mt-2">
                <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Question Title"
                    className="w-full p-2 border rounded text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea 
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Question Details (Optional)"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Cancel</button>
                    <button onClick={handleEditSubmit} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                </div>
            </div>
        ) : (
            isDetailView ? (
                <div className="block">{viewContent}</div>
            ) : (
                <Link href={`/questions/${question.id}`} className="group block">
                    {viewContent}
                </Link>
            )
        )}

      </div>

      <div className="flex items-center justify-between p-2 border-t border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={(e) => { e.preventDefault(); handleVote(1); }} 
            disabled={!!isOwner || isReposted}
            className={`flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed ${userVote === 1 ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <ArrowBigUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
            <span className="text-sm font-medium">{netVotes}</span>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); handleVote(-1); }} 
            disabled={!!isOwner || isReposted}
            className={`p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${userVote === -1 ? 'text-red-600' : 'text-gray-600'}`}
          >
            <ArrowBigDown size={20} className={userVote === -1 ? 'fill-current' : ''} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Link 
            href={`/questions/${question.id}`} 
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse"
          >
            <MessageSquare size={18} />
            <span className="text-sm">0</span>
          </Link>
          
          {!isOwner && (
            <button 
                onClick={(e) => { e.preventDefault(); handleRepost(); }} 
                className={`flex items-center space-x-1.5 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse ${isReposted ? 'text-green-600' : 'text-gray-600'}`}
            >
                <Repeat2 size={18} />
                <span className="text-sm">{repostCount > 0 ? repostCount : t('Repost', 'Wārtā')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}