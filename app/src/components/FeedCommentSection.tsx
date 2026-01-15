'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowBigDown, ArrowBigUp, Send, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/Client'
import { addComment, voteOnComment, deleteComment, editComment } from '@/app/(main)/comment-actions'

interface Comment {
  id: string
  created_at: string
  content: string
  user_id: string
  profiles: {
    username: string
  } | null
  comment_votes: {
    vote_type: number
    user_id: string
  }[]
}

const CommentItem = ({ comment, currentUserId, onRefresh }: { comment: Comment, currentUserId: string | undefined, onRefresh: () => void }) => {
  const { t, direction } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  
  const menuRef = useRef<HTMLDivElement>(null)

  const username = comment.profiles?.username ?? t('Anonymous', 'Bēnām')
  const avatarLetter = username.charAt(0).toUpperCase()
  
  const upvotes = comment.comment_votes.filter(v => v.vote_type === 1).length
  const downvotes = comment.comment_votes.filter(v => v.vote_type === -1).length
  const netVotes = upvotes - downvotes
  const userVote = comment.comment_votes.find(v => v.user_id === currentUserId)?.vote_type || 0
  
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
    if (isOwner) return 
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
    <div className="flex flex-col space-y-1 rtl:space-x-reverse py-3 border-t border-gray-100">
        <div className="flex items-start space-x-2 rtl:space-x-reverse text-start" dir={direction}>
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0 mt-0.5">
                {avatarLetter}
            </div>
            
            <div className="flex-1 min-w-0 relative">
                <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block max-w-full relative pe-8">
                    <span className="font-bold text-xs text-gray-900 block">
                        {username}
                    </span>
                    
                    {isEditing ? (
                        <div className="mt-1 min-w-[200px]">
                            <input 
                                type="text" 
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                                autoFocus
                            />
                            <div className="flex gap-2 mt-2 justify-end">
                                <button onClick={() => setIsEditing(false)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                                <button onClick={handleEditSubmit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={14}/></button>
                            </div>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                            {comment.content}
                        </span>
                    )}

                    {isOwner && !isEditing && (
                        <div className="absolute top-2 end-2" ref={menuRef}>
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-400 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <MoreHorizontal size={14} />
                            </button>
                            
                            {isMenuOpen && (
                                <div className="absolute top-5 end-0 bg-white shadow-lg border rounded-md z-20 w-24 py-1">
                                    <button 
                                        onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                                        className="w-full text-start px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                    >
                                        <Edit2 size={12} /> {t('Edit', 'Rad-o-badal')}
                                    </button>
                                    <button 
                                        onClick={handleDelete}
                                        className="w-full text-start px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                    >
                                        <Trash2 size={12} /> {t('Delete', 'Hòsh')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse ps-10 text-xs text-gray-500 mt-1">
            <div className="flex items-center space-x-1 rtl:space-x-reverse border border-gray-200 rounded-full px-1.5 py-0.5 bg-white">
                <button 
                    onClick={() => handleVote(1)}
                    disabled={!!isOwner}
                    className={`flex items-center hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userVote === 1 ? 'text-blue-600' : ''}`}
                >
                    <ArrowBigUp size={16} className={userVote === 1 ? 'fill-current' : ''} />
                    <span className="mx-1 font-medium">{netVotes}</span>
                </button>
                <div className="w-px h-3 bg-gray-300"></div>
                <button 
                    onClick={() => handleVote(-1)}
                    disabled={!!isOwner}
                    className={`flex items-center hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${userVote === -1 ? 'text-red-600' : ''}`}
                >
                    <ArrowBigDown size={16} className={userVote === -1 ? 'fill-current' : ''} />
                </button>
            </div>

            <button className="font-medium hover:underline hover:text-gray-800">
                {t('Reply', 'Jawāb')}
            </button>
            
            <span className="text-gray-400 text-[10px]">
                {new Date(comment.created_at).toLocaleDateString()}
            </span>
        </div>
    </div>
  )
}

type FeedCommentSectionProps = {
  postId: string
  initialCommentCount?: number 
  isDrawerOpen: boolean
  setDrawerOpen: (isOpen: boolean) => void
  onCommentAdded?: () => void
}

export default function FeedCommentSection({ 
    postId, 
    isDrawerOpen,
    onCommentAdded
}: FeedCommentSectionProps) {
  
  const { t, direction } = useLanguage()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [userInitial, setUserInitial] = useState('?') 
  const [inputContent, setInputContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isDrawerOpen) return;
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
    const channel = supabase.channel(`comments-${postId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, () => fetchComments(supabase))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comment_votes' }, () => fetchComments(supabase))
        .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isDrawerOpen, postId])

  const fetchComments = async (supabase: any) => {
    const { data } = await supabase.from('comments').select(`*, profiles(username), comment_votes(user_id, vote_type)`).eq('post_id', postId).order('created_at', { ascending: true })
    if (data) setComments(data as Comment[])
  }

  const handleSubmit = async () => {
    if (!inputContent.trim()) return
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('content', inputContent)
    formData.append('postId', postId)
    await addComment(formData)
    if (onCommentAdded) onCommentAdded() 
    setInputContent('')
    const supabase = createClient()
    await fetchComments(supabase)
    setIsSubmitting(false)
  }
  const handleManualRefresh = async () => { const supabase = createClient(); await fetchComments(supabase); }
  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }

  return (
    <div className="w-full" dir={direction}>
      {isDrawerOpen && (
        <div className="bg-gray-50 border-t border-gray-100 p-4 pb-2 transition-all duration-300 ease-in-out">
          <div className="flex items-start space-x-2 rtl:space-x-reverse mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{userInitial}</div>
            <div className="flex-1 relative">
                <textarea value={inputContent} onChange={(e) => setInputContent(e.target.value)} onKeyDown={handleKeyDown} disabled={isSubmitting} dir="auto" rows={1} placeholder={t("Write a comment...", "Yak Nōt Navīst Kan...")} className="w-full py-2 ps-4 pe-10 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
                <button onClick={handleSubmit} disabled={!inputContent.trim() || isSubmitting} className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"><Send size={16} /></button>
            </div>
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
            {loading ? <div className="py-6 text-center text-gray-400 text-sm animate-pulse">Loading...</div> : comments.length > 0 ? comments.map((c) => <CommentItem key={c.id} comment={c} currentUserId={userId} onRefresh={handleManualRefresh} />) : <div className="py-8 text-center text-gray-400 text-sm italic">No comments yet.</div>}
          </div>
        </div>
      )}
    </div>
  )
}