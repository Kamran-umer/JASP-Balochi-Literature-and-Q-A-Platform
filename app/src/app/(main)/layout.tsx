'use client'

import AskQuestionModal from '@/components/AskQuestionModal'
import Navbar from '@/components/Navbar'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/Client'
import type { User } from '@supabase/supabase-js'
import React from 'react'
import { ModalContext } from '@/context/ModalContext' // 1. Import our new context

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  // 2. Add state to hold the tab we want to open
  const [defaultTab, setDefaultTab] = useState<'question' | 'post'>('question')

  useEffect(() => {
    const supabase = createClient()
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // 3. Upgrade openModal to accept a tab
  const openModal = (tab: 'question' | 'post' = 'question') => {
    setDefaultTab(tab) // Set the tab first
    setIsModalOpen(true) // Then open the modal
  }

  const closeModal = () => setIsModalOpen(false)

  // 4. Pass the upgraded function to the provider
  return (
    <ModalContext.Provider value={{ openModal }}>
      <div>
        {/* 5. Pass the user data to the Navbar (onAskClick is gone!) */}
        <Navbar user={user} />
        
        <main className="max-w-5xl mx-auto px-4 pt-20">
          {/* 6. We no longer need React.cloneElement! */}
          {children}
        </main

        >{/* 7. Pass the defaultTab state to the modal */}
        <AskQuestionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          user={user}
          defaultTab={defaultTab}
        />
      </div>
    </ModalContext.Provider>
  )
}