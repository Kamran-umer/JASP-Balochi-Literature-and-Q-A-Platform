'use client'

import { ChevronDown, Globe, Image as ImageIcon, Text, User as UserIcon, X, Hash } from 'lucide-react'
import Modal from './ui/Modal'
import type { User } from '@supabase/supabase-js'
import SubmitButton from './ui/SubmitButton'
import { useActionState, useEffect, useRef, useState } from 'react'
import { addQuestion, addPost, type FormState } from '@/app/(main)/actions'
import { createClient } from '@/lib/supabase/Client'

type AskQuestionModalProps = {
  isOpen: boolean
  onClose: () => void
  user: User | null
  defaultTab: 'question' | 'post' 
}

type Topic = {
  id: string
  name: string
}

const initialState: FormState = {
  message: '',
  success: false,
}

export default function AskQuestionModal({ isOpen, onClose, user, defaultTab }: AskQuestionModalProps) {
  const [activeTab, setActiveTab] = useState<'question' | 'post'>(defaultTab)
  const [availableTopics, setAvailableTopics] = useState<Topic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  const [questionState, questionAction] = useActionState(addQuestion, initialState)
  const [postState, postAction] = useActionState(addPost, initialState)

  const formRef = useRef<HTMLFormElement>(null)

  const avatarLetter = user?.email ? user.email.charAt(0).toUpperCase() : <UserIcon size={16} />
  const userName = user?.user_metadata?.username ?? user?.email?.split('@')[0] ?? 'User'

  // 1. Fetch Topics when modal opens
  useEffect(() => {
    if (isOpen) {
      const supabase = createClient()
      const fetchTopics = async () => {
        const { data } = await supabase.from('topics').select('id, name').order('name')
        if (data) setAvailableTopics(data)
      }
      fetchTopics()
    }
  }, [isOpen])

  useEffect(() => {
    if (questionState.success || postState.success) {
      formRef.current?.reset()
      setSelectedTopics([]) // Reset topics on success
      onClose()
    }
  }, [questionState, postState, onClose])
  
  useEffect(() => {
    if (!isOpen) {
      formRef.current?.reset()
      setSelectedTopics([])
      questionState.message = ''
      questionState.success = false
      postState.message = ''
      postState.success = false
    } else {
      setActiveTab(defaultTab)
    }
  }, [isOpen, defaultTab, questionState, postState]) 

  const activeState = activeTab === 'question' ? questionState : postState

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(prev => prev.filter(id => id !== topicId))
    } else {
      // Optional: Limit max topics (e.g., 3)
      if (selectedTopics.length < 3) {
        setSelectedTopics(prev => [...prev, topicId])
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <button
          onClick={onClose}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
        <button className="flex items-center space-x-1 text-sm text-gray-600 p-2 hover:bg-gray-100 rounded-full">
          <Globe size={16} />
          <span>Everyone</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('question')}
          className={`flex-1 py-3 font-semibold ${
            activeTab === 'question'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Add Question
        </button>
        <button
          onClick={() => setActiveTab('post')}
          className={`flex-1 py-3 font-semibold ${
            activeTab === 'post'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Create Post
        </button>
      </div>

      {/* Form */}
      <form ref={formRef} action={activeTab === 'question' ? questionAction : postAction}>
        <div className="p-4 h-[60vh] overflow-y-auto custom-scrollbar">
          {/* User Info */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold flex-shrink-0">
              {avatarLetter}
            </div>
            <span className="font-semibold">{userName}</span>
          </div>

          {/* Text Fields */}
          <div className="mt-4 space-y-2">
            <input
              name="title"
              type="text"
              dir="auto"
              placeholder="Title"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
              required={activeTab === 'question'} 
            />
            <textarea
              name={activeTab === 'question' ? 'body' : 'content'}
              rows={5}
              dir="auto"
              placeholder="Say something..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
              required
            />
          </div>

          {/* TOPIC SELECTION */}
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Hash size={14} /> Select Topics (Max 3)
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTopics.map(topic => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    selectedTopics.includes(topic.id)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
            {/* Hidden Input to send selected topics to Server Action */}
            <input type="hidden" name="topics" value={JSON.stringify(selectedTopics)} />
          </div>

          {/* Icons & Error Message */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex space-x-2 text-gray-500">
              <button type="button" className="p-2 rounded-full hover:bg-gray-100"><Text size={20} /></button>
              <button type="button" className="p-2 rounded-full hover:bg-gray-100"><ImageIcon size={20} /></button>
            </div>
            {activeState.message && !activeState.success && (
              <p className="text-sm text-red-600">{activeState.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center p-4 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-gray-600 px-4 py-2 rounded-full hover:bg-gray-100"
          >
            Cancel
          </button>
          <SubmitButton>
            {activeTab === 'question' ? 'Add question' : 'Post'}
          </SubmitButton>
        </div>
      </form>
    </Modal>
  )
}