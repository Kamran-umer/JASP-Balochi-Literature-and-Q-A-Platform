'use client'

import { useState } from 'react'
import { addAnswer } from '@/app/(main)/answer-actions' // We will create this action next
import SubmitButton from '@/components/ui/SubmitButton'

export default function AddAnswerForm({ questionId }: { questionId: string }) {
  // We use a simple form action wrapper to handle the reset
  const [key,QH] = useState(0) // Used to force re-render/reset form

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Answer</h3>
      <form 
        key={key}
        action={async (formData) => {
          await addAnswer(formData)
          QH(prev => prev + 1) // Reset form
        }} 
        className="space-y-3"
      >
        <input type="hidden" name="question_id" value={questionId} />
        
        <textarea
          name="content"
          rows={4}
          placeholder="Write your answer here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          required
        />
        
        <div className="flex justify-end">
          <div className="w-32">
            <SubmitButton>Post Answer</SubmitButton>
          </div>
        </div>
      </form>
    </div>
  )
}