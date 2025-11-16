'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// This FormState will be used by all functions
export type FormState = {
  message: string
  success: boolean
}

function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createClient(cookieStore)
}

// -------------------------------------------
// HELPER FUNCTION: This is the new "self-healing" magic
// -------------------------------------------
async function getOrCreateProfile(supabase: any, user: any) {
  // Check if a profile exists
  let { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    // A real error occurred
    console.error('Error fetching profile:', fetchError)
    return null
  }

  if (profile) {
    // The profile exists. We're good to go.
    return profile
  }

  // Profile does NOT exist ('PGRST116'). Let's create it.
  const username = user.user_metadata?.username ?? 'new_user' // Get username from metadata

  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      username: username,
    })
    .single() // Return the new profile

  if (createError) {
    console.error('Error creating profile:', createError)
    return null
  }

  return newProfile
}

// -------------------------------------------
// ACTION 1: "ADD QUESTION" (Upgraded)
// -------------------------------------------
export async function addQuestion(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'You must be logged in.', success: false }
  }

  // 1. === RUN THE SELF-HEALING CHECK ===
  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) {
    return { message: 'Error validating your user profile.', success: false }
  }
  // Now we know 'profile' exists.

  const title = formData.get('title') as string
  const body = formData.get('body') as string

  if (!title || title.length < 10) {
    return { message: 'Your question title must be at least 10 characters long.', success: false }
  }

  const { error } = await supabase
    .from('questions')
    .insert({
      title: title,
      body: body,
      user_id: user.id // This is now safe, the 'user_id' exists in 'profiles'
    })

  if (error) {
    console.error('Error adding question:', error)
    return { message: error.message, success: false }
  }

  revalidatePath('/questions') 
  return { message: 'Question added successfully!', success: true }
}


// -------------------------------------------
// ACTION 2: "CREATE POST" (Upgraded)
// -------------------------------------------
export async function addPost(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: 'You must be logged in.', success: false }
  }

  // 1. === RUN THE SELF-HEALING CHECK ===
  const profile = await getOrCreateProfile(supabase, user)
  if (!profile) {
    return { message: 'Error validating your user profile.', success: false }
  }
  // Now we know 'profile' exists.

  const title = formData.get('title') as string | null
  const content = formData.get('content') as string

  if (!content || content.length < 1) {
    return { message: 'Your post cannot be empty.', success: false }
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      title: title,
      content: content,
      user_id: user.id // This is now safe
    })

  if (error) {
    console.error('Error adding post:', error)
    return { message: error.message, success: false }
  }

  revalidatePath('/') 
  return { message: 'Post added successfully!', success: true }
}


// lastone
// 'use server'

// import { createClient } from '@/lib/supabase/server'
// import { revalidatePath } from 'next/cache'
// import { cookies } from 'next/headers'

// // This FormState will be used by both functions
// export type FormState = {
//   message: string
//   success: boolean
// }

// // Helper function to create a server client
// function createServerSupabaseClient() {
//   const cookieStore = cookies()
//   return createClient(cookieStore)
// }

// // -------------------------------------------
// // ACTION 1: FOR THE "ADD QUESTION" TAB
// // -------------------------------------------
// export async function addQuestion(prevState: FormState, formData: FormData): Promise<FormState> {
//   const supabase = createServerSupabaseClient()

//   // 1. Get the current user
//   const { data: { user } } = await supabase.auth.getUser()

//   if (!user) {
//     return { message: 'You must be logged in to ask a question.', success: false }
//   }

//   // 2. Get the question text from the form
//   const title = formData.get('title') as string
  
//   // 3. Validate the question (matches our database rule)
//   if (!title || title.length < 10) {
//     return { message: 'Your question must be at least 10 characters long.', success: false }
//   }

//   // 4. Insert the new question into the 'questions' table
//   const { error } = await supabase
//     .from('questions')
//     .insert({
//       title: title,
//       user_id: user.id // This links the question to the user
//     })

//   if (error) {
//     console.error('Error adding question:', error)
//     return { message: 'An error occurred while adding your question.', success: false }
//   }

//   // 5. Success! Revalidate the /questions page path.
//   // We'll build this page next.
//   revalidatePath('/questions') 

//   // Return a success message
//   return { message: 'Question added successfully!', success: true }
// }

// // -------------------------------------------
// // ACTION 2: FOR THE "CREATE POST" TAB (NEW!)
// // -------------------------------------------
// export async function addPost(prevState: FormState, formData: FormData): Promise<FormState> {
//   const supabase = createServerSupabaseClient()

//   // 1. Get the current user
//   const { data: { user } } = await supabase.auth.getUser()

//   if (!user) {
//     return { message: 'You must be logged in to post.', success: false }
//   }

//   // 2. Get the post content from the form
//   const content = formData.get('content') as string
  
//   // 3. Validate the post (matches our database rule)
//   if (!content || content.length < 1) {
//     return { message: 'Your post cannot be empty.', success: false }
//   }

//   // 4. Insert the new post into the 'posts' table
//   const { error } = await supabase
//     .from('posts')
//     .insert({
//       content: content,
//       user_id: user.id // This links the post to the user
//     })

//   if (error) {
//     console.error('Error adding post:', error)
//     return { message: 'An error occurred while adding your post.', success: false }
//   }

//   // 5. Success! Revalidate the homepage path.
//   // This tells Next.js to "refresh" the homepage to show the new post.
//   revalidatePath('/')

//   // Return a success message
//   return { message: 'Post added successfully!', success: true }
// }