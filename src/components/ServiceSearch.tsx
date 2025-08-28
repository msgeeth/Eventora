import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { Search, Star, MapPin, MessageSquare, ShoppingCart, Check } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface ServiceSearchProps {
  onServiceSelect: (service: any) => void
  selectedServices: any[]
}

export function ServiceSearch({ onServiceSelect, selectedServices }: ServiceSearchProps) {
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    event_type: '',
    location: '',
    budget: ''
  })

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [services, filters])

  const loadServices = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.event_type) params.append('event_type', filters.event_type)
      if (filters.location) params.append('location', filters.location)
      if (filters.budget) params.append('budget', filters.budget)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/services/search?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        console.error('Failed to load services')
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = services

    if (filters.event_type) {
      filtered = filtered.filter((service: any) => 
        service.category?.toLowerCase().includes(filters.event_type.toLowerCase())
      )
    }

    if (filters.location) {
      filtered = filtered.filter((service: any) => 
        service.provider?.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.budget) {
      const maxBudget = parseFloat(filters.budget)
      filtered = filtered.filter((service: any) => service.price <= maxBudget)
    }

    setFilteredServices(filtered)
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId)
  }

  const handleSearch = () => {
    loadServices()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg mb-4">Loading services...</h3>
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Find Perfect Services
          </CardTitle>
          <CardDescription>
            Search and filter services based on your event requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <Select onValueChange={(value) => setFilters({ ...filters, event_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="photography">Photography</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="decoration">Decoration</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div>
              <Input
                type="number"
                placeholder="Max Budget (LKR)"
                value={filters.budget}
                onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
              />
            </div>

            <div>
              <Button onClick={handleSearch} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg text-gray-900 mb-2">No Services Found</h3>
              <p className="text-gray-600 text-center">
                Try adjusting your search filters to find more services.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service: any) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                {service.images && service.images.length > 0 && (
                  <div className="w-full h-48 mb-3 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={service.images[0]}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  {isServiceSelected(service.id) && (
                    <Badge className="bg-green-500">
                      <Check className="h-3 w-3 mr-1" />
                      Added
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  <Badge variant="outline" className="mr-2">{service.category}</Badge>
                  {service.provider && (
                    <div className="flex items-center mt-2 text-sm">
                      <MapPin className="h-3 w-3 mr-1" />
                      {service.provider.location}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                
                {service.provider && (
                  <div className="mb-4">
                    <p className="font-medium text-sm">{service.provider.name}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(service.provider.rating)
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-600 ml-1">
                          ({service.provider.rating?.toFixed(1) || '0.0'})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-rose-600">
                    LKR {service.price?.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={isServiceSelected(service.id) ? "secondary" : "default"}
                    onClick={() => onServiceSelect(service)}
                    className="flex-1"
                  >
                    {isServiceSelected(service.id) ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedServices.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 min-w-64">
          <div className="text-sm font-medium mb-2">
            Selected Services ({selectedServices.length})
          </div>
          <div className="text-lg font-bold text-rose-600 mb-3">
            Total: LKR {selectedServices.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
          </div>
          <Button size="sm" className="w-full">
            View Cart
          </Button>
        </div>
      )}
    </div>
  )
}