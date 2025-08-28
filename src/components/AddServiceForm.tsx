import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Card, CardContent } from './ui/card'
import { Upload, X, Image } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AddServiceFormProps {
  onServiceAdded: (service: any) => void
  onCancel: () => void
}

export function AddServiceForm({ onServiceAdded, onCancel }: AddServiceFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  })
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'image')

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataUpload
        }
      )

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      setImages([...images, data.url])
    } catch (err: any) {
      console.error('Error uploading image:', err)
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/services`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price),
            images
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create service')
      }

      const data = await response.json()
      onServiceAdded(data.service)
    } catch (err: any) {
      console.error('Error creating service:', err)
      setError(err.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Service Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Wedding Photography Package"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="catering">Catering</SelectItem>
              <SelectItem value="decoration">Decoration</SelectItem>
              <SelectItem value="venue">Venue</SelectItem>
              <SelectItem value="music">Music & Entertainment</SelectItem>
              <SelectItem value="flowers">Flowers</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="makeup">Makeup & Beauty</SelectItem>
              <SelectItem value="planning">Event Planning</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="price">Price (LKR)</Label>
        <Input
          id="price"
          type="number"
          placeholder="e.g. 150000"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Service Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your service in detail..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      {/* Image Upload */}
      <div>
        <Label>Service Images</Label>
        <div className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> service images
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {uploading && (
            <div className="text-center">
              <div className="w-6 h-6 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Uploading image...</p>
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-2">
                    <div className="relative">
                      <img
                        src={image}
                        alt={`Service image ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading} className="flex-1">
          {loading ? 'Creating Service...' : 'Create Service'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}