'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useActionState } from 'react'
import { X } from 'lucide-react'
import { addPost, addQuestion } from '@/app/(main)/actions'
import SubmitButton from '@/components/ui/SubmitButton'
import RichTextEditor from '@/components/RichTextEditor'

type ModalContextType = {
  openModal: (defaultTab?: 'question' | 'post') => void
  closeModal: () => void
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'question' | 'post'>('question')
  
  // Form States
  const [postState, postAction] = useActionState(addPost, { message: '', success: false })
  const [questionState, questionAction] = useActionState(addQuestion, { message: '', success: false })
  
  // Editor State
  const [editorContent, setEditorContent] = useState('')

  // Close modal on success and reset
  useEffect(() => {
    if (postState.success || questionState.success) {
      setIsOpen(false)
      setEditorContent('') 
    }
  }, [postState.success, questionState.success])

  const openModal = (defaultTab: 'question' | 'post' = 'question') => {
    setActiveTab(defaultTab)
    setIsOpen(true)
  }

  const closeModal = () => setIsOpen(false)

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      
      {/* GLOBAL MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex border-b border-gray-100">
              <button 
                onClick={() => setActiveTab('question')}
                className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${activeTab === 'question' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                Ask Question
              </button>
              <button 
                onClick={() => setActiveTab('post')}
                className={`flex-1 py-4 text-center font-semibold text-sm transition-colors ${activeTab === 'post' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                Create Post
              </button>
              <button onClick={closeModal} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'question' ? (
                <form action={questionAction} className="space-y-4">
                  <div>
                    <input name="title" type="text" placeholder="What is your question?" className="w-full text-lg font-bold placeholder-gray-400 border-none outline-none focus:ring-0 p-0" autoFocus />
                  </div>
                  <div className="min-h-[100px]">
                    <textarea name="body" placeholder="Give more details... (Optional)" className="w-full resize-none border-none outline-none focus:ring-0 p-0 text-gray-600 h-32" />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <SubmitButton>Ask Question</SubmitButton>
                  </div>
                  {questionState.message && <p className="text-center text-sm text-red-500 mt-2">{questionState.message}</p>}
                </form>
              ) : (
                <form action={postAction} className="space-y-4">
                  <div>
                    <input name="title" type="text" placeholder="Title (Optional)" className="w-full text-lg font-bold placeholder-gray-400 border-none outline-none focus:ring-0 p-0" />
                  </div>
                  
                  {/* RICH TEXT EDITOR */}
                  <div>
                    <RichTextEditor 
                        content={editorContent} 
                        onChange={setEditorContent} 
                        placeholder="Write your poem, story, or thoughts..."
                    />
                    {/* Hidden input to pass data to server action */}
                    <input type="hidden" name="content" value={editorContent} />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <SubmitButton>Post</SubmitButton>
                  </div>
                  {postState.message && <p className="text-center text-sm text-red-500 mt-2">{postState.message}</p>}
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}