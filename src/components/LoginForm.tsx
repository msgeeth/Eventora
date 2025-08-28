import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { ArrowLeft, Crown, Mail, User, Building, Shield, AlertCircle } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface LoginFormProps {
  onSuccess: (user: any, profile: any) => void
  onBack: () => void
}

export function LoginForm({ onSuccess, onBack }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [buyerForm, setBuyerForm] = useState({
    email: '',
    name: ''
  })

  const [providerForm, setProviderForm] = useState({
    email: '',
    password: '',
    name: '',
    business_name: '',
    service_type: '',
    location: '',
    business_registration: '',
    description: ''
  })

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })

  // Check for OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      )

      // Check if user is returning from OAuth
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (session?.access_token && !error) {
        localStorage.setItem('access_token', session.access_token)
        
        // Create or get user profile
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/auth/oauth-callback`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                user: session.user,
                user_type: 'buyer'
              })
            }
          )

          if (response.ok) {
            const data = await response.json()
            onSuccess(data.user, data.profile)
          } else {
            console.error('Failed to create user profile after OAuth')
          }
        } catch (err) {
          console.error('OAuth callback error:', err)
        }
      }
    }

    handleOAuthCallback()
  }, [onSuccess])

  const handleBuyerSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      )
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) throw error
      
      // The redirect will handle the rest
    } catch (err: any) {
      console.error('Buyer signup error:', err)
      setError(err.message || 'Failed to sign up with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/auth/signup-provider`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(providerForm)
        }
      )

      const responseText = await response.text()
      console.log('Provider signup response:', responseText)

      if (!response.ok) {
        let errorMessage = 'Signup failed'
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = JSON.parse(responseText)
      
      // Now sign in
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      )
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: providerForm.email,
        password: providerForm.password
      })
      
      if (signInError) throw signInError
      
      if (signInData.session?.access_token) {
        localStorage.setItem('access_token', signInData.session.access_token)
        
        // Get profile
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${signInData.session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          onSuccess(profileData.user, profileData.profile)
        }
      }
    } catch (err: any) {
      console.error('Provider signup error:', err)
      setError(err.message || 'Failed to create service provider account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProviderLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      )
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      })
      
      if (error) throw error
      
      if (data.session?.access_token) {
        localStorage.setItem('access_token', data.session.access_token)
        
        // Get profile
        const profileResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/auth/profile`,
          {
            headers: {
              'Authorization': `Bearer ${data.session.access_token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          onSuccess(profileData.user, profileData.profile)
        } else {
          throw new Error('Failed to get user profile')
        }
      }
    } catch (err: any) {
      console.error('Provider login error:', err)
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f5e6d3] to-[#e8d5c4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
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
          <p className="text-[#6d4c32] text-lg font-display">Join our exclusive community today</p>
        </div>

        <Tabs defaultValue="buyer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-[#d4777a]/20">
            <TabsTrigger 
              value="buyer" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              Event Planner
            </TabsTrigger>
            <TabsTrigger 
              value="provider"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Building className="h-4 w-4 mr-2" />
              Service Provider
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buyer" className="mt-8">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] text-white text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <User className="h-8 w-8" />
                </div>
                <CardTitle className="font-display text-3xl">Event Planner Signup</CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Plan unforgettable events with verified professionals
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleBuyerSignup} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      {error}
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-[#6d4c32] leading-relaxed">
                      Sign up with your Google account for quick and secure access. 
                      Start planning your perfect event in seconds!
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provider" className="mt-8">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] text-white text-center pb-8">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <CardTitle className="font-display text-3xl">Service Provider Portal</CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Join our verified network and grow your business
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <Tabs defaultValue="signup" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#f5e6d3]/50">
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-[#d4777a] data-[state=active]:text-white"
                    >
                      Sign Up
                    </TabsTrigger>
                    <TabsTrigger 
                      value="login"
                      className="data-[state=active]:bg-[#d4777a] data-[state=active]:text-white"
                    >
                      Sign In
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="signup" className="mt-6">
                    <form onSubmit={handleProviderSignup} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-[#2c1810] font-medium">Your Name</Label>
                          <Input
                            id="name"
                            type="text"
                            value={providerForm.name}
                            onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                            className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="business_name" className="text-[#2c1810] font-medium">Business Name</Label>
                          <Input
                            id="business_name"
                            type="text"
                            value={providerForm.business_name}
                            onChange={(e) => setProviderForm({ ...providerForm, business_name: e.target.value })}
                            className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-[#2c1810] font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={providerForm.email}
                          onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="password" className="text-[#2c1810] font-medium">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={providerForm.password}
                          onChange={(e) => setProviderForm({ ...providerForm, password: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="service_type" className="text-[#2c1810] font-medium">Service Type</Label>
                        <Select onValueChange={(value) => setProviderForm({ ...providerForm, service_type: value })}>
                          <SelectTrigger className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20">
                            <SelectValue placeholder="Select your service category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="photography">Photography & Videography</SelectItem>
                            <SelectItem value="catering">Catering & Food</SelectItem>
                            <SelectItem value="decoration">Decoration & Styling</SelectItem>
                            <SelectItem value="venue">Venue & Locations</SelectItem>
                            <SelectItem value="music">Music & Entertainment</SelectItem>
                            <SelectItem value="flowers">Flowers & Arrangements</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="makeup">Makeup & Beauty</SelectItem>
                            <SelectItem value="planning">Event Planning & Coordination</SelectItem>
                            <SelectItem value="other">Other Services</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="location" className="text-[#2c1810] font-medium">Service Area</Label>
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., Colombo, Kandy, Galle, All Island"
                          value={providerForm.location}
                          onChange={(e) => setProviderForm({ ...providerForm, location: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="business_registration" className="text-[#2c1810] font-medium">Business Registration Number</Label>
                        <Input
                          id="business_registration"
                          type="text"
                          placeholder="BR/PV/etc. registration number"
                          value={providerForm.business_registration}
                          onChange={(e) => setProviderForm({ ...providerForm, business_registration: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-[#2c1810] font-medium">Business Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your services, experience, and what makes you special..."
                          value={providerForm.description}
                          onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20 min-h-[100px]"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] hover:from-[#d4777a] hover:to-[#8b5a3c] text-white font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Your Account...' : 'Create Professional Account'}
                      </Button>

                      <div className="bg-[#f5e6d3]/50 border border-[#d4777a]/20 rounded-lg p-4">
                        <p className="text-[#6d4c32] text-center leading-relaxed">
                          <Shield className="h-4 w-4 inline mr-2" />
                          Your account will be carefully reviewed for verification before activation. 
                          This ensures the highest quality standards for our platform.
                        </p>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="login" className="mt-6">
                    <form onSubmit={handleProviderLogin} className="space-y-6">
                      {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                          {error}
                        </div>
                      )}

                      <div>
                        <Label htmlFor="login_email" className="text-[#2c1810] font-medium">Email Address</Label>
                        <Input
                          id="login_email"
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="login_password" className="text-[#2c1810] font-medium">Password</Label>
                        <Input
                          id="login_password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="mt-2 border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] hover:from-[#d4777a] hover:to-[#8b5a3c] text-white font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing In...' : 'Access Your Dashboard'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}