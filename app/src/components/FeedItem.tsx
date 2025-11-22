'use client'

import { ArrowBigDown, ArrowBigUp, MessageSquare, Share } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext' // Import language hook

// Data type for a Post
export type Post = {
  id: string;
  created_at: string;
  title: string | null;
  content: string; 
  profiles: {
    username: string;
  } | null;
};

type FeedItemProps = {
  post: Post;
};

export default function FeedItem({ post }: FeedItemProps) { 
  const { t, direction } = useLanguage() // Get translation and direction
  
  // Use translation helper for 'Anonymous'
  const username = post.profiles?.username ?? t('Anonymous', 'Bēnām');
  const avatarLetter = username.charAt(0).toUpperCase();

  const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    // Set base direction based on language
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden" dir={direction}>
      <div className="p-4">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
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
        
        {/* Wrap content in a Link to the dedicated post page */}
        <Link href={`/posts/${post.id}`} className="group block cursor-pointer">
          {/* Show Title if one was provided */}
          {post.title && (
            <h2 className="font-bold text-lg text-gray-800 group-hover:underline">
              {post.title}
            </h2>
          )}

          {/* 1. ADD LINE-CLAMP-3 HERE to limit content to 3 lines */}
          <p className={`text-gray-800 whitespace-pre-wrap py-2 line-clamp-3 ${post.title ? 'mt-1' : ''}`}>
            {post.content}
          </p>
        </Link>
      </div>

      {/* Action Bar (with placeholder stats) */}
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
          {/* Link the comment button to the post page */}
          <Link 
            href={`/posts/${post.id}`} 
            className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse"
          >
            <MessageSquare size={18} />
            <span className="text-sm">0 {t('Comments', 'Nōt')}</span>
          </Link>
          
          <button className="flex items-center space-x-1.5 text-gray-600 hover:bg-gray-100 p-2 rounded-full rtl:space-x-reverse">
            <Share size={18} />
            <span className="text-sm">{t('Share', 'Šarīk Kan')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}