'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'bal'
type Direction = 'ltr' | 'rtl'

type LanguageContextType = {
  language: Language
  direction: Direction
  changeLanguage: (lang: Language) => void
  t: (en: string, bal: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const changeLanguage = (lang: Language) => {
    setLanguage(lang)
  }

  const direction = language === 'bal' ? 'rtl' : 'ltr'
  const fontClass = language === 'bal' ? 'font-noto' : 'font-inter'

  useEffect(() => {
    
    document.documentElement.dir = direction
    document.documentElement.lang = language
    
    
    document.body.classList.remove('font-inter', 'font-noto')
    document.body.classList.add(fontClass)
    
  }, [language, direction, fontClass])

  
  const t = (en: string, bal: string) => {
    return language === 'bal' ? bal : en
  }

  return (
    <LanguageContext.Provider value={{ language, direction, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}