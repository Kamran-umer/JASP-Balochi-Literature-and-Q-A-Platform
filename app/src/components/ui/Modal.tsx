'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  // Add/remove class to body to prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    // Backdrop
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        className="bg-white rounded-lg shadow-2xl z-50 w-full max-w-2xl overflow-hidden" // Added overflow-hidden
      >
        {/* I have removed the default header and "X" button from this component.
          Your 'AskQuestionModal' now provides its own header, which fixes Bug #1.
        */}
        
        {/* Modal Body */}
        <div>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  )
}