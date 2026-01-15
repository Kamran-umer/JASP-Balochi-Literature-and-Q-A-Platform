import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import NotificationItem from '@/components/NotificationItem'

export const revalidate = 0

export default async function NotificationsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return <div className="p-8 text-center text-gray-500">Please log in to see notifications.</div>

   
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
        *,
        actor:actor_id ( username )
    `)
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

   
  const hasUnread = notifications?.some((n: any) => !n.is_read)
  
  if (hasUnread) {
     
     await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen border-x border-gray-200">
      <div className="p-4 border-b border-gray-200 sticky top-16 bg-white/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
      </div>

      <div className="divide-y divide-gray-100">
        {notifications && notifications.length > 0 ? (
            
            notifications.map((note) => (
                <NotificationItem key={note.id} notification={note} />
            ))
        ) : (
            <div className="p-12 text-center text-gray-500">
                <p>No notifications yet.</p>
                <p className="text-sm mt-2">When someone likes or comments on your posts, they will appear here.</p>
            </div>
        )}
      </div>
    </div>
  )
}