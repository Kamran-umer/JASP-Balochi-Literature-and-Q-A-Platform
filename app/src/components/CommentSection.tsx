'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/Client'
import { ArrowBigDown, ArrowBigUp, Send, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { addComment, voteOnComment, deleteComment, editComment } from '@/app/(main)/comment-actions'

interface Comment {
  id: string
  created_at: string
  content: string
  question_id: string | null
  post_id: string | null
  user_id: string
  profiles: {
    username: string | null
  } | null
  comment_votes: {
    vote_type: number
    user_id: string
  }[]
}

type CommentSectionProps = {
  parentId: string 
  parentType: 'question' | 'post'
  initialOpen?: boolean
}

const CommentItem = ({ comment, currentUserId, onRefresh }: { comment: Comment, currentUserId: string | undefined, onRefresh: () => void }) => {
  const { t, direction } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const menuRef = useRef<HTMLDivElement>(null)

  const username = comment.profiles?.username ?? t('Anonymous', 'Bēnām')
  const avatarLetter = username.charAt(0).toUpperCase()
  const postDate = new Date(comment.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const upvotes = comment.comment_votes?.filter(v => v.vote_type === 1).length || 0
  const downvotes = comment.comment_votes?.filter(v => v.vote_type === -1).length || 0
  const netVotes = upvotes - downvotes
  const userVote = comment.comment_votes?.find(v => v.user_id === currentUserId)?.vote_type || 0
  const isOwner = currentUserId === comment.user_id

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleVote = async (type: 1 | -1) => {
    if (isOwner) return // Disable self-vote logic
    await voteOnComment(comment.id, type)
    onRefresh()
  }

  const handleDelete = async () => {
    if (confirm(t('Are you sure you want to delete this comment?', 'Āyā to sadqa ē nōt-a hòsh kenay?'))) {
        await deleteComment(comment.id)
        onRefresh()
    }
  }

  const handleEditSubmit = async () => {
    if (editContent.trim() !== comment.content) {
        await editComment(comment.id, editContent)
        onRefresh()
    }
    setIsEditing(false)
    setIsMenuOpen(false)
  }

  return (
    <div className="flex items-start space-x-4 rtl:space-x-reverse py-3 border-t border-gray-100 group">
      <div className="flex-1 text-start min-w-0" dir={direction}>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {avatarLetter}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">{username}</p>
            <p className="text-xs text-gray-500 mt-0.5">{postDate}</p>
          </div>
        </div>
        
        <div className="ps-10 mt-1 relative pe-8">
            {isEditing ? (
                <div className="bg-gray-50 p-3 rounded-lg">
                    <input 
                        type="text" 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2 justify-end">
                        <button onClick={() => setIsEditing(false)} className="text-red-500 hover:bg-red-100 p-1 rounded"><X size={16}/></button>
                        <button onClick={handleEditSubmit} className="text-green-600 hover:bg-green-100 p-1 rounded"><Check size={16}/></button>
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words bg-gray-50 p-3 rounded-lg">
                        {comment.content}
                    </p>
                    {isOwner && (
                        <div className="absolute top-2 end-2" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute top-6 end-0 bg-white shadow-lg border rounded-md z-20 w-28 py-1">
                                    <button 
                                        onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                        className="w-full text-start px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Edit2 size={14} /> {t('Edit', 'Rad-o-badal')}
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="w-full text-start px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                    >
                                        <Trash2 size={14} /> {t('Delete', 'Hòsh')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center space-x-1 rtl:space-x-reverse border border-gray-200 rounded-full px-2 py-0.5 bg-white">
                    <button 
                        onClick={() => handleVote(1)}
                        disabled={!!isOwner}
                        className={`flex items-center hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userVote === 1 ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                        <ArrowBigUp size={18} className={userVote === 1 ? 'fill-current' : ''} />
                        <span className="mx-1 text-xs font-medium">{netVotes}</span>
                    </button>
                    
                    <div className="w-px h-3 bg-gray-300"></div>
                    
                    <button 
                        onClick={() => handleVote(-1)}
                        disabled={!!isOwner}
                        className={`flex items-center hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userVote === -1 ? 'text-red-600' : 'text-gray-500'}`}
                    >
                        <ArrowBigDown size={18} className={userVote === -1 ? 'fill-current' : ''} />
                    </button>
                </div>

                <button className="text-xs font-medium text-gray-500 hover:text-gray-800 hover:underline">
                    {t('Reply', 'Jawāb')}
                </button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default function CommentSection({ parentId, parentType, initialOpen = false }: CommentSectionProps) {
  // (Logic identical to FeedCommentSection but for dedicated page)
  const { t, direction } = useLanguage()
  const [isOpen, setIsOpen] = useState(initialOpen) 
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [userInitial, setUserInitial] = useState('?') 
  const [inputContent, setInputContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => { setIsOpen(initialOpen); }, [initialOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const supabase = createClient()
    const init = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserId(user.id)
            const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
            if (profile?.username) setUserInitial(profile.username.charAt(0).toUpperCase())
            else if (user.email) setUserInitial(user.email.charAt(0).toUpperCase())
        }
        await fetchComments(supabase)
        setLoading(false)
    }
    init()
    const channel = supabase.channel(`realtime_comments_${parentId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `${parentType}_id=eq.${parentId}` }, () => fetchComments(supabase))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_votes' }, () => fetchComments(supabase))
        .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [parentId, parentType, isOpen]) 

  const fetchComments = async (supabase: any) => {
      const { data } = await supabase.from('comments').select(`*, profiles(username), comment_votes(user_id, vote_type)`).eq(parentType === 'question' ? 'question_id' : 'post_id', parentId).order('created_at', { ascending: true })
      if (data) setComments(data as Comment[])
  }

  const handleSubmit = async () => {
    if (!inputContent.trim()) return
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('content', inputContent)
    formData.append('postId', parentId)
    await addComment(formData)
    setInputContent('')
    const supabase = createClient()
    await fetchComments(supabase)
    setIsSubmitting(false)
  }
  const handleManualRefresh = async () => { const supabase = createClient(); await fetchComments(supabase); }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }

  return (
    <div className="w-full" dir={direction}>
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800">{comments.length} {t('Comments', 'Nōt')}</h3>
      </div>
      {isOpen && (
        <div className="bg-white">
          <div className="flex items-start space-x-3 rtl:space-x-reverse mb-6">
             <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{userInitial}</div>
             <div className="flex-1 relative">
                <textarea value={inputContent} onChange={(e) => setInputContent(e.target.value)} onKeyDown={handleKeyDown} disabled={isSubmitting} dir="auto" rows={1} placeholder={t("Write a comment...", "Yak Nōt Navīst Kan...")} className="w-full py-3 ps-4 pe-12 border border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm resize-none" />
                <button onClick={handleSubmit} disabled={!inputContent.trim() || isSubmitting} className="absolute end-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-full"><Send size={20} /></button>
             </div>
          </div>
          <div className="space-y-2">
            {loading ? <div className="text-center text-gray-400 py-8 text-sm animate-pulse">Loading...</div> : comments.length > 0 ? comments.map((c) => <CommentItem key={c.id} comment={c} currentUserId={userId} onRefresh={handleManualRefresh} />) : <div className="text-center text-gray-400 py-10 text-sm border border-dashed border-gray-200 rounded-lg bg-gray-50">No comments yet.</div>}
          </div>
        </div>
      )}
    </div>
  )
}