'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
}

type Wishlist = {
  id: string
  name: string
  user_id: string
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/og-image?url=${encodeURIComponent(url)}`)
    const data = await res.json()
    console.log('Fetched OG Image:', data.ogImage)
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
    toast.success(`${data.name} added to your wish list`)
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
  console.log('Rendering item with OG Image:', item.og_image)
  return (
    <Card
      className={`mb-4 ${item.purchased && showPurchased ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-3">
          {item.og_image ? (
            <div className="flex-shrink-0 w-24 h-24 relative overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.og_image}
                alt={`Image for ${item.name}`}
                className="absolute inset-0 object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div
            className={`flex-grow ${
              item.purchased && showPurchased ? 'line-through' : ''
            }`}
          >
            <h3 className="text-lg font-semibold">{item.name}</h3>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center"
              >
                <LinkIcon className="w-4 h-4 mr-1" />
                View Item
              </a>
            )}
            {item.notes && <p className="text-gray-600 mt-2">{item.notes}</p>}
          </div>
          <div className="flex items-center space-x-2">
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
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
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
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        console.error('User not authenticated:', userError?.message)
        const currentUrl = `${window.location.pathname}${window.location.search}`
        router.push(`/auth?redirect=${encodeURIComponent(currentUrl)}`)
        return
      }

      setCurrentUser(userData.user.id)

      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userData.user.id)

      if (error) {
        console.error('Error fetching wishlists:', error.message)
      } else {
        const wishlistId = searchParams.get('wishlist')
        let currentWishlistData =
          data?.find((w) => w.id === wishlistId) || data?.[0]

        if (wishlistId && !currentWishlistData) {
          // Fetch the wishlist details if it's not in the list
          const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlists')
            .select('*')
            .eq('id', wishlistId)
            .single()

          console.log('wishlistData', wishlistData)

          if (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError.message)
            router.push('/create-wishlist')
            return
          }

          if (wishlistData) {
            setWishlists(() => [
              ...data,
              {
                ...wishlistData,
                name: wishlistData.name + ' (Shared)',
              },
            ])
            currentWishlistData = wishlistData
          }
        } else {
          setWishlists(data || [])
        }

        if (!currentWishlistData) {
          router.push('/create-wishlist')
        } else {
          setCurrentWishlist(currentWishlistData)
        }
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
        if (error) {
          console.error('Error fetching items:', error.message)
        } else {
          setItems(data || [])
        }
      }

      fetchItems()
    }
  }, [currentWishlist])

  const addItem = async (item: Item) => {
    if (!currentWishlist) return
    const { error } = await supabase
      .from('items')
      .insert([{ ...item, wishlist_id: currentWishlist.id }])
    if (error) {
      console.error('Error adding item:', error.message)
    } else {
      setItems([...items, item])
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
      <h1 className="text-3xl font-bold mb-6">Christmas Wish List</h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <Select
          onValueChange={(id) => {
            const selectedWishlist = wishlists.find((w) => w.id === id)
            setCurrentWishlist(selectedWishlist || null)
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
      <Tabs defaultValue="view">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="view" className="flex-grow">
            View
          </TabsTrigger>
          {currentWishlist?.user_id === currentUser && (
            <TabsTrigger value="edit" className="flex-grow">
              Edit
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="view">
          <h2 className="text-lg font-semibold mb-2">
            {currentWishlist?.name}
          </h2>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showPurchased}
                onCheckedChange={handleShowPurchasedChange}
                id="show-purchased"
              />
              <Label htmlFor="show-purchased">Show purchased items</Label>
            </div>
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
    </div>
  )
}
