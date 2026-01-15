'use client'

import AuthLayout from '@/components/AuthLayout'
import Input from '@/components/ui/Input'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { forgotPassword } from '@/app/(auth)/actions'
import { useActionState } from 'react'
import SubmitButton from '@/components/ui/SubmitButton'

const initialState = {
  message: '',
  success: false,
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState(forgotPassword, initialState)

  return (
    <AuthLayout
      leftTitle="Recover Your Account"
      leftSubtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
      rightTitle="Reset Password"
    >
      {state.success ? (
        
        <div className="mt-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900">Check your email</h3>
          <p className="text-gray-600">
            We have sent a password reset link to your email address.
          </p>
          <Link
            href="/login"
            className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Return to Log In
          </Link>
        </div>
      ) : (
      
        <form action={formAction} className="mt-8 space-y-6">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            Icon={Mail}
            required
          />

          <SubmitButton>Send Reset Link</SubmitButton>

          {state.message && (
            <p className="text-center text-sm text-red-600">
              {state.message}
            </p>
          )}

          <div className="text-center mt-4">
            <Link href="/login" className="font-medium text-sm text-gray-600 hover:text-gray-900">
              ← Back to Log In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}