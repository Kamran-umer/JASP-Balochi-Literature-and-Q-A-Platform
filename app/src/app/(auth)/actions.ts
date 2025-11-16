'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// Define the state we will return
type FormState = {
  message: string
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

// === THIS IS THE CORRECT, ONE-STEP SIGNUP FUNCTION ===
export async function signup(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // --- Password Validation ---
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/
  if (!passwordRegex.test(password)) {
    return {
      message: 'Password must be at least 8 characters long and contain one uppercase letter, one number, and one special character (!@#$%^&*).',
    }
  }

  // --- Username Validation ---
  if (!username || username.length < 3) {
    return { message: 'Username must be at least 3 characters long.' }
  }

  // 1. === CHECK FOR DUPLICATE USERNAME ===
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    // 'PGRST116' means 'no rows found', which is good.
    console.error('Error checking username:', checkError)
    return { message: 'An error occurred. Please try again.' }
  }

  if (existingUser) {
    return { message: 'This username is already taken. Please choose another.' }
  }

  // 2. === SIGN UP THE USER (THE CORRECT WAY) ===
  // We pass the username in 'options.data'.
  // This is the *only* way to make it work with the trigger
  // (and the "Allowed User Metadata" setting in Supabase).
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
    // This will catch "User already registered" or "Database error saving new user"
    return { message: signUpError.message }
  }

  // 3. === CONTINUE ===
  // The 'updateUser' step is GONE.
  // The trigger will now fire and find the username in 'raw_user_meta_data'.
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login')
}