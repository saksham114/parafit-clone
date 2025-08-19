export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n: string) => cookieStore.get(n)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  redirect(user ? '/dashboard' : '/sign-in')
}
