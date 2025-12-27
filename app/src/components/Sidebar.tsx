'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/Client'
import Link from 'next/link'
import { Hash } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

type Topic = {
  id: string
  name: string
  slug: string
}

// Added prop for mobile drawer handling
type SidebarProps = {
    onItemClick?: () => void
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const { t } = useLanguage()

  useEffect(() => {
    const supabase = createClient()
    async function fetchTopics() {
      const { data } = await supabase
        .from('topics')
        .select('*')
        .order('name', { ascending: true })
      
      if (data) setTopics(data)
    }
    fetchTopics()
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-fit">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">{t('Topics to follow', 'Topik pah Pērawī')}</h3>
      </div>
      
      <div className="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <Link 
              key={topic.id} 
              href={`/topic/${topic.slug}`}
              onClick={onItemClick} // Close menu on click
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-none group"
            >
              <div className="bg-blue-50 text-blue-600 p-1.5 rounded-md group-hover:bg-blue-100 transition-colors">
                <Hash size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">{topic.name}</span>
            </Link>
          ))
        ) : (
          <div className="p-6 text-sm text-gray-400 text-center italic">
            {t('No topics found.', 'Hēč topik nēst.')}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 text-xs text-gray-400 text-center border-t border-gray-100">
        © {new Date().getFullYear()} JASP Platform
      </div>
    </div>
  )
}