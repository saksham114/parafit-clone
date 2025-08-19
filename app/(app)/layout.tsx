import dynamic from 'next/dynamic'

// Dynamic import for the client component wrapper
const AppLayoutClient = dynamic(() => import('./AppLayoutClient'))

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayoutClient>{children}</AppLayoutClient>
}
