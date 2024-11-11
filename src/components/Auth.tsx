'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'

// Define the schema using zod
const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

type AuthFormData = z.infer<typeof authSchema>

export default function Auth() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  // Initialize react-hook-form with zodResolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const handleSignIn = async (data: AuthFormData) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error(error.message)
      console.warn('Error signing in:', error.message)
    } else {
      toast.success('Signed in successfully')
      router.push(redirectUrl)
    }
  }

  const handleSignUp = async (data: AuthFormData) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })
    if (error) {
      toast.error(error.message)
      console.warn('Error signing up:', error.message)
    } else {
      toast.success('Signed up successfully')
      router.push(redirectUrl)
    }
  }

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-3xl font-bold mb-6">Sign In / Sign Up</h1>
      <Tabs defaultValue="signIn">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="signIn" className="flex-grow">
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signUp" className="flex-grow">
            Create Account
          </TabsTrigger>
        </TabsList>
        <TabsContent value="signIn">
          <form onSubmit={handleSubmit(handleSignIn)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </TabsContent>
        <TabsContent value="signUp">
          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
