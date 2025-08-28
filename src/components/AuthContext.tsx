import React, { createContext, useContext, useState, useEffect } from 'react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AuthContextType {
  user: any
  profile: any
  login: (email: string, password?: string, userType?: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
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
          setProfile(data.profile)
        } else {
          localStorage.removeItem('access_token')
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
      localStorage.removeItem('access_token')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password?: string, userType?: string) => {
    try {
      if (userType === 'google') {
        // Handle Google OAuth login for buyers
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          publicAnonKey
        )
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        })
        
        if (error) throw error
        
        // The redirect will handle the rest
        return
      } else {
        // Handle email/password login for service providers
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          publicAnonKey
        )
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password!
        })
        
        if (error) throw error
        
        if (data.session?.access_token) {
          localStorage.setItem('access_token', data.session.access_token)
          await checkSession()
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        `https://${projectId}.supabase.co`,
        publicAnonKey
      )
      
      await supabase.auth.signOut()
      localStorage.removeItem('access_token')
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}