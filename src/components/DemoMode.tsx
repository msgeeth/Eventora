import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ArrowLeft, Crown, User, Building, TestTube, Sparkles, Eye, Code, Settings } from 'lucide-react'

interface DemoModeProps {
  onDemoLogin: (userType: 'buyer' | 'provider', profile: any) => void
  onBack: () => void
}

export function DemoMode({ onDemoLogin, onBack }: DemoModeProps) {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const demoAccounts = {
    buyer: {
      user: {
        id: 'demo-buyer-001',
        email: 'demo.buyer@eventora.lk',
        user_metadata: {
          name: 'Kavitha Perera',
          user_type: 'buyer'
        }
      },
      profile: {
        id: 'demo-buyer-001',
        email: 'demo.buyer@eventora.lk',
        name: 'Kavitha Perera',
        user_type: 'buyer',
        points: 150,
        draft_events: [
          {
            id: 'draft_1',
            event_type: 'Wedding',
            budget: 500000,
            location: 'Colombo',
            date: '2024-12-15',
            description: 'Traditional Kandyan wedding ceremony with 200 guests',
            progress: 45,
            selected_services: [],
            created_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'draft_2',
            event_type: 'Birthday Party',
            budget: 75000,
            location: 'Kandy',
            date: '2024-11-20',
            description: '25th birthday celebration with close friends',
            progress: 20,
            selected_services: [],
            created_at: '2024-01-20T15:30:00Z'
          }
        ],
        created_at: '2024-01-01T00:00:00Z'
      }
    },
    provider: {
      user: {
        id: 'demo-provider-001',
        email: 'demo.provider@eventora.lk',
        user_metadata: {
          name: 'Saman Photography',
          user_type: 'service_provider'
        }
      },
      profile: {
        id: 'demo-provider-001',
        email: 'demo.provider@eventora.lk',
        name: 'Saman Rathnayake',
        business_name: 'Saman Photography Studio',
        service_type: 'photography',
        location: 'Colombo, Gampaha, Kalutara',
        business_registration: 'BR/2020/12345',
        description: 'Professional wedding and event photography with 10+ years experience',
        user_type: 'service_provider',
        verification_status: 'approved',
        is_verified: true,
        advance_percentage: 30,
        rating: 4.8,
        total_ratings: 125,
        services: [
          {
            id: 'service_1',
            provider_id: 'demo-provider-001',
            name: 'Wedding Photography Package',
            description: 'Complete wedding day coverage with edited photos',
            price: 85000,
            category: 'photography',
            images: [],
            created_at: '2024-01-01T00:00:00Z',
            is_active: true
          },
          {
            id: 'service_2',
            provider_id: 'demo-provider-001',
            name: 'Pre-wedding Shoot',
            description: 'Romantic pre-wedding photoshoot at scenic locations',
            price: 35000,
            category: 'photography',
            images: [],
            created_at: '2024-01-05T00:00:00Z',
            is_active: true
          }
        ],
        calendar_events: {
          '2024-12-15': { booked: true, event: 'Wedding - Kavitha & Nuwan' },
          '2024-12-22': { booked: true, event: 'Corporate Event - ABC Company' }
        },
        created_at: '2024-01-01T00:00:00Z'
      }
    }
  }

  const handleDemoLogin = (type: 'buyer' | 'provider') => {
    const account = demoAccounts[type]
    
    // Set demo token
    localStorage.setItem('access_token', `demo-token-${type}-${Date.now()}`)
    localStorage.setItem('demo_mode', 'true')
    localStorage.setItem('demo_user_type', type)
    
    onDemoLogin(type, account.profile)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f5e6d3] to-[#e8d5c4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="mb-6 text-[#8b5a3c] hover:text-[#d4777a] hover:bg-[#f5e6d3]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center justify-center mb-6 animate-float">
            <Crown className="h-12 w-12 text-[#d4777a] mr-3 animate-pulse-glow" />
            <h1 className="font-script text-5xl text-[#8b5a3c] font-bold">EVENTORA</h1>
          </div>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <TestTube className="h-6 w-6 text-[#d4777a]" />
            <h2 className="font-display text-3xl text-[#2c1810]">Demo Mode</h2>
            <Badge className="bg-[#d4777a] text-white ml-3">Testing Environment</Badge>
          </div>
          <p className="text-[#6d4c32] text-lg leading-relaxed max-w-2xl mx-auto">
            Explore EVENTORA's features with pre-loaded demo accounts. Perfect for testing and previewing 
            all functionality without OAuth setup.
          </p>
        </div>

        {/* Demo Account Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Buyer Demo */}
          <Card className={`border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedDemo === 'buyer' ? 'ring-4 ring-[#d4777a]' : ''}`}
                onClick={() => setSelectedDemo(selectedDemo === 'buyer' ? null : 'buyer')}>
            <CardHeader className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] text-white text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <User className="h-8 w-8" />
              </div>
              <CardTitle className="font-display text-2xl">Event Planner Demo</CardTitle>
              <CardDescription className="text-white/90">
                Experience the buyer's journey
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Name:</span>
                  <span className="font-semibold text-[#2c1810]">Kavitha Perera</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Email:</span>
                  <span className="font-medium text-[#2c1810]">demo.buyer@eventora.lk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Points:</span>
                  <span className="font-semibold text-[#d4777a]">150 points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Draft Events:</span>
                  <span className="font-semibold text-[#2c1810]">2 drafts</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-display text-lg text-[#2c1810] mb-3">What you'll see:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#d4777a] mr-2" />
                    Event Planning
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#d4777a] mr-2" />
                    Service Search
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#d4777a] mr-2" />
                    Shopping Cart
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#d4777a] mr-2" />
                    Messaging
                  </div>
                </div>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleDemoLogin('buyer')
                }}
                className="w-full mt-6 bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-semibold py-3 rounded-xl transition-all duration-300"
              >
                <User className="h-5 w-5 mr-2" />
                Login as Event Planner
              </Button>
            </CardContent>
          </Card>

          {/* Provider Demo */}
          <Card className={`border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${selectedDemo === 'provider' ? 'ring-4 ring-[#8b5a3c]' : ''}`}
                onClick={() => setSelectedDemo(selectedDemo === 'provider' ? null : 'provider')}>
            <CardHeader className="bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] text-white text-center pb-8">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <Building className="h-8 w-8" />
              </div>
              <CardTitle className="font-display text-2xl">Service Provider Demo</CardTitle>
              <CardDescription className="text-white/90">
                Experience the vendor dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Business:</span>
                  <span className="font-semibold text-[#2c1810]">Saman Photography</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Owner:</span>
                  <span className="font-medium text-[#2c1810]">Saman Rathnayake</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Rating:</span>
                  <span className="font-semibold text-[#d4777a]">4.8★ (125 reviews)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d4c32]">Status:</span>
                  <Badge className="bg-green-500">Verified</Badge>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-display text-lg text-[#2c1810] mb-3">What you'll see:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#8b5a3c] mr-2" />
                    Dashboard Analytics
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#8b5a3c] mr-2" />
                    Service Management
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#8b5a3c] mr-2" />
                    Calendar View
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 text-[#8b5a3c] mr-2" />
                    Order Management
                  </div>
                </div>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleDemoLogin('provider')
                }}
                className="w-full mt-6 bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] hover:from-[#d4777a] hover:to-[#8b5a3c] text-white font-semibold py-3 rounded-xl transition-all duration-300"
              >
                <Building className="h-5 w-5 mr-2" />
                Login as Service Provider
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TestTube className="h-12 w-12 text-[#d4777a] mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#2c1810] mb-2">Safe Testing</h3>
              <p className="text-[#6d4c32] text-sm">
                All demo data is isolated and won't affect the real platform.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Code className="h-12 w-12 text-[#8b5a3c] mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#2c1810] mb-2">Full Features</h3>
              <p className="text-[#6d4c32] text-sm">
                Experience all functionality including messaging, orders, and analytics.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Settings className="h-12 w-12 text-[#d4777a] mx-auto mb-4" />
              <h3 className="font-display text-lg text-[#2c1810] mb-2">No Setup</h3>
              <p className="text-[#6d4c32] text-sm">
                No OAuth configuration needed. Perfect for development and testing.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Notice */}
        <div className="mt-12">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400">
            <CardContent className="p-6">
              <div className="flex items-start">
                <Sparkles className="h-6 w-6 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-display text-lg text-yellow-800 mb-2">Demo Mode Active</h3>
                  <p className="text-yellow-700 leading-relaxed">
                    You're in testing mode with sample data. This is perfect for exploring features 
                    without setting up OAuth or creating real accounts. When you're ready for production, 
                    simply configure your Google OAuth credentials and disable demo mode.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700">Testing Environment</Badge>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700">Sample Data</Badge>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700">Safe to Explore</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}