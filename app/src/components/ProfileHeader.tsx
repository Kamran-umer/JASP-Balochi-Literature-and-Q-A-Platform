'use client'

import { User as UserIcon, Calendar, Link as LinkIcon } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { followUser, unfollowUser } from '@/app/(main)/actions'
import { useState } from 'react'

type ProfileData = {
  id: string
  username: string
  full_name?: string
  bio?: string
  website?: string
  avatar_url?: string
  created_at: string
}

type ProfileStats = {
  followers: number
  following: number
  posts: number
}

type ProfileHeaderProps = {
  profile: ProfileData
  stats: ProfileStats
  isOwner: boolean
  isFollowing: boolean
}

export default function ProfileHeader({ profile, stats, isOwner, isFollowing: initialFollowing }: ProfileHeaderProps) {
  const { t } = useLanguage()
  const [isFollowing, setIsFollowing] = useState(initialFollowing)

  const handleFollow = async () => {
    if (isFollowing) {
        setIsFollowing(false)
        await unfollowUser(profile.id)
    } else {
        setIsFollowing(true)
        await followUser(profile.id)
    }
  }

  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const avatarLetter = profile.username.charAt(0).toUpperCase()

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
            <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full bg-white p-1 relative">
                    
                    {profile.avatar_url ? (
                        <img 
                            src={profile.avatar_url} 
                            alt={profile.username} 
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-gray-500">
                            {avatarLetter}
                        </div>
                    )}
                </div>
                
                
                {isOwner ? (
                    <a href="/settings" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors">
                        {t('Edit Profile', 'Profail Rad Kan')}
                    </a>
                ) : (
                    <button 
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {isFollowing ? t('Following', 'Pērawi') : t('Follow', 'Pēraw Kan')}
                    </button>
                )}
            </div>
            
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
                <p className="text-gray-500 text-sm">@{profile.username}</p>
            </div>

            {profile.bio && (
                <p className="mt-3 text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{t('Joined', 'Hawār Būt')} {joinDate}</span>
                </div>
                {profile.website && (
                    <div className="flex items-center gap-1">
                        <LinkIcon size={16} />
                        <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>
                    </div>
                )}
            </div>

            
            <div className="flex gap-6 mt-6 pt-4 border-t border-gray-100">
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-lg">{stats.posts}</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Posts</span>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-lg">{stats.followers}</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Followers</span>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-gray-900 text-lg">{stats.following}</span>
                    <span className="text-gray-500 text-xs uppercase tracking-wide">Following</span>
                </div>
            </div>
        </div>
    </div>
  )
}