'use client'

import AuthLayout from '@/components/AuthLayout'
import Input from '@/components/ui/Input'
import { Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'
import { signup } from '../actions'
import { useActionState, useState } from 'react' // 1. Import useState
import SubmitButton from '@/components/ui/SubmitButton'

const initialState = {
  message: '',
}

export default function SignUpPage() {
  // Server-side errors (e.g., "User already registered")
  const [state, formAction] = useActionState(signup, initialState)

  // --- Client-Side Validation State ---
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [errors, setErrors] = useState({
    username: '',
    password: '',
    confirm: '',
  })

  // 2. Live Username Validation
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value
    setUsername(newUsername)
    if (newUsername.length > 0 && newUsername.length < 3) {
      setErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters.' }))
    } else {
      // We will add a check for duplicate usernames here later
      setErrors(prev => ({ ...prev, username: '' }))
    }
  }

  // 3. Live Password Validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
    
    if (newPassword.length > 0 && !passwordRegex.test(newPassword)) {
      setErrors(prev => ({ ...prev, password: 'Password does not meet requirements.' }))
    } else {
      setErrors(prev => ({ ...prev, password: '' }))
    }

    // Also check confirm password
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirm: 'Passwords do not match.' }))
    } else {
      setErrors(prev => ({ ...prev, confirm: '' }))
    }
  }

  // 4. Live Confirm Password Validation
  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirm = e.target.value
    setConfirmPassword(newConfirm)
    if (password !== newConfirm) {
      setErrors(prev => ({ ...prev, confirm: 'Passwords do not match.' }))
    } else {
      setErrors(prev => ({ ...prev, confirm: '' }))
    }
  }
  // --- End Client-Side Validation ---

  return (
    <AuthLayout
      leftTitle="Join the Balochi Literature Community"
      leftSubtitle="By signing up, you agree to JASP's Terms of Service and Privacy Policy."
      rightTitle="Create Your Account"
    >
      {/* Changed to space-y-4 to make room for error messages */}
      <form action={formAction} className="mt-8 space-y-4">
        {/* Username Field */}
        <div>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="Enter your username"
            Icon={User}
            value={username} // 5. Bind value
            onChange={handleUsernameChange} // 6. Add onChange
            className={errors.username ? 'border-red-500' : ''} // Optional: red border
            required
          />
          {/* 7. Show live username error */}
          {errors.username && (
            <p className="text-sm text-red-600 px-1">{errors.username}</p>
          )}
        </div>

        {/* Email Field */}
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Email Address"
          Icon={Mail}
          required // Email is still required
        />

        {/* Password Field */}
        <div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            Icon={Lock}
            value={password} // 5. Bind value
            onChange={handlePasswordChange} // 6. Add onChange
            className={errors.password ? 'border-red-500' : ''} // Optional: red border
            required
          />
          {/* 8. Show the "hint" you requested */}
          <p className="text-xs text-gray-500 mt-1 px-1">
            Must be 8+ characters and contain an uppercase, a number, and a special symbol (!@#$%^&*).
          </p>
          {/* 7. Show live password error */}
          {errors.password && (
            <p className="text-sm text-red-600 px-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            placeholder="Confirm Password"
            Icon={Lock}
            value={confirmPassword} // 5. Bind value
            onChange={handleConfirmChange} // 6. Add onChange
            className={errors.confirm ? 'border-red-500' : ''} // Optional: red border
            required
          />
          {/* 7. Show live confirm password error */}
          {errors.confirm && (
            <p className="text-sm text-red-600 px-1">{errors.confirm}</p>
          )}
        </div>

        <SubmitButton>Sign Up</SubmitButton>

        {/* 9. Show server-side errors */}
        {state.message && (
          <p className="text-center text-sm text-red-600">
            {state.message}
          </p>
        )}

        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}