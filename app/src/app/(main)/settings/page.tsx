import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'

export const revalidate = 0

export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // 1. Get Current User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get Profile Data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Pass the fetched data to the client form */}
        <SettingsForm user={user} profile={profile} />
    </div>
  )
}