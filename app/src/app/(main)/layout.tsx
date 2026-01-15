'use client'

import AskQuestionModal from '@/components/AskQuestionModal'
import Navbar from '@/components/Navbar'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/Client'
import type { User } from '@supabase/supabase-js'
import React from 'react'
import { ModalContext } from '@/context/ModalContext' 
import { LanguageProvider } from '@/context/LanguageContext' 

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [defaultTab, setDefaultTab] = useState<'question' | 'post'>('question')

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const openModal = (tab: 'question' | 'post' = 'question') => {
    setDefaultTab(tab) 
    setIsModalOpen(true) 
  }

  const closeModal = () => setIsModalOpen(false)

  return (
    <LanguageProvider>
      <ModalContext.Provider value={{ openModal, closeModal }}>
        <div>
          <Navbar user={user} />
          
          <main className="max-w-5xl mx-auto px-4 pt-20">
            {children}
          </main>

          <AskQuestionModal
            isOpen={isModalOpen}
            onClose={closeModal}
            user={user}
            defaultTab={defaultTab}
          />
        </div>
      </ModalContext.Provider>
    </LanguageProvider>
  )
}