'use client'

import { Bell, Edit, Globe, Home, Search, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import JaspLogo from './JaspLogo'
import { useState } from 'react'
import { signOut } from '@/app/(auth)/actions'
import type { User } from '@supabase/supabase-js'
import { useModal } from '@/context/ModalContext'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import LanguageModal from './LanguageModal'
import { useRouter } from 'next/navigation' // 1. Import useRouter

type NavbarProps = {
  user: User | null
}

export default function Navbar({ user }: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLangModalOpen, setIsLangModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('') // 2. Search State
  const { openModal } = useModal()
  const { t, direction } = useLanguage()
  const router = useRouter() // 3. Initialize Router

  const getAvatarLetter = () => {
    if (user?.user_metadata?.username) {
      return user.user_metadata.username.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return <UserIcon size={20} />
  }

  // 4. Handle Search Logic
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-sm" dir="ltr">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">

            <div className="flex items-center gap-4">
              <JaspLogo />
              <div className="hidden md:flex items-center gap-2">
                <Link href="/" className="p-3 rounded-full hover:bg-gray-100">
                  <Home size={22} className="text-gray-600" />
                </Link>
                <a href="#" className="p-3 rounded-full hover:bg-gray-100">
                  <Bell size={22} className="text-gray-600" />
                </a>
                <Link href="/questions" className="p-3 rounded-full hover:bg-gray-100">
                  <Edit size={22} className="text-gray-600" />
                </Link>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  dir={direction}
                  value={searchQuery} // 5. Bind Value
                  onChange={(e) => setSearchQuery(e.target.value)} // 6. Update State
                  onKeyDown={handleSearch} // 7. Listen for Enter
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
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Profile
                      </a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Settings
                      </a>
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

      <LanguageModal 
        isOpen={isLangModalOpen} 
        onClose={() => setIsLangModalOpen(false)} 
      />
    </>
  )
}