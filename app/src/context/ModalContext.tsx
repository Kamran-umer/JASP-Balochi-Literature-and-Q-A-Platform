'use client'

import { createContext, useContext } from 'react'

// 1. Define what our context will provide
type ModalContextType = {
  // The function can now accept an optional 'defaultTab'
  openModal: (defaultTab?: 'question' | 'post') => void
}

// 2. Create the context
export const ModalContext = createContext<ModalContextType | undefined>(undefined)

// 3. Create the "hook"
export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}