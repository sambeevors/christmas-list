import Auth from '@/components/Auth'

import { Loader } from 'lucide-react'
import { Suspense } from 'react'

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center gap-2">
          <Loader className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      }
    >
      <Auth />
    </Suspense>
  )
}
