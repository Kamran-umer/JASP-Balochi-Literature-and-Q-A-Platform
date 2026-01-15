import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'

export const revalidate = 0

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
        <SettingsForm user={user} profile={profile} />
    </div>
  )
}