'use client'

import { Bell, Edit, Globe, Home, Search, ChevronDown, LogOut, User as UserIcon, Menu, X } from 'lucide-react'
import JaspLogo from './JaspLogo'
import { useState, useEffect } from 'react'
import { signOut } from '@/app/(auth)/actions'
import type { User } from '@supabase/supabase-js'
import { useModal } from '@/context/ModalContext'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import LanguageModal from './LanguageModal'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/Client'
import Sidebar from './Sidebar' // Import Sidebar for Mobile Drawer

type NavbarProps = {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLangModalOpen, setIsLangModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false) // State for Mobile Drawer
  const [searchQuery, setSearchQuery] = useState('') 
  const [unreadCount, setUnreadCount] = useState(0)

  const { openModal } = useModal()
  const { t, direction } = useLanguage()
  const router = useRouter() 

  const username = user?.user_metadata?.username || 'user'

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const fetchUnread = async () => {
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', user.id)
            .eq('is_read', false)
        
        setUnreadCount(count || 0)
    }

    fetchUnread()

    const channel = supabase.channel('realtime-notifications')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications', 
            filter: `recipient_id=eq.${user.id}` 
        }, () => {
            setUnreadCount(prev => prev + 1)
        })
        .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const getAvatarLetter = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return <UserIcon size={20} />
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsMobileMenuOpen(false) // Close mobile menu if searching
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm" dir="ltr">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center gap-3">
              {/* MOBILE MENU BUTTON */}
              <button 
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>

              <JaspLogo />
              
              <div className="hidden md:flex items-center gap-2">
                <Link href="/" className="p-3 rounded-full hover:bg-gray-100">
                  <Home size={22} className="text-gray-600" />
                </Link>
                
                <Link href="/notifications" className="p-3 rounded-full hover:bg-gray-100 relative">
                  <Bell size={22} className="text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link href="/questions" className="p-3 rounded-full hover:bg-gray-100">
                  <Edit size={22} className="text-gray-600" />
                </Link>
              </div>
            </div>

            {/* SEARCH BAR (Desktop) */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  dir={direction}
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  onKeyDown={handleSearch} 
                  placeholder={t("Search JASP", "JASP šojīn")}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsLangModalOpen(true)} 
                className="p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Globe size={22} />
              </button>

              <button
                onClick={() => openModal('question')}
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 hidden sm:block"
              >
                {t("Ask", "Suj")}
              </button>

              {/* MOBILE SEARCH ICON (Visible when screen is small) */}
              <button 
                 className="sm:hidden p-2 text-gray-600"
                 onClick={() => router.push('/search')}
              >
                 <Search size={22} />
              </button>

              {/* USER DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="cursor-pointer flex items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold">
                    {getAvatarLetter()}
                  </div>
                  <ChevronDown size={16} className="text-gray-600" />
                </button>

                {isDropdownOpen && (
                  <div 
                    dir={direction}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-20 text-start"
                  >
                    <div className="py-1">
                      {user && (
                        <div className="px-4 py-2 text-sm text-gray-500 border-b">
                          {t("Signed in as", "Pah nām-e")} <br/>
                          <span className="font-medium text-gray-800 truncate">{user.user_metadata?.username ?? user.email}</span>
                        </div>
                      )}
                      <Link href={`/profile/${username}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {t("My Profile", "Mani Profail")}
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {t("Settings", "Seting")}
                      </Link>
                      <div className="border-t my-1"></div>
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="w-full text-start flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut size={16} />
                          <span>{t("Sign Out", "Dar ā")}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
                onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar Content */}
            <div 
                className="relative w-[80%] max-w-sm bg-gray-50 h-full shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col"
                dir={direction}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b bg-white">
                    <span className="font-bold text-lg text-gray-800">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Drawer Links */}
                <div className="p-4 space-y-4 overflow-y-auto">
                    
                    {/* Navigation Links for Mobile */}
                    <div className="flex flex-col gap-2 border-b border-gray-200 pb-4">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium">
                            <Home size={20} /> Home
                        </Link>
                        <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 text-gray-700 font-medium justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={20} /> Notifications
                            </div>
                            {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                            )}
                        </Link>
                        <button onClick={() => { openModal('question'); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 p-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm">
                            <Edit size={20} /> Ask / Post
                        </button>
                    </div>

                    {/* REUSED SIDEBAR COMPONENT (Topics) */}
                    <Sidebar onItemClick={() => setIsMobileMenuOpen(false)} />
                </div>
            </div>
        </div>
      )}

      <LanguageModal 
        isOpen={isLangModalOpen} 
        onClose={() => setIsLangModalOpen(false)} 
      />
    </>
  )
}