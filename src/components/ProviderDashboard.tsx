import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { AddServiceForm } from './AddServiceForm'
import { MessagingPanel } from './MessagingPanel'
import { ProviderCalendar } from './ProviderCalendar'
import { OrderManagement } from './OrderManagement'
import { PortfolioBuilder } from './PortfolioBuilder'
import { 
  Heart, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  Crown,
  Camera
} from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface ProviderDashboardProps {
  user: any
  profile: any
  onLogout: () => void
}

export function ProviderDashboard({ user, profile, onLogout }: ProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalBookings: 0,
    rating: 0,
    earnings: 0
  })
  const [showAddServiceForm, setShowAddServiceForm] = useState(false)

  useEffect(() => {
    loadServices()
    loadOrders()
    loadAnalytics()
  }, [])

  const loadServices = async () => {
    try {
      setServices(profile.services || [])
    } catch (error) {
      console.error('Error loading services:', error)
    }
  }

  const loadOrders = async () => {
    try {
      // In a real app, you'd fetch orders from the backend
      setOrders([])
    } catch (error) {
      console.error('Error loading orders:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - in a real app, this would come from the backend
      setAnalytics({
        totalViews: Math.floor(Math.random() * 1000),
        totalBookings: Math.floor(Math.random() * 50),
        rating: profile.rating || 0,
        earnings: Math.floor(Math.random() * 100000)
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const handleServiceAdded = (newService: any) => {
    setServices([...services, newService])
    setShowAddServiceForm(false)
  }

  const getVerificationBadge = () => {
    switch (profile.verification_status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const canSellServices = profile.verification_status === 'approved'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce]">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-[#e8b4b8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-[#e8b4b8] mr-3" />
              <div>
                <h1 className="font-display text-3xl text-[#2c2c2c] leading-none">EVENTORA</h1>
                <span className="text-sm text-[#2c2c2c]/70 font-medium">Artisan Provider Studio</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="font-medium text-[#2c2c2c]">{profile.business_name}</p>
                <div className="flex items-center justify-end space-x-2 mt-1">
                  {getVerificationBadge()}
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="border-[#e8b4b8]/30 text-[#2c2c2c] hover:bg-[#e8b4b8]/10 hover:border-[#e8b4b8]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Alert */}
        {!canSellServices && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {profile.verification_status === 'pending' 
                ? 'Your account is under review. You will be able to add and sell services once verified.'
                : profile.verification_status === 'rejected'
                ? 'Your account verification was rejected. Please contact support for more information.'
                : 'Your account needs to be verified before you can start selling services.'
              }
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-white/95 backdrop-blur-sm border border-[#e8b4b8]/20 rounded-2xl p-2">
            <TabsTrigger value="overview" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <Camera className="h-4 w-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <Users className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white rounded-xl">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="luxury-card premium-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#2c2c2c]">Profile Views</CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#e8b4b8]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#2c2c2c]">{analytics.totalViews}</div>
                  <p className="text-xs text-[#2c2c2c]/70">This month</p>
                </CardContent>
              </Card>

              <Card className="luxury-card premium-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#2c2c2c]">Total Bookings</CardTitle>
                  <Users className="h-4 w-4 text-[#e8b4b8]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#2c2c2c]">{analytics.totalBookings}</div>
                  <p className="text-xs text-[#2c2c2c]/70">All time</p>
                </CardContent>
              </Card>

              <Card className="luxury-card premium-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#2c2c2c]">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-[#d4af37]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center text-[#2c2c2c]">
                    {analytics.rating.toFixed(1)}
                    <Star className="h-4 w-4 text-[#d4af37] ml-1 fill-current" />
                  </div>
                  <p className="text-xs text-[#2c2c2c]/70">{profile.total_ratings || 0} reviews</p>
                </CardContent>
              </Card>

              <Card className="luxury-card premium-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#2c2c2c]">Total Earnings</CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#e8b4b8]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#2c2c2c]">LKR {analytics.earnings.toLocaleString()}</div>
                  <p className="text-xs text-[#2c2c2c]/70">All time</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Recent Activity</CardTitle>
                  <CardDescription className="text-[#2c2c2c]/70">Your latest bookings and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.length === 0 ? (
                      <p className="text-[#2c2c2c]/70 text-center py-8">No recent activity</p>
                    ) : (
                      orders.slice(0, 5).map((order: any, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-[#2c2c2c]">New booking request</p>
                            <p className="text-sm text-[#2c2c2c]/70">Wedding Photography</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-[#2c2c2c]/70">2 hours ago</p>
                            <Badge variant="outline" className="border-[#e8b4b8] text-[#e8b4b8]">Pending</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Profile Completion</CardTitle>
                  <CardDescription className="text-[#2c2c2c]/70">Complete your profile to attract more clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1 text-[#2c2c2c]">
                        <span>Profile completion</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="bg-[#f7e7ce]/50 [&>div]:bg-gradient-to-r [&>div]:from-[#e8b4b8] [&>div]:to-[#d4a5a9]" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Business information added
                      </div>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Account verification submitted
                      </div>
                      <div className="flex items-center text-[#2c2c2c]/70">
                        <Clock className="h-4 w-4 mr-2" />
                        Create premium portfolio
                      </div>
                      <div className="flex items-center text-[#2c2c2c]/70">
                        <Clock className="h-4 w-4 mr-2" />
                        Add signature services
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-6">
            <PortfolioBuilder user={user} profile={profile} />
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-3xl text-[#2c2c2c] mb-2">Signature Services</h2>
                <p className="text-[#2c2c2c]/70">Curate your premium service offerings</p>
              </div>
              <Button 
                onClick={() => setShowAddServiceForm(true)}
                disabled={!canSellServices}
                className="bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] hover:from-[#d4a5a9] to-[#e8b4b8] premium-button"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {showAddServiceForm && (
              <Card className="mb-6 luxury-card">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Add New Service</CardTitle>
                  <CardDescription className="text-[#2c2c2c]/70">Create a new premium service offering for your clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddServiceForm
                    onServiceAdded={handleServiceAdded}
                    onCancel={() => setShowAddServiceForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <Card key={service.id} className="luxury-card premium-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-[#2c2c2c]">{service.name}</CardTitle>
                      <Badge variant={service.is_active ? "default" : "secondary"} className={service.is_active ? "bg-[#e8b4b8]" : ""}>
                        {service.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="text-[#2c2c2c]/70">{service.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#2c2c2c]/80 mb-4">{service.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#2c2c2c]">LKR {service.price?.toLocaleString()}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-[#e8b4b8]/30 text-[#e8b4b8] hover:bg-[#e8b4b8]/10">Edit</Button>
                        <Button size="sm" variant="ghost" className="text-[#2c2c2c]/70 hover:bg-[#f7e7ce]/30">
                          {service.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {services.length === 0 && (
                <Card className="col-span-full luxury-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Settings className="h-12 w-12 text-[#e8b4b8]/50 mb-4" />
                    <h3 className="text-lg text-[#2c2c2c] mb-2">No Services Yet</h3>
                    <p className="text-[#2c2c2c]/70 text-center mb-4">
                      {canSellServices 
                        ? "Start curating your premium service offerings to attract discerning clients."
                        : "Complete verification to begin adding your signature services."
                      }
                    </p>
                    {canSellServices && (
                      <Button 
                        onClick={() => setShowAddServiceForm(true)}
                        className="bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] hover:from-[#d4a5a9] to-[#e8b4b8] premium-button"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Service
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <ProviderCalendar providerId={user.id} />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <OrderManagement providerId={user.id} />
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <MessagingPanel userId={user.id} userType="service_provider" />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Business Information</CardTitle>
                  <CardDescription className="text-[#2c2c2c]/70">Update your business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c]">Business Name</label>
                    <p className="text-[#2c2c2c] font-medium">{profile.business_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c]">Service Type</label>
                    <p className="text-[#2c2c2c] font-medium">{profile.service_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c]">Location</label>
                    <p className="text-[#2c2c2c] font-medium">{profile.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c]">Business Registration</label>
                    <p className="text-[#2c2c2c] font-medium">{profile.business_registration}</p>
                  </div>
                  <Button variant="outline" className="border-[#e8b4b8]/30 text-[#e8b4b8] hover:bg-[#e8b4b8]/10">
                    Edit Information
                  </Button>
                </CardContent>
              </Card>

              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-[#2c2c2c]">Payment Settings</CardTitle>
                  <CardDescription className="text-[#2c2c2c]/70">Manage your advance payment requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c]">Advance Payment Percentage</label>
                    <p className="text-[#2c2c2c] font-medium">{profile.advance_percentage || 30}%</p>
                    <p className="text-xs text-[#2c2c2c]/70">
                      Clients will pay this percentage upfront when booking
                    </p>
                  </div>
                  <Button variant="outline" className="border-[#e8b4b8]/30 text-[#e8b4b8] hover:bg-[#e8b4b8]/10">
                    Update Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}