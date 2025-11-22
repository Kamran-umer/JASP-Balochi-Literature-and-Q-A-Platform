'use client'

import { useState, useEffect } from 'react'
// FIXED IMPORTS: Pointing to correct ui folder
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useLanguage, type Language } from '@/context/LanguageContext'
import { Check } from 'lucide-react'

type LanguageModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function LanguageModal({ isOpen, onClose }: LanguageModalProps) {
  const { language, changeLanguage, t } = useLanguage()
  const [selectedLang, setSelectedLang] = useState<Language>(language)

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLang(language)
    }
  }, [isOpen, language])

  const handleConfirm = () => {
    changeLanguage(selectedLang)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 w-full max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-start">
          {t("Select Language", "Zubān-a Gečīn Kan")}
        </h2>

        <div className="space-y-3 mb-8">
          {/* Balochi Option */}
          <label 
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLang === 'bal' 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedLang === 'bal' ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
              }`}>
                {selectedLang === 'bal' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="font-medium text-gray-900 font-noto">Balochi</span>
            </div>
            {selectedLang === 'bal' && <Check className="w-5 h-5 text-blue-600" />}
            <input 
              type="radio" 
              name="language" 
              value="bal" 
              className="hidden" 
              checked={selectedLang === 'bal'}
              onChange={() => setSelectedLang('bal')}
            />
          </label>

          {/* English Option */}
          <label 
            className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
              selectedLang === 'en' 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedLang === 'en' ? 'border-blue-600 bg-blue-600' : 'border-gray-400'
              }`}>
                 {selectedLang === 'en' && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="font-medium text-gray-900 font-inter">English</span>
            </div>
            {selectedLang === 'en' && <Check className="w-5 h-5 text-blue-600" />}
            <input 
              type="radio" 
              name="language" 
              value="en" 
              className="hidden" 
              checked={selectedLang === 'en'}
              onChange={() => setSelectedLang('en')}
            />
          </label>
        </div>

        <Button onClick={handleConfirm}>
          {t("Confirm", "Manzūr Kan")}
        </Button>
      </div>
    </Modal>
  )
}