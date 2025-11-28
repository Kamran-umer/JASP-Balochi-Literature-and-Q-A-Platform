'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/(main)/actions'
import SubmitButton from '@/components/ui/SubmitButton'
import { useLanguage } from '@/context/LanguageContext'

const initialState = {
    message: '',
    success: false
}

export default function SettingsPage() {
    const { t } = useLanguage()
    const [state, formAction] = useActionState(updateProfile, initialState)

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('Profile Settings', 'Profail Ṭīk Kan')}</h1>
            
            <form action={formAction} className="space-y-6">
                
                {/* Avatar Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                    <input 
                        type="file" 
                        name="avatar" 
                        accept="image/*"
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="full_name" placeholder="e.g. Mir Gul Khan" className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea name="bio" rows={4} placeholder="Tell us about yourself..." className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website / Link</label>
                    <input type="url" name="website" placeholder="https://..." className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <SubmitButton>
                    {t('Save Changes', 'Tirānā Save Kan')}
                </SubmitButton>

                {state.message && (
                    <p className={`text-sm text-center ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                        {state.message}
                    </p>
                )}
            </form>
        </div>
    )
}