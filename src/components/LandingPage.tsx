import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Crown, Calendar, Users, Star, Shield, MessageSquare, Sparkles, CheckCircle, TrendingUp, Award, Clock, ArrowRight,
  Zap, Trophy, Heart, Diamond, Camera, Music, Utensils, Building2, PartyPopper, Gift, Palette, Mic
} from 'lucide-react'

interface LandingPageProps {
  onLogin: () => void
  onAdminAccess: () => void
}

export function LandingPage({ onLogin, onAdminAccess }: LandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState({})

  // Using placeholder images from Unsplash
  const heroImages = [
    { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800", alt: "Luxury Wedding Ceremony", type: "Wedding" },
    { src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800", alt: "Corporate Gala Event", type: "Corporate" },
    { src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800", alt: "Private Celebration", type: "Private" }
  ]

  const eventTypes = [
    { icon: Heart, name: "Weddings", count: "500+", color: "text-rose-400" },
    { icon: Building2, name: "Corporate", count: "300+", color: "text-blue-600" },
    { icon: PartyPopper, name: "Celebrations", count: "200+", color: "text-purple-500" },
    { icon: Gift, name: "Private Events", count: "150+", color: "text-green-600" },
    { icon: Music, name: "Concerts", count: "100+", color: "text-indigo-500" },
    { icon: Palette, name: "Art Galas", count: "50+", color: "text-pink-500" }
  ]

  // Automatic image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfcfa] via-[#faf8f3] to-[#f7e7ce] overflow-hidden">
      {/* Luxury Header */}
      <header className="luxury-card sticky top-0 z-50 border-b border-[#e8b4b8]/20 backdrop-filter backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center animate-luxury-float">
              <Crown className="h-12 w-12 text-[#e8b4b8] mr-4 animate-premium-glow" />
              <div>
                <h1 className="font-script text-5xl text-[#2c2c2c] font-bold tracking-tight">
                  EVENTORA
                </h1>
                <p className="text-sm text-[#6b7280] font-medium tracking-wide">LUXURY EVENT CURATION</p>
              </div>
              <div className="ml-6 flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-[#d4af37] fill-current" />
                  ))}
                </div>
                <span className="text-sm text-[#2c2c2c] font-semibold">4.9/5 • Premium Platform</span>
                <Badge className="bg-[#1b4d3e] text-white ml-2">Sri Lanka's #1</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-6 z-50 relative">
              <Button 
                variant="ghost" 
                onClick={onAdminAccess}
                className="text-[#2c2c2c] hover:text-[#e8b4b8] hover:bg-[#f7e7ce]/50 transition-all duration-300"
              >
                Admin Portal
              </Button>
              <Button 
                onClick={onLogin}
                className="premium-button text-white font-semibold px-8 py-3 rounded-2xl border-0 z-50 relative"
              >
                Begin Your Luxury Journey
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Exclusive Access Banner */}
      <div className="bg-gradient-to-r from-[#1a365d] via-[#1b4d3e] to-[#1a365d] text-white py-4 text-center animate-luxury-gradient">
        <div className="flex items-center justify-center space-x-3">
          <Diamond className="h-5 w-5 animate-shimmer" />
          <span className="font-semibold tracking-wide">
            🏆 EXCLUSIVE: Access Our Elite Artisan Network - Limited to 500 Privileged Members Monthly
          </span>
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* Hero Section with Automatic Carousel */}
      <section className="relative py-24 px-6 lg:px-8 overflow-hidden" data-animate id="hero">
        {/* Floating Trust Indicators - Reduced z-index to stay behind buttons */}
        <div className="absolute top-16 left-12 luxury-card rounded-3xl p-6 shadow-2xl animate-luxury-float max-w-xs z-10" style={{animationDelay: '0s'}}>
          <div className="flex items-center space-x-3">
            <Trophy className="h-6 w-6 text-[#d4af37]" />
            <div>
              <div className="font-semibold text-[#2c2c2c]">Award Winner 2024</div>
              <div className="text-sm text-[#6b7280]">Best Luxury Platform</div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-40 right-12 luxury-card rounded-3xl p-6 shadow-2xl animate-luxury-float max-w-xs z-10" style={{animationDelay: '1s'}}>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-[#1b4d3e]" />
            <div>
              <div className="font-semibold text-[#2c2c2c]">100% Verified</div>
              <div className="text-sm text-[#6b7280]">Elite Artisan Partners</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 left-1/4 luxury-card rounded-3xl p-6 shadow-2xl animate-luxury-float max-w-xs z-10" style={{animationDelay: '2s'}}>
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6 text-[#e8b4b8]" />
            <div>
              <div className="font-semibold text-[#2c2c2c]">Celebrity Trusted</div>
              <div className="text-sm text-[#6b7280]">A-List Endorsements</div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-20">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <Sparkles className="h-10 w-10 text-[#e8b4b8] mr-4 animate-spin" style={{animationDuration: '4s'}} />
                <span className="font-display text-xl text-[#2c2c2c] tracking-wide font-medium">Sri Lanka's Premier Event Orchestration</span>
              </div>
              
              <h2 className="font-display text-7xl lg:text-8xl mb-12 text-[#2c2c2c] leading-[0.9] tracking-tight">
                Orchestrate
                <span className="block text-transparent bg-gradient-to-r from-[#e8b4b8] via-[#d4a5a9] to-[#d4af37] bg-clip-text font-script animate-luxury-gradient">
                  Extraordinary
                </span>
                Experiences
              </h2>
              
              <p className="text-2xl text-[#2c2c2c]/80 mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Join our <span className="font-semibold text-[#e8b4b8]">exclusive network</span> of successful celebrations. 
                Connect with <span className="font-semibold text-[#1b4d3e]">curated artisan partners</span> across Sri Lanka. 
                <span className="font-semibold text-[#d4af37]">Save 6-8 months</span> of traditional planning.
              </p>

              {/* Premium Statistics */}
              <div className="flex items-center justify-center lg:justify-start space-x-12 mb-16">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#e8b4b8] mb-2">500+</div>
                  <div className="text-sm text-[#2c2c2c] font-medium">Luxury Events Orchestrated</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#1b4d3e] mb-2">250+</div>
                  <div className="text-sm text-[#2c2c2c] font-medium">Elite Artisan Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#d4af37] mb-2">4.9★</div>
                  <div className="text-sm text-[#2c2c2c] font-medium">Exceptional Rating</div>
                </div>
              </div>
              
              {/* CTA Buttons with higher z-index */}
              <div className="flex flex-col sm:flex-row gap-8 justify-center lg:justify-start relative z-50">
                <Button 
                  size="lg" 
                  onClick={onLogin} 
                  className="premium-button text-white font-bold py-8 px-12 text-xl rounded-3xl shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 relative z-50"
                >
                  <Crown className="mr-4 h-7 w-7" />
                  Reserve Your Exclusive Experience
                  <ArrowRight className="ml-4 h-7 w-7" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={onLogin}
                  className="border-3 border-[#e8b4b8] text-[#2c2c2c] hover:bg-[#e8b4b8] hover:text-white font-bold py-8 px-12 text-xl rounded-3xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm relative z-50"
                >
                  <Users className="mr-4 h-7 w-7" />
                  Join Elite Network
                </Button>
              </div>

              {/* Scarcity Trigger */}
              <div className="bg-gradient-to-r from-[#d4af37]/10 to-[#e8b4b8]/10 rounded-2xl p-4 mt-8">
                <p className="text-[#2c2c2c] font-medium flex items-center justify-center lg:justify-start">
                  <Zap className="h-5 w-5 text-[#d4af37] mr-2" />
                  Only 47 exclusive slots remaining for 2024 celebrations
                </p>
              </div>
            </div>
            
            {/* Automatic Image Carousel */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#e8b4b8]/20 to-[#d4a5a9]/20 rounded-[3rem] transform rotate-3 animate-parallax-subtle"></div>
              <div className="relative overflow-hidden rounded-[3rem] shadow-2xl">
                {heroImages.map((image, index) => (
                  <ImageWithFallback
                    key={index}
                    src={image.src}
                    alt={image.alt}
                    className={`w-full h-[600px] object-cover transition-opacity duration-1000 ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                  />
                ))}
                {/* Image overlay with event type */}
                <div className="absolute bottom-6 left-6 luxury-card rounded-2xl p-4">
                  <div className="text-[#2c2c2c] font-display text-xl font-semibold">
                    {heroImages[currentImageIndex]?.type} Excellence
                  </div>
                  <div className="text-[#6b7280] text-sm">Curated by EVENTORA</div>
                </div>
              </div>
              
              {/* Carousel indicators */}
              <div className="flex justify-center mt-6 space-x-3">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentImageIndex 
                        ? 'bg-[#e8b4b8] w-8' 
                        : 'bg-[#e8b4b8]/30 hover:bg-[#e8b4b8]/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Gallery */}
      <section className="py-24 bg-white/60 backdrop-blur-sm" data-animate id="events">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h3 className="font-display text-6xl mb-8 text-[#2c2c2c] tracking-tight">Signature Event Collections</h3>
            <p className="text-2xl text-[#2c2c2c]/70 max-w-4xl mx-auto leading-relaxed">
              From intimate celebrations to grand galas across beautiful Sri Lanka
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-8">
            {eventTypes.map((event, index) => (
              <Card key={index} className="luxury-card premium-hover border-0 text-center group">
                <CardContent className="p-8">
                  <event.icon className={`h-16 w-16 ${event.color} mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`} />
                  <h4 className="font-display text-xl font-semibold text-[#2c2c2c] mb-2">{event.name}</h4>
                  <p className="text-[#6b7280] mb-4">{event.count} Curated</p>
                  <Badge className="bg-[#f7e7ce] text-[#2c2c2c] border-[#e8b4b8]/20">Premium</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof with Premium Testimonials */}
      <section className="py-20 bg-gradient-to-br from-[#faf8f3] to-[#f7e7ce]" data-animate id="testimonials">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="font-display text-5xl mb-6 text-[#2c2c2c]">Trusted by Sri Lanka's Elite</h3>
            <p className="text-[#2c2c2c]/70 text-xl">Experience the stories of our distinguished clientele</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: "Thilini & Nuwan",
                event: "Royal Kandyan Wedding",
                rating: 5,
                comment: "EVENTORA transformed our vision into reality. Every artisan partner exceeded expectations, creating an unforgettable celebration.",
                savings: "Exceptional Value",
                image: "T",
                venue: "Kandy Lake Club"
              },
              {
                name: "Lanka Industries", 
                event: "Corporate Anniversary Gala",
                rating: 5,
                comment: "Professional excellence at its finest. 500+ guests, flawless orchestration, impeccable attention to detail.",
                savings: "Outstanding ROI",
                image: "L",
                venue: "Shangri-La Colombo"
              },
              {
                name: "Madhavi & Roshan",
                event: "Beachside Luxury Celebration",
                rating: 5, 
                comment: "Our intimate gathering became the event of the year. EVENTORA's artisan network is truly world-class.",
                savings: "Premium Experience",
                image: "M",
                venue: "Anantara Peace Haven"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="luxury-card premium-hover border-0 group overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                        {testimonial.image}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2c2c2c] text-lg">{testimonial.name}</h4>
                        <p className="text-[#6b7280]">{testimonial.event}</p>
                        <p className="text-[#e8b4b8] text-sm font-medium">{testimonial.venue}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-[#d4af37] fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[#2c2c2c] mb-6 leading-relaxed font-medium">"{testimonial.comment}"</p>
                  <div className="bg-gradient-to-r from-[#f7e7ce] to-[#e8b4b8]/10 rounded-xl p-4">
                    <span className="text-[#1b4d3e] font-bold text-lg">{testimonial.savings}</span>
                    <span className="text-[#6b7280] text-sm ml-2">vs traditional planning</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features with Authority Positioning */}
      <section className="py-32 bg-gradient-to-br from-white to-[#faf8f3]" data-animate id="features">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-24">
            <h3 className="font-display text-6xl mb-8 text-[#2c2c2c] tracking-tight">Why Elite Clients Choose EVENTORA</h3>
            <p className="text-2xl text-[#2c2c2c]/70 max-w-4xl mx-auto leading-relaxed">
              We orchestrate extraordinary experiences with guaranteed results and white-glove service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <Card className="luxury-card premium-hover border-0 text-center group overflow-hidden">
              <CardHeader className="pb-8">
                <div className="relative mx-auto mb-8">
                  <div className="absolute inset-0 bg-[#e8b4b8]/20 rounded-full animate-premium-glow"></div>
                  <Shield className="h-20 w-20 text-[#e8b4b8] mx-auto relative z-10 group-hover:animate-bounce" />
                </div>
                <CardTitle className="font-display text-3xl text-[#2c2c2c] mb-4">100% Curated Artisan Network</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[#2c2c2c]/70 text-lg leading-relaxed mb-6">
                  Every artisan partner undergoes our rigorous 7-point verification: business credentials, 
                  portfolio excellence, client testimonials. <span className="font-semibold text-[#e8b4b8]">Zero compromise guarantee.</span>
                </CardDescription>
                <div className="bg-gradient-to-r from-[#1b4d3e]/5 to-[#1b4d3e]/10 rounded-xl p-4">
                  <span className="text-[#1b4d3e] font-bold">✓ 250+ Elite Professionals Verified</span>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card premium-hover border-0 text-center group overflow-hidden">
              <CardHeader className="pb-8">
                <div className="relative mx-auto mb-8">
                  <div className="absolute inset-0 bg-[#d4af37]/20 rounded-full animate-premium-glow" style={{animationDelay: '0.5s'}}></div>
                  <Calendar className="h-20 w-20 text-[#d4af37] mx-auto relative z-10 group-hover:animate-bounce" />
                </div>
                <CardTitle className="font-display text-3xl text-[#2c2c2c] mb-4">AI-Powered Luxury Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[#2c2c2c]/70 text-lg leading-relaxed mb-6">
                  Our proprietary algorithm analyzes your vision, budget, and preferences to curate the perfect artisan team. 
                  <span className="font-semibold text-[#d4af37]">Save 6-8 months</span> of traditional sourcing.
                </CardDescription>
                <div className="bg-gradient-to-r from-[#1a365d]/5 to-[#1a365d]/10 rounded-xl p-4">
                  <span className="text-[#1a365d] font-bold">✓ 99.7% Client Satisfaction Rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card premium-hover border-0 text-center group overflow-hidden">
              <CardHeader className="pb-8">
                <div className="relative mx-auto mb-8">
                  <div className="absolute inset-0 bg-[#1b4d3e]/20 rounded-full animate-premium-glow" style={{animationDelay: '1s'}}></div>
                  <Diamond className="h-20 w-20 text-[#1b4d3e] mx-auto relative z-10 group-hover:animate-bounce" />
                </div>
                <CardTitle className="font-display text-3xl text-[#2c2c2c] mb-4">White-Glove Concierge</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-[#2c2c2c]/70 text-lg leading-relaxed mb-6">
                  Your dedicated luxury concierge orchestrates every detail with military precision. 
                  <span className="font-semibold text-[#1b4d3e]">Complete peace of mind</span> from concept to celebration.
                </CardDescription>
                <div className="bg-gradient-to-r from-[#d4af37]/5 to-[#d4af37]/10 rounded-xl p-4">
                  <span className="text-[#d4af37] font-bold">✓ 24/7 Premium Support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final Premium CTA with Exclusivity - Higher z-index for buttons */}
      <section className="py-32 bg-gradient-to-r from-[#2c2c2c] via-[#1a365d] to-[#1b4d3e] text-white relative overflow-hidden animate-luxury-gradient">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-6xl mx-auto text-center px-6 lg:px-8 relative z-10">
          <h3 className="font-display text-7xl mb-8 tracking-tight">Begin Your Luxury Journey</h3>
          <p className="text-3xl mb-8 opacity-95 max-w-4xl mx-auto leading-relaxed font-light">
            Join Sri Lanka's most exclusive event orchestration network
          </p>
          <p className="text-xl mb-16 opacity-90 max-w-3xl mx-auto">
            🏆 <span className="font-bold">Exclusive Access:</span> Limited to 500 discerning clients monthly. 
            Complimentary luxury consultation (Worth LKR 75,000) for qualified prospects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12 relative z-50">
            <Button 
              size="lg" 
              onClick={onLogin}
              className="bg-gradient-to-r from-[#e8b4b8] to-[#d4a5a9] hover:from-[#d4a5a9] hover:to-[#e8b4b8] text-[#2c2c2c] font-bold py-8 px-16 rounded-3xl text-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-0 relative z-50"
            >
              <Crown className="mr-4 h-8 w-8" />
              Reserve Your Exclusive Consultation
            </Button>
            
            <div className="text-center sm:text-left">
              <div className="font-bold text-3xl">⏰ 47 Slots Remaining</div>
              <div className="text-lg opacity-90">For 2024 celebrations</div>
            </div>
          </div>

          <p className="text-sm opacity-80 mb-8">
            ✅ No Commitment Required  ✅ Complimentary Consultation  ✅ White-Glove Service Guarantee
          </p>

          {/* Premium badges */}
          <div className="flex justify-center items-center space-x-8 mt-16">
            <div className="text-center">
              <Trophy className="h-8 w-8 text-[#d4af37] mx-auto mb-2" />
              <p className="text-sm opacity-75">Award Winner</p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-[#1b4d3e] mx-auto mb-2" />
              <p className="text-sm opacity-75">Fully Verified</p>
            </div>
            <div className="text-center">
              <Heart className="h-8 w-8 text-[#e8b4b8] mx-auto mb-2" />
              <p className="text-sm opacity-75">Celebrity Trusted</p>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Footer */}
      <footer className="bg-[#2c2c2c] text-[#faf8f3] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16">
            <div>
              <div className="flex items-center mb-8">
                <Crown className="h-10 w-10 text-[#e8b4b8] mr-4" />
                <div>
                  <span className="font-script text-4xl text-[#e8b4b8] block">EVENTORA</span>
                  <span className="text-xs text-[#6b7280] tracking-wide">LUXURY EVENT CURATION</span>
                </div>
              </div>
              <p className="text-[#9ca3af] leading-relaxed mb-6">
                Sri Lanka's premier luxury event orchestration platform, trusted by discerning clients
                and elite artisan partners.
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-[#d4af37] fill-current" />
                  ))}
                </div>
                <span className="text-sm">4.9/5 from luxury celebrations</span>
              </div>
            </div>
            <div>
              <h4 className="font-display text-2xl mb-8 text-[#e8b4b8]">For Event Visionaries</h4>
              <ul className="space-y-4 text-[#9ca3af]">
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Orchestrate Celebrations</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Access Elite Network</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Luxury Concierge</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">White-Glove Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-2xl mb-8 text-[#e8b4b8]">For Artisan Partners</h4>
              <ul className="space-y-4 text-[#9ca3af]">
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Join Elite Network</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Portfolio Showcase</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Premium Analytics</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Instant Payments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display text-2xl mb-8 text-[#e8b4b8]">Connect</h4>
              <ul className="space-y-4 text-[#9ca3af]">
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">hello@eventora.lk</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">+94 11 234 5678</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">Colombo, Sri Lanka</li>
                <li className="hover:text-[#e8b4b8] transition-colors cursor-pointer">24/7 Luxury Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#4a4a4a] mt-16 pt-8 text-center">
            <p className="text-[#9ca3af]">© 2024 EVENTORA. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>
    </div>
  )
}