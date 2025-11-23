'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Share, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useRef, useEffect } from 'react'
import FeedCommentSection from './FeedCommentSection'
import { createClient } from '@/lib/supabase/Client'
import { deletePost, editPost } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'

export type Post = {
  id: string;
  created_at: string;
  title: string | null;
  content: string; 
  user_id?: string; // Added for ownership check
  profiles: {
    username: string;
  } | null;
  comments: { count: number }[]; 
};

type FeedItemProps = {
  post: Post;
  isDetailView?: boolean; // New prop to toggle between Feed card and Detail card
};

export default function FeedItem({ post, isDetailView = false }: FeedItemProps) { 
  const { t, direction } = useLanguage() 
  const router = useRouter()
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); 
  const [commentCount, setCommentCount] = useState(post.comments?.[0]?.count || 0);
  
  // Edit/Delete State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title || '')
  const [editContent, setEditContent] = useState(post.content)
  const menuRef = useRef<HTMLDivElement>(null)

  const username = post.profiles?.username ?? t('Anonymous', 'Bēnām');
  const avatarLetter = username.charAt(0).toUpperCase();
  const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCommentToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
  }

  // --- CRUD HANDLERS ---
  const handleDelete = async () => {
    if (confirm(t('Are you sure you want to delete this post?', 'Āyā to sadqa ē post-a hòsh kenay?'))) {
      await deletePost(post.id)
      if (isDetailView) {
        router.push('/') // Redirect to feed if deleted from detail page
      }
    }
  }

  const handleEditSubmit = async () => {
    await editPost(post.id, editTitle, editContent)
    setIsEditing(false)
    setIsMenuOpen(false)
  }

  // Only show menu if current user is the owner (requires user_id in Post type)
  // Note: We need to make sure the parent fetches user_id.
  const isOwner = currentUserId && post.user_id === currentUserId

  // Wrapper for Link vs Div based on editing state
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isEditing || isDetailView) return <div className="block">{children}</div>
    return <Link href={`/posts/${post.id}`} className="group block cursor-pointer">{children}</Link>
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden relative group" dir={direction}>
      <div className="p-4">
        
        {/* Header Row: Author + Menu */}
        <div className="flex justify-between items-start mb-2 rtl:space-x-reverse">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-semibold">
                    {avatarLetter}
                </div>
                <div>
                    <span className="font-semibold text-sm">{username}</span>
                    <span className="text-xs text-gray-500"> · {postDate}</span>
                    <button className="ms-2 text-xs font-semibold text-blue-600 hover:underline">
                    {t('Follow', 'Pēraw Kan')}
                    </button>
                </div>
            </div>

            {/* 3-Dots Menu */}
            {isOwner && !isEditing && (
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-8 end-0 bg-white shadow-lg border rounded-md z-20 w-32 py-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }}
                                className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                            >
                                <Edit2 size={14} /> {t('Edit', 'Rad-o-badal')}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                            >
                                <Trash2 size={14} /> {t('Delete', 'Hòsh')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
        
        {/* Content Area */}
        <ContentWrapper>
          {isEditing ? (
            <div className="space-y-3 mt-2">
                <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="w-full p-2 border rounded text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Cancel</button>
                    <button onClick={handleEditSubmit} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                </div>
            </div>
          ) : (
            <>
                {(post.title || editTitle) && (
                    <h2 className={`font-bold text-lg text-gray-800 ${!isDetailView ? 'group-hover:underline' : ''} mb-1`}>
                    {editTitle || post.title}
                    </h2>
                )}
                <p className={`text-gray-800 whitespace-pre-wrap py-2 ${!isDetailView && !isEditing ? 'line-clamp-3' : ''}`}>
                    {editContent || post.content}
                </p>
            </>
          )}
        </ContentWrapper>
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
          {/* If Detail View: Show static icon (or scroll to comments). 
             If Feed View: Show toggle button. 
          */}
          {!isDetailView ? (
            <button 
                onClick={handleCommentToggle}
                className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse"
            >
                <MessageSquare size={18} />
                <span className="text-sm">{commentCount} {t('Comments', 'Nōt')}</span>
            </button>
          ) : (
             <div className="flex items-center space-x-1.5 text-gray-600 p-2 rtl:space-x-reverse">
                <MessageSquare size={18} />
                <span className="text-sm">{commentCount} {t('Comments', 'Nōt')}</span>
             </div>
          )}
          
          <button className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <Share size={18} />
            <span className="text-sm">{t('Share', 'Šarīk Kan')}</span>
          </button>
        </div>
      </div>
      
      {/* Inline Drawer (Only for Feed View) */}
      {!isDetailView && (
        <FeedCommentSection 
            postId={post.id} 
            isDrawerOpen={isCommentsOpen}
            setDrawerOpen={setIsCommentsOpen}
            onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  )
}