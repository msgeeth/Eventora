import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface PlanEventFormProps {
  onEventCreated: (event: any) => void
  onCancel: () => void
}

export function PlanEventForm({ onEventCreated, onCancel }: PlanEventFormProps) {
  const [formData, setFormData] = useState({
    event_type: '',
    budget: '',
    location: '',
    date: undefined as Date | undefined,
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
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
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/events/draft`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            budget: parseFloat(formData.budget),
            date: formData.date?.toISOString()
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event draft')
      }

      const data = await response.json()
      onEventCreated(data.draft)
    } catch (err: any) {
      console.error('Error creating event draft:', err)
      setError(err.message || 'Failed to create event draft')
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
          <Label htmlFor="event_type">Event Type</Label>
          <Select onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="birthday">Birthday Party</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="religious">Religious Ceremony</SelectItem>
              <SelectItem value="graduation">Graduation</SelectItem>
              <SelectItem value="baby_shower">Baby Shower</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budget">Budget (LKR)</Label>
          <Input
            id="budget"
            type="number"
            placeholder="e.g. 500000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location/Area</Label>
          <Input
            id="location"
            type="text"
            placeholder="e.g. Colombo, Kandy, Galle"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Event Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? formatDate(formData.date) : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => setFormData({ ...formData, date })}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Event Description</Label>
        <Textarea
          id="description"
          placeholder="Tell us more about your event..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Creating...' : 'Create Event Draft'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}