import React, { useState, useEffect } from 'react'
import { AuthProvider } from './components/AuthContext'
import { LoginForm } from './components/LoginForm'
import { BuyerDashboard } from './components/BuyerDashboard'
import { ProviderDashboard } from './components/ProviderDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { AdminAuth } from './components/AdminAuth'
import { DemoMode } from './components/DemoMode'
import { LandingPage } from './components/LandingPage'
import { projectId } from './utils/supabase/info'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce]">
        <AppContent />
      </div>
    </AuthProvider>
  )
}

function AppContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'dashboard' | 'admin' | 'admin-auth' | 'demo'>('landing')
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    checkSession()
    // Check for admin session
    checkAdminSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const isDemoMode = localStorage.getItem('demo_mode') === 'true'
      
      if (token && isDemoMode) {
        // Handle demo mode
        const demoUserType = localStorage.getItem('demo_user_type')
        if (demoUserType) {
          // Load demo profile based on user type
          handleDemoLogin(demoUserType as 'buyer' | 'provider')
        }
        setIsLoading(false)
        return
      }
      
      if (token && !isDemoMode) {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
          setUserProfile(data.profile)
          setCurrentView('dashboard')
        } else {
          // Clear invalid tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('demo_mode')
          localStorage.removeItem('demo_user_type')
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
      // Clear potentially corrupted tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('demo_mode')
      localStorage.removeItem('demo_user_type')
    } finally {
      setIsLoading(false)
    }
  }

  const checkAdminSession = () => {
    const adminSession = localStorage.getItem('admin_session')
    if (adminSession) {
      try {
        const { authenticated, expires } = JSON.parse(adminSession)
        if (authenticated && Date.now() < expires) {
          setIsAdminAuthenticated(true)
        } else {
          localStorage.removeItem('admin_session')
          setIsAdminAuthenticated(false)
        }
      } catch (error) {
        console.error('Error parsing admin session:', error)
        localStorage.removeItem('admin_session')
        setIsAdminAuthenticated(false)
      }
    }
  }

  const handleLogin = (userData: any, profileData: any) => {
    setUser(userData)
    setUserProfile(profileData)
    setCurrentView('dashboard')
  }

  const handleDemoLogin = (userType: 'buyer' | 'provider', providedProfile?: any) => {
    // Set demo mode flag
    localStorage.setItem('demo_mode', 'true')
    localStorage.setItem('demo_user_type', userType)
    localStorage.setItem('access_token', `demo-token-${userType}-${Date.now()}`)

    // Demo account data
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
          portfolio_limits: {
            max_images: 5,
            max_videos: 1,
            current_images: 0,
            current_videos: 0
          },
          calendar_events: {
            '2024-12-15': { booked: true, event: 'Wedding - Kavitha & Nuwan' },
            '2024-12-22': { booked: true, event: 'Corporate Event - ABC Company' }
          },
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    }

    const account = demoAccounts[userType]
    setUser(account.user)
    setUserProfile(providedProfile || account.profile)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('demo_mode')
    localStorage.removeItem('demo_user_type')
    setUser(null)
    setUserProfile(null)
    setCurrentView('landing')
  }

  const handleAdminAccess = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin')
    } else {
      setCurrentView('admin-auth')
    }
  }

  const handleAdminAuthenticated = () => {
    setIsAdminAuthenticated(true)
    setCurrentView('admin')
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session')
    setIsAdminAuthenticated(false)
    setCurrentView('landing')
  }

  // Loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce]">
        <div className="text-center p-8 luxury-card rounded-3xl shadow-2xl">
          <div className="w-16 h-16 border-4 border-[#e8b4b8] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="font-display text-3xl mb-4 text-[#2c2c2c]">Loading EVENTORA</h2>
          <p className="text-[#2c2c2c]/70">Preparing your luxury experience...</p>
        </div>
      </div>
    )
  }

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLogin={() => setCurrentView('login')}
        onAdminAccess={handleAdminAccess}
      />
    )
  }

  if (currentView === 'login') {
    return (
      <div>
        <LoginForm
          onSuccess={handleLogin}
          onBack={() => setCurrentView('landing')}
        />
        {/* Demo Mode Access - For testing purposes */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-[#d4777a]/20">
            <p className="text-sm text-[#6d4c32] mb-3 font-medium">
              🧪 Pilot Test Mode:
            </p>
            <button 
              onClick={() => setCurrentView('demo')}
              className="w-full bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] text-white px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-all duration-300"
            >
              Try Demo Version
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'demo') {
    return (
      <DemoMode
        onDemoLogin={handleDemoLogin}
        onBack={() => setCurrentView('landing')}
      />
    )
  }

  if (currentView === 'admin-auth') {
    return (
      <AdminAuth
        onAuthenticated={handleAdminAuthenticated}
        onBack={() => setCurrentView('landing')}
      />
    )
  }

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBack={() => setCurrentView('landing')}
        onLogout={handleAdminLogout}
      />
    )
  }

  if (currentView === 'dashboard' && user && userProfile) {
    if (userProfile.user_type === 'buyer') {
      return (
        <BuyerDashboard
          user={user}
          profile={userProfile}
          onLogout={handleLogout}
        />
      )
    } else if (userProfile.user_type === 'service_provider') {
      return (
        <ProviderDashboard
          user={user}
          profile={userProfile}
          onLogout={handleLogout}
        />
      )
    }
  }

  // Fallback error state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce]">
      <div className="text-center p-8 luxury-card rounded-3xl shadow-2xl max-w-md">
        <h2 className="font-display text-3xl mb-4 text-[#2c2c2c]">Welcome to EVENTORA</h2>
        <p className="text-[#2c2c2c]/70 mb-6">Sri Lanka's premier luxury event orchestration platform</p>
        <div className="space-y-4">
          <button 
            onClick={() => setCurrentView('landing')}
            className="w-full bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] text-white px-6 py-3 rounded-xl font-medium hover:scale-105 transition-all duration-300"
          >
            Enter Platform
          </button>
          <button 
            onClick={() => setCurrentView('demo')}
            className="w-full border-2 border-[#e8b4b8] text-[#2c2c2c] px-6 py-3 rounded-xl font-medium hover:bg-[#e8b4b8] hover:text-white transition-all duration-300"
          >
            Try Demo Mode
          </button>
        </div>
      </div>
    </div>
  )
}