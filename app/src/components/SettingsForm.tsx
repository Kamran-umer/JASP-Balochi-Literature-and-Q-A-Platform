'use client'

import { useState, useActionState } from 'react'
import { updateProfile } from '@/app/(main)/actions'
import SubmitButton from '@/components/ui/SubmitButton'
import { useLanguage } from '@/context/LanguageContext'
import { User, Camera, Link as LinkIcon, FileText } from 'lucide-react'
import Image from 'next/image'

const initialState = {
  message: '',
  success: false,
}

type Props = {
  user: any
  profile: any
}

export default function SettingsForm({ user, profile }: Props) {
  const { t } = useLanguage()
  
  
  const [state, formAction] = useActionState(updateProfile, initialState)
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('Profile Settings', 'Profail Ṭīk Kan')}</h1>

        
        <form action={formAction} className="space-y-6">
        
        <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-100">
            <div className="relative group cursor-pointer">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md ring-2 ring-gray-100 relative">
                {previewUrl ? (
                <Image 
                    src={previewUrl} 
                    alt="Avatar" 
                    fill
                    className="object-cover"
                />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                    <User size={48} />
                </div>
                )}
            </div>
            
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={32} />
            </div>

            <input 
                type="file" 
                name="avatar" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
            />
            </div>
            <p className="text-xs text-gray-500">{t("Click photo to change", "Akas tabil kan")}</p>
        </div>

        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Full Name", "Purā Nām")}</label>
            <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                    name="full_name" 
                    defaultValue={profile?.full_name || ''} 
                    type="text" 
                    placeholder="e.g. Mir Gul Khan"
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Bio", "Jind-e Bārah")}</label>
            <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
                <textarea 
                    name="bio" 
                    defaultValue={profile?.bio || ''} 
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("Website", "Website")}</label>
            <div className="relative">
                <LinkIcon size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                    name="website" 
                    defaultValue={profile?.website || ''} 
                    type="url" 
                    placeholder="https://..."
                    className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
            </div>
            </div>

        </div>

        <div className="pt-4 border-t border-gray-100 space-y-4">
            <SubmitButton>{t('Save Changes', 'Tirānā Save Kan')}</SubmitButton>
            
           
            {state.message && (
                <p className={`text-sm text-center font-medium ${state.success ? 'text-green-600' : 'text-red-600'}`}>
                    {state.message}
                </p>
            )}
        </div>

        </form>
    </div>
  )
}