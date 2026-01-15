'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

 
type FormState = {
  message: string
  success?: boolean
}

function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createClient(cookieStore)
}

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login Error:', error.message)
    return { message: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

 
export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

   
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
  if (!passwordRegex.test(password)) {
    return {
      message: 'Password must be at least 8 characters long and contain one uppercase letter, one number, and one special character (!@#$%^&*).',
    }
  }

  
  if (!username || username.length < 3) {
    return { message: 'Username must be at least 3 characters long.' }
  }

   
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
     
    console.error('Error checking username:', checkError)
    return { message: 'An error occurred. Please try again.' }
  }

  if (existingUser) {
    return { message: 'This username is already taken. Please choose another.' }
  }

   
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      }
    }
  })

  if (signUpError) {
    console.error('Signup Error:', signUpError.message)
    return { message: signUpError.message }
  }

   
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}

 
export async function forgotPassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const email = formData.get('email') as string

  
  const siteUrl = 'https://jasp-p.vercel.app'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })

  if (error) {
    return { message: error.message, success: false }
  }

  return { success: true, message: 'Check your email for the reset link!' }
}

 
export async function updatePassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { message: 'Passwords do not match', success: false }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { message: error.message, success: false }
  }

  return { success: true, message: 'Password updated successfully!' }
}