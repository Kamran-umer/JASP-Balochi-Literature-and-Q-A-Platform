'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Repeat2, MoreHorizontal, Trash2, Edit2, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useRef, useEffect } from 'react'
import FeedCommentSection from './FeedCommentSection'
import { createClient } from '@/lib/supabase/Client'
import { deletePost, editPost, voteOnPost, repostPost, removeRepostPost, followUser, unfollowUser } from '@/app/(main)/actions'
import { useRouter } from 'next/navigation'

export type Post = {
  id: string;
  created_at: string;
  title: string | null;
  content: string; 
  user_id?: string;
  profiles: {
    id?: string;
    username: string;
  } | null;
  comments: { id: string }[];
  post_votes: { user_id: string; vote_type: number; }[];
  reposts: { user_id: string; }[];
};

type FeedItemProps = {
  post: Post;
  isDetailView?: boolean;
  onRepostSuccess?: () => void; 
};

export default function FeedItem({ post, isDetailView = false, onRepostSuccess }: FeedItemProps) { 
  const { t, direction } = useLanguage() 
  const router = useRouter()
  const [isCommentsOpen, setIsCommentsOpen] = useState(false); 
  
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  
  const initialUp = post.post_votes?.filter(v => v.vote_type === 1).length || 0
  const initialDown = post.post_votes?.filter(v => v.vote_type === -1).length || 0
  const [netVotes, setNetVotes] = useState(initialUp - initialDown)
  
  const [userVote, setUserVote] = useState(0)
  const [repostCount, setRepostCount] = useState(post.reposts?.length || 0)
  const [isReposted, setIsReposted] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(post.title || '')
  const [editContent, setEditContent] = useState(post.content)
  const menuRef = useRef<HTMLDivElement>(null)

  const username = post.profiles?.username ?? t('Anonymous', 'Bēnām');
  const authorId = post.profiles?.id || post.user_id; 
  const avatarLetter = username.charAt(0).toUpperCase();
  const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const uid = data.user.id
        setCurrentUserId(uid)
        
        const myVote = post.post_votes?.find(v => v.user_id === uid)?.vote_type || 0
        setUserVote(myVote)
        
        const myRepost = post.reposts?.some(r => r.user_id === uid) || false
        setIsReposted(myRepost)

        if (authorId && authorId !== uid) {
           const { data: follow } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', uid)
            .eq('following_id', authorId)
            .single()
           setIsFollowing(!!follow)
        }
      }
    })

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [post, authorId])

  const isOwner = currentUserId && post.user_id === currentUserId

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

    await voteOnPost(post.id, type);
  }

  const handleRepost = async () => {
    if (!currentUserId || isOwner) return;
    
    const newIsReposted = !isReposted;
    setIsReposted(newIsReposted);
    setRepostCount(prev => newIsReposted ? prev + 1 : prev - 1);
    
    await repostPost(post.id);
    
    if (onRepostSuccess) onRepostSuccess();
  }

  const handleDeleteRepost = async () => {
    if (confirm(t('Remove your repost?', 'Wārtā hòsh?'))) {
        setIsReposted(false);
        setRepostCount(prev => prev - 1);
        await removeRepostPost(post.id);
        setIsMenuOpen(false);
        if (onRepostSuccess) onRepostSuccess();
    }
  }

  const handleFollow = async () => {
    if (!currentUserId || !authorId) return;
    
    if (isFollowing) {
        setIsFollowing(false)
        await unfollowUser(authorId)
    } else {
        setIsFollowing(true)
        await followUser(authorId)
    }
  }

  const handleCommentToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setIsCommentsOpen(!isCommentsOpen);
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
  }

  const handleDelete = async () => {
    if (confirm(t('Are you sure you want to delete this post?', 'Āyā to sadqa ē post-a hòsh kenay?'))) {
      await deletePost(post.id)
      if (isDetailView) {
        router.push('/')
      } else if (onRepostSuccess) {
        onRepostSuccess(); 
      }
    }
  }

  const handleEditSubmit = async () => {
    await editPost(post.id, editTitle, editContent)
    setIsEditing(false)
    setIsMenuOpen(false)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden relative group" dir={direction}>
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
                    
                    {!isOwner && authorId && (
                        <button 
                            onClick={handleFollow}
                            className="ms-2 text-xs font-semibold text-blue-600 hover:underline"
                        >
                            {isFollowing ? t('Following', 'Pērawi') : t('Follow', 'Pēraw Kan')}
                        </button>
                    )}
                </div>
            </div>

            {(isOwner || isReposted) && !isEditing && (
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-8 end-0 bg-white shadow-lg border rounded-md z-20 w-36 py-1">
                            {isOwner ? (
                                <>
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
                                </>
                            ) : (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteRepost(); }}
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
            isDetailView ? (
                <div className="block">
                    {(post.title || editTitle) && (
                        <h2 className={`font-bold text-lg text-gray-800 ${!isDetailView ? 'group-hover:underline' : ''} mb-1`}>
                        {editTitle || post.title}
                        </h2>
                    )}
                    <p className={`text-gray-800 whitespace-pre-wrap py-2 ${!isDetailView && !isEditing ? 'line-clamp-3' : ''}`}>
                        {editContent || post.content}
                    </p>
                </div>
            ) : (
                <Link href={`/posts/${post.id}`} className="group block cursor-pointer">
                    {(post.title || editTitle) && (
                        <h2 className={`font-bold text-lg text-gray-800 ${!isDetailView ? 'group-hover:underline' : ''} mb-1`}>
                        {editTitle || post.title}
                        </h2>
                    )}
                    <p className={`text-gray-800 whitespace-pre-wrap py-2 ${!isDetailView && !isEditing ? 'line-clamp-3' : ''}`}>
                        {editContent || post.content}
                    </p>
                </Link>
            )
        )}

      </div>

      <div className="flex items-center justify-between p-2 border-t border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={() => handleVote(1)}
            disabled={!!isOwner || isReposted} 
            className={`flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed ${userVote === 1 ? 'text-blue-600' : 'text-gray-600'}`}
          >
            <ArrowBigUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
            <span className="text-sm font-medium">{netVotes}</span>
          </button>
          <button 
            onClick={() => handleVote(-1)}
            disabled={!!isOwner || isReposted}
            className={`p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${userVote === -1 ? 'text-red-600' : 'text-gray-600'}`}
          >
            <ArrowBigDown size={20} className={userVote === -1 ? 'fill-current' : ''} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
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
          
          {!isOwner && (
            <button 
                onClick={handleRepost}
                className={`flex items-center space-x-1.5 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse ${isReposted ? 'text-green-600' : 'text-gray-600'}`}
            >
                <Repeat2 size={18} />
                <span className="text-sm">{repostCount > 0 ? repostCount : t('Repost', 'Wārtā')}</span>
            </button>
          )}
        </div>
      </div>
      
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