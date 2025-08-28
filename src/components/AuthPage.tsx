import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Heart, Mail, Building, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userType, setUserType] = useState<'buyer' | 'service_provider'>('buyer');
  
  // Buyer signup form
  const [buyerForm, setBuyerForm] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Service provider signup form
  const [providerForm, setProviderForm] = useState({
    email: '',
    password: '',
    businessName: '',
    serviceType: '',
    location: '',
    businessRegistration: '',
    description: ''
  });

  // Sign in form
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });

  const serviceTypes = [
    'Wedding Photography',
    'Wedding Venue',
    'Catering',
    'Decoration',
    'Music & DJ',
    'Wedding Cake',
    'Makeup Artist',
    'Hair Styling',
    'Transportation',
    'Wedding Planning',
    'Flowers',
    'Security',
    'Sound & Lighting',
    'Entertainment',
    'Other'
  ];

  const locations = [
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    'Galle',
    'Matara',
    'Hambantota',
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu',
    'Batticaloa',
    'Ampara',
    'Trincomalee',
    'Kurunegala',
    'Puttalam',
    'Anuradhapura',
    'Polonnaruwa',
    'Badulla',
    'Moneragala',
    'Ratnapura',
    'Kegalle'
  ];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Do not forget to complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        console.error('Google sign in error:', error);
        toast.error('Google sign in failed. Please complete setup at https://supabase.com/docs/guides/auth/social-login/auth-google');
        return;
      }

      // Note: OAuth redirect will handle the rest
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInForm.email,
        password: signInForm.password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return;
      }

      if (data.user) {
        onAuthSuccess(data.user);
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyerSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/register-buyer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(buyerForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Registration failed');
        return;
      }

      toast.success('Registration successful! Please sign in.');
      setAuthMode('signin');
    } catch (error) {
      console.error('Buyer registration error:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-6f7307d7/register-service-provider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(providerForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Registration failed');
        return;
      }

      toast.success('Registration successful! Your account will be verified by our team. Please sign in.');
      setAuthMode('signin');
    } catch (error) {
      console.error('Service provider registration error:', error);
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">EventLanka</h1>
          </div>
          <p className="text-gray-600">Your one-stop solution for events in Sri Lanka</p>
        </div>

        <Card>
          <CardHeader>
            <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {authMode === 'signin' ? (
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <Tabs value={userType} onValueChange={(value) => setUserType(value as 'buyer' | 'service_provider')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="buyer">Buyer</TabsTrigger>
                    <TabsTrigger value="service_provider">Service Provider</TabsTrigger>
                  </TabsList>

                  <TabsContent value="buyer" className="space-y-4 mt-4">
                    <CardDescription>
                      Plan your perfect event with our verified service providers
                    </CardDescription>
                    <form onSubmit={handleBuyerSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="buyer-name">Full Name</Label>
                        <Input
                          id="buyer-name"
                          value={buyerForm.name}
                          onChange={(e) => setBuyerForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer-email">Email</Label>
                        <Input
                          id="buyer-email"
                          type="email"
                          value={buyerForm.email}
                          onChange={(e) => setBuyerForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer-password">Password</Label>
                        <Input
                          id="buyer-password"
                          type="password"
                          value={buyerForm.password}
                          onChange={(e) => setBuyerForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Buyer Account'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="service_provider" className="space-y-4 mt-4">
                    <CardDescription>
                      Join our platform to offer your services to event planners
                    </CardDescription>
                    <form onSubmit={handleProviderSignUp} className="space-y-4">
                      <div>
                        <Label htmlFor="business-name">Business Name</Label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="business-name"
                            className="pl-10"
                            value={providerForm.businessName}
                            onChange={(e) => setProviderForm(prev => ({ ...prev, businessName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="service-type">Service Type</Label>
                        <Select
                          value={providerForm.serviceType}
                          onValueChange={(value) => setProviderForm(prev => ({ ...prev, serviceType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Select
                            value={providerForm.location}
                            onValueChange={(value) => setProviderForm(prev => ({ ...prev, location: value }))}
                          >
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select your location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map(location => (
                                <SelectItem key={location} value={location}>{location}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="business-registration">Business Registration Number</Label>
                        <Input
                          id="business-registration"
                          value={providerForm.businessRegistration}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, businessRegistration: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Service Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe your services..."
                          value={providerForm.description}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider-email">Email</Label>
                        <Input
                          id="provider-email"
                          type="email"
                          value={providerForm.email}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="provider-password">Password</Label>
                        <Input
                          id="provider-password"
                          type="password"
                          value={providerForm.password}
                          onChange={(e) => setProviderForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Provider Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}