import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Calendar } from './ui/calendar'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { CalendarIcon, Plus, Clock, AlertCircle } from 'lucide-react'

interface ProviderCalendarProps {
  providerId: string
}

export function ProviderCalendar({ providerId }: ProviderCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [calendarEvents, setCalendarEvents] = useState<Record<string, any[]>>({})
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'booking', // 'booking' | 'unavailable' | 'note'
    time: ''
  })

  useEffect(() => {
    loadCalendarEvents()
  }, [])

  const loadCalendarEvents = async () => {
    // Mock calendar events - in a real app, this would come from the backend
    const mockEvents = {
      [new Date().toDateString()]: [
        {
          id: '1',
          title: 'Wedding Photography - Sarah & John',
          type: 'booking',
          time: '10:00 AM',
          description: 'Wedding ceremony and reception photography'
        }
      ],
      [new Date(Date.now() + 86400000).toDateString()]: [
        {
          id: '2',
          title: 'Equipment maintenance',
          type: 'unavailable',
          time: 'All day',
          description: 'Camera equipment servicing'
        }
      ]
    }
    setCalendarEvents(mockEvents)
  }

  const addCalendarEvent = () => {
    if (!selectedDate || !newEvent.title) return

    const dateKey = selectedDate.toDateString()
    const eventId = `event_${Date.now()}`
    const eventData = {
      id: eventId,
      ...newEvent,
      date: selectedDate.toISOString()
    }

    setCalendarEvents({
      ...calendarEvents,
      [dateKey]: [...(calendarEvents[dateKey] || []), eventData]
    })

    setNewEvent({ title: '', description: '', type: 'booking', time: '' })
    setShowAddEvent(false)
  }

  const getEventsForDate = (date: Date) => {
    return calendarEvents[date.toDateString()] || []
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-green-500'
      case 'unavailable':
        return 'bg-red-500'
      case 'note':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const hasEvents = (date: Date) => {
    return getEventsForDate(date).length > 0
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Service Calendar
          </CardTitle>
          <CardDescription>
            Manage your bookings, availability, and important dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasEvents: (date) => hasEvents(date)
            }}
            modifiersStyles={{
              hasEvents: { backgroundColor: '#fef3c7', fontWeight: 'bold' }
            }}
          />
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="flex items-center mb-2">
              <div className="w-3 h-3 bg-yellow-200 rounded mr-2"></div>
              Dates with events are highlighted
            </p>
            <p>💡 Remember: You get a notification every day at 10 PM to update your calendar</p>
          </div>
        </CardContent>
      </Card>

      {/* Events for Selected Date */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
            </CardTitle>
            <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Calendar Event</DialogTitle>
                  <DialogDescription>
                    Add a booking, mark unavailability, or add a note for {selectedDate?.toLocaleDateString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g. Wedding Photography"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      placeholder="e.g. 10:00 AM or All day"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <select
                      id="type"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="booking">Booking</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Add details..."
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={addCalendarEvent} className="flex-1">
                      Add Event
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddEvent(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  {event.time && (
                    <p className="text-sm text-gray-600 flex items-center mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.time}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-700">{event.description}</p>
                  )}
                </div>
              ))}
              
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-center py-6">
                  <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No events for this date</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setShowAddEvent(true)}
                  >
                    Add Event
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Select a date to view events</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your next bookings and important dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(calendarEvents)
              .flatMap(([date, events]) => 
                events.map(event => ({ ...event, date: new Date(date) }))
              )
              .filter(event => event.date >= new Date())
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .slice(0, 6)
              .map((event) => (
                <div key={event.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {event.date.toLocaleDateString()}
                    {event.time && ` • ${event.time}`}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-700">{event.description}</p>
                  )}
                </div>
              ))}
          </div>
          
          {Object.keys(calendarEvents).length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">No Upcoming Events</h3>
              <p className="text-gray-600">Start adding events to your calendar to keep track of your bookings.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}