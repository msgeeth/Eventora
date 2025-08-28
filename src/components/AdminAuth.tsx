import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ArrowLeft, Shield, Crown, Lock, AlertTriangle } from 'lucide-react'

interface AdminAuthProps {
  onAuthenticated: () => void
  onBack: () => void
}

export function AdminAuth({ onAuthenticated, onBack }: AdminAuthProps) {
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  
  // In production, this should be stored securely and hashed
  const ADMIN_PASSWORD = 'EventoraAdmin2024!@#'
  const MAX_ATTEMPTS = 3
  const LOCKOUT_TIME = 300000 // 5 minutes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Check if user is locked out
    const lockoutData = localStorage.getItem('admin_lockout')
    if (lockoutData) {
      const { lockedUntil } = JSON.parse(lockoutData)
      if (Date.now() < lockedUntil) {
        const remainingTime = Math.ceil((lockedUntil - Date.now()) / 60000)
        setError(`Too many failed attempts. Try again in ${remainingTime} minutes.`)
        setIsLoading(false)
        return
      } else {
        localStorage.removeItem('admin_lockout')
        setAttempts(0)
      }
    }

    // Simulate network delay for security
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (password === ADMIN_PASSWORD) {
      // Clear any lockout data on successful login
      localStorage.removeItem('admin_lockout')
      localStorage.removeItem('admin_attempts')
      
      // Set admin session
      localStorage.setItem('admin_session', JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
      }))
      
      onAuthenticated()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      localStorage.setItem('admin_attempts', newAttempts.toString())
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_TIME
        localStorage.setItem('admin_lockout', JSON.stringify({
          lockedUntil: lockoutUntil
        }))
        setError(`Too many failed attempts. Account locked for 5 minutes.`)
      } else {
        setError(`Invalid password. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`)
      }
    }
    
    setIsLoading(false)
  }

  React.useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('admin_session')
    if (session) {
      const { authenticated, expires } = JSON.parse(session)
      if (authenticated && Date.now() < expires) {
        onAuthenticated()
        return
      } else {
        localStorage.removeItem('admin_session')
      }
    }

    // Load attempt count
    const storedAttempts = localStorage.getItem('admin_attempts')
    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts))
    }
  }, [onAuthenticated])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f5e6d3] to-[#e8d5c4] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
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
          <p className="text-[#6d4c32] text-lg font-display">Admin Access Portal</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] text-white text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <CardTitle className="font-display text-3xl">Secure Access</CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Administrator authentication required
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2c1810] font-medium">
                  Administrator Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full bg-gradient-to-r from-[#8b5a3c] to-[#d4777a] hover:from-[#d4777a] hover:to-[#8b5a3c] text-white font-semibold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                disabled={isLoading}
              >
                <Shield className="h-5 w-5 mr-3" />
                {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>

              <div className="bg-[#f5e6d3]/50 border border-[#d4777a]/20 rounded-lg p-4">
                <p className="text-[#6d4c32] text-sm text-center leading-relaxed">
                  <Shield className="h-4 w-4 inline mr-2" />
                  This area is restricted to authorized administrators only. 
                  All access attempts are logged and monitored.
                </p>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-[#8b5a3c]">
                  Security Notice: Access is limited to verified administrators.
                  For security assistance, contact the system owner.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Information */}
        <div className="mt-8 text-center">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-display text-lg text-[#2c1810] mb-3">Security Features</h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-[#6d4c32]">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Password Protection
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Session Timeout
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Attempt Limiting
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Auto Lockout
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}