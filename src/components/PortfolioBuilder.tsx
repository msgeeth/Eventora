import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Share2, 
  Copy, 
  Save, 
  Edit3, 
  Star, 
  Calendar, 
  MapPin, 
  Crown, 
  Sparkles, 
  Lock,
  Shield,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'
import { toast } from 'sonner'

interface PortfolioBuilderProps {
  user: any
  profile: any
}

interface PortfolioImage {
  id: string
  url: string
  title: string
  description: string
  category: string
  featured: boolean
}

interface Portfolio {
  id: string
  title: string
  description: string
  cover_image: string
  about_section: string
  experience_years: number
  specialties: string[]
  location: string
  contact_email: string
  contact_phone: string
  website: string
  social_links: {
    instagram?: string
    facebook?: string
    youtube?: string
  }
  images: PortfolioImage[]
  testimonials: Array<{
    client_name: string
    rating: number
    comment: string
    event_type: string
  }>
  awards: Array<{
    title: string
    year: number
    organization: string
  }>
  featured_projects: Array<{
    title: string
    description: string
    date: string
    images: string[]
  }>
  is_public: boolean
  share_url: string
  created_at: string
  updated_at: string
}

export function PortfolioBuilder({ user, profile }: PortfolioBuilderProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordVerification, setShowPasswordVerification] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about_section: '',
    experience_years: 0,
    specialties: [] as string[],
    location: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    social_links: {
      instagram: '',
      facebook: '',
      youtube: ''
    }
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [newTestimonial, setNewTestimonial] = useState({
    client_name: '',
    rating: 5,
    comment: '',
    event_type: ''
  })
  const [newAward, setNewAward] = useState({
    title: '',
    year: new Date().getFullYear(),
    organization: ''
  })
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    date: '',
    images: [] as string[]
  })

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/portfolio/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
        if (data.portfolio) {
          setFormData({
            title: data.portfolio.title || '',
            description: data.portfolio.description || '',
            about_section: data.portfolio.about_section || '',
            experience_years: data.portfolio.experience_years || 0,
            specialties: data.portfolio.specialties || [],
            location: data.portfolio.location || '',
            contact_email: data.portfolio.contact_email || profile.email,
            contact_phone: data.portfolio.contact_phone || '',
            website: data.portfolio.website || '',
            social_links: data.portfolio.social_links || {
              instagram: '',
              facebook: '',
              youtube: ''
            }
          })
        } else {
          // Initialize new portfolio
          setFormData({
            ...formData,
            title: `${profile.business_name} - Premium Event Services`,
            description: `Curated ${profile.service_type} experiences by ${profile.business_name}`,
            contact_email: profile.email,
            location: profile.location || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading portfolio:', error)
      toast.error('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password: string): boolean => {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      setPasswordError('Password must be at least 8 characters long')
      return false
    }
    if (!hasUpperCase) {
      setPasswordError('Password must contain at least one uppercase letter')
      return false
    }
    if (!hasLowerCase) {
      setPasswordError('Password must contain at least one lowercase letter')
      return false
    }
    if (!hasNumbers) {
      setPasswordError('Password must contain at least one number')
      return false
    }
    if (!hasSpecialChar) {
      setPasswordError('Password must contain at least one special character')
      return false
    }

    setPasswordError('')
    return true
  }

  const verifyPassword = async () => {
    if (!validatePassword(password)) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/auth/verify-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        }
      )

      if (response.ok) {
        setShowPasswordVerification(false)
        setPassword('')
        setIsEditing(true)
        toast.success('Password verified. You can now edit your portfolio.')
      } else {
        setPasswordError('Incorrect password. Please try again.')
      }
    } catch (error) {
      console.error('Password verification error:', error)
      setPasswordError('Password verification failed. Please try again.')
    }
  }

  const savePortfolio = async () => {
    if (!validatePassword(password) && isEditing) {
      setShowPasswordVerification(true)
      return
    }

    try {
      setSaving(true)
      const token = localStorage.getItem('access_token')

      const portfolioData = {
        ...formData,
        images: portfolio?.images || [],
        testimonials: portfolio?.testimonials || [],
        awards: portfolio?.awards || [],
        featured_projects: portfolio?.featured_projects || [],
        is_public: portfolio?.is_public || false
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/portfolio/${user.id}`,
        {
          method: portfolio ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ portfolio: portfolioData, password })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
        setIsEditing(false)
        setPassword('')
        toast.success('Portfolio saved successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to save portfolio')
      }
    } catch (error) {
      console.error('Error saving portfolio:', error)
      toast.error('Failed to save portfolio')
    } finally {
      setSaving(false)
    }
  }

  const addImageFromUnsplash = async (query: string, category: string) => {
    try {
      setUploadingImage(true)
      
      // Use predefined high-quality images based on category
      const imageMap = {
        'Wedding': `https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        'Corporate': `https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        'Birthday': `https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        'Decoration': `https://images.unsplash.com/photo-1464207687429-7505649dae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
        'Portfolio': `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`
      }
      
      const imageUrl = imageMap[category as keyof typeof imageMap] || imageMap['Portfolio']
      
      const newImage: PortfolioImage = {
        id: Date.now().toString(),
        url: imageUrl,
        title: query,
        description: `Professional ${category} by ${profile.business_name}`,
        category,
        featured: false
      }

      const updatedImages = [...(portfolio?.images || []), newImage]
      setPortfolio(prev => prev ? { ...prev, images: updatedImages } : null)
      toast.success('Image added to portfolio!')
    } catch (error) {
      console.error('Error adding image:', error)
      toast.error('Failed to add image')
    } finally {
      setUploadingImage(false)
    }
  }

  const toggleImageFeatured = (imageId: string) => {
    if (!portfolio) return
    
    const updatedImages = portfolio.images.map(img =>
      img.id === imageId ? { ...img, featured: !img.featured } : img
    )
    setPortfolio({ ...portfolio, images: updatedImages })
  }

  const removeImage = (imageId: string) => {
    if (!portfolio) return
    
    const updatedImages = portfolio.images.filter(img => img.id !== imageId)
    setPortfolio({ ...portfolio, images: updatedImages })
  }

  const addSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()]
      })
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (index: number) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter((_, i) => i !== index)
    })
  }

  const addTestimonial = () => {
    if (newTestimonial.client_name && newTestimonial.comment) {
      const updatedTestimonials = [...(portfolio?.testimonials || []), newTestimonial]
      setPortfolio(prev => prev ? { ...prev, testimonials: updatedTestimonials } : null)
      setNewTestimonial({
        client_name: '',
        rating: 5,
        comment: '',
        event_type: ''
      })
    }
  }

  const addAward = () => {
    if (newAward.title && newAward.organization) {
      const updatedAwards = [...(portfolio?.awards || []), newAward]
      setPortfolio(prev => prev ? { ...prev, awards: updatedAwards } : null)
      setNewAward({
        title: '',
        year: new Date().getFullYear(),
        organization: ''
      })
    }
  }

  const addProject = () => {
    if (newProject.title && newProject.description) {
      const updatedProjects = [...(portfolio?.featured_projects || []), newProject]
      setPortfolio(prev => prev ? { ...prev, featured_projects: updatedProjects } : null)
      setNewProject({
        title: '',
        description: '',
        date: '',
        images: []
      })
    }
  }

  const togglePublicAccess = async () => {
    if (!portfolio) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/portfolio/${user.id}/toggle-public`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPortfolio({ ...portfolio, is_public: data.is_public, share_url: data.share_url })
        toast.success(data.is_public ? 'Portfolio is now public!' : 'Portfolio is now private!')
      }
    } catch (error) {
      console.error('Error toggling public access:', error)
      toast.error('Failed to update portfolio visibility')
    }
  }

  const copyShareUrl = () => {
    if (portfolio?.share_url) {
      navigator.clipboard.writeText(portfolio.share_url)
      toast.success('Portfolio link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#e8b4b8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-display text-3xl text-[#2c2c2c] mb-2">
            Artisan Portfolio Studio
          </h2>
          <p className="text-[#2c2c2c]/70">
            Curate your masterpiece collection and share your premium brand
          </p>
        </div>
        <div className="flex gap-3">
          {portfolio?.is_public && (
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(true)}
              className="border-[#e8b4b8] text-[#e8b4b8] hover:bg-[#e8b4b8]/10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Portfolio
            </Button>
          )}
          {!isEditing ? (
            <Button
              onClick={() => setShowPasswordVerification(true)}
              className="bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] hover:from-[#d4a5a9] to-[#e8b4b8] premium-button"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Portfolio
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setPassword('')
                  loadPortfolio()
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={savePortfolio}
                disabled={saving}
                className="bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] hover:from-[#d4a5a9] to-[#e8b4b8] premium-button"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Portfolio
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Status */}
      <Card className="luxury-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#e8b4b8]" />
                <span className="font-medium text-[#2c2c2c]">Portfolio Status:</span>
              </div>
              <Badge variant={portfolio?.is_public ? "default" : "secondary"} className="bg-[#e8b4b8]">
                {portfolio?.is_public ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </>
                )}
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={togglePublicAccess}
              disabled={!portfolio}
              className="border-[#e8b4b8] text-[#e8b4b8] hover:bg-[#e8b4b8]/10"
            >
              {portfolio?.is_public ? 'Make Private' : 'Make Public'}
            </Button>
          </div>
          {portfolio?.is_public && (
            <div className="mt-4 p-4 bg-[#f7e7ce]/30 rounded-lg">
              <p className="text-sm text-[#2c2c2c]/70 mb-2">
                Your portfolio is live at:
              </p>
              <code className="text-sm bg-white/50 px-2 py-1 rounded border">
                {portfolio.share_url}
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Content */}
      <Tabs defaultValue="basic-info" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#faf8f3] border border-[#e8b4b8]/20">
          <TabsTrigger value="basic-info" className="data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white">
            Gallery
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white">
            Testimonials
          </TabsTrigger>
          <TabsTrigger value="awards" className="data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white">
            Awards
          </TabsTrigger>
          <TabsTrigger value="projects" className="data-[state=active]:bg-[#e8b4b8] data-[state=active]:text-white">
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#e8b4b8]" />
                  Portfolio Details
                </CardTitle>
                <CardDescription>
                  Your premium brand identity and expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                    Portfolio Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={!isEditing}
                    placeholder="e.g., Luxe Wedding Photography Studio"
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Craft a compelling description of your services..."
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8] min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                    About Section
                  </label>
                  <Textarea
                    value={formData.about_section}
                    onChange={(e) => setFormData({ ...formData, about_section: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Tell your story, your passion, and what makes you unique..."
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8] min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                      Years of Experience
                    </label>
                    <Input
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      placeholder="e.g., Colombo, Galle, Kandy"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[#d4af37]" />
                  Specialties & Contact
                </CardTitle>
                <CardDescription>
                  Your expertise areas and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                    Specialties
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      disabled={!isEditing}
                      placeholder="Add a specialty..."
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                      onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                    />
                    <Button
                      onClick={addSpecialty}
                      disabled={!isEditing || !newSpecialty.trim()}
                      size="sm"
                      className="bg-[#e8b4b8] hover:bg-[#d4a5a9]"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.specialties.map((specialty, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-[#f7e7ce] text-[#2c2c2c]"
                      >
                        {specialty}
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialty(index)}
                            className="ml-2 text-[#2c2c2c]/70 hover:text-[#2c2c2c]"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      disabled={!isEditing}
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                      Phone
                    </label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      disabled={!isEditing}
                      placeholder="+94 77 123 4567"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#2c2c2c] block">
                    Social Media Links
                  </label>
                  <Input
                    value={formData.social_links.instagram}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      social_links: { ...formData.social_links, instagram: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Instagram URL"
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                  />
                  <Input
                    value={formData.social_links.facebook}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      social_links: { ...formData.social_links, facebook: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="Facebook URL"
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                  />
                  <Input
                    value={formData.social_links.youtube}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      social_links: { ...formData.social_links, youtube: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="YouTube URL"
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#e8b4b8]" />
                Image Gallery
              </CardTitle>
              <CardDescription>
                Showcase your finest work and masterpieces
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="mb-6 p-4 bg-[#f7e7ce]/20 rounded-lg border border-[#e8b4b8]/20">
                  <h4 className="font-medium mb-3 text-[#2c2c2c]">Add Images</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { query: 'luxury wedding photography', category: 'Wedding' },
                      { query: 'corporate event photography', category: 'Corporate' },
                      { query: 'birthday party celebration', category: 'Birthday' },
                      { query: 'elegant decoration setup', category: 'Decoration' }
                    ].map((item) => (
                      <Button
                        key={item.query}
                        variant="outline"
                        onClick={() => addImageFromUnsplash(item.query, item.category)}
                        disabled={uploadingImage}
                        className="border-[#e8b4b8]/30 hover:bg-[#e8b4b8]/10 h-auto py-3 flex-col"
                      >
                        <ImageIcon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{item.category}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio?.images?.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <ImageWithFallback
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {image.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-[#d4af37] text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}

                    {isEditing && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => toggleImageFeatured(image.id)}
                          className="bg-white/90 text-black hover:bg-white"
                        >
                          <Star className={`h-3 w-3 ${image.featured ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(image.id)}
                          className="bg-red-500/90 hover:bg-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      <p className="text-sm font-medium text-[#2c2c2c] truncate">{image.title}</p>
                      <p className="text-xs text-[#2c2c2c]/70">{image.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(!portfolio?.images || portfolio.images.length === 0) && (
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 text-[#e8b4b8]/50 mx-auto mb-4" />
                  <h3 className="font-medium text-[#2c2c2c] mb-2">No Images Yet</h3>
                  <p className="text-[#2c2c2c]/70 mb-4">
                    Start building your portfolio by adding stunning images of your work
                  </p>
                  {isEditing && (
                    <Button
                      onClick={() => addImageFromUnsplash('luxury event photography', 'Portfolio')}
                      disabled={uploadingImage}
                      className="bg-[#e8b4b8] hover:bg-[#d4a5a9]"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Add First Image
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[#d4af37]" />
                Client Testimonials
              </CardTitle>
              <CardDescription>
                Showcase the love and appreciation from your satisfied clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="mb-6 p-4 bg-[#f7e7ce]/20 rounded-lg border border-[#e8b4b8]/20">
                  <h4 className="font-medium mb-3 text-[#2c2c2c]">Add Testimonial</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      value={newTestimonial.client_name}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, client_name: e.target.value })}
                      placeholder="Client name"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                    <Input
                      value={newTestimonial.event_type}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, event_type: e.target.value })}
                      placeholder="Event type"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                  <Textarea
                    value={newTestimonial.comment}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                    placeholder="Testimonial comment..."
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8] mb-4"
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#2c2c2c]">Rating:</span>
                      <select
                        value={newTestimonial.rating}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                        className="border border-[#e8b4b8]/30 rounded px-2 py-1 text-sm"
                      >
                        {[5, 4, 3, 2, 1].map(rating => (
                          <option key={rating} value={rating}>{rating} Stars</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={addTestimonial}
                      disabled={!newTestimonial.client_name || !newTestimonial.comment}
                      className="bg-[#e8b4b8] hover:bg-[#d4a5a9]"
                    >
                      Add Testimonial
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {portfolio?.testimonials?.map((testimonial, index) => (
                  <div key={index} className="p-4 bg-white/50 rounded-lg border border-[#e8b4b8]/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-[#2c2c2c]">{testimonial.client_name}</h5>
                        <p className="text-xs text-[#2c2c2c]/70">{testimonial.event_type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 text-[#d4af37] fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#2c2c2c]/80 italic">"{testimonial.comment}"</p>
                  </div>
                ))}
              </div>

              {(!portfolio?.testimonials || portfolio.testimonials.length === 0) && (
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-[#d4af37]/50 mx-auto mb-4" />
                  <h3 className="font-medium text-[#2c2c2c] mb-2">No Testimonials Yet</h3>
                  <p className="text-[#2c2c2c]/70">
                    Add client testimonials to build trust and credibility
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards" className="mt-6">
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#d4af37]" />
                Awards & Recognition
              </CardTitle>
              <CardDescription>
                Highlight your professional achievements and industry recognition
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="mb-6 p-4 bg-[#f7e7ce]/20 rounded-lg border border-[#e8b4b8]/20">
                  <h4 className="font-medium mb-3 text-[#2c2c2c]">Add Award</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <Input
                      value={newAward.title}
                      onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                      placeholder="Award title"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                    <Input
                      type="number"
                      value={newAward.year}
                      onChange={(e) => setNewAward({ ...newAward, year: parseInt(e.target.value) })}
                      placeholder="Year"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                    <Input
                      value={newAward.organization}
                      onChange={(e) => setNewAward({ ...newAward, organization: e.target.value })}
                      placeholder="Organization"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                  <Button
                    onClick={addAward}
                    disabled={!newAward.title || !newAward.organization}
                    className="bg-[#e8b4b8] hover:bg-[#d4a5a9]"
                  >
                    Add Award
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {portfolio?.awards?.map((award, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-[#e8b4b8]/20">
                    <Crown className="h-8 w-8 text-[#d4af37]" />
                    <div className="flex-1">
                      <h5 className="font-medium text-[#2c2c2c]">{award.title}</h5>
                      <p className="text-sm text-[#2c2c2c]/70">{award.organization} • {award.year}</p>
                    </div>
                  </div>
                ))}
              </div>

              {(!portfolio?.awards || portfolio.awards.length === 0) && (
                <div className="text-center py-12">
                  <Crown className="h-12 w-12 text-[#d4af37]/50 mx-auto mb-4" />
                  <h3 className="font-medium text-[#2c2c2c] mb-2">No Awards Yet</h3>
                  <p className="text-[#2c2c2c]/70">
                    Add your professional awards and recognition to showcase your expertise
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card className="luxury-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#e8b4b8]" />
                Featured Projects
              </CardTitle>
              <CardDescription>
                Showcase your most prestigious and memorable projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing && (
                <div className="mb-6 p-4 bg-[#f7e7ce]/20 rounded-lg border border-[#e8b4b8]/20">
                  <h4 className="font-medium mb-3 text-[#2c2c2c]">Add Project</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Project title"
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                    <Input
                      type="date"
                      value={newProject.date}
                      onChange={(e) => setNewProject({ ...newProject, date: e.target.value })}
                      className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                    />
                  </div>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Project description..."
                    className="border-[#e8b4b8]/30 focus:border-[#e8b4b8] mb-4"
                  />
                  <Button
                    onClick={addProject}
                    disabled={!newProject.title || !newProject.description}
                    className="bg-[#e8b4b8] hover:bg-[#d4a5a9]"
                  >
                    Add Project
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {portfolio?.featured_projects?.map((project, index) => (
                  <div key={index} className="p-6 bg-white/50 rounded-lg border border-[#e8b4b8]/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h5 className="font-medium text-[#2c2c2c] text-lg">{project.title}</h5>
                        {project.date && (
                          <p className="text-sm text-[#2c2c2c]/70 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[#2c2c2c]/80 mb-4">{project.description}</p>
                    {project.images && project.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {project.images.slice(0, 3).map((image, imgIndex) => (
                          <div key={imgIndex} className="aspect-square rounded overflow-hidden bg-gray-100">
                            <ImageWithFallback
                              src={image}
                              alt={`${project.title} ${imgIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(!portfolio?.featured_projects || portfolio.featured_projects.length === 0) && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-[#e8b4b8]/50 mx-auto mb-4" />
                  <h3 className="font-medium text-[#2c2c2c] mb-2">No Projects Yet</h3>
                  <p className="text-[#2c2c2c]/70">
                    Add your most impressive projects to showcase your capabilities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Verification Dialog */}
      <Dialog open={showPasswordVerification} onOpenChange={setShowPasswordVerification}>
        <DialogContent className="sm:max-w-md luxury-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#e8b4b8]" />
              Security Verification
            </DialogTitle>
            <DialogDescription>
              Please verify your password to edit your portfolio. Ensure your password meets our security requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                Current Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-[#e8b4b8]/30 focus:border-[#e8b4b8]"
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
              />
              {passwordError && (
                <Alert className="mt-2 border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="bg-[#f7e7ce]/30 p-3 rounded-lg">
              <h5 className="font-medium text-[#2c2c2c] mb-2 text-sm">Password Requirements:</h5>
              <ul className="text-xs text-[#2c2c2c]/70 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordVerification(false)
                  setPassword('')
                  setPasswordError('')
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={verifyPassword}
                disabled={!password}
                className="flex-1 bg-[#e8b4b8] hover:bg-[#d4a5a9]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md luxury-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#e8b4b8]" />
              Share Your Portfolio
            </DialogTitle>
            <DialogDescription>
              Share your stunning portfolio with clients and prospects
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#2c2c2c] mb-2 block">
                Portfolio URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={portfolio?.share_url || ''}
                  readOnly
                  className="border-[#e8b4b8]/30 bg-gray-50"
                />
                <Button
                  onClick={copyShareUrl}
                  size="sm"
                  className="bg-[#e8b4b8] hover:bg-[#d4a5a9]"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-[#f7e7ce]/30 p-4 rounded-lg">
              <h5 className="font-medium text-[#2c2c2c] mb-2">Portfolio Features:</h5>
              <ul className="text-sm text-[#2c2c2c]/70 space-y-1">
                <li>✨ Responsive design for all devices</li>
                <li>🖼️ High-quality image gallery</li>
                <li>⭐ Client testimonials and ratings</li>
                <li>🏆 Awards and achievements showcase</li>
                <li>📱 Mobile-optimized viewing experience</li>
              </ul>
            </div>

            <Button
              onClick={() => setShowShareDialog(false)}
              className="w-full bg-[#e8b4b8] hover:bg-[#d4a5a9]"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}