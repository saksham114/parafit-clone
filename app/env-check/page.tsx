import Link from 'next/link'
import Card from '@/components/Card'

export default function EnvCheckPage() {
  const envVars = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', present: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
    { name: 'NEXT_PUBLIC_ONESIGNAL_APP_ID', present: !!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', present: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
    { name: 'SUPABASE_JWT_SECRET', present: !!process.env.SUPABASE_JWT_SECRET }
  ]

  const allPresent = envVars.every(env => env.present)
  const missingCount = envVars.filter(env => !env.present).length

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <Card variant="glass" className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Environment Check</h1>
        <p className="text-text-secondary">Verify environment variables are properly configured</p>
      </Card>

      {/* Status Summary */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">Configuration Status</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            allPresent 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {allPresent ? 'All Set' : `${missingCount} Missing`}
          </div>
        </div>
        
        <div className="space-y-3">
          {envVars.map((env) => (
            <div key={env.name} className="flex items-center justify-between p-3 bg-card/40 rounded-xl">
              <span className="text-text-primary font-mono text-sm">{env.name}</span>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                env.present 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {env.present ? 'present' : 'missing'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Instructions */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-3">Next Steps</h3>
        <div className="space-y-2 text-sm text-text-secondary">
          {allPresent ? (
            <p className="text-green-400">✅ All environment variables are configured. Your app should work correctly!</p>
          ) : (
            <>
              <p className="text-orange-400">⚠️ Some environment variables are missing. Please configure them:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                {envVars.filter(env => !env.present).map(env => (
                  <li key={env.name} className="font-mono">{env.name}</li>
                ))}
              </ul>
              <p className="mt-3">Check your <code className="bg-card/60 px-1 py-0.5 rounded">.env.local</code> file or deployment environment variables.</p>
            </>
          )}
        </div>
      </Card>

      {/* Navigation */}
      <div className="text-center">
        <Link 
          href="/dashboard"
          className="inline-flex items-center px-4 py-2 bg-primary text-surface font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
