import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Star, 
  MapPin, 
  Calendar, 
  Crown, 
  Camera, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook, 
  Youtube,
  Award,
  Sparkles,
  CheckCircle
} from 'lucide-react'
import { projectId } from '../utils/supabase/info'

interface PublicPortfolioViewerProps {
  portfolioId: string
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
  images: Array<{
    id: string
    url: string
    title: string
    description: string
    category: string
    featured: boolean
  }>
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
}

interface Provider {
  business_name: string
  service_type: string
  rating: number
  total_ratings: number
  is_verified: boolean
}

export function PublicPortfolioViewer({ portfolioId }: PublicPortfolioViewerProps) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPublicPortfolio()
  }, [portfolioId])

  const loadPublicPortfolio = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/portfolio/public/${portfolioId}`
      )

      if (response.ok) {
        const data = await response.json()
        setPortfolio(data.portfolio)
        setProvider(data.provider)
      } else {
        setError('Portfolio not found or private')
      }
    } catch (error) {
      console.error('Error loading public portfolio:', error)
      setError('Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce] flex items-center justify-center">
        <div className="text-center p-8 luxury-card rounded-3xl shadow-2xl">
          <div className="w-16 h-16 border-4 border-[#e8b4b8] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="font-display text-3xl mb-4 text-[#2c2c2c]">Loading Portfolio</h2>
          <p className="text-[#2c2c2c]/70">Preparing the showcase...</p>
        </div>
      </div>
    )
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce] flex items-center justify-center">
        <div className="text-center p-8 luxury-card rounded-3xl shadow-2xl">
          <h2 className="font-display text-3xl mb-4 text-[#2c2c2c]">Portfolio Unavailable</h2>
          <p className="text-[#2c2c2c]/70">{error}</p>
        </div>
      </div>
    )
  }

  const featuredImages = portfolio.images.filter(img => img.featured)
  const regularImages = portfolio.images.filter(img => !img.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e8b4b8]/20 to-[#d4a5a9]/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-12 w-12 text-[#d4af37] mr-4" />
            <div>
              <h1 className="font-display text-5xl lg:text-7xl text-[#2c2c2c] mb-2">
                {portfolio.title}
              </h1>
              {provider && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Badge className="bg-[#e8b4b8] text-white">
                    {provider.service_type}
                  </Badge>
                  {provider.is_verified && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {provider.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#d4af37] fill-current" />
                      <span className="text-[#2c2c2c] font-medium">
                        {provider.rating.toFixed(1)} ({provider.total_ratings} reviews)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-xl text-[#2c2c2c]/80 max-w-3xl mx-auto mb-8">
            {portfolio.description}
          </p>
          <div className="flex items-center justify-center gap-6 text-[#2c2c2c]/70">
            {portfolio.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{portfolio.location}</span>
              </div>
            )}
            {portfolio.experience_years > 0 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{portfolio.experience_years}+ Years Experience</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Featured Images */}
        {featuredImages.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl text-[#2c2c2c] mb-4">Featured Work</h2>
              <p className="text-[#2c2c2c]/70 text-lg">Our most celebrated creations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-2xl overflow-hidden shadow-lg premium-hover">
                    <ImageWithFallback
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-[#d4af37] text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h4 className="font-medium">{image.title}</h4>
                        <p className="text-sm opacity-90">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        {portfolio.about_section && (
          <section className="mb-16">
            <Card className="luxury-card">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="font-display text-4xl text-[#2c2c2c] mb-6">Our Story</h2>
                    <p className="text-[#2c2c2c]/80 text-lg leading-relaxed mb-6">
                      {portfolio.about_section}
                    </p>
                    {portfolio.specialties.length > 0 && (
                      <div>
                        <h4 className="font-medium text-[#2c2c2c] mb-3">Specialties</h4>
                        <div className="flex flex-wrap gap-2">
                          {portfolio.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="bg-[#f7e7ce] text-[#2c2c2c]">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
                      <ImageWithFallback
                        src={portfolio.images[0]?.url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt="About us"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#e8b4b8] rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Portfolio Gallery */}
        {regularImages.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl text-[#2c2c2c] mb-4">Portfolio Gallery</h2>
              <p className="text-[#2c2c2c]/70 text-lg">A collection of our finest work</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {regularImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-xl overflow-hidden shadow-md premium-hover">
                    <ImageWithFallback
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Camera className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm">{image.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {portfolio.testimonials.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl text-[#2c2c2c] mb-4">Client Love</h2>
              <p className="text-[#2c2c2c]/70 text-lg">What our clients say about us</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.testimonials.map((testimonial, index) => (
                <Card key={index} className="luxury-card">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-[#d4af37] fill-current" />
                      ))}
                    </div>
                    <p className="text-[#2c2c2c]/80 italic mb-4">"{testimonial.comment}"</p>
                    <div>
                      <p className="font-medium text-[#2c2c2c]">{testimonial.client_name}</p>
                      <p className="text-sm text-[#2c2c2c]/70">{testimonial.event_type}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Awards */}
        {portfolio.awards.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl text-[#2c2c2c] mb-4">Recognition</h2>
              <p className="text-[#2c2c2c]/70 text-lg">Awards and achievements</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.awards.map((award, index) => (
                <Card key={index} className="luxury-card">
                  <CardContent className="p-6 flex items-center gap-4">
                    <Award className="h-10 w-10 text-[#d4af37]" />
                    <div>
                      <h4 className="font-medium text-[#2c2c2c]">{award.title}</h4>
                      <p className="text-sm text-[#2c2c2c]/70">{award.organization} • {award.year}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Contact Information */}
        <section>
          <Card className="luxury-card">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-4xl text-[#2c2c2c] mb-6">Let's Create Magic Together</h2>
              <p className="text-[#2c2c2c]/70 text-lg mb-8">
                Ready to bring your vision to life? Contact us to discuss your event.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {portfolio.contact_email && (
                  <div className="flex items-center justify-center gap-3">
                    <Mail className="h-5 w-5 text-[#e8b4b8]" />
                    <span className="text-[#2c2c2c]">{portfolio.contact_email}</span>
                  </div>
                )}
                {portfolio.contact_phone && (
                  <div className="flex items-center justify-center gap-3">
                    <Phone className="h-5 w-5 text-[#e8b4b8]" />
                    <span className="text-[#2c2c2c]">{portfolio.contact_phone}</span>
                  </div>
                )}
                {portfolio.website && (
                  <div className="flex items-center justify-center gap-3">
                    <Globe className="h-5 w-5 text-[#e8b4b8]" />
                    <a 
                      href={portfolio.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#e8b4b8] hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>

              {(portfolio.social_links.instagram || portfolio.social_links.facebook || portfolio.social_links.youtube) && (
                <div className="flex items-center justify-center gap-4">
                  {portfolio.social_links.instagram && (
                    <a 
                      href={portfolio.social_links.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#e8b4b8] rounded-full flex items-center justify-center text-white hover:bg-[#d4a5a9] transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {portfolio.social_links.facebook && (
                    <a 
                      href={portfolio.social_links.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#e8b4b8] rounded-full flex items-center justify-center text-white hover:bg-[#d4a5a9] transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {portfolio.social_links.youtube && (
                    <a 
                      href={portfolio.social_links.youtube} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#e8b4b8] rounded-full flex items-center justify-center text-white hover:bg-[#d4a5a9] transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#2c2c2c] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-[#e8b4b8] mr-2" />
            <span className="font-display text-xl">EVENTORA</span>
          </div>
          <p className="text-white/70">
            Powered by EVENTORA - Sri Lanka's Premier Event Management Platform
          </p>
        </div>
      </footer>
    </div>
  )
}