export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

import Link from 'next/link'
import Card from '@/components/Card'

export default function EnvCheckPage() {
  const envVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', present: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: 'NEXT_PUBLIC_ONESIGNAL_APP_ID', present: !!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/60 border border-card/40 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">Environment Check</h1>
          
          <div className="space-y-4">
            {envVars.map((envVar) => (
              <div key={envVar.name} className="flex items-center justify-between p-3 bg-card/40 rounded-lg">
                <span className="text-text-primary font-medium">{envVar.name}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  envVar.present 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {envVar.present ? 'Present' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-card/40 rounded-lg">
            <p className="text-sm text-text-secondary text-center">
              This page shows environment variable status without revealing actual values.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
