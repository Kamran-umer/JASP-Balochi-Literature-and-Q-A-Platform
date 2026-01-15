'use client'

import { useState } from 'react'
import { addAnswer } from '@/app/(main)/actions' 
import SubmitButton from '@/components/ui/SubmitButton'
import { useLanguage } from '@/context/LanguageContext'

export default function AddAnswerForm({ questionId }: { questionId: string }) {
  const [key, setKey] = useState(0) 
  const { direction, t } = useLanguage()

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4" dir={direction}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 text-start">
        {t("Your Answer", "Wati Jawāb")}
      </h3>
      
      <form 
        key={key}
        action={async (formData) => {
          await addAnswer(formData)
          setKey(prev => prev + 1) 
        }} 
        className="space-y-3"
      >
        <input type="hidden" name="question_id" value={questionId} />
        
        <textarea
          name="content"
          rows={4}
          dir="auto"
          placeholder={t("Write your answer here...", "Wati jawāb-a edā nibis...")}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-start"
          required
        />
        
        <div className="flex justify-end">
          <div className="w-32">
            <SubmitButton>{t("Post Answer", "Jawāb Dē")}</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}