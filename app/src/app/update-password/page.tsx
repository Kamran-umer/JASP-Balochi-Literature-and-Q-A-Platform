'use client'

import AuthLayout from '@/components/AuthLayout'
import Input from '@/components/ui/Input'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { updatePassword } from '@/app/(auth)/actions'
import { useActionState } from 'react'
import SubmitButton from '@/components/ui/SubmitButton'

const initialState = {
  message: '',
  success: false,
}

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, initialState)

  return (
    <AuthLayout
      leftTitle="Secure Your Account"
      leftSubtitle="Choose a strong password that you haven't used before to secure your JASP account."
      rightTitle="Set New Password"
    >
      {state.success ? (
        
        <div className="mt-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900">Password Updated!</h3>
          <p className="text-gray-600">
            Your password has been changed successfully. You can now log in with your new credentials.
          </p>
          <Link
            href="/login"
            className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Log In Now
          </Link>
        </div>
      ) : (
        
        <form action={formAction} className="mt-8 space-y-6">
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="New Password"
            Icon={Lock}
            required
            minLength={8}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            Icon={Lock}
            required
            minLength={8}
          />

          <SubmitButton>Update Password</SubmitButton>

          {state.message && (
            <p className="text-center text-sm text-red-600">
              {state.message}
            </p>
          )}
        </form>
      )}
    </AuthLayout>
  )
}