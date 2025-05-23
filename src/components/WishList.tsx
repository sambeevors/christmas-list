'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import { SelectValue } from '@radix-ui/react-select'
import { Link as LinkIcon, Plus, Share2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { supabase } from '../lib/supabaseClient'

type Item = {
  id: string
  name: string
  link?: string
  notes?: string
  purchased: boolean
  og_image?: string
  created_at?: string
}

type Wishlist = {
  id: string
  name: string
  user_id: string
}

const SHARED_WISHLISTS_KEY = 'shared_wishlists'

function getSharedWishlists(): Wishlist[] {
  if (typeof window === 'undefined') return []
  const saved = localStorage.getItem(SHARED_WISHLISTS_KEY)
  return saved ? JSON.parse(saved) : []
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/og-image?url=${encodeURIComponent(url)}`)
    const data = await res.json()

    return data.ogImage || null
  } catch (error) {
    console.error('Error fetching OG image:', error)
    return null
  }
}

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  link: z.string().url('Invalid URL').optional().or(z.literal('')),
  notes: z.string().optional(),
})

type ItemFormData = z.infer<typeof itemSchema>

function AddItemForm({ addItem }: { addItem: (item: Item) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  })

  const onSubmit = async (data: ItemFormData) => {
    const ogImage = data.link ? await fetchOgImage(data.link) : null
    const newItem = {
      id: crypto.randomUUID(),
      ...data,
      purchased: false,
      og_image: ogImage || undefined,
    }
    addItem(newItem)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Add Item</h2>
      </div>
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="link">Link</Label>
        <Input id="link" {...register('link')} type="url" />
        {errors.link && <p className="text-red-500">{errors.link.message}</p>}
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register('notes')} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <Plus className="w-4 h-4" />
        {isSubmitting ? 'Adding...' : 'Add Item'}
      </Button>
    </form>
  )
}

function Item({
  item,
  togglePurchased,
  removeItem,
  showPurchased,
  currentWishlist,
  currentUser,
}: {
  item: Item
  togglePurchased: (id: string) => void
  removeItem: (id: string) => void
  showPurchased: boolean
  currentWishlist: Wishlist | null
  currentUser: string | null
}) {
  return (
    <Card
      className={`mb-4 ${item.purchased && showPurchased ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 relative">
          {item.og_image ? (
            <div className="w-full sm:w-24 h-48 sm:h-24 relative overflow-hidden rounded-md shrink-0 bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.og_image}
                alt={`Image for ${item.name}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-200 rounded-md flex items-center justify-center shrink-0">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row grow gap-4 justify-between">
            <div
              className={`grow ${
                item.purchased && showPurchased ? 'line-through' : ''
              }`}
            >
              <h3 className="text-lg font-semibold">{item.name}</h3>
              {item.notes && <p className="text-gray-600">{item.notes}</p>}
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center mt-2"
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  View Item
                </a>
              )}
            </div>

            <div className="flex items-center gap-4 sm:flex-col sm:items-end">
              {showPurchased && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={item.purchased}
                    onCheckedChange={() => togglePurchased(item.id)}
                  />
                  <span className="text-sm text-gray-500">Purchased</span>
                </div>
              )}
              {currentWishlist?.user_id === currentUser && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="absolute top-1 right-1 sm:static sm:inset-auto rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ItemList({
  items,
  togglePurchased,
  removeItem,
  showPurchased,
  currentWishlist,
  currentUser,
}: {
  items: Item[]
  togglePurchased: (id: string) => void
  removeItem: (id: string) => void
  showPurchased: boolean
  currentWishlist: Wishlist | null
  currentUser: string | null
}) {
  return (
    <div>
      {items.map((item) => (
        <Item
          key={item.id}
          item={item}
          togglePurchased={togglePurchased}
          removeItem={removeItem}
          showPurchased={showPurchased}
          currentWishlist={currentWishlist}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}

type RealtimePayload = {
  new: Item & { wishlist_id: string; user_id: string }
  old: Item & { wishlist_id: string; user_id: string }
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
}

export default function WishList() {
  const [items, setItems] = useState<Item[]>([])
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [currentWishlist, setCurrentWishlist] = useState<Wishlist | null>(null)
  const [showPurchased, setShowPurchased] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fetchUserAndWishlists = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const currentUserId = userData?.user?.id || null
      setCurrentUser(currentUserId)

      const wishlistId = searchParams.get('wishlist')

      // If there's a wishlist ID in the URL, fetch it regardless of auth status
      if (wishlistId) {
        const { data: sharedWishlist, error: sharedError } = await supabase
          .from('wishlists')
          .select('*')
          .eq('id', wishlistId)
          .single()

        if (sharedError) {
          console.error('Error fetching shared wishlist:', sharedError.message)
          return
        }

        if (sharedWishlist) {
          setCurrentWishlist(sharedWishlist)
          return
        }
      }

      // If no wishlist ID in URL and user is not authenticated, redirect to auth
      if (!currentUserId) {
        const currentUrl = `${window.location.pathname}${window.location.search}`
        router.push(`/auth?redirect=${encodeURIComponent(currentUrl)}`)
        return
      }

      // Fetch user's own wishlists
      const { data: ownWishlists, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', currentUserId)

      if (error) {
        console.error('Error fetching wishlists:', error.message)
        return
      }

      // Get shared wishlists from localStorage
      const sharedWishlists = getSharedWishlists()

      // Combine own wishlists with all shared wishlists
      const allWishlists = [...ownWishlists, ...sharedWishlists]
      setWishlists(allWishlists)

      // Set current wishlist to first wishlist
      if (allWishlists.length > 0) {
        setCurrentWishlist(allWishlists[0])
      } else {
        router.push('/create-wishlist')
      }
    }

    fetchUserAndWishlists()
  }, [searchParams, router])

  useEffect(() => {
    if (currentWishlist) {
      const fetchItems = async () => {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .eq('wishlist_id', currentWishlist.id)
          .order('created_at', { ascending: false })
        if (error) {
          console.error('Error fetching items:', error.message)
        } else {
          setItems(data || [])
        }
      }

      fetchItems()
    }
  }, [currentWishlist])

  useEffect(() => {
    if (!currentWishlist) return

    console.log('Subscribing to items for wishlist', currentWishlist.id)

    const channel = supabase
      .channel(`items:wishlist_id=eq.${currentWishlist.id}`)
      .on<Item>(
        'postgres_changes' as 'system',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `wishlist_id=eq.${currentWishlist.id}`,
        },
        (payload: RealtimePayload) => {
          console.log('Change received!', payload)
          switch (payload.eventType) {
            case 'INSERT':
              setItems((items) => [payload.new as Item, ...items])
              if (payload.new.user_id !== currentUser) {
                toast.info(`New item added: ${payload.new.name}`)
              }
              break
            case 'DELETE':
              setItems((items) =>
                items.filter((item) => item.id !== payload.old.id)
              )
              break
            case 'UPDATE':
              setItems((items) =>
                items.map((item) =>
                  item.id === payload.new.id ? (payload.new as Item) : item
                )
              )
              break
          }
        }
      )
      .subscribe()

    return () => {
      if (channel) {
        console.log('Unsubscribing from items for wishlist', currentWishlist.id)

        channel.unsubscribe()
      }
    }
  }, [currentWishlist, currentUser])

  const addItem = async (item: Item) => {
    if (!currentWishlist) return
    const newItem = {
      ...item,
      wishlist_id: currentWishlist.id,
    }
    const { error } = await supabase.from('items').insert([newItem])
    if (error) {
      console.error('Error adding item:', error.message)
      toast.error('Failed to add item')
    }
  }

  const togglePurchased = async (id: string) => {
    const item = items.find((item) => item.id === id)
    if (item) {
      const newPurchasedState = !item.purchased
      const { error } = await supabase
        .from('items')
        .update({ purchased: newPurchasedState })
        .eq('id', id)
      if (error) {
        console.error('Error updating item:', error.message)
      } else {
        setItems(
          items.map((item) =>
            item.id === id ? { ...item, purchased: newPurchasedState } : item
          )
        )
        toast.success(
          `${item.name} marked as ${
            newPurchasedState ? 'purchased' : 'not purchased'
          }`
        )
      }
    }
  }

  const removeItem = async (id: string) => {
    const { error } = await supabase.from('items').delete().eq('id', id)
    if (error) {
      console.error('Error removing item:', error.message)
    } else {
      setItems(items.filter((item) => item.id !== id))
      toast.success('Item removed from your wish list')
    }
  }

  const shareList = () => {
    if (!currentWishlist) return
    const url = `${window.location.origin}${window.location.pathname}?wishlist=${currentWishlist.id}`
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success('Share link copied to clipboard!')
      },
      (err) => {
        console.error('Could not copy text: ', err)
        toast.error('Failed to copy share link')
      }
    )
  }

  const handleShowPurchasedChange = (checked: boolean) => {
    if (checked && currentWishlist?.user_id === currentUser) {
      const confirm = window.confirm(
        'Are you sure you want to show purchased items? This may spoil the surprise.'
      )
      if (!confirm) {
        return
      }
    }
    setShowPurchased(checked)
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold">Wish List</h1>
        </CardHeader>
        <CardContent>
          {currentUser && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <Select
                onValueChange={(id) => {
                  const selectedWishlist = wishlists.find((w) => w.id === id)
                  setCurrentWishlist(selectedWishlist || null)
                  setShowPurchased(false)
                }}
                value={currentWishlist?.id ?? wishlists[0]?.id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Wishlist" />
                </SelectTrigger>
                <SelectContent>
                  {wishlists.map((wishlist) => (
                    <SelectItem key={wishlist.id} value={wishlist.id}>
                      {wishlist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild className="w-full sm:w-auto sm:px-2.5">
                <Link href="/create-wishlist">
                  <Plus className="w-4 h-4" />
                  <span className="sm:sr-only">Create New Wishlist</span>
                </Link>
              </Button>
            </div>
          )}
          <Tabs defaultValue="view">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="view" className="grow">
                View
              </TabsTrigger>
              {currentWishlist?.user_id === currentUser && (
                <TabsTrigger value="edit" className="grow">
                  Edit
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="view">
              <h2 className="text-lg font-semibold mb-2">
                {currentWishlist?.name}
              </h2>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                {currentWishlist?.user_id !== currentUser && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={showPurchased}
                      onCheckedChange={handleShowPurchasedChange}
                      id="show-purchased"
                    />
                    <Label htmlFor="show-purchased">Show purchased items</Label>
                  </div>
                )}
                <Button onClick={shareList}>
                  <Share2 className="w-4 h-4" />
                  Share List
                </Button>
              </div>
              <ItemList
                items={items}
                togglePurchased={togglePurchased}
                removeItem={removeItem}
                showPurchased={showPurchased}
                currentWishlist={currentWishlist}
                currentUser={currentUser}
              />
            </TabsContent>
            {currentWishlist?.user_id === currentUser && (
              <TabsContent value="edit">
                <AddItemForm addItem={addItem} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
