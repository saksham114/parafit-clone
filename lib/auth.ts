import { createClient } from './supabase-server'
import { redirect } from 'next/navigation'

export async function getUser() {
  const supabase = await createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/sign-in')
  }
  
  return user
}

export async function getSession() {
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}
