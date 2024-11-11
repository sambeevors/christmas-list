'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@supabase/supabase-js'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'

const wishlistSchema = z.object({
  name: z.string().min(1, 'Wishlist name is required'),
})

type WishlistFormData = z.infer<typeof wishlistSchema>

export default function CreateWishList() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WishlistFormData>({
    resolver: zodResolver(wishlistSchema),
  })

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('User not authenticated:', error?.message)
        router.push('/auth') // Redirect to login page if not authenticated
      } else {
        setUser(user)
      }
    }

    checkUser()
  }, [router])

  const onSubmit = async (data: WishlistFormData) => {
    if (!user) {
      console.error('User not authenticated')
      return
    }

    const { error } = await supabase
      .from('wishlists')
      .insert([{ name: data.name, user_id: user.id }])
    if (error) {
      console.error('Error creating wishlist:', error.message)
    } else {
      toast.success('Wishlist created successfully')
      router.push('/')
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Create Wishlist</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="wishlist-name">Wishlist Name</Label>
          <Input id="wishlist-name" {...register('name')} />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <Button type="submit">
          <Plus className="w-4 h-4" />
          Create Wishlist
        </Button>
      </form>
    </div>
  )
}
