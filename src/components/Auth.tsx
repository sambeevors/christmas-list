'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      toast.error(error.message)
      console.warn('Error signing in:', error.message)
    } else {
      toast.success('Signed in successfully')
      router.push('/')
    }
  }

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) {
      toast.error(error.message)
      console.warn('Error signing up:', error.message)
    } else {
      toast.success('Signed up successfully')
      router.push('/')
    }
  }

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-3xl font-bold mb-6">Sign In / Sign Up</h1>
      <Link href="/" className="flex items-center gap-2 text-blue-500">
        <ArrowLeft className="size-3" />
        Back home
      </Link>
      <Tabs defaultValue="signIn">
        <TabsList className="mb-4">
          <TabsTrigger value="signIn">Sign In</TabsTrigger>
          <TabsTrigger value="signUp">Create Account</TabsTrigger>
        </TabsList>
        <TabsContent value="signIn" className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSignIn}>Sign In</Button>
        </TabsContent>
        <TabsContent value="signUp" className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleSignUp}>Create Account</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
