'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  
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
    
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      
      <div
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-lg shadow-2xl z-50 w-full max-w-2xl overflow-hidden" 
      >
        
        
        <div>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  )
}