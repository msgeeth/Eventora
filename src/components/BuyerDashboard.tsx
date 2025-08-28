import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { PlanEventForm } from './PlanEventForm'
import { ServiceSearch } from './ServiceSearch'
import { MessagingPanel } from './MessagingPanel'
import { OrderTracking } from './OrderTracking'
import { Crown, Calendar, Search, MessageSquare, ShoppingCart, Star, LogOut, Plus, Sparkles } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface BuyerDashboardProps {
  user: any
  profile: any
  onLogout: () => void
}

export function BuyerDashboard({ user, profile, onLogout }: BuyerDashboardProps) {
  const [activeTab, setActiveTab] = useState('events')
  const [draftEvents, setDraftEvents] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedServices, setSelectedServices] = useState([])
  const [showNewEventForm, setShowNewEventForm] = useState(false)

  useEffect(() => {
    loadDraftEvents()
    loadOrders()
  }, [])

  const loadDraftEvents = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // Draft events are stored in the user profile
      setDraftEvents(profile.draft_events || [])
    } catch (error) {
      console.error('Error loading draft events:', error)
    }
  }

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      // For now, we'll implement a simple order loading
      // In a real app, you'd have a specific endpoint for user orders
      setOrders([])
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const handleEventCreated = (newEvent: any) => {
    setDraftEvents([...draftEvents, newEvent])
    setShowNewEventForm(false)
  }

  const handleServiceSelected = (service: any) => {
    const isSelected = selectedServices.some(s => s.id === service.id)
    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const totalBudget = selectedServices.reduce((sum, service) => sum + service.price, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f5e6d3] to-[#e8d5c4]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-[#d4777a]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center animate-float">
              <Crown className="h-10 w-10 text-[#d4777a] mr-3 animate-pulse-glow" />
              <h1 className="font-script text-4xl text-[#8b5a3c] font-bold">EVENTORA</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-[#6d4c32]">Welcome back,</p>
                <p className="font-display text-lg text-[#2c1810]">{profile.name}</p>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] text-white px-4 py-2 rounded-full">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">{profile.points || 0} points</span>
              </div>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className="text-[#8b5a3c] hover:text-[#d4777a] hover:bg-[#f5e6d3]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-[#d4777a]/20 p-1">
            <TabsTrigger 
              value="events" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" />
              My Events
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Services
            </TabsTrigger>
            <TabsTrigger 
              value="cart" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({selectedServices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="messages" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Star className="h-4 w-4 mr-2" />
              My Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-4xl text-[#2c1810]">My Event Drafts</h2>
              <Button 
                onClick={() => setShowNewEventForm(true)} 
                disabled={draftEvents.length >= 3}
                className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-semibold px-6 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Plan New Event {draftEvents.length >= 3 && '(Max 3)'}
              </Button>
            </div>

            {showNewEventForm && (
              <Card className="mb-8 border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] text-white">
                  <CardTitle className="font-display text-2xl">Plan New Event</CardTitle>
                  <CardDescription className="text-white/90">Create a new event draft to start planning your perfect celebration</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <PlanEventForm
                    onEventCreated={handleEventCreated}
                    onCancel={() => setShowNewEventForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {draftEvents.map((event: any) => (
                <Card key={event.id} className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden group">
                  <CardHeader className="bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-display text-xl text-[#2c1810]">{event.event_type}</CardTitle>
                      <Badge className="bg-[#d4777a] text-white">Draft</Badge>
                    </div>
                    <CardDescription className="text-[#6d4c32] font-medium">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6d4c32]">Budget:</span>
                        <span className="font-semibold text-[#2c1810]">LKR {event.budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6d4c32]">Progress:</span>
                        <span className="font-semibold text-[#2c1810]">{event.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-[#f5e6d3] rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${event.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-[#6d4c32] mt-4 leading-relaxed">{event.description}</p>
                    <div className="flex gap-3 mt-6">
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('search')}
                        className="flex-1 bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-medium rounded-lg transition-all duration-300"
                      >
                        Find Services
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#d4777a] text-[#8b5a3c] hover:bg-[#d4777a] hover:text-white rounded-lg transition-all duration-300"
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {draftEvents.length === 0 && (
                <Card className="col-span-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Calendar className="h-16 w-16 text-[#d4777a] mb-6 animate-float" />
                    <h3 className="font-display text-2xl text-[#2c1810] mb-3">No Events Yet</h3>
                    <p className="text-[#6d4c32] text-center mb-8 max-w-md leading-relaxed">
                      Start planning your perfect event by creating your first draft. Let's make your dreams come true!
                    </p>
                    <Button 
                      onClick={() => setShowNewEventForm(true)}
                      className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-semibold px-8 py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Plan Your First Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-8">
            <ServiceSearch onServiceSelect={handleServiceSelected} selectedServices={selectedServices} />
          </TabsContent>

          <TabsContent value="cart" className="mt-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
                    <CardTitle className="font-display text-2xl text-[#2c1810]">Selected Services</CardTitle>
                    <CardDescription className="text-[#6d4c32]">
                      Review your selected services before booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {selectedServices.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-16 w-16 text-[#d4777a] mx-auto mb-6 animate-float" />
                        <p className="text-[#6d4c32] text-lg mb-6">No services selected yet</p>
                        <Button 
                          className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300" 
                          onClick={() => setActiveTab('search')}
                        >
                          Browse Services
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {selectedServices.map((service: any) => (
                          <div key={service.id} className="flex items-center justify-between p-6 border border-[#d4777a]/20 rounded-xl bg-gradient-to-r from-[#fefcfb] to-[#f5e6d3] hover:shadow-lg transition-all duration-300">
                            <div>
                              <h4 className="font-display text-lg text-[#2c1810]">{service.name}</h4>
                              <p className="text-sm text-[#6d4c32] font-medium">{service.provider?.name}</p>
                              <p className="text-sm text-[#8b5a3c]">{service.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg text-[#2c1810]">LKR {service.price?.toLocaleString()}</p>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleServiceSelected(service)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-2"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] text-white">
                    <CardTitle className="font-display text-2xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[#6d4c32]">
                        <span>Services ({selectedServices.length})</span>
                        <span className="font-medium">LKR {totalBudget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#6d4c32]">
                        <span>Platform Fee</span>
                        <span className="font-medium">LKR {(totalBudget * 0.05).toFixed(0)}</span>
                      </div>
                      <div className="border-t border-[#d4777a]/20 pt-4">
                        <div className="flex justify-between font-bold text-xl text-[#2c1810]">
                          <span>Total</span>
                          <span>LKR {(totalBudget * 1.05).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-8 bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" 
                      disabled={selectedServices.length === 0}
                    >
                      Proceed to Book
                    </Button>
                    <p className="text-xs text-[#6d4c32] mt-4 text-center leading-relaxed">
                      Service providers have 24 hours to accept your booking request
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="messages" className="mt-8">
            <MessagingPanel userId={user.id} userType="buyer" />
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <OrderTracking userId={user.id} userType="buyer" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}