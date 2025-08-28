import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'
import { sendEmailNotification, generateOrderReceivedEmail, generateCheckoutCompleteEmail, generateProviderCheckoutEmail } from './email-service.tsx'
import { initiateJustPayPayment, verifyJustPayPayment } from './payment-service.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Initialize storage buckets
async function initializeBuckets() {
  const buckets = ['make-6f7307d7-service-images', 'make-6f7307d7-documents', 'make-6f7307d7-portfolio-media']
  
  for (const bucketName of buckets) {
    const { data: existingBuckets } = await supabase.storage.listBuckets()
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false })
      console.log(`Created bucket: ${bucketName}`)
    }
  }
}

// Initialize on startup
initializeBuckets().catch(console.error)

// Health check
app.get('/make-server-6f7307d7/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Auth routes
app.post('/make-server-6f7307d7/auth/signup-buyer', async (c) => {
  try {
    const { email, name } = await c.req.json()
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: 'temp-password-' + Math.random().toString(36).substring(7),
      user_metadata: { 
        name,
        user_type: 'buyer'
      },
      email_confirm: true
    })
    
    if (error) {
      console.log('Error creating buyer user:', error)
      return c.json({ error: 'Failed to create buyer account' }, 500)
    }
    
    // Store buyer profile
    await kv.set(`buyer:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      user_type: 'buyer',
      points: 0,
      draft_events: [],
      created_at: new Date().toISOString()
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Error in buyer signup:', error)
    return c.json({ error: 'Internal server error during buyer signup' }, 500)
  }
})

app.post('/make-server-6f7307d7/auth/signup-provider', async (c) => {
  try {
    const { 
      email, 
      password, 
      name, 
      business_name, 
      service_type, 
      location, 
      business_registration,
      description 
    } = await c.req.json()
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        user_type: 'service_provider'
      },
      email_confirm: true
    })
    
    if (error) {
      console.log('Error creating service provider user:', error)
      return c.json({ error: 'Failed to create service provider account' }, 500)
    }
    
    // Store service provider profile
    await kv.set(`provider:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      business_name,
      service_type,
      location,
      business_registration,
      description,
      user_type: 'service_provider',
      verification_status: 'pending',
      is_verified: false,
      advance_percentage: 30,
      rating: 0,
      total_ratings: 0,
      services: [],
      portfolio_limits: {
        max_images: 5,
        max_videos: 1,
        current_images: 0,
        current_videos: 0
      },
      calendar_events: {},
      created_at: new Date().toISOString()
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.log('Error in service provider signup:', error)
    return c.json({ error: 'Internal server error during service provider signup' }, 500)
  }
})

app.post('/make-server-6f7307d7/auth/oauth-callback', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { user_type } = await c.req.json()
    
    // Check if profile already exists
    let profile = await kv.get(`buyer:${user.id}`)
    
    if (!profile) {
      // Create new buyer profile for OAuth user
      profile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        user_type: 'buyer',
        points: 0,
        draft_events: [],
        created_at: new Date().toISOString()
      }
      
      await kv.set(`buyer:${user.id}`, profile)
    }
    
    return c.json({ user, profile })
  } catch (error) {
    console.log('Error in OAuth callback:', error)
    return c.json({ error: 'Internal server error during OAuth callback' }, 500)
  }
})

// Get user profile
app.get('/make-server-6f7307d7/auth/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const userType = user.user_metadata?.user_type
    let profile
    
    if (userType === 'buyer') {
      profile = await kv.get(`buyer:${user.id}`)
    } else if (userType === 'service_provider') {
      profile = await kv.get(`provider:${user.id}`)
    }
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404)
    }
    
    return c.json({ user, profile })
  } catch (error) {
    console.log('Error getting user profile:', error)
    return c.json({ error: 'Internal server error getting profile' }, 500)
  }
})

// Service provider routes
app.get('/make-server-6f7307d7/providers/pending', async (c) => {
  try {
    const providers = await kv.getByPrefix('provider:')
    const pendingProviders = providers.filter(p => p.verification_status === 'pending')
    return c.json({ providers: pendingProviders })
  } catch (error) {
    console.log('Error getting pending providers:', error)
    return c.json({ error: 'Internal server error getting pending providers' }, 500)
  }
})

app.post('/make-server-6f7307d7/providers/:id/verify', async (c) => {
  try {
    const providerId = c.req.param('id')
    const { status } = await c.req.json()
    
    const provider = await kv.get(`provider:${providerId}`)
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404)
    }
    
    provider.verification_status = status
    provider.is_verified = status === 'approved'
    provider.verified_at = new Date().toISOString()
    
    await kv.set(`provider:${providerId}`, provider)
    
    // Send verification email
    const emailMessage = status === 'approved' 
      ? `Congratulations! Your EVENTORA service provider account has been approved. You can now start offering your services to our exclusive clientele.`
      : `We regret to inform you that your EVENTORA service provider application has not been approved at this time. Please contact our support team for more information.`
    
    await sendEmailNotification({
      to: provider.email,
      subject: `EVENTORA Account ${status === 'approved' ? 'Approved' : 'Update'}`,
      message: emailMessage,
      type: 'verification_update'
    })
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error verifying provider:', error)
    return c.json({ error: 'Internal server error verifying provider' }, 500)
  }
})

app.get('/make-server-6f7307d7/providers/verified', async (c) => {
  try {
    const providers = await kv.getByPrefix('provider:')
    const verifiedProviders = providers.filter(p => p.is_verified)
    return c.json({ providers: verifiedProviders })
  } catch (error) {
    console.log('Error getting verified providers:', error)
    return c.json({ error: 'Internal server error getting verified providers' }, 500)
  }
})

// Service management with image/video limits
app.post('/make-server-6f7307d7/services', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { name, description, price, category, images, videos } = await c.req.json()
    
    const provider = await kv.get(`provider:${user.id}`)
    if (!provider || !provider.is_verified) {
      return c.json({ error: 'Provider not verified' }, 403)
    }
    
    // Check image and video limits
    const imageCount = images ? images.length : 0
    const videoCount = videos ? videos.length : 0
    
    if (imageCount > 5) {
      return c.json({ error: 'Maximum 5 images allowed per service' }, 400)
    }
    
    if (videoCount > 1) {
      return c.json({ error: 'Maximum 1 video allowed per service' }, 400)
    }
    
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const newService = {
      id: serviceId,
      provider_id: user.id,
      name,
      description,
      price,
      category,
      images: images || [],
      videos: videos || [],
      created_at: new Date().toISOString(),
      is_active: true
    }
    
    provider.services = provider.services || []
    provider.services.push(newService)
    
    await kv.set(`provider:${user.id}`, provider)
    await kv.set(`service:${serviceId}`, newService)
    
    return c.json({ service: newService })
  } catch (error) {
    console.log('Error creating service:', error)
    return c.json({ error: 'Internal server error creating service' }, 500)
  }
})

// Portfolio media upload with limits
app.post('/make-server-6f7307d7/portfolio/upload-media', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const provider = await kv.get(`provider:${user.id}`)
    if (!provider) {
      return c.json({ error: 'Provider not found' }, 404)
    }
    
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const mediaType = formData.get('media_type') as string // 'image' or 'video'
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    // Check limits
    const limits = provider.portfolio_limits || { max_images: 5, max_videos: 1, current_images: 0, current_videos: 0 }
    
    if (mediaType === 'image' && limits.current_images >= limits.max_images) {
      return c.json({ error: `Maximum ${limits.max_images} images allowed in portfolio` }, 400)
    }
    
    if (mediaType === 'video' && limits.current_videos >= limits.max_videos) {
      return c.json({ error: `Maximum ${limits.max_videos} video allowed in portfolio` }, 400)
    }
    
    const bucketName = 'make-6f7307d7-portfolio-media'
    const fileName = `${user.id}/${mediaType}s/${Date.now()}_${file.name}`
    
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)
    
    if (uploadError) {
      console.log('Upload error:', uploadError)
      return c.json({ error: 'Failed to upload file' }, 500)
    }
    
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year
    
    // Update limits
    if (mediaType === 'image') {
      limits.current_images += 1
    } else if (mediaType === 'video') {
      limits.current_videos += 1
    }
    
    provider.portfolio_limits = limits
    await kv.set(`provider:${user.id}`, provider)
    
    return c.json({ 
      path: data.path,
      url: urlData?.signedUrl,
      fileName: file.name,
      mediaType,
      currentLimits: limits
    })
  } catch (error) {
    console.log('Error uploading portfolio media:', error)
    return c.json({ error: 'Internal server error uploading media' }, 500)
  }
})

// Order management with email notifications
app.post('/make-server-6f7307d7/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { service_ids, event_date, message } = await c.req.json()
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const order = {
      id: orderId,
      buyer_id: user.id,
      service_ids,
      event_date,
      message,
      status: 'pending_acceptance',
      created_at: new Date().toISOString(),
      acceptance_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      provider_responses: {}
    }
    
    await kv.set(`order:${orderId}`, order)
    
    // Send email notifications to service providers
    for (const serviceId of service_ids) {
      const service = await kv.get(`service:${serviceId}`)
      if (service) {
        const provider = await kv.get(`provider:${service.provider_id}`)
        if (provider) {
          order.provider_responses[service.provider_id] = 'pending'
          
          // Send order received email
          const emailNotification = generateOrderReceivedEmail(order, provider)
          await sendEmailNotification(emailNotification)
        }
      }
    }
    
    await kv.set(`order:${orderId}`, order)
    
    return c.json({ order })
  } catch (error) {
    console.log('Error creating order:', error)
    return c.json({ error: 'Internal server error creating order' }, 500)
  }
})

// Payment processing with JustPay
app.post('/make-server-6f7307d7/orders/:id/initiate-payment', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const orderId = c.req.param('id')
    const order = await kv.get(`order:${orderId}`)
    
    if (!order || order.buyer_id !== user.id) {
      return c.json({ error: 'Order not found' }, 404)
    }
    
    // Calculate total amount
    let totalAmount = 0
    for (const serviceId of order.service_ids) {
      const service = await kv.get(`service:${serviceId}`)
      if (service) {
        totalAmount += service.price
      }
    }
    
    const buyer = await kv.get(`buyer:${user.id}`)
    
    // Initiate JustPay payment
    const paymentResult = await initiateJustPayPayment({
      amount: totalAmount,
      currency: 'LKR',
      order_id: orderId,
      customer_email: buyer.email,
      customer_name: buyer.name,
      description: `EVENTORA Event Services - Order #${orderId}`,
      return_url: `${Deno.env.get('FRONTEND_URL')}/payment/success?order=${orderId}`,
      cancel_url: `${Deno.env.get('FRONTEND_URL')}/payment/cancel?order=${orderId}`
    })
    
    if (paymentResult.success) {
      // Update order with payment details
      order.payment_status = 'pending'
      order.payment_initiated_at = new Date().toISOString()
      order.transaction_id = paymentResult.transaction_id
      order.total_amount = totalAmount
      
      await kv.set(`order:${orderId}`, order)
      
      return c.json({ 
        payment_url: paymentResult.payment_url,
        transaction_id: paymentResult.transaction_id,
        amount: totalAmount
      })
    } else {
      return c.json({ error: paymentResult.error }, 500)
    }
    
  } catch (error) {
    console.log('Error initiating payment:', error)
    return c.json({ error: 'Internal server error initiating payment' }, 500)
  }
})

app.post('/make-server-6f7307d7/payment/webhook', async (c) => {
  try {
    const { transaction_id, order_id, status, amount } = await c.req.json()
    
    // Verify payment with JustPay
    const verification = await verifyJustPayPayment(transaction_id)
    
    if (verification.success && verification.status === 'completed') {
      const order = await kv.get(`order:${order_id}`)
      if (order) {
        // Update order status
        order.payment_status = 'completed'
        order.status = 'confirmed'
        order.payment_completed_at = new Date().toISOString()
        
        await kv.set(`order:${order_id}`, order)
        
        // Get buyer info
        const buyer = await kv.get(`buyer:${order.buyer_id}`)
        
        // Send checkout complete email to buyer
        const buyerEmail = generateCheckoutCompleteEmail(order, buyer, order.total_amount)
        await sendEmailNotification(buyerEmail)
        
        // Send notifications to providers
        for (const serviceId of order.service_ids) {
          const service = await kv.get(`service:${serviceId}`)
          if (service) {
            const provider = await kv.get(`provider:${service.provider_id}`)
            if (provider) {
              const providerAmount = service.price * (1 - (provider.advance_percentage / 100))
              const providerEmail = generateProviderCheckoutEmail(order, provider, providerAmount)
              await sendEmailNotification(providerEmail)
            }
          }
        }
      }
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error processing payment webhook:', error)
    return c.json({ error: 'Internal server error processing webhook' }, 500)
  }
})

// Admin settings management
app.get('/make-server-6f7307d7/admin/settings', async (c) => {
  try {
    const settings = await kv.get('admin_settings') || {
      buyer_terms: 'Default buyer terms and conditions...',
      provider_terms: 'Default service provider terms and conditions...',
      privacy_policy: 'Default privacy policy...',
      updated_at: new Date().toISOString()
    }
    
    return c.json({ settings })
  } catch (error) {
    console.log('Error getting admin settings:', error)
    return c.json({ error: 'Internal server error getting settings' }, 500)
  }
})

app.put('/make-server-6f7307d7/admin/settings', async (c) => {
  try {
    const { buyer_terms, provider_terms, privacy_policy } = await c.req.json()
    
    const settings = {
      buyer_terms,
      provider_terms,
      privacy_policy,
      updated_at: new Date().toISOString()
    }
    
    await kv.set('admin_settings', settings)
    
    return c.json({ settings })
  } catch (error) {
    console.log('Error updating admin settings:', error)
    return c.json({ error: 'Internal server error updating settings' }, 500)
  }
})

// Get service search results
app.get('/make-server-6f7307d7/services/search', async (c) => {
  try {
    const { event_type, location, budget } = c.req.query()
    
    const services = await kv.getByPrefix('service:')
    let filteredServices = services.filter(s => s.is_active)
    
    if (event_type) {
      filteredServices = filteredServices.filter(s => 
        s.category?.toLowerCase().includes(event_type.toLowerCase())
      )
    }
    
    if (budget) {
      const maxBudget = parseFloat(budget)
      filteredServices = filteredServices.filter(s => s.price <= maxBudget)
    }
    
    // Add provider info to each service
    const servicesWithProviders = await Promise.all(
      filteredServices.map(async (service) => {
        const provider = await kv.get(`provider:${service.provider_id}`)
        return {
          ...service,
          provider: provider ? {
            name: provider.business_name,
            location: provider.location,
            rating: provider.rating
          } : null
        }
      })
    )
    
    return c.json({ services: servicesWithProviders })
  } catch (error) {
    console.log('Error searching services:', error)
    return c.json({ error: 'Internal server error searching services' }, 500)
  }
})

// Event planning
app.post('/make-server-6f7307d7/events/draft', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { event_type, budget, location, date, description } = await c.req.json()
    
    const buyer = await kv.get(`buyer:${user.id}`)
    if (!buyer) {
      return c.json({ error: 'Buyer profile not found' }, 404)
    }
    
    buyer.draft_events = buyer.draft_events || []
    
    if (buyer.draft_events.length >= 3) {
      return c.json({ error: 'Maximum 3 draft events allowed' }, 400)
    }
    
    const draftId = `draft_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const draft = {
      id: draftId,
      event_type,
      budget,
      location,
      date,
      description,
      selected_services: [],
      progress: 0,
      created_at: new Date().toISOString()
    }
    
    buyer.draft_events.push(draft)
    await kv.set(`buyer:${user.id}`, buyer)
    
    return c.json({ draft })
  } catch (error) {
    console.log('Error creating draft event:', error)
    return c.json({ error: 'Internal server error creating draft event' }, 500)
  }
})

// Order response management
app.post('/make-server-6f7307d7/orders/:id/respond', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const orderId = c.req.param('id')
    const { response, message } = await c.req.json()
    
    const order = await kv.get(`order:${orderId}`)
    if (!order) {
      return c.json({ error: 'Order not found' }, 404)
    }
    
    order.provider_responses[user.id] = response
    order.response_messages = order.response_messages || {}
    order.response_messages[user.id] = message
    
    await kv.set(`order:${orderId}`, order)
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error responding to order:', error)
    return c.json({ error: 'Internal server error responding to order' }, 500)
  }
})

// Messaging
app.post('/make-server-6f7307d7/messages', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { recipient_id, message, conversation_id } = await c.req.json()
    
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const newMessage = {
      id: messageId,
      conversation_id: conversation_id || `conv_${[user.id, recipient_id].sort().join('_')}`,
      sender_id: user.id,
      recipient_id,
      message,
      timestamp: new Date().toISOString(),
      is_read: false
    }
    
    await kv.set(`message:${messageId}`, newMessage)
    
    return c.json({ message: newMessage })
  } catch (error) {
    console.log('Error sending message:', error)
    return c.json({ error: 'Internal server error sending message' }, 500)
  }
})

app.get('/make-server-6f7307d7/messages/:conversationId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const conversationId = c.req.param('conversationId')
    const messages = await kv.getByPrefix('message:')
    
    const conversationMessages = messages
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    return c.json({ messages: conversationMessages })
  } catch (error) {
    console.log('Error getting messages:', error)
    return c.json({ error: 'Internal server error getting messages' }, 500)
  }
})

// Ratings and reviews
app.post('/make-server-6f7307d7/ratings', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { provider_id, rating, comment, order_id } = await c.req.json()
    
    const ratingId = `rating_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const newRating = {
      id: ratingId,
      buyer_id: user.id,
      provider_id,
      rating,
      comment,
      order_id,
      created_at: new Date().toISOString()
    }
    
    await kv.set(`rating:${ratingId}`, newRating)
    
    // Update provider rating
    const provider = await kv.get(`provider:${provider_id}`)
    if (provider) {
      const totalRating = (provider.rating * provider.total_ratings) + rating
      provider.total_ratings += 1
      provider.rating = totalRating / provider.total_ratings
      await kv.set(`provider:${provider_id}`, provider)
    }
    
    return c.json({ rating: newRating })
  } catch (error) {
    console.log('Error creating rating:', error)
    return c.json({ error: 'Internal server error creating rating' }, 500)
  }
})

// Portfolio routes
app.get('/make-server-6f7307d7/portfolio/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    const userId = c.req.param('userId')
    
    // Check if this is a public portfolio request or authenticated request
    let isOwner = false
    if (accessToken) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken)
      if (!error && user && user.id === userId) {
        isOwner = true
      }
    }
    
    // Get portfolio data
    const portfolio = await kv.get(`portfolio:${userId}`)
    
    if (!portfolio) {
      return c.json({ portfolio: null })
    }
    
    // If not the owner and portfolio is not public, deny access
    if (!isOwner && !portfolio.is_public) {
      return c.json({ error: 'Portfolio is private' }, 403)
    }
    
    return c.json({ portfolio })
  } catch (error) {
    console.log('Error getting portfolio:', error)
    return c.json({ error: 'Internal server error getting portfolio' }, 500)
  }
})

app.post('/make-server-6f7307d7/portfolio/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const userId = c.req.param('userId')
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const { portfolio, password } = await c.req.json()
    
    // Verify password
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    })
    
    if (passwordError) {
      return c.json({ error: 'Incorrect password' }, 401)
    }
    
    // Generate share URL if making public
    const shareUrl = portfolio.is_public 
      ? `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-6f7307d7/portfolio/public/${userId}`
      : null
    
    const portfolioData = {
      ...portfolio,
      id: userId,
      share_url: shareUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`portfolio:${userId}`, portfolioData)
    
    return c.json({ portfolio: portfolioData })
  } catch (error) {
    console.log('Error creating portfolio:', error)
    return c.json({ error: 'Internal server error creating portfolio' }, 500)
  }
})

app.put('/make-server-6f7307d7/portfolio/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const userId = c.req.param('userId')
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const { portfolio, password } = await c.req.json()
    
    // Verify password
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    })
    
    if (passwordError) {
      return c.json({ error: 'Incorrect password' }, 401)
    }
    
    const existingPortfolio = await kv.get(`portfolio:${userId}`)
    if (!existingPortfolio) {
      return c.json({ error: 'Portfolio not found' }, 404)
    }
    
    // Generate share URL if making public
    const shareUrl = portfolio.is_public 
      ? `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-6f7307d7/portfolio/public/${userId}`
      : existingPortfolio.share_url
    
    const portfolioData = {
      ...existingPortfolio,
      ...portfolio,
      id: userId,
      share_url: shareUrl,
      updated_at: new Date().toISOString()
    }
    
    await kv.set(`portfolio:${userId}`, portfolioData)
    
    return c.json({ portfolio: portfolioData })
  } catch (error) {
    console.log('Error updating portfolio:', error)
    return c.json({ error: 'Internal server error updating portfolio' }, 500)
  }
})

app.put('/make-server-6f7307d7/portfolio/:userId/toggle-public', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const userId = c.req.param('userId')
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403)
    }
    
    const portfolio = await kv.get(`portfolio:${userId}`)
    if (!portfolio) {
      return c.json({ error: 'Portfolio not found' }, 404)
    }
    
    const newPublicStatus = !portfolio.is_public
    const shareUrl = newPublicStatus 
      ? `${Deno.env.get('SUPABASE_URL')}/functions/v1/make-server-6f7307d7/portfolio/public/${userId}`
      : null
    
    portfolio.is_public = newPublicStatus
    portfolio.share_url = shareUrl
    portfolio.updated_at = new Date().toISOString()
    
    await kv.set(`portfolio:${userId}`, portfolio)
    
    return c.json({ 
      is_public: newPublicStatus, 
      share_url: shareUrl 
    })
  } catch (error) {
    console.log('Error toggling portfolio visibility:', error)
    return c.json({ error: 'Internal server error toggling portfolio visibility' }, 500)
  }
})

app.get('/make-server-6f7307d7/portfolio/public/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const portfolio = await kv.get(`portfolio:${userId}`)
    if (!portfolio || !portfolio.is_public) {
      return c.json({ error: 'Portfolio not found or private' }, 404)
    }
    
    // Get provider info for portfolio header
    const provider = await kv.get(`provider:${userId}`)
    
    return c.json({ 
      portfolio,
      provider: provider ? {
        business_name: provider.business_name,
        service_type: provider.service_type,
        rating: provider.rating,
        total_ratings: provider.total_ratings,
        is_verified: provider.is_verified
      } : null
    })
  } catch (error) {
    console.log('Error getting public portfolio:', error)
    return c.json({ error: 'Internal server error getting public portfolio' }, 500)
  }
})

// Password verification route
app.post('/make-server-6f7307d7/auth/verify-password', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const { password } = await c.req.json()
    
    // Verify password by attempting to sign in
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    })
    
    if (passwordError) {
      return c.json({ error: 'Incorrect password' }, 401)
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.log('Error verifying password:', error)
    return c.json({ error: 'Internal server error verifying password' }, 500)
  }
})

// File upload
app.post('/make-server-6f7307d7/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401)
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) {
      return c.json({ error: 'Invalid access token' }, 401)
    }
    
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string // 'image' or 'document'
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const bucketName = fileType === 'image' ? 'make-6f7307d7-service-images' : 'make-6f7307d7-documents'
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file)
    
    if (uploadError) {
      console.log('Upload error:', uploadError)
      return c.json({ error: 'Failed to upload file' }, 500)
    }
    
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year
    
    return c.json({ 
      path: data.path,
      url: urlData?.signedUrl,
      fileName: file.name 
    })
  } catch (error) {
    console.log('Error uploading file:', error)
    return c.json({ error: 'Internal server error uploading file' }, 500)
  }
})

// Start the server
Deno.serve(app.fetch)