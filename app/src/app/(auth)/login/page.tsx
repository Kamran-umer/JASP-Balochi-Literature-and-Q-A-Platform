'use client'

import AuthLayout from '@/components/AuthLayout'
import Input from '@/components/ui/Input'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { login } from '../actions'  
import { useActionState } from 'react'  
import SubmitButton from '@/components/ui/SubmitButton'

const initialState = {
  message: '',
}

export default function LoginPage() {
  
  const [state, formAction] = useActionState(login, initialState)

  return (
    <AuthLayout
      leftTitle="Join the Balochi Literary Community"
      leftSubtitle="By continuing you indicate that you agree to JASP's Terms of Service and Privacy Policy."
      rightTitle="Log In"
    >
      
      <form action={formAction} className="mt-8 space-y-6">
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          Icon={Mail}
          required
        />
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          Icon={Lock}
          required
        />

        <div className="text-end">
          <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

      
        <SubmitButton>Log In</SubmitButton>

        
        {state.message && (
          <p className="text-center text-sm text-red-600">
            {state.message}
          </p>
        )}

        <div className="text-center mt-4">
          <span className="text-gray-600">Don't have an account? </span>
          <Link href="/signup" className="font-medium text-blue-600 hover:underline">
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}