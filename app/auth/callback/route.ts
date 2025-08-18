import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')

  // Build the response we will return and attach cookies to it.
  const res = NextResponse.redirect(new URL('/dashboard', url.origin))

  // SSR client: read cookies from the request, WRITE cookies onto 'res'
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  if (code) {
    // Exchange code for a session; sets auth cookies on 'res'
    await supabase.auth.exchangeCodeForSession(code)
    // (Optional) Log or ignore error; we'll still redirect
  }

  return res
}
