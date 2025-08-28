import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Alert, AlertDescription } from './ui/alert'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { 
  ArrowLeft, 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  AlertCircle,
  LogOut,
  Crown,
  FileText,
  Save,
  Settings,
  Mail
} from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

interface AdminDashboardProps {
  onBack: () => void
  onLogout?: () => void
}

export function AdminDashboard({ onBack, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingProviders, setPendingProviders] = useState([])
  const [allProviders, setAllProviders] = useState([])
  const [adminSettings, setAdminSettings] = useState({
    buyer_terms: '',
    provider_terms: '',
    privacy_policy: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadPendingProviders()
    loadAllProviders()
    loadAdminSettings()
  }, [])

  const loadPendingProviders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/providers/pending`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPendingProviders(data.providers || [])
      } else {
        setError('Failed to load pending providers')
      }
    } catch (err) {
      console.error('Error loading pending providers:', err)
      setError('Failed to load pending providers')
    }
  }

  const loadAllProviders = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/providers/verified`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAllProviders(data.providers || [])
      }
    } catch (err) {
      console.error('Error loading all providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadAdminSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/admin/settings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setAdminSettings(data.settings)
      }
    } catch (err) {
      console.error('Error loading admin settings:', err)
    }
  }

  const saveAdminSettings = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/admin/settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminSettings)
        }
      )

      if (response.ok) {
        setSuccess('Settings saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to save settings')
      }
    } catch (err) {
      console.error('Error saving admin settings:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyProvider = async (providerId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/providers/${providerId}/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status })
        }
      )

      if (response.ok) {
        // Reload the data
        await loadPendingProviders()
        await loadAllProviders()
        setSuccess(`Provider ${status} successfully! Email notification sent.`)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update provider status')
      }
    } catch (err) {
      console.error('Error verifying provider:', err)
      setError('Failed to update provider status')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f5e6d3] to-[#e8d5c4] flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl">
          <div className="w-16 h-16 border-4 border-[#d4777a] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="font-display text-3xl mb-4 text-[#2c1810]">Loading Admin Dashboard</h2>
          <p className="text-[#6d4c32]">Preparing administration tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefcfb] via-[#f5e6d3] to-[#e8d5c4]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-[#d4777a]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="mr-4 text-[#8b5a3c] hover:text-[#d4777a] hover:bg-[#f5e6d3]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Crown className="h-10 w-10 text-[#d4777a] mr-3 animate-pulse-glow" />
              <h1 className="font-script text-4xl text-[#8b5a3c] font-bold">EVENTORA</h1>
              <Badge className="ml-4 bg-[#8b5a3c] text-white">Admin Panel</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-[#6d4c32]">Admin Portal</p>
                <p className="font-display text-lg text-[#2c1810]">System Administration</p>
              </div>
              {onLogout && (
                <Button 
                  variant="ghost" 
                  onClick={onLogout}
                  className="text-[#8b5a3c] hover:text-[#d4777a] hover:bg-[#f5e6d3]"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
              <CardTitle className="font-display text-lg text-[#2c1810]">Pending Reviews</CardTitle>
              <Clock className="h-6 w-6 text-[#d4777a]" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-[#d4777a] mb-2">{pendingProviders.length}</div>
              <p className="text-sm text-[#6d4c32]">Service providers awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
              <CardTitle className="font-display text-lg text-[#2c1810]">Verified Providers</CardTitle>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-green-600 mb-2">{allProviders.length}</div>
              <p className="text-sm text-[#6d4c32]">Active service providers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
              <CardTitle className="font-display text-lg text-[#2c1810]">Total Providers</CardTitle>
              <Users className="h-6 w-6 text-[#8b5a3c]" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-[#8b5a3c] mb-2">{pendingProviders.length + allProviders.length}</div>
              <p className="text-sm text-[#6d4c32]">All registered providers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
              <CardTitle className="font-display text-lg text-[#2c1810]">Email Notifications</CardTitle>
              <Mail className="h-6 w-6 text-[#8b5a3c]" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-4xl font-bold text-[#8b5a3c] mb-2">Active</div>
              <p className="text-sm text-[#6d4c32]">Auto-notifications enabled</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-[#d4777a]/20 p-1">
            <TabsTrigger 
              value="pending" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending Verification ({pendingProviders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              All Providers ({allProviders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4777a] data-[state=active]:to-[#8b5a3c] data-[state=active]:text-white transition-all duration-300"
            >
              <Settings className="h-4 w-4 mr-2" />
              Terms & Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-8">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
                <CardTitle className="font-display text-2xl text-[#2c1810]">Pending Service Provider Verifications</CardTitle>
                <CardDescription className="text-[#6d4c32]">
                  Review and approve or reject service provider applications. Email notifications are sent automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {pendingProviders.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-float" />
                    <h3 className="font-display text-2xl text-[#2c1810] mb-4">All Caught Up!</h3>
                    <p className="text-[#6d4c32] text-lg">No pending verifications at the moment.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-[#2c1810]">Business Name</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Service Type</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Location</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Registration</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Applied</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProviders.map((provider: any) => (
                        <TableRow key={provider.id} className="hover:bg-[#faf7f2]">
                          <TableCell>
                            <div>
                              <p className="font-semibold text-[#2c1810]">{provider.business_name}</p>
                              <p className="text-sm text-[#6d4c32]">{provider.name}</p>
                              <p className="text-sm text-[#8b5a3c]">{provider.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-[#f5e6d3] text-[#8b5a3c] border-[#d4777a]/20">{provider.service_type}</Badge>
                          </TableCell>
                          <TableCell className="text-[#6d4c32]">{provider.location}</TableCell>
                          <TableCell>
                            <span className="font-mono text-sm text-[#8b5a3c] bg-[#f5e6d3] px-2 py-1 rounded">{provider.business_registration}</span>
                          </TableCell>
                          <TableCell className="text-[#6d4c32]">
                            {new Date(provider.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleVerifyProvider(provider.id, 'approved')}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleVerifyProvider(provider.id, 'rejected')}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-[#d4777a] text-[#8b5a3c] hover:bg-[#d4777a] hover:text-white"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-8">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
                <CardTitle className="font-display text-2xl text-[#2c1810]">All Service Providers</CardTitle>
                <CardDescription className="text-[#6d4c32]">
                  Overview of all registered service providers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {allProviders.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="h-20 w-20 text-[#d4777a] mx-auto mb-6 animate-float" />
                    <h3 className="font-display text-2xl text-[#2c1810] mb-4">No Providers Yet</h3>
                    <p className="text-[#6d4c32] text-lg">No verified service providers at the moment.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-[#2c1810]">Business Name</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Service Type</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Location</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Status</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Rating</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Joined</TableHead>
                        <TableHead className="font-semibold text-[#2c1810]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProviders.map((provider: any) => (
                        <TableRow key={provider.id} className="hover:bg-[#faf7f2]">
                          <TableCell>
                            <div>
                              <p className="font-semibold text-[#2c1810]">{provider.business_name}</p>
                              <p className="text-sm text-[#6d4c32]">{provider.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-[#f5e6d3] text-[#8b5a3c] border-[#d4777a]/20">{provider.service_type}</Badge>
                          </TableCell>
                          <TableCell className="text-[#6d4c32]">{provider.location}</TableCell>
                          <TableCell>
                            {getStatusBadge(provider.verification_status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="mr-1 font-semibold text-[#2c1810]">{provider.rating?.toFixed(1) || '0.0'}</span>
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm text-[#6d4c32] ml-1">
                                ({provider.total_ratings || 0})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-[#6d4c32]">
                            {new Date(provider.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-[#d4777a] text-[#8b5a3c] hover:bg-[#d4777a] hover:text-white"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {provider.verification_status === 'approved' && (
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleVerifyProvider(provider.id, 'rejected')}
                                >
                                  Suspend
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-8">
            <div className="grid gap-8">
              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
                  <CardTitle className="font-display text-2xl text-[#2c1810] flex items-center">
                    <FileText className="h-6 w-6 mr-3" />
                    Terms & Conditions Management
                  </CardTitle>
                  <CardDescription className="text-[#6d4c32]">
                    Edit terms and conditions for customers and service providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div>
                    <Label htmlFor="buyer_terms" className="text-lg font-semibold text-[#2c1810] mb-4 block">
                      Customer Terms & Conditions
                    </Label>
                    <Textarea
                      id="buyer_terms"
                      value={adminSettings.buyer_terms}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, buyer_terms: e.target.value }))}
                      rows={10}
                      className="min-h-[200px] resize-none border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                      placeholder="Enter terms and conditions for customers..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="provider_terms" className="text-lg font-semibold text-[#2c1810] mb-4 block">
                      Service Provider Terms & Conditions
                    </Label>
                    <Textarea
                      id="provider_terms"
                      value={adminSettings.provider_terms}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, provider_terms: e.target.value }))}
                      rows={10}
                      className="min-h-[200px] resize-none border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                      placeholder="Enter terms and conditions for service providers..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="privacy_policy" className="text-lg font-semibold text-[#2c1810] mb-4 block">
                      Privacy Policy
                    </Label>
                    <Textarea
                      id="privacy_policy"
                      value={adminSettings.privacy_policy}
                      onChange={(e) => setAdminSettings(prev => ({ ...prev, privacy_policy: e.target.value }))}
                      rows={10}
                      className="min-h-[200px] resize-none border-[#d4777a]/30 focus:border-[#d4777a] focus:ring-[#d4777a]/20"
                      placeholder="Enter privacy policy..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={saveAdminSettings}
                      disabled={saving}
                      className="bg-gradient-to-r from-[#d4777a] to-[#8b5a3c] hover:from-[#8b5a3c] hover:to-[#d4777a] text-white px-8 py-3 rounded-xl transition-all duration-300"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-[#f5e6d3] to-[#e8d5c4] border-b border-[#d4777a]/20">
                  <CardTitle className="font-display text-2xl text-[#2c1810] flex items-center">
                    <Mail className="h-6 w-6 mr-3" />
                    Email Notification Settings
                  </CardTitle>
                  <CardDescription className="text-[#6d4c32]">
                    Email notification system status and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-[#2c1810]">Notification Types</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-[#2c1810]">Order Received</span>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-[#2c1810]">Checkout Complete</span>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <span className="text-[#2c1810]">Provider Verification</span>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-[#2c1810]">System Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-[#2c1810]">Email Service</span>
                          <Badge className="bg-blue-500 text-white">Operational</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-[#2c1810]">JustPay Integration</span>
                          <Badge className="bg-blue-500 text-white">Connected</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-[#2c1810]">Media Upload Limits</span>
                          <Badge className="bg-blue-500 text-white">5 Images + 1 Video</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}